import { create } from "zustand";
import type { WorkoutJSON, TimelineEvent } from "@/lib/types";

type S = {
  workout: WorkoutJSON | null;
  timeline: TimelineEvent[];
  setWorkout: (w: WorkoutJSON, tl: TimelineEvent[]) => void;
};

export const useTimerStore = create<S>((set)=>({
  workout: null,
  timeline: [],
  setWorkout: (w, tl) => set({ workout: w, timeline: tl })
}));
