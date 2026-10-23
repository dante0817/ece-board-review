import type { AlgebraReferenceTopicContent } from '../../data/algebraReferenceContent';
import type { TestRecord } from '../../types';
import { classifyEvidence } from '../assessment/evidence';
import { INDEPENDENT_ALGEBRA_QUESTIONS } from '../../data/independentAlgebraAssessment';

/** Versioned *app-content* denominator, not a claim about an academic syllabus or the PRC blueprint. */
export const ALGEBRA_COVERAGE_CATALOG_VERSION = 'algebra-reference-2026.10-v10.11';
export const ASSESSMENT_EVIDENCE_RULE_VERSION = 'skill-evidence-v1';
export const ECE_MATH_EXAM_AREA = 'prc-mathematics';

const groups: Record<string, Record<string, string>> = {
  'top-quadratics': {'Factoring':'Solving quadratics','Square-root method':'Solving quadratics','Quadratic formula':'Solving quadratics','Completing the square':'Solving quadratics','Method selection':'Solution methods','Discriminant':'Root analysis','Root relationships':'Root analysis','ECE application':'Applied quadratics'},
  'top-functions': {'Function definition':'Function fundamentals','Evaluation':'Function fundamentals','Domain':'Domain and range','Composition':'Function operations','Piecewise':'Piecewise functions','Piecewise functions':'Piecewise functions','Inverse functions':'Function operations','ECE application':'Applied functions','Line slope':'Linear graphs','Line equation':'Linear graphs','Parallel/perpendicular lines':'Linear graphs','Graph transformations':'Graph transformations'},
  'top-factoring': {'GCF and special products':'Factoring common factors','Greatest common factor':'Factoring common factors','Trinomials':'Factoring trinomials','General trinomials':'Factoring trinomials','Perfect-square trinomials':'Factoring trinomials','Grouping':'Grouping and combined factoring','Complete factoring':'Grouping and combined factoring','Cubes':'Factoring powers','Sum of cubes':'Factoring powers','ECE application':'Applied factoring'},
  'top-polynomial-eq': {'Addition and subtraction':'Polynomial operations','Multiplication':'Polynomial operations','Degree':'Polynomial characteristics','Leading coefficient':'Polynomial characteristics','Evaluation':'Polynomial characteristics','Remainder theorem':'Polynomial division','Synthetic division':'Polynomial division','Polynomial division':'Polynomial division','ECE application':'Applied polynomials'},
  'top-laws-exponents': {'Exponent laws':'Exponent and radical rules','Radical simplification':'Exponent and radical rules','Rational exponents':'Exponent and radical rules','Like radicals':'Radical operations','Radical domains':'Radical domains','Rationalizing denominators':'Radical operations','ECE application':'Applied exponent rules'},
  'top-inequalities': {'Linear inequalities':'Linear and compound inequalities','Sign reversal':'Linear and compound inequalities','Compound intervals':'Linear and compound inequalities','Absolute value':'Absolute-value inequalities','Absolute-value inequalities':'Absolute-value inequalities','Polynomial sign chart':'Polynomial and rational inequalities','Polynomial inequalities':'Polynomial and rational inequalities','Rational sign chart':'Polynomial and rational inequalities','ECE application':'Applied inequalities'},
  'top-linear-eq': {'One-variable equations':'Solving linear equations','Distribution':'Solving linear equations','Multi-step equations':'Solving linear equations','Linear equation':'Solving linear equations','Fractional linear equations':'Fractional linear equations','Fractional coefficients':'Fractional linear equations','Fractional equation':'Fractional linear equations','Literal equations':'Rearranging formulas','Equation classification':'Equation classification','Identity or contradiction':'Equation classification','ECE application':'Applied linear equations'},
  'top-absolute-value': {'Absolute-value equations':'Absolute-value equations','Distance interpretation':'Absolute-value equations','Inside inequalities':'Absolute-value inequalities','Outside inequalities':'Absolute-value inequalities','Inside inequality':'Absolute-value inequalities','Outside inequality':'Absolute-value inequalities','Boundary cases':'Absolute-value inequalities','Feasibility':'Absolute-value inequalities','ECE tolerance':'Applied absolute value'},
  'top-rational-radical-eqs': {'Rational equations':'Rational equations and restrictions','Rational restrictions':'Rational equations and restrictions','Restrictions and solving':'Rational equations and restrictions','Single-radical equations':'Radical equations','Radical equations':'Radical equations','Odd radicals':'Radical equations','Binomial squaring':'Radical equations','Extraneous roots':'Checking extraneous roots','ECE application':'Applied rational equations'},
  'top-logarithms': {'Exponential equations':'Solving exponential equations','Natural-log equations':'Solving exponential equations','Log equations':'Solving logarithmic equations','Log domain':'Solving logarithmic equations','Log properties':'Logarithm laws','Log laws':'Logarithm laws','Change of base':'Logarithm evaluation','Logarithm definition':'Logarithm evaluation','Logarithm evaluation':'Logarithm evaluation','Natural logarithms':'Logarithm evaluation','ECE application':'Applied logarithms'},
  'top-simultaneous-linear': {'2×2 substitution/elimination':'Linear systems methods','Elimination':'Linear systems methods','3×3 systems':'Linear systems methods','Three variables':'Linear systems methods','System classification':'System classification','Inconsistent systems':'System classification','Determinants':'Cramer’s rule','Cramer’s Rule':'Cramer’s rule','Cramer’s Rule condition':'Cramer’s rule','Cramer determinant':'Cramer’s rule','Nonlinear systems':'Nonlinear systems','ECE application':'Applied systems'},
  'top-complex-numbers': {'Powers of i':'Complex arithmetic','Powers':'Complex arithmetic','Addition':'Complex arithmetic','Multiplication':'Complex arithmetic','Division':'Complex arithmetic','Negative radicals':'Complex arithmetic','Conjugates':'Complex conjugates','Conjugate product':'Complex conjugates','Complex quadratic roots':'Complex roots','ECE application':'Applied complex numbers'},
  'top-arithmetic-seq': {'Common difference':'Sequence terms','Nth term':'Sequence terms','Recover d':'Sequence terms','Recover first term':'Sequence terms','Find the index':'Sequence terms','Arithmetic mean':'Arithmetic means','Finite sum':'Arithmetic sums','Solve from a sum':'Arithmetic sums','ECE application':'Applied sequences'},
  'top-geometric-seq': {'Common ratio':'Sequence terms','Nth term':'Sequence terms','Recover first term':'Sequence terms','Geometric mean':'Geometric means','Finite sum':'Geometric sums','Infinite sum':'Infinite sums and convergence','Convergence':'Infinite sums and convergence','Recurring decimal':'Infinite sums and convergence','ECE application':'Applied geometric sequences'},
  'top-binomial-theorem': {'Binomial coefficient':'Binomial coefficients','Number of terms':'Binomial coefficients','Coefficient extraction':'Coefficient and term extraction','General term':'Coefficient and term extraction','Specific term':'Coefficient and term extraction','Constant term':'Coefficient and term extraction','Signs':'Binomial properties','Coefficient sum':'Binomial properties','ECE application':'Applied binomial theorem'},
  'top-matrices': {'Dimensions':'Matrix order and operations','Addition':'Matrix order and operations','Scalar multiplication':'Matrix order and operations','Multiplication':'Matrix multiplication','Matrix product':'Matrix multiplication','Matrix multiplication dimensions':'Matrix multiplication','Compatibility':'Matrix multiplication','Determinants':'Determinants and invertibility','Determinant':'Determinants and invertibility','Invertibility':'Determinants and invertibility','Inverse existence':'Determinants and invertibility','Inverse matrices':'Matrix inverses','Augmented matrices':'Solving matrix equations','ECE application':'Applied matrices'},
  'top-partial-fractions': {'Proper expressions':'Proper and improper fractions','Improper expressions':'Proper and improper fractions','Improper rational expression':'Proper and improper fractions','Distinct linear setup':'Distinct linear factors','Distinct linear factors':'Distinct linear factors','Repeated linear setup':'Repeated linear factors','Repeated-factor setup':'Repeated linear factors','Repeated linear factors':'Repeated linear factors','Irreducible quadratic setup':'Irreducible quadratics','Irreducible quadratic':'Irreducible quadratics','Mixed-factor setup':'Partial fraction setup','Coefficient solving':'Coefficient solving','ECE application':'Applied partial fractions'},
  'top-word-problems': {'Uniform motion':'Rate and motion models','Relative motion':'Rate and motion models','Work rate':'Rate and work models','Mixture':'Mixture and percentage models','Percent':'Mixture and percentage models','Simple interest':'Finance and proportion models','Direct variation':'Finance and proportion models','Age':'Applied algebra models','Geometry model':'Applied algebra models','ECE application':'Applied algebra models'},
  'top-inverse-functions': {'Composition':'Composition and inverse checks','Inverse verification':'Composition and inverse checks','Inverse algebra':'Finding inverse functions','Restricted inverse':'Finding inverse functions','One-to-one test':'Existence of inverses','Domain-range swap':'Inverse domain and range','Graph interpretation':'Inverse domain and range','Composite domain':'Composition and inverse checks','ECE application':'Applied inverses'},
  'top-polynomial-functions': {'Remainder theorem':'Polynomial roots and factors','Factor theorem':'Polynomial roots and factors','Zeros and factors':'Polynomial roots and factors','Synthetic division':'Synthetic division','Rational zeros':'Finding rational zeros','Multiplicity':'Graph behavior and multiplicity','End behavior':'Graph behavior and multiplicity','ECE application':'Applied polynomial functions'},
  'top-rational-functions': {'Domain':'Domains and discontinuities','Domain preservation':'Domains and discontinuities','Hole vs asymptote':'Domains and discontinuities','Hole coordinate':'Domains and discontinuities','Vertical asymptote':'Asymptotes','Horizontal asymptote':'Asymptotes','Slant asymptote':'Asymptotes','Intercepts':'Rational graph analysis','ECE application':'Applied rational functions'},
  'top-harmonic-seq': {'Harmonic mean':'Harmonic means','Mean relation':'Harmonic means','Mean ordering':'Harmonic means','Reciprocal pattern':'Harmonic sequences','Missing harmonic term':'Harmonic sequences','Validity':'Harmonic sequences','ECE application':'Applied harmonic sequences'},
};

