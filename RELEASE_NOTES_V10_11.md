# BSECE Board Reviewer v10.11.0 — Curriculum & Question Quality

**Status:** source release candidate, not a verified production build.
**Baseline:** v10.10.0. The existing React/Vite/Express application, screens, learner records, and assessment history remain in place.

## Implemented

1. **Explicit Algebra skills and coverage**
   - Versioned application content catalog: `algebra-reference-2026.10-v10.11`.
   - Reference questions retain their canonical topic and original question IDs; 214 original per-topic subskill tags are grouped into **102 assessable-skill categories**. Original labels and misconception tags are preserved in authored content.
   - Each reference-topic **Progress** tab shows distinct lesson problems, reserved assessment families, actual attempted families, and whether delayed evidence exists. Zero coverage is displayed as missing content rather than learner failure.
   - The 102-skill denominator describes this application's Algebra reference content. It is **not** an official PRC blueprint or mapped academic syllabus.

2. **Original assessment variants, separate from guided practice**
   - Added **30 original question variants in 15 mathematical problem families**, across 5 Algebra skill categories: quadratic solving, quadratic root analysis, function domains, solving linear equations, and exponent rules.
   - Each family has two different numerical/worded variants. Assessment selection uses at most one variant per family per attempt, with shuffled choice positions and immutable original-option IDs.
   - Five of 102 grouped skills now meet the *content supply* planning target of at least three distinct reserved families; **97 do not**. This target does NOT by itself establish learner competency.
   - The Quiz tab offers **Scored Practice** (familiar study items) and, where there are at least three unused variants from different families, **Independent Check** (new items with self-attested unaided conditions).
   - Once a variant is attempted it is not automatically reused as an unseen item. Future variants of the same family can be used for a delayed recheck, but they do not count as additional distinct families.

3. **Evidence labels and delayed checks**
   - A single practised problem displays **Practiced once**, even if answered repeatedly. The other practice labels are **Not practiced**, **Developing**, and **Broad practice**—not verified mastery.
   - Self-attested strict checks must contain saved item-level results from the v10.11 reserved bank with matching immutable question, family, and skill IDs. Manual, legacy, assisted, exposed, and repeated-item submissions do not establish independent family coverage.
   - A **Consistent (self-attested)** label requires at least three distinct eligible families with correct latest family results, plus a successful recheck using a *different variant of a previously assessed family*, at least 24 hours later.
   - These checks remain **self-attested and client-side**. They are not secure, proctored, PRC-certified, or official board-readiness evidence.

4. **Corrections to existing material**
   - Corrected the erroneous `top-absolute-value` topic's internal `canonicalTopicId` (was `top-inequalities`).
   - Added a conservative, one-time migration for identifiable `q-abs-*` attempts and `ABS_*` misconception misses mistakenly stored under the Inequalities practice key. The original full record is retained under `ece_reference_practice_evidence_v1:legacy-inequalities-abs-backup-v10.11`; other Inequalities evidence remains untouched. Unknown or invalid evidence is not guessed or deleted.
   - Reset local quiz/practice state when navigating directly between different reference-topic screens, preventing an in-progress response from appearing on the wrong topic.
   - Replaced the remaining fx-991ES-specific recommendation in a mock exam tip with model-neutral guidance; corrected an overbroad claim about every fx-991 model being PRC-permitted. The October 2026 prohibition remains enforced as guidance, not device detection.
   - Improved four terse legacy answer explanations without changing their item IDs or correct answers.

5. **Duplicates, audits, and provenance**
   - The original 260-reference-question bank passed **structural** validation. Four pairs share identical question prompts. Original IDs and old learner evidence were preserved; these repeated problems now count only once toward unique practice exposure for affected groups.
   - `QUESTION_AUDIT_V10_11.csv` includes all 260 legacy questions and 30 new variants (290 rows), their authored keys and explanations, source category, duplicate flags and key-review state.
   - The new 30 variants pass algorithm-specific numerical key checks. The legacy 260 were **not** comprehensively mathematically peer-reviewed in this release; a full human mathematical answer/explanation audit remains open.
   - The raw legacy practice bank remains heavily first-option-keyed (252/260). Eligible UI assessments continue to shuffle options, but authoring-side bias must be cleaned and checked wherever order cannot be shuffled.

## Acceptance results

- v10.8 reference suite: PASS.
- v10.9 integrity suite: PASS.
- v10.10 assessment suite: PASS.
- v10.11 content/evidence regression: PASS, including original-answer relationships, distractor uniqueness, family-separated selection, 25 rounds of shuffled grading, delayed checks, duplicate-prompt sample count, and conservative local evidence migration.
- Focused strict TypeScript compilation of curriculum, assessment and migration utilities: PASS.
- All application TypeScript/TSX source files: parsed with zero syntax errors.
- **Whole-app TypeScript check and Vite production build: NOT CERTIFIED** because runtime dependencies are absent; `npm run lint` reports missing packages such as `react`, `lucide-react`, `express`, and their types. A browser smoke test likewise remains NOT RUN.

## Known limits and next release

- Only **5/102** grouped Algebra skills have reserved assessment-family supply. The remaining 97 still show no or insufficient independently authored assessment coverage.
- The 260 legacy bank needs a full mathematical peer review, item-difficulty analysis, distractor-quality audit, and additional variation before a claim of question-bank completeness is justified.
- The current whole-ECE mixed mock is not blueprint-aligned; no PRC-weighted readiness claim is justified (planned v10.13).
- An academic course-completion percentage must await an actual supplied syllabus. Guided Learning vs ECE Board Preparation are planned for v10.12 and were not implemented here.
- The AI-powered server remains unsuitable for unprotected public deployment without authentication, rate limits, origin controls and usage limits.

## Windows developer verification

Open PowerShell in the extracted source folder, with Node.js 20+ and a working npm registry connection:

```powershell
npm ci
npm run lint
npm run build
npm run validate:integrity:v10.9
npm run validate:assessment:v10.10
npm run validate:algebra:v10.8
npm run lint:curriculum
npm run validate:curriculum:v10.11
npm run dev
```

Inspect the **Algebra → a reference topic → Progress** tab for the catalog/evidence matrix and **Quiz** for the two question sources. Export a learner-data backup in Settings before migration or restoring previous data. Do not expose the development server on the open internet.
