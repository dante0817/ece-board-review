# BSECE Board Reviewer v10.45.0 — Vectors & Components

## Content added

Topic 10, **Vectors & Components**, is now connected to the existing Trigonometry screen and Learn Reader. All eight subtopics have original **draft** lessons, each with three essential formulas, two guided worked examples, a common-error reminder, a checkpoint, a source guide, and one of two reusable SVG diagrams.

| Subtopic | Draft lessons | Practice questions |
| --- | ---: | ---: |
| 10.1 Scalars and vectors | 1 | 8 |
| 10.2 Magnitude and direction | 1 | 8 |
| 10.3 Rectangular vector components | 1 | 8 |
| 10.4 Vector addition and subtraction | 1 | 8 |
| 10.5 Unit vectors and normalization | 1 | 8 |
| 10.6 Dot product and angle between vectors | 1 | 8 |
| 10.7 Cross product and orientation | 1 | 8 |
| 10.8 Applications in 2D and 3D | 1 | 8 |
| **Total** | **8** | **64** |

The content draws on the relevant vector chapters/sections of Sullivan (9th edition), Lial (10th edition), Young (3rd edition), and Kelley. All explanations and practice items in the app are newly authored; they are not copied textbook exercises.

## Integration and preservation

- Stable IDs from the v10.44.0 Trigonometry curriculum have **not been changed**.
- New lessons are registered in `TrigonometryScreen.tsx` and use the existing `LearnReaderLayout` and manual progress adapter.
- New questions are included through the existing `PRACTICE_CATALOG` with `draft-unverified` review status and stable `TRI45-` keys.
- The existing two broad Trigonometry topics remain accessible, and Algebra and earlier Trigonometry content retain their stored ID schemes.
- Two original vector diagram types have been added: `vector-components` and `vector-cross-product`.
- Historical tests with old fixed catalog totals were updated to exclude the newly added questions when checking prior release counts. Old questions remain required by those tests.

## Curriculum totals

- 14 topics; 102 subtopics, including seven optional advanced subtopics.
- **73** subtopics now have draft lessons; **29** remain planned.
- **584** Trigonometry practice questions; **422** existing Algebra practice entries; **1,006** total catalog entries.
- Topic 10 contains **8/8** draft lessons and **64** questions.

## Validation summary

Passed in this environment:

- v10.45 vector release validator: IDs, lesson blocks, question answer ledger, numeric dot/cross, quadrant, magnitude, torque, normalization, diagram contracts, and saved-progress preservation.
- Full historical v10.37–v10.44 Trigonometry validator chain, plus v10.36 curriculum validator.
- Practice Library regression (`scripts/validatePracticeV1034.mjs`), Manual Learn v10.35/v10.35.1, Learn Reader v10.31, Algebra reference content, content audit, and local source-import scan.
- Focused TypeScript checks for Practice and Learn Reader.

**Not verified:** the full TypeScript check, Vite production build, and browser runtime. `npm ci --offline` could not install `zwitch` because the registry response is not in the local cache; `npm run build` reports `vite: not found`. These are environmental dependency failures, not proof that the complete app will build successfully once dependencies are installed.

All new lessons and questions are **drafts pending independent mathematical/editorial review**. Automated sample calculations and answer-ledger checks do not constitute expert certification of every question.

## Running locally (PowerShell)

```powershell
npm ci
npm run validate:trigonometry:v10.45
npm run lint
npm run build
npm run dev
```

Open Mathematics → Trigonometry → Vectors & Components. The next planned topic is **11. Complex Numbers & Polar Form**.
