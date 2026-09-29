import type { ValidatedItem } from './orders';

interface NotificationInput {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: ValidatedItem[];
  total: number;
}

const inr = (value: number) =>
  `Rs. ${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

/**
 * Sends the admin a new-order notification through Resend.
 *
 * Returns a result rather than throwing: a missing API key or a Resend outage
 * must never fail an order that has already been written to the database.
 */
export async function sendAdminNotification(
  input: NotificationInput,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  const from = process.env.FROM_EMAIL ?? 'onboarding@resend.dev';

  if (!apiKey || !to) {
    return { sent: false, reason: 'email not configured' };
  }

  const dashboard = process.env.ADMIN_DASHBOARD_URL ?? '';

  const itemLines = input.items
    .map(
      (item) =>
        `${item.product_name}\nSize: ${item.size}\nQuantity: ${item.quantity}\nPrice: ${inr(item.total_price)}`,
    )
    .join('\n\n');

  const text = [
    'New order received.',
    '',
    `Order:\n${input.orderNumber}`,
    '',
    `Customer:\n${input.customerName}`,
    '',
    `Phone:\n${input.customerPhone}`,
    '',
    `Email:\n${input.customerEmail}`,
    '',
    `Items:\n${itemLines}`,
    '',
    `Total:\n${inr(input.total)}`,
    dashboard ? `\nAdmin dashboard:\n${dashboard}` : '',
  ].join('\n');

  try {
    // 8s ceiling so a slow provider cannot hold the request open.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New Order - ${input.orderNumber}`,
        text,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      return { sent: false, reason: `resend ${response.status} ${detail.slice(0, 200)}` };
    }
    return { sent: true };
  } catch (error) {
    return { sent: false, reason: error instanceof Error ? error.message : 'unknown error' };
  }
}
