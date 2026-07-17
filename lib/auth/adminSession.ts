/**
 * Lightweight, stateless admin session tokens — no database/session store
 * needed. A token is `${expiryTimestamp}.${signature}`, where signature is
 * an HMAC-SHA256 of the expiry, keyed by ADMIN_SESSION_SECRET. Anyone
 * without that secret can't forge a valid signature, so a client can't
 * fabricate their own token even though the cookie is just a string.
 *
 * Uses Web Crypto (`crypto.subtle`) rather than Node's `crypto` module so
 * the same code works identically in both proxy.ts and route handlers —
 * Web Crypto is available as a global in Node.js too, so this doesn't
 * depend on which runtime either file happens to run under.
 *
 * Note: this is a simple gate appropriate for a single hardcoded admin
 * account on a student/portfolio project — it is not a substitute for a
 * real user/role system if this app ever has multiple admins.
 */

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const encoder = new TextEncoder();

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await getKey(secret);
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return toBase64Url(signatureBuffer);
}

export async function createAdminSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET is not configured on the server.');
  }
  const expiresAt = String(Date.now() + SESSION_DURATION_MS);
  const signature = await sign(expiresAt, secret);
  return `${expiresAt}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature) return false;
  if (Date.now() > Number(expiresAt)) return false; // expired

  const expectedSignature = await sign(expiresAt, secret);
  return expectedSignature === signature;
}
