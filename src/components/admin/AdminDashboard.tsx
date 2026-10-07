'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductForm } from './ProductForm';
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  ExternalLink,
  RefreshCw,
  Play,
} from 'lucide-react';

interface AdminDashboardProps {
  initialProducts: Product[];
}

export function AdminDashboard({ initialProducts }: AdminDashboardProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState<
    { mode: 'new' } | { mode: 'edit'; product: Product } | null
  >(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleReload = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/products', { cache: 'no-store' });
      if (res.status === 401) {
        router.refresh();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cargar productos');
      setProducts(data.products);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${confirmDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo eliminar');
      setProducts(prev => prev.filter(p => p.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (product: Product) => {
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === product.id);
      if (index === -1) return [...prev, product];
      const next = [...prev];
      next[index] = product;
      return next;
    });
    setFormState(null);
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-zinc-900">
        <div className="flex h-14 md:h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            <span className="text-primary">VORUS</span>
            <span className="text-muted-foreground font-light ml-2">Admin</span>
          </h1>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Ver tienda</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold">Productos</h2>
            <p className="text-sm text-muted-foreground">
              {products.length} producto{products.length === 1 ? '' : 's'} en el catálogo
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleReload} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Recargar
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setFormState({ mode: 'new' })}>
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {/* Tabla de productos */}
        <div className="bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden shadow-sm">
          {loading && products.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Cargando productos...</div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <p className="text-muted-foreground">No hay productos todavía.</p>
              <Button className="gap-2" onClick={() => setFormState({ mode: 'new' })}>
                <Plus className="h-4 w-4" />
                Crear el primero
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Categoría</th>
                    <th className="px-4 py-3 font-medium">Precio</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Stock</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Estado</th>
                    <th className="px-4 py-3 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(product => {
                    const mainImage =
                      product.images.find(img => img.type === 'principal') || product.images[0];
                    const lowestPrice = Math.min(...product.variants.map(v => v.price));
                    const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);

                    return (
                      <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                              {mainImage && (
                                <Image
                                  src={mainImage.url}
                                  alt={mainImage.alt || product.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium line-clamp-1 max-w-[240px] md:max-w-[320px]">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="line-clamp-1">/{product.slug}</span>
                                {product.videos && product.videos.length > 0 && (
                                  <Play className="h-3 w-3 text-primary flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge variant="secondary">{product.category}</Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap">
                          {lowestPrice.toFixed(2)} €
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span
                            className={
                              totalStock === 0
                                ? 'text-red-600 font-medium'
                                : totalStock < 15
                                  ? 'text-orange-600 font-medium'
                                  : ''
                            }
                          >
                            {totalStock}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex gap-1.5">
                            {product.featured && (
                              <Badge className="bg-yellow-500/90 text-white border-0">
                                Destacado
                              </Badge>
                            )}
                            {totalStock === 0 && (
                              <Badge variant="destructive">Sin stock</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Link href={`/producto/${product.slug}`} target="_blank">
                              <Button variant="ghost" size="icon" title="Ver en la tienda">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Editar"
                              onClick={() => setFormState({ mode: 'edit', product })}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Eliminar"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => setConfirmDelete(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Los cambios se guardan en el catálogo (Vercel Blob en producción,{' '}
          <code>src/data/products.json</code> en desarrollo) y se reflejan en la tienda al instante.
        </p>
      </main>

      {/* Modal formulario */}
      {formState && (
        <ProductForm
          initial={formState.mode === 'edit' ? formState.product : undefined}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Modal confirmación borrado */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setConfirmDelete(null)}
          />
          <div className="relative bg-white dark:bg-zinc-900 border rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-lg font-bold">¿Eliminar producto?</h3>
            <p className="text-sm text-muted-foreground">
              Se eliminará <strong>{confirmDelete.name}</strong> del catálogo. Esta acción no se
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
