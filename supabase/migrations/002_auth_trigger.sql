-- ─────────────────────────────────────────────────────────────────────────────
-- MemeGen Africa — Auth Trigger
-- Automatically creates a public.users profile and allocates 50 Meme Coins
-- whenever Supabase Auth creates a new user (signUp or OTP first-time login).
-- Apply with: supabase db push
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create the public user profile linked to the auth user
  INSERT INTO public.users (user_id, email, phone_number, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    -- phone_number is passed as user metadata during signUp
    NEW.raw_user_meta_data->>'phone_number',
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Allocate Free Plan — 50 Meme Coins, 30-day reset
  INSERT INTO public.user_credits (user_id, plan_id, remaining_credits, period_reset_date)
  VALUES (NEW.id, 1, 50, now() + INTERVAL '30 days')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Fire after every new auth.users insert (registration or first OTP sign-in)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_auth_user();
