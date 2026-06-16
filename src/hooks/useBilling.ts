import { useAppStore } from "../store/AppContext";
import { initiatePayment, checkPaymentStatus, submitCallback } from "../api/payment.api";
import { fetchDbState } from "../api/db.api";
import { useToast } from "./useToast";

export function useBilling() {
  const store = useAppStore();
  const { showToast } = useToast();

  const refreshDb = async () => {
    const data = await fetchDbState();
    store.setUsers(data.users);
    store.setSubscriptionPlans(data.subscription_plans);
    store.setUserCredits(data.user_credits);
    store.setTransactions(data.transactions);
  };

  const handleCheckPaymentStatus = async (txId?: string): Promise<boolean> => {
    const targetId = txId || store.checkoutPendingTx?.transaction_id;
    if (!targetId) return false;
    try {
      const { status } = await checkPaymentStatus(targetId);
      if (status === "Completed") {
        showToast("✓ Payment verified! Meme Coins added to your balance.");
        store.setCheckoutPendingTx(null);
        await refreshDb();
        return true;
      } else if (status === "Failed") {
        showToast("✗ Payment failed or was cancelled.");
        store.setCheckoutPendingTx(null);
        await refreshDb();
        return true;
      }
    } catch {}
    return false;
  };

  const handleInitiatePayment = async () => {
    const plan = store.subscriptionPlans.find((p) => p.plan_id === store.selectedPlanId);
    if (!plan) return;
    store.setCheckoutRedirectUrl("");

    try {
      const result = await initiatePayment({
        user_id: store.selectedUserId,
        gateway: store.paymentGateway,
        plan_id: store.selectedPlanId,
        phone: store.phoneForMpesa,
      });

      store.setCheckoutPendingTx(result.transaction);
      const amountStr = store.paymentGateway === "mpesa" ? `KES ${plan.price_kes}` : `$${plan.price_usd}`;

      if (result.isSimulated) {
        showToast(`[SIMULATOR] ${store.paymentGateway.toUpperCase()} invoice created for ${amountStr}`);
        // Auto-complete sandbox after delay
        setTimeout(async () => {
          try {
            const ok = await submitCallback(result.transaction.transaction_id, "Completed");
            if (ok) {
              showToast(`✓ [Sandbox] Payment completed! Meme Coins added for ${amountStr}.`);
              store.setCheckoutPendingTx(null);
              await refreshDb();
            }
          } catch {}
        }, 3500);
      } else {
        if (result.redirectUrl) {
          store.setCheckoutRedirectUrl(result.redirectUrl);
          showToast(`⚡ LIVE Checkout ready. Opening ${store.paymentGateway.toUpperCase()} gateway...`);
          try { window.open(result.redirectUrl, "_blank"); } catch {}
        } else {
          showToast(`⚡ LIVE M-PESA STK Push dispatched! Enter PIN on your phone for KES ${plan.price_kes}.`);
          let elapsed = 0;
          const poll = setInterval(async () => {
            elapsed += 2.5;
            const done = await handleCheckPaymentStatus(result.transaction.transaction_id);
            if (done || elapsed >= 60) {
              clearInterval(poll);
              if (elapsed >= 60 && !done) showToast("⏱️ STK timeout. Use 'Verify Payment' if you already paid.");
            }
          }, 2500);
        }
      }
    } catch (err: any) {
      showToast(err.message || "Payment gateway error.");
    }

    await refreshDb();
  };

  return { handleInitiatePayment, handleCheckPaymentStatus };
}
