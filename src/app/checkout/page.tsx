'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { calculateCartTotal } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Truck, ShieldCheck, UserCheck } from 'lucide-react';
import { Order } from '@/types/order';
import { PublicUser } from '@/types/user';
import Image from 'next/image';
import Link from 'next/link';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { analyticsEvents, isGAReady } from '@/lib/analytics';

interface ShippingData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  codigoPostal: string;
  ciudad: string;
  provincia: string;
  pais: string;
  notas: string;
}

export default function CheckoutPage() {
  const { items, emptyCart } = useCart();
  const cart = calculateCartTotal(items);

  // Analytics event when entering checkout
  useEffect(() => {
    if (items.length > 0 && isGAReady()) {
      analyticsEvents.beginCheckout(cart.total, items.length);
    }
  }, [items.length, cart.total]);

  const [formData, setFormData] = useState<ShippingData>({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    provincia: '',
    pais: 'España',
    notas: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [sessionUser, setSessionUser] = useState<PublicUser | null>(null);

  // Si hay sesión iniciada, prefijar nombre/apellidos/email
  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        const u = data?.user as PublicUser | null;
        if (u) {
          setSessionUser(u);
          setFormData(prev => ({
            ...prev,
            nombre: prev.nombre || u.nombre,
            apellidos: prev.apellidos || u.apellidos,
            email: prev.email || u.email,
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Vuelta de Stripe: ?pagado=1 muestra confirmación y vacía el carrito;
  // ?cancelado=1 mantiene el carrito y avisa
  const [cancelNotice, setCancelNotice] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('pedido');
    if (params.get('pagado') === '1' && pedidoId) {
      setOrder({ id: pedidoId } as Order);
      emptyCart();
      setSubmitted(true);
      window.history.replaceState({}, '', '/checkout');
    } else if (params.get('cancelado') === '1') {
      setCancelNotice(true);
      window.history.replaceState({}, '', '/checkout');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            nombre: formData.nombre,
            apellidos: formData.apellidos,
            email: formData.email,
            telefono: formData.telefono,
          },
          shipping: {
            direccion: formData.direccion,
            codigoPostal: formData.codigoPostal,
            ciudad: formData.ciudad,
            provincia: formData.provincia,
            pais: formData.pais,
            notas: formData.notas,
          },
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo registrar el pedido');

      const created: Order = data.order;

      // Analytics event for purchase
      if (isGAReady() && items.length > 0) {
        analyticsEvents.purchase(created.id, cart.total, items.length);
      }

      // Con Stripe: redirigir a la pasarela de pago (el carrito se vacía
      // al volver con ?pagado=1)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setOrder(created);
      emptyCart();
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo registrar el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !submitted) {
    return (
      <div className="checkout-state section-shell">
        <h1 className="text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="text-muted-foreground">Añade productos antes de continuar con la compra.</p>
        <Link href="/">
          <Button className="mt-4">Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="checkout-state section-shell">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">¡Pedido recibido!</h1>
        {order && (
          <p className="text-sm text-muted-foreground">
            Referencia: <strong>#{order.id.slice(0, 8)}</strong>
          </p>
        )}
        <p className="text-muted-foreground">
          Pago completado. Te hemos enviado un email de confirmación con los datos de tu pedido.
        </p>
        <p className="text-sm text-muted-foreground">
          Si tienes alguna duda, escríbenos a <a href="mailto:info@suministrospayne.com" className="underline text-primary">info@suministrospayne.com</a>
        </p>
        <Link href="/">
          <Button className="mt-4" variant="outline">Volver a la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page section-shell">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" />
        Volver a la tienda
      </Link>

      <div className="checkout-heading"><span className="eyebrow">Un último paso</span><h1>Finalizar compra</h1><p>Prepara tu pedido con total tranquilidad.</p></div>

      {cancelNotice && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
          Pago cancelado — tu carrito sigue guardado. Puedes intentarlo de nuevo cuando quieras.
        </p>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Datos personales */}
            <div className="commerce-panel p-6 space-y-4">
              <h2 className="text-lg font-semibold">Datos personales</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="nombre" className="text-sm font-medium">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="apellidos" className="text-sm font-medium">Apellidos *</label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    required
                    value={formData.apellidos}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="telefono" className="text-sm font-medium">Teléfono *</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="commerce-panel p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Dirección de envío
              </h2>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Dirección completa *</label>
                <AddressAutocomplete
                  placeholder="Busca tu dirección..."
                  initialValue={formData.direccion}
                  onAddressSelect={(data) => {
                    setFormData(prev => ({
                      ...prev,
                      direccion: data.address,
                      codigoPostal: data.postalCode || prev.codigoPostal,
                      ciudad: data.city || prev.ciudad,
                      provincia: data.province || prev.provincia,
                      pais: data.country || prev.pais,
                    }));
                  }}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="codigoPostal" className="text-sm font-medium">Código Postal *</label>
                  <input
                    type="text"
                    id="codigoPostal"
                    name="codigoPostal"
                    required
                    value={formData.codigoPostal}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="ciudad" className="text-sm font-medium">Ciudad *</label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    required
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="provincia" className="text-sm font-medium">Provincia *</label>
                  <input
                    type="text"
                    id="provincia"
                    name="provincia"
                    required
                    value={formData.provincia}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="pais" className="text-sm font-medium">País</label>
                <select
                  id="pais"
                  name="pais"
                  value={formData.pais}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="España">España</option>
                  <option value="Portugal">Portugal</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="notas" className="text-sm font-medium">Notas del pedido (opcional)</label>
                <textarea
                  id="notas"
                  name="notas"
                  rows={3}
                  placeholder="Indicaciones para la entrega, horario preferido, etc."
                  value={formData.notas}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>

            {/* Cuenta de cliente */}
            <div className="commerce-panel p-6">
              {sessionUser ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Comprando como {sessionUser.nombre} {sessionUser.apellidos}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      El pedido quedará vinculado a tu cuenta y podrás seguirlo desde{' '}
                      <Link href="/mi-cuenta" className="underline text-primary">Mi cuenta</Link>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">¿Tienes cuenta en Vorus?</h2>
                  <p className="text-sm text-muted-foreground">
                    <Link href="/login?next=/checkout" className="underline text-primary font-medium">
                      Inicia sesión
                    </Link>{' '}
                    o{' '}
                    <Link href="/registro?next=/checkout" className="underline text-primary font-medium">
                      crea una cuenta
                    </Link>{' '}
                    para consultar tus pedidos y recibir avisos por email cuando cambien de estado.
                    También puedes comprar sin cuenta.
                  </p>
                </div>
              )}
            </div>

            {submitError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{submitError}</p>
            )}

            {/* Submit en móvil */}
            <div className="lg:hidden">
              <Button type="submit" className="w-full h-14 text-lg font-semibold gap-2" disabled={submitting}>
                <Lock className="h-5 w-5" />
                {submitting ? 'Enviando pedido...' : 'Confirmar Pedido'}
              </Button>
            </div>
          </form>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="checkout-summary commerce-panel p-6 space-y-4">
            <h2 className="text-lg font-semibold">Resumen del pedido</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                    <Image
                      src={item.product.images[0]?.url || ''}
                      alt={item.product.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap">
                    {(item.product.variants[0].price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal (sin IVA):</span>
                <span>{cart.subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (21%):</span>
                <span>{cart.tax.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envío:</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-primary">{cart.total.toFixed(2)} €</span>
              </div>
            </div>

            <Button type="submit" form="checkout-form" className="hidden lg:flex w-full h-12 text-base font-semibold gap-2" disabled={submitting}>
              <Lock className="h-4 w-4" />
              {submitting ? 'Enviando pedido...' : 'Confirmar Pedido'}
            </Button>

            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Compra segura · Datos protegidos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
