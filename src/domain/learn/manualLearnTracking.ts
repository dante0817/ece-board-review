/** Self-reported study progress only. Never alters scored mastery or spaced review. */
export const MANUAL_LEARN_STORAGE_KEY = 'ece_manual_learn_tracking_v1';
export const MAX_MANUAL_LEARN_BYTES = 320_000;
export const MANUAL_LEARN_CHANGED_EVENT = 'ece:manual-learn-changed';
export type ManualLearnStatus = 'unrated' | 'studying' | 'understood' | 'mastered';
export interface ManualLearnRecord {
  reviewCount: number;
  selfStatus: ManualLearnStatus;
  needsReview: boolean;
  lastReviewedAt: string | null;
  updatedAt: string;
}
export interface ManualLearnStore {
  schemaVersion: 1;
  records: Record<string,ManualLearnRecord>;
}
const TRACKING_ID = /^(?:alg-[a-z0-9-]{1,100}|chapter-top-[a-z0-9-]{1,100}|trig-[a-z0-9-]{1,160}|geo-(?:solid|plane|analytic)-[0-9]{3}(?:--unit-geo-[0-9]{3}-[a-z0-9-]{1,70})?)$/;
const STATUS:readonly ManualLearnStatus[] = ['unrated','studying','understood','mastered'];
const isObject = (value:unknown):value is Record<string,unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const validDate = (value:unknown) => typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));
export const isManualTrackingId = (id:string) => TRACKING_ID.test(id);
export const moduleTrackingId = (catalogModuleId:string) => {
  if(!catalogModuleId.startsWith('alg-') || !isManualTrackingId(catalogModuleId)) throw new Error('Invalid Algebra catalog module ID');
  return catalogModuleId;
};
export const chapterTrackingId = (canonicalTopicId:string) => {
  const id=`chapter-${canonicalTopicId}`;
  if(!isManualTrackingId(id)) throw new Error('Invalid Learn chapter ID');
  return id;
};
/** Distinct status for each lesson card, scoped to the opened Algebra module or chapter.
 * Existing v10.35.0 module-level records remain intact and visible in the catalog.
 */
