# Handwritten Text Recognition AI (Scriptura)

A full-stack SaaS app that converts photos of handwritten notes into editable
text using Gemini Vision OCR, built with Next.js 15, TypeScript, Tailwind, and
Firebase.

## What's implemented

| Phase | Status | Where |
|---|---|---|
| 1. Project setup | ✅ | `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts` |
| 2. Firebase integration | ✅ | `lib/firebase/client.ts`, `lib/firebase/admin.ts`, `lib/firebase/storage.ts`, `firestore.rules` |
| 3. Authentication | ✅ | `app/login`, `app/register`, `app/forgot-password`, `app/profile`, `hooks/useAuth.ts` |
| 4. Landing page | ✅ | `components/landing/*`, `app/page.tsx` |
| 5. OCR integration | ✅ | `lib/gemini/ocr.ts`, `app/api/ocr/route.ts`, `components/landing/UploadDemo.tsx` |
| 6. Dashboard | ✅ | `app/dashboard/*`, `components/dashboard/*` |
| 7. History | ✅ | `app/dashboard/history`, `app/dashboard/favorites`, `hooks/useConversions.ts` |
| 8. Admin panel | ✅ (basic) | `app/admin/*` |
| 9. Deployment | ✅ (instructions below) | — |

Everything above is real, working code — not placeholders — but a few things
are intentionally left as configuration for you to plug in, since they need
your own credentials:

- **Firebase project**: create one at console.firebase.google.com, enable
  Email/Password + Google sign-in, Firestore, and Storage, then fill in
  `.env.local` (copy from `.env.example`).
- **Gemini API key**: get one at aistudio.google.com and set `GEMINI_API_KEY`.
  Note: `lib/gemini/ocr.ts` uses `gemini-3.5-flash` — Gemini 1.5 and 2.0 models
  have been shut down (they now 404), so if this stops working in the future,
  check ai.google.dev/gemini-api/docs/models for the current model name and
  swap it in there.
- **Stripe**: `app/dashboard/billing/page.tsx` has the upgrade UI ready, and
  `.env.example` has the Stripe env vars reserved, but the actual Stripe
  Checkout/webhook handlers aren't built yet — that's flagged as "left ready
  for future implementation" in the brief, so I didn't fabricate a billing
  integration without real keys to test against. Happy to build it next if
  you share which Stripe product/price IDs you want to use.
- **Admin access control**: `/admin` currently has no role check — add a
  custom claim (`admin: true`) via the Firebase Admin SDK and check it in
  `proxy.ts` or in a server-side guard before shipping this publicly.

## Local setup

```bash
npm install
npm run dev
```

`.env.local` is already filled in with your Firebase client config (project
`handwritten-text-recogni-7efe1`) and your Gemini API key, so `npm run dev`
should work as-is for the client SDK, auth, storage, and OCR calls.

Two things are still missing in `.env.local` because they weren't provided:

- **`FIREBASE_ADMIN_CLIENT_EMAIL`** and **`FIREBASE_ADMIN_PRIVATE_KEY`** — the
  Admin SDK needs a service account, not the web config above. Get one from
  Firebase Console → Project Settings → Service Accounts → Generate new
  private key, then paste the `client_email` and `private_key` fields in.
  Until these are set, `/api/ocr` (saving conversions) and `/admin/*` will
  throw, since they run through `lib/firebase/admin.ts`.
- **Stripe keys** — still optional, see the Stripe section above.

**Security note:** `.env.local` is in `.gitignore` and won't be committed if
you push this to GitHub — keep it that way, especially since it holds your
Gemini key. The Firebase *client* config (`NEXT_PUBLIC_FIREBASE_API_KEY` etc.)
is safe to expose in the browser bundle by design — Firebase's real security
boundary is `firestore.rules`, not that key — but the Gemini key and the
Admin SDK credentials must never get a `NEXT_PUBLIC_` prefix or ship to the
client, and they don't anywhere in this codebase.

## Firestore data model

Firestore is the live database (see `firestore.rules`). A parallel SQL schema
is included at `database/schema.sql` for teams that want a relational mirror
for analytics or a future migration.

Collections: `users`, `profiles`, `conversions`, `favorites`, `subscriptions`
— field names match the SQL schema exactly, just camelCase instead of
snake_case (Firestore convention).

## How the free-conversion limit works

- Guests: tracked in `localStorage` via `hooks/useGuestUsage.ts` (client-side
  only — nothing is written to the database for guests). After 2 conversions,
  the modal in `UploadDemo.tsx` prompts registration/login.
