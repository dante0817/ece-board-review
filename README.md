> **v10.54.0 Geometry Hub (source candidate).** Mathematics → Foundation Mathematics now contains **Geometry**, with separate Plane (planned), Solid Mensuration (existing 43 lessons / 73 formulas / 172 practice questions), and Analytic (planned) cards. The Solid Mensuration screen ID, data files and manual tracking IDs remain unchanged. The new breadcrumb safely returns to Geometry, and the Solid summary uses actual data counts. Run `npm ci`, `npm run validate:geometry:v10.54.0`, `npm run lint`, `npm run build` and `npm run dev`. Build/browser testing must still be completed locally; see [GEOMETRY_RELEASE_V10_54_0.md](GEOMETRY_RELEASE_V10_54_0.md).

> **v10.39.0 Trigonometric Foundations Complete (Draft).** Added 14 more draft lessons and 112 new original draft practice questions covering all remaining subtopics in Topics 03–04, together with SVG graph diagrams. Across Trigonometry there are now 30 linked draft lessons and 240 questions, with 29/29 foundational subtopics linked. Corrected KaTeX formula escaping in 12 existing v10.38 lessons. Run `npm ci`, `npm run validate:trigonometry:v10.39`, `npm run lint`, `npm run build`, then `npm run dev`. See `RELEASE_TRIGONOMETRY_FOUNDATIONS_V10_39_0.md` for limitations and tests.

> **v10.38.0 Trigonometry Foundations (Topics 01–02).** Added 12 original draft lessons and 96 draft practice questions on angle measurement and right triangles, bringing Topics 01–02 to 14 linked lessons and 112 questions. Across the entire Trigonometry module there are now 16 linked draft lessons and 128 practice questions. Existing IDs, other subjects, and the separate legacy Trigonometry review topics are preserved. Run `npm ci`, `npm run validate:trigonometry:v10.38`, `npm run lint`, `npm run build`, then `npm run dev`. See `RELEASE_TRIGONOMETRY_FOUNDATIONS_V10_38_0.md` for validation scope and unverified browser/build status.

> **v10.35.0:** Manual Algebra Learn tracking is available from each topic’s **My Status** control and in the reference-informed Learn Reader. See [RELEASE_NOTES_V10_35.md](RELEASE_NOTES_V10_35.md).

## Latest update — v10.31.0 (Learn Reader pilot)

- Learn now opens a spacious, responsive, two-column textbook-style reader in all 23 **reference-informed** Algebra topics. Quadratic Equations contains a new **7-section authored lesson** with theory, formulas, seven worked examples and ungraded checks. The other topics display a clearly labeled **summary**, not a finished textbook chapter.
- The new reader includes collapsible/tablet/mobile table of contents, section navigation, reading preferences, resume position, bookmarks and explicit "marked read" progress. Reading progress does **not** affect scores, mastery or spaced repetition.
- Algebra catalog Learn/Continue/Review now honors launch intent for the supported reference topics; due Review still starts the established spaced-review session. Existing Practice/Quiz/Mistakes/Progress workflows are retained.
- Reader state uses a validated `ece_learn_reader_v1` namespace, participates in learner backup/restore and is cleared by Reset All Data. Older backups import into this release, but new backups containing the reader key **cannot** import into unmodified v10.30.0.
- The math-text renderer avoids invalid block math inside a `span`. A `LEARN_READER_ENABLED` developer switch in `ReferenceInformedTopicScreen.tsx` restores the prior Learn presentation without deleting reader data.
- Run `npm ci`, `npm run validate:reader:v10.31`, `npm run qa:source:v10.31`, `npm run lint`, and `npm run build`. In the supplied review environment, the installed-dependency checks/build could not be completed; see `LEARN_READER_RELEASE_V10_31.md`. Device/browser checks and external expert mathematical sign-off remain pending.

## Latest update — v10.30.0 (question accuracy and PRC TOS evidence audit)

- See `CONTENT_REVIEW_V10_30.md` for the 368-question ledger, independently re-implemented numerical cross-checks (128 practice variants), five provisional subtopic concerns and the remaining editorial gaps.
- `npm run qa:source:v10.30` preserves all v10.28/v10.29 source regressions and adds source-level content verification; run `npm run audit:content:v10.30` for current CSV/JSON inventory.
- TOS course-quota setup now exposes subtopic-mapping review flags. No official PRC or expert question approval is implied.
- v10.29 changed the **default server host to `127.0.0.1`**; earlier README sections are historical and must not override current release settings.
- The Windows full build/browser acceptance and physical Canon F-789SGA verification are still pending for v10.30.

