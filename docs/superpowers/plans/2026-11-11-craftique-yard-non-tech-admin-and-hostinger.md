# Craftique Yard Non-Tech Admin, Product Serial Ordering & Hostinger Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `craftique-yard` admin dashboard non-tech friendly (EN/বাংলা toggle, tap-to-call COD confirmation, preset categories, auto-generated IDs, custom product delete), add Admin-controlled main-page product serial ordering & Best Seller badges, fix Hostinger MySQL `JSON_EXTRACT` compatibility, install clean macOS native deps for local testing, and generate a clean Hostinger deployment ZIP + guide.

**Architecture:** Preserve the existing Next.js 16.4 + React 19 + dual SQLite/MySQL (`mysql2`) architecture while storing custom storefront serial order in the existing `settings` table (`key = 'product_order'`), adding a `bestSeller` flag on `Product`, normalizing `json_extract(...)` queries for MySQL in `app/lib/sql-compat.ts`, and upgrading `app/admin/panel.tsx` and `app/api/admin/route.ts` with non-tech workflows.

**Tech Stack:** Next.js 16.4.0, React 19.2.6, TypeScript 5.9, Zod, Sharp, mysql2, Node.js `>=22.13.0` (`node:sqlite` for local preview).

## Global Constraints
- Target platform: Hostinger Business Plan (Node.js Web App `>=22.13.0` + MySQL `utf8mb4`).
- Keep Option C checkout flexibility: Guest Add-to-Cart (`localStorage`) + Checkout form + Cash on Delivery / manual bKash & Nagad toggleable in Admin Settings + optional `/account` sign-in + Order Tracking.
- Zero breaking SQL schema changes (`db/schema.mysql.sql` and `db/schema.sqlite.sql` remain compatible with existing databases).
- Do not include `.env.local`, `ADMIN-ACCESS.txt`, `.local-data/`, `node_modules/`, `.next/`, or `._*` AppleDouble files in the Hostinger deployment package.
- Run TDD red-green tests for new logic and verify `npm run check`, `npm run build`, automated API/SQL checks, and live local browser QA before completion.

---

### Task 1: Clean macOS `._*` Extraction Artifacts & Install Native Dependencies

**Files:**
- Workspace: `/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard`

- [ ] **Step 1: Delete all macOS `._*` AppleDouble files recursively**

Run:
```bash
cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && find . -name '._*' -delete
```
Expected: Exit code `0`; `find . -name '._*' | wc -l` prints `0`.

- [ ] **Step 2: Reinstall clean macOS `node_modules` with `npm ci`**

Run:
```bash
cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && npm ci --no-audit --no-fund
```
Expected: Clean install of `node_modules` including macOS `@img/sharp-darwin-*` and `@next/swc-darwin-*` binaries.

- [ ] **Step 3: Verify TypeScript check passes cleanly**

Run:
```bash
cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && npm run check
```
Expected: Exit code `0`, zero TypeScript errors.

---

### Task 2: Hostinger MySQL `JSON_EXTRACT` Query Normalization (`app/lib/sql-compat.ts` & `app/lib/database.ts`)

**Files:**
- Create: `app/lib/sql-compat.ts`
- Modify: `app/lib/database.ts:1-17`
- Test: `scripts/test-mysql-query.mjs`

**Interfaces:**
- Produces: `export function mysqlQuery(query: string): string` in `app/lib/sql-compat.ts`
- Consumes: `mysqlQuery` in `app/lib/database.ts`

- [ ] **Step 1: Write the failing test (`scripts/test-mysql-query.mjs`)**

```js
import assert from 'node:assert/strict';
import { mysqlQuery } from '../app/lib/sql-compat.ts';

assert.equal(
  mysqlQuery("SELECT * FROM orders WHERE reference=? AND json_extract(payload,'$.phone')=?"),
  "SELECT * FROM orders WHERE reference=? AND JSON_UNQUOTE(JSON_EXTRACT(payload,'$.phone'))=?",
  'Track order phone lookup must unquote JSON_EXTRACT for MySQL'
);

assert.equal(
  mysqlQuery("SELECT reference FROM orders WHERE json_extract(payload,'$.customerEmail')=?"),
  "SELECT reference FROM orders WHERE JSON_UNQUOTE(JSON_EXTRACT(payload,'$.customerEmail'))=?",
  'Customer email lookup must unquote JSON_EXTRACT for MySQL'
);

assert.equal(
  mysqlQuery('INSERT INTO settings(key,payload) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET payload=excluded.payload'),
  'INSERT INTO settings(`key`,payload) VALUES(?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload)',
  'Settings upsert and key escaping preserved'
);

assert.equal(
  mysqlQuery("UPDATE orders SET status=?,payment_status=?,payload=json_set(payload,'$.staffNote',?,'$.transactionRef',?),updated_at=? WHERE id=?"),
  "UPDATE orders SET status=?,payment_status=?,payload=json_set(payload,'$.staffNote',?,'$.transactionRef',?),updated_at=? WHERE id=?",
  'JSON_SET update query preserved'
);

console.log('PASS all MySQL query compatibility checks');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && node --experimental-strip-types scripts/test-mysql-query.mjs`
Expected: FAIL (`Cannot find module '.../app/lib/sql-compat.ts'`).

