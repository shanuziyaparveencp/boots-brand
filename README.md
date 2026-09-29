# Boots Hyper Market

The website and order system for Boots Hyper Market — footwear, bags and trolleys, serving the
same neighbourhood since 1980.

Customers browse, add to cart and place an order as a guest. Orders land in Supabase and the shop
manages them from a simple admin dashboard. No payment gateway (yet), no customer accounts.

## Architecture

```
CUSTOMER
   |
VERCEL
   |-- Customer website (React SPA)
   |-- Checkout
   |-- Admin dashboard
   `-- /api/orders  (serverless function)
            |
        SUPABASE
        |-- PostgreSQL (products, orders, order_items)
        `-- Auth (admin sign-in)

EMAIL: Resend (optional)
```

There is no separate server to run or maintain. Everything is Vercel + Supabase, both on free
tiers. Resend is optional and also free up to 100 emails/day.

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, react-router-dom, Supabase.

## Getting started

```bash
npm install
cp .env.example .env     # then fill in the two Supabase keys
npm run dev              # http://localhost:5173
```

`npm run dev` serves the site *and* the functions in `/api`, so checkout works locally exactly as
it does on Vercel.

## Scripts

| Command             | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Dev server + local `/api` functions, port 5173          |
| `npm run build`     | Type-check app and API, then build to `dist/`           |
| `npm run preview`   | Serve the production build locally                      |
| `npm run typecheck` | Type-check only                                         |
| `npm run seed`      | Regenerate `supabase/seed.sql` from `src/data/products.ts` |

## Supabase setup

Done once, from the Supabase dashboard.

1. **Create the tables.** SQL Editor → New query → paste all of **`supabase/schema.sql`** → Run.
   This creates `products`, `orders`, `order_items`, the order-number generator, the
   `create_order` function and all Row Level Security policies.
2. **Load the products.** New query → paste all of **`supabase/seed.sql`** → Run. That inserts the
   29 products from the catalogue. Re-running it updates existing rows instead of duplicating them,
   and leaves stock levels alone.
3. **Create the admin account.** Authentication → Users → Add user → Create new user. Enter an
   email and password and tick **Auto Confirm User**. One account is enough; there is no public
   sign-up.

Check it worked:

```bash
node scripts/check-db.mjs
```

That verifies the tables exist, products are readable with the public key, and orders are **not**
readable anonymously.

### Managing products

There is no product CMS yet — edit products directly in Supabase (Table Editor → `products`).
Useful columns: `price`, `stock`, `is_active` (untick to hide a product from the shop), `featured`.

The bundled catalogue in `src/data/products.ts` is only a fallback used when Supabase is
unreachable or not configured, plus the source for `npm run seed`.

## Environment variables

Local values live in `.env` (git-ignored). The same values go into
**Vercel → your project → Settings → Environment Variables**.

### Public — sent to the browser

| Variable | Notes |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API Keys → **Publishable key** (`sb_publishable_…`) |
| `VITE_SHIPPING_FEE` | Display only |
| `VITE_FREE_SHIPPING_THRESHOLD` | Display only |

The publishable key is safe in the browser: Row Level Security limits it to reading active
products, and to reading/updating orders only once an admin has signed in.

### Server only — never prefixed with `VITE_`

| Variable | Notes |
| --- | --- |
| `SUPABASE_URL` | Same project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys → **Secret key** (`sb_secret_…`). Bypasses RLS — keep secret |
| `SHIPPING_FEE` | **Authoritative.** The order total is calculated from this |
| `FREE_SHIPPING_THRESHOLD` | Authoritative free-delivery threshold |
| `RESEND_API_KEY` | Optional. Blank = no admin email, orders still succeed |
| `ADMIN_EMAIL` | Where new-order notifications go |
| `FROM_EMAIL` | Must be a Resend-verified domain, or `onboarding@resend.dev` for testing |
| `ADMIN_DASHBOARD_URL` | Link included in the notification email |

Vite only exposes variables beginning with `VITE_` to the browser, so the secret key and Resend key
cannot leak into the bundle.

