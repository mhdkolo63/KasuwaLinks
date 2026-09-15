/*
# KasuwaLink Marketplace Database Schema

## Overview
Creates the complete database schema for the KasuwaLink local marketplace
(targeting Kaduna, Nigeria). Includes tables for user profiles, locations
(states and cities), product categories, product listings, product images,
user favorites, and user reports.

## Tables

1. **profiles** — Extended user data linked to auth.users. Stores full name,
   username, phone, avatar, bio, location, and seller/verification flags.
2. **states** — Nigerian states. Seeded with Kaduna.
3. **cities** — Cities within states. Seeded with Kaduna city under Kaduna State.
4. **categories** — Product categories with slug, icon, active flag, sort order.
   Seeded from the app's category constants.
5. **products** — Marketplace listings. Linked to seller (profile) and category.
   Supports status workflow: active, sold, paused, removed, pending_review.
6. **product_images** — Images belonging to a product. Stores URL + storage path.
7. **favorites** — User-product favorites with unique constraint (one per user/product).
8. **reports** — User-submitted reports for products or other users.
   Status workflow: pending, reviewed, resolved, dismissed.

## Security (RLS)
- Public (anon) can read active products, active categories, states, and cities.
- Authenticated users can read/update only their own profile.
- Sellers can create/update/delete only their own products.
- Sellers can manage images only for their own products.
- Users can manage only their own favorites.
- Users can create reports and view their own submitted reports.
- Users cannot modify report status (no update policy on reports).

## Seed Data
- Kaduna State
- Kaduna city (under Kaduna State)
- 15 product categories matching the app's constants/categories.ts

## Important Notes
1. All tables use uuid primary keys with gen_random_uuid() defaults.
2. Foreign keys use ON DELETE CASCADE for child tables (cities, product_images, favorites).
3. Foreign keys to profiles use ON DELETE CASCADE (user deletion cleans up their data).
4. updated_at columns are auto-maintained via triggers.
5. RLS is enabled on every table — no data is accessible without explicit policies.
6. Policies use DROP IF EXISTS before CREATE to be idempotent and safe to re-run.
*/

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('active', 'sold', 'paused', 'removed', 'pending_review');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- STATES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL DEFAULT 'Nigeria',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_states" ON states;
CREATE POLICY "public_read_states" ON states FOR SELECT
  TO anon, authenticated USING (true);

-- =============================================================================
-- CITIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cities_state_id ON cities(state_id);

ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_cities" ON cities;
CREATE POLICY "public_read_cities" ON cities FOR SELECT
  TO anon, authenticated USING (true);

-- =============================================================================
-- CATEGORIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_categories" ON categories;
CREATE POLICY "public_read_active_categories" ON categories FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  username text UNIQUE,
  phone text,
  avatar_url text,
  bio text,
  state_id uuid REFERENCES states(id) ON DELETE SET NULL,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  is_seller boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_seller ON profiles(is_seller);
CREATE INDEX IF NOT EXISTS idx_profiles_state_id ON profiles(state_id);
CREATE INDEX IF NOT EXISTS idx_profiles_city_id ON profiles(city_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile only
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- Users can update only their own profile
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can insert their own profile row
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- =============================================================================
-- PRODUCTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  condition text,
  state_id uuid REFERENCES states(id) ON DELETE SET NULL,
  city_id uuid REFERENCES cities(id) ON DELETE SET NULL,
  status product_status NOT NULL DEFAULT 'active',
  is_featured boolean NOT NULL DEFAULT false,
  views_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_state_id ON products(state_id);
CREATE INDEX IF NOT EXISTS idx_products_city_id ON products(city_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read active products only
DROP POLICY IF EXISTS "public_read_active_products" ON products;
CREATE POLICY "public_read_active_products" ON products FOR SELECT
  TO anon, authenticated USING (status = 'active');

-- Authenticated users can create products (seller_id defaults to their own id)
DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = seller_id);

-- Sellers can update only their own products
DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete only their own products
DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated USING (auth.uid() = seller_id);

-- =============================================================================
-- PRODUCT_IMAGES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order ON product_images(sort_order);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Public can read product images (so they can see product photos)
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

-- Sellers can insert images only for their own products
DROP POLICY IF EXISTS "insert_own_product_images" ON product_images;
CREATE POLICY "insert_own_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.seller_id = auth.uid())
  );

