# BSECE Board Reviewer v10.27.0 — Runtime Certification Gate and Calculator Disclosure Hardening

**Status: SOURCE RELEASE CANDIDATE; production certification NOT achieved.**

## Scope
This release follows v10.26 and prioritizes trustworthy runtime readiness reports, leakage-resistant calculator instruction controls, and an explicit offline-to-local certification handoff. No new board questions, no changes to the PRC TOS distribution, and no physical calculator certification are claimed.

## Changes
- Added `src/domain/calculator/disclosureScope.ts`, which scopes a revealed calculator help tab to the question ID, answer/parameter fingerprint, assessment status, attempt ID, disclosure context, and technique ID. Changed question/attempt/mode/context or revoked permission forces the rendered tab shut even before React effects execute.
- Updated `CalculatorTechniqueCard.tsx` to use a fail-closed scoped tab state. New disclosures continue to be recorded when users explicitly open technique/verification help; switching contexts does not re-use earlier disclosures.
- Added `scripts/validateCalculatorV1027.mjs` with tests for all scope dimensions, malformed/stale tab states, and access revocation.
- Added `tsconfig.calculator.v1027.json` and `npm run lint:calculator:v10.27`.
- Added `scripts/checkRuntimeCertificationV1027.mjs` and `npm run certify:runtime:v10.27`. By default the command inspects the lockfile and installed package presence; `--verify` additionally runs the real installed-dependency full `npm run lint` and `npm run build`, launches the production server and runs a Chromium smoke test. A failure or missing package yields a nonzero exit code and a machine-readable report. Even a passing automated smoke does **not** approve Canon key sequences or replace manual journeys.
- Added `npm run qa:source:v10.27`, retaining v10.8–v10.26 regression suites and adding v10.27 checks; updated v10.26 version validation to accept later version numbers while checking package-lock consistency.
- Preserved question IDs, question-bank contents, student scores, study progress, device observation storage, and the existing 48-case preliminary Canon QA catalog.

## Source checks actually performed in this environment
- `qa:source:v10.27`: **36/36** scripts passed; includes past v10.8–v10.26 checks and focused type checks.
- Source import scanner: **259** TypeScript/TSX source files parsed with zero syntax errors; **872** local imports resolved, zero unresolved.
- New calculator disclosure scope tests: passed for question, answer inputs, assessment mode, attempt ID, technique, authorization and disclosure changes.
- Package and lock metadata both identify v10.27.0.
- Source ZIP: integrity verified after packaging.

## Incomplete certification (must not be represented as passing)
- The npm registry cannot be resolved in the working environment (`EAI_AGAIN`). The 11 core project dependencies have not been installed. The full TypeScript app compile, Vite/server production build and React browser journey were **not executable**, and were **not certified**.
- A minimal Chromium `--dump-dom` launch timed out. There is no passing full-app browser run.
- No physical Canon F-789SGA hardware or independently reviewed LCD/keystroke evidence was supplied. **0 of 48** techniques are formally device-certified; preliminary methods remain appropriately labeled.
- TOS question quality and complete content coverage remain separate pending review work.

## Steps for a dependency-ready Windows PC
```powershell
npm ci
npm run qa:source:v10.27
npm run lint
npm run build
npm run certify:runtime:v10.27 -- --verify --output=V10_27_RUNTIME_CERTIFICATION.json
```
The runtime verifier automatically starts the packaged server on port 3000 and runs the existing Chromium smoke when dependencies are installed. Run it with port 3000 free. Then complete the manual browser/physical Canon checklist. A passing automated smoke is not a production certification.

See `RUNTIME_AND_CANON_CERTIFICATION_V10_27.md`.
