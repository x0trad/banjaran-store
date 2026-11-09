# Banjaran Store — Setup & Deployment Guide

## What's Built

A complete e-commerce platform including:
- **Storefront** — Homepage, Shop, Product pages, Cart, Checkout
- **Stripe Payment** — Checkout sessions, webhooks, automatic stock deduction
- **Admin CMS** — Dashboard, Products, Orders, Inventory, Customers, Blog
- **Email** — Order confirmation + shipping notifications via Resend
- **Database** — PostgreSQL via Neon (free tier), managed with Prisma ORM
- **Auth** — Secure JWT-based admin login

---

## Step 1 — Set Up Your Database (Neon — Free)

1. Go to **https://neon.tech** and sign up for free
2. Create a new project called `banjaran`
3. Copy the **Connection string** (both DATABASE_URL and DIRECT_URL)

---

## Step 2 — Set Up Email (Resend — Free)

1. Go to **https://resend.com** and sign up
2. Create an API key
3. Add your domain `banjaran.my` in Resend and verify DNS records
4. Set your `EMAIL_FROM` as `orders@banjaran.my`

---

## Step 3 — Set Up Image Hosting (Cloudinary — Free)

1. Go to **https://cloudinary.com** and sign up
2. Copy your Cloud Name, API Key, and API Secret from the dashboard

---

## Step 4 — Set Up Stripe Webhook

In your Stripe dashboard:
1. Go to **Developers → Webhooks**
2. Add endpoint: `https://yourdomain.com.my/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy the **Webhook Secret** (starts with `whsec_`)

---

## Step 5 — Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Then fill in:
- `DATABASE_URL` — from Neon
- `DIRECT_URL` — from Neon (same connection string)
- `STRIPE_SECRET_KEY` — from your Stripe dashboard (sk_live_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from Stripe (pk_live_...)
- `STRIPE_WEBHOOK_SECRET` — from Stripe webhook settings (whsec_...)
- `JWT_SECRET` — generate with: `openssl rand -hex 32`
- `RESEND_API_KEY` — from Resend dashboard
- `CLOUDINARY_*` — from Cloudinary dashboard
- `NEXT_PUBLIC_APP_URL` — your actual domain (e.g. https://banjaran.com.my)

---

## Step 6 — Local Development

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Seed with your 3 products + admin user
npm run db:seed

# Start development server
npm run dev
```

Visit:
- Store: http://localhost:3000
- Admin: http://localhost:3000/admin
- Admin login: admin@banjaran.my / banjaran2024!
- ⚠️ Change admin password after first login!

---

## Step 7 — Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to **https://vercel.com** → Import Project → select your repo
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy!

```bash
# Or deploy via Vercel CLI
npx vercel --prod
```

5. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL or custom domain
6. Connect your custom domain (banjaran.com.my) in Vercel settings
7. Update your Stripe webhook URL to the production domain

---

## Step 8 — After Deployment

1. Run seed on production: `npx vercel run db:seed` (or use Neon's SQL editor)
2. Add your product images via the Admin CMS → Products
3. Upload your Banjaran tee photos to Cloudinary and paste URLs
4. Test a full checkout with Stripe test mode first
5. Switch Stripe to live mode when ready

---

## Admin Panel Guide

| URL | Purpose |
|-----|---------|
| `/admin` | Dashboard — revenue, orders, low stock |
| `/admin/products` | Add/edit/publish products |
| `/admin/products/new` | Create new product with variants |
| `/admin/orders` | View and update order status |
| `/admin/inventory` | Quick stock level management |
| `/admin/customers` | Customer list with purchase history |
| `/admin/blog` | Create/edit blog/journal posts |

---

## Shipping Rates (configured in `lib/utils.ts`)

| Condition | Rate |
|-----------|------|
| Order ≥ RM150 | FREE |
| West Malaysia | RM8 |
| East Malaysia (Sabah, Sarawak, Labuan) | RM15 |

Update `calculateShipping()` in `lib/utils.ts` to adjust rates.

---

## Migrating from EasyStore

1. Export your products from EasyStore (usually CSV)
2. Export your customer list (CSV)
3. Use the Admin CMS to recreate your 3 products with images
4. Import customers: create a migration script using `prisma.customer.createMany()`
5. For order history: optional — import via Prisma seed script

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Neon |
| ORM | Prisma |
| Payment | Stripe Checkout |
| Email | Resend |
| Images | Cloudinary |
| Auth | JWT (jose) |
| Hosting | Vercel |
| Cart State | Zustand + localStorage |
