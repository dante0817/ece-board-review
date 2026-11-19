import React,{useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Eye,RotateCcw} from 'lucide-react';
import {getPhysicsGroups} from './physicsCatalog';
import {PHYSICS_ENGINEER_QUESTIONS,physicsEngineerQuestionsForLesson} from './physicsEngineersQuestions';

interface Props { initialLessonId?:string|null; onBack:()=>void; onLearnLesson?:(lessonId:string)=>void }
/** Educational preview, intentionally separated from scored exams and mastery. */
export const PhysicsEngineersPracticePanel:React.FC<Props>=({initialLessonId,onBack,onLearnLesson})=>{
  const [groupId,setGroupId]=useState('all');
  const [index,setIndex]=useState(0);
  const [choice,setChoice]=useState<number|null>(null);
  const [reveal,setReveal]=useState(false);
  const groupList=getPhysicsGroups('geas-physics');
  const filtered=useMemo(()=>initialLessonId
    ?physicsEngineerQuestionsForLesson(initialLessonId)
    :PHYSICS_ENGINEER_QUESTIONS.filter(q=>groupId==='all'||q.groupId===groupId),
    [initialLessonId,groupId]);
  const safeIndex=Math.max(0,Math.min(index,filtered.length-1));
  const question=filtered[safeIndex];
  const move=(next:number)=>{setIndex(next);setChoice(null);setReveal(false)};
  return <section id="physics-engineers-ungraded-practice" aria-label="Physics for Engineers ungraded practice" className="space-y-4">
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-3">
      <div className="flex justify-between gap-3 flex-wrap items-start">
        <div><p className="text-xs font-bold uppercase tracking-wide text-blue-700">Development practice — not scored</p>
          <h2 className="text-xl font-bold text-slate-900">Physics for Engineers practice</h2>
          <p className="text-sm text-slate-600 mt-1">{filtered.length} original draft questions shown. Answers and TOS classifications await independent review.</p>
        </div>
        <button type="button" onClick={onBack} className="inline-flex gap-2 items-center px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-sm"><ArrowLeft size={16}/>Course outline</button>
      </div>
      {!initialLessonId&&<label className="block text-sm font-semibold text-slate-700">Choose a PRC topic group
        <select value={groupId} onChange={e=>{setGroupId(e.target.value);move(0)}} className="block mt-1 rounded-lg border border-slate-300 px-3 py-2 w-full sm:max-w-lg bg-white">
          <option value="all">All topic groups (75 draft questions)</option>
          {groupList.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </label>}
      <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
        These are formative questions. Selecting or revealing an answer does not affect board-readiness scores, mock-exam results or verified question counts.
      </div>
    </div>
    {question?<article key={question.id} className="bg-white border border-slate-200 rounded-xl shadow-xs p-4 sm:p-6 space-y-4">
      <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500 font-medium">
        <span>Question {safeIndex+1} of {filtered.length} · {question.cognitive}</span><span>{question.id}</span>
      </div>
      <p className="text-base sm:text-lg leading-relaxed font-semibold text-slate-900">{question.stem}</p>
      <div className="space-y-2" role="radiogroup" aria-label="Choose your tentative answer">
        {question.options.map((option,i)=><label key={i} className={`flex items-start gap-3 border rounded-lg p-3 cursor-pointer text-sm sm:text-base ${choice===i?'border-blue-500 bg-blue-50':'border-slate-200 hover:bg-slate-50'}`}>
          <input type="radio" checked={choice===i} onChange={()=>{setChoice(i);setReveal(false)}} name={question.id} className="mt-1 accent-blue-700"/>
          <span className="font-bold text-blue-800 shrink-0">{String.fromCharCode(65+i)}.</span><span>{option}</span>
        </label>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={()=>setReveal(v=>!v)} className="inline-flex items-center gap-2 bg-blue-700 text-white rounded-lg px-4 py-2.5 font-semibold text-sm hover:bg-blue-800"><Eye size={16}/>{reveal?'Hide explanation':'Reveal answer and explanation'}</button>
        <button type="button" onClick={()=>{setChoice(null);setReveal(false)}} className="inline-flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-700"><RotateCcw size={16}/>Reset choice</button>
        {onLearnLesson&&<button type="button" onClick={()=>onLearnLesson(question.lessonId)} className="inline-flex items-center gap-2 border border-blue-200 text-blue-700 rounded-lg px-3 py-2.5 text-sm font-semibold"><BookOpen size={16}/>Read related lesson</button>}
      </div>
      {reveal&&<div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4 space-y-2" role="status">
        <p className="font-bold text-indigo-950">Draft answer: {String.fromCharCode(65+question.correctIndex)}. {question.options[question.correctIndex]}</p>
        {choice!==null&&<p className="text-sm text-indigo-800">Your selected choice {String.fromCharCode(65+choice)} is {choice===question.correctIndex?'consistent with':'different from'} this draft answer. This is ungraded feedback.</p>}
        <p className="text-sm leading-relaxed text-slate-800">{question.explanation}</p>
      </div>}
      <div className="flex justify-between items-center gap-2 pt-4 border-t border-slate-200">
        <button type="button" disabled={safeIndex===0} onClick={()=>move(safeIndex-1)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold disabled:opacity-40">Previous</button>
        <button type="button" disabled={safeIndex>=filtered.length-1} onClick={()=>move(safeIndex+1)} className="inline-flex gap-2 items-center px-3 py-2 rounded-lg bg-blue-700 text-white text-sm font-bold disabled:opacity-40">Next <ArrowRight size={16}/></button>
      </div>
    </article>:<div role="alert" className="bg-white rounded-xl border border-slate-200 p-5 text-sm text-slate-700">No questions are available for the selected lesson.</div>}
  </section>;
};
