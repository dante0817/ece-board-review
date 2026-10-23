# BSECE Board Reviewer v10.28.0 — Isolated Runtime Certification and Browser Smoke Hardening

**Release status: SOURCE CANDIDATE. Full dependency-backed build, live React browser test and physical Canon F-789SGA verification have NOT passed in the packaging environment.**

## Changes from v10.27

1. **Runtime server configuration:** `server.ts` now accepts validated `PORT` and `HOST` environment variables. Existing default remains `3000` on `0.0.0.0` for compatibility. Invalid ports/hosts are rejected rather than silently choosing a different endpoint. Server binding/startup errors are reported.
2. **Application-specific health response:** `/api/health` now includes `application: "bsece-board-reviewer"`. During loopback-only certification it also includes a one-time QA nonce; the ordinary default server omits that token.
3. **Isolated certification server:** `certify:runtime:v10.28` runs the production build on a randomly allocated **loopback-only port**, with a one-time nonce. It cannot treat an unrelated server on port 3000 as successful verification.
4. **Stronger certification gate:** An automated pass requires package/lockfile agreement, installed-dependency TypeScript compilation, production Vite/Express build, health from the launched process and functional Chromium navigation. No source-only test or prior build artifacts satisfy these gates. Physical device approval remains independently pending.
5. **Functional browser smoke:** The new smoke test uses browser DevTools to exercise real clicks: sidebar → Canon Calculator Skills → numerical answer drills → mock exams, checking JavaScript exceptions. It must be run on a machine with a working installed Chromium/Chrome and running application.
6. **Regression tests:** `validate:runtime:v10.28`, `lint:runtime:v10.28` and `qa:source:v10.28` added. The previous 10.27 regression accepts later versions without weakening its prior help-disclosure checks.
7. **Learner-data continuity:** No question IDs, scores, local-storage keys, learner backup format or calculator technique verification approvals have changed. All earlier features are retained.

## Verified in this release environment

- 38/38 source-level validation checks pass, including earlier releases and the new runtime safeguards.
- 260 TypeScript/TSX files parse without syntax errors.
- 873 local relative/alias imports resolve; 0 missing.
- Runtime configuration/identity/certification status contracts pass focused tests.
- Package and lockfile versions match 10.28.0.
- ZIP integrity verified after packaging.

## Explicitly NOT verified

- `npm ci --offline` failed: `ENOTCACHED` for `zwitch`; registry access was unavailable.
- Full `npm run lint` failed on missing installed npm packages/types.
- Full `npm run build` failed: `vite: not found`.
- Real React/Chromium functional smoke was not run against a successfully built application. A system Chromium launch previously timed out in this environment.
- Zero Canon F-789SGA methods have independently verified physical keystrokes/LCD behavior; the 48 QA cases remain pending.

The new functional browser smoke is **implemented and source-tested, not yet exercised against a running production build**. This distinction is intentional.

## Windows verification commands

From the extracted application directory in PowerShell:

```powershell
node --version       # Node 22 or newer recommended
npm ci
npm run qa:source:v10.28
npm run lint
npm run build
npm run certify:runtime:v10.28 -- --verify --output=RUNTIME_V10_28_LOCAL.json
```

Successful automated runtime smoke is a prerequisite for, not a substitute for, the manual browser, backup and 48-case physical Canon F-789SGA checklist.

See `RUNTIME_QA_V10_28.md` and `RUNTIME_V10_28.json` for reproducible status and an evidence handoff.
