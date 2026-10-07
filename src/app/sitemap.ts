import { MetadataRoute } from 'next';
import { getProductsData } from '@/lib/admin-store';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vorus.es';
  const { products } = await getProductsData();

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/producto/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productUrls,
  ];
}
