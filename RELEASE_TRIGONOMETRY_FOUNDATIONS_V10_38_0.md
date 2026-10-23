# v10.38.0 — Trigonometry Foundations (Topics 01–02)

## Delivered

- Preserved all 102 curriculum subtopics and 14 topics, as well as the existing two legacy Trigonometry review topics.
- Added **12 draft lessons**, each with a concept, a formula with usage guidance, two fully stepped worked examples, a common-error note, a self-check checkpoint and source guide. Retained four previous pilot lessons.
- Added **96 original four-option practice questions** (eight per newly linked subtopic). Retained 32 pilot questions; all 128 Trigonometry questions use the existing Practice Library and remain marked `draft-unverified` pending independent editorial sign-off.
- Topics 01–02 now have all **14 of 14** subtopics linked to draft lessons and **112** mapped questions.
- Across all Trigonometry groups, **16 of 102** subtopics are linked to lessons and 128 questions; **86** remain planned, including 14 other foundation subtopics in Topics 03–04.
- Reused `LearnReaderLayout`, existing practice catalog, and compatible manual progress IDs. Existing learner progress is not rewritten.
- Adjusted historical practice regression assertions solely to accommodate the 96 new catalog entries (overall catalog: 454 -> 550), retaining all preexisting Algebra and practice-bank assertions.
- Version: `10.38.0` in both package manifests.

## Reference guides

Lial, *Trigonometry* (10th ed.), Chapters 1–3; Schaum’s *Trigonometry* (4th ed.), Chapters 1–6; Young, *Trigonometry* (3rd ed.), Chapter 1; Kelley, *The Humongous Book of Trigonometry Problems*, Chapters 1–4; Sullivan, *Trigonometry: A Unit Circle Approach* (9th ed.), §4.1. Source books are reference guides; written lessons and questions are new content rather than transcriptions.

## Checks completed in this environment

- `validateTrigonometryV1036.mjs`, `validateTrigonometryPilotV1037.mjs` and new `validateTrigonometryFoundationsV1038.mjs`: PASS.
- `validatePracticeV1032.mjs`, `validatePracticeV1033.mjs`, `validatePracticeV1034.mjs`: PASS after updating obsolete fixed counts.
- `validateManualLearnV1035.mjs`, `validateManualLearnV10351.mjs`: PASS.
- `validateLearnReaderV1031.mjs`, `scanSourceImportsV1023.mjs`, `validateAlgebraReferenceContent.mjs`: PASS.
- New check verifies curriculum identity, 96 answer selections against separately authored answer ledger, selected arithmetic/trigonometric calculations, catalog counts, original pilot preservation, and Algebra progress preservation.

These validations are **not** full human mathematical review or end-to-end browser testing. The text/answer banks are **draft**. A full `npm ci` is blocked in the current isolated environment by missing npm cached dependencies (first unavailable package: `zwitch`). Consequently, `npm run lint`, `npm run build`, and browser runtime testing are not certified here.

## Running locally

```powershell
npm ci
npm run validate:trigonometry:v10.38
npm run validate:practice:v10.34
npm run lint
npm run build
npm run dev
```

Open Mathematics → Trigonometry. Topics 01–02 now have lessons and Practice actions; Topics 03–04 still include only the pre-existing Unit-Circle Definitions pilot lesson. Browser/back-forward and real-storage tests should be performed on a local machine after installing dependencies.

## Next content batch

Topics 03–04: 14 still-unlinked foundation subtopics (7 in Topic 03 excluding existing 03.2 -> 6, and 8 in Topic 04 -> 8); then Analytical Trigonometry. Continue independent editorial review of draft questions in all batches.
