# v10.23 Browser and Canon F-789SGA Verification Checklist

This checklist is **pending execution** by a tester with project npm dependencies, browser and (for device steps) a physical Canon F-789SGA. Mark each result as Passed / Failed / Not tested with evidence. Do not infer completion from the source-code checks.

## A. Environment/build

| Test | Procedure | Expected outcome | Status in packaging environment |
|---|---|---|---|
| Clean dependency install | `npm ci` from source root | Exit 0, dependency graph complete | BLOCKED — registry DNS unavailable |
| TypeScript | `npm run lint` | Exit 0 | NOT VERIFIED (dependencies absent) |
| Production build | `npm run build` | Vite and server bundle succeed | BLOCKED — `vite: not found` |
| Preflight | `npm run preflight:v10.23` | 0 missing packages | FAILED as designed — 11 missing |
| Local HTTP health | Start `npm run dev`, request `/api/health` | `status:ok`, HTTP 200 | NOT VERIFIED |
| Headless browser smoke | `npm run smoke:browser:v10.23` with Chromium installed | React navigation renders | NOT VERIFIED (no running server) |

## B. Browser journeys (manual)

| ID | Steps | Required outcome |
|---|---|---|
| B1 | New learner -> Today -> Mathematics -> Algebra -> mock exam | No crash; navigation works |
| B2 | Calculator Skills -> each of 10 lessons, answer two checks | Results and retry behave correctly; no board mastery inflation |
| B3 | Calculator Skills -> five-minute timed knowledge drill | Wall-clock timeout; incomplete items recorded as unanswered |
| B4 | Calculator Skills -> Real question examples | 10 pilots + 18 family templates accessible, labeled preliminary |
| B5 | Calculator Skills -> Physical-device QA worksheet -> save observation -> export JSON | JSON labeled `observer-supplied-unverified`; no approval or mastery change |
| B6 | Close/reload app and inspect device observations, drills, lesson progress | Records persist without duplication |
| B7 | Settings -> Export learner data -> clear storage -> import backup | Historical scores, skill progress and device observations restored |
| B8 | Start strict timed mock -> attempt to launch header search, tutor, drawer, calculators and QA page | All in-app instructional aids locked; physical permitted calculator not restricted |
| B9 | Submit / time out / exit strict mock | Locked teaching aids reopen only once attempt is ended; past answers unaffected |
| B10 | Open AI Tutor and generate flashcards on calculator topic | Visible warning; no hard-coded Casio key sequence displayed as verified Canon procedure |
| B11 | Revisit old Casio lessons | Compatible warnings shown at relevant points; no automatic Canon rebranding |
| B12 | Check narrow browser/mobile viewport and keyboard-only navigation | Usable lesson tabs, radio groups, export control, and focus order |

## C. Real Canon device test (must be performed by a qualified human)

For **each of the 28 catalog entries**, record actual model/casing, exact manual edition, starting calculator state, angle/number mode, every physical key press, actual LCD result, rounding/unit precision, an independent mathematical check, unexpected errors and test date. For each of the **18 problem-family techniques**, separately check both authored numerical variants; one example alone does not validate all values.

For error cases, test at least one invalid domain, zero denominator or rounding-sensitive value when applicable. Reboot/reset the calculator and confirm the procedure still works. Export the unverified evidence JSON from the worksheet, then have a *different* qualified reviewer inspect the device evidence and independently approve the documented procedure outside the learner app.

A self-reported pass, code test, screen illustration, browser smoke pass or AI response **never** automatically changes a calculator technique to approved.

## D. Release blockers

- An installed-dependency `npm run lint` and `npm run build` must pass for production readiness.
- Real-browser journeys B1–B12 must be exercised, with failures fixed and retested.
- No keyboard procedure can be called *device-verified* without authentic physical Canon testing and independent review.
- Review remaining Casio references as actual content issues rather than replacing the brand name mechanically.
