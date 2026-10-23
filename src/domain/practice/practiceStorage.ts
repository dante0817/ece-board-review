/** Browser-local learning-only evidence. No updates to verified tests or board-readiness. */
export const PRACTICE_ENGINE_KEY='ece_practice_engine_v1';
export const MAX_PRACTICE_BYTES=2_200_000;
export type PracticeMode='guided'|'independent'|'timed';
export interface Attempt {
  questionKey:string;
  revision:string;
  chosenOptionId:string;
  correct:boolean;
  at:string;
  assisted:boolean;
  sessionId:string;
}
export interface SavedSession {
  id:string;
  keys:string[];
  revisions:Record<string,string>;
  mode:PracticeMode;
  createdAt:string;
  answers:Record<string,string>;
  drafts:Record<string,string>;
  /** Only used for timed learning drills, NOT the protected mock examination. */
  deadlineAt?:string;
  durationSeconds?:number;
  endedAt?:string;
  /** Persist hint use, so a refreshed Guided question is still marked assisted. */
  assistedKeys?:string[];
}
export interface PracticeStore {
  version:1;
  firstAttempts:Record<string,Attempt>;
  sessions:SavedSession[];
  bookmarks:string[];
  activeSessionId:string|null;
}
export const emptyPracticeStore=():PracticeStore=>({version:1,firstAttempts:{},sessions:[],bookmarks:[],activeSessionId:null});
const isObject=(x:unknown):x is Record<string,unknown>=>!!x && typeof x==='object'&&!Array.isArray(x);
const short=(x:unknown,max=250):x is string=>typeof x==='string'&&x.length>0&&x.length<=max;
const validDate=(x:unknown)=>short(x,64)&&Number.isFinite(Date.parse(x));
export function validatePracticeStore(x:unknown):x is PracticeStore {
  if(!isObject(x)||x.version!==1||!isObject(x.firstAttempts)||!Array.isArray(x.sessions)||!Array.isArray(x.bookmarks)||
    !(x.activeSessionId===null||short(x.activeSessionId)))return false;
  if(x.activeSessionId!==null&&!x.sessions.some(s=>isObject(s)&&s.id===x.activeSessionId))return false;
  if(Object.keys(x.firstAttempts).length>6000||x.sessions.length>20||x.bookmarks.length>1000)return false;
  if(new Set(x.bookmarks).size!==x.bookmarks.length||x.bookmarks.some(b=>!short(b)))return false;
  if(Object.entries(x.firstAttempts).some(([key,v])=>!short(key)||!isObject(v)||v.questionKey!==key||
    !short(v.revision)||!short(v.chosenOptionId)||typeof v.correct!=='boolean'||typeof v.assisted!=='boolean'||
    !short(v.sessionId)||!validDate(v.at)))return false;
  if(new Set(x.sessions.map((s:unknown)=>isObject(s)?s.id:null)).size!==x.sessions.length)return false;
  return !x.sessions.some(s=>{
    if(!isObject(s)||!short(s.id)||!['guided','independent','timed'].includes(s.mode as string)||!validDate(s.createdAt)||
      !Array.isArray(s.keys)||s.keys.length===0||s.keys.length>100||!isObject(s.revisions)||!isObject(s.answers)||!isObject(s.drafts))return true;
    const keys=s.keys as unknown[];
    const revisions=s.revisions as Record<string,unknown>;
    const answers=s.answers as Record<string,unknown>;
    const drafts=s.drafts as Record<string,unknown>;
    if(new Set(keys).size!==keys.length||keys.some(k=>!short(k)))return true;
    if(Object.keys(revisions).some(k=>!keys.includes(k)||!short(revisions[k]))||
      Object.keys(answers).some(k=>!keys.includes(k)||!short(answers[k]))||
      Object.keys(drafts).some(k=>!keys.includes(k)||!short(drafts[k]))||
      keys.some(k=>!short(revisions[k as string])))return true;
    if(s.endedAt!==undefined && !validDate(s.endedAt))return true;
    if(s.assistedKeys!==undefined && (!Array.isArray(s.assistedKeys)||new Set(s.assistedKeys).size!==s.assistedKeys.length||
      s.assistedKeys.some((k:unknown)=>!short(k)||!keys.includes(k))))return true;
    if(s.mode==='timed'){
      if(!Number.isInteger(s.durationSeconds)||(s.durationSeconds as number)<60||(s.durationSeconds as number)>7200||
        !validDate(s.deadlineAt))return true;
      const expected=Date.parse(s.createdAt as string)+(s.durationSeconds as number)*1000;
      if(Math.abs(Date.parse(s.deadlineAt as string)-expected)>1000)return true;
    }else if(s.durationSeconds!==undefined||s.deadlineAt!==undefined)return true;
    return false;
  });
}
export function loadPracticeStore(storage?:Pick<Storage,'getItem'>):PracticeStore {
  try {
    const target=storage??(typeof window!=='undefined'?window.localStorage:undefined);
    const raw=target?.getItem(PRACTICE_ENGINE_KEY);
    if(!raw)return emptyPracticeStore();
    if(raw.length>MAX_PRACTICE_BYTES)throw new Error('Practice history exceeds safe storage limits');
    const parsed:unknown=JSON.parse(raw);
    if(!validatePracticeStore(parsed))throw new Error('Practice history format is invalid');
    return parsed;
  } catch {return emptyPracticeStore();}
}
export function savePracticeStore(storage:Pick<Storage,'setItem'|'getItem'>,store:PracticeStore):void {
  if(!validatePracticeStore(store))throw new Error('Practice history validation failed');
  const json=JSON.stringify(store);
  if(json.length>MAX_PRACTICE_BYTES)throw new Error('Practice history has reached its storage limit');
  const previous=storage.getItem(PRACTICE_ENGINE_KEY);
  if(previous!==null && previous!==undefined){
    let existing:unknown;
    try {existing=JSON.parse(previous);}catch{throw new Error('Existing practice data is corrupted. Export/recover it before saving.');}
    if(previous.length>MAX_PRACTICE_BYTES || !validatePracticeStore(existing))
      throw new Error('Existing practice data is invalid. Recover or reset it explicitly before saving.');
  }
  storage.setItem(PRACTICE_ENGINE_KEY,json);
}
/** First-attempt statistic is keyed by stable question ID, including across practice modes. */
export function acceptPracticeAnswer(store:PracticeStore,answer:Attempt):{store:PracticeStore;accepted:boolean} {
  if(!short(answer.questionKey)||!short(answer.revision)||!short(answer.chosenOptionId)||
     !short(answer.sessionId)||!validDate(answer.at)||typeof answer.correct!=='boolean'||
     typeof answer.assisted!=='boolean')throw new Error('Invalid practice answer');
  if(store.firstAttempts[answer.questionKey])return {store,accepted:false};
  const updated:PracticeStore={...store,firstAttempts:{...store.firstAttempts,[answer.questionKey]:answer}};
  if(!validatePracticeStore(updated))throw new Error('Too many saved attempts; export your records');
  return {store:updated,accepted:true};
}
export function createPracticeSession(store:PracticeStore,items:{key:string;revision:string}[],id:string,now:string,
  mode:PracticeMode='guided',durationSeconds=600):PracticeStore {
  if(!items.length||items.length>100||new Set(items.map(x=>x.key)).size!==items.length)throw new Error('Select 1–100 distinct available questions.');
  if(!validDate(now)||!short(id))throw new Error('Invalid session identity or start time');
  if(mode==='timed'&&(!Number.isInteger(durationSeconds)||durationSeconds<60||durationSeconds>7200))throw new Error('Invalid drill duration');
  const session:SavedSession={id,createdAt:now,mode,keys:items.map(x=>x.key),
    revisions:Object.fromEntries(items.map(x=>[x.key,x.revision])),answers:{},drafts:{},assistedKeys:[],
    ...(mode==='timed'?{durationSeconds,deadlineAt:new Date(Date.parse(now)+durationSeconds*1000).toISOString()}:{})};
  return {...store,sessions:[...store.sessions.slice(-9),session],activeSessionId:id};
}
export const isPracticeExpired=(session:SavedSession,now:number)=>
  session.mode==='timed'&&!!session.deadlineAt&&now>=Date.parse(session.deadlineAt);
