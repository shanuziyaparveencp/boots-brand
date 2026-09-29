import type { OrderStatus, PaymentStatus } from '../../types/order';
import { cn } from '../../lib/format';

const ORDER_TONES: Record<OrderStatus, string> = {
  NEW: 'bg-brand text-cream',
  CONFIRMED: 'bg-clay text-cream',
  PACKED: 'bg-beige text-ink',
  SHIPPED: 'bg-stone text-cream',
  DELIVERED: 'bg-ink text-cream',
  CANCELLED: 'bg-sand text-ink/50 line-through',
};

const PAYMENT_TONES: Record<PaymentStatus, string> = {
  PENDING: 'border-ink/25 text-ink/60',
  PAID: 'border-ink/60 text-ink',
  FAILED: 'border-brand/50 text-brand',
  REFUNDED: 'border-ink/25 text-ink/50',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
        ORDER_TONES[status],
      )}
    >
      {status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        'inline-block border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]',
        PAYMENT_TONES[status],
      )}
    >
      {status}
    </span>
  );
}
