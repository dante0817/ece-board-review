# BSECE Board Reviewer v10.69.0 — Probability & Statistics Review Integrity Release

**Date:** 2026-10-15  
**Baseline:** v10.68.0 source ZIP  
**Type:** Source-level assessment-integrity improvements. **Not an expert editorial certification.**

## Executive summary

This release strengthens future certification controls without misrepresenting the status of the content. Existing drafts remain **80 lessons, 140 independent development practice questions (99 numerical + 41 conceptual), and 64 guided questions**. All **204 question records and all 80 lesson records** match v10.68.0 exactly. No original question prompt, answer, explanation, or lesson text was modified.

### Changes

1. **Version-bound SHA-256 review fingerprints.** Each of the 140 editorial-review records now stores `questionSHA256`; each of the 80 lesson-evidence records stores `lessonSHA256`. The exam eligibility gate recalculates hashes from current content and requires exact matches. The fingerprints cover stems, options, answer index, steps, restrictions, relevant numerical data, and supporting lesson concepts/formulas/examples. A changed question or lesson invalidates its old eligibility.
2. **Stronger fail-closed release gate.** To pass, a question must have explicit `approved` review statuses and eligibility, verified source-passage status, exact lesson mapping and direct PRC competency mapping, approved cognitive classification, independent expert/editorial signoffs, verified statistical model and answer/distractor checks, and valid matching fingerprints. Every present question still fails at least one (indeed many) gates.
3. **Exact deterministic 15-question PRC blueprint selection.** `psSelectJointBlueprintIds()` returns **15 distinct IDs** only when the approved pool can jointly satisfy the official competency targets **2/5/2/2/4** and cognitive targets **2/3/6/4**. Otherwise it returns `null`. `psCanFillJointBlueprint()` remains available as a compatible boolean wrapper. The active app selection currently returns `null` because no questions are certified. A future PRC exam generator must use the selection only after the full release process; this release does not add a scored exam.
4. **Safe fingerprint maintenance utility.** `npm run check:ps-fingerprints:v10.69.0` checks the registry read-only. For an intentionally revised item, `node scripts/checkProbabilityStatisticsReviewFingerprintsV10690.mjs --refresh` updates fingerprints but **revokes related signoffs and exam eligibility**; it never grants approval. Review changes with version control before using the refresh option.
5. **Review Status UI clarification.** It explains why a later content edit revokes prior approval and why deterministic PRC selection cannot be used with development-only content.

### Baseline and review metadata

| Record type | Count | Status |
|---|---:|---|
| Lesson drafts | 80 | All preserved, none passage-certified |
| Independent practice — numerical | 99 | Arithmetic checks passed; model/expert review pending |
| Independent practice — conceptual | 41 | Preliminary assistant review only; qualified review pending |
| Guided instruction questions | 64 | Preserved |
| Question editorial fingerprints | 140 | SHA-256 match |
| Lesson review fingerprints | 80 | SHA-256 match |
| Scored PRC items | **0** | Gate closed |
| Fully selectable 15-item PRC blueprint | **No** | Returns `null` |

## Tests actually performed

| Check | Result | Meaning |
|---|---|---|
| `npm run validate:probability-statistics:v10.69.0` | **PASS** | Source-level counts, ID preservation, 220 fingerprints, exact selection and adversarial tests, 99 arithmetic recomputations |
| `npm run check:ps-fingerprints:v10.69.0` | **PASS** | Current review hashes match 80 lessons and 140 development questions |
| Sandbox content-edit simulation | **PASS** | Read-only checker detects changed question, `--refresh` revokes approvals and makes registry consistent |
| `python scripts/verifyProbabilityStatisticsV10680.py` | **PASS** | Historical v10.68 arithmetic checks and conceptual-record structure |
| `python scripts/auditProbabilityStatisticsReferenceSectionsV10680.py --pdf-dir <PDF_DIR>` | **PASS 80/80** | Five uploaded source PDFs match topic/section/page locators, *not* passage-level certification |
| Full `npm run lint` | **BLOCKED** | React, Node and other project dependencies/types missing; `tsc` reports unresolved imports |
| Full `npm run build` | **BLOCKED** | Vite is not installed (`vite: not found`); npm registry lookup fails (`EAI_AGAIN`) |
| Interactive browser smoke | **NOT RUN** | Cannot serve the full app without npm dependencies |
| Full passage-level mathematical/editorial validation | **NOT COMPLETED** | Independent expert review still needed; no release gate overridden |

**Note:** The historical v10.66 and v10.67 Python scripts contain strict comparisons against their own release's specific edit lists. They fail when run against newer, legitimately edited source data. Those failures are incompatible historical-baseline assertions, not successful tests and not independently established new mathematical errors. The current v10.69 validator instead checks exact v10.68 lesson/question identity, plus existing v10.68 arithmetic regressions.

## Run on the development PC

```powershell
npm ci
npm run check:ps-fingerprints:v10.69.0
npm run validate:probability-statistics:v10.69.0
python scripts/auditProbabilityStatisticsReferenceSectionsV10680.py --pdf-dir "C:\path\to\your\reference-pdfs"
npm run lint
npm run build
npm run dev
```

The PDF audit requires `pymupdf` and exact original reference PDFs. For production readiness, record the `npm ci` result, `npm run lint`, `npm run build`, browser smoke results, and reviewed lesson/question signoffs. **Do not enable examination selection based solely on the passing local SHA-256 or numerical tests.** These hashes prevent accidental stale approvals, not malicious modifications to a source distribution that also controls its review registry.

## Remaining release blockers and recommended next phase

1. Complete full source-backed, passage-by-passage review of all **80 lessons**, including examples, formulas and assumptions.
2. Obtain qualified independent verification of **140 question stems, choices, solutions, assumptions and cognitive mapping**. The 41 conceptual items have only a preliminary logical review; the 99 arithmetic items still need model/wording review.
3. Obtain a successful production TypeScript build and a real browser regression pass in the local development environment with npm dependencies installed.
4. After independent signoff and verified manifest updates, test the 15-item selection using *actual approved* questions in a separate controlled staging release.

**Certification:** 0 questions approved. All learning content remains explicitly developmental. No student progress or question IDs were migrated.