- [ ] **Step 3: Create `app/lib/sql-compat.ts` and wire into `app/lib/database.ts`**

Create `app/lib/sql-compat.ts`:
```ts
/**
 * Converts SQLite-compatible queries used in API routes into MySQL-compatible SQL.
 */
export function mysqlQuery(query: string): string {
  return query
    .replace(
      /ON CONFLICT\(id\) DO UPDATE SET payload=excluded\.payload,updated_at=excluded\.updated_at/g,
      'ON DUPLICATE KEY UPDATE payload=VALUES(payload),updated_at=VALUES(updated_at)'
    )
    .replace(
      /ON CONFLICT\(key\) DO UPDATE SET payload=excluded\.payload/g,
      'ON DUPLICATE KEY UPDATE payload=VALUES(payload)'
    )
    .replace(
      /ON CONFLICT\(checkout_key\) DO NOTHING/g,
      'ON DUPLICATE KEY UPDATE checkout_key=checkout_key'
    )
    .replace(
      /\bjson_extract\(([^,]+),\s*('[^']+')\)/gi,
      'JSON_UNQUOTE(JSON_EXTRACT($1,$2))'
    )
    .replace(/\bkey\b/g, '`key`');
}
```

Update `app/lib/database.ts` to import `{ mysqlQuery } from './sql-compat'` and remove the inline `function mysqlQuery` definition.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && node --experimental-strip-types scripts/test-mysql-query.mjs`
Expected: `PASS all MySQL query compatibility checks`, exit code `0`.

---

### Task 3: Product Ordering Helpers, `bestSeller` Flag & Category Presets (`app/lib/catalog.ts`, `app/lib/store.ts`)

**Files:**
- Modify: `app/lib/catalog.ts:1-30`
- Modify: `app/lib/store.ts:1-17`
- Test: `scripts/test-catalog-order.mjs`

**Interfaces:**
- Produces in `app/lib/catalog.ts`:
  - `Product` (with `bestSeller?: boolean`)
  - `baseProductIds: Set<string>`
  - `categoryPresets: { category: string; categoryBn: string }[]`
  - `defaultProductOrder: string[]`
  - `sortProductsByOrder(products: Product[], customOrder: string[] | null): Product[]`
  - `applyProductPosition(order: string[], id: string, position: number): string[]`
- Produces in `app/lib/store.ts`:
  - `productSchema` (with `bestSeller: z.boolean().optional().default(false)`)
  - `getProductOrder(): Promise<string[] | null>`
  - `saveProductOrder(order: string[]): Promise<void>`

- [ ] **Step 1: Write the failing test (`scripts/test-catalog-order.mjs`)**

```js
import assert from 'node:assert/strict';
import {
  baseProducts,
  baseProductIds,
  categoryPresets,
  defaultProductOrder,
  sortProductsByOrder,
  applyProductPosition,
} from '../app/lib/catalog.ts';

assert.ok(baseProductIds.has('light-pink-a12-about-100'), 'baseProductIds contains base catalog item');
assert.ok(!baseProductIds.has('custom-item-1'), 'baseProductIds excludes custom item');
assert.ok(categoryPresets.some((c) => c.category === 'Chenille stems' && c.categoryBn === 'পাইপ ক্লিনার'));

const sample = [
  { ...baseProducts[0], id: 'a' },
  { ...baseProducts[0], id: 'b' },
  { ...baseProducts[0], id: 'c' },
];
const sorted = sortProductsByOrder(sample, ['c', 'a']);
assert.deepEqual(sorted.map((p) => p.id), ['c', 'a', 'b'], 'Custom order comes first, unranked follow');

const moved = applyProductPosition(['a', 'b', 'c'], 'c', 1);
assert.deepEqual(moved, ['c', 'a', 'b'], 'Moves existing item to position 1');

