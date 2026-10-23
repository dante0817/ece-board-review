import {CANON_DEVICE_QA_CASES,type DeviceQaLedger,validateDeviceQaLedger} from './deviceQa';

/** Offline review handoff. This is untrusted observation evidence, NEVER a certification. */
export interface CanonQaEvidenceExport {
 format:'bsece-canon-device-observation-handoff'; version:1;
 generatedAt:string; modelId:'canon-f789sga'; status:'observer-supplied-unverified';
 totalCases:number; observations:DeviceQaLedger['observations'];
 outstandingCaseIds:string[];
 reviewRequirement:string;
}
export function buildCanonQaEvidenceExport(ledger:DeviceQaLedger,now:string):CanonQaEvidenceExport|null {
 if(!validateDeviceQaLedger(ledger)||typeof now!=='string'||Number.isNaN(Date.parse(now)))return null;
 const completed=new Set(ledger.observations.map(x=>x.techniqueId));
 return {
  format:'bsece-canon-device-observation-handoff',version:1,generatedAt:now,
  modelId:'canon-f789sga',status:'observer-supplied-unverified',
  totalCases:CANON_DEVICE_QA_CASES.length,
  observations:ledger.observations.map(x=>({...x})),
  outstandingCaseIds:CANON_DEVICE_QA_CASES.filter(x=>!completed.has(x.id)).map(x=>x.id),
  reviewRequirement:'External reviewer must inspect authentic hardware evidence and manual, verify all parameter variants, and explicitly authorize publication outside this worksheet. This file is not approval.',
 };
}
