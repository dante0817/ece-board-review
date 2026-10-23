# BSECE Board Reviewer v10.40.0 — Fundamental Trigonometric Identities

## Scope

This release extends **v10.39.0** in-place and finishes Topic 05 (*Fundamental Identities*) of the existing Trigonometry curriculum. The four-group/14-topic/102-subtopic navigation and existing IDs are unchanged.

### Added content

Five **draft** lessons (existing 05.3 Pythagorean identities lesson unchanged):

| Subtopic | Lesson ID | New practice items |
|---|---|---:|
| 05.1 Reciprocal identities | `trig-basic-identities-reciprocal-identities` | 8 |
| 05.2 Quotient identities | `trig-basic-identities-quotient-identities` | 8 |
| 05.4 Even–odd and cofunction identities | `trig-basic-identities-evenodd-and-cofunction-identities` | 8 |
| 05.5 Simplifying trig expressions | `trig-basic-identities-simplifying-trig-expressions` | 8 |
| 05.6 Verifying identities and domain restrictions | `trig-basic-identities-verifying-identities-and-domain-restrictions` | 8 |

Topic 05 now provides **6/6 linked draft lessons** and **48 draft questions** (including the original 05.3 content). Overall Trigonometry has **35/102 linked draft lessons**, **280 questions**, and **67 planned subtopics**.

### Lesson format

Each added lesson includes a concise concept explanation, two formula blocks (with explicit restrictions), two step-by-step worked examples, pitfall guidance, a checkpoint, and named reference sections. Study content is based on the math topics and approaches in Lial 10th, Schaum's 4th, Kelley, Young and Sullivan; prose and questions are original drafts.

### Integration

- `TrigonometryScreen.tsx` merges the five new lessons into the existing lesson registry.
- The existing `LearnReaderLayout`, `ManualLearnTracker`, and manual progress adapter are reused without changing storage keys or past IDs.
- `domain/practice/catalog.ts` imports the 40 new items with the existing Trigonometry bank key convention; existing Algebra and Trigonometry question keys are unchanged.
- Legacy regression assertions in the v10.34 and v10.39 validators were made **growth-compatible** while still checking their original 662-entry catalog baseline.

### Tests and limitations

**Passed:** ten source/data validation scripts (Trigonometry v10.36–v10.40, Practice v10.34, Manual Learn v10.35.1, Learn Reader v10.31, Algebra references, source-import scan) and the two targeted TypeScript compilations (`tsconfig.practice.v1032.json` and `tsconfig.learn-reader.json`). The v10.40 script checks numerical identities on representative angles, answer-key structure, old/new subtopic catalog binding, and local progress preservation.

**Not verified:** the full `npm run lint`, production `npm run build`, and integrated browser UI because `npm ci --offline` cannot fetch the missing `zwitch` package from the npm cache. These should be run with a complete npm installation on the local machine.

**Editorial status:** All newly added lesson and question records remain **draft**, not mathematically certified by an independent expert. Automated and representative numeric checks do not guarantee every explanation/question is correct. Exercise solutions should undergo editorial verification before changing `status` or `reviewStatus` to reviewed/verified.

### Run locally

```powershell
npm ci
npm run validate:trigonometry:v10.40
npm run validate:practice:v10.34
npm run validate:manual-learn:v10.35.1
npm run lint
npm run build
npm run dev
```

Go to Mathematics → Trigonometry → Topic 05. The other 67 unlinked subtopics remain labeled as planned.

### Next phase

Topic 06 — Advanced Identities and Formulas (8 subtopics), then Topics 07 and 08. Preserve stable lesson/question IDs, independently verify domain restrictions and exact trigonometric results, and keep question-bank coverage linked to the existing Practice Library.
