# v10.25 Application, Numeric Drills and Canon QA Checklist

## A. Installation and build on a network-connected machine

From the extracted ZIP source directory, run:

```powershell
npm ci
npm run qa:source:v10.25
npm run lint
npm run build
npm run dev
```

Pass requires npm installation, full lint, full build and a running app. **Any failure is a blocker**, and a source-level test pass is not a substitute for this check. Use another terminal for `npm run smoke:browser:v10.23` and `npm run smoke:numeric:browser:v10.25`. If Chrome/Chromium is not on PATH, set `CHROMIUM_PATH`.

## B. Browser workflow (manual; record actual observations)

- [ ] Register or restore a test learner profile without resetting existing progress.
- [ ] Open Calculator Skills; navigate all ten lessons, complete and retry knowledge checks.
- [ ] Open Numeric answer drills and answer one item accurately at its documented tolerance boundary.
- [ ] Confirm correct, incorrect, blank and syntactically invalid entries are shown distinctly.
- [ ] Enter **300 Ω** for the 120/180 Ω parallel-resistor question. Confirm a *possible* series-versus-parallel warning only after submission.
- [ ] Enter **10,000 Hz** for the RC problem (R=1000 Ω, C=0.1 μF). Confirm a *possible* omitted 2π warning.
- [ ] Enter an unrelated wrong answer and confirm **no invented mistake diagnosis** is displayed.
- [ ] Repeat a drill to verify deterministic alternate-variant rotation and that board-assessment scores are unaffected.
- [ ] Near the six-minute deadline, enter a value just before time expires; confirm it is graded.
- [ ] Attempt to edit after the deadline before the next displayed timer update; confirm the late edit is not accepted.
- [ ] Start a strict assessment while a numerical drill is active; confirm the unfinished drill is cancelled without a completed result.
- [ ] During strict assessment, verify tutor, formula aids, calculator lessons, overlays and answer-bearing routes remain locked.
- [ ] Submit/finish a strict assessment and confirm permitted post-answer calculator guidance reappears.
- [ ] Export learner backup, clear a disposable test profile, restore and compare numeric attempts and past exam results.
- [ ] Run keyboard-only and mobile viewport tests. Check labels, focus, announcements and results readability.

## C. Physical Canon F-789SGA checks (cannot be completed by software tests)

- [ ] Confirm the exact model and relevant examination policy/casing requirement; examine the actual device after reset.
- [ ] Execute each applicable Canon method, logging physical keypresses, LCD output, mode, angle units, precision and possible error behavior.
- [ ] Verify its independent mathematical answer and restrictions; do not infer device success from formula fixtures.
- [ ] Record evidence in the existing 28-case device-QA worksheet. An observer entry is **not** formal verification or editorial approval.

## D. Release exit criteria

All source-level QA, full project lint, npm-backed Vite build, interactive browser journeys and applicable device tests must pass before this is considered production certified. If one class cannot be performed, mark it *unverified* rather than *passed*.
