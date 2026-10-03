import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/order-lookup - lets a guest customer check their own order.
 *
 * Orders are closed to anonymous users by Row Level Security, so this runs
 * with the service-role key instead. It only ever returns a row when the order
 * number AND the email on that order both match, so an order number alone is
 * not enough to read someone else's details.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ error: 'Order lookup is temporarily unavailable.' });
  }

  try {
    const body: Record<string, unknown> =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : ((req.body ?? {}) as Record<string, unknown>);

    const orderNumber = String(body.orderNumber ?? '').trim().toUpperCase();
    const email = String(body.email ?? '').trim().toLowerCase();

    if (!orderNumber || !email) {
      return res.status(400).json({ error: 'Enter your order number and email address.' });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await admin
      .from('orders')
      .select(
        `order_number, created_at, updated_at,
         customer_name, customer_phone,
         shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country,
         subtotal, shipping_fee, discount, total_amount,
         order_status, payment_status, payment_method, paid_at,
         order_items ( product_name, product_image, size, quantity, unit_price, total_price )`,
      )
      .eq('order_number', orderNumber)
      .eq('customer_email', email)
      .maybeSingle();

    if (error) {
      console.error('Order lookup failed:', error);
      return res.status(503).json({ error: 'Could not check that order. Please try again.' });
    }

    if (!data) {
      // Deliberately vague: this must not reveal whether the order number is
      // real when the email does not match.
      return res
        .status(404)
        .json({ error: 'No order found with that order number and email address.' });
    }

    // payment_reference and payment_note are internal and are not returned.
    return res.status(200).json({ order: data });
  } catch (error) {
    console.error('Unexpected lookup error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
