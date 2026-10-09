import { NextResponse } from 'next/server';
import { getProductsData } from '@/lib/admin-store';

export const dynamic = 'force-dynamic';

const baseUrl = 'https://vorus.es';

// Taxonomía de Google por producto (fallback por categoría general).
// Rutas completas en inglés tal como las define Google Product Taxonomy.
const googleCategoriesById: Record<string, string> = {
  'powerbank-vorus-10000': 'Electronics > Electronics Accessories > Power > Batteries > Mobile Phone Batteries',
  'auriculares-bluetooth-53': 'Electronics > Audio > Audio Components > Headphones',
  'estacion-carga-inalambrica-4en1': 'Electronics > Electronics Accessories > Power > Chargers',
  'aspirador-soplador-2en1': 'Home & Garden > Household Appliances > Vacuums',
  'sacacorchos-electrico-recargable': 'Home & Garden > Kitchen & Dining > Barware > Corkscrews',
  'juego-te-ceramica-bandeja': 'Home & Garden > Kitchen & Dining > Tableware',
};

const googleCategoriesByCategory: Record<string, string> = {
  'Electrónica': 'Electronics',
  'Hogar': 'Home & Garden',
  'Accesorios': 'Apparel & Accessories',
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateItemXml(product: any, variant: any): string {
  const mainImage = product.images.find((img: any) => img.type === 'principal') || product.images[0];
  const extraImages = product.images
    .filter((img: any) => img.url !== mainImage?.url)
    .slice(0, 9);
  const googleCategory =
    googleCategoriesById[product.id] ||
    googleCategoriesByCategory[product.category] ||
    product.category;
  const hasVariants = product.variants.length > 1;
  const itemId = hasVariants ? `${product.id}-${variant.reference}` : product.id;

  // Sin GTIN real: enviamos marca + MPN y marcamos identifier_exists=no.
  // Fabricar un GTIN a partir de la referencia provoca rechazos en Merchant Center.
  return `
    <item>
      <g:id>${escapeXml(itemId)}</g:id>
      ${hasVariants ? `<g:item_group_id>${escapeXml(product.id)}</g:item_group_id>` : ''}
      <g:title>${escapeXml(variant.color ? `${product.name} - ${variant.color}` : product.name)}</g:title>
      <g:description>${escapeXml(product.shortDescription)}</g:description>
      <g:link>${baseUrl}/producto/${product.slug}</g:link>
      <g:image_link>${baseUrl}${mainImage.url}</g:image_link>
      ${extraImages.map((img: any) => `<g:additional_image_link>${baseUrl}${img.url}</g:additional_image_link>`).join('\n      ')}
      <g:condition>new</g:condition>
      <g:availability>${variant.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${variant.price.toFixed(2)} EUR</g:price>
      <g:brand>Vorus</g:brand>
      <g:mpn>${escapeXml(variant.reference)}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
      ${variant.color ? `<g:color>${escapeXml(variant.color)}</g:color>` : ''}
      <g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(product.category)}</g:product_type>
      <g:adult>no</g:adult>
      <g:age_group>adult</g:age_group>
      <g:shipping>
        <g:country>ES</g:country>
        <g:price>0.00 EUR</g:price>
      </g:shipping>
      <g:shipping>
        <g:country>PT</g:country>
        <g:price>0.00 EUR</g:price>
      </g:shipping>
    </item>`;
}

function generateProductXml(product: any): string {
  return product.variants.map((variant: any) => generateItemXml(product, variant)).join('');
}

export async function GET() {
  try {
    const { products } = await getProductsData();
    const currentDate = new Date().toISOString();
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vorus Feed</title>
    <link>${baseUrl}</link>
    <description>Catálogo Vorus: electrónica y hogar. Envío gratuito a Península y Portugal peninsular.</description>
    <atom:link href="${baseUrl}/google-shopping-feed" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <language>es</language>
    <g:country>ES</g:country>
    <g:currency>EUR</g:currency>
    
${products.map((product: any) => generateProductXml(product)).join('')}
    
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400', // Cache por 1h, revalidar por 24h
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error generating feed' },
      { status: 500 }
    );
  }
}
