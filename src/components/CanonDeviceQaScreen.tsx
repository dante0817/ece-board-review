import React,{useState} from 'react';
import {AlertTriangle,ClipboardCheck,ExternalLink} from 'lucide-react';
import {useReview} from '../context/ReviewContext';
import {strictAssessmentLocked} from '../domain/assessment/assessmentAccess';
import {CANON_MANUAL_URL,CANON_PILOT_TECHNIQUES} from '../domain/calculator/canonTechniques';
import {CANON_FAMILY_TECHNIQUES,resolveFamilyTechnique} from '../domain/calculator/familyTechniques';
import {MOCK_EXAM_QUESTIONS} from '../data/mockExamQuestions';
import {buildCanonQaEvidenceExport} from '../domain/calculator/deviceEvidence';
import {CANON_DEVICE_QA_CASES,CANON_DEVICE_QA_KEY,readDeviceQaLedger,recordDeviceObservation,removeDeviceObservation,type DeviceQaLedger,type DeviceObservationOutcome} from '../domain/calculator/deviceQa';
const load=():DeviceQaLedger=>{
 try{return typeof window==='undefined'?{version:1,observations:[]}:readDeviceQaLedger(window.localStorage)}
 catch{return {version:1,observations:[]}}
};
/** Observational worksheet: does NOT approve or publish methods. Requires real device + competent reviewer. */
export function CanonDeviceQaScreen(){
 const {assessmentSession}=useReview();
 const [ledger,setLedger]=useState<DeviceQaLedger>(load);
 const [caseId,setCaseId]=useState(CANON_DEVICE_QA_CASES[0].id);
 const [observer,setObserver]=useState('');
 const [setup,setSetup]=useState('');
 const [display,setDisplay]=useState('');
 const [notes,setNotes]=useState('');
 const [outcome,setOutcome]=useState<DeviceObservationOutcome>('observed-issue');
 const [message,setMessage]=useState('');
 const selected=CANON_DEVICE_QA_CASES.find(c=>c.id===caseId)!;
 const pilot=CANON_PILOT_TECHNIQUES.find(c=>c.id===selected.id);
 const familySpec=CANON_FAMILY_TECHNIQUES.find(c=>c.id===selected.id);
 const example=familySpec?MOCK_EXAM_QUESTIONS.find(q=>q.questionFamilyId===familySpec.familyId):undefined;
 const boundExample=example?resolveFamilyTechnique(example):null;
 const family=boundExample?.kind==='available'?boundExample.technique:null;
 const recorded=ledger.observations.find(x=>x.techniqueId===caseId);
 const changeCase=(id:string)=>{
  setCaseId(id);setMessage('');
  const existing=ledger.observations.find(x=>x.techniqueId===id);
  setObserver(existing?.observer??'');setSetup(existing?.setup??'');setDisplay(existing?.display??'');setNotes(existing?.notes??'');setOutcome(existing?.outcome??'observed-issue');
 };
 const save=()=>{
  if(strictAssessmentLocked(assessmentSession))return;
  const next=recordDeviceObservation(ledger,{techniqueId:caseId,techniqueVersion:1,modelId:'canon-f789sga',outcome,observedAt:new Date().toISOString(),observer,setup,display,notes});
  if(!next){setMessage('Missing or invalid values. Provide observer, initial device setup and actual LCD observation.');return;}
  try{window.localStorage.setItem(CANON_DEVICE_QA_KEY,JSON.stringify(next));setLedger(next);setMessage('Observation saved locally. This does NOT certify the technique.');}
  catch{setMessage('Storage unavailable. Observation was not saved; check browser storage settings.');}
 };
 const exportForExternalReview=()=>{
  if(strictAssessmentLocked(assessmentSession))return;
  const report=buildCanonQaEvidenceExport(ledger,new Date().toISOString());
  if(!report){setMessage('Cannot export an invalid QA ledger.');return;}
  try{
   const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
   const anchor=document.createElement('a');anchor.href=url;anchor.download='canon-f789sga-observations-UNVERIFIED.json';
   document.body.appendChild(anchor);anchor.click();anchor.remove();
   window.setTimeout(()=>URL.revokeObjectURL(url),30000);
   setMessage('Unverified observation file exported. A separate qualified reviewer must inspect real device evidence.');
  }catch{setMessage('Export failed. No QA status was changed.');}
 };
 const erase=()=>{
  if(strictAssessmentLocked(assessmentSession))return;
  const next=removeDeviceObservation(ledger,caseId);if(!next)return;
  try{window.localStorage.setItem(CANON_DEVICE_QA_KEY,JSON.stringify(next));setLedger(next);changeCase(caseId);setObserver('');setSetup('');setDisplay('');setNotes('');setOutcome('observed-issue');setMessage('Observation deleted.');}
  catch{setMessage('Storage unavailable. Record was not changed.');}
 };
 if(strictAssessmentLocked(assessmentSession))return <p role="alert">Device-test guidance is locked during strict assessments.</p>;
 const passes=ledger.observations.filter(x=>x.outcome==='observed-pass').length;
 return <section className="space-y-4 rounded-xl border bg-white p-4 sm:p-6" aria-label="Canon device QA worksheet">
  <h2 className="flex items-center gap-2 text-lg font-black"><ClipboardCheck className="w-5 h-5 text-blue-700"/>Canon F-789SGA physical-device QA worksheet</h2>
  <p role="note" className="rounded-lg bg-amber-50 border border-amber-300 text-amber-950 p-3 text-xs"><AlertTriangle className="inline w-4 h-4 mr-1"/>This form records <strong>self-reported observations only</strong>. It does NOT change the publication status of any calculator method, provide independent review, or confirm that any physical test was conducted. A supervised reviewer must inspect actual device evidence outside the app before a method can be approved.</p>
  <div className="flex flex-wrap gap-3 text-xs"><span className="bg-slate-100 rounded-lg p-2">{ledger.observations.length}/{CANON_DEVICE_QA_CASES.length} observations logged</span><span className="bg-slate-100 rounded-lg p-2">{passes} reported passes</span><span className="bg-slate-100 rounded-lg p-2">{ledger.observations.length-passes} reported issues</span><span className="bg-amber-50 rounded-lg p-2">0 published by this worksheet</span></div>
  <label className="block text-sm font-semibold">Technique to inspect
   <select value={caseId} onChange={e=>changeCase(e.target.value)} className="mt-1 w-full rounded-lg border p-3 text-sm bg-white">{CANON_DEVICE_QA_CASES.map(c=><option key={c.id} value={c.id}>{c.type==='pilot'?'Pilot':'Family'}: {c.label}</option>)}</select>
  </label>
  <div className="rounded-lg border bg-slate-50 p-3 text-xs space-y-2"><p><strong>Required mode:</strong> {selected.mode}</p><p><strong>Expected / checking basis:</strong> {selected.expected}</p><p><strong>Known trap:</strong> {selected.warnings}</p><p>Verify the exact manual revision, calculator setup, keystrokes, displayed output, rounding, original equation and units. Family-based guides require testing an actual bound problem variant.</p><a className="underline text-blue-800 inline-flex gap-1 items-center" target="_blank" rel="noreferrer" href={CANON_MANUAL_URL}>Open official Canon manual <ExternalLink className="w-3 h-3"/></a></div>
  {pilot&&<div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs space-y-2"><p className="font-semibold">Pilot device procedure — preliminary, follow only for verification</p><ol className="list-decimal ml-5 space-y-1">{pilot.steps.map((step,i)=><li key={i}>{step}</li>)}</ol><p><strong>Independent checks:</strong> {pilot.verify.join(' · ')}</p></div>}
  {example&&family&&<div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs space-y-2"><p className="font-semibold">Authored numerical variant — use these specific values when checking this family</p><p><strong>Question:</strong> {example.question}</p><p><strong>Bound parameters:</strong> {Object.entries(family.parameterValues).map(([k,v])=>`${k}=${v}`).join(' · ')}</p><p><strong>Conceptual entry:</strong> {family.shortcut}</p><p><strong>Expected:</strong> {Number(family.expected.toPrecision(6))} {family.unit}</p><p><strong>Independent checks:</strong> {family.verification.join(' · ')}</p></div>}
  {recorded&&<p className="rounded-lg bg-blue-50 p-3 text-xs">Existing observation: <strong>{recorded.outcome}</strong>, logged {new Date(recorded.observedAt).toLocaleString()}. Select the technique again to load saved details for editing.</p>}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
   <label className="font-semibold">Observer name / initials<input className="mt-1 block w-full rounded-lg border p-2.5 font-normal" maxLength={80} value={observer} onChange={e=>setObserver(e.target.value)} placeholder="Person who operated the device"/></label>
   <label className="font-semibold">Observed outcome<select className="mt-1 block w-full rounded-lg border p-2.5 bg-white font-normal" value={outcome} onChange={e=>setOutcome(e.target.value as DeviceObservationOutcome)}><option value="observed-issue">Issue or unconfirmed</option><option value="observed-pass">Observed result matched</option></select></label>
   <label className="font-semibold">Initial calculator setup<textarea className="mt-1 block w-full rounded-lg border p-2.5 font-normal" value={setup} maxLength={500} onChange={e=>setSetup(e.target.value)} placeholder="Model/casing, reset, angle and calculation mode" rows={3}/></label>
   <label className="font-semibold">Actual LCD results / key observations<textarea className="mt-1 block w-full rounded-lg border p-2.5 font-normal" value={display} maxLength={500} onChange={e=>setDisplay(e.target.value)} placeholder="Actual displayed output, rounding and unexpected behavior" rows={3}/></label>
  </div>
  <label className="block text-sm font-semibold">Notes / evidence reference<textarea className="mt-1 block w-full rounded-lg border p-2.5 font-normal" value={notes} maxLength={1200} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Evidence file identifier, steps still requiring review, etc."/></label>
  <div className="flex flex-wrap gap-2"><button onClick={save} type="button" className="rounded-lg bg-blue-800 text-white px-4 py-2 text-sm font-semibold">Save observation</button><button type="button" onClick={exportForExternalReview} className="rounded-lg border border-blue-400 text-blue-800 px-4 py-2 text-sm font-semibold">Export unverified QA evidence (JSON)</button>{recorded&&<button type="button" onClick={erase} className="rounded-lg border border-red-400 text-red-800 px-4 py-2 text-sm font-semibold">Delete observation</button>}</div>
  {message&&<p role="status" className="text-xs text-amber-900">{message}</p>}
  <p className="text-xs text-slate-600">The worksheet can be exported to an independent reviewer; it is stored locally and included in learner backup. It has no effect on examination grades, technique verification stages or learner mastery.</p>
 </section>;
}
