import React from "react";
import { CreditCard, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAppStore } from "../../store/AppContext";
import { useBilling } from "../../hooks/useBilling";
import { PLAN_COMPARATIVE_BENEFITS } from "../../data/uiPresets";
import Button from "../ui/Button";

// ── Brand SVG logos ───────────────────────────────────────────────────────────

function MpesaLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 120 32" className="h-5 w-auto" aria-label="M-Pesa">
      <rect width="120" height="32" rx="4" fill={active ? "#00A550" : "transparent"} />
      <text x="60" y="22" textAnchor="middle" fontFamily="Arial Black, sans-serif"
        fontWeight="900" fontSize="16" fill={active ? "#ffffff" : "#00A550"} letterSpacing="0.5">
        M-PESA
      </text>
      <path d="M10 26 Q14 20 18 26" stroke={active ? "#ffffff" : "#00A550"}
        strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function StripeLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 60 25" className="h-5 w-auto" aria-label="Stripe">
      <text x="30" y="19" textAnchor="middle" fontFamily="Arial, sans-serif"
        fontWeight="700" fontSize="16" fill={active ? "#ffffff" : "#635BFF"}>
        stripe
      </text>
    </svg>
  );
}

function PayPalLogo({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 80 28" className="h-5 w-auto" aria-label="PayPal">
      <text x="2" y="21" fontFamily="Arial, sans-serif" fontWeight="800"
        fontSize="17" fill={active ? "#ffffff" : "#003087"}>
        Pay
      </text>
      <text x="30" y="21" fontFamily="Arial, sans-serif" fontWeight="800"
        fontSize="17" fill={active ? "#c8e6ff" : "#009CDE"}>
        Pal
      </text>
    </svg>
  );
}

// ── Gateway config ────────────────────────────────────────────────────────────