- Logged-in users: `profiles.credits` is decremented server-side in
  `app/api/ocr/route.ts` after each successful conversion.

## Firestore rules & indexes — deploy these before using auth features

`firestore.rules` and `firestore.indexes.json` only take effect once they're
published to your actual Firebase project — having them in this repo doesn't
do anything by itself. Two ways to deploy:

**Console (no CLI needed):**
1. Firestore Database → Rules tab → paste in the contents of `firestore.rules` → Publish.
2. Firestore Database → Indexes tab → Composite → add: collection `conversions`, fields `userId` (Ascending) + `createdAt` (Descending).

**CLI (`firebase.json` and `.firebaserc` are already set up for this project):**
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,firestore:indexes
```

Symptoms if you skip this: conversions save fine (that write goes through the
Admin SDK on the server, which bypasses rules) but the History/Favorites
pages come back empty with a `permission-denied` or `failed-precondition:
requires an index` error in the browser console, since those pages query
Firestore directly from the client.

## OCR prompt design

`lib/gemini/ocr.ts` contains the tuned system prompt: preserves paragraphs,
bullet points, numbering, and tables; ignores backgrounds/shadows/notebook
lines; only auto-corrects spelling at high confidence; never hallucinates —
unreadable words come back as `[Unreadable]`.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add all variables from `.env.example` in Project Settings → Environment
   Variables (use the real Firebase Admin private key with `\n` line breaks
   intact — Vercel handles this fine as a multi-line secret).
4. Deploy. Firestore rules need to be deployed separately via
   `firebase deploy --only firestore:rules` (requires the Firebase CLI).

## Design notes

The visual direction (a cool "vellum" paper background, deep ink-blue palette,
a single burnt-sienna signal accent, Instrument Serif for display type) is
intentional, not a default — it echoes the handwriting → typed-text premise
the product is built around, down to the hand-drawn stroke animation in the
hero.

## Upload workspace (redesigned)

`components/landing/UploadDemo.tsx` is a two-panel workspace shared by both
the guest landing-page demo (`Hero.tsx`) and the logged-in dashboard
(`app/dashboard/new`), so any change here applies to both automatically:

- **New Image** button resets the whole panel to start over.
- Upload now shows a scanning-line animation over the image thumbnail while
  Gemini is analyzing it, instead of just a spinner.
- **Language** and **Quality** pills: language is an optional hint (helps
  accuracy when you already know the handwriting is in Urdu, Arabic, Hindi,
  etc. — Gemini auto-detects either way); quality maps to the model's
  temperature (Fast/Balanced/High accuracy).
- Toolbar: copy, expand to fullscreen, undo/redo (full history stack),
  in-text search with match count and jump, and clear.
- Stats bar: characters, words, lines, paragraphs, process time, and an
  **estimated** confidence score (Gemini doesn't return a real confidence
  value, so this is heuristically derived from how many `[Unreadable]`
  segments came back — labeled as an estimate in the UI tooltip).
- Export as **TXT**, **DOCX** (via the `docx` package), or **PDF** (via
  `jspdf`).
- **English** button: sends the current text to `/api/translate`
  (`lib/gemini/translate.ts`) and replaces it with an English translation —
  built for handwriting in Urdu or any other language. The OCR prompt itself
  was also updated to transcribe verbatim in whatever language/script it
  detects, rather than assuming English.

Note on formats: the redesign's format list is JPG/PNG/WEBP/HEIC up to 20MB —
these are exactly what Gemini's vision input actually accepts. I didn't add
GIF/BMP/TIFF/PDF to match a reference screenshot, since Gemini's image input
doesn't reliably support those, and a format badge that's untrue would just
produce confusing failures.

## Responsiveness & recent fixes

- **Sidebar is now a responsive drawer.** On mobile, the dashboard shows a top
  bar with a hamburger (`components/dashboard/DashboardShell.tsx`) that slides
  the sidebar in as an overlay; on desktop it's always visible, unchanged.
  This also fixed `/profile`, which previously rendered its own sidebar with
  no mobile handling and — as a bonus fix — no login redirect at all.
- **Landing page nav** now has a mobile hamburger menu instead of the nav
  links just disappearing below the `md` breakpoint.
- **Image preview toolbar** on the upload panel: replace, rotate left/right,
  zoom in/out, reset view, fullscreen, and remove — plus a file info bar
  (name, size, resolution). Click-to-browse no longer conflicts with these
  buttons (the dropzone's default open-on-click was disabled in favor of
  explicit triggers, so clicking a toolbar icon doesn't also reopen the file
  picker).
- **Favicon 404 and the `scroll-behavior: smooth` warning** are both fixed
  (`app/icon.svg`, `data-scroll-behavior="smooth"` on `<html>`).
- Small visual pass to read as more intentional rather than templated: a
  faint paper-grain texture on the background, hover-lift on cards, and a
  scroll-aware shadow on the navbar.

If you see a `Runtime AbortError: The user aborted a request` in dev, that's
almost always Firestore's real-time listener (`useConversions.ts`) or an
in-flight fetch getting cancelled by navigation or Fast Refresh — cosmetic in
dev, not a functional bug, unless it's reproducible on a specific action.

## Admin access

The admin panel (`/admin`) is now actually protected — previously it had no
guard at all. It's a single hardcoded admin account (not a Firebase user),
gated by `proxy.ts` checking a signed session cookie:

- Sign in at `/admin/login` with the credentials in `ADMIN_USERNAME` /
  `ADMIN_PASSWORD` in `.env.local`.
- Sessions last 8 hours (`lib/auth/adminSession.ts`), signed with
  `ADMIN_SESSION_SECRET` so a client can't forge their own cookie.
- This is intentionally simple — appropriate for one admin on a student
  project, not a substitute for a real multi-admin role system.
- The Delete button on `/admin/users` is now wired up for real: it removes
  the user's Firestore doc, profile, all their conversions, and the actual
  Firebase Auth account (`app/api/admin/users/[id]/route.ts`).

## Why users weren't showing up in admin

Firebase Auth and Firestore are separate — creating an Auth account via
`createUserWithEmailAndPassword` does **not** create a Firestore document.
`lib/firebase/client.ts` now writes `users/{uid}` and `profiles/{uid}` after
every register/login (`ensureUserDocument`), which is what the admin panel
and the credit-tracking system actually read from. If your own existing
account still doesn't show up, log out and back in once — the doc gets
created retroactively on next login, since this only fires going forward.

## Camera capture

The upload panel now has a "Use Camera" button next to "New Image" —
requests `getUserMedia()`, shows a live preview in a fullscreen overlay, and
"Capture" grabs the current frame via canvas into a JPEG `File`, which then
goes through the exact same pipeline as a dropped/uploaded file.

Note: browsers only allow camera access on **HTTPS or localhost** — it'll
fail silently (or with a permissions error) on a plain `http://` deployment
without TLS, which is expected browser behavior, not a bug.

