import { z } from "zod";

export const TimelineEvent = z.object({
  kind: z.enum(["work", "rest", "round_rest"]),
  label: z.string(),
  seconds: z.number().int().positive(),
  round: z.number().int().positive()
});

// Internal timeline event for the timer
export const TimerEvent = z.object({
  startMs: z.number().nonnegative(),
  endMs: z.number().positive(),
  label: z.string(),
  blockIndex: z.number().int().nonnegative(),
  round: z.number().int().optional(),
  cueAtMs: z.array(z.number().nonnegative()).optional(),
  kind: z.enum(["work", "rest", "round_rest"]).optional()
});

export const WorkoutJSON = z.object({
  title: z.string(),
  total_seconds: z.number().positive(),
  timeline: z.array(TimelineEvent).min(1),
  debug: z.object({
    used_ai: z.boolean().default(true),
    notes: z.string().optional(),
  }).optional()
});

export type TimelineEvent = z.infer<typeof TimelineEvent>;
export type TimerEvent = z.infer<typeof TimerEvent>;
export type WorkoutJSON = z.infer<typeof WorkoutJSON>;
