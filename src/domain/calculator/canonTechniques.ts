/** Curated F-789SGA pilot techniques. Each is tied to an EXACT question ID, not a topic keyword.
 * Verify keyboard/display against the physical calculator before calling a technique device-tested.
 * No AI-generated or unchecked model-specific keystrokes are allowed in this catalog.
 */
export const CANON_MANUAL_URL = 'https://ij.manual.canon/cal/webmanual/WebPortal/pdf/F-789SGA%20%28EXP%29_EN.pdf';
export const PRC_CALCULATORS_URL = 'https://www.prc.gov.ph/node/6984';
export const CALCULATOR_MODEL = 'Canon F-789SGA' as const;
export type TechniqueStatus = 'manual-documented-not-device-tested';
export interface CalculatorTechnique {
  id:string;
  questionId:string;
  title:string;
  functionName:string;
  manualSection:string;
  /** Steps are displayed in order; model-specific keys are copied from the Canon manual. */
  steps:readonly string[];
  expected:string;
  verify:readonly string[];
  caution:string;
  status:TechniqueStatus;
}
const documented = (data:Omit<CalculatorTechnique,'status'>):CalculatorTechnique => ({...data,status:'manual-documented-not-device-tested'});

export const CANON_PILOT_TECHNIQUES:readonly CalculatorTechnique[] = [
 documented({id:'canon-ap-system-1',questionId:'mock-q-01',title:'Arithmetic progressions: simultaneous EQN',functionName:'EQN — 2 unknowns',manualSection:'Equation Calculations (manual p. 27)',steps:[
  'Convert both series sums before using EQN: 2a₁ + 9d = 31 and 2a₁ + 19d = 61.',
  'Press MODE → 5 (EQN), then choose 1 (2 unknown EQN).',
  'For the first equation enter coefficients 2, 9, 31, confirming each field with =.',
  'For the second enter 2, 19, 61. Read X = a₁ = 2 and Y = d = 3.'
 ],expected:'X = 2; Y = 3',verify:['Compute 5 × (2 × 2 + 9 × 3) = 155.','Compute 10 × (2 × 2 + 19 × 3) = 610.'],caution:'Do not enter 155 or 610 directly as the right-hand constants before simplifying the sums.'}),
 documented({id:'canon-geometric-bounce-2',questionId:'mock-q-02',title:'Geometric rebound: direct COMP check',functionName:'COMP — parenthesized arithmetic',manualSection:'Basic Calculations (manual pp. 13–16)',steps:[
  'Calculate the ratio r = 2 ÷ 3 in COMP mode.',
  'Enter 18 × (1 + (2 ÷ 3)) ÷ (1 − (2 ÷ 3)), retaining both parentheses.',
  'Press = and read 90; the result is in meters.'
 ],expected:'90 meters',verify:['Compute first rebound height 18 × (2/3) = 12.','Sum rebound heights: 12 ÷ (1 − 2/3) = 36.','Total = initial 18 + twice 36 = 90.'],caution:'The ball moves both up and down after each rebound. Omitting the return distance halves the rebound contribution.'}),
 documented({id:'canon-binomial-term-3',questionId:'mock-q-03',title:'Binomial coefficient using nCr',functionName:'Combination nCr',manualSection:'Permutation, Combination and Factorials (manual p. 18)',steps:[
  'Solve the x exponent condition yourself: 18 − 3r = 0, hence r = 6.',
  'In COMP mode calculate 9 nCr 6 using the nCr function described in the manual.',
  'Multiply the resulting 84 by 2³ and (−1)⁶: 84 × 8 × 1.'
 ],expected:'672',verify:['Check 9! ÷ (6! × 3!) = 84.','Check that the x exponent is 18 − 3 × 6 = 0.'],caution:'nCr does not identify which binomial term is constant; you must first derive r = 6.'}),
 documented({id:'canon-log-domain-4',questionId:'mock-q-04',title:'Log equation: quadratic EQN plus domain check',functionName:'EQN — quadratic',manualSection:'Equation Calculations (manual p. 27)',steps:[
  'Combine the logarithms: (x + 3)(x − 1) = 2⁵, giving x² + 2x − 35 = 0.',
  'Press MODE → 5 (EQN). Use ▼ to reach the quadratic menu and choose 4 (Quad EQN).',
  'Enter a = 1, b = 2, c = −35, confirming fields with =.',
  'Read roots 5 and −7, then test both against the original logarithms.'
 ],expected:'Roots 5 and −7; only x = 5 is admissible',verify:['Domain requires x + 3 > 0 AND x − 1 > 0, hence x > 1.','For x = 5, log₂(8) + log₂(4) = 3 + 2 = 5.'],caution:'EQN reports transformed-polynomial roots; −7 is extraneous because original logarithm arguments are negative.'}),

 documented({id:'canon-am-power-16',questionId:'mock-q-16',title:'AM power: one-line COMP substitution',functionName:'COMP — squaring and parentheses',manualSection:'Basic/Scientific Calculations (manual pp. 13–17)',steps:[
  'Recall Pₜ = P꜀ × [1 + m²/2]. Keep modulation index as a decimal, not 80.',
  'In COMP mode, enter 500 × (1 + 0.8² ÷ 2).',
  'Press = and read 660 watts.'
 ],expected:'660 W',verify:['Calculate sideband power separately: 500 × 0.8² ÷ 2 = 160 W.','Add carrier and sideband powers: 500 + 160 = 660 W.'],caution:'0.8 modulation index is dimensionless; entering 80 produces a huge invalid power.'}),
 documented({id:'canon-carson-17',questionId:'mock-q-17',title:'Carson’s rule: grouped bandwidth',functionName:'COMP — grouped arithmetic',manualSection:'Basic Calculations (manual p. 13)',steps:[
  'Express deviation and maximum message frequency in the same unit: 75 kHz and 15 kHz.',
  'In COMP mode enter 2 × (75 + 15). Press =.',
  'Read 180; restore the input unit kHz.'
 ],expected:'180 kHz',verify:['75 + 15 = 90 kHz.','Twice 90 kHz is 180 kHz.'],caution:'Mixing Hz with kHz introduces a factor-of-1000 error; keep unit conversion explicit.'}),
 documented({id:'canon-vswr-18',questionId:'mock-q-18',title:'Standing-wave ratio using reflection coefficient',functionName:'COMP — parenthesized ratios',manualSection:'Basic Calculations (manual p. 13)',steps:[
  'Compute |Γ| = |(150 − 50) ÷ (150 + 50)| = 0.5.',
  'Enter (1 + 0.5) ÷ (1 − 0.5) in COMP mode.',
  'Press = and read 3.0.'
 ],expected:'VSWR = 3',verify:['For real resistive loads, compare max(150/50, 50/150) = 3.','VSWR must always be at least 1.'],caution:'Do not omit the absolute value around Γ or accept VSWR less than 1.'}),
 documented({id:'canon-shannon-20',questionId:'mock-q-20',title:'Shannon capacity: dB conversion and log base',functionName:'COMP — 10^x, log, parentheses',manualSection:'Logarithms and Powers (manual p. 17)',steps:[
  'Convert 30 dB to a LINEAR power ratio using 10^(30 ÷ 10) = 1000.',
  'Evaluate 3000 × log(1 + 1000) ÷ log(2) in COMP mode.',
  'Read approximately 29,902 bits per second (29.9 kbps).'
 ],expected:'About 29,902 bps',verify:['Logarithm change of base: log₂(1001) = log(1001)/log(2) ≈ 9.967.','Capacity = 3000 × 9.967 ≈ 29,902 bps.'],caution:'Never insert a decibel value directly as S/N in Shannon’s logarithm; convert dB to the linear ratio first.'}),
 documented({id:'canon-discriminant-21',questionId:'mock-q-21',title:'Repeated quadratic root: test discriminant',functionName:'COMP — square root',manualSection:'Square and Root Calculations (manual p. 17)',steps:[
  'Set the discriminant equal to zero: (−k)² − 4 × 2 × 18 = 0.',
  'Evaluate √(4 × 2 × 18) in COMP mode.',
  'Read 12 and remember both k = +12 and k = −12.'
 ],expected:'k = ±12',verify:['For either k = 12 or k = −12, k² − 144 = 0.','The quadratic consequently has a repeated real root.'],caution:'The square-root key supplies the principal root only; the equation k² = 144 has two signs.'}),
 documented({id:'canon-jfet-23',questionId:'mock-q-23',title:'Shockley equation: sign-safe substitution',functionName:'COMP — parentheses and square',manualSection:'Basic and Scientific Calculations (manual pp. 13–17)',steps:[
  'Write Iᴅ = Iᴅss [1 − (Vɢs/Vᴘ)]², with voltages entered as signed numbers.',
  'Enter 12 × (1 − ((−1) ÷ (−4)))² in COMP mode.',
  'Press = to read 6.75; the current unit is mA.'
 ],expected:'6.75 mA',verify:['Vɢs/Vᴘ = +0.25.','The squared gate factor is (0.75)² = 0.5625; 12 × 0.5625 = 6.75.'],caution:'Using −1 ÷ 4 instead of (−1) ÷ (−4) reverses the bias ratio and gives a wrong current.'}),
] as const;

const byId = new Map(CANON_PILOT_TECHNIQUES.map(t=>[t.questionId,t]));
export function getCanonTechnique(questionId:string):CalculatorTechnique|null {return byId.get(questionId)??null;}
export function calculatorGuidanceState(questionId:string, isSubmitted:boolean) {
  if (!isSubmitted) return {kind:'locked' as const, technique:null};
  const technique=getCanonTechnique(questionId);
  return technique?{kind:'available' as const,technique}:{kind:'pending' as const,technique:null};
}
