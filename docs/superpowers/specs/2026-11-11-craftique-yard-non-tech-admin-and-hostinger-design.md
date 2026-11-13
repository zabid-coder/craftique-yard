# Craftique Yard: Non-Tech Admin UX, Product Serial Ordering & Hostinger Readiness Design

**Date:** 2026-11-11
**Project Path:** `/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard`
**Target Hosting:** Hostinger Business Plan (Managed Node.js Web App `>=22.13.0` + MySQL)
**Checkout Preference:** Keep existing flexible checkout (`COD` + manual `bKash`/`Nagad` toggles in Admin Settings + optional `/account` sign-in + guest checkout + order tracking).

---

## 1. Updated Folder Audit (`craftique-yard-20261111T055017Z-1-001.zip`)

Inspection of the latest extracted `craftique-yard/` folder (~391.5 MB archive) shows:
1. **Complete TypeScript Definitions:** `npm run check` (`tsc --noEmit`) now passes with **0 errors** (missing `.d.ts` files in earlier zips are resolved).
2. **Windows Native Binaries in `node_modules`:** `node_modules` contains `@img/sharp-win32-x64` and `@next/swc-win32-x64-msvc`. Running Next.js and Sharp locally on macOS requires a clean `npm ci` (and Hostinger Linux builds its own Linux dependencies during deploy).
3. **macOS Extraction Junk:** `._*` AppleDouble files exist across directories and must be cleaned before build/packaging.
4. **Hostinger MySQL Bug:** `app/api/track/route.ts` (`json_extract(payload,'$.phone')=?`) and `app/api/customer/route.ts` (`json_extract(payload,'$.customerEmail')=?`) return quoted strings in MySQL `JSON_EXTRACT`, causing zero matches on Hostinger MySQL unless unwrapped with `JSON_UNQUOTE(JSON_EXTRACT(...))`.
5. **Non-Tech Admin & Product Serial Gaps:**
   - Main page default sort uses a hardcoded `featuredIds` array of 8 products in `app/lib/catalog.ts`; Admin cannot reorder products (e.g., putting best-selling products first).
   - Admin panel (`app/admin/panel.tsx`) uses technical/abstract fields and copy: manual `Product ID` regex slug, both EN & বাংলা inputs required separately, free-text category input (risking duplicate category tabs), English-only interface, no clickable `tel:` call button on orders, no quick stage action buttons, and no custom product delete option.

---

## 2. Design Units

### Unit 1: Environment Cleanup & MySQL Query Compatibility
- **Cleanup & Reinstall:**
  - Remove all `._*` AppleDouble files recursively inside `craftique-yard/`.
  - Run `npm ci` on macOS to install native `darwin` binaries for `next` and `sharp`, then confirm `npm run check` passes with 0 errors.
- **Hostinger MySQL Compatibility (`app/lib/database.ts`):**
  - Export `mysqlQuery(query: string)` from `app/lib/database.ts`.
  - Translate `json_extract(expr, path)` (case-insensitive) to `JSON_UNQUOTE(JSON_EXTRACT(expr, path))` in MySQL mode so `app/api/track/route.ts` and `app/api/customer/route.ts` match unquoted phone numbers and emails identically on Hostinger MySQL and local SQLite.
  - Keep `ON CONFLICT(...)` and `\bkey\b` escaping rules, and verify `JSON_SET(payload, '$.staffNote', ?, '$.transactionRef', ?)` in `app/api/admin/route.ts` remains valid for MySQL/MariaDB.
  - Add `scripts/test-mysql-query.mjs` to assert exact SQL query translations.

