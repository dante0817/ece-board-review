# BSECE Board Reviewer v10.19.0 — Parameter-bound Canon Calculator Techniques

**Release type: SOURCE CANDIDATE — NOT production certified; device approval pending.**

## Scope
- Started from the full v10.18 source archive. Previous v10.18 learner data, question IDs, score history, learning paths, backup format, and strict-assessment controls are preserved.
- Added a typed `CalculatorInputBinding` to v10.14 and v10.16 numeric question objects. Bindings are authored by the existing question generators and carry a stable question-family ID, numeric array, and unit. No scraping of problem text or AI-generated key sequences.
- Added **18 Canon COMP-mode family templates** covering **36 individual numerical variants** in Mathematics, GEAS, Electronics, and EST. These supplement the **10 existing exact-question pilot guides** (46 question-specific guidance slots in total, counting their distinct question IDs). A variant reuses a reasoning-family method; it is NOT an independent skill or question family.
- Added family-based calculator solution, expected numeric result, independent numerical check, and caution to the existing post-submission review card. Exact pilot techniques are still preferred where available. User-selected guidance in the Calculator Skills Center links to the actual question and solution.
- Added a fail-closed binding check: no guidance if the family/schema/values/units do not match or the independently calculated result disagrees with the keyed answer. Correct-answer options are verified with rounding-aware tolerance. Missing or unsupported methods show pending status.
- Preserved strict-mode blocking of instructional aid; new card content remains locked until explicit access is authorized. Calculator-help disclosures keep the existing attempt/question/technique/version evidence format.
- Added `CalculatorCompatibilityNotice` to three major Casio-specific educational screens. **These remain Casio GENERAL STUDY material**, not Canon key-by-key conversions. Removed a misleading claim that numerical equality testing can verify any algebraic identity within 20 seconds.
- Added machine-generated `CALCULATOR_CASIO_AUDIT_V10_19.csv`, listing legacy model-specific mentions and their source line numbers. Many additional legacy lessons remain to be converted.

## Bound families
GEAS: force, kinetic energy, hydrostatic pressure, present value. Electronics: resistor divider, parallel resistors, RC time constant, RC cutoff, microcontroller timer overflow, binary truth-table rows. EST: ideal Nyquist rate, PCM rate, wavelength, Shannon capacity, Carson bandwidth, logarithmic power gain. Mathematics: arithmetic mean and weighted mean.

## Validation
- 36 separately authored expected-value fixtures across 18 families: PASS.
- Invalid family, missing parameters, mismatched unit/key, invalid denominator: technique withheld (PASS).
- All previous v10.8–v10.18 source-level regression suites: PASS, including one updated v10.17 static integration assertion which now requires the explicit typed `question={q}` prop.
- Seven focused TypeScript configurations: PASS.
- Full source syntax parser: PASS.
- Zip integrity: see validation report.

## Remaining verification and limitations
1. `npm ci` failed in this environment with `Exit handler never called!`; complete dependency-backed TypeScript build, production bundling, and interactive browser testing are NOT verified.
2. **No Canon F-789SGA physical-device verification** was performed. COMP expressions are preliminary demonstrations, not certified physical keystroke or LCD instructions. The old ten pilots likewise remain drafts.
3. Model approval varies with the PRC examination program. The Canon F-789SGA requires transparent casing under the cited October 2026 ECE policy; confirm current rules.
4. New family templates cover 36 of the current 368 mock questions, plus 10 pilot questions. Unsupported questions correctly show a pending state. This is not comprehensive per-question coverage yet.
5. The Casio reference audit requires manual triage and correction over subsequent releases; three prominent teaching screens now have model compatibility banners, but model-specific references remain elsewhere.
6. Mathematical fixture checks do not replace subject-matter review, manufacturer manual cross-checks, or physical device testing.

## Running locally
```powershell
npm ci
npm run validate:calculator:v10.19
npm run audit:calculator:v10.19
npm run lint:calculator:v10.19
npm run lint
npm run build
npm run dev
```

## Recommended v10.20 priorities
Complete model-awareness across legacy lessons, build a dedicated beginner-to-advanced Canon skills curriculum with validated device photos/screens where licensed, add non-duplicate family coverage systematically, and perform hardware/manual verification before marking any method approved.
