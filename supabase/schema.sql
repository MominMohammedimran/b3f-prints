-- =============================
-- Extensions
-- =============================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================
-- Product Catalog
-- =============================

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Variants Table (e.g. size, color)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  stock INTEGER DEFAULT 0,
  additional_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================
-- Enable RLS
-- =============================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =============================
-- RLS Policies
-- =============================

-- Categories
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (auth.email() IN (SELECT email FROM public.admin_users))
  WITH CHECK (auth.email() IN (SELECT email FROM public.admin_users));

-- Products
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
  ON public.products FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (auth.email() IN (SELECT email FROM public.admin_users))
  WITH CHECK (auth.email() IN (SELECT email FROM public.admin_users));

-- Product Variants
DROP POLICY IF EXISTS "Public can view variants" ON public.product_variants;
CREATE POLICY "Public can view variants"
  ON public.product_variants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage variants" ON public.product_variants;
CREATE POLICY "Admins can manage variants"
  ON public.product_variants FOR ALL
  USING (auth.email() IN (SELECT email FROM public.admin_users))
  WITH CHECK (auth.email() IN (SELECT email FROM public.admin_users));

-- Product Images
DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images"
  ON public.product_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (auth.email() IN (SELECT email FROM public.admin_users))
  WITH CHECK (auth.email() IN (SELECT email FROM public.admin_users));

-- Reviews
DROP POLICY IF EXISTS "Users can view reviews" ON public.reviews;
CREATE POLICY "Users can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can write reviews" ON public.reviews;
CREATE POLICY "Users can write reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (auth.email() IN (SELECT email FROM public.admin_users));

-- =============================
-- Indexes
-- =============================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
