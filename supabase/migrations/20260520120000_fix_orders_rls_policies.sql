-- ============================================================
-- Fix RLS policies: add SELECT/UPDATE for orders, order_items,
-- and full CRUD for admin-managed tables
-- ============================================================

-- Orders: SELECT needed for .insert().select() and status polling
CREATE POLICY "anon_select_orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "anon_select_order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "anon_update_orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- Users: SELECT needed for login/profile, UPDATE for profile edits
CREATE POLICY "anon_select_users" ON public.users FOR SELECT USING (true);
CREATE POLICY "anon_update_users" ON public.users FOR UPDATE USING (true) WITH CHECK (true);

-- Reviews: full CRUD for admin panel
DROP POLICY IF EXISTS "public_read_approved_reviews" ON public.reviews;
CREATE POLICY "anon_select_reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "anon_update_reviews" ON public.reviews FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_reviews" ON public.reviews FOR DELETE USING (true);

-- Newsletter: UPDATE/DELETE for unsubscribe
CREATE POLICY "anon_update_newsletter" ON public.newsletter FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_newsletter" ON public.newsletter FOR DELETE USING (true);

-- Coupons: full CRUD for admin panel
DROP POLICY IF EXISTS "anon_select_coupons" ON public.coupons;
CREATE POLICY "anon_select_coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "anon_insert_coupons" ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_coupons" ON public.coupons FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_coupons" ON public.coupons FOR DELETE USING (true);

-- Products: full CRUD for admin panel, all visible (admin needs inactive)
DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "anon_select_products" ON public.products FOR SELECT USING (true);
CREATE POLICY "anon_insert_products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_products" ON public.products FOR DELETE USING (true);

-- Brands: full CRUD for admin panel
DROP POLICY IF EXISTS "public_read_brands" ON public.brands;
CREATE POLICY "anon_select_brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "anon_insert_brands" ON public.brands FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_brands" ON public.brands FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_brands" ON public.brands FOR DELETE USING (true);

-- Product sizes/images: full CRUD for admin panel
CREATE POLICY "anon_insert_product_sizes" ON public.product_sizes FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_product_sizes" ON public.product_sizes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_product_sizes" ON public.product_sizes FOR DELETE USING (true);
CREATE POLICY "anon_insert_product_images" ON public.product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_product_images" ON public.product_images FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_product_images" ON public.product_images FOR DELETE USING (true);

-- Admin logs
CREATE POLICY "anon_select_admin_logs" ON public.admin_logs FOR SELECT USING (true);
CREATE POLICY "anon_insert_admin_logs" ON public.admin_logs FOR INSERT WITH CHECK (true);
