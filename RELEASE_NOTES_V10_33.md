# BSECE Board Reviewer v10.33.0 — Practice Modes and Quadratic Expansion

**Release scope:** source implementation built on v10.32.0, not a browser-certified production bundle. This is an educational reviewer, not PRC-authorized. The new questions have automated algebra/structural checks but **no human editorial certification yet**.

## Changes delivered

1. **Expanded Quadratic Equations in the shared Practice Library:** 40 newly authored multiple-choice exercises, increasing that topic from 15 to **55 unique question listings**. The combined Algebra Practice Library now has **322 question listings**. The new exercises cover 10 subskill labels and 32 tagged problem-family identifiers, including standard form, factorization, square roots, completing the square, quadratic formula (including irrational and complex roots), discriminant, Vieta/root relationships, method selection, simple application/physical-domain models, and quadratic-like equations.
2. **New question data:** `src/data/practice/quadraticExpansion.json` stores the original question text, four choices, correct answer index, explanation, learning-objective identifier, family identifier, source-independent exact-check metadata, and editorial status. Choices are distributed across A–D instead of putting all correct answers at A. Checks use SymPy via `scripts/verifyQuadraticExpansion.py`; conceptual method-choice reasoning and wording still need separate human review. No textbook questions were bulk-copied.
3. **Practice modes in the shared Library:** **Guided** (hints where authored, explanations after submitting), **Independent** (no hints before submission; explanations after submitting), and **Timed Drill** (user-selected duration of 5, 10, 20, 30, or 60 minutes; no feedback before completion or expiration). Selected question count is honored as long as the filtered bank contains enough unique questions; no silent substitution.
4. **Session engine:** The previous local practice namespace `ece_practice_engine_v1` is retained. Optional, backward-compatible session fields store mode, deadline, duration, completion timestamp, and assistance flags. Drafts, question IDs, answer revisions, and the first-attempt ledger continue to survive refresh. Deadline validation occurs both in the UI and in the pure submission function. A timed session ends at the stored deadline, with unanswered questions counted as incorrect in the final total; answers and explanations unlock afterward. Manual Finish explicitly ends the session.
5. **Evidence protections:** Session submissions remain learning-only data in the supplemental Practice store; they do not update official mastery, spaced reviews, or mock-exam results. A question's unique first-attempt statistic is not incremented after retries or in later sessions. Browser-local storage remains best-effort, not a tamperproof or atomic multi-tab examination service.
6. **Topic-level navigation:** The existing reference-informed Practice tab now links directly to the expanded global library, initially filtered to the same Algebra topic (for Quadratics, 55 questions). The original specialized Practice screen is retained for regression safety.
7. **Backward-compatibility:** Old v10.32.0 practice histories and backups can be loaded by v10.33.0. **New v10.33.0 backups containing Independent or Timed sessions generally cannot be restored into unmodified v10.32.0**, whose importer accepts Guided sessions only.

## Validation and limits

- `npm run qa:source:v10.33`: passes all prior source QA and the new Practice checks.
- `npm run validate:practice:v10.33`: passes mode lifecycle, deadlines, first-attempt protection, compatibility and backup/restore checks.
- `python scripts/verifyQuadraticExpansion.py`: passes symbolic/exact checks of 40 records, 10 subskills, 32 family tags; requires Python and SymPy.
- Legacy baseline Algebra, Learn Reader and broader content/assessment checks pass within their audited scope.
- **Not verified:** complete React/Vite install/build, live browser UX/mobile behavior, actual student acceptance, external expert answer review, strict anti-cheat enforcement. Local npm package installation failed (missing offline package and npm Exit handler error), so do not claim the source is production-certified.
- Several older Practice screens retain their own isolated question pools, progress and difficulty logic. The shared Practice Library is the new centralized experience for Algebra, but other subjects are not yet migrated.
- The legacy Smart Quiz continues to have known overlap with some mock-exam material. This release does not certify its question exposure as unseen.
- Most existing legacy bank items remain under editorial review. The added original questions are clearly marked as automation-checked rather than human-certified.

## Run on Windows PowerShell

```powershell
npm ci
npm run validate:practice:v10.33
npm run qa:source:v10.33
npm run lint
npm run build
npm run dev
```

Open the URL printed by `npm run dev` and navigate to **Practice → Browse & Solve → Quadratic Equations**; select Guided, Independent or Timed and choose a valid question count.

If port 3000 or the Vite HMR port 24678 is in use:

```powershell
$env:PORT="3001"
$env:DISABLE_HMR="true"
npm run dev
```

Browse to `http://127.0.0.1:3001`.

## Recommended manual acceptance checks

1. Quadratic topic shows 55 questions, new material can be found by subskill, and the dropdown count is respected.
2. Guided questions show explanations after answering. Independent mode hides hints; Timed hides answer/correctness until Finish or deadline.
3. In Timed mode start 5 questions / 5 minutes, submit only 2, wait for expiry: result should count 2 answered and 3 unanswered.
4. Reload in the middle of a timed session. Question set, drafts and expiry deadline must remain unchanged.
5. Reattempt a previously answered question in a new set. Unique first-attempt coverage must not increase.
6. Navigate Algebra → Quadratic Equations → Practice → Browse 55 Questions to confirm initial catalog filtering.
7. Export learner backup, restore in v10.33.0, and confirm Guided, Independent, Timed and bookmarks survive.
8. Check the responsive layout at 320px/mobile and desktop widths; verify no equation is clipped and no navigation control is obscured.
9. Run full `npm run lint`, `npm run build` and a live browser smoke test on a machine where dependencies install successfully.

## Next work

- Human expert editorial checking of all new questions, distractors, units, wording and explanations.
- Richer guided hints, numerical-input questions, and wider author-reviewed problem families.
- Migrate specialized Algebra and other major subject banks into the shared catalog with preserved evidence provenance.
- Validate browser behavior and refine UI spacing and question modes from real user testing.
