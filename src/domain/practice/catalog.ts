/** Canonical, non-destructive adapters for existing Algebra practice banks.
 * Catalog labels describe *structure*, NOT independent editorial certification.
 */
import { ALGEBRA_REFERENCE_CONTENT } from '../../data/algebraReferenceContent';
import { LINEAR_PRACTICE_QUESTIONS } from '../../components/linear-equations/linearPracticeQuestionsData';
import { PRACTICE_QUESTIONS_BANK } from '../../components/rational-expressions/practiceQuestionsData';
import expandedQuadratics from '../../data/practice/quadraticExpansion.json';
import expandedAlgebraV1034 from '../../data/practice/algebraExpansionV1034.json';
import { TRIGONOMETRY_PILOT_QUESTIONS } from '../../data/practice/trigonometryPilot';
import { TRIGONOMETRY_FOUNDATIONS_QUESTIONS } from '../../data/practice/trigonometryFoundations';
import { TRIGONOMETRY_FOUNDATION_COMPLETION_QUESTIONS } from '../../data/practice/trigonometryFoundationCompletion';
import { TRIGONOMETRY_FUNDAMENTAL_IDENTITIES_QUESTIONS } from '../../data/practice/trigonometryFundamentalIdentities';
import { TRIGONOMETRY_ADVANCED_IDENTITIES_QUESTIONS } from '../../data/practice/trigonometryAdvancedIdentities';
import { TRIGONOMETRY_INVERSE_FUNCTIONS_QUESTIONS } from '../../data/practice/trigonometryInverseFunctions';
import { TRIGONOMETRY_EQUATIONS_QUESTIONS } from '../../data/practice/trigonometryEquations';
import { TRIGONOMETRY_OBLIQUE_TRIANGLES_QUESTIONS } from '../../data/practice/trigonometryObliqueTriangles';
import { TRIGONOMETRY_VECTORS_QUESTIONS } from '../../data/practice/trigonometryVectors';
import { TRIGONOMETRY_COMPLEX_POLAR_QUESTIONS } from '../../data/practice/trigonometryComplexPolar';
import { TRIGONOMETRY_POLAR_PARAMETRIC_QUESTIONS } from '../../data/practice/trigonometryPolarParametric';
import { TRIGONOMETRY_WAVES_PHASE_QUESTIONS } from '../../data/practice/trigonometryWavesPhase';
import { TRIGONOMETRY_ADVANCED_ENRICHMENT_QUESTIONS } from '../../data/practice/trigonometryAdvancedEnrichment';
import trigCurriculum from '../../features/trigonometry/curriculum.json';

export type PracticeLevel = 'Basic' | 'Intermediate' | 'Advanced' | 'Board-level';
export interface CatalogQuestion {
  key: string;
  legacyId: string;
  bankId: 'reference' | 'linear' | 'rational' | 'quadratic-expansion' | 'algebra-expansion-v1034' | 'trigonometry-pilot';
  topicId: string;
  topic: string;
  group: string;
  subskill: string;
  difficulty: PracticeLevel;
  problemType: 'Conceptual' | 'Computational' | 'Application' | 'Mixed';
  prompt: string;
  equation?: string;
  options: { id: string; text: string; latex?: string }[];
  correctOptionId: string;
  explanation: string;
  hints: string[];
  /** Legacy structural validation does not establish independent answer certification. */
  reviewStatus: 'legacy-under-review' | 'automated-checked' | 'draft-unverified';
  familyId?: string;
  objectiveId?: string;
  revision: string;
}

const level = (value:string):PracticeLevel => {
  if (value==='Foundation' || value==='Easy' || value==='Basic') return 'Basic';
  if (value==='Standard' || value==='Moderate' || value==='Intermediate') return 'Intermediate';
  if (value==='Hard' || value==='Mixed') return 'Advanced';
  return 'Board-level';
};
const kind=(value:string):CatalogQuestion['problemType'] =>
  /application|ECE/i.test(value)?'Application':/mixed/i.test(value)?'Mixed':'Computational';
