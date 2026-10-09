'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PublicUser } from '@/types/user';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2 } from 'lucide-react';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function UsersSection() {
  const router = useRouter();
  const [users, setUsers] = useState<(PublicUser & { createdAt: string })[]>([]);
  const [ordersByUser, setOrdersByUser] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<PublicUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, ordersRes] = await Promise.all([
        fetch('/api/admin/users', { cache: 'no-store' }),
        fetch('/api/admin/orders', { cache: 'no-store' }),
      ]);
      if (usersRes.status === 401 || ordersRes.status === 401) {
        router.refresh();
        return;
      }
      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();
      if (!usersRes.ok) throw new Error(usersData.error || 'Error al cargar usuarios');
      setUsers(usersData.users);

      const counts = new Map<string, number>();
      for (const o of (ordersData.orders ?? []) as Order[]) {
        if (o.userId) counts.set(o.userId, (counts.get(o.userId) ?? 0) + 1);
      }
      setOrdersByUser(counts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${confirmDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar');
      setUsers(prev => prev.filter(u => u.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            {users.length} usuario{users.length === 1 ? '' : 's'} registrado
            {users.length === 1 ? '' : 's'}
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
        {loading && users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No hay usuarios registrados todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Registrado</th>
                  <th className="px-4 py-3 font-medium">Pedidos</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {user.nombre} {user.apellidos}
                      </p>
                      <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{ordersByUser.get(user.id) ?? 0}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar usuario"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setConfirmDelete(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setConfirmDelete(null)}
          />
          <div className="relative bg-white dark:bg-zinc-900 border rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">¿Eliminar usuario?</h3>
            <p className="text-sm text-muted-foreground">
              Se eliminará la cuenta de <strong>{confirmDelete.nombre} {confirmDelete.apellidos}</strong>{' '}
              ({confirmDelete.email}). Sus pedidos se conservan. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={deleting}>
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
