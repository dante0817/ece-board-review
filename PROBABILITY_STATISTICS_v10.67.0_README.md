# BSECE Board Reviewer v10.67.0 — Editorial Verification and Source-Page Traceability

**Release status:** DEVELOPMENTAL — do not enable the PRC scored pool.

## Executive result

- **8 Probability & Statistics modules; 80 draft lessons; 204 question records** (64 guided, 140 independent).
- All **99 independent numerical question answers** independently recomputed by the carried-forward 10.60/10.61/10.62 arithmetic evaluators; printed precision and distractor separation checked.
- **41 conceptual independent questions** have four distinct answer choices and answer-key records. **They have not received independent subject-matter-editor signoff**; a structurally unique key is not proof of correctness.
- **80 of 80 research-reference PDF pages were accessible and text-readable**. The new per-lesson ledger records the exact source PDF basename, SHA-256, 1-based PDF page and section title. This is **locator verification**, not full passage/explanation/example certification.
- **0 lessons** have independently signed-off entire passages. **0/140** practice questions are approved for scored PRC exams; the full **15-item PRC Engineering Data Analysis** quota remains unmet. The exam filter fails closed.
- SHA-256 change control against v10.66 confirms **exactly 2 lesson text edits, 3 citation-locator edits, and 0 question edits**. All lesson IDs, question IDs and existing study-tracking formats were preserved.

## Corrections implemented

| Record | Correction | Evidence |
|---|---|---|
| `PS06-03` lesson | Changed the unconditional statement that Type I error occurs with probability α to the correct **at-most-α** level-test control, with possible equality for exact tests. Also clarified conservative discrete tests and interpretation of p-values. | **Navidi, Statistics for Engineers and Scientists, 4th ed., PDF p. 494**, §6.12; inspected original table and text |
| `PS07-01` lesson | Added the condition that Pearson r is undefined if either variable has zero observed variance; r lies in [-1,1] when both variances are nonzero. | Navidi, 4th ed., §7.1 (PDF pp. 521 onward); standard covariance normalization |
| `PS03-08` locator | Replaced generic Morin conditional-probability page with the **odds problem** at **Morin PDF p. 89**, worked solution p. 93. | Morin, Probability: For the Enthusiastic Beginner, Problems 2.1 |
| `PS06-03` locator | Changed to **Navidi §6.12, PDF p. 494**, where Type I/II error-rate qualification is explicitly discussed. | Navidi, 4th ed., PDF p. 494 |
| `PS07-07` locator | Advanced to **Navidi PDF p. 567** where the prediction-interval standard error and formula are shown, rather than the preceding subsection heading. | Navidi, 4th ed., §7.3, pp. 566–568 |

## What the new audit ledgers contain

`psV10670SourceLocatorChecks.json`: **80 records**, including lesson ID, exact referenced PDF file, SHA-256 fingerprint, chapter/section, PDF page, whether its PDF page was readable, and limited topic keyword match. Each record retains `wholeLessonPassageVerified=false`, `workedExampleVerified=false`, and `independentExpertSignoff=false`. Four targeted local source passages have explanatory notes; these do **not** certify their entire lessons.

`psV10670QuestionVerificationRegister.json`: **140 records**, including option key, published working, provisional competency and cognitive classification, structural distractor checks and pending qualified review fields. All `expertSignoff` and `assessmentEligibility` fields are false.

The user-facing **Review status** tab now distinguishes research-source page checks from fully approved passages and separately displays conceptual SME approvals.

## Tests run

| Check | Observed result |
|---|---|
| `npm run validate:probability-statistics:v10.67.0` | **PASS** (source syntax, record counts/IDs, SHA-256 controlled diffs, reference checks, approval metadata, PRC gate) |
| `python scripts/verifyProbabilityStatisticsV10670.py` | **PASS** (99 numerical answer calculations / precision, 41 structural conceptual checks) |
| Actual scored board pool | **PASS — empty**, 0 approved questions |
| Source ZIP integrity | **PASS** after packaging |
| `npm ci --offline --ignore-scripts --no-audit --no-fund` | **BLOCKED**: `ENOTCACHED` for required npm package `zwitch` |
| `npm run lint` | **BLOCKED** (exit 2): missing Node/React/dependency type packages after failed install |
| `npm run build` | **BLOCKED** (exit 127): `vite: not found` |
| `npm run validate:mathematics:v10.57.0` | **NOT COMPATIBLE**: legacy QA script's hard-coded version allowlist stops before 10.67.0 (not a Mathematics content failure) |
| `npm run validate:probability-statistics:v10.58.0` | **NOT COMPATIBLE**: historical script's hard-coded version allowlist excludes 10.67.0 (not a content failure) |
| Browser smoke / full Math inherited regressions | **NOT COMPLETED**; require dependency installation and updated historical QA harness |

## Important limitations

Passing an arithmetic validator does not check whether a statistical model or its assumptions are appropriate. A readable textbook page does not establish passage-level verification of a lesson, and a conceptual answer's four unique choices do not establish an unambiguous mathematically defensible key. Full review must compare **all 80 lesson claims and their worked examples** and **all 140 questions, distractors, assumptions and source evidence** to original sources. Independent qualified reviewer signoff cannot be inferred from automated results and was not granted.

## Local-development verification

```powershell
npm ci
npm run validate:probability-statistics:v10.67.0
npm run lint
npm run build
npm run dev
```

Then manually check Mathematics → Probability & Statistics → Lessons and Review status; verify Type I control in `PS06-03`, correlation qualification in `PS07-01`, Morin's odds citation in `PS03-08`, and the empty scored pool. Record full browser checks and expert approvals separately.

## Next release gate

Do **not** mark the content as certified yet. Request an **independent qualified reviewer** to verify all lesson passages/examples and every question's mathematical model, result, alternative answers and cognitive classification; then complete production build and browser/regression certification. Only after recorded evidence and signoff may question approval flags be enabled. This release only adds traceability and corrects defensible issues.
