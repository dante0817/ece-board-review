# BSECE Board Reviewer v10.68.0 — Probability & Statistics Verification and Quality Controls

**Release status:** DEVELOPMENTAL. This is **not** a certified exam-question release. No scored PRC question has been approved.

## Scope and completed results

This release continues from the authentic v10.67.0 source and keeps its eight Probability & Statistics modules, **80 lesson drafts, 64 guided questions, and 140 independent practice questions (204 total question IDs)**. No existing lesson was replaced, and all lesson, question and learning-tracking IDs were preserved. The work adds reproducible original-PDF section checks, a first-pass conceptual review ledger, corrected question wording, and version-specific validators that do not depend on older hard-coded version allowlists.

| Validation | Actual outcome | Important limitation |
|---|---|---|
| Original-PDF research section checks | **80/80 passed** across Navidi, Walpole 9th, Tucker 6th, Morin and Mazur, with exact file SHA-256 comparison | A correct section/page is not proof of every lesson claim, worked example or formula |
| Numerical answer checks | **99/99 passed**, using the three historical independent numeric evaluators | Recalculation is not an approval of the model assumptions or pedagogy |
| Concept answer first-pass | **41 records checked and documented**; no obvious contradiction found during preliminary answer-choice review | The rationale is still developmental and **not independent qualified/editorial approval** |
| Controlled question changes | **5**, exclusively wording/assumption clarification | Numeric answer keys, option arrays, IDs and exam flags remain unchanged |
| Lesson-reader runtime-data checks | **80 readers and nonblank checkpoints** checked via TypeScript transpilation/VM | No React browser rendering executed |
| TS/TSX parsing | **326 source/script files parsed, 0 syntax diagnostics** | Syntax parsing is **not TypeScript type checking** |
| Scored exam eligibility | **0**, fail-closed; PRC joint competency/cognitive allocation feasibility remains false | 15 required Engineering Data Analysis slots remain unmet |
| npm dependency installation | **FAILED**; registry DNS `EAI_AGAIN`, npm exit-handler error | External dependencies could not be fetched in this environment |
| `npm run lint` | **BLOCKED**, TypeScript reports missing dependency/type packages | Cannot claim successful full project type checking |
| `npm run build` | **BLOCKED**, `vite: not found` | Cannot claim production-build or browser certification |
| Source archive | **ZIP CRC/integrity passed** | Must still run full app on development PC |

## Exact correction register

| Record ID | Verified editorial improvement | Answer key |
|---|---|---|
| `PS02-01-P02` | Counting problem now explicitly states every switch-stage combination is allowed; it does not imply statistical independence of random events | Unchanged: 64 |
| `PS02-04-P02` | Binary configurations are described as freely configurable, rather than statistically “independent” | Unchanged: 64 |
| `PS06-01-P01` | Specifies the two-sided test significance level **0.05** rather than relying only on the ±1.96 cutoffs | Unchanged: reject H0 |
| `PS08-03-P01` | States the **classical additive** randomized complete-block model with one observation per treatment–block cell | Unchanged: df 8 |
| `PS08-08-P01` | States the same additive RCBD assumption and warns that treatment-by-block interaction cannot be estimated separately | Unchanged: df 15 |

These corrections make the question stems consistent with the already-established methods and do not require new PRC exam approvals.

## Evidence and verification distinction

- **80 section/topic corroborations** were obtained by opening original user-provided PDFs, confirming the research page was readable, and confirming page-local section/topic terminology. Five PDF fingerprints also matched the v10.67.0 ledger. A few within-section pages lack a repeated numeric heading, and the special appendix, exercise and circular-arrangement entries use different numbering conventions. The six case notes are recorded in the new source ledger. **None of these automatically prove entire lesson passages.**
- **41 conceptual question reviews** document the current answer key, the supporting developmental reasoning, and remaining statistical design/assumption checks. They are not labelled certified, have `qualifiedExpertApproved=false`, and do not set `assessmentEligible`.
- **99 numerical questions** passed the pre-existing independently authored arithmetic evaluation functions. Every original and newly corrected question retains developmental status. Arithmetic validity alone cannot guarantee a justified confidence method, sampling plan, statistical model, or ANOVA assumption.

### Original PDF files needed for rerunning the source audit

`Stat for Engrs and Scientists 4ed Navidi(2).pdf`; `Probab  and Stat for Engrs 9ed Walpole et al.pdf`; `Applied Combinatorics 6ed Tucker.pdf`; `Probab for the Enthusiastic Beginner Morin.pdf`; `Combinatorics A Guided Tour Mazur.pdf`. **The books are not redistributed in the application ZIP.**

The reproducible PDF check requires the optional Python package `pymupdf`:

```powershell
python -m pip install pymupdf
python scripts/auditProbabilityStatisticsReferenceSectionsV10680.py --pdf-dir "C:\path\to\your\reference-PDF-folder" --report "reference_sections_check.json"
```

## Developer validation

After extracting the source ZIP, run:

```powershell
npm ci
npm run validate:probability-statistics:v10.68.0
npm run lint
npm run build
npm run dev
```

Then manually smoke-test the Probability & Statistics **Lessons**, **Formulas**, **Practice**, and **Review status** tabs, confirm that answered independent-practice questions are not pre-shown in lessons, and check that the actual scored board exam candidate pool is empty. Run the broader Mathematics regression test suite separately on a fully provisioned PC; its historical allowlists and run times have not been comprehensively updated in this release.

## Files introduced by v10.68.0

- `src/features/probability-statistics/psV10680SectionEvidence.json`: 80 records; corroboration status, actual source filenames, page numbers, editorial limitations.
- `src/features/probability-statistics/psV10680PreliminaryConceptReview.json`: 41 records; preliminary reasoning and unresolved assumptions, approvals false.
- `scripts/psBaselineV10680.json`: immutable release-10.67 content hashes for exact change control.
- `scripts/validateProbabilityStatisticsV10680.mjs`: structural/syntax/reader/compatibility/PRC-gate checks.
- `scripts/verifyProbabilityStatisticsV10680.py`: independent 99-answer arithmetic verification and question-change control.
- `scripts/auditProbabilityStatisticsReferenceSectionsV10680.py`: repeatable comparison with original PDFs.
- Five controlled question-record edits in `psQuestions.json`.
- Small `psContent.ts` and `ProbabilityStatisticsScreen.tsx` additions that display the provisional evidence coverage and its limits.

## Remaining release gates

A qualified independent subject-matter reviewer must inspect all 80 full lesson passages and their examples and all 140 questions, including four options, statistical assumptions, pedagogical suitability, and approved PRC cognitive classification. Record external signoff and page-level supporting sources before any scored exam flags are switched on. Complete npm dependencies, full TypeScript compilation, Vite production build, broader regression checks, and actual browser smoke tests. **Do not equate “80/80 section corroborated” with expert approval.**
