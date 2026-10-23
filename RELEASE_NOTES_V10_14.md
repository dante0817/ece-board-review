# BSECE Board Reviewer v10.14.0 — Examination Practice Bank Expansion

**Status: Source release candidate. The project has not passed an installed-dependency production build or browser smoke test in this environment.**

## Changes

- Adds **96 original, deterministic, numerically graded practice questions**: **32 GEAS, 32 Electronics Engineering and 32 Electronics Systems and Technologies**.
- Each area contains **16 distinct authored formula/problem families**, with two numeric variants per family; the new content spans mechanics, materials, chemistry, engineering economy, thermodynamics, circuits, analog electronics, semiconductors, communications, antennas, and transmission fundamentals.
- All 96 items have four distinct choices with stable option IDs, a computed correct answer, unit-aware solutions, and formula descriptions. The choice-key positions are deliberately distributed, and the existing UI still shuffles rendered options.
- New **GEAS learner subject** and practice-only topic records for GEAS, Electronics, and EST; existing learner state remains preserved through the curriculum merge. None of the new topic records is initially assessed or mastered.
- New questions are accessible through both subject-specific timed practice and the existing four-area board-weight preview. A board-subject banner links users to the mock exam UI.
- In the four-area preview, assembly favors **distinct authored problem families first**, before reusing another numerical variant of a family. No question ID is duplicated within an attempt.
- Setup lists available questions, distinct topic labels, original family count, numeric-variant count, and any shortages for each area.
- Question-level attempt records preserve `questionFamilyId`; board question allocations and per-area scoring retain their existing backward-compatible format.
- Current availability now fills official **subject-area quotas for 50- and 100-question practice** (zero numerical shortage). The 200-question preview still shows shortages.

## Critical distinctions

- **Filling subject quotas is not proof of within-subject Table of Specifications (TOS) coverage.** The examination remains a **practice preview**, not a PRC-equivalent or validated full-board examination.
- Numerical variants of the same family are **not independent conceptual evidence**. The 48 families in this release do not cover all syllabus competencies.
- The math/reference bank and historical mock items were not subjected to a complete expert mathematical audit in this release.
- The new items are **original educational practice**, not past PRC questions. The authoring process includes programmatic formula derivation and 43 separately specified golden-answer fixtures, but formal human peer review remains outstanding.
- The updated GEAS/Electronics/EST topic records are **practice labels only**, not stand-alone full lessons. The legacy subject module cards remain an outline until actual lessons are mapped.
- Calculator guidance remains subject to the model-specific official PRC restrictions for the target examination.

## Audit and tests

- `npm run validate:board:v10.14` — new content, distribution, answer-fixture, migration, mock generation and scoring tests.
- `npm run lint:board` — focused strict TypeScript compilation of the blueprint and new authored bank.
- `npm run validate:board:v10.13` — existing quota/scoring test updated for the addition of GEAS, with original scoring checks retained.
- The older v10.8–v10.12 validators remain available and were executed in this release.
- `BOARD_QUESTION_AUDIT_V10_14.csv` — 96 item-level rows; marks golden-checked items and peer/TOS review as pending.
- `BOARD_COVERAGE_V10_14.csv` — subject quotas, question counts, topic diversity, family diversity, shortages for 30/50/100/200.

## Build limitation

The supplied runtime lacks complete npm dependencies. `npm ci --offline` failed with `ENOTCACHED` for `zwitch`; full `tsc --noEmit` consequently reports unavailable React, Node and other type modules. A production build and browser smoke test must be run in a machine with dependency access before deployment.

## Next recommended work

1. Conduct subject-matter expert review of all 96 new solutions and the previous board-mock items.
2. Map each question family against the **official 2022 enhanced PRC EELE TOS Annex A** and publish specific within-subject deficits.
3. Expand truly independent problem families and introduce complete teaching modules for the currently practice-only topics.
4. Rebuild with npm dependencies, test responsive UI, migration of real archived learner profiles, timer behavior and scoring in a browser.
