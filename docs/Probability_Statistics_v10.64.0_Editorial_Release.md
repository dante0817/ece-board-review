# BSECE Board Reviewer v10.64.0 — Probability & Statistics Editorial Corrections and Assessment Preflight

**Baseline application:** v10.62.0 source. **Audit basis:** v10.63.0 editorial report, workbook and machine-readable crosswalk.  
**Release type:** Focused source update, not a content expansion or board-exam certification.  
**Status:** Ready for development-machine installation and full browser/build checks. **NOT production-certified.**

## What changed

### Question-level corrections (exactly 2, existing IDs maintained)

| Existing question | Defect | Correction | Key |
|---|---|---|---|
| `PS01-02-P01` | “Mean deviation” was used for arithmetic mean | Explicitly asks for **arithmetic mean** of 3, 5, 7, 13 mV | **7 mV, unchanged** |
| `PS03-04-P01` | “Standby” implied an unspecified switching/coverage model | Specifies independent **parallel** modules, perfect coverage, and no common-cause failure | **0.99, unchanged** |

Neither item is marked independently editorially approved. Answer choice indexes, numerical audit arguments, and all existing question IDs remain unchanged.

### Thirteen targeted lesson edits

| Lesson ID | Improvement | v10.63 finding |
|---|---|---|
| `PS01-07` | Grouped class-midpoint approximations versus exact frequency-weighted statistics | F007 |
| `PS01-09` | Link covariance as descriptive prerequisite to PS07 | F015 |
| `PS02-06` | State when circular permutations use `(n−1)!`, numbered positions and reflection rules | F018 |
| `PS03-04` | Parallel versus standby reliability and coverage assumptions | F002 |
| `PS03-07` | Shared-power/common-cause counterexample to independent reliability | F008 |
| `PS04-10` | `np`, `n(1−p)` screening, exact binomial alternative and continuity-correction direction | F006 |
| `PS05-06` | Wald limitations; Wilson-score interval as alternative with formula | F003 |
| `PS05-07` | Welch–Satterthwaite degrees of freedom and independence/normality checks | F004 |
| `PS06-10` | Chi-square GOF fitted-parameter degrees of freedom and expected-count cautions | F009 |
| `PS07-07` | Distinguish confidence interval for mean response versus individual prediction interval | F010 |
| `PS08-08` | Additive unreplicated randomized-block model and non-identifiable interaction | F011 |
| `PS08-09` | Distinguish difference-in-differences, conventional AB effect and coded interaction coefficient | F005 |
| `PS08-10` | Preplanned contrasts versus exploratory multiple comparisons | F017 |

These corrections improve the developmental text and do not constitute complete passage-level proof of every lesson.

### New editorial evidence and assessment metadata

Located in `src/features/probability-statistics/`:

- `psLessonEvidence.json`: 80 lesson-level research locators, including source, section title and 1-indexed PDF page. **All are marked `table-of-contents-only`, `passageVerified: false`.** Data is imported from the v10.63 audit, not invented or promoted to independently verified citations.
- `psQuestionReview.json`: all 140 independent practice question IDs with source-derived **provisional** cognitive and PRC mapping, plus explicit independent editorial, statistical-model, answer/distractor, passage-verification and approved-cognitive fields. Every approval flag is **false**, every approved cognitive level **null**.
- `psAssessmentBlueprint.json`: versioned PRC 2022 Engineering Data Analysis 5.1–5.5 blueprint (2, 5, 2, 2, 4) and aggregate cognitive-level targets (2, 3, 6, 4). PS02 and PS03 remain foundation prerequisites, **not additional PRC quotas**.
- `psContent.ts`: `psIsBoardExamEligible`, `PS_BOARD_EXAM_QUESTIONS`, `PS_READINESS_PREFLIGHT`, `PS_COGNITIVE_PREFLIGHT`, and `PS_BOARD_EXAM_READY` with **fail-closed checks**. Provisional data cannot become scored merely because a topic ID exists or an answer is numerically correct.
- `ProbabilityStatisticsScreen.tsx`: **Review status** tab showing actual approved counts, PRC targets and explicit developmental disclaimers. Source locators are also shown in the lesson reader with clear TOC-only labeling.
- `PSPracticePanel.tsx`: editorial-pending status displayed after question feedback; session-only practice behavior preserved.

