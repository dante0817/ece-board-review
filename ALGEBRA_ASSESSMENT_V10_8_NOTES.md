# Algebra v10.8 — Final Coverage & Assessment Integration

## Scope

This phase closes the remaining routed Algebra content gaps that are supported by the approved reference set and hardens assessment integrity before moving to the next Mathematics area.

### New reference-informed topics

- **Composite & Inverse Functions**
  - composition order and domain
  - one-to-one tests
  - inverse construction and verification
  - domain/range swap
  - graph reflection across `y = x`
- **Polynomial Functions, Zeros & Theorems**
  - Remainder and Factor Theorems
  - rational-zero candidates
  - synthetic-division reduction
  - multiplicity and end behavior
- **Rational Functions, Holes & Asymptotes**
  - domain restrictions
  - removable discontinuities vs vertical asymptotes
  - horizontal/slant asymptotes
  - intercepts and reduced-form behavior
- **Harmonic Progressions & Means**
  - deliberately limited to what the approved references support
  - reciprocal relationship to arithmetic sequences
  - two-number harmonic mean
  - relation among arithmetic, geometric, and harmonic means for positive values
  - no claim that the approved books contain a full standalone harmonic-progression chapter

## Practice-bank expansion

The shared Algebra reference system now contains **23 topics and 260 independently audited practice questions**.

The following high-priority banks were expanded from 10 to **15 questions each**:

- Quadratic Equations
- Relations & Functions
- Linear & Literal Equations
- Rational & Radical Equations
- Exponential & Logarithmic Functions
- Systems of Equations
- Matrices
- Partial Fractions

The four new v10.8 topics contain 10 original questions each.

## Assessment readiness

Local practice evidence now produces a conservative assessment-readiness state:

- No evidence
- Practice first
- Ready for quiz
- Strong evidence

Coverage, accuracy, practiced subskills, and severe local weaknesses are considered. This evidence only changes the **recommended next action**. It does **not** directly change the canonical mastery/SRS score; canonical mastery remains owned by the scored review workflow.

## Timed mock integrity

The previous mock generator could cycle and clone questions when the requested count exceeded the available pool. v10.8 removes that behavior.

- No `-repeat-` question clones.
- No cycling to force a target count.
- Algebra-only mocks can draw from the audited reference-informed bank.
- Foundation practice items are excluded from the timed reference-assessment pool.
- The reference assessment pool currently has **203 eligible non-Foundation items**.
- Comprehensive mocks use the existing 37-question cross-subject bank first. If a longer set is requested, only the needed number of unique Algebra reference items are appended. This is an availability mechanism, **not an official TOS weighting**.
- Subject-specific mocks other than Algebra are capped by the unique questions actually available.
- The setup screen displays unique availability and the effective exam size.
- Reference assessment options are deterministically rotated so the authored first-option convention does not create an answer-letter bias. In validation, the 203 generated reference items distribute their answer keys across A/B/C/D rather than all using A.

## Mock-question integrity corrections

- The verified independent-term answer for `(2x² - 1/x)^9` remains **672 (A)**.
- The old Algebra complex-number mock that depended on polar form / De Moivre's theorem was replaced by a rectangular-form complex multiplication item. This keeps Algebra assessment inside the scope of the approved Algebra references.
- The mixture/work-rate mock is now mapped to canonical topic `top-word-problems` instead of the obsolete/noncanonical `top-work-rate` ID.
- All 13 curated Algebra mock questions now resolve to canonical learner-topic IDs.

## Catalog and navigation cleanup

- Added dedicated routes for inverse functions, polynomial functions, rational functions, and harmonic progressions.
- Added a working route for **Signed Numbers, Fractions & Decimals** through the Real Numbers fundamentals surface.
- Corrected **Quadratic & Rational Sign Charts** to use the canonical inequalities mastery record instead of the quadratics record.
- Every Algebra catalog row now has an interactive learning route.

## Reference roles used

- **Sullivan, College Algebra 9e:** concept/objective backbone and canonical topic sequencing.
- **Larson & Hodgkins, College Algebra and Calculus 2e:** instructional design, checkpoints, graph/function treatment, and alternative worked structures.
- **Sterling, 1,001 Algebra II Practice Problems:** practice-family and common-error taxonomy.

Harmonic progressions remain explicitly source-limited. Sullivan supports the two-number harmonic mean in its mean applications; Larson provides harmonic sequence forms in its reference summary; Sterling's sequence chapter does not provide a dedicated harmonic-progression problem family.

## Validation commands

```bash
npm run validate:algebra:v10.8
```

The dependency-independent regression chain covers v10.5 through v10.8 plus the full source/answer audit.

Because this portable package intentionally excludes `node_modules`, run the following after extraction on the development PC:

```bash
npm install
npm run validate:algebra:v10.8
npm run lint
npm run build
npm run dev
```
