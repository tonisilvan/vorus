import { NextRequest, NextResponse } from 'next/server';
import {
  getProductsData,
  getOrdersData,
  saveOrdersData,
  normalizeOrder,
} from '@/lib/admin-store';

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

    const data = await getOrdersData();
    data.orders.unshift(order);
    await saveOrdersData(data);

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    console.error('Error creando pedido:', e);
    return NextResponse.json(
      { error: 'No se pudo registrar el pedido' },
      { status: 500 }
    );
  }
}
