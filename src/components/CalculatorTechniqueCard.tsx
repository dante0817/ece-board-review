import React, {useState,useId} from 'react';
import {useReview} from '../context/ReviewContext';
import type {MockExamQuestion} from '../types';
import {canRevealCalculator,type DisclosureContext} from '../domain/assessment/assessmentAccess';
import {calculatorDisclosureScope,visibleCalculatorTab,selectCalculatorTab,type CalculatorTabState} from '../domain/calculator/disclosureScope';
import {CANON_TECHNIQUE_TEMPLATES} from '../domain/calculator/techniqueLibrary';
import {resolveFamilyTechnique} from '../domain/calculator/familyTechniques';
import {Calculator,ExternalLink} from 'lucide-react';
import {CANON_MANUAL_URL,CALCULATOR_MODEL,calculatorGuidanceState} from '../domain/calculator/canonTechniques';
/** Missing disclosure is fail-closed. A global strict assessment lock ALWAYS takes precedence. */
export function CalculatorTechniqueCard({questionId,question,disclosure}:{questionId:string;question?:MockExamQuestion;disclosure?:DisclosureContext}) {
 const {assessmentSession,recordAidDisclosure}=useReview();
 const tabId=useId();
 const [tabState,setTabState]=useState<CalculatorTabState>({scopeKey:'',tab:'closed'});
 const allowed=canRevealCalculator(assessmentSession,disclosure);
 const pilotState=calculatorGuidanceState(questionId,allowed);
 const familyState=allowed && question && question.id===questionId ? resolveFamilyTechnique(question) : null;
 const family=familyState?.kind==='available'?familyState.technique:null;
 const pilot=pilotState.kind==='available'?pilotState.technique:null;
 const provenance=pilot?CANON_TECHNIQUE_TEMPLATES.find(t=>t.originalQuestionId===questionId):null;
 const active=pilot||family;
 const scopeKey=calculatorDisclosureScope({questionId,questionFingerprint:question?JSON.stringify([question.correctOptionId,question.calculatorInputs??null]):'',assessmentStatus:assessmentSession.status,attemptId:assessmentSession.attemptId,disclosure,techniqueId:active?.id});
 // Do not render previously opened help if the question, attempt, answer, or mode changed.
 const tab=visibleCalculatorTab(tabState,scopeKey,allowed&&Boolean(active));
 const recordReveal=(kind:'shortcut'|'verify')=>{
   if(!allowed||!active)return;
   recordAidDisclosure({eventId:`aid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
     attemptId:assessmentSession.attemptId??'standalone-learning',questionId,aid:'calculator',
     techniqueId:pilot?.id??family?.id,techniqueVersion:provenance?.version??family?.version??1,
     revealedAt:new Date().toISOString(),phase:disclosure==='after-answer'?'after-answer':'before-answer',
     assessmentMode:assessmentSession.status==='study-active'?'study':assessmentSession.status==='strict-active'?'strict':'unscored'});
 };
 const switchTab=(kind:'shortcut'|'verify')=>{
   const next=selectCalculatorTab(scopeKey,kind,allowed&&Boolean(active));
   if(!next)return;
   setTabState(next);recordReveal(kind);
 };
 const onTabKeyDown=(event:React.KeyboardEvent<HTMLButtonElement>,kind:'shortcut'|'verify')=>{
   if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;
   event.preventDefault();const next=kind==='shortcut'?'verify':'shortcut';switchTab(next);
   document.getElementById(`${tabId}-${next}`)?.focus();
 };
 const steps=pilot?.steps??(family?[`Set ${family.mode} mode. Confirm the values and units against the problem.`,
   `Enter: ${family.shortcut}`,`Evaluate with =. Expected approximately ${Number(family.expected.toPrecision(6))} ${family.unit}.`]:[]);
 const checks=pilot?.verify??family?.verification??[];
 const title=pilot?.title??family?.title;
 return <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-slate-800 space-y-3" aria-label="Canon calculator techniques">
  <div className="flex items-center gap-2 font-bold text-blue-950"><Calculator className="w-5 h-5"/> {CALCULATOR_MODEL} · Calculator Technique</div>
  {!allowed?<p className="text-xs">Calculator solution help is locked until this learning activity permits disclosure.</p>:
   !active?<><p className="text-xs">Technique pending review for this question. The mathematical explanation remains available; no unverified parameter substitutions are supplied. {familyState?.kind==='pending' ? familyState.reason : ''}</p><a href={CANON_MANUAL_URL} target="_blank" rel="noreferrer" className="text-xs text-blue-800 underline">Open Canon manual <ExternalLink className="inline w-3 h-3"/></a></>:
   <>
    <p className="font-semibold text-sm">{title}</p>
    <p className="text-xs text-slate-600">{pilot?.functionName??family?.mode} · {pilot?.manualSection??family?.manualReference}</p>
    {family&&<p className="text-xs text-slate-700"><strong>Formula:</strong> {family.formula} · <strong>Bound parameters:</strong> {Object.entries(family.parameterValues).map(([key,value])=>`${key}=${value}`).join(', ')}</p>}
    <div className="flex gap-2" role="tablist" aria-label="Calculator technique method">
      <button role="tab" id={`${tabId}-shortcut`} aria-controls={`${tabId}-content`} aria-selected={tab==='shortcut'} type="button" onClick={()=>switchTab('shortcut')} onKeyDown={event=>onTabKeyDown(event,'shortcut')} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tab==='shortcut'?'bg-blue-800 text-white':'bg-white text-blue-900'}`}>Calculator shortcut</button>
      <button role="tab" id={`${tabId}-verify`} aria-controls={`${tabId}-content`} aria-selected={tab==='verify'} type="button" onClick={()=>switchTab('verify')} onKeyDown={event=>onTabKeyDown(event,'verify')} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tab==='verify'?'bg-blue-800 text-white':'bg-white text-blue-900'}`}>Verify answer</button>
    </div>
    {tab==='closed'?<p className="text-xs text-slate-600">Choose a tab to reveal a preliminary technique or independent numerical check.</p>:
     <div role="tabpanel" id={`${tabId}-content`} aria-labelledby={`${tabId}-${tab}`}>
      <ol className="list-decimal pl-5 space-y-2 text-xs">{(tab==='shortcut'?steps:checks).map((step,index)=><li key={index}>{step}</li>)}</ol>
      {tab==='shortcut'&&<p className="mt-2 rounded-lg bg-white p-2 text-xs"><strong>Expected:</strong> {pilot?.expected??(family?`${Number(family.expected.toPrecision(6))} ${family.unit}`:'')}</p>}
     </div>}
    <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950"><strong>Trap:</strong> {pilot?.caution??family?.caution}</p>
    <p className="text-[11px] text-slate-600">Preliminary {pilot?'question-specific':'family-based'} arithmetic guide (version {provenance?.version??family?.version??1}). <strong>Physical keyboard/device testing and editorial approval pending.</strong> Calculator use does not independently prove algebraic identities or award mastery.</p>
    <a href={CANON_MANUAL_URL} className="inline-flex gap-1 items-center text-xs font-semibold text-blue-800 underline" target="_blank" rel="noreferrer">Canon manual <ExternalLink className="w-3 h-3"/></a>
   </>}
 </section>;
}
