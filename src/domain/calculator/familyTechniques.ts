import type {MockExamQuestion} from '../../types';
import {CANON_MANUAL_URL} from './canonTechniques';

/**
 * Original, independently formulated COMP-mode calculation guides.
 * This catalog does NOT represent device-tested keyboard sequences or PRC validation.
 * The question generator supplies values and family identity; we NEVER parse problem prose.
 */
export interface CalculatorInputBinding {
  schemaVersion: 1;
  familyId: string;
  values: readonly number[];
  unit: string;
}
export interface FamilyTechniqueSpec {
  id:string;
  familyId:string;
  version:1;
  parameterKeys:readonly string[];
  expectedUnit:string;
  calculatorMode:'COMP';
  formula:string;
  shortcut:(p:Readonly<Record<string,number>>)=>string;
  /** Independent arithmetic structure, not a re-use of the question generator's solve callback. */
  evaluate:(p:Readonly<Record<string,number>>)=>number;
  verification:(p:Readonly<Record<string,number>>,answer:number)=>string[];
  caution:string;
  manualReference:string;
  deviceTested:false;
}
const manual='Basic calculation / parentheses / powers (Canon F-789SGA EXP manual; exact keys not device-tested)';
const spec=(familyId:string, keys:string[],unit:string, formula:string,
  shortcut:FamilyTechniqueSpec['shortcut'], evaluate:FamilyTechniqueSpec['evaluate'],
  verification:FamilyTechniqueSpec['verification'],caution:string):FamilyTechniqueSpec=>({
    id:`canon-family-${familyId}`,familyId,version:1,parameterKeys:keys,expectedUnit:unit,
    calculatorMode:'COMP',formula,shortcut,evaluate,verification,caution,
    manualReference:manual,deviceTested:false,
  });
