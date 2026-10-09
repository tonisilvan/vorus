import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProductsData } from '@/lib/admin-store';
import { getProductCategories } from '@/lib/categories';
import { guides, getGuideBySlug } from '@/data/guides';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ProductGrid } from '@/components/ProductGrid';

const baseUrl = 'https://vorus.es';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: 'Guía no encontrada' };

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guias/${guide.slug}` },
    openGraph: {
      type: 'article',
      locale: 'es_ES',
      url: `/guias/${guide.slug}`,
      title: guide.title,
      description: guide.description,
      siteName: 'Vorus',
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      ...(guide.image
        ? { images: [{ url: `${baseUrl}${guide.image.url}`, alt: guide.image.alt }] }
        : {}),
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const { products } = await getProductsData();
  const categories = getProductCategories(products);
  const relatedProducts = products.filter(p => guide.relatedProductSlugs.includes(p.slug));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Guías', item: `${baseUrl}/guias` },
          { '@type': 'ListItem', position: 3, name: guide.title, item: `${baseUrl}/guias/${guide.slug}` },
        ],
      },
      {
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        mainEntityOfPage: `${baseUrl}/guias/${guide.slug}`,
        author: { '@type': 'Organization', name: 'Vorus', url: baseUrl },
        publisher: { '@type': 'Organization', name: 'Vorus', url: baseUrl },
        ...(guide.image ? { image: `${baseUrl}${guide.image.url}` } : {}),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader categories={categories} />
      <main className="section-shell" style={{ paddingBlock: '3rem 5rem' }}>
        <article className="mx-auto" style={{ maxWidth: '720px' }}>
          <nav aria-label="Migas de pan" className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary">Inicio</Link>
            <span className="mx-2">/</span>
            <Link href="/guias" className="hover:text-primary">Guías</Link>
            <span className="mx-2">/</span>
            <span>{guide.title}</span>
          </nav>

          <span className="eyebrow">Guía Vorus</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mt-4 mb-4">{guide.title}</h1>
          <p className="text-muted-foreground leading-relaxed mb-8">{guide.intro}</p>

          {guide.image && (
            <div className="commerce-panel mb-10 overflow-hidden" style={{ position: 'relative', aspectRatio: '16/9' }}>
              <Image src={guide.image.url} alt={guide.image.alt} fill sizes="720px" style={{ objectFit: 'cover' }} />
            </div>
          )}

          {guide.sections.map((section, index) => (
            <section key={index} className="mb-8">
              <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
              {section.paragraphs.map((paragraph, pIndex) => (
                <p key={pIndex} className="text-muted-foreground leading-relaxed mb-3">{paragraph}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  {section.bullets.map((bullet, bIndex) => (
                    <li key={bIndex}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Productos relacionados</span>
                <h2>Lo que mencionamos en la guía</h2>
              </div>
            </div>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </main>
      <SiteFooter categories={categories} products={products} />
    </div>
  );
}
