# v10.18.0 — Canon F-789SGA Foundation and Assessment Access (Source Candidate)

## Scope
Incremental implementation on v10.17. Existing lessons, question IDs, student history, scores and ten Canon pilot guides are preserved. This is **not** a certified browser build, manufacturer approval, or new PRC endorsement. No newly claimed device-verified calculator methods were added.

## Delivered
1. `src/domain/assessment/assessmentAccess.ts`: centralized fail-closed assessment-session policy (`inactive`, `study-active`, `strict-active`, `finalizing`, `finalized`, `interrupted`). A missing calculator disclosure context stays locked. In-app help channels deny access during active/finalizing strict attempts.
2. `src/context/ReviewContext.tsx`: share strict assessment state across the application. The tutor, voice tutor, formula sheet and topic drawer openers enforce it, as do exposed overlay setters and route switches.
3. `src/components/TimedMockExam.tsx`: register an attempt before starting, finalize on submit/timeout, explicitly interrupt on early exit or component unmount, and warn on browser navigation. Preserve the physical-calculator-allowed, self-attested nature of strict practice. The results remain available after finalization, never while questions are active.
4. `src/components/TestsScreen.tsx` and `src/App.tsx`: prevent changing test-history tabs during an active attempt and suppress global instructional drawers, modals and the sidebar while strict assessment is active.
5. `src/context/VoiceCommandContext.tsx` and `src/hooks/useVoiceCommands.ts`: stop existing command recognition and block both direct voice commands and launcher actions during strict mode. This prevents voice commands from bypassing UI-only help restrictions.
6. `src/domain/calculator/techniqueLibrary.ts`: migrate ten pilot references into typed, versioned template records with model, original question/family identity, manual edition and section, explicit supported parameter bindings where authored, and independent evidence placeholders. No text-extracted numbers or invented family variants. **All ten remain draft/preliminary until manual, device and editorial verification evidence exists.**
7. `src/components/CalculatorTechniqueCard.tsx`: requires explicit post-answer or Calculator Skills disclosure; hides techniques until the learner selects a tab; records each selected technique and version; adds keyboard left/right movement; displays a candid preliminary/device-pending label.
8. `src/domain/assessment/aidEvidence.ts` and `src/utils/learnerBackup.ts`: per-question, versioned calculator-assistance disclosure history included in validated learner export/restore. Opening help after submitting does not downgrade a finished attempt. Previously saved results are not rewritten.
9. `scripts/validateCalculatorV1018.mjs`: access-state tests, independent mathematical calculation fixtures for the ten example results, exact pilot binding/provenance tests, help-event backup and restore, and integration source checks.

## Independent validation
- All 15 existing and new source validators pass.
- Focused TypeScript: integrity, assessment, curriculum, learning paths, board, calculator all pass.
- 243 TypeScript/TSX sources pass syntax parsing.
- npm clean install: **FAILED in this environment**, uncached `zwitch` npm dependency (`ENOTCACHED`). Therefore `npm run lint`, `npm run build`, and interactive browser smoke testing are **not certified**. Some source checks are not substitutes for a React integration test.
- Physical Canon F-789SGA keystrokes, actual LCD displays, device-reset behavior and hardware revision: **NOT TESTED**. No guide is labeled device-approved.

## Open work / cautions
- Re-run a full clean `npm ci`, `npm run lint`, `npm run build`, `npm run dev` on a machine that can fetch dependencies. Browser-test routing, timers, modal access, voice shutdown, tab accessibility, help disclosures, profile export/restore, and smartphone layout.
- Ask a qualified reviewer to verify the exact F-789SGA physical keyboard sequence, manual revision, initial mode and display. Record independent reviewer/date/report before promoting any draft to `published`.
- Current static typed numeric bindings are limited to 6 of the 10 pilots; the remaining 4 are intentionally restricted to an exact authored question ID until proper parameter definitions exist. No general new question-family propagation is claimed.
- v10.19 should audit 66 source files with Casio/fx-991 mentions and prioritize board-facing help and tutor guidance; do not replace calculator names mechanically.
- As before, exam attempts are **self-attested**. This feature does not prevent an external phone or separate browser from supplying help.

## Local verification (Windows PowerShell)
```powershell
npm ci
npm run validate:calculator:v10.17
npm run validate:calculator:v10.18
npm run lint:calculator
npm run lint
npm run build
npm run dev
```
Before upgrading, export existing learner data from Settings. The v10.18 data migration is non-destructive; a new storage key for aid disclosures is backed up and restored.
