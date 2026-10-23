# BSECE Board Reviewer v10.26.0 — Canon Calculator Coverage Expansion

**Status:** Source release candidate — mathematical/source QA passed; installed-dependency build, interactive browser journey, and physical Canon F-789SGA testing are NOT certified.

## Changes since v10.25

- Authored 20 additional structured **COMP arithmetic technique templates** against existing question families (no new test questions or invented syllabus coverage). There are now **38 reusable families / 76 parameter-bound question variants** plus **10 original exact-question Canon pilot guides**.
- Added techniques in all four board areas:
  - Mathematics: Coulomb force, discrete RMS and percentage overshoot (3 families / 6 variants).
  - GEAS: mechanical power, Boyle's law, sensible heat, average stress and simple interest (5 / 10).
  - Electronics Engineering: series resistances, RL time constant, inverting and non-inverting amplifiers, LED resistor sizing and ADC step size (6 / 12).
  - EST: quarter-wave antenna length, QAM bits per symbol, propagation delay, packet payload efficiency, fiber attenuation and M-ary symbol rate (6 / 12).
- All methods use author-supplied `calculatorInputs` parameters, not parsing question text. The renderer withholds a method if the family, parameter count, units, numerical domain, keyed answer or computed value is invalid.
- Added conservative checks for signed RMS samples, positive denominators, ADC bit count, LED supply headroom, overshoot reference, and power-of-two constellation sizes.
- Added an actual **question coverage view** in Calculator Skills: 86 / 165 unique questions in the existing timed mock bank have preliminary Canon guidance. Another 79 are pending. This denominator covers the *timed mock question pool only*; it is not the number of all questions across every app learning activity or official TOS coverage.
- Expanded physical Canon verification registry to **48** pending cases (10 pilot + 38 family). Previously logged evidence for old case IDs remains valid and does not grant any approval.
- Added exportable question-level audit `CANON_GUIDANCE_COVERAGE_V10_26.csv` (165 entries) and independent numerical fixtures for the 40 newly bound variants.
- The original 18-family regression tests still assess their original 36 fixtures; their fixed-count assertions were revised to allow additions without reducing baseline checks. v10.22/10.23 device QA tests similarly preserve their original cases while permitting newly added cases.
- Updated version to 10.26.0 with synchronized package lock and new validation/audit scripts.

## Honest limitations

1. **No physical device verification:** These are conceptual COMP input expressions and independent calculation checks, NOT tested exact-key sequences or LCD outputs. None of the 48 techniques is automatically published or device-approved.
2. **Not complete question coverage:** 79 of 165 timed mock questions still lack guides. Not all questions should have a calculator solution (conceptual, proof, regulatory, and unsupported problems may have none).
3. **No full installed-dependency validation:** `npm ci --offline` fails because package `zwitch` is not cached. Preflight reports 11 missing core app dependencies, so a full React/Vite build and browser journey could not be certified here.
4. **Not a PRC evaluation:** Calculator eligibility is exact-model- and exam-period-specific; the existing device policy and manufacturer manual remain linked and separate from educational content approval.
5. **No complete re-audit of legacy question bank** is implied; the new numeric checks cover only these 40 variants and preserve old verification status.

## Local verification after extracting ZIP

```powershell
npm ci
npm run qa:source:v10.26
npm run audit:calculator:v10.26
npm run lint
npm run build
npm run dev
```

Also complete the application's existing browser smoke tests and use a real Canon F-789SGA with documented reset, configuration, keystrokes, LCD outputs and independent reviewer approval before labeling any method hardware-verified.

## Compatibility

- No question IDs, learner storage keys, existing practice records, backup format or exam scoring logic were changed.
- Added calculator guidance only; existing lessons, numerical drills and strict-assessment concealment remain intact.
- v10.22 device observation registry dynamically supports additional cases. Observations are explicitly non-certifying and historical records remain importable.
