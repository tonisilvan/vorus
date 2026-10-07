import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/user-auth';
import { getOrdersData } from '@/lib/admin-store';

export const dynamic = 'force-dynamic';

/**
 * Devuelve los pedidos del usuario autenticado. Un pedido pertenece al
 * usuario si lo hizo con sesión (userId) o si coincide su email.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { orders } = await getOrdersData();
  const mine = orders.filter(
    o => o.userId === user.id || o.customer.email.toLowerCase() === user.email.toLowerCase()
  );
  return NextResponse.json({ orders: mine });
}
