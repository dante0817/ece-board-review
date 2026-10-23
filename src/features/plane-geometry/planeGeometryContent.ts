import lessonsJson from './planeLessons.json';
import unitsJson from './planeUnits.json';
import formulasJson from './planeFormulas.json';
import practiceJson from './planePractice.json';
import type { LearnLesson, LessonBlock } from '../../domain/learn/lessonTypes';

export type PlaneLesson = (typeof lessonsJson)[number];
export type PlaneFormula = (typeof formulasJson)[number];
export interface PlaneQuestion {
  id:string; topic_id:string; title:string; kind:'numeric'|'concept'; level:string;
  prompt:string; unit:string; rule:string|null; params:number[]; expected:number|null;
  options:(number|string)[]; correctIndex:number; work:string[]; restriction:string; formulaId:string;
}
export const PLANE_LESSONS=lessonsJson;
export const PLANE_UNITS=unitsJson;
export const PLANE_FORMULAS=formulasJson;
export const PLANE_PRACTICE=practiceJson as PlaneQuestion[];
export const planeTrackingId=(id:string)=>`geo-plane-${id.slice(-3)}`;
export const planeQuestionsFor=(id:string)=>PLANE_PRACTICE.filter(q=>q.topic_id===id);
export const planeFormulasFor=(id:string)=>PLANE_FORMULAS.filter(f=>f.topic_id===id);
export const planeAnswer=(q:PlaneQuestion)=>{
  const correct=q.options[q.correctIndex];
  return `${typeof correct==='number'?Number(correct.toFixed(4)).toLocaleString('en-US',{maximumFractionDigits:4}):correct}${q.unit?' '+q.unit:''}`;
};

// Every reader section has a stable independent ID and uses a separate geo-plane-* storage namespace.
export const PLANE_READER_LESSONS: Record<string,LearnLesson>=Object.fromEntries(PLANE_LESSONS.map(l=>{
 const formulas=planeFormulasFor(l.topic_id);
 const examples=planeQuestionsFor(l.topic_id);
 const conceptual:LessonBlock[]=[
  {id:`${l.topic_id}-definition`,type:'definition',text:l.concept},
  {id:`${l.topic_id}-approach`,type:'paragraph',text:l.method},
  ...formulas.map(f=>({id:`${l.topic_id}-${f.id}`,type:'formula' as const,latex:f.latex,description:`${f.name}. Applicability: ${f.conditions}`})),
  {id:`${l.topic_id}-caution`,type:'note',text:l.guardrail},
 ];
 const guided:LessonBlock[]=examples.map((q,i)=>({
  id:`${l.topic_id}-example-${i+1}`,type:'worked-example' as const,title:`${i+1}. ${q.level} — ${q.title}`,
  problem:q.prompt,strategy:q.kind==='numeric'?'Identify the relevant measurements, calculate, then check the unit.':'Identify the definitions and theorem hypotheses before deciding.',
  steps:q.work,check:`Answer: ${planeAnswer(q)}.`,takeaway:q.restriction,
 }));
 const application:LessonBlock[]=[
  {id:`${l.topic_id}-objective`,type:'paragraph',text:`Goal: ${l.goal}`},
  {id:`${l.topic_id}-checkpoint`,type:'checkpoint',prompt:examples[1].prompt,answer:planeAnswer(examples[1]),explanation:examples[1].work.join(' ')},
  {id:`${l.topic_id}-refs`,type:'note',text:`Reference map (location requires edition/page verification): ${l.main_reference_code} — ${l.main_reference_location}; ${l.support_reference_code} — ${l.support_reference_location}. Independently written instructional draft.`},
 ];
 const lesson:LearnLesson={id:planeTrackingId(l.topic_id),title:l.title,summary:l.goal,contentVersion:1,status:'draft',sections:[
   {id:`${l.topic_id}-concept`,title:'Concepts and rules',objectiveIds:[l.topic_id],blocks:conceptual},
   {id:`${l.topic_id}-worked`,title:'Worked examples',objectiveIds:[l.topic_id],blocks:guided},
   {id:`${l.topic_id}-apply`,title:'Apply and check',objectiveIds:[l.topic_id],blocks:application},
 ]};
 return [l.topic_id,lesson];
}));
