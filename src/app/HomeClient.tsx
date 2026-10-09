'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Headphones, ShieldCheck, Truck, Zap } from 'lucide-react';
import { ProductCarousel } from '@/components/ProductCarousel';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ShippingSeal } from '@/components/ShippingSeal';
import { getProductCategories } from '@/lib/categories';

const baseUrl = 'https://vorus.es';

export default function HomeClient({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  const categories = getProductCategories(products);

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
      <SiteHeader categories={categories} />

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-image"><Image src="/images/powerbank-principal-cable.webp" alt="Power Bank Vorus con cable múltiple y carga inalámbrica" fill priority sizes="(max-width: 760px) 100vw, 76vw" /></div>
          <ShippingSeal />
          <div className="hero-inner">
            <div className="hero-copy">
              <span className="eyebrow">Diseño exclusivo. Calidad premium.</span>
              <h1 className="hero-title" id="hero-title">Todo lo que<br />te mueve. <em>Mejor.</em></h1>
              <p className="hero-description">Piezas de diseño exclusivo seleccionadas por Vorus: tecnología premium para acompañarte en casa, en el trabajo y en cada trayecto.</p>
              <div className="hero-actions">
                <a className="button-primary" href="#coleccion">Descubre la colección <ArrowRight size={17} /></a>
                <Link className="hero-link" href="/producto/power-bank-vorus-10000-mah">Conoce el Power Bank</Link>
              </div>
              <div className="hero-meta">
                <span><Truck size={17} /> Envío gratuito</span><span><ShieldCheck size={17} /> Garantía incluida</span><span><Zap size={17} /> Diseño exclusivo Vorus</span>
              </div>
            </div>
          </div>
        </section>

        <section className="collection" id="coleccion">
          <div className="section-shell">
            <div className="section-heading">
              <div><span className="eyebrow">La colección Vorus</span><h2>Menos cosas.<br />Mejores elecciones.</h2></div>
              <p>Una colección corta y exclusiva: diseño premium, acabados cuidados y nada de relleno. Diseñados para resolver, hechos para durar.</p>
            </div>
            <ProductCarousel products={products} onAddToCart={addItem} />
          </div>
        </section>

        <section className="trust-section" id="compromiso">
          <div className="section-shell trust-grid">
            <article className="trust-item"><Truck size={22} /><h3>Envío a nuestro cargo</h3><p>Envío gratuito en todos los pedidos a la Península y Portugal peninsular.</p></article>
            <article className="trust-item"><ShieldCheck size={22} /><h3>Diseño premium garantizado</h3><p>Productos exclusivos con garantía y atención cercana antes y después de tu compra.</p></article>
            <article className="trust-item"><Headphones size={22} /><h3>Personas al otro lado</h3><p>¿Tienes una duda? Nuestro equipo está aquí para ayudarte a elegir.</p></article>
          </div>
        </section>
      </main>

      <SiteFooter categories={categories} products={products} />
    </div>
  );
}
