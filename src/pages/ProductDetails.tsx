import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import ProductImageGallery from '../components/ProductImageGallery';
import QuantityStepper from '../components/QuantityStepper';
import SectionHeading from '../components/SectionHeading';
import ProductGrid from '../components/ProductGrid';
import Toast from '../components/Toast';
import { getProductBySlug, getRelatedProducts } from '../data/products';
import { DEPARTMENT_LABELS, SIZE_LABELS } from '../types/product';
import { cn, formatPrice } from '../lib/format';
import { useCart } from '../hooks/useCart';

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  const { addItem } = useCart();

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

  const related = useMemo(() => (product ? getRelatedProducts(product, 4) : []), [product]);

  if (!product) {
    return <Navigate to="/shop" replace />;
  }

  const selectedColor = product.colors[colorIndex] ?? product.colors[0];
  // Bags and single-size trolleys have nothing to choose, so the picker is
  // hidden and the one available size is used automatically.
  const needsSizeChoice = product.sizes.length > 1;
  const resolvedSize = needsSizeChoice ? size : product.sizes[0];

  function handleAddToCart() {
    if (!product) return;
    if (!resolvedSize) {
      setError(true);
      return;
    }
    addItem({ product, size: resolvedSize, color: selectedColor.name, quantity });
    setToast(`${product.name} added to your cart`);
  }

  const detailSections = [
    { title: 'Product Details', body: product.description },
    { title: 'Material', body: product.material },
    { title: 'Care Instructions', body: product.care },
    {
      title: 'Shipping Information',
      body:
        'Dispatched within 2 business days. Free delivery on orders over INR 4,999, INR 199 otherwise. Returns accepted within 30 days if the item is unused and in its original packaging.',
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
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/65">
            {product.description}
          </p>

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

          {needsSizeChoice ? (
            <div className="mt-8">
              <p className="field-label">{SIZE_LABELS[product.department]}</p>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSize(value);
                      setError(false);
                    }}
                    aria-pressed={size === value}
                    className={cn(
                      'h-11 min-w-[3rem] border px-3 text-sm transition-colors',
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

          <div className="mt-8">
            <p className="field-label">Quantity</p>
            <QuantityStepper value={quantity} onChange={setQuantity} />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="btn-primary mt-9 w-full sm:w-auto sm:min-w-[16rem]"
          >
            Add to Cart
          </button>

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
