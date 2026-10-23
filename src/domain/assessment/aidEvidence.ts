import type { StoreLike } from '../../utils/learnerBackup';
export const AID_EVENTS_STORAGE_KEY='ece_assessment_aid_events_v1018';
export interface AidDisclosureEvent {
  eventId:string; attemptId:string; questionId:string; aid:'calculator'|'formula'|'tutor';
  techniqueId?:string; techniqueVersion?:number; revealedAt:string;
  phase:'before-answer'|'after-answer'; assessmentMode:'study'|'strict'|'unscored';
}
export function validateAidDisclosure(value:unknown):value is AidDisclosureEvent {
 if(!value || typeof value!=='object') return false;
 const e=value as Partial<AidDisclosureEvent>;
 return typeof e.eventId==='string' && e.eventId.length>0 && typeof e.attemptId==='string' &&
 typeof e.questionId==='string' && typeof e.revealedAt==='string' &&
 (e.aid==='calculator'||e.aid==='formula'||e.aid==='tutor') &&
 (e.phase==='before-answer'||e.phase==='after-answer') &&
 (e.assessmentMode==='study'||e.assessmentMode==='strict'||e.assessmentMode==='unscored') &&
 (e.techniqueVersion===undefined||(Number.isSafeInteger(e.techniqueVersion)&&e.techniqueVersion>0));
}
export function appendAidEvent(store:StoreLike,event:AidDisclosureEvent):void {
 if(!validateAidDisclosure(event)) throw new Error('Invalid assistance event');
 const raw=store.getItem(AID_EVENTS_STORAGE_KEY);
 const parsed:unknown=raw?JSON.parse(raw):[];
 if(!Array.isArray(parsed)||parsed.some(item=>!validateAidDisclosure(item)))throw new Error('Invalid stored assistance events');
 if(parsed.some(item=>item.eventId===event.eventId))return;
 const next=[...parsed,event];
 if(next.length>5000) next.splice(0,next.length-5000);
 store.setItem(AID_EVENTS_STORAGE_KEY,JSON.stringify(next));
}
