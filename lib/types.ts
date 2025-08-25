import { z } from "zod";

export const CueSettings = z.object({
  start: z.boolean().default(true),
  halfway: z.boolean().default(false),
  last_round: z.boolean().default(true),
  tts: z.boolean().default(true),
});
export type CueSettings = z.infer<typeof CueSettings>;

const BaseBlock = z.object({
  type: z.enum(["EMOM", "INTERVAL", "CIRCUIT", "TABATA"]),
  title: z.string().optional(),
  notes: z.string().optional(),
});

export const EMOMBlock = BaseBlock.extend({
  type: z.literal("EMOM"),
  minutes: z.number().int().positive(),
  instructions: z.array(z.object({
    minute_mod: z.enum(["odd","even"]).optional(),
    name: z.string(),
    target_reps: z.number().int().positive().optional(),
    target_seconds: z.number().int().positive().optional(),
    cap_seconds: z.number().int().positive().optional(),
  })).min(1),
});

export const IntervalBlock = BaseBlock.extend({
  type: z.literal("INTERVAL"),
  work_seconds: z.number().int().positive(),
  rest_seconds: z.number().int().nonnegative().default(0),
  sets: z.number().int().positive(),
  exercises: z.array(z.object({
    name: z.string(),
    seconds: z.number().int().positive().optional(),
    reps: z.number().int().positive().optional(),
  })).optional(),
});

export const CircuitBlock = BaseBlock.extend({
  type: z.literal("CIRCUIT"),
  rounds: z.number().int().positive(),
  exercises: z.array(z.object({
    name: z.string(),
    seconds: z.number().int().positive().optional(),
    reps: z.number().int().positive().optional(),
    rest_after_seconds: z.number().int().nonnegative().optional(),
  })).min(1),
  rest_between_rounds_seconds: z.number().int().nonnegative().default(0),
});

export const TabataBlock = BaseBlock.extend({
  type: z.literal("TABATA"),
  rounds: z.number().int().positive().default(8),
  work_seconds: z.number().int().positive().default(20),
  rest_seconds: z.number().int().positive().default(10),
  exercise: z.string().default("Mixed"),
});

export const WorkoutBlock = z.discriminatedUnion("type", [
  EMOMBlock, IntervalBlock, CircuitBlock, TabataBlock
]);

export const WorkoutJSON = z.object({
  title: z.string(),
  total_minutes: z.number().positive(),
  blocks: z.array(WorkoutBlock).min(1),
  cues: CueSettings.default({ start:true, halfway:false, last_round:true, tts:true })
});
export type WorkoutJSON = z.infer<typeof WorkoutJSON>;

export const TimelineEvent = z.object({
  startMs: z.number().nonnegative(),
  endMs: z.number().positive(),
  label: z.string(),
  blockIndex: z.number().int().nonnegative(),
  round: z.number().int().optional(),
  cueAtMs: z.array(z.number().nonnegative()).optional(),
});
export type TimelineEvent = z.infer<typeof TimelineEvent>;
