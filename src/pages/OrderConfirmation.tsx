import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package } from 'lucide-react';
import type { OrderWithItems } from '../types/order';
import { ONE_SIZE } from '../types/product';
import { formatPrice } from '../lib/format';
import { loadConfirmation } from '../lib/orderStorage';

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setOrder(orderNumber ? loadConfirmation(orderNumber) : null);
    setChecked(true);
  }, [orderNumber]);

  if (!checked) return null;

  // Details live in sessionStorage, so a link opened in a new tab or on
  // another device cannot show someone else's order.
  if (!order) {
    return (
      <div className="container-site py-24 text-center sm:py-32">
        <Package size={28} strokeWidth={1.4} className="mx-auto text-brand" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Order Confirmed</h1>
        {orderNumber && (
          <p className="mt-4 text-sm text-ink/60">
            Your order number is{' '}
            <span className="font-medium tracking-wide text-ink">{orderNumber}</span>
          </p>
        )}
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink/60">
          The full details of this order are not available in this browser session. We have received
          it and will call you to confirm. Quote your order number if you get in touch.
        </p>
        <Link to="/shop" className="btn-primary mt-8">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const items = order.order_items ?? [];

  return (
    <div className="container-site py-14 sm:py-20">
      <div className="flex flex-col items-center border-b border-ink/10 pb-10 text-center">
        <CheckCircle2 size={34} strokeWidth={1.4} className="text-brand" />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Order Confirmed</h1>
        <p className="mt-3 text-sm text-ink/60">Thank you for your order.</p>

        <div className="mt-7 border border-ink/15 px-6 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/50">
            Order Number
          </p>
          <p className="mt-1.5 text-lg font-medium tracking-wide">{order.order_number}</p>
        </div>

        <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink/60">
          We have received your order and sent the details to our team. Someone from the shop will
          call you on{' '}
          <span className="text-ink">{order.customer_phone}</span> to confirm before dispatch. No
          payment has been taken.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Items Ordered</h2>
          <ul className="mt-5 divide-y divide-ink/10 border-y border-ink/10">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                {item.product_image && (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    width={900}
                    height={1125}
                    loading="lazy"
                    className="h-24 w-20 shrink-0 bg-sand object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.product_name}</p>
                  <p className="mt-1.5 text-xs text-ink/55">
                    {item.size !== ONE_SIZE && `Size ${item.size} - `}
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

          <div className="mt-10 grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Customer</h2>
              <div className="mt-4 space-y-1 text-sm text-ink/70">
                <p className="text-ink">{order.customer_name}</p>
                <p>{order.customer_email}</p>
                <p>{order.customer_phone}</p>
              </div>
            </div>

            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Delivery Address
              </h2>
              <address className="mt-4 space-y-1 text-sm not-italic text-ink/70">
                <p className="whitespace-pre-line">{order.shipping_address}</p>
                <p>
                  {order.shipping_city}, {order.shipping_state}
                </p>
                <p>{order.shipping_postal_code}</p>
                <p>{order.shipping_country}</p>
              </address>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-sand p-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Summary</h2>
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

            <div className="mt-5 border-t border-ink/10 pt-5 text-xs text-ink/55">
              <p>
                Order status: <span className="text-ink">{order.order_status}</span>
              </p>
              <p className="mt-1">
                Payment: <span className="text-ink">{order.payment_status}</span> (pay on delivery)
              </p>
            </div>

            <Link to="/shop" className="btn-primary mt-6 w-full">
              Continue Shopping
            </Link>

            <Link
              to={`/track?order=${order.order_number}`}
              className="mt-4 block text-center text-xs uppercase tracking-[0.14em] text-ink/60 transition-colors hover:text-ink"
            >
              Track This Order
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
