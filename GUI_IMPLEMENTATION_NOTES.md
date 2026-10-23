# Main GUI Refinement — Implementation Notes

This build applies the approved main-GUI refinement plan while deliberately preserving the existing study, mastery, SRS, Pomodoro, Deep Focus, Gemini, and persistence engines.

## Implemented

- App now opens on **Today** instead of a specific Rational Expressions topic.
- Global header simplified to:
  - Search
  - Study Session
  - Tutor
  - Notifications
  - User menu
- Removed decorative fake desktop window controls.
- Removed the duplicate floating chatbot trigger and duplicate Deep Focus banner.
- Added one global **Tutor** launcher for Chat, Voice Tutor, and Voice Commands.
- Added one global **Study Session** launcher for Pomodoro, Focus Mode, and Deep Focus.
- Simplified the sidebar lower section to Tutor, Study Session, and Settings.
- Removed the permanent motivational quote from the sidebar.
- Mathematics sidebar parent highlighting now stays active across all currently implemented Mathematics descendants.
- Rebuilt the **Today** information hierarchy around:
  1. Recommended Next
  2. Daily study metrics
  3. One prioritized study queue
  4. Current subject focus
  5. Collapsible Study Insights
  6. Collapsible study-plan calculation details
- During an active review session, Today prioritizes the active-session workspace instead of showing the full planning dashboard underneath it.
- Added reusable layout components:
  - `PageShell`
  - `PageHeader`
  - `SectionHeader`
- Added consistent page gutters to several first-level screens that previously had no outer padding.
- Restored rendering for the existing `formula-flashcard` screen so that opening it no longer produces a blank main workspace.

## Intentionally not changed in this GUI pass

- Spaced-repetition algorithms
- Mastery calculations
- Daily-target algorithms
- Curriculum taxonomy/content
- Mock-exam scoring/content
- LocalStorage schemas/migrations
- Gemini backend behavior
- Detailed Mathematics topic-shell redesign

## Validation performed

- TypeScript/TSX syntax transpilation check across all `src` files: **PASS**
- Relative-import existence check across all `src` files: **PASS**
- GUI implementation assertions (Today default, launcher consolidation, fake controls removed, Mathematics active-state coverage, Formula Flashcards rendering): **PASS**

A full dependency-based `npm run lint` / `npm run build` could not be completed in this environment because dependency installation from the npm registry timed out. No `node_modules` directory is included in the archive.

## Run locally

```bash
npm install
# configure GEMINI_API_KEY in .env.local if AI functions are needed
npm run dev
```

Then verify the core journeys: Today → Recommended Review, Mathematics navigation, Tutor Chat/Voice, Study Session controls, Review Queue, Practice, Focus Mode, Deep Focus, and mobile sidebar.
