export interface CartItem {
  /** `${slug}-${size}` - one line per product/size combination. */
  key: string;
  /**
   * Product slug. Slugs are stable across the bundled catalogue and Supabase,
   * so the cart survives the switch between the two and is what checkout
   * sends to the server.
   */
  slug: string;
  size: string;
  color: string;
  quantity: number;
}
