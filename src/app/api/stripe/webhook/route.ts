import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getOrdersData, saveOrdersData } from '@/lib/admin-store';
import { sendEmail, orderConfirmationEmailHtml, adminNewOrderEmailHtml } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Webhook de Stripe: marca el pedido como pagado cuando la sesión de
 * Checkout se completa y envía el email de confirmación.
 * Configurar endpoint en Stripe → checkout.session.completed.
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: 'Stripe no configurado' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  const body = await request.text(); // cuerpo RAW necesario para verificar la firma

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? '', secret);
  } catch (err) {
    console.error('[stripe webhook] firma inválida:', err);
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const data = await getOrdersData();
      const order = data.orders.find(o => o.id === orderId);
      if (order && !order.paid) {
        order.paid = true;
        order.paidAt = new Date().toISOString();
        order.stripeSessionId = session.id;
        order.updatedAt = order.paidAt;
        await saveOrdersData(data);

        const confirmation = orderConfirmationEmailHtml(order);
        await sendEmail(order.customer.email, confirmation.subject, confirmation.html);

        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          const notification = adminNewOrderEmailHtml(order);
          await sendEmail(adminEmail, notification.subject, notification.html);
        }
      }
    }
  } else if (event.type === 'checkout.session.expired') {
    // El cliente cerró Stripe sin pagar (24h): cancelar el pedido abandonado
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const data = await getOrdersData();
      const order = data.orders.find(o => o.id === orderId);
      if (order && !order.paid && order.status === 'pendiente') {
        order.status = 'cancelado';
        order.updatedAt = new Date().toISOString();
        await saveOrdersData(data);
      }
    }
  }

  return NextResponse.json({ received: true });
}
