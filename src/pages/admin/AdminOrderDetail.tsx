import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { requireSupabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/format';
import { ONE_SIZE } from '../../types/product';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../types/order';
import type { OrderStatus, OrderWithItems, PaymentStatus } from '../../types/order';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/admin/StatusBadge';
import PaymentDetailsDialog from '../../components/admin/PaymentDetailsDialog';
import type { PaymentDetails } from '../../components/admin/PaymentDetailsDialog';
import { cn } from '../../lib/format';

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<'order' | 'payment' | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await requireSupabase()
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();

      if (queryError) throw queryError;
      setOrder(data as OrderWithItems);
    } catch {
      setError('Could not load this order.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function applyPatch(
    which: 'order' | 'payment',
    patch: Record<string, string | null>,
  ): Promise<boolean> {
    if (!order) return false;
    setSaving(which);
    setError(null);

    const previous = order;
    // Optimistic: the select reflects the change immediately.
    setOrder({ ...order, ...patch } as OrderWithItems);

    const { error: updateError } = await requireSupabase()
      .from('orders')
      .update(patch)
      .eq('id', order.id);

    setSaving(null);

    if (updateError) {
      setOrder(previous);
      setError('Could not save the change. Please try again.');
      return false;
    }

    // Re-read so trigger-managed fields such as paid_at show the stored value.
    void load();
    setSaved(which);
    window.setTimeout(() => setSaved(null), 2500);
    return true;
  }

  async function updateOrderStatus(value: OrderStatus) {
    await applyPatch('order', { order_status: value });
  }

  /** Moving to PAID collects the transaction details first. */
  async function updatePaymentStatus(value: PaymentStatus) {
    if (value === 'PAID') {
      setPaymentDialog(true);
      return;
    }
    await applyPatch('payment', {
      payment_status: value,
      payment_reference: null,
      payment_method: null,
      payment_note: null,
    });
  }

  async function confirmPayment(details: PaymentDetails) {
    setPaymentError(null);
    const ok = await applyPatch('payment', { payment_status: 'PAID', ...details });
    if (ok) setPaymentDialog(false);
    else setPaymentError('Could not save the payment. Please try again.');
  }

  if (loading) {
    return (
      <div className="container-site flex items-center justify-center gap-2 py-24 text-sm text-ink/50">
        <Loader2 size={16} strokeWidth={2} className="animate-spin" />
        Loading order…
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-site py-24 text-center">
        <p className="text-sm text-ink/60">{error ?? 'Order not found.'}</p>
        <Link to="/admin/orders" className="btn-secondary mt-6">
          Back to orders
        </Link>
      </div>
    );
  }

  const items = order.order_items ?? [];

  return (
    <div className="container-site py-10 sm:py-14">
      <Link
        to="/admin/orders"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-ink/55 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        All orders
      </Link>

      <header className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide sm:text-3xl">{order.order_number}</h1>
          <p className="mt-2 text-sm text-ink/55">
            Placed{' '}
            {new Date(order.created_at).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.order_status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </header>

      {error && (
        <p role="alert" className="mt-6 border border-brand/30 bg-brand/5 p-4 text-sm text-brand">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div>
          {/* Status controls */}
          <section className="border border-ink/10 p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Update status</h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="order-status" className="field-label">
                  Order status
                  {saving === 'order' && <span className="ml-2 normal-case text-ink/40">saving…</span>}
                  {saved === 'order' && (
                    <span className="ml-2 inline-flex items-center gap-1 normal-case text-ink/50">
                      <Check size={12} strokeWidth={2.2} /> saved
                    </span>
                  )}
                </label>
                <select
                  id="order-status"
                  value={order.order_status}
                  disabled={saving !== null}
                  onChange={(e) => void updateOrderStatus(e.target.value as OrderStatus)}
                  className={cn(
                    'w-full border border-ink/15 bg-white px-3 py-2.5 text-sm',
                    'focus:border-brand focus:outline-none disabled:opacity-50',
                  )}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="payment-status-select" className="field-label">
                  Payment status
                  {saving === 'payment' && (
                    <span className="ml-2 normal-case text-ink/40">saving…</span>
                  )}
                  {saved === 'payment' && (
                    <span className="ml-2 inline-flex items-center gap-1 normal-case text-ink/50">
                      <Check size={12} strokeWidth={2.2} /> saved
                    </span>
                  )}
                </label>
                <select
                  id="payment-status-select"
                  value={order.payment_status}
                  disabled={saving !== null}
                  onChange={(e) => void updatePaymentStatus(e.target.value as PaymentStatus)}
                  className={cn(
                    'w-full border border-ink/15 bg-white px-3 py-2.5 text-sm',
                    'focus:border-brand focus:outline-none disabled:opacity-50',
                  )}
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Recorded payment */}
          {order.payment_status === 'PAID' && (
            <section className="mt-6 border border-ink/10 p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Payment received
              </h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-ink/50">Method</dt>
                  <dd className="mt-1 text-sm">{order.payment_method || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/50">Transaction reference</dt>
                  <dd className="mt-1 break-all text-sm font-medium">
                    {order.payment_reference || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink/50">Recorded</dt>
                  <dd className="mt-1 text-sm">
                    {order.paid_at
                      ? new Date(order.paid_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </dd>
                </div>
                {order.payment_note && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-ink/50">Note</dt>
                    <dd className="mt-1 whitespace-pre-line text-sm text-ink/70">
                      {order.payment_note}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Items */}
          <section className="mt-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Items</h2>
            <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      width={900}
                      height={1125}
                      loading="lazy"
                      className="h-20 w-16 shrink-0 bg-sand object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="mt-1 text-xs text-ink/55">
                      {item.size !== ONE_SIZE && `Size ${item.size} · `}
                      Qty {item.quantity} · {formatPrice(Number(item.unit_price))} each
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatPrice(Number(item.total_price))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Customer + delivery */}
          <section className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Customer</h2>
              <div className="mt-4 space-y-1.5 text-sm text-ink/70">
                <p className="text-ink">{order.customer_name}</p>
                <p>
                  <a
                    href={`mailto:${order.customer_email}`}
                    className="transition-colors hover:text-brand"
                  >
                    {order.customer_email}
                  </a>
                </p>
                <p>
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="transition-colors hover:text-brand"
                  >
                    {order.customer_phone}
                  </a>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Delivery</h2>
              <address className="mt-4 space-y-1.5 text-sm not-italic text-ink/70">
                <p className="whitespace-pre-line">{order.shipping_address}</p>
                <p>
                  {order.shipping_city}, {order.shipping_state}
                </p>
                <p>{order.shipping_postal_code}</p>
                <p>{order.shipping_country}</p>
              </address>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-sand p-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink/60">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(Number(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">Shipping</dt>
                <dd className="tabular-nums">
                  {Number(order.shipping_fee) === 0
                    ? 'Free'
                    : formatPrice(Number(order.shipping_fee))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink/60">Discount</dt>
                <dd className="tabular-nums">
                  {Number(order.discount) > 0 ? `- ${formatPrice(Number(order.discount))}` : '—'}
                </dd>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-medium">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(Number(order.total_amount))}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <PaymentDetailsDialog
        open={paymentDialog}
        orderNumber={order.order_number}
        amount={Number(order.total_amount)}
        busy={saving === 'payment'}
        error={paymentError}
        onConfirm={(details) => void confirmPayment(details)}
        onCancel={() => {
          setPaymentDialog(false);
          setPaymentError(null);
        }}
      />
    </div>
  );
}
