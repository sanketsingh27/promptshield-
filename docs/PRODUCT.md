# PromptShield Demo

## Register
product

## Users
developers and LLM-curious visitors evaluating TypeSafe's Jev ("System One" decision model) by attempting to bypass a prompt-injection detector; most arrive knowing nothing about jailbreak techniques and learn through one-click sample attempts plus their own input.

## Product Purpose
A live, public demo app that screens prompts before they reach an LLM. Users paste or load a prompt, Jev classifies it (is_prompt_injection Noul + technique Choice + severity Score per prompt), and the verdict (Blocked / Passed / Unclear) renders with the raw probability. The strategic goal is showcasing Jev's speed (70–500ms), calibrated confidence, and zero-hallucination decisions through adversarial interaction, not building a production guardrail service.

## Tone
Terminal-native, precise, honest. Numbers over adjectives. Developer-tool literacy assumed (Linear/Vercel/Resend tier). The interface conveys trust by showing raw probabilities and threshold gates rather than hiding uncertainty; "Unclear" states are presented honestly, not smoothed over.

## Anti-references
Purple-glow AI slop, glassmorphism dashboards, gradient headlines, dark-mode-terminal-as-costume with neon everywhere, surgical-marketing clichés ("Elevate", "Seamless", "Unleash"), hero-metric templates.

## Strategic principles
- Decisions render, research doesn't lecture: every pixel earns its place by making the Jev verdict legible.
- In-conversation injections deserve first-class treatment since Jev's stateless design makes transcripts trivial to screen.
- Corpus-fuel claims (static benchmark footer) are frozen, reproducible, and honest: never inflated by live traffic.
