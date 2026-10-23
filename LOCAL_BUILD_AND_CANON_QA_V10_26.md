# v10.26 — Local installed-dependency, browser, and Canon device verification checklist

## 1. Installed-dependency verification (Windows PowerShell)

Extract source to a fresh folder and run:

```powershell
node --version
npm ci
npm run preflight:v10.23
npm run qa:source:v10.26
npm run lint
npm run build
npm run dev
```

From another terminal run `npm run smoke:browser:v10.23` with Chrome/Chromium installed. Retain complete console outputs, screen captures and any failing file/line references. Do not mark full-build or browser tests passed if dependency installation failed.

## 2. Browser checks

- Start the application, open Calculator Skills, confirm six subject cards reconcile with the displayed 86 / 165 coverage snapshot, and open the real-question examples.
- Verify a newly supported family in each area: Coulomb force; Boyle's law; inverting amplifier; QAM bits per symbol. After viewing a submitted question, compare parameters, units, worked expression, keyed answer and independent verification.
- Review a question without a matching guide: the interface must say pending rather than inventing a generic key sequence.
- On a strictly timed mock, confirm shortcuts, tutor, voice tutor, search and study overlays remain locked until submission, expiry or finalization. Try direct navigation and keyboard activation.
- Verify historical learner data and old Canon device observations after backup/restore. New observations must remain self-reported and **must not alter approval statuses**.
- Check phone-size responsive layout, keyboard tab order, accessible labels and low-contrast states.

## 3. Physical device verification (PENDING)

Use a real **Canon F-789SGA**. Confirm exact model and transparent casing, battery/power, firmware/manual edition, reset/default mode and display settings. For each of 48 cases:

1. Independently verify the mathematical problem and its keyed result.
2. Follow the model-specific manual, record each real keystroke and the actual LCD screens.
3. Compare answers and rounding against the authored parameters and independent check.
4. Test an additional parameter variant and applicable edge cases; note calculator errors, unexpected domain results or settings-dependent displays.
5. Store evidence in the application QA worksheet. Obtain separate qualified review and editorial approval; an observation alone cannot publish a technique.

Do not claim that exact keys or physical display outcomes were tested in this delivery. All 48 cases remain preliminary until an actual reviewer verifies them.