const inserted = applyProductPosition(['a', 'b'], 'new-item', 2);
assert.deepEqual(inserted, ['a', 'new-item', 'b'], 'Inserts new item at 1-based position 2');

const clamped = applyProductPosition(['a', 'b'], 'new-item', 99);
assert.deepEqual(clamped, ['a', 'b', 'new-item'], 'Clamps oversized position to end');

assert.equal(defaultProductOrder[0], 'light-pink-a12-about-100', 'Default order starts with featuredIds');
console.log('PASS all catalog ordering and preset checks');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && node --experimental-strip-types scripts/test-catalog-order.mjs`
Expected: FAIL (`does not provide an export named 'baseProductIds'`).

- [ ] **Step 3: Implement `bestSeller`, `baseProductIds`, `categoryPresets`, `sortProductsByOrder`, and `applyProductPosition` in `app/lib/catalog.ts`, and `productOrder` persistence in `app/lib/store.ts`**

Add to `app/lib/catalog.ts`:
- `bestSeller?: boolean` on `export type Product`
- `export const baseProductIds = new Set(baseProducts.map((p) => p.id));`
- `export const categoryPresets = Array.from(new Map(baseProducts.map((p) => [p.category, p.categoryBn])).entries()).map(([category, categoryBn]) => ({ category, categoryBn }));`
- `export const defaultProductOrder = [...featuredIds.filter((id) => baseProductIds.has(id)), ...baseProducts.map((p) => p.id).filter((id) => !featuredIds.includes(id))];`
- `sortProductsByOrder(products, customOrder)` and `applyProductPosition(order, id, position)` using exact deduplicated 1-based indexing.

Update `app/lib/store.ts`:
- Add `bestSeller: z.boolean().optional().default(false)` to `productSchema`.
- Add `getProductOrder()` and `saveProductOrder(order: string[])` backed by `settings` (`key = 'product_order'`).
- Update `getProducts(admin = false)` to read `products` and `getProductOrder()` in parallel and sort via `sortProductsByOrder(..., customOrder)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && node --experimental-strip-types scripts/test-catalog-order.mjs`
Expected: `PASS all catalog ordering and preset checks`, exit code `0`.

---

### Task 4: Admin Product Reorder, Position Placement & Custom Product Deletion API (`app/api/admin/route.ts`)

**Files:**
- Modify: `app/api/admin/route.ts:1-3`
- Test: `scripts/verify.mjs` (extend with tests for `reorder`, `position`, `bestSeller`, and `deleteProduct`)

- [ ] **Step 1: Add failing checks to `scripts/verify.mjs` (or a dedicated test run first) for `reorder`, `position`, `bestSeller`, and `deleteProduct`**

Add assertions verifying:
1. `POST /api/admin` `{ action: 'product', product: { ..., id: 'custom-qa-ribbon', bestSeller: true }, position: 1 }` returns `200`, and `GET /api/admin` returns `'custom-qa-ribbon'` as `products[0]` with `bestSeller === true`.
2. `POST /api/admin` `{ action: 'reorder', order: [...] }` puts a chosen product at index `0` in `GET /api/admin` and on storefront `GET /`.
3. `POST /api/admin` `{ action: 'deleteProduct', id: 'light-pink-a12-about-100' }` (built-in base product) returns `400`.
4. `POST /api/admin` `{ action: 'deleteProduct', id: 'custom-qa-ribbon' }` returns `200` and removes `'custom-qa-ribbon'` from `GET /api/admin`.

- [ ] **Step 2: Implement `action: 'reorder'`, `position` support on `action: 'product'`, `action: 'deleteProduct'`, and `baseProductIds` in `GET /api/admin` (`app/api/admin/route.ts`)**

Implementation highlights:
- `GET`: returns `{ products, settings, orders, baseProductIds: [...baseProductIds] }`.
- `POST` `action === 'product'`: parses `productSchema.parse(data.product)` and optional `position = z.number().int().min(1).max(5000).optional().parse(data.position)`. Upserts `products`; if `position !== undefined` (or if product ID was not yet in current order and `position` provided), reads current order (`(await getProducts(true)).map(p => p.id)`), applies `applyProductPosition(currentIds, p.id, position)`, and calls `saveProductOrder(...)`.
- `POST` `action === 'reorder'`: parses `{ order: z.array(productSchema.shape.id).min(1).max(5000) }`, deduplicates preserving order, saves via `saveProductOrder`.
- `POST` `action === 'deleteProduct'`: parses `{ id: productSchema.shape.id }`; rejects `baseProductIds.has(id)` with HTTP `400`; deletes row from `products`; if `changes === 0` returns `404`; otherwise filters `id` out of saved `product_order` if present and returns `json({ ok: true })`.

- [ ] **Step 3: Run `npm run check` to verify types compile cleanly**

Run: `cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && npm run check`
Expected: Exit code `0`.

---

### Task 5: Storefront Serial Preservation & Best Seller Badge (`app/storefront.tsx`, `app/shop-clarity.css`)

**Files:**
- Modify: `app/storefront.tsx:22-24,40`
- Modify: `app/shop-clarity.css`

- [ ] **Step 1: Update `app/storefront.tsx` default sort and Best Seller badge**

- In `app/storefront.tsx`:
  - Remove hardcoded `featuredIds` import/sort override in `sort === 'featured'` so `filtered` naturally preserves the exact admin-ordered `products` array passed from the server (`app/page.tsx` -> `getProducts()`). Keep `low` and `high` price sort options intact.
  - Label the default sort `<option value="featured">` as `{t('Best selling & featured','বেস্ট সেলার ও নির্বাচিত')}`.
  - Inside `article.product-card`, if `p.bestSeller && p.available && p.stock !== 0`, render `<span className="product-badge bestseller">{t('Best Seller','বেস্ট সেলার')}</span>`.

- [ ] **Step 2: Style `.product-badge.bestseller` in `app/shop-clarity.css`**

Add clean high-contrast badge styling using `--terra` background and crisp white text so it stands out from `"Restocking soon"`.

- [ ] **Step 3: Run `npm run check`**

Run: `cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && npm run check`
Expected: Exit code `0`.

---

### Task 6: Non-Tech Friendly Admin Dashboard (`app/admin/panel.tsx`, `app/globals.css`)

**Files:**
- Modify: `app/admin/panel.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Implement non-tech UX upgrades in `app/admin/panel.tsx`**

