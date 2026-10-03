import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, Loader2, PackageSearch } from 'lucide-react';
import { ONE_SIZE } from '../types/product';
import type { OrderStatus, PaymentStatus } from '../types/order';
import { cn, formatPrice } from '../lib/format';
import { shop } from '../data/shop';

/** What /api/order-lookup returns. Internal payment fields are not included. */
interface TrackedOrder {
  order_number: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string | null;
  paid_at: string | null;
  order_items: {
    product_name: string;
    product_image: string;
    size: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
}

/** The happy path, in order. CANCELLED is handled separately. */
const PROGRESS: OrderStatus[] = ['NEW', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

const STATUS_COPY: Record<OrderStatus, string> = {
  NEW: 'We have received your order and will call you to confirm.',
  CONFIRMED: 'Your order is confirmed and is being prepared.',
  PACKED: 'Your order is packed and waiting to be dispatched.',
  SHIPPED: 'Your order is on its way.',
  DELIVERED: 'Your order has been delivered. Thank you!',
  CANCELLED: 'This order was cancelled. Call us if that looks wrong.',
};

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') ?? '');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from a link such as /track?order=ORD-20261003-0001
  useEffect(() => {
    const fromUrl = searchParams.get('order');
    if (fromUrl) setOrderNumber(fromUrl);
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    if (!orderNumber.trim() || !email.trim()) {
      setError('Enter your order number and the email you used.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch('/api/order-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === 'object' && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : 'Could not find that order.';
        setError(message);
        return;
      }
      setOrder((payload as { order: TrackedOrder }).order);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const stageIndex = order ? PROGRESS.indexOf(order.order_status) : -1;
  const cancelled = order?.order_status === 'CANCELLED';

  return (
    <div className="container-site py-14 sm:py-20">
      <header className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Track Your Order</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">
          Enter your order number and the email address you used at checkout. You do not need an
          account.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-10 max-w-xl">
        <fieldset disabled={loading} className="min-w-0 border-0 p-0">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="order-number" className="field-label">
                Order Number
              </label>
              <input
                id="order-number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ORD-20261003-0001"
                className="field-input"
              />
            </div>
            <div>
              <label htmlFor="order-email" className="field-label">
                Email
              </label>
              <input
                id="order-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-input"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2.5 border border-brand/30 bg-brand/5 p-4 text-sm text-brand"
            >
              <AlertCircle size={17} strokeWidth={1.8} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary mt-6 w-full sm:w-auto sm:min-w-[14rem]">
            {loading ? (
              <>
                <Loader2 size={15} strokeWidth={2} className="animate-spin" />
                Checking
              </>
            ) : (
              'Find My Order'
            )}
          </button>
        </fieldset>
      </form>

      {!order && !loading && (
        <div className="mt-14 flex max-w-xl items-start gap-3 border-t border-ink/10 pt-8 text-sm text-ink/55">
          <PackageSearch size={18} strokeWidth={1.6} className="mt-0.5 shrink-0 text-stone" />
          <p>
            Can&rsquo;t find your order number? It was shown after checkout and starts with
            &ldquo;ORD-&rdquo;. Call us on{' '}
            <a href={`tel:${shop.phoneRaw}`} className="text-ink underline">
              {shop.phoneDisplay}
            </a>{' '}
            and we will look it up for you.
          </p>
        </div>
      )}

      {order && (
        <section className="mt-14 border-t border-ink/10 pt-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Order</p>
              <h2 className="text-xl font-medium tracking-wide sm:text-2xl">
                {order.order_number}
              </h2>
              <p className="mt-2 text-sm text-ink/55">Placed {formatDate(order.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ink/55">Total</p>
              <p className="text-xl font-medium">{formatPrice(Number(order.total_amount))}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-9 bg-sand p-6">
            <p className="text-sm text-ink/70">{STATUS_COPY[order.order_status]}</p>

            {!cancelled ? (
              <ol className="mt-6 grid gap-3 sm:grid-cols-5">
                {PROGRESS.map((stage, index) => {
                  const done = index <= stageIndex;
                  return (
                    <li key={stage} className="flex items-center gap-2 sm:block">
                      <span
                        className={cn(
                          'block h-1 w-8 shrink-0 sm:w-full',
                          done ? 'bg-brand' : 'bg-ink/15',
                        )}
                      />
                      <span
                        className={cn(
                          'text-[11px] font-semibold uppercase tracking-[0.1em] sm:mt-2 sm:block',
                          done ? 'text-brand' : 'text-ink/35',
                        )}
                      >
                        {stage}
                      </span>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="mt-4 inline-block bg-ink px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-cream">
                Cancelled
              </p>
            )}

            <p className="mt-6 text-xs text-ink/50">
              Payment: <span className="text-ink">{order.payment_status}</span>
              {order.payment_status === 'PAID' && order.payment_method && (
                <> · {order.payment_method}</>
              )}
              {order.payment_status === 'PAID' && order.paid_at && (
                <> · received {formatDate(order.paid_at)}</>
              )}
              {order.payment_status === 'PENDING' && <> · pay on delivery</>}
            </p>
          </div>

          {/* Items */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Items</h3>
              <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
                {order.order_items.map((item, index) => (
                  <li key={`${item.product_name}-${index}`} className="flex gap-4 py-5">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        loading="lazy"
                        className="h-24 w-20 shrink-0 bg-sand object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.product_name}</p>
                      <p className="mt-1.5 text-xs text-ink/55">
                        {item.size !== ONE_SIZE && `Size ${item.size} · `}
                        Qty {item.quantity}
                      </p>
                      <p className="mt-1 text-xs text-ink/55">
                        {formatPrice(Number(item.unit_price))} each
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium">
                      {formatPrice(Number(item.total_price))}
                    </span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Delivering to
              </h3>
              <address className="mt-4 space-y-1 text-sm not-italic text-ink/70">
                <p className="text-ink">{order.customer_name}</p>
                <p className="whitespace-pre-line">{order.shipping_address}</p>
                <p>
                  {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
                </p>
                <p>{order.shipping_country}</p>
              </address>
            </div>

            <aside>
              <div className="bg-sand p-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Summary</h3>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink/60">Subtotal</dt>
                    <dd>{formatPrice(Number(order.subtotal))}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink/60">Shipping</dt>
                    <dd>
                      {Number(order.shipping_fee) === 0
                        ? 'Free'
                        : formatPrice(Number(order.shipping_fee))}
                    </dd>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-ink/60">Discount</dt>
                      <dd>- {formatPrice(Number(order.discount))}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium">
                    <dt>Total</dt>
                    <dd>{formatPrice(Number(order.total_amount))}</dd>
                  </div>
                </dl>

                <p className="mt-5 border-t border-ink/10 pt-5 text-xs leading-relaxed text-ink/55">
                  Questions about this order? Call{' '}
                  <a href={`tel:${shop.phoneRaw}`} className="text-ink">
                    {shop.phoneDisplay}
                  </a>{' '}
                  and quote your order number.
                </p>

                <Link to="/shop" className="btn-primary mt-5 w-full">
                  Continue Shopping
                </Link>
              </div>
            </aside>
          </div>
        </section>
      )}
    </div>
  );
}
