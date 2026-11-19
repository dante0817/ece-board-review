import type { LearnLesson, LessonBlock, LessonSection } from '../../domain/learn/lessonTypes';
import part1 from './physicsEngineersPart1.json';
import part2 from './physicsEngineersPart2.json';
import { PHYSICS_LESSON_OUTLINES } from './physicsCatalog';

/**
 * Physics for Engineers: original educational drafts informed by the selected
 * Serway/Jewett, Walker, Cutnell/Johnson, Young/Freedman and companion texts.
 * The files are authored content, not copied textbook problems.
 * No independent editorial sign-off or scored-exam approval is implied.
 */
export interface EngineerLessonRecord {
  id: string;
  title: string;
  summary: string;
  concept: string;
  formulas: { latex:string; note:string }[];
  method: string;
  guardrail: string;
  worked: { title:string; problem:string; strategy:string; steps:string[]; check:string; takeaway:string };
  checks: [string,string,string][];
  reference: string;
}

export const PHYSICS_ENGINEER_SOURCE: readonly EngineerLessonRecord[] = [...part1,...part2] as unknown as EngineerLessonRecord[];
const OUTLINE_BY_ID = new Map(PHYSICS_LESSON_OUTLINES.map(o=>[o.id,o]));

function lessonFromSource(source: EngineerLessonRecord):LearnLesson {
  const outline = OUTLINE_BY_ID.get(source.id);
  if (!outline || outline.courseId !== 'geas-physics' || outline.title !== source.title) {
    throw new Error(`Physics for Engineers content mismatch: ${source.id}`);
  }
  const id=source.id;
  const conceptBlocks:LessonBlock[]=[
    {id:`${id}-concept-definition`,type:'definition',text:source.concept},
    {id:`${id}-concept-method`,type:'paragraph',text:`Problem-solving method: ${source.method}`},
    ...source.formulas.map((formula,i):LessonBlock=>({id:`${id}-formula-${i+1}`,type:'formula',latex:formula.latex,description:formula.note})),
    {id:`${id}-concept-guardrail`,type:'note',text:`Important conditions and common mistakes: ${source.guardrail}`},
  ];
  const exampleBlocks:LessonBlock[]=[
    {id:`${id}-worked-1`,type:'worked-example',title:source.worked.title,problem:source.worked.problem,
      strategy:source.worked.strategy,steps:source.worked.steps,check:source.worked.check,takeaway:source.worked.takeaway},
  ];
  const checkpointBlocks:LessonBlock[]=[
    ...source.checks.map((check,i):LessonBlock=>({id:`${id}-checkpoint-${i+1}`,type:'checkpoint',
      prompt:check[0],answer:check[1],explanation:check[2]})),
    {id:`${id}-reference`,type:'paragraph',
      text:`Reference directions for independent checking: ${source.reference}. These are original developmental lessons and have not been independently subject-matter certified.`},
  ];
  const sections:LessonSection[]=[
    {id:`${id}-foundations`,title:'Concepts, equations and conditions',objectiveIds:[id],blocks:conceptBlocks},
    {id:`${id}-example`,title:'Step-by-step worked example',objectiveIds:[id],blocks:exampleBlocks},
    {id:`${id}-checkpoints`,title:'Concept checks and further study',objectiveIds:[id],blocks:checkpointBlocks},
  ];
  return {id,title:source.title,summary:source.summary,status:'draft',contentVersion:1,sections};
}

export const PHYSICS_ENGINEER_LESSONS:Readonly<Record<string,LearnLesson>>=Object.fromEntries(
  PHYSICS_ENGINEER_SOURCE.map(row=>[row.id,lessonFromSource(row)]),
);
export const PHYSICS_ENGINEERS_LESSON_COUNT=Object.keys(PHYSICS_ENGINEER_LESSONS).length;
export const physicsTrackingId=(lessonId:string)=>`phy-${lessonId}`;

/** Static authoring coverage. This is not a content-certification predicate. */
export function verifyPhysicsEngineersLessons():string[]{
  const errors:string[]=[];
  const outlines=PHYSICS_LESSON_OUTLINES.filter(o=>o.courseId==='geas-physics');
  if(PHYSICS_ENGINEERS_LESSON_COUNT!==outlines.length)errors.push('Physics for Engineers lesson count mismatch');
  const seen=new Set<string>();
  for(const row of PHYSICS_ENGINEER_SOURCE){
    if(seen.has(row.id))errors.push(`Duplicate lesson: ${row.id}`);
    seen.add(row.id);
    if(row.formulas.length<1)errors.push(`${row.id}: missing equations`);
    if(row.worked.steps.length<2)errors.push(`${row.id}: incomplete worked example`);
    if(row.checks.length<2)errors.push(`${row.id}: missing checkpoints`);
    if(!row.guardrail||!row.reference)errors.push(`${row.id}: missing assumptions or references`);
    if(row.concept.length<100)errors.push(`${row.id}: concept too short`);
  }
  for(const outline of outlines)if(!seen.has(outline.id))errors.push(`Missing lesson: ${outline.id}`);
  return errors;
}
