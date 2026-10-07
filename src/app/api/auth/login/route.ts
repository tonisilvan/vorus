import { NextRequest, NextResponse } from 'next/server';
import { getUsersData } from '@/lib/admin-store';
import { verifyPassword, createUserSessionToken, USER_COOKIE, USER_SESSION_MAX_AGE } from '@/lib/user-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '');

    const { users } = await getUsersData();
    const user = users.find(u => u.email === email);

    // Mensaje genérico para no revelar si el email existe
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos' }, { status: 401 });
    }

    const res = NextResponse.json({
      user: { id: user.id, nombre: user.nombre, apellidos: user.apellidos, email: user.email },
    });
    res.cookies.set(USER_COOKIE, createUserSessionToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: USER_SESSION_MAX_AGE,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error('Error en login:', e);
    return NextResponse.json({ error: 'No se pudo iniciar sesión' }, { status: 500 });
  }
}
