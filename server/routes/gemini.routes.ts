import { Router } from "express";
import { addLog } from "../middleware/logger";
import {
  generateMemeSatire,
  generateCaption,
  getCoachInsight,
  generateImage,
  startVideoGeneration,
  getVideoStatus,
  streamVideoDownload,
} from "../services/gemini.service";

const router = Router();

// POST /api/gemini/meme-satire
router.post("/meme-satire", async (req, res) => {
  const { templateName, topic } = req.body;
  try {
    const result = await generateMemeSatire(templateName, topic);
    res.json(result);
  } catch (err: any) {
    addLog("AI Compute", `Meme satire failed: ${err.message}`, "ERROR");
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gemini/generate-caption
router.post("/generate-caption", async (req, res) => {
  const { product, tone, platform, language } = req.body;
  try {
    const caption = await generateCaption(product, tone, platform, language);
    res.json({ caption });
  } catch (err: any) {
    addLog("AI Compute", `Caption generation failed: ${err.message}`, "ERROR");
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gemini/ai-coach
router.post("/ai-coach", async (req, res) => {
  const { prompt, mode } = req.body;
  try {
    const insight = await getCoachInsight(prompt, mode);
    res.json({ insight });
  } catch (err: any) {
    addLog("AI Compute", `AI Coach failed: ${err.message}`, "ERROR");
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gemini/generate-image
router.post("/generate-image", async (req, res) => {
  const { prompt, aspectRatio, editingImage, templateUrl } = req.body;
  try {
    const result = await generateImage(prompt, aspectRatio || "1:1", editingImage, templateUrl);
    res.json(result);
  } catch (err: any) {
    addLog("AI Compute", `Image generation failed: ${err.message}`, "ERROR");
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gemini/generate-video
router.post("/generate-video", async (req, res) => {
  const { prompt, aspectRatio } = req.body;
  try {
    const operationName = await startVideoGeneration(prompt, aspectRatio || "16:9");
    res.json({ operationName });
  } catch (err: any) {
    addLog("AI Compute", `Video generation failed: ${err.message}`, "ERROR");
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gemini/video-status
router.post("/video-status", async (req, res) => {
  const { operationName } = req.body;
  if (!operationName) return res.status(400).json({ error: "Missing operationName" });
  try {
    const status = await getVideoStatus(operationName);
    res.json(status);
  } catch (err: any) {
    addLog("AI Compute", `Video status check failed: ${err.message}`, "ERROR");
    res.status(500).json({ error: err.message });
  }
});

// GET|POST /api/gemini/video-download
router.all("/video-download", async (req, res) => {
  const operationName = (req.method === "POST" ? req.body.operationName : req.query.operationName) as string;
  if (!operationName) return res.status(400).json({ error: "Missing operationName" });
  try {
    const { uri, apiKey } = await streamVideoDownload(operationName);
    const videoRes = await fetch(uri, { headers: { "x-goog-api-key": apiKey } });
    res.setHeader("Content-Type", "video/mp4");
    if (videoRes.body) {
      const reader = videoRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      throw new Error("Empty video body from stream");
    }
  } catch (err: any) {
    addLog("AI Compute", `Video download failed: ${err.message}`, "ERROR");
    res.status(500).json({ error: err.message });
  }
});

export default router;
