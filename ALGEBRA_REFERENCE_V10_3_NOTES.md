# v10.3 — Algebra Reference Integration Pilot

This release implements the approved three-reference content-development framework for Algebra. It does **not** copy textbook chapters or exercise banks into the application. The books are used as structured references for scope, pedagogy, problem taxonomy, and verification while the learner-facing explanations, examples, ECE bridges, and pilot questions are original reviewer content.

## Reference roles

1. **Michael Sullivan, College Algebra, 9th ed.** — concept backbone: objectives, canonical definitions/rules, standard methods, prerequisite structure, chapter/cumulative review organization.
2. **Larson & Hodgkins, College Algebra and Calculus: An Applied Approach, 2nd ed.** — instructional design: section objectives, warm-ups, checkpoints, study tips, technology/algebra tutors, review/test pattern, application framing.
3. **Mary Jane Sterling, 1,001 Algebra II Practice Problems For Dummies** — practice taxonomy: repeated skill families, varied problem presentation, worked-solution patterns, and common “watch out” mistakes.

The ECE board/TOS remains above these references: it determines final scope, priority, and exam emphasis. The textbooks do not automatically determine board weighting.

## New source-aware content model

Added `src/data/algebraReferenceContent.ts` with a reusable pilot-topic model containing:

- learning objectives;
- prerequisite warm-ups;
- rules/formulas with conditions and common-error notes;
- misconception taxonomy IDs;
- original worked examples;
- original pilot practice questions;
- ECE bridge/application notes;
- granular source metadata describing how each reference informed the topic.

Pilot topics:

- `top-alg-fractions` — Rational Expressions
- `top-quadratics` — Quadratic Equations
- `top-functions` — Relations & Functions

## Reference-informed UI components

Added:

- `src/components/math/ReferenceStudyBlueprint.tsx`
- `src/components/math/ReferenceInformedTopicScreen.tsx`
- `src/components/QuadraticEquationsScreen.tsx`
- `src/components/FunctionsScreen.tsx`

The generic pilot screen uses the existing Mathematics lifecycle:

**Learn → Practice → Quiz → Mistakes → Progress**

The Learn view now supports:

- explicit learning objectives;
- prerequisite warm-up disclosures;
- formula/rule cards with conditions and common errors;
- misconception/trap taxonomy;
- original worked examples with Strategy → Steps → Check → Takeaway;
- ECE bridge examples;
- a collapsible internal reference map.

The Practice view provides a small original pilot bank plus a hand-off to the existing scored practice engine. The pilot bank is intentionally small: this release validates the content architecture before scaling question volume.

## Rational Expressions pilot integration

The existing detailed Rational Expressions screen remains the primary custom lesson. It now receives the shared reference-informed blueprint at the start of its Learn view. Its already extensive practice/question data remains in place rather than being duplicated into the new pilot bank.

Internal reference map:

- Sullivan — R.7 Rational Expressions, pp. 62–72
- Larson & Hodgkins — 0.7 Fractional Expressions, pp. 55–62
- Sterling — Ch. 3 Rational Equations and Ch. 8 Rational Functions practice families

## Quadratic Equations dedicated pilot screen

The Algebra catalog now opens a dedicated `quadratic-equations` screen for `top-quadratics`.

Reference map:

- Sullivan — 1.2 Quadratic Equations, pp. 92–103
- Larson & Hodgkins — 1.3 Quadratic Equations and 1.4 The Quadratic Formula, pp. 93–114
- Sterling — Ch. 2 Solving Quadratic Equations and Nonlinear Inequalities, pp. 13–20

The pilot explicitly covers:

- standard form;
- factoring / zero-product property;
- square-root method;
- completing the square;
- quadratic formula;
- discriminant and root classification;
- method selection;
- common ±, sign-substitution, incomplete-root, and Vieta sum/product traps.

## Relations & Functions dedicated pilot screen

The Algebra catalog now opens a dedicated `functions` screen for the Relations, Functions & Vertical Line Test row (`top-functions`).

Reference map:

