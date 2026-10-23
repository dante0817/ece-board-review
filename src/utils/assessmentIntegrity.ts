import type { TestRecord, Subject, SubjectReadiness } from '../types';
import { classifyEvidence } from '../domain/assessment/evidence';
export type ItemResult = NonNullable<TestRecord['itemResults']>[number];
export function gradeItems(items: ItemResult[]) {
  if (!items.length) throw new Error('Cannot grade an empty assessment.');
  if (new Set(items.map(i=>i.questionId)).size !== items.length) throw new Error('Question identifiers must be unique.');
  const questions=items.length;
  const correct=items.filter(i=>i.selectedOptionId !== null && i.selectedOptionId===i.correctOptionId).length;
  const unanswered=items.filter(i=>i.selectedOptionId===null).length;
  return {questions,correct,incorrect:questions-correct-unanswered,unanswered,scorePercent:Math.round(correct/questions*100)};
}
export function topicResults(items: ItemResult[]) {
  const topicIds=Array.from(new Set(items.map(i=>i.topicId)));
  return topicIds.map(topicId => {
    const selected=items.filter(i=>i.topicId===topicId);
    return { topicId, ...gradeItems(selected) };
  });
}
export function validateAggregate(t: Pick<TestRecord,'questions'|'correct'|'incorrect'|'unanswered'|'timeMinutes'>): boolean {
  return [t.questions,t.correct,t.incorrect,t.unanswered].every(v=>Number.isSafeInteger(v) && v>=0) &&
    t.questions>0 && t.correct+t.incorrect+t.unanswered===t.questions &&
    Number.isFinite(t.timeMinutes) && t.timeMinutes>=0;
}
/** App study targets, NOT predicted PRC board eligibility. */
export function getSubjectReadiness(subject: Subject, records: TestRecord[], today: string): SubjectReadiness {
  const topics=subject.groups.flatMap(g=>g.topics);
  const covered=topics.filter(t=>t.initialCovered);
  const highPriority=topics.filter(t=>t.isHighPriority || (t.boardRelevance==='High' && t.initialCovered));
  const highPriorityAvgMastery=highPriority.length?Number((highPriority.reduce((sum,t)=>sum+(t.mastery||0),0)/highPriority.length).toFixed(1)):0;
  const verified=records.filter(t=>classifyEvidence(t)==='strict-self-attested' && t.itemResults?.length===t.questions && t.subjectId===subject.id && t.scope==='subject');
  const latest=verified[0];
  const timed=verified.find(t=>t.testType.toLowerCase().includes('timed'));
  const initialCoveragePercent=topics.length?Math.round(covered.length/topics.length*100):0;
  const topicsBelowLevel3=topics.filter(t=>!t.initialCovered || t.mastery===null || t.mastery<3 || t.evidenceStatus!=='verified').length;
  const overdueCount=topics.filter(t=>t.initialCovered && !!t.nextReviewDate && t.nextReviewDate<today).length;
  return {
    initialCoveragePercent,topicsBelowLevel3,highPriorityAvgMastery,
    latestMixedTestScore:latest?.scorePercent ?? null,
    timedBoardAccuracy:timed?.scorePercent ?? null,
    overdueCount,
    isReadyForMaintenance:initialCoveragePercent>=90 && topicsBelowLevel3===0 && highPriorityAvgMastery>=4 &&
      !!latest && latest.scorePercent>=85 && !!timed && timed.scorePercent>=88 && overdueCount===0,
  };
}
