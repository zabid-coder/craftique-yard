# 🌸 Craftique Yard — Premium Craft & DIY E-Commerce Platform

> *"A little material. A lot of possibility."*  
> *ছোট্ট উপকরণে, অসীম সৃষ্টির সম্ভাবনা।*

Craftique Yard is a modern, high-converting, mobile-first full-stack e-commerce web application tailored specifically for craft supplies, chenille stems (pipe cleaners), ribbons, bouquet wrapping, and DIY essentials in Bangladesh.

Built with **Next.js 16 (Turbopack)**, **React 19**, **TypeScript**, and dual-database architecture (**MySQL** for Hostinger production + **SQLite** for instant local development).

---

## ✨ Key Features & UX Innovations (CRO Optimized)

### 📱 1. Mobile-First & Buying Psychology (Conversion Booster)
* **1-Tap Direct Buy Now ("এখনই অর্ডার করুন"):**  
  Every product card and detail modal features a direct "Order Now" button that instantly opens the checkout screen with the item pre-selected—eliminating the traditional 5-step cart friction.
* **Mobile Sticky Bottom Action Bar:**  
  * **When cart is empty:** Quick thumb-friendly access to Collection, WhatsApp chat, and direct phone call.
  * **When cart has items:** Live persistent summary showing item count, subtotal (`৳XXX`), and an instant **"অর্ডার করুন ➔"** checkout trigger.
* **1-Tap WhatsApp Direct Order:**  
  Customers who prefer chatting over web forms can click "Order via WhatsApp" to instantly generate a pre-formatted message with product name, quantity, price, and customer details.
* **Interactive Quantity Stepper:**  
  Customers can adjust units (`[-]` count `[+]`) inside the product modal with instant subtotal calculation.
* **Trust Badges & Risk Reversal:**  
  Cash on Delivery (COD) reassurance badges, "Check parcel upon delivery" notices, and delivery time estimations (Dhaka: 1-2 days, Outside Dhaka: 2-3 days).

### 🔍 2. Global Smart Search & Category Discovery
* Real-time search that spans the entire catalog regardless of the currently selected category tab, preventing zero-result dead ends.
* 1-Click "Clear Search" chip and dynamic search result counters.
* Sticky frosted-glass boutique header (`backdrop-filter: blur(14px)`) keeping search, language switch, and bag accessible on every scroll.

### 📦 3. 5-Stage Visual Order Tracking Stepper
Customers tracking their orders via Reference (`CY-YYYYMMDD-XXXXXXXX`) and Mobile Number receive an Amazon/Apple-style visual progress timeline:
```
[ ✔ অর্ডার গৃহীত ] ➔ [ ✔ অর্ডার নিশ্চিত ] ➔ [ ⟳ প্রস্তুত হচ্ছে ] ➔ [ ৪. ডেলিভারিতে আছে ] ➔ [ ৫. সম্পন্ন ]
```

### 🧾 4. Digital Invoice & Order Memo
* Professional order confirmation screen formatted as a digital invoice card.
* 1-Click copy for Order Reference.
* Instant WhatsApp Order Confirmation button.
* Offline text invoice memo download (`CraftiqueYard-[Reference].txt`).

### 🇧🇩 5. Bangladesh 64 Districts Auto-Zone Intelligence
* Built-in 64 districts selector.
* Selecting "Dhaka" automatically configures the delivery charge to Inside Dhaka rate (`৳80`).
* Selecting any other district automatically configures Outside Dhaka rate (`৳130`).
* Automatic phone number sanitization (cleans spaces, dashes, and `+88` prefixes).

### 🛡️ 6. Full Administrative Dashboard (`/admin`)
* **Product Management:** Add, edit, reorder items, set stock, toggle "Best Seller" badges.
* **Order Processing:** Filter orders by status (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`).
* **Direct Customer Contact:** 1-Click "Call Customer" or "Chat on WhatsApp" with pre-filled order status updates.
* **Store Settings:** Live management of delivery fees, payment numbers (bKash/Nagad), and contact details.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4.6 (Turbopack) | App Router, Server Actions, API Routes, Edge Headers |
| **UI Library** | React 19.2.6 | Client & Server Components, Hooks |
| **Styling** | Custom Responsive CSS3 | Safe-area support, Glassmorphism, Zero CSS framework bloat |
| **Icons** | Lucide React | Modern minimalist iconography |
| **Database** | MySQL2 / SQLite | MySQL for Hostinger production, SQLite WAL for local preview |
| **Validation** | Zod | Server-side runtime request validation & sanitization |
| **Image Processing** | Sharp | Config-aware high-performance image optimization |

---

## 🚀 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/zabid-coder/craftique-yard.git
cd craftique-yard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create `.env.local` in the project root:
```env
SITE_URL=http://localhost:3000
ALLOW_LOCAL_PREVIEW=true
ADMIN_EMAILS=zabid.coder@gmail.com
ADMIN_BOOTSTRAP_TOKEN=local-dev-secret-token
```

### 4. Run development server
```bash
npm run dev
```
Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

---

## 🧪 Quality Assurance & Scripts

| Command | Action |
| :--- | :--- |
| `npm run check` | Run TypeScript type checks (`tsc --noEmit`) |
| `npm run build` | Compile production build with Next.js Turbopack |
| `npm run start` | Start production server locally |
| `npm run package:hostinger` | Create clean `dist-hostinger/craftique-yard-hostinger.zip` ready for Hostinger upload |
| `npm run db:migrate` | Run database migrations on MySQL / SQLite |

---

## 🌐 Hostinger Deployment Guide (Business Plan)

1. **Package the upload ZIP:**
   ```bash
   npm run package:hostinger
   ```
   This generates `dist-hostinger/craftique-yard-hostinger.zip` (clean, cross-platform archive without `node_modules` or local caches).

2. **Upload & Configure in hPanel:**
   * Go to **hPanel → Websites → Node.js Web Apps**.
   * Upload `craftique-yard-hostinger.zip` and extract to `public_html/`.
   * Set Node.js version to **`22` (`>=22.13.0`)**.
   * Add Environment Variables:
     ```env
     SITE_URL=https://your-domain.com
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=your_database_name
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_SSL=false
     ADMIN_EMAILS=zabid.coder@gmail.com
     ADMIN_BOOTSTRAP_TOKEN=your-random-secret-code
     ALLOW_LOCAL_PREVIEW=false
     ```
   * Run initial migration: `npm run db:migrate`.
   * Start the app with `npm start`!

---

## 📄 License
Private & Proprietary — All rights reserved by **Craftique Yard**.
