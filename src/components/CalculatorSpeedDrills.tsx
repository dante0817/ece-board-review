import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {AlertTriangle,BookOpen,CheckCircle2,Clock3,RotateCcw,Target} from 'lucide-react';
import type {ReviewError} from '../types';
import {strictAssessmentLocked} from '../domain/assessment/assessmentAccess';
import {useReview} from '../context/ReviewContext';
import {CANON_SKILL_BY_ID} from '../domain/calculator/skillsCurriculum';
import {
 CANON_SPEED_DRILL_KEY,SPEED_DRILL_SECONDS,SPEED_DRILL_QUESTIONS,MANUAL_VS_CANON_COMPARISONS,
 buildSpeedDrill,createSpeedDrillAttempt,appendSpeedDrill,readSpeedDrillHistory,
 gradeSpeedDrill,recommendCalculatorRemediation,calculatorRetentionPrompts,type SpeedDrillHistory,type SpeedDrillAttempt
} from '../domain/calculator/speedDrills';

interface ActiveDrill {id:string;startedAt:string;startedMs:number;questions:ReturnType<typeof buildSpeedDrill>}
function loadHistory():SpeedDrillHistory{
 try{return typeof window==='undefined'?{version:1,attempts:[]}:readSpeedDrillHistory(window.localStorage)}
 catch{return {version:1,attempts:[]}}
}
export function CalculatorSpeedDrills({errors,onOpenLesson}:{errors:readonly ReviewError[];onOpenLesson:(lessonId:string)=>void}){
 const {assessmentSession}=useReview();
 const [history,setHistory]=useState<SpeedDrillHistory>(loadHistory);
 const [active,setActive]=useState<ActiveDrill|null>(null);
 const [selected,setSelected]=useState<Record<string,number>>({});
 const [remaining,setRemaining]=useState(SPEED_DRILL_SECONDS);
 const [warning,setWarning]=useState('');
 const [comparisonId,setComparisonId]=useState<string>(MANUAL_VS_CANON_COMPARISONS[0].id);
 const completedIds=useRef(new Set<string>());
 const locked=strictAssessmentLocked(assessmentSession);
 const finish=useCallback((session:ActiveDrill,choices:Record<string,number>)=>{
  if(completedIds.current.has(session.id))return;
  completedIds.current.add(session.id);
  const attempt=createSpeedDrillAttempt({id:session.id,startedAt:session.startedAt,
   completedAt:new Date().toISOString(),questionIds:session.questions.map(q=>q.id),selections:choices});
  if(!attempt){setWarning('Unable to validate this attempt; no result was saved.');setActive(null);return;}
  const next=appendSpeedDrill(history,attempt);
  if(!next){setWarning('Unable to store this attempt; please retry.');setActive(null);return;}
  setHistory(next);setActive(null);setRemaining(SPEED_DRILL_SECONDS);
  try{window.localStorage.setItem(CANON_SPEED_DRILL_KEY,JSON.stringify(next));setWarning('');}
  catch{setWarning('Result is visible, but local storage was unavailable. Export your learner data after storage works.');}
 },[history]);
 useEffect(()=>{
  if(!active||locked)return;
  const update=()=>{
   const timeLeft=Math.max(0,Math.ceil((active.startedMs+SPEED_DRILL_SECONDS*1000-Date.now())/1000));
   setRemaining(timeLeft);
   if(timeLeft===0)finish(active,selected);
  };
  update();
  const interval=window.setInterval(update,500);
  document.addEventListener('visibilitychange',update);
  return ()=>{window.clearInterval(interval);document.removeEventListener('visibilitychange',update);};
 },[active,finish,selected,locked]);
 const begin=()=>{
  if(locked)return;
  const now=new Date(),startAt=now.toISOString();
  const id=`drill-${now.getTime().toString(36)}-${history.attempts.length.toString(36)}`;
  const questions=buildSpeedDrill(history.attempts.length);
  setActive({id,startedAt:startAt,startedMs:now.getTime(),questions});
  setRemaining(SPEED_DRILL_SECONDS);setSelected({});setWarning('');
 };
 const latest:SpeedDrillAttempt|undefined=history.attempts.at(-1);
 const result=latest?gradeSpeedDrill(latest.answers):null;
 const suggestions=useMemo(()=>recommendCalculatorRemediation(history,errors,5),[history,errors]);
 const retention=useMemo(()=>calculatorRetentionPrompts(history,new Date().toISOString()),[history]);
 const comparison=MANUAL_VS_CANON_COMPARISONS.find(item=>item.id===comparisonId)!;
 const best=history.attempts.reduce((n,a)=>Math.max(n,gradeSpeedDrill(a.answers)?.correct??0),0);
 if(locked)return <section role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm">Calculator drills and solution guidance are locked during an active strict assessment.</section>;
 return <div className="space-y-6">
  <header className="rounded-xl bg-white border p-5 space-y-3">
   <h2 className="font-black text-xl text-slate-900 flex items-center gap-2"><Clock3 className="w-6 h-6 text-blue-700"/>Canon speed and checking drills</h2>
   <p className="text-sm text-slate-700">Practice <strong>{SPEED_DRILL_QUESTIONS} short calculator-decision questions</strong> in five minutes. The countdown uses elapsed wall-clock time, even if this tab is backgrounded. This is a timed <strong>knowledge check</strong>, not a physical keystroke speed test or board assessment.</p>
   <div className="flex flex-wrap gap-3 text-xs"><span className="px-3 py-2 bg-blue-50 rounded-lg">{history.attempts.length} saved attempts</span><span className="px-3 py-2 bg-blue-50 rounded-lg">Best: {best}/{SPEED_DRILL_QUESTIONS}</span><span className="px-3 py-2 bg-blue-50 rounded-lg">No impact on board mastery or examination scores</span></div>
   {!active&&<button type="button" onClick={begin} className="rounded-lg bg-blue-700 text-white px-5 py-2.5 font-bold text-sm">{history.attempts.length?'Start another five-minute drill':'Start five-minute drill'}</button>}
  </header>
  {active?<section className="rounded-xl border-2 border-blue-300 p-5 bg-white space-y-5" aria-label="Active calculator speed drill">
   <div className="sticky top-0 z-10 bg-white border-b pb-3 flex justify-between gap-3 items-center">
    <div><h3 className="font-bold text-blue-950">Active timed knowledge check</h3><p className="text-xs text-slate-600">{Object.keys(selected).length}/{SPEED_DRILL_QUESTIONS} answered · not proctored</p></div>
    <div className={`text-xl font-black tabular-nums ${remaining<=30?'text-red-700':'text-blue-800'}`} role="timer" aria-label="Time remaining">{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</div>
   </div>
   {active.questions.map((item,i)=><fieldset key={item.id} className="space-y-2 border-b pb-4 last:border-0">
    <legend className="text-sm font-bold text-slate-900">{i+1}. {item.check.prompt}</legend><p className="text-xs text-slate-500">{item.lessonTitle}</p>
    {item.check.options.map((option,j)=><label key={j} className={`flex items-start gap-2 border rounded-lg p-3 text-sm cursor-pointer ${selected[item.id]===j?'border-blue-500 bg-blue-50':'border-slate-200'}`}><input type="radio" name={`speed-${item.id}`} checked={selected[item.id]===j} onChange={()=>{if(Date.now()>=active.startedMs+SPEED_DRILL_SECONDS*1000){finish(active,selected);return;}setSelected(prev=>({...prev,[item.id]:j}));}} className="mt-1"/><span>{option}</span></label>)}
   </fieldset>)}
   <button type="button" onClick={()=>finish(active,selected)} className="rounded-lg bg-blue-700 text-white font-bold text-sm px-5 py-2.5">Finish and check answers ({Object.keys(selected).length}/{SPEED_DRILL_QUESTIONS})</button>
   <p className="text-xs text-amber-800">Unanswered questions are counted separately; leaving this screen before finishing discards the in-progress drill. Explanations remain hidden until you finish or time expires.</p>
  </section>:<>
   {result&&latest&&<section className="rounded-xl border bg-white p-5 space-y-4" aria-live="polite">
    <h3 className="font-black text-lg flex gap-2 items-center"><CheckCircle2 className="w-5 h-5 text-blue-700"/>Most recent drill result</h3>
    <div className="flex flex-wrap gap-3 text-sm"><span className="font-bold">{result.correct}/{result.total} correct</span><span>{result.incorrect} incorrect</span><span>{result.unanswered} unanswered</span><span>{latest.elapsedSeconds}s elapsed{latest.timedOut?' · Time expired':''}</span></div>
    <p className="text-xs text-slate-600">Saved {new Date(latest.completedAt).toLocaleString()}. Scores reflect decision knowledge only and are not board mastery evidence.</p>
    <div className="space-y-3">{result.details.map((item,i)=><div key={item.id} className="rounded-lg border p-3 space-y-1 text-sm">
     <p className="font-semibold">{i+1}. {item.check.prompt}</p>
     <p className={item.isCorrect?'text-emerald-800':'text-amber-900'}>{item.isCorrect?'Correct':item.selectedIndex===null?'Unanswered':'Incorrect'} · Your answer: {item.selectedIndex===null?'—':item.check.options[item.selectedIndex]} · Expected: {item.check.options[item.check.correctIndex]}</p>
     <p className="text-slate-700">{item.check.explanation}</p>
     {!item.isCorrect&&<button type="button" className="text-blue-700 underline text-xs font-semibold" onClick={()=>onOpenLesson(item.lessonId)}>Review {item.lessonTitle}</button>}
    </div>)}</div>
   </section>}
   <section className="rounded-xl border bg-white p-5 space-y-3"><h3 className="font-black text-lg flex items-center gap-2"><Target className="w-5 h-5 text-blue-700"/>Recommended mistake review</h3>
    <p className="text-xs text-slate-600">Recommendations are based on actual incorrect/unanswered drill items or unresolved manual error-log categories. A wrong answer does not prove which calculator mistake occurred.</p>
    {suggestions.length===0?<p className="text-sm text-slate-700">No recorded drill mistakes or matching unresolved error-log categories yet. Try a timed drill or continue your lesson sequence.</p>:<div className="space-y-3">{suggestions.map(item=><div key={`${item.source}-${item.lessonId}`} className="p-3 rounded-lg bg-slate-50 flex flex-col sm:flex-row justify-between gap-3"><div><p className="font-bold text-sm">{item.title}</p><p className="text-xs text-slate-600">{item.source==='drill'?'Timed-drill evidence':'Related manual error-log category'} · {item.reason}</p></div><button type="button" className="shrink-0 self-start border border-blue-500 text-blue-800 font-semibold rounded-lg px-3 py-2 text-xs" onClick={()=>onOpenLesson(item.lessonId)}>Review lesson</button></div>)}</div>}
   </section>
   {retention.length>0&&<section className="rounded-xl border bg-white p-5 space-y-3"><h3 className="text-lg font-black">24-hour follow-up checks</h3><p className="text-xs text-slate-600">An in-app reminder to retry concepts missed in timed drills. A later correct drill answer clears the reminder. This is not a validated memory-retention estimate or an automatic notification.</p><div className="space-y-2">{retention.map(item=><div key={item.lessonId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg bg-slate-50 p-3"><div><p className="text-sm font-bold">{item.title}</p><p className="text-xs text-slate-600">{item.due?'Recheck due':'Suggested after'}: {new Date(item.dueAt).toLocaleString()}</p></div><button type="button" className="text-xs font-bold text-blue-800 underline self-start" onClick={()=>onOpenLesson(item.lessonId)}>Review and practice</button></div>)}</div></section>}
   <section className="rounded-xl border bg-white p-5 space-y-3"><h3 className="font-black text-lg flex gap-2 items-center"><BookOpen className="w-5 h-5 text-blue-700"/>Manual vs calculator: which is faster?</h3><p className="text-xs text-slate-600">Compare a mental/algebraic shortcut with a conceptual Canon calculation. The recommended fastest method is a teaching judgment, not timed device benchmark data. Specific button sequences remain preliminary.</p>
    <label className="block text-sm font-semibold">Example<select value={comparisonId} onChange={e=>setComparisonId(e.target.value)} className="mt-2 p-3 border rounded-lg w-full bg-white">{MANUAL_VS_CANON_COMPARISONS.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
    <p className="text-sm font-bold">{comparison.problem}</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div className="bg-slate-50 p-3 rounded-lg text-sm"><strong>Manual method</strong><p className="mt-2">{comparison.manual}</p></div><div className="bg-blue-50 p-3 rounded-lg text-sm"><strong>Canon method (conceptual)</strong><p className="mt-2">{comparison.calculator}</p></div></div>
    <p className="text-sm"><strong>Likely fastest:</strong> {comparison.fastest}</p><p className="text-sm"><strong>Independent check:</strong> {comparison.check}</p><p className="text-sm text-amber-800"><strong>Watch for:</strong> {comparison.trap}</p>
    <button type="button" className="underline text-sm text-blue-700 font-bold" onClick={()=>onOpenLesson(comparison.lessonId)}>Open related lesson</button>
   </section>
  </>}
  {warning&&<p role="alert" className="flex gap-2 items-center rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="w-4 h-4"/>{warning}</p>}
  <p className="text-xs text-slate-500 flex items-center gap-2"><RotateCcw className="w-4 h-4"/>Drill history is stored locally, limited to the 50 most recent attempts, and included in learner backup. It does not update subject readiness or examination results.</p>
 </div>;
}
