import { AlgebraReferenceTopicContent } from '../../data/algebraReferenceContent';
import { LearnLesson, LessonBlock, LessonSection } from './lessonTypes';
import { quadraticEquationsLesson } from '../../data/lessons/quadraticEquations';

/** Keep original lesson assets readable while comprehensive authored chapters are prepared. */
export function getLearnLesson(content:AlgebraReferenceTopicContent):LearnLesson {
  if (content.canonicalTopicId === quadraticEquationsLesson.id) return quadraticEquationsLesson;
  const sections:LessonSection[] = [
    {id:'overview',title:'Learning objectives',objectiveIds:content.objectives.map(o=>o.id),blocks:content.objectives.map((o):LessonBlock=>({id:o.id,type:'paragraph',text:o.text}))},
    {id:'prerequisites',title:'Prerequisite warm-up',objectiveIds:[],blocks:content.prerequisites.map((item):LessonBlock=>({id:item.id,type:'checkpoint',prompt:item.checkPrompt,answer:item.answer,explanation:item.label}))},
    {id:'principles',title:'Rules and essential formulas',objectiveIds:[],blocks:content.rules.flatMap((rule,i):LessonBlock[]=>[
      {id:`rule-${i}-meaning`,type:'paragraph',text:`${rule.title}: ${rule.meaning}${rule.condition ? ` Condition: ${rule.condition}`:''}${rule.commonError ? ` Common error: ${rule.commonError}`:''}`},
      ...(rule.formula ? [{id:`rule-${i}-formula`,type:'formula' as const,latex:rule.formula}]:[]),
    ])},
    {id:'examples',title:'Worked examples',objectiveIds:[],blocks:content.workedExamples.map((ex,i):LessonBlock=>({id:`example-${i}`,type:'worked-example',...ex}))},
    {id:'errors',title:'Common mistakes',objectiveIds:[],blocks:content.misconceptions.map((item):LessonBlock=>({id:item.id,type:'note',text:`${item.label}. ${item.symptom} Correction: ${item.correction} Check: ${item.quickCheck}`}))},
    {id:'applications',title:'ECE applications',objectiveIds:[],blocks:content.eceBridge.map((item,i):LessonBlock=>({id:`bridge-${i}`,type:'paragraph',text:`${item.title}. ${item.description}${item.formula ? ` Formula: ${item.formula}`:''}`}))},
    {id:'references',title:'Reference guide',objectiveIds:[],blocks:content.sources.map((item,i):LessonBlock=>({id:`source-${i}`,type:'note',text:`${item.book} — ${item.section}, ${item.locator} (${item.verificationStatus === 'verified-section-pages' ? 'section/pages verified':'provisional locator'}). ${item.use}`}))},
  ].filter(s=>s.blocks.length);
  return {id:content.canonicalTopicId,title:content.title,summary:content.shortDescription,status:'summary',contentVersion:1,sections};
}
