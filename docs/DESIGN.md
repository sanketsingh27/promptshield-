# PromptShield DESIGN.md

## Theme discipline
Scene: a developer in a dim room / code editor tab, scrutinizing a security verdict, at any hour. Terminal-native dark is the honest setting: the surface reads like middleware output, so dark is forced by the scene, not by category reflex.

## Color (OKLCH, tinted toward violet hue 280)
| role | token | value |
|---|---|---|
| canvas | --void | neutral black tinted to violet, currently #000000 (flag: re-tint to ~#0a0a0b to satisfy tinted-neutral law) |
| hairline borders | --hairline | #292d30 graphne, slightly violet-tinted |
| primary text | --bone | #f0f0f0 |
| muted text | --ash | #a1a4a5; --smoke #abafb4 tertiary |
| disabled / low-emphasis | --iron | #6e727a |
| accent (code + developer strings only) | --violet | #9281f7, --violet-glow #baa7ff |
| success | --green | #3ad389 |
| blocking | --red | #ff9592 |
| ambiguous / unclear | --amber | #ffca16 |

Strategy: Restrained. One accent (violet) ≤10% of surface, used for code-role strings, caret, and one periodic 1px light sweep. Status colors reserved exclusively for verdict semantics.

## Typography
- Geist (sans) for UI copy, Geist Mono for anything terminal/developer-flavored: value pairing from the product ban on serif + the terminal-native identity
- tighter scale ratio, fixed rem sizes (no clamp for product UI)
- mono for: wordmark, chips, stat column, inspect command, output block, benchmark footer
- sans for: h1 (42px, -0.045em, 600), body hints

## Elevation
1px hairline borders against the void; no drop shadows. The single "elevation" moment is block-horizontal light (a 1px violet sheen traversing the terminal's top border).

## Components
- ghost button (1px hairline border, transparent bg, hover raises border toward violet + 6% violet wash; active pushes down 1px)
- chip leader (mono 12px, 1px hairline, semantic dot red=attack/green=benign)
- terminal window (traffic dots, filename, latency readout in the bar)
- verdict meter (2px track, 0.5/0.8 threshold gates, fill animates to probability)
- state vocabulary: idle → screening (violet shimmer bar) → done; per-verdict line + meta + meter + note

## Motion
- 150ms ease-out hovers, 70ms stagger cascade on load, 0 weight; caret and breathing benchmark dot as the only perpetual loops
- prefers-reduced-motion collapses every animation to static
- hardware-accelerated properties only: transform + opacity

## Layout
- max-width 820px page grid
- 2-column editorial head (prose left, hairline stat column right, 1px rule down full-height); collapses to single column < 768px
- mono captions ≥ 11px for legibility; 65ch cap on prose
