import type { MockExamQuestion } from '../types';
import type { TosAreaId } from './officialTos';

/**
 * Original practice-only numerical problems for TOS courses with thin coverage.
 * Two parameter variants in the SAME reasoning family are not independent competencies.
 * Source and grading checks are automated; no PRC approval, proctoring, or expert signoff.
 */
export interface TosExpansionFamilyV1016 {
  id: string;
  area: TosAreaId;
  courseId: string;
  topic: string;
  cases: readonly [readonly number[], readonly number[]];
  ask: (values: readonly number[]) => string;
  solve: (values: readonly number[]) => number;
  formula: string;
  unit: string;
  method: string;
}

export const TOS_EXPANSION_FAMILIES_V1016: readonly TosExpansionFamilyV1016[] = [
  {id:'arithmetic-mean',area:'math',courseId:'math-data-analysis',topic:'Arithmetic mean',cases:[[4,8,12,16],[3,6,9,18]],
    ask:([a,b,c,d])=>`Find the arithmetic mean of the four measurements ${a}, ${b}, ${c}, and ${d}.`,
    solve:v=>v.reduce((s,n)=>s+n,0)/v.length,formula:'mean = Σx/n',unit:'units',method:'Sum the measurements and divide by the count.'},
  {id:'weighted-mean',area:'math',courseId:'math-data-analysis',topic:'Weighted mean',cases:[[70,2,90,3],[60,1,95,3]],
    ask:([a,wa,b,wb])=>`Two laboratory groups recorded scores of ${a} and ${b} with weights ${wa} and ${wb}, respectively. Find the weighted mean.`,
    solve:([a,wa,b,wb])=>(a*wa+b*wb)/(wa+wb),formula:'weighted mean = Σ(wx)/Σw',unit:'units',method:'Weight each score, then divide by total weight.'},
  {id:'coulomb-force',area:'math',courseId:'math-electromagnetics',topic:'Coulomb force',cases:[[2,3,0.3],[4,5,0.5]],
    ask:([q1,q2,r])=>`Two point charges of +${q1} µC and +${q2} µC are ${r} m apart in vacuum. Estimate the repulsive force using k = 8.99×10⁹ N·m²/C².`,
    solve:([a,b,r])=>8.99e9*a*1e-6*b*1e-6/(r*r),formula:'F = k|q₁q₂|/r²',unit:'N',method:'Convert microcoulombs to coulombs and use inverse-square force.'},
  {id:'discrete-rms',area:'math',courseId:'math-signals',topic:'Discrete-time RMS',cases:[[1,1,3,3],[-2,2,-2,2]],
    ask:v=>`For the four equally spaced voltage samples [${v.join(', ')}] V, calculate their RMS voltage.`,
    solve:v=>Math.sqrt(v.reduce((s,n)=>s+n*n,0)/v.length),formula:'RMS = √(Σx²/N)',unit:'V',method:'Average the squared samples and take the square root.'},
  {id:'percent-overshoot',area:'math',courseId:'math-control',topic:'Percent overshoot',cases:[[12,10],[18,12]],
    ask:([peak,steady])=>`A second-order step response peaks at ${peak} V and settles at ${steady} V. Find percent overshoot relative to the steady value.`,
    solve:([peak,steady])=>100*(peak-steady)/steady,formula:'%OS = (peak−steady)/steady ×100',unit:'%',method:'Normalize peak excess by the final value.'},
  {id:'cost-performance-index',area:'geas',courseId:'geas-management',topic:'Project cost performance index',cases:[[900,1000],[1500,1200]],
    ask:([ev,ac])=>`For an engineering project, earned value is ₱${ev} thousand and actual cost is ₱${ac} thousand. Find cost performance index (CPI).`,
    solve:([ev,ac])=>ev/ac,formula:'CPI = EV/AC',unit:'ratio',method:'Divide earned value by actual cost, using matching units.'},
  {id:'startup-breakeven',area:'geas',courseId:'geas-technopreneurship',topic:'Startup break-even analysis',cases:[[12000,120,80],[18000,150,100]],
    ask:([fixed,price,variable])=>`A device startup has fixed costs ₱${fixed}, sells each unit for ₱${price}, and spends ₱${variable} variable cost per unit. Find break-even unit sales (ignore tax).`,
    solve:([fixed,p,v])=>fixed/(p-v),formula:'Q = fixed cost/(price−unit variable cost)',unit:'units',method:'Divide fixed cost by contribution margin per unit.'},
  {id:'nested-loop-count',area:'geas',courseId:'geas-programming',topic:'Nested-loop counting',cases:[[8],[12]],
    ask:([n])=>`A nested loop executes the inner statement i times at each outer iteration i = 1, 2, …, ${n}. How many total executions occur?`,
    solve:([n])=>n*(n+1)/2,formula:'Σi = n(n+1)/2',unit:'executions',method:'Sum the consecutive integers from 1 through n.'},
  {id:'pollutant-removal',area:'geas',courseId:'geas-environment',topic:'Water-treatment removal efficiency',cases:[[200,50],[150,30]],
    ask:([input,output])=>`A water-treatment process lowers pollutant concentration from ${input} mg/L to ${output} mg/L at constant flow. Find the concentration-based removal percentage.`,
    solve:([a,b])=>100*(a-b)/a,formula:'removal = (Cin−Cout)/Cin ×100',unit:'%',method:'Divide removed concentration by influent concentration.'},
  {id:'cad-scale',area:'geas',courseId:'geas-cad',topic:'Engineering drawing scale',cases:[[6,50],[8,100]],
    ask:([metres,scale])=>`A CAD drawing is printed at 1:${scale} scale. How many millimeters long is a line representing ${metres} m in reality?`,
    solve:([metres,scale])=>1000*metres/scale,formula:'drawing length = actual length/scale',unit:'mm',method:'Convert metres to millimetres, then apply the scale denominator.'},
  {id:'faraday-emf',area:'electronics',courseId:'electronics-electromagnetics',topic:'Faraday electromagnetic induction',cases:[[200,0.015,0.5],[100,0.02,0.25]],
    ask:([n,flux,time])=>`A coil with ${n} turns undergoes a uniform total flux change of ${flux} Wb per turn in ${time} seconds. What is the average induced EMF magnitude?`,
    solve:([n,flux,time])=>n*flux/time,formula:'|emf| = N|ΔΦ|/Δt',unit:'V',method:'Apply Faraday’s induction law to flux change per turn.'},
  {id:'binary-truth-table',area:'electronics',courseId:'electronics-logic',topic:'Digital logic truth-table size',cases:[[4],[5]],
    ask:([inputs])=>`A combinational logic function has ${inputs} independent binary inputs. How many possible rows does its complete truth table have?`,
    solve:([inputs])=>2**inputs,formula:'rows = 2ᴺ',unit:'rows',method:'Each independent bit doubles the number of input combinations.'},
  {id:'timer-overflow',area:'electronics',courseId:'electronics-microcontrollers',topic:'Microcontroller timer overflow',cases:[[8,1,64],[8,2,16]],
    ask:([bits,mhz,prescaler])=>`An unsigned ${bits}-bit timer starts at zero and uses a ${mhz} MHz clock with prescaler ${prescaler}. How long until its first wrap, in milliseconds?`,
    solve:([bits,mhz,prescaler])=>2**bits*prescaler/(mhz*1000),formula:'t = 2ᴺ·prescaler/fclock',unit:'ms',method:'Multiply timer counts by divided-clock period.'},
  {id:'type-zero-error',area:'electronics',courseId:'electronics-control',topic:'Unity-feedback steady-state error',cases:[[9],[4]],
    ask:([kp])=>`For a stable unity-negative-feedback type-0 control system with position constant Kp = ${kp}, determine unit-step steady-state error as a percent.`,
    solve:([kp])=>100/(1+kp),formula:'ess = 1/(1+Kp)',unit:'%',method:'Apply the stable type-0 unit-step steady-state error relation.'},
  {id:'dac-code-voltage',area:'est',courseId:'est-systems',topic:'Ideal digital-to-analog converter',cases:[[8,5,128],[10,3.3,256]],
    ask:([bits,vref,code])=>`An ideal ${bits}-bit unipolar DAC has reference ${vref} V and digital code ${code} (unsigned). Using Vout = Vref·code/2ᴺ, find its output.`,
    solve:([bits,vref,code])=>vref*code/(2**bits),formula:'Vout = Vref·code/2ᴺ',unit:'V',method:'Scale the reference by code divided by the number of levels.'},
  {id:'stop-wait-throughput',area:'est',courseId:'est-data',topic:'Stop-and-wait throughput',cases:[[8000,1,20],[12000,2,10]],
    ask:([bits,mbps,rtt])=>`A stop-and-wait data link sends ${bits} payload bits over a ${mbps} Mb/s link and waits ${rtt} ms round-trip before its next frame. Ignoring headers and ACK transmit time, find effective payload throughput in kb/s.`,
    solve:([bits,mbps,rtt])=>bits/(bits/(mbps*1e6)+rtt/1000)/1000,formula:'throughput = payload bits/(transmit time+RTT)',unit:'kb/s',method:'Divide payload bits by its transmit time plus round-trip waiting time.'},
];

