import type { Product } from '../types/product';
import ProductCard from './ProductCard';
import { cn } from '../lib/format';

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export default function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8',
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
