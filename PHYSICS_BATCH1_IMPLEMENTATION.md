# Physics — Batch 1 implementation (development branch)

This branch is a **fallback implementation against the GitHub main snapshot last
committed October 23, 2026**. It is NOT an extracted or modified copy of the
newer AEM-expanded ZIP uploaded in chat. Do not replace that newer source with
this branch; reconcile changes into the newer source first.

## Implemented

- New Physics screen under GEAS, with course-specific entry for
  **Physics for Engineers** and **Physics 2**.
- Eight PRC 2022 TOS topic groups, with stable IDs and item/cognitive matrices.
- 36 distinct planned learning-topic outlines, with shared foundations across courses.
- A selectable curriculum navigator, TOS blueprint view, and source/reference view.
- Explicit developmental status: no lesson or question is falsely marked as
  completed, verified, or board-exam eligible.
- No modifications to the existing AEM, Probability & Statistics, Mathematics,
  examination bank, calculator, or recorded learner progress.

## Changed paths

- `src/features/physics/physicsCurriculum.ts` — shared editorial registry and mapping.
- `src/features/physics/PhysicsScreen.tsx` — Physics navigator and TOS display.
- `src/App.tsx` — Physics screen route.
- `src/context/ReviewContext.tsx` — ScreenType extension.
- `src/components/BoardSubjectScreen.tsx` — GEAS course cards, deep-link hint.
- `src/components/Sidebar.tsx` — GEAS remains active inside Physics.
- `scripts/validatePhysicsBatch1.ts` — deterministic registry checks.

## Local checks to run after syncing to the newer source

```bash
npm ci
npx tsx scripts/validatePhysicsBatch1.ts
npm run lint
npm run build
```

No successful local build or runtime smoke test has been performed on this
fallback branch because the execution container was unavailable. Review the
baseline differences before merging/cherry-picking to the latest AEM ZIP.

## Future batches

- Batch 2: original Physics for Engineers lessons, formulas, diagrams,
  worked examples, and topic-aligned practice questions.
- Batch 3: corresponding Physics 2 content.
- Batch 4: integrate verified questions and existing scoring/progress
  infrastructure. Do not expose draft questions as scored examination content.
- Batch 5: complete QA, regression checks, release ZIP, and validation report.

## Copyright and provenance

Reference names are bibliographic guides only. No uploaded textbook or
instructor solution manual is embedded. Author original materials and verify
physics, math, units, and publication rights before release.
