import { Product } from '@/types/product';
import { slugify } from '@/lib/utils';

export interface CategoryInfo {
  slug: string;
  name: string;
  title: string;
  description: string;
}

const categoryMeta: Record<string, Omit<CategoryInfo, 'slug' | 'name'>> = {
  'electronica': {
    title: 'Electrónica práctica para el día a día',
    description:
      'Power banks, auriculares Bluetooth, cargadores inalámbricos y accesorios para tu móvil, ordenador y escritorio. Precios con IVA y envío gratuito a Península y Portugal.',
  },
  'hogar': {
    title: 'Hogar: detalles que se disfrutan',
    description:
      'Sacacorchos eléctricos, juegos de té de cerámica y piezas pensadas para la mesa y la casa. Precios con IVA y envío gratuito a Península y Portugal.',
  },
};

/** Genera la info SEO de una categoría a partir del nombre usado en el catálogo. */
export function getCategoryInfo(categoryName: string): CategoryInfo {
  const slug = slugify(categoryName);
  const meta = categoryMeta[slug];
  return {
    slug,
    name: categoryName,
    title: meta?.title ?? `${categoryName} | Tienda online Vorus`,
    description:
      meta?.description ??
      `Compra ${categoryName.toLowerCase()} online en Vorus. Precios con IVA incluido y envío gratuito a Península y Portugal.`,
  };
}

/** Lista única de categorías presentes en el catálogo, ordenadas por nombre. */
export function getProductCategories(products: Product[]): CategoryInfo[] {
  const seen = new Map<string, CategoryInfo>();
  for (const product of products) {
    if (!product.category) continue;
    const info = getCategoryInfo(product.category);
    if (!seen.has(info.slug)) seen.set(info.slug, info);
  }
  return [...seen.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}