---

## Latest update — v10.28.0 (isolated runtime certification, source candidate)

- The application can now honor validated `PORT` and `HOST` variables (default `3000` and `0.0.0.0`), enabling isolated test-server launches.
- `npm run certify:runtime:v10.28 -- --verify --output=RUNTIME_V10_28_LOCAL.json` runs installed lint, build and a browser click-through against a **new loopback-only process** and a one-time identity token.
- `npm run qa:source:v10.28` preserves all earlier release regressions; source QA does not certify the application build.
- Here, npm installation remains blocked (`zwitch` absent offline), so the full build and browser test are **unverified**; physical Canon F-789SGA approval remains pending.
- Review `RELEASE_NOTES_V10_28.md` and `RUNTIME_QA_V10_28.md` before deploying.

---

## Latest update — v10.27.0 (Runtime certification and calculator disclosure safety)

- Includes the full v10.26 learning, assessment, and preliminary Canon F-789SGA calculator functionality.
- Newly scoped calculator help tabs fail closed when question, attempt, assessment mode, answer parameters, or disclosure context changes.
- `npm run qa:source:v10.27` runs all available regression checks.
- `npm run certify:runtime:v10.27` reports prerequisites honestly; `npm run certify:runtime:v10.27 -- --verify --output=V10_27_RUNTIME_CERTIFICATION.json` attempts full installed-dependency build and live app/Chromium smoke. This cannot substitute for hands-on browser or physical Canon testing.
- **This release remains a source candidate**, not a certified installed build or physical-calculator reference.

See `RELEASE_NOTES_V10_27.md` and `RUNTIME_AND_CANON_CERTIFICATION_V10_27.md`.

---

# v10.23.0 — Integration and Canon Device-QA Handoff (Source Candidate)

**NOT production-certified.** Added source import scanning (255 TS/TSX files, 862 local imports), a dependency preflight, an optional headless Chromium smoke test, safer model-specific calculator tip handling, a 28-case unverified Canon evidence JSON export, and stronger tutor access locking during strict assessments. Existing learner data and previous calculator tutorials are preserved.

**Status:** 16/16 regression scripts and 12/12 focused TypeScript checks pass. The full build and browser smoke test remain **blocked** on missing npm dependencies; physical Canon F-789SGA testing remains **pending**. See `RELEASE_NOTES_V10_23.md` and `BROWSER_AND_CANON_QA_V10_23.md`.

```powershell
npm ci
npm run preflight:v10.23
npm run validate:integration:v10.23
npm run scan:imports:v10.23
npm run lint
npm run build
npm run dev
# In a second terminal with Chromium available:
npm run smoke:browser:v10.23
```

---

> **v10.21.0 SOURCE CANDIDATE.** See [v10.20 release notes](RELEASE_NOTES_V10_20.md) for the 10-lesson Canon Calculator Skills Center, 20 interactive knowledge checks, guarded local progress/backups, model-compatibility notices, and pending hardware/browser verification.

# Version 10.18.0 — Canon F-789SGA Assessment-Safe Foundations (Source Candidate)

Retains the ten v10.17 calculator demonstrations, adds a centralized strict-assessment aid lock and typed, versioned Canon technique records, and includes item-level disclosure evidence in learner backup/restore. **No new technique is claimed device-tested or fully published.**

Read `RELEASE_NOTES_V10_18.md`, `VALIDATION_V10_18.txt` and `CANON_F789SGA_DEVICE_TEST_CHECKLIST_V10_18.md` first. A full `npm ci` + `npm run lint` + `npm run build` and a browser smoke test on a dependency-enabled machine remain REQUIRED for production readiness.

Run locally:

```powershell
npm ci
npm run validate:calculator:v10.18
npm run lint:calculator
npm run lint
npm run build
npm run dev
```

---

# Version 10.16.0 — Question Verification and TOS Competency Expansion (Source Candidate)

**Not production-certified or PRC-endorsed.** The application now incorporates the 2022 PRC Electronics Engineers enhanced Tables of Specifications (Resolution No. 10, Annex A) at the **34-course level**. It provides a separate **TOS Course-Quota Practice** option in Timed Practice and reports missing course questions instead of filling them from other areas. It preserves v10.14 subject-weight practice and existing learner data.

