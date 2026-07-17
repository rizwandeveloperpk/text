'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// NEXT_PUBLIC_* vars are inlined at BUILD time, not read at request time —
// if this throws during a Vercel build (usually surfaces as Firebase's own
// cryptic "auth/invalid-api-key"), it means these weren't actually set for
// the environment (Production/Preview) that build used. Failing loudly and
// specifically here beats a confusing Firebase SDK error deep in a build log.
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Firebase client config is missing (NEXT_PUBLIC_FIREBASE_API_KEY / NEXT_PUBLIC_FIREBASE_PROJECT_ID). ' +
      'If this is happening during a Vercel build, double-check these are set in Project Settings → ' +
      'Environment Variables for the environment being built (Production/Preview), then redeploy — ' +
      'NEXT_PUBLIC_ vars are baked in at build time, so saving them after a failed build isn\'t enough ' +
      'on its own, a new build has to actually run.'
  );
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

// Analytics only works in the browser (it depends on the DOM and, in some
// environments, on cookies/tracking permissions) — never call getAnalytics()
// during server-side rendering, and always feature-detect support first.
export let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(firebaseApp);
    }
  });
}

const googleProvider = new GoogleAuthProvider();

/**
 * Writes/updates users/{uid} in Firestore so the collection the admin panel
 * reads from actually gets populated — Firebase Auth alone only creates the
 * auth record, it never creates a Firestore document by itself.
 */
async function ensureUserDocument(user: User) {
  try {
    await setDoc(
      doc(db, 'users', user.uid),
      {
        fullName: user.displayName ?? '',
        email: user.email ?? '',
        avatar: user.photoURL ?? null,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Only set defaults if this profile doc doesn't exist yet — merge:true
    // here would otherwise reset an existing user's credits back to 2 on
    // every single login.
    const profileRef = doc(db, 'profiles', user.uid);
    const existing = await getDoc(profileRef);
    if (!existing.exists()) {
      await setDoc(profileRef, {
        userId: user.uid,
        plan: 'free',
        freeUsed: 0,
        credits: 2,
      });
    }
  } catch (err) {
    // Don't block login/registration if this write fails (e.g. rules not
    // deployed yet) — just log it so it's visible during setup.
    console.error('Could not write user/profile document:', err);
  }
}

export async function registerWithEmail(fullName: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: fullName });
  await ensureUserDocument(credential.user);
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDocument(credential.user);
  return credential.user;
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  await ensureUserDocument(credential.user);
  return credential.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
