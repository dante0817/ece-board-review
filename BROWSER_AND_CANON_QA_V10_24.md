# v10.24 Browser and Canon F-789SGA manual QA

**This is an execution checklist, not evidence the tests have been performed.** Fill in operator, date, browser build, device revision, actions, actual observations, and any discrepancy for every test.

## Build/runtime prerequisites

- [ ] Run `npm ci` with network access and save the complete log.
- [ ] Run `npm run lint` and `npm run build`. Record exit statuses and errors.
- [ ] Start `npm run dev` and run `npm run smoke:browser:v10.23` in a second terminal.
- [ ] Verify the React app loads in Chrome or Chromium with zero fatal console errors.

## Numeric practice user journey

- [ ] Navigate to **Calculator Skills → Numerical answer drills** and verify six questions from six distinct families.
- [ ] Enter `9e2` for (3.6×10^-3)×(2.5×10^5) and confirm it grades correctly.
- [ ] Enter 1591.55 for the 1000 Ω / 0.1 μF cutoff-frequency question and verify rounding is accepted; test 1591.00 is rejected.
- [ ] Enter a nonnumeric string in a box. Finish and verify it counts as *incorrect*, not that the whole attempt is lost.
- [ ] Leave one input empty, finish, and verify it counts as *unanswered*.
- [ ] Confirm exact original answers, independent verification, and pitfalls appear **after** finish, not before.
- [ ] Confirm the second session rotates to the alternate six question variants and does not reuse a family twice.
- [ ] Background the browser past the six-minute deadline; verify no timer extension, saved timeout, and correct elapsed cap.
- [ ] Reload and verify drill history and best result are preserved. Export/restore and verify the imported results match.
- [ ] Try an archive containing an unknown numeric question ID or duplicated family; verify restore rejects the archive **without modifying current learner data**.
- [ ] Start a strict mock examination and attempt to reach calculator drill content through navigation or a direct route. Confirm all in-app assistance remains locked.
- [ ] Verify these numerical-practice scores do not change subject mastery, strict assessment history, or official-board coverage claims.

## Physical Canon F-789SGA (still outstanding)

- [ ] Inspect model identity, casing, software/printing revision, and reset state. Note the applicable official PRC exam program.
- [ ] Reproduce selected exercises on the physical calculator, logging the full button sequence and LCD results.
- [ ] Test display precision, exponent entry, unit conversions and mode indicators independently of numeric practice answers.
- [ ] Continue the full 28-case device QA review; only external/manual editorial sign-off may change device-verification status.

**No tester, browser/device logs or hardware evidence are included in this source candidate.**
