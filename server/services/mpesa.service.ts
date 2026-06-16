import { config } from "../config";
import { addLog } from "../middleware/logger";

export function sanitizeMpesaPhone(phone: string): string {
  let cleaned = (phone || "").replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = "254" + cleaned.substring(1);
  if (cleaned.startsWith("254")) return cleaned;
  if (cleaned.length === 9) return "254" + cleaned;
  return cleaned.padEnd(12, "0").slice(0, 12);
}

export async function triggerStkPush(
  phone: string,
  amount: number,
  refDesc: string
): Promise<{ success: boolean; checkoutRequestId: string }> {
  const { consumerKey, consumerSecret, shortcode, passkey, baseUrl } = config.mpesa;

  if (!config.mpesa.isConfigured()) {
    throw new Error("M-Pesa Consumer Key/Secret is missing in settings.");
  }

  const cleanPhone = sanitizeMpesaPhone(phone);

  // 1. OAuth token
  const authCredentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const authRes = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${authCredentials}` },
  });
  if (!authRes.ok) {
    const text = await authRes.text();
    throw new Error(`Safaricom Daraja Auth failed: ${text}`);
  }
  const authData: any = await authRes.json();
  const accessToken = authData.access_token;
  if (!accessToken) throw new Error("Failed to parse M-Pesa bearer token.");

  // 2. Timestamp: YYYYMMDDHHmmss
  const d = new Date();
  const timestamp =
    d.getFullYear().toString() +
    (d.getMonth() + 1).toString().padStart(2, "0") +
    d.getDate().toString().padStart(2, "0") +
    d.getHours().toString().padStart(2, "0") +
    d.getMinutes().toString().padStart(2, "0") +
    d.getSeconds().toString().padStart(2, "0");

  // 3. Password: Base64(Shortcode + Passkey + Timestamp)
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  const callbackUrl = `${config.appUrl}/api/pay/mpesa-callback`;

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount),
    PartyA: cleanPhone,
    PartyB: shortcode,
    PhoneNumber: cleanPhone,
    CallBackURL: callbackUrl,
    AccountReference: "CreatorSuite",
    TransactionDesc: refDesc.substring(0, 15),
  };

  addLog("Gateway/API", `Calling Daraja STK Push: ${baseUrl}/mpesa/stkpush/v1/processrequest`);

  const res = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json: any = await res.json();
  if (!res.ok || json.ResponseCode !== "0") {
    throw new Error(json.errorMessage || json.ResponseDescription || "Daraja STK push failure.");
  }

  return { success: true, checkoutRequestId: json.CheckoutRequestID };
}
