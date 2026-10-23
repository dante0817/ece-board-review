# BSECE Board Reviewer v10.54.0 — Geometry Hub / Navigation Release

## Release scope and status

This release implements a navigation-only Geometry hub under **Mathematics → Foundation Mathematics**. It does not add board-examination quotas, modify existing Solid Mensuration lessons, or introduce new Plane or Analytic Geometry lessons.

**Status:** source candidate. Content-integrity and source-level regressions passed in the preparation environment. A complete Vite build, typecheck with installed project dependencies, and real-browser acceptance remain **unverified** because dependency installation failed (`npm ci`: missing cached package / npm exit-handler error; `vite` unavailable).

### What changed

1. New `geometry` screen in the existing `ScreenType`/`setCurrentScreen` navigation system, with a dedicated-scroll route in `App.tsx` and Mathematics sidebar highlighting.
2. Mathematics → Foundation Mathematics now presents a single **Geometry** entry with **Explore Geometry** and a **Continue Solid** shortcut. No separate Geometry button is added to the global sidebar.
3. New `GeometryScreen.tsx` and typed `geometryCatalog.ts` showing:
   - **Plane Geometry & Mensuration** — 35 planned outcomes, curriculum preview only
   - **Solid Geometry & Mensuration** — available editorial draft, 43 lessons, 73 formula/theorem entries and 172 practice questions
   - **Analytic Geometry** — 27 planned outcomes, curriculum preview only
   - Supplementary notice for spherical (6) and advanced (9) outcomes with a Trigonometry cross-link
4. Solid Mensuration breadcrumb now reads **Board Subjects → Mathematics → Geometry → Solid Mensuration**, and its **Back** button returns to Geometry. The existing `'solid-mensuration'` screen identifier and Mathematics shortcut remain valid.
5. The Solid Mensuration breadcrumb no longer calls `closeLesson()` *before* a requested screen change; its selected lesson stays visible when strict assessment / Deep Focus rejects navigation.
6. Solid Mensuration header counts now derive from `SOLID_LESSONS`, `SOLID_FORMULAS`, and `SOLID_PRACTICE`, correcting the outdated `86 Practice questions` display.
7. The broken `<AppArtwork name="cube"/>` usage is eliminated, using valid existing artwork. The Foundation Mathematics accordion header now uses a semantic keyboard-accessible `<button>` with `aria-expanded`; the shared breadcrumb marks the current page with `aria-current="page"`.
8. Existing source validators' version allow-lists were extended to 10.54.0. Mathematical tests and other original assertions remain in place.

### Explicitly unchanged

- Solid Mensuration canonical lesson IDs `GEO-036`–`GEO-078` and the existing 13 units
- All existing 73 formula entries, 172 practice questions, source geometry data, and learning content
- `ece_manual_learn_tracking_v1` storage namespace and `geo-solid-###` manual tracking IDs
- Existing Algebra and Trigonometry lesson/practice content
- Strict assessment and Deep Focus central navigation guards
- Formal exam scoring, topic weighting, and canonical mastery
- Session-only practice-answer state: unfinished answers may reset after navigating away, as in v10.53.0

### Source-level QA executed

| Check | Result |
| --- | --- |
| `node scripts/validateGeometryNavigationV10540.mjs` | PASS — new hierarchy, artwork references, state/route contracts, stable hashes |
| Baseline integrity of 10 protected content/tracking files | PASS — SHA-256 unchanged from v10.53.0 ZIP |
| `npm run validate:solid-mensuration:v10.53.0` | PASS — 43 lessons, 73 formulas, 172 questions, numeric cases and applicability |
| `npm run validate:mathematics-nav:v10.50.3` | PASS — full Trigonometry chain and Mathematics links |
| `npm run validate:algebra:v10.8` | PASS — existing Algebra source content |
| TypeScript parser on eight modified/new TS/TSX files | PASS — no syntax diagnostics |
| Project TypeScript check (`tsc --noEmit`) | BLOCKED — required project dependency type declarations unavailable |
| `npm run build` | BLOCKED — `vite: not found` after failed npm install |
| Playwright browser smoke | NOT RUN — no running, installed app in this environment |

### Run locally (Windows PowerShell, inside the extracted source directory)

```powershell
npm ci
npm run validate:geometry:v10.54.0
npm run validate:algebra:v10.8
npm run lint
npm run build
npm run dev
```

Visit the address printed by the development server. Open **Mathematics → Foundation Mathematics → Geometry → Solid Geometry & Mensuration**.

Optional browser test after `npm run dev` and Playwright / Chromium installation:

```powershell
python -m pip install playwright
python -m playwright install chromium
$env:BSECE_SMOKE_URL = 'http://127.0.0.1:3000'
npm run smoke:geometry:v10.54.0
```

The browser test uses a **temporary isolated browser context** and a temporary manual tracking record. It does not touch a student's actual browser profile.

### Port and learner-data precautions

The application uses the existing server defaults. If ports `3000` or `24678` are occupied, inspect which application owns them before stopping a process. Do not silently kill unrelated services.

Manual study data is browser-origin-specific. `http://localhost:3000`, `http://127.0.0.1:3000`, and `http://127.0.0.1:3001` do **not** share localStorage. Stay on the same origin to reuse existing records. Export/back up learner data using the app's existing backup workflow before upgrade. No storage migration or reset is performed in v10.54.0.

### Acceptance steps still requiring a locally installed browser run

- Validate Geometry hub desktop, 390px mobile, and keyboard-only navigation
- Confirm planned curriculum previews do not open unavailable lessons
- Verify all 43 Solid lessons, 172 questions, 73 formula entries render
- Verify a previously saved learner record survives reload on the same origin
- Exercise strict assessment and Deep Focus: blocked Geometry/Mathematics breadcrumbs must not close an open lesson
- Confirm existing Trigonometry, Algebra and screen navigation still behave as before
- Verify application build and TypeScript typechecking with installed dependencies

### Rollback

Restore the saved v10.53.0 source ZIP and keep the browser origin unchanged. Do **not** clear localStorage. This navigation release changes no existing persistent-progress schema or canonical question IDs. Older source releases do not provide the new Geometry hub, so bookmark-independent in-app paths will return to their old arrangement.

### Known limitations

Plane Geometry and Analytic Geometry are curriculum **previews**, not new course implementations. The Solid Mensuration lessons remain editorial drafts and developmental practice, not endorsed board examination questions. Full browser and expert mathematical acceptance is not claimed.
