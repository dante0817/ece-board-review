# BSECE Board Reviewer v10.24.0 — Numerical Calculator Practice and Runtime Readiness

**Status:** Source release candidate. Full dependency-backed build, browser integration testing and physical Canon F-789SGA verification remain pending.

## New since v10.23.0

### Numerical-entry calculator drills

- Added **Calculator Skills → Numerical answer drills**, a separate six-minute exercise with **six numerical prompts**, each from a different reasoning family.
- Added 12 original fixed numeric exercise instances: two per family for engineering notation, parallel resistance, RC cutoff frequency, power decibels, theoretical Nyquist sample rate, and DC electric power.
- Variants rotate deterministically between attempts, without relying on extraction of coefficients from narrative text.
- Text entry supports ordinary signed decimals and scientific notation (`1.59e3`), never requires typing unit text, and uses explicit per-question absolute tolerances. A malformed nonblank value is **incorrect**, not a reason to discard the entire attempt; blank values are **unanswered**.
- Separate display for correct/incorrect/unanswered, a worked solution, independent reverse-check, and a caution. Links open related calculator-skill lessons for missed items.
- Uses wall-clock timing and checks the session deadline after a hidden tab returns. The attempted response is evaluated only after finishing or timeout.
- Strict mock access stays **fail-closed**, using the existing centralized `strictAssessmentLocked` policy.

### Learner-data safety

- Separate `ece_canon_numeric_drills_v1` learner-storage namespace, independent of official/mock `TestRecord` results and board mastery. At most 50 saved attempts.
- Data validation rejects unknown question IDs, duplicate problem families, inconsistent elapsed times, malformed records, excessive history, and duplicate attempts. All grades are recomputed from the numeric inputs and immutable question fixtures, not stored as user-editable score claims.
- Included this namespace in the existing learner archive export/import and pre-restore validation; older backups import without needing the new key.
- Existing learner records, question IDs, calculator technique records, and the 28 physical-device QA cases are preserved.

### Backward-compatible checks

- Added `validate:calculator:v10.24` and `lint:calculator:v10.24`.
- The v10.23 regression check now asserts lockfile consistency and supports v10.23+ versions rather than requiring an obsolete fixed version.
- Preserved existing preflight, browser smoke-test entry points, source import scanner and full regression scripts.

## Scope and limits

- **Numerical result practice**, not actual Canon keypress-speed measurement or exam readiness. A correct result does not establish which physical calculator was used.
- New prompts are individually authored practice checks with independently computed fixtures; they do **not** expand the app's existing official TOS mapped assessment pool or constitute external subject-matter validation.
- Exact F-789SGA key sequences and LCD displays have not been tested on physical hardware. None of the 28 technique cases is promoted to device-approved status.
- Existing Casio model-specific instructional content is still in the tracking audit and is not automatically relabeled as Canon.
- `npm ci --offline` fails due uncached dependency `zwitch`; `npm run build` fails because Vite is not installed. Full-project TypeScript build, production runtime and browser interaction could not be certified in this environment. **Do not treat focused TypeScript checks as a production build.**

## Recommended local Windows verification

```powershell
npm ci
npm run validate:calculator:v10.24
npm run lint:calculator:v10.24
npm run validate:integration:v10.23
npm run scan:imports:v10.23
npm run preflight:v10.23
npm run lint
npm run build
npm run dev
```

In a second terminal:

```powershell
npm run smoke:browser:v10.23
```

Then run manual scenarios in `BROWSER_AND_CANON_QA_V10_24.md` (including numerical answers, cross-session persistence, backups, strict mode, and an actual Canon F-789SGA device). Successful local smoke testing alone is not physical device certification.
