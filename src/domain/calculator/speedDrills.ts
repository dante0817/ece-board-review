/** v10.21 timed *decision* drills. They test knowledge of calculator use,
 * NOT measured physical F-789SGA keystroke speed, mastery or proctored exams. */
import {CANON_SKILLS_CURRICULUM,CANON_SKILL_BY_ID,type SkillCheck} from './skillsCurriculum';
import type {ReviewError,ErrorCategory} from '../../types';

export const CANON_SPEED_DRILL_KEY='ece_canon_speed_drills_v1';
export const SPEED_DRILL_SECONDS=300;
export const SPEED_DRILL_QUESTIONS=10;
const MAX_ATTEMPTS=50;
const iso=(s:string)=>typeof s==='string'&&Number.isFinite(Date.parse(s));
const plain=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export interface SpeedDrillQuestion {id:string;lessonId:string;lessonTitle:string;check:SkillCheck}
export interface SpeedDrillAnswer {checkId:string;selectedIndex:number|null}
export interface SpeedDrillAttempt {
 id:string;startedAt:string;completedAt:string;durationSeconds:number;elapsedSeconds:number;
 timedOut:boolean;answers:SpeedDrillAnswer[];
}
export interface SpeedDrillHistory {version:1;attempts:SpeedDrillAttempt[]}
export const EMPTY_SPEED_DRILLS:SpeedDrillHistory={version:1,attempts:[]};
const CHECKS=CANON_SKILLS_CURRICULUM.flatMap(lesson=>lesson.checks.map(check=>({id:check.id,lessonId:lesson.id,lessonTitle:lesson.title,check})));
export const CHECK_BY_ID=new Map(CHECKS.map(check=>[check.id,check]));
/** Rotate variants and order without random selection or repeated concepts in one set. */
export function buildSpeedDrill(attemptNumber:number):SpeedDrillQuestion[]{
 const cycle=Math.max(0,Math.floor(attemptNumber));
 const lessons=[...CANON_SKILLS_CURRICULUM];
 const rotated=lessons.slice(cycle%lessons.length).concat(lessons.slice(0,cycle%lessons.length));
 return rotated.slice(0,SPEED_DRILL_QUESTIONS).map((lesson,i)=>{
  const check=lesson.checks[cycle%lesson.checks.length];
  return {id:check.id,lessonId:lesson.id,lessonTitle:lesson.title,check};
 });
}
export function validateSpeedDrillHistory(v:unknown):v is SpeedDrillHistory{
 if(!plain(v)||v.version!==1||!Array.isArray(v.attempts)||v.attempts.length>MAX_ATTEMPTS)return false;
 const seen=new Set<string>();
 return v.attempts.every((a:unknown)=>{
  if(!plain(a)||typeof a.id!=='string'||!/^drill-[a-z0-9-]{1,60}$/.test(a.id)||seen.has(a.id)||
     !iso(a.startedAt as string)||!iso(a.completedAt as string)||Date.parse(a.completedAt as string)<Date.parse(a.startedAt as string)||
     a.durationSeconds!==SPEED_DRILL_SECONDS||!Number.isInteger(a.elapsedSeconds)||Number(a.elapsedSeconds)<0||Number(a.elapsedSeconds)>SPEED_DRILL_SECONDS||
     typeof a.timedOut!=='boolean'||!Array.isArray(a.answers)||a.answers.length!==SPEED_DRILL_QUESTIONS)return false;
  seen.add(a.id);
  const seenChecks=new Set<string>(),seenLessons=new Set<string>();
  return a.answers.every((answer:unknown)=>{
   if(!plain(answer)||typeof answer.checkId!=='string'||!CHECK_BY_ID.has(answer.checkId)||seenChecks.has(answer.checkId))return false;
   const check=CHECK_BY_ID.get(answer.checkId)!;
   if(seenLessons.has(check.lessonId))return false;
   if(answer.selectedIndex!==null&&(!Number.isInteger(answer.selectedIndex)||Number(answer.selectedIndex)<0||Number(answer.selectedIndex)>=check.check.options.length))return false;
   seenChecks.add(answer.checkId);seenLessons.add(check.lessonId);return true;
  });
 });
}
export function readSpeedDrillHistory(store:Pick<Storage,'getItem'>):SpeedDrillHistory{
 try{const raw=store.getItem(CANON_SPEED_DRILL_KEY);if(!raw)return EMPTY_SPEED_DRILLS;
 const parsed:unknown=JSON.parse(raw);return validateSpeedDrillHistory(parsed)?parsed:EMPTY_SPEED_DRILLS;
 }catch{return EMPTY_SPEED_DRILLS;}
}
export function gradeSpeedDrill(answers:readonly SpeedDrillAnswer[]){
 let correct=0,incorrect=0,unanswered=0;
 const details=answers.map(answer=>{
  const entry=CHECK_BY_ID.get(answer.checkId);
  if(!entry)return null;
  const isCorrect=answer.selectedIndex===entry.check.correctIndex;
  if(answer.selectedIndex===null)unanswered++;else if(isCorrect)correct++;else incorrect++;
  return {...entry,selectedIndex:answer.selectedIndex,isCorrect};
 });
 if(details.some(d=>d===null))return null;
 return {correct,incorrect,unanswered,total:answers.length,details:details as Array<NonNullable<typeof details[number]>>};
}
export function createSpeedDrillAttempt(params:{id:string;startedAt:string;completedAt:string;questionIds:readonly string[];selections:Readonly<Record<string,number>>}):SpeedDrillAttempt|null{
 const {id,startedAt,completedAt,questionIds,selections}=params;
 if(!iso(startedAt)||!iso(completedAt)||questionIds.length!==SPEED_DRILL_QUESTIONS)return null;
 const elapsedMs=Date.parse(completedAt)-Date.parse(startedAt);
 if(elapsedMs<0)return null;
 if(Object.entries(selections).some(([checkId,index])=>!questionIds.includes(checkId)||!Number.isInteger(index)||index<0||index>=3))return null;
 const answers=questionIds.map(checkId=>({checkId,selectedIndex:selections[checkId]===undefined?null:selections[checkId]}));
 const attempt:SpeedDrillAttempt={id,startedAt,completedAt,durationSeconds:SPEED_DRILL_SECONDS,elapsedSeconds:Math.min(SPEED_DRILL_SECONDS,Math.floor(elapsedMs/1000)),timedOut:elapsedMs>=SPEED_DRILL_SECONDS*1000,answers};
 return validateSpeedDrillHistory({version:1,attempts:[attempt]})?attempt:null;
}
export function appendSpeedDrill(history:SpeedDrillHistory,attempt:SpeedDrillAttempt):SpeedDrillHistory|null{
 if(!validateSpeedDrillHistory(history)||!validateSpeedDrillHistory({version:1,attempts:[attempt]}))return null;
 if(history.attempts.some(item=>item.id===attempt.id))return null;
 return {version:1,attempts:[...history.attempts,attempt].slice(-MAX_ATTEMPTS)};
}
export const REVIEW_CATEGORY_LESSONS:Record<ErrorCategory,string>={
 'Formula recall':'engineering-notation',
 'Sign / algebra errors':'parentheses',
 'Wrong method':'calc-solve',
 'Question misreading':'answer-verification',
 'Speed / calculation slip':'parentheses',
};
export interface CalculatorRemediation {
 lessonId:string;title:string;source:'drill'|'error-log';incorrect:number;unanswered:number;
 reason:string;
}
/** Drill mistakes are grounded in actual recorded responses; error-log links use only
 * the learner's explicit generic category, and are NOT a diagnosed calculator cause. */
