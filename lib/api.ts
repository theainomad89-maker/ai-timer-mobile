import Constants from "expo-constants";

const API_BASE_URL = process.env.API_BASE_URL || Constants.expoConfig?.extra?.API_BASE_URL;

export async function generateFromText(text: string) {
  const r = await fetch(`${API_BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  const j = await r.json();
  if (!r.ok || !j.ok) throw new Error(j.error || "Generate failed");
  return j.data as any;
}
