import dotenv from "dotenv";

// Load env files for local development only.
// On production/staging, env vars are injected by the platform (Railway, Render, Vercel, etc.)
// and these calls silently no-op when files don't exist.
//
// Priority (lowest → highest):
//   .env  →  .env.local  →  platform-injected process.env
//
// override: false (default) means platform vars always win — files never overwrite
// vars already set in process.env by the deployment platform.
dotenv.config();                          // .env (shared defaults, committed safely)
dotenv.config({ path: ".env.local" });   // .env.local (local secrets, gitignored)

function get(key: string, fallback = ""): string {
  return process.env[key] || fallback;
}

export const config = {
  port: parseInt(get("PORT", "3000"), 10),
  nodeEnv: get("NODE_ENV", "development"),
  appUrl: get("APP_URL", "http://localhost:3000").replace(/\/$/, ""),

  gemini: {
    apiKey: get("GEMINI_API_KEY"),
    isConfigured(): boolean {
      return !!this.apiKey && this.apiKey !== "MY_GEMINI_API_KEY";
    },
  },

  mpesa: {
    env: get("MPESA_ENV", "sandbox"),
    consumerKey: get("MPESA_CONSUMER_KEY"),
    consumerSecret: get("MPESA_CONSUMER_SECRET"),
    shortcode: get("MPESA_SHORTCODE", "174379"),
    passkey: get("MPESA_PASSKEY", "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"),
    isConfigured(): boolean {
      return !!this.consumerKey && this.consumerKey !== "MY_MPESA_CONSUMER_KEY" && this.consumerKey.trim() !== "";
    },
    get baseUrl(): string {
      return this.env === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";
    },
  },

  stripe: {
    secretKey: get("STRIPE_SECRET_KEY"),
    isConfigured(): boolean {
      return !!this.secretKey && this.secretKey !== "MY_STRIPE_SECRET_KEY" && this.secretKey.trim() !== "";
    },
  },

  paypal: {
    mode: get("PAYPAL_MODE", "sandbox"),
    clientId: get("PAYPAL_CLIENT_ID"),
    clientSecret: get("PAYPAL_CLIENT_SECRET"),
    isConfigured(): boolean {
      return !!this.clientId && this.clientId !== "MY_PAYPAL_CLIENT_ID" && this.clientId.trim() !== "";
    },
    get baseUrl(): string {
      return this.mode === "live"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com";
    },
  },

  supabase: {
    url: get("VITE_SUPABASE_URL"),
    serviceRoleKey: get("SUPABASE_SERVICE_ROLE_KEY"),
    anonKey: get("VITE_SUPABASE_PUBLISHABLE_KEY"),
    isConfigured(): boolean {
      return !!this.url && !!this.serviceRoleKey;
    },
  },
} as const;
