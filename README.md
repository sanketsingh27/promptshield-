# PromptShield

A live demo of [Jev](https://docs.typesafe.ai) ("System One", `typesafe/jev-1.13`): a pre-flight prompt-injection detector. Paste a prompt, get a decision — **Blocked** / **Passed** / **Unclear** — with the raw probability, before it ever reaches an LLM.

## What you can do with Jev in this repo

The detector is one call: send a prompt (`state`) to the OpenRouter Decisions API, ask one typed question — `is_prompt_injection` (a Noul probability, 0–1) — and gate it. Everything downstream composes on that primitive:

- **Single-prompt screening** — paste an attempt, get a verdict + probability instantly (70–500 ms typical). Rule: `p ≥ 0.8` → **Blocked**, `p < 0.5` → **Passed**, gray band → **Unclear** (raw probability always shown).
- **Transcript / in-conversation screening** — Jev's stateless design means you can screen a full conversation transcript as one `state`, not just the last message. The bundled samples include 20 in-conversation attacks for exactly this.
- **Adversarial attack red-teaming** — try direct overrides, role hijacks, key/secret extraction, role-play bypasses, or in-conversation injections against the detector yourself; verdicts render per attempt.
- **Benign hard-negative tolerance** — the corpus ships 339 NotInject benign prompts phrased with attack vocabulary; the live benchmark and CLI eval both check the detector doesn't over-block on them.
- **Live streaming corpus benchmark** — run the 399-row corpus (60 TensorTrust attacks + 339 benign hard negatives, incl. 20 in-conversation) through the detector in concurrent waves of 24 and watch each decision stream in, mismatches tagged as misses.
- **One-time static evaluation** — `bun app/corpus/evaluate.ts` walks the whole corpus offline and prints per-group accuracy plus the frozen footer line used on the page.

## How it works

- **Inspect** (`/api/inspect` → `app/screening.ts`): one OpenRouter Decisions API call per prompt, asking a single typed question `is_prompt_injection` (0–1 probability, "noul" type). The verdict rule is app-locked: `≥ 0.8` block, `< 0.5` pass, gray band in between.
- **Live benchmark** (`/api/benchmark`): streams the bundled corpus (399 rows: 60 TensorTrust attacks, 339 NotInject benign hard negatives) through the same detector. Requests fire in concurrent waves of 24 — the Decisions API takes one state per request, so parallelism is the fastest legal batch. Each row's decision streams to the UI in the `benchmark.log` panel, with amber `miss` tags where the decision disagrees with ground truth.
- **CLI evaluation** (`bun app/corpus/evaluate.ts [--limit N]`): same runner, prints per-group accuracy plus the frozen footer line used on the page. Both entry points share `app/corpus/run-benchmark.ts` and `app/screening.ts`.

The corpus is bundled in `app/corpus/samples.json` with source attribution; no database, no sessions.

## Running locally

```bash
bun install

# required: OpenRouter key for the Decisions API
echo 'OPENROUTER_API_KEY=sk-or-...' > .env

bun run dev          # http://localhost:3000
bun run build        # production build (verified passing)
```

## Environment

| variable            | required | notes                                        |
| ------------------- | -------- | -------------------------------------------- |
| `OPENROUTER_API_KEY`| yes      | OpenRouter API key; screening fails without it |

## Stack

Next.js (App Router, React 19), Tailwind 4, Bun. Terminal-native dark UI; design tokens in `docs/DESIGN.md`, product context in `docs/PRODUCT.md`.
