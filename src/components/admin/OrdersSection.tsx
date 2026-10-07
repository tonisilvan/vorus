'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus, ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/types/order';
import { Button } from '@/components/ui/button';
import {
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pendiente: 'bg-yellow-500/90 text-white border-0',
  en_proceso: 'bg-blue-500/90 text-white border-0',
  enviado: 'bg-violet-500/90 text-white border-0',
  completado: 'bg-green-600/90 text-white border-0',
  cancelado: 'bg-zinc-500/90 text-white border-0',
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

export function OrdersSection() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar pedidos');
      setOrders(data.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (order: Order, status: OrderStatus) => {
    setUpdating(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar');
      setOrders(prev => prev.map(o => (o.id === order.id ? data.order : o)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el estado');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${confirmDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar');
      setOrders(prev => prev.filter(o => o.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const pending = orders.filter(o => o.status === 'pendiente').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Pedidos</h2>
          <p className="text-sm text-muted-foreground">
            {orders.length} pedido{orders.length === 1 ? '' : 's'} · {pending} pendiente
            {pending === 1 ? '' : 's'}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden shadow-sm">
        {loading && orders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No hay pedidos todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium">Pedido</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Fecha</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Cliente</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map(order => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    expanded={expanded === order.id}
                    onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                    updating={updating === order.id}
                    onStatus={handleStatus}
                    onDelete={() => setConfirmDelete(order)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal confirmación borrado */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setConfirmDelete(null)}
          />
          <div className="relative bg-white dark:bg-zinc-900 border rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">¿Eliminar pedido?</h3>
            <p className="text-sm text-muted-foreground">
              Se eliminará el pedido <strong>#{confirmDelete.id.slice(0, 8)}</strong> de{' '}
              {confirmDelete.customer.nombre} {confirmDelete.customer.apellidos}. Esta acción no se
              puede deshacer.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
  expanded,
  onToggle,
  updating,
  onStatus,
  onDelete,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  updating: boolean;
  onStatus: (order: Order, status: OrderStatus) => void;
  onDelete: () => void;
}) {
  return (
    <>
      <tr className="hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3">
          <button
            className="flex items-center gap-2 font-mono font-medium text-left"
            onClick={onToggle}
          >
            #{order.id.slice(0, 8)}
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </td>
        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground whitespace-nowrap">
          {formatDate(order.createdAt)}
        </td>
        <td className="px-4 py-3 hidden sm:table-cell">
          <div className="min-w-0">
            <p className="font-medium line-clamp-1">
              {order.customer.nombre} {order.customer.apellidos}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-1">{order.customer.telefono}</p>
          </div>
        </td>
        <td className="px-4 py-3 font-semibold whitespace-nowrap">{order.total.toFixed(2)} €</td>
        <td className="px-4 py-3">
          <select
            value={order.status}
            disabled={updating}
            onChange={e => onStatus(order, e.target.value as OrderStatus)}
            className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer ${STATUS_COLORS[order.status]}`}
          >
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s} className="text-foreground bg-background">
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              title="Eliminar"
              className="text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20">
          <td colSpan={6} className="px-6 py-4">
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">Productos</h4>
                <ul className="space-y-1">
                  {order.items.map(i => (
                    <li key={i.productId} className="flex justify-between gap-4">
                      <span className="line-clamp-1">
                        {i.name} <span className="text-muted-foreground">x{i.quantity}</span>
                      </span>
                      <span className="whitespace-nowrap">{(i.price * i.quantity).toFixed(2)} €</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-2 space-y-0.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal (sin IVA)</span>
                    <span>{order.subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (21%)</span>
                    <span>{order.tax.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{order.shippingCost === 0 ? 'Gratis' : `${order.shippingCost.toFixed(2)} €`}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span>{order.total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Cliente y envío</h4>
                <div className="space-y-0.5 text-muted-foreground">
                  <p>
                    {order.customer.nombre} {order.customer.apellidos}
                  </p>
                  <p>{order.customer.email}</p>
                  <p>{order.customer.telefono}</p>
                </div>
                <div className="space-y-0.5 text-muted-foreground pt-1">
                  <p>{order.shipping.direccion}</p>
                  <p>
                    {order.shipping.codigoPostal} {order.shipping.ciudad} ({order.shipping.provincia}
                    ), {order.shipping.pais}
                  </p>
                </div>
                {order.shipping.notas && (
                  <p className="text-xs bg-muted rounded-lg px-3 py-2">
                    <strong>Notas:</strong> {order.shipping.notas}
                  </p>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
