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
    
    const raw = await r.text();
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch {
      throw new Error("Invalid JSON from server");
    }

    // Accept both shapes: { ok:true, data: {...} } OR direct WorkoutJSON
    if (parsed && parsed.ok === true && parsed.data) {
      return parsed.data;
    }
    if (parsed && typeof parsed.title === "string" && Array.isArray(parsed.blocks)) {
      return parsed;
    }
    
    // Handle AI responses that don't match expected schema
    if (parsed && parsed.debug?.used_ai && parsed.type) {
      // Convert AI response to WorkoutJSON format
      const converted = convertAIResponse(parsed);
      if (converted) return converted;
    }
    
    if (parsed && parsed.ok === false) {
      throw new Error(parsed.error || "Server reported failure");
    }
    throw new Error("Unexpected server response shape");
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("Request timed out. Check network and API URL.");
    throw e;
  } finally {
    clearTimeout(t);
  }
}

function convertAIResponse(aiResponse: any) {
  try {
    if (aiResponse.type === "INTERVAL" && aiResponse.exercises) {
      // Convert AI interval format to WorkoutJSON
      return {
        title: aiResponse.title,
        total_minutes: aiResponse.total_minutes,
        blocks: [{
          type: "INTERVAL",
          work_seconds: aiResponse.exercises[0]?.duration_seconds || 30,
          rest_seconds: aiResponse.exercises[0]?.rest_seconds || 15,
          sets: aiResponse.rounds || 10,
          sequence: aiResponse.exercises.map((ex: any) => ({
            name: ex.name,
            seconds: ex.duration_seconds,
            rest_after_seconds: ex.rest_seconds
          }))
        }],
        cues: { start: true, last_round: true, halfway: true, tts: true },
        debug: { used_ai: true, inferred_mode: "INTERVAL(sequence)", notes: "Converted from AI response" }
      };
    }
    
    if (aiResponse.type === "EMOM") {
      return {
        title: aiResponse.title,
        total_minutes: aiResponse.total_minutes,
        blocks: [{
          type: "EMOM",
          minutes: aiResponse.total_minutes,
          instructions: aiResponse.exercises?.map((ex: any) => ({
            name: ex.name,
            target_seconds: ex.duration_seconds
          })) || [{ name: "Work" }]
        }],
        cues: { start: true, last_round: true, halfway: true, tts: true },
        debug: { used_ai: true, inferred_mode: "EMOM", notes: "Converted from AI response" }
      };
    }
    
    return null;
  } catch {
    return null;
  }
}
