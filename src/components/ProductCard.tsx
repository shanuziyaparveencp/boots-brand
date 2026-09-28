import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { formatPrice } from '../lib/format';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="group">
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="overflow-hidden bg-sand">
          <img
            src={product.images[0]}
            alt={product.name}
            width={900}
            height={1125}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div className="pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-medium text-ink">{product.name}</h3>
            <span className="shrink-0 text-sm text-ink">{formatPrice(product.price)}</span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink/55">
            {product.description}
          </p>
          <span className="mt-3 inline-block border-b border-ink/30 pb-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors group-hover:border-ink">
            View Product
          </span>
        </div>
      </Link>
    </article>
  );
}
