import { createClient } from "@supabase/supabase-js";

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY not set. " +
    "Auth features will be unavailable."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// ── Auth helpers ──────────────────────────────────────────────────────────────

/**
 * Register or sign in via OTP — Supabase creates the user on first OTP if they don't exist.
 * phone_number is stored in user_metadata and picked up by the DB trigger.
 */
export async function authSignUp(email: string, phone_number: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { phone_number },
    },
  });
}

/**
 * Send a one-time password (OTP) to the user's email for login.
 * The user enters the 6-digit code returned by authVerifyOtp().
 */
export async function authSendOtp(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false }, // login only — don't auto-create on OTP
  });
}

/**
 * Verify the 6-digit OTP the user received in their email.
 */
export async function authVerifyOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({ email, token, type: "email" });
}

/**
 * Sign the current user out and clear the session.
 */
export async function authSignOut() {
  return supabase.auth.signOut();
}

/**
 * Get the current active session (null if not logged in).
 * Call this on app boot to restore session state.
 */
export async function getAuthSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export type { Session, User as SupabaseUser } from "@supabase/supabase-js";
