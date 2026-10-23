import {CANON_SKILL_BY_ID, gradeCalculatorSkill} from './skillsCurriculum';
export const CALCULATOR_SKILLS_PROGRESS_KEY='ece_canon_skills_progress_v1';
export interface SkillProgressEntry {attempts:number;bestCorrect:number;completedAt?:string}
export interface CalculatorSkillsProgress {version:1;lessons:Record<string,SkillProgressEntry>}
export const EMPTY_CALCULATOR_PROGRESS:CalculatorSkillsProgress={version:1,lessons:{}};
const object=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);
export function validateCalculatorSkillsProgress(raw:unknown):raw is CalculatorSkillsProgress{
 if(!object(raw)||raw.version!==1||!object(raw.lessons)||Object.keys(raw.lessons).length>CANON_SKILL_BY_ID.size)return false;
 return Object.entries(raw.lessons).every(([id,value])=>{
  if(!CANON_SKILL_BY_ID.has(id)||!object(value))return false;
  const n=CANON_SKILL_BY_ID.get(id)!.checks.length;
  if(!Number.isInteger(value.attempts)||!Number.isInteger(value.bestCorrect)||Number(value.attempts)<1||Number(value.attempts)>100000||Number(value.bestCorrect)<0||Number(value.bestCorrect)>n)return false;
  if(value.completedAt===undefined)return true;
  return typeof value.completedAt==='string'&&!Number.isNaN(Date.parse(value.completedAt))&&value.bestCorrect===n;
 });
}
export function recordCalculatorSkillAttempt(progress:CalculatorSkillsProgress,lessonId:string,answers:readonly number[],now:string):CalculatorSkillsProgress|null{
 if(!validateCalculatorSkillsProgress(progress)||Number.isNaN(Date.parse(now)))return null;
 const result=gradeCalculatorSkill(lessonId,answers);if(!result)return null;
 const previous=progress.lessons[lessonId];
 return {version:1,lessons:{...progress.lessons,[lessonId]:{
  attempts:Math.min(100000,(previous?.attempts??0)+1),bestCorrect:Math.max(previous?.bestCorrect??0,result.correct),
  ...((previous?.completedAt||result.passed)?{completedAt:previous?.completedAt??now}:{})
 }}};
}
export function readCalculatorSkillsProgress(store:Pick<Storage,'getItem'>):CalculatorSkillsProgress{
 try{const raw=store.getItem(CALCULATOR_SKILLS_PROGRESS_KEY);if(!raw)return EMPTY_CALCULATOR_PROGRESS;
  const parsed:unknown=JSON.parse(raw);return validateCalculatorSkillsProgress(parsed)?parsed:EMPTY_CALCULATOR_PROGRESS;
 }catch{return EMPTY_CALCULATOR_PROGRESS;}
}
