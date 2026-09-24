-- ==============================================================================
-- AURA STUDIO - Supabase Database & Storage Setup Script
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. FIX RLS FOR PRODUCTS TABLE
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on products" ON public.products;
CREATE POLICY "Allow public full access on products"
ON public.products
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 2. FIX RLS FOR CUSTOMERS TABLE
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on customers" ON public.customers;
CREATE POLICY "Allow public full access on customers"
ON public.customers
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. FIX RLS FOR APPOINTMENTS, CONVERSATIONS, MESSAGES, FOLLOW_UPS
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on appointments" ON public.appointments;
CREATE POLICY "Allow public full access on appointments"
ON public.appointments
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on conversations" ON public.conversations;
CREATE POLICY "Allow public full access on conversations"
ON public.conversations
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on messages" ON public.messages;
CREATE POLICY "Allow public full access on messages"
ON public.messages
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE IF EXISTS public.follow_ups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on follow_ups" ON public.follow_ups;
CREATE POLICY "Allow public full access on follow_ups"
ON public.follow_ups
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. CREATE INVOICES & INVOICE_ITEMS TABLES (IF NOT EXIST)
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  invoice_number TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  discount_amount NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'cash',
  payment_status TEXT DEFAULT 'paid',
  notes TEXT
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on invoices" ON public.invoices;
CREATE POLICY "Allow public full access on invoices"
ON public.invoices
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  invoice_id TEXT REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public full access on invoice_items" ON public.invoice_items;
CREATE POLICY "Allow public full access on invoice_items"
ON public.invoice_items
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 5. CREATE STORAGE BUCKET FOR PRODUCT PHOTOS ('products')
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow anyone to upload and read product photos in the 'products' bucket
DROP POLICY IF EXISTS "Allow public upload to products bucket" ON storage.objects;
CREATE POLICY "Allow public upload to products bucket"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public read from products bucket" ON storage.objects;
CREATE POLICY "Allow public read from products bucket"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public update to products bucket" ON storage.objects;
CREATE POLICY "Allow public update to products bucket"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Allow public delete from products bucket" ON storage.objects;
CREATE POLICY "Allow public delete from products bucket"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (bucket_id = 'products');