const hash = (text:string):string => {
  let h=2166136261;
  for(let i=0;i<text.length;i++)h=Math.imul(h ^ text.charCodeAt(i),16777619);
  return (h>>>0).toString(36);
};
const trigNameById=new Map(trigCurriculum.topics.flatMap(t=>t.subtopics.map(s=>([s.id,s.title] as const))));
const withRevision=(q:Omit<CatalogQuestion,'revision'>):CatalogQuestion=>({
  ...q,revision:hash(JSON.stringify([q.prompt,q.equation,q.options,q.correctOptionId,q.explanation])),
});
export const PRACTICE_CATALOG: CatalogQuestion[] = (()=>{
  const out:CatalogQuestion[]=[];
  for (const content of Object.values(ALGEBRA_REFERENCE_CONTENT)) {
    for (const question of content.practiceQuestions) {
      out.push(withRevision({
        key:`reference:${content.canonicalTopicId}:${question.id}`,legacyId:question.id,bankId:'reference',
        topicId:content.canonicalTopicId,topic:content.title,group:content.groupLabel,
        subskill:question.subskill,difficulty:level(question.difficulty),problemType:kind(question.difficulty),
        prompt:question.prompt,options:question.options.map((text,index)=>({id:String(index),text})),
        correctOptionId:String(question.correctIndex),explanation:question.explanation,hints:[],reviewStatus:'legacy-under-review',
      }));
    }
  }
  for (const q of LINEAR_PRACTICE_QUESTIONS) {
    out.push(withRevision({key:`linear:${q.id}`,legacyId:q.id,bankId:'linear',
      topicId:'top-linear-eq',topic:'Linear Equations',group:'Equations & Inequalities',
      subskill:q.subskill,difficulty:level(q.difficulty),problemType:'Computational',
      prompt:q.question,equation:q.latexEquation,options:q.options,correctOptionId:q.correctOptionId,
      explanation:[q.explanation,...q.stepByStepDerivation.map(step=>step.step)].join('\n'),
      hints:q.stepByStepDerivation.map(step=>step.step),reviewStatus:'legacy-under-review'}));
  }
  for (const q of PRACTICE_QUESTIONS_BANK) {
    out.push(withRevision({key:`rational:${q.id}`,legacyId:String(q.id),bankId:'rational',
      topicId:'top-alg-fractions',topic:'Rational Expressions',group:'Expressions & Polynomials',
      subskill:q.subskill,difficulty:level(q.difficulty),problemType:'Computational',
      prompt:q.question,options:q.options.map((text,index)=>({id:String(index),text})),
      correctOptionId:String(q.correctIndex),explanation:q.explanation,hints:q.hints,reviewStatus:'legacy-under-review'}));
  }
  for (const item of expandedQuadratics) {
    // New original items have automated SymPy solution checks, not external expert certification.
    out.push(withRevision({key:`quadratic-expansion:${item.id}`,legacyId:item.id,bankId:'quadratic-expansion',
      topicId:'top-quadratics',topic:'Quadratic Equations',group:'Equations & Inequalities',
      subskill:item.subskill,difficulty:item.difficulty as PracticeLevel,
      problemType:item.problemType as CatalogQuestion['problemType'],
      prompt:item.prompt,options:item.options.map((text,index)=>({id:String(index),text})),
      correctOptionId:String(item.correctIndex),explanation:item.explanation,hints:[],
      reviewStatus:'automated-checked',familyId:item.family,objectiveId:item.objectiveId}));
  }
  // v10.34.0: original mathematics exercises across ten additional Algebra topics.
  // Automated algebra checks do not constitute independent human editorial certification.
  for (const item of expandedAlgebraV1034) {
    const topic = ALGEBRA_REFERENCE_CONTENT[item.topicId as keyof typeof ALGEBRA_REFERENCE_CONTENT];
    if (!topic) continue;
    out.push(withRevision({
      key:`algebra-expansion-v1034:${item.id}`,legacyId:item.id,bankId:'algebra-expansion-v1034',
      topicId:item.topicId,topic:topic.title,group:topic.groupLabel,
      subskill:item.subskill,difficulty:item.difficulty as PracticeLevel,
      problemType:item.problemType as CatalogQuestion['problemType'],
      prompt:item.prompt,options:item.options.map((text,index)=>({id:String(index),text})),
      correctOptionId:String(item.correctIndex),explanation:item.explanation,hints:[],
      reviewStatus:'automated-checked',familyId:item.family,objectiveId:item.objectiveId,
    }));
  }
  for (const item of [...TRIGONOMETRY_PILOT_QUESTIONS,...TRIGONOMETRY_FOUNDATIONS_QUESTIONS,...TRIGONOMETRY_FOUNDATION_COMPLETION_QUESTIONS,...TRIGONOMETRY_FUNDAMENTAL_IDENTITIES_QUESTIONS,...TRIGONOMETRY_ADVANCED_IDENTITIES_QUESTIONS,...TRIGONOMETRY_INVERSE_FUNCTIONS_QUESTIONS,...TRIGONOMETRY_EQUATIONS_QUESTIONS,...TRIGONOMETRY_OBLIQUE_TRIANGLES_QUESTIONS,...TRIGONOMETRY_VECTORS_QUESTIONS,...TRIGONOMETRY_COMPLEX_POLAR_QUESTIONS,...TRIGONOMETRY_POLAR_PARAMETRIC_QUESTIONS,...TRIGONOMETRY_WAVES_PHASE_QUESTIONS,...TRIGONOMETRY_ADVANCED_ENRICHMENT_QUESTIONS]) {
    out.push(withRevision({key:`trigonometry-pilot:${item.id}`,legacyId:item.id,bankId:'trigonometry-pilot',
      topicId:item.subtopicId,topic:trigNameById.get(item.subtopicId) ?? item.subtopicId,
      group:'Trigonometry',subskill:item.family,difficulty:item.difficulty,
      problemType:/^(applications|elevation|bearing|bearing-notation|navigation|survey-cosines|relative-velocity|work|torque)$/.test(item.family)?'Application':['coordinates','fundamental','quadrant-signs','undefined','full-turns','case-selection','existence','ssa-zero','ssa-one','ssa-two','ssa-obtuse','heron-domain','orientation','orthogonality','zero-exception','sign-of-dot','concept','parallel'].includes(item.family)?'Conceptual':'Computational',
      prompt:item.prompt,options:item.options.map((option,index)=>({id:String(index),text:option})),
      correctOptionId:String(item.correctIndex),explanation:item.explanation,hints:[],
      reviewStatus:'draft-unverified',familyId:item.family,objectiveId:item.subtopicId,
    }));
  }
  // Deduplicate *identical* prompts within a topic. Historical bank IDs remain unchanged.
  const seen=new Set<string>();
  return out.filter(q=>{
    if(!q.options.length || q.options.some(x=>!x.id || !x.text) ||
       !q.options.some(x=>x.id===q.correctOptionId))return false;
    const normalized=`${q.topicId}|${q.prompt}|${q.equation??''}`.replace(/\s+/g,' ').trim().toLowerCase();
    if(seen.has(normalized))return false;
    seen.add(normalized);return true;
  });
})();

export interface CatalogFilters {
  topicId: string;
  subskill: string;
  difficulty: string;
  search: string;
  status: 'all' | 'unattempted' | 'attempted' | 'incorrect';
}
export function filterPracticeQuestions(questions:readonly CatalogQuestion[],filters:CatalogFilters,
  attempts:Readonly<Record<string,{correct:boolean}>>={}):CatalogQuestion[]{
  const term=filters.search.trim().toLowerCase();
  return questions.filter(q=>
    (!filters.topicId || q.topicId===filters.topicId) &&
    (!filters.subskill || q.subskill===filters.subskill) &&
    (!filters.difficulty || q.difficulty===filters.difficulty) &&
    (!term || `${q.topic} ${q.subskill} ${q.prompt}`.toLowerCase().includes(term)) &&
    (filters.status==='all' || (filters.status==='unattempted'?!attempts[q.key]:
       filters.status==='attempted'?Boolean(attempts[q.key]):Boolean(attempts[q.key]&&!attempts[q.key].correct)))
  );
}
