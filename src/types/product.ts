export type ProductCategory = 'casual' | 'chelsea' | 'work' | 'hiking';

export type ProductGender = 'men' | 'women' | 'unisex';

export type ProductSize = 6 | 7 | 8 | 9 | 10 | 11;

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
  /** Price in Indian rupees. */
  price: number;
  category: ProductCategory;
  gender: ProductGender;
  colors: ProductColor[];
  sizes: ProductSize[];
  /** First image is used as the card / primary image. */
  images: string[];
  material: string;
  care: string;
  featured: boolean;
}
