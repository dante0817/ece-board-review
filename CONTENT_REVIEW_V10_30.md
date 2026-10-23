# BSECE v10.30.0 — Content Accuracy and PRC TOS Coverage Review

**Baseline:** the v10.29.0 source release, which incorporates the Codex-corrected v10.28.0a source.

**Authoritative external reference:** PRC Professional Regulatory Board of Electronics Engineering, Resolution No. 10 (2022), Annex A, *Enhanced Tables of Specifications*: https://www.prc.gov.ph/sites/default/files/EE2022-10%20TOS.pdf. The official course rows in this document specify a 100-item target **within each subject**. This release has **not** verified every subtopic or cognitive/difficulty cell.

## Scope and findings

Audited the assembled static timed-mock and Algebra reference-assessment pool; not every individual step, flashcard, generator, or separate practice screen in the application. The audit traverses all 368 records, normalizes repeated stems to 367 unique prompts, and produces full question- and 34-course CSV ledgers.

| Measure | Current finding |
|---|---:|
| Static questions reviewed structurally | 368 |
| Distinct question stems | 367 |
| Duplicate stem | ref-assess-q-ineq-9 duplicates ref-assess-q-ineq-3 |
| Provisionally assigned distinct questions | 152 |
| Unmapped distinct questions | 215 |
| Previously numeric-fixture-checked | 34 |
| Previously generator-checked | 96 |
| Awaiting manual/expert verification | 238 |
| Missing separate formula metadata | 203 |
| Missing explanations / missing keyed options / repeated exact option text | 0 / 0 / 0 |
| Course-quota selection for 50 requested | 47 available; 3 unfilled |
| Course-quota selection for 100 requested | 83 available; 17 unfilled |
| Expert answer-key approvals | 0 recorded |
| Subtopic/cognitive-cell certifications | 0 recorded |
| Verified Canon F-789SGA device workflows | 0 recorded |

Missing separate key formula metadata is **not** the same as an incorrect answer; an explanation may already include the needed mathematics. A numerical fixture confirms an arithmetic result for its authored cases, not every possible alternate solution or the item's appropriateness for the official examination.

## Expanded mathematical checking

The new `scripts/validateContentV1030.mjs` independently re-implements the arithmetic for the **48 v10.14 families (96 numerical variants)** and **16 v10.16 families (32 variants)**. It checks each computed result against the keyed, correctly rounded option and unit. It also checks all 368 items for four options, unique IDs and exact option texts, keyed-option presence, and an explanation. A 16-row Boolean truth-table check verifies the existing De Morgan mock question, including a counterexample to one distractor. All these tests pass. They do not constitute external expert grading or physical calculator testing.

No existing question ID, key, learner-score schema, or question stem was silently changed. Previously verified corrections to optical-fiber numerical aperture and right spherical trigonometry remain present.

## Five provisional course-to-subtopic mapping concerns

These are **editorial review flags**, not proof that the numerical results or answers are wrong. The two high-priority findings concern questions that do not demonstrate one of the Mathematics subtopics explicitly listed in the PRC Annex A:

1. `v1016-math-coulomb-force` — assigned to Mathematics Electromagnetics, whose listed Mathematics subtopics are vector analysis; gradient/divergence/curl; and vector integral theorems. Numerical Coulomb-force substitution does not demonstrate these named subtopics.
2. `v1016-math-discrete-rms` — assigned to Mathematics Signals/Spectra/Signal Processing, which lists Z-transforms, convolution, and correlation. A four-sample RMS calculation does not demonstrate these named subtopics.

Three further assignments warrant expert subtopic review: `v1016-math-arithmetic-mean`, `v1016-math-weighted-mean` (Engineering Data Analysis), and `v1016-est-dac-code-voltage` (EST Electronics 3).

All five family warnings (10 numeric variants) are recorded in `CONTENT_TOS_SUBTOPIC_FLAGS_V10_30.csv` and are shown in the app's TOS setup disclosure. Historical **course-level provisional mappings are preserved** to avoid silently changing existing examination selection and score records. They **must not** be presented as proved subtopic coverage. The next editorial decision should either (a) replace mismatched families with genuine subtopic problems, or (b) remove them from future TOS-targeted selection with documented backward-compatible score handling.

## TOS course gap priorities

At a 100-question TOS-quota preview, these courses lack sufficient *distinct available practice prompts* under the current **provisional** category mapping:

- Mathematics: Differential Calculus (2 missing), Integral Calculus (2), Differential Equation (2), Advanced Engineering Mathematics (1) — **7** unfilled.
- GEAS: ECE Laws, Contracts, Ethics, Standards & Safety (2) — **2** unfilled.
- Electronics Engineering: AC Electrical Circuits (2), Logic Circuits and Switching Theory (1), Microprocessor & Microcontroller Systems and Design (2) — **5** unfilled.
- EST: Principles of Communications (1), Data Communications (2) — **3** unfilled.

Together: **17** unfilled. Filling these numeric quotas would still not certify official subtopic, cognitive-level or difficulty distribution. Also, a family with two parameter variants still covers only one reasoning pattern, not two independent competencies.

## Verification limits and next actions

- **Confirmed automated checks:** key presence, exact option uniqueness, metadata coherence, 128 alternate mathematical computations, and explicit course-quota calculations.
- **Unverified editorial quality:** the other 238 manual-review-required items, alternative answer equivalence beyond tested cases, appropriateness and reliability of distractors, reasoning-depth/difficulty, historical correctness of every step and all interactive Algebra questions outside this static pool.
- **Unverified PRC compliance:** subtopics and difficulty/cognitive matrices for all 34 courses. PRC has not approved or endorsed any question.
- **Unverified operations:** post-v10.29 full npm build and real Windows browser regression; physical Canon F-789SGA hardware procedures.

Prioritize independent expert review of question stems, correct-answer equivalence, exact official TOS subtopics, and the unmapped question queue before adding large quantities of new questions. Do not introduce invented TOS mappings or promote preliminary calculator guides to approved status.

## Outputs

- `CONTENT_QUESTION_LEDGER_V10_30.csv` — all 368 question records, assessment keys, metadata, duplicate and mapping state.
- `CONTENT_TOS_COURSE_AUDIT_V10_30.csv` — all 34 official course rows, tentative question availability, distinct families, 50/100 quotas and shortages.
- `CONTENT_TOS_SUBTOPIC_FLAGS_V10_30.csv` — five specific concerns with official-page evidence and affected IDs.
- `CONTENT_AUDIT_SUMMARY_V10_30.json` — machine-readable source measurement with precise limitations.
