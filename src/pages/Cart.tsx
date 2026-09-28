import { Link } from 'react-router-dom';
import CartItem from '../components/CartItem';
import { useCart } from '../hooks/useCart';
import { FREE_SHIPPING_THRESHOLD } from '../context/CartContext';
import { formatPrice } from '../lib/format';

export default function Cart() {
  const { lines, itemCount, subtotal, shipping, total, setQuantity, removeItem } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container-site py-24 text-center sm:py-32">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your Cart</h1>
        <p className="mt-4 text-sm text-ink/60">Your cart is empty.</p>
        <Link to="/boots" className="btn-primary mt-8">
          Shop Boots
        </Link>
      </div>
    );
  }

  return (
    <div className="container-site py-14 sm:py-20">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your Cart</h1>
        <span className="text-sm text-ink/55">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <ul className="divide-y divide-ink/10 border-y border-ink/10">
          {lines.map((line) => (
            <CartItem
              key={line.item.key}
              line={line}
              onQuantityChange={setQuantity}
              onRemove={removeItem}
            />
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-sand p-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Order Summary</h2>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">Shipping</dt>
                <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>

            {shipping > 0 && (
              <p className="mt-4 text-xs leading-relaxed text-ink/55">
                Spend {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free delivery.
              </p>
            )}

            <button type="button" className="btn-primary mt-6 w-full">
              Proceed to Checkout
            </button>

            <Link
              to="/boots"
              className="mt-4 block text-center text-xs uppercase tracking-[0.14em] text-ink/60 transition-colors hover:text-ink"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
