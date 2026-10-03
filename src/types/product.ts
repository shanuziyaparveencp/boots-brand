export type Department = 'footwear' | 'bags' | 'trolleys';

export type ProductCategory =
  // footwear
  | 'boots'
  | 'sneakers'
  | 'formal'
  | 'sandals'
  // bags
  | 'backpacks'
  | 'handbags'
  | 'duffels'
  // trolleys
  | 'cabin'
  | 'checkin'
  | 'sets';

export type ProductGender = 'men' | 'women' | 'unisex';

export interface ProductColor {
  /** Human readable colour name shown in the UI. */
  name: string;
  /** CSS colour used for the swatch. */
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** One-line summary for product cards. Falls back to description when empty. */
  shortDescription?: string;
  /** Price in Indian rupees. */
  price: number;
  department: Department;
  category: ProductCategory;
  gender: ProductGender;
  colors: ProductColor[];
  /**
   * Selectable sizes. Footwear uses UK shoe sizes, trolleys use shell heights
   * and bags are usually a single option. A product with one entry skips the
   * size picker and uses that value automatically.
   */
  sizes: string[];
  /** First image is used as the card / primary image. */
  images: string[];
  material: string;
  care: string;
  featured: boolean;
  /**
   * Units available. Undefined means stock is not tracked for this product
   * (the bundled fallback catalogue), in which case quantity is uncapped.
   */
  stock?: number;
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  footwear: 'Footwear',
  bags: 'Bags',
  trolleys: 'Trolleys',
};

/** Heading shown above the size picker for each department. */
export const SIZE_LABELS: Record<Department, string> = {
  footwear: 'Select Size (UK)',
  bags: 'Size',
  trolleys: 'Select Size',
};

export const ONE_SIZE = 'One Size';
