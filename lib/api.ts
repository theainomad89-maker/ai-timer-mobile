import Constants from "expo-constants";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  Constants.expoConfig?.extra?.API_BASE_URL;

export async function generateFromText(
  text: string, 
  user: { level: "beginner" | "intermediate" | "advanced" } = { level: "beginner" }
) {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not set. Check .env and app.config.js, then restart Expo.");
  }
  
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  
  try {
    const r = await fetch(`${API_BASE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, user }),
      signal: controller.signal,
    });
    
    if (!r.ok) throw new Error(`API ${r.status}: ${r.statusText}`);
    
    const j = await r.json().catch(() => ({ ok: false, error: "Invalid JSON from server" }));
    if (!j.ok) throw new Error(j.error || `Request failed (${r.status})`);
    
    return j; // already a WorkoutJSON with debug
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("Request timed out. Check network and API URL.");
    throw e;
  } finally {
    clearTimeout(t);
  }
}
