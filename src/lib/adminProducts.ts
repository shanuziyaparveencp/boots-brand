import { requireSupabase } from './supabase';
import type { ProductColor } from '../types/product';

export const PRODUCT_STATUSES = ['active', 'draft', 'inactive'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  inactive: 'Inactive',
};

/** A products row as the admin edits it. */
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  department: string;
  category: string;
  gender: string;
  material: string;
  care: string;
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  stock: number;
  featured: boolean;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

/** Everything the form writes. id/timestamps are managed by the database. */
export type ProductDraft = Omit<AdminProduct, 'id' | 'created_at' | 'updated_at'>;

const COLUMNS =
  'id, name, slug, short_description, description, price, compare_at_price, department, category, gender, material, care, colors, sizes, images, stock, featured, status, created_at, updated_at';

function normalise(row: Record<string, unknown>): AdminProduct {
  return {
    ...(row as unknown as AdminProduct),
    price: Number(row.price),
    compare_at_price:
      row.compare_at_price === null || row.compare_at_price === undefined
        ? null
        : Number(row.compare_at_price),
    colors: (row.colors as ProductColor[]) ?? [],
    sizes: (row.sizes as string[]) ?? [],
    images: (row.images as string[]) ?? [],
  };
}

/**
 * Turns a Supabase error into something safe to show a shop owner.
 * Raw Postgres messages leak schema details and read as gibberish.
 */
export function friendlyError(error: { message?: string; code?: string } | null): string {
  if (!error) return 'Something went wrong. Please try again.';
  const message = error.message ?? '';

  if (error.code === '23505' || /duplicate key/i.test(message)) {
    return 'That URL slug is already used by another product. Choose a different one.';
  }
  if (error.code === '42501' || /row-level security/i.test(message)) {
    return 'You do not have permission to do that. Try signing in again.';
  }
  if (/violates check constraint/i.test(message)) {
    return 'Some values are out of range. Check the price and stock.';
  }
  if (/fetch|network/i.test(message)) {
    return 'Could not reach the server. Check your connection and try again.';
  }
  return 'Something went wrong. Please try again.';
}

export async function listProducts(): Promise<AdminProduct[]> {
  const { data, error } = await requireSupabase()
    .from('products')
    .select(COLUMNS)
    .order('created_at', { ascending: false });

  if (error) throw new Error(friendlyError(error));
  return (data ?? []).map((row) => normalise(row as Record<string, unknown>));
}

export async function getProduct(id: string): Promise<AdminProduct> {
  const { data, error } = await requireSupabase()
    .from('products')
    .select(COLUMNS)
    .eq('id', id)
    .single();

  if (error) throw new Error(friendlyError(error));
  return normalise(data as Record<string, unknown>);
}

export async function createProduct(draft: ProductDraft): Promise<AdminProduct> {
  const { data, error } = await requireSupabase()
    .from('products')
    .insert(draft)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(friendlyError(error));
  return normalise(data as Record<string, unknown>);
}

export async function updateProduct(
  id: string,
  draft: Partial<ProductDraft>,
): Promise<AdminProduct> {
  const { data, error } = await requireSupabase()
    .from('products')
    .update(draft)
    .eq('id', id)
    .select(COLUMNS)
    .single();

  if (error) throw new Error(friendlyError(error));
  return normalise(data as Record<string, unknown>);
}

/**
 * Products are deactivated rather than deleted. Order history keeps its own
 * snapshot of name/image/price, but keeping the row means the admin can still
 * see what was sold and can bring the product back.
 */
export async function setProductStatus(id: string, status: ProductStatus): Promise<void> {
  const { error } = await requireSupabase().from('products').update({ status }).eq('id', id);
  if (error) throw new Error(friendlyError(error));
}

/** Builds a URL-safe slug from a product name. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function emptyDraft(): ProductDraft {
  return {
    name: '',
    slug: '',
    short_description: '',
    description: '',
    price: 0,
    compare_at_price: null,
    department: 'footwear',
    category: 'boots',
    gender: 'unisex',
    material: '',
    care: '',
    colors: [],
    sizes: [],
    images: [],
    stock: 0,
    featured: false,
    status: 'draft',
  };
}