export function recommendCalculatorRemediation(history:SpeedDrillHistory,errors:readonly ReviewError[],limit=5):CalculatorRemediation[]{
 if(!validateSpeedDrillHistory(history))return [];
 const counts=new Map<string,{incorrect:number;unanswered:number}>();
 for(const attempt of history.attempts.slice(-8)){
  const result=gradeSpeedDrill(attempt.answers);if(!result)continue;
  for(const item of result.details){if(item.isCorrect)continue;
   const prev=counts.get(item.lessonId)??{incorrect:0,unanswered:0};
   if(item.selectedIndex===null)prev.unanswered++;else prev.incorrect++;
   counts.set(item.lessonId,prev);
  }
 }
 const recommendations:CalculatorRemediation[]=[...counts].map(([lessonId,count])=>({
  lessonId,title:CANON_SKILL_BY_ID.get(lessonId)?.title??lessonId,
  source:'drill',...count,
  reason:`Recorded in recent timed drills: ${count.incorrect} incorrect, ${count.unanswered} unanswered. Review the relevant concept; these results do not diagnose a specific calculator error.`
 }));
 const fromDrills=new Set(recommendations.map(r=>r.lessonId));
 for(const error of errors){
  if(error.isResolved||!REVIEW_CATEGORY_LESSONS[error.category])continue;
  const lessonId=REVIEW_CATEGORY_LESSONS[error.category];
  if(fromDrills.has(lessonId)||recommendations.some(r=>r.lessonId===lessonId&&r.source==='error-log'))continue;
  recommendations.push({lessonId,title:CANON_SKILL_BY_ID.get(lessonId)?.title??lessonId,source:'error-log',incorrect:0,unanswered:0,
   reason:`Related to your unresolved error-log category “${error.category}”. This is a suggested review, not evidence that calculator use caused the error.`});
 }
 return recommendations.sort((a,b)=>{
  if(a.source!==b.source)return a.source==='drill'?-1:1;
  return b.incorrect*2+b.unanswered-(a.incorrect*2+a.unanswered);
 }).slice(0,Math.max(0,Math.min(10,limit)));
}

