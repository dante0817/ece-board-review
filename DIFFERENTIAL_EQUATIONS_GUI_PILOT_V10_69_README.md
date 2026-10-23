# Differential Equations — Controlled GUI Pilot for BSECE Reviewer v10.69.0

**Status: DEVELOPMENTAL / NOT BOARD-EXAM CERTIFIED**

This is a source-level pilot based on the unchanged application version 10.69.0. It activates the existing Differential Equations catalog entry under Mathematics > Core Engineering Mathematics without changing the Mathematics dashboard layout or canonical exam question store.

## Visible changes

- Reuses the existing Differential Equations catalog row, icon and position, now labeled as a GUI pilot.
- Introduces a dedicated screen with **Lessons, Formulas, Practice and Review status** tabs.
- Lists the exact **54 planned lessons under DE01–DE07**, but enables only three pilot lessons.
- Provides three original, unreviewed draft lessons via the existing lesson reader:
  - **DE02-02** Separable solutions and initial conditions: `y'=2xy, y(0)=3`.
  - **DE04-02** Distinct real characteristic roots: `y''-3y'+2y=0`.
  - **DE06-02** Transform table and linearity: `L{2+3t+e^(-2t)}`.
- Each pilot lesson has three reader sections, a guided worked example and a revealable **ungraded** checkpoint.
- Reuses existing manual-learning and reader-progress storage with lowercase IDs `de02-02` etc. and independent manual IDs `chapter-top-de-02-02` etc.
- Shows the official joint 6/4/5 competency-and-cognitive TOS grid on Review Status, with **zero** approved questions and **no** DE exam selector.
- The Practice tab is a signpost to pilot checkpoints, not a released scored question bank.

## What is not included

The remaining 51 lessons, the 45-question independent practice-bank target, qualified textbook passage review, editorial signoff, DE scored exams, integration into Global Practice, interactive DE plots and the global 100-item Mathematics simulator are **not implemented**.

Research reference sections reflect the supplied planning specification and tables of contents. They are not independently approved lesson passages. No original textbook PDFs or reproductions have been added to the app bundle.

## Modified existing files

- `src/features/mathematics/mathCatalog.ts`
- `src/context/ReviewContext.tsx`
- `src/App.tsx`
- `src/components/Sidebar.tsx`
- `package.json` (adds one source-only validation command; application version unchanged)

## New files

- `src/features/differential-equations/deCurriculum.json`
- `src/features/differential-equations/dePilotContent.ts`
- `src/features/differential-equations/DifferentialEquationsScreen.tsx`
- `scripts/validateDifferentialEquationsPilot.mjs`
- `scripts/verifyDifferentialEquationsPilotMath.py`
- `DIFFERENTIAL_EQUATIONS_GUI_PILOT_V10_69_README.md`

## QA and commands

- **PASS** `node scripts/validateDifferentialEquationsPilot.mjs` checks 54 IDs, module totals, mapping, three lesson/section counts, route registration, disabled planned lessons and empty board-approved pool. No npm packages required.
- **PASS** `python scripts/verifyDifferentialEquationsPilotMath.py` checks representative original solutions symbolically (SymPy required).
- **PASS** Global TypeScript `transpileModule` syntax checks of the six modified/new TS/TSX files.
- **PASS** Existing `node scripts/validateProbabilityStatisticsV10690.mjs`.
- **PASS** Existing `python scripts/verifyProbabilityStatisticsV10690.py`.
- **NOT VERIFIED** Full `npm ci`, TypeScript semantic compilation, Vite production build or live browser responsiveness: dependency installation was unavailable during pilot packaging. Do not describe those checks as passed.

On a development machine with dependencies available:

```bash
npm ci
npm run validate:differential-equations:pilot
npm run qa:probability-statistics:v10.69.0
npx tsc --noEmit
npm run build
npm run dev
```

Then manually inspect Mathematics > Differential Equations at desktop and mobile widths, open all three pilot lessons, reveal checkpoints, mark a reader section, mark a manual study milestone, refresh, verify persistence, and navigate back. Verify that legacy Mathematics subjects and the global examination question pool are unchanged.

## Required next work

Source-passage review of pilot lessons, independently checked review, installation/build/browser checks, then remaining lesson authoring. Future question-bank development must remain fail-closed until the exact PRC joint competency/cognitive allocation has independently approved eligible items.
