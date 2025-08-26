import Constants from "expo-constants";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  Constants.expoConfig?.extra?.API_BASE_URL;

export async function generateFromText(text: string) {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not set. Check .env and app.config.js, then restart Expo.");
  }
  
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 60000); // Increased from 15000 to 60000 (60 seconds)
  
  try {
    const r = await fetch(`${API_BASE_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
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
    
    // NEW: Handle timeline format from simplified backend
    if (parsed && Array.isArray(parsed.timeline)) {
      return parsed;
    }
    
    // OLD: Handle legacy blocks format
    if (parsed && typeof parsed.title === "string" && Array.isArray(parsed.blocks)) {
      return parsed;
    }
    
    // Handle AI responses that don't match expected schema
    const converted = convertAIResponse(parsed);
    if (converted) return converted;
    
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

function convertAIResponse(ai: any) {
  try {
    // NEW: Handle timeline format from simplified backend
    if (ai && Array.isArray(ai.timeline)) {
      return ai; // Already in correct format
    }
    
    // Case 1: prior AI shape { type: "INTERVAL", rounds, exercises: [{name,duration_seconds,rest_seconds?}] }
    if (ai?.type === "INTERVAL" && Array.isArray(ai.exercises)) {
      const seq = [] as Array<{ name: string; seconds: number; rest_after_seconds?: number }>; 
      for (const ex of ai.exercises) {
        const name = ex.name || ex.exercise || "Work";
        const secs = ex.duration_seconds || ex.seconds || 30;
        if (/rest/i.test(name)) {
          if (seq.length) seq[seq.length - 1].rest_after_seconds = secs;
          continue;
        }
        seq.push({ name, seconds: secs, rest_after_seconds: ex.rest_seconds || undefined });
      }
      return {
        title: ai.title || "Intervals",
        total_minutes: ai.total_minutes || Math.ceil(((ai.rounds || 10) * seq.reduce((a,b)=>a + b.seconds + (b.rest_after_seconds||0),0)) / 60),
        blocks: [{ type: "INTERVAL", work_seconds: seq[0]?.seconds || 30, rest_seconds: 0, sets: ai.rounds || 10, sequence: seq }],
        cues: { start: true, last_round: true, halfway: true, tts: true },
        debug: { used_ai: true, inferred_mode: "INTERVAL(sequence)", notes: "Converted from AI response" }
      };
    }

    // Case 2: new AI shape { workout_type:"INTERVAL", interval:{ rounds, exercises:[{exercise,duration_seconds}] } }
    if ((ai?.workout_type === "INTERVAL" || ai?.type === "INTERVAL") && ai?.interval?.exercises) {
      const rounds = ai.interval.rounds || ai.rounds || 10;
      const seq = [] as Array<{ name: string; seconds: number; rest_after_seconds?: number }>;
      for (const ex of ai.interval.exercises) {
        const name = ex.name || ex.exercise || "Work";
        const secs = ex.duration_seconds || ex.seconds || 30;
        if (/rest/i.test(name)) {
          if (seq.length) seq[seq.length - 1].rest_after_seconds = secs;
          continue;
        }
        seq.push({ name, seconds: secs });
      }
      return {
        title: ai.title || "Intervals",
        total_minutes: ai.total_minutes || Math.ceil((rounds * seq.reduce((a,b)=>a + b.seconds + (b.rest_after_seconds||0),0)) / 60),
        blocks: [{ type: "INTERVAL", work_seconds: seq[0]?.seconds || 30, rest_seconds: 0, sets: rounds, sequence: seq }],
        cues: { start: true, last_round: true, halfway: true, tts: true },
        debug: { used_ai: true, inferred_mode: "INTERVAL(sequence)", notes: "Converted from AI interval shape" }
      };
    }

    // Case 3: EMOM normalization
    if (/(\bEMOM\b|every\s+minute)/i.test(ai?.title || "") || ai?.type === "EMOM" || ai?.workout_type === "EMOM") {
      const minutes = ai.total_minutes || 20;
      const instr = (ai.exercises || ai.instructions || []).map((e: any) => ({ name: e.name || e.exercise || "Work", target_seconds: e.duration_seconds || e.seconds }))
      return {
        title: ai.title || `${minutes}-min EMOM`,
        total_minutes: minutes,
        blocks: [{ type: "EMOM", minutes, instructions: instr.length ? instr : [{ name: "Work" }] }],
        cues: { start: true, last_round: true, halfway: minutes>=10, tts: true },
        debug: { used_ai: true, inferred_mode: "EMOM", notes: "Converted from AI response" }
      };
    }

    return null;
  } catch {
    return null;
  }
}
