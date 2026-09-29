import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Lock } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useCatalog } from '../hooks/useCatalog';
import { ONE_SIZE } from '../types/product';
import type { OrderWithItems } from '../types/order';
import { cn, formatPrice } from '../lib/format';
import { isSupabaseConfigured } from '../lib/config';
import { saveConfirmation } from '../lib/orderStorage';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyForm: FormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: 'Kerala',
  postalCode: '',
  country: 'India',
};

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) errors.name = 'Please enter your full name.';

  if (!values.email.trim()) {
    errors.email = 'Please enter your email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  const digits = values.phone.replace(/\D/g, '');
  if (!values.phone.trim()) {
    errors.phone = 'Please enter your phone number.';
  } else if (digits.length < 10 || digits.length > 13) {
    errors.phone = 'Please enter a valid phone number.';
  }

  if (!values.address.trim()) errors.address = 'Please enter your address.';
  if (!values.city.trim()) errors.city = 'Please enter your city.';
  if (!values.state.trim()) errors.state = 'Please enter your state.';

  if (!values.postalCode.trim()) {
    errors.postalCode = 'Please enter your postal code.';
  } else if (!/^\d{4,10}$/.test(values.postalCode.replace(/\s/g, ''))) {
    errors.postalCode = 'Please enter a valid postal code.';
  }

  if (!values.country.trim()) errors.country = 'Please enter your country.';

  return errors;
}

