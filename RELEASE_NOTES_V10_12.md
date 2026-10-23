# v10.12.0 — Guided Learning and ECE Board Preparation

**Release status:** source candidate; not certified for production. This is an incremental change to v10.11, not a rewritten application.

## Delivered

1. **Persistent learning path selector** in the shared dark sidebar. Choose Guided Learning or ECE Board Preparation, including on narrow-screen navigation. The active option has `aria-pressed` for assistive technologies. The current path defaults to Board Preparation for upgrade continuity. Both use identical topics, progress data, tests, errors, and review history.
2. **Deterministic, explainable next-step recommendations** in Today, Mathematics, and Algebra:
   - Guided: first uncovered Algebra topic in the application's existing `canonicalIndex` order. Otherwise suggests reviewing topics lacking automatic evidence, weak skills, or retention work. This is an *app curriculum sequence*, **not** a mapped university syllabus or certified prerequisite graph.
   - Board: prioritize topics with low actual auto-graded item outcomes, then due retention, unresolved errors, and unassessed Mathematics. Manual and legacy assessments cannot create artificial 'measured weak' recommendations. This recommendation is study guidance, not a board-readiness classification.
   - Each recommended action remains navigable. When no dedicated module exists the user sees a topic overview, not an invented lesson or silent substitution.
3. **Path-adjusted study guidance** on source-informed Algebra topics. All Learn / Practice / Quiz / Mistakes / Progress tabs remain open in either path. The topic shell remains unchanged; board skill evidence continues to be self-attested.
4. **Mode-dependent mock defaults**: Study Mode for Guided Learning, self-attested Strict Assessment for Board Preparation. Learners may override the default at any time. Once started, switching paths does not change the running attempt, saved evidence classification, timing, or allowed reference conditions.
5. **Backup/restore support** for the new validated `ece_learning_path_v1` preference. It is isolated from score collections; resetting learner scores does not reset the chosen study preference. All old learner backup formats remain accepted.
6. **Additional navigation reliability fixes:** the Absolute Value catalog entry now links to its canonical topic. Topic Drawer hook order is stable when opening or closing it.

## What did not change

- No automatic migration of historical scores to verified performance.
- No merging of study, manual, legacy, and strict assessment evidence.
- No altered mock question quotas or promises of full official PRC alignment.
- No elimination of access to explanations during Board Preparation; the learner can still study topics freely.
- No added or copied textbook questions. The v10.11 shared bank remains at 260 practice questions plus 30 independent variants across 15 families; coverage remains 5/102 app-defined grouped skills at the three-family planning target.

## QA and acceptance

- Existing Algebra v10.8 validation passed.
- v10.9 data integrity, v10.10 assessment, and v10.11 curriculum validations passed.
- v10.12 path selection, ordering, low-scoring automatic items, exclusion of manual/legacy evidence, retention/error priority, missing catalog, fallback routing, preserved learner-data preferences, and backup import round trip tests passed.
- Focused strict TypeScript checks for data/assessment/learning modules passed; every source TypeScript/TSX file passed parser validation.
- **Full `npm run lint`, `npm run build`, and interactive browser acceptance are NOT certified.** Installed npm dependencies and type packages are incomplete in this evaluation environment. Run those checks on a development machine with a clean, successful `npm ci` before release.

## Remaining limitations / next work

- More than 90 Algebra skill groups still lack sufficient reserved independent families.
- Some Algebra curriculum entries have progress/review overviews but no dedicated lesson; the app warns rather than pretending the lesson exists.
- Non-Mathematics ECE content and blueprint-complete full-board mocks are incomplete.
- The mathematical correctness of all 260 original practice items and their explanations has not had a complete independent human review.
- Device-local browser storage still requires exported backups for cross-device durability.

## Local run instructions

Extract the ZIP into a separate folder, open PowerShell there, run `npm ci`, and review `.env.example` if tutor features are needed (keep API keys out of shared artifacts). Then run `npm run lint`, `npm run build`, all validators, and finally `npm run dev`. Do not delete original v10.11 user data; save a learner export before testing upgrades.
