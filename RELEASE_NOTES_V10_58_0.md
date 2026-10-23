# BSECE Board Reviewer v10.58.0 — Probability & Statistics (Release B, Initial Instructional Set)

## Scope and status

Built from the supplied **v10.57.0 Simplified Mathematics GUI** source. Adds a functioning dedicated **Probability & Statistics / Engineering Data Analysis** subject. This is an **initial eight-module instructional draft**, **not** a fully completed or PRC-certified subject bank.

### Newly available

- Direct Mathematics → Probability & Statistics subject navigation, including recent-subject continuation.
- Eight modules (PS01–PS08) aligned with the previously approved learning curriculum; foundation counting and probability remain prerequisites without separate invented TOS quotas.
- **32 original introductory draft lessons**, four per module, using the existing Learn Reader: concept, applicability, formula, worked example, practice prompt and development reference mapping.
- **64 original multiple-choice practice questions** (32 numerical + 32 conceptual); one-question-at-a-time Check Answer → explanation workflow, lesson and module filtering and session-only missed-question review.
- Module-specific reference notes and a searchable formula reference grouped by module.
- Existing manual self-reported reading tracker, with compatibility-safe `chapter-top-ps-##-##` IDs; the existing progress ID validator, storage key, and schema are unchanged.
- Honest draft labels; no fabricated student score, readiness metric, or examination completeness claims.

### Content and sources

Reference section mappings follow the approved source roles, not copied exercises: Montgomery & Runger 3e, Walpole et al. 9e, Tucker 6e, Balakrishnan, Morin and Lipschutz. Existing Devore, Hayter, DeCoursey, Ang & Tang, Ahn and Schaum's Statistics are designated supplements for future content expansion and review. The app contains **original examples and original questions**; no source PDF or instructor solutions manual is bundled. Chapter-level source mappings are an authoring guide; detailed exact section/page mapping and external editorial approval remain pending.

| Module | Lessons | Questions | PRC mapping |
|---|---:|---:|---|
| PS01 Obtaining Data & Descriptive Statistics | 4 | 8 | 5.1 |
| PS02 Combinatorics & Counting | 4 | 8 | Prerequisite |
| PS03 Probability & Bayes | 4 | 8 | Prerequisite |
| PS04 Random Variables & Distributions | 4 | 8 | 5.2 |
| PS05 Sampling & Intervals | 4 | 8 | 5.2 |
| PS06 Hypothesis Testing | 4 | 8 | 5.3 |
| PS07 Regression & Correlation | 4 | 8 | 5.4 |
| PS08 Design of Experiments | 4 | 8 | 5.5 |

### What is not yet included

- Comprehensive subtopic coverage, a large exam-caliber practice bank, and full PRC subtopic/cognitive-level allocations.
- Full external editorial verification of the 32 conceptual answers and statistical application assumptions; these received structural QA only.
- New question attempts do **not** feed into global graded mastery, spaced repetition, or PRC board-readiness. They are explicitly **session-only** for this developmental subject.
- Full Mathematics 100-question PRC simulator and shared ECE tracks remain Release C.
- Modern statistical visualizations, interactive distribution calculators, and detailed textbook-section citation matrix are future enhancements.

## Source changes

- Added `src/features/probability-statistics/{ProbabilityStatisticsScreen.tsx,PSPracticePanel.tsx,psContent.ts,psModules.json,psLessons.json,psQuestions.json}`.
- Added `probability-statistics` to `ScreenType`, `App` dispatch and dedicated-scroll views, Mathematics sidebar-active detection, and Mathematics catalog (5 available / 7 planned subject destinations).
- Reused existing permitted `chapter-top-*` tracking IDs; the shared `ece_manual_learn_tracking_v1` ID validator is byte-identical to v10.57.0.
- Preserved old lesson, question and persisted learner-data formats. No migration script or localStorage reset.
- Added `scripts/validateProbabilityStatisticsV10580.mjs` and `scripts/smokeProbabilityStatisticsBrowserV10580.py`; extended historical source-validator version whitelists to recognize v10.58.0 without removing their existing assertions.
- Updated package and lock versions to `10.58.0` and registered QA commands.

## Verification

- `npm run qa:mathematics:v10.58.0` **PASS** (v10.58.0 content + v10.57.0 dashboard + inherited v10.56.0 Geometry/Trigonometry chain).
- 32 calculations independently recomputed against numeric audit rules; all 64 answer records have structurally valid distinct options, stable IDs and module mapping. The 32 conceptual-key checks are structural, not independent proof of correctness.
- Nine affected TS/TSX source files parsed and transpiled without syntax errors.
- Browser-storage round-trip with legacy Algebra, Trigonometry, and Geometry records passed; corrupted old storage is protected from overwrite. New Probability & Statistics keys remain valid under the v10.57.0 validator.
- 28 pre-existing protected source-file hashes retained.
- `npm run build`: **BLOCKED BY ENVIRONMENT**, `vite: not found` (node_modules absent).
- `npm run lint`: **BLOCKED BY ENVIRONMENT**, package/type definitions missing, including React, Node and server dependencies.
- `npm run smoke:probability-statistics:v10.58.0`: **NOT RUN** (requires running development app and installed Chromium/Playwright).

## Running on a development PC

```bash
npm ci
npm run qa:mathematics:v10.58.0
npm run lint
npm run build
npm run dev
# In another terminal with the app running:
npm run smoke:probability-statistics:v10.58.0
```

## Rollback

1. Back up browser/learner data using the application's export/backup method before upgrading.
2. To undo the v10.58.0 UI/content release, redeploy the original v10.57.0 source and existing persisted data.
3. **Do not clear browser storage.** v10.57.0 safely ignores new `ps-*` tracking IDs only if it does not need to write validated manual tracking records. The new `chapter-top-ps-*` progress keys remain syntactically valid under the original v10.57.0 validator; older app versions simply do not display their new lessons. No backward migration is needed for the manual tracking store. Keep a backup of learner data as an additional precaution.
