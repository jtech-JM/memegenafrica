import { GoogleGenAI, ThinkingLevel, GenerateVideosOperation } from "@google/genai";
import { config } from "../config";
import { addLog } from "../middleware/logger";

export function getGeminiClient(): GoogleGenAI | null {
  if (!config.gemini.isConfigured()) return null;
  return new GoogleGenAI({
    apiKey: config.gemini.apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });
}

// ── Meme Satire ──────────────────────────────────────────────────────────────

export async function generateMemeSatire(
  templateName: string,
  topic: string
): Promise<{ ideas: Array<{ language: string; caption: string; interpretation: string }> }> {
  const client = getGeminiClient();
  if (!client) throw new Error("GEMINI_API_KEY is required for satire generation.");

  addLog("AI Compute", `Generating meme satire via gemini-3.5-flash. Topic: "${topic}"`);

  const prompt = `You are MemeGen Africa's resident humorist and political satire specialist.
Generate 3 funny, relatable, highly localized African meme captions for the template "${templateName}" about the topic "${topic || "everyday life in East Africa"}".
Return exactly this JSON:
{
  "ideas": [
    { "language": "Swahili|Sheng|English", "caption": "...", "interpretation": "..." }
  ]
}
Reflect real East African context (Matatu, Nairobi traffic, M-Pesa, boda-boda, fuel prices, campus). Be witty and sharp!`;

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: { responseMimeType: "application/json" },
  });

  const parsed = JSON.parse(response.text || "{}");
  addLog("AI Compute", "Meme satire generated successfully.", "SUCCESS");
  return parsed;
}

// ── Smart Caption ─────────────────────────────────────────────────────────────

export async function generateCaption(
  product: string,
  tone: string,
  platform: string,
  language: string
): Promise<string> {
  const client = getGeminiClient();
  if (!client) throw new Error("GEMINI_API_KEY is required for caption generation.");

  addLog("AI Compute", `Generating social caption via gemini-3.5-flash. Platform: ${platform}`);

  const prompt = `You are a professional African social media strategist.
Create a high-engagement, viral-ready post/caption for ${platform || "TikTok"} about "${product}".
Tone: ${tone || "witty/satirical"}. Language: ${language || "Sheng"}.
Include African cultural references, smart hashtags, platform formatting, and a call-to-action. Keep it punchy!`;

  const response = await client.models.generateContent({ model: "gemini-3.5-flash", contents: prompt });
  const caption = response.text || "";
  addLog("AI Compute", "Social caption generated.", "SUCCESS");
  return caption;
}

// ── AI Coach ─────────────────────────────────────────────────────────────────

export async function getCoachInsight(
  prompt: string,
  mode: "fast" | "general" | "thinking"
): Promise<string> {
  const client = getGeminiClient();
  if (!client) throw new Error("GEMINI_API_KEY is required for AI Coach.");

  let modelName = "gemini-3.5-flash";
  const cfg: any = {};

  if (mode === "fast") {
    modelName = "gemini-3.1-flash-lite";
  } else if (mode === "thinking") {
    modelName = "gemini-3.1-pro-preview";
    cfg.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
  }

  addLog("AI Compute", `AI Coach via ${modelName}, mode=${mode}`);
  const response = await client.models.generateContent({ model: modelName, contents: prompt, config: cfg });
  addLog("AI Compute", `AI Coach response generated via ${modelName}.`, "SUCCESS");
  return response.text || "No insights found.";
}

// ── Image Generation ─────────────────────────────────────────────────────────

