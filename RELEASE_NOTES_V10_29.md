# BSECE Board Reviewer v10.29.0 — Integrity, Accuracy and Reliability

**Baseline:** Codex-corrected v10.28.0a, not the original v10.28.0 ZIP.

## Scope and implementation

1. **Local-by-default runtime:** `HOST` defaults to `127.0.0.1`; LAN binding requires explicitly setting `HOST=0.0.0.0` or `HOST=::`.
2. **AI HTTP/voice protection:** Cross-origin requests are rejected; loopback requests must use a loopback Host (DNS-rebinding defense). Non-loopback AI clients must supply a configured server-side `BSECE_API_TOKEN` (24+ characters) as a bearer token. HTTP and WebSocket paths have bounded request counts and payload sizes; chat/flashcard fields are limited before model invocation. The app is **not** a publicly hosted authenticated service. With LAN binding, the bundled browser UI cannot supply the token and therefore does not provide remote AI access.
3. **Manual score integrity:** `ReviewModal` begins with blank actual attempted/correct counts, validates integers and the correct<=attempted condition, withholds score-driven recommendations and disables Save until valid values are present. Previously stored records are unchanged.
4. **Cramer's Rule:** Corrects the false inference that all zero determinants guarantee infinitely many solutions. The explanation now requires comparing `rank(A)` and `rank([A|b])` for singular systems; a 3×3 counterexample is included in tests.
5. **Mobile timer:** The floating focus widget defaults to minimized at widths up to 639px, including when a focus session starts, while remaining accessible via its compact button.
6. **Modal keyboard interaction:** A shared hook traps Tab/Shift+Tab, supports Escape and restores focus for Settings and Review dialogs. The dialog layout and existing confirmation behavior are preserved.
7. **Strict-exam interruption policy:** On a real page unload, the active strict practice is abandoned rather than silently resumed, and a one-time notice is shown when returning to mock setup. Session storage contains only an interruption marker, no answers or scores.
8. **Regression coverage:** Introduces `validate:reliability:v10.29` and `qa:source:v10.29`, preserving all 38 source checks from v10.28. The package and lockfile versions are now both `10.29.0`.

## Verification and limitations

- v10.28 source QA: **38/38 passes** on this source, including retained Codex and historical assessment checks.
- New v10.29 targeted source tests: **pass**, including request authorization, rate-limiting logic, answer-input gating, rank explanation and strict interruption instrumentation.
- TypeScript/TSX syntax: **262 files parsed; 0 errors**. Relative imports: **876 resolved; 0 missing**.
- `npm run lint` and `npm run build` could **not** be completed in the current dependency-free environment. There are missing React/Node/Vite packages, not a verified new compile defect. Run clean-installed lint/build/browser/API tests on the Windows machine before promoting this release.
- Existing physical Canon F-789SGA techniques remain preliminary and unapproved, and full mathematical/TOS editorial coverage is not certified.

## Windows acceptance commands

```powershell
npm ci
npm run qa:source:v10.29
npm run lint
npm run build
npm run certify:runtime:v10.28 -- --verify --output=RUNTIME_V10_29_LOCAL.json
node --import tsx scripts/browserQaV1028.mjs
node scripts/apiQaV1028.mjs
npm audit
```

Use the included v10.29 test matrix and browser checklist for manual checks of blank review scores, mobile focus timer, tab/focus restoration, cross-origin AI rejections and strict refresh abandonment. Do **not** call this release production-certified until installed-app tests succeed.

**Configuration compatibility:** Node now reads `.env.local` before `.env`, without overriding already supplied process environment variables, matching the existing Windows setup instructions.

**Packaging:** Historical v10.28 QA records were used as a baseline but are excluded from this distributed source ZIP, because their generated backups and runtime details should not travel with the release. This does not change the Codex fixes in the application code.
