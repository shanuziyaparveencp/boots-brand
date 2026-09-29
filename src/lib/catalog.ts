import type {
  Department,
  Product,
  ProductCategory,
  ProductColor,
  ProductGender,
} from '../types/product';

/** A row of public.products as returned by Supabase. */
export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  images: string[] | null;
  sizes: string[] | null;
  category: string;
  stock: number;
  is_active: boolean;
  department: string;
  gender: string;
  colors: ProductColor[] | null;
  material: string;
  care: string;
  featured: boolean;
}

/** Columns the storefront needs; keeps the select list in one place. */
export const PRODUCT_COLUMNS =
  'id, name, slug, description, price, images, sizes, category, stock, is_active, department, gender, colors, material, care, featured';

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    department: row.department as Department,
    category: row.category as ProductCategory,
    gender: row.gender as ProductGender,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    images: row.images ?? [],
    material: row.material,
    care: row.care,
    featured: row.featured,
    stock: row.stock,
  };
}

/** How many units a customer may still add, given what is already in the cart. */
export function availableStock(product: Product): number {
  return typeof product.stock === 'number' ? product.stock : Number.POSITIVE_INFINITY;
}

export function isInStock(product: Product): boolean {
  return availableStock(product) > 0;
}
