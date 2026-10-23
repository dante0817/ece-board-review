# BSECE Board Reviewer v10.23.0 — Application Integration & Canon QA Handoff

**Status: SOURCE RELEASE CANDIDATE. NOT a certified runtime build, physically verified Canon guide, or PRC endorsement.**

## What changed from v10.22

1. **Reproducible integration gates:** `npm run preflight:v10.23` reports missing installed packages without mistaking globally installed TypeScript for a complete dependency tree. `npm run scan:imports:v10.23` parses every source TS/TSX module and checks relative/alias imports. `npm run smoke:browser:v10.23` verifies the API health endpoint, root HTML and headless Chromium React sidebar rendering once a working server and Chromium are available. The smoke runner does not simulate exam submission or certify hardware.
2. **Canon model safety in learning outputs:** Removed hard-coded Casio MODE/SHIFT sequences and exaggerated identity claims from selected server flashcard fallbacks, general tutor personas, mathematical study tips, Algebra listings and rational-expression lessons. Generated flashcard `boardExamTip` and error `counterExampleOrCheck` fields now withhold *recognizable* model-incompatible key sequences. The model safety filter is a conservative text guard, **not a mathematical content validation engine**; full AI chat text remains unverified and the tutor UI warns readers explicitly.
3. **Fail-closed tutor screens:** Full-screen and drawer tutor views check the shared strict-assessment lock even if future callers accidentally open them. Existing central assessment restrictions remain unchanged. The UI still provides only self-attested assessment protections, not proctoring.
4. **Device QA review handoff:** The existing 28-case physical Canon QA worksheet can export a structured JSON handoff containing only observer-submitted observations, pending technique IDs, model and technique versions, and an explicit *unverified* status. No observer submission or file export changes technique approval or learner mastery.
5. **Legacy model audit:** New CSV audit enumerates 180 remaining Casio references in 49 source files (down from 189 / 54 in v10.22). They are not automatically replaced with invented Canon key sequences.
6. **Compatibility:** Existing question IDs, problem-family matching, assessment records, scores, learning-path state, and backups are unchanged. Learner data migration is not required.

## What the release does not claim

- A successful full Vite/Express production build, `npm run lint` on a complete install, or interactive browser test in this environment.
- Physical verification of any F-789SGA keyboard sequence or LCD output. All 28 techniques remain preliminary/device-unverified.
- Mathematical certification of all 368 questions or complete PRC enhanced TOS coverage.
- That a heuristic text filter can detect every bad AI-generated calculator instruction. Independently verify each suggestion.

## Source-level validation

- 16/16 executable regression suites passed (v10.8–v10.23).
- 12/12 focused TypeScript configurations passed.
- 255 TypeScript/TSX files parsed with 0 errors; 862 local/alias imports resolved, 0 missing.
- v10.23 calculator model-safety and 28-case unverified evidence export checks passed.
- Full build preflight **blocked**: 11 direct project dependencies absent. `npm run build` failed: `vite: not found`. Browser smoke **not run successfully** because no app server was available. npm registry DNS access not available.

## Required local test sequence

From the extracted project root in Windows PowerShell, with an active network connection:

```powershell
npm ci
npm run preflight:v10.23
npm run validate:integration:v10.23
npm run scan:imports:v10.23
npm run lint
npm run build
npm run dev
```

In a second PowerShell terminal, with Google Chrome or Chromium accessible on PATH (or `CHROMIUM_PATH` set to the executable):

```powershell
npm run smoke:browser:v10.23
```

Then complete the manual scenarios in `BROWSER_AND_CANON_QA_V10_23.md`. Record results in writing. To claim a production release, perform the full app tests on a dependency-enabled machine, review discrepancies, and obtain real Canon hardware evidence; this source release does none of those things automatically.

## Scope note

Server-generated, reviewed, and legacy study content are different trust levels. Do not describe AI-generated advice as a *verified* Canon shortcut. Browser and developer QA does not substitute for independent engineering or mathematics content review.
