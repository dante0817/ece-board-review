import lessonsJson from './analyticLessons.json';
import unitsJson from './analyticUnits.json';
import formulasJson from './analyticFormulas.json';
import practiceJson from './analyticPractice.json';
import type { LearnLesson, LessonBlock } from '../../domain/learn/lessonTypes';

export type AnalyticLesson = (typeof lessonsJson)[number];
export type AnalyticFormula = (typeof formulasJson)[number];
export interface AnalyticQuestion {
  id:string; topic_id:string; title:string; kind:'numeric'|'concept'; level:string;
  prompt:string; unit:string; rule:string|null; params:number[]; expected:number|null;
  options:(number|string)[]; correctIndex:number; work:string[]; restriction:string; formulaId:string;
}
export const ANALYTIC_LESSONS=lessonsJson;
export const ANALYTIC_UNITS=unitsJson;
export const ANALYTIC_FORMULAS=formulasJson;
export const ANALYTIC_PRACTICE=practiceJson as AnalyticQuestion[];
export const analyticTrackingId=(id:string)=>`geo-analytic-${id.slice(-3)}`;
export const analyticQuestionsFor=(id:string)=>ANALYTIC_PRACTICE.filter(q=>q.topic_id===id);
export const analyticFormulasFor=(id:string)=>ANALYTIC_FORMULAS.filter(f=>f.topic_id===id);
export const analyticAnswer=(q:AnalyticQuestion)=>{
  const correct=q.options[q.correctIndex];
  return `${typeof correct==='number'?Number(correct.toFixed(4)).toLocaleString('en-US',{maximumFractionDigits:4}):correct}${q.unit?' '+q.unit:''}`;
};

// Every reader section has a stable independent ID and uses a separate geo-analytic-* storage namespace.
export const ANALYTIC_READER_LESSONS: Record<string,LearnLesson>=Object.fromEntries(ANALYTIC_LESSONS.map(l=>{
 const formulas=analyticFormulasFor(l.topic_id);
 const examples=analyticQuestionsFor(l.topic_id);
 const conceptual:LessonBlock[]=[
  {id:`${l.topic_id}-definition`,type:'definition',text:l.concept},
  {id:`${l.topic_id}-approach`,type:'paragraph',text:l.method},
  ...formulas.map(f=>({id:`${l.topic_id}-${f.id}`,type:'formula' as const,latex:f.latex,description:`${f.name}. Applicability: ${f.conditions}`})),
  {id:`${l.topic_id}-caution`,type:'note',text:l.guardrail},
 ];
 const guided:LessonBlock[]=examples.map((q,i)=>({
  id:`${l.topic_id}-example-${i+1}`,type:'worked-example' as const,title:`${i+1}. ${q.level} — ${q.title}`,
  problem:q.prompt,strategy:q.kind==='numeric'?'Identify the coordinate system and relevant equation, calculate, then verify the sign and domain.':'Identify the definitions and theorem hypotheses before deciding.',
  steps:q.work,check:`Answer: ${analyticAnswer(q)}.`,takeaway:q.restriction,
 }));
 const application:LessonBlock[]=[
  {id:`${l.topic_id}-objective`,type:'paragraph',text:`Goal: ${l.goal}`},
  {id:`${l.topic_id}-checkpoint`,type:'checkpoint',prompt:examples[1].prompt,answer:analyticAnswer(examples[1]),explanation:examples[1].work.join(' ')},
  {id:`${l.topic_id}-refs`,type:'note',text:`Reference map (location requires edition/page verification): ${l.main_reference_code} — ${l.main_reference_location}; ${l.support_reference_code} — ${l.support_reference_location}. Independently written instructional draft.`},
 ];
 const lesson:LearnLesson={id:analyticTrackingId(l.topic_id),title:l.title,summary:l.goal,contentVersion:1,status:'draft',sections:[
   {id:`${l.topic_id}-concept`,title:'Concepts and rules',objectiveIds:[l.topic_id],blocks:conceptual},
   {id:`${l.topic_id}-worked`,title:'Worked examples',objectiveIds:[l.topic_id],blocks:guided},
   {id:`${l.topic_id}-apply`,title:'Apply and check',objectiveIds:[l.topic_id],blocks:application},
 ]};
 return [l.topic_id,lesson];
}));
