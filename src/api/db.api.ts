import { User, SubscriptionPlan, UserCredit, Transaction, LogMessage } from "../types";

export type DbState = {
  users: User[];
  subscription_plans: SubscriptionPlan[];
  user_credits: UserCredit[];
  transactions: Transaction[];
};

export async function fetchDbState(): Promise<DbState> {
  const res = await fetch("/api/db/state");
  if (!res.ok) throw new Error("Failed to fetch DB state.");
  return res.json();
}

export async function fetchLogs(): Promise<LogMessage[]> {
  const res = await fetch("/api/db/logs");
  if (!res.ok) return [];
  const data = await res.json();
  return data.logs ?? [];
}

export async function executeQuery(query: string): Promise<{
  rows?: any[];
  success?: boolean;
  message?: string;
  updated_credits?: number;
  error?: string;
}> {
  const res = await fetch("/api/db/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}
