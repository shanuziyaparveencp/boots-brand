export interface CartItem {
  /** `${productId}-${size}` — one line per product/size combination. */
  key: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
}