const p=(x:number)=>String(Number(x.toPrecision(8)));
const guides:FamilyTechniqueSpec[]=[
 spec('v1014-geas-newton',['mass','acceleration'],'N','F = ma',
  v=>`${p(v.mass)} × ${p(v.acceleration)}`,v=>v.acceleration*v.mass,
  (v,a)=>[`Check units: kg × m/s² = N.`,`Divide ${p(a)} N by ${p(v.mass)} kg: ${p(a/v.mass)} m/s² must equal the stated acceleration.`],
  'Net force is a vector; use this scalar multiplication only for the stated acceleration direction.'),
 spec('v1014-geas-kinetic-energy',['mass','velocity'],'J','K = mv²/2',
  v=>`${p(v.mass)} × (${p(v.velocity)})² ÷ 2`,v=>v.velocity*v.velocity*(v.mass/2),
  (v,a)=>[`Square the speed first: ${p(v.velocity*v.velocity)} (m/s)².`,`Twice the result divided by mass is ${p(2*a/v.mass)} (m/s)².`],
  'Use speed magnitude and kilograms, not the signed velocity or grams.'),
 spec('v1014-geas-hydrostatic-pressure',['density','depth'],'kPa','p = ρgh / 1000',
  v=>`${p(v.density)} × 9.81 × ${p(v.depth)} ÷ 1000`,v=>v.depth*(v.density*9.81)/1000,
  (v,a)=>[`Reverse-check depth: ${p(a*1000/(v.density*9.81))} m.`,`Pressure is gauge pressure; atmospheric pressure was not included.`],
  'Use g = 9.81 m/s² and convert Pa to kPa; this is not absolute pressure.'),
 spec('v1014-geas-present-value',['future','interest','years'],'PHP','PV = FV/(1+i)^n',
  v=>`${p(v.future)} ÷ (1 + ${p(v.interest)})^${p(v.years)}`,v=>v.future*Math.pow(1+v.interest,-v.years),
  (v,a)=>[`Compound-check: ${p(a)} × (1 + ${p(v.interest)})^${p(v.years)} ≈ ${p(v.future)} PHP.`],
  'Enter annual interest as a decimal, and use compounded rather than simple interest.'),
 spec('v1014-electronics-divider',['vin','top','bottom'],'V','Vout = Vin·Rbottom/(Rtop+Rbottom)',
  v=>`${p(v.vin)} × ${p(v.bottom)} ÷ (${p(v.top)} + ${p(v.bottom)})`,
  v=>(v.bottom/(v.top+v.bottom))*v.vin,
  (v,a)=>[`Reverse-check total current: ${p(v.vin/(v.top+v.bottom))} A.`,`Voltage across bottom: ${p(v.vin/(v.top+v.bottom))} × ${p(v.bottom)} ≈ ${p(a)} V.`],
  'This divider is unloaded; any output load changes the effective bottom resistance.'),
 spec('v1014-electronics-parallel',['r1','r2'],'Ω','Req = R1R2/(R1+R2)',
  v=>`(${p(v.r1)} × ${p(v.r2)}) ÷ (${p(v.r1)} + ${p(v.r2)})`,v=>1/(1/v.r1+1/v.r2),
  (v,a)=>[`Check that ${p(a)} Ω is below ${p(Math.min(v.r1,v.r2))} Ω.`,`Reciprocal check: 1/(${p(a)}) ≈ 1/${p(v.r1)} + 1/${p(v.r2)}.`],
  'Product over sum works directly for exactly two parallel resistors.'),
 spec('v1014-electronics-rc-time',['resistance','capacitanceMicro'],'ms','τ = RC; microfarads→milliseconds',
  v=>`${p(v.resistance)} × ${p(v.capacitanceMicro)} ÷ 1000`,
  v=>(v.resistance/1000)*v.capacitanceMicro,
  (v,a)=>[`In SI units, ${p(v.resistance)} Ω × (${p(v.capacitanceMicro)}×10⁻⁶ F) = ${p(a/1000)} seconds.`],
  'A µF-to-ms conversion needs a factor of 1/1000 when R is in ohms.'),
 spec('v1014-electronics-rc-cutoff',['resistance','capacitanceMicro'],'Hz','fc = 1/(2πRC)',
  v=>`1 ÷ (2 × π × ${p(v.resistance)} × ${p(v.capacitanceMicro)} × 10^(−6))`,
  v=>Math.pow(2*Math.PI*v.resistance*v.capacitanceMicro*1e-6,-1),
  (v,a)=>[`Product check: 2π × R × C × fc ≈ 1 (with C expressed in farads).`],
  'Use the π constant and µF → F conversion; this is a first-order -3 dB cutoff.'),
 spec('v1014-est-nyquist-sampling',['maxFrequency'],'Hz','fs(min) = 2 fmax',
  v=>`2 × ${p(v.maxFrequency)}`,v=>v.maxFrequency+v.maxFrequency,
  (v,a)=>[`Half the sample-rate result (${p(a/2)} Hz) should equal the stated bandwidth limit.`],
  'This is the ideal theoretical bound; actual anti-alias filters require practical margin.'),
 spec('v1014-est-pcm-bitrate',['samplesPerSecond','bitsPerSample'],'kb/s','Rb = fs·bits/1000',
  v=>`${p(v.samplesPerSecond)} × ${p(v.bitsPerSample)} ÷ 1000`,v=>(v.bitsPerSample/1000)*v.samplesPerSecond,
  (v,a)=>[`Check bits/s: ${p(a*1000)}; divide by ${p(v.bitsPerSample)} to recover ${p(v.samplesPerSecond)} samples/s.`],
  'This is raw payload rate for ONE channel; framing and coding overhead are excluded.'),
 spec('v1014-est-wavelength',['frequencyMHz'],'m','λ = 300/f(MHz)',
  v=>`300 ÷ ${p(v.frequencyMHz)}`,v=>3e8/(v.frequencyMHz*1e6),
  (v,a)=>[`Multiply ${p(a)} m × (${p(v.frequencyMHz)} × 10⁶ Hz) ≈ 3×10⁸ m/s.`],
  'Free-space assumption only; guided-wave velocity may be lower.'),
 spec('v1014-est-shannon',['bandwidth','linearSnr'],'kb/s','C = B log₂(1+SNR)/1000',
  v=>`${p(v.bandwidth)} × (log(1 + ${p(v.linearSnr)}) ÷ log(2)) ÷ 1000`,
  v=>v.bandwidth*Math.log(1+v.linearSnr)/(Math.log(2)*1000),
  (v,a)=>[`Reverse-check spectral efficiency: ${p(a*1000/v.bandwidth)} bits/s/Hz.`,`Theoretical SNR limit gives log₂(1+${p(v.linearSnr)}) ≈ ${p(Math.log2(1+v.linearSnr))}.`],
  'The question supplies a LINEAR SNR. Convert dB to a power ratio first if other questions use dB.'),
 spec('v1014-est-carson',['deviation','modulatingFrequency'],'kHz','BW ≈ 2(Δf+fm)',
  v=>`2 × (${p(v.deviation)} + ${p(v.modulatingFrequency)})`,v=>(v.deviation+v.modulatingFrequency)+(v.deviation+v.modulatingFrequency),
  (v,a)=>[`Half the estimated BW (${p(a/2)} kHz) should equal deviation plus modulating frequency.`],
  'Carson’s rule is approximate; do not present its result as an exact occupied spectrum.'),
 spec('v1014-est-power-gain',['ratio'],'dB','GdB = 10 log₁₀(P2/P1)',
  v=>`10 × log(${p(v.ratio)})`,v=>Math.log10(v.ratio)*10,
  (v,a)=>[`Convert back: 10^(${p(a)} ÷ 10) ≈ ${p(v.ratio)} power ratio.`],
  'Use 10 log for POWER ratios, not 20 log (which applies to comparable amplitudes/impedances).'),
 spec('v1016-math-arithmetic-mean',['a','b','c','d'],'units','mean = (a+b+c+d)/4',
  v=>`(${p(v.a)} + ${p(v.b)} + ${p(v.c)} + ${p(v.d)}) ÷ 4`,v=>(v.d+v.c+v.b+v.a)*0.25,
  (v,a)=>[`Multiply the computed mean by four (${p(a*4)}); it must match the sum of all four entries.`],
  'Do not round individual values before averaging.'),
 spec('v1016-math-weighted-mean',['a','weightA','b','weightB'],'units','weighted mean = (a·wa+b·wb)/(wa+wb)',
  v=>`(${p(v.a)} × ${p(v.weightA)} + ${p(v.b)} × ${p(v.weightB)}) ÷ (${p(v.weightA)} + ${p(v.weightB)})`,
  v=>(v.a*v.weightA+v.b*v.weightB)*(1/(v.weightA+v.weightB)),
  (v,a)=>[`Check that ${p(a)} lies between ${p(Math.min(v.a,v.b))} and ${p(Math.max(v.a,v.b))}.`,`Weights sum to ${p(v.weightA+v.weightB)}, not necessarily one.`],
  'Divide by TOTAL weight, not the number of groups.'),
 spec('v1016-electronics-timer-overflow',['bits','clockMHz','prescaler'],'ms','t(ms) = 2^bits·prescaler/(MHz·1000)',
  v=>`2^${p(v.bits)} × ${p(v.prescaler)} ÷ (${p(v.clockMHz)} × 1000)`,
  v=>(v.prescaler/v.clockMHz)*(2**v.bits/1000),
  (v,a)=>[`One tick is ${p(v.prescaler/(v.clockMHz*1e6))} seconds.`,`Multiply by ${p(2**v.bits)} timer counts to verify ${p(a)} ms.`],
  'Assumes an unsigned timer starting at 0, no additional interrupt or timer reload.'),
 spec('v1016-electronics-binary-truth-table',['inputs'],'rows','rows = 2^N',
  v=>`2^${p(v.inputs)}`,v=>Math.pow(2,v.inputs),
  (v,a)=>[`Each additional input doubles rows; ${p(a/2)} rows would represent one fewer input.`],
  'Count independent binary inputs; outputs do not increase truth-table row count.'),

 // v10.26: additional engineering and mathematical COMP guides, authored against
 // structured question parameters. Never claim that arithmetic fixtures test real keys.
 spec('v1016-math-coulomb-force',['chargeA','chargeB','distance'],'N','F = k|q1 q2|/r²',
  v=>`8.99 × 10^9 × (${p(v.chargeA)} × 10^(−6)) × (${p(v.chargeB)} × 10^(−6)) ÷ (${p(v.distance)})²`,
  v=>8.99e-3*Math.abs(v.chargeA*v.chargeB)/(v.distance*v.distance),
  (v,a)=>[`Reverse-check with the inverse-square law: ${p(a)} × (${p(v.distance)})² ≈ ${p(8.99e-3*Math.abs(v.chargeA*v.chargeB))} N·m².`, 'Like-sign charges repel, but the calculator expression returns only force magnitude.'],
  'Convert µC to C for BOTH charges and use squared separation in meters.'),
 spec('v1016-math-discrete-rms',['x1','x2','x3','x4'],'V','RMS = √(Σxᵢ²/4)',
  v=>`√((${p(v.x1)})² + (${p(v.x2)})² + (${p(v.x3)})² + (${p(v.x4)})²) ÷ √4`,
  v=>Math.hypot(v.x1,v.x2,v.x3,v.x4)/2,
  (v,a)=>[`Square the RMS: ${p(a*a)} V². This equals the arithmetic mean of four squared samples.`, 'RMS must be nonnegative even when a sample is negative.'],
  'Square each signed sample BEFORE averaging; the mean of the samples is not their RMS.'),
 spec('v1016-math-percent-overshoot',['peak','steady'],'%','%OS = 100(peak−steady)/steady',
  v=>`100 × (${p(v.peak)} − ${p(v.steady)}) ÷ ${p(v.steady)}`,
  v=>100*(v.peak/v.steady-1),
  (v,a)=>[`The excess is ${p(v.peak-v.steady)} V. Divide it by the STEADY value ${p(v.steady)} V.`, `The percent is ${p(a)}%; it must not be divided by the peak.`],
  'Valid for positive steady-state reference; signed or zero references need another convention.'),
 spec('v1014-geas-mechanical-power',['work','seconds'],'W','P = W/t',
  v=>`${p(v.work)} ÷ ${p(v.seconds)}`,v=>v.work/v.seconds,
  (v,a)=>[`Multiply ${p(a)} W by ${p(v.seconds)} s to recover ${p(v.work)} J of work.`],
  'Average mechanical power here uses work over elapsed time, not electrical apparent power.'),
 spec('v1014-geas-boyle',['initialPressure','initialVolume','finalVolume'],'kPa','P₂ = P₁V₁/V₂',
  v=>`${p(v.initialPressure)} × ${p(v.initialVolume)} ÷ ${p(v.finalVolume)}`,
  v=>v.initialPressure*(v.initialVolume/v.finalVolume),
  (v,a)=>[`Compare P₁V₁=${p(v.initialPressure*v.initialVolume)} and P₂V₂=${p(a*v.finalVolume)} kPa·L.`],
  'Boyle’s law assumes fixed gas mass and constant absolute temperature; volume must be positive.'),
 spec('v1014-geas-sensible-heat',['mass','specificHeat','deltaT'],'kJ','Q = mcΔT/1000',
  v=>`${p(v.mass)} × ${p(v.specificHeat)} × ${p(v.deltaT)} ÷ 1000`,
  v=>v.mass*v.specificHeat*(v.deltaT/1000),
  (v,a)=>[`Reverse-check temperature rise: ${p(a*1000/(v.mass*v.specificHeat))} °C.`, `1 kJ equals 1000 J.`],
  'Assumes constant specific heat and no phase change; convert J to kJ once.'),
 spec('v1014-geas-stress',['force','area'],'MPa','σ = F/(A×10⁶)',
  v=>`${p(v.force)} ÷ (${p(v.area)} × 10^6)`,v=>v.force/(v.area*1e6),
  (v,a)=>[`Recalculate force: ${p(a)} MPa × ${p(v.area)} m² × 10⁶ ≈ ${p(v.force)} N.`],
  'Cross-sectional area is in m², not mm²; this is average normal stress.'),
 spec('v1014-geas-simple-interest',['principal','rate','years'],'PHP','I = Prt',
  v=>`${p(v.principal)} × ${p(v.rate)} × ${p(v.years)}`,
  v=>v.years*(v.principal*v.rate),
  (v,a)=>[`Divide interest ${p(a)} PHP by (${p(v.principal)} × ${p(v.years)}) to recover rate ${p(v.rate)} per year.`],
  'A rate of 0.06 means 6% per year. This is SIMPLE, not compound interest.'),
 spec('v1014-electronics-series',['r1','r2','r3'],'Ω','R = R₁+R₂+R₃',
  v=>`${p(v.r1)} + ${p(v.r2)} + ${p(v.r3)}`,v=>v.r1+v.r2+v.r3,
  (v,a)=>[`Check ${p(a)} Ω exceeds every positive individual resistor.`, 'For a series connection the same current flows through all resistors.'],
  'Use this sum only when the three resistors are connected in series.'),
 spec('v1014-electronics-rl-time',['inductance','resistance'],'ms','τ = 1000L/R',
  v=>`1000 × ${p(v.inductance)} ÷ ${p(v.resistance)}`,
  v=>1000*v.inductance/v.resistance,
  (v,a)=>[`Multiply ${p(a)} ms by ${p(v.resistance)} Ω and divide by 1000 to recover ${p(v.inductance)} H.`],
  'RL time constant is L/R; RC time constant is RC. Do not exchange them.'),
 spec('v1014-electronics-inverting-amp',['inputResistance','feedbackResistance','inputVoltage'],'V','Vout = −(Rf/Rin)Vin',
  v=>`−(${p(v.feedbackResistance)} ÷ ${p(v.inputResistance)}) × ${p(v.inputVoltage)}`,
  v=>-v.inputVoltage*(v.feedbackResistance/v.inputResistance),
  (v,a)=>[`The signed gain is ${p(-v.feedbackResistance/v.inputResistance)}.`, `Check ${p(a)} V ÷ ${p(v.inputVoltage)} V equals the negative feedback-to-input resistance ratio.`],
  'Ideal inverting op-amp: output is negative for positive input and must not saturate at supply rails.'),
 spec('v1014-electronics-noninverting-amp',['groundResistance','feedbackResistance','inputVoltage'],'V','Vout = (1+Rf/Rg)Vin',
  v=>`(1 + ${p(v.feedbackResistance)} ÷ ${p(v.groundResistance)}) × ${p(v.inputVoltage)}`,
  v=>v.inputVoltage*(1+v.feedbackResistance/v.groundResistance),
  (v,a)=>[`Divide the output ${p(a)} V by ${p(v.inputVoltage)} V; the gain should be ${p(1+v.feedbackResistance/v.groundResistance)}.`],
  'The non-inverting gain is 1 + Rf/Rg under ideal, unsaturated negative-feedback operation.'),
 spec('v1014-electronics-led-resistor',['supply','ledDrop','currentMilli'],'Ω','R = 1000(Vs−Vled)/I(mA)',
  v=>`1000 × (${p(v.supply)} − ${p(v.ledDrop)}) ÷ ${p(v.currentMilli)}`,
  v=>1000*(v.supply-v.ledDrop)/v.currentMilli,
  (v,a)=>[`Check current: 1000 × (${p(v.supply)} − ${p(v.ledDrop)}) ÷ ${p(a)} Ω ≈ ${p(v.currentMilli)} mA.`],
  'This simple LED model assumes a constant forward voltage and sufficient supply headroom.'),
 spec('v1014-electronics-adc-step',['reference','bits'],'mV','LSB = 1000Vref/2ᴺ',
  v=>`1000 × ${p(v.reference)} ÷ 2^${p(v.bits)}`,
  v=>1000*v.reference/(2**v.bits),
  (v,a)=>[`Multiply ${p(a)} mV by ${p(2**v.bits)} quantization intervals; the result should be ${p(1000*v.reference)} mV.`],
  'Use 2^N steps under the stated ideal ADC convention; some full-scale/code conventions use 2^N−1.'),
 spec('v1014-est-quarterwave',['frequencyMHz'],'m','L = 75/f(MHz)',
  v=>`75 ÷ ${p(v.frequencyMHz)}`,v=>3e8/(4*v.frequencyMHz*1e6),
  (v,a)=>[`Four times length ${p(4*a)} m equals free-space wavelength at ${p(v.frequencyMHz)} MHz.`],
  'Physical antenna length depends on end effects and velocity factors; free-space idealization only.'),
 spec('v1014-est-qam-bits',['constellationSize'],'bits/symbol','bits per symbol = log₂(M)',
  v=>`log(${p(v.constellationSize)}) ÷ log(2)`,v=>Math.log2(v.constellationSize),
  (v,a)=>[`Check 2^${p(a)} = ${p(v.constellationSize)} constellation states.`],
  'Integer bits per symbol require M to be a power of two; coded spectral efficiency differs.'),
 spec('v1014-est-propagation-delay',['distanceKm','speed'],'ms','t(ms) = 10⁶·distance(km)/v',
  v=>`${p(v.distanceKm)} × 10^6 ÷ ${p(v.speed)}`,v=>1e6*(v.distanceKm/v.speed),
  (v,a)=>[`Back-check distance: ${p(a)} ms × ${p(v.speed)} m/s ÷ 10⁶ ≈ ${p(v.distanceKm)} km.`],
  'One-way signal propagation only. No router, processing, or serialization delays included.'),
 spec('v1014-est-packet-efficiency',['payload','overhead'],'%','η = 100·payload/(payload+overhead)',
  v=>`100 × ${p(v.payload)} ÷ (${p(v.payload)} + ${p(v.overhead)})`,
  v=>100/(1+v.overhead/v.payload),
  (v,a)=>[`Check the complementary overhead percentage: ${p(100-a)}%.`, `Payload + overhead = ${p(v.payload+v.overhead)} bytes.`],
  'Frame efficiency here ignores retransmissions, physical coding, and idle time.'),
 spec('v1014-est-attenuation',['lossPerKm','distanceKm'],'dB','total loss = α·d',
  v=>`${p(v.lossPerKm)} × ${p(v.distanceKm)}`,v=>v.lossPerKm*v.distanceKm,
  (v,a)=>[`Divide ${p(a)} dB by ${p(v.distanceKm)} km to recover ${p(v.lossPerKm)} dB/km.`],
  'Loss in dB adds across segments; connector, splice, and equipment losses are excluded.'),
 spec('v1014-est-baudrate',['bitRate','states'],'baud','symbol rate = Rb/log₂(M)',
  v=>`${p(v.bitRate)} ÷ (log(${p(v.states)}) ÷ log(2))`,v=>v.bitRate/Math.log2(v.states),
  (v,a)=>[`Multiply ${p(a)} baud by ${p(Math.log2(v.states))} bits/symbol to recover ${p(v.bitRate)} bits/s.`],
  'Assumes uncoded fixed-size M-ary symbols and no framing or channel coding overhead.'),

];

