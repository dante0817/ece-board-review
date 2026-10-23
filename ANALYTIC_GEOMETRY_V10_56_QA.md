# BSECE v10.56.0 — QA log

Generated from actual commands, not inferred browser acceptance.

## Analytic/Geometry regression

```text
PASS Analytic Geometry v10.56.0: 27 lessons, 9 units, 44 formula notes; 27/27 independently recomputed numerical answers, 27 concept items structurally checked, all protected 19 existing content files unchanged
PASS Analytic study tracking v10.56.0: valid parent/section keys; old Algebra/Trig/Plane/Solid records untouched; corrupt-store protection
PASS Analytic Geometry source syntax: 10 TS/TSX files parse/transpile cleanly (not a complete typecheck)
PASS Plane Geometry v10.55.0: 35 lessons, 42 formula notes, 53/53 numeric independently recalculated, 17 concept questions structurally checked; 6 units, stable routes and tracking namespace, nine protected content files preserved; shared tracker compatibility-extended.
PASS Plane+Solid study tracking: old records unchanged, independent parent/section IDs, schema v1, legacy Algebra/Trigonometry scopes still accepted.
PASS v10.54.0 Geometry: three branches, stable Solid ID, derived 43/73/172 counters, safe breadcrumbs, accessible accordion; 9 original protected content hashes unchanged; shared manual tracking validator additively extended.
PASS Solid Mensuration v10.53.0: 172 unique questions in 43 topics; 80 new verified numeric, 6 conceptual; topic/unit/difficulty/answer filters and adaptive selection checks.
PASS v10.52.0: 43/43 topics; 80 independently recalculated numeric questions; 6 reasoning questions; 43 illustration mappings (34 SVG variants); 73 formulas; prior 43 numeric regression cases retained; stable tracking IDs.
PASS Solid Mensuration domain restrictions: 20/20 allow/reject test designs for right/oblique shortcuts, spherical portions, prismoids, Pappus, frustums, open bases, hollow solids.
PASS v10.51.0 Solid Mensuration: 13 units; 43 unique canonical topics; 73 formulas; 43 independently re-evaluated numerical checks. Maximum arithmetic error: 0. Routes, source metadata and progress namespaces checked.
PASS v10.50.3: Trigonometry moved from sidebar to Mathematics → Foundation, with Algebra, screen route and back navigation preserved.
PASS v10.50.2: shared LessonStatus union (including summary), source mapping, honest status label, package versions, source type contract
PASS v10.50.1: 14 topics/102 IDs retained; accordion toggle, real inline reader, status, practice, review, focus mode, responsive and a11y contracts.
PASS QA v10.50: 102 lesson structures; 816 question records; 117 reviewer math spot checks; 3 data-store round trips.
PASS v10.49: 7 draft advanced lessons + 56 draft questions, 102/102 curriculum linked; 816 Trigonometry + 422 original Algebra questions, original spherical topic preserved; representative numerical checks passed.
PASS v10.48: eight draft wave/phase lessons, 64 answer-ledger questions, three original diagrams, math assertions, 760 Trigonometry/422 Algebra questions, progress unchanged.
PASS v10.47: 6 draft polar/parametric lessons, 48 ledger-checked questions, 2 diagrams, numeric math checks, 87/102 connected lessons, 696 Trigonometry and 422 Algebra questions, progress preserved.
PASS v10.46: 8 draft complex/polar lessons, 64 answer-ledger checked questions, Euler/De Moivre/phase/roots math, 2 diagram types, 81/102 lessons, 648 Trigonometry + 422 Algebra practice, preserved progress.
PASS v10.45: 8 draft vector lessons, 64 ledger-checked questions, norm/components/dot/cross/projections/work math samples, diagram contracts, 73/102 total draft lessons, 584 Trigonometry plus 422 Algebra practice, historical progress intact.
PASS v10.44: 8 Topic-09 draft lessons, 64 independent keyed questions, SSA case counts, sine/cosine/Heron/radii/bearing math, diagrams, 65/102 lessons, 520 Trigonometry questions; all original Algebra and progress preserved.
PASS v10.43: 8/8 equations draft lessons, 64 keyed questions, mathematical examples, 57/102 lessons and 456 Trigonometry questions; Algebra, inverse functions and saved progress preserved.
PASS v10.42: 6/6 inverse-trig draft lessons, 48 questions and answer ledger, branch/domain checks, graph, 49/102 lessons and 392 Trigonometry questions; legacy progress/catalog intact.
PASS v10.41: Topic 06 8/8 draft lessons and 64 new questions; 43/102 linked lessons and 344 Trigonometry questions; lesson/practice mapping, source syntax, answer ledger, representative trigonometric identities, legacy Algebra/Trigonometry and saved progress preserved.
PASS v10.40.0: Topic 05 6/6 draft lessons, 48 questions; 35/102 overall draft lessons, 280 questions; 5 authored lessons and 40 questions structurally verified, mathematical representative values checked, progress & Algebra preserved, TypeScript syntax okay.
PASS v10.39.0: 29/29 foundations lessons mapped, 14 new lessons, 112 new keys, 240 total Trigonometry questions, unique stable IDs, diagrams, progress/Algebra regression, 12 legacy formula escapes repaired, representative numeric checks, TS syntax.
PASS v10.38.0: topics 01-02 contain 14 draft lessons, 112 questions (32 pilot + 96 new); 102 curriculum IDs unchanged; independent answer ledger; representative numerical checks; persistent progress and unchanged Algebra record; source syntax.
PASS v10.37.0: 102 stable curriculum IDs, four original draft lessons, 32 validated-answer pilot questions, three accessible SVG diagrams, persistent old-store compatible progress, no corrupt-store overwrite, increased storage capacity, source syntax.
```

## Algebra regression

```text
Algebra reference validation PASS
Algebra v10.5 structural validation PASS
Algebra v10.6 structural validation PASS
Algebra v10.7 structural validation PASS
Algebra v10.8 structural validation PASS
```

## Learn Reader

```text
Learn Reader source QA PASS: 23 lesson views, 7 quadratic sections, 7 objectives, navigation/rendering syntax, reading-state validation and backup/restore.
```

## Manual tracking

```text
Manual Learn v10.35.1 PASS: cumulative checkbox milestones, separate numbered-card records, existing chapter history, manual catalog roll-ups, dates, flags, reader/specialized placement and TSX syntax.
Manual Learn v10.35 QA PASS: 39 unique module IDs, chapter isolation, review actions, corrections, flags, input validation, backup round trip, old archive compatibility, reset wiring and TSX syntax.
```

## Offline npm install

```text
npm error code ENOTCACHED
npm error request to https://registry.npmjs.org/zwitch failed: cache mode is 'only-if-cached' but no cached response is available.
npm error A complete log of this run can be found in: /home/oai/.npm/_logs/2026-10-13T07_35_42_901Z-debug-0.log
```

## Vite build attempt

```text

> bsece-board-reviewer@10.56.0 build
> vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs

sh: 1: vite: not found
```

