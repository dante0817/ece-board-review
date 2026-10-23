# BSECE Board Reviewer v10.20.0 — Canon Calculator Skills Center

**Release classification: SOURCE CANDIDATE. Full installed-dependency/browser and Canon physical-device verification pending.**

## Changes from v10.19

- Expanded the previous static Calculator Skills page into a 10-lesson, beginner-to-advanced curriculum: reset/angle units, parentheses, engineering notation, simultaneous equations, quadratics and domain checks, CALC/SOLVE limitations, decibels, complex/matrices, numerical calculus, and independent answer checks.
- Each lesson contains a specific objective, manual-section reference, procedural steps, worked math example, independent check, common trap, and **two independently authored multiple-choice knowledge checks**, for **20 total** checks.
- Added repeatable scoring and explanations. 2/2 is required for lesson **knowledge-check completion**; this is not physical calculator competency, independent assessment mastery, expert content approval, or ECE board readiness. Learners may retry without losing earlier completions.
- Added local knowledge-check progress (`ece_canon_skills_progress_v1`) using a bounded, versioned schema. Existing historical exam scores and learner records are untouched. Export/restore includes and validates the progress record, rejecting malformed or tampered records before applying any changes.
- Retained 10 exact-question Canon guides and 18 family-based templates / 36 bound numerical variants in a separate real-question examples area; guidance remains preliminary pending device testing.
- Calculator Skills screen refuses to display instructional content when the centralized strict-assessment session is active. Session policy still governs tutor, voice, calculators and other in-app aids elsewhere.
- Added explicit Casio-vs-Canon compatibility notices to Ratios Practice, Scientific Notation Practice and Rational Expression Worked Examples (in addition to the three screens covered in v10.19). This is not a wholesale Casio-key translation; older references remain for further audit.
- Added `CANON_SKILLS_AUDIT_V10_20.csv` and `CANON_F789SGA_SKILLS_DEVICE_TEST_V10_20.md` for publication readiness and physical checks. No device test was performed.

## Verification

- v10.20 validation: 10 lesson records, 20 quiz items, prerequisite links, grading and retry logic, storage validation, backup/restore, fail-closed strict access, source compatibility checks.
- All available v10.8–v10.19 validations remain passed and new v10.20 validator passes.
- Eight focused TypeScript compiler projects pass; source syntax scan passes for 247 TS/TSX files.
- **Full project build not certified:** `npm ci --offline` fails because npm package `zwitch` is absent from the available cache. React/browser integration cannot be certified without a complete dependency installation.
- **Physical device not available:** exact calculator keystrokes, menu placement and LCD readouts are NOT verified by a physical Canon F-789SGA. No method is labeled published/device-approved.
- Exam eligibility: confirm the current PRC examination policy; earlier published October 2026 ECE program names Canon F-789SGA with transparent casing.

## Local setup

```powershell
npm ci
npm run validate:calculator:v10.20
npm run lint:calculator:v10.20
npm run lint
npm run build
npm run dev
```

## Next phase

v10.21 — exam-oriented speed drills, actual mistake-triggered calculator remediation, staged Canon physical-device verification, ongoing legacy Casio audit, and full browser/build certification.
