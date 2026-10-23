# v10.5 — Algebra Expansion Batch 2

This release extends the reference-informed Algebra framework to the next four areas while preserving the existing main GUI and mastery/SRS behavior.

## New coverage

### Linear & Literal Equations
- Canonical progress topic: `top-linear-eq`
- Keeps the existing rich Linear Equations screen and its specialized systems/word-problem/Casio material.
- Adds the shared reference-informed blueprint above the custom Learn content:
  - learning objectives
  - prerequisite warm-up
  - formula/rule cards
  - misconception taxonomy
  - verified reference map
- Adds a six-item independently audited source-aware seed bank for one-variable, fractional, literal, identity, and ECE formula problems.

Verified source map:
- Sullivan 1.1 Linear Equations — pp. 82–91
- Larson & Hodgkins 1.1 Linear Equations — pp. 70–79
- Sterling Ch. 1 linear equations / solving for variables — pp. 8–9

### Absolute Value Equations & Inequalities
- New dedicated screen: `absolute-value`
- Focused instructional content key: `top-absolute-value`
- Reuses `top-inequalities` as the canonical progress/mastery record so the existing curriculum is not silently split or migrated in this content-only phase.
- Covers distance meaning, two-branch equations, inside/outside inequalities, zero/negative-bound cases, and ECE tolerance bands.

Verified source map:
- Sullivan 1.6 — pp. 130–133
- Larson & Hodgkins 1.6 — pp. 126–137
- Sterling Ch. 1 — pp. 8–10 (supplementary equation/inequality practice; absolute-value inequality rules remain verified against Sullivan/Larson)

### Rational & Radical Equations
- Canonical progress topic: `top-rational-radical-eqs`
- New dedicated screen: `rational-radical-equations`
- Covers denominator restrictions, LCD clearing, radical isolation, powers, extraneous-root checks, and parallel-resistance applications.

Verified source map:
- Sullivan 1.1 fractional equations + 1.4 Radical Equations — pp. 82–91; 113–118
- Larson & Hodgkins 1.1 + 1.5 — pp. 70–79; 115–125
- Sterling Ch. 3 — pp. 21–26

### Exponential & Logarithmic Functions
- Canonical progress topic: `top-logarithms`
- New dedicated screen: `exponential-logarithmic`
- All four Algebra catalog rows for exponential/logarithmic material now open the same coherent lifecycle lesson.
- Covers exponential evaluation/growth-decay, log definition/domain, log laws, change of base, equation solving, extraneous/domain checks, and a decibel power-ratio bridge.

Verified source map:
- Sullivan 6.3–6.6 and 6.8 — pp. 421–465; 476–485
- Larson & Hodgkins 4.2–4.6 — pp. 346–399
- Sterling Ch. 9 — pp. 57–64

## Routing improvements

- `alg-radical-eq` → `rational-radical-equations`
- `alg-literal-eq` → `linear-equations`
- `alg-abs-value` → `absolute-value`
- all four exponential/log catalog rows → `exponential-logarithmic`
- canonical `top-rational-radical-eqs` and `top-logarithms` now resolve to dedicated screens from recommendation/review navigation.
- Mathematics sidebar parent highlighting now includes the v10.4 and v10.5 Algebra descendant screens.

## Misconception taxonomy

New tags include:
- Linear: `LIN_DISTRIBUTION`, `LIN_LCD_MISAPPLY`, `LIN_TARGET_VARIABLE`, `LIN_IDENTITY_CONTRADICTION`
- Absolute value: `ABS_SINGLE_BRANCH`, `ABS_AND_OR`, `ABS_NEGATIVE_BOUND`
- Rational/radical: `RREQ_DENOM_ZERO`, `RREQ_EXTRANEOUS`, `RREQ_BINOMIAL_SQUARE`, `RREQ_LCD_DISTRIBUTION`
- Exponential/log: `LOG_SUM_SPLIT`, `LOG_CHANGE_BASE_FLIP`, `LOG_DOMAIN`, `EXP_BASE_MATCH`

Existing seeded change-of-base and inequality-sign errors were linked to the appropriate misconception IDs.

## Content totals after this release

The source-aware Algebra framework now contains:
- 11 reference-informed topic entries
- 33 verified source-map entries
- 60 independently audited shared/reference practice questions
- 24 new v10.5 questions across four areas

The Linear custom screen retains its larger pre-existing practice bank; its six new reference questions are retained in the canonical source-aware content model for integrity and later unification rather than replacing the richer custom drill.

## Validation

Commands available without project dependencies:

```bash
npm run validate:algebra
npm run validate:algebra:v10.5
```

Current results:
- Algebra reference validation: PASS
- Algebra v10.5 structural validation: PASS
- TypeScript/TSX syntax transpilation: 210 files, 0 syntax diagnostics
- Relative local imports: 534 checked, 0 missing

A fresh `npm install` was attempted in this environment but timed out against the npm registry. Therefore a dependency-backed `npm run lint` / `npm run build` is not claimed for this archive. No partial `node_modules` directory and no stale `dist/` directory are included.

After extraction:

```bash
npm install
npm run validate:algebra:v10.5
npm run lint
npm run build
npm run dev
```