## How an order is created

`POST /api/orders` runs as a Vercel serverless function with the service-role key. The browser only
sends *which product, which size, how many* — never a price.

1. Validate customer details and the cart shape.
2. Return the existing order if this `idempotencyKey` was already used (protects against
   double-submits).
3. Fetch the products fresh from Supabase by slug.
4. Reject anything inactive, an unknown size, or a quantity above stock.
5. Recalculate every line total, the subtotal, shipping and the grand total server-side.
6. Call `create_order`, which generates the order number and writes the order and its items in one
   transaction, then decrements stock.
7. Send the admin notification — failures here are logged and ignored, never rolled back.
8. Return the order; the browser clears the cart and shows the confirmation.

Order numbers look like `ORD-20260929-0001`, from a per-day counter that is safe under concurrent
checkouts. Internal UUIDs are never shown to customers.

`order_items` stores the product name, image and unit price as **snapshots**, so a past order stays
accurate after the catalogue changes.

### Statuses

`NEW → CONFIRMED → PACKED → SHIPPED → DELIVERED`, plus `CANCELLED`.
Payment: `PENDING → PAID`, plus `FAILED` / `REFUNDED`. Orders are created `PENDING` because there is
no online payment yet; the `payment_status` column and the API shape are already in place for
Razorpay later.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home |
| `/shop` | Catalogue (`?filter=`, `?sort=`, `?q=`) |
| `/shop/:slug` | Product details |
| `/cart` | Cart |
| `/checkout` | Guest checkout |
| `/order/:orderNumber` | Order confirmation |
| `/about`, `/contact` | Content pages |
| `/admin/login` | Admin sign-in (Supabase Auth) |
| `/admin/orders` | Order list — search, filter |
| `/admin/orders/:id` | Order detail, status updates |
| `/boots*` | Redirects to `/shop` (legacy links) |

## Project structure

```
api/
  orders.ts            POST /api/orders - the only serverless function
  _lib/orders.ts       validation, re-pricing, shipping (underscore = not an endpoint)
  _lib/email.ts        Resend notification, best-effort
supabase/
  schema.sql           tables, indexes, RLS, order-number + create_order functions
  seed.sql             generated product data
scripts/
  generate-seed.mjs    src/data/products.ts -> supabase/seed.sql
  check-db.mjs         connectivity and RLS check
  vite-api-plugin.mjs  serves /api during `npm run dev`
src/
  context/             CatalogContext, CartContext, AdminAuthContext
  pages/               Home, Shop, ProductDetails, Cart, Checkout,
                       OrderConfirmation, About, Contact, NotFound
  pages/admin/         AdminLogin, AdminOrders, AdminOrderDetail
  lib/                 supabase client, config, catalog mapping, formatting
```

## Deploying to Vercel

The project is already linked to Vercel and to GitHub, so **pushing to `main` deploys it**.

```bash
git push origin main
```

For a first-time setup elsewhere: import the repo in Vercel, framework preset **Vite**, build
command `npm run build`, output directory `dist`. Then add every variable from the table above under
Settings → Environment Variables (tick Production, Preview and Development) and redeploy.

`vercel.json` pins the Vite preset and rewrites unknown paths to `index.html` while leaving `/api/*`
alone, so deep links and the serverless function both work.

## Security notes

- The service-role key exists only in the serverless environment.
- RLS is on for every table. Anonymous users can read active products and nothing else — orders are
  completely closed to them.
- Any signed-in Supabase user can read and update orders. With one admin account that is fine; if
  you add staff accounts later, add an `admins` table and check membership in the policies.
- Customers never see raw database errors; the API returns plain-language messages.

## Known limitations

- No online payment. Orders are `PENDING` and confirmed by phone.
- Stock is one number per product, not per size.
- The admin order list loads the 50 most recent orders and filters them in the browser.
- The confirmation page reads from `sessionStorage`, so the link cannot be reopened on another
  device — deliberate, since orders are not publicly readable.
- Product editing happens in Supabase, not in the admin UI.
