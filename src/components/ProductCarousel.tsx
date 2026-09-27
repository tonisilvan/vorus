'use client';

import { Product } from '@/types/product';
import { ProductCard } from '@/components/ProductCard';

interface ProductCarouselProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductCarousel({ products, onAddToCart }: ProductCarouselProps) {
  return (
    <div className="product-grid" aria-label="Colección de productos Vorus">
      {products.map((product) => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />)}
    </div>
  );
}
