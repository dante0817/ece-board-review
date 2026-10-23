# BSECE Board Reviewer v10.56.0 — Analytic Geometry source candidate

## What changed

The third Geometry branch is now an available *editorial draft* rather than a placeholder. Its screen is available through **Mathematics → Foundation Mathematics → Geometry → Analytic Geometry**. The hub still routes directly to Plane Geometry and Solid Mensuration.

- 27 canonical lessons, preserving `GEO-079`–`GEO-105` from the project master coverage matrix, arranged into nine units.
- 44 searchable formula/theorem cards, with applicability conditions and KaTeX strings.
- 54 original developmental practice questions: 27 numerical and 27 conceptual. There are two worked examples/checkpoints per lesson. Correct-answer positions are distributed across A–D.
- Topic-responsive SVG schematics and a searchable Learn Reader, topic/difficulty/answer-status filters, answer explanations and retries.
- Dedicated manual tracking IDs `geo-analytic-079` through `geo-analytic-105` and stable reader-section subkeys. Existing storage key `ece_manual_learn_tracking_v1`, schema version and prior records are unchanged. This is self-reported study progress, not official board proficiency.
- No changes to existing 35 Plane lessons, 70 Plane questions, 43 Solid lessons, 172 Solid questions or their original source content.
- Analytic Geometry is **not** added to any official exam weighting or graded mastery system.

## Curriculum units

1. Coordinate Foundations (GEO-079–081)
2. Straight Lines (GEO-082–087)
3. Loci and Circles (GEO-088–090)
4. Conic Sections (GEO-091–095)
5. Polar and Parametric Coordinates (GEO-096–097)
6. Vector Geometry (GEO-098–099)
7. Three-Dimensional Coordinates (GEO-100–102)
8. Surfaces in Space (GEO-103–104)
9. Coordinate Applications (GEO-105)

The `main_reference_location` and `support_reference_location` fields come from the project's 21-book coverage matrix and are **chapter-level navigation aids**, not proof that every particular lesson or exercise was found on that exact page. Problems and descriptions in this release are independently authored.

## Validation completed

- PASS: `npm run validate:geometry:v10.56.0`, including mathematical verification of all 27 numerical questions (independent rule implementations), structural checks for all 27 conceptual questions, all 27 topic IDs and 44 formula records.
- PASS: Legacy Geometry, Solid Mensuration and Trigonometry regression chain.
- PASS: `npm run validate:algebra:v10.8`.
- PASS: `npm run validate:reader:v10.31`.
- PASS: `npm run validate:manual-learn:v10.35.1`.
- PASS: 19 protected Plane/Solid file hashes match the v10.55.0 source ZIP byte-for-byte.
- PASS: 10 TS/TSX files parse/transpile using TypeScript; Python browser script passes syntax compilation.
- PASS: Actual tracking implementation accepts and persists new analytic parent and child IDs, maintains old fixture values, and does not overwrite invalid stored JSON.

## Pending acceptance

- Full Vite build / whole-app TypeScript typechecking and real browser acceptance were **not verified** in this environment. `npm ci --offline` failed due to a missing cached `zwitch` registry entry, and `npm run build` failed with `vite: not found`.
- The 27 conceptual answers passed structural QA only; expert mathematical editorial review and figure-level browser review remain pending.
- No persistent practice attempt history was added; in-session answers are reset if the module unmounts.
- The 15 spherical and advanced Geometry enrichment outcomes remain supplementary and are not new independent lesson tracks.

## Local execution / testing (PowerShell)

```powershell
npm ci
npm run validate:geometry:v10.56.0
npm run build
npm run dev
```

In another terminal after the app starts:

```powershell
python -m pip install playwright
python -m playwright install chromium
npm run smoke:analytic-geometry:v10.56.0
```

Use `BSECE_SMOKE_URL` to point the browser test at a different app port, without changing or stopping unrelated processes. Keep the prior application URL (including hostname/port) to retain access to the same browser-origin localStorage. Do not delete the old storage during upgrade.

## Rollback

Keep the unmodified v10.55.0 ZIP. If reverting the code, restore that ZIP and use the same browser origin. The new analytic tracking records are additional records under the old schema; v10.55.0 may not recognize their new IDs and should not be used to overwrite or reset that storage. Export a backup before rollback if any new analytic progress has been recorded.
