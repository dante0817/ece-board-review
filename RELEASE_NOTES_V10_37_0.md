# BSECE Board Reviewer v10.37.0 — Trigonometry Pilot Learning Release

## Added
- Four original draft lessons mapped to existing, immutable Trigonometry subtopic IDs: Radian Measure, Six Trigonometric Ratios, Unit-Circle Definitions, Pythagorean Trigonometric Identities.
- 32 original pilot multiple-choice practice questions (8 per lesson), connected to the existing Practice Library, including Guided, Independent, and Timed modes.
- Three accessible, responsive, original SVG diagrams for angles/radians, triangle ratios, and unit circle.
- Lesson navigation from Trigonometry topic detail to the existing Learn Reader, and Practice from lesson back into existing Practice Library filtered to the selected subtopic.
- Persistent manual progress via the original `ece_manual_learn_tracking_v1` data store. Self-mastery and quiz history remain separate.

## Data continuity
- All previously stored Algebra keys and Trigonometry broad-topic records are preserved.
- New Trigonometry IDs are accepted by the existing manual tracker; no data migration/reset is required.
- Reader progress capacity raised from 120 to 320 topic records and bytes from 96k to 256k; first-attempt practice capacity from 2,000 to 6,000 records and bytes from 850k to 2.2MB. Existing store schema keys and backups remain unchanged.

## Truthful availability
- Exactly four of the 102 Trigonometry subtopics are mapped to lessons/practice; all remaining entries retain 'not yet linked'.
- Lesson status is `draft`; practice `reviewStatus` is `draft-unverified`, pending expert sign-off. Automated checks validate structural integrity and test mathematical spot checks but do not constitute independent certification.
- Two original broad Trigonometry topics, including Napier's Rules, are retained and not silently converted to completed new lessons.

## Validation
- Run `npm run validate:trigonometry:v10.37`, `npm run validate:trigonometry:v10.36`, `npm run validate:manual-learn:v10.35.1`, `npm run validate:reader:v10.31`, `npm run validate:practice:v10.32`, `npm run scan:imports:v10.23`, `npm run lint`, and `npm run build` after dependency installation.
- Browser UI runtime must be tested on a local development machine if Node dependencies are unavailable in the packaging environment.