**Numerical availability is not educational certification:** The 50-question TOS-targeted preview currently delivers **32**, leaving **18** unfilled. A 100-question TOS-targeted preview delivers **55**, leaving **45** unfilled. The underlying 336-question mock/reference pool contains 335 distinct prompts: 120 have provisional course assignments; 215 are unmapped. There has been no complete expert review of question keys, PRC subtopic coverage, or cognitive-level distribution.

Official PRC enhanced TOS: https://www.prc.gov.ph/sites/default/files/EE2022-10%20TOS.pdf

See `RELEASE_NOTES_V10_15.md`, `TOS_CONTENT_AUDIT_V10_15.md`, `TOS_COURSE_COVERAGE_V10_15.csv`, `TOS_QUESTION_AUDIT_V10_15.csv` and `VALIDATION_V10_15.txt`.

**Run locally after extracting:**

```powershell
npm ci
npm run validate:content:v10.16
npm run validate:tos:v10.15
npm run validate:board:v10.14
npm run lint:board
npm run lint
npm run build
npm run dev
```

A complete dependency-backed build and browser smoke test are **still required** before deployment. Existing browser learner records are retained; use Settings → Export Backup before switching releases.

---

# Version 10.14.0 — Original Board Question Expansion

**Source candidate — not production certified.** This release adds 96 original numerical practice variants across 48 problem families (GEAS, Electronics Engineering, EST). The 50- and 100-question board-weight practice quotas can now be filled, but **within-subject PRC TOS coverage and complete lesson content are not verified**. Read `RELEASE_NOTES_V10_14.md` before treating results as board readiness.

Run `npm ci`, `npm run validate:board:v10.14`, `npm run lint:board`, `npm run lint`, `npm run build`, then `npm run dev`.

---

# v10.13.0 — ECE Subject-Weight Preview (Source Candidate)

This release adds a PRC October 2026 **subject-weight coverage preview** (20% Mathematics, 30% Electronics Engineering, 20% GEAS, 30% EST) to the existing timed-practice screen. It does **not** claim to be a complete board examination: the current 50-question plan can deliver only 29 distinct supported questions, including **zero GEAS**. See `RELEASE_NOTES_V10_13.md` and `BOARD_COVERAGE_V10_13.csv`.

Launch: `npm ci`, `npm run validate:board:v10.13`, `npm run build`, then `npm run dev`. Full npm installation and production build must be verified locally; the packaging environment lacked some npm dependencies.

---

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/2ef91a8e-a0d7-47f2-ac98-bbb22d7a140f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Main GUI refinement

This package includes the approved main-GUI refinement: a calmer global header, simplified sidebar, consolidated Tutor and Study Session controls, a Recommended-Next-centered Today page, consistent page gutters, improved Mathematics parent navigation state, and restored Formula Flashcard screen rendering. See `GUI_IMPLEMENTATION_NOTES.md` for details.

## v10.1 Mathematics flow refinement

This package also includes the Mathematics-flow standardization pass: dynamic Mathematics/Algebra recommendations and metrics, consistent topic breadcrumbs, preserved Algebra navigation context, explicit unavailable-content states, a shared **Learn → Practice → Quiz → Mistakes → Progress** topic shell, and real local-date scheduling/rollover behavior. See `MATH_FLOW_V10_1_NOTES.md`.


## v10.2 Mathematics curriculum/data integrity

This package further separates Fundamentals into independent canonical learner records, makes Algebra curriculum-row status/score/due/mistake information derive from canonical state, adds canonical sequence/partial-fractions records, migrates older stored curriculum data, and adds a review-completion → next-recommended-topic transition. See `MATH_CURRICULUM_V10_2_NOTES.md`.


## v10.3 Algebra reference integration pilot

This package now includes a source-aware Algebra content framework based on the approved roles for Sullivan, Larson & Hodgkins, and Sterling. Rational Expressions receives the shared reference blueprint, while Quadratic Equations and Relations & Functions gain dedicated pilot topic screens using the standard **Learn → Practice → Quiz → Mistakes → Progress** lifecycle. See `ALGEBRA_REFERENCE_V10_3_NOTES.md`.

## v10.5 Algebra expansion batch 2

