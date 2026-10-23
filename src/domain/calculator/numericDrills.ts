/** v10.24 independent numeric-entry practice. These exercises measure response accuracy,
 * NOT physical Canon keypress speed, official exam mastery, or device verification. */
export const CANON_NUMERIC_DRILLS_KEY='ece_canon_numeric_drills_v1';
export const NUMERIC_DRILL_SECONDS=360;
export const NUMERIC_DRILL_QUESTIONS=6;
const MAX_ATTEMPTS=50;
export interface NumericExercise {
 id:string;familyId:string;lessonId:string;title:string;prompt:string;unit:string;
 expected:number;absoluteTolerance:number;relativeTolerance:number;
 formula:string;independentCheck:string;pitfall:string;
}
// Explicit independent expected values. No number extraction from question text.
// Values approximate the indicated formulas at sufficient precision for displayed tolerances.
export const CANON_NUMERIC_EXERCISES:readonly NumericExercise[] = [
 {id:'num-scientific-a',familyId:'scientific-notation',lessonId:'engineering-notation',title:'Engineering notation',prompt:'Evaluate (3.6 × 10^−3) × (2.5 × 10^5).',unit:'',expected:900,absoluteTolerance:.001,relativeTolerance:0,formula:'Multiply mantissas: 3.6×2.5=9; add exponents: −3+5=2; 9×10²=900.',independentCheck:'900 ÷ (2.5×10⁵) = 0.0036.',pitfall:'Do not add mantissas or forget the negative exponent.'},
 {id:'num-scientific-b',familyId:'scientific-notation',lessonId:'engineering-notation',title:'Engineering notation',prompt:'Evaluate (4.8 × 10^6) ÷ (1.2 × 10^3).',unit:'',expected:4000,absoluteTolerance:.001,relativeTolerance:0,formula:'4.8÷1.2=4; subtract exponents: 6−3=3; 4×10³=4000.',independentCheck:'4000 × (1.2×10³) = 4.8×10⁶.',pitfall:'Exponents subtract for division.'},
 {id:'num-parallel-a',familyId:'parallel-resistance',lessonId:'parentheses',title:'Parallel resistors',prompt:'Find equivalent resistance of 120 Ω and 180 Ω in parallel. Answer in ohms.',unit:'Ω',expected:72,absoluteTolerance:.01,relativeTolerance:0,formula:'Req = (120×180)/(120+180) = 72 Ω.',independentCheck:'1/72 = 1/120 + 1/180.',pitfall:'Put the full denominator in parentheses.'},
 {id:'num-parallel-b',familyId:'parallel-resistance',lessonId:'parentheses',title:'Parallel resistors',prompt:'Find equivalent resistance of 150 Ω and 300 Ω in parallel. Answer in ohms.',unit:'Ω',expected:100,absoluteTolerance:.01,relativeTolerance:0,formula:'Req = (150×300)/(150+300) = 100 Ω.',independentCheck:'1/100 = 1/150 + 1/300.',pitfall:'A two-resistor parallel equivalent must be below the smaller resistor.'},
 {id:'num-cutoff-a',familyId:'rc-cutoff',lessonId:'engineering-notation',title:'RC cutoff frequency',prompt:'For a first-order RC circuit with R=1000 Ω and C=0.1 μF, calculate fc=1/(2πRC) in hertz. Use at least 2 decimals.',unit:'Hz',expected:1591.5494309189535,absoluteTolerance:.02,relativeTolerance:0,formula:'C=0.1×10⁻⁶ F; fc=1/(2π×1000×0.1×10⁻⁶) ≈ 1591.55 Hz.',independentCheck:'2πRCfc ≈ 1 after converting C into farads.',pitfall:'μF must be converted to F and π must not be omitted.'},
 {id:'num-cutoff-b',familyId:'rc-cutoff',lessonId:'engineering-notation',title:'RC cutoff frequency',prompt:'For a first-order RC circuit with R=2000 Ω and C=0.22 μF, calculate fc=1/(2πRC) in hertz. Use at least 2 decimals.',unit:'Hz',expected:361.71577975430756,absoluteTolerance:.02,relativeTolerance:0,formula:'C=0.22×10⁻⁶ F; fc=1/(2π×2000×0.22×10⁻⁶) ≈ 361.72 Hz.',independentCheck:'Calculate RC=0.00044 s; 2π×0.00044×fc ≈ 1.',pitfall:'Using 0.22 F instead of 0.22 μF gives a millionfold error.'},
 {id:'num-decibel-a',familyId:'power-decibels',lessonId:'decibels',title:'Power ratio in decibels',prompt:'Calculate the decibel gain for a linear POWER ratio Pout/Pin=100. Answer in dB.',unit:'dB',expected:20,absoluteTolerance:.01,relativeTolerance:0,formula:'Gain = 10 log₁₀(100) = 20 dB.',independentCheck:'10^(20/10)=100.',pitfall:'The factor is 10 for power ratios, not 20.'},
 {id:'num-decibel-b',familyId:'power-decibels',lessonId:'decibels',title:'Power ratio in decibels',prompt:'Calculate the decibel gain for a linear POWER ratio Pout/Pin=50. Answer in dB, to two decimals.',unit:'dB',expected:16.989700043360187,absoluteTolerance:.015,relativeTolerance:0,formula:'Gain = 10 log₁₀(50) ≈ 16.99 dB.',independentCheck:'10^(16.9897/10) ≈ 50.',pitfall:'The 50 supplied is a linear ratio, not a dB value.'},
 {id:'num-sampling-a',familyId:'nyquist',lessonId:'engineering-notation',title:'Ideal Nyquist sampling',prompt:'An ideal band-limited signal has highest frequency 7.5 kHz. Find the theoretical minimum sample rate in kHz.',unit:'kHz',expected:15,absoluteTolerance:.01,relativeTolerance:0,formula:'fs = 2 fmax = 2×7.5 = 15 kHz.',independentCheck:'Half the sample rate is 7.5 kHz.',pitfall:'Actual system design often needs margin above this theoretical limit.'},
 {id:'num-sampling-b',familyId:'nyquist',lessonId:'engineering-notation',title:'Ideal Nyquist sampling',prompt:'An ideal band-limited signal has highest frequency 18 kHz. Find the theoretical minimum sample rate in kHz.',unit:'kHz',expected:36,absoluteTolerance:.01,relativeTolerance:0,formula:'fs = 2 fmax = 2×18 = 36 kHz.',independentCheck:'36/2=18 kHz.',pitfall:'Do not convert kHz into Hz without also converting the answer unit.'},
 {id:'num-power-a',familyId:'dc-power',lessonId:'parentheses',title:'DC electric power',prompt:'Calculate P=VI for V=12 V and I=0.35 A. Answer in watts.',unit:'W',expected:4.2,absoluteTolerance:.005,relativeTolerance:0,formula:'P = 12×0.35 = 4.2 W.',independentCheck:'4.2 W / 12 V = 0.35 A.',pitfall:'Do not read 0.35 A as 35 A.'},
 {id:'num-power-b',familyId:'dc-power',lessonId:'parentheses',title:'DC electric power',prompt:'Calculate P=VI for V=24 V and I=0.125 A. Answer in watts.',unit:'W',expected:3,absoluteTolerance:.005,relativeTolerance:0,formula:'P = 24×0.125 = 3 W.',independentCheck:'3 W / 0.125 A = 24 V.',pitfall:'Power P=VI assumes the stated voltage is across the current-carrying element.'},
] as const;
export const NUMERIC_BY_ID=new Map(CANON_NUMERIC_EXERCISES.map(item=>[item.id,item]));
const FAMILIES=[...new Set(CANON_NUMERIC_EXERCISES.map(item=>item.familyId))];
export function buildNumericDrill(attemptNumber:number):NumericExercise[]{
 const cycle=Number.isInteger(attemptNumber)&&attemptNumber>=0?attemptNumber:0;
 const families=FAMILIES.slice(cycle%FAMILIES.length).concat(FAMILIES.slice(0,cycle%FAMILIES.length));
 return families.map(family=>CANON_NUMERIC_EXERCISES.filter(q=>q.familyId===family)[cycle%2]);
}
const numericPattern=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
export function parseNumericEntry(input:string):number|null{
 if(typeof input!=='string'||input.length>48||!numericPattern.test(input.trim()))return null;
 const value=Number(input.trim());return Number.isFinite(value)?value:null;
}
export function checkNumericAnswer(item:NumericExercise,input:string|null):'correct'|'incorrect'|'unanswered'{
 if(input===null||input.trim()==='')return 'unanswered';
 const value=parseNumericEntry(input);
 if(value===null)return 'incorrect';
 return Math.abs(value-item.expected)<=Math.max(item.absoluteTolerance,Math.abs(item.expected)*item.relativeTolerance)?'correct':'incorrect';
}
/** A candidate error pattern is shown only when the learner's actual number matches
 * a separately calculated wrong result. It is a possible cause, not a diagnosis.
 * No prompt-text parsing or model-specific keystrokes are involved. */
