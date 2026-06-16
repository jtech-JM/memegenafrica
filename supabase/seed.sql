-- MemeGen Africa — Seed Data
-- Subscription plans only. No dev users.
INSERT INTO public.subscription_plans (name, price_usd, price_kes, total_credit_allocation) VALUES
  ('Free',          0,   0,    50),
  ('Starter',       5,   650,  500),
  ('Creator / Pro', 15,  2000, 2000),
  ('Business',      50,  6400, 10000)
ON CONFLICT DO NOTHING;
