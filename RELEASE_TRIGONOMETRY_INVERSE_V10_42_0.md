# BSECE Board Reviewer v10.42.0 — Inverse Trigonometric Functions

## What changed

- Added six original, **draft** lessons for Topic 07 (inverse sine, cosine, tangent; alternate inverse trig conventions; principal ranges and domains; inverse-function graphs; exact values; and compositions).
- Added 48 original draft multiple-choice practice questions, eight per subtopic. They have unique permanent IDs, explicit keyed answers, and written solution explanations.
- Added a responsive, accessible SVG chart for principal arcsin, arccos and arctan, with endpoints and asymptotes. Diagram is integrated with the existing Learn Reader rather than a new reader.
- Connected lessons and practice to the existing Trigonometry screen, Practice Library, and manual learning tracker. Previous study records are not migrated or overwritten.
- Retained the 102-subtopic curriculum, legacy two Trigonometry topics, 422 Algebra practice items, and earlier 344 Trigonometry practice items.
- Updated package and lockfile to 10.42.0.

## Current coverage

- 49 / 102 authored draft Trigonometry lessons (previously 43 / 102).
- 392 Trigonometry practice questions (previously 344); 814 total Practice Library questions including 422 Algebra.
- Topic 07: 6/6 draft lessons; 48 questions.
- Remaining 53 subtopics are still planned, not authored or verified.

## Mathematical conventions and source guidance

- arcsin output in [−π/2,π/2], arccos in [0,π], arctan in (−π/2,π/2).
- arcsec(x)=arccos(1/x), arccsc(x)=arcsin(1/x) for |x|≥1; arccot(x) uses (0,π). These secondary inverse functions are convention-dependent and this choice is explicitly stated in the lessons.
- Source guidance: Lial, *Trigonometry*, 10th ed. §6.1; Sullivan, *Trigonometry*, 9th ed. §§3.1–3.2; Young, *Trigonometry*, 3rd ed. §6.1; Schaum’s Outline, 4th ed. Ch. 13; Kelley, *The Humongous Book of Trigonometry Problems*, Ch. 9.

## Verified checks / limitations

- Passed Topic 07 and previous Trigonometry validators, Practice Library validators (v10.32 through v10.34), Learn Reader, manual tracking, source-import scan, and content validators.
- Passed targeted TypeScript checks (`tsconfig.practice.v1032.json` and `tsconfig.learn-reader.json`).
- Topic 07 automated validator checks all new ID mappings and answer-ledger consistency, representative inverse trig identities, domains, branch conventions, and saved-progress preservation.
- **Full npm build and live browser tests not verified.** `npm ci --offline` failed because npm package `zwitch` is not cached in this environment. Run `npm ci`, `npm run build`, and `npm run dev` on your local Windows machine.
- **Content remains draft:** automated consistency and sample mathematical tests do not constitute independent editorial verification of every question or worked example.

## Local verification (PowerShell)

```powershell
npm ci
npm run validate:trigonometry:v10.42
npm run validate:practice:v10.34
npm run lint
npm run build
npm run dev
```

Navigate to Mathematics → Trigonometry → 07 Inverse Trigonometric Functions. Existing historical lesson/question IDs remain unchanged.
