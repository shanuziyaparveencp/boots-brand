import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { CartLine } from '../context/CartContext';
import { formatPrice } from '../lib/format';
import QuantityStepper from './QuantityStepper';

interface CartItemProps {
  line: CartLine;
  onQuantityChange: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
}

export default function CartItem({ line, onQuantityChange, onRemove }: CartItemProps) {
  const { item, product, lineTotal } = line;

  return (
    <li className="flex gap-4 py-6 sm:gap-6">
      <Link to={`/boots/${product.slug}`} className="shrink-0 bg-sand">
        <img
          src={product.images[0]}
          alt={product.name}
          width={900}
          height={1125}
          loading="lazy"
          className="h-32 w-24 object-cover sm:h-40 sm:w-32"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              to={`/boots/${product.slug}`}
              className="text-sm font-medium text-ink transition-colors hover:text-clay"
            >
              {product.name}
            </Link>
            <p className="mt-1.5 text-xs text-ink/55">
              Size {item.size} · {item.color}
            </p>
            <p className="mt-1 text-xs text-ink/55">{formatPrice(product.price)} each</p>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.key)}
            className="p-1 text-stone transition-colors hover:text-ink"
            aria-label={`Remove ${product.name} from cart`}
          >
            <X size={17} strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <QuantityStepper
            value={item.quantity}
            onChange={(quantity) => onQuantityChange(item.key, quantity)}
            min={1}
          />
          <span className="text-sm font-medium text-ink">{formatPrice(lineTotal)}</span>
        </div>
      </div>
    </li>
  );
}
