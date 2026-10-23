# v10.29.0 Targeted Issue Resolution

| Priority | Defect / risk | Resolution | Verification |
|---|---|---|---|
| P1 | Default LAN exposure | Localhost default, explicit opt-in to LAN | `validateReliabilityV1029`, `validateRuntimeV1028` |
| P1 | Anonymous LAN and browser cross-origin AI usage | Same-origin and loopback-host restrictions; nonlocal bearer authorization; HTTP/WS rate and size bounds | Unit fixtures, source integration assertions; installed HTTP/WS tests still required |
| P1 | Review form starts with invented 20/16 score | Blank fields, integer range guard, disabled Save, absent score comparison until actual counts entered | v10.29 source checks; browser confirmation outstanding |
| P1 | Cramer's Rule all-zero determinant inference | Compare coefficient and augmented matrix ranks | Explicit inconsistent 3×3 counterexample fixture |
| P2 | Expanded mobile Pomodoro overlays a numerical drill | Starts and stays minimized on narrow screens, retains manual toggle | Source checks; 320px/390px screenshots outstanding |
| P2 | Modal keyboard focus limitations | Shared initial focus, Tab wrap, Escape and focus restoration | Source checks; keyboard-only browser check outstanding |
| P2 | Refresh discards strict attempt without follow-up explanation | One-time pagehide interruption marker and setup notice; no answer persistence or auto-record | Source checks; browser refresh verification outstanding |
| P3 | Legacy Casio-specific content | Not silently relabeled; left for audited device-specific future phase | Not in this release |

## Compatibility

No question IDs, answer keys, graded examinations, learner history schemas, backup schemas, or original Codex fixes were intentionally changed. Old QA_REPORTS evidence is retained as **historical v10.28.0a evidence**, not a claim that v10.29 has passed the same browser tests.

| P2 | Node did not read the `.env.local` file documented by the app | Load `.env.local` first, then `.env`, with process environment precedence retained | Source test and next Windows API check |
