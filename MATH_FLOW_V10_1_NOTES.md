# v10.1 — Mathematics Flow & Topic UX Standardization

This release continues the main-GUI refinement by standardizing how learners move through Mathematics, especially Algebra and the currently implemented detailed topic screens. The implementation is intentionally conservative: existing lesson content and the existing review/mastery engines are reused rather than replaced.

## Primary UX changes

### Mathematics landing page
- Mathematics coverage, mastered count, and due count now come from the canonical Mathematics subject/topic state instead of static presentation values.
- **Recommended Next** is derived from the existing daily study queue when a Mathematics item is available.
- Recommended actions open a dedicated topic screen when one exists; otherwise they use the existing canonical topic/review flow.
- Broad `select-none` was removed from the main Mathematics content area so formulas and lesson text remain selectable.
- Modules without mapped dedicated content no longer silently open a different lesson. An explicit **content not yet mapped** dialog appears with options to return or ask the Tutor.

### Algebra curriculum page
- Header coverage/mastered/due metrics now use the canonical Algebra subject state.
- **Recommended Next** is sourced from the existing daily study queue rather than a fixed Rational Expressions card.
- The top action area is calmer: Quick Sheet, Formula Reference, Flashcards, Mixed Drill, Timed Challenge, Board Scope, and Tutor access are consolidated under **Tools**.
- Search text, filter selection, expanded accordion groups, and scroll position persist in `sessionStorage`, so returning from a topic restores the learner's Algebra context.
- Topic status wording shown by the UI uses **Proficient** and **Developing** instead of the less clear Strong / Needs Work wording where rendered.
- Unimplemented modules no longer redirect to an unrelated topic. An explicit unavailable-content dialog can optionally launch related canonical practice or the Tutor.
- The previous erroneous Signed Numbers → Rational Expressions direct-screen mapping was removed.

## Standard Mathematics topic shell

The following implemented Mathematics topics now use the same outer lifecycle navigation:

**Learn → Practice → Quiz → Mistakes → Progress**

- Real Numbers & Number Systems
- Order of Operations & Algebraic Properties
- Algebraic Expressions & Terms
- Ratios, Proportions & Percent
- Scientific & Engineering Notation
- Rational Expressions
- Linear Equations

Topic-specific instructional content remains inside **Learn**; the release does not force every topic to use identical lesson content.

### Shared components added
- `src/components/math/MathTopicLifecycleTabs.tsx`
- `src/components/math/MathTopicStatusStrip.tsx`
- `src/components/math/MathTopicUtilityViews.tsx`

The status strip separates four concepts that were previously easy to conflate:
- mastery level,
- latest quiz result,
- unresolved mistakes,
- review timing.

Generic Quiz / Mistakes / Progress panels reuse the existing canonical review, error-log, and mastery state instead of creating a second scoring system.

## Breadcrumb and navigation consistency

- Rational Expressions now follows:
  `Mathematics → Algebra → Expressions & Polynomials → Rational Expressions`
- Linear Equations now follows:
  `Mathematics → Algebra → Equations & Inequalities → Linear Equations`
- Real Numbers, Order of Operations, Algebraic Expressions, Ratios/Proportions, and Scientific Notation use **Algebra Fundamentals** consistently.
- Detailed topics use **Back to Algebra**, allowing the Algebra page's preserved accordion/filter/scroll state to restore context.

## Date and scheduling stabilization

The previous runtime dependence on the fixed date `2026-09-09` was removed from core scheduling utilities.

### Added
- `src/utils/date.ts` with a local-calendar `YYYY-MM-DD` helper.
- `ReviewContext.currentDateStr` now tracks the learner's actual local date and refreshes while the app remains open.
- Daily completion counters roll over at a local calendar-day boundary while configured targets are preserved.
- Daily-target storage records the date associated with the counters.

### Updated runtime date defaults
- mastery calculator,
- spaced-repetition scheduler,
- adaptive target calculator,
- forgetting-curve calculations,
- question spaced repetition,
- Study Timeline.

The Real Numbers concept scheduler now advances stale stored schedules to at least the current local date instead of remaining frozen on its old simulated September 2026 date. A deliberately advanced future simulation is still preserved.

The mastery recommendation now passes the learner's **actual recorded review duration** into spaced repetition rather than a fixed 20-minute value.

## Real Numbers review flow

- The universal **Quiz** stage now launches the canonical review/mastery engine rather than treating the old custom Review tab as the lifecycle Quiz tab.
- The separate Flashcards experience remains available as a contextual study tool rather than a primary lifecycle stage.
- Concept-level review reminder text is now data-driven from the first due/remediation concept and only appears when a concept is actually flagged by the Real Numbers schedule.

## Deliberately deferred

This release does **not** attempt to solve every data-model limitation. In particular:

- Several Algebra Fundamentals sub-lessons currently share the broader canonical topic `top-fund-ops`. Until the curriculum database gains finer canonical topic IDs, their standardized mastery/mistake/progress panels necessarily reflect that shared parent record.
- Static per-row demo status/score copy still exists in portions of the Algebra curriculum catalog; the canonical page-level metrics and due filter are now dynamic, but a full curriculum-state migration belongs in the content/data-model pass.
- Review-completion → next-topic summary is not yet added.
- Study-session double-counting across overlapping Pomodoro/Deep Focus/review pathways is not changed in this UX-focused release.
- Mock-exam bank integrity and missing topic IDs remain for the planned exam/mastery-integrity pass.
- Board-subject taxonomy reconciliation remains a separate curriculum task.

## Validation performed

- TypeScript/TSX syntax transpilation across all `src` files: **201 files parsed, 0 syntax failures**.
- Relative import existence scan across `src`: **0 missing relative imports**.
- Targeted Mathematics-flow assertions verified:
  - no `allTopics[0]` fallback in Mathematics or Algebra;
  - explicit unavailable-content dialogs;
  - standardized lifecycle tabs on all seven implemented Mathematics topic screens;
  - corrected hierarchy breadcrumbs;
  - Real Numbers canonical Quiz flow;
  - dynamic Real Numbers review reminder;
  - real local-date runtime scheduling defaults;
  - actual elapsed review time passed to mastery/SRS calculation.
- Date/SRS smoke test: **PASS** (`2026-10-07` recognized as due-today anchor; next review produced from that anchor).

A dependency-backed `npm run lint` / `npm run build` still cannot be completed in this environment because `npm install` times out while accessing the package registry. No `node_modules` directory is included in the package.

## Recommended next milestone

**v10.2 — Mathematics Curriculum/Data Integrity & Content Expansion**

Primary goals: replace remaining static Algebra row metrics with canonical state, refine canonical topic granularity for the Fundamentals sub-lessons, complete missing detailed topic mappings, and add a clean review-completion → next-recommended-topic transition before expanding the same shell to the remaining Mathematics domains.
