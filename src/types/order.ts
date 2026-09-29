export const ORDER_STATUSES = [
  'NEW',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string;
  size: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;

  customer_name: string;
  customer_email: string;
  customer_phone: string;

  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;

  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;

  payment_status: PaymentStatus;
  order_status: OrderStatus;

  created_at: string;
  updated_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

/** Shape posted to /api/orders. */
export interface PlaceOrderRequest {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: { slug: string; size: string; quantity: number }[];
  /** Client-generated UUID; a retry with the same key returns the same order. */
  idempotencyKey: string;
}

export interface PlaceOrderResponse {
  order: OrderWithItems;
}
