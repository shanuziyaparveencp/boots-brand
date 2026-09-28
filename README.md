# Boots Hyper Market

The public website for Boots Hyper Market - footwear, bags and trolleys, serving the same
neighbourhood since 1980. Built with React, TypeScript, Vite and Tailwind CSS.

No backend, no database, no authentication and no payments. The cart lives in React state and is
persisted to `localStorage`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Start the Vite dev server (port 5173)            |
| `npm run build`     | Type-check with `tsc -b`, then build to `dist/`  |
| `npm run preview`   | Serve the production build locally               |
| `npm run typecheck` | Type-check only                                  |

## Departments

The catalogue is organised into three departments, defined by the `Department` type:

| Department | Categories                            |
| ---------- | ------------------------------------- |
| Footwear   | boots, sneakers, formal, sandals      |
| Bags       | backpacks, handbags, duffels          |
| Trolleys   | cabin, checkin, sets                  |

## Routes

| Path            | Page                                         |
| --------------- | -------------------------------------------- |
| `/`             | Home                                         |
| `/shop`         | Catalogue (`?filter=`, `?sort=`, `?q=`)      |
| `/shop/:slug`   | Product details                              |
| `/about`        | About                                        |
| `/contact`      | Contact                                      |
| `/cart`         | Cart                                         |
| `/boots*`       | Redirects to `/shop` (legacy links)          |
| anything else   | 404                                          |

## Project structure

```
public/
  favicon.svg
  images/
    logo.png              Transparent white wordmark used in the header/footer
    logo-full.png         Original square logo supplied by the shop
    hero.jpg, story.jpg
    about/                About page imagery
    categories/           Department card imagery
    products/             <slug>-1.jpg, <slug>-2.jpg per product
src/
  components/             Header, Footer, ProductCard, ProductGrid, ProductFilters,
                          ProductImageGallery, CartItem, QuantityStepper,
                          SectionHeading, Toast, ScrollToTop
  context/CartContext.tsx Cart state + localStorage persistence
  data/products.ts        Mock catalogue (29 products)
  data/filters.ts         Filters, sort options, department cards
  hooks/useCart.ts        Cart accessor hook
  layouts/SiteLayout.tsx  Header + <Outlet /> + Footer
  lib/format.ts           INR price formatting, className helper
  pages/                  Home, Shop, ProductDetails, About, Contact, Cart, NotFound
  types/                  Product and cart models
```

## Replacing the placeholder content

**Products** live in `src/data/products.ts`, typed by `Product` in `src/types/product.ts`. Nothing
else reads product data directly, so editing that array is enough.

**Sizes** are plain strings. Footwear uses UK sizes, trolleys use shell heights and bags use
`One Size`. A product with a single size skips the size picker automatically.

**Images** are plain files under `public/images/`, referenced by path. Product images follow
`/images/products/<slug>-1.jpg` and `-2.jpg`. Drop real photos in at the same paths - no code
changes needed. A 4:5 portrait crop matches the layout.

**Brand colour** is `brand` in `tailwind.config.js`, sampled from the shop logo.

## Connecting a backend later

- `src/context/CartContext.tsx` is the only place cart mutations happen.
- `src/pages/Contact.tsx` validates the form then stops; the marked comment is where a `POST` goes.
- `Proceed to Checkout` in `src/pages/Cart.tsx` is intentionally inert.

## Deploying

`dist/` is a static site.

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

`vercel.json` pins the Vite framework preset and rewrites unknown paths to `index.html`, so
refreshing a deep link such as `/shop/cabin-trolley-55` works.

## Notes

- Product photography is licence-free stock used as placeholder, stored locally so the site needs
  no external CDN at runtime.
- Prices are mock values in INR. Shipping is INR 199, free over INR 4,999.
