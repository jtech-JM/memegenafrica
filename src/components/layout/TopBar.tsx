import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Search, RefreshCw, ChevronDown, LogOut, LogIn, UserPlus, User, Coins } from "lucide-react";
import { useAppStore } from "../../store/AppContext";
import { fetchDbState } from "../../api/db.api";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

// ── Inline brand SVGs ────────────────────────────────────────────────────────
// Safaricom M-Pesa green
const SafaricomBadge = () => (
  <span className="inline-flex items-center gap-1 bg-[#00A550]/15 border border-[#00A550]/40 rounded-md px-1.5 py-0.5">
    <span className="h-1.5 w-1.5 rounded-full bg-[#00A550]" />
    <span className="text-[8px] font-black text-[#00A550] tracking-wider uppercase leading-none">M-PESA</span>
  </span>
);

// Gemini / Google AI badge
const GeminiBadge = () => (
  <span className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/30 rounded-md px-1.5 py-0.5">
    <svg viewBox="0 0 16 16" className="h-2.5 w-2.5" aria-hidden>
      <defs>
        <linearGradient id="gem-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4285F4"/>
          <stop offset="50%" stopColor="#EA4335"/>
          <stop offset="100%" stopColor="#FBBC04"/>
        </linearGradient>
      </defs>
      <path d="M8 1 L10 6 L15 8 L10 10 L8 15 L6 10 L1 8 L6 6 Z" fill="url(#gem-grad)"/>
    </svg>
    <span className="text-[8px] font-bold text-blue-400 leading-none">Gemini</span>
  </span>
);

export default function TopBar() {
  const store = useAppStore();
  const { handleSignOut } = useAuth();
  const { showToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCredit = store.userCredits.find((c) => c.user_id === store.selectedUserId);
  const activePlan   = store.subscriptionPlans.find((p) => p.plan_id === activeCredit?.plan_id);
  const activeUser   = store.users.find((u) => u.user_id === store.selectedUserId);
  const isLoggedIn   = !!localStorage.getItem("registered_user_id");

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRefresh = async () => {
    const data = await fetchDbState();
    store.setUsers(data.users);
    store.setSubscriptionPlans(data.subscription_plans);
    store.setUserCredits(data.user_credits);
    store.setTransactions(data.transactions);
    showToast("Data synced!");
  };

  const coinsDisplay = store.selectedUserId && activeCredit
    ? `${activeCredit.remaining_credits.toLocaleString()} 🪙`
    : store.selectedUserId ? "0 🪙" : "Guest";

  const planDisplay = activePlan?.name || "Free";

  const currencyDisplay = store.currencyMode === "KES" ? "🇰🇪 KES" : "🇺🇸 USD";

  return (
    <header className="sticky top-0 z-30 bg-[#070a13]/90 backdrop-blur-md border-b border-slate-800/60 px-4 md:px-6 py-3 flex items-center justify-between gap-4">

      {/* Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
          <Sparkles className="h-4 w-4 text-slate-950" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-extrabold text-white tracking-tight leading-none">
            MemeGen <span className="text-amber-500">Africa</span>
          </p>
          <p className="text-[9px] text-gray-500 mt-0.5">AI Content Suite</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex-grow max-w-xs hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search features..."
            value={store.searchText}
            onChange={(e) => store.setSearchText(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-amber-400/60 text-xs text-white pl-9 pr-4 py-2 rounded-xl focus:outline-none transition-all placeholder-gray-600"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Currency toggle */}
        <button
          onClick={() => store.setCurrencyMode(store.currencyMode === "KES" ? "USD" : "KES")}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
        >
          {currencyDisplay}
        </button>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-gray-400 hover:text-white transition-all cursor-pointer"
          aria-label="Refresh data"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>

        {/* ── Profile / Credits Dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer group"
          >
            {/* Avatar circle */}
            <div className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <User className="h-3 w-3 text-amber-400" />
            </div>

            {/* Coins + plan */}
            <div className="hidden sm:flex flex-col items-start leading-none gap-0.5">
              <span className="text-[11px] font-bold text-amber-400">{coinsDisplay}</span>
              <span className="text-[9px] text-gray-500">· {planDisplay}</span>
            </div>

            <ChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">

              {/* User info header */}
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                {isLoggedIn && activeUser ? (
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{activeUser.email}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">🔒 Member Account</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Guest Sandbox</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">✨ Demo mode — works not saved</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Meme Coins summary */}
              <div className="px-4 py-3 border-b border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-white">{coinsDisplay}</span>
                    <span className="text-[9px] text-gray-500">· {planDisplay}</span>
                  </div>
                  <button
                    onClick={() => store.setCurrencyMode(store.currencyMode === "KES" ? "USD" : "KES")}
                    className="text-[9px] font-bold text-gray-400 hover:text-amber-400 bg-slate-800 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {currencyDisplay}
                  </button>
                </div>
                {/* Brand badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <SafaricomBadge />
                  <GeminiBadge />
                  {/* Stripe micro-badge */}
                  <span className="inline-flex items-center gap-1 bg-[#635BFF]/10 border border-[#635BFF]/30 rounded-md px-1.5 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF]" />
                    <span className="text-[8px] font-black text-[#635BFF] tracking-wider uppercase leading-none">Stripe</span>
                  </span>
                  {/* PayPal micro-badge */}
                  <span className="inline-flex items-center gap-1 bg-[#009CDE]/10 border border-[#009CDE]/30 rounded-md px-1.5 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#009CDE]" />
                    <span className="text-[8px] font-black text-[#009CDE] tracking-wider uppercase leading-none">PayPal</span>
                  </span>
                </div>
              </div>

              {/* Auth actions */}
              <div className="px-4 py-3 space-y-2">
                {isLoggedIn ? (
                  <button
                    onClick={() => { handleSignOut(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-950 border border-slate-800 hover:border-red-500/30 hover:bg-red-500/5 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { store.setAuthScreen("register"); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold rounded-xl transition-all cursor-pointer uppercase tracking-wider"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Create Free Account
                    </button>
                    <button
                      onClick={() => { store.setAuthScreen("login"); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      Sign In
                    </button>
                  </>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}