-- Sellers can update images only for their own products
DROP POLICY IF EXISTS "update_own_product_images" ON product_images;
CREATE POLICY "update_own_product_images" ON product_images FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.seller_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.seller_id = auth.uid())
  );

-- Sellers can delete images only for their own products
DROP POLICY IF EXISTS "delete_own_product_images" ON product_images;
CREATE POLICY "delete_own_product_images" ON product_images FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.seller_id = auth.uid())
  );

-- =============================================================================
-- FAVORITES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can view only their own favorites
DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Users can add their own favorites
DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can remove only their own favorites
DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =============================================================================
-- REPORTS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status report_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_product_id ON reports(product_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Users can view only their own submitted reports
DROP POLICY IF EXISTS "select_own_reports" ON reports;
CREATE POLICY "select_own_reports" ON reports FOR SELECT
  TO authenticated USING (auth.uid() = reporter_id);

-- Users can create reports
DROP POLICY IF EXISTS "insert_own_reports" ON reports;
CREATE POLICY "insert_own_reports" ON reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- No UPDATE or DELETE policies — users cannot modify reports after submission.

-- =============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INCREMENT PRODUCT VIEWS FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_product_views(product_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE products SET views_count = views_count + 1 WHERE products.id = product_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION increment_product_views(uuid) TO authenticated;

-- =============================================================================
-- SEED DATA: STATES
-- =============================================================================

INSERT INTO states (name, country)
SELECT 'Kaduna', 'Nigeria'
WHERE NOT EXISTS (SELECT 1 FROM states WHERE name = 'Kaduna' AND country = 'Nigeria');

-- =============================================================================
-- SEED DATA: CITIES
-- =============================================================================

INSERT INTO cities (state_id, name)
SELECT s.id, 'Kaduna'
FROM states s
WHERE s.name = 'Kaduna' AND s.country = 'Nigeria'
  AND NOT EXISTS (
    SELECT 1 FROM cities c WHERE c.name = 'Kaduna' AND c.state_id = s.id
  );

-- =============================================================================
-- SEED DATA: CATEGORIES
-- =============================================================================

INSERT INTO categories (name, slug, description, icon, is_active, sort_order)
SELECT * FROM (
  VALUES
    ('Phones & Tablets', 'phones-tablets', 'Smartphones, tablets, and accessories', 'Smartphone', true, 0),
    ('Computers & Accessories', 'computers', 'Laptops, desktops, and peripherals', 'Laptop', true, 1),
    ('Electronics', 'electronics', 'TVs, audio, and electronic gadgets', 'Tv', true, 2),
    ('Fashion', 'fashion', 'Clothing for men and women', 'Shirt', true, 3),
    ('Shoes', 'shoes', 'Footwear for all occasions', 'Footprints', true, 4),
    ('Beauty & Personal Care', 'beauty', 'Cosmetics, skincare, and grooming', 'Sparkles', true, 5),
    ('Home & Furniture', 'home-furniture', 'Furniture and home items', 'Sofa', true, 6),
    ('Vehicles', 'vehicles', 'Cars, motorcycles, and auto parts', 'Car', true, 7),
    ('Property', 'property', 'Houses, apartments, and land', 'Home', true, 8),
    ('Jobs & Services', 'jobs-services', 'Job postings and professional services', 'Briefcase', true, 9),
    ('Agriculture', 'agriculture', 'Farm produce, tools, and livestock', 'Wheat', true, 10),
    ('Food & Groceries', 'food-groceries', 'Fresh food and grocery items', 'ShoppingBasket', true, 11),
    ('Baby & Kids', 'baby-kids', 'Items for babies and children', 'Baby', true, 12),
    ('Sports & Fitness', 'sports-fitness', 'Sports equipment and fitness gear', 'Dumbbell', true, 13),
    ('Other', 'other', 'Miscellaneous items', 'Package', true, 14)
) AS v(name, slug, description, icon, is_active, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories.slug = v.slug);
