# v10.27 Runtime, Browser, and Canon F-789SGA QA Checklist

This checklist separates **automated software verification**, **user-visible browser behavior**, **hardware observations**, and **independent approval**. All four are necessary for a fully verified calculator-learning release.

## A — Prerequisites and full application build

1. Use Node 20+ and an internet-accessible npm registry. Close other software using port 3000.
2. Run `npm ci` from the unpacked source directory. Resolve any install error rather than bypassing required packages.
3. Run `npm run qa:source:v10.27`, `npm run lint`, and `npm run build`; preserve console transcripts and exit codes.
4. Run `npm run certify:runtime:v10.27 -- --verify --output=V10_27_RUNTIME_CERTIFICATION.json`. It refuses to certify on missing dependencies. It checks the health endpoint and actual browser smoke in addition to full lint/build, when available.
5. Capture any failures along with Node/OS version; do not overwrite them with source-test results.

## B — Manual browser integration (still required after automated smoke)

1. Open the app, navigate to Calculator Skills and the four instructional/QA sections. Confirm usable keyboard focus and narrow/mobile layout.
2. In guided practice, open a calculator method; record one disclosure. Navigate to a different problem; confirm that **no previously opened calculator text is shown** until a new explicit tab click.
3. Repeat after changing from the Skills Center to post-answer mock review, starting another test attempt and changing the answer inputs. Previously revealed calculator tabs must reset.
4. Start an active strict mock attempt: verify calculator tips, general tutor and voice tutor, topic search, notifications and all other instructional overlays remain blocked until submission/timeout/exit as intended.
5. Attempt to use browser Back/reload during strict assessment. Treat any unintended assistance exposure as a release-blocking defect. Do not label the app remotely proctored.
6. Verify numerical drills: deadline boundary, correct/incorrect/unanswered statuses, independent checks, mistaken-unit warnings, retained progress, export/import, and cancel on strict-assessment start.
7. Verify backup and restore with v10.26 learner data; verify no score/mastery changes just from calculator technique disclosures.
8. Check console errors and resource requests. Save screenshots of important journeys and the full smoke log.

## C — Actual Canon F-789SGA device qualification

1. Verify the exact device model and documentation edition, transparency requirement and applicable examination-date policy.
2. For each of the **48 preliminary methods**, record the starting setup and calculator mode, every physical key sequence, actual displayed outputs, error conditions and rounding.
3. For each of the **38 parameterized families**, independently check both authored question variants, not just one example.
4. Check numerical precision, units, domains, DEG/RAD mode, negative numbers, and the limitations of SOLVE and numerical calculus functions.
5. Export the unverified device QA handoff from the app. The export is observer-entered evidence, **not approval**.
6. A qualified reviewer must independently examine the original manual, real-device evidence, mathematical fixtures and restrictions before separately approving a particular method. Never promote a method based solely on a user-written "pass".

## D — Release decision

Software readiness requires a successful dependency-backed build, runtime smoke and hands-on browser journeys. Calculator method publication additionally requires per-method device evidence and independent approval. Until both requirements are met, distribute as a **source release candidate** with preliminary calculator procedures only.
