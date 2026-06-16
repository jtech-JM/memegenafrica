import { adminClient } from "./client";
import { addLog } from "../middleware/logger";

const PLANS = [
  { name: "Free",          price_usd: 0,  price_kes: 0,    total_credit_allocation: 50    },
  { name: "Starter",       price_usd: 5,  price_kes: 650,  total_credit_allocation: 500   },
  { name: "Creator / Pro", price_usd: 15, price_kes: 2000, total_credit_allocation: 2000  },
  { name: "Business",      price_usd: 50, price_kes: 6400, total_credit_allocation: 10000 },
];

export async function seedDatabase(): Promise<void> {
  const { count, error: countErr } = await adminClient
    .from("subscription_plans")
    .select("*", { count: "exact", head: true });

  if (countErr) {
    addLog("Database", `Seed check failed: ${countErr.message}`, "ERROR");
    return;
  }

  if ((count ?? 0) > 0) {
    addLog("Database", `Subscription plans already present (${count} records) — skipping seed.`);
    return;
  }

  const { error } = await adminClient.from("subscription_plans").insert(PLANS);
  if (error) {
    addLog("Database", `Failed to seed subscription plans: ${error.message}`, "ERROR");
  } else {
    addLog("Database", `Seeded ${PLANS.length} subscription plans.`, "SUCCESS");
  }
}