The reference-informed Algebra framework now also covers **Linear & Literal Equations**, **Absolute Value Equations & Inequalities**, **Rational & Radical Equations**, and **Exponential & Logarithmic Functions**. This release adds verified section/page provenance, focused misconception tags, original ECE-oriented examples, 24 new audited practice questions, dedicated catalog routes, and reference-blueprint integration into the existing rich Linear Equations screen. See `ALGEBRA_EXPANSION_V10_5_NOTES.md`.

## v10.6 Algebra expansion batch 3

The reference-informed Algebra framework now also covers **Systems of Equations**, **Complex Numbers**, **Arithmetic Progressions & Series**, **Geometric Progressions & Series**, and the **Binomial Theorem**. This release adds 50 audited original practice questions, restores canonical Complex/Binomial learner records, hardens legacy curriculum migration and prerequisite-roadmap mapping, fixes the known `(2x² − 1/x)^9` mock-exam answer key to **672 (A)**, and adds a formula-string escaping check for KaTeX-bound content. Harmonic Progressions and polar/De Moivre complex-number material remain deliberately deferred until suitable supporting references are used. See `ALGEBRA_EXPANSION_V10_6_NOTES.md`.


## v10.7 Algebra practice & mastery expansion

This release completes dedicated reference-informed lessons for **Matrices**, **Partial Fractions**, and **Algebraic Modeling & Word Problems**, expands ten earlier shared lesson banks from six to ten questions, and adds supplemental **subskill practice mastery** plus **misconception-directed remediation**. The local practice-evidence layer is intentionally separate from the canonical 1–5 mastery/SRS engine. See `ALGEBRA_PRACTICE_V10_7_NOTES.md`.

---

## Algebra v10.8 — Final Coverage & Assessment Integration

The Algebra reference system now covers 23 source-aware topics with 260 audited shared practice questions. v10.8 adds Composite & Inverse Functions, Polynomial Functions, Rational Functions, and reference-limited Harmonic Progressions & Means; expands eight high-priority banks to 15 questions; adds assessment-readiness guidance; and removes mock-question cloning/cycling in favor of unique-question availability.

See `ALGEBRA_ASSESSMENT_V10_8_NOTES.md` and `VALIDATION_V10_8.txt` for implementation and validation details.


## v10.9.0 — Assessment Integrity & Learner Data Reliability (source candidate)

See **`RELEASE_NOTES_V10_9.md`** and **`VALIDATION_V10_9.txt`** before deploying. Fresh learners now start without pre-awarded test attempts, scores, or progress; demo data is explicit opt-in. Existing saved browser records are preserved, backed up before a one-time schema migration, and treated as legacy/unverified evidence. A real five-question Rational Expressions quiz, corrected per-topic scoring, readiness checks, and an honest unassessed state are included.

**For Windows PowerShell**, from the extracted folder:

```powershell
npm ci
Copy-Item .env.example .env.local
# Add your own GEMINI_API_KEY to .env.local only if using the AI tutor.
npm run lint
npm run build
npm run validate:algebra:v10.8
npm run validate:integrity:v10.9
npm run dev
```

Open the localhost address printed by the dev server. Do not copy `.env` files or localStorage learner data between demo and production installations without review. The distributed ZIP contains **source only**, not installed dependencies or prebuilt runtime.

## v10.10.0 — Canonical assessment engine (source release candidate)

This release retains the v10.9 data migration and extends it with immutable original-option IDs, shuffled choices in eligible practice and mock screens, consistent grading, explicit study/strict attempt metadata, prevention of repeat saves, and validated learner JSON backup/restore in Settings. The full change list and limitations are in `RELEASE_NOTES_V10_10.md`.

From a clean folder on Node.js 20+ with internet access, run:

```bash
npm ci
npm run lint
npm run build
npm run validate:assessment:v10.10
npm run validate:integrity:v10.9
npm run validate:algebra:v10.8
npm run dev
```

The ZIP intentionally does not ship compiled `dist` or `node_modules` files. Real Numbers, Rational Expressions, the reference-informed Algebra topics, weak-spot practice and mixed mocks now use canonical identifiers for recorded practice answers. Most reference questions are also available as worked/practice material, so their scores must not be called independently validated mastery. Strict mock conditions are **self-attested, not proctored**, and the mixed mock still does **not** represent the official ECE board-exam blueprint. Keep offline learner backups safe; browser localStorage is device-specific.

## v10.11.0 — Curriculum, question coverage and reserved assessment (source candidate)

