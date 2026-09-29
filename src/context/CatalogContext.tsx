import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types/product';
import { products as bundledProducts } from '../data/products';
import { supabase } from '../lib/supabase';
import { PRODUCT_COLUMNS, mapProductRow } from '../lib/catalog';
import type { ProductRow } from '../lib/catalog';

export type CatalogSource = 'supabase' | 'bundled';

export interface CatalogContextValue {
  products: Product[];
  loading: boolean;
  /** Set when Supabase was configured but the fetch failed. */
  error: string | null;
  source: CatalogSource;
  getProductBySlug: (slug: string) => Product | undefined;
  refresh: () => Promise<void>;
}

export const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  // Start from the bundled catalogue so the first paint is never empty, then
  // swap in live data (prices, stock, availability) once it arrives.
  const [products, setProducts] = useState<Product[]>(bundledProducts);
  const [source, setSource] = useState<CatalogSource>('bundled');
  const [loading, setLoading] = useState<boolean>(Boolean(supabase));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from('products')
      .select(PRODUCT_COLUMNS)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (queryError) {
      // Keep showing the bundled catalogue rather than an empty shop.
      setError('Live catalogue unavailable, showing saved product list.');
      setSource('bundled');
    } else if (data && data.length > 0) {
      setProducts((data as unknown as ProductRow[]).map(mapProductRow));
      setSource('supabase');
      setError(null);
    } else {
      // Table exists but is empty (not seeded yet).
      setError(null);
      setSource('bundled');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo<CatalogContextValue>(() => {
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    return {
      products,
      loading,
      error,
      source,
      getProductBySlug: (slug: string) => bySlug.get(slug),
      refresh: load,
    };
  }, [products, loading, error, source, load]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}