export default function Checkout() {
  const { lines, subtotal, shipping, total, hasStockProblem, clearCart } = useCart();
  const { refresh } = useCatalog();
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Stable for the lifetime of this checkout, so a double click or a retry
  // after a network blip cannot create two orders.
  const idempotencyKey = useRef<string>(
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `key-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.item.quantity, 0),
    [lines],
  );

  // `placed` keeps this from firing during the redirect after the cart clears.
  if (lines.length === 0 && !submitting && !placed) {
    return <Navigate to="/cart" replace />;
  }

  function handleChange(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Please correct the highlighted fields.');
      return;
    }

    if (hasStockProblem) {
      setSubmitError(
        'Some items are no longer available in that quantity. Please review your cart.',
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: values.name.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
          },
          shipping: {
            address: values.address.trim(),
            city: values.city.trim(),
            state: values.state.trim(),
            postalCode: values.postalCode.trim(),
            country: values.country.trim(),
          },
          items: lines.map((line) => ({
            slug: line.product.slug,
            size: line.item.size,
            quantity: line.item.quantity,
          })),
          idempotencyKey: idempotencyKey.current,
        }),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          payload && typeof payload === 'object' && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : 'We could not place your order. Please try again.';
        setSubmitError(message);
        // Stock or availability may have changed underneath us.
        void refresh();
        return;
      }

      const order = (payload as { order: OrderWithItems }).order;
      setPlaced(true);
      saveConfirmation(order);
      clearCart();
      void refresh();
      navigate(`/order/${order.order_number}`, { replace: true });
    } catch {
      setSubmitError(
        'We could not reach the server. Check your connection and try again - your cart is safe.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = (field: keyof FormValues) =>
    cn('field-input', errors[field] && 'border-brand focus:border-brand');

  const describedBy = (field: keyof FormValues) => (errors[field] ? `${field}-error` : undefined);

  return (
    <div className="container-site py-14 sm:py-20">
      <header className="max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Checkout</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">
          Enter your delivery details and place the order. We will call you to confirm before
          dispatch - no payment is taken online.
        </p>
      </header>

      {!isSupabaseConfigured && (
        <p className="mt-8 flex items-start gap-2.5 border border-brand/30 bg-brand/5 p-4 text-sm text-brand">
          <AlertCircle size={17} strokeWidth={1.8} className="mt-0.5 shrink-0" />
          Online ordering is not configured yet. Please call the shop to place your order.
        </p>
      )}

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <form onSubmit={handleSubmit} noValidate>
          <fieldset disabled={submitting} className="min-w-0 border-0 p-0">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
              Contact Details
            </h2>

            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="field-label">
                  Full Name *
                </label>
                <input
                  id="name"
                  autoComplete="name"
                  value={values.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={fieldClass('name')}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={describedBy('name')}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-xs text-brand">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="field-label">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={fieldClass('email')}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={describedBy('email')}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-brand">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="field-label">
                  Phone *
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={fieldClass('phone')}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={describedBy('phone')}
                />
                {errors.phone && (
                  <p id="phone-error" className="mt-1.5 text-xs text-brand">
                    {errors.phone}
                  </p>
                )}
              </div>
            </div>

            <h2 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.16em]">
              Delivery Address
            </h2>

            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="field-label">
                  Address *
                </label>
                <textarea
                  id="address"
                  rows={3}
                  autoComplete="street-address"
                  value={values.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={cn(fieldClass('address'), 'resize-y')}
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={describedBy('address')}
                />
                {errors.address && (
                  <p id="address-error" className="mt-1.5 text-xs text-brand">
                    {errors.address}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="field-label">
                  City *
                </label>
                <input
                  id="city"
                  autoComplete="address-level2"
                  value={values.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={fieldClass('city')}
                  aria-invalid={Boolean(errors.city)}
                  aria-describedby={describedBy('city')}
                />
                {errors.city && (
                  <p id="city-error" className="mt-1.5 text-xs text-brand">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="field-label">
                  State *
                </label>
                <input
                  id="state"
                  autoComplete="address-level1"
                  value={values.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={fieldClass('state')}
                  aria-invalid={Boolean(errors.state)}
                  aria-describedby={describedBy('state')}
                />
                {errors.state && (
                  <p id="state-error" className="mt-1.5 text-xs text-brand">
                    {errors.state}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className="field-label">
                  Postal Code *
                </label>
                <input
                  id="postalCode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={values.postalCode}
                  onChange={(e) => handleChange('postalCode', e.target.value)}
                  className={fieldClass('postalCode')}
                  aria-invalid={Boolean(errors.postalCode)}
                  aria-describedby={describedBy('postalCode')}
                />
                {errors.postalCode && (
                  <p id="postalCode-error" className="mt-1.5 text-xs text-brand">
                    {errors.postalCode}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="field-label">
                  Country *
                </label>
                <input
                  id="country"
                  autoComplete="country-name"
                  value={values.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className={fieldClass('country')}
                  aria-invalid={Boolean(errors.country)}
                  aria-describedby={describedBy('country')}
                />
                {errors.country && (
                  <p id="country-error" className="mt-1.5 text-xs text-brand">
                    {errors.country}
                  </p>
                )}
              </div>
            </div>

            {submitError && (
              <p
                role="alert"
                className="mt-8 flex items-start gap-2.5 border border-brand/30 bg-brand/5 p-4 text-sm text-brand"
              >
                <AlertCircle size={17} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || lines.length === 0}
              className="btn-primary mt-8 w-full sm:w-auto sm:min-w-[18rem]"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} strokeWidth={2} className="animate-spin" />
                  Placing Order
                </>
              ) : (
                'Place Order'
              )}
            </button>

            <p className="mt-4 flex items-center gap-2 text-xs text-ink/50">
              <Lock size={13} strokeWidth={1.8} />
              No payment is taken online. We confirm every order by phone.
            </p>
          </fieldset>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-sand p-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">Order Summary</h2>
            <p className="mt-1 text-xs text-ink/55">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </p>

            <ul className="mt-5 space-y-4 border-b border-ink/10 pb-5">
              {lines.map((line) => (
                <li key={line.item.key} className="flex gap-3">
                  <img
                    src={line.product.images[0]}
                    alt={line.product.name}
                    width={900}
                    height={1125}
                    loading="lazy"
                    className="h-20 w-16 shrink-0 bg-beige object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.product.name}</p>
                    <p className="mt-1 text-xs text-ink/55">
                      {line.item.size !== ONE_SIZE && `${line.item.size} - `}
                      Qty {line.item.quantity}
                    </p>
                    <p className="mt-1 text-xs text-ink/55">
                      {formatPrice(line.product.price)} each
                    </p>
                  </div>
                  <span className="shrink-0 text-sm">{formatPrice(line.lineTotal)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-3 text-sm">
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

            <Link
              to="/cart"
              className="mt-5 block text-center text-xs uppercase tracking-[0.14em] text-ink/60 transition-colors hover:text-ink"
            >
              Edit Cart
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
