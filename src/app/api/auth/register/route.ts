import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getUsersData, saveUsersData } from '@/lib/admin-store';
import { hashPassword, createUserSessionToken, USER_COOKIE, USER_SESSION_MAX_AGE } from '@/lib/user-auth';
import { sendEmail, welcomeEmailHtml } from '@/lib/email';
import { User } from '@/types/user';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nombre = String(body?.nombre ?? '').trim().slice(0, 100);
    const apellidos = String(body?.apellidos ?? '').trim().slice(0, 100);
    const email = String(body?.email ?? '').trim().toLowerCase().slice(0, 100);
    const password = String(body?.password ?? '');

    if (!nombre || !apellidos) {
      return NextResponse.json({ error: 'Nombre y apellidos son obligatorios' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Email no válido' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    const data = await getUsersData();
    if (data.users.some(u => u.email === email)) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese email' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      nombre,
      apellidos,
      email,
      passwordHash: hashPassword(password),
      createdAt: now,
      updatedAt: now,
    };
    data.users.push(user);
    await saveUsersData(data);

    const res = NextResponse.json(
      { user: { id: user.id, nombre, apellidos, email } },
      { status: 201 }
    );
    res.cookies.set(USER_COOKIE, createUserSessionToken(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: USER_SESSION_MAX_AGE,
      path: '/',
    });

    const welcome = welcomeEmailHtml(user);
    sendEmail(email, welcome.subject, welcome.html).catch(() => {});

    return res;
  } catch (e) {
    console.error('Error registrando usuario:', e);
    return NextResponse.json({ error: 'No se pudo crear la cuenta' }, { status: 500 });
  }
}
