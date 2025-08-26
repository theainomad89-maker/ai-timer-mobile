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

// Legacy TimelineEvent type for backward compatibility
export type TimelineEvent = {
  startMs: number;
  endMs: number;
  label: string;
  blockIndex: number;
  round?: number;
  cueAtMs?: number[];
};
