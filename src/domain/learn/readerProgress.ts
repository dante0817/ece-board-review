import { LearnLesson } from './lessonTypes';

export const LEARN_READER_STORAGE_KEY='ece_learn_reader_v1';
export const MAX_READER_BYTES=256_000;
export interface TopicReaderProgress {
  lastSectionId:string;
  completedSectionIds:string[];
  bookmarkedSectionIds:string[];
  contentVersion:number;
  updatedAt:string;
}
export interface LearnReaderStore {
  schemaVersion:1;
  fontSize:'normal'|'large';
  topics:Record<string,TopicReaderProgress>;
}
const ID=/^[a-z0-9][a-z0-9-]{0,79}$/;
const isObj=(v:unknown):v is Record<string,unknown>=>v!==null && typeof v==='object' && !Array.isArray(v);
const idsValid=(v:unknown)=>Array.isArray(v) && v.length<=150 && v.every(x=>typeof x==='string' && ID.test(x)) && new Set(v).size===v.length;
export function emptyReaderStore():LearnReaderStore {return {schemaVersion:1,fontSize:'normal',topics:{}};}
export function validateLearnReaderStore(value:unknown):value is LearnReaderStore {
  if (!isObj(value) || value.schemaVersion!==1 || (value.fontSize!=='normal'&&value.fontSize!=='large') || !isObj(value.topics)) return false;
  const entries=Object.entries(value.topics);
  if(entries.length>320)return false;
  return entries.every(([key,v])=>ID.test(key) && isObj(v) &&
    typeof v.lastSectionId==='string' && ID.test(v.lastSectionId) &&
    idsValid(v.completedSectionIds) && idsValid(v.bookmarkedSectionIds) &&
    Number.isInteger(v.contentVersion) && typeof v.contentVersion==='number' && v.contentVersion>=1 && v.contentVersion<=10000 &&
    typeof v.updatedAt==='string' && v.updatedAt.length<=40 && !Number.isNaN(Date.parse(v.updatedAt)));
}
export function parseReaderStore(raw:string|null):LearnReaderStore {
  if(!raw || raw.length>MAX_READER_BYTES)return emptyReaderStore();
  try {const value:unknown=JSON.parse(raw);return validateLearnReaderStore(value)?value:emptyReaderStore();}catch{return emptyReaderStore();}
}
export function readReaderStore():LearnReaderStore {
  try{return typeof localStorage!=='undefined'?parseReaderStore(localStorage.getItem(LEARN_READER_STORAGE_KEY)):emptyReaderStore();}catch{return emptyReaderStore();}
}
export function saveReaderStore(next:LearnReaderStore):boolean {
  try {
    const raw=JSON.stringify(next);
    if(raw.length>MAX_READER_BYTES||!validateLearnReaderStore(next) || typeof localStorage==='undefined')return false;
    localStorage.setItem(LEARN_READER_STORAGE_KEY,raw);
    return true;
  }catch{return false;}
}
export function resolveReaderProgress(lesson:LearnLesson,store:LearnReaderStore):TopicReaderProgress {
  const existing=store.topics[lesson.id];
  const validIds=new Set(lesson.sections.map(s=>s.id));
  const initial=lesson.sections[0]?.id || 'overview';
  return {
    lastSectionId:existing && validIds.has(existing.lastSectionId)?existing.lastSectionId:initial,
    completedSectionIds:existing?.completedSectionIds.filter(id=>validIds.has(id))||[],
    bookmarkedSectionIds:existing?.bookmarkedSectionIds.filter(id=>validIds.has(id))||[],
    contentVersion:lesson.contentVersion,
    updatedAt:existing?.updatedAt||new Date(0).toISOString(),
  };
}
export function updateReaderTopic(lesson:LearnLesson, store:LearnReaderStore,patch:Partial<Pick<TopicReaderProgress,'lastSectionId'|'completedSectionIds'|'bookmarkedSectionIds'>>):LearnReaderStore {
  const topic={...resolveReaderProgress(lesson,store),...patch,contentVersion:lesson.contentVersion,updatedAt:new Date().toISOString()};
  const next={...store,topics:{...store.topics,[lesson.id]:topic}};
  return validateLearnReaderStore(next)?next:store;
}
