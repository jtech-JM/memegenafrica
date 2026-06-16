import Stripe from "stripe";
import { config } from "../config";
import { addLog } from "../middleware/logger";
import { SubscriptionPlan } from "../types";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!stripeClient && config.stripe.isConfigured()) {
    stripeClient = new Stripe(config.stripe.secretKey);
  }
  return stripeClient;
}

export async function createStripeSession(
  plan: SubscriptionPlan,
  transaction_id: string,
  user_id: string,
  appUrl: string
): Promise<{ sessionId: string; redirectUrl: string }> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe client not initialized. Check STRIPE_SECRET_KEY.");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${plan.name} Plan`,
            description: `Adds +${plan.total_credit_allocation} credits to your account.`,
          },
          unit_amount: Math.round(plan.price_usd * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${appUrl}/api/pay/stripe-success?session_id={CHECKOUT_SESSION_ID}&transaction_id=${transaction_id}`,
    cancel_url: `${appUrl}/?payment_cancelled=true`,
    metadata: { transaction_id, user_id, plan_id: plan.plan_id.toString() },
  });

  addLog("Gateway/API", `Stripe session created: ${session.id}`, "SUCCESS");
  return { sessionId: session.id, redirectUrl: session.url || "" };
}

export async function verifyStripeSession(sessionId: string): Promise<boolean> {
  const stripe = getStripe();
  if (!stripe) return false;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session.payment_status === "paid";
}
