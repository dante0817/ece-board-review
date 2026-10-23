# BSECE Board Reviewer v10.55.0 — Plane Geometry & Mensuration

## What changed

This is an **incremental content release built from v10.54.0**, which introduced the Geometry hub. The new branch is **Mathematics → Foundation Mathematics → Geometry → Plane Geometry & Mensuration**. It does not replace Solid Mensuration or add a Geometry category to formal board-exam weighting.

### Curriculum

- **35 canonical subtopics**, `GEO-001` through `GEO-035`, sourced at topic/title/reference-location level from the project's Geometry Master Coverage Matrix (21 references).
- **Six instructional units:** Geometric Foundations (6 topics), Triangles & Similarity (10), Quadrilaterals & Polygons (4), Plane Mensuration (5), Circles & Circular Mensuration (7), and Transformations & Applications (3).
- **42 mathematical formula/theorem notes**, with restrictions/conditions.
- **70 independently authored draft practice questions**, two per topic: **53 numerical** and **17 conceptual**, with four answer choices, worked explanations, and applicability notes. Numeric keys are rounded to at most four decimal places in the display.
- Each topic has an initial instructional explanation, method note, warning about misapplied formulas, two worked question examples, a self-check, source cross-references, and a schematic topic-family SVG illustration. The illustrations are **not to scale** and must not be used to infer unprovided dimensions.
- Student views: Learn Topics, Formula Library, Practice Questions; unit/topic/difficulty/answer-state filtering; practice feedback and optional retries; self-reported study status using the existing Learn Reader and manual tracker.

### Progress, compatibility and correctness

- Existing Solid Mensuration `GEO-036`–`GEO-078`, 172 questions, and 73 formula entries are unchanged; its original source files match their recorded hashes.
- Geometry hub shows Plane and Solid as **Available · editorial draft**; Analytic Geometry remains **Planned**.
- Stable internal screen IDs: `geometry`, `plane-geometry` (new), `solid-mensuration` (unchanged).
- New self-tracking IDs: `geo-plane-001`–`geo-plane-035`, with independent `--unit-geo-...` section records.
- Additive shared tracking validator update: accepts `geo-plane-*` and normalized Geometry section IDs, while retaining all previous Algebra, Trigonometry, Solid Mensuration tracking keys and `ece_manual_learn_tracking_v1` schema version 1. An isolated storage compatibility regression confirms existing records are not mutated.
- Reader progress remains under existing `ece_learn_reader_v1` store with new unique reader IDs. Session-only quiz answers are **not persisted**; formal assessed mastery is unchanged.

## Verification completed in this environment

- v10.55.0 Plane Geometry structural integrity: **PASS** — 35 unique lesson IDs, 42 unique formula IDs, 70 unique question IDs, two questions per lesson, six units.
- Independent second-implementation numerical recalculation: **53/53 PASS** (JavaScript calculations checked against data authored by a separate Python implementation).
- Conceptual multiple-choice structural checks: **17/17 PASS** (this is not expert editorial certification).
- Shared real TypeScript manual study tracking/storage tests: **PASS** — new Plane topic and section records, unchanged old Algebra and Solid records, legacy Trigonometry pattern preserved.
- v10.54.0 Geometry navigation structural regression: **PASS**.
- Existing v10.51–v10.53 Solid Mensuration answer/constraint regressions: **PASS**.
- Existing Mathematics, Trigonometry full regression chain: **PASS**.
- Existing Algebra v10.8 source validation: **PASS**.
- TypeScript/TSX syntax parsing for modified sources: **PASS**.
- ZIP integrity: **verified at packaging time**.

**Not verified:** Full Vite build, TypeScript *semantic* type-check against installed dependencies, or real browser end-to-end acceptance. `npm ci` failed in this container with an npm exit-handler error, leaving no installed Vite executable; `npm run build` returned `vite: not found`. Browser acceptance scripts are included but were not passed in this environment.

## Run locally

In Windows PowerShell after extracting the ZIP:

```powershell
npm ci
npm run validate:plane-geometry:v10.55.0
npm run validate:geometry:v10.55.0
npm run validate:algebra:v10.8
npm run lint
npm run build
npm run dev
```

Navigate to **Mathematics → Foundation Mathematics → Geometry → Plane Geometry & Mensuration**.

For optional isolated Chromium browser acceptance after `npm run dev`:

```powershell
python -m pip install playwright
python -m playwright install chromium
npm run smoke:plane-geometry:v10.55.0
```

If your current development server uses a port other than 3000, set `BSECE_SMOKE_URL` to its exact origin. Avoid changing host/port if you rely on existing localStorage records; different origins have separate browser data.

## Remaining work

1. Perform a full local build, TypeScript semantic lint, and browser acceptance (desktop and mobile).
2. Independently review all 17 conceptual answers and the broader mathematical exposition; the 53 numeric tests confirm arithmetic only for the authored cases.
3. Replace reusable schematic diagrams with dimension-aware illustrations where problems require precise labeled configurations.
4. Expand the draft question bank with harder, multistep and engineering-context questions after editorial validation.
5. Develop the separate Analytic Geometry module in a later release; it still has 27 planned topics.

## Source and rights

The Geometry Master Coverage Matrix is used as a topic/reference map only. This release's explanations, questions, answer options and diagrams are newly authored. Uploaded textbooks are **not** bundled into the source and their exercise text/images are not copied into the app.
