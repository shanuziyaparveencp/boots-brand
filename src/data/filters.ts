import type { Department, Product } from '../types/product';

export type FilterId = 'all' | 'footwear' | 'bags' | 'trolleys' | 'mens' | 'womens';

export interface CategoryFilter {
  id: FilterId;
  label: string;
  match: (product: Product) => boolean;
}

export const categoryFilters: CategoryFilter[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'footwear', label: 'Footwear', match: (p) => p.department === 'footwear' },
  { id: 'bags', label: 'Bags', match: (p) => p.department === 'bags' },
  { id: 'trolleys', label: 'Trolleys', match: (p) => p.department === 'trolleys' },
  { id: 'mens', label: "Men's", match: (p) => p.gender === 'men' || p.gender === 'unisex' },
  { id: 'womens', label: "Women's", match: (p) => p.gender === 'women' || p.gender === 'unisex' },
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

/** The three departments, shown as image cards on the home page. */
export const departmentCards: {
  department: Department;
  filter: FilterId;
  label: string;
  blurb: string;
  image: string;
}[] = [
  {
    department: 'footwear',
    filter: 'footwear',
    label: 'Footwear',
    blurb: 'Boots, sneakers, formal shoes and sandals',
    image: '/images/categories/footwear.jpg',
  },
  {
    department: 'bags',
    filter: 'bags',
    label: 'Bags',
    blurb: 'Backpacks, handbags and duffels',
    image: '/images/categories/bags.jpg',
  },
  {
    department: 'trolleys',
    filter: 'trolleys',
    label: 'Trolleys',
    blurb: 'Cabin, check-in and matching sets',
    image: '/images/categories/trolleys.jpg',
  },
];
