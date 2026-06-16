import { Transaction } from "../types";

export async function initiatePayment(payload: {
  user_id: string;
  gateway: "mpesa" | "stripe" | "paypal";
  plan_id: number;
  phone?: string;
}): Promise<{ transaction: Transaction; isSimulated: boolean; redirectUrl: string; message: string }> {
  const res = await fetch("/api/pay/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Payment initiation failed.");
  return data;
}

export async function checkPaymentStatus(
  transaction_id: string
): Promise<{ status: "Pending" | "Completed" | "Failed"; transaction: Transaction }> {
  const res = await fetch(`/api/pay/status?transaction_id=${transaction_id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Status check failed.");
  return data;
}

export async function submitCallback(
  transaction_id: string,
  status: "Completed" | "Failed"
): Promise<boolean> {
  const res = await fetch("/api/pay/callback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction_id, status }),
  });
  const data = await res.json();
  return !!data.success;
}
