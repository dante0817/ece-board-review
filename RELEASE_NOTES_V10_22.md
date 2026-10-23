# BSECE Board Reviewer v10.22.0 — Device-QA Workflow and Assessment Hardening

**Release type: SOURCE RELEASE CANDIDATE (not production-certified)**  
**Date:** 2026-10-10  
**Baseline:** v10.21.0  

## Implemented

- A Canon F-789SGA **Physical-device QA worksheet** inside Calculator Skills (28 cases: 10 exact-question pilot techniques + 18 problem-family methods).
- The worksheet displays authored steps for pilot techniques and a bound numerical question, parameters, conceptual entry, expected result and independent checks for family methods.
- Observer, setup, actual LCD observation, outcome and notes can be logged locally; inputs are strictly validated, replacement of an existing observation is supported, and the record can be deleted.
- **No automatic approval**: observed-pass records never change a method's editorial stage. Every method remains preliminary until actual device, manufacturer-manual and editorial verification is completed.
- Device-QA observations can be exported and restored using the existing learner-backup format. Imports reject malformed, duplicate, oversized and model-mismatched observations before touching existing learner data.
- The global header now hides search, notifications, tutor and profile links during an active strict assessment; supplemental Pomodoro and error-entry overlays are also hidden, extending the existing centralized no-aid controls.
- Nine more calculator-using lesson views now warn learners that Casio menus/keys must not be treated as Canon F-789SGA guidance. Existing Casio text is preserved for later verified conversion, not auto-rewritten.
- New `validate:calculator:v10.22`, `lint:calculator:v10.22`, `auditDeviceQaV1022.mjs`, `CANON_DEVICE_QA_AUDIT_V10_22.csv`, and an operator device-test workflow.

## Validation outcome

- **15/15** source-level validation scripts from v10.8 through v10.22 passed.
- **10/10** focused TypeScript configurations passed.
- TypeScript AST syntax parsed **251** source `.ts`/`.tsx` files with zero parse diagnostics.
- Device-QA regression covers 28 catalog identities, invalid observation rejection, backup roundtrip, strict guard wiring and compatibility warnings.
- Re-run audit still flags **189 Casio references across 54 source files**; they were not automatically converted.

## Not completed / release-blocking for production certification

- Full dependency-backed TypeScript check, Vite/server build and browser E2E tests **not verified**. `npm ci --offline` failed with `ENOTCACHED` on `zwitch`, and DNS could not resolve `registry.npmjs.org`; `npm run build` failed because `vite` was unavailable.
- The source-level tests and TypeScript syntax scan do not prove browser UI behavior or complete app type correctness.
- **No physical Canon calculator tests were carried out.** No device-specific sequence was newly certified; entries in the worksheet are user-recorded observations only.
- PRC calculator policy should be reconfirmed for the user's actual exam sitting, exact model and casing.
- The remaining Casio references require individualized migration and independent confirmation.

## Local verification steps (in an environment with npm access)

```powershell
npm ci
npm run validate:calculator:v10.22
npm run lint:calculator:v10.22
npm run lint
npm run build
npm run dev
```

Then manually test Calculator Skills → Physical-device QA worksheet, backup/import, desktop/mobile display, keyboard access, and strict-assessment tool locking. Use `CANON_DEVICE_QA_WORKFLOW_V10_22.md` for the hardware checks.

## Recommended next phase

**v10.23 — Installed-dependency integration, browser regression and Canon device verification**. After hardware evidence and full-build verification, prioritize replacement of model-specific legacy Casio instructions and numerical-operation drills.
