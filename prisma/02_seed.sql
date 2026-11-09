-- =============================================
-- BANJARAN STORE — SEED DATA
-- Run this AFTER 01_schema.sql
-- =============================================

-- Admin User
-- Password: banjaran2024!  (bcrypt hash)
-- ⚠️ CHANGE THIS PASSWORD after first login!
INSERT INTO "AdminUser" ("id", "email", "password", "name", "role")
VALUES (
  gen_random_uuid()::text,
  'admin@banjaran.my',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u96m',
  'Banjaran Admin',
  'admin'
) ON CONFLICT ("email") DO NOTHING;

-- Site Settings
INSERT INTO "SiteSettings" ("id", "storeName", "storeEmail", "currency", "updatedAt")
VALUES ('settings', 'Banjaran', 'hello@banjaran.my', 'MYR', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- =============================================
-- PRODUCT 1: Crocker Tee
-- =============================================
WITH crocker AS (
  INSERT INTO "Product" ("id", "name", "slug", "description", "price", "images", "category", "tags", "featured", "published")
  VALUES (
    gen_random_uuid()::text,
    'Crocker Tee',
    'crocker-tee',
    'Inspired by the Crocker Range in Sabah — Malaysia''s most biodiverse mountain system and home to Mount Kinabalu. A tribute to Borneo''s wild heart. Premium 100% cotton, heavyweight 220gsm, oversized fit.',
    99.00,
    ARRAY[]::TEXT[],
    'tee',
    ARRAY['hiking', 'mountain', 'sabah', 'crocker', 'borneo'],
    true,
    true
  )
  ON CONFLICT ("slug") DO UPDATE SET "updatedAt" = CURRENT_TIMESTAMP
  RETURNING "id"
)
INSERT INTO "ProductVariant" ("id", "productId", "color", "size", "stock", "sku")
SELECT gen_random_uuid()::text, crocker.id, v.color, v.size, v.stock, v.sku
FROM crocker,
(VALUES
  ('White', 'S',   20, 'CKR-WHT-S'),
  ('White', 'M',   30, 'CKR-WHT-M'),
  ('White', 'L',   30, 'CKR-WHT-L'),
  ('White', 'XL',  20, 'CKR-WHT-XL'),
  ('White', 'XXL', 10, 'CKR-WHT-XXL'),
  ('Black', 'S',   20, 'CKR-BLK-S'),
  ('Black', 'M',   30, 'CKR-BLK-M'),
  ('Black', 'L',   30, 'CKR-BLK-L'),
  ('Black', 'XL',  20, 'CKR-BLK-XL'),
  ('Black', 'XXL', 10, 'CKR-BLK-XXL')
) AS v(color, size, stock, sku)
ON CONFLICT ("sku") DO NOTHING;

-- =============================================
-- PRODUCT 2: Carabiner Tee
-- =============================================
WITH carabiner AS (
  INSERT INTO "Product" ("id", "name", "slug", "description", "price", "images", "category", "tags", "featured", "published")
  VALUES (
    gen_random_uuid()::text,
    'Carabiner Tee',
    'carabiner-tee',
    'A nod to the climbing community. The carabiner — the connector of all things vertical. Wear it to the crag, the gym, or the streets. Premium 100% cotton, heavyweight 220gsm, oversized fit.',
    99.00,
    ARRAY[]::TEXT[],
    'tee',
    ARRAY['climbing', 'bouldering', 'carabiner', 'outdoor', 'crag'],
    true,
    true
  )
  ON CONFLICT ("slug") DO UPDATE SET "updatedAt" = CURRENT_TIMESTAMP
  RETURNING "id"
)
INSERT INTO "ProductVariant" ("id", "productId", "color", "size", "stock", "sku")
SELECT gen_random_uuid()::text, carabiner.id, v.color, v.size, v.stock, v.sku
FROM carabiner,
(VALUES
  ('White', 'S',   15, 'CAR-WHT-S'),
  ('White', 'M',   25, 'CAR-WHT-M'),
  ('White', 'L',   25, 'CAR-WHT-L'),
  ('White', 'XL',  15, 'CAR-WHT-XL'),
  ('White', 'XXL',  8, 'CAR-WHT-XXL'),
  ('Black', 'S',   15, 'CAR-BLK-S'),
  ('Black', 'M',   25, 'CAR-BLK-M'),
  ('Black', 'L',   25, 'CAR-BLK-L'),
  ('Black', 'XL',  15, 'CAR-BLK-XL'),
  ('Black', 'XXL',  8, 'CAR-BLK-XXL')
) AS v(color, size, stock, sku)
ON CONFLICT ("sku") DO NOTHING;

-- =============================================
-- PRODUCT 3: Titiwangsa Tee
-- =============================================
WITH titiwangsa AS (
  INSERT INTO "Product" ("id", "name", "slug", "description", "price", "images", "category", "tags", "featured", "published")
  VALUES (
    gen_random_uuid()::text,
    'Titiwangsa Tee',
    'titiwangsa-tee',
    'The Titiwangsa Range — the backbone of Peninsular Malaysia. Running from Kelantan to Negeri Sembilan, this is the range every Malaysian hiker knows. Premium 100% cotton, heavyweight 220gsm, relaxed fit.',
    99.00,
    ARRAY[]::TEXT[],
    'tee',
    ARRAY['hiking', 'mountain', 'titiwangsa', 'peninsular', 'trail'],
    true,
    true
  )
  ON CONFLICT ("slug") DO UPDATE SET "updatedAt" = CURRENT_TIMESTAMP
  RETURNING "id"
)
INSERT INTO "ProductVariant" ("id", "productId", "color", "size", "stock", "sku")
SELECT gen_random_uuid()::text, titiwangsa.id, v.color, v.size, v.stock, v.sku
FROM titiwangsa,
(VALUES
  ('White', 'S',   20, 'TTW-WHT-S'),
  ('White', 'M',   35, 'TTW-WHT-M'),
  ('White', 'L',   35, 'TTW-WHT-L'),
  ('White', 'XL',  20, 'TTW-WHT-XL'),
  ('White', 'XXL', 10, 'TTW-WHT-XXL')
) AS v(color, size, stock, sku)
ON CONFLICT ("sku") DO NOTHING;

-- =============================================
-- Verify seeded data
-- =============================================
SELECT
  'Products: ' || COUNT(*)::text AS summary FROM "Product"
UNION ALL
SELECT
  'Variants: ' || COUNT(*)::text FROM "ProductVariant"
UNION ALL
SELECT
  'Admin users: ' || COUNT(*)::text FROM "AdminUser";
