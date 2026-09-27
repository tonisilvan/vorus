import products from '../src/data/products.json' with { type: 'json' };
import { writeFileSync } from 'fs';

const baseUrl = 'https://vorus.es';

// Google Product Categories (mapeo de categorías)
const googleCategories = {
  'Electrónica': 'Electronics',
  'Hogar': 'Home & Garden',
  'Accesorios': 'Apparel & Accessories'
};

function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateProductXml(product) {
  const variant = product.variants[0]; // Usamos la primera variante
  const mainImage = product.images.find(img => img.type === 'principal') || product.images[0];
  const googleCategory = googleCategories[product.category] || product.category;
  
  // Generar GTIN (usamos el reference como identificador único)
  const gtin = variant.reference.replace(/[^0-9]/g, '').padStart(13, '0').slice(0, 13);
  
  return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(product.shortDescription)}</g:description>
      <g:link>${baseUrl}/producto/${product.slug}</g:link>
      <g:image_link>${baseUrl}${mainImage.url}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${variant.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>
      <g:price>${variant.price.toFixed(2)} EUR</g:price>
      <g:brand>Vorus</g:brand>
      <g:gtin>${gtin}</g:gtin>
      <g:mpn>${escapeXml(variant.reference)}</g:mpn>
      <g:product_category>${escapeXml(googleCategory)}</g:product_category>
      <g:identifier_exists>TRUE</g:identifier_exists>
      <g:adult>FALSE</g:adult>
      <g:age_group>adult</g:age_group>
      <g:gender>unisex</g:gender>
      <g:shipping_weight>0.5 kg</g:shipping_weight>
      <g:shipping_label>Envío gratuito</g:shipping_label>
    </item>`;
}

function generateFeed() {
  const currentDate = new Date().toISOString();
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Vorus Feed</title>
    <link>${baseUrl}</link>
    <description>Productos tecnológicos y accesorios de alta calidad</description>
    <atom:link href="${baseUrl}/google-shopping-feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <language>es</language>
    <g:country>ES</g:country>
    <g:currency>EUR</g:currency>
    
${products.products.map(product => generateProductXml(product)).join('')}
    
  </channel>
</rss>`;

  return xml;
}

// Generar y guardar el feed
const feed = generateFeed();
console.log('✅ Google Shopping Feed generado');
console.log('📊 Total productos:', products.products.length);
console.log('📂 Guardar como: public/google-shopping-feed.xml');
console.log('\n📋 Para configurar en Google Merchant Center:');
console.log('1. Ve a https://merchants.google.com/');
console.log('2. Cuenta y verifica tu negocio');
console.log('3. Sube este archivo XML');
console.log('4. Configura la actualización automática cada 24h');

// Guardar en archivo
writeFileSync('public/google-shopping-feed.xml', feed, 'utf8');