export function lessonCardTrackingId(parentId:string,cardId:string):string {
  // Geometry uses canonical GEO-### section IDs; lowercase their suffix only.
  // Algebra and Trigonometry IDs retain their existing representation.
  const normalizedCardId=/^geo-(?:plane|solid|analytic)-[0-9]{3}$/.test(parentId)?cardId.toLowerCase():cardId;
  if(!isManualTrackingId(parentId) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedCardId)) throw new Error('Invalid lesson card identity');
  const id=`${parentId}--unit-${normalizedCardId}`;
  if(!isManualTrackingId(id)) throw new Error('Lesson card identity too long');
  return id;
}
/** Catalog roll-up reflects individual cards, without treating them as exam mastery. */
export function getManualLearnCardSummary(store:ManualLearnStore,parentId:string){
  const parent=getManualLearnRecord(store,parentId);
  const children=Object.entries(store.records).filter(([id])=>id.startsWith(`${parentId}--unit-`)).map(([,record])=>record);
  return {
    parent,
    trackedCards:children.length,
    reviewedCards:children.filter(record=>record.reviewCount>0).length,
    selfMasteredCards:children.filter(record=>record.selfStatus==='mastered').length,
    flaggedCards:children.filter(record=>record.needsReview).length,
    hasReviewFlag:parent.needsReview||children.some(record=>record.needsReview),
    hasSelfMastered:parent.selfStatus==='mastered'||children.some(record=>record.selfStatus==='mastered'),
  };
}
export const emptyManualLearnStore = ():ManualLearnStore => ({schemaVersion:1, records:{}});
export const emptyManualLearnRecord = ():ManualLearnRecord => ({reviewCount:0,selfStatus:'unrated',needsReview:false,lastReviewedAt:null,updatedAt:new Date(0).toISOString()});
export function validateManualLearnStore(value:unknown):value is ManualLearnStore {
  if(!isObject(value) || value.schemaVersion!==1 || !isObject(value.records))return false;
  const entries=Object.entries(value.records);
  if(entries.length>1200)return false;
  return entries.every(([id,record])=>isManualTrackingId(id) && isObject(record) &&
    Number.isInteger(record.reviewCount) && (record.reviewCount as number)>=0 && (record.reviewCount as number)<=999 &&
    STATUS.includes(record.selfStatus as ManualLearnStatus) && typeof record.needsReview==='boolean' &&
    (record.lastReviewedAt===null || validDate(record.lastReviewedAt)) && validDate(record.updatedAt));
}
export function parseManualLearnStore(raw:string|null):ManualLearnStore {
  if(!raw || raw.length>MAX_MANUAL_LEARN_BYTES)return emptyManualLearnStore();
  try {const parsed:unknown=JSON.parse(raw);return validateManualLearnStore(parsed)?parsed:emptyManualLearnStore();}
  catch{return emptyManualLearnStore();}
}
export function readManualLearnStore():ManualLearnStore {
  try {return typeof localStorage==='undefined'?emptyManualLearnStore():parseManualLearnStore(localStorage.getItem(MANUAL_LEARN_STORAGE_KEY));}
  catch{return emptyManualLearnStore();}
}
export function getManualLearnRecord(store:ManualLearnStore,id:string):ManualLearnRecord {
  return store.records[id] ?? emptyManualLearnRecord();
}
export function saveManualLearnStore(store:ManualLearnStore):boolean {
  try {
    const raw=JSON.stringify(store);
    if(typeof localStorage==='undefined'||raw.length>MAX_MANUAL_LEARN_BYTES||!validateManualLearnStore(store))return false;
    localStorage.setItem(MANUAL_LEARN_STORAGE_KEY,raw);
    if(typeof window!=='undefined')window.dispatchEvent(new Event(MANUAL_LEARN_CHANGED_EVENT));
    return true;
  }catch{return false;}
}
/** Always read current storage before modifying; do not write a stale component snapshot. */
export function changeManualLearnRecord(id:string,makeNext:(previous:ManualLearnRecord)=>ManualLearnRecord):boolean {
  if(!isManualTrackingId(id))return false;
  // Corrupt, oversized or future-version storage must not be silently overwritten.
  try {
    if(typeof localStorage==='undefined')return false;
    const raw=localStorage.getItem(MANUAL_LEARN_STORAGE_KEY);
    if(raw!==null){if(raw.length>MAX_MANUAL_LEARN_BYTES)return false;let parsed:unknown;try{parsed=JSON.parse(raw);}catch{return false;}if(!validateManualLearnStore(parsed))return false;}
  }catch{return false;}
  const existing=readManualLearnStore();
  const previous=getManualLearnRecord(existing,id);
  const record={...makeNext({...previous}),updatedAt:new Date().toISOString()};
  return saveManualLearnStore({...existing, records:{...existing.records,[id]:record}});
}
export function markManualReviewed(id:string, now=new Date().toISOString()):boolean {
  if(!validDate(now))return false;
  if(getManualLearnRecord(readManualLearnStore(),id).reviewCount>=999)return false;
  return changeManualLearnRecord(id,prev=>({...prev,reviewCount:Math.min(999,prev.reviewCount+1),lastReviewedAt:now}));
}
/** Exact-count corrections are not study events. Keep the original last-reviewed timestamp. */
export function correctManualReviewCount(id:string,count:number):boolean {
  if(!Number.isInteger(count) || count<0 || count>999)return false;
  return changeManualLearnRecord(id,prev=>({...prev,reviewCount:count}));
}
/** Set cumulative Read 1×/2×/3× milestones without creating a dated review event.
 * Checking a level checks all earlier levels; clearing it also clears later levels.
 * This modifies only the self-reported manual count, not graded mastery.
 */
export function setManualReadMilestone(id:string,level:1|2|3,checked:boolean):boolean {
  if(!Number.isInteger(level)||level<1||level>3||typeof checked!=='boolean')return false;
  return changeManualLearnRecord(id,previous=>({
    ...previous,
    reviewCount:checked?Math.max(previous.reviewCount,level):Math.min(previous.reviewCount,level-1),
  }));
}
export function setManualLearnStatus(id:string,selfStatus:ManualLearnStatus):boolean {
  if(!STATUS.includes(selfStatus))return false;
  return changeManualLearnRecord(id,prev=>({...prev,selfStatus}));
}
export function setManualNeedsReview(id:string,needsReview:boolean):boolean {
  return changeManualLearnRecord(id,prev=>({...prev,needsReview}));
}
