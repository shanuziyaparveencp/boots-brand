import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Check, Loader2, Plus, X } from 'lucide-react';
import ProductImageUploader from '../../components/admin/ProductImageUploader';
import {
  PRODUCT_STATUSES,
  STATUS_LABELS,
  createProduct,
  emptyDraft,
  getProduct,
  slugify,
  updateProduct,
} from '../../lib/adminProducts';
import type { ProductDraft, ProductStatus } from '../../lib/adminProducts';
import { DEPARTMENT_LABELS } from '../../types/product';
import type { Department } from '../../types/product';
import { cn } from '../../lib/format';

/** Categories grouped by department, matching what the shop already filters on. */
const CATEGORIES: Record<Department, string[]> = {
  footwear: ['boots', 'sneakers', 'formal', 'sandals'],
  bags: ['backpacks', 'handbags', 'duffels'],
  trolleys: ['cabin', 'checkin', 'sets'],
};

const GENDERS = ['men', 'women', 'unisex'] as const;
const SHOE_SIZES = ['6', '7', '8', '9', '10', '11'];

type Errors = Partial<Record<keyof ProductDraft, string>>;

function validate(draft: ProductDraft): Errors {
  const errors: Errors = {};

  if (!draft.name.trim()) errors.name = 'Enter a product name.';
  if (!draft.slug.trim()) {
    errors.slug = 'Enter a URL slug.';
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) {
    errors.slug = 'Use lowercase letters, numbers and hyphens only.';
  }
  if (!draft.description.trim()) errors.description = 'Enter a description.';

  if (!Number.isFinite(draft.price) || draft.price <= 0) {
    errors.price = 'Enter a price greater than zero.';
  }
  if (
    draft.compare_at_price !== null &&
    (!Number.isFinite(draft.compare_at_price) || draft.compare_at_price <= draft.price)
  ) {
    errors.compare_at_price = 'The original price must be higher than the price.';
  }

  if (!Number.isInteger(draft.stock) || draft.stock < 0) {
    errors.stock = 'Stock must be zero or more.';
  }
  if (draft.sizes.length === 0) errors.sizes = 'Add at least one size.';
  if (draft.colors.length === 0) errors.colors = 'Add at least one colour.';

  // A draft can be incomplete, but anything going live needs a picture.
  if (draft.images.length === 0 && draft.status === 'active') {
    errors.images = 'Add at least one image before making the product active.';
  }

  return errors;
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  // Only auto-fill the slug for new products, so editing cannot break a live URL.
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const [colorName, setColorName] = useState('');
  const [colorHex, setColorHex] = useState('#4E0A0C');
  const [sizeInput, setSizeInput] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getProduct(id)
      .then((product) => {
        if (!active) return;
        const { id: _id, created_at: _c, updated_at: _u, ...rest } = product;
        setDraft(rest);
      })
      .catch((err) => active && setError(err instanceof Error ? err.message : 'Load failed.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const categories = useMemo(
    () => CATEGORIES[draft.department as Department] ?? CATEGORIES.footwear,
    [draft.department],
  );

  function set<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSaved(false);
  }

  function handleNameChange(value: string) {
    set('name', value);
    if (!slugTouched) {
      setDraft((current) => ({ ...current, name: value, slug: slugify(value) }));
    }
  }

  function handleDepartmentChange(value: string) {
    const list = CATEGORIES[value as Department] ?? [];
    setDraft((current) => ({
      ...current,
      department: value,
      // Keep category valid for the chosen department.
      category: list.includes(current.category) ? current.category : (list[0] ?? ''),
      // Bags and trolleys are not sized like shoes.
      sizes: value === 'footwear' ? current.sizes : current.sizes,
    }));
    setSaved(false);
  }

  function addColor() {
    const name = colorName.trim();
    if (!name) return;
    if (draft.colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setColorName('');
      return;
    }
    set('colors', [...draft.colors, { name, hex: colorHex }]);
    setColorName('');
  }

  function addSize(value: string) {
    const size = value.trim();
    if (!size || draft.sizes.includes(size)) return;
    set('sizes', [...draft.sizes, size]);
    setSizeInput('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const next = validate(draft);
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setError('Please correct the highlighted fields.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (isEdit && id) {
        await updateProduct(id, draft);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 3000);
      } else {
        const created = await createProduct(draft);
        navigate(`/admin/products/${created.id}/edit`, { replace: true });
        setSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the product.');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = (key: keyof ProductDraft) =>
    cn('field-input', errors[key] && 'border-brand focus:border-brand');

  if (loading) {
    return (
      <div className="container-site flex items-center justify-center gap-2 py-24 text-sm text-ink/50">
        <Loader2 size={16} strokeWidth={2} className="animate-spin" />
        Loading product…
      </div>
    );
  }

  return (
    <div className="container-site py-10 sm:py-14">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-ink/55 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} strokeWidth={1.8} />
        All products
      </Link>

      <header className="mt-6 border-b border-ink/10 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {isEdit ? 'Edit Product' : 'Add Product'}
        </h1>
        {isEdit && <p className="mt-2 text-sm text-ink/55">/shop/{draft.slug}</p>}
      </header>

      <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-3xl">
        <fieldset disabled={saving} className="min-w-0 border-0 p-0">
          {/* Basic information */}
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
            Basic Information
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="field-label">
                Product Name *
              </label>
              <input
                id="name"
                value={draft.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={fieldClass('name')}
              />
              {errors.name && <p className="mt-1.5 text-xs text-brand">{errors.name}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="slug" className="field-label">
                URL Slug *
              </label>
              <input
                id="slug"
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', e.target.value);
                }}
                className={fieldClass('slug')}
              />
              <p className="mt-1.5 text-xs text-ink/45">
                The shop address: /shop/{draft.slug || 'your-product'}
              </p>
              {errors.slug && <p className="mt-1 text-xs text-brand">{errors.slug}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="short_description" className="field-label">
                Short Description
              </label>
              <input
                id="short_description"
                value={draft.short_description}
                onChange={(e) => set('short_description', e.target.value)}
                className={fieldClass('short_description')}
                placeholder="One line shown on product cards"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="field-label">
                Full Description *
              </label>
              <textarea
                id="description"
                rows={4}
                value={draft.description}
                onChange={(e) => set('description', e.target.value)}
                className={cn(fieldClass('description'), 'resize-y')}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-brand">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Pricing */}
          <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.16em]">Pricing</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="field-label">
                Price (₹) *
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="1"
                value={draft.price || ''}
                onChange={(e) => set('price', Number(e.target.value))}
                className={fieldClass('price')}
              />
              {errors.price && <p className="mt-1.5 text-xs text-brand">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="compare_at_price" className="field-label">
                Original Price (₹)
              </label>
              <input
                id="compare_at_price"
                type="number"
                min="0"
                step="1"
                value={draft.compare_at_price ?? ''}
                onChange={(e) =>
                  set('compare_at_price', e.target.value === '' ? null : Number(e.target.value))
                }
                className={fieldClass('compare_at_price')}
                placeholder="Leave blank if not on sale"
              />
              {errors.compare_at_price && (
                <p className="mt-1.5 text-xs text-brand">{errors.compare_at_price}</p>
              )}
            </div>
          </div>

          {/* Classification */}
          <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.16em]">
            Classification
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-3">
            <div>
              <label htmlFor="department" className="field-label">
                Department *
              </label>
              <select
                id="department"
                value={draft.department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="field-input"
              >
                {(Object.keys(DEPARTMENT_LABELS) as Department[]).map((dept) => (
                  <option key={dept} value={dept}>
                    {DEPARTMENT_LABELS[dept]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className="field-label">
                Category *
              </label>
              <select
                id="category"
                value={draft.category}
                onChange={(e) => set('category', e.target.value)}
                className="field-input capitalize"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="gender" className="field-label">
                Gender *
              </label>
              <select
                id="gender"
                value={draft.gender}
                onChange={(e) => set('gender', e.target.value)}
                className="field-input capitalize"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Details */}
          <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.16em]">
            Product Details
          </h2>
          <div className="mt-5 grid gap-6">
            <div>
              <label htmlFor="material" className="field-label">
                Material
              </label>
              <input
                id="material"
                value={draft.material}
                onChange={(e) => set('material', e.target.value)}
                className={fieldClass('material')}
              />
            </div>

            <div>
              <label htmlFor="care" className="field-label">
                Care Instructions
              </label>
              <textarea
                id="care"
                rows={2}
                value={draft.care}
                onChange={(e) => set('care', e.target.value)}
                className={cn(fieldClass('care'), 'resize-y')}
              />
            </div>

            {/* Colours */}
            <div>
              <p className="field-label">Colours *</p>
              {draft.colors.length > 0 && (
                <ul className="mb-3 flex flex-wrap gap-2">
                  {draft.colors.map((color, index) => (
                    <li
                      key={color.name}
                      className="inline-flex items-center gap-2 border border-ink/15 py-1.5 pl-2 pr-1 text-sm"
                    >
                      <span
                        className="h-4 w-4 rounded-full ring-1 ring-inset ring-ink/15"
                        style={{ backgroundColor: color.hex }}
                      />
                      {color.name}
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            'colors',
                            draft.colors.filter((_, i) => i !== index),
                          )
                        }
                        aria-label={`Remove ${color.name}`}
                        className="p-1 text-ink/40 transition-colors hover:text-brand"
                      >
                        <X size={13} strokeWidth={2} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addColor();
                    }
                  }}
                  placeholder="Colour name"
                  aria-label="Colour name"
                  className="field-input w-auto flex-1 sm:min-w-[12rem]"
                />
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  aria-label="Colour swatch"
                  className="h-[46px] w-14 cursor-pointer border border-ink/15 bg-white p-1"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="inline-flex items-center gap-1.5 border border-ink/20 px-4 py-3 text-xs uppercase tracking-[0.12em] transition-colors hover:border-brand hover:text-brand"
                >
                  <Plus size={13} strokeWidth={2} />
                  Add
                </button>
              </div>
              {errors.colors && <p className="mt-1.5 text-xs text-brand">{errors.colors}</p>}
            </div>

            {/* Sizes */}
            <div>
              <p className="field-label">Sizes *</p>
              {draft.department === 'footwear' && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {SHOE_SIZES.map((size) => {
                    const on = draft.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() =>
                          set(
                            'sizes',
                            on ? draft.sizes.filter((s) => s !== size) : [...draft.sizes, size],
                          )
                        }
                        aria-pressed={on}
                        className={cn(
                          'h-11 min-w-[3rem] border px-3 text-sm transition-colors',
                          on
                            ? 'border-brand bg-brand text-cream'
                            : 'border-ink/15 hover:border-brand',
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              )}

              {draft.sizes.filter((s) => !SHOE_SIZES.includes(s)).length > 0 && (
                <ul className="mb-3 flex flex-wrap gap-2">
                  {draft.sizes
                    .filter((s) => !SHOE_SIZES.includes(s))
                    .map((size) => (
                      <li
                        key={size}
                        className="inline-flex items-center gap-1 border border-ink/15 py-1.5 pl-3 pr-1 text-sm"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              'sizes',
                              draft.sizes.filter((s) => s !== size),
                            )
                          }
                          aria-label={`Remove size ${size}`}
                          className="p-1 text-ink/40 transition-colors hover:text-brand"
                        >
                          <X size={13} strokeWidth={2} />
                        </button>
                      </li>
                    ))}
                </ul>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSize(sizeInput);
                    }
                  }}
                  placeholder='e.g. "One Size" or "55 cm"'
                  aria-label="Add a size"
                  className="field-input w-auto flex-1 sm:min-w-[12rem]"
                />
                <button
                  type="button"
                  onClick={() => addSize(sizeInput)}
                  className="inline-flex items-center gap-1.5 border border-ink/20 px-4 py-3 text-xs uppercase tracking-[0.12em] transition-colors hover:border-brand hover:text-brand"
                >
                  <Plus size={13} strokeWidth={2} />
                  Add
                </button>
              </div>
              {errors.sizes && <p className="mt-1.5 text-xs text-brand">{errors.sizes}</p>}
            </div>
          </div>

          {/* Inventory */}
          <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.16em]">Inventory</h2>
          <div className="mt-5 max-w-xs">
            <label htmlFor="stock" className="field-label">
              Stock Quantity *
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={draft.stock}
              onChange={(e) => set('stock', Number(e.target.value))}
              className={fieldClass('stock')}
            />
            <p className="mt-1.5 text-xs text-ink/45">
              At zero the shop shows &ldquo;Out of Stock&rdquo; and blocks adding to cart.
            </p>
            {errors.stock && <p className="mt-1 text-xs text-brand">{errors.stock}</p>}
          </div>

          {/* Images */}
          <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.16em]">
            Product Images
          </h2>
          <div className="mt-5">
            <ProductImageUploader
              images={draft.images}
              onChange={(images) => set('images', images)}
              slug={draft.slug || slugify(draft.name) || 'unsorted'}
              disabled={saving}
            />
            {errors.images && <p className="mt-2 text-xs text-brand">{errors.images}</p>}
          </div>

          {/* Settings */}
          <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.16em]">Settings</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="field-label">
                Status
              </label>
              <select
                id="status"
                value={draft.status}
                onChange={(e) => set('status', e.target.value as ProductStatus)}
                className="field-input"
              >
                {PRODUCT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-ink/45">
                Only Active products appear in the shop.
              </p>
            </div>

            <div>
              <p className="field-label">Featured</p>
              <label className="inline-flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => set('featured', e.target.checked)}
                  className="h-4 w-4 accent-brand"
                />
                Show on the home page
              </label>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-10 flex items-start gap-2.5 border border-brand/30 bg-brand/5 p-4 text-sm text-brand"
            >
              <AlertCircle size={17} strokeWidth={1.8} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-ink/10 pt-8 sm:flex-row sm:items-center">
            <Link to="/admin/products" className="btn-secondary px-8 py-3">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn-primary px-8 py-3">
              {saving ? (
                <>
                  <Loader2 size={15} strokeWidth={2} className="animate-spin" />
                  Saving
                </>
              ) : (
                'Save Product'
              )}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-sm text-ink/60">
                <Check size={15} strokeWidth={2.2} />
                Saved
              </span>
            )}
          </div>
        </fieldset>
      </form>
    </div>
  );
}
