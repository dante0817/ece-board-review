# BSECE Board Reviewer v10.36.0 — Trigonometry GUI Integration

## What changed
- Added Trigonometry as a dedicated Mathematics screen and an indented sidebar shortcut.
- Integrated the 4-group, 14-topic, 102-subtopic interactive curriculum with search, group filters, overview statistics, topic cards, subtopic selection, formula snapshots, and review navigation.
- Integrated into the EXISTING app shell and `TreeMenuHeader`; the Mathematics Trigonometry button now opens the actual Trigonometry screen.
- Preserved the two canonical legacy Trigonometry topics (`top-trig-identities`, `top-spherical-trig`). Each is directly accessible through its existing topic drawer and legacy practice session from the new screen.
- Preserved manual learning storage. Existing broad-topic trackers use the prior chapter ID identity and existing `ManualLearnTracker`. Reading counts, self-mastery and review flags are unchanged.
- Avoided fabricated availability: no dedicated Trigonometry subtopic lesson IDs or independently verified question IDs exist in v10.35.1. Therefore all 102 curriculum entries say 'Not yet linked' rather than masquerading as implemented lessons. Existing broad-topic review remains available separately.
- Preserved all other subjects, their curriculum, the existing quiz engine, and learner storage schemas. No new dependencies.

## What is not included
- Not a 102-lesson content expansion or a trig practice-bank expansion. Existing trig entries are broad tracking/review topics, not newly authored subtopic lessons.
- No migrations, no record deletion, no backup schema changes.

## Verify
Run `npm ci`, `npm run validate:trigonometry:v10.36`, `npm run validate:manual-learn:v10.35.1`, `npm run lint`, `npm run build`, then `npm run dev`.

### Manual smoke test
Open Mathematics → Trigonometry. Check all four groups, search 'phase shift', select 05.3 and use related original topic link; verify the original topic drawer opens. Use 'Existing review' to launch its original practice/review flow. Toggle the original topic's Read 3× and Needs Review, reload, and confirm persistence. Navigate through Algebra to verify no regression. Verify mobile sidebar shortcut and scrolling.
