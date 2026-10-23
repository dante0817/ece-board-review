# BSECE Board Reviewer v10.62.0 — PS01–PS04 Foundations Expansion

## Scope

This release **extends the existing v10.61.0 React/TypeScript application**, not a rewrite. It targets the four Probability & Statistics modules that formerly had four initial lessons and two unseen practice questions each. The P&S subject retains its existing UI, formulas, learner-tracking namespace, routes, and question-selection engine.

## Delivered changes

| Module | New lessons | New unseen practice | Total lessons | Total unseen practice |
|---|---:|---:|---:|---:|
| PS01 — Obtaining Data & Descriptive Statistics | 6 | 16 | 10 | 18 |
| PS02 — Combinatorics & Counting | 6 | 16 | 10 | 18 |
| PS03 — Probability Fundamentals & Bayes | 6 | 16 | 10 | 18 |
| PS04 — Random Variables & Distributions | 6 | 16 | 10 | 18 |
| PS05 — Sampling & Intervals (unchanged) | 0 | 0 | 10 | 16 |
| PS06 — Hypothesis Testing (unchanged) | 0 | 0 | 10 | 18 |
| PS07 — Regression & Correlation (unchanged) | 0 | 0 | 10 | 18 |
| PS08 — Design of Experiments (unchanged) | 0 | 0 | 10 | 16 |
| **Total** | **24** | **64** | **80** | **140** |

The initial 64 guided-only lesson questions remain retained and **excluded** from unseen practice: **204 total question records**, of which 140 are independent practice and 64 are guided.

### PS01 topics
- Random/stratified/systematic/cluster sampling
- Data classification, missing observations, measurement scales
- Weighted means and unbiased sample variance
- Quantile conventions, IQR, boxplot outlier fences
- Sample covariance and paired data
- Sampling biases, experiments versus observational studies

### PS02 topics
- Multiset permutations
- Circular permutations and rotational equivalence
- Stars-and-bars and repeated selections
- Inclusion–exclusion
- Complementary counting and pigeonhole principle
- Binomial coefficient identities

### PS03 topics
- Total probability over supplier/batch partitions
- Bayesian defect tests and positive predictive value
- Independent series and parallel component reliability
- Probability versus odds
- Sequential sampling without replacement
- Conditional probability in two-way tables

### PS04 topics
- Geometric first-success waiting times
- Hypergeometric versus binomial models
- Exponential waiting times and constant hazard
- CDF interval probabilities and discrete jumps
- Joint variables, covariance and sums
- Normal approximation to binomial counts with continuity correction

All 24 new lessons contain original explanations, formula blocks, guardrails, worked examples, and checkpoints. References are development source maps by chapter/section **not verified page-level citations**. Do not equate this release with a completed content/PRC audit.

## Quality assurance

### Passed
- `npm run validate:probability-statistics:v10.62.0`: v10.62 source checks + 46 independent Python arithmetic checks + inherited v10.61 and v10.60 source checks.
- Exactly 24 new lesson IDs and 64 unseen practice IDs, with module coverage enforced.
- 46 new numerical answer keys independently recomputed from raw parameters and checked against distinct answer choices and rounding.
- 18 conceptual new question structures checked for proper options/key layout (not independently certified for editorial accuracy).
- SHA-256 canonical JSON digests: all 56 prior lesson records and 140 prior question records preserved without changes.
- All eight modules maintain stable ordering and have ten lessons.
- No new or existing P&S questions marked as eligible for scored PRC mock exams (`assessmentEligible=false`).
- Existing shared progress schema/storage keys and UI routes were not modified.

### Not certified / blocked
- `npm run qa:mathematics:v10.62.0` reached legacy Mathematics UI checks but did not finish before the execution limit. **Do not report full inherited QA as passed.**
- `npm run build` blocked by missing local Vite (`sh: 1: vite: not found`).
- `npm run lint` (`tsc --noEmit`) reports missing project dependencies/types (React/Node/Express and others); cannot certify typechecking until `npm ci` is run.
- `npm run smoke:probability-statistics:v10.62.0` is supplied for manual/browser testing but has NOT been executed.
- Review all 18 new conceptual answers and statistical model assumptions editorially before assessment certification; an arithmetic validator cannot judge them.
- The full official PRC examination blueprint and readiness system have not been implemented or certified.

## Installation / reproduction

Extract the source ZIP into a fresh folder in your development PC, then:

```bash
npm ci
npm run validate:probability-statistics:v10.62.0
npm run qa:mathematics:v10.62.0
npm run lint
npm run build
npm run dev
```

Optional browser test (requires Playwright Chromium and a running dev app):

```bash
npm run smoke:probability-statistics:v10.62.0
```

If the HMR WebSocket port 24678 is already in use, stop the stale Vite process or use the existing dev/HMR controls as documented previously. This content release does not change ports or WebSocket settings.

## Rollback and learner data

Preserve a backup of your working v10.61.0 project and any persisted learner data before updating. This release changes JSON curriculum/question content and version/QA scripts, but **does not change learner storage schemas, existing routes or historical question/lesson IDs**. If reverting, verify stored progress against v10.61.0 before attempting further migrations.

## Files changed (compared with v10.61.0)

- `src/features/probability-statistics/psLessons.json` — appended 24 lesson drafts
- `src/features/probability-statistics/psQuestions.json` — appended 64 practice questions
- `src/features/probability-statistics/psModules.json` — appended IDs to PS01–PS04 lesson lists
- `package.json`, `package-lock.json` — version 10.62.0 and new QA/smoke commands
- Added `scripts/psBaselineV10610.json`, `scripts/validateProbabilityStatisticsV10620.mjs`, `scripts/verifyProbabilityStatisticsV10620.py`, `scripts/smokeProbabilityStatisticsBrowserV10620.py`
- Updated inherited validator *version allowlists and expected current aggregate counts* to recognize v10.62.0. Their legacy content integrity checks remain active.

No React UI screens, global navigation logic, learner-progress stores, or previous content payloads were modified.

## Recommended next release

Conduct a line-by-line editorial/mathematical review of the 80 draft lessons and 140 unseen questions; complete exact source references and PRC subcompetency tags, with emphasis on PS05 and PS08; only then implement a board-exam-eligible question selection mechanism.
