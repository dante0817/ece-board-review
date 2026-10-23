# BSECE Board Reviewer v10.10.0 — Canonical Assessment & Evidence Engine

**Status:** Updated source release candidate; core assessment validation passed. **Full dependency-backed production build and browser end-to-end checks are not certified here** because the npm registry was unreachable and required packages are not fully cached. Original v10.9.0 files remain unchanged.

## Implemented

1. **Shared assessment domain:** `src/domain/assessment/{types,grading,optionOrder,evidence,attemptId}.ts` supplies stable choice IDs, score calculation, topic/skill metadata, random display order, exception flags, duplicate ID checks, and explicit evidence classes.
2. **Option-position bias correction:** Choices are shuffled at the start of an attempt in eligible flows and displayed labels are derived from the shuffled order. The original answer IDs remain the grading keys. The actual displayed order is stored with item results for feedback/reproducibility. Prompts or explanations that explicitly refer to option letters or "above" are kept in authored order.
3. **Assessment adapters:** The timed mixed mock, weak-spot quiz, Rational Expressions five-item quiz, reference-informed Algebra practice, scored reference-topic quizzes, and Real Numbers knowledge checks now use shuffled choices. Auto-graded assessment flows use the shared grading engine and store original choice identifiers; immediate practice keeps supplemental existing feedback/history functionality.
4. **Scored reference quizzes:** The previous reference-topic Mastery Quiz button that opened a manual review is replaced by a genuinely auto-graded **Scored Practice Quiz** (up to 10 eligible questions per attempt). These questions overlap the visible practice bank and therefore are **study evidence only**; no verified skill claim results.
5. **Study vs Strict conditions:** Mixed Mock offers Study Mode (pause and in-app formula reference allowed) and Strict Assessment (no pause or formula sheet). Strict completion is **self-attested**: the app cannot detect off-screen reference use or proctor examinees. Individual attempts record `attemptId`, `startedAt`, `assessmentMode`, `assistanceUsed`, `pausedSeconds`, `selfAttested`, `curriculumVersion`, item outcome and saved option order where available.
6. **Readiness and test history:** The readiness selector recognizes only complete, unassisted, self-attested strict subject attempts for its assessment-performance checks, not legacy/manual/study scores. Test History labels records as legacy unverified, manual reported, study assisted, study practice, or strict self-attested.
7. **Safe learner data portability:** Settings exports learner progress and evidence to versioned JSON, validates size, namespaces and record shapes before preview/import, requires explicit restore consent, and attempts a rollback on storage failure. The original v10.8 pre-migration snapshot remains preserved; a first pre-restore backup is additionally kept in browser storage if space permits. Backups do not include API tokens.
8. **Migration continuity:** v10.9 users upgrade to schema marker `10.10` without losing past data; earlier legacy records retain their provenance. Existing scores are not silently promoted into strict independent results.
9. **Small supporting fixes:** removed misleading default 2028 PRC exam-date copy; capped single-authored-question subskill practice labels to avoid implying strongly established mastery; fixed feedback-to-AI wording to refer to correct answer content rather than its original choice letter.

## Validation performed

- `tsc -p tsconfig.assessment.json`: **PASS** (core domain, migration, backup, initial data and readiness utilities).
- `node scripts/validateAssessmentV1010.mjs`: **PASS** (40 randomized option permutations, grading invariance, malformed option/answer checks, evidence classifications, archive round trips and rejection, UI integration presence).
- `node scripts/validateIntegrityV109.mjs`: **PASS** (v10.9 regression behaviors).
- `node scripts/validateAlgebraReferenceContent.mjs`, expansion v10.5/v10.6, practice v10.7, assessment v10.8: **PASS**.
- TypeScript/TSX source parser scan: **PASS**, zero parsing errors.
- `npm ci --offline`: **FAILED**, uncached dependency `zwitch`; online registry is DNS-unreachable. `npm run lint`, `npm run build` and actual browser flows therefore **remain pending**. This release is not production-certified.

## Explicitly remaining (v10.11+)

- Review the correctness, ambiguity, and quality of question banks and expand **unseen** families before making verified mastery decisions. Many subskills still have one authored question.
- Representative PRC Mathematics and full-ECE mock coverage, quota allocation and official subject-level assessment rules.
- Device-independent authenticated accounts, public API hardening, broader UX/accessibility checks, and browser end-to-end testing.
- Restore is a **replace**, not a merge; users should export current progress before importing. Storage quota or browser policy may block saving. Full backup recovery should be tested on target devices.

## Windows setup

1. Extract to a new directory and do not reuse old `node_modules` or `dist`.
2. Configure `.env.local` using `.env.example` only if enabling Gemini features; keep API keys secret.
3. Run `npm ci`, `npm run lint`, `npm run build`, `npm run validate:assessment:v10.10`, `npm run validate:integrity:v10.9`, and `npm run validate:algebra:v10.8`.
4. Start with `npm run dev` and open the address shown. Check quiz and restore flows in browser **before** using real learner data.
