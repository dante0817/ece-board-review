# BSECE Reviewer v10.69.0 — F-789SGA-style Calculator Simulator Implementation

## Scope and status

This update adds an independent, **functional scientific-calculator training simulator** to the existing Canon F-789SGA calculator profile and Calculator Skills Center. **It is not an official Canon emulator, not a verified physical-key replica, and not a PRC-certified software calculator.** The existing Mathematics and Differential Equations subject layouts are unchanged.

The source contains the GUI and calculation engine, but the full production bundle and live-browser interaction could **not** be verified in the execution environment because `npm ci` failed before dependencies were installed. Treat this as a development candidate until `npm ci`, `npm run lint`, `npm run build`, and browser verification complete on a normal development machine.

## Implemented

- Global normal-mode header launcher. Accessible from Mathematics, Differential Equations, other ECE subject screens and the Calculator Skills Center.
- Calculator panel with responsive mobile presentation, desktop drag handle, entry, LCD-style display, keypad, DEG/RAD/GRAD selection, operational-mode navigation and error handling.
- Eight selectable operation families: COMP, CPLX, STAT, BASE, EQN, TABLE, MATX, and VCTR.
- COMP: safe expression parser, order of operations, parentheses, implicit multiplication, trig/inverse trig, logarithms, exponents, roots, combinatorics, factorial, percent, PI/e, scientific notation, and Ans/M/A-F variables. Fraction approximation and numeric rounding are approximate, not firmware-exact.
- CPLX: complex arithmetic, sqrt(-1), logarithms, conjugate, modulus and argument.
- EQN: polynomial roots through degree four (including common repeated rational/integer roots) and 2×2 through 4×4 simultaneous linear systems.
- Numerical calculus: centered-difference derivative, adaptive-Simpson integral and Newton root-finding for an input `f(x)`.
- STAT: n, sum, mean, sample/population SD, extrema, and one-variable linear regression when Y is supplied.
- BASE: 32-bit signed BIN/OCT/DEC/HEX conversion.
- MATX: determinant, inverse, and multiplication of matrices up to 4×4.
- VCTR: sum, dot, length, and 2D/3D cross product.
- TABLE: f(x) evaluation on a bounded step range (max 101 rows).
- Settings: angle preference saved under a new versioned key and included in learner backup/restore validation. Other session state is deliberately not written to user storage. Existing study progress is not changed.
- Strict assessment: the global calculator launcher is suppressed by the existing strict header; the panel unmounts, is closed on strict assessment entry, and existing instructional-aid restrictions remain untouched.

## Not implemented / not Canon-verified

- Exact physical keypad and SHIFT/ALPHA mappings, all LCD annunciators, operating menus, physical key timing, all documented error codes, or the 605 advertised functions. Some mapped shortcuts are explicitly *study conveniences*.
- Canon's Gauss–Kronrod numerical integration algorithm; integration here uses adaptive Simpson and therefore may differ in precision or convergence.
- Hardware-verified numeric rounding, native textbook-display fraction layout, 19 native memory registers, full statistics/probability menus, base-mode bitwise operators, and advanced matrix/vector menus.
- Interactive tutorial keystroke playback: the pre-existing Calculator Skills Center remains available with its preliminary device-guidance labeling, and now has an Open Simulator button.
- Persistent exam calculator state, scored assessment use, and physical-device compatibility certification. Strict exams intentionally do not show the simulator.

## Integration points

- `src/components/Header.tsx`: toolbar launcher in the ordinary header; no strict-mode launcher.
- `src/App.tsx`: global `CalculatorProvider` and `CalculatorPanel`, isolated from subject screen and learner records; strict assessment closes the panel.
- `src/components/CalculatorSkillsScreen.tsx`: opens the same simulator.
- `src/components/calculator/`: independent GUI/provider files.
- `src/domain/calculator/simulator/engine.ts`: pure mathematical engine, no JavaScript expression evaluation.
- `src/utils/learnerBackup.ts`: allowlisted calculator angle preference, validated on backup import.
- `scripts/validateF789Simulator.mjs` and package script `validate:calculator:simulator`.

## Run on Windows / local development

From the extracted app root, with compatible Node.js and npm installed:

```powershell
npm ci
npm run validate:calculator:simulator
npm run validate:calculator:v10.26
npm run validate:calculator:v10.27
npm run validate:probability-statistics:v10.69.0
npm run lint
npm run build
npm run dev
```

In the running application, click the **calculator icon in the top toolbar**, or navigate to **Calculator Skills Center → Open F-789SGA-style simulator**. Select COMP or CPLX to use the keypad and expression field; use tabs for other mode families.

## Developer pre-release checks

1. Ensure the toolbar icon is visible in the ordinary header, and hidden in strict assessments; verify the panel cannot reopen during a strict assessment and does not reappear after the attempt.
2. Check calculator close/reopen, mode switching, angle preference persistence, Ctrl/keyboard entry, and responsive layout.
3. Confirm original Algebra, Geometry, DE pilot, P&S and Calculator Skills Center screens remain unchanged.
4. Compare representative outputs with documented examples and, before claiming physical model compatibility, measure results and key sequences on an actual F-789SGA with transparent casing.
5. Run full TypeScript build and browser smoke tests. Do not re-label this development candidate as production-certified without those tests.

## Security, accuracy, and legal notes

The parser does not execute input as JavaScript. Input lengths and calculation ranges are bounded. The UI intentionally differentiates functioning numeric methods from verified Canon firmware behavior. Canon is a trademark of its respective owner; the application is independently developed and is not endorsed by Canon. Exam permission for a physical F-789SGA does not certify this simulator as an exam-room substitute.
