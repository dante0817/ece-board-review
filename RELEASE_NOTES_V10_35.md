# BSECE Board Reviewer v10.35.0 — Manual Learn Topic Tracking

## Overview

Adds self-reported Learn progress for **all 39 Algebra catalog modules**, including manually editable review counts, self-assessed understanding, and personal review flags. The 23 reference-informed Learn Reader topics also have an in-reader tracker. Tracks a catalog subtopic separately from its shared canonical chapter; direct reader access receives a chapter-level tracker.

## Features

- **My Status** button beside every Algebra catalog topic. Compact card shows `My reviews: 3×`, `Studying`/`Understood`/`Mastered (Self)`, and `My Review Flag` when set.
- **My manual study tracker** displayed within the new Learn Reader, showing the exact catalog subtopic when entered from Algebra. The same record is editable from the catalog.
- **Mark Reviewed +1** action, **Undo review** while the action remains unchanged, and an **exact count correction** control (0–999).
- **Self-assessed status**: Not Rated, Studying, Understood, Mastered (Self). Defaults to Not Rated. No score or lesson-reading change is implied.
- **My Review Flag** and **Mastered (Self)** catalog filter chips with live counts, separate from the existing **Due** and **Developing** filters.
- Versioned, validated `ece_manual_learn_tracking_v1` local-storage namespace; same-tab and cross-tab UI updates via change notifications and storage events. Invalid or corrupted storage is not overwritten by normal edits.
- Include the new namespace in learner export/import with validation, backwards-compatible import of older archives, and complete reset/demo reseed removal.
- No impact on existing `Topic.reviewCount`, `Topic.mastery`, quiz grades, spaced-repetition schedule, or `readerProgress` section completion.

## Key files

- `src/domain/learn/manualLearnTracking.ts`
- `src/hooks/useManualLearnTracking.ts`
- `src/components/learn-reader/ManualLearnTracker.tsx`
- `src/components/learn-reader/LearnReaderLayout.tsx`
- `src/components/math/ReferenceInformedTopicScreen.tsx`
- `src/components/AlgebraScreen.tsx`
- `src/domain/learn/lessonTypes.ts`
- `src/context/ReviewContext.tsx`
- `src/utils/learnerBackup.ts`
- `scripts/validateManualLearnV1035.mjs`

## Scope & limitations

- Algebra-first release. Every catalog module can be marked on the catalog, including the specialist topics. The embedded in-lesson tracker is currently on the 23 reference-informed Learn Reader pages; specialized legacy Learn screens can be integrated in a later pass.
- Direct entry to a broad canonical lesson, without an Algebra catalog module, records a **whole-chapter** review. This intentionally does not increment any narrower catalog module's count.
- Manual tracking is stored locally in browser storage and exported through learner backup. It is not synchronized between separate devices/accounts without importing a backup.
- Concurrent writes from separate browser tabs still use browser local-storage last-write-wins; avoid editing the *same topic* in two tabs simultaneously.
- Review count is self-reported; correcting a count does not generate a new review timestamp. Automatic reading and testing activities do not increment counts.
- Do **not** confuse *Mastered (Self)* with official/scored mastery. Neither status should be used as verified board-readiness evidence.

## Validation

- `npm run validate:manual-learn:v10.35` — **PASS** (source-level tests and focused core TypeScript compilation).
- `npm run validate:reader:v10.31` — **PASS**.
- `npm run validate:practice:v10.34` — **PASS**.
- `npm run validate:algebra:v10.8` — **PASS**.
- `npm run lint` — **BLOCKED** by missing installed packages/types (`react`, Node, Vite, Express, etc.), same limitation as prior source releases. Full Vite build and browser/mobile testing are **not certified**.

## How to run in Windows PowerShell

```powershell
npm ci
npm run validate:manual-learn:v10.35
npm run lint
npm run build
npm run dev
```

Open **Mathematics → Algebra**. Click **My Status** on any topic or enter its reference-informed **Learn** tab. Select **My Review Flag** in the Algebra topic filters to see what you flagged.

When ports 3000 and 24678 conflict, either stop existing development processes or for a secondary instance use:

```powershell
$env:PORT="3001"
$env:DISABLE_HMR="true"
npm run dev
```

### Future work

Extend in-lesson tracking to specialized Algebra screens and other subjects, add optional personal notes/next review dates, and complete a real React/Vite build plus keyboard/mobile browser acceptance tests.
