import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import {
  getOrdersData,
  saveOrdersData,
  isValidOrderStatus,
} from '@/lib/admin-store';
import { sendEmail, orderStatusEmailHtml } from '@/lib/email';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    if (!isValidOrderStatus(body?.status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }

    const data = await getOrdersData();
    const order = data.orders.find(o => o.id === id);
    if (!order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    order.status = body.status;
    order.updatedAt = new Date().toISOString();
    await saveOrdersData(data);

    const notice = orderStatusEmailHtml(order);
    await sendEmail(order.customer.email, notice.subject, notice.html);

    return NextResponse.json({ order });
  } catch (e) {
    console.error('Error actualizando pedido:', e);
    return NextResponse.json(
      { error: 'No se pudo actualizar el pedido' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await getOrdersData();
    const exists = data.orders.some(o => o.id === id);
    if (!exists) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    data.orders = data.orders.filter(o => o.id !== id);
    await saveOrdersData(data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Error eliminando pedido:', e);
    return NextResponse.json(
      { error: 'No se pudo eliminar el pedido' },
      { status: 500 }
    );
  }
}