/** Immutable, idempotent finalization; unanswered items remain unanswered and score as 0. */
export function endPracticeSession(store:PracticeStore,id:string,now:string):PracticeStore {
  if(!validDate(now))throw new Error('Invalid completion time');
  return {...store,sessions:store.sessions.map(s=>s.id===id && !s.endedAt?{...s,endedAt:now}:s)};
}
/** Pure submission guard: refuses ended/expired sessions and repeat submissions. */
export function recordSessionAnswer(store:PracticeStore,id:string,key:string,optionId:string,
  expectedOptionId:string,revision:string,now:string):{store:PracticeStore;accepted:boolean} {
  const session=store.sessions.find(s=>s.id===id);
  if(!session||session.endedAt||isPracticeExpired(session,Date.parse(now))||!session.keys.includes(key)||
     session.revisions[key]!==revision||session.answers[key]!==undefined||!short(optionId))return {store,accepted:false};
  const attempt:Attempt={questionKey:key,revision,chosenOptionId:optionId,correct:optionId===expectedOptionId,
    at:now,assisted:session.mode==='guided',sessionId:id};
  const first=acceptPracticeAnswer(store,attempt);
  return {accepted:true,store:{...first.store,sessions:first.store.sessions.map(s=>s.id===id?{
    ...s,answers:{...s.answers,[key]:optionId},drafts:{...s.drafts,[key]:optionId}}:s)}};
}
