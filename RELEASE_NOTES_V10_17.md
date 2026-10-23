# BSECE Board Reviewer v10.17.0 — Canon F-789SGA Calculator Guidance Pilot

**Status: SOURCE RELEASE CANDIDATE, NOT PRODUCTION CERTIFIED.** Derived from v10.16.0; no user browser records altered during packaging.

## Added

- **Calculator Skills** navigation entry and guided learning page, containing Canon F-789SGA mode/function overview, warnings about exam model eligibility, links to the official Canon manual and PRC list, and direct, question-specific examples.
- **Ten curated calculator technique cards**, keyed to actual mock question IDs (01, 02, 03, 04, 16, 17, 18, 20, 21, 23). These cover simultaneous equations, geometric series, binomial combinations, quadratic/log domain restrictions, AM power, Carson bandwidth, VSWR, Shannon capacity, discriminants and JFET drain current.
- Each curated card includes: function and manual location, ordered instructions, expected numerical result, **independent answer verification**, and a common error/trap.
- A clear **"Technique pending review"** state on any other mock or reference-practice question. There is **no AI-generated or keyword-guessed Canon sequence**.
- Calculator techniques are mounted on **post-submission mock review**, and on **reference-topic practice only after the answer has been checked**. Strict assessment mode does not expose them during question taking; external assistance remains self-attested.
- Default/preserved **Canon F-789SGA** profile in learner settings. Settings saves the selected model into the existing profile storage, which is included in the existing learner backup. Only this model is currently supported; no fake list of additional enabled models.

## Corrected during calculator verification

- The previously incorrect **Order of Operations / resonant-frequency calculator trap** was fixed. Entering `(1/2)*π*√(LC)` instead of `1/(2π√(LC))` gives a ratio of π²LC, not the previously stated 4π² factor. For L=10 mH and C=100 pF, the incorrectly entered result is about 1.5708×10⁻⁶ Hz versus the correct ~159,154.94 Hz; the entered value is approximately 9.87×10⁻¹² of the correct result. Correct option A and explanation were updated.
- Selected high-level Mathematics and Linear Equations tutor prompts now describe the Canon model rather than recommending Casio fx-991ES sequences for a PRC board context.
- Legacy Casio-specific examples in Scientific Notation and Ratios/Proportions are expressly labeled as **general study, not Canon key instructions**. Their original method content has not been mislabeled as Canon instructions.
- Settings save now preserves all unrelated existing profile fields instead of rebuilding only a subset.

## Sources and regulatory disclosure

- **Canon F-789SGA instruction manual:** https://ij.manual.canon/cal/webmanual/WebPortal/pdf/F-789SGA%20%28EXP%29_EN.pdf
- **PRC updated calculator list:** https://www.prc.gov.ph/node/6984
- **October 2026 ECE examination program:** https://www.prc.gov.ph/sites/default/files/BECE%20exam%20program%20Oct%202026.pdf
- The October 2026 PRC program lists **Canon F-789SGA with transparent casing**. Model eligibility is subject to the current exam program and inspection. Similar model names do not automatically qualify.

## Evidence limitations

- Only **10 questions** currently have full calculator-specific guided steps. Remaining questions show pending review rather than falsely implying complete coverage. A future release should expand per-family validated templates and perform physical button/display verification.
- Technique steps are cross-checked against the published Canon manual at the function/mode level, and expected mathematical answers are independently checked. **Physical-device keystroke and display testing has not been completed.** Each technique is labeled `manual-documented-not-device-tested`.
- This does not verify every problem answer, render a real calculator emulator, or authorize calculator assistance on official PRC examinations beyond the published policy.

## Tests and installation

Run after extracting the archive:

```powershell
npm ci
npm run validate:calculator:v10.17
npm run validate:content:v10.16
npm run lint
npm run build
npm run dev
```

Current environment: 10 existing validation groups (v10.8–v10.17) passed; six focused TypeScript configurations passed; 240 TS/TSX source files had no parse diagnostics. `npm ci --offline` failed on an uncached `zwitch` package, so a full app typecheck, build and interactive browser test **remain unverified**. See `VALIDATION_V10_17.txt`.
