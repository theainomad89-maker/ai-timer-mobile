import { create } from "zustand";
import type { WorkoutJSON, TimerEvent } from "@/lib/types";

type S = {
  workout: WorkoutJSON | null;
  timeline: TimerEvent[];
  setWorkout: (w: WorkoutJSON, tl: TimerEvent[]) => void;
};

export const useTimerStore = create<S>((set)=>({
  workout: null,
  timeline: [],
  setWorkout: (w, tl) => set({ workout: w, timeline: tl })
}));
