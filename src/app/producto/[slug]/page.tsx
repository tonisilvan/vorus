import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '@/data/products';
import { ProductDetail } from './ProductDetail';

const baseUrl = 'https://vorus.es';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find(p => p.slug === slug);

  if (!product) return { title: 'Producto no encontrado' };

  const mainImage = product.images.find(img => img.type === 'principal') || product.images[0];

  return {
    title: product.name,
    description: product.shortDescription,
    keywords: [product.name, product.category, 'Vorus', 'comprar', ...product.features.slice(0, 3)],
    alternates: {
      canonical: `/producto/${product.slug}`,
    },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: `/producto/${product.slug}`,
      title: product.name,
      description: product.shortDescription,
      siteName: 'Vorus',
      images: product.images.map(img => ({
        url: `${baseUrl}${img.url}`,
        width: 1000,
        height: 1000,
        alt: img.alt,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.highlightPhrase,
      images: [`${baseUrl}${mainImage?.url}`],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find(p => p.slug === slug);

  if (!product) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription,
    image: product.images.map(img => `${baseUrl}${img.url}`),
    brand: {
      '@type': 'Brand',
      name: 'Vorus',
    },
    offers: product.variants.map(variant => ({
      '@type': 'Offer',
      url: `${baseUrl}/producto/${product.slug}`,
      priceCurrency: 'EUR',
      price: variant.price.toFixed(2),
      availability: variant.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Vorus',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'EUR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: ['ES', 'PT'],
        },
      },
    })),
    sku: product.variants[0].reference,
    category: product.category,
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </div>
  );
}