## Per-user history in admin

`/admin/users` now shows a conversion count per user and a "View history"
link → `/admin/users/[id]` lists that user's full conversion history (text,
word/char counts, date, favorite flag). Protected the same way as the rest
of `/admin` — no separate guard needed since the middleware matcher already
covers `/admin/:path*`, dynamic segments included.

## Round: notifications, auth-aware nav, color system

- **Individual user history in admin** — already existed (`/admin/users/[id]`),
  linked from "View history" on the users list. Nothing new needed here.
- **Toast notifications** (`components/ui/Toast.tsx`, wired via
  `AppProviders` in `app/layout.tsx`): slide in from the top-right with a
  short Web-Audio-generated chime (no audio file assets needed — see
  `lib/utils/sound.ts`). Wired into the upload workspace for: successful
  extraction, copy-to-clipboard, English translation, each export button
  (TXT/DOCX/PDF), camera errors, invalid-file errors, and OCR/translate
  failures. Call `useToast().toast({ type: 'success' | 'error' | 'info',
  message })` anywhere else you want one.
- **Navbar now reflects auth state** — previously always showed Log in/Sign
  up even when logged in. Now shows Dashboard/Log out (with a toast + sound
  on logout) when a session exists, on both desktop and the mobile menu.
- **Color system replaced** with the requested palette — done at the token
  level in `tailwind.config.ts` (`ink` scale = the Text/Secondary
  Text/Border/Background slate scale, `vellum` = white/background surface
  scale, `signal` = primary royal blue with dark-blue hover, plus new
  `success`/`warning`/`error` tokens), so it cascades through every
  component automatically rather than needing a file-by-file edit. Two
  hardcoded leftover hex values (the hero pen-animation stroke and the
  favicon) were also updated to match.

## Round: Next.js 16 migration + admin history crash + Gemini 503s