function slug(value: string) { return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
export function canonicalSkillName(topicId: string, subskill: string): string { return groups[topicId]?.[subskill] ?? subskill; }
export function canonicalSkillId(topicId: string, subskill: string): string {return `${topicId}::${slug(canonicalSkillName(topicId,subskill))}`;}

export interface SkillCoverage {
  skillId: string; topicId: string; name: string; practiceItemIds: string[]; distinctPracticeProblems: number; misconceptionTags: string[];
  assessmentFamilyIds: string[]; /** 3 distinct, reviewed families is a planning target, not sufficient for actual mastery. */
  independentTarget: 3; assessmentCoverage: 'not available'|'insufficient'|'target met';
}
export interface IndependentCatalogItem { id: string; topicId: string; subskill: string; familyId: string }
export function buildSkillCoverage(content: AlgebraReferenceTopicContent, reserved: readonly IndependentCatalogItem[] = []): SkillCoverage[] {
  const bySkill=new Map<string,SkillCoverage>();
  for (const q of content.practiceQuestions) {
    const skillId=canonicalSkillId(content.canonicalTopicId,q.subskill);
    if(!bySkill.has(skillId)) bySkill.set(skillId, {skillId,topicId:content.canonicalTopicId,name:canonicalSkillName(content.canonicalTopicId,q.subskill),practiceItemIds:[],distinctPracticeProblems:0,misconceptionTags:[],assessmentFamilyIds:[],independentTarget:3,assessmentCoverage:'not available'});
    const item=bySkill.get(skillId)!;
    item.practiceItemIds.push(q.id);
    if(q.misconceptionId && !item.misconceptionTags.includes(q.misconceptionId))item.misconceptionTags.push(q.misconceptionId);
  }
  for(const q of reserved.filter(q=>q.topicId===content.canonicalTopicId)){
    const skillId=canonicalSkillId(q.topicId,q.subskill);
    if(!bySkill.has(skillId))bySkill.set(skillId,{skillId,topicId:q.topicId,name:canonicalSkillName(q.topicId,q.subskill),practiceItemIds:[],distinctPracticeProblems:0,misconceptionTags:[],assessmentFamilyIds:[],independentTarget:3,assessmentCoverage:'not available'});
    const item=bySkill.get(skillId)!;
    if(!item.assessmentFamilyIds.includes(q.familyId))item.assessmentFamilyIds.push(q.familyId);
  }
  return [...bySkill.values()].map(skill=>({...skill,distinctPracticeProblems:new Set(content.practiceQuestions.filter(q=>canonicalSkillId(content.canonicalTopicId,q.subskill)===skill.skillId).map(q=>q.prompt.trim().replace(/\s+/g,' ').toLowerCase())).size,assessmentCoverage:skill.assessmentFamilyIds.length>=3?'target met':skill.assessmentFamilyIds.length?'insufficient':'not available'}));
}

/** Self-attested and never equivalent to externally proctored certification. */
export interface SkillEvidenceSummary { skillId:string; attemptedFamilyCount:number; correctFamilyCount:number; independentAttempts:number; delayedRecheck:boolean; status:'Not assessed'|'Insufficient evidence'|'Developing (self-attested)'|'Consistent (self-attested)' }
export function getIndependentSkillEvidence(skillId:string, records: readonly TestRecord[], now = new Date()): SkillEvidenceSummary {
  const allowed=new Map(INDEPENDENT_ALGEBRA_QUESTIONS.map(q=>[q.id,{familyId:q.familyId,skillId:canonicalSkillId(q.topicId,q.subskill)}]));
  const attempts=records.filter(r=>classifyEvidence(r)==='strict-self-attested' && r.curriculumVersion==='v10.11' && r.startedAt && !Number.isNaN(Date.parse(r.startedAt)))
    .flatMap(r=>(r.itemResults??[]).filter(item=>item.skillId===skillId && item.questionFamilyId && allowed.get(item.questionId)?.familyId===item.questionFamilyId && allowed.get(item.questionId)?.skillId===skillId).map(item=>({family:item.questionFamilyId!,questionId:item.questionId,correct:item.selectedOptionId===item.correctOptionId,time:Date.parse(r.startedAt!)})))
    .filter(a=>a.time<=now.getTime()).sort((a,b)=>a.time-b.time);
  const families=new Set(attempts.map(a=>a.family));
  const latestByFamily=new Map<string,typeof attempts[number]>();
  for(const item of attempts)latestByFamily.set(item.family,item);
  const correctFamily=new Set([...latestByFamily.values()].filter(a=>a.correct).map(a=>a.family));
  const delayedRecheck=attempts.some((a,i)=>a.correct && attempts.slice(0,i).some(b=>b.correct && b.family===a.family && b.questionId!==a.questionId && a.time-b.time>=24*60*60*1000));
  const status:SkillEvidenceSummary['status']=!attempts.length?'Not assessed':families.size<3?'Insufficient evidence':correctFamily.size<3?'Developing (self-attested)':delayedRecheck?'Consistent (self-attested)':'Developing (self-attested)';
  return {skillId,attemptedFamilyCount:families.size,correctFamilyCount:correctFamily.size,independentAttempts:attempts.length,delayedRecheck,status};
}
