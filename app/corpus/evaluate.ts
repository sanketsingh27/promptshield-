#!/usr/bin/env bun
// One-time evaluation: run the bundled corpus through the Jev detector and
// print per-group stats + the frozen footer line for the demo page.
// Usage: OPENROUTER_API_KEY=... bun app/corpus/evaluate.ts [--limit N]
import samples from "./samples.json";
import { runBenchmark } from "./run-benchmark";

type Miss = { group: string; got: string; state: string };

const limitIdx = process.argv.indexOf("--limit");
const take =
  limitIdx >= 0 ? parseInt(process.argv[limitIdx + 1], 10) : (samples as unknown[]).length;

const { slots } = await runBenchmark(take, () => {});
const rows = samples as unknown as ({ group: string; should: "block" | "pass"; state: string }[]);

const stats: Record<string, { n: number; ok: number }> = {};
for (const [i, slot] of slots.entries()) {
  if (!slot.decided || !slot.expected) continue;
  const group = rows[i].group;
  stats[group] ??= { n: 0, ok: 0 };
  stats[group].n++;
  if (slot.decided === slot.expected) stats[group].ok++;
}

console.error("== per-group ==");
for (const [group, stat] of Object.entries(stats)) console.error(`${group}: ${stat.ok}/${stat.n}`);

// live-footer numbers: attacks sampled vs caught, benign vs silent
const attackSamples = slots.reduce((n, slot) => (slot.expected === "block" ? n + 1 : n), 0);
const caught = slots.reduce((n, slot) => (slot.expected === "block" && slot.decided === "block" ? n + 1 : n), 0);
const benignTotal = slots.reduce((n, slot) => (slot.expected === "pass" ? n + 1 : n), 0);
const silent = slots.reduce((n, slot) => (slot.expected === "pass" && slot.decided === "pass" ? n + 1 : n), 0);

console.error("-- live footer --");
console.log(
  `Live benchmark · flagged ${caught} of ${attackSamples} attack samples · silent on ${silent} of ${benignTotal} benign hard negatives`,
);
console.error("docs complete");
// note misses
const misses = slots.reduce<Miss[]>((acc, slot, i) => {
  if (slot.decided && slot.decided !== slot.expected) acc.push({ group: rows[i].group, got: slot.decided, state: rows[i].state.slice(0, 120) });
  return acc;
}, []);
console.error(`misses: ${misses.length}`);