Include:
1. **Admin EN / বাংলা Toggle (`cy-admin-lang` in `localStorage`):** Plain, clear labels across Sidebar, Overview, Orders, Products & Serial, Settings, and Passwords.
2. **Orders Call-Confirm Workflow:**
   - Order table shows Order Reference/Date, Customer Name & Phone, Items summary (`count items` + first item name), Total ৳, Order Status badge, Payment badge, and `View & Call` / `কল ও কনফার্ম` button.
   - Order modal shows prominent **`Call Customer` (`tel:...`)** button + **WhatsApp** link, full shipping & items breakdown, customer note, and **1-click quick action buttons**:
     - `Confirm Order (Call Done)` (`status = 'confirmed'`)
     - `Mark Shipped` (`status = 'shipped'`)
     - `Delivered & COD Paid` (`status = 'delivered'`, `paymentStatus = 'paid'`)
     - `Cancel Order` (2-step inline confirm -> `status = 'cancelled'`)
   - Preserves current `staffNote` / `transactionRef` inputs when quick action buttons save, plus manual status dropdowns below.
3. **Products & Storefront Serial Control:**
   - Default table lists products in storefront serial order (`#1`, `#2`, `#3`...).
   - Serial column provides instant **`#1 Top`**, **`↑`**, **`↓`** buttons (when unfiltered by search) and an inline **`Move to #`** quick-jump control (`onSubmit` -> `action: 'reorder'`), with immediate optimistic update + `"Saving order…"` feedback.
   - Modal tracks `editingProductId: string | null` and `manualIdEdited: boolean`.
   - When creating a new product (`editingProductId === null`):
     - Auto-generates unique valid slug ID from `Product Name` (fallback `product-<timestamp>` if non-ASCII, resolving collisions with `-2`, `-3`, etc.).
     - Hides the raw Product ID inside a collapsed `<details>` (`Advanced: Product ID`) so non-tech staff never see slug/regex errors.
   - Photo upload preview and button placed first at top of modal.
   - Category selector uses `categoryPresets` dropdown (auto-setting `category` and `categoryBn`) plus `"Other / Custom"` option.
   - Optional Bangla Name & Description fields: if left blank on submit, automatically fall back to English `name` / `description` before sending to `/api/admin`.
   - `Main Page Serial #` numeric input (`position`) in the modal (defaults to `1` for new products or current index + 1 for existing products) + `Mark as Best Seller` checkbox + `Show on website` (`active`) + `Available to order` (`available`).
   - Custom product **Delete Product** button with inline two-step confirmation (`Confirm Delete` / `Cancel`), and clear explanation note for built-in catalog items (`Uncheck "Show on website" to hide`).
