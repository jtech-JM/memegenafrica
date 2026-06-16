import { config } from "../config";
import { addLog } from "../middleware/logger";
import { SubscriptionPlan } from "../types";

export async function getPaypalAccessToken(): Promise<string> {
  const { clientId, clientSecret, baseUrl } = config.paypal;
  if (!config.paypal.isConfigured()) {
    throw new Error("PayPal Client ID or Secret is missing in settings.");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${text}`);
  }
  const data: any = await res.json();
  return data.access_token;
}

export async function createPaypalOrder(
  plan: SubscriptionPlan,
  transaction_id: string,
  appUrl: string
): Promise<{ id: string; redirectUrl: string }> {
  const token = await getPaypalAccessToken();
  const { baseUrl } = config.paypal;

  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: transaction_id,
        description: `${plan.name} Subscription - AI Creative Suite`,
        amount: { currency_code: "USD", value: plan.price_usd.toString() },
      },
    ],
    application_context: {
      return_url: `${appUrl}/api/pay/paypal-success?transaction_id=${transaction_id}`,
      cancel_url: `${appUrl}/?payment_cancelled=true`,
      user_action: "PAY_NOW",
    },
  };

  const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal order creation failed: ${text}`);
  }
  const data: any = await res.json();
  const approveLink = data.links?.find(
    (l: any) => l.rel === "approve" || l.rel === "payer-action" || l.rel === "checkout"
  );

  addLog("Gateway/API", `PayPal order created: ${data.id}`, "SUCCESS");
  return { id: data.id, redirectUrl: approveLink?.href || "" };
}

export async function capturePaypalOrder(orderId: string): Promise<boolean> {
  const token = await getPaypalAccessToken();
  const { baseUrl } = config.paypal;

  const res = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    addLog("Gateway/API", `PayPal capture error: ${text}`, "ERROR");
    return false;
  }
  const data: any = await res.json();
  addLog("Gateway/API", `PayPal order ${orderId} capture status: ${data.status}`);
  return data.status === "COMPLETED";
}
