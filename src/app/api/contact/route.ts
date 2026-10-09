import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, contactEmailHtml } from '@/lib/email';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulario de contacto público. Envía el mensaje a CONTACT_EMAIL
 * (con replyTo del remitente). Campo `web` oculto como honeypot anti-spam.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const nombre = String(body?.nombre ?? '').trim();
    const email = String(body?.email ?? '').trim();
    const mensaje = String(body?.mensaje ?? '').trim();

    // Honeypot: los bots rellenan campos ocultos — responder OK sin enviar.
    if (body?.web) {
      return NextResponse.json({ ok: true });
    }

    if (!nombre || nombre.length > 100) {
      return NextResponse.json({ error: 'Indica tu nombre' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Email no válido' }, { status: 400 });
    }
    if (!mensaje || mensaje.length > 5000) {
      return NextResponse.json({ error: 'Escribe un mensaje' }, { status: 400 });
    }

    const to = process.env.CONTACT_EMAIL;
    if (!to) {
      console.error('[contact] CONTACT_EMAIL no configurada');
      return NextResponse.json({ error: 'Contacto no disponible' }, { status: 503 });
    }

    const emailContent = contactEmailHtml({ nombre, email, mensaje });
    await sendEmail(to, emailContent.subject, emailContent.html, email);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[contact] Error:', e);
    return NextResponse.json({ error: 'No se pudo enviar el mensaje' }, { status: 500 });
  }
}
