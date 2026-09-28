# Northbound — Boots Brand Website

A clean, responsive marketing + catalogue site for a footwear brand, built with React, TypeScript,
Vite and Tailwind CSS. No backend, no database, no authentication, no payments — the cart is held in
React state and persisted to `localStorage`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command             | What it does                                        |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server (port 5173)               |
| `npm run build`     | Type-check with `tsc -b`, then build to `dist/`     |
| `npm run preview`   | Serve the production build locally                  |
| `npm run typecheck` | Type-check only                                     |

## Project structure

```
public/
  favicon.svg
  images/
    hero.jpg              Home hero
    story.jpg             Brand story section
    about/                About page imagery
    categories/           Category card imagery
    products/             <slug>-1.jpg, <slug>-2.jpg per product
src/
  components/             Header, Footer, ProductCard, ProductGrid, ProductFilters,
                          ProductImageGallery, CartItem, QuantityStepper,
                          SectionHeading, Toast, ScrollToTop
  context/CartContext.tsx Cart state + localStorage persistence
  data/products.ts        Mock catalogue (12 products)
  data/filters.ts         Category filters, sort options, category cards
  hooks/useCart.ts        Cart accessor hook
  layouts/SiteLayout.tsx  Header + <Outlet /> + Footer
  lib/format.ts           INR price formatting, className helper
  pages/                  Home, Boots, ProductDetails, About, Contact, Cart, NotFound
  types/                  Product and cart models
```

## Routes

| Path            | Page                                          |
| --------------- | --------------------------------------------- |
| `/`             | Home                                          |
| `/boots`        | Catalogue (`?filter=`, `?sort=`, `?q=`)       |
| `/boots/:slug`  | Product details                               |
| `/about`        | About                                         |
| `/contact`      | Contact                                       |
| `/cart`         | Cart                                          |
| anything else   | 404                                           |

## Replacing the placeholder content

**Products** live in `src/data/products.ts`. Each entry is typed by `Product` in
`src/types/product.ts`. To swap in real products, edit that array — nothing else references product
data directly.

**Images** are plain files under `public/images/`, referenced by path. Product images follow the
convention `/images/products/<slug>-1.jpg` (card + gallery primary) and `-2.jpg`. Drop real photos
in at the same paths and no code changes are needed. A 4:5 portrait crop matches the existing
layout.

**Brand name** appears in `src/components/Header.tsx`, `src/components/Footer.tsx` and
`index.html`.

## Connecting a backend later

- `src/context/CartContext.tsx` is the single place cart mutations happen — swap the
  `localStorage` effect for API calls.
- `src/pages/Contact.tsx` validates the form and then no-ops; the marked comment is where a
  `POST` belongs.
- `Proceed to Checkout` in `src/pages/Cart.tsx` is intentionally inert.

## Deploying

The build output in `dist/` is a static site. On any host, use:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

Because the app uses client-side routing, the host must rewrite unknown paths to `index.html`,
otherwise a refresh on `/boots/classic-leather-boot` returns a 404:

- **Netlify** — add `public/_redirects` containing `/*  /index.html  200`
- **Vercel** — detected automatically for Vite SPAs
- **GitHub Pages** — copy `dist/index.html` to `dist/404.html`, and set `base` in
  `vite.config.ts` to `/<repo-name>/`

## Notes

- Images are licence-free stock photography used as placeholders; they are stored locally so no
  external CDN is required at runtime.
- Prices are mock values in INR. Shipping is ₹199, free over ₹4,999 (`src/context/CartContext.tsx`).
- Sizes are UK 6–11.
