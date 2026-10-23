# BSECE Board Reviewer v10.60.0 — Probability & Statistics Integrity and PS05/PS08 Expansion

**Build type:** development source update, following the v10.59.0 read-only audit.  
**Baseline:** v10.58.0 initial Probability & Statistics source.  
**Publication qualification:** NOT a mathematically/editorially certified PRC exam bank; full Vite build and browser smoke tests remain unverified here.

## What changed

1. **Assessment-leakage correction:** The existing 64 v10.58.0 question IDs are retained as `guidedOnly: true` examples/checkpoints, excluded from the practice screen. New practice questions have fresh `-P01`, `-P02`, etc. identifiers and are not shown as worked examples in their lessons. Guided and independent question pools are exported separately in `psContent.ts`.
2. **New lesson coverage:** Six new PS05 Sampling & Statistical Intervals lessons (CLT cautions, one-proportion intervals, Welch two-sample intervals, paired intervals, two-proportion intervals, proportion sample-size planning) and six new PS08 DOE lessons (experimental units/pseudoreplication, one-way ANOVA with raw data, ANOVA decisions/assumptions, RCBD calculation, factorial main effects and interaction, follow-up comparisons).
3. **New practice:** 44 original, answer-hidden-until-submission development questions across all eight modules; 30 quantitative question answer keys independently recomputed with Python and 14 conceptual answer-key structures checked. PS05 and PS08 receive 16 each; six other modules receive 2 each. The original 64 guided problems remain available within existing lesson content.
4. **Statistical QA corrections:** Guided PS02-01-Q01 no longer implies that the counting product rule requires probabilistic independence; PS06-03-Q01 specifies an exact 0.05 Type-I error probability for the expected-value calculation; PS08-04-Q01 clarifies factor contrast direction; PS07-04-Q01 explicitly specifies intercept-included ordinary least squares for R².
5. **Compatibility:** Existing legacy topic IDs, question IDs, subject routes, learning-reader integration, self-reported manual tracking IDs, and local storage keys are preserved. New lessons use PS05-05..PS05-10 / PS08-05..PS08-10 and the same compatible tracking ID format.
6. **No false readiness:** All 108 question records explicitly have `assessmentEligible:false`; all 44 new practice items have `reviewStatus:'editorial-pending'`. Practice responses remain session-local and are not recorded as mastered/board-ready. The PRC Mathematics 100-question examination generator is not added or certified by this release.

## Content inventory

| Module | Lesson drafts | Guided legacy questions | Independent new practice |
|---|---:|---:|---:|
| PS01 Obtaining Data | 4 | 8 | 2 |
| PS02 Combinatorics | 4 | 8 | 2 |
| PS03 Probability | 4 | 8 | 2 |
| PS04 Random Variables | 4 | 8 | 2 |
| PS05 Sampling & Intervals | 10 | 8 | 16 |
| PS06 Hypothesis Testing | 4 | 8 | 2 |
| PS07 Regression | 4 | 8 | 2 |
| PS08 Design of Experiments | 10 | 8 | 16 |
| **Total** | **44** | **64** | **44** |

The 44 lessons are still *draft* learning units. The material is richer than v10.58.0 but not a complete lesson-by-lesson coverage of the proposed 129 learning outcomes. In particular, Welch degrees of freedom, detailed multiple-comparison procedures, RCBD model assumptions, and additional DOE datasets still need expanded treatment.

## References consulted for chapter/section coverage

Primary: Montgomery & Runger 3e Chs. 6–8, 13–14; Walpole et al. 9e Chs. 8–9, 13–15.  
Engineering supplements: Navidi 4e §§4.11, 5.2, 5.5–5.7, 9.1–9.5; McClave & Sincich 13e §§10.1–10.5.  
These are *development source-navigation pointers*. Exact edition/page traceability and full equation-by-equation independent editorial signoff remain pending. All added question/lesson wording is original, not copied wholesale from books.

## Validation performed on this source

- `npm run validate:probability-statistics:v10.60.0`: **PASS** (Node source/data invariants + independent Python numerical checks).
- Original 32 guided numerical audit keys remain compatible with the prior v10.58.0 validator; that source-level validator **PASS**.
- 60 original guided question records preserve exact v10.58.0 core payloads, verified by SHA-256; 4 have the explicitly enumerated, controlled wording corrections without changed keyed numerical answers.
- Twelve newly added lessons have source references, explicit method, formula, model caution, separate original worked example and question checkpoint.
- The prior Mathematics dashboard source-level validation **PASS**; analytic geometry and tracking source checks **PASS** within the inherited regression chain. The full inherited chained suite was NOT completed here because its later dependency/TypeScript checks were slow; do not interpret partial log as full-suite success.
- `npm run lint`: **FAILED due to missing project dependency declarations on disk**, including React and Vite; installation was not performed here. Diagnostic excerpts show unresolved React/Vite/lucide types, not proof of a clean typecheck.
- `npm run build`: **FAILED** with `vite: not found` because dependencies are not installed in this execution environment.
- Browser/Playwright smoke: **NOT RUN**; it requires installed dependencies and a running app.

## Development machine verification

```bash
npm ci
npm run validate:probability-statistics:v10.60.0
npm run qa:mathematics:v10.60.0
npm run lint
npm run build
npm run dev
```

With the dev app running and Playwright Chromium available:

```bash
npm run smoke:probability-statistics:v10.60.0
```

If the HMR WebSocket port 24678 conflicts with another running development server, close the stale process or configure Vite HMR on a free port before the smoke test.

## Remaining release gates

1. Full dependency-installed lint, Vite build, and real-browser routing/selection/responsive QA on the target PC.
2. Source-independent expert review of the 14 new conceptual answer keys and the 32 legacy conceptual records; model-assumption review for both old and new numerical items.
3. Further original PS05/PS08 lessons and unseen questions to cover the rest of the 129 proposed outcomes; full regression/hypothesis-testing modules PS06/PS07 next.
4. TOS subcompetency and official cognitive-level tagging, adequate independent question supply, and persistent graded attempt handling **before** enabling PRC-aligned exams.

**No student records, databases or localStorage schema were intentionally migrated.** The download is the source project, not an installed application.
