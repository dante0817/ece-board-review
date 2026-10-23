import modulesJson from './psModules.json';
import lessonsJson from './psLessons.json';
import questionsJson from './psQuestions.json';
import evidenceJson from './psLessonEvidence.json';
import questionReviewJson from './psQuestionReview.json';
import blueprintJson from './psAssessmentBlueprint.json';
import sourceLocatorChecksJson from './psV10670SourceLocatorChecks.json';
import questionVerificationRegisterJson from './psV10670QuestionVerificationRegister.json';
import preliminaryConceptReviewJson from './psV10680PreliminaryConceptReview.json';
import sectionEvidenceJson from './psV10680SectionEvidence.json';
import type { LearnLesson, LessonBlock } from '../../domain/learn/lessonTypes';

export interface PSModule {id:string;title:string;tos:string;description:string;reference:string;lessonIds:string[]}
export interface PSLesson {id:string;moduleId:string;title:string;summary:string;concept:string;method:string;guardrail:string;latex:string;status:'draft';reference:string;workedExample?:{prompt:string;steps:string[]};checkpoint?:{prompt:string;answer:string;explanation:string}}
export interface PSQuestion {
  id:string;topicId:string;kind:'calculation'|'concept';level:'Foundation'|'Applied';
  prompt:string;options:string[];correctIndex:number;work:string[];restriction:string;
  auditRule:string|null;auditArgs:number[];auditExpected:number|null;guidedOnly:boolean;assessmentEligible:boolean;reviewStatus:string;origin:string;
}
export interface PSLessonEvidence {competency:string;relationship:string;source:string;section:string;sectionTitle:string;pdfPage:number;evidenceLevel:'table-of-contents-only'|'passage-verified';passageVerified:boolean;lessonSHA256:string}
export interface PSQuestionEditorialReview {lessonId:string;competency:string;relationship:string;provisionalCognitiveLevel:string;approvedCognitiveLevel:null|'knowledge'|'comprehension'|'application'|'analysis';expertApproved:boolean;independentEditorialSignoff:boolean;statisticalModelVerified:boolean;answerAndDistractorsVerified:boolean;passageVerified:boolean;reviewStatus:string;findingIds:string[];questionSHA256:string}
export interface PSCompetencyTarget {id:string;label:string;items:number}
export const PS_LESSON_EVIDENCE=evidenceJson as Record<string,PSLessonEvidence>;
export const PS_QUESTION_REVIEW=questionReviewJson as Record<string,PSQuestionEditorialReview>;
export const PS_BLUEPRINT=blueprintJson as {source:string;version:string;status:string;competencies:PSCompetencyTarget[];cognitiveTargetAcross15:Record<string,number>;prerequisites:string[];releaseGate:string};
export const PS_MODULES=modulesJson as PSModule[];
export const PS_LESSONS=lessonsJson as PSLesson[];
export const PS_QUESTIONS=questionsJson as PSQuestion[];
export const PS_GUIDED_QUESTIONS=PS_QUESTIONS.filter(q=>q.guidedOnly);
export const PS_PRACTICE_QUESTIONS=PS_QUESTIONS.filter(q=>!q.guidedOnly);
export const PS_SOURCE_LOCATOR_CHECKS=sourceLocatorChecksJson;
export const PS_QUESTION_VERIFICATION_REGISTER=questionVerificationRegisterJson;
export const PS_PRELIMINARY_CONCEPT_REVIEW=preliminaryConceptReviewJson;
export const PS_SOURCE_SECTION_EVIDENCE=sectionEvidenceJson;
export const PS_EDITORIAL_PREFLIGHT={sourcePageReadable:Object.values(PS_SOURCE_LOCATOR_CHECKS).filter(e=>e.pageHasExtractableText).length,sourceRecords:PS_LESSONS.length,fullLessonPassagesApproved:Object.values(PS_LESSON_EVIDENCE).filter(e=>e.passageVerified===true).length,conceptualQuestions:PS_PRACTICE_QUESTIONS.filter(q=>q.kind==='concept').length,conceptualSMEApproved:PS_PRACTICE_QUESTIONS.filter(q=>q.kind==='concept'&&PS_QUESTION_REVIEW[q.id]?.independentEditorialSignoff===true).length};
// Browser-compatible SHA-256; used to invalidate an editorial approval after a lesson or
// question changes. These fingerprints are version-bound checks, NOT expert approval.
// Verified against Node crypto in the v10.69 QA suite, including non-ASCII prompts.
const PS_SHA256_K=[
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
];
const PS_SHA256_INIT=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
export const psSha256=(text:string):string=>{
  const input=new TextEncoder().encode(text);
  const padded=new Uint8Array(Math.ceil((input.length+9)/64)*64);
  padded.set(input);padded[input.length]=0x80;
  const bits=BigInt(input.length)*8n;
  for(let i=0;i<8;i++)padded[padded.length-i-1]=Number((bits>>BigInt(8*i))&255n);
  const state=[...PS_SHA256_INIT];
  const r=(x:number,n:number)=>(x>>>n)|(x<<(32-n));
  for(let offset=0;offset<padded.length;offset+=64){
    const words=new Uint32Array(64);
    for(let i=0;i<16;i++){
      const j=offset+4*i;
      words[i]=((padded[j]<<24)|(padded[j+1]<<16)|(padded[j+2]<<8)|padded[j+3])>>>0;
    }
    for(let i=16;i<64;i++){
      const a=words[i-15],b=words[i-2];
      const s0=r(a,7)^r(a,18)^(a>>>3),s1=r(b,17)^r(b,19)^(b>>>10);
      words[i]=(words[i-16]+s0+words[i-7]+s1)>>>0;
    }
    let [a,b,c,d,e,f,g,h]=state;
    for(let i=0;i<64;i++){
      const s1=r(e,6)^r(e,11)^r(e,25);
      const choice=(e&f)^(~e&g);
      const t1=(h+s1+choice+PS_SHA256_K[i]+words[i])>>>0;
      const s0=r(a,2)^r(a,13)^r(a,22);
      const majority=(a&b)^(a&c)^(b&c);
      const t2=(s0+majority)>>>0;
      h=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;
    }
    for(const [i,v] of [a,b,c,d,e,f,g,h].entries())state[i]=(state[i]+v)>>>0;
  }
  return state.map(v=>v.toString(16).padStart(8,'0')).join('');
};
export const psQuestionReviewDigest=(q:PSQuestion):string=>psSha256(JSON.stringify([
  q.id,q.topicId,q.kind,q.level,q.prompt,q.options,q.correctIndex,q.work,q.restriction,
  q.auditRule,q.auditArgs,q.auditExpected,q.guidedOnly,
]));
export const psLessonReviewDigest=(l:PSLesson):string=>psSha256(JSON.stringify([
  l.id,l.moduleId,l.title,l.summary,l.concept,l.method,l.guardrail,l.latex,
  l.workedExample??null,l.checkpoint??null,
]));
const PS_LESSON_BY_ID:Record<string,PSLesson>=Object.fromEntries(PS_LESSONS.map(l=>[l.id,l]));

