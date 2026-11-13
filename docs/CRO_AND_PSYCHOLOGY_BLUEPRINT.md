# Craftique Yard — CRO, Customer Psychology & Design Blueprint
> **Document Purpose:** Complete strategic guide, consumer psychology analysis, and technical implementation specifications for future AI agents and developers working on [Craftique Yard](https://craftiqueyard.com).

---

## 📌 Executive Summary
**Craftique Yard** is an aesthetic, artisanal e-commerce brand based in Dhaka, Bangladesh, offering handcrafted DIY materials, vintage journaling tools, wax seal kits, scrapbooking supplies, and creative gift collections.

- **Primary Device:** 85%+ Mobile / Smartphone users (Instagram, Facebook & TikTok traffic).
- **Target Persona:** Gen Z & Millennials (students, creators, art lovers, gift buyers).
- **Core Buying Driver:** Emotional delight, dopamine, aesthetic lifestyle aspiration, gifting, and tactile self-expression.
- **Primary Friction Points in BD Market:** Fear of counterfeit/disappointing quality ("ছবি বনাম বাস্তব"), delivery skepticism, cart drop-off from complicated forms, and delivery fee reluctance.

---

## 🧠 The 5 Psychological Pillars & Actionable Features

### Pillar 1: Trust & Anxiety Reduction (ভয় ও দ্বিধা দূরীকরণ)
> **Insight:** In Bangladesh, COD (Cash on Delivery) shoppers hesitate because of deceptive online sellers. Eradicating this hesitation increases conversions by 25–40%.

1. **"Open Box Delivery" Assurance (দেখে নেওয়ার নিশ্চয়তা):**
   - **Where:** Directly below the "Order Now / এখনই অর্ডার করুন" button and on product detail modals.
   - **UI Copy:**  
     *English:* `📦 Open Box Checking: Inspect items before delivery agent, pay only when 100% satisfied.`  
     *Bengali:* `📦 দেখে নেওয়ার নিশ্চয়তা: ডেলিভারিম্যানের সামনে পার্সেল খুলে চেক করে পছন্দ হলে পেমেন্ট করুন।`
2. **Short Video Clips / Unboxing Reels:**
   - **Where:** Inside the Product Detail Modal alongside static images.
   - **Behavior:** 5–10 second looping MP4/WebM video demonstrating wax seal melting, stamps, paper textures, or packaging.
3. **Verified Customer Creations Corner ("Makers of Craftique Yard"):**
   - **Where:** Dedicated section on the homepage and above footer.
   - **Content:** Grid of real customer photos showing their finished journals and craft projects with customer names and verified badges.

---

### Pillar 2: Dopamine & Average Order Value (AOV) Boosters
> **Insight:** Craft lovers are impulse buyers. Incentivizing higher order totals reduces effective CAC (Customer Acquisition Cost).

1. **Dynamic Free Shipping Progress Bar:**
   - **Where:** Cart drawer and checkout modal.
   - **Logic:** Threshold set in settings (e.g., ৳1,500).
     - When subtotal is ৳1,100:  
       `[████████░░░░] আর মাত্র ৳৪০০ যোগ করলেই ফ্রি ডেলিভারি! 🚚`
     - When subtotal reaches ৳1,500+:  
       `[████████████] অভিনন্দন! আপনি পাচ্ছেন সম্পূর্ণ ফ্রি ডেলিভারি! 🎉`
2. **"Bundle & Save" / Complete Kit Architecture:**
   - **Concept:** Pair 3–4 complementary items into a single SKU with 10–15% bundle discount.
   - **Example:** "Vintage Journal Starter Kit" (Journal + Wax Stamp + Spoon + 100 Wax Beads + Aesthetic Stickers).
   - **UI:** One-click "Add Complete Bundle to Cart" (এক ক্লিকে ফুল সেট কিনুন).
3. **Surprise Freebie ("Free Aesthetic Sticker Pack"):**
   - **Psychology:** Risk-reversal & delightful reciprocation.
   - **Banner/Badge:** `🎁 প্রতিটি অর্ডারের সাথে পাচ্ছেন সারপ্রাইজ ভিন্টেজ স্টিকার উপহার!`

---

### Pillar 3: Scarcity & Social Validation (FOMO & Urgent Action)
> **Insight:** "I'll buy later" is the death of mobile e-commerce. Gentle, authentic scarcity prompts immediate checkout.

1. **Artisanal Limited-Batch Stock Warning:**
   - **Logic:** Triggered when `stock <= 5`.
   - **UI Copy:**  
     `🔥 হাতে তৈরি সীমিত সংস্করণ — স্টকে মাত্র ৩টি বাকি আছে!`
2. **Non-Intrusive Social Proof Toast:**
   - **Appearance:** Subtle bottom-left toast (mobile bottom-center banner, dismissible).
   - **Copy:** `✨ তানজিলা (মিরপুর, ঢাকা) কিছুক্ষণ আগে Wax Seal Set অর্ডার করেছেন` (rotates real past orders).

---

### Pillar 4: Gifting & Emotional Resonance (উপহার পাঠানোর সেবা)
> **Insight:** 40%+ of craft supplies are bought as gifts for birthdays, anniversaries, or friendship tokens.

1. **"Send as a Gift" Checkbox in Checkout:**
   - **Toggle:** `🎁 প্রিয়জনের জন্য উপহার হিসেবে পাঠাতে চান? (+৳৫০)`
   - **Interactive Fields:**
     - Gift Recipient Name & Phone
     - Custom Message textarea: *"কার্ডে কী বার্তা লিখে দিতে চান?"*
   - **Fulfillment:** Craftique Yard staff writes the message on a premium aesthetic card, seals it with custom wax stamp, and wraps in ribbon packaging.

---

### Pillar 5: Mobile UX & Thumb Zone Optimization
> **Insight:** A mobile user must be able to complete their full shopping journey with one thumb without zooming or hunting for buttons.

1. **Swipeable Mobile Image Carousel:**
   - Touch-enabled swipe gesture (using CSS scroll-snap or lightweight touch listener) on product modals and cards.
2. **Post-Purchase Celebration Animation:**
   - Fullscreen subtle confetti canvas explosion (`canvas-confetti`) upon order submission.
   - Instantly downloads or copies a stylized digital invoice memo.
3. **Floating "Craft Concierge" (ডিজাইনারের সাথে পরামর্শ):**
   - Floating aesthetic button with WhatsApp icon:  
     `"কোনটি আপনার জন্য সেরা হবে বুঝতে পারছেন না? হোয়াটসঅ্যাপে আমাদের ডিজাইনারের পরামর্শ নিন"`

---

## 🛠️ Technical Specifications & File Mapping

When instructing an agent to implement any phase, refer to these exact project files:

| Feature / Domain | Key Source Files |
| :--- | :--- |
| **Product Display & Cart** | `craftique-yard/app/storefront.tsx`<br>`craftique-yard/app/shop-clarity.css` |
| **Free Shipping Bar & Bundles** | `craftique-yard/app/storefront.tsx`<br>`craftique-yard/app/lib/catalog.ts` |
| **Gift Option & Order Creation** | `craftique-yard/app/api/orders/route.ts`<br>`craftique-yard/app/storefront.tsx` |
| **Admin Order Detail & Gift View** | `craftique-yard/app/admin/panel.tsx` |
| **Customer Dashboard & Auth** | `craftique-yard/app/account/page.tsx`<br>`craftique-yard/app/api/customer/route.ts` |
| **Site Settings (Free Shipping Threshold)** | `craftique-yard/app/lib/store.ts`<br>`craftique-yard/app/admin/panel.tsx` |

---

## 🚀 Phased Implementation Roadmap

### Phase 1: High-Impact CRO Quick Wins (Estimated: 1 Sprint)
- [ ] Add **"Open Box Delivery / দেখে নেওয়ার নিশ্চয়তা"** badges on product detail modal and checkout card.
- [ ] Implement **Dynamic Free Shipping Progress Bar** inside Cart drawer.
- [ ] Add **Low-Stock urgency badge** (`হাতে তৈরি — মাত্র Xটি বাকি`) when `stock <= 5`.

### Phase 2: Gifting & Premium Experience (Estimated: 1 Sprint)
- [ ] Add **"Send as a Gift" (+৳৫০)** option with custom handwritten card message textarea in checkout.
- [ ] Update Order Payload and Admin Panel to display gift notes and badge gift orders with a 🎁 icon.
- [ ] Implement **Touch Swipeable Image Gallery** on mobile product modals.
- [ ] Integrate **Confetti Celebration Animation** on successful checkout.

### Phase 3: Bundles & Social Proof (Estimated: 1 Sprint)
- [ ] Add **"Bundle & Save" (কম্প্লিট কিট)** product collection section with 1-click bundle checkout.
- [ ] Implement **Recent Purchase Social Proof Notification** ticker.
- [ ] Add **"Customer Creations / Made with Craftique Yard"** visual community gallery.

---

## 💬 Ready-to-Use Agent Prompt

Copy and paste this instruction directly to any future AI agent:

```text
Please read the documentation at `craftique-yard/docs/CRO_AND_PSYCHOLOGY_BLUEPRINT.md`. 
I want you to implement Phase 1 features:
1. Dynamic Free Shipping Progress Bar in the cart drawer.
2. Open Box Checking trust badges in the product modal and checkout.
3. Low-stock urgency badge when stock <= 5.
Ensure all UI is fully responsive, mobile-first, supporting both English and Bengali languages, and verified with `npm run check`.
```
