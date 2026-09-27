'use client';

import { useState } from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, X } from 'lucide-react';

interface ProductFormProps {
  initial?: Product;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

interface VariantRow {
  color: string;
  reference: string;
  stock: string;
  price: string;
}

interface ImageRow {
  url: string;
  alt: string;
  type: 'principal' | 'secundaria' | 'lifestyle';
}

interface VideoRow {
  url: string;
  title: string;
}

const inputClass =
  'w-full px-3 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductForm({ initial, onClose, onSaved }: ProductFormProps) {
  const isEdit = Boolean(initial);

  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [category, setCategory] = useState(initial?.category ?? 'Electrónica');
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? '');
  const [longDescription, setLongDescription] = useState(initial?.longDescription ?? '');
  const [highlightPhrase, setHighlightPhrase] = useState(initial?.highlightPhrase ?? '');
  const [ctaButton, setCtaButton] = useState(
    initial?.ctaButton ?? 'Solicitar información / Comprar ahora'
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  const [variants, setVariants] = useState<VariantRow[]>(
    initial?.variants.map(v => ({
      color: v.color ?? '',
      reference: v.reference,
      stock: String(v.stock),
      price: String(v.price),
    })) ?? [{ color: '', reference: '', stock: '0', price: '' }]
  );

  const [images, setImages] = useState<ImageRow[]>(
    initial?.images.map(i => ({ url: i.url, alt: i.alt, type: i.type })) ?? [
      { url: '', alt: '', type: 'principal' },
    ]
  );

  const [videos, setVideos] = useState<VideoRow[]>(
    initial?.videos?.map(v => ({ url: v.url, title: v.title ?? '' })) ?? []
  );

  const [featuresText, setFeaturesText] = useState(
    initial?.features.join('\n') ?? ''
  );
  const [usesText, setUsesText] = useState(
    initial?.recommendedUses.join('\n') ?? ''
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateVariant = (index: number, field: keyof VariantRow, value: string) => {
    setVariants(prev => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const updateImage = (index: number, field: keyof ImageRow, value: string) => {
    setImages(prev =>
      prev.map((img, i) =>
        i === index ? { ...img, [field]: field === 'type' ? (value as ImageRow['type']) : value } : img
      )
    );
  };

  const updateVideo = (index: number, field: keyof VideoRow, value: string) => {
    setVideos(prev => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      name,
      slug: slug.trim() || slugify(name),
      category,
      shortDescription,
      longDescription,
      highlightPhrase,
      ctaButton,
      featured,
      variants: variants.map(v => ({
        color: v.color.trim() || null,
        reference: v.reference.trim(),
        stock: Number(v.stock) || 0,
        price: Number(v.price) || 0,
      })),
      images: images
        .filter(img => img.url.trim() !== '')
        .map(img => ({ url: img.url.trim(), alt: img.alt.trim() || name, type: img.type })),
      videos: videos
        .filter(v => v.url.trim() !== '')
        .map(v => ({ url: v.url.trim(), title: v.title.trim() || undefined })),
      features: featuresText.split('\n').map(l => l.trim()).filter(Boolean),
      recommendedUses: usesText.split('\n').map(l => l.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${initial!.id}` : '/api/admin/products',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar el producto');
      onSaved(data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-full flex items-start justify-center p-4 py-8">
        <div className="relative bg-white dark:bg-zinc-900 border rounded-2xl w-full max-w-3xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-zinc-900 rounded-t-2xl">
            <h2 className="text-lg font-bold">
              {isEdit ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Datos básicos */}
            <section className="space-y-4">
              <h3 className="font-semibold">Datos básicos</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium">Nombre *</label>
                  <input
                    className={inputClass}
                    required
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Slug (URL)</label>
                  <input
                    className={inputClass}
                    value={slug}
                    placeholder={slugify(name)}
                    onChange={e => {
                      setSlug(e.target.value);
                      setSlugTouched(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">/producto/{slug || slugify(name) || '...'}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Categoría</label>
                  <select
                    className={inputClass}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="Electrónica">Electrónica</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium">Descripción corta</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={shortDescription}
                    onChange={e => setShortDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium">Descripción larga</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={4}
                    value={longDescription}
                    onChange={e => setLongDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Frase destacada</label>
                  <input
                    className={inputClass}
                    value={highlightPhrase}
                    onChange={e => setHighlightPhrase(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Texto del botón</label>
                  <input
                    className={inputClass}
                    value={ctaButton}
                    onChange={e => setCtaButton(e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2 sm:col-span-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={e => setFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                  <span className="text-sm font-medium">Producto destacado</span>
                </label>
              </div>
            </section>

            {/* Variantes */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Variantes (precio y stock)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() =>
                    setVariants(prev => [
                      ...prev,
                      { color: '', reference: '', stock: '0', price: '' },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" />
                  Variante
                </Button>
              </div>
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_80px_100px_40px] gap-2 items-center">
                  <input
                    className={inputClass}
                    placeholder="Color (opcional)"
                    value={v.color}
                    onChange={e => updateVariant(i, 'color', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Referencia"
                    value={v.reference}
                    onChange={e => updateVariant(i, 'reference', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={e => updateVariant(i, 'stock', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Precio €"
                    required
                    value={v.price}
                    onChange={e => updateVariant(i, 'price', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={variants.length === 1}
                    onClick={() => setVariants(prev => prev.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </section>

            {/* Imágenes */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Imágenes</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() =>
                    setImages(prev => [...prev, { url: '', alt: '', type: 'secundaria' }])
                  }
                >
                  <Plus className="h-4 w-4" />
                  Imagen
                </Button>
              </div>
              {images.map((img, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_130px_40px] gap-2 items-center">
                  <input
                    className={inputClass}
                    placeholder="/images/ejemplo.webp"
                    value={img.url}
                    onChange={e => updateImage(i, 'url', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Texto alternativo"
                    value={img.alt}
                    onChange={e => updateImage(i, 'alt', e.target.value)}
                  />
                  <select
                    className={inputClass}
                    value={img.type}
                    onChange={e => updateImage(i, 'type', e.target.value)}
                  >
                    <option value="principal">Principal</option>
                    <option value="secundaria">Secundaria</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </section>

            {/* Vídeos */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Vídeos</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setVideos(prev => [...prev, { url: '', title: '' }])}
                >
                  <Plus className="h-4 w-4" />
                  Vídeo
                </Button>
              </div>
              {videos.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Sin vídeos. Añade la ruta de un vídeo en <code>/public/videos/</code> (p. ej. /videos/demo.mp4).
                </p>
              )}
              {videos.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-2 items-center">
                  <input
                    className={inputClass}
                    placeholder="/videos/ejemplo.mp4"
                    value={v.url}
                    onChange={e => updateVideo(i, 'url', e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Título (opcional)"
                    value={v.title}
                    onChange={e => updateVideo(i, 'title', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setVideos(prev => prev.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </section>

            {/* Listas de texto */}
            <section className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Características (una por línea)</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={6}
                  value={featuresText}
                  onChange={e => setFeaturesText(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Usos recomendados (una por línea)</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={6}
                  value={usesText}
                  onChange={e => setUsesText(e.target.value)}
                />
              </div>
            </section>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
