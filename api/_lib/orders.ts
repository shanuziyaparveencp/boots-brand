/**
 * Shared helpers for the order API. Files under api/ that start with an
 * underscore are not deployed as their own serverless functions.
 */

export interface IncomingItem {
  slug: string;
  size: string;
  quantity: number;
}

export interface ValidatedItem {
  product_id: string;
  product_name: string;
  product_image: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export class OrderError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string = 'ORDER_ERROR',
  ) {
    super(message);
  }
}

const MAX_ITEMS = 50;
const MAX_QUANTITY_PER_LINE = 20;

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export interface CustomerDetails {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
}

/** Validates the customer half of the payload and returns clean values. */
export function parseCustomer(body: Record<string, unknown>): CustomerDetails {
  const customer = (body.customer ?? {}) as Record<string, unknown>;
  const shipping = (body.shipping ?? {}) as Record<string, unknown>;

  const details: CustomerDetails = {
    customer_name: str(customer.name),
    customer_email: str(customer.email).toLowerCase(),
    customer_phone: str(customer.phone),
    shipping_address: str(shipping.address),
    shipping_city: str(shipping.city),
    shipping_state: str(shipping.state),
    shipping_postal_code: str(shipping.postalCode),
    shipping_country: str(shipping.country) || 'India',
  };

  const missing: string[] = [];
  if (!details.customer_name) missing.push('name');
  if (!details.customer_email) missing.push('email');
  if (!details.customer_phone) missing.push('phone');
  if (!details.shipping_address) missing.push('address');
  if (!details.shipping_city) missing.push('city');
  if (!details.shipping_state) missing.push('state');
  if (!details.shipping_postal_code) missing.push('postal code');

  if (missing.length > 0) {
    throw new OrderError(400, `Please fill in: ${missing.join(', ')}.`, 'MISSING_FIELDS');
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(details.customer_email)) {
    throw new OrderError(400, 'Please enter a valid email address.', 'INVALID_EMAIL');
  }

  const digits = details.customer_phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) {
    throw new OrderError(400, 'Please enter a valid phone number.', 'INVALID_PHONE');
  }

  if (!/^\d{4,10}$/.test(details.shipping_postal_code.replace(/\s/g, ''))) {
    throw new OrderError(400, 'Please enter a valid postal code.', 'INVALID_POSTCODE');
  }

  return details;
}

/** Validates the cart half of the payload into a normalised list. */
export function parseItems(body: Record<string, unknown>): IncomingItem[] {
  const raw = body.items;
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new OrderError(400, 'Your cart is empty.', 'EMPTY_CART');
  }
  if (raw.length > MAX_ITEMS) {
    throw new OrderError(400, 'That is too many items for one order.', 'TOO_MANY_ITEMS');
  }

  return raw.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const slug = str(item.slug);
    const size = str(item.size);
    const quantity = Number(item.quantity);

    if (!slug || !size) {
      throw new OrderError(400, 'Your cart contains an invalid item.', 'INVALID_ITEM');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      throw new OrderError(400, 'Invalid quantity in your cart.', 'INVALID_QUANTITY');
    }
    return { slug, size, quantity };
  });
}

export interface ProductRecord {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  images: string[] | null;
  sizes: string[] | null;
  stock: number;
  is_active: boolean;
}

/**
 * Re-prices the cart against the database. Nothing the browser sent about
 * price or availability is trusted.
 */
export function validateAndPrice(
  items: IncomingItem[],
  products: ProductRecord[],
): { lineItems: ValidatedItem[]; subtotal: number } {
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  // Sum quantities per product first, so two lines of the same product in
  // different sizes cannot together exceed stock.
  const totalPerProduct = new Map<string, number>();
  for (const item of items) {
    totalPerProduct.set(item.slug, (totalPerProduct.get(item.slug) ?? 0) + item.quantity);
  }

  const lineItems: ValidatedItem[] = [];

  for (const item of items) {
    const product = bySlug.get(item.slug);

    if (!product || !product.is_active) {
      throw new OrderError(
        409,
        `"${item.slug}" is no longer available. Please remove it from your cart.`,
        'PRODUCT_UNAVAILABLE',
      );
    }

    const sizes = product.sizes ?? [];
    if (sizes.length > 0 && !sizes.includes(item.size)) {
      throw new OrderError(
        409,
        `Size ${item.size} is not available for ${product.name}.`,
        'INVALID_SIZE',
      );
    }

    const requested = totalPerProduct.get(item.slug) ?? item.quantity;
    if (requested > product.stock) {
      throw new OrderError(
        409,
        product.stock === 0
          ? `${product.name} is out of stock.`
          : `Only ${product.stock} left of ${product.name}.`,
        'OUT_OF_STOCK',
      );
    }

    const unitPrice = Number(product.price);
    lineItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] ?? '',
      size: item.size,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: round2(unitPrice * item.quantity),
    });
  }

  const subtotal = round2(lineItems.reduce((sum, line) => sum + line.total_price, 0));
  return { lineItems, subtotal };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function envNumber(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/** Authoritative shipping calculation. Mirrors estimateShipping on the client. */
export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  const fee = envNumber('SHIPPING_FEE', 100);
  const threshold = envNumber('FREE_SHIPPING_THRESHOLD', 4999);
  return subtotal >= threshold ? 0 : fee;
}
