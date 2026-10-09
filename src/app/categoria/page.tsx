import { Metadata } from 'next';
import Link from 'next/link';
import { getProductsData } from '@/lib/admin-store';
import { getProductCategories } from '@/lib/categories';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Categorías de productos',
  description: 'Explora las categorías de Vorus: electrónica práctica y productos para el hogar. Envío gratuito a Península y Portugal.',
  alternates: { canonical: '/categoria' },
};

export default async function CategoriesPage() {
  const { products } = await getProductsData();
  const categories = getProductCategories(products);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader categories={categories} />
      <main className="section-shell" style={{ paddingBlock: '3rem 5rem' }}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Catálogo</span>
            <h1>Categorías</h1>
          </div>
          <p>Todas las familias de productos de Vorus en un solo lugar.</p>
        </div>
        <div className="product-grid">
          {categories.map(category => {
            const count = products.filter(p => p.category === category.name).length;
            return (
              <article key={category.slug} className="commerce-panel p-6">
                <span className="product-card-category">{count} {count === 1 ? 'producto' : 'productos'}</span>
                <h2 className="product-card-title" style={{ marginTop: '.6rem' }}>{category.name}</h2>
                <p className="product-card-copy" style={{ minHeight: 'auto' }}>{category.description}</p>
                <Link href={`/categoria/${category.slug}`} className="button-primary" style={{ marginTop: '1.2rem', minHeight: '44px' }}>
                  Ver {category.name}
                </Link>
              </article>
            );
          })}
        </div>
      </main>
      <SiteFooter categories={categories} products={products} />
    </div>
  );
}