// Fail closed: never infer scored readiness from a module ID or a draft cognitive tag.
export const psIsBoardExamEligible=(q:PSQuestion)=>{
  const review=PS_QUESTION_REVIEW[q.id];
  return !q.guidedOnly && q.assessmentEligible === true &&
    q.reviewStatus === 'approved' && review?.reviewStatus === 'approved' &&
    PS_LESSON_EVIDENCE[q.topicId]?.evidenceLevel === 'passage-verified' &&
    review?.relationship === 'Direct' && review.lessonId === q.topicId &&
    PS_LESSON_EVIDENCE[q.topicId]?.relationship === 'Direct' &&
    PS_LESSON_EVIDENCE[q.topicId]?.competency === review.competency &&
    PS_BLUEPRINT.competencies.some(c=>c.id===review.competency) &&
    PS_LESSON_EVIDENCE[q.topicId]?.passageVerified === true &&
    review.questionSHA256 === psQuestionReviewDigest(q) &&
    !!PS_LESSON_BY_ID[q.topicId] &&
    PS_LESSON_EVIDENCE[q.topicId]?.lessonSHA256 === psLessonReviewDigest(PS_LESSON_BY_ID[q.topicId]) &&
    review.expertApproved === true &&
    review.independentEditorialSignoff === true && review.statisticalModelVerified === true &&
    review.answerAndDistractorsVerified === true && review.passageVerified === true &&
    ['knowledge','comprehension','application','analysis'].includes(review.approvedCognitiveLevel??'');
};
export const PS_BOARD_EXAM_QUESTIONS=PS_PRACTICE_QUESTIONS.filter(psIsBoardExamEligible);
export const PS_READINESS_PREFLIGHT=PS_BLUEPRINT.competencies.map(c=>{
  const reviewed=PS_BOARD_EXAM_QUESTIONS.filter(q=>PS_QUESTION_REVIEW[q.id]?.competency===c.id).length;
  return {...c,approved:reviewed,missing:Math.max(0,c.items-reviewed),met:reviewed>=c.items};
});
export const PS_COGNITIVE_PREFLIGHT=Object.entries(PS_BLUEPRINT.cognitiveTargetAcross15).map(([level,target])=>{
  const approved=PS_BOARD_EXAM_QUESTIONS.filter(q=>PS_QUESTION_REVIEW[q.id]?.approvedCognitiveLevel===level).length;
  return {level,target,approved,missing:Math.max(0,target-approved),met:approved>=target};
});
// A quota check on each axis can succeed even when no set of distinct items satisfies
// both the competency AND cognitive allocation simultaneously. Check joint feasibility.
export interface PSBlueprintCandidate {id:string;competency:string;cognitiveLevel:string}
export const psSelectJointBlueprintIds=(
  candidates:PSBlueprintCandidate[],
  competencyTargets:readonly {id:string;items:number}[],
  cognitiveTargets:Readonly<Record<string,number>>,
):string[]|null=>{
  const cognitive=Object.entries(cognitiveTargets);
  const total=competencyTargets.reduce((n,x)=>n+x.items,0);
  if(total===0 || total!==cognitive.reduce((n,[,v])=>n+v,0))return null;
  const unique=new Map(candidates.map(c=>[c.id,c]));
  if(unique.size!==candidates.length)return null;
  const ordered=[...candidates].sort((a,b)=>a.id.localeCompare(b.id));
  const cMap=new Map(competencyTargets.map((c,i)=>[c.id,i]));
  const kMap=new Map(cognitive.map(([k],i)=>[k,i]));
  const size=2+competencyTargets.length+ordered.length+cognitive.length;
  const source=0, firstCompetency=1, firstQuestion=firstCompetency+competencyTargets.length;
  const firstCognitive=firstQuestion+ordered.length, sink=size-1;
  type Edge={to:number;back:number;capacity:number};
  const graph:Edge[][]=Array.from({length:size},()=>[]);
  const add=(a:number,b:number,capacity:number)=>{
    const next:Edge={to:b,back:graph[b].length,capacity};
    const reverse:Edge={to:a,back:graph[a].length,capacity:0};
    graph[a].push(next);graph[b].push(reverse);
  };
  competencyTargets.forEach((c,i)=>add(source,firstCompetency+i,c.items));
  cognitive.forEach(([,v],i)=>add(firstCognitive+i,sink,v));
  ordered.forEach((q,i)=>{
    const ci=cMap.get(q.competency),ki=kMap.get(q.cognitiveLevel);
    if(ci===undefined||ki===undefined)return;
    add(firstCompetency+ci,firstQuestion+i,1);
    add(firstQuestion+i,firstCognitive+ki,1);
  });
  let matched=0;
  while(matched<total){
    const seen=new Set<number>();
    const augment=(v:number):boolean=>{
      if(v===sink)return true;
      seen.add(v);
      for(const edge of graph[v]){
        if(edge.capacity<=0||seen.has(edge.to))continue;
        if(augment(edge.to)){
          edge.capacity-=1;
          graph[edge.to][edge.back].capacity+=1;
          return true;
        }
      }
      return false;
    };
    if(!augment(source))break;
    matched++;
  }
  if(matched!==total)return null;
  const chosen=ordered.filter((_,i)=>graph[firstQuestion+i].some(edge=>
    edge.to>=firstCognitive&&edge.to<sink&&edge.capacity===0
  )).map(q=>q.id);
  return chosen.length===total?chosen:null;
};
export const psCanFillJointBlueprint=(
  candidates:PSBlueprintCandidate[],
  competencies:readonly {id:string;items:number}[],
  cognitive:Readonly<Record<string,number>>,
):boolean=>psSelectJointBlueprintIds(candidates,competencies,cognitive)!==null;
export const PS_BOARD_EXAM_SELECTION_IDS=psSelectJointBlueprintIds(
  PS_BOARD_EXAM_QUESTIONS.map(q=>({id:q.id,competency:PS_QUESTION_REVIEW[q.id].competency,cognitiveLevel:PS_QUESTION_REVIEW[q.id].approvedCognitiveLevel??''})),
  PS_BLUEPRINT.competencies,PS_BLUEPRINT.cognitiveTargetAcross15,
);
export const PS_JOINT_BLUEPRINT_FEASIBLE=PS_BOARD_EXAM_SELECTION_IDS!==null;
export const PS_BOARD_EXAM_READY=PS_READINESS_PREFLIGHT.every(c=>c.met)&&PS_COGNITIVE_PREFLIGHT.every(c=>c.met)&&PS_JOINT_BLUEPRINT_FEASIBLE;


