# v10.4.1 — Algebra Content Integrity & Provenance Hardening

This pass hardens the seven reference-informed Algebra topics before the next content-expansion batch. It preserves the existing Learn → Practice → Quiz → Mistakes → Progress flow and does not change mastery/SRS algorithms.

## Scope

Audited topics:

- Rational Expressions (`top-alg-fractions`)
- Quadratic Equations (`top-quadratics`)
- Relations & Functions (`top-functions`)
- Factoring (`top-factoring`)
- Polynomials (`top-polynomial-eq`)
- Exponents & Radicals (`top-laws-exponents`)
- Inequalities (`top-inequalities`)

## Provenance hardening

All 21 source-map entries now use section/page locators instead of generic chapter-level placeholders. Each source record carries `verificationStatus: 'verified-section-pages'`, and the optional Reference Map UI displays a compact **Section/pages verified** badge.

The source descriptions were also narrowed where a book supports only part of the app topic. In particular:

- Sterling supports the Factoring topic mainly through factorable quadratics and polynomial grouping/synthetic-division practice; GCF/special-product scope is verified primarily against Sullivan and Larson.
- Sterling supplies radical-simplification practice for Exponents & Radicals; general exponent-law coverage is verified against Sullivan and Larson.
- Sterling supplies linear/compound and quadratic inequality practice; absolute-value and rational sign-chart coverage is verified against Sullivan and Larson.
- Sterling's polynomial chapter is used for roots, grouping, synthetic division, evaluation, and graph behavior; basic operations/degree structure are verified against Sullivan and Larson.

This avoids overstating what any single reference actually contains.

## Exact locators now stored

### Rational Expressions
- Sullivan R.7 Rational Expressions — pp. 62–72
- Larson & Hodgkins 0.7 Fractional Expressions — pp. 55–62
- Sterling Ch. 3 Solving Radical and Rational Equations; Ch. 8 Rational Functions — pp. 21–26; 51–56

### Quadratic Equations
- Sullivan 1.2 Quadratic Equations — pp. 92–103
- Larson & Hodgkins 1.3 Quadratic Equations; 1.4 The Quadratic Formula — pp. 93–114
- Sterling Ch. 2 — pp. 13–20

### Relations & Functions
- Sullivan 3.1–3.5 — pp. 200–256
- Larson & Hodgkins 2.4–2.7 — pp. 195–239
- Sterling Ch. 5 Functions — pp. 33–38

### Factoring
- Sullivan R.5 Factoring Polynomials — pp. 49–57
- Larson & Hodgkins 0.6 Factoring — pp. 48–54
- Sterling Ch. 2 factoring practice; Ch. 7 polynomial functions/equations — p. 14; pp. 45–49

### Polynomials
- Sullivan R.4 Polynomials; R.6 Synthetic Division — pp. 39–48; 58–61
- Larson & Hodgkins 0.5 Polynomials and Special Products; 3.3 Polynomial Division — pp. 40–47; 272–281
- Sterling Ch. 7 Polynomial Functions and Equations — pp. 45–50

### Exponents & Radicals
- Sullivan R.2 Algebra Essentials; R.8 nth Roots/Rational Exponents — pp. 21–24; 73–80
- Larson & Hodgkins 0.3 Integer Exponents; 0.4 Radicals and Rational Exponents — pp. 20–39
- Sterling Ch. 1 Making Radical Expressions Simpler — pp. 10–11

### Inequalities
- Sullivan 1.5 Solving Inequalities; 1.6 Absolute Value; 5.4 Polynomial/Rational Inequalities — pp. 119–133; 368–373
- Larson & Hodgkins 1.6 Linear Inequalities; 1.7 Other Types of Inequalities — pp. 126–147
- Sterling Ch. 1 linear inequalities; Ch. 2 quadratic inequalities — pp. 9–10; 18–20

## Mathematical/content corrections found during audit

1. **Factoring MCQ duplicate-answer defect fixed.** `q-fac-3` previously included both the fully factored answer and the equivalent partially factored expression `(x+2)(x²−9)`, creating two mathematically correct options. The distractor is now non-equivalent.
2. **Factoring MCQ ambiguity reduced.** `q-fac-5` previously used `(x²−1)(x²−4) only` as a distractor. Although incomplete, it is algebraically equal to the target polynomial. It was replaced with a genuinely incorrect distractor so the item has one unambiguous correct choice.
3. **Sum-of-squares statement corrected.** The earlier remediation text overgeneralized that a sum of two positive squares is always irreducible over the reals. It now states only that the difference-of-squares identity does not apply automatically to `a²+b²`, while other identities may still factor expressions with additional structure.
4. **Rational-exponent domain condition clarified.** The rule now specifies reducing the rational exponent first, requiring a nonnegative real base when the reduced denominator is even, and excluding zero when a negative exponent is present.
5. **Absolute-value inequality edge cases clarified.** The rule now explicitly handles negative right-hand bounds: `|u|<a` has no real solution when `a<0`, while `|u|>a` is true for every real `u` when `a<0`.

## Answer-integrity regression check

Added `scripts/validateAlgebraReferenceContent.mjs` and package command:

```bash
npm run validate:algebra
```

The validator checks:

- all seven reference-informed topics are present;
- all 21 reference entries use verified section/page locators;
- no generic `chapter-level topic locator` placeholders remain;
- all 36 questions used by the shared reference-informed screens are covered by an independent answer-audit manifest;
- every `correctIndex` is in range;
- all referenced misconception IDs exist;
- question IDs are unique;
- the known factoring duplicate/ambiguous-answer regressions do not return.

## Build-artifact policy for this archive

`node_modules` was intentionally removed by the user before this pass. The previous `dist/` directory was also removed here because it represented a build made before the v10.4.1 source changes and would therefore be stale.

After extracting the archive, run:

```bash
npm install
npm run validate:algebra
npm run lint
npm run build
npm run dev
```

The user's immediately preceding v10.3/Foundation-batch tree passed `npm run lint` and `npm run build` before `node_modules` was removed. v10.4.1 performs dependency-free source validation in this environment; a fresh dependency-backed lint/build should be run after reinstalling packages.
