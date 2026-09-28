import type { Product, ProductSize } from '../types/product';

/**
 * Mock catalogue. Replace these entries (and the matching files in
 * `public/images/products/`) with real product data when a backend is added.
 */

export const ALL_SIZES: ProductSize[] = [6, 7, 8, 9, 10, 11];

const img = (slug: string, n: number) => `/images/products/${slug}-${n}.jpg`;

export const products: Product[] = [
  {
    id: 'nb-001',
    name: 'Classic Leather Boot',
    slug: 'classic-leather-boot',
    description:
      'A full-grain leather lace-up built on a Goodyear welt, finished with a cushioned footbed for all-day wear.',
    price: 2999,
    category: 'casual',
    gender: 'men',
    colors: [
      { name: 'Dark Brown', hex: '#4A3728' },
      { name: 'Black', hex: '#12110F' },
    ],
    sizes: ALL_SIZES,
    images: [img('classic-leather-boot', 1), img('classic-leather-boot', 2)],
    material: 'Full-grain leather upper, leather lining, rubber outsole',
    care: 'Wipe with a damp cloth, condition with leather cream every few months, air dry away from direct heat.',
    featured: true,
  },
  {
    id: 'nb-002',
    name: 'Urban Chelsea Boot',
    slug: 'urban-chelsea-boot',
    description:
      'A clean-lined Chelsea with twin elastic gussets and a low stacked heel — easy to pull on, easy to wear.',
    price: 3499,
    category: 'chelsea',
    gender: 'unisex',
    colors: [
      { name: 'Black', hex: '#12110F' },
      { name: 'Tan', hex: '#A3764A' },
    ],
    sizes: ALL_SIZES,
    images: [img('urban-chelsea-boot', 1), img('urban-chelsea-boot', 2)],
    material: 'Smooth calf leather upper, elastic side panels, rubber outsole',
    care: 'Brush off dust after wear. Use a neutral polish to restore shine. Avoid soaking the elastic panels.',
    featured: true,
  },
  {
    id: 'nb-003',
    name: 'Rugged Work Boot',
    slug: 'rugged-work-boot',
    description:
      'Built for long days on site. Reinforced stitching, a padded collar and a deep-lug outsole for grip.',
    price: 3999,
    category: 'work',
    gender: 'men',
    colors: [
      { name: 'Wheat', hex: '#C2A171' },
      { name: 'Dark Brown', hex: '#4A3728' },
    ],
    sizes: ALL_SIZES,
    images: [img('rugged-work-boot', 1), img('rugged-work-boot', 2)],
    material: 'Oiled nubuck upper, padded collar, slip-resistant rubber outsole',
    care: 'Remove mud before it dries. Re-oil the nubuck seasonally to keep it water resistant.',
    featured: true,
  },
  {
    id: 'nb-004',
    name: 'Everyday Ankle Boot',
    slug: 'everyday-ankle-boot',
    description:
      'A neat ankle silhouette with a side zip and a block heel that stays comfortable from morning to evening.',
    price: 2799,
    category: 'casual',
    gender: 'women',
    colors: [
      { name: 'Black', hex: '#12110F' },
      { name: 'Cream', hex: '#E8DFD2' },
    ],
    sizes: ALL_SIZES,
    images: [img('everyday-ankle-boot', 1), img('everyday-ankle-boot', 2)],
    material: 'Soft leather upper, textile lining, 35mm block heel',
    care: 'Store upright with a boot shaper. Clean with a soft cloth and leather conditioner.',
    featured: true,
  },
  {
    id: 'nb-005',
    name: 'Heritage Lace-Up Boot',
    slug: 'heritage-lace-up-boot',
    description:
      'Brogue detailing over a classic derby last. A dress boot that holds its shape season after season.',
    price: 4299,
    category: 'casual',
    gender: 'men',
    colors: [
      { name: 'Cognac', hex: '#8E5A2B' },
      { name: 'Black', hex: '#12110F' },
    ],
    sizes: ALL_SIZES,
    images: [img('heritage-lace-up-boot', 1), img('heritage-lace-up-boot', 2)],
    material: 'Burnished calf leather, leather insole, stacked leather heel',
    care: 'Use shoe trees between wears. Polish regularly and resole when the tread wears through.',
    featured: false,
  },
  {
    id: 'nb-006',
    name: 'Trail Hiking Boot',
    slug: 'trail-hiking-boot',
    description:
      'A mid-cut trail boot with ankle support, a moisture-wicking lining and a grip outsole for uneven ground.',
    price: 4599,
    category: 'hiking',
    gender: 'unisex',
    colors: [
      { name: 'Olive', hex: '#5A5B3C' },
      { name: 'Charcoal', hex: '#3A3A38' },
    ],
    sizes: ALL_SIZES,
    images: [img('trail-hiking-boot', 1), img('trail-hiking-boot', 2)],
    material: 'Nubuck and textile upper, moisture-wicking lining, multi-directional lug outsole',
    care: 'Rinse off grit after hikes, loosen the laces and let them dry fully before storing.',
    featured: false,
  },
  {
    id: 'nb-007',
    name: 'Suede Chelsea Boot',
    slug: 'suede-chelsea-boot',
    description:
      'Soft suede with a slim profile and a pull tab at the heel. Light enough for everyday, smart enough for evenings.',
    price: 3299,
    category: 'chelsea',
    gender: 'women',
    colors: [
      { name: 'Sand', hex: '#CDB79A' },
      { name: 'Grey', hex: '#8C857B' },
    ],
    sizes: ALL_SIZES,
    images: [img('suede-chelsea-boot', 1), img('suede-chelsea-boot', 2)],
    material: 'Suede upper, elastic side panels, lightweight rubber sole',
    care: 'Use a suede brush to lift the nap and a protector spray before first wear.',
    featured: false,
  },
  {
    id: 'nb-008',
    name: 'Steel Toe Site Boot',
    slug: 'steel-toe-site-boot',
    description:
      'Safety-rated protection with a steel toe cap, oil-resistant sole and a shank that supports the arch.',
    price: 4999,
    category: 'work',
    gender: 'men',
    colors: [
      { name: 'Black', hex: '#12110F' },
      { name: 'Dark Brown', hex: '#4A3728' },
    ],
    sizes: ALL_SIZES,
    images: [img('steel-toe-site-boot', 1), img('steel-toe-site-boot', 2)],
    material: 'Water-resistant leather, steel toe cap, oil-resistant rubber outsole',
    care: 'Clean after each shift and check the laces and eyelets regularly for wear.',
    featured: false,
  },
  {
    id: 'nb-009',
    name: 'Minimal Desert Boot',
    slug: 'minimal-desert-boot',
    description:
      'Two-eyelet desert boot on a soft crepe sole. Pared back, lightweight and easy to pack.',
    price: 2499,
    category: 'casual',
    gender: 'unisex',
    colors: [
      { name: 'Sand', hex: '#CDB79A' },
      { name: 'Chocolate', hex: '#5C3D25' },
    ],
    sizes: ALL_SIZES,
    images: [img('minimal-desert-boot', 1), img('minimal-desert-boot', 2)],
    material: 'Suede upper, unlined interior, natural crepe sole',
    care: 'Keep away from standing water. Brush the suede in one direction to keep the nap even.',
    featured: false,
  },
  {
    id: 'nb-010',
    name: 'Winter Lined Boot',
    slug: 'winter-lined-boot',
    description:
      'A taller shaft with a warm brushed lining and a sealed seam construction for cold, wet mornings.',
    price: 3899,
    category: 'casual',
    gender: 'women',
    colors: [
      { name: 'Black', hex: '#12110F' },
      { name: 'Taupe', hex: '#9C8A77' },
    ],
    sizes: ALL_SIZES,
    images: [img('winter-lined-boot', 1), img('winter-lined-boot', 2)],
    material: 'Leather upper, brushed warm lining, sealed seams, grip outsole',
    care: 'Dry naturally at room temperature. Treat with a water repellent before winter.',
    featured: false,
  },
  {
    id: 'nb-011',
    name: 'Field Combat Boot',
    slug: 'field-combat-boot',
    description:
      'Speed hooks, a reinforced toe and a broad outsole. A sturdy everyday boot with a utility edge.',
    price: 3699,
    category: 'work',
    gender: 'unisex',
    colors: [
      { name: 'Black', hex: '#12110F' },
      { name: 'Olive', hex: '#5A5B3C' },
    ],
    sizes: ALL_SIZES,
    images: [img('field-combat-boot', 1), img('field-combat-boot', 2)],
    material: 'Leather and canvas upper, speed-hook lacing, cushioned rubber outsole',
    care: 'Wipe clean, then condition the leather panels. Replace the laces as they fray.',
    featured: false,
  },
  {
    id: 'nb-012',
    name: 'Alpine Trek Boot',
    slug: 'alpine-trek-boot',
    description:
      'Our most supportive boot. A stiffer midsole and high-abrasion heel for long distances and heavy loads.',
    price: 5299,
    category: 'hiking',
    gender: 'men',
    colors: [
      { name: 'Brown', hex: '#6B4A2F' },
      { name: 'Black', hex: '#12110F' },
    ],
    sizes: ALL_SIZES,
    images: [img('alpine-trek-boot', 1), img('alpine-trek-boot', 2)],
    material: 'Full-grain leather upper, stiffened midsole, high-abrasion rubber outsole',
    care: 'Clean the welt after use and store in a dry place with the laces loosened.',
    featured: false,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (candidate) => candidate.id !== product.id && candidate.category === product.category,
  );
  const others = products.filter(
    (candidate) => candidate.id !== product.id && candidate.category !== product.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}
