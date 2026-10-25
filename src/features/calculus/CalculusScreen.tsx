import React,{useEffect,useMemo,useState} from 'react';
import {ArrowLeft,BookOpen,ChevronDown,ChevronRight,ClipboardCheck,FileText,ListChecks,Search,ShieldAlert} from 'lucide-react';
import {TreeMenuHeader} from '../../components/TreeMenuHeader';
import {MathFormula} from '../../components/MathFormula';
import {LearnReaderLayout} from '../../components/learn-reader/LearnReaderLayout';
import {ManualLearnTracker} from '../../components/learn-reader/ManualLearnTracker';
import {getManualLearnRecord,MANUAL_LEARN_CHANGED_EVENT,readManualLearnStore} from '../../domain/learn/manualLearnTracking';
import {useReview} from '../../context/ReviewContext';
import {CALCULUS_MODULES,CALCULUS_LESSONS,CALCULUS_BLUEPRINT,type CalculusSubject} from './calculusContent';
import {CALCULUS_QUESTIONS,CALCULUS_EXAM_READY,CALCULUS_APPROVED_EXAM_QUESTION_IDS} from './calculusQuestions';

type Tab='lessons'|'formulas'|'practice'|'review';
const trackingId=(id:string)=>'chapter-top-calculus-'+id;
const tone=(subject:CalculusSubject)=>subject==='differential'?'cyan':'amber';
const buttonClass='rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-500';