- Sullivan — 3.1 Functions and related sections 3.2–3.5, pp. 200–256
- Larson & Hodgkins — 2.4 Functions and related sections 2.5–2.7, pp. 195–239
- Sterling — Ch. 5 Functions, pp. 33–38

The pilot covers:

- relation versus function;
- function notation and evaluation;
- domain restrictions;
- multiple representations;
- piecewise evaluation;
- basic composition;
- function-definition, composition-order, and piecewise-boundary traps.

## Misconception taxonomy foundation

`ReviewError` now supports an optional `misconceptionTag` field. The existing seeded Quadratic error that confuses sum and product of roots is tagged as `QUAD_VIETA_SWAP`, and topic mistake views display a tag when one is present.

This is the first step toward mapping wrong answers to targeted remediation rather than storing only a generic error category.

## Navigation updates

Added dedicated screen types and navigation mappings:

- `top-quadratics` → `quadratic-equations`
- `top-functions` → `functions`

Both screens:

- remain under the Mathematics active sidebar state;
- participate in dedicated topic scrolling;
- have Deep Focus-friendly display names;
- can be opened by review-completion recommendation through the existing `mathTopicNavigation` lookup.

## Copyright/content rule used in this release

The app does not bulk-transcribe textbook prose, exercise sets, worked solutions, or artwork. Reference material is used to identify mathematical objectives, standard formulas/procedures, instructional patterns, problem families, and common errors. Learner-facing explanations, worked examples, ECE contexts, and practice questions are authored specifically for this reviewer.

## Original v10.3 validation record

- TypeScript/TSX syntax transpilation: **210 files, 0 syntax failures**.
- Relative import scan: **0 missing relative imports**.
- Pilot-content structural validation:
  - all 3 pilot topics have objectives, prerequisites, rules, misconception tags, and 3 source references;
  - Quadratic Equations has 2 worked examples and 6 original pilot questions;
  - Relations & Functions has 2 worked examples and 6 original pilot questions;
  - Rational Expressions uses its existing full practice bank and adds the shared reference blueprint;
  - all pilot question correct-option indexes are in range.

At the v10.3 pilot stage, dependency-backed lint/build checks were not run because `node_modules` were absent. The later follow-up below records the completed checks after dependencies were installed locally without changing the manifest or lockfile.

## UAT and Foundation batch follow-up

The three requested pilot topics were exercised in the live local app before expansion:

- Rational Expressions: catalog navigation, shared blueprint rendering, Learn/Practice tabs, existing drill start, answer selection, and explanation feedback.
- Quadratic Equations: catalog navigation, shared Learn content, six-question practice, correct-answer scoring, and misconception-tag feedback.
- Relations & Functions: catalog navigation, shared Learn content, six-question practice, correct-answer scoring, and misconception-tag feedback.

UAT also exposed two stale Rational Expressions section links that selected a nonexistent `study` lifecycle tab. Both now return to `learn`.

The first Foundation batch now uses the shared reference-informed content model and Learn → Practice → Quiz → Mistakes → Progress flow:

- `top-factoring` — Factoring
- `top-polynomial-eq` — Polynomials
- `top-laws-exponents` — Exponents & Radicals
- `top-inequalities` — Inequalities

Each topic now has five learning objectives, three prerequisite checks, rule cards with conditions/common errors, misconception tags, two worked examples, six original questions with explanations, ECE bridges, and all three reference roles. Catalog cards and canonical-topic navigation open the new screens; Exponents & Radicals is now visible under Algebra Fundamentals.

The new batch source maps use chapter-level topic locators instead of page numbers, since edition-specific pagination was not verified during this implementation. Confirm precise section/page locators against the physical or licensed editions before treating them as bibliographic citations.

## Recommended next content milestone

Continue expanding with the same method in batches:

1. **Functions batch** — domain/range, inverse/composite functions, polynomial/rational functions, exponential/logarithmic functions.
2. **Systems & special topics batch** — systems, matrices/determinants where in Algebra scope, sequences, binomial theorem, partial fractions.

Question-bank expansion should prioritize independently verified original/parameterized items and misconception-targeted remediation rather than raw volume.
