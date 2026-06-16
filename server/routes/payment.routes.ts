import { Router } from "express";
import { adminClient } from "../db/client";
import { addLog } from "../middleware/logger";
import { config } from "../config";
import { completeTransaction } from "../services/credits.service";
import { triggerStkPush } from "../services/mpesa.service";
import { createStripeSession, verifyStripeSession } from "../services/stripe.service";
import { createPaypalOrder, capturePaypalOrder } from "../services/paypal.service";
import { SubscriptionPlan, TransactionRow } from "../types";

const router = Router();

async function getPlan(plan_id: number): Promise<SubscriptionPlan | null> {
  const { data } = await adminClient
    .from("subscription_plans")
    .select("*")
    .eq("plan_id", plan_id)
    .single();
  return data as SubscriptionPlan | null;
}

// POST /api/pay/initiate
router.post("/initiate", async (req, res) => {
  const { user_id, gateway, plan_id, phone } = req.body;
  const plan = await getPlan(plan_id);
  if (!plan) return res.status(400).json({ error: "Plan not found" });

  const transaction_id = `tx-${Math.random().toString(36).slice(2, 11)}`;
  const amount   = gateway === "mpesa" ? plan.price_kes  : plan.price_usd;
  const currency = gateway === "mpesa" ? "KES" : "USD";
  const appUrl   = (config.appUrl || (req.headers.origin as string) || "http://localhost:3000").replace(/\/$/, "");

  let ref = "";
  let isSimulated = true;
  let redirectUrl = "";

  try {
    if (gateway === "mpesa") {
      if (config.mpesa.isConfigured()) {
        addLog("Gateway/API", `LIVE M-Pesa STK Push to ${phone} for KES ${amount}...`);
        const result = await triggerStkPush(phone, amount, plan.name);
        ref = result.checkoutRequestId;
        isSimulated = false;
        addLog("Gateway/API", `LIVE STK Push initiated. Checkout ID: ${ref}`, "SUCCESS");
      } else {
        ref = `STK${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        addLog("Gateway/API", `[SIMULATOR] STK Push simulated for KES ${amount}. Ref: ${ref}`);
        addLog("Gateway/API", "ℹ️ Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET to enable live STK Push.");
      }
    } else if (gateway === "stripe") {
      if (config.stripe.isConfigured()) {
        addLog("Gateway/API", `LIVE Stripe Checkout for ${plan.name} ($${amount})...`);
        const result = await createStripeSession(plan, transaction_id, user_id, appUrl);
        ref = result.sessionId;
        redirectUrl = result.redirectUrl;
        isSimulated = false;
      } else {
        ref = `ch_${Math.random().toString(36).substring(2, 10)}`;
        addLog("Gateway/API", `[SIMULATOR] Stripe session simulated for $${amount}. Ref: ${ref}`);
        addLog("Gateway/API", "ℹ️ Set STRIPE_SECRET_KEY to enable live Stripe payments.");
      }
    } else if (gateway === "paypal") {
      if (config.paypal.isConfigured()) {
        addLog("Gateway/API", `LIVE PayPal checkout for ${plan.name} ($${amount})...`);
        const result = await createPaypalOrder(plan, transaction_id, appUrl);
        ref = result.id;
        redirectUrl = result.redirectUrl;
        isSimulated = false;
      } else {
        ref = `pp_${Math.random().toString(36).substring(2, 10)}`;
        addLog("Gateway/API", `[SIMULATOR] PayPal order simulated for $${amount}. Ref: ${ref}`);
        addLog("Gateway/API", "ℹ️ Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to enable live PayPal.");
      }
    }
  } catch (err: any) {
    addLog("Gateway/API", `Payment initiation failed: ${err.message}`, "ERROR");
    return res.status(400).json({ error: err.message });
  }

  const newTx: TransactionRow = {
    transaction_id,
    user_id,
    payment_gateway: gateway,
    gateway_reference: ref,
    amount,
    currency,
    status: "Pending",
    created_at: new Date().toISOString(),
  };

  try {
    const { error: txErr } = await adminClient.from("transactions").insert({
      transaction_id,
      user_id,
      payment_gateway: gateway,
      gateway_reference: ref,
      amount,
      currency,
      status: "Pending",
    });
    if (txErr) throw txErr;
    addLog("Database", `Transaction logged: ${transaction_id}`);
  } catch (err: any) {
    addLog("Database", `Failed to log transaction: ${err.message}`, "ERROR");
    return res.status(500).json({ error: err.message });
  }

  res.json({
    success: true,
    transaction: newTx,
    isSimulated,
    redirectUrl,
    message:
      gateway === "mpesa"
        ? isSimulated
          ? "STK Push Simulated"
          : "LIVE STK Push dispatched to handset"
        : `${gateway} checkout session created`,
  });
});

// GET /api/pay/status
router.get("/status", async (req, res) => {
  const { transaction_id } = req.query;
  if (!transaction_id) return res.status(400).json({ error: "Missing transaction_id" });

  const { data: tx, error } = await adminClient
    .from("transactions")
    .select("*")
    .eq("transaction_id", transaction_id as string)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!tx)   return res.status(404).json({ error: "Transaction not found" });

  res.json({ status: (tx as TransactionRow).status, transaction: tx });
});

// POST /api/pay/callback  (manual / sandbox callback)
router.post("/callback", async (req, res) => {
  const { transaction_id } = req.body;
  addLog("Gateway/API", `Callback received for transaction ${transaction_id}`);

  const done = await completeTransaction(transaction_id);
  if (!done) return res.status(404).json({ error: "Transaction failed to complete" });

  const { data: updatedTx } = await adminClient
    .from("transactions")
    .select("*")
    .eq("transaction_id", transaction_id)
    .maybeSingle();

  res.json({ success: true, transaction: updatedTx });
});

// POST /api/pay/mpesa-callback  (Safaricom Daraja webhook)
router.post("/mpesa-callback", async (req, res) => {
  addLog("Gateway/API", `M-Pesa webhook received: ${JSON.stringify(req.body)}`);
  try {
    const { Body } = req.body;
    if (!Body?.stkCallback) {
      addLog("Gateway/API", "Invalid M-Pesa callback format.", "ERROR");
      return res.status(400).json({ ResultCode: 1, ResultDescription: "Invalid structure" });
    }
    const { CheckoutRequestID, ResultCode, ResultDesc } = Body.stkCallback;
    addLog("Gateway/API", `M-Pesa: CheckoutID=${CheckoutRequestID}, Code=${ResultCode} (${ResultDesc})`);

    const { data: tx } = await adminClient
      .from("transactions")
      .select("*")
      .eq("gateway_reference", CheckoutRequestID)
      .maybeSingle();

    if (!tx) {
      addLog("Gateway/API", `No transaction matching CheckoutRequestID: ${CheckoutRequestID}`, "WARN");
      return res.json({ ResultCode: 0, ResultDescription: "Processed" });
    }

    if (ResultCode === 0) {
      await completeTransaction((tx as TransactionRow).transaction_id);
    } else {
      await adminClient
        .from("transactions")
        .update({ status: "Failed" })
        .eq("transaction_id", (tx as TransactionRow).transaction_id);
      addLog("Gateway/API", `M-Pesa STK declined. Code: ${ResultCode}`, "WARN");
    }
    res.json({ ResultCode: 0, ResultDescription: "Success" });
  } catch (err: any) {
    addLog("Gateway/API", `M-Pesa webhook error: ${err.message}`, "ERROR");
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pay/stripe-success  (Stripe redirect)
router.get("/stripe-success", async (req, res) => {
  const { session_id, transaction_id } = req.query as Record<string, string>;
  addLog("Gateway/API", `Stripe success redirect. Session: ${session_id}, TX: ${transaction_id}`);
  try {
    if (session_id && config.stripe.isConfigured()) {
      const paid = await verifyStripeSession(session_id);
      if (paid) await completeTransaction(transaction_id);
      else addLog("Gateway/API", "Stripe session not paid yet.", "WARN");
    } else {
      await completeTransaction(transaction_id);
    }
    res.redirect("/?payment_status=success");
  } catch (err: any) {
    addLog("Gateway/API", `Stripe success handler error: ${err.message}`, "ERROR");
    res.redirect(`/?payment_status=error&message=${encodeURIComponent(err.message)}`);
  }
});

// GET /api/pay/paypal-success  (PayPal redirect)
router.get("/paypal-success", async (req, res) => {
  const { token, transaction_id } = req.query as Record<string, string>;
  addLog("Gateway/API", `PayPal success redirect. Order: ${token}, TX: ${transaction_id}`);
  try {
    if (token && config.paypal.isConfigured()) {
      const captured = await capturePaypalOrder(token);
      if (captured) await completeTransaction(transaction_id);
    } else {
      await completeTransaction(transaction_id);
    }
    res.redirect("/?payment_status=success");
  } catch (err: any) {
    addLog("Gateway/API", `PayPal capture error: ${err.message}`, "ERROR");
    res.redirect(`/?payment_status=error&message=${encodeURIComponent(err.message)}`);
  }
});

export default router;
