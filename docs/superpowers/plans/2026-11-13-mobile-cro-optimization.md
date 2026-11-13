# Craftique Yard Mobile CRO & Responsive Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Craftique Yard website into a high-converting, mobile-first e-commerce experience optimized for Bangladeshi smartphone users.

**Architecture:** Refactor mobile CSS to eliminate micro-fonts and iOS zoom bugs, implement 1-tap "এখনই অর্ডার করুন" direct buy flow, introduce a thumb-friendly mobile sticky bottom bar, add quantity controls in product modal, integrate 1-tap WhatsApp order messaging, and streamline district/shipping checkout logic.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS3, Lucide React.

## Global Constraints
- Do not break existing API contracts in `/api/orders`, `/api/track`, `/api/customer`.
- Keep Bengali and English dual-language compatibility seamless.
- No input element font-size may be lower than 16px on mobile (prevents iOS Safari zoom-in).
- All interactive touch targets must be at least 44px in height.

---

### Task 1: Mobile Viewport & CSS Base Normalization

**Files:**
- Modify: `craftique-yard/app/layout.tsx`
- Modify: `craftique-yard/app/shop-clarity.css`

**Interfaces:**
- Consumes: Next.js Viewport type.
- Produces: Normalized mobile styling, viewport configuration, safe area support.

- [ ] **Step 1: Update `app/layout.tsx` with Viewport export**
Add Viewport export with theme color `#98412d`, proper viewport width, initial scale 1, and maximum scale 5 for accessibility.

- [ ] **Step 2: Add CSS overrides in `app/shop-clarity.css`**
Add rules ensuring:
- All mobile screens up to 768px have legible font sizes ($\ge 13px$).
- Input and select font sizes set to `16px !important` on screens $\le 768px$ to prevent iOS Safari auto-zoom.
- Safe-area bottom padding for modern iOS/Android gesture bars (`env(safe-area-inset-bottom)`).

- [ ] **Step 3: Verify TypeScript and styles**
Run `npm run check` to ensure no typing regressions.

---

### Task 2: Phone Input Normalization & District-to-Zone Intelligence

**Files:**
- Modify: `craftique-yard/app/storefront.tsx`

**Interfaces:**
- Consumes: `FormEvent` and `FormData` in `placeOrder` and `track`.
- Produces: Sanitized phone numbers (stripping spaces, dashes, leading `+88`), automated district matching to Dhaka vs Outside Dhaka.

- [ ] **Step 1: Implement phone number sanitizer**
In `placeOrder`, clean the phone input before validation:
Convert `+8801...` or `017-333...` or `017 333...` into `01XXXXXXXXX`.

- [ ] **Step 2: Implement Bangladesh District Quick-Select / Auto-Zone**
When the user selects or inputs their district, if "Dhaka" / "ঢাকা" is selected, set zone to `dhaka` (৳80); for other districts (Chattogram, Sylhet, Rajshahi, etc.), set zone to `outside` (৳130).

- [ ] **Step 3: Test and verify form input handling**
Verify `placeOrder` and `track` submit sanitized values reliably.

---

### Task 3: Direct "এখনই অর্ডার করুন" (Buy Now) and Dual-Action Product Cards

**Files:**
- Modify: `craftique-yard/app/storefront.tsx`
- Modify: `craftique-yard/app/shop-clarity.css`

**Interfaces:**
- Consumes: Product list from props.
- Produces: `buyNow(p: Product)` handler that adds the item and immediately opens checkout.

- [ ] **Step 1: Add `buyNow` function in `storefront.tsx`**
Define `buyNow(p: Product)`:
- If item is in stock, ensure it is added to cart (or selected if empty), then immediately set `setCartOpen(true)` and `setCheckout(true)`.

- [ ] **Step 2: Update Product Card in `storefront.tsx`**
Render dual actions on each product card:
- Primary button: **"এখনই অর্ডার করুন" / "Order Now"** (triggers `buyNow(p)`).
- Secondary button: Shopping bag icon (triggers `add(p)` to add to cart without redirecting).

