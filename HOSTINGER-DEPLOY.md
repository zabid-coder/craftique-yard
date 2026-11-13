# Hostinger Deployment Guide (Craftique Yard)

This project runs on **Hostinger Business Plan (Node.js Web App + MySQL)**.

## 1. Create the Clean Upload ZIP
Run locally inside `craftique-yard/`:
```bash
npm run package:hostinger
```
This creates `dist-hostinger/craftique-yard-hostinger.zip` without `node_modules`, `.next`, `.local-data`, `.env.local`, `ADMIN-ACCESS.txt`, or macOS `._*` files.

## 2. Create MySQL Database in Hostinger hPanel
1. Go to **hPanel → Databases → Management**.
2. Create a new MySQL database and user (e.g., `u123456789_craftique`).
3. Save these values:
   - `DB_HOST` (usually `localhost` or the MySQL host shown in hPanel)
   - `DB_PORT` (`3306`)
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

## 3. Deploy Node.js Web App on Hostinger Business Plan
1. Go to **hPanel → Websites → Add Website / Node.js Web Apps** and select your domain.
2. Upload `dist-hostinger/craftique-yard-hostinger.zip` (or connect your Git repository).
3. Select **Node.js `22` (`>=22.13.0`)**.
4. Set **Environment Variables** in Hostinger hPanel:
   ```env
   SITE_URL=https://your-domain.com
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_SSL=false
   ADMIN_EMAILS=zabid.coder@gmail.com,juwelranatju@gmail.com,amikaakter162@gmail.com
   ADMIN_BOOTSTRAP_TOKEN=choose-a-strong-random-secret-code
   ALLOW_LOCAL_PREVIEW=false
   ```
5. Hostinger runs `npm install` and `npm run build`, then starts with `npm start`.

## 4. Initialize MySQL Tables (First Time Only)
From Hostinger SSH / hPanel Terminal inside your app directory, run:
```bash
npm run db:migrate
```
*(Or import `db/schema.mysql.sql` via phpMyAdmin into your Hostinger MySQL database.)*

## 5. First-Time Admin Setup & Cash on Delivery Only
1. Open `https://your-domain.com/admin`.
2. Click **First-time setup**, enter an email listed in `ADMIN_EMAILS`, choose a 12+ character password, and enter your `ADMIN_BOOTSTRAP_TOKEN`.
3. Sign in → go to **Shop Settings** → uncheck **bKash** and **Nagad** if you want **Cash on Delivery (COD) only** right now, then click **Save Settings**.
4. Go to **Products & Serial** to upload new products, set **Best Seller** badges, or reorder products (`#1` shows first on the main page).
5. Go to **Orders** whenever a new order arrives → click **View & Call** → tap **Call Customer** to confirm COD delivery!