### Unit 2: Main Page Product Serial Ordering & Best-Seller Flag
- **Schema & Persistence (`app/lib/catalog.ts`, `app/lib/store.ts`, `app/api/admin/route.ts`):**
  - Add optional `bestSeller?: boolean` to `Product` and `productSchema` (defaulting to `false` so all existing database rows remain backward-compatible).
  - Export `baseProductIds = new Set(baseProducts.map((p) => p.id))` and `CATEGORY_PRESETS` (mapping canonical English + Bangla pairs for all 9 store categories) from `app/lib/catalog.ts`.
  - Store custom display order inside the existing `settings` table under `key = 'product_order'` with payload `{ order: string[] }` (zero MySQL/SQLite schema changes required).
  - Update `getProducts(admin = false)` in `app/lib/store.ts`:
    - Read `products` rows and `settings` row `key = 'product_order'` in parallel.
    - If `product_order` exists, sort products by their position in `order` (any unranked products follow afterward in default featured-first order).
    - If `product_order` does not exist yet, keep `featuredIds` first followed by remaining `baseProducts` in catalog order.
  - Export `saveProductOrder(order: string[])` helper in `app/lib/store.ts` to persist clean deduplicated product ID arrays into `settings` (`key = 'product_order'`).
- **Storefront Display (`app/storefront.tsx`, `app/globals.css`, `app/shop-clarity.css`):**
  - Default sort option (`featured`) renders products in the exact Admin-defined serial order (labeled `"Best selling & featured"` / `"বেস্ট সেলার ও নির্বাচিত"`). Shoppers can still switch to `"Price: low to high"` or `"Price: high to low"`.
  - When `p.bestSeller` is `true`, show a subtle `"Best Seller"` / `"বেস্ট সেলার"` badge on the storefront product card (only when available, so it never collides with `"Restocking soon"`).
- **Admin Serial Reordering API (`app/api/admin/route.ts`):**
  - `GET /api/admin` returns `products` already ordered in storefront serial order, plus `baseProductIds: [...baseProductIds]`.
  - `POST /api/admin`:
    - `action: 'product'` optionally accepts `position?: number` (1-based integer `1..5000`); when provided, updates `product_order` so the saved product moves straight to that slot (e.g., `1` = first on main page).
    - `action: 'reorder'` validates `{ order: z.array(z.string().regex(/^[a-z0-9][a-z0-9-]{0,99}$/)).min(1).max(5000) }` and saves the updated serial order via `saveProductOrder(order)`.
    - `action: 'deleteProduct'` validates `{ id }`, rejects built-in `baseProducts` IDs with HTTP `400` (`Base catalog items cannot be deleted — toggle "Show on website" off to hide them.`), deletes custom rows from `products`, and removes the ID from `product_order` (preserving `uploads` rows so historical order records keep working images).

### Unit 3: Non-Tech Friendly Admin Dashboard (`app/admin/panel.tsx`, `app/globals.css`)
- **Admin Language Toggle & Clear Copy:**
  - Add an `EN / বাংলা` toggle in the Admin sidebar (`localStorage` key `cy-admin-lang`) so a non-technical owner or staff member can operate the dashboard in English or plain Bangla.
  - Replace poetic/technical copy with plain, action-oriented labels:
    - Navigation: `Overview / ড্যাশবোর্ড`, `Orders / অর্ডার`, `Products & Order / পণ্য ও সিরিয়াল`, `Shop Settings / সেটিংস`, `Passwords / পাসওয়ার্ড`.
    - Buttons: `+ Add New Product / নতুন পণ্য যোগ করুন`, `View & Call / কল ও কনফার্ম`, `Save Changes / সেভ করুন`.
- **Order Call-Confirmation Workflow:**
  - Orders table clearly shows Order Reference & Date, Customer Name & Phone, Items summary (`e.g. 2 items`), Total ৳, Order Status badge, and Payment Status badge.
  - Order modal features:
    - Prominent **`Call Customer` (`tel:...`)** button and **WhatsApp** link right next to the customer phone and address.
    - Quick one-click action buttons at the top of the action area:
      - **Confirm Order (Call Done)** → sets `status = 'confirmed'` and saves immediately (keeping any note entered).
      - **Mark Shipped** → sets `status = 'shipped'` and saves immediately.
      - **Delivered & COD Paid** → sets `status = 'delivered'`, `paymentStatus = 'paid'` and saves immediately.
      - **Cancel Order** (with inline confirmation) → sets `status = 'cancelled'`.
    - Status dropdowns, optional Transaction Reference, and `Staff Call Note` remain accessible below for manual edits.
