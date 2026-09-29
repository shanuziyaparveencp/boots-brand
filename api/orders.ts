import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import {
  OrderError,
  calculateShipping,
  parseCustomer,
  parseItems,
  round2,
  validateAndPrice,
} from './_lib/orders';
import type { ProductRecord } from './_lib/orders';
import { sendAdminNotification } from './_lib/email';

/**
 * POST /api/orders - creates an order.
 *
 * Runs with the Supabase service-role key, which bypasses Row Level Security.
 * That key exists only in the serverless environment and is never sent to the
 * browser. Prices, stock and totals are all recalculated here; the request
 * body only says which product, which size and how many.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Supabase server credentials are missing.');
    return res.status(503).json({
      error: 'Ordering is temporarily unavailable. Please call the shop to place your order.',
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const body: Record<string, unknown> =
      typeof req.body === 'string' ? JSON.parse(req.body) : ((req.body ?? {}) as Record<string, unknown>);

    const customer = parseCustomer(body);
    const items = parseItems(body);
    const idempotencyKey =
      typeof body.idempotencyKey === 'string' ? body.idempotencyKey.slice(0, 100) : '';

    // A retry of a submission that already succeeded returns the first order
    // instead of creating a second one.
    if (idempotencyKey) {
      const { data: existing } = await admin
        .from('orders')
        .select('*, order_items(*)')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();

      if (existing) {
        return res.status(200).json({ order: existing, duplicate: true });
      }
    }

    const slugs = [...new Set(items.map((item) => item.slug))];
    const { data: products, error: productError } = await admin
      .from('products')
      .select('id, name, slug, price, images, sizes, stock, is_active')
      .in('slug', slugs);

    if (productError) {
      console.error('Product lookup failed:', productError);
      return res
        .status(503)
        .json({ error: 'We could not reach the catalogue. Please try again in a moment.' });
    }

    const { lineItems, subtotal } = validateAndPrice(items, (products ?? []) as ProductRecord[]);
    const shippingFee = calculateShipping(subtotal);
    const total = round2(subtotal + shippingFee);

    const { data: order, error: orderError } = await admin.rpc('create_order', {
      payload: {
        ...customer,
        subtotal,
        shipping_fee: shippingFee,
        discount: 0,
        total_amount: total,
        idempotency_key: idempotencyKey || null,
        items: lineItems,
      },
    });

    if (orderError || !order) {
      console.error('Order creation failed:', orderError);
      return res
        .status(500)
        .json({ error: 'We could not place your order. Please try again.' });
    }

    // Re-read with items so the confirmation page has everything it needs.
    const { data: fullOrder } = await admin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', (order as { id: string }).id)
      .single();

    const created = fullOrder ?? order;

    // Email is best-effort: the order is already committed at this point.
    const email = await sendAdminNotification({
      orderNumber: (created as { order_number: string }).order_number,
      customerName: customer.customer_name,
      customerPhone: customer.customer_phone,
      customerEmail: customer.customer_email,
      items: lineItems,
      total,
    });

    if (!email.sent) {
      console.warn('Admin notification not sent:', email.reason);
    }

    return res.status(201).json({ order: created });
  } catch (error) {
    if (error instanceof OrderError) {
      return res.status(error.status).json({ error: error.message, code: error.code });
    }
    // Never surface a raw database or runtime error to the customer.
    console.error('Unexpected order error:', error);
    return res
      .status(500)
      .json({ error: 'Something went wrong placing your order. Please try again.' });
  }
}
