# BSECE Board Reviewer v10.32.0 — Categorized Practice Pilot

**Status:** Source implementation validated by focused tests. **NOT** a full TypeScript/Vite build or live browser-acceptance certification. Based on v10.31.0. Not PRC-endorsed or independent editorial sign-off.

## Delivered

1. **Practice landing redesigned** into three distinct activities: **Browse & Solve** (new default), **Smart Quiz** (legacy diagnostic), and **Log External Practice** (existing manual self-attested record workflow). Removed deceptive 10/20/30/50 and difficulty controls from the manual form because that workflow did not use them. Subject filtering now maps actual `subj-geas`, `subj-communications`, `subj-electronics`, and Mathematics identifiers. Preserve the existing 5-question timed Algebra challenge and Errors link.
2. **Shared Algebra Practice Library** combining reference-informed, Linear Equations and Rational Expressions question records through nondestructive namespaced adapters. **282 unique catalog listings**, including **15 Quadratic Equations** questions. This is a combined bank count, not 282 newly authored questions or a certification of all their answers. Duplicate exact stems within a topic are collapsed in the catalog but historical IDs remain unchanged.
3. **Browse** with topic/subskill tree, search, difficulty and first-attempt status filtering, live counts, 8 cards per page, preview, bookmarks, mobile collapsible topic list, and explicit no-results messages. The source provides only Algebra-bank questions in this pilot; other subjects retain their existing components and manual logs.
4. **Guided solving** with finite randomly selected *question IDs* (not replacements), option selection, mathematical formatting, explanations after answering, optional hints when authored, optional Focus vs Browse views, number-of-questions control, actual scarcity notice with a "Use all available" action. No assessment/mastery updates.
5. **Versioned browser-local practice history** `ece_practice_engine_v1`: last ten finite session snapshots, content revision fingerprints, chosen answer drafts, first submission outcomes, bookmarks, resume-on-reload and interrupted release detection. First-attempt credit is *per unique catalog question* and never increments again for retries or subsequent guided sets. This is supplementary feedback only.
6. **Backup/restore/reset:** Added the practice history to the managed learner archive, validated bounds and shapes on export/import, refuses overwriting corrupt practice records. Adds a `ece_linear_daily_credit_v1` ledger to protect existing Linear Equations daily counters across retry, reload and new sessions; its records are also included in learner backup/reset. Old archives can still be imported. Older app builds will generally reject new archives containing these namespaces.
7. **Rational Expressions:** filter results no longer broaden silently; the question set is copied and shuffled once at session creation, instead of being dynamically selected as filters change.
8. **Smart Quiz:** subject and error-category constraints applied before candidate selection; actual displayed allocations equal actual selected counts. Empty subject/category combinations return zero rather than unrelated replacements. **Important:** the Smart Quiz remains a legacy *study* diagnostic and can expose questions also found in the mock-exam bank; this is explicitly disclosed, and the activity must not be represented as unseen exam performance.

## Known limits and unfinished work

- **Guided only** in the shared library. No new Independent/Timed practice modes are certified. The pre-existing Algebra 5q timed challenge still runs independently. Mock Exam remains separate.
- **Legacy mathematical questions are not expert-certified** merely because they pass structural tests; the GUI displays this limitation. No new 40–60 verified Quadratic Equations collection was authored here; the Quadratic shared bank still has 15 questions.
- Previous standalone specialized screens remain in place. Their existing progress stores are kept separate; new shared Guided history deliberately does not inflate their mastery/daily targets.
- The legacy Rational Expressions timer and retry ledger do not yet have the same persistence and integrity semantics as the new shared Guided engine.
- No backend or atomic cross-tab transaction service has been introduced. Best-effort re-read and storage-event synchronization reduce collision risk but cannot guarantee atomicity under simultaneous submissions from multiple tabs.
- App-wide browser deployment, small-screen interaction, and **full `npm run lint`/`npm run build`** remain unverified here: dependencies cannot be installed in this environment. Must be run on user's development machine after `npm ci`.

## Developer verification

```powershell
npm ci
npm run validate:practice:v10.32
npm run qa:source:v10.32
npm run lint
npm run build
npm run dev
```

If the existing dev instance is using ports 3000/24678, close it first, or in PowerShell:

```powershell
$env:PORT="3001"
$env:DISABLE_HMR="true"
npm run dev
```

Navigate to **Practice → Browse & Solve → Quadratic Equations**. Try a 5-question Guided session, answer a problem, refresh, verify the selection and result persist, and check **Log External Practice** and **Smart Quiz** separately.

## Next priority

1. Configure and run full build, production server and browser/mobile acceptance; fix regressions before deploying.
2. Independently review and expand Quadratic Equations to 40–60 original, diverse and verified questions; add objective mappings and reliable problem-family/provenance metadata.
3. Implement Independent and Timed sessions on the validated engine, with saved deadlines and unanswered-on-expiry semantics.
4. Incrementally migrate the remaining specialized Algebra and other subject Practice screens with parity checklists and clear availability status.
