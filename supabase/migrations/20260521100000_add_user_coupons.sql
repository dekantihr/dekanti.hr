-- Table linking coupons to specific users
CREATE TABLE IF NOT EXISTS public.user_coupons (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  coupon_id INTEGER NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'used')),
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, coupon_id)
);

-- Enable RLS
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select_user_coupons" ON public.user_coupons FOR SELECT USING (true);
CREATE POLICY "anon_insert_user_coupons" ON public.user_coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_user_coupons" ON public.user_coupons FOR UPDATE USING (true) WITH CHECK (true);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS user_coupons_user_id_idx ON public.user_coupons(user_id);
CREATE INDEX IF NOT EXISTS user_coupons_status_idx ON public.user_coupons(status);