4. **Clear Settings Grouping:** Organized into Payment Methods (with explicit COD-only hint), Delivery Charges, and Contact Details.

- [ ] **Step 2: Add clean styling in `app/globals.css` for `.admin-phone-link`, `.admin-quick-actions`, `.admin-serial-controls`, `.admin-danger-btn`, `.admin-advanced-id`, and `.admin-lang-btn`**

- [ ] **Step 3: Run `npm run check` and verify 0 errors**

Run: `cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && npm run check`
Expected: Exit code `0`.

---

### Task 7: Hostinger Deployment Packaging & Guide (`scripts/package-hostinger.mjs`, `HOSTINGER-DEPLOY.md`, `package.json`)

**Files:**
- Create: `scripts/package-hostinger.mjs`
- Create: `HOSTINGER-DEPLOY.md`
- Modify: `package.json:8-14`

- [ ] **Step 1: Add `scripts/package-hostinger.mjs` and `"package:hostinger"` npm script**

Create `scripts/package-hostinger.mjs` to build `../craftique-yard-hostinger.zip` (or `./dist-hostinger/craftique-yard-hostinger.zip`) using macOS `/usr/bin/zip`, excluding `node_modules/`, `.next/`, `.local-data/`, `.env.local`, `ADMIN-ACCESS.txt`, `._*`, `.pdf-deps/`, `.sites-runtime/`, `docs/`, `research/*.pdf`, `research/image-review-*.png`, `.git/`. Verify the generated ZIP archive contains zero forbidden/secret/junk files.

- [ ] **Step 2: Write beginner-friendly `HOSTINGER-DEPLOY.md`**

Include step-by-step instructions (clear English + Banglish notes) for Hostinger Business Plan:
1. Create MySQL database & note `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
2. Create Node.js Web App (`>=22.13.0`) in hPanel and upload `craftique-yard-hostinger.zip`.
3. Configure Environment Variables (`SITE_URL`, `DB_*`, `ADMIN_EMAILS`, `ADMIN_BOOTSTRAP_TOKEN`, `ALLOW_LOCAL_PREVIEW=false`).
4. Run `npm run db:migrate` once via hPanel terminal / SSH.
5. Open `https://your-domain.com/admin` → First-time setup → create password → optionally disable bKash/Nagad under Settings for COD-only operation.

---

### Task 8: Full Verification (Build, API Security Suite & Live Local Browser QA)

**Files:**
- Verify: `scripts/verify.mjs`, `scripts/verify-customer.mjs`, `scripts/test-mysql-query.mjs`, `scripts/test-catalog-order.mjs`

- [ ] **Step 1: Run TypeScript check, unit tests, and production build**

Run:
```bash
cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && npm run check && node --experimental-strip-types scripts/test-mysql-query.mjs && node --experimental-strip-types scripts/test-catalog-order.mjs && npm run build
```
Expected: All exit `0`, production build completes cleanly.

- [ ] **Step 2: Start local preview server (`npm run start`) and run `scripts/verify.mjs`**

Run `npm run start` on `127.0.0.1:3000`, execute `node scripts/verify.mjs` (and verify new product serial / delete checks pass and restore `.local-data/store.sqlite`).

- [ ] **Step 3: Perform live browser QA on local server (`127.0.0.1:3000`)**

Verify end-to-end:
- Main storefront (`/`) renders products, Best Seller badge, Add to Bag, Guest COD Checkout -> order saved with reference.
- Order Tracking works with reference + phone.
- Admin Login (`/admin`) -> Orders tab shows clickable `tel:` phone + 1-click `Confirm Order` -> Products tab shows EN/BN toggle, Serial `#`, `#1 Top` / `↑` / `↓` / `Move to #`, Add New Product with Photo Upload (auto-slug hidden) + Best Seller + Position `#1`, and Delete custom product.

- [ ] **Step 4: Run `npm run package:hostinger` and verify clean Hostinger ZIP contents**

Run:
```bash
cd "/Volumes/Zabid/Zabid/Craftique Yard/craftique-yard" && npm run package:hostinger && unzip -l dist-hostinger/craftique-yard-hostinger.zip | grep -E "node_modules|\.next|\.local-data|ADMIN-ACCESS|\.env\.local|\._" || echo "CLEAN ZIP VERIFIED"
```
Expected: `CLEAN ZIP VERIFIED`.
