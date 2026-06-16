import { User } from "../types";

export async function registerUser(email: string, phone_number: string): Promise<User> {
  const res = await fetch("/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), phone_number }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed.");
  return data.user as User;
}

export async function loginUser(email: string): Promise<User> {
  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed.");
  return data.user as User;
}

/**
 * Validates that a stored user_id still exists in the database.
 * Returns false if the session is stale (user deleted / DB reset).
 */
export async function validateSession(user_id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/users/validate?user_id=${encodeURIComponent(user_id)}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}
