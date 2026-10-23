import type { MockExamQuestion } from '../../types';
import { OFFICIAL_TOS_COURSES, OFFICIAL_TOS_SOURCE, TOS_FAMILY_COURSE, TOS_V1016_FAMILY_COURSE, TOS_LEGACY_QUESTION_COURSE, type TosAreaId, type TosCourse } from '../../data/officialTos';
import { ECE_BOARD_BLUEPRINT, allocateAreaTargets, distinctBoardQuestions, getBoardAreaId, type BoardPreviewPlan } from './boardBlueprint';

export interface TosCourseCoverage {
  id:string; areaId:TosAreaId; name:string; pdfPage:number; officialItems:number;
  requested:number; available:number; selected:number; shortage:number; knownFamilies:number;
}
export interface TosPreviewPlan {
  tosId:string; requestedQuestions:number; selectedQuestions:number; missingQuestions:number;
  /** Indicates filled quantity only; does not establish competency, subtopic or difficulty compliance. */
  quotaComplete:boolean; boardRepresentative:false;
  courses:TosCourseCoverage[];
  unmappedQuestionCount:number;
  areas:Array<{areaId:TosAreaId; requested:number; selected:number; shortage:number}>;
}
const CATEGORIES = new Map<string,TosCourse>(OFFICIAL_TOS_COURSES.map(course=>[course.id,course]));

/** Explicit editorial alignment only. No keyword or inherited subject-level mapping. */
export function getTosCourseId(question:Pick<MockExamQuestion,'id'|'subjectId'|'questionFamilyId'>):string|null {
  const area = getBoardAreaId(question.subjectId);
  const id = (question.questionFamilyId && (TOS_FAMILY_COURSE[question.questionFamilyId] || TOS_V1016_FAMILY_COURSE[question.questionFamilyId])) || TOS_LEGACY_QUESTION_COURSE[question.id];
  const course = id && CATEGORIES.get(id);
  return (course && course.areaId === area) ? course.id : null;
}

/** Hamilton apportionment within each subject. The sum of course targets equals
 * the requested board-area quota, including non-multiples of 100. */
export function allocateTosCourseTargets(count:number):Record<string,number>{
  const areaTargets=allocateAreaTargets(count);
  const result:Record<string,number>={};
  for(const area of ECE_BOARD_BLUEPRINT.areas){
    const courses=OFFICIAL_TOS_COURSES.filter(c=>c.areaId===area.id);
    const parts=courses.map((course,order)=>{
      const exact = areaTargets[area.id] * course.officialItems / 100;
      return {id:course.id, base:Math.floor(exact), frac:exact-Math.floor(exact),order};
    });
    const left = areaTargets[area.id]-parts.reduce((n,p)=>n+p.base,0);
    const priority=[...parts].sort((a,b)=>b.frac-a.frac || a.order-b.order);
    for(let i=0;i<left;i++)priority[i].base++;
    for(const part of parts)result[part.id]=part.base;
  }
  return result;
}

export function inspectTosPreview(count:number,questions:readonly MockExamQuestion[]):TosPreviewPlan {
  const targets=allocateTosCourseTargets(count);
  const unique=distinctBoardQuestions(questions);
  const grouped=new Map<string,MockExamQuestion[]>();
  for(const question of unique){
    const course=getTosCourseId(question);
    if(course)grouped.set(course,[...(grouped.get(course)??[]),question]);
  }
  const courses=OFFICIAL_TOS_COURSES.map(course=>{
    const pool=grouped.get(course.id)??[];
    const requested=targets[course.id], available=pool.length, selected=Math.min(requested,available);
    return {id:course.id,areaId:course.areaId,name:course.name,pdfPage:course.pdfPage,
      officialItems:course.officialItems,requested,available,selected,shortage:requested-selected,
      knownFamilies:new Set(pool.map(q=>q.questionFamilyId||q.id)).size};
  });
  const areas=ECE_BOARD_BLUEPRINT.areas.map(area=>{
    const group=courses.filter(c=>c.areaId===area.id);
    return {areaId:area.id,requested:group.reduce((a,c)=>a+c.requested,0),
      selected:group.reduce((a,c)=>a+c.selected,0),shortage:group.reduce((a,c)=>a+c.shortage,0)};
  });
  const selectedQuestions=courses.reduce((a,c)=>a+c.selected,0);
  return {tosId:OFFICIAL_TOS_SOURCE.id,requestedQuestions:count,selectedQuestions,
    missingQuestions:count-selectedQuestions,quotaComplete:selectedQuestions===count,
    boardRepresentative:false,courses,unmappedQuestionCount:unique.filter(q=>!getTosCourseId(q)).length,areas};
}

