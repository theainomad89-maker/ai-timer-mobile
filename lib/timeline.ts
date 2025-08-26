import { TimelineEvent, WorkoutJSON } from "./types";

export function buildTimeline(w: WorkoutJSON): TimelineEvent[] {
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
    }

    else if (b.type === "INTERVAL" && b.sequence?.length) {
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
    }

    else if (b.type === "INTERVAL") {
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
    }

    if (b.type === "CIRCUIT") {
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
    }

    if (b.type === "TABATA") {
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

export function msToClock(ms: number) {
  const s = Math.max(0, Math.ceil(ms/1000));
  const m = Math.floor(s/60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2,"0")}`;
}
