# Calculus integration — development checkpoint

Branch: `feature/calculus-v10-70-0-development` (based on v10.69.0 GitHub `main`, commit `f97b15c`).

## Implemented in this branch
- Activated the existing Differential Calculus and Integral Calculus Mathematics catalog entries, preserving existing grouping and visual conventions.
- Added typed routes and new screens to the existing `ReviewContext` and `App`, retaining global calculator ownership, strict-assessment locking and navigation policies.
- Added five PRC Mathematics syllabus modules per subject, with 15 items per subject in the official distribution.
- Added 30 original **introductory editorial draft** lessons (15 per subject), with definitions, formulas, method reasoning, worked examples, caveats and bibliographic pointers.
- Reused the shared `LearnReaderLayout` for reading, bookmarks and manual learning progress.
- Added searchable modules, formula tabs, a 15-question **ungraded** draft practice bank, module filters, explanation reveal and explicit release/readiness status.
- Draft questions and lessons are **not** presented as independently approved. Scored board-exam eligibility is intentionally disabled.

## Source provenance / baseline limitation
The attached F-789SGA ZIP and prior Probability/Statistics ZIP could not be byte-compared using the local execution services, which were unavailable. The connected GitHub `main` source was inspected and used as the implementation baseline; its initial commit identifies v10.69.0, includes the calculator, the Probability/Statistics content and the Mathematics registry. **Byte equivalence with the uploaded ZIPs remains unverified.** No changes were made to `main`.

## Verification performed
- Retrieved changed source files from GitHub branch and read back all additions.
- Parsed the two new JSON files successfully.
- Confirmed exactly 10 distinct module IDs and 30 distinct lesson IDs.
- Confirmed all module lesson references resolve, lessons point to defined modules and subject route strings appear in catalog, context and App.
- Confirmed each subject has 15 draft lessons and 15 blueprint item allocations.

## Not yet verified / incomplete work
- **No TypeScript compilation, Vite build, browser UI or end-to-end regression** was run: local code execution and build environment were unavailable.
- Only 15 draft practice questions are present; planned comprehensive 120+ independent validated questions have not been authored.
- Lessons are introductory topic samples, not the full detailed course required by the development specification.
- Source passages, domain/notation review, independent mathematical checks and editorial approval are pending; bibliographic pointers do not certify coverage.
- The full global Practice and 100-item Mathematics examination engines have not been extended to include draft items, intentionally, to avoid unapproved questions affecting exam scores.
- No new illustrations, advanced 3D visualization, schema migrations or new calculator features were added.

## Next recommended development work
1. Build and type-check this branch; fix any compiler, JSX or UI issues.
2. Compare `main`/branch with both user-provided archives to prove baseline equivalence or reconcile differences.
3. Expand every major module with comprehensive lesson depth and independently checked examples, then broaden the validated question bank.
4. Only after documented mathematical and editorial review, promote eligible questions to the common Practice and Exam engines with the official item weights.
5. Run targeted navigation, saved-progress, strict-assessment and F-789SGA regression checks.
6. Package an updated source ZIP and update release version after verification. Do not describe this development branch as a completed release.