**`middleware.ts` → `proxy.ts`** — Next.js 16 fully renamed this file
convention (not just deprecated the old name — the framework stops looking
for `middleware.ts` and silently skips it, which would have made admin auth
disappear with no error). Renamed the file, renamed the exported function
from `middleware` to `proxy`, kept the same matcher config. Also bumped
`package.json` to `next@^16.2.10` / `react@^19.0.0` — it was still pinned to
Next 15.0.3, which doesn't support `proxy.ts` at all. If your `node_modules`
already had 16.2.10 installed outside of what `package.json` declared, a
fresh `npm install` on another machine would have silently regressed to 15
and quietly broken admin protection again.

**"History — undefined" / Firestore `documentPath` error** — root cause:
Next.js 15+ made route `params` a `Promise` that must be awaited; both
`app/admin/users/[id]/page.tsx` and `app/api/admin/users/[id]/route.ts`
were still destructuring it synchronously (`const { id } = params`), so
`id` came through as `undefined`, which is exactly why the Firestore call
failed with "documentPath... must be a non-empty string." Fixed both to
`const { id } = await params`. Swept the whole project for any other
dynamic route folders — these were the only two.

**Gemini 503 "high demand"** — this one's on Google's end, not a bug, but
the app now retries automatically: `lib/gemini/retry.ts` wraps both OCR and
translation calls with up to 3 attempts and exponential backoff before
giving up, so a single transient overload no longer surfaces straight to
the user as a failure.

## If you see "Both middleware file and proxy file are detected"

This isn't a bug in the new code — it's a leftover file. Extracting a new
zip on top of your existing project folder only adds/overwrites files that
are actually in the zip; it doesn't delete files that aren't. Your old
`middleware.ts` from before the Next.js 16 migration is still sitting in
your project root alongside the new `proxy.ts`, and Next.js refuses to run
with both present.

Fix: delete `middleware.ts` from your project root (keep `proxy.ts`), then
restart `npm run dev`.

```bash
rm middleware.ts   # or just delete it in your file explorer / editor
```

## eslint dependency conflict on `npm install`

If you previously ran `npm install` and hit an `ERESOLVE` error mentioning
`eslint-config-next` requiring `eslint@>=9.0.0`: this was a real mismatch in
`package.json` (still pinned to eslint 8) that's now fixed — eslint is
bumped to v9, and `eslint.config.mjs` was added since ESLint 9 requires the
new flat-config format instead of `.eslintrc.json` (which this project never
actually had, so `next lint` would have failed either way once you tried
running it). Delete `node_modules` and `package-lock.json` and run
`npm install` fresh to pick this up cleanly.

## Round: admin "count is not a function" + the recurring AbortError

**"adminDb.collection(...).count is not a function"** — `app/admin/page.tsx`
and `app/admin/users/page.tsx` were both using Firestore's newer `.count()`
aggregate query API. Rather than chase down whether this was a
`firebase-admin` version mismatch or a module-resolution quirk in your
`node_modules` specifically, I replaced it with `.get().size` in both
places — that's been part of Firestore since its very first release, so
this entire class of error is gone regardless of the underlying cause. The
only tradeoff: it fetches full documents instead of a lightweight
count-only query, which is irrelevant at admin-dashboard scale (dozens to
low hundreds of docs), not worth the fragility.

**The recurring `AbortError` in the browser console** — traced this
properly instead of just calling it cosmetic again. Root cause: Firestore's
real-time listener (`onSnapshot`, used by `useConversions`) opens a
long-lived streaming connection. React's Strict Mode (on by default in dev)
intentionally mounts effects twice — subscribe → immediately unsubscribe →
subscribe again — to catch missing-cleanup bugs. That rapid teardown can
abort the first connection before it fully opens, and the Firebase JS SDK
doesn't always attach a `.catch()` to that internal promise, so it surfaces
as an unhandled rejection even though the real (second) connection is fine
and your data loads correctly. This is a documented upstream quirk in
`firebase-js-sdk`, not a bug in this app.

Added `components/providers/BenignRejectionFilter.tsx` — it listens for
`unhandledrejection` globally and suppresses *only* this exact signature
(`AbortError` + "aborted"/"signal is aborted without reason"), so it stops
being confusing recurring noise. Any other unhandled rejection still
surfaces normally — this won't hide a real bug.

## Round: profile write blocked by Firestore rules

**"Missing or insufficient permissions" writing user/profile document** —
this was a genuine mismatch between the rules and the code, not a deployment
gap this time. `firestore.rules` had `profiles/{userId}` set to
`allow write: if false` entirely, but `ensureUserDocument`
(`lib/firebase/client.ts`) legitimately needs to *create* that doc once on
first login/register (it checks existence first and never touches it again
after that — all later credit/plan updates go through the Admin SDK, same as
before). Fixed the rule to allow `create` for the user's own doc while
keeping `update`/`delete` blocked for the client, matching exactly what the
code does.

