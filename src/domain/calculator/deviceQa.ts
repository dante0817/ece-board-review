import {CANON_PILOT_TECHNIQUES} from './canonTechniques';
import {CANON_FAMILY_TECHNIQUES} from './familyTechniques';

/** Technician observations are NOT publication evidence or proof of device compatibility. */
export const CANON_DEVICE_QA_KEY='ece_canon_device_observations_v1';
export type DeviceObservationOutcome='observed-pass'|'observed-issue';
export interface DeviceObservation {
 techniqueId:string;
 techniqueVersion:1;
 modelId:'canon-f789sga';
 outcome:DeviceObservationOutcome;
 observedAt:string;
 observer:string;
 setup:string;
 display:string;
 notes:string;
}
export interface DeviceQaLedger {version:1;observations:DeviceObservation[]}
export const EMPTY_DEVICE_QA:DeviceQaLedger={version:1,observations:[]};
export interface DeviceQaCase {id:string;label:string;type:'pilot'|'family';version:1;mode:string;expected:string;warnings:string}
export const CANON_DEVICE_QA_CASES:readonly DeviceQaCase[]=[
 ...CANON_PILOT_TECHNIQUES.map(t=>({id:t.id,label:t.title,type:'pilot' as const,version:1 as const,mode:t.functionName,expected:t.expected,warnings:t.caution})),
 ...CANON_FAMILY_TECHNIQUES.map(t=>({id:t.id,label:t.familyId.replaceAll('-',' '),type:'family' as const,version:1 as const,mode:t.calculatorMode,expected:`Formula: ${t.formula}; use a specific authored numerical question and its keyed output.`,warnings:t.caution})),
];
const caseById=new Map(CANON_DEVICE_QA_CASES.map(c=>[c.id,c]));
const object=(raw:unknown):raw is Record<string,unknown>=>raw!==null&&typeof raw==='object'&&!Array.isArray(raw);
const str=(raw:unknown,max:number)=>typeof raw==='string'&&raw.length<=max;
export function validateDeviceObservation(raw:unknown):raw is DeviceObservation {
 if(!object(raw))return false;
 const c=typeof raw.techniqueId==='string'?caseById.get(raw.techniqueId):undefined;
 return !!c&&raw.techniqueVersion===c.version&&raw.modelId==='canon-f789sga'&&
  (raw.outcome==='observed-pass'||raw.outcome==='observed-issue')&&
  str(raw.observedAt,40)&&!Number.isNaN(Date.parse(raw.observedAt as string))&&
  str(raw.observer,80)&&(raw.observer as string).trim().length>0&&
  str(raw.setup,500)&&(raw.setup as string).trim().length>0&&
  str(raw.display,500)&&(raw.display as string).trim().length>0&&
  str(raw.notes,1200);
}
export function validateDeviceQaLedger(raw:unknown):raw is DeviceQaLedger {
 if(!object(raw)||raw.version!==1||!Array.isArray(raw.observations)||raw.observations.length>CANON_DEVICE_QA_CASES.length)return false;
 const used=new Set<string>();
 return raw.observations.every(entry=>{
  if(!validateDeviceObservation(entry)||used.has(entry.techniqueId))return false;
  used.add(entry.techniqueId);return true;
 });
}
/** Records an observation only; never mutates technique review stages or editorial publication states. */
export function recordDeviceObservation(ledger:DeviceQaLedger,observation:DeviceObservation):DeviceQaLedger|null {
 if(!validateDeviceQaLedger(ledger)||!validateDeviceObservation(observation))return null;
 const observations=[...ledger.observations.filter(x=>x.techniqueId!==observation.techniqueId),observation];
 const next:DeviceQaLedger={version:1,observations};
 return validateDeviceQaLedger(next)?next:null;
}
export function readDeviceQaLedger(store:Pick<Storage,'getItem'>):DeviceQaLedger {
 try{const raw=store.getItem(CANON_DEVICE_QA_KEY);if(!raw)return EMPTY_DEVICE_QA;
  const parsed:unknown=JSON.parse(raw);return validateDeviceQaLedger(parsed)?parsed:EMPTY_DEVICE_QA;
 }catch{return EMPTY_DEVICE_QA;}
}
export function removeDeviceObservation(ledger:DeviceQaLedger,id:string):DeviceQaLedger|null {
 if(!validateDeviceQaLedger(ledger)||!caseById.has(id))return null;
 return {version:1,observations:ledger.observations.filter(x=>x.techniqueId!==id)};
}
export function getDeviceQaCase(id:string):DeviceQaCase|undefined{return caseById.get(id)}
