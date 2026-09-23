// Shared corpus benchmark runner. Used by the CLI (app/corpus/evaluate.ts)
// and the live benchmark API route (app/api/benchmark/route.ts).

import { screenText } from "../screening";
import samples from "./samples.json";

type Row = {
  group: string;
  src: string;
  should: "block" | "pass";
  state: string;
  trigger?: string[];
  category?: string;
};

export type BenchmarkProgress = {
  done: number;
  total: number;
  attackSamples: number;
  caught: number;
  benignTotal: number;
  silent: number;
};

type Slot = { decided?: string; expected?: string };

// Locked app-code verdict rule; must stay in lockstep with `rule()` in app/page.tsx.
async function decide(row: Row, index: number) {
  const res = await screenText(row.state);
  const noul: number = res.noul;
  if (noul >= 0.8) return { decided: "block" as const, expected: row.should as "block" | "pass", index };
  if (noul < 0.5) return { decided: "pass" as const, expected: row.should as "block" | "pass", index };
  return { decided: "pass" as const, expected: row.should as "block" | "pass", index };
}

function progressOf(slots: Slot[]): BenchmarkProgress {
  const total = slots.length;
  const attackSamples = slots.reduce((n, slot) => (slot.expected === "block" ? n + 1 : n), 0);
  const caught = slots.reduce((n, slot) => (slot.expected === "block" && slot.decided === "block" ? n + 1 : n), 0);
  const benignTotal = slots.reduce((n, slot) => (slot.expected === "pass" ? n + 1 : n), 0);
  const silent = slots.reduce((n, slot) => (slot.expected === "pass" && slot.decided === "pass" ? n + 1 : n), 0);
  const done = slots.filter((slot) => slot.decided || slot.expected).length;
  return { done, total, attackSamples, caught, benignTotal, silent };
}

// 8-lane async pool over the corpus; emits progress after each completed row.
export async function runBenchmark(
  limit: number,
  onProgress: (p: BenchmarkProgress) => void,
): Promise<{ slots: Slot[]; rows: Row[] }> {
  const rows = (samples as unknown as Row[]).slice(0, limit);
  const slots: Slot[] = rows.map(() => ({}));
  let cursor = 0;
  const lanes = Array.from({ length: 8 }, async () => {
    for (;;) {
      const i = cursor++;
      if (i >= rows.length) return;
      try {
        const { decided, expected, index } = await decide(rows[i], i);
        slots[index] = { decided, expected };
      } catch {
        // row failed upstream: leave its slot undetermined; stats skip it
      }
      onProgress(progressOf(slots));
    }
  });
  await Promise.all(lanes);
  return { slots, rows };
}
