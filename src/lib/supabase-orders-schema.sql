-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================
-- Products and related tables
-- =============================

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
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

-- Product variants (e.g. size, color)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size TEXT,
  color TEXT,
  stock INTEGER DEFAULT 0,
  additional_price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images table
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================
-- Enable RLS on product tables
-- =============================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- =============================
-- RLS Policies for products and related tables
-- =============================

-- Categories: public read, admin write
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage all categories" ON public.categories;
CREATE POLICY "Admins can manage all categories"
  ON public.categories FOR ALL
  USING (auth.email() IN (SELECT email FROM public.admin_users))
  WITH CHECK (auth.email() IN (SELECT email FROM public.admin_users));

-- Products: public read active products, admin write
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
  ON public.products FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage all products" ON public.products;
CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (auth.email() IN (SELECT email FROM public.admin_users))
  WITH CHECK (auth.email() IN (SELECT email FROM public.admin_users));

-- Product variants: public read, admin write
DROP POLICY IF EXISTS "Public can view product_variants" ON public.product_variants;
CREATE POLICY "Public can view product_variants"
  ON public.product_variants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage all product_variants" ON public.product_variants;
CREATE POLICY "Admins can manage all product_variants"
  ON public.product_variants FOR ALL
  USING (auth.email() IN (SELECT email FROM public.admin_users))
  WITH CHECK (auth.email() IN (SELECT email FROM public.admin_users));

-- Product images: public read, admin write
DROP POLICY IF EXISTS "Public can view product_images" ON public.product_images;
CREATE POLICY "Public can view product_images"
  ON public.product_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage all product_images" ON public.product_images;
CREATE POLICY "Admins can manage all product_images"
  ON public.product_images FOR ALL
  USING (auth.email() IN (SELECT email FROM public.admin_users))
  WITH CHECK (auth.email() IN (SELECT email FROM public.admin_users));

-- Reviews: public read, user write own reviews, admin manage all
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
-- Existing order, order_tracking, designs, locations, admin_users, wishlists tables
-- =============================

-- Preserve your current definitions and RLS policies here
-- (Insert your existing order-related schema below this line)