This release adds versioned canonical skill categories, 30 new original assessment variants across 15 conceptual families, self-attested independent checks for five supported Algebra skill areas, delayed recheck evidence rules, and a per-topic skill coverage panel. It also repairs the Absolute Value topic's canonical ID and splits incorrectly keyed local practice records conservatively with a preserved backup. Four duplicate legacy problem prompts remain authored but count once for unique practice coverage.

Read **`RELEASE_NOTES_V10_11.md`** and **`VALIDATION_V10_11.txt`** first. For a full QA run on a computer with working npm dependencies:

```powershell
npm ci
npm run lint
npm run build
npm run validate:algebra:v10.8
npm run validate:integrity:v10.9
npm run validate:assessment:v10.10
npm run lint:curriculum
npm run validate:curriculum:v10.11
npm run dev
```

See **`QUESTION_AUDIT_V10_11.csv`** for the source-by-source inventory of 290 items. The 260 existing questions pass structural checks, not a completed external mathematics audit. Independent checks remain self-attested browser assessments; the mixed mock is not an official PRC blueprint simulation. Only 5 of 102 app-defined Algebra skills have three distinct reserved assessment families at this release.

## v10.12.0 — Two Learning Paths (source candidate)

Select **Guided Learning** or **ECE Board Preparation** in the sidebar. Both use the same topic library, saved progress, mistake history, and assessment records; switching paths never copies or upgrades evidence.

- **Guided Learning:** recommendations follow the existing Algebra topic sequence, with clear warnings when a dedicated lesson is not mapped. It does not claim university course/syllabus completion.
- **ECE Board Preparation:** recommendations use automatic item-level scored performance, relevant retention checks, unresolved errors, and unassessed topics. Manual and legacy test percentages are not promoted to verified performance. Full board blueprint coverage is not claimed.
- **Today's page:** path-specific next action alongside the existing separate retention-review section.
- **Topic screens:** both paths can use Learn, Practice, Quiz, Mistakes, and Progress. The selected path adjusts guidance and suggested next action, not access.
- **Mixed mock setup:** Guided defaults to Study Mode, Board Preparation to self-attested Strict Assessment; either mode can be selected manually. Switching paths cannot alter an exam already in progress.
- **Preferences:** path is stored in `ece_learning_path_v1`, exported/restored in validated learner backups, and defaults to Board Preparation for v10.11 upgrade continuity.
- **Navigation:** Absolute Value catalog mapping and Topic Drawer hook-order error corrected.

Read `RELEASE_NOTES_V10_12.md` and `VALIDATION_V10_12.txt` for limitations. On a computer with npm dependencies available, run:

```powershell
npm ci
npm run lint
npm run build
npm run validate:algebra:v10.8
npm run validate:integrity:v10.9
npm run validate:assessment:v10.10
npm run validate:curriculum:v10.11
npm run validate:learning-paths:v10.12
npm run dev
```

**Important:** This release does not supply a complete syllabus, a full ECE examination question bank, or official PRC readiness certification. The original question-bank mathematical audit and independent-family expansion are still outstanding. The ZIP contains source only, not a successful production build.


## v10.16 content-verification update

The source includes 32 new original numerical practice variants in 16 families, explicit provisional TOS course assignments, two corrected legacy mathematical explanations/answers, and an independent-expected-answer regression script. The topic records are practice-only, not complete instructional lessons. See `RELEASE_NOTES_V10_16.md`, `CONTENT_VERIFICATION_V10_16.md`, `QUESTION_VERIFICATION_V10_16.csv`, and `TOS_COURSE_COVERAGE_V10_16.csv`.

Important: Automated numeric fixtures and generator tests are **not expert validation**, and a filled exam quota is **not full PRC TOS competency coverage**. Existing learner data is preserved by curriculum migration.

## Canon F-789SGA Calculator Skills (v10.17 pilot)

Use the **Calculator Skills · Canon** item in the app sidebar for official manual links, calculator modes, and ten curated question walkthroughs. In a timed mock, the calculator card appears **only after submission**; reference-topic practice reveals it **after checking an answer**. Unsupported questions explicitly show **Technique pending review**. The user-profile calculator selection defaults to Canon F-789SGA and travels with existing learner backup/restore data.

The official October 2026 PRC program lists **F-789SGA with transparent casing**. Physical-device key/display verification is still pending, and these cards do not claim expert review of the entire question bank. The official Canon manual: https://ij.manual.canon/cal/webmanual/WebPortal/pdf/F-789SGA%20%28EXP%29_EN.pdf

