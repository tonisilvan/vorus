'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Truck } from 'lucide-react';
import { AuthMenu } from '@/components/AuthMenu';
import { useCart } from '@/context/CartContext';
import type { CategoryInfo } from '@/lib/categories';

interface SiteHeaderProps {
  categories?: CategoryInfo[];
}

export function SiteHeader({ categories = [] }: SiteHeaderProps) {
  const { openCart, cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const close = () => setMobileMenuOpen(false);

  return (
    <>
      <div className="announcement-bar">
        <Truck size={14} />
        <span>Envío gratuito e IVA incluido en todos los pedidos</span>
      </div>
      <header className="site-header">
      <div className="site-header-inner">
        <Link className="wordmark" href="/" aria-label="Vorus, inicio">VOR<span>U</span>S</Link>
        <nav className={`header-links${mobileMenuOpen ? ' is-open' : ''}`} aria-label="Navegación principal">
          {categories.map(category => (
            <Link key={category.slug} href={`/categoria/${category.slug}`} onClick={close}>
              {category.name}
            </Link>
          ))}
          <Link href="/guias" onClick={close}>Guías</Link>
          <Link href="/contacto" onClick={close}>Contacto</Link>
        </nav>
        <div className="header-actions">
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}>{mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          <AuthMenu />
          <button className="cart-trigger" onClick={openCart} aria-label={`Abrir carrito, ${cartCount} productos`}>
            <span>Carrito</span><span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </div>
      </header>
    </>
  );
}
