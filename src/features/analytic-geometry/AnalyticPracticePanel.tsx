import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { ANALYTIC_PRACTICE, ANALYTIC_LESSONS, ANALYTIC_UNITS, analyticAnswer } from './analyticGeometryContent';
import { AnalyticGeometryIllustration } from './AnalyticGeometryIllustration';

const field='block mt-1 w-full rounded-lg bg-white border border-slate-300 py-2 px-2 text-sm focus-visible:outline-2 focus-visible:outline-indigo-600';
export const AnalyticPracticePanel:React.FC<{initialTopic?:string}>=({initialTopic})=>{
 const [unit,setUnit]=useState('all');
 const [topic,setTopic]=useState(initialTopic||'all');
 const [difficulty,setDifficulty]=useState('all');
 const [status,setStatus]=useState('all');
 const [index,setIndex]=useState(0);
 const [answers,setAnswers]=useState<Record<string,number>>({});
 useEffect(()=>{if(initialTopic){setTopic(initialTopic);const found=ANALYTIC_PRACTICE.findIndex(q=>q.topic_id===initialTopic);if(found>=0)setIndex(found)}},[initialTopic]);
 const filtered=useMemo(()=>ANALYTIC_PRACTICE.map((q,i)=>({q,i})).filter(({q})=>(unit==='all'||ANALYTIC_LESSONS.find(l=>l.topic_id===q.topic_id)?.unit_id===unit)&&(topic==='all'||q.topic_id===topic)&&(difficulty==='all'||q.level===difficulty)&&(status==='all'||(status==='missed'&&answers[q.id]!==undefined&&answers[q.id]!==q.correctIndex)||(status==='unanswered'&&answers[q.id]===undefined))).map(({i})=>i),[unit,topic,difficulty,status,answers]);
 const selected=filtered.includes(index)?index:filtered[0];
 const question=ANALYTIC_PRACTICE[selected];
 const pos=filtered.indexOf(selected);
 const attempted=question&&answers[question.id]!==undefined;
 const count=Object.keys(answers).length,correct=ANALYTIC_PRACTICE.filter(q=>answers[q.id]===q.correctIndex).length;
 const choices=(q:typeof question)=>q.options.map((option,i)=><button type="button" key={i} disabled={attempted} onClick={()=>setAnswers(a=>({...a,[q.id]:i}))} aria-pressed={attempted?answers[q.id]===i:undefined} className={`flex w-full text-left items-center gap-2 border rounded-xl p-3 text-sm focus-visible:outline-2 focus-visible:outline-indigo-600 ${attempted&&i===q.correctIndex?'bg-emerald-50 border-emerald-400 text-emerald-900':attempted&&i===answers[q.id]?'bg-rose-50 border-rose-300 text-rose-900':'border-slate-200 bg-white hover:border-indigo-400'}`}><span className="font-black w-6">{String.fromCharCode(65+i)}.</span>{typeof option==='number'?`${option.toLocaleString('en-US',{maximumFractionDigits:4})} ${q.unit}`:option}{attempted&&i===q.correctIndex&&<CheckCircle2 className="ml-auto shrink-0 text-emerald-600" size={18}/>}</button>);
 return <section id="analytic-geometry-practice-panel" className="space-y-4" aria-label="Analytic Geometry practice">
   <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
     <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-900">Analytic Geometry Practice</h2><p className="text-xs text-slate-600">{ANALYTIC_PRACTICE.length} original draft questions · 35 lessons · session-only answers</p></div><p role="status" className="text-sm font-semibold text-indigo-800">{count} attempted · {correct} correct · {count?Math.round(correct/count*100):0}%</p></div>
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
       <label className="text-xs font-semibold text-slate-700">Unit<select className={field} aria-label="Analytic unit" value={unit} onChange={e=>{setUnit(e.target.value);setTopic('all')}}><option value="all">All units</option>{ANALYTIC_UNITS.map(u=><option value={u.unit_id} key={u.unit_id}>{u.name}</option>)}</select></label>
       <label className="text-xs font-semibold text-slate-700">Topic<select className={field} aria-label="Analytic topic" value={topic} onChange={e=>setTopic(e.target.value)}><option value="all">All topics</option>{ANALYTIC_LESSONS.filter(l=>unit==='all'||l.unit_id===unit).map(l=><option key={l.topic_id} value={l.topic_id}>{l.topic_id}: {l.title}</option>)}</select></label>
       <label className="text-xs font-semibold text-slate-700">Difficulty<select className={field} aria-label="Analytic difficulty" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option value="all">All difficulties</option><option value="Foundation">Foundation</option><option value="Applied">Applied</option></select></label>
       <label className="text-xs font-semibold text-slate-700">Answer status<select className={field} aria-label="Analytic answer status" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All questions</option><option value="unanswered">Unanswered</option><option value="missed">Incorrect only</option></select></label>
     </div>
     <p className="text-xs text-slate-500">{filtered.length} matching questions. Practice is developmental and has no official exam weight. Figures are schematic and not to scale.</p>
   </div>
   <div className="grid grid-cols-1 lg:grid-cols-[270px_minmax(0,1fr)] gap-4">
     <aside className="bg-white rounded-2xl border border-slate-200 p-4 h-fit lg:max-h-[75vh] lg:overflow-auto">
       <div className="flex justify-between items-center gap-2"><h3 className="font-bold text-slate-800 text-sm">Question navigator</h3><button type="button" onClick={()=>{setAnswers({});setStatus('all')}} className="text-indigo-700 text-xs font-semibold inline-flex gap-1 items-center"><RotateCcw size={15}/> Reset</button></div>
       <div aria-label="Analytic question numbers" className="mt-3 grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-5 gap-1.5">{filtered.map(i=>{const q=ANALYTIC_PRACTICE[i];const chosen=answers[q.id];return <button type="button" key={q.id} onClick={()=>setIndex(i)} title={`${q.topic_id}: ${q.title}`} aria-label={`Question ${i+1}, ${q.topic_id}`} aria-current={selected===i?'true':undefined} className={`rounded-lg aspect-square text-xs font-semibold border ${selected===i?'bg-indigo-600 text-white border-indigo-600':chosen===undefined?'bg-white border-slate-200 text-slate-600':chosen===q.correctIndex?'bg-emerald-50 border-emerald-300 text-emerald-900':'bg-rose-50 border-rose-300 text-rose-900'}`}>{i+1}</button>})}</div>
       {!filtered.length&&<p role="status" className="text-sm mt-3 text-slate-600">No questions match the filters.</p>}
     </aside>
     {question?<article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 min-w-0">
       <div className="flex flex-wrap gap-2 justify-between items-center text-xs text-indigo-700 font-semibold"><span>{question.id} · {question.topic_id} · {question.level}</span><span>{pos+1} of {filtered.length}</span></div>
       <h3 className="text-xl font-black text-slate-900 mt-3">{question.title}</h3><p className="mt-2 text-slate-700 text-sm leading-7">{question.prompt}</p>
       <div className="w-60 max-w-full mx-auto mt-3"><AnalyticGeometryIllustration topicId={question.topic_id} compact/></div>
       <div role="group" aria-label="Select an answer" className="mt-4 space-y-2">{choices(question)}</div>
       {attempted&&<div role="status" className="rounded-xl bg-slate-50 border border-slate-200 mt-4 p-4"><div className="flex justify-between flex-wrap gap-3"><strong className="text-sm">{answers[question.id]===question.correctIndex?'Correct':'Review and try again'}</strong>{answers[question.id]!==question.correctIndex&&<button type="button" onClick={()=>{setAnswers(a=>{const x={...a};delete x[question.id];return x});setStatus('all')}} className="text-sm text-indigo-700 font-semibold">Try again</button>}</div><p className="text-sm mt-2"><strong>Answer:</strong> {analyticAnswer(question)}</p><ol className="list-decimal pl-5 mt-2 space-y-1 text-sm leading-6 text-slate-700">{question.work.map((w,i)=><li key={i}>{w}</li>)}</ol><p className="mt-3 text-xs text-amber-800">Applicability: {question.restriction}</p></div>}
       <div className="flex flex-wrap justify-between mt-5 gap-2"><button type="button" disabled={pos<1} onClick={()=>setIndex(filtered[pos-1])} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 flex items-center gap-1"><ArrowLeft size={16}/>Previous</button><button type="button" disabled={pos===filtered.length-1} onClick={()=>setIndex(filtered[pos+1])} className="rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm disabled:opacity-40 flex items-center gap-1">Next<ArrowRight size={16}/></button></div>
     </article>:<div className="bg-white border rounded-2xl p-6 text-slate-600" role="status">No question available. Adjust filters to continue.</div>}
   </div>
 </section>;
};
