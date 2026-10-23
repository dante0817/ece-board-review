# BSECE Board Reviewer v10.44.0 — Topic 09: Oblique Triangles & Applications

Source update based on v10.43.0. Contains the complete application source (not a standalone preview).

## Added

- Eight original **draft** lesson records, one for each stable Topic 09 curriculum ID: problem types, Law of Sines, SSA ambiguous case, Law of Cosines, area with included angle, Heron's formula, inradius/circumradius, surveying/navigation.
- 64 original **draft** multiple-choice questions (8 per subtopic) with one keyed answer, explanatory solution, stable `TRI44-09N-NNN` IDs, source topic mapping, and answer ledger.
- Two original, accessible SVG diagrams: oblique triangle labeling and acute SSA case with two possible triangle solutions.
- Native integration with the preexisting Learn Reader, Practice Library and manual progress adapter. No new progress storage format or migration of historical topics.
- Topic 09 numeric and persistence source validator, integrated into the previous full Trigonometry validation chain.
- Preserved historic validations while converting brittle whole-catalog count checks into checks of the original bank baseline.

## Curriculum totals

14 topics / 102 subtopics; 65 subtopics have connected draft lessons; 37 remain planned. Of these, the 95 core subtopics contain 65 draft lesson links. Trigonometry: 520 draft questions; Algebra: 422 existing questions; 942 Practice Library total.

## Reference mapping

Reference guidance inside lessons points to Lial, *Trigonometry*, 10th ed. §§7.1–7.3; Sullivan, *Trigonometry: A Unit Circle Approach*, 9th ed. §§4.2–4.4; Schaum's *Outline of Trigonometry*, 4th ed., Chs. 11–12; and Kelley, *The Humongous Book of Trigonometry Problems*, Chs. 12–13. Original prose and question designs were authored for the app, not directly imported or reproduced from textbook exercises.

## Executed tests

- `npm run validate:trigonometry:v10.44` — PASS (Topic 09 plus full historical Trigonometry chain).
- `node scripts/validatePracticeV1034.mjs` — PASS.
- `node scripts/validateManualLearnV10351.mjs` — PASS.
- `node scripts/validateLearnReaderV1031.mjs` — PASS.
- `node scripts/validateAlgebraReferenceContent.mjs` — PASS.
- `node scripts/validateContentV1030.mjs` — PASS.
- `node scripts/scanSourceImportsV1023.mjs` — PASS (zero unresolved local imports).
- `tsc --project tsconfig.practice.v1032.json --pretty false` — PASS.
- `tsc --project tsconfig.learn-reader.json --pretty false` — PASS.

**Not verified:** `npm ci --offline` failed because `zwitch` is not cached, and `npm run build` could not find `vite`. Complete `npm run lint` also cannot resolve uninstalled dependencies. Therefore the full production build, browser UI, and end-to-end interactions have **not** been verified here.

## Run locally

```powershell
npm ci
npm run validate:trigonometry:v10.44
npm run lint
npm run build
npm run dev
```

Open Mathematics → Trigonometry → Oblique Triangles & Applications. Question/lesson statuses remain **draft** pending independent editorial verification. Confirm that new lesson diagrams and legacy progress controls render in a browser after npm dependencies are installed.

## Next

Topic 10: Vectors & Components (8 subtopics). Do not treat draft content as an independently verified official board-exam question bank.