After installing dependencies, run `npm run validate:calculator:v10.17` before `npm run lint` and `npm run build`.


## v10.20 Calculator Skills Center

Open **Calculator Skills · Canon** in the sidebar. Select **Lessons & practice** for 10 structured modules with worked examples, two scored multiple-choice questions per lesson and repeatable checks; a perfect 2/2 completes a *knowledge check* only. Local progress is backed up and restored with learner records. Select **Real question examples** for the existing Canon pilot and 18 parameter-bound family techniques. Physical calculator use remains separate from revealing in-app instructional aids; central strict assessment locks the entire skills center. The model-specific instructions are preliminary pending manual and physical-device review. See `CANON_SKILLS_AUDIT_V10_20.csv` and `CANON_F789SGA_SKILLS_DEVICE_TEST_V10_20.md`.


## v10.21.0 — Canon Speed-Decision Drills and Mistake Review

From **Calculator Skills**, choose **Speed drills & mistake review** for a five-minute, 10-question timed decision check. Questions rotate between the 20 v10.20 knowledge checks. After submission or time expiry, review the results and explanations, open related lessons, and compare manual versus conceptual Canon methods. The page offers non-diagnostic remediation based on missed items and unresolved manually logged error categories, plus optional 24-hour in-app follow-up prompts.

Progress is stored locally under `ece_canon_speed_drills_v1` (at most 50 attempts) and validated in learner backup import/export. Scores do not change board-exam evidence or mathematical mastery; this does **not** time physical calculator keystrokes. Exact Canon sequences and device displays remain preliminary. See `RELEASE_NOTES_V10_21.md`, `CANON_SPEED_DRILLS_QA_V10_21.md`, and `CANON_SPEED_DRILL_AUDIT_V10_21.csv`.

Run focused tests via `npm run validate:calculator:v10.21` and `npm run lint:calculator:v10.21`. Full build and browser testing require installed npm dependencies.

## v10.22.0 — Canon device-QA worksheet and exam hardening

Open **Calculator Skills → Physical-device QA worksheet** to log **observations** for 10 pilot and 18 family techniques. Records are validated and included in learner backups; observed passes never grant device or editorial approval. The QA screen supplies pilot steps and a bound example for each family. See `CANON_DEVICE_QA_WORKFLOW_V10_22.md` for the actual device-test protocol.

Strict exam mode hides the global search/notifications/tutor header and auxiliary error/timer overlays. Nine additional Casio-based study screens display model-compatibility warnings. No legacy Casio keystrokes have been invented or relabeled as Canon. The Casio audit CSV remains an open conversion inventory.

To validate source: `npm run validate:calculator:v10.22` and `npm run lint:calculator:v10.22`. Run `npm ci`, `npm run lint`, `npm run build`, and browser tests in a dependency-complete environment before production deployment. **The development environment cannot install `zwitch` from its offline npm cache; full build/browser testing and physical Canon tests are NOT certified.** See `RELEASE_NOTES_V10_22.md`.

## v10.24.0 — Numerical-answer calculator practice and validation

Open **Calculator Skills → Numerical answer drills** to attempt six timed, typed-answer questions, rotating between 12 independently keyed instances. Entries accept signed numbers and scientific notation, with each prompt showing its required unit and absolute tolerance. After a finish or timeout, view worked and independently checked results. This is separate from the earlier timed multiple-choice calculator-decision drills and from official/mock assessment mastery.

Progress is saved under `ece_canon_numeric_drills_v1`, included in learner backup with strict validation, and limited to the latest 50 attempts. New data does not modify preexisting test IDs or scores. All Canon physical keystrokes remain preliminary until authentic device evidence is reviewed.

To check the source: `npm run validate:calculator:v10.24` and `npm run lint:calculator:v10.24`; previous suites and `npm run scan:imports:v10.23` remain available. Full application compilation, browser integration and physical-device testing **must still be performed on a machine with complete npm dependencies and an actual calculator**. See `RELEASE_NOTES_V10_24.md` and `BROWSER_AND_CANON_QA_V10_24.md`.

## v10.25 — Canon numerical accuracy and application QA

The existing six-family/twelve-variant numeric drills now use a shared deadline guard and cancel unfinished work when strict-assessment mode becomes active. After an incorrect numerical response, the app may display a **possible** independently checked error pattern; it never claims to know the learner's reasoning. Previous numeric-drill records and all examination evidence remain separate and compatible.

