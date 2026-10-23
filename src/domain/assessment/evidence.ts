import type { TestRecord } from '../../types';
export type EvidenceClass = 'legacy-unverified' | 'manual-reported' | 'study-assisted' | 'study-practice' | 'strict-self-attested';
export function classifyEvidence(record: TestRecord): EvidenceClass {
  if (!record.provenance || record.provenance === 'legacy') return 'legacy-unverified';
  if (record.provenance === 'manual') return 'manual-reported';
  if (record.assessmentMode === 'strict' && record.assistanceUsed === false && record.pausedSeconds === 0 &&
      record.selfAttested === true && record.itemResults?.length === record.questions) return 'strict-self-attested';
  if (record.assistanceUsed || (record.pausedSeconds ?? 0) > 0) return 'study-assisted';
  return 'study-practice';
}
export function independentItemCount(records: readonly TestRecord[], topicId: string): number {
  return records.filter(r => classifyEvidence(r) === 'strict-self-attested').flatMap(r => r.itemResults ?? []).filter(i => i.topicId === topicId).length;
}
