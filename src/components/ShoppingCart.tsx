'use client';

import { useEffect } from 'react';
import { CartItem } from '@/types/product';
import { calculateCartTotal } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ShoppingCartProps {
  items: CartItem[];
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ShoppingCart({ 
  items, 
  onRemoveItem, 
  onUpdateQuantity, 
  onClearCart, 
  isOpen, 
  onClose 
}: ShoppingCartProps) {
  const cart = calculateCartTotal(items);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <button type="button" className="cart-backdrop" onClick={onClose} aria-label="Cerrar carrito" />
      
      {/* Drawer */}
      <div className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        {/* Header */}
        <div className="cart-heading">
          <div className="flex items-center gap-2">
            <div><span className="eyebrow">Tu selección</span><h2 id="cart-title">Carrito <span>({items.length})</span></h2></div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar carrito">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
              <div>
                <p className="font-medium text-lg">Tu carrito está vacío</p>
                <p className="text-sm text-muted-foreground mt-1">Añade productos para empezar</p>
              </div>
              <Button variant="outline" onClick={onClose}>
                Seguir comprando
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.product.id}
                  className="cart-line"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                    <Image
                      src={item.product.images[0]?.url || '/images/powerbank-principal-cable.png'}
                      alt={item.product.images[0]?.alt || item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-1">{item.product.name}</h3>
                    <p className="text-sm font-semibold text-primary mt-0.5">
                      {item.product.variants[0].price.toFixed(2)} € <span className="text-xs font-normal text-muted-foreground">IVA incl.</span>
                    </p>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="quantity-stepper" aria-label={`Reducir cantidad de ${item.product.name}`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium" aria-live="polite">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="quantity-stepper" aria-label={`Aumentar cantidad de ${item.product.name}`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="cart-remove" aria-label={`Eliminar ${item.product.name} del carrito`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-semibold">
                      {(item.product.variants[0].price * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-summary">
            <div className="cart-totals">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
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
            
            <div className="cart-actions">
              <Link href="/checkout" onClick={onClose}>
                <Button className="button-primary w-full">
                  Finalizar Compra
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={onClearCart}>
                Vaciar carrito
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
