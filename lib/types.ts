import { z } from "zod";

export type TimelineKind = 
  | 'prep'
  | 'work' 
  | 'rest'
  | 'round_rest'
  | 'cooldown';

export type TimelineItem = {
  kind: TimelineKind;
  label: string;        // e.g. "Run", "Rest", "Between-round rest"
  seconds: number;      // integer seconds
  round?: number;       // 1-based
  index?: number;       // position within the round, 1-based
};

export type WorkoutJSON = {
  title: string;
  timeline: TimelineItem[];   // <-- authoritative
  total_seconds?: number;     // server may include; client still recomputes
  blocks?: unknown;           // optional: keep if you want
  debug?: Record<string, any>;
};

// Zod schemas
export const TimelineItemSchema = z.object({
  kind: z.enum(['prep','work','rest','round_rest','cooldown']),
  label: z.string(),
  seconds: z.number().int().positive(),
  round: z.number().int().positive().optional(),
  index: z.number().int().positive().optional(),
});

export const WorkoutJSONSchema = z.object({
  title: z.string(),
  timeline: z.array(TimelineItemSchema).min(1),
  total_seconds: z.number().int().positive().optional(),
  blocks: z.any().optional(),
  debug: z.record(z.any()).optional(),
});

// Legacy types for backward compatibility (can remove later)
export const CueSettings = z.object({
  start: z.boolean().default(true),
  halfway: z.boolean().default(false),
  last_round: z.boolean().default(true),
  tts: z.boolean().default(true),
});

export type CueSettings = z.infer<typeof CueSettings>;

// Export the new types as the primary ones
export type { TimelineItem, WorkoutJSON };
export { TimelineItemSchema, WorkoutJSONSchema };
