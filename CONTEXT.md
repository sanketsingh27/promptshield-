# PromptShield Demo

A demo web app that screens prompts before they reach an LLM, using TypeSafe's Jev model to detect prompt injection and showing the user a verdict.

## Language

**Attempt**: A prompt (or conversation containing one) submitted to the detector to test whether it smuggles instructions.
_Avoid_: payload, query, message (vague — reserve "message" for a single turn of a conversation)

**Verdict**: The detector's user-facing outcome for an Attempt: Blocked, Passed, or Unclear.
_Avoid_: prediction, decision, classification

**Blocked**: The Verdict meaning an injection was detected — the prompt would be stopped before reaching the LLM.

**Passed**: The Verdict meaning no injection was detected — the prompt would reach the LLM.

**Unclear**: The Verdict between Blocked and Passed, when p(injection) falls in the 0.5–0.8 gray band; always displays the raw probability.

**In-conversation injection**: An injection Attempt where the malicious instruction is buried inside a wider conversation transcript, not the latest message.

**Benign hard negative**: A harmless prompt phrased with injection-trigger vocabulary; Classified as Passed, used to show the detector doesn't over-trigger.

**Corpus**: The small bundled, attributed set of sample Attempts (attacks + benign hard negatives) shipped in the repo for one-click demo playback and a one-time static benchmark.

**Static benchmark line**: The frozen aggregate footer on the demo page ("flagged X of Y attacks, clean on Z of W benign"), computed once at corpus curation and never traffic-dependent.
_Avoid_: live stats, session counter
