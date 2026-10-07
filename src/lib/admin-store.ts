import { readFileSync, writeFileSync, renameSync } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';
import { del, list, put } from '@vercel/blob';
import { Product, ProductImage, ProductVariant, ProductVideo } from '@/types/product';
import { Order, OrderStatus, ORDER_STATUSES } from '@/types/order';
import bundledData from '@/data/products.json';

const PRODUCTS_PATH = path.join(process.cwd(), 'src', 'data', 'products.json');
const ORDERS_PATH = path.join(process.cwd(), 'src', 'data', 'orders.json');
const PRODUCTS_BLOB_PREFIX = 'catalog/products-';
const ORDERS_BLOB_PREFIX = 'orders/orders-';

export interface ProductsData {
  products: Product[];
  shippingInfo?: Record<string, unknown>;
  legalInfo?: Record<string, unknown>;
}

function hasBlobStore(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Devuelve las versiones de un prefijo ordenadas de más reciente a más antigua.
 * `list()` va contra la API de control de Vercel Blob, sin caché de CDN.
 */
async function listVersions(prefix: string) {
  const { blobs } = await list({ prefix, limit: 100 });
  return blobs.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

/**
 * Lee un documento JSON versionado:
 * - En Vercel: localiza la última versión via `list()` (control-plane) y la
 *   descarga. La URL es nueva en cada escritura, así que el CDN nunca sirve
 *   datos obsoletos. Si aún no hay versiones, devuelve `seed`.
 * - En local sin token: lee `filePath` (o `seed` si el fichero no existe).
 */
async function readVersionedJson<T>(prefix: string, filePath: string, seed: T): Promise<T> {
  if (hasBlobStore()) {
    const latest = (await listVersions(prefix))[0];
    if (!latest) return seed;
    const res = await fetch(latest.url, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Error leyendo ${prefix}: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T;
  } catch {
    return seed;
  }
}

/**
 * Persiste un documento JSON como una nueva versión:
 * - En Vercel: crea un blob nuevo (URL única e inmutable) y borra las
 *   versiones anteriores de forma best-effort.
 * - En local: escritura atómica en `filePath` vía tmp + rename.
 */
async function writeVersionedJson(prefix: string, filePath: string, data: unknown): Promise<void> {
  const content = `${JSON.stringify(data, null, 2)}\n`;
  if (hasBlobStore()) {
    const previous = (await listVersions(prefix)).map(b => b.pathname);
    await put(`${prefix}${Date.now()}.json`, content, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'application/json',
    });
    if (previous.length > 0) {
      await del(previous).catch(() => {});
    }
    return;
  }
  const tmp = `${filePath}.tmp`;
  writeFileSync(tmp, content, 'utf8');
  renameSync(tmp, filePath);
}

/**
 * Lee el catálogo completo. Si el blob no existe todavía, siembra desde el
 * JSON empaquetado.
 */
export async function getProductsData(): Promise<ProductsData> {
  return readVersionedJson(
    PRODUCTS_BLOB_PREFIX,
    PRODUCTS_PATH,
    bundledData as unknown as ProductsData
  );
}

export async function saveProductsData(data: ProductsData): Promise<void> {
  return writeVersionedJson(PRODUCTS_BLOB_PREFIX, PRODUCTS_PATH, data);
}

export interface OrdersData {
  orders: Order[];
}

const EMPTY_ORDERS: OrdersData = { orders: [] };

export async function getOrdersData(): Promise<OrdersData> {
  return readVersionedJson(ORDERS_BLOB_PREFIX, ORDERS_PATH, EMPTY_ORDERS);
}

export async function saveOrdersData(data: OrdersData): Promise<void> {
  return writeVersionedJson(ORDERS_BLOB_PREFIX, ORDERS_PATH, data);
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

const MAX_FIELD = 200;

function cleanString(value: unknown, max = MAX_FIELD): string {
  return String(value ?? '').trim().slice(0, max);
}

/**
 * Valida y construye un pedido a partir del body del checkout.
 * Los importes se recalculan SIEMPRE desde el catálogo: el precio enviado por
 * el cliente se ignora para evitar manipulación.
 */
export function normalizeOrder(
  input: Record<string, unknown>,
  catalog: Product[]
): { order?: Order; error?: string } {
  const c = (input?.customer ?? {}) as Record<string, unknown>;
  const s = (input?.shipping ?? {}) as Record<string, unknown>;

  const customer = {
    nombre: cleanString(c.nombre, 100),
    apellidos: cleanString(c.apellidos, 100),
    email: cleanString(c.email, 100),
    telefono: cleanString(c.telefono, 40),
  };
  if (!customer.nombre || !customer.apellidos) {
    return { error: 'Nombre y apellidos son obligatorios' };
  }
  if (!customer.email || !customer.email.includes('@')) {
    return { error: 'Email no válido' };
  }
  if (!customer.telefono) {
    return { error: 'El teléfono es obligatorio' };
  }

  const shipping = {
    direccion: cleanString(s.direccion),
    codigoPostal: cleanString(s.codigoPostal, 10),
    ciudad: cleanString(s.ciudad, 100),
    provincia: cleanString(s.provincia, 100),
    pais: cleanString(s.pais, 100) || 'España',
    notas: cleanString(s.notas, 500),
  };
  if (!shipping.direccion || !shipping.codigoPostal || !shipping.ciudad || !shipping.provincia) {
    return { error: 'La dirección de envío está incompleta' };
  }

  const rawItems = Array.isArray(input?.items) ? input.items : [];
  if (rawItems.length === 0) return { error: 'El pedido no contiene productos' };
  if (rawItems.length > 50) return { error: 'Demasiados productos en el pedido' };

  const items: Order['items'] = [];
  for (const raw of rawItems) {
    const productId = String(raw?.productId ?? '');
    const quantity = Math.min(99, Math.max(0, Math.trunc(toNumber(raw?.quantity, 0))));
    const product = catalog.find(p => p.id === productId);
    if (!product || quantity === 0) continue;
    items.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.variants[0]?.price ?? 0,
      quantity,
    });
  }
  if (items.length === 0) {
    return { error: 'Ningún producto del pedido existe en el catálogo' };
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (total <= 0) return { error: 'El total del pedido no es válido' };

  const now = new Date().toISOString();
  const order: Order = {
    id: randomUUID(),
    customer,
    shipping,
    items,
    subtotal: total / 1.21,
    tax: total - total / 1.21,
    shippingCost: 0,
    total,
    status: 'pendiente',
    createdAt: now,
    updatedAt: now,
  };

  return { order };
}

export function isValidOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && ORDER_STATUSES.includes(value as OrderStatus);
}
