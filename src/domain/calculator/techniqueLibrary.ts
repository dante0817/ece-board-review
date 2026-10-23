import {CANON_PILOT_TECHNIQUES,CALCULATOR_MODEL, type CalculatorTechnique} from './canonTechniques';
/** Device verification must be independently recorded; no pilot technique has it. */
export type TechniqueReviewStage = 'draft'|'math-checked'|'manual-reviewed'|'device-tested'|'published';
export type CalculatorParameter = {key:string; label:string; value:number; unit?:string};
export interface VerificationEvidence {
  math?: {fixtureId:string;reviewer:string;verifiedAt:string};
  manual?: {edition:string;section:string;reviewer:string;verifiedAt:string};
  device?: {testReportId:string;modelId:'canon-f789sga';tester:string;testedAt:string;initialSetup:string};
  editorial?: {approvedBy:string;approvedAt:string};
}
export interface TechniqueTemplate {
  techniqueId: string;
  version: number;
  modelId: 'canon-f789sga';
  questionFamilyId: string;
  originalQuestionId: string;
  purpose: 'solve'|'verify';
  requiredMode: string;
  parameters: readonly CalculatorParameter[];
  manual: {url:string; edition:string; section:string};
  steps:readonly string[];
  independentChecks:readonly string[];
  expectedDisplay:string;
  limitations:string;
  reviewStage:TechniqueReviewStage;
  evidence: VerificationEvidence;
}
export interface BoundCalculatorTechnique {questionId:string;template:TechniqueTemplate;expectedAnswer:string;renderedSteps:readonly string[]}
/** Static parameter contracts are authored explicitly, never inferred by regex from a question statement. */
const knownParameters:Readonly<Record<string,readonly CalculatorParameter[]>>={
 'mock-q-01':[{key:'a1',label:'First equation coefficient a₁',value:2},{key:'d1',label:'First equation coefficient d',value:9},{key:'rhs1',label:'First equation constant',value:31},{key:'a2',label:'Second equation coefficient a₁',value:2},{key:'d2',label:'Second equation coefficient d',value:19},{key:'rhs2',label:'Second equation constant',value:61}],
 'mock-q-04':[{key:'a',label:'Quadratic coefficient a',value:1},{key:'b',label:'Quadratic coefficient b',value:2},{key:'c',label:'Quadratic coefficient c',value:-35}],
 'mock-q-16':[{key:'carrierWatts',label:'Carrier power',value:500,unit:'W'},{key:'m',label:'Modulation index',value:0.8}],
 'mock-q-17':[{key:'frequencyDeviation',label:'Frequency deviation',value:75,unit:'kHz'},{key:'highestFrequency',label:'Highest modulating frequency',value:15,unit:'kHz'}],
 'mock-q-18':[{key:'load',label:'Load resistance',value:150,unit:'ohm'},{key:'line',label:'Line resistance',value:50,unit:'ohm'}],
 'mock-q-23':[{key:'idss',label:'IDSS',value:12,unit:'mA'},{key:'vgs',label:'VGS',value:-1,unit:'V'},{key:'vp',label:'VP',value:-4,unit:'V'}],
};
const modelManual='https://ij.manual.canon/cal/webmanual/WebPortal/pdf/F-789SGA%20%28EXP%29_EN.pdf';
function migrate(t:CalculatorTechnique):TechniqueTemplate {
 return Object.freeze({techniqueId:t.id,version:1,modelId:'canon-f789sga',questionFamilyId:`pilot:${t.questionId}`,originalQuestionId:t.questionId,purpose:'solve',
   requiredMode:t.functionName,parameters:knownParameters[t.questionId]??[],manual:{url:modelManual,edition:'F-789SGA (EXP) English',section:t.manualSection},
   steps:t.steps,independentChecks:t.verify,expectedDisplay:t.expected,limitations:t.caution,reviewStage:'draft' as const,
   // Inherited authored manual references are NOT an independent manufacturer review or physical-device certification.
   evidence:{},
 });
}
export const CANON_TECHNIQUE_TEMPLATES:readonly TechniqueTemplate[] = Object.freeze(CANON_PILOT_TECHNIQUES.map(migrate));
const templatesByQuestion = new Map(CANON_TECHNIQUE_TEMPLATES.map(t=>[t.originalQuestionId,t]));
/** The v10.18 pilot binds exact question IDs only; never substitute generated numbers by text matching. */
export function bindCanonTechnique(questionId:string, actualAnswer:string):BoundCalculatorTechnique|null {
 const template=templatesByQuestion.get(questionId);
 if(!template || !actualAnswer || template.modelId!=='canon-f789sga') return null;
 return {questionId,template,expectedAnswer:actualAnswer,renderedSteps:template.steps};
}
export function isPublishedTechnique(t:TechniqueTemplate):boolean {
 const e=t.evidence;
 return t.reviewStage==='published' && !!e.math?.fixtureId && !!e.math.reviewer && !!e.math.verifiedAt &&
  !!e.manual?.edition && !!e.manual.reviewer && !!e.manual.verifiedAt &&
  !!e.device?.testReportId && e.device.modelId==='canon-f789sga' && !!e.device.tester && !!e.device.testedAt && !!e.device.initialSetup &&
  !!e.editorial?.approvedBy && !!e.editorial.approvedAt;
}
export const SELECTED_CANON_MODEL=CALCULATOR_MODEL;
