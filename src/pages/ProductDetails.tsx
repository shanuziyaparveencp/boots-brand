import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ProductImageGallery from '../components/ProductImageGallery';
import QuantityStepper from '../components/QuantityStepper';
import SectionHeading from '../components/SectionHeading';
import ProductGrid from '../components/ProductGrid';
import Toast from '../components/Toast';
import { useCatalog } from '../hooks/useCatalog';
import { DEPARTMENT_LABELS, SIZE_LABELS } from '../types/product';
import type { Product } from '../types/product';
import { cn, formatPrice } from '../lib/format';
import { useCart } from '../hooks/useCart';

/** Same-category first, then same department, then anything else. */
function relatedProducts(all: Product[], product: Product, limit = 4): Product[] {
  const rest = all.filter((candidate) => candidate.slug !== product.slug);
  const score = (candidate: Product) => {
    if (candidate.category === product.category) return 0;
    if (candidate.department === product.department) return 1;
    return 2;
  };
  return [...rest].sort((a, b) => score(a) - score(b)).slice(0, limit);
}

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const { products, getProductBySlug, loading } = useCatalog();
  const product = slug ? getProductBySlug(slug) : undefined;
  const { addItem, items } = useCart();

  const [size, setSize] = useState<string | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Reset the selection when navigating to a different product.
  useEffect(() => {
    setSize(null);
    setColorIndex(0);
    setQuantity(1);
    setError(false);
  }, [slug]);

  const related = useMemo(
    () => (product ? relatedProducts(products, product, 4) : []),
    [products, product],
  );

  // Wait for the catalogue before deciding a slug is unknown.
  if (!product) {
    if (loading) {
      return <div className="container-site py-32 text-center text-sm text-ink/50">Loading…</div>;
    }
    return <Navigate to="/shop" replace />;
  }

  const selectedColor = product.colors[colorIndex] ?? product.colors[0];
  // Bags and single-size trolleys have nothing to choose, so the picker is
  // hidden and the one available size is used automatically.
  const needsSizeChoice = product.sizes.length > 1;
  const resolvedSize = needsSizeChoice ? size : product.sizes[0];

  const tracked = typeof product.stock === 'number';
  const stock = product.stock ?? Number.POSITIVE_INFINITY;
  const outOfStock = tracked && stock <= 0;

  // How many of this product are already in the cart across all sizes.
  const inCart = items
    .filter((item) => item.slug === product.slug)
    .reduce((sum, item) => sum + item.quantity, 0);
  const remaining = Math.max(stock - inCart, 0);
  const maxQuantity = tracked ? Math.max(Math.min(remaining, 10), 1) : 10;

  function handleAddToCart() {
    if (!product || outOfStock) return;
    if (!resolvedSize) {
      setError(true);
      return;
    }
    const result = addItem({ product, size: resolvedSize, color: selectedColor.name, quantity });

    if (result.added <= 0) {
      setToast(`No more stock available for ${product.name}.`);
      return;
    }
    setToast(
      result.clamped
        ? `Only ${result.added} added — that is all we have left.`
        : `${product.name} added to your cart`,
    );
  }

  const detailSections = [
    { title: 'Product Details', body: product.description },
    { title: 'Material', body: product.material },
    { title: 'Care Instructions', body: product.care },
    {
      title: 'Shipping Information',
      body: 'Dispatched within 2 business days. We confirm every order by phone before dispatch. Returns accepted within 30 days if the item is unused and in its original packaging.',
    },
  ];

  return (
    <div className="pb-8">
      <div className="container-site pt-8">
        <nav aria-label="Breadcrumb" className="text-xs text-ink/50">
          <Link to="/" className="transition-colors hover:text-brand">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="transition-colors hover:text-brand">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={`/shop?filter=${product.department}`}
            className="transition-colors hover:text-brand"
          >
            {DEPARTMENT_LABELS[product.department]}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink/70">{product.name}</span>
        </nav>
      </div>

      <div className="container-site grid gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14">
        <ProductImageGallery images={product.images} productName={product.name} />

        <div className="lg:pt-2">
          <p className="eyebrow mb-3">{DEPARTMENT_LABELS[product.department]}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h1>
          <p className="mt-3 text-lg">{formatPrice(product.price)}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/65">{product.description}</p>

          {outOfStock ? (
            <p className="mt-6 inline-block border border-brand/30 bg-brand/5 px-4 py-2.5 text-sm text-brand">
              Out of stock — please call the shop to check when it is back.
            </p>
          ) : (
            tracked &&
            stock <= 5 && (
              <p className="mt-6 text-sm text-brand">Only {stock} left in stock.</p>
            )
          )}

          {/* Colour */}
          <div className="mt-9">
            <p className="field-label">
              Colour: <span className="text-ink">{selectedColor.name}</span>
            </p>
            <div className="flex gap-2.5">
              {product.colors.map((color, index) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setColorIndex(index)}
                  aria-label={color.name}
                  aria-pressed={index === colorIndex}
                  className={cn(
                    'h-9 w-9 rounded-full border-2 p-0.5 transition-colors',
                    index === colorIndex ? 'border-brand' : 'border-transparent hover:border-ink/25',
                  )}
                >
                  <span
                    className="block h-full w-full rounded-full ring-1 ring-inset ring-ink/10"
                    style={{ backgroundColor: color.hex }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          {needsSizeChoice ? (
            <div className="mt-8">
              <p className="field-label">{SIZE_LABELS[product.department]}</p>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => {
                      setSize(value);
                      setError(false);
                    }}
                    aria-pressed={size === value}
                    className={cn(
                      'h-11 min-w-[3rem] border px-3 text-sm transition-colors disabled:opacity-40',
                      size === value
                        ? 'border-brand bg-brand text-cream'
                        : 'border-ink/15 text-ink hover:border-brand',
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
              {error && (
                <p role="alert" className="mt-3 text-xs text-brand">
                  Please select a size to continue.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-8">
              <p className="field-label">{SIZE_LABELS[product.department]}</p>
              <p className="text-sm text-ink/70">{product.sizes[0]}</p>
            </div>
          )}

          {/* Quantity */}
          <div className="mt-8">
            <p className="field-label">Quantity</p>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={maxQuantity}
            />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="btn-primary mt-9 w-full sm:w-auto sm:min-w-[16rem]"
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>

          {/* Details */}
          <dl className="mt-12 border-t border-ink/10">
            {detailSections.map((section) => (
              <div key={section.title} className="border-b border-ink/10 py-5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink">
                  {section.title}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink/60">{section.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-site pt-10 sm:pt-16">
          <SectionHeading title="You May Also Like" />
          <ProductGrid products={related} className="mt-10" />
        </section>
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
