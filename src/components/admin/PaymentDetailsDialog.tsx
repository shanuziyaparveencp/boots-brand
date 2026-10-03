import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/format';
import { formatPrice } from '../../lib/format';

export interface PaymentDetails {
  payment_reference: string;
  payment_method: string;
  payment_note: string;
}

export const PAYMENT_METHODS = ['UPI', 'Cash', 'Card', 'Bank Transfer', 'Other'] as const;

interface PaymentDetailsDialogProps {
  open: boolean;
  orderNumber: string;
  amount: number;
  busy?: boolean;
  error?: string | null;
  onConfirm: (details: PaymentDetails) => void;
  onCancel: () => void;
}

/**
 * Shown when staff mark an order as paid, so there is always a record of how
 * the money actually arrived.
 */
export default function PaymentDetailsDialog({
  open,
  orderNumber,
  amount,
  busy = false,
  error,
  onConfirm,
  onCancel,
}: PaymentDetailsDialogProps) {
  const [method, setMethod] = useState<string>('UPI');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState(false);

  // Reset whenever the dialog opens for a different order.
  useEffect(() => {
    if (open) {
      setMethod('UPI');
      setReference('');
      setNote('');
      setTouched(false);
    }
  }, [open, orderNumber]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  // Cash in the shop has no reference number, so only require one otherwise.
  const referenceRequired = method !== 'Cash';
  const referenceMissing = referenceRequired && !reference.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (referenceMissing) return;
    onConfirm({
      payment_reference: reference.trim(),
      payment_method: method,
      payment_note: note.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/50 px-5 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md border border-ink/10 bg-cream p-6 shadow-lg"
      >
        <h2 id="payment-title" className="text-lg font-semibold tracking-tight">
          Record payment
        </h2>
        <p className="mt-2 text-sm text-ink/65">
          Marking <span className="font-medium text-ink">{orderNumber}</span> as paid
          {amount > 0 && <> for {formatPrice(amount)}</>}. Enter how the payment arrived.
        </p>

        <fieldset disabled={busy} className="mt-6 min-w-0 border-0 p-0">
          <div>
            <label htmlFor="payment-method" className="field-label">
              Payment Method *
            </label>
            <select
              id="payment-method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="field-input"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label htmlFor="payment-reference" className="field-label">
              Transaction Reference {referenceRequired ? '*' : '(optional)'}
            </label>
            <input
              id="payment-reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={
                method === 'UPI'
                  ? 'UPI transaction ID'
                  : method === 'Cash'
                    ? 'Receipt number, if any'
                    : 'Transaction / reference number'
              }
              className={cn(
                'field-input',
                touched && referenceMissing && 'border-brand focus:border-brand',
              )}
            />
            {touched && referenceMissing && (
              <p className="mt-1.5 text-xs text-brand">
                Enter the transaction reference, or choose Cash.
              </p>
            )}
          </div>

          <div className="mt-5">
            <label htmlFor="payment-note" className="field-label">
              Note (optional)
            </label>
            <textarea
              id="payment-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything worth remembering about this payment"
              className="field-input resize-y"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2 border border-brand/30 bg-brand/5 p-3 text-xs text-brand"
            >
              <AlertCircle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="btn-secondary px-6 py-2.5 disabled:opacity-40"
            >
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary px-6 py-2.5">
              {busy ? (
                <>
                  <Loader2 size={14} strokeWidth={2} className="animate-spin" />
                  Saving
                </>
              ) : (
                'Mark as Paid'
              )}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
