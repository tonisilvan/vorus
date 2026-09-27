import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'vorus_admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || '';
}

export function checkAdminPassword(password: string): boolean {
  const secret = getSecret();
  if (!secret || !password) return false;
  const a = Buffer.from(password, 'utf8');
  const b = Buffer.from(secret, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin.${expires}`;
  const signature = createHmac('sha256', getSecret()).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  const secret = getSecret();
  if (!token || !secret) return false;
  const [role, expiresStr, signature] = token.split('.');
  if (role !== 'admin' || !expiresStr || !signature) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = createHmac('sha256', secret)
    .update(`${role}.${expiresStr}`)
    .digest('hex');
  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}
