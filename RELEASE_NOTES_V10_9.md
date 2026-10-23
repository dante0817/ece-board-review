# BSECE Board Reviewer v10.9.0 — Assessment Integrity & Data Reliability

**Status:** Source release candidate; full application dependency-backed build / browser smoke test not certified in the packaging environment. **Original v10.8 archive remains unchanged.** This version implements phase 1 of the agreed v10.8–v10.13 plan; it does *not* claim to implement the two new learning paths yet.

## Corrected behavior

1. **Fresh learner / demo separation:** The first launch of a genuinely new browser profile has no fabricated completed topics, test results, or mistakes. Demo data remains available explicitly via Settings, not as a normal learner's starting evidence.
2. **Non-destructive one-time migration:** The v10.8 browser records are snapshot to `ece_board_v108_pre_migration_backup` before transformation. Older test and topic evidence is tagged legacy/unverified, without deleting historical progress; incompatible/corrupt existing data stops migration rather than resetting data.
3. **Assessment provenance:** Test records now identify automatic, manual, or legacy origin; attempt mode; topic/subject/mixed scope; and actual item-level outcomes when available. Manual test entry defaults to zeros and enforces internally consistent counts.
4. **Real Rational Expressions quiz:** The quiz runs its **actual 5 questions** with a 15-minute countdown, collects answers, computes grades, and displays real 0–5 performance and question breakdown instead of fixed 8/10, 80%, or a static timer. Saves outcomes as topic-practice evidence, **not verified mastery**.
5. **Correct exam attribution:** Mixed mocks save as mixed, not the selected subject. Auto-graded items update only their own topic's practice score; an overall 90% cannot silently award 90% to an incorrectly answered topic.
6. **Single readiness calculation:** Mastery gate and review state consult the same selector, without hardcoded 86%/92% guesses, without unsafe simulation actions. A missing independent assessment reads **Not assessed**; legacy and manual results cannot unlock verified maintenance.
7. **Learning analytics data integrity:** Removed fictitious subject-board baseline tests and Rational Expressions subskill history. New learners see **Not assessed** instead of pre-awarded ratings. Informal three-group charts are no longer described as the official PRC examination-area blueprint.
8. **Board-module navigation:** Unsupported GEAS, Electronics and EST module cards no longer redirect to an unrelated Algebra topic. Module lists currently represent curriculum outlines; their complete instructional and assessment coverage has **not** been implemented yet.
9. **Weak-spot quiz reliability:** Corrected conditional React hook order so activating a quiz cannot change the declared hook count. Correct handling for unanswered item outcomes.
10. **Calculator policy:** Added a persistent official-program warning about prohibited fx-991ES / fx-991ES Plus in the October 2026 ECE exam, and conspicuous general-study qualifiers to existing model-specific lessons and tutor guidance. Users must still verify exactly which calculators are permitted for their examination date.
11. **Exam-date integrity:** Stopped imposing arbitrary 2028 dates for new learners. The user's selected exam date is preserved.
12. **Mock naming:** The existing 50-question mixed practice test is no longer presented as a verified full ECE board simulation; its weights and content coverage remain provisional.

## Testing performed

- Dedicated integrity regression checks: **passed** (fresh learner, immutable backup, five-item grading, no silent topic-score fanout, legacy provenance, unassessed display, navigation, source policy).
- Strict TypeScript verification of core data/migration/assessment utilities: **passed**.
- TypeScript/TSX parse scan: **passed**, no syntax diagnostics in scanned source files.
- Existing algebra reference/expansion/practice/assessment source validators: run on clean ZIP extraction, see `VALIDATION_V10_9.txt`.
- Full application TypeScript/build/browser test: **not certified**. Local `node_modules` was incomplete, and dependency installation could not be completed in the sandbox; run `npm ci`, `npm run lint`, and `npm run build` on the target Windows system and address any failures before production deployment.

## Known limitations and next steps

- The per-subskill question bank still has many single-item groups and strong answer-position bias. A unified, shuffled, independently vetted assessment engine is **Phase 2 (v10.10)**.
- Completing guided activities is not automatically sufficient for verified mastery; readiness intentionally remains conservative while independent skill assessments are incomplete.
- Official PRC exam coverage and timed full-board simulations still require an authenticated exam blueprint and more non-Mathematics content (later phases).
- Browser `localStorage` is not a cross-device account database. Keep the pre-migration backup and export it through Settings when applicable. Backend authentication and rate limits need completion before public deployment.
- AI explanations/calculator suggestions are advisory; independently verify mathematics and current PRC device rules.

## Installation

1. Extract the source ZIP (not into a folder with old `node_modules` or `dist`).
2. Run `npm ci` (Node.js 20 or newer recommended; use a current LTS), then `npm run lint`, `npm run build`, `npm run validate:algebra:v10.8`, `npm run validate:integrity:v10.9`.
3. Configure `.env.local` from `.env.example` if you wish to use Gemini features; never publish the API key.
4. Run `npm run dev`, then navigate to the address printed in your terminal.
5. For an existing browser profile, back up the relevant localStorage data before first use. In Settings, use the offered export of the original pre-migration snapshot after migration. A pre-v10.9 legacy-data warning is expected.

**Source note:** Official calculator restrictions are based on the PRC October 2026 program: https://www.prc.gov.ph/sites/default/files/BECE%20exam%20program%20Oct%202026.pdf
