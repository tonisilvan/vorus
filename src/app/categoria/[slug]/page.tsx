import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductsData } from '@/lib/admin-store';
import { getCategoryInfo } from '@/lib/categories';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ProductGrid } from '@/components/ProductGrid';

const baseUrl = 'https://vorus.es';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function resolveCategory(slug: string) {
  const { products } = await getProductsData();
  const names = [...new Set(products.map(p => p.category))];
  const name = names.find(n => getCategoryInfo(n).slug === slug);
  if (!name) return null;
  const info = getCategoryInfo(name);
  const categoryProducts = products.filter(p => p.category === name);
  const allCategories = names.map(getCategoryInfo);
  return { info, categoryProducts, allCategories, products };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolveCategory(slug);
  if (!resolved) return { title: 'Categoría no encontrada' };
  const { info, categoryProducts } = resolved;
  const image = categoryProducts[0]?.images.find(i => i.type === 'principal') ?? categoryProducts[0]?.images[0];

  return {
    title: info.title,
    description: info.description,
    alternates: { canonical: `/categoria/${info.slug}` },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: `/categoria/${info.slug}`,
      title: info.title,
      description: info.description,
      siteName: 'Vorus',
      ...(image ? { images: [{ url: `${baseUrl}${image.url}`, alt: image.alt }] } : {}),
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolveCategory(slug);
  if (!resolved) notFound();
  const { info, categoryProducts, allCategories, products } = resolved;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Categorías', item: `${baseUrl}/categoria` },
          { '@type': 'ListItem', position: 3, name: info.name, item: `${baseUrl}/categoria/${info.slug}` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: info.title,
        description: info.description,
        url: `${baseUrl}/categoria/${info.slug}`,
      },
      {
        '@type': 'ItemList',
        itemListElement: categoryProducts.map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${baseUrl}/producto/${product.slug}`,
          name: product.name,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader categories={allCategories} />
      <main className="section-shell" style={{ paddingBlock: '3rem 5rem' }}>
        <nav aria-label="Migas de pan" className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/categoria" className="hover:text-primary">Categorías</Link>
          <span className="mx-2">/</span>
          <span>{info.name}</span>
        </nav>
        <div className="section-heading">
          <div>
            <span className="eyebrow">Categoría</span>
            <h1>{info.title}</h1>
          </div>
          <p>{info.description}</p>
        </div>
        <ProductGrid products={categoryProducts} />
      </main>
      <SiteFooter categories={allCategories} products={products} />
    </div>
  );
}
