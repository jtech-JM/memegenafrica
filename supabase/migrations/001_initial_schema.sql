-- ─────────────────────────────────────────────────────────────────────────────
-- MemeGen Africa — Initial Schema
-- Apply with: supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
  user_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email     TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  plan_id                 SERIAL PRIMARY KEY,
  name                    TEXT NOT NULL,
  price_usd               DECIMAL(10,2) NOT NULL,
  price_kes               DECIMAL(10,2) NOT NULL,
  total_credit_allocation INT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_credits (
  user_id           UUID PRIMARY KEY REFERENCES public.users(user_id),
  plan_id           INT REFERENCES public.subscription_plans(plan_id),
  remaining_credits INT NOT NULL DEFAULT 0 CHECK(remaining_credits >= 0),
  period_reset_date TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS public.transactions (
  transaction_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES public.users(user_id),
  payment_gateway  TEXT NOT NULL,
  gateway_reference TEXT,
  amount           DECIMAL(10,2) NOT NULL,
  currency         TEXT DEFAULT 'USD',
  status           TEXT NOT NULL DEFAULT 'Pending',
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.creations (
  creation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.users(user_id),
  type        TEXT NOT NULL,
  prompt      TEXT,
  caption     TEXT,
  image_url   TEXT,
  video_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Row Level Security ─────────────────────────────────────────────────────────

ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creations           ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies: users ───────────────────────────────────────────────────────

CREATE POLICY "users: select own row"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "users: update own row"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── RLS Policies: subscription_plans (public read) ────────────────────────────

CREATE POLICY "plans: public select"
  ON public.subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── RLS Policies: user_credits ────────────────────────────────────────────────

CREATE POLICY "credits: select own row"
  ON public.user_credits
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ── RLS Policies: transactions ────────────────────────────────────────────────

CREATE POLICY "transactions: select own rows"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ── RLS Policies: creations ───────────────────────────────────────────────────

CREATE POLICY "creations: select own rows"
  ON public.creations
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "creations: insert own rows"
  ON public.creations
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "creations: update own rows"
  ON public.creations
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "creations: delete own rows"
  ON public.creations
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ── RPC: debit_credits ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.debit_credits(
  p_user_id UUID,
  p_amount  INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_credits
  SET remaining_credits = remaining_credits - p_amount
  WHERE user_id = p_user_id
    AND remaining_credits >= p_amount;
  RETURN FOUND;
END;
$$;

-- Revoke public execute, grant only to authenticated
REVOKE EXECUTE ON FUNCTION public.debit_credits FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.debit_credits TO authenticated;

-- ── RPC: complete_transaction ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.complete_transaction(p_transaction_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tx   transactions%ROWTYPE;
  v_plan subscription_plans%ROWTYPE;
  v_reset_date TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_tx FROM transactions WHERE transaction_id = p_transaction_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF v_tx.status = 'Completed' THEN RETURN TRUE; END IF;

  UPDATE transactions SET status = 'Completed' WHERE transaction_id = p_transaction_id;

  SELECT * INTO v_plan FROM subscription_plans
  WHERE CASE WHEN v_tx.currency = 'KES' THEN price_kes = v_tx.amount
             ELSE price_usd = v_tx.amount END
  LIMIT 1;
  IF NOT FOUND THEN
    -- Fallback to Creator / Pro (plan_id = 3)
    SELECT * INTO v_plan FROM subscription_plans WHERE plan_id = 3;
  END IF;

  v_reset_date := now() + INTERVAL '30 days';

  INSERT INTO user_credits (user_id, plan_id, remaining_credits, period_reset_date)
  VALUES (v_tx.user_id, v_plan.plan_id, v_plan.total_credit_allocation, v_reset_date)
  ON CONFLICT (user_id) DO UPDATE
    SET remaining_credits = user_credits.remaining_credits + v_plan.total_credit_allocation,
        plan_id           = v_plan.plan_id,
        period_reset_date = v_reset_date;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_transaction FROM PUBLIC;
