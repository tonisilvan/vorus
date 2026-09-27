import { readFileSync, writeFileSync, renameSync } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { Product, ProductImage, ProductVariant, ProductVideo } from '@/types/product';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');

export interface ProductsData {
  products: Product[];
  shippingInfo?: Record<string, unknown>;
  legalInfo?: Record<string, unknown>;
}

export function readProductsFile(): ProductsData {
  return JSON.parse(readFileSync(DATA_PATH, 'utf8'));
}

export function writeProductsFile(data: ProductsData): void {
  const tmp = `${DATA_PATH}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
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
