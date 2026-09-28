import type { ProductSize } from './product';

export interface CartItem {
  /** `${productId}-${size}` — one line per product/size combination. */
  key: string;
  productId: string;
  size: ProductSize;
  color: string;
  quantity: number;
}