export interface NumericMistakeHint {code:string;message:string;check:string}
const WRONG_RESULTS:Readonly<Record<string,readonly {code:string;value:number;message:string;check:string}[]>>={
 'num-scientific-a':[{code:'exponent-shift',value:90,message:'A power-of-ten shift may have occurred.',check:'Multiply 3.6 by 2.5, then add the exponents −3 and 5.'}],
 'num-scientific-b':[{code:'exponent-shift',value:400,message:'A power-of-ten shift may have occurred.',check:'Divide the mantissas, then subtract exponent 3 from exponent 6.'}],
 'num-parallel-a':[{code:'series-vs-parallel',value:300,message:'The resistances may have been added as a series connection.',check:'For parallel resistors, verify 1/Req = 1/120 + 1/180.'}],
 'num-parallel-b':[{code:'series-vs-parallel',value:450,message:'The resistances may have been added as a series connection.',check:'For parallel resistors, verify 1/Req = 1/150 + 1/300.'}],
 'num-cutoff-a':[
  {code:'missing-2pi',value:10000,message:'The factor 2π may have been omitted.',check:'Recalculate the denominator as 2πRC.'},
  {code:'microfarads',value:1591.5494309189535e-6,message:'The capacitor may have been treated as farads rather than microfarads.',check:'Convert 0.1 μF to 0.1×10⁻⁶ F.'}],
 'num-cutoff-b':[
  {code:'missing-2pi',value:1/(2000*0.22e-6),message:'The factor 2π may have been omitted.',check:'Recalculate the denominator as 2πRC.'},
  {code:'microfarads',value:361.71577975430756e-6,message:'The capacitor may have been treated as farads rather than microfarads.',check:'Convert 0.22 μF to 0.22×10⁻⁶ F.'}],
 'num-decibel-a':[{code:'power-vs-amplitude',value:40,message:'The amplitude-ratio multiplier 20 may have been used for a power ratio.',check:'For power ratios, calculate 10 log₁₀(Pout/Pin).'}],
 'num-decibel-b':[{code:'power-vs-amplitude',value:20*Math.log10(50),message:'The amplitude-ratio multiplier 20 may have been used for a power ratio.',check:'For power ratios, calculate 10 log₁₀(Pout/Pin).'}],
 'num-sampling-a':[{code:'nyquist-factor',value:7.5,message:'The signal bandwidth may have been copied without the factor of two.',check:'For ideal Nyquist sampling, fs = 2 fmax.'}],
 'num-sampling-b':[{code:'nyquist-factor',value:18,message:'The signal bandwidth may have been copied without the factor of two.',check:'For ideal Nyquist sampling, fs = 2 fmax.'}],
 'num-power-a':[{code:'current-decimal',value:420,message:'The decimal in the current may have been misplaced.',check:'Use I = 0.35 A, not 35 A.'}],
 'num-power-b':[{code:'current-decimal',value:300,message:'The decimal in the current may have been misplaced.',check:'Use I = 0.125 A, not 12.5 A.'}],
};
export function diagnoseNumericMistake(item:NumericExercise,input:string|null):NumericMistakeHint|null{
 if(checkNumericAnswer(item,input)!=='incorrect'||input===null)return null;
 const value=parseNumericEntry(input);if(value===null)return null;
 const candidates=WRONG_RESULTS[item.id]??[];
 const match=candidates.find(candidate=>
  Math.abs(value-candidate.value)<=Math.min(item.absoluteTolerance,Math.max(1e-8,Math.abs(candidate.value)*0.02))
  && Math.abs(candidate.value-item.expected)>Math.max(item.absoluteTolerance,Math.abs(item.expected)*item.relativeTolerance));
 return match?{code:match.code,message:match.message,check:match.check}:null;
}
/** Fail-closed deadline check used by both input capture and the countdown.
 * Browser date/time remains self-attested; this is not an anti-cheat clock. */
