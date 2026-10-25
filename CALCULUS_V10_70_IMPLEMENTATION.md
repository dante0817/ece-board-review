# Calculus Integration — v10.70 Development Candidate

## Implementation scope

This branch is an additive feature based on the connected `dante0817/ece-board-review` `main` repository at package version `10.69.0`. It has **not** been reconciled byte-for-byte with the separately uploaded F-789SGA ZIP. The ZIP could not be opened in the local execution environment during this session. Do not merge this branch into another v10.69.0 source archive without comparing it first.

### Implemented

- Registered `differential-calculus` and `integral-calculus` routes in the existing `ReviewContext` and `App`, retaining the fixed header and app-wide strict-assessment gating.
- Activated the existing two Mathematics catalog placeholders without adding a new global sidebar.
- Added five PRC-aligned syllabus groups per subject (15 TOS items per subject), with stable DC01–DC05 and IC01–IC05 IDs and topic-family roadmaps.
- Added 50 original, **draft** lessons (five per syllabus group) using `LearnReaderLayout`, `ManualLearnTracker`, the common formula renderer, original worked examples, checkpoints and research bibliography pointers.
- Added 90 original **draft** multiple-choice practice variants (nine per syllabus group), each with exactly four distinct answers, an explicit correct index and a worked rationale.
- Created a four-tab Calculus view: Lessons, Formulas, ungraded Practice and Review status.
- Kept existing F-789SGA calculator and prior Mathematics subjects untouched.
- Kept all new practice variants **outside** the certified PRC examination pools; `CALCULUS_EXAM_READY=false`, with an empty approved-item registry.
- Added a focused structural validation entry point `npm run validate:calculus:v10.70.0`.

### Not completed or certified

- The five draft lessons per group are a **pilot**, not comprehensive coverage of all listed subtopics.
- Neither mathematical expert review nor app/browser acceptance testing has been performed.
- The 90 practice variants are not independently approved or balanced against every PRC topic-by-cognitive-level cell.
- No mathematics questions have been added to the certified global Exams engine.
- There is no separate Calculus readiness certificate, progress score or official exam simulation.
- The current source has not been packaged as a ZIP because the container execution environment did not function during this run.

## Data integrity

Lessons use new IDs such as `dc01-01` and `ic05-02`. Progress-tracking IDs are namespaced as `chapter-top-calculus-...`. No existing lesson, learner, assessment or calculator state keys were intentionally renamed. All added authoring material is original editorial draft text and is not copied from restricted instructor manuals.

## Minimal local checks

```bash
npm ci
npm run validate:calculus:v10.70.0
npm run lint
npm run build
```

Open Mathematics and confirm that the two Calculus entries navigate correctly. Open one lesson of each subject, check LaTeX rendering, mark and reload manual study progress, open topic practice, and confirm that strict examination mode still locks instructional aids.

The structural validator checks counts, IDs, ownership, option uniqueness, answer-key indices and the disabled certified-exam flag. It does **not** establish mathematical truth or browser behavior.

## Source-reference priorities

PRC EE Mathematics TOS (2022) governs top-level module groupings. Larson Calculus 10e and Thomas Calculus 12e inform the overall syllabus, Stewart Calculus 8e and Swokowski Calculus 5e support independent checking, Banner and Passow inform guided reasoning, and Schaum's and other practice references inform original question types. These titles are bibliography pointers only; no external textbook text or restricted instructor solution content is embedded.
