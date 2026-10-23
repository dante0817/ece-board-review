import {CALCULATOR_SIMULATOR_PREFS_KEY} from '../components/calculator/CalculatorProvider';
import {LINEAR_DAILY_CREDIT_KEY,validateLinearCredit} from '../domain/practice/linearDailyCredit';
import { PRACTICE_ENGINE_KEY, MAX_PRACTICE_BYTES, validatePracticeStore } from '../domain/practice/practiceStorage';
import { LEARN_READER_STORAGE_KEY, MAX_READER_BYTES, validateLearnReaderStore } from '../domain/learn/readerProgress';
import { MANUAL_LEARN_STORAGE_KEY, MAX_MANUAL_LEARN_BYTES, validateManualLearnStore } from '../domain/learn/manualLearnTracking';
import {AID_EVENTS_STORAGE_KEY,validateAidDisclosure} from '../domain/assessment/aidEvidence';
import {CALCULATOR_SKILLS_PROGRESS_KEY,validateCalculatorSkillsProgress} from '../domain/calculator/skillsProgress';
import {CANON_SPEED_DRILL_KEY,validateSpeedDrillHistory} from '../domain/calculator/speedDrills';
import {CANON_NUMERIC_DRILLS_KEY,validateNumericDrillHistory} from '../domain/calculator/numericDrills';
import {CANON_DEVICE_QA_KEY,validateDeviceQaLedger} from '../domain/calculator/deviceQa';
import { LEARNER_SCHEMA, LEGACY_BACKUP, DATA_MODE_KEY } from './learnerMigration';
import { validateAggregate } from './assessmentIntegrity';
import { LEARNING_PATH_KEY, isLearningPath } from '../domain/learning/learningPaths';

export interface StoreLike {length: number; key(index:number):string|null; getItem(key:string):string|null; setItem(key:string,value:string):void; removeItem(key:string):void}
export interface LearnerArchive {
  format:'BSECE-learner-backup';
  version:1;
  exportedAt:string;
  data:Record<string,string>;
}
const MANAGED_KEYS = new Set([
  'ece_board_review_subjects_v4','ece_board_review_tests_v3','ece_board_review_errors_v3',
  'ece_board_review_daily_v3','ece_board_review_daily_date_v1','ece_board_review_profile_v3',
  'ece_board_memorized_formulas_v1',LEARNER_SCHEMA,LEGACY_BACKUP,DATA_MODE_KEY,LEARNING_PATH_KEY,LEARN_READER_STORAGE_KEY,MANUAL_LEARN_STORAGE_KEY,PRACTICE_ENGINE_KEY,LINEAR_DAILY_CREDIT_KEY,AID_EVENTS_STORAGE_KEY,CALCULATOR_SKILLS_PROGRESS_KEY,CANON_SPEED_DRILL_KEY,CANON_DEVICE_QA_KEY,CANON_NUMERIC_DRILLS_KEY,CALCULATOR_SIMULATOR_PREFS_KEY,
]);
/** Restrict to known learner namespaces; never export API keys or arbitrary browser storage. */
const managed = (key:string) => MANAGED_KEYS.has(key) || key.startsWith('ece_reference_practice_evidence_v1:') ||
    /^ece_real_numbers_[a-z0-9_]+$/.test(key) || /^ece_concept_mastery_[a-z0-9_]+$/.test(key);