export const psTrackingId=(topicId:string)=>`chapter-top-ps-${topicId.slice(2,4)}-${topicId.slice(-2)}`;
export const psQuestionsFor=(topicId:string)=>PS_GUIDED_QUESTIONS.filter(q=>q.topicId===topicId);
export const PS_READER_LESSONS:Record<string,LearnLesson>=Object.fromEntries(PS_LESSONS.map(l=>{
  const original=psQuestionsFor(l.id);
  const prefix=l.id.toLowerCase();
  const concepts:LessonBlock[]=[
    {id:`${prefix}-definition`,type:'definition',text:l.concept},
    {id:`${prefix}-method`,type:'paragraph',text:l.method},
    {id:`${prefix}-formula`,type:'formula',latex:l.latex,description:'Use only when the model assumptions and stated conditions apply.'},
    {id:`${prefix}-caution`,type:'note',text:l.guardrail},
  ];
  const worked:LessonBlock[]=l.workedExample?[{id:`${prefix}-example`,type:'worked-example',title:l.title,problem:l.workedExample.prompt,strategy:'Identify the model, compute the result, and check its assumptions.',steps:l.workedExample.steps,check:'Inspect each intermediate value and stated model assumption.',takeaway:l.guardrail}]:original.slice(0,1).map(q=>({
    id:`${prefix}-example`,type:'worked-example',title:l.title,problem:q.prompt,
    strategy:'Identify the correct mathematical model, substitute the given values, and check the interpretation.',
    steps:q.work,check:`Result: ${q.options[q.correctIndex]}.`,takeaway:q.restriction,
  }));
  const application:LessonBlock[]=[
    {id:`${prefix}-checkpoint`,type:'checkpoint',prompt:l.checkpoint?.prompt??original[1]?.prompt??'',answer:l.checkpoint?.answer??(original[1]&&original[1].options[original[1].correctIndex])??'',explanation:l.checkpoint?.explanation??original[1]?.work.join(' ')??''},
    {id:`${prefix}-reference`,type:'note',text:(()=>{const e=PS_LESSON_EVIDENCE[l.id];return e?`Research locator (not a certified lesson passage): ${e.source}, §${e.section} ${e.sectionTitle}, PDF page ${e.pdfPage}. PRC mapping: ${e.competency} (${e.relationship}). All content remains a developmental draft and requires formula/example verification.`:`Development source map: ${l.reference}. Section verification and independent editorial approval pending.`;})()},
  ];
  return [l.id,{id:psTrackingId(l.id),title:l.title,summary:l.summary,contentVersion:1,status:'draft',sections:[
    {id:`${prefix}-concepts`,title:'Concept & formula',objectiveIds:[l.id],blocks:concepts},
    {id:`${prefix}-worked`,title:'Worked example',objectiveIds:[l.id],blocks:worked},
    {id:`${prefix}-check`,title:'Apply & check',objectiveIds:[l.id],blocks:application},
  ]} satisfies LearnLesson];
}));