const subjects: Record<TosAreaId,readonly [string,string]> = {
  math:['subj-math-algebra','Algebra & Engineering Mathematics'],
  geas:['subj-geas','General Engineering and Applied Sciences'],
  electronics:['subj-electronics','Electronics Engineering'],
  est:['subj-communications','Electronics Systems and Technologies'],
};
const display = (n:number):string => String(Number(n.toPrecision(6)));
function asQuestion(f:TosExpansionFamilyV1016, variant:number):MockExamQuestion {
  const args=f.cases[variant], answer=f.solve(args);
  if(!Number.isFinite(answer) || answer<=0) throw new Error(`Invalid authored numeric answer: ${f.id}`);
  const choices=[answer,answer*1.25,answer*0.75,answer*1.5].map(n=>`${display(n)} ${f.unit}`);
  if(new Set(choices).size!==4) throw new Error(`Ambiguous answer options: ${f.id}`);
  const position=([...f.id].reduce((n,c)=>n+c.charCodeAt(0),variant)+variant*3)%4;
  const [subjectId,subjectName]=subjects[f.area];
  return {
    id:`v1016-${f.area}-${f.id}-${variant+1}`,questionFamilyId:`v1016-${f.area}-${f.id}`,
    calculatorInputs:{schemaVersion:1,familyId:`v1016-${f.area}-${f.id}`,values:[...args],unit:f.unit},

    contentOrigin:'original-v10.16',subjectId,subjectName,
    topicId:`top-v1016-${f.area}-${f.id}`, topicName:`${f.topic} — Numerical Practice`,
    question:f.ask(args),
    options:['A','B','C','D'].map((id,index)=>({id,text:choices[(index-position+4)%4]})),
    correctOptionId:['A','B','C','D'][position],
    keyFormula:f.formula,explanation:`${f.method} ${f.formula}. The result is ${display(answer)} ${f.unit}.`,
    boardTip:'Original, automatically checked practice; parameter variants share one reasoning family and are not PRC-validated examination items.',
    difficulty:'Medium',
  };
}
export const TOS_EXPANSION_QUESTIONS_V1016:readonly MockExamQuestion[] = TOS_EXPANSION_FAMILIES_V1016.flatMap(f=>[asQuestion(f,0),asQuestion(f,1)]);
