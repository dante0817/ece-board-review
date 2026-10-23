# Canon F-789SGA device QA — v10.22.0

## Purpose and limitations

The app now contains an observational worksheet for the 10 exact-question Canon pilot guides and 18 parameter-bound family methods. **No physical F-789SGA was available to the development environment. No method was tested on a device, independently manual-reviewed, or editorially approved as part of this release.** Recording an observation in the worksheet does not alter a method's preliminary status.

## Where to find the worksheet

Open **Calculator Skills → Physical-device QA worksheet**. The screen is unavailable while a strict assessment is active. Each entry displays the required mode, expected result or formula, cautions, and either exact-question preliminary steps or a worked bound example for a family method.

## Manual verification procedure

1. Use an actual **Canon F-789SGA**, photograph or record its exact model marking and casing, and note the manual edition being followed. Confirm current PRC rules separately.
2. Start with the documented initial settings, angle unit, and calculation mode. Record whether memory or calculation history was cleared. Do not assume earlier variable values persist.
3. For a pilot method, follow the listed steps on the original question. For a family method, use the supplied numerical question and bound parameters. Check any displayed intermediate values and the result.
4. Compare the actual display against the mathematical answer, including signs, units, decimal places, rounding, root multiplicity and domain restrictions. A numerical check is not a proof of a symbolic identity.
5. Record the actual display, setup, initials and any deviations as **observed pass** or **issue/unconfirmed**. Supply an evidence reference (such as an internal photograph or test log identifier). Do not record a pass if the mode, keystrokes, or rounding behavior differ from the guide without explanation.
6. Independently review the mathematical calculation and manufacturer-manual mode/menu steps, then request separate editorial approval. Observations inside the app are **not certification**; verified publication requires the separate review evidence tracked by `techniqueLibrary.ts` and the existing review process.

## Quality gates

- Verify all 28 catalog cases individually, including at least two numerical variants for each of the 18 family methods before expanding their applicability.
- Check edge cases: invalid domains, sign errors, negative roots, parentheses, scientific notation, DEG/RAD setting, tolerance and units.
- Reject any procedure that relies on a different Casio model, unpublished calculator menus, or AI-guessed key sequences.
- Recheck strict exam disclosure, backup/restore, accessibility and mobile layouts on the installed application.
- Do not label the entire BSECE app production-tested until `npm ci`, `npm run lint`, `npm run build`, and browser tests pass in a dependency-complete environment.

## Local evidence and backup

Worksheet entries are kept under `ece_canon_device_observations_v1` with strictly validated fields and bounded length. The learner backup exporter includes this key; the backup validator rejects unrecognized technique IDs, duplicate records, invalid model IDs and malformed content. The data contains user-entered observations, **not independent certification evidence**. Storage may be cleared by the browser; use the application's learner backup option.

## Remaining Casio audit

`CALCULATOR_CASIO_AUDIT_V10_19.csv` is regenerated against the v10.22 source. It flags 189 references across 54 files. Fifteen explicit `CalculatorCompatibilityNotice` placements are present, including nine new lesson/practice views in v10.22. The remaining text is not blindly converted; model-specific instructions require actual Canon equivalents verified against the manual and device before substitution.
