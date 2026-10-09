import { Order, ORDER_STATUS_LABELS } from '@/types/order';
import { User } from '@/types/user';

const FROM = process.env.EMAIL_FROM || 'Vorus <pedidos@vorus.es>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'info@suministrospayne.com';
const SITE_URL = process.env.SITE_URL || 'https://vorus.es';

function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Envía un email vía Resend. No lanza errores: los emails son best-effort y
 * nunca deben romper el flujo del pedido. Requiere RESEND_API_KEY y un
 * dominio verificado en Resend para EMAIL_FROM.
 */
export async function sendEmail(to: string, subject: string, html: string, replyTo?: string): Promise<void> {
  if (!resendConfigured()) {
    console.warn(`[email] RESEND_API_KEY no configurada — no se envía "${subject}" a ${to}`);
    return;
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from: FROM, to, subject, html, replyTo: replyTo ?? REPLY_TO });
    if (error) console.error('[email] Error de Resend:', error);
  } catch (e) {
    console.error('[email] Fallo enviando email:', e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
    <tr><td>
      <p style="font-size:20px;font-weight:700;letter-spacing:2px;margin:0 0 4px">VOR<span style="color:#7c3aed">U</span>S</p>
      <h1 style="font-size:22px;margin:16px 0">${title}</h1>
      ${body}
      <p style="font-size:13px;color:#71717a;margin-top:32px">
        Vorus · <a href="${SITE_URL}" style="color:#7c3aed">vorus.es</a> · <a href="mailto:info@suministrospayne.com" style="color:#7c3aed">info@suministrospayne.com</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

function orderItemsTable(order: Order): string {
  const rows = order.items
    .map(
      i =>
        `<tr><td style="padding:6px 0">${i.name} × ${i.quantity}</td>` +
        `<td style="padding:6px 0;text-align:right">${(i.price * i.quantity).toFixed(2)} €</td></tr>`
    )
    .join('');
  return `<table width="100%" style="font-size:14px;border-collapse:collapse">
    ${rows}
    <tr><td style="padding:10px 0 0;border-top:1px solid #e4e4e7;font-weight:700">Total (IVA incl.)</td>
    <td style="padding:10px 0 0;border-top:1px solid #e4e4e7;font-weight:700;text-align:right">${order.total.toFixed(2)} €</td></tr>
  </table>`;
}

export function welcomeEmailHtml(user: User): { subject: string; html: string } {
  return {
    subject: 'Bienvenido a Vorus',
    html: layout(
      `Hola, ${user.nombre}`,
      `<p style="font-size:15px;line-height:1.6">Tu cuenta en Vorus está lista. Desde tu panel puedes consultar tus pedidos y su estado en cualquier momento.</p>
       <p style="margin:24px 0"><a href="${SITE_URL}/mi-cuenta" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">Ir a mi cuenta</a></p>`
    ),
  };
}

/** Notificación al dueño de la tienda (ADMIN_EMAIL) cuando entra un pedido nuevo. */
export function adminNewOrderEmailHtml(order: Order): { subject: string; html: string } {
  const c = order.customer;
  return {
    subject: `Nuevo pedido #${order.id.slice(0, 8)} — ${order.total.toFixed(2)} €`,
    html: layout(
      `Nuevo pedido de ${c.nombre} ${c.apellidos}`,
      `<p style="font-size:15px;line-height:1.6">Pedido <strong>#${order.id.slice(0, 8)}</strong> — ${c.email} · ${c.telefono}</p>
       ${orderItemsTable(order)}
       <p style="font-size:14px;line-height:1.6;color:#52525b">Envío a: ${order.shipping.direccion}, ${order.shipping.codigoPostal} ${order.shipping.ciudad} (${order.shipping.provincia})</p>`
    ),
  };
}

/** Mensaje del formulario de contacto, enviado a CONTACT_EMAIL. */
export function contactEmailHtml(data: { nombre: string; email: string; mensaje: string }): { subject: string; html: string } {
  return {
    subject: `Contacto web — ${escapeHtml(data.nombre)}`,
    html: layout(
      'Mensaje de contacto',
      `<p style="font-size:15px;line-height:1.6"><strong>${escapeHtml(data.nombre)}</strong> (${escapeHtml(data.email)}) escribe desde el formulario de vorus.es:</p>
       <p style="font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(data.mensaje)}</p>
       <p style="font-size:13px;color:#71717a">Puedes responder directamente a este email para contestar al cliente.</p>`
    ),
  };
}

export function orderConfirmationEmailHtml(order: Order): { subject: string; html: string } {
  return {
    subject: `Pedido recibido #${order.id.slice(0, 8)}`,
    html: layout(
      `Gracias por tu pedido, ${order.customer.nombre}`,
      `<p style="font-size:15px;line-height:1.6">Hemos recibido tu pedido <strong>#${order.id.slice(0, 8)}</strong>. Te avisaremos por email cuando cambie de estado.</p>
       ${orderItemsTable(order)}
       <p style="font-size:14px;line-height:1.6;color:#52525b">Envío a: ${order.shipping.direccion}, ${order.shipping.codigoPostal} ${order.shipping.ciudad} (${order.shipping.provincia})</p>
       <p style="margin:24px 0"><a href="${SITE_URL}/mi-cuenta" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">Ver mi pedido</a></p>`
    ),
  };
}

export function orderStatusEmailHtml(order: Order): { subject: string; html: string } {
  const label = ORDER_STATUS_LABELS[order.status];
  return {
    subject: `Tu pedido #${order.id.slice(0, 8)} ahora está: ${label}`,
    html: layout(
      `Pedido #${order.id.slice(0, 8)} — ${label}`,
      `<p style="font-size:15px;line-height:1.6">Hola ${order.customer.nombre}, el estado de tu pedido ha cambiado a <strong>${label}</strong>.</p>
       ${orderItemsTable(order)}
       <p style="margin:24px 0"><a href="${SITE_URL}/mi-cuenta" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">Ver mi pedido</a></p>`
    ),
  };
}
