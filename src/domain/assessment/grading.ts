import type { AssessmentItem, CanonicalItemResult } from './types';
export interface GradeCounts { questions: number; correct: number; incorrect: number; unanswered: number; scorePercent: number }
export function gradeResponses(items: readonly AssessmentItem[], responses: Readonly<Record<string, string | null | undefined>>, optionOrders: Readonly<Record<string, readonly string[]>>): { grade: GradeCounts; results: CanonicalItemResult[] } {
  if (!items.length || new Set(items.map(q => q.questionId)).size !== items.length) throw new Error('A nonempty, unique question set is required.');
  const results = items.map(item => {
    const validIds = item.options.map(choice => choice.id);
    if (validIds.length < 2 || new Set(validIds).size !== validIds.length || !validIds.includes(item.correctOptionId)) throw new Error(`Invalid answer key for ${item.questionId}`);
    const optionOrder = [...(optionOrders[item.questionId] ?? [])];
    if (optionOrder.length !== validIds.length || new Set(optionOrder).size !== validIds.length || optionOrder.some(id => !validIds.includes(id))) throw new Error(`Invalid option order for ${item.questionId}`);
    const selectedOptionId = responses[item.questionId] ?? null;
    if (selectedOptionId !== null && !validIds.includes(selectedOptionId)) throw new Error(`Unknown selected option for ${item.questionId}`);
    return {
      questionId:item.questionId, questionFamilyId:item.questionFamilyId, topicId:item.topicId,
      subjectId:item.subjectId, skillId:item.skillId, examAreaId:item.examAreaId,
      selectedOptionId,correctOptionId:item.correctOptionId,optionOrder,
    };
  });
  const questions = results.length;
  const correct = results.filter(r => r.selectedOptionId === r.correctOptionId).length;
  const unanswered = results.filter(r => r.selectedOptionId === null).length;
  return { grade: { questions,correct,incorrect:questions-correct-unanswered,unanswered,scorePercent:Math.round(correct/questions*100) }, results };
}
