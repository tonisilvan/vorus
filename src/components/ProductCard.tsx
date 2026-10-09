'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import { Product } from '@/types/product';
import { analyticsEvents, isGAReady } from '@/lib/analytics';

interface ProductCardProps { product: Product; onAddToCart: (product: Product) => void; }

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const image = product.images.find((item) => item.type === 'principal') || product.images[0];
  const price = Math.min(...product.variants.map((variant) => variant.price));
  const stock = product.variants.reduce((total, variant) => total + variant.stock, 0);
  return (
    <article className="product-card">
      <Link href={`/producto/${product.slug}`} className="product-card-media" aria-label={`Ver ${product.name}`}>
        {image && <Image src={image.url} alt={image.alt} fill sizes="(max-width: 760px) 48vw, (max-width: 1100px) 31vw, 440px" />}
        <span className="product-card-tag">{product.featured ? 'Selección premium' : product.category}</span>
        <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-foreground"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <Link href={`/producto/${product.slug}`} className="product-card-title">{product.name}</Link>
        <p className="product-card-copy">{product.highlightPhrase}</p>
        <div className="product-card-bottom">
          <span><span className="product-price">{price.toFixed(2)} €</span><span className="product-tax">IVA y envío incluidos</span></span>
          <button className="product-add" onClick={() => { onAddToCart(product); if (isGAReady()) analyticsEvents.addToCart(product.name, product.id, price, 1); }} disabled={stock === 0} aria-label={`Añadir ${product.name} al carrito`}><ShoppingBag size={15} /><span>Añadir</span></button>
        </div>
      </div>
    </article>
  );
}
