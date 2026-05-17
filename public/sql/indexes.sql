-- ============================================================
-- dekanti.hr — Indexes SQL
-- Performansni indeksi za sve tablice
-- ============================================================

-- ============================================================
-- USERS
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
    ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role);

CREATE INDEX IF NOT EXISTS idx_users_newsletter
    ON users (newsletter_subscribed) WHERE newsletter_subscribed = TRUE;

CREATE INDEX IF NOT EXISTS idx_users_email_verify_token
    ON users (email_verify_token) WHERE email_verify_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_password_reset_token
    ON users (password_reset_token) WHERE password_reset_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_created_at
    ON users (created_at DESC);

-- ============================================================
-- BRANDS
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_brands_naziv
    ON brands (naziv);

CREATE INDEX IF NOT EXISTS idx_brands_active
    ON brands (active) WHERE active = TRUE;

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug
    ON categories (slug);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id
    ON categories (parent_id);

CREATE INDEX IF NOT EXISTS idx_categories_active
    ON categories (active) WHERE active = TRUE;

-- ============================================================
-- FRAGRANCE NOTES
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_fragrance_notes_naziv
    ON fragrance_notes (naziv);

CREATE INDEX IF NOT EXISTS idx_fragrance_notes_tip
    ON fragrance_notes (tip);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug
    ON products (slug);

CREATE INDEX IF NOT EXISTS idx_products_brand_id
    ON products (brand_id);

CREATE INDEX IF NOT EXISTS idx_products_featured
    ON products (featured) WHERE featured = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_active
    ON products (active) WHERE active = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_spol
    ON products (spol);

CREATE INDEX IF NOT EXISTS idx_products_sezona
    ON products (sezona);

CREATE INDEX IF NOT EXISTS idx_products_koncentracija
    ON products (koncentracija);

CREATE INDEX IF NOT EXISTS idx_products_created_at
    ON products (created_at DESC);

-- Full-text search na nazivu i opisu
CREATE INDEX IF NOT EXISTS idx_products_naziv_fts
    ON products USING gin(to_tsvector('croatian', naziv));

CREATE INDEX IF NOT EXISTS idx_products_opis_fts
    ON products USING gin(to_tsvector('croatian', COALESCE(opis_kratki, '') || ' ' || COALESCE(opis_dugi, '')));

-- Trigram search (za LIKE pretrage)
CREATE INDEX IF NOT EXISTS idx_products_naziv_trgm
    ON products USING gin(naziv gin_trgm_ops);

-- Kompozitni indeks za filtriranje kataloga
CREATE INDEX IF NOT EXISTS idx_products_active_brand_spol
    ON products (active, brand_id, spol);

CREATE INDEX IF NOT EXISTS idx_products_active_sezona
    ON products (active, sezona);

-- ============================================================
-- PRODUCT SIZES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id
    ON product_sizes (product_id);

CREATE INDEX IF NOT EXISTS idx_product_sizes_velicina
    ON product_sizes (velicina_ml);

CREATE INDEX IF NOT EXISTS idx_product_sizes_cijena
    ON product_sizes (cijena);

CREATE INDEX IF NOT EXISTS idx_product_sizes_zaliha
    ON product_sizes (zaliha);

-- Upozorenja o niskoj zalihi
CREATE INDEX IF NOT EXISTS idx_product_sizes_low_stock
    ON product_sizes (zaliha) WHERE zaliha < 5;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_sizes_sku
    ON product_sizes (sku) WHERE sku IS NOT NULL;

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_product_images_product_id
    ON product_images (product_id);

CREATE INDEX IF NOT EXISTS idx_product_images_primary
    ON product_images (product_id, is_primary) WHERE is_primary = TRUE;

CREATE INDEX IF NOT EXISTS idx_product_images_sort
    ON product_images (product_id, sort_order);

-- ============================================================
-- PRODUCT NOTES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_product_notes_product_id
    ON product_notes (product_id);

CREATE INDEX IF NOT EXISTS idx_product_notes_note_id
    ON product_notes (note_id);

CREATE INDEX IF NOT EXISTS idx_product_notes_tip
    ON product_notes (tip);

-- Kompozitni za filtriranje po notama
CREATE INDEX IF NOT EXISTS idx_product_notes_product_tip
    ON product_notes (product_id, tip);

-- ============================================================
-- PRODUCT CATEGORIES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id
    ON product_categories (product_id);

CREATE INDEX IF NOT EXISTS idx_product_categories_category_id
    ON product_categories (category_id);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number
    ON orders (order_number);

CREATE INDEX IF NOT EXISTS idx_orders_user_id
    ON orders (user_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
    ON orders (status);

CREATE INDEX IF NOT EXISTS idx_orders_email
    ON orders (email);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
    ON orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_kupon_id
    ON orders (kupon_id) WHERE kupon_id IS NOT NULL;

-- Kompozitni za admin filtriranje
CREATE INDEX IF NOT EXISTS idx_orders_status_created
    ON orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_user_status
    ON orders (user_id, status);

-- Dnevni prihodi
CREATE INDEX IF NOT EXISTS idx_orders_date_status
    ON orders (DATE(created_at), status);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_order_items_order_id
    ON order_items (order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_size_id
    ON order_items (product_size_id);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_kod
    ON coupons (UPPER(kod)); -- case-insensitive

CREATE INDEX IF NOT EXISTS idx_coupons_aktivan
    ON coupons (aktivan) WHERE aktivan = TRUE;

CREATE INDEX IF NOT EXISTS idx_coupons_vrijedi_do
    ON coupons (vrijedi_do) WHERE vrijedi_do IS NOT NULL;

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id
    ON wishlist (user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_product_id
    ON wishlist (product_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wishlist_user_product
    ON wishlist (user_id, product_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reviews_product_id
    ON reviews (product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id
    ON reviews (user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_approved
    ON reviews (approved) WHERE approved = TRUE;

CREATE INDEX IF NOT EXISTS idx_reviews_product_approved
    ON reviews (product_id, approved);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at
    ON reviews (created_at DESC);

-- ============================================================
-- NEWSLETTER
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email
    ON newsletter (email);

CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_token
    ON newsletter (token);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed
    ON newsletter (subscribed) WHERE subscribed = TRUE;

-- ============================================================
-- ADMIN LOGS
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id
    ON admin_logs (admin_id);

CREATE INDEX IF NOT EXISTS idx_admin_logs_akcija
    ON admin_logs (akcija);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at
    ON admin_logs (created_at DESC);

-- ============================================================
-- STATISTIKE — optimizirani upiti za dashboard
-- ============================================================

-- Top proizvodi po prodaji (za bestsellers)
CREATE INDEX IF NOT EXISTS idx_oi_product_size_kolicina
    ON order_items (product_size_id, kolicina);

-- Revenue po danima (za graf)
CREATE INDEX IF NOT EXISTS idx_orders_date_revenue
    ON orders (created_at, ukupno, status);

-- ANALYZE sve tablice za fresh statistike
ANALYZE users;
ANALYZE products;
ANALYZE product_sizes;
ANALYZE orders;
ANALYZE order_items;
ANALYZE reviews;
ANALYZE coupons;
ANALYZE newsletter;
