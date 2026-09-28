import type { Product } from '../types/product';

export type FilterId = 'all' | 'mens' | 'womens' | 'casual' | 'work';

export interface CategoryFilter {
  id: FilterId;
  label: string;
  match: (product: Product) => boolean;
}

export const categoryFilters: CategoryFilter[] = [
  { id: 'all', label: 'All', match: () => true },
  {
    id: 'mens',
    label: "Men's",
    match: (product) => product.gender === 'men' || product.gender === 'unisex',
  },
  {
    id: 'womens',
    label: "Women's",
    match: (product) => product.gender === 'women' || product.gender === 'unisex',
  },
  {
    id: 'casual',
    label: 'Casual',
    match: (product) => product.category === 'casual' || product.category === 'chelsea',
  },
  {
    id: 'work',
    label: 'Work Boots',
    match: (product) => product.category === 'work' || product.category === 'hiking',
  },
];

export function isFilterId(value: string | null): value is FilterId {
  return categoryFilters.some((filter) => filter.id === value);
}

export type SortId = 'featured' | 'price-asc' | 'price-desc' | 'name';

export const sortOptions: { id: SortId; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'name', label: 'Name' },
];

export function isSortId(value: string | null): value is SortId {
  return sortOptions.some((option) => option.id === value);
}

export function sortProducts(list: Product[], sort: SortId): Product[] {
  const sorted = [...list];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'featured':
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export const categoryCards: { filter: FilterId; label: string; image: string }[] = [
  { filter: 'mens', label: "Men's Boots", image: '/images/categories/mens.jpg' },
  { filter: 'womens', label: "Women's Boots", image: '/images/categories/womens.jpg' },
  { filter: 'casual', label: 'Casual Boots', image: '/images/categories/casual.jpg' },
  { filter: 'work', label: 'Work Boots', image: '/images/categories/work.jpg' },
];
