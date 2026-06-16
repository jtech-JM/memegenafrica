import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl      = process.env.VITE_SUPABASE_URL!;
const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing required Supabase env vars: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  );
}

/**
 * Admin client — service role key, bypasses RLS.
 * Server-side only. Never expose to the frontend.
 */
export const adminClient: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default adminClient;
