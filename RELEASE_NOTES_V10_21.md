# BSECE Board Reviewer v10.21.0 — Canon Speed-Decision Drills and Mistake Remediation

**Release classification:** source release candidate; physical Canon F-789SGA and full browser/build certification pending.

## Changes

- Added a **Speed Drills & Mistake Review** tab to the existing Canon Calculator Skills Center, preserving the original lessons and question examples.
- New **five-minute, 10-question** timed *decision* practice drawn from the 20 pre-existing, authored v10.20 knowledge checks. Each set covers all 10 lessons with one check per lesson; alternate checks appear on consecutive attempts. No previously unreviewed mathematical answer keys were invented.
- Added wall-clock countdown that catches up when the browser tab returns from the background; finishing or time expiry saves correct/incorrect/unanswered responses separately. Deliberately **not** a physical keystroke speed test, verified board simulation, or proctored assessment.
- Added per-question post-attempt explanations, direct lesson links, and **mistake remediation** based on actual wrong or unanswered drill responses. Optional manual error-log categories give separate, explicitly non-diagnostic recommendations.
- Added **24-hour in-app recheck prompts** for lessons with outstanding missed drill answers. A subsequent correct check clears the reminder. No automatic notifications, calibrated retention model, or board readiness claim.
- Added five **manual-vs-Canon conceptual method comparisons**, with calculation, independent verification, fastest-method teaching judgment, and common pitfalls. These **do not claim physically verified keystrokes** or measured timing advantage.
- Added a bounded, versioned local history (`ece_canon_speed_drills_v1`; last 50 attempts), backup export/import validation, corrupted-data rejection, and backward compatibility with existing v10.20 learner records.
- In strict assessments, Calculator Skills Center remains locked. Speed-drill history is **not incorporated into verified exam scores or subject mastery**.
- Added `validate:calculator:v10.21`, `lint:calculator:v10.21`, and a reproducible CSV audit exporter.

## Outstanding requirements

- No physical F-789SGA available here; manufacturer-specific button sequences, LCD displays, and model-specific screenshots **remain unapproved**.
- Existing Casio-only content is not all converted; prior compatibility warnings/audit remain applicable.
- Full `npm ci`, `npm run lint`, `npm run build`, and browser-based interaction tests require a development environment with installable React/Vite/Node packages. Offline `npm ci` failed due uncached `zwitch` dependency. Focused typechecks and source-level regressions do not replace the full build.
- Five-minute scores reflect choice-based knowledge and decision speed only, not real calculator key-entering proficiency or actual competitive exam performance.

## How to validate locally (after installing Node 22+ and dependencies)

```powershell
npm ci
npm run validate:calculator:v10.21
npm run lint:calculator:v10.21
npm run lint
npm run build
npm run dev
```

Open the Calculator Skills Center → Speed drills & mistake review. Confirm the running countdown, the on-submission explanations, lesson links, 24-hour suggestions, local persistence and backup restoration. Test strict-assessment aid locking separately.
