import { Router } from "express";
import { adminClient } from "../db/client";
import { addLog } from "../middleware/logger";

const router = Router();

// GET /api/creations?user_id=...
router.get("/", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  const { data: creations, error } = await adminClient
    .from("creations")
    .select("*")
    .eq("user_id", user_id as string)
    .order("created_at", { ascending: false });

  if (error) {
    addLog("Database", `Failed to load creations: ${error.message}`, "ERROR");
    return res.status(500).json({ error: error.message });
  }

  res.json({ creations: creations || [] });
});

// POST /api/creations
router.post("/", async (req, res) => {
  const { user_id, type, prompt, caption, image_url, video_url } = req.body;
  if (!user_id || !type) return res.status(400).json({ error: "Missing user_id or type" });

  const { data: creation, error } = await adminClient
    .from("creations")
    .insert({
      user_id,
      type,
      prompt:    prompt    || null,
      caption:   caption   || null,
      image_url: image_url || null,
      video_url: video_url || null,
    })
    .select()
    .single();

  if (error) {
    addLog("Database", `Failed to save creation: ${error.message}`, "ERROR");
    return res.status(500).json({ error: error.message });
  }

  addLog("Database", `Saved creation for user ${user_id}.`, "SUCCESS");
  res.json({ success: true, creation });
});

export default router;
