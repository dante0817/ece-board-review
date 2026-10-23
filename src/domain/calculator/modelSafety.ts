/** Guardrails for generated calculator tips. This is NOT a validator for mathematical accuracy. */
export const CALCULATOR_AI_GUARDRAIL =
  'The selected study calculator is Canon F-789SGA. Give formulas, original-equation checks, units and limitations; do NOT guess keypress sequences, Casio menu numbers, or physical LCD behavior. ' +
  'Device-specific exact keystrokes must come only from the separately reviewed in-app technique library. Canon device instructions are preliminary until physical verification. ' +
  'Do not claim numerical substitution proves a symbolic identity or that SOLVE finds every root. Always check domains, quadrants and physical units.';

/**
 * For short AI or fallback board tips, reject known model-incompatible key sequences.
 * We conservatively replace the entire unsafe tip rather than silently rewriting key steps.
 * Does not certify retained advice; source UI must still identify AI-generated content.
 */
export function normalizeCalculatorBoardTip(value: unknown): string {
 if(typeof value!=='string')return 'Check the original equation, domain restrictions, sign conventions and units.';
 const tip=value.trim().slice(0,1500);
 if(!tip)return 'Check the original equation, domain restrictions, sign conventions and units.';
 const unverifiedKeys = /\b(?:casio|fx[- ]?\d{3}|classwiz|mode\s*\d+(?:\s+\d+)?|shift\s*\d+|shift\s*\[|press\s*\[[^\]]+\]|press\s+shift|guarantee(?:d|s)?\s+(?:correct|an?\s+answer))/i;
 const identityFalseProof = /(?:equal|result|display|output|value).{0,45}(?:zero|\b0\b).{0,65}(?:prove|identical|identity|equivalent)|(?:prove|identity|identical).{0,65}(?:test|substitut|random\s+values)/i;
 if(unverifiedKeys.test(tip)||identityFalseProof.test(tip))
   return 'Specific calculator keystrokes were withheld because this tip has not been validated for Canon F-789SGA. Use the mathematical solution; verify original conditions and consult the in-app preliminary guide and the Canon manual.';
 return tip;
}