export function numericDrillDeadlineReached(startMs:number,nowMs:number):boolean{
 return !Number.isFinite(startMs)||!Number.isFinite(nowMs)||nowMs>=startMs+NUMERIC_DRILL_SECONDS*1000;
}
export interface NumericDrillAnswer {questionId:string;entry:string|null}
export interface NumericDrillAttempt {id:string;startedAt:string;completedAt:string;durationSeconds:number;elapsedSeconds:number;timedOut:boolean;answers:NumericDrillAnswer[]}
export interface NumericDrillHistory {version:1;attempts:NumericDrillAttempt[]}
export const EMPTY_NUMERIC_DRILLS:NumericDrillHistory={version:1,attempts:[]};
const record=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const iso=(s:unknown):s is string=>typeof s==='string'&&Number.isFinite(Date.parse(s))&&s.length<=40;
export function validateNumericDrillHistory(v:unknown):v is NumericDrillHistory{
 if(!record(v)||v.version!==1||!Array.isArray(v.attempts)||v.attempts.length>MAX_ATTEMPTS)return false;
 const ids=new Set<string>();
 return v.attempts.every((attempt:unknown)=>{
  if(!record(attempt)||typeof attempt.id!=='string'||!/^numeric-[a-z0-9-]{1,65}$/.test(attempt.id)||ids.has(attempt.id)
   ||!iso(attempt.startedAt)||!iso(attempt.completedAt)||Date.parse(attempt.completedAt)<Date.parse(attempt.startedAt)
   ||attempt.durationSeconds!==NUMERIC_DRILL_SECONDS||!Number.isInteger(attempt.elapsedSeconds)||Number(attempt.elapsedSeconds)<0||Number(attempt.elapsedSeconds)>NUMERIC_DRILL_SECONDS
   ||typeof attempt.timedOut!=='boolean'||attempt.timedOut!==(Date.parse(attempt.completedAt)-Date.parse(attempt.startedAt)>=NUMERIC_DRILL_SECONDS*1000)
   ||attempt.elapsedSeconds!==Math.min(NUMERIC_DRILL_SECONDS,Math.floor((Date.parse(attempt.completedAt)-Date.parse(attempt.startedAt))/1000))
   ||!Array.isArray(attempt.answers)||attempt.answers.length!==NUMERIC_DRILL_QUESTIONS)return false;
  ids.add(attempt.id);
  const seenQ=new Set<string>(),seenF=new Set<string>();
  return attempt.answers.every((answer:unknown)=>{
   if(!record(answer)||typeof answer.questionId!=='string'||seenQ.has(answer.questionId))return false;
   const exercise=NUMERIC_BY_ID.get(answer.questionId);
   if(!exercise||seenF.has(exercise.familyId)|| !(answer.entry===null||(typeof answer.entry==='string'&&answer.entry.length<=48&&!/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(answer.entry))))return false;
   seenQ.add(answer.questionId);seenF.add(exercise.familyId);return true;
  });
 });
}
export function createNumericDrillAttempt(params:{id:string;startedAt:string;completedAt:string;questionIds:readonly string[];entries:Readonly<Record<string,string>>}):NumericDrillAttempt|null{
 const {id,startedAt,completedAt,questionIds,entries}=params;
 if(!iso(startedAt)||!iso(completedAt)||questionIds.length!==NUMERIC_DRILL_QUESTIONS
  ||Object.keys(entries).some(k=>!questionIds.includes(k)))return null;
 const elapsed=Date.parse(completedAt)-Date.parse(startedAt);
 if(elapsed<0)return null;
 const attempt:NumericDrillAttempt={id,startedAt,completedAt,durationSeconds:NUMERIC_DRILL_SECONDS,
  elapsedSeconds:Math.min(NUMERIC_DRILL_SECONDS,Math.floor(elapsed/1000)),timedOut:elapsed>=NUMERIC_DRILL_SECONDS*1000,
  answers:questionIds.map(questionId=>({questionId,entry:entries[questionId]?.trim()||null}))};
 return validateNumericDrillHistory({version:1,attempts:[attempt]})?attempt:null;
}
export function gradeNumericDrill(attempt:NumericDrillAttempt){
 if(!validateNumericDrillHistory({version:1,attempts:[attempt]}))return null;
 const details=attempt.answers.map(answer=>({exercise:NUMERIC_BY_ID.get(answer.questionId)!,entry:answer.entry,
  status:checkNumericAnswer(NUMERIC_BY_ID.get(answer.questionId)!,answer.entry)}));
 return {total:details.length,correct:details.filter(x=>x.status==='correct').length,
  incorrect:details.filter(x=>x.status==='incorrect').length,unanswered:details.filter(x=>x.status==='unanswered').length,details};
}
export function appendNumericDrill(history:NumericDrillHistory,attempt:NumericDrillAttempt):NumericDrillHistory|null{
 if(!validateNumericDrillHistory(history)||!validateNumericDrillHistory({version:1,attempts:[attempt]})||history.attempts.some(a=>a.id===attempt.id))return null;
 return {version:1,attempts:[...history.attempts,attempt].slice(-MAX_ATTEMPTS)};
}
export function readNumericDrills(store:Pick<Storage,'getItem'>):NumericDrillHistory{
 try{const text=store.getItem(CANON_NUMERIC_DRILLS_KEY);if(!text)return EMPTY_NUMERIC_DRILLS;
  const parsed:unknown=JSON.parse(text);return validateNumericDrillHistory(parsed)?parsed:EMPTY_NUMERIC_DRILLS;
 }catch{return EMPTY_NUMERIC_DRILLS;}
}
