import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/user-auth';
import { getOrdersData } from '@/lib/admin-store';
import { ORDER_STATUS_LABELS, OrderStatus } from '@/types/order';
import { LogoutButton } from './LogoutButton';
import { ArrowLeft, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Mi cuenta',
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
  enviado: 'bg-violet-100 text-violet-800 border-violet-200',
  completado: 'bg-green-100 text-green-800 border-green-200',
  cancelado: 'bg-zinc-200 text-zinc-700 border-zinc-300',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function MiCuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/mi-cuenta');

  const { orders } = await getOrdersData();
  const mine = orders.filter(
    o => o.userId === user.id || o.customer.email.toLowerCase() === user.email.toLowerCase()
  );

  return (
    <div className="checkout-page section-shell">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la tienda
      </Link>

      <div className="checkout-heading">
        <span className="eyebrow">Tu cuenta</span>
        <h1>Hola, {user.nombre}</h1>
        <p>Aquí puedes seguir el estado de tus pedidos.</p>
      </div>

      <div className="commerce-panel p-6 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-medium">
            {user.nombre} {user.apellidos}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <h2 className="text-xl font-semibold mb-4">Mis pedidos</h2>

      {mine.length === 0 ? (
        <div className="commerce-panel p-12 text-center space-y-3">
          <Package className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Todavía no tienes pedidos.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline"
          >
            Ir a la tienda
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mine.map(order => (
            <div key={order.id} className="commerce-panel p-6 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-mono font-semibold">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium rounded-full px-3 py-1 border ${STATUS_STYLES[order.status]}`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-bold">{order.total.toFixed(2)} €</span>
                </div>
              </div>
              <ul className="text-sm space-y-1 border-t pt-3">
                {order.items.map(i => (
                  <li key={i.productId} className="flex justify-between gap-4">
                    <span className="line-clamp-1">
                      {i.name} <span className="text-muted-foreground">×{i.quantity}</span>
                    </span>
                    <span className="whitespace-nowrap">{(i.price * i.quantity).toFixed(2)} €</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