No new questions or lessons were added, and no old IDs, saved progress keys, guided-only flags, grading eligibility flags, source question origin or tracking behavior was changed.

## Inventory (unchanged)

| Item | Count |
|---|---:|
| Modules | 8 |
| Lesson drafts | 80 (10 per module) |
| Guided lesson question records | 64 |
| Independent practice question records | 140 |
| Independent calculation questions | 99 |
| Independent conceptual questions | 41 |
| Total question records | 204 |
| Questions approved for scored PRC board exams | **0** |

## Validation performed in this environment

**Passed:**

1. `npm run validate:probability-statistics:v10.64.0` using globally available TypeScript (this environment lacks local `node_modules`): JavaScript/TypeScript syntax checks, JSON crosswalk consistency, prior-answer arithmetic scripts, record hash preservation, and fail-closed metadata.
2. All 99 independent numeric answers recalculated by existing separately coded Python algorithms (30 + 23 + 46). This validates **numeric outputs**, not all statistical model assumptions or conceptual correctness.
3. SHA-256 protection: 189 prior question records and 67 prior lesson records unchanged. The **only** editorial modifications are the 2 named questions and 13 named lessons. All original IDs preserved.
4. Actual `psContent.ts` transpiled to CommonJS and executed without React/Vite to verify it exports **80 lesson readers, 0 approved exam items, an unready blueprint, and correctly reported gaps** of `5.1=2; 5.2=5; 5.3=2; 5.4=2; 5.5=4` and cognitive `2/3/6/4`.
5. Earlier v10.58, v10.60, v10.61, and v10.62 JavaScript source-level checks executed individually. The historical v10.60/v10.61/v10.62 metadata checks were updated to recognize **v10.64.0** while retaining explicit baselines for unchanged records; the v10.64 validator verifies named exceptions.

**Blocked / not certified:**

- `npm ls --depth=0`: local project dependencies are absent.
- `tsc --noEmit`: missing React, Node and other package types; not a meaningful complete application typecheck.
- `npm run build`: `vite: not found`.
- Browser smoke tests: no running built/dev application or installed browser-testing project dependencies. **No browser pass is claimed.**
- Broader inherited Mathematics QA chain: not newly completed in this release.
- Passage-by-passage audit of each formula and question/distractor: **pending**, despite table-of-contents research locators.
- All 41 conceptual questions require independent editorial review; all 99 numeric questions still need complete statistical-model review.

## Installation / verification on your PC

Extract ZIP and open the project directory in VS Code. Then:

```powershell
npm ci
npm run validate:probability-statistics:v10.64.0
npm run qa:mathematics:v10.64.0
npm run lint
npm run build
npm run dev
```

In the UI, open **Mathematics → Probability & Statistics → Review status** and verify the five competency targets are visible with **0 approved** questions. Navigate into edited lessons and the two corrected practice questions to confirm the new wording and cautions. Confirm other Mathematics screens still work, study tracking continues to use pre-existing IDs, and no draft question appears in certified/mock-exam banks.

If an HMR WebSocket port conflict occurs in development, check for an existing Vite process before stopping it; the previous `DISABLE_HMR=true` fallback remains available when needed.

## Remaining release gates and next milestone

The next editorial stage must verify actual textbook passages and statistical assumptions for all 80 lessons and all 140 unseen questions, inspect conceptual question distractors for unique defensible keys, and commission independent reviewer signoff for items to be eligible for scored tests. Formal PRC mapping must be validated question by question, including approved cognitive levels. Then complete `npm ci`, lint, build and browser/regression tests.

**Do not flip `assessmentEligible` or any independent-review flags simply to make the exam blueprint complete.** An adequate quantity of practice questions does not establish certification.
