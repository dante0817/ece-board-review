# Physics Batch 2 — Physics for Engineers (v10.69.0)

**Status:** Source implementation committed on `physics-batch1-20261119`, not merged to `main`.
**Baseline:** Connected GitHub repository `dante0817/ece-board-review`. The separately uploaded RAR has not been byte-reconciled.

## Delivered
- 18 original developmental Physics for Engineers lessons across 4 official PRC TOS groups.
- Each lesson has a concept explanation, at least one formatted KaTeX equation with assumptions, a problem-solving method, a common-mistake guardrail, a solved example, and two ungraded checks.
- Six original responsive SVG diagrams: vectors, projectile motion, free-body forces, mechanical waves, fluid flow and refraction.
- 75 original multiple-choice **draft** questions for formative study, with four answer choices and an explanation. Their current TOS cognitive classifications are provisional.
- The existing GEAS Physics for Engineers screen now opens the shared Learn Reader; it provides a mobile-friendly ungraded question panel with topic-group filtering and optional lesson linkage.
- Physics 2 retains its truthful *outline only* status.
- Physics study reading/bookmarks use existing storage with narrow Physics tracking IDs; existing Algebra, Trigonometry and Geometry formats are preserved.
- No new questions are registered in scored GEAS examinations; reviewStatus=draft, assessmentEligible=false on every record.

## TOS mapping and initial five-allocation question target

| Topic group | Knowledge | Comprehension | Total |
|---|---:|---:|---:|
| Mechanics/energy | 15 | 10 | 25 |
| Rotation/elasticity/waves | 10 | 10 | 20 |
| Fluids/heat | 10 | 0 | 10 |
| Electricity/magnetism/optics | 15 | 5 | 20 |
| **Total** | **50** | **25** | **75** |

These are five times the 15-item Physics for Engineers TOS allocation. They are not approved board questions, and reaching the count does not establish independent content certification.

## Source files
- `src/features/physics/physicsEngineersPart1.json`, `physicsEngineersPart2.json`: original draft lesson text.
- `src/features/physics/physicsEngineersContent.ts`: `LearnLesson` adapter and lesson integrity check.
- `src/features/physics/physicsEngineersQuestions{1,2,3,4}.json`: original draft questions.
- `src/features/physics/physicsEngineersQuestions.ts`: question contracts and fail-closed approval/export logic.
- `src/features/physics/PhysicsEngineersPracticePanel.tsx`: ungraded question interface.
- `src/features/physics/PhysicsScreen.tsx`: lesson and practice navigation.
- `src/components/learn-reader/PhysicsIllustration.tsx`: editable original diagrams.
- `src/components/learn-reader/LearnSectionRenderer.tsx`, `src/domain/learn/lessonTypes.ts`: shared diagram block support.
- `src/domain/learn/manualLearnTracking.ts`: accepts scoped Physics tracking IDs.
- `scripts/validatePhysicsEngineersBatch2.mjs`: focused data/blueprint validator.
- `package.json`: `validate:physics:batch2` command.

## Reference direction
Serway & Jewett (9th), Halliday–Resnick–Walker (10th), Cutnell & Johnson (9th), Young & Freedman (13th), Giambattista (3rd) and Schaum's College Physics (9th) informed curriculum selection. Equations use standard textbook physics and explanatory text, diagrams, examples and question stems are independently authored. Source association is not proof of page-level verification or permission to distribute book scans.

## Checks
The connected-source integrity pass confirmed all 18 lesson/title mappings, 75 unique question IDs/stems, valid answer-option indices, all expected TOS group/cognitive counts, and compatible Physics reading-tracker identifiers. This used programmatic analysis of the committed GitHub source, not local Node execution.

**Outstanding:** The focused npm script, TypeScript compile, Vite production build, browser/mobile checks and independent editorial answer approval **have not run** in this tool session. The uploaded RAR is not reconciled to this branch; do not claim the RAR contains these changes.

When a capable local environment is available, run:

```powershell
npm ci
npm run validate:physics:batch2
npm run lint
npm run build
npm run dev
```

Manual acceptance: open GEAS → Physics for Engineers; open a lesson, view equations/diagram, mark a section read, open ungraded practice, and filter by topic. Confirm Physics 2 still shows outlines and existing subjects remain intact.

## Next batch
Batch 3: Physics 2 — author the 13 planned objectives, use the same Learn Reader and draft question contracts, and retain fail-closed scored eligibility until verification.
