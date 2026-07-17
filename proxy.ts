import { NextResponse, type NextRequest } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/auth/adminSession';

// Next.js 16 renamed the "middleware" file convention to "proxy" — this file
// used to be middleware.ts. Same behavior, just the file/export name changed.
//
// Firebase Auth for the client SDK is session-based in the browser, so route
// protection for /dashboard/* is enforced client-side in
// app/dashboard/layout.tsx (redirects unauthenticated users to /login).
//
// /admin/* is different: it's gated by a single hardcoded admin account
// (see app/api/admin/login), enforced here server-side via a signed
// session cookie, since there's no Firebase user backing it to check
// client-side. This stays a "thin" check (verifying an HMAC signature only,
// no database lookups) per Next.js's guidance for what belongs in proxy.ts
// vs. a Server Component/layout.

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_session')?.value;
    const valid = await verifyAdminSessionToken(token);
    if (!valid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
