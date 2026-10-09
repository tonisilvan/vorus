import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getProductsData } from '@/lib/admin-store';
import { getProductCategories } from '@/lib/categories';
import { guides } from '@/data/guides';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'Guías y consejos',
  description: 'Guías prácticas de Vorus: limpieza de ordenadores, viajar con power bank, elegir un juego de té y más consejos útiles.',
  alternates: { canonical: '/guias' },
};

export default async function GuidesPage() {
  const { products } = await getProductsData();
  const categories = getProductCategories(products);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader categories={categories} />
      <main className="section-shell" style={{ paddingBlock: '3rem 5rem' }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Guías Vorus</span>
            <h1>Consejos que sí sirven</h1>
          </div>
          <p>Guías prácticas escritas para resolver dudas reales, no para rellenar.</p>
        </div>
        <div className="product-grid">
          {guides.map(guide => (
            <article key={guide.slug} className="product-card">
              <Link href={`/guias/${guide.slug}`} className="product-card-media" aria-label={`Leer ${guide.title}`}>
                {guide.image && (
                  <Image src={guide.image.url} alt={guide.image.alt} fill sizes="(max-width: 760px) 48vw, (max-width: 1100px) 31vw, 440px" />
                )}
                <span className="product-card-tag">Guía</span>
              </Link>
              <div className="product-card-body">
                <Link href={`/guias/${guide.slug}`} className="product-card-title">{guide.title}</Link>
                <p className="product-card-copy">{guide.description}</p>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter categories={categories} products={products} />
    </div>
  );
}
