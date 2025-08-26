import { TimelineEvent, TimerEvent, WorkoutJSON } from "./types";

export function buildTimeline(w: WorkoutJSON): TimerEvent[] {
  // The AI now provides the timeline directly, so we just need to convert it to our internal format
  const events: TimerEvent[] = [];
  let cursor = 0;

  w.timeline.forEach((event, index) => {
    const start = cursor;
    const end = cursor + event.seconds * 1000;
    
    events.push({
      startMs: start,
      endMs: end,
      label: event.label,
      blockIndex: 0, // All events are in one block now
      round: event.round,
      cueAtMs: [start, end - 5_000], // Cue 5 seconds before end
      kind: event.kind // Keep the kind for UI styling
    });
    
    cursor = end;
  });

  return events;
}

export function msToClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms/1000));
  const m = Math.floor(s/60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2,"0")}`;
}
