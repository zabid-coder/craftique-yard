# Craftique Yard Mobile CRO & Responsive Architecture Design Spec

**Date:** 2026-11-13
**Domain:** E-commerce / Mobile UX / Conversion Rate Optimization (CRO)
**Target Market:** Bangladesh Smartphone Users (Facebook/Instagram Traffic)

## 1. Problem Statement
The current store architecture works technically, but exhibits critical mobile UX friction and conversion barriers:
- Inconsistent mobile media queries with unreadable font sizes (6px - 10px in `globals.css`).
- High-friction cart funnel: 5-6 clicks to place an order, leading to high drop-offs on mobile devices.
- No direct 1-tap "এখনই অর্ডার করুন" (Buy Now) button on product cards or detail modals.
- No mobile-first sticky bottom bar for cart awareness and quick actions.
- Phone number input validation blocks users who paste numbers with formatting (spaces, dashes, `+88`).
- District input is unstructured text separate from delivery area, risking inaccurate shipping calculations.
- iOS Safari auto-zoom triggered by input font sizes below 16px.
- Lack of prominent trust badges (Cash on Delivery reassurance, delivery timelines, quality guarantee).

## 2. Core Functional Requirements
1. **Viewport & Mobile Metadata:**
   - Configure Next.js `Viewport` export in `app/layout.tsx` with appropriate theme color, width, and scaling.
2. **CSS Mobile Normalization:**
   - Unify mobile breakpoints across `globals.css` and `shop-clarity.css`.
   - Ensure all touch targets are $\ge 44px$ and all mobile typography is $\ge 13px$ (with headings scaled appropriately).
   - Ensure all inputs and selects have $\ge 16px$ font-size on mobile to prevent iOS Safari auto-zoom.
3. **High-Converting Buying Psychology Enhancements:**
   - Add direct **"এখনই অর্ডার করুন" (Order Now / Buy Now)** button to all product cards. Clicking it instantly opens the checkout panel with the item ready.
   - Retain a quick "ব্যাগে যোগ" (Add to Bag) action for users purchasing multiple items.
   - Product Details Modal: Add interactive quantity selector (`-`, count, `+`), immediate "এখনই অর্ডার করুন" primary CTA, and "হোয়াটসঅ্যাপে অর্ডার" secondary CTA.
   - Trust Signals: Display Cash on Delivery reassurance (`ক্যাশ অন ডেলিভারি - পণ্য হাতে পেয়ে টাকা দিন`), delivery charges, and quality guarantees prominently under price tags and inside the checkout form.
   - WhatsApp Order Integration: 1-click WhatsApp order button generating a pre-filled, friendly order message in Bengali/English.
4. **Mobile Sticky Bottom Action Bar:**
   - A thumb-friendly sticky bottom bar appearing on mobile screens ($<768px$):
     - When cart is empty: Direct quick links (হোম, কালেকশন, WhatsApp চ্যাট, সরাসরি কল).
     - When cart has items: Prominent summary bar: `[ 🛍️ Xটি পণ্য • ৳YYY ] [ অর্ডার করুন ➔ ]`
5. **Checkout & Form Streamlining:**
   - District selector with Bangladesh districts / quick-select options, ensuring district automatically aligns with Inside Dhaka (৳80) / Outside Dhaka (৳130) rates.
   - Robust phone number sanitizer handling `+88`, spaces, dashes before validation.
   - Clear radio-button selection for Cash on Delivery (COD) as the default option with trust cue.

## 3. Architecture & Impact Analysis
- `app/layout.tsx`: Add `Viewport` export.
- `app/storefront.tsx`: Update state management for 1-click checkout, quantity selection, district auto-zone, sticky bottom bar, and mobile action listeners.
- `app/shop-clarity.css`: Comprehensive mobile styling, sticky bottom bar styles, high-contrast CTA buttons, touch-target enhancements.
- `app/api/orders/route.ts`: Verified compatible with sanitized phone inputs and district payloads.
