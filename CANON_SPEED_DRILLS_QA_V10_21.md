# v10.21 Calculator Speed Drills — Manual QA and Device Verification

## Local application/browser acceptance tests

1. Start a five-minute drill. Confirm 10 questions, exactly one from each of the 10 Calculator Skills lessons, and no answers/explanations visible until completion.
2. Answer some items. Switch the browser to a background tab for 15 seconds, return and verify the countdown decreased by elapsed wall-clock time.
3. Let the drill time out. Check that unanswered questions are recorded separately and that hints appear only after completion.
4. Retry the drill: a different check for each lesson should be selected, and prior attempts should remain intact.
5. Check mistake recommendations: they must cite actual missed or skipped items, with separate labels for category-based unresolved error-log suggestions. Resolve or change an error; ensure generic-category suggestions update accordingly.
6. Confirm 24-hour follow-up reminders are based on the last missed lesson and that a subsequent correct drill response clears the reminder.
7. Confirm backup → restore round-trip preserves up to 50 drill results and does not affect mathematical mastery, board scores, or old v10.20 lessons. Invalid backup drill records must be rejected without modifying storage.
8. Start a strict mock assessment and confirm the Calculator Skills Center is locked; in-app Tutor and Voice Tutor controls should remain blocked under the existing shared access policy.
9. Check manual-vs-calculator example calculations and independent verification on a physical F-789SGA once available, including LCD rounding and angle-unit setup.
10. Verify keyboard operation, focus order, accessible radio labels, expiry announcements and mobile layout in the running browser build.

## Limitations

The timed drills evaluate *decision knowledge and comprehension*, not the time taken to operate the physical calculator. Their content is sourced from the existing 20 v10.20 three-option knowledge checks. Repeated correct answers or high speed-drill scores are not independent ECE board mastery evidence. Keystroke-specific tutorials and LCD output require a device test; do not mark them approved based on a mathematical fixture alone.
