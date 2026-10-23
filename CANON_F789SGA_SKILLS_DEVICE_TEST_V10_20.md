# Canon F-789SGA Skills Center — Manual and Device Verification Checklist (v10.20)

**Current status: NONE of the new lesson sequences is independently device-tested or editorially approved.** The v10.20 Skills Center teaches mathematical procedures and conceptual function selection, not certified model-specific keystrokes. Prior v10.17/v10.19 shortcut cards are also preliminary.

## Required before marking any procedure as approved

1. Identify the **exact** physical calculator (Canon F-789SGA, casing, firmware/variant if visible), its condition, and the manufacturer manual edition. Record the relevant PRC examination program version. Do not extrapolate approvals from similar model names.
2. Reset/setup the device under permitted examination conditions; document reset effects on mode, memory and angle unit.
3. For each of the 10 lessons, independently cross-check the stated function/mode against the manufacturer's manual, then follow each proposed key sequence on the actual device. Record the complete keys, LCD indicators, expected intermediate/final display, exact rounding, test date, and tester.
4. Test negative inputs, parentheses, denominators, DEG/RAD transitions, large/small exponent display, numerical SOLVE initial guesses, discontinuities (when applicable), and cancellation of an operation.
5. Independently verify mathematics: work each example without the same calculator procedure, confirm units and original-domain restrictions, and verify each distractor and quiz rationale.
6. Mark a guide published only after mathematical check, independent manual check, physical keyboard/LCD test, and editorial approval. Attach evidence IDs, reviewer details, edition, technique version and scope. No self-approval from a generated fixture.
7. Run the complete application build and browser checks (desktop + mobile, keyboard-only navigation, strict-mode lock, local-storage disabled, backup import/export) before production deployment.

## High-priority device scenarios

| Lesson | Physical checks needed |
|---|---|
| Reset, modes, angle units | Clear/reset navigation, DEG/RAD display, sin(30°) = 0.5 |
| Parentheses | Nested division, negative base, order of operations |
| SCI / ENG notation | Prefix and exponent display, scientific ↔ engineering display |
| EQN simultaneous | Two-equation coefficient sequence, signed inputs, display of x/y |
| EQN quadratic | Negative c coefficient, both roots, ability to exit/clear |
| CALC / SOLVE | Numeric substitution, convergence/root behavior and limitations |
| Logarithms / dB | 10^x, log10, parentheses, power ratio |
| Complex / matrices | Rectangular complex, polar angle unit, singular-matrix behavior |
| Numerical calculus | Derivative point and integral bounds, numerical tolerance |
| Answer verification | Substitute into original equation, domain traps, rounding |

## Release classification

Automated checks and correct mathematical examples may be released as **preliminary learning material**. Never describe them as physical-device-tested, regulatory-approved key sequences, or certified board-exam techniques until the above requirements are met.
