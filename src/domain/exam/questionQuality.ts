import type { MockExamQuestion } from '../../types';

/** Authoring/test provenance only; this is NOT a professional quality certification. */
export type QuestionQualityLevel = 'numeric-fixture-checked' | 'generator-checked' | 'manual-review-required';
export const classifyQuestionQuality = (q:Pick<MockExamQuestion,'id'|'contentOrigin'>):QuestionQualityLevel => {
  if(q.id==='mock-q-25' || q.id==='mock-q-35') return 'numeric-fixture-checked';
  if(q.contentOrigin==='original-v10.16') return 'numeric-fixture-checked';
  if(q.contentOrigin==='original-v10.14') return 'generator-checked';
  return 'manual-review-required';
};
export function countQuestionQuality(questions: readonly Pick<MockExamQuestion,'id'|'contentOrigin'>[]) {
  const tally = {'numeric-fixture-checked':0,'generator-checked':0,'manual-review-required':0};
  for(const q of questions)tally[classifyQuestionQuality(q)]++;
  return tally;
}
