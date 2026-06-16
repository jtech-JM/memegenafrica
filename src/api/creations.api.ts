export type Creation = {
  creation_id: string;
  user_id: string;
  type: string;
  prompt: string | null;
  caption: string | null;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
};

export async function fetchCreations(user_id: string): Promise<Creation[]> {
  const res = await fetch(`/api/creations?user_id=${user_id}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.creations || [];
}

export async function saveCreation(payload: {
  user_id: string;
  type: string;
  prompt?: string;
  caption?: string;
  image_url?: string;
  video_url?: string;
}): Promise<Creation | null> {
  const res = await fetch("/api/creations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) return null;
  return data.creation;
}
