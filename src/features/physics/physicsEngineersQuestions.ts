import questions1 from './physicsEngineersQuestions1.json';
import questions2 from './physicsEngineersQuestions2.json';
import questions3 from './physicsEngineersQuestions3.json';
import questions4 from './physicsEngineersQuestions4.json';
import {PHYSICS_LESSON_OUTLINES, PHYSICS_TOS_GROUPS, type PhysicsCognitiveLevel} from './physicsCatalog';

export interface PhysicsEngineerQuestion {
  id:string;
  groupId:string;
  lessonId:string;
  cognitive:PhysicsCognitiveLevel;
  stem:string;
  options:string[];
  correctIndex:number;
  explanation:string;
  reviewStatus:'draft'|'approved';
  assessmentEligible:boolean;
}
/**
 * Authored ungraded practice only. No item is approved for scored PRC mock exams.
 * No generated variant is counted as an independent new problem family.
 */
export const PHYSICS_ENGINEER_QUESTIONS:readonly PhysicsEngineerQuestion[]=[
  ...questions1,...questions2,...questions3,...questions4,
] as unknown as PhysicsEngineerQuestion[];
export const physicsEngineerQuestionsForLesson=(id:string)=>PHYSICS_ENGINEER_QUESTIONS.filter(q=>q.lessonId===id);
export const physicsEngineerQuestionsForGroup=(id:string)=>PHYSICS_ENGINEER_QUESTIONS.filter(q=>q.groupId===id);
/**
 * There is no independent approval ledger in Batch 2. Never derive scored
 * eligibility from editable draft flags. Batch 4/5 must add digest-bound
 * review evidence and a jointly feasible topic/cognitive selector first.
 */
export const PHYSICS_ENGINEERS_APPROVED_QUESTIONS:readonly PhysicsEngineerQuestion[]=[];

/** Fail-closed authoring checks. Passing never confers expert approval. */
export function verifyPhysicsEngineersQuestions():string[]{
  const errors:string[]=[];
  const expected:Record<string,{knowledge:number;comprehension:number}>={
    'pfe-mechanics':{knowledge:15,comprehension:10},
    'pfe-rotation-waves':{knowledge:10,comprehension:10},
    'pfe-fluids-heat':{knowledge:10,comprehension:0},
    'pfe-electric-optics':{knowledge:15,comprehension:5},
  };
  const pfeIds=new Set(PHYSICS_LESSON_OUTLINES.filter(l=>l.courseId==='geas-physics').map(l=>l.id));
  const seenIds=new Set<string>();
  const seenStems=new Set<string>();
  for(const question of PHYSICS_ENGINEER_QUESTIONS){
    if(seenIds.has(question.id))errors.push(`Duplicate question id ${question.id}`);
    seenIds.add(question.id);
    const stem=question.stem.toLowerCase().replace(/\s+/g,' ').trim();
    if(seenStems.has(stem))errors.push(`Duplicate question stem ${question.id}`);
    seenStems.add(stem);
    if(!pfeIds.has(question.lessonId)||!question.lessonId.startsWith(question.groupId+'-lesson-'))
      errors.push(`Question has invalid lesson/group relationship: ${question.id}`);
    if(!expected[question.groupId]|| !['knowledge','comprehension'].includes(question.cognitive))
      errors.push(`Invalid group/cognitive value: ${question.id}`);
    if(!Array.isArray(question.options)||question.options.length!==4||new Set(question.options).size!==4)
      errors.push(`Invalid choices: ${question.id}`);
    if(!Number.isInteger(question.correctIndex)||question.correctIndex<0||question.correctIndex>3)
      errors.push(`Invalid answer index: ${question.id}`);
    if(!question.stem||!question.explanation)errors.push(`Missing explanation: ${question.id}`);
    if(question.assessmentEligible!==false||question.reviewStatus!=='draft')
      errors.push(`Ungraded draft was improperly promoted: ${question.id}`);
  }
  for(const group of PHYSICS_TOS_GROUPS.filter(g=>g.courseId==='geas-physics')){
    const questions=physicsEngineerQuestionsForGroup(group.id);
    for(const level of ['knowledge','comprehension'] as const){
      const got=questions.filter(q=>q.cognitive===level).length;
      if(got!==expected[group.id]?.[level])errors.push(`${group.id}: ${level} expected ${expected[group.id]?.[level]}, got ${got}`);
    }
  }
  if(PHYSICS_ENGINEER_QUESTIONS.length!==75)errors.push('Expected 75 original questions for the initial development bank');
  if(PHYSICS_ENGINEERS_APPROVED_QUESTIONS.length!==0)errors.push('Draft questions must not be scored');
  return errors;
}
