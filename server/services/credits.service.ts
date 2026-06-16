import { adminClient } from "../db/client";
import { addLog } from "../middleware/logger";

export async function completeTransaction(transaction_id: string): Promise<boolean> {
  const { data, error } = await adminClient.rpc("complete_transaction", {
    p_transaction_id: transaction_id,
  });

  if (error) {
    addLog("Database", `completeTransaction RPC error: ${error.message}`, "ERROR");
    return false;
  }

  addLog("Gateway/API", `Transaction ${transaction_id} completed via Supabase RPC.`, "SUCCESS");
  return data === true;
}
