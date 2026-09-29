import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Loader2, RefreshCw, Search } from 'lucide-react';
import { requireSupabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/format';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../types/order';
import type { Order, OrderStatus, PaymentStatus } from '../../types/order';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/admin/StatusBadge';

const PAGE_SIZE = 50;

function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | 'ALL'>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await requireSupabase()
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (queryError) throw queryError;
      setOrders((data ?? []) as Order[]);
    } catch {
      setError('Could not load orders. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Filtering happens in the browser: a small shop's recent orders easily fit
  // in one page, and it keeps search instant.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (orderStatus !== 'ALL' && order.order_status !== orderStatus) return false;
      if (paymentStatus !== 'ALL' && order.payment_status !== paymentStatus) return false;
      if (!term) return true;
      return (
        order.order_number.toLowerCase().includes(term) ||
        order.customer_name.toLowerCase().includes(term) ||
        order.customer_phone.replace(/\D/g, '').includes(term.replace(/\D/g, '')) ||
        order.customer_email.toLowerCase().includes(term)
      );
    });
  }, [orders, search, orderStatus, paymentStatus]);

  return (
    <div className="container-site py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Orders</h1>
          <p className="mt-2 text-sm text-ink/55">
            {loading ? 'Loading…' : `${visible.length} of ${orders.length} shown`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="flex items-center gap-2 border border-ink/20 px-4 py-2.5 text-xs uppercase tracking-[0.12em] transition-colors hover:border-ink disabled:opacity-40"
        >
          <RefreshCw size={14} strokeWidth={1.8} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </header>

      <div className="mt-8 flex flex-col gap-4 border-y border-ink/10 py-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            strokeWidth={1.8}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order number, customer, phone or email"
            aria-label="Search orders"
            className="w-full border border-ink/15 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <label htmlFor="order-status" className="sr-only">
              Filter by order status
            </label>
            <select
              id="order-status"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value as OrderStatus | 'ALL')}
              className="appearance-none border border-ink/15 bg-transparent py-2.5 pl-3.5 pr-9 text-xs focus:border-brand focus:outline-none"
            >
              <option value="ALL">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/50"
            />
          </div>

          <div className="relative">
            <label htmlFor="payment-status" className="sr-only">
              Filter by payment status
            </label>
            <select
              id="payment-status"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus | 'ALL')}
              className="appearance-none border border-ink/15 bg-transparent py-2.5 pl-3.5 pr-9 text-xs focus:border-brand focus:outline-none"
            >
              <option value="ALL">All payments</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink/50"
            />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-8 border border-brand/30 bg-brand/5 p-4 text-sm text-brand">
          {error}
        </p>
      )}

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-ink/50">
          <Loader2 size={16} strokeWidth={2} className="animate-spin" />
          Loading orders…
        </div>
      ) : visible.length === 0 ? (
        <p className="py-24 text-center text-sm text-ink/55">
          {orders.length === 0 ? 'No orders yet.' : 'No orders match these filters.'}
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-8 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[56rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-left text-[11px] uppercase tracking-[0.12em] text-ink/50">
                  <th className="py-3 pr-4 font-semibold">Order</th>
                  <th className="py-3 pr-4 font-semibold">Customer</th>
                  <th className="py-3 pr-4 font-semibold">Phone</th>
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 text-right font-semibold">Total</th>
                  <th className="py-3 pr-4 font-semibold">Payment</th>
                  <th className="py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((order) => (
                  <tr key={order.id} className="border-b border-ink/10 hover:bg-sand/60">
                    <td className="py-4 pr-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-medium tracking-wide text-ink transition-colors hover:text-brand"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-4 pr-4">{order.customer_name}</td>
                    <td className="py-4 pr-4 tabular-nums text-ink/70">{order.customer_phone}</td>
                    <td className="py-4 pr-4 text-ink/60">{formatDate(order.created_at)}</td>
                    <td className="py-4 pr-4 text-right tabular-nums">
                      {formatPrice(Number(order.total_amount))}
                    </td>
                    <td className="py-4 pr-4">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                    <td className="py-4">
                      <OrderStatusBadge status={order.order_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <ul className="mt-8 space-y-3 lg:hidden">
            {visible.map((order) => (
              <li key={order.id} className="border border-ink/10 bg-white p-4">
                <Link to={`/admin/orders/${order.id}`} className="block">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium tracking-wide">{order.order_number}</p>
                      <p className="mt-1 truncate text-sm text-ink/70">{order.customer_name}</p>
                      <p className="mt-0.5 text-xs tabular-nums text-ink/55">
                        {order.customer_phone}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums">
                      {formatPrice(Number(order.total_amount))}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={order.order_status} />
                    <PaymentStatusBadge status={order.payment_status} />
                    <span className="ml-auto text-xs text-ink/50">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