- [ ] **Step 3: Style the dual action buttons in `shop-clarity.css`**
Ensure touch-friendly layout on 2-column mobile grid: primary CTA is clear and prominent, secondary bag button is easily clickable.

---

### Task 4: Product Detail Modal Enhancements (Quantity Selector, Direct Checkout & 1-Tap WhatsApp Order)

**Files:**
- Modify: `craftique-yard/app/storefront.tsx`
- Modify: `craftique-yard/app/shop-clarity.css`

**Interfaces:**
- Consumes: `selected: Product | null`.
- Produces: Interactive quantity state in modal, direct "এখনই অর্ডার করুন", and pre-filled WhatsApp order link.

- [ ] **Step 1: Add modal quantity state**
Add `[modalQty, setModalQty] = useState(1)` reset on product selection.

- [ ] **Step 2: Update modal markup in `storefront.tsx`**
Add:
- Stepper buttons: `[-]` count `[+]`.
- Primary CTA: "এখনই অর্ডার করুন" (adds `modalQty` items and goes directly to checkout).
- Secondary CTA: "ব্যাগে যোগ করুন" (adds `modalQty` items and shows confirmation toast).
- WhatsApp button: "WhatsApp-এ সরাসরি অর্ডার করুন" with pre-filled message detailing product name, price, and request.

- [ ] **Step 3: Add CSS for modal quantity stepper and action buttons in `shop-clarity.css`**

---

### Task 5: Mobile Sticky Bottom Bar (Live Cart Summary & Fast Actions)

**Files:**
- Modify: `craftique-yard/app/storefront.tsx`
- Modify: `craftique-yard/app/shop-clarity.css`

**Interfaces:**
- Consumes: `cartProducts`, `count`, `subtotal`.
- Produces: Persistent bottom bar component on mobile devices ($<768px$).

- [ ] **Step 1: Implement Sticky Bottom Bar component in `storefront.tsx`**
- If `count > 0`: Display a sticky conversion bar showing:
  `[ 🛍️ Xটি পণ্য • ৳YYY ]  [ অর্ডার করুন ➔ ]`
  Clicking opens cart directly in checkout mode.
- If `count === 0`: Display quick access navigation:
  - হোম (Home)
  - কালেকশন (Shop / Products)
  - WhatsApp চ্যাট
  - কল করুন (Direct phone call)

- [ ] **Step 2: Add CSS for sticky bottom bar in `shop-clarity.css`**
Fixed at bottom with high z-index, frosted glass/clean shadow, safe-area bottom padding. Ensure page body has bottom padding on mobile so content isn't obscured.

---

### Task 6: Trust Signals & Reassurance Badges

**Files:**
- Modify: `craftique-yard/app/storefront.tsx`
- Modify: `craftique-yard/app/shop-clarity.css`

**Interfaces:**
- Consumes: Language helper `t(en, bn)` and settings.
- Produces: Trust badges in Hero, under product prices, and in Checkout.

- [ ] **Step 1: Add Trust Signals under Checkout and Product Details**
Display:
- 🛡️ ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ)
- 📦 পণ্য দেখে নেওয়ার সুবিধা
- 🚚 সারা বাংলাদেশে দ্রুত হোম ডেলিভারি
- 📞 সহায়তায়: 01733-399372

- [ ] **Step 2: Enhance Cash On Delivery (COD) payment badge in Checkout**
Highlight COD with a green badge: *"সবচেয়ে নিরাপদ ও জনপ্রিয় (পণ্য হাতে পেয়ে টাকা দিন)"*.

- [ ] **Step 3: Style trust badges in `shop-clarity.css`**

---

### Task 7: Build, Typecheck, and Cross-Device Verification

**Files:**
- Test: `craftique-yard/app/storefront.tsx`
- Test: `craftique-yard/app/layout.tsx`
- Test: `craftique-yard/app/shop-clarity.css`

- [ ] **Step 1: Run TypeScript checks**
Execute `npm run check` and ensure 0 errors.

- [ ] **Step 2: Run Next.js production build**
Execute `npm run build` and ensure clean compilation of all static and dynamic routes.

- [ ] **Step 3: Verification on Mobile Viewports**
Verify HTML/CSS responsiveness and button accessibility.
