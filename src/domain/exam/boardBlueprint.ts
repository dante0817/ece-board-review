import type { MockExamQuestion, TestRecord } from '../../types';

/** Source: PRC October 2026 Electronics Engineers exam program.
 * Percentages govern area allocation, not within-area TOS coverage or readiness.
 * https://www.prc.gov.ph/sites/default/files/BECE%20exam%20program%20Oct%202026.pdf
 */
export const ECE_BOARD_BLUEPRINT = {
  id: 'prc-eele-oct-2026-areas-v1',
  name: 'PRC October 2026 ECE subject weights',
  url: 'https://www.prc.gov.ph/sites/default/files/BECE%20exam%20program%20Oct%202026.pdf',
  areas: [
    {id: 'math', name: 'Mathematics', weightPercent: 20},
    {id: 'electronics', name: 'Electronics Engineering', weightPercent: 30},
    {id: 'geas', name: 'General Engineering and Applied Sciences', weightPercent: 20},
    {id: 'est', name: 'Electronics Systems and Technologies', weightPercent: 30},
  ],
} as const;

export type BoardAreaId = typeof ECE_BOARD_BLUEPRINT.areas[number]['id'];
export type AreaQuota = {areaId: BoardAreaId; name: string; weightPercent: number; requested: number; available: number; selected: number; shortage: number; newFamilyCount: number; newVariants: number; distinctTopicCount: number};
export interface BoardPreviewPlan {
  blueprintId: string;
  requestedQuestions: number;
  selectedQuestions: number;
  missingQuestions: number;
  quotaComplete: boolean;
  /** This preview is never a validated full-board examination. */
  boardRepresentative: false;
  areas: AreaQuota[];
}
export interface BoardAreaResult {
  areaId: BoardAreaId;
  name: string;
  weightPercent: number;
  requestedQuestions: number;
  availableQuestions: number;
  questions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  scorePercent: number | null;
}

const subjectArea: Record<string, BoardAreaId> = {
  'subj-math-algebra':'math', 'subj-math-trig':'math', 'subj-math-calc':'math',
  'subj-electronics':'electronics', 'subj-communications':'est', 'subj-geas':'geas',
  // Do not infer GEAS from a differently labelled subject.
};
export function getBoardAreaId(subjectId: string): BoardAreaId | null { return subjectArea[subjectId] ?? null; }

/** Largest-remainder apportionment with stable tie handling. Always sums to count. */
export function allocateAreaTargets(count: number): Record<BoardAreaId, number> {
  if (!Number.isSafeInteger(count) || count < 0 || count > 10000) throw new Error('Invalid examination length');
  const targets = ECE_BOARD_BLUEPRINT.areas.map((area, order) => {
    const exact = count * area.weightPercent / 100;
    return {id:area.id, base:Math.floor(exact), fraction:exact-Math.floor(exact), order};
  });
  const slots = count - targets.reduce((sum,item)=>sum+item.base,0);
  const priority = [...targets].sort((a,b)=>b.fraction-a.fraction || a.order-b.order);
  for (let i=0; i<slots; i++) priority[i].base++;
  return Object.fromEntries(targets.map(t=>[t.id,t.base])) as Record<BoardAreaId,number>;
}

/** Identity of a repeated prompt, independent of its legacy ID and whitespace. */
export function distinctBoardQuestions(questions: readonly MockExamQuestion[]): MockExamQuestion[] {
  const seen = new Set<string>();
  return questions.filter(q => {
    const key=q.question.trim().replace(/\s+/g,' ').toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);return true;
  });
}

/** Plan without randomly selecting questions; used for setup, warnings, and saved provenance. */
export function inspectBoardPreview(count: number, questions: readonly MockExamQuestion[]): BoardPreviewPlan {
  const quotas=allocateAreaTargets(count);
  const unique=distinctBoardQuestions(questions);
  const areas: AreaQuota[]=ECE_BOARD_BLUEPRINT.areas.map(area=>{
    const requested=quotas[area.id];
    const available=unique.filter(q=>getBoardAreaId(q.subjectId)===area.id).length;
    const selected=Math.min(requested,available);
    const areaPool=unique.filter(q=>getBoardAreaId(q.subjectId)===area.id);
    const newQuestions=areaPool.filter(q=>q.contentOrigin==='original-v10.14' || q.contentOrigin==='original-v10.16');
    return {areaId:area.id,name:area.name,weightPercent:area.weightPercent,requested,available,selected,shortage:requested-selected,
      newFamilyCount:new Set(newQuestions.map(q=>q.questionFamilyId)).size, newVariants:newQuestions.length,
      distinctTopicCount:new Set(areaPool.map(q=>q.topicId)).size};
  });
  const selectedQuestions=areas.reduce((sum,area)=>sum+area.selected,0);
  return {blueprintId:ECE_BOARD_BLUEPRINT.id,requestedQuestions:count,selectedQuestions,
    missingQuestions:count-selectedQuestions,quotaComplete:selectedQuestions===count,
    boardRepresentative:false,areas};
}

