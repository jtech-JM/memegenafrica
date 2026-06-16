import { Router } from "express";
import { adminClient } from "../db/client";
import { addLog, logs } from "../middleware/logger";

const router = Router();

// GET /api/db/state
router.get("/state", async (req, res) => {
  try {
    const [users, plans, credits, transactions] = await Promise.all([
      adminClient.from("users").select("*"),
      adminClient.from("subscription_plans").select("*"),
      adminClient.from("user_credits").select("*"),
      adminClient.from("transactions").select("*"),
    ]);

    res.json({
      users:              users.data        || [],
      subscription_plans: plans.data        || [],
      user_credits:       credits.data      || [],
      transactions:       transactions.data || [],
    });
  } catch (err: any) {
    addLog("Database", `Failed to retrieve DB state: ${err.message}`, "ERROR");
    res.status(500).json({ error: err.message });
  }
});

// POST /api/db/query — restricted to credit debit operations only (no raw SQL)
router.post("/query", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "No query provided" });

  // Handle comment-only queries (feedback capture)
  if (query.trim().startsWith("--")) {
    return res.json({ rows: [], message: "Comment parsed (feedback captured)." });
  }

  // Only allow UPDATE user_credits operations — no raw SQL passthrough
  const qUpper = query.trim().toUpperCase();
  if (!qUpper.includes("UPDATE") || !qUpper.includes("USER_CREDITS")) {
    return res
      .status(403)
      .json({ error: "Only user_credits UPDATE operations are permitted via this endpoint." });
  }

  // Extract user_id and amount from the query for the RPC call
  const userMatch  = query.match(/user_id\s*=\s*'([^']+)'/i);
  const amountMatch = query.match(/remaining_credits\s*-\s*(\d+)/i);

  if (!userMatch || !amountMatch) {
    return res
      .status(400)
      .json({ error: "Could not parse user_id or debit amount from query." });
  }

  const userId = userMatch[1];
  const amount = parseInt(amountMatch[1], 10);

  const { data: success, error } = await adminClient.rpc("debit_credits", {
    p_user_id: userId,
    p_amount:  amount,
  });

  if (error) {
    addLog("Database", `Credit debit RPC error: ${error.message}`, "ERROR");
    return res.status(400).json({ error: error.message });
  }

  if (!success) {
    return res.status(400).json({ error: "Insufficient credits." });
  }

  // Fetch updated credits to return
  const { data: cred } = await adminClient
    .from("user_credits")
    .select("remaining_credits")
    .eq("user_id", userId)
    .single();

  addLog("Database", `Debited ${amount} credits from user ${userId}.`, "SUCCESS");
  return res.json({
    success:         true,
    updated_credits: cred?.remaining_credits,
    message:         `Debited ${amount} credits.`,
  });
});

// GET /api/logs
router.get("/logs", (req, res) => {
  res.json({ logs });
});

export default router;
