import { NextRequest, NextResponse } from 'next/server';
import {
  getProductsData,
  getOrdersData,
  saveOrdersData,
  normalizeOrder,
} from '@/lib/admin-store';
import { getCurrentUser } from '@/lib/user-auth';
import { sendEmail, orderConfirmationEmailHtml, adminNewOrderEmailHtml } from '@/lib/email';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Crea un pedido desde el checkout. Público: valida campos y recalcula los
 * importes desde el catálogo (el precio enviado por el cliente se ignora).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = await getProductsData();
    const { order, error } = normalizeOrder(body, products);
    if (!order) {
      return NextResponse.json(
        { error: error ?? 'Datos del pedido no válidos' },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    if (user) order.userId = user.id;

    // Con Stripe configurado: crear sesión de pago y devolver checkoutUrl.
    // El email de confirmación sale del webhook cuando el pago se completa.
    const stripe = getStripe();
    let checkoutUrl: string | undefined;

    if (stripe) {
      const origin = new URL(request.url).origin;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: order.customer.email,
        line_items: order.items.map(i => ({
          quantity: i.quantity,
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(i.price * 100),
            product_data: { name: i.name },
          },
        })),
        metadata: { orderId: order.id },
        success_url: `${origin}/checkout?pagado=1&pedido=${order.id}`,
        cancel_url: `${origin}/checkout?cancelado=1`,
      });
      order.stripeSessionId = session.id;
      checkoutUrl = session.url ?? undefined;
    }

    const data = await getOrdersData();
    data.orders.unshift(order);
    await saveOrdersData(data);

    if (!stripe) {
      const confirmation = orderConfirmationEmailHtml(order);
      await sendEmail(order.customer.email, confirmation.subject, confirmation.html);
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const notification = adminNewOrderEmailHtml(order);
      await sendEmail(adminEmail, notification.subject, notification.html);
    }

    return NextResponse.json({ order, checkoutUrl }, { status: 201 });
  } catch (e) {
    console.error('Error creando pedido:', e);
    return NextResponse.json(
      { error: 'No se pudo registrar el pedido' },
      { status: 500 }
    );
  }
}
