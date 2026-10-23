import { MANUAL_LEARN_STORAGE_KEY, MAX_MANUAL_LEARN_BYTES, changeManualLearnRecord, emptyManualLearnStore,
  readManualLearnStore, validateManualLearnStore, type ManualLearnRecord } from '../../domain/learn/manualLearnTracking';
import type { LearningStatus, ProgressSnapshot } from './types';

/** Reuse the v10.35.1 manual store; no schema reset and no broad-topic auto-mastery. */
export const trigStatusFromManual=(r:ManualLearnRecord):LearningStatus=>({
  read1:r.reviewCount>=1,read2:r.reviewCount>=2,read3:r.reviewCount>=3,
  mastered:r.selfStatus==='mastered',review:r.needsReview,
});
export function readTrigManualProgress(ids:readonly string[]):ProgressSnapshot {
  if(typeof localStorage==='undefined')return {};
  const raw=localStorage.getItem(MANUAL_LEARN_STORAGE_KEY);
  if(raw!==null){
    if(raw.length>MAX_MANUAL_LEARN_BYTES)throw new Error('Existing learning tracking exceeds capacity');
    let value:unknown;
    try{value=JSON.parse(raw);}catch{throw new Error('Existing learning tracking is not valid JSON');}
    if(!validateManualLearnStore(value))throw new Error('Existing learning tracking is invalid');
  }
  const store=raw===null?emptyManualLearnStore():readManualLearnStore();
  return Object.fromEntries(ids.flatMap(id=>store.records[id]?[ [id,trigStatusFromManual(store.records[id])] ]:[]));
}
export function saveTrigManualProgress(id:string,next:LearningStatus):void {
  const ok=changeManualLearnRecord(id,prev=>({
    ...prev,
    reviewCount:next.read3?Math.max(prev.reviewCount,3):next.read2?2:next.read1?1:0,
    selfStatus:next.mastered?'mastered':prev.selfStatus==='mastered'?'unrated':prev.selfStatus,
    needsReview:next.review,
    // Preserve lastReviewedAt: checking milestones is not a dated study event.
  }));
  if(!ok)throw new Error('Could not save Trigonometry study progress');
}
