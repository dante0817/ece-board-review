# BSECE Board Reviewer v10.35.1 — Manual Checkboxes Within Learn Topic Cards

## What changed

The manual study-status controls now appear **inside the active numbered lesson card**, near the top of the lesson itself. For example:

**Mathematics → Algebra → Real Numbers → Learn → 1. Number Sets** displays five editable checkboxes:

- **Read 1×**
- **Read 2×**
- **Read 3×**
- **Mastered (Self)**
- **Needs Review**

Students can mark these without visiting a separate settings page or catalog editor. They can also use **Mark Reviewed +1**, **Undo**, or **More options** for exact counts (0–999) and finer confidence ratings. Unchecking a reading milestone lowers the manual count to the previous milestone; choosing Read 3× includes Read 1× and 2×. Older higher counts are retained when the lower milestone is checked.

**Per-card independence:** Real Numbers steps 1–4 have separate records. The same behavior applies to Linear Equations' selected concept cards, Rational Expressions' eight study-path cards, and the selected sections of 23 reference-informed Algebra Learn Reader lessons. Switching between sections does not copy another card's checkmarks.

**The Algebra catalog** still lists the prior whole-module manual status (if any), plus aggregated indicators for study cards read, cards self-marked mastered, and review flags. The existing manual filter includes cards with Needs Review and cards self-marked Mastered. A self-mastery indication on any individual card does **not** mean the whole module or a board-exam competency is officially mastered.

## Preservation and compatibility

- Existing v10.35.0 manual status records stay in the same `ece_manual_learn_tracking_v1` namespace, with no migration or deletion. Old overall-module counts stay separate from new specific lesson-card records.
- The tracker does not alter section-reading completion, automatically calculated mastery, due reviews, quiz scores, or exam results.
- Checkbox corrections do not fabricate a `lastReviewedAt` timestamp; only explicit **Mark Reviewed +1** creates a dated review.
- The storage capacity is extended to 1,200 tracking records / 320,000 serialized characters for independent lesson-card records, with validation and learner-backup integrity checks.
- Save failures show a visible warning instead of claiming that a change was persisted.

## Key files

- `src/components/learn-reader/ManualLearnTracker.tsx`
- `src/domain/learn/manualLearnTracking.ts`
- `src/components/learn-reader/LearnReaderLayout.tsx`
- `src/components/RealNumbersScreen.tsx`
- `src/components/LinearEquationsScreen.tsx`
- `src/components/linear-equations/LinearLearnTab.tsx`
- `src/components/RationalExpressionsScreen.tsx`
- `src/components/rational-expressions/DomainRestrictionsModule.tsx`
- `src/components/AlgebraScreen.tsx`
- `src/hooks/useAlgebraLearnTrackingIdentity.ts`
- `scripts/validateManualLearnV10351.mjs`

## Testing

**Passing source-level checks:**

```
npm run validate:manual-learn:v10.35.1
npm run validate:reader:v10.31
npm run validate:practice:v10.34
npm run validate:algebra:v10.8
```

Manual tracking QA also verifies independent step IDs, cumulative checkboxes, old parent-record isolation, status aggregation, 450-card capacity, and inline card positioning.

**Not certified:** Full TypeScript application lint, production Vite build, and real desktop/mobile browser testing require the project's npm dependencies, which are unavailable in this container. `npm run lint` currently fails with missing React/Node/Vite-related modules/types, as in earlier source packages. No claim is made that the runtime has been browser-tested.

## Run on Windows PowerShell

```
npm ci
npm run validate:manual-learn:v10.35.1
npm run lint
npm run build
npm run dev
```

Open **Mathematics → Algebra → Real Numbers → Learn → 1. Number Sets**.
If port 3000 is occupied, use `$env:PORT="3001"; $env:DISABLE_HMR="true"; npm run dev` and open `http://127.0.0.1:3001`.