export const CalculusScreen:React.FC<{subject:CalculusSubject}>=({subject})=>{
 const {setCurrentScreen,setIsLearnReaderActive}=useReview();
 const modules=useMemo(()=>CALCULUS_MODULES.filter(x=>x.subject===subject),[subject]);
 const name=subject==='differential'?'Differential Calculus':'Integral Calculus';
 const [tab,setTab]=useState<Tab>('lessons');
 const [expanded,setExpanded]=useState(subject==='differential'?'DC01':'IC01');
 const [opened,setOpened]=useState<string|null>(null);
 const [query,setQuery]=useState('');
 const [practiceModule,setPracticeModule]=useState(subject==='differential'?'DC01':'IC01');
 const [selectedQuestion,setSelectedQuestion]=useState(0);
 const [answers,setAnswers]=useState<Record<string,number>>({});
 const [manual,setManual]=useState(readManualLearnStore);
 const closeLesson=()=>{setOpened(null);setIsLearnReaderActive(false)};
 useEffect(()=>{const f=()=>setManual(readManualLearnStore());window.addEventListener(MANUAL_LEARN_CHANGED_EVENT,f);return()=>window.removeEventListener(MANUAL_LEARN_CHANGED_EVENT,f)},[]);
 useEffect(()=>()=>setIsLearnReaderActive(false),[setIsLearnReaderActive]);
 useEffect(()=>{setOpened(null);setIsLearnReaderActive(false);setTab('lessons');setExpanded(subject==='differential'?'DC01':'IC01');setPracticeModule(subject==='differential'?'DC01':'IC01');setSelectedQuestion(0);setAnswers({})},[subject,setIsLearnReaderActive]);
 const lessonEntries=useMemo(()=>modules.flatMap(m=>Object.values(CALCULUS_LESSONS).filter(l=>l.id.startsWith(m.id.toLowerCase()))),[modules]);
 const chosen=opened?CALCULUS_LESSONS[opened]:null;
 const activeModule=modules.find(m=>m.id===practiceModule)??modules[0];
 const practice=CALCULUS_QUESTIONS.filter(q=>q.moduleId===activeModule?.id);
 const question=practice[selectedQuestion]??practice[0];
 const openLesson=(id:string)=>{if(!CALCULUS_LESSONS[id])return;setOpened(id);setIsLearnReaderActive(true);setTab('lessons')};
 const chooseTab=(next:Tab)=>{closeLesson();setTab(next)};
 const studied=lessonEntries.filter(l=>{const r=getManualLearnRecord(manual,trackingId(l.id));return r.reviewCount>0||r.selfStatus!=='unrated'}).length;
 const filtered=lessonEntries.filter(l=>(l.title+' '+l.id+' '+l.summary).toLowerCase().includes(query.trim().toLowerCase()));
 const answered=question?answers[question.id]:undefined;
 return <div id={subject+'-calculus-app-screen'} className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
  <TreeMenuHeader items={[{label:'Mathematics',onClick:()=>setCurrentScreen('mathematics')},{label:name,isActive:true}]} backButton={{label:'Back to Mathematics',onClick:()=>{closeLesson();setCurrentScreen('mathematics')}}}/>
  <div className="flex-1 overflow-y-auto"><div className="mx-auto max-w-[1180px] space-y-4 p-4 sm:p-6">
   {chosen?<>
    <button type="button" className={buttonClass+' inline-flex items-center gap-2'} onClick={closeLesson}><ArrowLeft size={16}/> All {name} lessons</button>
    <section className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-800">{chosen.id.toUpperCase()} · Original editorial draft / ungraded</p><h1 className="mt-1 text-xl font-extrabold text-slate-900">{chosen.title}</h1><p className="mt-2 text-sm text-slate-600">{chosen.summary}</p></section>
    <ManualLearnTracker trackingId={trackingId(chosen.id)} scopeLabel={name+' · '+chosen.title} compact/>
    <LearnReaderLayout key={chosen.id} lesson={chosen} trackingId={trackingId(chosen.id)} trackingScopeLabel={name+' · '+chosen.title} onPractice={()=>{closeLesson();setPracticeModule(chosen.id.slice(0,4).toUpperCase());setSelectedQuestion(0);setTab('practice')}} onClose={closeLesson}/>
   </>:<>
    <header className="flex items-center gap-3"><span className={'rounded-2xl p-3 '+(subject==='differential'?'bg-cyan-100 text-cyan-800':'bg-amber-100 text-amber-800')}><BookOpen size={27}/></span><div><h1 className="text-xl font-black text-slate-900 sm:text-2xl">{name}</h1><p className="text-sm text-slate-600">Core Engineering Mathematics · {modules.length} TOS groups · {lessonEntries.length} authored draft lessons</p></div></header>
    <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><strong>Developmental content.</strong> These are original, ungraded editorial lessons and practice variants, not certified board questions. The full subtopic roadmap exceeds the currently authored lessons; self-reported reading does not establish examination readiness.</p>
    <nav className="flex flex-wrap gap-2" aria-label={name+' activities'}>
     {([{id:'lessons',label:'Lessons',Icon:BookOpen},{id:'formulas',label:'Formulas',Icon:FileText},{id:'practice',label:'Practice',Icon:ListChecks},{id:'review',label:'Review status',Icon:ClipboardCheck}] as const).map(item=><button type="button" key={item.id} aria-current={tab===item.id?'page':undefined} onClick={()=>chooseTab(item.id)} className={'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold focus-visible:outline-2 focus-visible:outline-blue-500 '+(tab===item.id?'bg-blue-700 text-white':'border border-slate-200 bg-white text-slate-700 hover:bg-blue-50')}><item.Icon size={16}/>{item.label}</button>)}
    </nav>
    {tab==='lessons'&&<div className="space-y-3">
     <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm font-semibold text-slate-800">{studied} / {lessonEntries.length} authored drafts have self-reported study activity</p><p className="text-xs text-slate-600">Planned subtopics are listed as a roadmap. Only authored lessons are clickable; neither status implies a verified answer bank.</p><label className="block text-xs font-bold text-slate-700">Search authored lessons<input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Title or concept"/></label></section>
     {modules.map(m=>{const lessons=filtered.filter(l=>l.id.startsWith(m.id.toLowerCase()));if(query.trim()&&!lessons.length)return null;const expandedNow=expanded===m.id||!!query.trim();return <section key={m.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button type="button" aria-expanded={expandedNow} className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-blue-50" onClick={()=>{setExpanded(expandedNow?'':m.id);setQuery('')}}><span><strong className="text-sm text-slate-900">{m.id} · {m.title}</strong><span className="mt-1 block text-xs text-slate-500">PRC group {m.tos} · {lessons.length} authored draft lessons · {m.topics.length} planned topic families</span></span>{expandedNow?<ChevronDown size={18}/>:<ChevronRight size={18}/>}</button>
      {expandedNow&&<div className="border-t border-slate-100">
       {lessons.map(l=>{const progress=getManualLearnRecord(manual,trackingId(l.id));return <button type="button" key={l.id} onClick={()=>openLesson(l.id)} className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-blue-50"><BookOpen size={17} className="shrink-0 text-blue-700"/><span className="min-w-0 flex-1"><strong className="block text-sm text-slate-900">{l.title}</strong><span className="block text-xs text-slate-500">{l.summary}</span></span><span className="text-xs text-amber-900">{progress.reviewCount>0?'Studied · draft':'Draft'}</span><ChevronRight size={15}/></button>})}
       <div className="bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-600">Planned topic families (not all fully authored)</p><ul className="mt-1 list-inside list-disc text-xs text-slate-600">{m.topics.map(t=><li key={t}>{t}</li>)}</ul></div>
      </div>}
     </section>})}
    </div>}
    {tab==='formulas'&&<section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6"><h2 className="text-lg font-bold">Formula reference · authored draft lessons</h2><p className="text-sm text-slate-600">These are selected formulas from the current lessons. Read the conditions before applying them.</p>{lessonEntries.map(l=>{const formulas=l.sections.flatMap(s=>s.blocks).filter((b):b is Extract<typeof l.sections[number]['blocks'][number],{type:'formula'}>=>b.type==='formula');return <div key={l.id} className="space-y-2 rounded-xl border p-3"><h3 className="font-semibold text-slate-800">{l.title}</h3>{formulas.map(f=><div key={f.id}><div className="max-w-full overflow-x-auto"><MathFormula formula={f.latex} block/></div>{f.description&&<p className="mt-1 text-xs text-amber-900">{f.description}</p>}</div>)}<button type="button" className="text-sm font-bold text-blue-700 underline" onClick={()=>openLesson(l.id)}>Open lesson</button></div>})}</section>}
    {tab==='practice'&&<section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">Original topic practice · ungraded draft</h2><p className="text-sm text-amber-900">Checks on this page show the draft answer and explanation. Results are not saved as official scores or counted toward readiness.</p>
      <label className="block text-sm font-semibold">Topic group<select className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5" value={activeModule?.id??''} onChange={e=>{setPracticeModule(e.target.value);setSelectedQuestion(0)}}>{modules.map(m=><option key={m.id} value={m.id}>{m.id} · {m.title}</option>)}</select></label>
      {question&&<div className="space-y-3 rounded-xl border border-slate-200 p-4" key={question.id}>
       <p className="text-xs font-bold uppercase text-slate-500">Draft item {selectedQuestion+1} of {practice.length} · {question.cognitive}</p>
       <h3 className="font-semibold text-slate-900">{question.prompt}</h3>
       <div className="grid gap-2">{question.options.map((o,i)=><button type="button" key={i} disabled={answered!==undefined} onClick={()=>setAnswers(v=>({...v,[question.id]:i}))} className={'rounded-lg border p-3 text-left text-sm '+(answered!==undefined&&i===question.correctIndex?'border-emerald-400 bg-emerald-50 text-emerald-950':answered===i?'border-rose-400 bg-rose-50':'border-slate-200 hover:border-blue-300')}>{String.fromCharCode(65+i)}. {o}</button>)}</div>
       {answered!==undefined&&<div role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"><strong>{answered===question.correctIndex?'Matches draft answer':'Different from draft answer'}</strong><p className="mt-1">Draft solution: {question.explanation}</p></div>}
       <div className="flex flex-wrap items-center justify-between gap-2"><button type="button" className={buttonClass} disabled={selectedQuestion===0} onClick={()=>setSelectedQuestion(i=>Math.max(0,i-1))}>Previous</button><button type="button" className={buttonClass} disabled={selectedQuestion===practice.length-1} onClick={()=>setSelectedQuestion(i=>Math.min(practice.length-1,i+1))}>Next item</button></div>
      </div>}
    </section>}
    {tab==='review'&&<section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><ShieldAlert size={20} className="text-amber-700"/>Editorial and examination status</h2><p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{CALCULUS_APPROVED_EXAM_QUESTION_IDS.length} independently approved Calculus exam items. Full board-exam readiness: {CALCULUS_EXAM_READY?'Approved':'Not approved'}.</p><p className="text-sm text-slate-700">{lessonEntries.length} authored draft lessons; {CALCULUS_QUESTIONS.filter(x=>modules.some(m=>m.id===x.moduleId)).length} original practice variants; all pending independent mathematical and editorial review.</p><div className="overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><thead><tr className="border-b text-left"><th className="py-2">PRC group</th><th>Items</th><th>Authored lessons</th><th>Draft practice</th></tr></thead><tbody>{modules.map(m=><tr key={m.id} className="border-b border-slate-100"><td className="py-2">{m.id} · {m.title}</td><td>{m.items}</td><td>{lessonEntries.filter(l=>l.id.startsWith(m.id.toLowerCase())).length}</td><td>{CALCULUS_QUESTIONS.filter(q=>q.moduleId===m.id).length}</td></tr>)}</tbody></table></div><p className="text-xs text-slate-600">{CALCULUS_BLUEPRINT.version}. Cognitive totals for this subject: {Object.entries(CALCULUS_BLUEPRINT[subject]).map(([key,value])=>key+': '+value).join('; ')}. Those totals are blueprint targets, not achieved certification.</p></section>}
   </>}
  </div></div>
 </div>;
};