const objects = (value:unknown) => value !== null && typeof value === 'object' && !Array.isArray(value);
const getKeys = (store:StoreLike) => Array.from({length:store.length},(_,i)=>store.key(i)).filter((s):s is string=>s!==null && managed(s));
export function exportLearnerArchive(store:StoreLike,now=new Date().toISOString()):LearnerArchive {
  const data:Record<string,string> = {};
  for (const key of getKeys(store)) {
    const value=store.getItem(key);
    if(value===null)continue;
    if(key===LEARN_READER_STORAGE_KEY){
      let parsed:unknown;
      try{if(value.length>MAX_READER_BYTES)throw new Error('Too large');parsed=JSON.parse(value);}
      catch{throw new Error('Learn Reader progress is corrupted or too large; resolve it before exporting learner data.');}
      if(!validateLearnReaderStore(parsed))throw new Error('Learn Reader progress is invalid; resolve it before exporting learner data.');
    }
    if(key===MANUAL_LEARN_STORAGE_KEY){
      let tracking:unknown;
      try{if(value.length>MAX_MANUAL_LEARN_BYTES)throw new Error('Size');tracking=JSON.parse(value);}
      catch{throw new Error('Manual Learn tracking is corrupted or too large to export.');}
      if(!validateManualLearnStore(tracking))throw new Error('Manual Learn tracking is invalid.');
    }
    if(key===PRACTICE_ENGINE_KEY){
      let parsed:unknown;
      try{if(value.length>MAX_PRACTICE_BYTES)throw new Error('Size');parsed=JSON.parse(value);}
      catch{throw new Error('Practice Library history is corrupted or too large to export.');}
      if(!validatePracticeStore(parsed))throw new Error('Practice Library history is invalid.');
    }
    if(key===LINEAR_DAILY_CREDIT_KEY){
      let credit:unknown;
      try{credit=JSON.parse(value);}catch{throw new Error('Invalid Linear Equations daily credit data.');}
      if(!validateLinearCredit(credit))throw new Error('Invalid Linear Equations daily credit ledger.');
    }
    data[key]=value;
  }
  return {format:'BSECE-learner-backup',version:1,exportedAt:now,data};
}
export interface ImportPreview { keys:number; subjects:number; tests:number; errors:number; warning:string }
export function previewLearnerImport(value:unknown): {archive:LearnerArchive; preview:ImportPreview} {
  if (!objects(value)) throw new Error('Backup must be a JSON object.');
  const archive=value as unknown as LearnerArchive;
  if (archive.format!=='BSECE-learner-backup' || archive.version!==1 || !objects(archive.data)) throw new Error('Unsupported learner backup format or version.');
  if (Object.keys(archive.data).length>350 || JSON.stringify(archive).length>8_000_000) throw new Error('Backup exceeds safe size limits.');
  for (const [key,raw] of Object.entries(archive.data)) {
    if (!managed(key) || typeof raw!=='string' || raw.length>5_000_000) throw new Error(`Unsupported storage entry: ${key}`);
    if (key.includes('subjects_v4') || key.includes('tests_v3') || key.includes('errors_v3') || key.startsWith('ece_reference_practice_evidence_v1:')) JSON.parse(raw);
  }
  const parseArray=(key:string)=>{
    const raw=archive.data[key];if(raw===undefined)return [];
    const parsed:unknown=JSON.parse(raw);if(!Array.isArray(parsed))throw new Error(`Expected a list in ${key}`);return parsed;
  };
  if(archive.data[LEARN_READER_STORAGE_KEY]!==undefined){
    const raw=archive.data[LEARN_READER_STORAGE_KEY];
    let reader:unknown;
    try{if(raw.length>MAX_READER_BYTES)throw new Error('Size');reader=JSON.parse(raw);}catch{throw new Error('Invalid Learn Reader data JSON.');}
    if(!validateLearnReaderStore(reader))throw new Error('Invalid Learn Reader progress data.');
  }
  if(archive.data[MANUAL_LEARN_STORAGE_KEY]!==undefined){
    const raw=archive.data[MANUAL_LEARN_STORAGE_KEY];let tracking:unknown;
    try{if(raw.length>MAX_MANUAL_LEARN_BYTES)throw new Error('Size');tracking=JSON.parse(raw);}
    catch{throw new Error('Invalid Manual Learn tracking JSON.');}
    if(!validateManualLearnStore(tracking))throw new Error('Invalid Manual Learn tracking.');
  }
  if(archive.data[PRACTICE_ENGINE_KEY]!==undefined){
    const raw=archive.data[PRACTICE_ENGINE_KEY];let practice:unknown;
    try{if(raw.length>MAX_PRACTICE_BYTES)throw new Error('Size');practice=JSON.parse(raw);}
    catch{throw new Error('Invalid Practice Library history JSON.');}
    if(!validatePracticeStore(practice))throw new Error('Invalid Practice Library history.');
  }
  if(archive.data[LINEAR_DAILY_CREDIT_KEY]!==undefined){
    let credit:unknown;
    try{credit=JSON.parse(archive.data[LINEAR_DAILY_CREDIT_KEY]);}catch{throw new Error('Invalid Linear Equations credit JSON.');}
    if(!validateLinearCredit(credit))throw new Error('Invalid Linear Equations daily credit ledger.');
  }
  if (archive.data[LEARNING_PATH_KEY] !== undefined && !isLearningPath(archive.data[LEARNING_PATH_KEY])) throw new Error('Invalid learning-path preference.');
  if(archive.data[CALCULATOR_SIMULATOR_PREFS_KEY]!==undefined){
    let settings:unknown;
    try{settings=JSON.parse(archive.data[CALCULATOR_SIMULATOR_PREFS_KEY]);}catch{throw new Error('Invalid calculator simulator preference JSON.');}
    if(!objects(settings)||!['DEG','RAD','GRAD'].includes((settings as {angle?:string}).angle||''))throw new Error('Invalid calculator simulator angle preference.');
  }
  if(archive.data[CALCULATOR_SKILLS_PROGRESS_KEY]!==undefined){
    let skills:unknown;
    try{skills=JSON.parse(archive.data[CALCULATOR_SKILLS_PROGRESS_KEY]);}catch{throw new Error('Invalid calculator-skills progress JSON.');}
    if(!validateCalculatorSkillsProgress(skills))throw new Error('Invalid calculator-skills progress.');
  }
  if(archive.data[CANON_SPEED_DRILL_KEY]!==undefined){
    let drills:unknown;
    try{drills=JSON.parse(archive.data[CANON_SPEED_DRILL_KEY]);}catch{throw new Error('Invalid Canon speed-drill JSON.');}
    if(!validateSpeedDrillHistory(drills))throw new Error('Invalid Canon speed-drill history.');
  }
  if(archive.data[CANON_NUMERIC_DRILLS_KEY]!==undefined){
    let numeric:unknown;
    try{numeric=JSON.parse(archive.data[CANON_NUMERIC_DRILLS_KEY]);}catch{throw new Error('Invalid Canon numerical-drill JSON.');}
    if(!validateNumericDrillHistory(numeric))throw new Error('Invalid Canon numerical-drill history.');
  }
  if(archive.data[CANON_DEVICE_QA_KEY]!==undefined){
    let deviceQa:unknown;
    try{deviceQa=JSON.parse(archive.data[CANON_DEVICE_QA_KEY]);}catch{throw new Error('Invalid Canon device-QA JSON.');}
    if(!validateDeviceQaLedger(deviceQa))throw new Error('Invalid Canon device-QA observations.');
  }
  const aidEvents=parseArray(AID_EVENTS_STORAGE_KEY);
  if(aidEvents.length>5000 || aidEvents.some(event=>!validateAidDisclosure(event)))throw new Error('Invalid calculator/aid disclosure history.');
  const subjects=parseArray('ece_board_review_subjects_v4');
  if(subjects.some(s=>!objects(s)||typeof s.id!=='string'||!Array.isArray(s.groups)||
    s.groups.some((g: any)=>!objects(g)||typeof g.id!=='string'||!Array.isArray(g.topics)||
      g.topics.some((t: any)=>!objects(t)||typeof t.id!=='string'||typeof t.name!=='string'||
        (t.activityHistory!==undefined && (!Array.isArray(t.activityHistory)||t.activityHistory.some((a: any)=>
          !objects(a)||!Number.isFinite(a.score)||a.score<0||a.score>100)))))))
    throw new Error('Invalid subject structure: groups, topics or activity records are malformed.');
  const tests=parseArray('ece_board_review_tests_v3');
  if(tests.some(t=>!objects(t)||typeof t.id!=='string'||typeof t.subjectId!=='string'||
    !validateAggregate(t as Parameters<typeof validateAggregate>[0]) ||
    (t.itemResults!==undefined && (!Array.isArray(t.itemResults)||t.itemResults.length!==t.questions))))
    throw new Error('Invalid test records: counts or item data do not match.');
  const errors=parseArray('ece_board_review_errors_v3');
  if(errors.some(e=>!objects(e)||typeof e.id!=='string'))throw new Error('Invalid error records.');
  // Old schema/provenance must NOT accidentally receive a v10.10 verified status.
  for(const test of tests) {
    if (test.provenance==='automatic' && test.itemResults) {
      if (test.itemResults.some((item:unknown)=>!objects(item)||typeof (item as {questionId?:unknown}).questionId!=='string'||typeof (item as {correctOptionId?:unknown}).correctOptionId!=='string'))
        throw new Error('Invalid question evidence.');
    }
  }
  return {archive,preview:{keys:Object.keys(archive.data).length,subjects:subjects.length,tests:tests.length,errors:errors.length,
    warning:'Restoring replaces current learner storage, including Manual Learn statuses, Learn Reader and Practice Library bookmarks and progress. Export existing data first. Older app versions cannot import this newer reader namespace. The application reloads after restoration.'}};
}
export function restoreLearnerArchive(store:StoreLike,archive:LearnerArchive):void {
  previewLearnerImport(archive); // fully validate before touching storage
  const before:Record<string,string|null>={};
  const affected=new Set([...getKeys(store),...Object.keys(archive.data)]);
  for (const key of affected) before[key]=store.getItem(key);
  try {
    // Non-destructive recovery snapshot in local storage, retained until user exports/deletes it.
    const recoveryKey='ece_board_v1010_pre_restore_backup';
    // Only create recovery snapshot AFTER we know it fits. Never overwrite a prior recovery snapshot.
    if(store.getItem(recoveryKey)===null)store.setItem(recoveryKey,JSON.stringify(exportLearnerArchive(store)));
    for(const key of affected) if(!(key in archive.data)) store.removeItem(key);
    for(const [key,raw] of Object.entries(archive.data))store.setItem(key,raw);
    // 10.10 schema marker bypasses v10.8 legacy migration on reload.
    store.setItem(LEARNER_SCHEMA,'10.10');
  } catch(error) {
    for(const [key,previous] of Object.entries(before)){
      try {if(previous===null)store.removeItem(key);else store.setItem(key,previous);} catch{/* quota/storage may still be unavailable; original recovery remains */}
    }
    throw error;
  }
}