- **Non-Tech Product Upload & Serial Control:**
  - **Products List View:**
    - Displays `#Serial` (`#1`, `#2`, `#3`...), Product photo + Name (+ `Best Seller` tag if enabled), Category, Price, Stock/Visibility badge, and easy controls:
      - **`#1 Top`**, **`↑`**, **`↓`** quick-move buttons (active when viewing all products unfiltered; auto-saves immediately via `action: 'reorder'` with clear saving indicator).
      - **`Move to #`** quick input/apply control on each row (or inside Edit) so jumping a product from #80 to #2 takes one step instead of 78 clicks.
  - **Add / Edit Product Modal:**
    - Track `editingProductId: string | null` explicitly (never infer edit mode from `product.id`).
    - **Hide technical `Product ID` field from the main form:** When creating a new product, automatically generate a unique lowercase-hyphenated slug from the product name (falling back to `product-<timestamp>` if non-ASCII/Bangla-only, and appending `-2`, `-3` on collision). Expose the ID only inside a small optional `"Advanced ID"` disclosure if ever needed.
    - **Photo Upload First:** Clear photo preview + `"Upload Product Photo"` button at the top.
    - **Category Dropdown:** Preset dropdown of existing bilingual categories (automatically setting both `category` and `categoryBn`) + `"Other (Custom)"` option if adding a new category.
    - **Flexible Bilingual Fields:** Primary `Product Name`, `Price (৳)`, `Stock (leave blank if always available)`, `Description`, plus optional `Bangla Name` / `Bangla Description` (if left blank, automatically defaults to the primary English text so validation never blocks a non-tech user).
    - **Storefront Controls:**
      - `Display Serial #` (e.g., `1` = first on main page; defaults to `1` or end via a simple `"Show at Top (#1)"` / `"Custom Position"` / `"Add at End"` selector when adding).
      - `Best Seller badge` checkbox.
      - `Show on website` (`active`) and `Available to order` (`available`) toggles.
      - **Delete Product** button (for custom products, with inline `"Confirm Delete / Cancel"`), or clear helper note for built-in catalog items (`Uncheck "Show on website" to hide`).
- **Simple Store Settings & Accounts:**
  - Group Settings cleanly into **1. Payment Options (COD / bKash / Nagad)**, **2. Delivery Charges (Dhaka / Outside Dhaka)**, **3. Shop Contact Info**.

### Unit 4: Verification & Hostinger Deployment Packaging
- Run `npm run check` (`tsc --noEmit`) → 0 errors.
- Run `npm run build` → clean Next.js production build.
- Run `node scripts/test-mysql-query.mjs`, `node scripts/verify.mjs`, and `SETUP_ACCOUNT_PASSWORD=... node scripts/verify-customer.mjs` (plus automated assertions for `reorder`, `position`, `bestSeller`, and `deleteProduct` rejecting base IDs and deleting custom IDs).
- Perform browser QA on local preview server covering storefront serial order, Best Seller badge, guest COD checkout, order tracking, and non-tech Admin order call/confirm + product upload/reorder/delete.
- Add `HOSTINGER-DEPLOY.md` (step-by-step Hostinger Business hPanel Node.js + MySQL deployment guide for non-technical owners) and `scripts/package-hostinger.mjs` (`npm run package:hostinger`) to output a clean source `.zip` excluding `node_modules/`, `.next/`, `.local-data/`, `.env.local`, `ADMIN-ACCESS.txt`, `._*`, `.pdf-deps/`, `docs/`, and large `research/*.pdf` / `research/image-review-*.png` assets.

---

## 3. Out of Scope (YAGNI)
- No online payment gateway integration (SSLCommerz / bKash merchant API).
- No customer self-registration UI (`/account` remains optional for provisioned accounts; guest checkout works without login).
- No drag-and-drop library dependency — simple accessible `#1 Top` / `↑` / `↓` / `Move to #` controls work smoothly on both mobile and desktop without heavy dependencies.
