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
