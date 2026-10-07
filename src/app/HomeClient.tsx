'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Menu, X, Headphones, ShieldCheck, Truck, Zap } from 'lucide-react';
import { ProductCarousel } from '@/components/ProductCarousel';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';

const baseUrl = 'https://vorus.es';

export default function HomeClient({ products }: { products: Product[] }) {
  const { addItem, openCart, cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${baseUrl}/#organization`, name: 'Vorus', url: baseUrl, logo: `${baseUrl}/images/powerbank-principal-cable.webp` },
      { '@type': 'WebSite', '@id': `${baseUrl}/#website`, url: baseUrl, name: 'Vorus', publisher: { '@id': `${baseUrl}/#organization` } },
      { '@type': 'ItemList', itemListElement: products.map((product, index) => ({ '@type': 'ListItem', position: index + 1, url: `${baseUrl}/producto/${product.slug}`, name: product.name })) },
    ],
  };
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="site-header">
        <div className="site-header-inner">
          <Link className="wordmark" href="/" aria-label="Vorus, inicio">VOR<span>U</span>S</Link>
          <nav className={`header-links${mobileMenuOpen ? ' is-open' : ''}`} aria-label="Navegación principal">
            <a href="#coleccion" onClick={() => setMobileMenuOpen(false)}>Colección</a><a href="#compromiso" onClick={() => setMobileMenuOpen(false)}>Nuestro compromiso</a><a href="mailto:info@vorus.es">Contacto</a>
          </nav>
          <div className="header-actions">
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}>{mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          <button className="cart-trigger" onClick={openCart} aria-label={`Abrir carrito, ${cartCount} productos`}>
            <span>Carrito</span><span className="cart-count">{cartCount}</span>
          </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image"><Image src="/images/powerbank-principal-cable.webp" alt="Power Bank Vorus con cable múltiple y carga inalámbrica" fill priority sizes="(max-width: 760px) 100vw, 76vw" /></div>
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="eyebrow">Diseño útil. Tecnología cercana.</span>
              <h1 className="hero-title" id="hero-title">Todo lo que<br />te mueve. <em>Mejor.</em></h1>
              <p className="hero-description">Una selección precisa de tecnología para acompañarte en casa, en el trabajo y en cada trayecto.</p>
              <div className="hero-actions">
                <a className="button-primary" href="#coleccion">Descubre la colección <ArrowRight size={17} /></a>
                <Link className="hero-link" href="/producto/power-bank-vorus-10000-mah">Conoce el Power Bank</Link>
              </div>
              <div className="hero-meta">
                <span><Truck size={17} /> Envío gratuito</span><span><ShieldCheck size={17} /> Garantía incluida</span><span><Zap size={17} /> Selección Vorus</span>
              </div>
            </div>
          </div>
        </section>

        <section className="collection" id="coleccion">
          <div className="section-shell">
            <div className="section-heading">
              <div><span className="eyebrow">La colección Vorus</span><h2>Menos cosas.<br />Mejores elecciones.</h2></div>
              <p>Seis esenciales para vivir la tecnología de forma más sencilla. Diseñados para resolver, hechos para durar.</p>
            </div>
            <ProductCarousel products={products} onAddToCart={addItem} />
          </div>
        </section>

        <section className="trust-section" id="compromiso">
          <div className="section-shell trust-grid">
            <article className="trust-item"><Truck size={22} /><h3>Envío a nuestro cargo</h3><p>Envío gratuito en todos los pedidos a la Península y Portugal peninsular.</p></article>
            <article className="trust-item"><ShieldCheck size={22} /><h3>Compra con confianza</h3><p>Productos con garantía y atención cercana antes y después de tu compra.</p></article>
            <article className="trust-item"><Headphones size={22} /><h3>Personas al otro lado</h3><p>¿Tienes una duda? Nuestro equipo está aquí para ayudarte a elegir.</p></article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-shell">
          <div className="footer-grid">
            <div className="footer-brand"><Link className="wordmark" href="/" aria-label="Vorus, inicio">VOR<span>U</span>S</Link><p>Tecnología bien pensada para hacer mejor cada día. Una selección cuidada por Vorus.</p></div>
            <div className="footer-column"><h2>Explora</h2><a href="#coleccion">Colección completa</a><Link href="/producto/power-bank-vorus-10000-mah">Power Bank Vorus</Link><a href="mailto:info@vorus.es">Atención al cliente</a></div>
            <div className="footer-column"><h2>Información</h2><a href="/aviso-legal">Aviso legal</a><a href="/aviso-legal">Envíos y devoluciones</a><a href="/aviso-legal">Privacidad y condiciones</a></div>
            <div className="footer-column"><h2>Hablemos</h2><a href="mailto:info@vorus.es">info@vorus.es</a><p>Gijón · Asturias · España</p></div>
          </div>
          <div className="footer-bottom"><span>© 2026 Vorus · Suministros Payne, SLU · CIF B42782300</span><span>Precios con IVA incluido · Envío gratuito Península y Portugal</span></div>
        </div>
      </footer>
    </div>
  );
}