Run `npm run qa:source:v10.25` for the reproducible 32-check source suite, `npm run audit:numeric:v10.25` to regenerate the twelve-item accuracy CSV and `npm run smoke:numeric:browser:v10.25` for optional Chrome/Chromium numeric-module browser checks. These do **not** certify the full React app. See `RELEASE_NOTES_V10_25.md` and `BROWSER_AND_CANON_QA_V10_25.md` for build/browser/device gates.

## v10.26 Canon F-789SGA coverage expansion

The timed mock question bank now includes **38 parameter-bound preliminary calculator technique families** (76 variants) plus 10 exact-question pilot guides. The Calculator Skills Center displays a subject-level guidance availability summary and makes missing guides explicit. A question-level CSV is in `CANON_GUIDANCE_COVERAGE_V10_26.csv`.

These guides are *not* device tested; they are authored COMP expressions with unit/domain/keyed-answer checks. There are 48 cases in the physical-device QA worksheet requiring actual F-789SGA verification. The new work does not modify the mathematical question IDs, official TOS quota engine, attempt scores, or legacy learner backups. Run `npm run qa:source:v10.26` for regression checks, `npm run audit:calculator:v10.26` for coverage export, and follow `LOCAL_BUILD_AND_CANON_QA_V10_26.md` for outstanding dependency-backed and physical verification.

## v10.29.0 — Local security, honest manual scoring, modal usability

See `RELEASE_NOTES_V10_29.md`, `ISSUE_RESOLUTION_V10_29.md`, and `BROWSER_QA_V10_29.md`.

The server now binds to `127.0.0.1:3000` by default. Do not enable LAN by accident. Setting `HOST=0.0.0.0` requires an appropriate network environment; remote clients cannot call AI HTTP/WebSocket endpoints anonymously. `BSECE_API_TOKEN` (24+ character server-only bearer token) can authorize trusted nonlocal API clients, but the bundled study UI deliberately does not embed this token. This **does not implement accounts, public-hosting authentication or TLS**.

Run `npm ci`, `npm run qa:source:v10.29`, `npm run lint`, `npm run build` and the Windows browser/API test procedures before considering the new version installed-app verified. Physical Canon techniques remain unapproved.

## v10.35.1 — Manual Learn checkboxes inside lessons

Manual study statuses now appear directly at the top of each Algebra Learn topic as **Read 1× / Read 2× / Read 3× / Mastered (Self) / Needs Review** checkboxes. The reading milestones are cumulative and use the same saved v10.35.0 records. Catalog-level editing was replaced by a lesson-opening shortcut while status badges and review filters remain. Specialized Real Numbers, Linear Equations, and Rational Expressions Learn screens now include the same tracker. See `RELEASE_NOTES_V10_35_1.md` and run `npm run validate:manual-learn:v10.35.1`.


### Manual Learn statuses within numbered lesson cards (v10.35.1)
In Algebra Learn, each visible numbered lesson card has checkboxes for Read 1×, Read 2×, Read 3×, Mastered (Self), and Needs Review. The checkmarks persist per card, not across unrelated sections. Earlier manual whole-topic records remain separate; the Algebra catalog reflects both. Checkboxes are self-reported, not scored mastery. See `RELEASE_NOTES_V10_35_1.md`.

## Trigonometry content pilot (v10.37.0)

Mathematics → Trigonometry now opens **four draft pilot lessons** (Radian Measure, Six Trigonometric Ratios, Unit-Circle Definitions, and Pythagorean Trigonometric Identities). They include original explanations, formula cards, guided worked examples, ungraded checkpoints, three SVG illustrations, and eight original practice questions per subtopic. Open a subtopic, select **Learn & track → Open Trigonometry lesson**, or **Practice → Practice mapped questions**.

The pilot uses the pre-existing `LearnReaderLayout`, Practice Library, and browser-local manual learning store. Manual status is separate from scored question results. Every other Trigonometry curriculum entry remains explicitly unlinked until further content is reviewed. Drafts are not independent editorial certifications.

For content, tracking, and compatibility validation, run `npm run validate:trigonometry:v10.37`, `npm run validate:trigonometry:v10.36`, `npm run validate:manual-learn:v10.35.1`, and `npm run validate:practice:v10.34`. For the full app use `npm ci`, `npm run lint`, `npm run build`, and `npm run dev`. The full build requires access to npm dependencies.
