# BSECE Board Reviewer v10.50.2 — Trigonometry TypeScript lint fix

## User-reported issue

`npm run lint` failed with TS2322 because the Learn Reader's `LessonStatus` permits `summary | draft | reviewed | verified`, whereas `TrigBinding.lessonStatus` allowed only `draft | reviewed | verified`.

## Fix

- `src/features/trigonometry/types.ts` now imports and uses the canonical `LessonStatus` from `src/domain/learn/lessonTypes.ts`, making the binding contract consistent with authored and summary lessons.
- `src/features/trigonometry/TrigonometryModule.tsx` displays `Reference summary` if a summary is encountered; it does not falsely label it as verified.
- Bumped the package and lockfile version to 10.50.2, and extended historical Trigonometry validator version allowlists while preserving all their content assertions.
- Added a focused contract check `npm run validate:trigonometry:v10.50.2`.

## Run

```powershell
npm ci
npm run lint
npm run validate:trigonometry:v10.50.2
npm run build
npm run dev
```

## QA limitation

Targeted, dependency-free TypeScript checking of the changed type contracts and historical source validators were run. Full `npm run lint` and `npm run build` need all project npm dependencies installed. No lesson, question, or progress data was changed.
