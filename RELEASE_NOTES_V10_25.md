# BSECE Board Reviewer v10.25.0 — Calculator Accuracy & QA Source Candidate

**Status: source release candidate; not production-certified.** Based on v10.24.0, preserving the Mathematics/ECE question bank, previous assessments, calculator lessons and versioned learner records.

## Changes implemented

1. **More dependable six-minute numeric drills.** A single fail-closed deadline rule is used for both the interval/visibility update and the answer input handler. Late input is not added to the answer snapshot even if a UI frame is delayed.
2. **Strict-mode interruption.** If a strict assessment becomes active while a numeric drill is underway, the unfinished drill is discarded instead of lingering beneath the locked screen and resuming later. This does not rewrite earlier results.
3. **Independent wrong-answer diagnostics.** All 12 numeric items have a precomputed possible-error pattern, such as: misplaced power of ten, resistance added in series, omitted 2π, missing μF conversion, using 20 instead of 10 for power dB, Nyquist factor, or misplaced current decimal. These messages appear *only* when the typed response matches the independently defined mistaken value within a controlled tolerance. Other incorrect responses receive the ordinary solution and pitfall notes; a matched pattern is labelled a **possible** error, not a proven cause.
4. **Retained grading and data formats.** All 12 question IDs, expected answers, absolute tolerances, lesson IDs and the `ece_canon_numeric_drills_v1` history/backup format are unchanged. Numerical-drill performance still never counts as board-exam mastery.
5. **Reproducible source QA.** `npm run qa:source:v10.25` executes the v10.8–v10.25 regression chain, 13 focused TypeScript configurations, and the local import/syntax scan. A separate `npm run smoke:numeric:browser:v10.25` tests the actual numeric grading module in headless Chromium once Chromium can run on the host; it **does not** replace the React app browser test.
6. **Auditable accuracy catalog.** `npm run audit:numeric:v10.25` exports expected values, units, numerical tolerances, independent checks and verification status for the 12 numeric problems. The previous v10.24 validator now accepts both package versions while confirming package and lockfile agreement.

## Automated verification performed in this environment

- **32/32 source QA checks passed**: 18 release validations, 13 focused TypeScript checks, one import scan.
- Syntax scan: 257 TS/TSX files with no syntax errors; 867 local imports resolved.
- 12 known mistake patterns and exact six-minute deadline boundary checked.
- `npm ci --offline` **failed** (`zwitch` missing from npm cache); registry DNS resolution also failed.
- Full `npm run lint` **could not pass** due to absent project modules/type packages.
- Full `npm run build` **could not run** (`vite: not found`).
- Minimal Chromium process and numeric browser smoke both timed out in this environment. **No interactive app/browser test is certified.**
- All Canon F-789SGA physical button/menu/LCD procedures still require an actual-device test and formal editorial review.

## Verify on your machine

```powershell
npm ci
npm run qa:source:v10.25
npm run lint
npm run build
npm run dev
```

Run the browser smoke in another PowerShell terminal while the server is running:

```powershell
npm run smoke:browser:v10.23
npm run smoke:numeric:browser:v10.25
```

Set `CHROMIUM_PATH` to the Chrome/Chromium executable if it is not on `PATH`. Complete the manual test journeys in `BROWSER_AND_CANON_QA_V10_25.md` and use the v10.22 device-QA worksheet for hardware verification.

## Scope boundary

No new expert-approved calculator techniques or expanded PRC question coverage are claimed in this release. Misconception detection is heuristic and verified against 12 independent fixtures; it does not prove the actual learner thought process. The app remains self-attested, not remotely proctored.
