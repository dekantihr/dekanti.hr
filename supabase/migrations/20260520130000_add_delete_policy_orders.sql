-- Allow anon to DELETE orders and order_items (needed for admin panel delete)
-- Without this, DELETE silently fails (RLS blocks it, returns 0 rows deleted)
-- and the order reappears on page refresh.
CREATE POLICY "anon_delete_orders" ON public.orders FOR DELETE USING (true);
CREATE POLICY "anon_delete_order_items" ON public.order_items FOR DELETE USING (true);
