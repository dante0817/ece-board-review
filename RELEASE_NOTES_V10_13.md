# BSECE Board Reviewer v10.13.0 — Blueprint-Weight Preview and Honest Coverage

**Release classification:** source release candidate; not production certified and **not** a complete ECE licensure simulation. Based on v10.12.0, without resetting learner records or separating the two learning paths.

## What changed

1. **Official examination-area weights.** `src/domain/exam/boardBlueprint.ts` defines a versioned October 2026 PRC area-weight profile: Mathematics 20%, Electronics Engineering 30%, General Engineering and Applied Sciences (GEAS) 20%, and Electronics Systems and Technologies (EST) 30%. Source: [PRC October 2026 ECE examination program](https://www.prc.gov.ph/sites/default/files/BECE%20exam%20program%20Oct%202026.pdf). These are subject weights, **not** a complete subtopic Table of Specifications.
2. **Coverage-limited board-weight preview.** The Timed Practice screen now provides `ECE Board Weight Preview — Coverage Limited`, alongside existing unweighted mixed and subject-focused practice. The preview allocates exact area quotas using largest remainders; it draws distinct available question prompts for each area only. It does not fill missing GEAS, Electronics, or EST slots with unrelated Mathematics items. Its length is explicitly capped and its shortage displayed **before** starting.
3. **Saved exam-scope evidence.** New attempt records include a blueprint ID, requested/actual/missing question counts, and four per-area results. Automatic records with per-area results are rejected if those counts contradict their answer-level data. Older records remain readable without a migration, and no old score is reinterpreted as an official subject result.
4. **Subject-level reporting.** A result-screen diagnostic and Test History now show correct/total per area, as well as *Not assessed* for areas without questions. Percentages are only computed where an area has actually been tested.
5. **Accurate practice language.** Removed misleading `Board Ready — Passed` and `Board Target Exceeded` labels from timed practice, including strict mode. These are app practice targets only, not PRC licensure-pass predictions or verified mastery.
6. **Wall-clock strict timer.** Background tabs cannot increase the effective permitted duration. Study Mode retains pausing and an in-app reference sheet, while Strict Assessment disables both. Strict remains **self-attested**, not supervised or independently verified.
7. **Documentation and tests.** Added `validate:board:v10.13` and `lint:board` scripts, plus the per-preset area coverage report.

## Current coverage: example 50-question preview

| PRC area | Weight | Requested | Available distinct prompts | Included | Missing |
|---|---:|---:|---:|---:|---:|
| Mathematics | 20% | 10 | 220 | 10 | 0 |
| Electronics Engineering | 30% | 15 | 9 | 9 | 6 |
| GEAS | 20% | 10 | 0 | 0 | 10 |
| EST | 30% | 15 | 10 | 10 | 5 |
| **Total** | **100%** | **50** | **239 across the supported three areas** | **29** | **21** |

The snapshot counts the 37 curated mock questions and 203 Algebra-reference mock questions as a **separate exam pool**; it is not the 260-item teaching/practice bank audited in v10.11. The 240 raw mock-pool entries include one duplicate prompt and are deduplicated to 239 for this preview. This release **does not** claim that the available items are independently validated to an official examination subtopic blueprint.

## Important limitations

- **No GEAS exam-question pool exists** in this baseline. Consequently there is no full four-area simulation in this release, even when the number of requested questions is increased.
- The current Electronics and EST pools are sparse. Official subject proportions do not establish content balance, question quality, exact timing, official calculator eligibility, or supervised testing.
- Raw practice accuracy and area-level percentages must never be shown as an official board pass/fail result. The application continues to distinguish study, manual, legacy, and self-attested strict attempts.
- Mock questions may be familiar from practice; their selection here is **not** independent mastery evidence. The v10.11 reserved independent-family assessment bank remains separate.
- Closing or reloading the page during an attempt loses unsaved in-progress responses. A result is stored only after the learner explicitly clicks **Save Practice Result to Test History**.
- Complete TypeScript project compilation, fresh npm installation, browser interaction tests, and the production bundle remain **unverified** in this environment, where `npm ci --offline` fails on the uncached `zwitch` package.

## Validation

Run on a machine with dependencies installed:

```powershell
npm ci
npm run lint
npm run lint:board
npm run validate:board:v10.13
npm run validate:algebra:v10.8
npm run validate:integrity:v10.9
npm run validate:assessment:v10.10
npm run validate:curriculum:v10.11
npm run validate:learning-paths:v10.12
npm run build
npm run dev
```

Keep the existing v10.12 source archive and learner-data export for rollback. Review the full `VALIDATION_V10_13.txt` for exact results and test limitations.

## Next recommended content work

Before naming a feature *Full ECE Board Simulation*, build and independently review a representative GEAS bank, expand Electronics and EST, map official subtopic specifications, include question-family and difficulty coverage rules, define exam-session timing and subject-specific score requirements, and run browser-based end-to-end checks. The present preview provides an accurate measurement of how far the bank is from that target.
