# v10.28 — Installed App, Browser and Canon QA Handoff

## A. Prepare a dependency-ready Windows machine

1. Extract the ZIP. Open PowerShell **inside the application folder**.
2. Check `node --version` (Node 22+ recommended), `npm --version`, and internet/npm registry access.
3. Run `npm ci`. This must exit 0. Do **not** proceed if dependencies were only partially installed.
4. Run `npm run qa:source:v10.28`, `npm run lint`, and `npm run build`. Record exact outputs and exit codes.
5. Run `npm run certify:runtime:v10.28 -- --verify --output=RUNTIME_V10_28_LOCAL.json`. The automated checker starts its own server on a private loopback port, reads an identity/nonce-bearing health response, performs a Chromium click-through smoke, terminates the server, and writes JSON even if it cannot certify. Do not point this test at an unknown server.
6. If Chrome is not on PATH, set `CHROMIUM_PATH` to the exact path of the executable before running the certification script. Example:

```powershell
$env:CHROMIUM_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run certify:runtime:v10.28 -- --verify --output=RUNTIME_V10_28_LOCAL.json
```

## B. Manual application/browser acceptance checks

- Open the app at `http://localhost:3000` with `npm run dev`. Verify sidebar, Mathematics, GEAS, Electronics Engineering, EST, mock practice, progress, Calculator Skills, and Error Log.
- In Calculator Skills, open a lesson, complete its checks, retry them, then open speed drills, numeric-answer drills, and the device-QA worksheet. Confirm accurate score and disclosure labels.
- Start a study mock and verify answer submission, score, and question-level calculator help. Start strict mock and confirm tutor, search, skills guidance and other in-app study aids remain locked until final submission.
- Switch questions and attempts; ensure no earlier calculator shortcut remains open and there is no cross-question answer exposure.
- Export learner backup, simulate an upgrade in a separate test browser profile, restore, and verify history, study-path settings, calculator drills, and QA observations. Keep the user's actual browser storage intact.
- Verify keyboard navigation, responsive layouts, browser console exceptions, offline/reload behavior, and manual page refresh during a timed attempt.
- Confirm board-weight and TOS course-coverage labels remain honest about unmapped/shortage content.

## C. Canon F-789SGA physical testing — separately required

- Confirm exact F-789SGA model/casing and reset/initial settings with current PRC program.
- For each of the 48 QA cases, record hardware model, firmware/edition (if available), date, operator, required mode, actual keystrokes, displayed value, units, rounding and discrepancies.
- Independently check mathematical answers, domain restrictions and the corresponding keyed options.
- Second-person/manual review required before marking a technique device-verified or editorially approved.
- Learner-entered QA observations or exported evidence **must not automatically approve** a technique.

## D. Interpret the result

`overall: automated-runtime-smoke-passed; manual-and-device-review-pending` proves only the automation's installed lint/build, owned server and browser click-through checks completed successfully on that machine. It is not a production-security audit, full question review, classroom acceptance test, PRC endorsement, or physical-device certification.

`overall: not-certified` means at least one automated requirement is missing or failed. Share the JSON report and the full failing terminal output before additional feature development.