const GATEWAYS = [
  {
    id: "mpesa"  as const,
    activeBg:    "bg-[#00A550] border-[#00A550]",
    hoverBorder: "hover:border-[#00A550]/50",
    logo: (active: boolean) => <MpesaLogo active={active} />,
  },
  {
    id: "stripe" as const,
    activeBg:    "bg-[#635BFF] border-[#635BFF]",
    hoverBorder: "hover:border-[#635BFF]/50",
    logo: (active: boolean) => <StripeLogo active={active} />,
  },
  {
    id: "paypal" as const,
    activeBg:    "bg-[#003087] border-[#003087]",
    hoverBorder: "hover:border-[#003087]/50",
    logo: (active: boolean) => <PayPalLogo active={active} />,
  },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function Billing() {
  const store = useAppStore();
  const { handleInitiatePayment, handleCheckPaymentStatus } = useBilling();

  const activeCredit = store.userCredits.find((c) => c.user_id === store.selectedUserId);
  const activePlan   = store.subscriptionPlans.find((p) => p.plan_id === activeCredit?.plan_id);
  const selectedGateway = GATEWAYS.find((g) => g.id === store.paymentGateway)!;
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "annual">("monthly");

  return (
    <div className="space-y-6">

      {/* Current balance */}
      <div className="bg-gradient-to-r from-orange-500/10 to-slate-900 border border-orange-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-mono mb-1">Meme Coin Balance</p>
          <p className="text-3xl font-extrabold text-white">
            {activeCredit?.remaining_credits?.toLocaleString() ?? 0}
            <span className="text-base text-gray-400 font-normal ml-2">🪙 Meme Coins</span>
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            Plan: <span className="text-amber-400 font-bold">{activePlan?.name || "Free"}</span>
            {activeCredit?.period_reset_date && (
              <> · Resets: <span className="text-gray-300">{new Date(activeCredit.period_reset_date).toLocaleDateString("en-KE")}</span></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2">
          <CreditCard className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[10px] text-amber-400 font-bold">🎨 Image = 5 🪙 · 🎬 Video = 15 🪙 · ✍️ Caption = 1 🪙</span>
        </div>
      </div>

      {/* Billing cycle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Billing:</span>
        {(["monthly", "annual"] as const).map((c) => (
          <button key={c} onClick={() => setBillingCycle(c)}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer capitalize ${
              billingCycle === c ? "bg-amber-500 border-amber-500 text-slate-950" : "border-slate-800 text-gray-400 hover:text-white"
            }`}>
            {c} {c === "annual" ? "(Save 20%)" : ""}
          </button>
        ))}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {store.subscriptionPlans.map((plan) => {
          const benefits  = PLAN_COMPARATIVE_BENEFITS[plan.plan_id] || [];
          const isActive  = activeCredit?.plan_id === plan.plan_id;
          const isSelected = store.selectedPlanId === plan.plan_id;
          const priceKes  = billingCycle === "annual" ? Math.round(plan.price_kes * 0.8) : plan.price_kes;
          const priceUsd  = billingCycle === "annual" ? Math.round(plan.price_usd * 0.8 * 100) / 100 : plan.price_usd;
          return (
            <button key={plan.plan_id} onClick={() => store.setSelectedPlanId(plan.plan_id)}
              className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                isSelected ? "border-amber-500 bg-amber-500/5 scale-[1.01]" : "border-slate-800 bg-slate-900 hover:border-slate-700"
              }`}>
              {isActive && (
                <span className="text-[8px] font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                  Active Plan
                </span>
              )}
              <div>
                <p className="text-sm font-extrabold text-white">{plan.name}</p>
                <p className="text-2xl font-extrabold text-amber-500 mt-1">
                  {store.currencyMode === "KES" ? `KES ${priceKes.toLocaleString()}` : `$${priceUsd}`}
                  {plan.price_usd > 0 && <span className="text-xs text-gray-400 font-normal">/mo</span>}
                </p>
                <p className="text-[10px] text-gray-500">{plan.total_credit_allocation.toLocaleString()} 🪙 Meme Coins</p>
              </div>
              <ul className="space-y-1">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-gray-400">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Payment section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Payment Method</h3>

        {/* Gateway selector — brand logos */}
        <div className="grid grid-cols-3 gap-3">
          {GATEWAYS.map((gw) => {
            const isActive = store.paymentGateway === gw.id;
            return (
              <button key={gw.id} onClick={() => store.setPaymentGateway(gw.id)}
                className={`flex items-center justify-center py-3 px-3 rounded-xl border-2 transition-all cursor-pointer ${
                  isActive
                    ? `${gw.activeBg} shadow-md`
                    : `border-slate-800 bg-slate-950 ${gw.hoverBorder} hover:bg-slate-900`
                }`}>
                {gw.logo(isActive)}
              </button>
            );
          })}
        </div>

        {/* M-Pesa — Safaricom Daraja */}
        {store.paymentGateway === "mpesa" && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#00A550]/10 border border-[#00A550]/30 rounded-lg px-2.5 py-1">
                <div className="h-2 w-2 rounded-full bg-[#00A550]" />
                <span className="text-[9px] font-bold text-[#00A550] uppercase tracking-wider">Safaricom Daraja</span>
              </div>
              <span className="text-[9px] text-gray-500">STK Push to your phone</span>
            </div>
            <input type="tel" value={store.phoneForMpesa}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.setPhoneForMpesa(e.target.value)}
              placeholder="+254 7XX XXX XXX"
              className="w-full bg-slate-950 border border-slate-800 focus:border-[#00A550]/60 text-xs text-white px-3 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00A550]/30 max-w-xs"
            />
          </div>
        )}

        {/* Stripe */}
        {store.paymentGateway === "stripe" && (
          <div className="flex items-center gap-2 bg-[#635BFF]/10 border border-[#635BFF]/30 rounded-lg px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-[#635BFF]" />
            <span className="text-[10px] text-[#635BFF] font-bold">Stripe Checkout</span>
            <span className="text-[9px] text-gray-500 ml-1">· Redirected to a secure Stripe-hosted page</span>
          </div>
        )}

        {/* PayPal */}
        {store.paymentGateway === "paypal" && (
          <div className="flex items-center gap-2 bg-[#003087]/10 border border-[#003087]/30 rounded-lg px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-[#009CDE]" />
            <span className="text-[10px] text-[#009CDE] font-bold">PayPal Checkout</span>
            <span className="text-[9px] text-gray-500 ml-1">· Redirected to PayPal to complete payment</span>
          </div>
        )}

        {/* Currency */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-gray-400">Display currency:</span>
          {(["KES", "USD"] as const).map((c) => (
            <button key={c} onClick={() => store.setCurrencyMode(c)}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                store.currencyMode === c ? "bg-slate-800 border-slate-600 text-white" : "border-slate-800 text-gray-500 hover:text-gray-300"
              }`}>
              {c === "KES" ? "🇰🇪 KES" : "🇺🇸 USD"}
            </button>
          ))}
        </div>

        {/* Pending transaction */}
        {store.checkoutPendingTx && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-yellow-400">Payment pending</p>
              <p className="text-[9px] text-gray-500 font-mono">{store.checkoutPendingTx.transaction_id}</p>
            </div>
            <Button variant="secondary" size="xs"
              onClick={() => handleCheckPaymentStatus(store.checkoutPendingTx!.transaction_id)}
              icon={<RefreshCw />}>
              Verify
            </Button>
          </div>
        )}

        {/* Redirect link */}
        {store.checkoutRedirectUrl && (
          <a href={store.checkoutRedirectUrl} target="_blank" rel="noreferrer"
            className="block w-full text-center py-2.5 bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/60 text-xs font-bold text-blue-400 rounded-xl transition-all">
            Open Payment Gateway →
          </a>
        )}

        {/* Branded pay button */}
        <button
          onClick={handleInitiatePayment}
          disabled={store.subscriptionPlans.find((p) => p.plan_id === store.selectedPlanId)?.price_usd === 0}
          className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-extrabold text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg ${
            store.paymentGateway === "mpesa"
              ? "bg-[#00A550] hover:bg-[#009344] text-white shadow-[#00A550]/20"
              : store.paymentGateway === "stripe"
              ? "bg-[#635BFF] hover:bg-[#5a52e8] text-white shadow-[#635BFF]/20"
              : "bg-[#003087] hover:bg-[#002570] text-white shadow-[#003087]/20"
          }`}>
          <span className="shrink-0">{selectedGateway.logo(true)}</span>
          <span>
            {store.paymentGateway === "mpesa"  ? "Pay with M-Pesa STK Push"  :
             store.paymentGateway === "stripe" ? "Pay with Stripe"            :
                                                 "Pay with PayPal"}
          </span>
        </button>
      </div>
    </div>
  );
}