/** Lightweight in-app recheck prompts, not a certified spaced-repetition score.
 * A subsequently correct item clears the preceding missed-item reminder. */
export function calculatorRetentionPrompts(history:SpeedDrillHistory,now:string):Array<{lessonId:string;title:string;dueAt:string;due:boolean}> {
 if(!validateSpeedDrillHistory(history)||!iso(now))return [];
 const outstanding=new Map<string,string>();
 for(const attempt of history.attempts){
  const result=gradeSpeedDrill(attempt.answers);if(!result)continue;
  for(const item of result.details){
   if(item.isCorrect)outstanding.delete(item.lessonId);
   else outstanding.set(item.lessonId,attempt.completedAt);
  }
 }
 const clock=Date.parse(now);
 return [...outstanding].map(([lessonId,lastMissAt])=>{
  const dueAt=new Date(Date.parse(lastMissAt)+24*60*60*1000).toISOString();
  return {lessonId,title:CANON_SKILL_BY_ID.get(lessonId)?.title??lessonId,dueAt,due:clock>=Date.parse(dueAt)};
 }).sort((a,b)=>Number(b.due)-Number(a.due)||a.dueAt.localeCompare(b.dueAt));
}

export const MANUAL_VS_CANON_COMPARISONS=[
 {id:'quick-factor',lessonId:'eqn-quadratic',title:'Simple quadratic',problem:'x² − 5x + 6 = 0',manual:'Factor (x−2)(x−3)=0. Roots: 2, 3.',calculator:'Quadratic EQN with a=1, b=−5, c=6 returns roots 2 and 3.',fastest:'Manual factoring is usually faster for small integer roots.',check:'Substitute each root into x²−5x+6: both return zero.',trap:'Do not omit the second root.'},
 {id:'simultaneous',lessonId:'eqn-linear',title:'Two linear equations',problem:'2x+y=7; x−y=2',manual:'Add the equations to get 3x=9; thus x=3, y=1.',calculator:'Use the two-unknown EQN function and enter coefficient rows (2,1,7) and (1,−1,2).',fastest:'Manual addition may beat menu entry for this simple system.',check:'2(3)+1=7 and 3−1=2.',trap:'Do not swap the constant column with the y coefficient.'},
 {id:'power-db',lessonId:'decibels',title:'Power gain in decibels',problem:'Convert 20 dB power gain to a linear ratio',manual:'20/10=2, therefore 10²=100.',calculator:'Evaluate 10^(20/10) in normal calculation mode.',fastest:'Mental powers of ten are fastest here; calculator helps with noninteger dB.',check:'10 log₁₀(100) = 20 dB.',trap:'Power ratios use factor 10; an applicable amplitude ratio uses factor 20.'},
 {id:'derivative',lessonId:'numeric-calculus',title:'Derivative at a point',problem:'f(x)=x²; find f′(3)',manual:'Differentiate f′(x)=2x; f′(3)=6.',calculator:'Evaluate the numerical derivative of x² at x=3 using the documented differentiation function.',fastest:'The analytic derivative is faster and exact for x².',check:'Centered difference [(3+h)²−(3−h)²]/(2h)=6 for nonzero h.',trap:'A numerical value at x=3 is not the entire symbolic derivative.'},
 {id:'complex-conjugate',lessonId:'complex-matrix',title:'Complex conjugates',problem:'(3+4i)(3−4i)',manual:'Use (a+bi)(a−bi)=a²+b²=9+16=25.',calculator:'Use complex-number mode to multiply (3+4i) by (3−4i).',fastest:'The conjugate identity is usually faster.',check:'Expand: 9−16i²=25 because i²=−1.',trap:'Do not use i²=+1.'},
] as const;
