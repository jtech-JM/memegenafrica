import React, { useState } from "react";
import { Sparkles, Mail, Key, LogIn, ArrowRight } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useAppStore } from "../store/AppContext";
import { authSendOtp, authVerifyOtp } from "../lib/supabase";
import { getAuthSession } from "../lib/supabase";
import Button from "../components/ui/Button";

type Step = "email" | "otp";

export default function LoginPage() {
  const { handleLogin } = useAuth();
  const store = useAppStore();

  const [step, setStep]     = useState<Step>("email");
  const [email, setEmail]   = useState("");
  const [otp, setOtp]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  // ── Step 1: send OTP to email ────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      const { error: otpErr } = await authSendOtp(email.trim().toLowerCase());
      if (otpErr) {
        // "shouldCreateUser: false" returns error if email not registered
        setError("No account found with this email. Please register first.");
        return;
      }
      setStep("otp");
    } catch {
      setError("Failed to send verification code. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: verify OTP and log in ────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setError("");
    setLoading(true);
    try {
      const { data, error: verifyErr } = await authVerifyOtp(
        email.trim().toLowerCase(),
        otp.trim()
      );
      if (verifyErr || !data.user) {
        setError("Invalid or expired code. Please try again.");
        return;
      }
      // OTP verified — load the user's profile via the existing Express route
      await handleLogin(email.trim().toLowerCase());
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If Supabase sent a magic link, the user clicks it in their email which creates
  // a client session. This button lets the user tell the app to check for that session
  // and continue once Supabase has authenticated them.
  const handleCheckMagicLink = async () => {
    if (!email.trim()) return;
    setError("");
    setLoading(true);
    try {
      const session = await getAuthSession();
      if (!session || !session.user) {
        setError("No active session yet. Click the link in your email, then press Continue.");
        return;
      }
      const sessionEmail = (session.user.email || "").toLowerCase();
      if (sessionEmail !== email.trim().toLowerCase()) {
        setError("Signed in with a different email. Use the same address you entered.");
        return;
      }
      await handleLogin(email.trim().toLowerCase());
    } catch {
      setError("Failed to verify sign-in link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center text-center z-10">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-xl flex items-center justify-center border border-amber-400 mb-4 animate-pulse">
          <Sparkles className="h-6 w-6 text-slate-950" />
        </div>
        <h2 className="font-extrabold text-3xl tracking-tight text-white">
          MemeGen <span className="text-amber-500">Africa</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1.5">East Africa's Elite AI Satire & Sheng Media Suite</p>
      </div>

      {/* Card */}
      <div className="bg-slate-900/90 border border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-2xl max-w-md w-full z-10 backdrop-blur-xl relative">
        <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <LogIn className="h-4 w-4" />
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 font-mono">
              {step === "email" ? "Secure Access" : "Verify Code"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">
            {step === "email" ? "Sign In to Workspace" : "Enter Verification Code"}
          </h3>
          <p className="text-xs text-gray-400 mt-1.5">
            {step === "email"
              ? "Enter your registered email to reload Meme Coins, retrieve saved files in "
              : `We sent a 6-digit code to `}
            {step === "email"
              ? <><strong className="text-amber-400">My Album</strong>, and sync records.</>
              : <strong className="text-amber-400">{email}</strong>}
          </p>
        </div>

        {/* Step 1 — Email */}
        {step === "email" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono">
                Email Address <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@domain.com"
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-400 text-xs text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all placeholder-gray-600"
                />
              </div>
            </div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <Button variant="primary" size="md" type="submit" loading={loading} icon={<ArrowRight />} className="w-full">
              {loading ? "Sending code..." : "Send Verification Code"}
            </Button>
          </form>
        )}

        {/* Step 2 — OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 font-mono">
                6-Digit Code <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                  placeholder="123456"
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-amber-400 text-xs text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all placeholder-gray-600 tracking-[0.4em] font-mono"
                  autoFocus
                />
              </div>
              <p className="text-[9.5px] text-gray-500">Check your inbox — the code expires in 10 minutes.</p>
            </div>
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <Button variant="primary" size="md" type="submit" loading={loading} icon={<Key />} className="w-full">
              {loading ? "Verifying..." : "Verify & Sign In"}
            </Button>
            <button
              type="button"
              onClick={() => { setStep("email"); setOtp(""); setError(""); }}
              className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 cursor-pointer bg-transparent border-none"
            >
              ← Change email address
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-slate-800 space-y-3 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">New around here?</span>
            <button
              onClick={() => store.setAuthScreen("register")}
              className="text-amber-500 hover:text-amber-400 font-bold underline cursor-pointer text-xs bg-transparent border-none p-0"
            >
              Create Account Free
            </button>
          </div>
          <button
            onClick={() => store.setAuthScreen("app")}
            className="w-full py-2.5 bg-slate-950 border border-slate-800 text-gray-400 hover:text-white rounded-xl text-[11px] font-bold hover:bg-slate-900 transition-colors cursor-pointer"
          >
            🚀 Continue as Guest
          </button>
        </div>
      </div>

      <p className="mt-6 text-[10px] text-gray-600 font-mono z-10">🔒 OTP verified · Encrypted session · Powered by Supabase Auth</p>
    </div>
  );
}
