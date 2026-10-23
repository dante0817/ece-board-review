# v10.6 — Algebra Expansion Batch 3

This release extends the source-aware Algebra framework to five additional areas while preserving the existing GUI, mastery/SRS behavior, and v10.5 content.

## New reference-informed topics

### Systems of Equations
- Canonical progress topic: `top-simultaneous-linear`
- Dedicated screen: `systems-equations`
- Covers substitution, elimination, unique/no/infinite-solution classification, 3-variable elimination, 2×2 determinants and Cramer’s Rule, basic nonlinear intersections, and an ECE simultaneous-current example.
- Adds 10 original, independently audited practice questions.

Verified source map:
- Sullivan 8.1 Systems of Linear Equations: Substitution and Elimination — pp. 541–555; 8.3 Determinants — pp. 571–579; 8.6 Nonlinear Systems — pp. 605–613
- Larson & Hodgkins 5.1–5.3 Systems of Equations — pp. 410–444
- Sterling Ch. 11 Systems of Linear Equations — pp. 73–78; Ch. 12 Nonlinear Systems — pp. 79–84

### Complex Numbers
- Restored canonical progress topic: `top-complex-numbers`
- Dedicated screen: `complex-numbers`
- Covers the imaginary unit, powers of `i`, standard rectangular form `a+bi`, arithmetic, conjugates, division, negative radicands, and complex roots of quadratic equations.
- Adds 10 original, independently audited practice questions.
- Scope boundary: the three approved Algebra references support rectangular-form complex algebra well, but they do not provide enough support for a dedicated polar/De Moivre/phasor lesson. Those items are intentionally deferred to the Trigonometry/ECE-reference phase rather than being attributed to these books.

Verified source map:
- Sullivan 1.3 Complex Numbers; Quadratic Equations in the Complex Number System — pp. 104–112
- Larson & Hodgkins 3.5 Complex Numbers — pp. 297–305
- Sterling Ch. 13 Working with Complex Numbers — pp. 85–90

### Arithmetic Progressions & Series
- Canonical progress topic: `top-arithmetic-seq`
- Dedicated screen: `arithmetic-progressions`
- Covers common difference, recursive/general terms, arithmetic means, finite sums, and uniform-step engineering applications.
- Adds 10 original, independently audited practice questions.

Verified source map:
- Sullivan 9.1 Sequences — pp. 637–646; 9.2 Arithmetic Sequences — pp. 647–652
- Larson & Hodgkins 15.1 Sequences and Summation Notation — pp. 1056–1065; 15.2 Arithmetic Sequences and Partial Sums — pp. 1066–1073
- Sterling Ch. 15 Sequences and Series — pp. 97–102

### Geometric Progressions & Series
- Canonical progress topic: `top-geometric-seq`
- Dedicated screen: `geometric-progressions`
- Covers common ratio, nth term, geometric means, finite geometric sums, infinite geometric sums, and the convergence condition `|r|<1`.
- Adds 10 original, independently audited practice questions.

Verified source map:
- Sullivan 9.1 Sequences — pp. 637–646; 9.3 Geometric Sequences/Series — pp. 653–663
- Larson & Hodgkins 15.1 — pp. 1056–1065; 15.3 Geometric Sequences and Series — pp. 1074–1082
- Sterling Ch. 15 — pp. 97–102

### Binomial Theorem
- Restored canonical progress topic: `top-binomial-theorem`
- Dedicated screen: `binomial-theorem`
- Covers `nCr`, Pascal’s Triangle, complete binomial expansion, the general term, coefficient extraction, sign patterns, and an engineering small-parameter example.
- Adds 10 original, independently audited practice questions.

Verified source map:
- Sullivan 9.5 The Binomial Theorem — pp. 668–673
- Larson & Hodgkins 16.6 The Binomial Theorem — pp. 1193–1199
- Sterling Ch. 1 Pascal’s Triangle practice — p. 8; Ch. 17 binomial-expansion practice — pp. 109–116

## Curriculum and routing integrity

- Added/restored canonical learner records for `top-binomial-theorem` and `top-complex-numbers`; Partial Fractions now follows them in the canonical Stage-4 ordering.
- Added dedicated navigation for all five new topics and retained legacy route aliases where useful.
- Strengthened curriculum migration so older topic IDs are folded into current canonical learner records instead of surviving as duplicate extra rows.
- Added migration aliases for older `top-linear-systems`, `top-quadratic-eq`, `top-radicals-rational-exp`, arithmetic/geometric-series, and binomial IDs.
- Updated the prerequisite roadmap to resolve its finer-grained Radicals node against the canonical Exponents & Radicals learner state while keeping a distinct roadmap label.
- Systems, Quadratics, Arithmetic Sequences, and Binomial Theorem roadmap nodes now resolve directly to canonical topic IDs.
- Updated the remaining Algebra mock item that used legacy `top-quadratic-eq` to `top-quadratics`.

## Mock-exam integrity correction

The previously identified mock question `mock-q-03`, asking for the coefficient independent of `x` in `(2x² − 1/x)^9`, is now mapped to the canonical Binomial Theorem topic and keyed to **672, option A**. Its explanation is consistent with that result.

## Formula rendering hardening

A source-level audit found LaTeX commands introduced in later reference-topic formula strings with single JavaScript backslashes. JavaScript would consume those slashes before the string reached KaTeX. All affected formula strings were corrected to use escaped source backslashes, and the Algebra reference validator now checks this condition to prevent regression.

## Harmonic progression decision

`top-harmonic-seq` remains in the canonical curriculum, but v10.6 does **not** create a reference-informed Harmonic Progressions lesson. The three designated Algebra references do not give a sufficiently strong, consistent standalone treatment of harmonic progression for the same content standard used by the other lessons. This topic should be developed only after an appropriate supporting source is selected.

## Content totals

After v10.6 the source-aware Algebra framework contains:
- 16 reference-informed topic entries
- 48 verified source-map entries
- 110 independently audited shared/reference practice questions
- 50 new v10.6 questions across five topics

## Validation

Dependency-free checks for this release:

```bash
npm run validate:algebra:v10.6
```

Current results:
- Algebra reference validation: PASS
- v10.5 structural regression validation: PASS
- v10.6 structural validation: PASS
- TypeScript/TSX syntax transpilation: 210 files, 0 syntax diagnostics
- Relative local imports: 534 checked, 0 missing
- Formula-string escaping audit: PASS

`node_modules` was intentionally absent from the source package, so a fresh dependency-backed `npm run lint` and `npm run build` are not claimed for this archive.

After extraction:

```bash
npm install
npm run validate:algebra:v10.6
npm run lint
npm run build
npm run dev
```