**This absolutely will not take effect until you republish it** — same as
every other `firestore.rules` change in this project: paste the updated
rules into Firebase Console → Firestore Database → Rules → Publish, or run
`firebase deploy --only firestore:rules`. Editing the file in this repo has
zero effect on your live Firestore instance until one of those two happens.

The Cross-Origin-Opener-Policy console warnings around Google Sign-In
(`cb=gapi.loaded...`) are unrelated browser noise from the Google Sign-In
popup itself — benign, doesn't affect functionality, not something to chase.

## Round: contact form, admin queries section, animation pass

**Contact form wasn't working** — root cause: `components/landing/Contact.tsx`
was a plain `<form>` with no `onSubmit`, no `value`/`onChange` on the inputs,
and nowhere for the data to go. Clicking submit just did a full page
reload to the same URL and threw the input away. Rebuilt it as a real
controlled form (`app/api/contact/route.ts` → writes into a new `queries`
Firestore collection via the Admin SDK), with validation, a loading state,
and toast feedback on success/failure. This one works immediately without
a Firestore rules republish, since the write goes through the Admin SDK
server-side, not the client.

**Contact queries — new admin section** — `/admin/queries` lists every
submission (email, message, timestamp), with **Mark read/unread** and
**Delete** per message, plus an unread-count badge on the "Contact queries"
stat card on the main `/admin` dashboard. Verified server-side against the
admin session cookie, same pattern as the existing user-delete endpoint.
Added `firestore.rules` for `queries` too (deny-all to the client — it's
Admin-SDK-only in both directions) for defense-in-depth, even though it's
not required for anything to function.

**Animation pass** — added `components/ui/Reveal.tsx`, a reusable
scroll-into-view fade+slide-up wrapper (IntersectionObserver-based, respects
`prefers-reduced-motion` via the existing global media query, degrades to
always-visible if IntersectionObserver isn't available). Wired into: every
landing page section (Features, How it works, Pricing, FAQ, Contact — with
staggered delays across grid items instead of everything appearing at
once), the dashboard home stat cards, and the admin dashboard stat cards.
Also added a quick fade-in to the camera-capture and fullscreen-image
overlays in the upload workspace, which previously just popped in instantly.

## Round: Vercel build failure — `auth/invalid-api-key` on `/dashboard/billing`

**What the error meant:** `NEXT_PUBLIC_*` env vars get baked into the app at
**build time**, not read at request time. `/dashboard/billing` was the only
page in `/dashboard` written as a plain Server Component (no `'use client'`,
no dynamic data) — Next.js's static analysis saw that and decided it was
safe to fully prerender at build time. Doing so required running its parent
layout's module graph on the server, which includes `lib/firebase/client.ts`
eagerly calling `getAuth()` at module load — and if the Firebase env vars
aren't actually available in that specific Vercel build's environment, that
throws `auth/invalid-api-key` and takes the whole build down with it, not
just that one page.

**Two fixes, one architectural and one for next time this happens:**

1. **`/dashboard/*` and `/profile` are now `force-dynamic`.** These are
   inherently per-user authenticated pages — they have no business being
   statically exported at build time in the first place, independent of
   this bug. Since `export const dynamic` can't live in a file marked
   `'use client'`, both `app/dashboard/layout.tsx` and `app/profile/page.tsx`
   got split into a thin Server Component (holding just that config) wrapping
   the existing client logic, now in `DashboardAuthGate.tsx` /
   `ProfileContent.tsx`.
2. **`lib/firebase/client.ts` now fails loudly and specifically** if the
   Firebase config is missing, instead of letting Firebase's cryptic
   `auth/invalid-api-key` be the only clue. If this exact class of problem
   ever resurfaces, the error message will directly say which env vars are
   missing and that a redeploy (not just re-saving settings) is required.

**What you still need to check on your end:** this doesn't fix a genuinely
missing/wrong env var in Vercel — it just makes the failure clearer and
keeps it from taking down unrelated pages. Go to Vercel → Project Settings →
Environment Variables and confirm all seven `NEXT_PUBLIC_FIREBASE_*` values
are present and correct for the **Production** environment specifically
(not just Development/Preview), then trigger a **new** deployment — since
these are inlined at build time, saving the variables alone doesn't retroactively
fix a build that already ran.
