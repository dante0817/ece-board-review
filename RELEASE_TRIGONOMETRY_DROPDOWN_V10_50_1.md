# v10.50.1 — Trigonometry inline subtopic dropdowns

Based on v10.50.0. User-requested UI patch, not new lesson content.

## Changes
- Each subtopic is now an accordion. Click its heading to show or hide its contents. Only one item expands at once.
- Expanded rows display the real `LearnReaderLayout` immediately, including formulas, examples, diagrams, section navigation, bookmarking and reading controls.
- Existing `Learn & track`, `Practice`, `Review` tabs and five manual study checkboxes are moved into the expanded row.
- The detached selected-subtopic panel is removed. A compact topic context strip retains topic-level mastery, representative formula and references.
- Focused reading mode remains available as an optional action. Practice and mistakes still navigate to the existing app workflows.
- Header buttons use `aria-expanded`, `aria-controls` and correctly associated regions. Responsive styles for narrow displays and reduced motion added.
- IDs, question banks, learning content, and persistence schemas are unchanged.

## Validation and limitations
- `npm run validate:trigonometry:v10.50.1` runs the UI contract test followed by the established v10.50 corpus and historical validators.
- Run `npm ci`, `npm run lint`, `npm run build`, `npm run dev` on the target machine.
- Browser integration and full production build have not been verified here because the offline npm cache does not contain `zwitch`. This is not a full UI-runtime certification.
- Mathematical/editorial quality limitations described in the v10.50.0 QA report remain.

## Expected UX
Mathematics → Trigonometry → topic card → click a subtopic header. Its study controls and lesson appear immediately underneath. Click another subtopic to switch; click the same header again to collapse.
