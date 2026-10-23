# BSECE Board Reviewer v10.16.0 — Question Verification and TOS Competency Expansion

**Status:** Source release candidate. Preserves v10.15 learning paths, learner data, assessment history, and course-quotas; no production-build or browser certification is claimed.

## Added and changed

- Added **32 original numeric practice variants in 16 reasoning families** for course gaps in Mathematics, GEAS, Electronics Engineering and EST. Numeric cases within the same family do NOT represent independent competencies.
- Registered 16 new **practice-only topics** in canonical curriculum. Migration retains existing learner scores, question-history identifiers, and prior topic records.
- Assigned all new families to one explicit, provisional PRC TOS course each. Wrong-subject or unmapped questions are not quietly assigned elsewhere.
- Added **32 independently specified numeric expectation fixtures** for the new items. Two legacy questions received targeted mathematical corrections and repeatable verification tests:
  - `mock-q-25`: numerical aperture √(1.48²−1.46²) ≈ 0.242487 → **0.242** to three decimal places, not 0.243.
  - `mock-q-35`: corrected the invalid complement substitution in Napier's rule. The valid right-spherical-triangle identity is `cos c = cos a · cos b`.
- Added question-quality provenance on TOS setup: **fixture-tested**, **generator-checked**, and **pending independent review**. These labels describe automated verification, not professional peer review.
- Exported `QUESTION_VERIFICATION_V10_16.csv`, `TOS_COURSE_COVERAGE_V10_16.csv` and `CONTENT_VERIFICATION_V10_16.md`.
- Added `npm run validate:content:v10.16` with key validation, classification, historical migration and scoring/quota regression checks.
- Improved original family-diversity counts to include v10.16 original questions without inflating independent families for parameter variants.

## Current content numbers

| Measure | v10.16 source |
|---|---:|
| Questions in mock/reference pool | 368 |
| Distinct normalized question prompts | 367 |
| Original v10.14 numerical variants | 96 in 48 families |
| Original v10.16 numerical variants | 32 in 16 families |
| Numeric fixture-tested questions | 34 (32 new + 2 corrected legacy) |
| Generator-checked variants | 96 |
| Other questions pending independent mathematical review | 238 |
| Provisional TOS-mapped distinct questions | 152 |
| Unmapped distinct questions | 215 |
| Missing separate formula metadata | 203 (not necessarily errors) |

## TOS course-quota practice

| Requested | Selectable v10.15 | Selectable v10.16 | Missing v10.16 |
|---|---:|---:|---:|
| 50 | 32 | 47 | 3 |
| 100 | 55 | 83 | 17 |

For a 50-question TOS allocation, shortages remain in Differential Calculus (1), Integral Calculus (1) and ECE Laws/Contracts/Ethics/Standards/Safety (1). The laws slot was not backfilled with an unverified regulatory question. Larger plans have more shortages. An available exam quota does not establish TOS subtopic/difficulty coverage, formally correct keys, independence, or board readiness.

## Scope and limitations

- No existing question/learner IDs were changed. Historical choices remain interpretable; the two corrected legacy questions retain their original correctOptionId values.
- Verification of 34 numerical cases does not certify the remaining bank or establish external expert approval. Full independent specialist review of the legacy/reference question bank is still outstanding.
- TOS mappings are provisional editorial assignments based on the course-level PRC Annex A, not PRC endorsement.
- Full installed-dependency build, browser usability, and production deployment remain **unverified** in this environment.

## Reproducing checks (Windows PowerShell)

```powershell
npm ci
npm run validate:content:v10.16
npm run validate:tos:v10.15
npm run validate:board:v10.14
npm run lint:board
npm run lint
npm run build
npm run dev
```

**Next:** Resolve remaining TOS course shortages with authoritative source verification for ECE law and additional independent Mathematics question families; complete manual review of 238 legacy/reference items, then perform full installed-dependency build and browser tests.
