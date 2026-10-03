import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
} from 'lucide-react';
import {
  PRODUCT_STATUSES,
  STATUS_LABELS,
  listProducts,
  setProductStatus,
} from '../../lib/adminProducts';
import type { AdminProduct, ProductStatus } from '../../lib/adminProducts';
import { cn, formatPrice } from '../../lib/format';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const STATUS_TONES: Record<ProductStatus, string> = {
  active: 'bg-ink text-cream',
  draft: 'bg-beige text-ink',
  inactive: 'bg-sand text-ink/50',
};

function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={cn(
        'inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
        STATUS_TONES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'ALL'>('ALL');
  const [pending, setPending] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await listProducts());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      if (statusFilter !== 'ALL' && product.status !== statusFilter) return false;
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        product.slug.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.department.toLowerCase().includes(term)
      );
    });
  }, [products, search, statusFilter]);

  async function confirmStatusChange() {
    if (!pending) return;
    const next: ProductStatus = pending.status === 'active' ? 'inactive' : 'active';
    setSaving(true);
    try {
      await setProductStatus(pending.id, next);
      setProducts((current) =>
        current.map((p) => (p.id === pending.id ? { ...p, status: next } : p)),
      );
      setNotice(
        next === 'active'
          ? `${pending.name} is now visible in the shop.`
          : `${pending.name} has been hidden from the shop.`,
      );
      window.setTimeout(() => setNotice(null), 4000);
      setPending(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the product.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-site py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Products</h1>
          <p className="mt-2 text-sm text-ink/55">
            {loading ? 'Loading…' : `${visible.length} of ${products.length} shown`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center gap-2 border border-ink/20 px-4 py-2.5 text-xs uppercase tracking-[0.12em] transition-colors hover:border-ink disabled:opacity-40"
          >
            <RefreshCw size={14} strokeWidth={1.8} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link to="/admin/products/new" className="btn-primary px-5 py-2.5">
            <Plus size={14} strokeWidth={2} />
            Add Product
          </Link>
        </div>
      </header>

      {notice && (
        <p className="mt-6 border border-ink/15 bg-sand px-4 py-3 text-sm text-ink/70">{notice}</p>
      )}
      {error && (
        <p role="alert" className="mt-6 border border-brand/30 bg-brand/5 p-4 text-sm text-brand">
          {error}
        </p>
      )}

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
            placeholder="Search by name, slug or category"
            aria-label="Search products"
            className="w-full border border-ink/15 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div className="relative">
          <label htmlFor="product-status" className="sr-only">
            Filter by status
          </label>
          <select
            id="product-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProductStatus | 'ALL')}
            className="appearance-none border border-ink/15 bg-transparent py-2.5 pl-3.5 pr-9 text-xs focus:border-brand focus:outline-none"
          >
            <option value="ALL">All statuses</option>
            {PRODUCT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
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

      {loading && products.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-ink/50">
          <Loader2 size={16} strokeWidth={2} className="animate-spin" />
          Loading products…
        </div>
      ) : visible.length === 0 ? (
        <p className="py-24 text-center text-sm text-ink/55">
          {products.length === 0 ? 'No products yet.' : 'No products match these filters.'}
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="mt-8 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[60rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-left text-[11px] uppercase tracking-[0.12em] text-ink/50">
                  <th className="py-3 pr-4 font-semibold">Product</th>
                  <th className="py-3 pr-4 font-semibold">Category</th>
                  <th className="py-3 pr-4 text-right font-semibold">Price</th>
                  <th className="py-3 pr-4 text-right font-semibold">Stock</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Featured</th>
                  <th className="py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((product) => (
                  <tr key={product.id} className="border-b border-ink/10 hover:bg-sand/60">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0] ?? '/images/logo.png'}
                          alt=""
                          className="h-14 w-11 shrink-0 bg-sand object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{product.name}</p>
                          <p className="truncate text-xs text-ink/45">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 capitalize text-ink/70">
                      {product.department} / {product.category}
                    </td>
                    <td className="py-3 pr-4 text-right tabular-nums">
                      {formatPrice(product.price)}
                    </td>
                    <td
                      className={cn(
                        'py-3 pr-4 text-right tabular-nums',
                        product.stock === 0 && 'text-brand',
                      )}
                    >
                      {product.stock}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="py-3 pr-4">
                      {product.featured ? (
                        <Star size={15} strokeWidth={1.8} className="text-brand" />
                      ) : (
                        <span className="text-ink/25">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          aria-label={`Edit ${product.name}`}
                          className="p-2 text-ink/55 transition-colors hover:text-brand"
                        >
                          <Pencil size={15} strokeWidth={1.8} />
                        </Link>
                        <a
                          href={`/shop/${product.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`View ${product.name} in the shop`}
                          className="p-2 text-ink/55 transition-colors hover:text-brand"
                        >
                          <ExternalLink size={15} strokeWidth={1.8} />
                        </a>
                        <button
                          type="button"
                          onClick={() => setPending(product)}
                          className="ml-1 text-xs uppercase tracking-[0.1em] text-ink/55 transition-colors hover:text-brand"
                        >
                          {product.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <ul className="mt-8 space-y-3 lg:hidden">
            {visible.map((product) => (
              <li key={product.id} className="border border-ink/10 bg-white p-4">
                <div className="flex gap-3">
                  <img
                    src={product.images[0] ?? '/images/logo.png'}
                    alt=""
                    className="h-20 w-16 shrink-0 bg-sand object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="mt-0.5 truncate text-xs capitalize text-ink/50">
                      {product.department} / {product.category}
                    </p>
                    <p className="mt-1 text-sm tabular-nums">
                      {formatPrice(product.price)}{' '}
                      <span className={cn('text-xs', product.stock === 0 && 'text-brand')}>
                        · {product.stock} in stock
                      </span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={product.status} />
                      {product.featured && (
                        <Star size={13} strokeWidth={1.8} className="text-brand" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 border-t border-ink/10 pt-3">
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="text-xs uppercase tracking-[0.1em] text-ink/60 transition-colors hover:text-brand"
                  >
                    Edit
                  </Link>
                  <a
                    href={`/shop/${product.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs uppercase tracking-[0.1em] text-ink/60 transition-colors hover:text-brand"
                  >
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => setPending(product)}
                    className="ml-auto text-xs uppercase tracking-[0.1em] text-ink/60 transition-colors hover:text-brand"
                  >
                    {product.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={pending?.status === 'active' ? 'Deactivate product?' : 'Activate product?'}
        message={
          pending?.status === 'active'
            ? `"${pending?.name}" will be hidden from the shop straight away. Past orders are not affected and you can bring it back at any time.`
            : `"${pending?.name}" will become visible in the shop straight away.`
        }
        confirmLabel={pending?.status === 'active' ? 'Deactivate' : 'Activate'}
        busy={saving}
        onConfirm={() => void confirmStatusChange()}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
