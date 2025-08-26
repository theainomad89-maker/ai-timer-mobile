import { TimelineItem, WorkoutJSON } from "./types";

// Simple pass-through + helpers (no inference)
export function computeTotalSeconds(items: TimelineItem[]): number {
  return items.reduce((total, item) => total + item.seconds, 0);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Convert timeline items to timer events (for backward compatibility)
export function buildTimeline(w: WorkoutJSON): TimelineEvent[] {
  // If we already have a timeline, convert it to events
  if (w.timeline && Array.isArray(w.timeline)) {
    const events: TimelineEvent[] = [];
    let cursor = 0;
    
    w.timeline.forEach((item, index) => {
      const start = cursor;
      const end = cursor + (item.seconds * 1000);
      
      events.push({
        startMs: start,
        endMs: end,
        label: item.label,
        blockIndex: 0, // Single block now
        round: item.round,
        cueAtMs: [start, end - 5000] // 5 second warning
      });
      
      cursor = end;
    });
    
    return events;
  }

  // Legacy: Handle old block-based format (for backward compatibility)
  if (w.blocks && Array.isArray(w.blocks)) {
    const events: TimelineEvent[] = [];
    let cursor = 0;
    
    w.blocks.forEach((b, bi) => {
      if (b.type === "EMOM") {
        for (let m = 0; m < b.minutes; m++) {
          const instr = b.instructions.find(i =>
            (i.minute_mod === "odd" && (m+1)%2===1) ||
            (i.minute_mod === "even" && (m+1)%2===0)
          ) ?? b.instructions[0];

          const start = cursor;
          const end = cursor + 60_000;
          events.push({
            startMs: start,
            endMs: end,
            label: `M${m+1}: ${instr.name}`,
            blockIndex: bi,
            round: m+1,
            cueAtMs: [start, end - 5_000]
          });
          cursor = end;
        }
      } else if (b.type === "INTERVAL" && b.sequence?.length) {
        for (let s = 1; s <= b.sets; s++) {
          for (const step of b.sequence) {
            const start = cursor, end = cursor + step.seconds*1000;
            events.push({ 
              startMs: start, 
              endMs: end, 
              label: `${step.name} (${s}/${b.sets})`, 
              blockIndex: bi, 
              round: s, 
              cueAtMs: [start, end-5_000] 
            });
            cursor = end;
            if (step.rest_after_seconds) {
              const rs = cursor, re = cursor + step.rest_after_seconds*1000;
              events.push({ startMs: rs, endMs: re, label: `Rest (${s}/${b.sets})`, blockIndex: bi, round: s });
              cursor = re;
            }
          }
        }
      } else if (b.type === "INTERVAL") {
        for (let s = 1; s <= b.sets; s++) {
          const workStart = cursor;
          const workEnd = cursor + (b.work_seconds * 1000);
          events.push({ startMs: workStart, endMs: workEnd, label: `Work ${s}/${b.sets}` , blockIndex: bi, round: s, cueAtMs:[workStart, workEnd-5_000]});
          cursor = workEnd;
          if (b.rest_seconds > 0 && s < b.sets) {
            const restStart = cursor;
            const restEnd = cursor + (b.rest_seconds * 1000);
            events.push({ startMs: restStart, endMs: restEnd, label: `Rest ${s}/${b.sets}`, blockIndex: bi, round: s });
            cursor = restEnd;
          }
        }
      } else if (b.type === "CIRCUIT") {
        for (let r = 1; r <= b.rounds; r++) {
          for (const ex of b.exercises) {
            const dur = (ex.seconds ?? 30) * 1000;
            const start = cursor, end = cursor + dur;
            events.push({ startMs: start, endMs: end, label: `${ex.name} (R${r}/${b.rounds})`, blockIndex: bi, round: r, cueAtMs:[start, end-5_000] });
            cursor = end;
            if (ex.rest_after_seconds) {
              const rs = cursor, re = cursor + ex.rest_after_seconds*1000;
              events.push({ startMs: rs, endMs: re, label: "Rest", blockIndex: bi, round: r });
              cursor = re;
            }
          }
          if (b.rest_between_rounds_seconds && r < b.rounds) {
            const rs = cursor, re = cursor + b.rest_between_rounds_seconds*1000;
            events.push({ startMs: rs, endMs: re, label: "Between-round rest", blockIndex: bi, round: r });
            cursor = re;
          }
        }
      } else if (b.type === "TABATA") {
        for (let r = 1; r <= b.rounds; r++) {
          const ws = cursor, we = cursor + b.work_seconds*1000;
          events.push({ startMs: ws, endMs: we, label: `${b.exercise} (Work ${r}/${b.rounds})`, blockIndex: bi, round: r, cueAtMs:[ws, we-5_000] });
          cursor = we;
          const rs = cursor, re = cursor + b.rest_seconds*1000;
          if (r < b.rounds) events.push({ startMs: rs, endMs: re, label: `Rest ${r}/${b.rounds})`, blockIndex: bi, round: r });
          cursor = re;
        }
      }
    });
    
    return events;
  }

  // Fallback: return empty timeline
  return [];
}

// Legacy TimelineEvent type for backward compatibility
export type TimelineEvent = {
  startMs: number;
  endMs: number;
  label: string;
  blockIndex: number;
  round?: number;
  cueAtMs?: number[];
};