export function generateLocalVisualFallback(prompt: string, ratio: string): string {
  let width = 800, height = 800;
  if (ratio === "16:9")  { width = 1200; height = 675; }
  else if (ratio === "9:16") { width = 675;  height = 1200; }
  else if (ratio === "4:3")  { width = 1024; height = 768; }
  else if (ratio === "3:4")  { width = 768;  height = 1024; }

  const lower = prompt.toLowerCase();
  let startCol = "#1e293b", endCol = "#0f172a", highlightCol = "#F59E0B", accentCol = "#EF4444", themeName = "Cosmic Savannah";
  if (lower.includes("sunset") || lower.includes("nairobi") || lower.includes("africa")) {
    startCol = "#FF512F"; endCol = "#DD2476"; highlightCol = "#FCD34D"; accentCol = "#FEF08A"; themeName = "African Horizon";
  } else if (lower.includes("tech") || lower.includes("cyber") || lower.includes("future")) {
    startCol = "#00c6ff"; endCol = "#0072ff"; highlightCol = "#10B981"; accentCol = "#34D399"; themeName = "Silicon Savanna";
  } else if (lower.includes("cartoon") || lower.includes("art") || lower.includes("vibrant")) {
    startCol = "#8A2387"; endCol = "#E94057"; highlightCol = "#F27121"; accentCol = "#F472B6"; themeName = "Nairobi Pop-Art";
  } else if (lower.includes("green") || lower.includes("forest") || lower.includes("savanna")) {
    startCol = "#11998e"; endCol = "#38ef7d"; highlightCol = "#FCD34D"; accentCol = "#A7F3D0"; themeName = "Verdant Highlands";
  }

  const cx = width / 2, cy = height / 2 - 40;
  const safeTitle = prompt.replace(/[<>&'"]/g, c =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] || c
  );
  const words = safeTitle.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).length > 32) { lines.push(cur.trim()); cur = w; }
    else cur += " " + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  const dl = lines.slice(0, 3);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${startCol};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${endCol};stop-opacity:1"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:${highlightCol};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${accentCol};stop-opacity:0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="${Math.min(width, height) * 0.32}" fill="url(#glow)" opacity="0.4"/>
  <circle cx="${cx}" cy="${cy}" r="${Math.min(width, height) * 0.22}" fill="${highlightCol}" opacity="0.85"/>
  <path d="M0,${height-120} Q${width*.25},${height-240} ${width*.5},${height-150} T${width},${height-180} L${width},${height} L0,${height} Z" fill="rgba(0,0,0,0.35)"/>
  <path d="M0,${height-80} Q${width*.35},${height-160} ${width*.7},${height-110} T${width},${height-130} L${width},${height} L0,${height} Z" fill="rgba(0,0,0,0.55)"/>
  <rect x="20" y="20" width="${width-40}" height="${height-40}" fill="none" stroke="rgba(255,193,7,0.4)" stroke-width="4" rx="12"/>
  <text x="${cx}" y="55" font-family="sans-serif" font-size="11" font-weight="900" fill="${highlightCol}" text-anchor="middle" letter-spacing="2">${themeName.toUpperCase()} · PREVIEW</text>
  <rect x="40" y="${height-210}" width="${width-80}" height="140" fill="rgba(15,23,42,0.85)" rx="14" stroke="rgba(255,193,7,0.2)" stroke-width="1.5"/>
  <text x="60" y="${height-175}" font-family="sans-serif" font-size="10" font-weight="bold" fill="${highlightCol}" letter-spacing="3">STUDIO PREVIEW</text>
  ${dl.map((line, i) => `<text x="60" y="${height-145+(i*28)}" font-family="sans-serif" font-size="18" font-weight="800" fill="#FFF">${line}</text>`).join("\n")}
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg.trim()).toString("base64")}`;
}

export async function generateImage(
  prompt: string,
  ratio: string,
  editingImageBase64?: string,
  templateUrl?: string
): Promise<{ imageUrl: string; fallback?: boolean }> {
  const client = getGeminiClient();
  if (!client) throw new Error("GEMINI_API_KEY is required for image generation.");

  addLog("AI Compute", `Image generation requested. Ratio: ${ratio}, mode: ${editingImageBase64 ? "edit-upload" : templateUrl ? "edit-template" : "generate"}`);

  const parts: any[] = [];
  let activeBase64 = editingImageBase64;

  if (templateUrl && !activeBase64) {
    try {
      const imgRes = await fetch(templateUrl);
      activeBase64 = Buffer.from(await imgRes.arrayBuffer()).toString("base64");
    } catch (e: any) {
      addLog("AI Compute", `Could not fetch template image: ${e.message}`, "WARN");
    }
  }

  if (activeBase64) {
    parts.push({ inlineData: { data: activeBase64.replace(/^data:image\/\w+;base64,/, ""), mimeType: "image/png" } });
  }
  parts.push({ text: prompt + (editingImageBase64 ? " (Edit the provided image to match this description exactly)" : "") });

  // Try gemini-3.1-flash-image first, cascade to 2.5
  for (const model of ["gemini-3.1-flash-image", "gemini-2.5-flash-image"]) {
    try {
      addLog("AI Compute", `Trying ${model}...`);
      const response = await client.models.generateContent({
        model,
        contents: { parts },
        config: { imageConfig: { aspectRatio: ratio, ...(model === "gemini-3.1-flash-image" ? { imageSize: "1K" } : {}) } },
      });
      const candidates = response.candidates || [];
      for (const part of candidates[0]?.content?.parts || []) {
        if (part.inlineData) {
          addLog("AI Compute", `Image generated by ${model}.`, "SUCCESS");
          return { imageUrl: `data:image/png;base64,${part.inlineData.data}` };
        }
      }
      addLog("AI Compute", `${model} returned no inlineData. Cascading...`, "WARN");
    } catch (e: any) {
      addLog("AI Compute", `${model} failed: ${e.message}. Cascading...`, "WARN");
    }
  }

  // SVG fallback
  const fallbackUrl = generateLocalVisualFallback(prompt, ratio);
  addLog("AI Compute", "Served SVG visual fallback.", "SUCCESS");
  return { imageUrl: fallbackUrl, fallback: true };
}

// ── Video Generation ──────────────────────────────────────────────────────────

export async function startVideoGeneration(
  prompt: string,
  aspectRatio: string
): Promise<string> {
  const client = getGeminiClient();
  if (!client) throw new Error("GEMINI_API_KEY is required for video generation.");

  addLog("AI Compute", `Starting Veo 3 video. Prompt: "${prompt}", Ratio: ${aspectRatio}`);
  const operation = await client.models.generateVideos({
    model: "veo-3.1-lite-generate-preview",
    prompt,
    config: { numberOfVideos: 1, resolution: "720p", aspectRatio },
  });
  addLog("AI Compute", `Video operation started: ${operation.name}`, "SUCCESS");
  return operation.name as string;
}

export async function getVideoStatus(operationName: string): Promise<{ done: boolean }> {
  const client = getGeminiClient();
  if (!client) throw new Error("GEMINI_API_KEY is required.");

  const op = new GenerateVideosOperation();
  op.name = operationName;
  const updated = await client.operations.getVideosOperation({ operation: op });
  addLog("AI Compute", `Video status for ${operationName}: done=${updated.done}`);
  return { done: !!updated.done };
}

export async function streamVideoDownload(
  operationName: string
): Promise<{ uri: string; apiKey: string }> {
  const client = getGeminiClient();
  if (!client) throw new Error("GEMINI_API_KEY is required.");

  const op = new GenerateVideosOperation();
  op.name = operationName;
  const updated = await client.operations.getVideosOperation({ operation: op });
  const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
  if (!uri) throw new Error("Video URI not available yet.");
  return { uri, apiKey: config.gemini.apiKey };
}
