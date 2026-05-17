-- ============================================================
-- dekanti.hr — Schema SQL
-- Hrvatska e-commerce platforma za prodaju decant parfema
-- ============================================================

-- Proširi UUID podršku
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- za full-text search

-- ============================================================
-- BRANDOVI
-- ============================================================
CREATE TABLE IF NOT EXISTS brands (
    id          SERIAL PRIMARY KEY,
    naziv       VARCHAR(100) NOT NULL UNIQUE,
    opis        TEXT,
    logo_url    VARCHAR(500),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- KORISNICI
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'kupac');

CREATE TABLE IF NOT EXISTS users (
    id                      SERIAL PRIMARY KEY,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    password_hash           VARCHAR(255) NOT NULL,
    ime                     VARCHAR(100) NOT NULL,
    prezime                 VARCHAR(100) NOT NULL,
    adresa                  VARCHAR(255),
    grad                    VARCHAR(100),
    postanski_broj          VARCHAR(10),
    telefon                 VARCHAR(20),
    role                    user_role NOT NULL DEFAULT 'kupac',
    newsletter_subscribed   BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified          BOOLEAN NOT NULL DEFAULT FALSE,
    email_verify_token      VARCHAR(255),
    password_reset_token    VARCHAR(255),
    password_reset_expires  TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- KATEGORIJE (hijerarhija)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    naziv       VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL UNIQUE,
    parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    opis        TEXT,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MIRISNE NOTE
-- ============================================================
CREATE TYPE note_tip AS ENUM ('top', 'heart', 'base');

CREATE TABLE IF NOT EXISTS fragrance_notes (
    id      SERIAL PRIMARY KEY,
    naziv   VARCHAR(100) NOT NULL UNIQUE,
    tip     note_tip NOT NULL
);

-- ============================================================
-- PROIZVODI
-- ============================================================
CREATE TYPE koncentracija_tip AS ENUM ('EDP', 'EDT', 'Parfum', 'EDP Extrait', 'EDC', 'EDP Intense');
CREATE TYPE spol_tip AS ENUM ('muški', 'ženski', 'unisex');
CREATE TYPE sezona_tip AS ENUM ('proljeće', 'ljeto', 'jesen', 'zima', 'sve');

CREATE TABLE IF NOT EXISTS products (
    id              SERIAL PRIMARY KEY,
    naziv           VARCHAR(255) NOT NULL,
    slug            VARCHAR(280) NOT NULL UNIQUE,
    brand_id        INTEGER NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    opis_kratki     VARCHAR(500),
    opis_dugi       TEXT,
    koncentracija   koncentracija_tip NOT NULL,
    spol            spol_tip NOT NULL DEFAULT 'unisex',
    sezona          sezona_tip NOT NULL DEFAULT 'sve',
    featured        BOOLEAN NOT NULL DEFAULT FALSE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VELIČINE I CIJENE PROIZVODA
-- ============================================================
CREATE TABLE IF NOT EXISTS product_sizes (
    id              SERIAL PRIMARY KEY,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    velicina_ml     SMALLINT NOT NULL CHECK (velicina_ml IN (2, 5, 10, 15, 20, 30, 50)),
    cijena          NUMERIC(10, 2) NOT NULL CHECK (cijena > 0),
    zaliha          INTEGER NOT NULL DEFAULT 0 CHECK (zaliha >= 0),
    sku             VARCHAR(100) UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, velicina_ml)
);

-- ============================================================
-- SLIKE PROIZVODA
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    alt_text    VARCHAR(255),
    is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VEZE PROIZVOD ↔ NOTE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_notes (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    note_id     INTEGER NOT NULL REFERENCES fragrance_notes(id) ON DELETE CASCADE,
    tip         note_tip NOT NULL,
    UNIQUE (product_id, note_id)
);

-- ============================================================
-- VEZE PROIZVOD ↔ KATEGORIJE
-- ============================================================
CREATE TABLE IF NOT EXISTS product_categories (
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- ============================================================
-- KUPONI
-- ============================================================
CREATE TYPE kupon_tip AS ENUM ('postotak', 'fiksni');

CREATE TABLE IF NOT EXISTS coupons (
    id                  SERIAL PRIMARY KEY,
    kod                 VARCHAR(50) NOT NULL UNIQUE,
    tip                 kupon_tip NOT NULL,
    vrijednost          NUMERIC(10, 2) NOT NULL CHECK (vrijednost > 0),
    min_iznos_narudzbe  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max_popust          NUMERIC(10, 2), -- samo za postotak tip
    broj_koristenja     INTEGER NOT NULL DEFAULT 0,
    max_koristenja      INTEGER, -- NULL = neograničeno
    aktivan             BOOLEAN NOT NULL DEFAULT TRUE,
    vrijedi_do          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NARUDŽBE
-- ============================================================
CREATE TYPE narudzba_status AS ENUM ('nova', 'u_obradi', 'poslano', 'isporuceno', 'otkazano', 'povrat');
CREATE TYPE nacin_dostave_tip AS ENUM ('hp_posta24', 'osobno_preuzimanje');
CREATE TYPE nacin_placanja_tip AS ENUM ('pouzecem', 'bankovna', 'kartica');

CREATE TABLE IF NOT EXISTS orders (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL, -- NULL za guest
    order_number    VARCHAR(20) NOT NULL UNIQUE, -- HR-2024-000001
    status          narudzba_status NOT NULL DEFAULT 'nova',

    -- Podaci kupca (denormalizirani za history)
    ime             VARCHAR(100) NOT NULL,
    prezime         VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    telefon         VARCHAR(20) NOT NULL,
    adresa          VARCHAR(255) NOT NULL,
    grad            VARCHAR(100) NOT NULL,
    postanski_broj  VARCHAR(10) NOT NULL,
    napomena        TEXT,

    -- Dostava i plaćanje
    nacin_dostave   nacin_dostave_tip NOT NULL DEFAULT 'hp_posta24',
    nacin_placanja  nacin_placanja_tip NOT NULL DEFAULT 'pouzecem',
    cijena_dostave  NUMERIC(10, 2) NOT NULL DEFAULT 0,

    -- Iznosi
    subtotal        NUMERIC(10, 2) NOT NULL,
    popust_iznos    NUMERIC(10, 2) NOT NULL DEFAULT 0,
    kupon_id        INTEGER REFERENCES coupons(id) ON DELETE SET NULL,
    ukupno          NUMERIC(10, 2) NOT NULL,

    -- HP Praćenje
    tracking_broj   VARCHAR(100),

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STAVKE NARUDŽBE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
    id                  SERIAL PRIMARY KEY,
    order_id            INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_size_id     INTEGER REFERENCES product_sizes(id) ON DELETE SET NULL,

    -- Denormalizirani podaci (za history)
    naziv_proizvoda     VARCHAR(255) NOT NULL,
    brand_naziv         VARCHAR(100),
    ml                  SMALLINT NOT NULL,
    cijena              NUMERIC(10, 2) NOT NULL,
    kolicina            INTEGER NOT NULL DEFAULT 1 CHECK (kolicina > 0),

    CONSTRAINT order_items_total CHECK (kolicina > 0)
);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- ============================================================
-- RECENZIJE
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ocjena      SMALLINT NOT NULL CHECK (ocjena BETWEEN 1 AND 5),
    naslov      VARCHAR(200),
    tekst       TEXT NOT NULL,
    approved    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, user_id) -- jedan review po korisniku po proizvodu
);

-- ============================================================
-- NEWSLETTER
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    subscribed  BOOLEAN NOT NULL DEFAULT TRUE,
    token       VARCHAR(255) NOT NULL UNIQUE DEFAULT uuid_generate_v4()::TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ADMIN LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_logs (
    id          SERIAL PRIMARY KEY,
    admin_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    akcija      VARCHAR(100) NOT NULL,
    opis        TEXT,
    ip_adresa   INET,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGERI — auto updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at
    BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_updated_at
    BEFORE UPDATE ON newsletter
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VIEWS — korisni agregatni upiti
-- ============================================================

-- Prosječna ocjena i broj recenzija po proizvodu
CREATE OR REPLACE VIEW product_ratings AS
SELECT
    p.id AS product_id,
    p.naziv,
    COALESCE(ROUND(AVG(r.ocjena)::NUMERIC, 1), 0) AS avg_ocjena,
    COUNT(r.id) AS broj_recenzija
FROM products p
LEFT JOIN reviews r ON r.product_id = p.id AND r.approved = TRUE
GROUP BY p.id, p.naziv;

-- Prodajne statistike po proizvodu
CREATE OR REPLACE VIEW product_sales_stats AS
SELECT
    ps.product_id,
    p.naziv,
    b.naziv AS brand,
    SUM(oi.kolicina) AS ukupno_prodano,
    SUM(oi.kolicina * oi.cijena) AS ukupni_prihod
FROM order_items oi
JOIN product_sizes ps ON ps.id = oi.product_size_id
JOIN products p ON p.id = ps.product_id
JOIN brands b ON b.id = p.brand_id
JOIN orders o ON o.id = oi.order_id
WHERE o.status NOT IN ('otkazano', 'povrat')
GROUP BY ps.product_id, p.naziv, b.naziv;

-- Dnevni prihodi
CREATE OR REPLACE VIEW daily_revenue AS
SELECT
    DATE(created_at) AS datum,
    COUNT(*) AS broj_narudzbi,
    SUM(ukupno) AS prihod
FROM orders
WHERE status NOT IN ('otkazano', 'povrat')
GROUP BY DATE(created_at)
ORDER BY datum DESC;
-- ============================================================
-- AromaHR — Indexes SQL
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
-- ============================================================
-- dekanti.hr — Seed SQL (Testni podaci)
-- ============================================================

-- ============================================================
-- BRANDOVI (5)
-- ============================================================
INSERT INTO brands (naziv, opis, logo_url, active) VALUES
(
    'Dior',
    'Christian Dior — jedan od najprepoznatljivijih luksuznih modnih kuća na svijetu. Parfemska linija Dior spaja eleganciju, tradiciju i modernu sofisticiranost. Poznati po ikoničnim mirisima poput Sauvage, Miss Dior i J''adore.',
    '/images/brands/dior-logo.png',
    TRUE
),
(
    'Chanel',
    'Chanel — sinonim za bezvremensku eleganciju i luksuz. Chanel N°5 jedan je od najslavnijih parfema u povijesti. Kolekcija Les Exclusifs de Chanel nudi rijetke i sofisticirane mirise za najzahtjevnije parfemske connoisseure.',
    '/images/brands/chanel-logo.png',
    TRUE
),
(
    'Tom Ford',
    'Tom Ford Beauty — drzak, senzualan i bez kompromisa. Tom Ford parfemi su simbol moderne seksualnosti i luksuznog hedonizma. Od kultnog Black Orchid do Private Blend kolekcije — svaki miris priča jedinstvenu priču.',
    '/images/brands/tomford-logo.png',
    TRUE
),
(
    'Creed',
    'House of Creed — britanska parfemska kuća s tradicijom od 1760. godine. Creed stvara ekskluzivne mirise za kraljevske dvorove i hollywoodske zvijezde. Aventus je jedan od najkopiranih parfema na svijetu.',
    '/images/brands/creed-logo.png',
    TRUE
),
(
    'Maison Margiela',
    'Maison Margiela Replica — kolekcija mirisa inspirirana sjećanjima i mjestima. Svaki parfem iz Replica linije evocira specifičan trenutak u vremenu — od jutra u kafu do ljetne noći uz plažu.',
    '/images/brands/maisonmargiela-logo.png',
    TRUE
);

-- ============================================================
-- KATEGORIJE
-- ============================================================
INSERT INTO categories (naziv, slug, parent_id, opis, active, sort_order) VALUES
('Muški parfemi', 'muski-parfemi', NULL, 'Kolekcija muških i maskulinih mirisa', TRUE, 1),
('Ženski parfemi', 'zenski-parfemi', NULL, 'Kolekcija ženskih i femininih mirisa', TRUE, 2),
('Unisex', 'unisex', NULL, 'Rodni neutralni mirisi za svakoga', TRUE, 3),
('Bestselleri', 'bestselleri', NULL, 'Naši najprodavaniji decant parfemi', TRUE, 4),
('Novo', 'novo', NULL, 'Najnovije dodano u kolekciju', TRUE, 5),
('Ljetni mirisi', 'ljetni-mirisi', NULL, 'Svježi i lagani mirisi za toplo vrijeme', TRUE, 6),
('Zimski mirisi', 'zimski-mirisi', NULL, 'Topli i duboki mirisi za hladne dane', TRUE, 7),
('Woody & Musky', 'woody-musky', NULL, 'Drveni i musk mirisni profili', TRUE, 8),
('Floral', 'floral', NULL, 'Cvjetni i romantični mirisi', TRUE, 9),
('Oriental & Spicy', 'oriental-spicy', NULL, 'Orijentalni i začinjeni mirisi', TRUE, 10);

-- ============================================================
-- MIRISNE NOTE
-- ============================================================
-- TOP NOTE
INSERT INTO fragrance_notes (naziv, tip) VALUES
('Bergamot', 'top'),
('Limun', 'top'),
('Grejp', 'top'),
('Naranča', 'top'),
('Mandarina', 'top'),
('Jabuka', 'top'),
('Ananas', 'top'),
('Crni ribiz', 'top'),
('Kardamom', 'top'),
('Lavanda', 'top'),
('Eukaliptus', 'top'),
('Menta', 'top'),
('Biber', 'top'),
('Aldehidi', 'top'),
('Iris', 'top');

-- HEART NOTE
INSERT INTO fragrance_notes (naziv, tip) VALUES
('Ruža', 'heart'),
('Jasmin', 'heart'),
('Ljiljan', 'heart'),
('Geranij', 'heart'),
('Ylang-ylang', 'heart'),
('Ljubičica', 'heart'),
('Neroli', 'heart'),
('Magnolija', 'heart'),
('Bijeli cvijet', 'heart'),
('Lotos', 'heart'),
('Freesia', 'heart'),
('Peonia', 'heart'),
('Cimet', 'heart'),
('Muškatni oraščić', 'heart'),
('Tamjan', 'heart');

-- BASE NOTE
INSERT INTO fragrance_notes (naziv, tip) VALUES
('Pačuli', 'base'),
('Vetiver', 'base'),
('Sandalovina', 'base'),
('Cedrovino', 'base'),
('Ambroks', 'base'),
('Bijeli musk', 'base'),
('Oud', 'base'),
('Tonka zrno', 'base'),
('Vanilija', 'base'),
('Labdanum', 'base'),
('Benzoin', 'base'),
('Mirra', 'base'),
('Kaškada', 'base'),
('Crna tinta', 'base'),
('Moschus', 'base');

-- ============================================================
-- KORISNICI
-- ============================================================
-- ADMIN korisnici (lozinka: Admin123! — bcrypt hash cost 12)
INSERT INTO users (email, password_hash, ime, prezime, adresa, grad, postanski_broj, telefon, role, newsletter_subscribed, email_verified)
VALUES
(
    'admin@dekanti.hr',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCoBkUUqW4mkGTCQBiHwK.6',
    'Marko',
    'Horvat',
    'Ilica 1',
    'Zagreb',
    '10000',
    '+385911234567',
    'admin',
    TRUE,
    TRUE
),
(
    'superadmin@dekanti.hr',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCoBkUUqW4mkGTCQBiHwK.6',
    'Ana',
    'Kovač',
    'Gajeva 5',
    'Zagreb',
    '10000',
    '+385917654321',
    'admin',
    TRUE,
    TRUE
);

-- TEST kupci (lozinka: Kupac123!)
INSERT INTO users (email, password_hash, ime, prezime, adresa, grad, postanski_broj, telefon, role, newsletter_subscribed, email_verified)
VALUES
(
    'ivan.peric@email.com',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LnS8tBEGQDa',
    'Ivan',
    'Perić',
    'Vukovarska 23',
    'Split',
    '21000',
    '+385981234567',
    'kupac',
    TRUE,
    TRUE
),
(
    'maja.novak@email.com',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LnS8tBEGQDa',
    'Maja',
    'Novak',
    'Ribnjak 10',
    'Rijeka',
    '51000',
    '+385957654321',
    'kupac',
    FALSE,
    TRUE
),
(
    'tomislav.babic@email.com',
    '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LnS8tBEGQDa',
    'Tomislav',
    'Babić',
    'Trg bana Jelačića 1',
    'Osijek',
    '31000',
    '+385919876543',
    'kupac',
    TRUE,
    TRUE
);

-- ============================================================
-- PROIZVODI (10)
-- ============================================================

-- 1. Dior Sauvage EDP
INSERT INTO products (naziv, slug, brand_id, opis_kratki, opis_dugi, koncentracija, spol, sezona, featured, active)
VALUES (
    'Sauvage EDP',
    'dior-sauvage-edp',
    1,
    'Ikonični Sauvage u EDP verziji — snažniji, bogatiji i trajniji od originala.',
    'Dior Sauvage EDP je boldiran, tamni pendant originalnom EDT-u. Otvorenje je eksplozivno — začinjeni crni papar i lavanda stvaraju neobuzdanu prvu impresiju. Srce mirisa nosi sićušne lavandine cvjetiće koji se stapaju s pačulijem. Baza je topla i postojana: cedrovino, ambroks i bijeli musk. Savršen za muškarce koji žele ostaviti trag. Iznimno dugotrajno — 8-10 sati na koži.',
    'EDP',
    'muški',
    'sve',
    TRUE,
    TRUE
);

-- 2. Chanel N°5 EDP
INSERT INTO products (naziv, slug, brand_id, opis_kratki, opis_dugi, koncentracija, spol, sezona, featured, active)
VALUES (
    'N°5 EDP',
    'chanel-n5-edp',
    2,
    'Bezvremenski klasik koji je definirao pojam luksuznog parfema za žene.',
    'Chanel N°5 — miris koji je 1921. stvorio Gabrielle Chanel uz pomoć parfemera Ernesta Beauxa. Više od 100 godina, N°5 ostaje simbol ženstvenosti, elegancije i tajne. Njegova složena formula sadrži više od 80 sastojaka. Karakteristični aldehidi u glavi daju mu prepoznatljiv, soap-clean karakter. Jasmin iz Grasse i ruža iz Turske čine luksuzno srce. Baza od sandalovine, pačulija i bijelog muska dugotrajno ostaje na koži.',
    'EDP',
    'ženski',
    'sve',
    TRUE,
    TRUE
);

-- 3. Tom Ford Black Orchid
INSERT INTO products (naziv, slug, brand_id, opis_kratki, opis_dugi, koncentracija, spol, sezona, featured, active)
VALUES (
    'Black Orchid',
    'tom-ford-black-orchid',
    3,
    'Tamni, senzualni i misteriozan. Black Orchid je Tom Fordov najslavniji parfem.',
    'Tom Ford Black Orchid iz 2006. je revolucionarni miris koji je promijenio parfemsku industriju. Kombinira mračne, zemljane tonove s eksotičnim cvijećem. Crna tartufa i ylang-ylang stvaraju neobičnu, ali zavodljivu kombinaciju. Lotosovo cvijeće donosi egzotičnost, dok freesia dodaje laganu cvjetnu notu. Baza je bogata i topla: pačuli, sandalovina, vetiver i crna tinta daju mu misteriozan finish. Savršen za jesensko-zimske večeri.',
    'Parfum',
    'unisex',
    'jesen',
    TRUE,
    TRUE
);

-- 4. Creed Aventus
INSERT INTO products (naziv, slug, brand_id, opis_kratki, opis_dugi, koncentracija, spol, sezona, featured, active)
VALUES (
    'Aventus',
    'creed-aventus',
    4,
    'Legendarni miris uspjeha, karizme i moći. Najkopiraniiji parfem na svijetu.',
    'Creed Aventus lansiran je 2010. i za samo nekoliko godina postao je kultni miris. Inspiriran je životom Napoleona Bonapartea — njegovim trijumfima, ljubavlju i snagom. Glava mirisa eksplodira svježinom ananasa, crnog ribiza i bergamota. Srce nosi drevno drvo breze s dimnim, gotovo aromatičnim karakterom. Baza od musk-a, pačulija, ambre i vanilije daje mu toplinu i trajnost. Svaka serija (batch) Aventusa je malo drugačija — to je dio njegove legendarne priče.',
    'EDP',
    'muški',
    'sve',
    TRUE,
    TRUE
);

-- 5. Maison Margiela Replica — Beach Walk
INSERT INTO products (naziv, slug, brand_id, opis_kratki, opis_dugi, koncentracija, spol, sezona, featured, active)
VALUES (
    'Replica — Beach Walk',
    'replica-beach-walk',
    5,
    'Zatvorite oči i osjetite toplinu pijeska i slanog morskog povjetarca.',
    'Maison Margiela Replica Beach Walk je savršena rekreacija osjećaja ljetnog odmora na plaži. Kreiran 2013. od strane parfemera Alienor Massenet, ovaj miris je odmah postao bestseller kolekcije. Bergamot i kokos u glavi stvaraju osvježavajući, tropski uvod. Heliotrop i cedar u srcu dodaju toplu, solarnu dimenziju. Bijelim musk-om i vanilijom u bazi, miris dobiva kožnu, pomalo sensualni finish. Idealan za ljeto, ali nostalgičan za nositi kroz cijelu godinu.',
    'EDT',
    'unisex',
    'ljeto',
    TRUE,
    TRUE
);

-- 6. Dior Miss Dior Blooming Bouquet
INSERT INTO products (naziv, slug, brand_id, opis_kratki, opis_dugi, koncentracija, spol, sezona, featured, active)
VALUES (
    'Miss Dior Blooming Bouquet',
    'dior-miss-dior-blooming-bouquet',
    1,
    'Svježi, cvjetni i optimistični — kao proljetna šetnja kroz vrt pun ruža.',
    'Miss Dior Blooming Bouquet je lagani, cvjetni fragrance savršen za svakodnevno nošenje. Peonija i lišće mandarine čine živopisan uvod, dok se srce razvija u buket bijelog ruže i japanskog magnolija. Završnica od belog muska i sandalovine daje mu nježnu, femininog finish. Ovaj miris je popularan izbor za mlade žene i sve koji vole lagane, cvjetne kompozicije.',
    'EDT',
    'ženski',
    'proljeće',
    FALSE,
    TRUE
);

-- 7. Tom Ford Tobacco Vanille
INSERT INTO products (naziv, slug, brand_id, opis_kratki, opis_dugi, koncentracija, spol, sezona, featured, active)
VALUES (
    'Tobacco Vanille',
    'tom-ford-tobacco-vanille',
    3,
    'Bogat, topao i seduktivan — spoj duhana i vanilije za zimske noći.',
    'Tom Ford Tobacco Vanille iz Private Blend kolekcije je jedan od najomiljenijih zimskih mirisa. Začinjeni duhan i tonka zrno čine smelu, gotovo jestivo toplu kompoziciju. Kakao i voćni akordi dodaju slatkoću bez pretjerane šećernosti. Tobačni listovi u srcu daju mu bogatu, gotovo kožnu dimenziju. Vanilija, benzoin i drvo u bazi stvaraju duboku, trajnu završnicu. Idealan za jesensko-zimske večeri i posebne prigode.',
    'EDP',
    'unisex',
    'zima',
    FALSE,
    TRUE
);

-- 8. Chanel Bleu de Chanel EDP
INSERT INTO products (naziv, slug, brand_id, opis_kratki, opis_dugi, koncentracija, spol, sezona, featured, active)
VALUES (
    'Bleu de Chanel EDP',
    'chanel-bleu-de-chanel-edp',
    2,
    'Moderna, svježa maskulinost uokvirena drvenim i citrusnim akordima.',
    'Bleu de Chanel EDP je lansiran 2018. kao bogatija verzija popularnog EDT-a. Citrus u glavi — grejp i limun — stvaraju svježi, optimistički početak. Srce je složeno: đumbir, nutmeg i jasmin weave zajedno modernu aromatinost. Baza od sandalovine, cedrovine i frankincense-a daje mu supstancu i trajnost. Ovaj miris savršeno balansira između poslovne elegancije i osobne privlačnosti. Izvrstan za rad i posebne prigode.',
    'EDP',
    'muški',
    'sve',
    FALSE,
    TRUE
);

-- 9. Creed Silver Mountain Water
INSERT INTO products (naziv, slug, brand_id, opis_kratki, opis_dugi, koncentracija, spol, sezona, featured, active)
VALUES (
    'Silver Mountain Water',
    'creed-silver-mountain-water',
    4,
    'Čistoća alpske vode i svježi zeleni čaj — osvježavajuće remek-djelo za proljeće.',
    'Creed Silver Mountain Water iz 1995. inspiriran je čistoćom i hladnoćom švicarskih Alpa. Mandarina i bergamot u glavi donose citrusan, eneregetski uvod. Zeleni čaj u srcu je potpis ovog mirisa — svjež, tanak i gotovo medicinski čist. Neroli i muskovska ruža dodaju cvjetnu nijansu. Baza od sandalovine, muška i cedra daje mu laganu, čistu završnicu. Idealan za proljeće i ljeto — svjež, čist i nikad previše.',
    'EDT',
    'muški',
    'proljeće',
    FALSE,
    TRUE
);

-- 10. Maison Margiela Replica — By the Fireplace
INSERT INTO products (naziv, slug, brand_id, opis_kratki, opis_dugi, koncentracija, spol, sezona, featured, active)
VALUES (
    'Replica — By the Fireplace',
    'replica-by-the-fireplace',
    5,
    'Ugodna toplina kamina, kaštanjela i vanilije za hladne zimske večeri.',
    'Maison Margiela Replica By the Fireplace evocira savršeni zimski trenutak — sjediti pokraj vatre uz čašu crnog vina. Klementina i ružičasti papar u glavi donose svjež, pikantni uvod. Čestnut (kestena) i guaiac drvo u srcu su potpis ovog mirisa — dimno, toplo i drveno. Vanilija, cashmere drvo i peru balsam u bazi stvaraju dubok, topli zagrljaj. Jedan od najomiljenijih zimskih mirisa u Replica kolekciji.',
    'EDT',
    'unisex',
    'zima',
    FALSE,
    TRUE
);

-- ============================================================
-- VELIČINE I CIJENE PROIZVODA
-- ============================================================

-- Dior Sauvage EDP
INSERT INTO product_sizes (product_id, velicina_ml, cijena, zaliha, sku) VALUES
(1, 5, 8.99, 25, 'DS-EDP-5ML'),
(1, 10, 15.99, 20, 'DS-EDP-10ML'),
(1, 20, 28.99, 15, 'DS-EDP-20ML'),
(1, 30, 38.99, 10, 'DS-EDP-30ML');

-- Chanel N°5 EDP
INSERT INTO product_sizes (product_id, velicina_ml, cijena, zaliha, sku) VALUES
(2, 5, 9.99, 20, 'CN5-EDP-5ML'),
(2, 10, 17.99, 15, 'CN5-EDP-10ML'),
(2, 20, 32.99, 10, 'CN5-EDP-20ML'),
(2, 30, 44.99, 8, 'CN5-EDP-30ML');

-- Tom Ford Black Orchid
INSERT INTO product_sizes (product_id, velicina_ml, cijena, zaliha, sku) VALUES
(3, 5, 11.99, 15, 'TF-BO-5ML'),
(3, 10, 21.99, 12, 'TF-BO-10ML'),
(3, 20, 39.99, 8, 'TF-BO-20ML'),
(3, 30, 54.99, 5, 'TF-BO-30ML');

-- Creed Aventus
INSERT INTO product_sizes (product_id, velicina_ml, cijena, zaliha, sku) VALUES
(4, 5, 14.99, 20, 'CR-AV-5ML'),
(4, 10, 27.99, 15, 'CR-AV-10ML'),
(4, 20, 49.99, 10, 'CR-AV-20ML'),
(4, 30, 69.99, 6, 'CR-AV-30ML');

-- Maison Margiela Beach Walk
INSERT INTO product_sizes (product_id, velicina_ml, cijena, zaliha, sku) VALUES
(5, 5, 8.50, 30, 'MM-BW-5ML'),
(5, 10, 14.99, 25, 'MM-BW-10ML'),
(5, 20, 26.99, 15, 'MM-BW-20ML'),
(5, 30, 36.99, 10, 'MM-BW-30ML');

-- Miss Dior Blooming Bouquet
INSERT INTO product_sizes (product_id, velicina_ml, cijena, zaliha, sku) VALUES
(6, 5, 7.99, 20, 'MD-BB-5ML'),
(6, 10, 13.99, 15, 'MD-BB-10ML'),
(6, 20, 24.99, 12, 'MD-BB-20ML'),
(6, 30, 33.99, 8, 'MD-BB-30ML');

-- Tom Ford Tobacco Vanille
INSERT INTO product_sizes (product_id, velicina_ml, cijena, zaliha, sku) VALUES
(7, 5, 13.99, 15, 'TF-TV-5ML'),
(7, 10, 24.99, 12, 'TF-TV-10ML'),
(7, 20, 44.99, 6, 'TF-TV-20ML'),
(7, 30, 59.99, 4, 'TF-TV-30ML');

-- Bleu de Chanel EDP
INSERT INTO product_sizes (product_id, velicina_ml, cijena, zaliha, sku) VALUES
(8, 5, 9.50, 25, 'BC-EDP-5ML'),
(8, 10, 16.99, 20, 'BC-EDP-10ML'),
(8, 20, 30.99, 12, 'BC-EDP-20ML'),
(8, 30, 42.99, 8, 'BC-EDP-30ML');

-- Creed Silver Mountain Water
INSERT INTO product_sizes (product_id, velicina_ml, cijena, zaliha, sku) VALUES
(9, 5, 12.99, 18, 'CR-SMW-5ML'),
(9, 10, 22.99, 14, 'CR-SMW-10ML'),
(9, 20, 41.99, 9, 'CR-SMW-20ML'),
(9, 30, 56.99, 5, 'CR-SMW-30ML');

-- Maison Margiela By the Fireplace
INSERT INTO product_sizes (product_id, velicina_ml, cijena, zaliha, sku) VALUES
(10, 5, 8.50, 22, 'MM-BF-5ML'),
(10, 10, 14.99, 18, 'MM-BF-10ML'),
(10, 20, 26.99, 12, 'MM-BF-20ML'),
(10, 30, 36.99, 8, 'MM-BF-30ML');

-- ============================================================
-- MIRISNE NOTE PROIZVODA
-- ============================================================

-- Dior Sauvage EDP (ID=1)
INSERT INTO product_notes (product_id, note_id, tip) VALUES
(1, (SELECT id FROM fragrance_notes WHERE naziv = 'Bergamot'), 'top'),
(1, (SELECT id FROM fragrance_notes WHERE naziv = 'Biber'), 'top'),
(1, (SELECT id FROM fragrance_notes WHERE naziv = 'Lavanda'), 'top'),
(1, (SELECT id FROM fragrance_notes WHERE naziv = 'Geranij'), 'heart'),
(1, (SELECT id FROM fragrance_notes WHERE naziv = 'Lavanda'), 'heart'),
(1, (SELECT id FROM fragrance_notes WHERE naziv = 'Tamjan'), 'heart'),
(1, (SELECT id FROM fragrance_notes WHERE naziv = 'Cedrovino'), 'base'),
(1, (SELECT id FROM fragrance_notes WHERE naziv = 'Ambroks'), 'base'),
(1, (SELECT id FROM fragrance_notes WHERE naziv = 'Bijeli musk'), 'base');

-- Chanel N°5 EDP (ID=2)
INSERT INTO product_notes (product_id, note_id, tip) VALUES
(2, (SELECT id FROM fragrance_notes WHERE naziv = 'Aldehidi'), 'top'),
(2, (SELECT id FROM fragrance_notes WHERE naziv = 'Bergamot'), 'top'),
(2, (SELECT id FROM fragrance_notes WHERE naziv = 'Neroli'), 'top'),
(2, (SELECT id FROM fragrance_notes WHERE naziv = 'Jasmin'), 'heart'),
(2, (SELECT id FROM fragrance_notes WHERE naziv = 'Ruža'), 'heart'),
(2, (SELECT id FROM fragrance_notes WHERE naziv = 'Iris'), 'heart'),
(2, (SELECT id FROM fragrance_notes WHERE naziv = 'Sandalovina'), 'base'),
(2, (SELECT id FROM fragrance_notes WHERE naziv = 'Pačuli'), 'base'),
(2, (SELECT id FROM fragrance_notes WHERE naziv = 'Bijeli musk'), 'base');

-- Tom Ford Black Orchid (ID=3)
INSERT INTO product_notes (product_id, note_id, tip) VALUES
(3, (SELECT id FROM fragrance_notes WHERE naziv = 'Crni ribiz'), 'top'),
(3, (SELECT id FROM fragrance_notes WHERE naziv = 'Bergamot'), 'top'),
(3, (SELECT id FROM fragrance_notes WHERE naziv = 'Ylang-ylang'), 'heart'),
(3, (SELECT id FROM fragrance_notes WHERE naziv = 'Lotos'), 'heart'),
(3, (SELECT id FROM fragrance_notes WHERE naziv = 'Freesia'), 'heart'),
(3, (SELECT id FROM fragrance_notes WHERE naziv = 'Tamjan'), 'heart'),
(3, (SELECT id FROM fragrance_notes WHERE naziv = 'Pačuli'), 'base'),
(3, (SELECT id FROM fragrance_notes WHERE naziv = 'Sandalovina'), 'base'),
(3, (SELECT id FROM fragrance_notes WHERE naziv = 'Vetiver'), 'base'),
(3, (SELECT id FROM fragrance_notes WHERE naziv = 'Crna tinta'), 'base');

-- Creed Aventus (ID=4)
INSERT INTO product_notes (product_id, note_id, tip) VALUES
(4, (SELECT id FROM fragrance_notes WHERE naziv = 'Ananas'), 'top'),
(4, (SELECT id FROM fragrance_notes WHERE naziv = 'Crni ribiz'), 'top'),
(4, (SELECT id FROM fragrance_notes WHERE naziv = 'Bergamot'), 'top'),
(4, (SELECT id FROM fragrance_notes WHERE naziv = 'Jabuka'), 'top'),
(4, (SELECT id FROM fragrance_notes WHERE naziv = 'Ruža'), 'heart'),
(4, (SELECT id FROM fragrance_notes WHERE naziv = 'Jasmin'), 'heart'),
(4, (SELECT id FROM fragrance_notes WHERE naziv = 'Pačuli'), 'base'),
(4, (SELECT id FROM fragrance_notes WHERE naziv = 'Moschus'), 'base'),
(4, (SELECT id FROM fragrance_notes WHERE naziv = 'Ambroks'), 'base'),
(4, (SELECT id FROM fragrance_notes WHERE naziv = 'Vetiver'), 'base');

-- Beach Walk (ID=5)
INSERT INTO product_notes (product_id, note_id, tip) VALUES
(5, (SELECT id FROM fragrance_notes WHERE naziv = 'Bergamot'), 'top'),
(5, (SELECT id FROM fragrance_notes WHERE naziv = 'Mandarina'), 'top'),
(5, (SELECT id FROM fragrance_notes WHERE naziv = 'Bijeli cvijet'), 'heart'),
(5, (SELECT id FROM fragrance_notes WHERE naziv = 'Lotos'), 'heart'),
(5, (SELECT id FROM fragrance_notes WHERE naziv = 'Bijeli musk'), 'base'),
(5, (SELECT id FROM fragrance_notes WHERE naziv = 'Sandalovina'), 'base'),
(5, (SELECT id FROM fragrance_notes WHERE naziv = 'Vanilija'), 'base');

-- ============================================================
-- KATEGORIJE PROIZVODA
-- ============================================================
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1), (1, 4),  -- Sauvage: muški, bestselleri
(2, 2), (2, 4),  -- N°5: ženski, bestselleri
(3, 3), (3, 10), -- Black Orchid: unisex, oriental
(4, 1), (4, 4),  -- Aventus: muški, bestselleri
(5, 3), (5, 6),  -- Beach Walk: unisex, ljetni
(6, 2), (6, 9),  -- Miss Dior: ženski, floral
(7, 3), (7, 7),  -- Tobacco Vanille: unisex, zimski
(8, 1), (8, 8),  -- Bleu Chanel: muški, woody
(9, 1), (9, 6),  -- Silver Mountain: muški, ljetni
(10, 3), (10, 7); -- By the Fireplace: unisex, zimski

-- ============================================================
-- KUPONI (3)
-- ============================================================
INSERT INTO coupons (kod, tip, vrijednost, min_iznos_narudzbe, max_popust, broj_koristenja, max_koristenja, aktivan, vrijedi_do)
VALUES
(
    'DOBRODOSLI10',
    'postotak',
    10.00,
    15.00,
    15.00,
    0,
    500,
    TRUE,
    '2025-12-31 23:59:59+01'
),
(
    'LJETO15',
    'postotak',
    15.00,
    25.00,
    20.00,
    0,
    200,
    TRUE,
    '2025-09-30 23:59:59+01'
),
(
    'PROMO20',
    'fiksni',
    20.00,
    50.00,
    NULL,
    0,
    50,
    TRUE,
    '2025-06-30 23:59:59+01'
);

-- ============================================================
-- SAMPLE NARUDŽBE
-- ============================================================

-- Narudžba 1 — Isporučena (Ivan Perić)
INSERT INTO orders (user_id, order_number, status, ime, prezime, email, telefon, adresa, grad, postanski_broj, nacin_dostave, nacin_placanja, cijena_dostave, subtotal, popust_iznos, ukupno, tracking_broj, created_at)
VALUES (
    3,
    'HR-2024-000001',
    'isporuceno',
    'Ivan', 'Perić',
    'ivan.peric@email.com',
    '+385981234567',
    'Vukovarska 23', 'Split', '21000',
    'hp_posta24',
    'pouzecem',
    4.50,
    43.98,
    0,
    48.48,
    'HR123456789HR',
    NOW() - INTERVAL '15 days'
);

INSERT INTO order_items (order_id, product_size_id, naziv_proizvoda, brand_naziv, ml, cijena, kolicina)
VALUES
(1, 2, 'Dior Sauvage EDP', 'Dior', 10, 15.99, 1),
(1, 6, 'Creed Aventus', 'Creed', 5, 14.99, 1),
(1, 21, 'Maison Margiela Replica — Beach Walk', 'Maison Margiela', 10, 14.99, 1);

-- Narudžba 2 — Poslana (Maja Novak)
INSERT INTO orders (user_id, order_number, status, ime, prezime, email, telefon, adresa, grad, postanski_broj, napomena, nacin_dostave, nacin_placanja, cijena_dostave, subtotal, popust_iznos, kupon_id, ukupno, tracking_broj, created_at)
VALUES (
    4,
    'HR-2024-000002',
    'poslano',
    'Maja', 'Novak',
    'maja.novak@email.com',
    '+385957654321',
    'Ribnjak 10', 'Rijeka', '51000',
    'Molim dodajte malo papira za pakovanje, poklon je!',
    'hp_posta24',
    'bankovna',
    0,
    61.98,
    6.20,
    1,
    55.78,
    'HR987654321HR',
    NOW() - INTERVAL '5 days'
);

INSERT INTO order_items (order_id, product_size_id, naziv_proizvoda, brand_naziv, ml, cijena, kolicina)
VALUES
(2, 8, 'Chanel N°5 EDP', 'Chanel', 30, 44.99, 1),
(2, 22, 'Maison Margiela Replica — Beach Walk', 'Maison Margiela', 20, 26.99, 1);

-- Narudžba 3 — U obradi (Tomislav Babić)
INSERT INTO orders (user_id, order_number, status, ime, prezime, email, telefon, adresa, grad, postanski_broj, nacin_dostave, nacin_placanja, cijena_dostave, subtotal, popust_iznos, ukupno, created_at)
VALUES (
    5,
    'HR-2024-000003',
    'u_obradi',
    'Tomislav', 'Babić',
    'tomislav.babic@email.com',
    '+385919876543',
    'Trg bana Jelačića 1', 'Osijek', '31000',
    'hp_posta24',
    'pouzecem',
    4.50,
    83.98,
    0,
    88.48,
    NOW() - INTERVAL '1 day'
);

INSERT INTO order_items (order_id, product_size_id, naziv_proizvoda, brand_naziv, ml, cijena, kolicina)
VALUES
(3, 9, 'Tom Ford Black Orchid', 'Tom Ford', 5, 11.99, 1),
(3, 13, 'Creed Aventus', 'Creed', 20, 49.99, 1),
(3, 37, 'Tom Ford Tobacco Vanille', 'Tom Ford', 20, 44.99, 1);

-- Narudžba 4 — Nova (guest narudžba)
INSERT INTO orders (user_id, order_number, status, ime, prezime, email, telefon, adresa, grad, postanski_broj, nacin_dostave, nacin_placanja, cijena_dostave, subtotal, popust_iznos, ukupno, created_at)
VALUES (
    NULL,
    'HR-2024-000004',
    'nova',
    'Petra', 'Šimić',
    'petra.simic@email.com',
    '+385921234567',
    'Maksimirska 45', 'Zagreb', '10000',
    'hp_posta24',
    'pouzecem',
    4.50,
    38.99,
    0,
    43.49,
    NOW() - INTERVAL '2 hours'
);

INSERT INTO order_items (order_id, product_size_id, naziv_proizvoda, brand_naziv, ml, cijena, kolicina)
VALUES
(4, 4, 'Dior Sauvage EDP', 'Dior', 30, 38.99, 1);

-- Narudžba 5 — Otkazana
INSERT INTO orders (user_id, order_number, status, ime, prezime, email, telefon, adresa, grad, postanski_broj, nacin_dostave, nacin_placanja, cijena_dostave, subtotal, popust_iznos, ukupno, created_at)
VALUES (
    3,
    'HR-2024-000005',
    'otkazano',
    'Ivan', 'Perić',
    'ivan.peric@email.com',
    '+385981234567',
    'Vukovarska 23', 'Split', '21000',
    'hp_posta24',
    'bankovna',
    0,
    21.99,
    0,
    21.99,
    NOW() - INTERVAL '20 days'
);

INSERT INTO order_items (order_id, product_size_id, naziv_proizvoda, brand_naziv, ml, cijena, kolicina)
VALUES
(5, 9, 'Tom Ford Black Orchid', 'Tom Ford', 5, 11.99, 1),
(5, 38, 'Creed Silver Mountain Water', 'Creed', 10, 22.99, 1);

-- ============================================================
-- RECENZIJE
-- ============================================================
INSERT INTO reviews (product_id, user_id, ocjena, naslov, tekst, approved) VALUES
(1, 3, 5, 'Savršen miris!', 'Dior Sauvage EDP je apsolutno nevjerojatan. Trajnost je odlična — nosim ga cijeli dan i još uvijek dobivam komplimente navečer. Preporučujem svima!', TRUE),
(4, 3, 5, 'Razumijem zašto je kultni', 'Aventus je jedna od onih stvari u životu koje moraš iskusiti. Kompleksan, bogat, jedinstven. Vrijedan svake kune.', TRUE),
(2, 4, 4, 'Klasik s razlogom', 'N°5 je bezvremenski klasik. Nije za svakodnevno nošenje, ali za posebne prilike je savršen. Preporučujem 10ml za probavanje.', TRUE),
(5, 5, 5, 'Ljetni hit!', 'Beach Walk je savršen ljetni pratilac. Svjež, lagani i dugotrajno prisutan na koži. Moja supruga isto voli, pa ga nosimo oboje!', TRUE),
(7, 4, 5, 'Zimska bajka u bočici', 'Tobacco Vanille je topli zimski zagrljaj. Idealan za božićno-novogodišnje periode. Dobivam komplimente svaki put kad ga nosim.', FALSE);

-- ============================================================
-- NEWSLETTER
-- ============================================================
INSERT INTO newsletter (email, subscribed) VALUES
('ivan.peric@email.com', TRUE),
('maja.novak@email.com', TRUE),
('tomislav.babic@email.com', TRUE),
('newsletter.test@email.com', TRUE),
('parfemi.fan@email.com', TRUE),
('zagreb.fragrance@email.com', TRUE);

-- ============================================================
-- ADMIN LOGS
-- ============================================================
INSERT INTO admin_logs (admin_id, akcija, opis, ip_adresa) VALUES
(1, 'PRODUCT_CREATED', 'Dodan novi proizvod: Dior Sauvage EDP', '192.168.1.1'),
(1, 'ORDER_STATUS_UPDATE', 'Narudžba HR-2024-000001 — status promjenjen u: isporuceno', '192.168.1.1'),
(2, 'COUPON_CREATED', 'Kreiran novi kupon: DOBRODOSLI10', '192.168.1.2'),
(1, 'REVIEW_APPROVED', 'Odobrena recenzija za Dior Sauvage EDP od korisnika ivan.peric@email.com', '192.168.1.1');

-- ============================================================
-- UPDATE: Korištenje kupona
-- ============================================================
UPDATE coupons SET broj_koristenja = 1 WHERE kod = 'DOBRODOSLI10';
-- Add scent notes columns to products table for AI-generated perfume notes
-- Migration: add_scent_notes_to_products
-- Date: 2026-05-05

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS note_vrha VARCHAR(255),
ADD COLUMN IF NOT EXISTS note_srca VARCHAR(255),
ADD COLUMN IF NOT EXISTS note_baze VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN products.note_vrha IS 'Top notes of the perfume (e.g., bergamot, lemon, orange)';
COMMENT ON COLUMN products.note_srca IS 'Heart/middle notes of the perfume (e.g., rose, jasmine, lavender)';
COMMENT ON COLUMN products.note_baze IS 'Base notes of the perfume (e.g., musk, sandalwood, vanilla)';