function shuffled<T>(values:readonly T[],random:()=>number):T[]{
  const result=[...values];
  for(let i=result.length-1;i>0;i--){
    const raw=random();const bounded=Number.isFinite(raw)?Math.max(0,Math.min(0.999999999999,raw)):0.5;
    const j=Math.floor(bounded*(i+1));[result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}

/** True course quota, no borrowing from other courses or areas. One problem
 * per authored family first; subsequent parameter variants are explicit repeats. */
export function assembleTosPreview(count:number,questions:readonly MockExamQuestion[],random:()=>number=Math.random):
  {plan:TosPreviewPlan;questions:MockExamQuestion[]} {
  const plan=inspectTosPreview(count,questions);
  const unique=distinctBoardQuestions(questions);
  const chosen=plan.courses.flatMap(course=>{
    const pool=shuffled(unique.filter(q=>getTosCourseId(q)===course.id),random);
    const seen=new Set<string>(),first:MockExamQuestion[]=[],other:MockExamQuestion[]=[];
    for(const q of pool){const family=q.questionFamilyId||q.id;
      if(seen.has(family))other.push(q);else{seen.add(family);first.push(q);}}
    return [...first,...other].slice(0,course.selected);
  });
  return {plan,questions:shuffled(chosen,random)};
}

/** Adapt TOS-selected questions to existing persisted subject-level provenance. */
export function tosToBoardPlan(tos:TosPreviewPlan,subjectPool:readonly MockExamQuestion[]):BoardPreviewPlan {
  const all=distinctBoardQuestions(subjectPool);
  return {blueprintId:tos.tosId,requestedQuestions:tos.requestedQuestions,
    selectedQuestions:tos.selectedQuestions,missingQuestions:tos.missingQuestions,
    quotaComplete:tos.quotaComplete,boardRepresentative:false,
    areas:ECE_BOARD_BLUEPRINT.areas.map(area=>{
      const courses=tos.courses.filter(c=>c.areaId===area.id);
      const pool=all.filter(q=>getBoardAreaId(q.subjectId)===area.id);
      const newPool=pool.filter(q=>q.contentOrigin==='original-v10.14' || q.contentOrigin==='original-v10.16');
      const requested=courses.reduce((n,c)=>n+c.requested,0),selected=courses.reduce((n,c)=>n+c.selected,0);
      return {areaId:area.id,name:area.name,weightPercent:area.weightPercent,requested,selected,
        available:pool.length,shortage:requested-selected,
        newFamilyCount:new Set(newPool.map(q=>q.questionFamilyId)).size,
        newVariants:newPool.length,distinctTopicCount:new Set(pool.map(q=>q.topicId)).size};
    })};
}

/** Cross-check newly persisted TOS diagnostics against the same graded items.
 * Old records have no course diagnostics and remain valid as legacy evidence. */
export function tosResultsMatchRecord(record:{
  itemResults?:ReadonlyArray<{questionId:string;tosCourseId?:string;selectedOptionId:string|null;correctOptionId:string}>;
  tosCourseResults?:ReadonlyArray<{courseId:string;areaId:string;requested:number;questions:number;correct:number;scorePercent:number|null}>;
}):boolean {
  if (!record.tosCourseResults) return true;
  const results=record.tosCourseResults,items=record.itemResults;
  if (!items || results.length!==OFFICIAL_TOS_COURSES.length || new Set(results.map(c=>c.courseId)).size!==results.length) return false;
  if (items.length!==results.reduce((n,r)=>n+r.questions,0)) return false;
  if (items.some(item=>!item.tosCourseId || !CATEGORIES.has(item.tosCourseId))) return false;
  return results.every(r=>{
    const course=CATEGORIES.get(r.courseId);
    if (!course || course.areaId!==r.areaId || r.requested<0 || !Number.isSafeInteger(r.requested)) return false;
    const found=items.filter(item=>item.tosCourseId===r.courseId);
    const correct=found.filter(item=>item.selectedOptionId===item.correctOptionId).length;
    return found.length===r.questions && correct===r.correct &&
      r.scorePercent===(found.length?Math.round(100*correct/found.length):null);
  });
}
