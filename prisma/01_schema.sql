-- =============================================
-- BANJARAN STORE — DATABASE SCHEMA
-- Paste this into Neon SQL Editor first
-- =============================================

-- Enums
CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
);

CREATE TYPE "PaymentStatus" AS ENUM (
  'UNPAID', 'PAID', 'REFUNDED'
);

-- Products
CREATE TABLE "Product" (
  "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"         TEXT NOT NULL,
  "slug"         TEXT NOT NULL UNIQUE,
  "description"  TEXT NOT NULL,
  "price"        DOUBLE PRECISION NOT NULL,
  "comparePrice" DOUBLE PRECISION,
  "images"       TEXT[] NOT NULL DEFAULT '{}',
  "category"     TEXT NOT NULL DEFAULT 'tee',
  "tags"         TEXT[] NOT NULL DEFAULT '{}',
  "featured"     BOOLEAN NOT NULL DEFAULT false,
  "published"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Product Variants (colour × size × stock)
CREATE TABLE "ProductVariant" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "productId" TEXT NOT NULL,
  "color"     TEXT NOT NULL,
  "size"      TEXT NOT NULL,
  "stock"     INTEGER NOT NULL DEFAULT 0,
  "sku"       TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("productId", "color", "size"),
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

-- Customers
CREATE TABLE "Customer" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email"     TEXT NOT NULL UNIQUE,
  "name"      TEXT NOT NULL,
  "phone"     TEXT,
  "address"   JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Orders
CREATE TABLE "Order" (
  "id"              TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "orderNumber"     TEXT NOT NULL UNIQUE,
  "customerId"      TEXT,
  "email"           TEXT NOT NULL,
  "name"            TEXT NOT NULL,
  "phone"           TEXT,
  "status"          "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "paymentStatus"   "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
  "total"           DOUBLE PRECISION NOT NULL,
  "subtotal"        DOUBLE PRECISION NOT NULL,
  "shippingCost"    DOUBLE PRECISION NOT NULL DEFAULT 0,
  "stripePaymentId" TEXT,
  "stripeSessionId" TEXT,
  "shippingAddress" JSONB NOT NULL,
  "notes"           TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("customerId") REFERENCES "Customer"("id")
);

-- Order Items
CREATE TABLE "OrderItem" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "orderId"   TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT,
  "quantity"  INTEGER NOT NULL,
  "price"     DOUBLE PRECISION NOT NULL,
  "color"     TEXT,
  "size"      TEXT,
  PRIMARY KEY ("id"),
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
);

-- Blog Posts
CREATE TABLE "BlogPost" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "title"     TEXT NOT NULL,
  "slug"      TEXT NOT NULL UNIQUE,
  "content"   TEXT NOT NULL,
  "excerpt"   TEXT NOT NULL,
  "image"     TEXT,
  "tags"      TEXT[] NOT NULL DEFAULT '{}',
  "published" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Admin Users
CREATE TABLE "AdminUser" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email"     TEXT NOT NULL UNIQUE,
  "password"  TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "role"      TEXT NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Site Settings
CREATE TABLE "SiteSettings" (
  "id"            TEXT NOT NULL DEFAULT 'settings',
  "storeName"     TEXT NOT NULL DEFAULT 'Banjaran',
  "storeEmail"    TEXT NOT NULL DEFAULT 'hello@banjaran.my',
  "currency"      TEXT NOT NULL DEFAULT 'MYR',
  "shippingRates" JSONB NOT NULL DEFAULT '{}',
  "announcement"  TEXT,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

-- Indexes for performance
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

SELECT 'Schema created successfully ✅' AS result;
