# BSECE Board Reviewer v10.15.0 — Official TOS Course-Quota Alignment

**Status:** SOURCE RELEASE CANDIDATE; NOT production-certified or PRC-endorsed.

## Authoritative sources

- [PRC Board Resolution No. 10, s. 2022](https://www.prc.gov.ph/sites/default/files/EE2022-10%20published.pdf) adopts the enhanced TOS for the EELE and subsequent schedules.
- [Enhanced Table of Specifications — Annex A (25 pages)](https://www.prc.gov.ph/sites/default/files/EE2022-10%20TOS.pdf) lists course weights, competencies, subtopics, and cognitive-level targets. The **34 parent course rows** (8 Mathematics, 11 GEAS, 9 Electronics Engineering, 6 Electronics Systems and Technologies) are the only directly implemented course target level in v10.15.
- The October 2026 examination program still determines subject-area weights (20/30/20/30); subject weights must not be confused with course-level distribution inside each 100-item board-subject TOS.

## Changes

1. `src/data/officialTos.ts` encodes course ID, official name, per-subject item target and source PDF page for every parent course. Per-subject target totals are independently tested to sum to 100 each.
2. Adds **48 explicit editorial problem-family mappings** from the v10.14 question bank and **24 carefully selected legacy mock-question mappings**; all remaining items are deliberately *unmapped*, not classified by keyword or silently assigned to a plausible course.
3. `src/domain/exam/tosCoverage.ts` implements area and course quotas with largest-remainder apportionment, duplicate-prompt suppression, and selection that favors distinct families. **No substitution from another course or board area** is allowed when a target lacks questions.
4. Adds **TOS Course-Quota Practice** alongside existing unweighted and four-area subject-weight practice. Setup shows each PRC course, target, available family count, supplied questions, and shortages. Links directly to the official PRC TOS PDF.
5. Assessment result and Test History screens show course-level delivered counts, scores, and **Not assessed** when there are no items. Test records preserve TOS blueprint ID, course results, graded item course IDs, and area totals; automatic score-vs-item validation rejects inconsistent records. Older tests retain their original evidence status.
6. Generates reproducible, traceable **course coverage CSV**, **question-by-question audit CSV**, and a **content review gap report**. No new questions were imported from the PRC exam or copyrighted books.
7. Updates application documentation and release metadata; existing learner curricula, paths and previous test records are not reset.

## Verified findings

| Preview | Original v10.14 subject-weight mode | v10.15 conservative TOS course-target mode |
|---|---:|---:|
| 50-question request | 50 selectable | 32 selectable, 18 course shortfalls |
| 100-question request | 100 selectable | 55 selectable, 45 course shortfalls |

This is NOT a board-representative coverage percentage. It is a count of selectable questions under course quotas using **provisional editorial assignments**. The underlying pool includes **336 question entries, 335 distinct prompts; 120 provisionally mapped and 215 unmapped distinct prompts**.

## Content integrity and outstanding verification

- The v10.14 source bank contains 96 newly authored numerical questions in 48 families, with **43 independent golden-value fixture checks**. Other key checks are internal generator/formula checks, not subject-matter expert verification.
- The v10.15 static audit flags **203 missing optional `keyFormula` fields** among legacy/reference items and **one duplicated normalized prompt**. These are content metadata/selection issues, **not 204 proven wrong answers**.
- All new editorial TOS assignments require independent subject expert approval, review of each mapped subtopic, easy/moderate/difficult distribution, equation assumptions, unit precision, distractors and explanations.
- Certain ordinary Algebra topics may support foundational learning but are not necessarily examinable under a named Mathematics 2022 TOS course. They remain accessible in Guided Learning / mixed practice without being counted as TOS-aligned.
- Current assessment remains locally self-attested and is neither an official past PRC paper nor a proctored examination.

## Acceptance tests and deployment limitations

`npm run validate:tos:v10.15` covers official category totals, mapping validation, multiple question counts, duplicate/prompt handling, non-borrowing, old/new mode coexistence and saved-course-result reconciliation. Previous validation scripts cover the app's earlier assessment/curriculum functionality. `npm run lint:board` verifies focused strict TypeScript compilation for the TOS engine.

**Pending:** full application TypeScript compilation, production bundling, interactive browser testing, accessibility checks and SME question review. Dependency packages were not available for full-install validation in the execution environment, so this ZIP is a source candidate only.

## Recommended v10.16 follow-up

Complete human item-by-item answer review, independently verify questionable stems and solution paths, expand original families in official TOS deficit areas (especially Mathematics, GEAS subjects beyond Physics/Chemistry, Electronics microcontrollers, EST data and system integration), and track subtopic/difficulty-cell coverage, not just parent-course quotas.
