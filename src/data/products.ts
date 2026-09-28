import type { Product } from '../types/product';
import { ONE_SIZE } from '../types/product';

/**
 * Mock catalogue for Boots Hyper Market. Replace these entries (and the
 * matching files in `public/images/products/`) with real stock when a backend
 * is connected — nothing else in the app reads product data directly.
 */

export const SHOE_SIZES = ['6', '7', '8', '9', '10', '11'];

const img = (slug: string, n: number) => `/images/products/${slug}-${n}.jpg`;
const images = (slug: string) => [img(slug, 1), img(slug, 2)];

const BLACK = { name: 'Black', hex: '#12110F' };
const DARK_BROWN = { name: 'Dark Brown', hex: '#4A3728' };
const TAN = { name: 'Tan', hex: '#A3764A' };
const CREAM = { name: 'Cream', hex: '#E8DFD2' };
const NAVY = { name: 'Navy', hex: '#26324A' };
const MAROON = { name: 'Maroon', hex: '#5C1014' };
const GREY = { name: 'Grey', hex: '#8C857B' };
const OLIVE = { name: 'Olive', hex: '#5A5B3C' };
const SILVER = { name: 'Silver', hex: '#B9BCC0' };

export const products: Product[] = [
  // ---------------------------------------------------------------- footwear
  {
    id: 'bhm-001',
    name: 'Classic Leather Boot',
    slug: 'classic-leather-boot',
    description:
      'A full-grain leather lace-up built on a Goodyear welt, finished with a cushioned footbed for all-day wear.',
    price: 2999,
    department: 'footwear',
    category: 'boots',
    gender: 'men',
    colors: [DARK_BROWN, BLACK],
    sizes: SHOE_SIZES,
    images: images('classic-leather-boot'),
    material: 'Full-grain leather upper, leather lining, rubber outsole',
    care: 'Wipe with a damp cloth, condition with leather cream every few months, air dry away from direct heat.',
    featured: true,
  },
  {
    id: 'bhm-002',
    name: 'Urban Chelsea Boot',
    slug: 'urban-chelsea-boot',
    description:
      'A clean-lined Chelsea with twin elastic gussets and a low stacked heel — easy to pull on, easy to wear.',
    price: 3499,
    department: 'footwear',
    category: 'boots',
    gender: 'unisex',
    colors: [BLACK, TAN],
    sizes: SHOE_SIZES,
    images: images('urban-chelsea-boot'),
    material: 'Smooth calf leather upper, elastic side panels, rubber outsole',
    care: 'Brush off dust after wear. Use a neutral polish to restore shine. Avoid soaking the elastic panels.',
    featured: false,
  },
  {
    id: 'bhm-003',
    name: 'Rugged Work Boot',
    slug: 'rugged-work-boot',
    description:
      'Built for long days on site. Reinforced stitching, a padded collar and a deep-lug outsole for grip.',
    price: 3999,
    department: 'footwear',
    category: 'boots',
    gender: 'men',
    colors: [{ name: 'Wheat', hex: '#C2A171' }, DARK_BROWN],
    sizes: SHOE_SIZES,
    images: images('rugged-work-boot'),
    material: 'Oiled nubuck upper, padded collar, slip-resistant rubber outsole',
    care: 'Remove mud before it dries. Re-oil the nubuck seasonally to keep it water resistant.',
    featured: false,
  },
  {
    id: 'bhm-004',
    name: 'Everyday Ankle Boot',
    slug: 'everyday-ankle-boot',
    description:
      'A neat ankle silhouette with a side zip and a block heel that stays comfortable from morning to evening.',
    price: 2799,
    department: 'footwear',
    category: 'boots',
    gender: 'women',
    colors: [BLACK, CREAM],
    sizes: SHOE_SIZES,
    images: images('everyday-ankle-boot'),
    material: 'Soft leather upper, textile lining, 35mm block heel',
    care: 'Store upright with a boot shaper. Clean with a soft cloth and leather conditioner.',
    featured: true,
  },
  {
    id: 'bhm-005',
    name: 'Heritage Lace-Up Boot',
    slug: 'heritage-lace-up-boot',
    description:
      'Brogue detailing over a classic derby last. A dress boot that holds its shape season after season.',
    price: 4299,
    department: 'footwear',
    category: 'boots',
    gender: 'men',
    colors: [{ name: 'Cognac', hex: '#8E5A2B' }, BLACK],
    sizes: SHOE_SIZES,
    images: images('heritage-lace-up-boot'),
    material: 'Burnished calf leather, leather insole, stacked leather heel',
    care: 'Use shoe trees between wears. Polish regularly and resole when the tread wears through.',
    featured: false,
  },
  {
    id: 'bhm-006',
    name: 'Trail Hiking Boot',
    slug: 'trail-hiking-boot',
    description:
      'A mid-cut trail boot with ankle support, a moisture-wicking lining and a grip outsole for uneven ground.',
    price: 4599,
    department: 'footwear',
    category: 'boots',
    gender: 'unisex',
    colors: [OLIVE, { name: 'Charcoal', hex: '#3A3A38' }],
    sizes: SHOE_SIZES,
    images: images('trail-hiking-boot'),
    material: 'Nubuck and textile upper, moisture-wicking lining, multi-directional lug outsole',
    care: 'Rinse off grit after hikes, loosen the laces and let them dry fully before storing.',
    featured: false,
  },
  {
    id: 'bhm-007',
    name: 'Suede Chelsea Boot',
    slug: 'suede-chelsea-boot',
    description:
      'Soft suede with a slim profile and a pull tab at the heel. Light enough for everyday, smart enough for evenings.',
    price: 3299,
    department: 'footwear',
    category: 'boots',
    gender: 'women',
    colors: [{ name: 'Sand', hex: '#CDB79A' }, GREY],
    sizes: SHOE_SIZES,
    images: images('suede-chelsea-boot'),
    material: 'Suede upper, elastic side panels, lightweight rubber sole',
    care: 'Use a suede brush to lift the nap and a protector spray before first wear.',
    featured: false,
  },
  {
    id: 'bhm-008',
    name: 'Steel Toe Site Boot',
    slug: 'steel-toe-site-boot',
    description:
      'Safety-rated protection with a steel toe cap, oil-resistant sole and a shank that supports the arch.',
    price: 4999,
    department: 'footwear',
    category: 'boots',
    gender: 'men',
    colors: [BLACK, DARK_BROWN],
    sizes: SHOE_SIZES,
    images: images('steel-toe-site-boot'),
    material: 'Water-resistant leather, steel toe cap, oil-resistant rubber outsole',
    care: 'Clean after each shift and check the laces and eyelets regularly for wear.',
    featured: false,
  },
  {
    id: 'bhm-009',
    name: 'Minimal Desert Boot',
    slug: 'minimal-desert-boot',
    description:
      'Two-eyelet desert boot on a soft crepe sole. Pared back, lightweight and easy to pack.',
    price: 2499,
    department: 'footwear',
    category: 'boots',
    gender: 'unisex',
    colors: [{ name: 'Sand', hex: '#CDB79A' }, { name: 'Chocolate', hex: '#5C3D25' }],
    sizes: SHOE_SIZES,
    images: images('minimal-desert-boot'),
    material: 'Suede upper, unlined interior, natural crepe sole',
    care: 'Keep away from standing water. Brush the suede in one direction to keep the nap even.',
    featured: false,
  },
  {
    id: 'bhm-010',
    name: 'Winter Lined Boot',
    slug: 'winter-lined-boot',
    description:
      'A taller shaft with a warm brushed lining and a sealed seam construction for cold, wet mornings.',
    price: 3899,
    department: 'footwear',
    category: 'boots',
    gender: 'women',
    colors: [BLACK, { name: 'Taupe', hex: '#9C8A77' }],
    sizes: SHOE_SIZES,
    images: images('winter-lined-boot'),
    material: 'Leather upper, brushed warm lining, sealed seams, grip outsole',
    care: 'Dry naturally at room temperature. Treat with a water repellent before winter.',
    featured: false,
  },
  {
    id: 'bhm-011',
    name: 'Field Combat Boot',
    slug: 'field-combat-boot',
    description:
      'Speed hooks, a reinforced toe and a broad outsole. A sturdy everyday boot with a utility edge.',
    price: 3699,
    department: 'footwear',
    category: 'boots',
    gender: 'unisex',
    colors: [BLACK, OLIVE],
    sizes: SHOE_SIZES,
    images: images('field-combat-boot'),
    material: 'Leather and canvas upper, speed-hook lacing, cushioned rubber outsole',
    care: 'Wipe clean, then condition the leather panels. Replace the laces as they fray.',
    featured: false,
  },
  {
    id: 'bhm-012',
    name: 'Alpine Trek Boot',
    slug: 'alpine-trek-boot',
    description:
      'Our most supportive boot. A stiffer midsole and high-abrasion heel for long distances and heavy loads.',
    price: 5299,
    department: 'footwear',
    category: 'boots',
    gender: 'men',
    colors: [{ name: 'Brown', hex: '#6B4A2F' }, BLACK],
    sizes: SHOE_SIZES,
    images: images('alpine-trek-boot'),
    material: 'Full-grain leather upper, stiffened midsole, high-abrasion rubber outsole',
    care: 'Clean the welt after use and store in a dry place with the laces loosened.',
    featured: false,
  },
  {
    id: 'bhm-013',
    name: 'Court Sneaker',
    slug: 'court-sneaker',
    description:
      'A clean white court shoe on a cupsole. Minimal branding, easy to keep smart and goes with everything.',
    price: 1899,
    department: 'footwear',
    category: 'sneakers',
    gender: 'unisex',
    colors: [{ name: 'White', hex: '#F2F0EC' }, BLACK],
    sizes: SHOE_SIZES,
    images: images('court-sneaker'),
    material: 'Leather upper, textile lining, vulcanised rubber cupsole',
    care: 'Wipe with a damp cloth and mild soap. Air dry; do not machine wash.',
    featured: true,
  },
  {
    id: 'bhm-014',
    name: 'Air Runner Sneaker',
    slug: 'air-runner-sneaker',
    description:
      'A cushioned everyday running silhouette with a breathable mesh upper and a lightweight foam midsole.',
    price: 2499,
    department: 'footwear',
    category: 'sneakers',
    gender: 'unisex',
    colors: [{ name: 'White / Orange', hex: '#E4855A' }, GREY],
    sizes: SHOE_SIZES,
    images: images('air-runner-sneaker'),
    material: 'Engineered mesh upper, foam midsole, rubber outsole',
    care: 'Remove the insoles and laces before cleaning. Air dry away from direct sun.',
    featured: false,
  },
  {
    id: 'bhm-015',
    name: 'Oxford Brogue Shoe',
    slug: 'oxford-brogue-shoe',
    description:
      'A closed-lacing Oxford with full brogue punching. The formal shoe to keep for weddings and work.',
    price: 2799,
    department: 'footwear',
    category: 'formal',
    gender: 'men',
    colors: [{ name: 'Cognac', hex: '#8E5A2B' }, BLACK],
    sizes: SHOE_SIZES,
    images: images('oxford-brogue-shoe'),
    material: 'Polished calf leather, leather sole, leather lining',
    care: 'Use shoe trees, polish before each wear and rotate pairs to let the leather rest.',
    featured: true,
  },
  {
    id: 'bhm-016',
    name: 'Derby Formal Shoe',
    slug: 'derby-formal-shoe',
    description:
      'Open lacing gives a roomier fit than an Oxford, so it suits a wider foot without losing the smart line.',
    price: 2399,
    department: 'footwear',
    category: 'formal',
    gender: 'men',
    colors: [BLACK, DARK_BROWN],
    sizes: SHOE_SIZES,
    images: images('derby-formal-shoe'),
    material: 'Calf leather upper, leather lining, stacked heel',
    care: 'Condition every few months and keep away from prolonged damp.',
    featured: false,
  },
  {
    id: 'bhm-017',
    name: 'Comfort Slide Sandal',
    slug: 'comfort-slide-sandal',
    description:
      'A contoured footbed that moulds to the foot, with adjustable buckle straps for an exact fit.',
    price: 899,
    department: 'footwear',
    category: 'sandals',
    gender: 'unisex',
    colors: [TAN, BLACK],
    sizes: SHOE_SIZES,
    images: images('comfort-slide-sandal'),
    material: 'Leather straps, cork and latex footbed, EVA outsole',
    care: 'Keep the footbed dry. Brush off sand and wipe the straps with a damp cloth.',
    featured: false,
  },
  {
    id: 'bhm-018',
    name: 'Summer Strap Sandal',
    slug: 'summer-strap-sandal',
    description:
      'A low platform sandal with soft leather straps — dressy enough for evenings, easy enough for every day.',
    price: 1199,
    department: 'footwear',
    category: 'sandals',
    gender: 'women',
    colors: [MAROON, TAN],
    sizes: SHOE_SIZES,
    images: images('summer-strap-sandal'),
    material: 'Leather upper, padded insole, lightweight platform sole',
    care: 'Store away from direct heat so the straps keep their shape.',
    featured: false,
  },

  // -------------------------------------------------------------------- bags
  {
    id: 'bhm-019',
    name: 'Everyday Laptop Backpack',
    slug: 'everyday-laptop-backpack',
    description:
      'A padded 15" laptop sleeve, water-resistant shell and enough organisation for a full day out.',
    price: 1999,
    department: 'bags',
    category: 'backpacks',
    gender: 'unisex',
    colors: [NAVY, BLACK],
    sizes: [ONE_SIZE],
    images: images('everyday-laptop-backpack'),
    material: 'Water-resistant polyester, padded laptop sleeve, YKK zips',
    care: 'Spot clean with mild soap and water. Do not tumble dry.',
    featured: true,
  },
  {
    id: 'bhm-020',
    name: 'Canvas Trek Backpack',
    slug: 'canvas-trek-backpack',
    description:
      'Waxed canvas and leather trim over a roomy 30-litre main compartment. Made for weekends away.',
    price: 2499,
    department: 'bags',
    category: 'backpacks',
    gender: 'unisex',
    colors: [DARK_BROWN, OLIVE],
    sizes: [ONE_SIZE],
    images: images('canvas-trek-backpack'),
    material: 'Waxed canvas body, full-grain leather trim, brass hardware',
    care: 'Re-wax the canvas once a year. Wipe the leather with a barely damp cloth.',
    featured: false,
  },
  {
    id: 'bhm-021',
    name: 'Woven Leather Tote',
    slug: 'woven-leather-tote',
    description:
      'A soft woven tote that holds its shape, with a lined interior and a zip pocket for essentials.',
    price: 2899,
    department: 'bags',
    category: 'handbags',
    gender: 'women',
    colors: [TAN, BLACK],
    sizes: [ONE_SIZE],
    images: images('woven-leather-tote'),
    material: 'Woven leather, cotton lining, magnetic closure',
    care: 'Store stuffed to keep the weave even. Keep away from prolonged damp.',
    featured: false,
  },
  {
    id: 'bhm-022',
    name: 'Structured Satchel',
    slug: 'structured-satchel',
    description:
      'A firm-sided satchel with buckle straps and a detachable shoulder strap for carrying two ways.',
    price: 3299,
    department: 'bags',
    category: 'handbags',
    gender: 'women',
    colors: [GREY, MAROON],
    sizes: [ONE_SIZE],
    images: images('structured-satchel'),
    material: 'Structured leather, gold-tone hardware, detachable strap',
    care: 'Wipe with a soft dry cloth and store in the dust bag provided.',
    featured: false,
  },
  {
    id: 'bhm-023',
    name: 'Top Handle Handbag',
    slug: 'top-handle-handbag',
    description:
      'A compact top-handle bag in smooth leather. Neat enough for occasions, roomy enough for daily use.',
    price: 2599,
    department: 'bags',
    category: 'handbags',
    gender: 'women',
    colors: [DARK_BROWN, CREAM],
    sizes: [ONE_SIZE],
    images: images('top-handle-handbag'),
    material: 'Smooth leather, fabric lining, flap closure',
    care: 'Avoid overfilling so the frame keeps its shape.',
    featured: true,
  },
  {
    id: 'bhm-024',
    name: 'Leather Duffel Bag',
    slug: 'leather-duffel-bag',
    description:
      'A cabin-friendly weekender in thick leather, with a wide opening and a padded shoulder strap.',
    price: 3999,
    department: 'bags',
    category: 'duffels',
    gender: 'unisex',
    colors: [DARK_BROWN, BLACK],
    sizes: [ONE_SIZE],
    images: images('leather-duffel-bag'),
    material: 'Thick full-grain leather, cotton twill lining, metal feet',
    care: 'Condition twice a year. The leather will darken and soften with use.',
    featured: false,
  },

  // ---------------------------------------------------------------- trolleys
  {
    id: 'bhm-025',
    name: 'Cabin Trolley 55cm',
    slug: 'cabin-trolley-55',
    description:
      'Fits most cabin size limits. Four spinner wheels, a TSA lock and a split interior with tie-down straps.',
    price: 4499,
    department: 'trolleys',
    category: 'cabin',
    gender: 'unisex',
    colors: [NAVY, CREAM],
    sizes: ['55 cm'],
    images: images('cabin-trolley-55'),
    material: 'Polypropylene hard shell, aluminium handle, dual spinner wheels',
    care: 'Wipe the shell with a damp cloth. Check wheel screws occasionally.',
    featured: true,
  },
  {
    id: 'bhm-026',
    name: 'Check-In Trolley 65cm',
    slug: 'check-in-trolley-65',
    description:
      'A medium check-in case with an expander zip for the return leg, and a fully lined split interior.',
    price: 5499,
    department: 'trolleys',
    category: 'checkin',
    gender: 'unisex',
    colors: [{ name: 'Graphite', hex: '#4A4D52' }, MAROON],
    sizes: ['65 cm', '75 cm'],
    images: images('check-in-trolley-65'),
    material: 'Ribbed hard shell, expander zip, TSA combination lock',
    care: 'Do not overfill past the expander. Clean scuffs with a soft cloth.',
    featured: false,
  },
  {
    id: 'bhm-027',
    name: 'Aluminium Hard Trolley',
    slug: 'aluminium-hard-trolley',
    description:
      'A full aluminium shell with recessed latches. Heavier than plastic, and far better at taking a knock.',
    price: 7999,
    department: 'trolleys',
    category: 'cabin',
    gender: 'unisex',
    colors: [SILVER, { name: 'Graphite', hex: '#4A4D52' }],
    sizes: ['55 cm', '65 cm'],
    images: images('aluminium-hard-trolley'),
    material: 'Anodised aluminium shell, recessed latches, silent spinner wheels',
    care: 'Scratches are normal and part of the finish. Keep the latches free of grit.',
    featured: false,
  },
  {
    id: 'bhm-028',
    name: 'Business Trolley 45cm',
    slug: 'business-trolley-45',
    description:
      'An underseat case with a front laptop compartment, so the essentials stay reachable in transit.',
    price: 4999,
    department: 'trolleys',
    category: 'cabin',
    gender: 'unisex',
    colors: [MAROON, BLACK],
    sizes: ['45 cm'],
    images: images('business-trolley-45'),
    material: 'Hard shell with front-opening laptop pocket, USB pass-through',
    care: 'Keep the front pocket clear of sharp items to protect the laptop panel.',
    featured: false,
  },
  {
    id: 'bhm-029',
    name: '3-Piece Trolley Set',
    slug: 'trolley-set-3piece',
    description:
      'Cabin, medium and large in one matching set, each nesting inside the next for easy storage.',
    price: 9999,
    department: 'trolleys',
    category: 'sets',
    gender: 'unisex',
    colors: [NAVY, MAROON],
    sizes: ['55 + 65 + 75 cm'],
    images: images('trolley-set-3piece'),
    material: 'Polypropylene shells, aluminium handles, TSA locks on all three',
    care: 'Nest the cases for storage. Clean each shell with a damp cloth.',
    featured: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getFeaturedProducts(limit = 4): Product[] {
  return products.filter((product) => product.featured).slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (candidate) => candidate.id !== product.id && candidate.category === product.category,
  );
  const sameDepartment = products.filter(
    (candidate) =>
      candidate.id !== product.id &&
      candidate.category !== product.category &&
      candidate.department === product.department,
  );
  const others = products.filter(
    (candidate) => candidate.id !== product.id && candidate.department !== product.department,
  );
  return [...sameCategory, ...sameDepartment, ...others].slice(0, limit);
}
