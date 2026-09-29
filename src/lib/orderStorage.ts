import type { OrderWithItems } from '../types/order';

/**
 * The confirmation page renders from the payload the order API returned.
 *
 * Orders are deliberately not readable from the browser (Row Level Security
 * closes them to anonymous users), so instead of re-fetching we keep the
 * just-placed order in sessionStorage. It survives a refresh, and disappears
 * when the tab closes.
 */
const keyFor = (orderNumber: string) => `bhm.order.${orderNumber}`;

export function saveConfirmation(order: OrderWithItems): void {
  try {
    sessionStorage.setItem(keyFor(order.order_number), JSON.stringify(order));
  } catch {
    // Private mode or blocked storage - the confirmation still renders from
    // navigation state on this page load.
  }
}

export function loadConfirmation(orderNumber: string): OrderWithItems | null {
  try {
    const raw = sessionStorage.getItem(keyFor(orderNumber));
    return raw ? (JSON.parse(raw) as OrderWithItems) : null;
  } catch {
    return null;
  }
}
