'use client';

import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/ProductCard';

export function ProductGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} onAddToCart={addItem} />
      ))}
    </div>
  );
}