/** Never substitutes Algebra or another area into a shortage. */
export function assembleBoardPreview(count:number, questions:readonly MockExamQuestion[], random:()=>number=Math.random): {plan:BoardPreviewPlan; questions:MockExamQuestion[]} {
  const plan=inspectBoardPreview(count,questions);
  const unique=distinctBoardQuestions(questions);
  const selected=plan.areas.flatMap(area=>{
    const pool=unique.filter(q=>getBoardAreaId(q.subjectId)===area.areaId);
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(0.999999999999,random()))*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    // Select one question per known authored family before introducing numeric variants.
    const seenFamilies=new Set<string>();
    const diverse:MockExamQuestion[]=[];
    const repeats:MockExamQuestion[]=[];
    for(const question of pool){
      const family=question.questionFamilyId ?? question.id; // legacy families are unknown, not asserted independent
      if(seenFamilies.has(family)) repeats.push(question);
      else {seenFamilies.add(family); diverse.push(question);}
    }
    return [...diverse,...repeats].slice(0,area.selected);
  });
  for(let i=selected.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(0.999999999999,random()))*(i+1));[selected[i],selected[j]]=[selected[j],selected[i]];}
  return {plan,questions:selected};
}

export function calculateBoardAreaResults(
  questions:readonly MockExamQuestion[], answers:Readonly<Record<string,string | null | undefined>>,
  plan?:BoardPreviewPlan
): BoardAreaResult[] {
  return ECE_BOARD_BLUEPRINT.areas.map(area=>{
    const subset=questions.filter(q=>getBoardAreaId(q.subjectId)===area.id);
    const correct=subset.filter(q=>answers[q.id]===q.correctOptionId).length;
    const unanswered=subset.filter(q=>answers[q.id]===undefined || answers[q.id]===null).length;
    const quota=plan?.areas.find(a=>a.areaId===area.id);
    return {areaId:area.id,name:area.name,weightPercent:area.weightPercent,
      requestedQuestions:quota?.requested ?? 0, availableQuestions:quota?.available ?? 0,
      questions:subset.length,correct,incorrect:subset.length-correct-unanswered,unanswered,
      scorePercent:subset.length?Math.round(100*correct/subset.length):null};
  });
}

/** A persisted breakdown must reconcile with automatically graded item results. */
export function areaResultsMatchRecord(record:Pick<TestRecord,'questions'|'correct'|'incorrect'|'unanswered'|'itemResults'|'examAreaResults'>):boolean {
  if(!record.examAreaResults) return true;
  if(!record.itemResults || record.itemResults.length!==record.questions) return false;
  const all=record.examAreaResults;
  if(all.length!==4 || new Set(all.map(a=>a.areaId)).size!==4 || !ECE_BOARD_BLUEPRINT.areas.every(a=>all.some(x=>x.areaId===a.id))) return false;
  if(all.reduce((s,a)=>s+a.questions,0)!==record.questions || all.reduce((s,a)=>s+a.correct,0)!==record.correct ||
     all.reduce((s,a)=>s+a.incorrect,0)!==record.incorrect || all.reduce((s,a)=>s+a.unanswered,0)!==record.unanswered) return false;
  return all.every(a=>{
    const items=record.itemResults!.filter(item=>item.examAreaId===a.areaId);
    const correct=items.filter(x=>x.selectedOptionId===x.correctOptionId).length;
    const unanswered=items.filter(x=>x.selectedOptionId===null).length;
    return items.length===a.questions && correct===a.correct && unanswered===a.unanswered &&
      a.incorrect===items.length-correct-unanswered && a.scorePercent===(items.length?Math.round(100*correct/items.length):null);
  });
}
