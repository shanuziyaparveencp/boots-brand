import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '../types/cart';
import type { Product } from '../types/product';
import { useCatalog } from '../hooks/useCatalog';
import { availableStock } from '../lib/catalog';
import { estimateShipping } from '../lib/config';

// v2: cart lines are keyed by slug rather than by internal product id.
const STORAGE_KEY = 'bhm.cart.v2';

export interface CartLine {
  item: CartItem;
  product: Product;
  lineTotal: number;
  /** Units available right now; Infinity when stock is not tracked. */
  stock: number;
  /** True when the saved quantity exceeds what is currently in stock. */
  overStock: boolean;
}

export interface AddItemResult {
  added: number;
  /** True when the requested quantity was reduced to fit available stock. */
  clamped: boolean;
}

export interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  /** Lines whose quantity no longer fits stock; checkout is blocked on these. */
  hasStockProblem: boolean;
  addItem: (input: {
    product: Product;
    size: string;
    color: string;
    quantity: number;
  }) => AddItemResult;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.key === 'string' &&
    typeof candidate.slug === 'string' &&
    typeof candidate.size === 'string' &&
    typeof candidate.color === 'string' &&
    typeof candidate.quantity === 'number' &&
    candidate.quantity > 0
  );
}

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { getProductBySlug } = useCatalog();
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be unavailable (private mode, blocked cookies) - the cart
      // still works for the current session.
    }
  }, [items]);

  const addItem = useCallback<CartContextValue['addItem']>(
    ({ product, size, color, quantity }) => {
      const key = `${product.slug}-${size}`;
      const stock = availableStock(product);
      let added = quantity;
      let clamped = false;

      setItems((current) => {
        const existing = current.find((item) => item.key === key);
        const desired = (existing?.quantity ?? 0) + quantity;
        const next = Math.min(desired, stock);

        added = next - (existing?.quantity ?? 0);
        clamped = next < desired;

        if (next <= 0) return current;

        if (existing) {
          return current.map((item) =>
            item.key === key ? { ...item, quantity: next, color } : item,
          );
        }
        return [...current, { key, slug: product.slug, size, color, quantity: next }];
      });

      return { added, clamped };
    },
    [],
  );

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) => (item.key === key ? { ...item, quantity } : item)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines = items.reduce<CartLine[]>((acc, item) => {
      const product = getProductBySlug(item.slug);
      if (!product) return acc; // product withdrawn from sale
      const stock = availableStock(product);
      acc.push({
        item,
        product,
        lineTotal: product.price * item.quantity,
        stock,
        overStock: item.quantity > stock,
      });
      return acc;
    }, []);

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const shipping = estimateShipping(subtotal);

    return {
      items,
      lines,
      itemCount: lines.reduce((sum, line) => sum + line.item.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      hasStockProblem: lines.some((line) => line.overStock),
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    };
  }, [items, getProductBySlug, addItem, removeItem, setQuantity, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
