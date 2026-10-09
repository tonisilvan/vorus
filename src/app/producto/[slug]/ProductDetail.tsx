'use client';

import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft, ChevronLeft, ChevronRight, Check, Truck, Shield, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { analyticsEvents, isGAReady } from '@/lib/analytics';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addItem, openCart, cartCount } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
    setSelectedImageIndex(index);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedImageIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  // Analytics event for viewing product
  useEffect(() => {
    if (isGAReady()) {
      analyticsEvents.viewItem(
        product.name,
        product.id,
        product.variants[0].price
      );
    }
  }, [product]);

  const variant = product.variants[selectedVariant];
  const mainImage = product.images.find(img => img.type === 'principal') || product.images[0];

  return (
    <>
      {/* Header */}
      <header className="site-header">
        <div className="site-header-inner">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a productos</span>
            <span className="sm:hidden">Volver</span>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 relative"
            onClick={openCart}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      <main className="product-page section-shell">
        <div className="product-detail-grid">
          
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="product-gallery-main" ref={emblaRef}>
              <div className="flex">
                {product.images.map((img, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 relative aspect-square">
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => emblaApi?.scrollPrev()}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => emblaApi?.scrollNext()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-all"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Miniaturas del producto">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    role="tab"
                    aria-selected={index === selectedImageIndex}
                    aria-label={img.alt}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Videos */}
            {product.videos && product.videos.length > 0 && (
              <div className="space-y-3 pt-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Vídeo del producto
                </h2>
                {product.videos.map((video, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-black shadow-lg">
                    <video
                      src={video.url}
                      title={video.title || product.name}
                      controls
                      playsInline
                      preload="none"
                      poster={mainImage?.url}
                      className="w-full aspect-video"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-information">
            <div className="product-intro">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline" className="border-primary/40 text-primary">Diseño exclusivo</Badge>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                {product.name}
              </h1>
              <p className="text-lg text-primary font-medium italic">
                {product.highlightPhrase}
              </p>
            </div>

            <div className="product-price-panel">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-bold text-primary">
                  {variant.price.toFixed(2)} €
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600/10 text-green-700 dark:text-green-500 px-3 py-1 text-xs font-semibold">
                  <Truck className="h-3.5 w-3.5" />
                  IVA y envío incluidos
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sin costes ocultos: el precio que ves es el precio final.
              </p>
              <p className="text-sm text-muted-foreground">
                Ref: {variant.reference} · Stock: {variant.stock} unidades
              </p>
            </div>

            {product.variants.length > 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Color:</label>
                <div className="flex gap-2">
                  {product.variants.map((v, i) => (
                    <Button
                      key={i}
                      variant={selectedVariant === i ? "default" : "outline"}
                      onClick={() => setSelectedVariant(i)}
                      className="gap-2"
                    >
                      {selectedVariant === i && <Check className="h-4 w-4" />}
                      {v.color || `Variante ${i + 1}`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Descripción</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.longDescription}
              </p>
            </div>

            <div className="product-purchase">
              <Button 
                size="lg" 
                className="button-primary w-full"
                disabled={variant.stock === 0}
                onClick={() => addItem(product)}
              >
                <ShoppingCart className="h-5 w-5" />
                Añadir al carrito
              </Button>
            </div>

            <div className="product-promises">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-green-600" />
                <span>Envío gratuito</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Garantía incluida</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-600" />
                <span>Stock disponible</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-lg font-semibold">Características principales</h2>
              <ul className="space-y-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-lg font-semibold">Usos recomendados</h2>
              <ul className="space-y-2">
                {product.recommendedUses.map((use, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold">·</span>
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