export const CANON_FAMILY_TECHNIQUES:readonly FamilyTechniqueSpec[]=Object.freeze(guides);
const byFamily=new Map(guides.map(g=>[g.familyId,g]));
if(byFamily.size!==guides.length)throw new Error('Duplicate calculator family identifier');

export interface BoundFamilyTechnique {
  kind:'family';id:string;version:1;questionId:string;familyId:string;
  title:string;mode:'COMP';manualReference:string;manualUrl:string;
  parameterValues:Readonly<Record<string,number>>;formula:string;shortcut:string;
  expected:number;unit:string;verification:readonly string[];caution:string;
  status:'preliminary-not-device-tested';
}
export type BindResult = {kind:'available';technique:BoundFamilyTechnique}|{kind:'pending';reason:string};
function numericAnswer(text:string,unit:string):number|null {
  const raw=text.trim();
  // Authored numeric answers are exactly "<number> <unit>". Reject ambiguous composite answer strings.
  if(!raw.endsWith(` ${unit}`))return null;
  const n=raw.slice(0,-unit.length-1).trim();
  if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(n))return null;
  const value=Number(n);return Number.isFinite(value)?value:null;
}
/** Formula-specific domain checks, independent from display formatting or keyed options. */
function validExpandedParameters(id:string,v:Readonly<Record<string,number>>):boolean {
 if(id==='v1016-math-discrete-rms')return Object.values(v).every(Number.isFinite);
 const values=Object.values(v);
 if(!values.every(n=>n>0&&Number.isFinite(n)))return false;
 if(id==='v1016-math-percent-overshoot')return v.peak>=v.steady;
 if(id==='v1014-electronics-led-resistor')return v.supply>v.ledDrop;
 if(id==='v1014-est-qam-bits')return Number.isInteger(v.constellationSize)&&v.constellationSize>=2&&Number.isInteger(Math.log2(v.constellationSize));
 if(id==='v1014-est-baudrate')return Number.isInteger(v.states)&&v.states>=2&&Number.isInteger(Math.log2(v.states));
 if(id==='v1014-electronics-adc-step')return Number.isInteger(v.bits)&&v.bits>=1&&v.bits<=24;
 return true;
}
/** Only structured bindings match; never infer values from question wording or topic titles. */
export function resolveFamilyTechnique(question:MockExamQuestion):BindResult {
  const b=question.calculatorInputs;
  if(!b || !question.questionFamilyId || b.familyId!==question.questionFamilyId || b.schemaVersion!==1) return {kind:'pending',reason:'No structured calculator parameters for this question.'};
  const t=byFamily.get(b.familyId);
  if(!t)return {kind:'pending',reason:'No authored Canon technique for this reasoning family.'};
  if(b.unit!==t.expectedUnit || b.values.length!==t.parameterKeys.length || b.values.some(v=>!Number.isFinite(v))) return {kind:'pending',reason:'Parameter shape or units do not match the technique.'};
  const v=Object.fromEntries(t.parameterKeys.map((key,i)=>[key,b.values[i]]));
  // Conservative source-specific guardrails; never show a method with parameters
  // outside the assumptions of its authored circuit/engineering formula.
  if(!validExpandedParameters(t.familyId,v))return {kind:'pending',reason:'Inputs violate the authored method assumptions.'};
  // COMP calculation guard: positive denominator and strictly positive logs.
  if((Object.values(v).some(n=>!Number.isFinite(n))) || (['v1014-est-shannon','v1014-est-power-gain'].includes(t.familyId) && Object.values(v).some(n=>n<=0)))return {kind:'pending',reason:'Invalid numerical domain.'};
  if(['v1014-electronics-divider','v1014-electronics-parallel','v1014-electronics-rc-time','v1014-electronics-rc-cutoff'].includes(t.familyId) && Object.values(v).some(n=>n<=0))return {kind:'pending',reason:'Invalid component parameter.'};
  const result=t.evaluate(v);
  if(!Number.isFinite(result))return {kind:'pending',reason:'Nonfinite calculator result.'};
  const option=question.options.find(o=>o.id===question.correctOptionId);
  if(!option)return {kind:'pending',reason:'Question has no correct keyed choice.'};
  const keyed=numericAnswer(option.text,t.expectedUnit);
  if(keyed===null)return {kind:'pending',reason:'Keyed choice is not a numeric result in expected units.'};
  // Existing generators retain five or six significant digits. A half-last-digit rounding tolerance
  // plus floating-point allowance handles both without admitting a different keyed answer.
  const tol=0.51*Math.pow(10,Math.floor(Math.log10(Math.max(1e-100,Math.abs(result))))-4) + Math.abs(result)*1e-10;
  if(Math.abs(keyed-result)>tol)return {kind:'pending',reason:'Calculated result does not match the keyed answer.'};
  return {kind:'available',technique:{kind:'family',id:t.id,version:1,questionId:question.id,familyId:t.familyId,
    title:question.topicName,mode:t.calculatorMode,manualReference:t.manualReference,manualUrl:CANON_MANUAL_URL,
    parameterValues:v,formula:t.formula,shortcut:t.shortcut(v),expected:result,unit:t.expectedUnit,
    verification:t.verification(v,result),caution:t.caution,status:'preliminary-not-device-tested'}};
}
