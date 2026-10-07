import { readFileSync, writeFileSync, renameSync } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { del, list, put } from '@vercel/blob';
import { Product, ProductImage, ProductVariant, ProductVideo } from '@/types/product';
import bundledData from '@/data/products.json';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');
const BLOB_PREFIX = 'catalog/products-';

export interface ProductsData {
  products: Product[];
  shippingInfo?: Record<string, unknown>;
  legalInfo?: Record<string, unknown>;
}

function hasBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Devuelve las versiones del catálogo ordenadas de más reciente a más antigua.
 * `list()` va contra la API de control de Vercel Blob, sin caché de CDN.
 */
async function listCatalogVersions() {
  const { blobs } = await list({ prefix: BLOB_PREFIX, limit: 100 });
  return blobs.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

/**
 * Lee el catálogo completo.
 * - En Vercel (con BLOB_READ_WRITE_TOKEN): localiza la última versión del
 *   catálogo via `list()` (control-plane) y la descarga.
 * - Si el blob no existe todavía, siembra desde el JSON empaquetado.
 * - En desarrollo local sin token: lee el fichero src/data/products.json.
 */
export async function getProductsData(): Promise<ProductsData> {
  if (hasBlobStore()) {
    // Cada escritura crea un blob nuevo con URL única: al no haberse pedido
    // nunca, el CDN no puede servir una versión obsoleta.
    const versions = await listCatalogVersions();
    const latest = versions[0];
    if (!latest) {
      // Aún no hay ninguna versión: usar el JSON empaquetado como catálogo inicial.
      return bundledData as unknown as ProductsData;
    }
    const res = await fetch(latest.url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Error leyendo el catálogo: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as ProductsData;
  }
  return JSON.parse(readFileSync(DATA_PATH, 'utf8')) as ProductsData;
}

/**
 * Persiste el catálogo completo.
 * - En Vercel: sobrescribe el blob `products.json` (allowOverwrite).
 * - En desarrollo local sin token: sobrescribe src/data/products.json.
 */
export async function saveProductsData(data: ProductsData): Promise<void> {
  const content = `${JSON.stringify(data, null, 2)}\n`;
  if (hasBlobStore()) {
    const previous = (await listCatalogVersions()).map(b => b.pathname);
    await put(`${BLOB_PREFIX}${Date.now()}.json`, content, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'application/json',
    });
    // Limpieza best-effort de versiones antiguas una vez escrita la nueva.
    if (previous.length > 0) {
      await del(previous).catch(() => {});
    }
    return;
  }
  const tmp = `${DATA_PATH}.tmp`;
  writeFileSync(tmp, content, 'utf8');
  renameSync(tmp, DATA_PATH);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const IMAGE_TYPES = new Set(['principal', 'secundaria', 'lifestyle']);

function toNumber(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(v => typeof v === 'string' && v.trim() !== '').map(v => v.trim());
}

function normalizeVariants(value: unknown): ProductVariant[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(v => ({
      color: v?.color ? String(v.color) : null,
      reference: String(v?.reference ?? ''),
      stock: Math.max(0, Math.trunc(toNumber(v?.stock, 0))),
      price: Math.max(0, toNumber(v?.price, 0)),
      currency: 'EUR',
      priceNote: v?.priceNote ? String(v.priceNote) : 'IVA incluido',
    }))
    .filter(v => v.price > 0);
}

function normalizeImages(value: unknown): ProductImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(img => ({
      url: String(img?.url ?? '').trim(),
      alt: String(img?.alt ?? '').trim(),
      type: (IMAGE_TYPES.has(img?.type) ? img.type : 'secundaria') as ProductImage['type'],
    }))
    .filter(img => img.url !== '');
}

function normalizeVideos(value: unknown): ProductVideo[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(v => ({
      url: String(v?.url ?? '').trim(),
      title: v?.title ? String(v.title) : undefined,
    }))
    .filter(v => v.url !== '');
}

export function normalizeProduct(
  input: Record<string, unknown>,
  existing?: Product
): { product?: Product; error?: string } {
  const name = String(input?.name ?? '').trim();
  if (!name) return { error: 'El nombre es obligatorio' };

  const slug = String(input?.slug ?? '').trim() || slugify(name);
  if (!slug) return { error: 'No se pudo generar un slug válido' };

  const variants = normalizeVariants(input?.variants);
  if (variants.length === 0) return { error: 'El producto necesita al menos una variante con precio' };

  const now = new Date().toISOString();
  const videos = normalizeVideos(input?.videos);

  const product: Product = {
    id: existing?.id ?? randomUUID(),
    name,
    slug,
    shortDescription: String(input?.shortDescription ?? '').trim(),
    longDescription: String(input?.longDescription ?? '').trim(),
    highlightPhrase: String(input?.highlightPhrase ?? '').trim(),
    ctaButton: String(input?.ctaButton ?? 'Solicitar información / Comprar ahora').trim(),
    category: String(input?.category ?? 'General').trim() || 'General',
    variants,
    features: toStringArray(input?.features),
    recommendedUses: toStringArray(input?.recommendedUses),
    images: normalizeImages(input?.images),
    ...(videos.length > 0 ? { videos } : {}),
    featured: Boolean(input?.featured),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  return { product };
}
