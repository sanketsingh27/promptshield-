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
  row?: {
    i: number;
    prompt: string;
    decided: string;
    expected: string;
    group: string;
    src: string;
    category: string;
    hit: boolean;
  };
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

// Full-batch waves: fire every prompt in a chunk concurrently, then await the
// chunk before starting the next. Fastest possible turn given the Decisions
// API takes one state per request.
const BATCH = 24;

export async function runBenchmark(
  limit: number,
  onProgress: (p: BenchmarkProgress) => void,
): Promise<{ slots: Slot[]; rows: Row[] }> {
  const rows = (samples as unknown as Row[]).slice(0, limit);
  const slots: Slot[] = rows.map(() => ({}));

  for (let start = 0; start < rows.length; start += BATCH) {
    const rowsIn = rows.slice(start, start + BATCH).map((row, k) => ({ row, index: start + k }));
    const settled = await Promise.all(
      rowsIn.map(async ({ row, index }) => {
        try {
          const { decided, expected } = await decide(row, index);
          slots[index] = { decided, expected };
          return { index, decided };
        } catch {
          return null; // row failed upstream: slot undetermined; stats skip it
        }
      }),
    );
    for (const spot of settled) {
      if (!spot) continue;
      onProgress({
        ...progressOf(slots),
        row: {
          i: spot.index,
          prompt: rows[spot.index].state.slice(0, 200),
          decided: spot.decided,
          expected: slots[spot.index].expected ?? "",
          group: rows[spot.index].group,
          src: rows[spot.index].src,
          category: rows[spot.index].category ?? "",
          hit: spot.decided === slots[spot.index].expected,
        },
      });
    }
  }
  return { slots, rows };
}
