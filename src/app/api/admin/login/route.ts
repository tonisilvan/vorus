import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE,
  checkAdminPassword,
  createSessionToken,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD no está configurada en el servidor' },
        { status: 500 }
      );
    }

    if (!checkAdminPassword(String(password ?? ''))) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Solicitud no válida' }, { status: 400 });
  }
}
