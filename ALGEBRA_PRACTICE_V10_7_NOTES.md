# v10.7 — Algebra Practice & Mastery Expansion

This release builds on v10.6 without replacing the existing canonical mastery/SRS engine. It expands the reference-informed practice layer, adds local subskill evidence and misconception-directed remediation, and completes three previously undedicated Algebra areas: Matrices, Partial Fractions, and Algebraic Modeling/Word Problems.

## New reference-informed topics

### Matrices
- Canonical topic: `top-matrices`
- Dedicated screen: `matrices`
- Covers dimensions, addition/subtraction/scalar multiplication, compatible multiplication, augmented matrices and row operations, 2×2 determinants, inverse existence, inverse matrices, and small-system applications.
- Adds 10 original audited questions.
- Restores a canonical Matrices learner record to the current `initialData.ts`; older test records that already referenced `top-matrices` now resolve against an actual current curriculum topic.

Verified reference map:
- Sullivan 8.2 Systems of Linear Equations: Matrices — pp. 556–570; 8.4 Matrix Algebra — pp. 580–596
- Larson & Hodgkins 6.1–6.4 Matrices and Determinants — pp. 474–520
- Sterling Ch. 14 Matrices — pp. 91–96

### Partial Fractions Decomposition
- Canonical topic: `top-partial-fractions`
- Dedicated screen: `partial-fractions`
- Covers proper/improper preparation, distinct linear factors, repeated linear factors, irreducible quadratic factors, strategic substitution/coefficient matching, and a Laplace-domain ECE bridge.
- Adds 10 original audited questions.

Verified reference map:
- Sullivan 8.5 Partial Fraction Decomposition — pp. 597–604
- Larson & Hodgkins preface/table-of-contents change note — p. x: the former Partial Fractions section was removed in this edition; Larson is therefore recorded as a scope note, not a content source for the topic
- Sterling Ch. 11 Systems of Linear Equations — Decomposing Fractions Using Systems — pp. 77–78

### Algebraic Modeling & Word Problems
- Canonical topic: `top-word-problems`
- Dedicated screen: `word-problems`
- Covers modeling workflow, motion, work rate, mixtures, age/percent/geometry problems, direct variation, and engineering formula translation.
- Adds 10 original audited questions.

Verified reference map:
- Sullivan 1.7 Problem Solving: Interest, Mixture, Uniform Motion, Constant Rate Job Applications — pp. 134–142
- Larson & Hodgkins 1.2 Mathematical Modeling — pp. 80–92
- Sterling Ch. 1 — pp. 8–11 is used only as limited supporting practice for linear/literal-equation manipulation; the applied modeling taxonomy is primarily grounded in Sullivan and Larson

## Practice-bank expansion

Ten earlier shared reference lessons that previously had six local questions now have ten:
- Quadratic Equations
- Relations & Functions
- Factoring
- Polynomials
- Exponents & Radicals
- Inequalities
- Linear & Literal Equations
- Absolute Value
- Rational & Radical Equations
- Exponential & Logarithmic Functions

The shared reference-screen bank now contains 180 audited questions across 18 lesson banks. Rational Expressions keeps its richer existing custom drill system and therefore is not forced into a duplicate shared 10-question bank.

## Subskill practice mastery

`ReferenceInformedTopicScreen` now stores supplemental practice evidence in browser local storage using `ece_reference_practice_evidence_v1:<topicId>`.

For each local practice bank it tracks:
- unique-question coverage
- total attempts and correct attempts
- accuracy by subskill
- subskill practice level: Not practiced / Developing / Proficient / Strong
- misconception miss counts

This evidence is deliberately separate from the canonical 1–5 mastery/SRS state. Local practice does not silently overwrite canonical mastery.

## Targeted misconception remediation

When a learner answers a tagged question incorrectly:
- the corresponding misconception miss counter increments;
- the exact misconception correction and quick check are shown immediately;
- `Practice this trap` targets another question carrying the same misconception tag when available;
- the Mistakes tab shows local miss counts beside the reference misconception taxonomy;
- the Progress tab shows subskill practice mastery and provides direct subskill practice actions.

The Practice tab also includes `Target Weakest Skill`, which uses local evidence to select an unpracticed or low-performing subskill/question without modifying the existing recommendation or spaced-review algorithms.

## Curriculum and navigation

- Added `matrices`, `partial-fractions`, and `word-problems` screen types and App render branches.
- Added dedicated canonical navigation mappings for `top-matrices`, `top-partial-fractions`, and `top-word-problems`.
- Added a Matrices row to the Algebra catalog and routed all three new topics directly from the catalog.
- Added Matrices to the Mathematics-descendant sidebar active-state set.
- Added a Matrices node to the prerequisite roadmap.
- Stage-4 canonical ordering now includes Matrices before Word Problems; Partial Fractions moves to canonical index 28.

## Validation

Dependency-free checks:

```bash
npm run validate:algebra:v10.7
```

Validated in this package:
- 19 reference-informed topic entries
- 57 verified source-map entries
- 180/180 shared reference-screen questions covered by the answer-audit manifest
- all misconception references valid
- all formula-string escaping checks valid
- v10.7 structural validation PASS
- TypeScript/TSX syntax transpilation: 211 files, 0 syntax diagnostics
- relative local imports: 536 checked, 0 missing

A fresh `npm install` was attempted but timed out in the current environment. `node_modules` and stale `dist` are not included. A dependency-backed `npm run lint` or `npm run build` is therefore not claimed for this archive.

After extraction:

```bash
npm install
npm run validate:algebra:v10.7
npm run lint
npm run build
npm run dev
```

## Final misconception-map refinement

Before packaging, several expanded-bank questions were re-tagged so targeted remediation matches the actual error pattern rather than a nearby generic trap:
- Quadratic factoring sign choices now use `QUAD_FACTOR_SIGNS` instead of the quadratic-formula sign tag.
- Exponent/radical items now distinguish `EXP_POWER_RULE`, `EXP_RATIONAL_EXPONENT`, `RADICAL_SIMPLIFICATION`, and `RADICAL_RATIONALIZE`.

This preserves the v10.7 design goal that a wrong answer should lead to remediation for the mistake the learner most likely made.
