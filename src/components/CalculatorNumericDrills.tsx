import React,{useCallback,useEffect,useRef,useState} from 'react';
import {AlertTriangle,Calculator,Clock3,CheckCircle2} from 'lucide-react';
import {useReview} from '../context/ReviewContext';
import {strictAssessmentLocked} from '../domain/assessment/assessmentAccess';
import {
 CANON_NUMERIC_DRILLS_KEY,NUMERIC_DRILL_SECONDS,NUMERIC_DRILL_QUESTIONS,EMPTY_NUMERIC_DRILLS,
 buildNumericDrill,readNumericDrills,createNumericDrillAttempt,appendNumericDrill,gradeNumericDrill,
 parseNumericEntry,diagnoseNumericMistake,numericDrillDeadlineReached,type NumericDrillHistory,type NumericDrillAttempt,type NumericExercise
} from '../domain/calculator/numericDrills';
interface Session {id:string;startedAt:string;startedMs:number;questions:NumericExercise[]}
function loadHistory():NumericDrillHistory {
 try{return typeof window==='undefined'?EMPTY_NUMERIC_DRILLS:readNumericDrills(window.localStorage)}catch{return EMPTY_NUMERIC_DRILLS;}
}
export function CalculatorNumericDrills({onOpenLesson}:{onOpenLesson:(lessonId:string)=>void}){
 const {assessmentSession}=useReview();
 const locked=strictAssessmentLocked(assessmentSession);
 const [history,setHistory]=useState<NumericDrillHistory>(loadHistory);
 const [session,setSession]=useState<Session|null>(null);
 const [entries,setEntries]=useState<Record<string,string>>({});
 const [remaining,setRemaining]=useState(NUMERIC_DRILL_SECONDS);
 const [warning,setWarning]=useState('');
 const complete=useRef(new Set<string>());
 const entriesRef=useRef<Record<string,string>>({});
 const finish=useCallback((active:Session,submitted:Record<string,string>)=>{
  if(complete.current.has(active.id))return;
  complete.current.add(active.id);
  const attempt=createNumericDrillAttempt({id:active.id,startedAt:active.startedAt,completedAt:new Date().toISOString(),
   questionIds:active.questions.map(q=>q.id),entries:submitted});
  setSession(null);setRemaining(NUMERIC_DRILL_SECONDS);entriesRef.current={};
  if(!attempt){setWarning('The drill result could not be validated. No history was saved.');return;}
  const next=appendNumericDrill(history,attempt);
  if(!next){setWarning('The drill could not be stored. Please retry.');return;}
  setHistory(next);
  try{window.localStorage.setItem(CANON_NUMERIC_DRILLS_KEY,JSON.stringify(next));setWarning('');}
  catch{setWarning('The result is visible but could not be saved in browser storage.');}
 },[history]);
 useEffect(()=>{
  if(!session||locked)return;
  const update=()=>{
   const seconds=Math.max(0,Math.ceil((session.startedMs+NUMERIC_DRILL_SECONDS*1000-Date.now())/1000));
   setRemaining(seconds);
   if(numericDrillDeadlineReached(session.startedMs,Date.now()))finish(session,entriesRef.current);
  };
  update();const timer=window.setInterval(update,500);document.addEventListener('visibilitychange',update);
  return ()=>{window.clearInterval(timer);document.removeEventListener('visibilitychange',update);};
 },[session,locked,finish]);
 useEffect(()=>{
  if(locked&&session){
   complete.current.add(session.id);setSession(null);setEntries({});entriesRef.current={};
   setWarning('The numerical drill was interrupted by the strict assessment. No unfinished result was saved.');
  }
 },[locked,session]);
 const start=()=>{
  if(locked)return;
  const at=new Date();
  setSession({id:`numeric-${at.getTime().toString(36)}-${history.attempts.length.toString(36)}`,
   startedAt:at.toISOString(),startedMs:at.getTime(),questions:buildNumericDrill(history.attempts.length)});
  setEntries({});entriesRef.current={};setRemaining(NUMERIC_DRILL_SECONDS);setWarning('');
 };
 const latest:NumericDrillAttempt|undefined=history.attempts.at(-1);
 const graded=latest?gradeNumericDrill(latest):null;
 const best=history.attempts.reduce((n,a)=>Math.max(n,gradeNumericDrill(a)?.correct??0),0);
 if(locked)return <section role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm">Numeric calculator drills are unavailable during an active strict assessment.</section>;
 return <section aria-label="Calculator numeric-answer practice" className="space-y-5">
  <div className="bg-white rounded-xl border p-5 space-y-3">
   <h2 className="font-black text-xl text-slate-900 flex items-center gap-2"><Calculator className="w-6 h-6 text-blue-700"/>Numerical answer drills</h2>
   <p className="text-sm text-slate-700">Enter calculated values instead of choosing from options. Each {NUMERIC_DRILL_SECONDS/60}-minute set has {NUMERIC_DRILL_QUESTIONS} engineering/Math problems, with two variants per family rotating across attempts. Use a physical calculator if you wish, but these drills <strong>do not measure physical keypress speed</strong> or certify Canon F-789SGA operation.</p>
   <p className="text-xs text-slate-600">Type the numeric value only (no unit symbols); use decimals or scientific notation such as 1.59e3. Units are stated for each question. The answer checker uses visible rounding tolerances.</p>
   <div className="flex flex-wrap gap-2 text-xs"><span className="rounded bg-blue-50 px-3 py-2">{history.attempts.length} saved attempts</span><span className="rounded bg-blue-50 px-3 py-2">Best {best}/{NUMERIC_DRILL_QUESTIONS}</span><span className="rounded bg-blue-50 px-3 py-2">Separate from board mastery</span></div>
   {!session&&<button type="button" onClick={start} className="rounded-lg bg-blue-700 text-white px-5 py-2.5 font-bold text-sm">Start numerical drill</button>}
  </div>
  {session?<div className="rounded-xl border-2 border-blue-300 p-5 bg-white space-y-5">
   <div className="sticky top-0 z-10 bg-white border-b pb-3 flex justify-between items-center gap-3"><div><h3 className="font-bold text-blue-950">Active numerical drill</h3><p className="text-xs text-slate-600">{Object.values(entries).filter(s=>s.trim()).length}/{NUMERIC_DRILL_QUESTIONS} attempted · timed practice</p></div><span role="timer" aria-label="Time remaining" className={`text-xl font-black tabular-nums ${remaining<=30?'text-red-700':'text-blue-800'}`}><Clock3 className="inline w-4 h-4 mr-1"/>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</span></div>
   {session.questions.map((q,index)=><div key={q.id} className="border-b pb-4 space-y-2"><label className="font-semibold text-sm text-slate-900 block" htmlFor={`numeric-${q.id}`}>{index+1}. {q.prompt}</label><p className="text-xs text-slate-600">{q.title} · Answer unit: {q.unit||'unitless'} · Accepted absolute tolerance: ±{q.absoluteTolerance} {q.unit}</p><input id={`numeric-${q.id}`} inputMode="decimal" autoComplete="off" type="text" value={entries[q.id]??''} onChange={e=>{if(numericDrillDeadlineReached(session.startedMs,Date.now())){finish(session,entriesRef.current);return;}const next={...entriesRef.current,[q.id]:e.target.value};entriesRef.current=next;setEntries(next);}} placeholder="Enter a number" maxLength={48} className="rounded-lg border border-slate-300 p-3 max-w-sm w-full" aria-describedby={`numeric-note-${q.id}`}/><p id={`numeric-note-${q.id}`} className="text-[11px] text-slate-500">{entries[q.id]?.trim()&&parseNumericEntry(entries[q.id])===null?'Invalid numeric format; use digits and an optional decimal or exponent.':'Explanations are available after the drill finishes.'}</p></div>)}
   <button type="button" onClick={()=>finish(session,entriesRef.current)} className="bg-blue-700 text-white rounded-lg px-5 py-2.5 font-bold text-sm">Finish and review answers</button>
   <p className="text-xs text-amber-800">Leaving this page discards the unfinished drill. The countdown continues while this tab is backgrounded. Empty responses are marked unanswered.</p>
  </div>:<>
   {graded&&latest&&<div aria-live="polite" className="rounded-xl bg-white border p-5 space-y-4"><h3 className="font-black text-lg flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-blue-700"/>Last numerical-drill result</h3><p className="text-sm">{graded.correct}/{graded.total} correct · {graded.incorrect} incorrect · {graded.unanswered} unanswered · {latest.elapsedSeconds}s elapsed{latest.timedOut?' (time expired)':''}</p>
    {graded.details.map((item,i)=><div key={item.exercise.id} className="border rounded-lg p-3 space-y-2 text-sm"><p className="font-semibold">{i+1}. {item.exercise.prompt}</p><p className={item.status==='correct'?'text-emerald-800':'text-amber-900'}>{item.status==='correct'?'Correct':item.status==='unanswered'?'Unanswered':'Incorrect'} · Entered: {item.entry??'—'} · Expected: {Number(item.exercise.expected.toPrecision(8))} {item.exercise.unit}</p><p><strong>Solution:</strong> {item.exercise.formula}</p><p><strong>Independent verification:</strong> {item.exercise.independentCheck}</p><p className="text-amber-900"><strong>Watch out:</strong> {item.exercise.pitfall}</p>{item.status==='incorrect'&&(()=>{const hint=diagnoseNumericMistake(item.exercise,item.entry);return hint?<div className="rounded-lg bg-amber-50 p-3 text-amber-950 text-xs"><strong>Possible error pattern:</strong> {hint.message} <strong>Check:</strong> {hint.check}</div>:null;})()}{item.status!=='correct'&&<button type="button" onClick={()=>onOpenLesson(item.exercise.lessonId)} className="text-xs underline text-blue-800 font-semibold">Review related calculator lesson</button>}</div>)}
   </div>}
  </>}
  {warning&&<p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="inline w-4 h-4 mr-1"/>{warning}</p>}
  <p className="text-xs text-slate-500">These are independently keyed practice items, not direct proof of calculator-device compatibility, PRC TOS coverage or board readiness. The problem answers and tolerances are stored separately from learner examination records.</p>
 </section>;
}
