import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { getUsersData } from '@/lib/admin-store';
import { PublicUser } from '@/types/user';

export const USER_COOKIE = 'vorus_session';
export const USER_SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || '';
}

/**
 * Hash de contraseña con scrypt. Formato: `salt:hash` en hex.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function createUserSessionToken(userId: string): string {
  const expires = Date.now() + USER_SESSION_MAX_AGE * 1000;
  const payload = `user.${userId}.${expires}`;
  const signature = createHmac('sha256', getSecret()).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

function verifyUserSessionToken(token: string | undefined): string | null {
  const secret = getSecret();
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [role, userId, expiresStr, signature] = parts;
  if (role !== 'user' || !userId || !expiresStr || !signature) return null;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return null;
  const expected = createHmac('sha256', secret)
    .update(`${role}.${userId}.${expiresStr}`)
    .digest('hex');
  const a = Buffer.from(signature, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return userId;
}

/**
 * Devuelve el usuario autenticado a partir de la cookie de sesión, o null.
 */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const userId = verifyUserSessionToken(store.get(USER_COOKIE)?.value);
  if (!userId) return null;
  const { users } = await getUsersData();
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  return { id: user.id, nombre: user.nombre, apellidos: user.apellidos, email: user.email };
}
