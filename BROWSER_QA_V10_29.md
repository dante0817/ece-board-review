# Windows browser / API acceptance checklist for v10.29.0

After `npm ci`, `npm run lint`, and `npm run build` pass, execute the v10.28 certification/browser/API scripts against the v10.29 project. Recheck each scenario below in a **disposable browser profile**, never the user's real learner storage.

1. Local start: with HOST unset, `http://127.0.0.1:3000/api/health` should work. Remote LAN access should not work by default. Confirm runtime certification's isolated HOST still works.
2. Cross-origin AI: browser request bearing an untrusted Origin should receive 403. Same-origin local requests with valid inputs should reach curated fallback or a configured model. Invalid records and oversized requests should produce controlled 400/413 errors; floods produce 429.
3. LAN security (opt-in only): with explicit `HOST=0.0.0.0`, remote HTTP and WebSocket AI access must be denied without the configured bearer token. Check same-origin/authorization on voice upgrades. Do not publicly deploy this app.
4. Review modal: open with no recorded test; attempted and correct must be blank, Save disabled. Enter 10 attempted/7 correct and confirm 70%; reject 11/10, negatives, fractions, and empty counts. Confirm no changes to existing learner progress when cancelled.
5. Keyboard: open/close Settings and review completion with keyboard; Tab and Shift+Tab remain in the active dialog, Escape closes it, original focus returns when possible. Test at least desktop and mobile width.
6. Mobile 320/390px: focus timer starts as compact 48px control and does not cover numerical drill answer entry. Opening/closing the timer remains possible.
7. Strict attempt: start, enter an answer, refresh and accept the browser leave warning. Return to mock setup and confirm interruption notice, no preserved answers, no assessment record and no unauthorized tutor/calculator aids. When declining browser leave warning, exam must continue. Check normal completed exam still records correctly.
8. Re-run all v10.28 dev and production browser/API suites and archive import/export, including malformed and historical backup fixtures.
9. Physical Canon F-789SGA verification remains separate, requiring genuine device observations and editorial approval.
