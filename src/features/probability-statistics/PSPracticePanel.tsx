import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PS_LESSONS, PS_MODULES, PS_PRACTICE_QUESTIONS, PS_QUESTION_REVIEW, type PSQuestion } from './psContent';

interface Props { initialTopic?:string; initialModule?:string; }
export const PSPracticePanel:React.FC<Props>=({initialTopic,initialModule})=>{
  const [moduleId,setModuleId]=useState(initialModule||'all');
  const [topicId,setTopicId]=useState(initialTopic||'all');
  const [index,setIndex]=useState(0);
  const [selected,setSelected]=useState<number|null>(null);
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [onlyMissed,setOnlyMissed]=useState(false);
  const filtered=useMemo(()=>PS_PRACTICE_QUESTIONS.filter(q=>
    (moduleId==='all'||PS_LESSONS.find(l=>l.id===q.topicId)?.moduleId===moduleId)&&
    (topicId==='all'||q.topicId===topicId)&&
    (!onlyMissed||(answers[q.id]!==undefined&&answers[q.id]!==q.correctIndex))
  ),[moduleId,topicId,onlyMissed,answers]);
  const pos=Math.min(index,Math.max(filtered.length-1,0));
  const q:PSQuestion|undefined=filtered[pos];
  const checked=q?answers[q.id]!==undefined:false;
  const attempted=Object.keys(answers).length;
  const correct=PS_PRACTICE_QUESTIONS.filter(item=>answers[item.id]===item.correctIndex).length;
  const move=(n:number)=>{setIndex(n);setSelected(null)};
  const changeModule=(next:string)=>{setModuleId(next);setTopicId('all');move(0);setOnlyMissed(false)};
  const changeTopic=(next:string)=>{setTopicId(next);move(0);setOnlyMissed(false)};
  return <div className="space-y-4" id="ps-practice-panel">
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-extrabold text-lg text-slate-900">Practice Questions</h2><p className="text-sm text-slate-600">{PS_PRACTICE_QUESTIONS.length} new independent practice questions · no answers pre-shown in lessons · session-only feedback</p></div><p className="text-xs font-semibold text-indigo-800" role="status">{attempted} checked · {correct} correct</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs font-bold text-slate-700">Module<select aria-label="Probability Statistics practice module" value={moduleId} onChange={e=>changeModule(e.target.value)} className="block mt-1 w-full border border-slate-300 rounded-lg bg-white p-2.5 text-sm"><option value="all">All modules</option>{PS_MODULES.map(m=><option value={m.id} key={m.id}>{m.title}</option>)}</select></label>
        <label className="text-xs font-bold text-slate-700">Lesson<select aria-label="Probability Statistics practice lesson" value={topicId} onChange={e=>changeTopic(e.target.value)} className="block mt-1 w-full border border-slate-300 rounded-lg bg-white p-2.5 text-sm"><option value="all">All lessons</option>{PS_LESSONS.filter(l=>moduleId==='all'||l.moduleId===moduleId).map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
      </div>
      <label className="flex gap-2 items-center text-xs font-semibold text-slate-600"><input type="checkbox" checked={onlyMissed} onChange={e=>{setOnlyMissed(e.target.checked);move(0)}}/> Review incorrect answers</label>
    </section>
    {q?<article className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-7 space-y-5 min-w-0">
      <div className="flex justify-between text-xs font-semibold text-indigo-700"><span>{q.topicId} · {q.level}</span><span>Question {pos+1} / {filtered.length}</span></div>
      <h3 className="text-base sm:text-lg font-bold leading-7 text-slate-900">{q.prompt}</h3>
      <div role="radiogroup" aria-label="Answer choices" className="space-y-2">{q.options.map((opt,i)=><button key={i} type="button" role="radio" aria-checked={(checked?answers[q.id]:selected)===i} disabled={checked} onClick={()=>setSelected(i)} className={`flex w-full text-left items-center gap-3 border rounded-xl p-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 ${checked&&i===q.correctIndex?'border-emerald-500 bg-emerald-50 text-emerald-900':checked&&i===answers[q.id]?'border-rose-400 bg-rose-50 text-rose-900':!checked&&selected===i?'border-indigo-500 bg-indigo-50 text-indigo-900':'border-slate-200 bg-white text-slate-800 hover:bg-indigo-50'} disabled:cursor-default`}><span className="font-black w-6">{String.fromCharCode(65+i)}.</span><span>{opt}</span>{checked&&i===q.correctIndex&&<CheckCircle2 className="ml-auto text-emerald-700" size={18}/>}</button>)}</div>
      {!checked?<button type="button" disabled={selected===null} onClick={()=>{if(selected!==null)setAnswers(prev=>({...prev,[q.id]:selected}))}} className="rounded-xl bg-indigo-700 px-5 py-2.5 font-bold text-white disabled:opacity-40">Check Answer</button>:<div role="status" className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2"><strong className="text-sm">{answers[q.id]===q.correctIndex?'Correct.':'Review this solution.'} Answer: {q.options[q.correctIndex]}</strong><ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">{q.work.map((step,i)=><li key={i}>{step}</li>)}</ol><p className="text-xs text-amber-800">Important: {q.restriction}</p><p className="text-xs text-slate-600">Editorial status: {PS_QUESTION_REVIEW[q.id]?.reviewStatus??"not mapped"}. PRC classification is provisional; this item is not certified for scored board examinations.</p></div>}
      <div className="flex justify-between gap-2"><button type="button" disabled={pos===0} onClick={()=>move(pos-1)} className="flex gap-1 items-center rounded-lg border px-3 py-2 text-sm disabled:opacity-40"><ArrowLeft size={16}/>Previous</button><button type="button" disabled={pos>=filtered.length-1} onClick={()=>move(pos+1)} className="flex gap-1 items-center rounded-lg bg-indigo-700 text-white px-3 py-2 text-sm disabled:opacity-40">Next<ArrowRight size={16}/></button></div>
    </article>:<section role="status" className="rounded-xl border p-5 bg-white text-slate-600">No questions match this selection. Change the filters to continue.</section>}
    <p className="text-xs text-amber-800">Unseen relative to the lesson worked examples, not yet externally reviewed or certified for scored board exams. Responses stay in this session and are not saved as assessed mastery.</p>
  </div>;
};
