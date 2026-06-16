export type SatireIdea = { language: string; caption: string; interpretation: string };

export async function generateMemeSatire(
  templateName: string,
  topic: string
): Promise<{ ideas: SatireIdea[]; fallback?: boolean }> {
  const res = await fetch("/api/gemini/meme-satire", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateName, topic }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Satire generation failed.");
  return data;
}

export async function generateCaption(payload: {
  product: string;
  tone: string;
  platform: string;
  language: string;
}): Promise<string> {
  const res = await fetch("/api/gemini/generate-caption", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Caption generation failed.");
  return data.caption;
}

export async function getCoachInsight(
  prompt: string,
  mode: "fast" | "general" | "thinking"
): Promise<string> {
  const res = await fetch("/api/gemini/ai-coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, mode }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Coach request failed.");
  return data.insight;
}

export async function generateImage(payload: {
  prompt: string;
  aspectRatio: string;
  editingImage?: string;
  templateUrl?: string;
}): Promise<{ imageUrl: string; fallback?: boolean }> {
  const res = await fetch("/api/gemini/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Image generation failed.");
  return data;
}

export async function startVideoGeneration(
  prompt: string,
  aspectRatio: string
): Promise<string> {
  const res = await fetch("/api/gemini/generate-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Video generation failed.");
  return data.operationName;
}

export async function checkVideoStatus(operationName: string): Promise<{ done: boolean }> {
  const res = await fetch("/api/gemini/video-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operationName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Video status check failed.");
  return data;
}
