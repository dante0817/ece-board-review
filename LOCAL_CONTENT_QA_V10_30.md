# BSECE v10.30 Windows Verification Checklist

From the extracted v10.30 project root, on the dependency-ready Windows computer:

```powershell
npm ci
npm run audit:content:v10.30
npm run validate:content:v10.30
npm run qa:source:v10.30
npm run lint
npm run build
npm run certify:runtime:v10.28 -- --verify --output=RUNTIME_V10_30_LOCAL.json
npm run dev
```

With a stable development server, run the existing broad browser journey (`node --import tsx scripts/browserQaV1028.mjs` if the corrected Codex QA harness is available in your extracted baseline) and API journey (`node scripts/apiQaV1028.mjs`, if present). If either script is absent, do not claim it ran; run the existing `npm run smoke:browser:v10.28` instead and list untested manual flows.

Check the TOS Course-Quota Practice setup disclosure: it must show requested/selected/unfilled counts, indicate provisional course assignments, and expand the **Editorial subtopic review flags** control to show five families. Confirm that normal study mocks, strict assessment aid locks, answer histories, learning paths, calculator lessons, and saved/restore user state behave as in v10.29.

Test two nearby items from the same authored numerical family and confirm they are not counted as independent competencies. Confirm that questions with no verified TOS mapping are not silently assigned a course. Keep original historic score backups outside the test browser profile.

Physical Canon F-789SGA key sequences remain explicitly **unverified** until checked against the actual device and reviewed. This test checklist cannot certify the complete question bank or the official PRC subtopic/difficulty distribution.
