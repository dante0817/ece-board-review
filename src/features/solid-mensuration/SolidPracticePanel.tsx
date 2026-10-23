import React, {useEffect, useMemo, useState} from 'react';
import {ArrowLeft, ArrowRight, CheckCircle2, Compass, Lightbulb, RotateCcw} from 'lucide-react';
import {BlockMath} from 'react-katex';
import {SolidGeometryIllustration} from './SolidGeometryIllustration';
import {SOLID_FORMULAS, SOLID_LESSONS, SOLID_PRACTICE, SOLID_UNITS, displayPracticeAnswer} from './solidMensurationContent';
import {practiceIndices, recommendedPracticeIndex} from './solidPracticeEngine.mjs';

type Answers = Record<string,number>;
type Props = {
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  startTopic: string;
};
const fmt=(value:number)=>Number(value.toPrecision(6)).toLocaleString('en-US',{maximumFractionDigits:6});
const formatChoice=(v:number|string,unit:string)=>`${typeof v==='number'?fmt(v):v}${unit?' '+unit:''}`;
const fieldClass='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400';

export const SolidPracticePanel: React.FC<Props> = ({answers,setAnswers,selectedIndex,setSelectedIndex,startTopic})=>{
  const [unit,setUnit]=useState('all');
  const [topic,setTopic]=useState(startTopic);
  const [difficulty,setDifficulty]=useState('all');
  const [status,setStatus]=useState('all');
  const [mode,setMode]=useState<'guided'|'adaptive'>('guided');
  const [hintVisible,setHintVisible]=useState(false);
  useEffect(()=>{setTopic(startTopic);},[startTopic]);
  const filtered=useMemo(()=>practiceIndices(SOLID_PRACTICE,{unit,topic,difficulty,status},answers,SOLID_LESSONS),[unit,topic,difficulty,status,answers]);
  useEffect(()=>{if(filtered.length && !filtered.includes(selectedIndex))setSelectedIndex(filtered[0]);},[filtered,selectedIndex,setSelectedIndex]);
  useEffect(()=>setHintVisible(false),[selectedIndex]);
  const question=SOLID_PRACTICE[selectedIndex];
  const inFilter=filtered.includes(selectedIndex);
  const attempted=Object.hasOwn(answers, question.id);
  const score=SOLID_PRACTICE.filter(q=>Object.hasOwn(answers,q.id)&&answers[q.id]===q.correctIndex).length;
  const total=Object.keys(answers).length;
  const nextRecommendation=useMemo(()=>recommendedPracticeIndex(SOLID_PRACTICE,filtered,answers,selectedIndex),[filtered,answers,selectedIndex]);
  const position=filtered.indexOf(selectedIndex);
  const nextIndex=mode==='adaptive' ? nextRecommendation : filtered[position+1]??null;
  const previousIndex=position>0?filtered[position-1]:null;
  const formula=SOLID_FORMULAS.find(f=>f.id===question.formulaId);
  const lesson=SOLID_LESSONS.find(l=>l.topic_id===question.topic_id);
  const attemptedInFilter=filtered.filter(i=>Object.hasOwn(answers,SOLID_PRACTICE[i].id)).length;
  const changedFilter=()=>setHintVisible(false);
  const statusText=status==='missed'?'incorrect answers':status==='unanswered'?'unanswered questions':'questions';
  return <section className="space-y-4" id="solid-mensuration-practice-panel" aria-label="Solid Mensuration question practice">
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div><h2 className="font-black text-slate-950">Guided and adaptive practice</h2><p className="text-xs text-slate-600">{SOLID_PRACTICE.length} original questions · 43 lesson topics · results stay in this session</p></div>
        <div className="flex flex-wrap gap-2"><span className="rounded-lg bg-indigo-50 text-indigo-800 px-3 py-1.5 text-xs font-semibold">{total} attempted</span><span className="rounded-lg bg-emerald-50 text-emerald-800 px-3 py-1.5 text-xs font-semibold">{score} correct</span><span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold">{total?Math.round(score/total*100):0}% accuracy</span></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <label className="text-xs font-bold text-slate-700">Unit<select aria-label="Filter practice by unit" value={unit} onChange={e=>{setUnit(e.target.value);setTopic('all');changedFilter()}} className={`${fieldClass} mt-1`}><option value="all">All units</option>{SOLID_UNITS.map(u=><option key={u.unit_id} value={u.unit_id}>{u.name}</option>)}</select></label>
        <label className="text-xs font-bold text-slate-700">Topic<select aria-label="Filter practice by lesson topic" value={topic} onChange={e=>{setTopic(e.target.value);changedFilter()}} className={`${fieldClass} mt-1`}><option value="all">All topics</option>{SOLID_LESSONS.filter(l=>unit==='all'||l.unit_id===unit).map(l=><option key={l.topic_id} value={l.topic_id}>{l.topic_id} · {l.title}</option>)}</select></label>
        <label className="text-xs font-bold text-slate-700">Difficulty<select aria-label="Filter practice by difficulty" value={difficulty} onChange={e=>{setDifficulty(e.target.value);changedFilter()}} className={`${fieldClass} mt-1`}><option value="all">All difficulties</option><option>Foundation</option><option>Applied</option><option>Challenge</option></select></label>
        <label className="text-xs font-bold text-slate-700">Answer status<select aria-label="Filter practice by answer status" value={status} onChange={e=>{setStatus(e.target.value);changedFilter()}} className={`${fieldClass} mt-1`}><option value="all">All questions</option><option value="unanswered">Unanswered</option><option value="missed">Incorrect only</option></select></label>
        <label className="text-xs font-bold text-slate-700">Sequence<select aria-label="Practice sequence mode" value={mode} onChange={e=>setMode(e.target.value as typeof mode)} className={`${fieldClass} mt-1`}><option value="guided">Sequential</option><option value="adaptive">Adaptive suggestions</option></select></label>
      </div>
      <p className="text-xs text-slate-600">{filtered.length} {statusText} match · {attemptedInFilter} attempted in this view. Adaptive recommendations focus on recently missed topics and adjust difficulty after at least four answers; they do not modify formal grades.</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-4">
      <aside className="rounded-2xl bg-white border border-slate-200 p-4 h-fit lg:max-h-[70vh] lg:overflow-y-auto">
        <div className="flex justify-between gap-2 items-center"><span className="font-bold text-slate-900 text-sm">Question navigator</span><button type="button" onClick={()=>{setAnswers({});setStatus('all')}} className="text-xs text-indigo-700 font-semibold inline-flex gap-1 items-center"><RotateCcw size={14}/> Reset answers</button></div>
        <div className="mt-3 grid grid-cols-6 sm:grid-cols-10 lg:grid-cols-5 gap-1.5" aria-label="Practice question navigation">
          {filtered.map(i=>{const q=SOLID_PRACTICE[i];const value=answers[q.id];return <button key={q.id} type="button" onClick={()=>setSelectedIndex(i)} aria-label={`Open question ${i+1}, ${q.topic_id}, ${q.level}`} aria-current={i===selectedIndex?'true':undefined} title={`${q.topic_id}: ${q.title}`} className={`rounded-lg aspect-square border text-xs font-semibold ${i===selectedIndex?'bg-indigo-600 border-indigo-600 text-white':value===undefined?'bg-white border-slate-200 text-slate-700 hover:bg-slate-50':value===q.correctIndex?'bg-emerald-50 border-emerald-200 text-emerald-800':'bg-rose-50 border-rose-200 text-rose-800'}`}>{i+1}</button>})}
        </div>
        {!filtered.length&&<p role="status" className="text-sm text-slate-600 mt-4">No matching questions. Change the filters to continue.</p>}
        <p className="text-[11px] text-amber-800 mt-4">Draft practice only. Green indicates correct and red indicates incorrect. No official ECE board weighting is applied.</p>
      </aside>
      {inFilter?<article className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-sm min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-xs text-indigo-700">{question.id} · {question.topic_id}</span><span className="text-xs text-slate-500">{position+1} of {filtered.length} in selection</span></div>
        <p className="text-xs text-slate-500 mt-2">{lesson?.title} · <strong>{question.level}</strong> · {question.kind==='numeric'?'Numerical calculation':'Spatial reasoning'}</p>
        <h3 className="text-lg font-black text-slate-950 mt-3">{question.title}</h3><p className="text-slate-700 leading-7 mt-2">{question.prompt}</p>
        <div className="max-w-sm mt-3"><SolidGeometryIllustration topicId={question.topic_id} compact/></div>
        <div className="mt-3 flex flex-wrap gap-2 items-center"><button type="button" onClick={()=>setHintVisible(v=>!v)} aria-expanded={hintVisible} className="inline-flex items-center gap-2 rounded-lg border border-amber-200 text-amber-800 bg-amber-50 px-3 py-2 text-xs font-semibold"><Lightbulb size={15}/>{hintVisible?'Hide formula hint':'Show formula hint'}</button>{mode==='adaptive'&&<span className="inline-flex items-center gap-1 text-xs text-indigo-600"><Compass size={14}/>Adaptive guidance is active</span>}</div>
        {hintVisible&&<div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 mt-2 text-sm text-slate-700">{formula?<><strong>Relevant formula: {formula.name}</strong><div className="overflow-auto my-2"><BlockMath math={formula.latex}/></div><p className="text-xs">Applicable when: {formula.conditions}</p></>:<p>Identify the geometric definitions and relationships in the question before choosing.</p>}</div>}
        <div className="mt-4 space-y-2" role="group" aria-label="Answer choices">
          {question.options.map((value,i)=><button type="button" key={i} disabled={attempted} aria-pressed={attempted?answers[question.id]===i:undefined} onClick={()=>{setAnswers(previous=>({...previous,[question.id]:i}));if(status==='unanswered')setStatus('all');}} className={`w-full flex items-center gap-3 text-left rounded-xl border p-3 text-sm ${attempted&&i===question.correctIndex?'bg-emerald-50 border-emerald-400 text-emerald-900':attempted&&i===answers[question.id]?'bg-rose-50 border-rose-300 text-rose-900':'bg-white border-slate-200 hover:border-indigo-400 disabled:cursor-default'}`}><span className="w-5 font-bold">{String.fromCharCode(65+i)}.</span><span>{formatChoice(value,question.unit)}</span>{attempted&&i===question.correctIndex&&<CheckCircle2 size={17} className="ml-auto text-emerald-700"/>}</button>)}
        </div>
        {attempted&&<div role="status" className="rounded-xl mt-4 p-4 bg-slate-50 border border-slate-200"><div className="flex flex-wrap justify-between items-center gap-2"><p className="font-bold text-sm text-slate-900">{answers[question.id]===question.correctIndex?'Correct':'Review and retry'}</p>{answers[question.id]!==question.correctIndex&&<button type="button" onClick={()=>{setAnswers(old=>{const next={...old};delete next[question.id];return next});setStatus('all')}} className="text-xs text-indigo-700 font-bold">Try this question again</button>}</div><p className="text-sm text-slate-700 mt-2"><strong>Verified answer:</strong> {displayPracticeAnswer(question)}</p><ol className="list-decimal pl-5 mt-3 space-y-2 text-sm text-slate-700">{question.work.map((step,i)=><li key={i}>{step}</li>)}</ol>{question.restriction&&<p className="text-xs text-amber-800 mt-3"><strong>Condition:</strong> {question.restriction}</p>}</div>}
        <div className="flex justify-between gap-3 flex-wrap mt-5"><button type="button" disabled={previousIndex===null} onClick={()=>{if(previousIndex!==null)setSelectedIndex(previousIndex)}} className="inline-flex gap-1 items-center rounded-lg border px-3 py-2 text-sm disabled:opacity-40"><ArrowLeft size={15}/>Previous</button><button type="button" disabled={nextIndex===null} onClick={()=>{if(nextIndex!==null)setSelectedIndex(nextIndex)}} className="inline-flex gap-1 items-center rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-bold disabled:opacity-40">{mode==='adaptive'?'Next recommended':'Next question'}<ArrowRight size={15}/></button></div>
      </article>:<article className="rounded-2xl bg-white border border-slate-200 p-6 text-slate-600 text-sm" role="status">No question is selected in this filter. {filtered.length?'Select a numbered question to continue.':'Try removing the difficulty, topic, or answer-status filter.'}</article>}
    </div>
  </section>;
};
