import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, FileText, ListChecks } from 'lucide-react';
import { useReview } from '../../context/ReviewContext';
import { TreeMenuHeader } from '../../components/TreeMenuHeader';
import { FeatureIcon } from '../../components/common/FeatureIcon';
import { LearnReaderLayout } from '../../components/learn-reader/LearnReaderLayout';
import { ManualLearnTracker } from '../../components/learn-reader/ManualLearnTracker';
import { getManualLearnRecord, MANUAL_LEARN_CHANGED_EVENT, readManualLearnStore } from '../../domain/learn/manualLearnTracking';
import { MathFormula } from '../../components/MathFormula';
import { PS_LESSONS, PS_MODULES, PS_READER_LESSONS, PS_PRACTICE_QUESTIONS, PS_BLUEPRINT, PS_BOARD_EXAM_READY, PS_BOARD_EXAM_QUESTIONS, PS_READINESS_PREFLIGHT, PS_COGNITIVE_PREFLIGHT, PS_JOINT_BLUEPRINT_FEASIBLE, PS_EDITORIAL_PREFLIGHT, PS_PRELIMINARY_CONCEPT_REVIEW, PS_SOURCE_SECTION_EVIDENCE, psTrackingId } from './psContent';
import { PSPracticePanel } from './PSPracticePanel';

type Tab='learn'|'formulas'|'practice'|'readiness';
export const ProbabilityStatisticsScreen:React.FC=()=>{
  const {setCurrentScreen,setIsLearnReaderActive}=useReview();
  const [tab,setTab]=useState<Tab>('learn');
  const [opened,setOpened]=useState<string|null>(null);
  const [expanded,setExpanded]=useState('PS01');
  const [search,setSearch]=useState('');
  const [initialTopic,setInitialTopic]=useState('');
  const [initialModule,setInitialModule]=useState('');
  const [manualStore,setManualStore]=useState(readManualLearnStore);
  useEffect(()=>{const onChange=()=>setManualStore(readManualLearnStore());window.addEventListener(MANUAL_LEARN_CHANGED_EVENT,onChange);return()=>window.removeEventListener(MANUAL_LEARN_CHANGED_EVENT,onChange)},[]);
  useEffect(()=>()=>setIsLearnReaderActive(false),[setIsLearnReaderActive]);
  const openLesson=(id:string)=>{setTab('learn');setOpened(id);setIsLearnReaderActive(true)};
  const closeLesson=()=>{setOpened(null);setIsLearnReaderActive(false)};
  const openPractice=(topic='',module='')=>{closeLesson();setInitialTopic(topic);setInitialModule(module);setTab('practice')};
  const chosen=PS_LESSONS.find(l=>l.id===opened);
  const matching=useMemo(()=>PS_LESSONS.filter(l=>`${l.id} ${l.title} ${l.concept}`.toLowerCase().includes(search.trim().toLowerCase())),[search]);
  const studied=PS_LESSONS.filter(l=>{const r=getManualLearnRecord(manualStore,psTrackingId(l.id));return r.reviewCount>0||r.selfStatus!=='unrated'}).length;
  return <div id="probability-statistics-app-screen" className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
    <TreeMenuHeader items={[{label:'Mathematics',onClick:()=>setCurrentScreen('mathematics')},{label:'Probability & Statistics',isActive:true}]} backButton={{label:'Back to Mathematics',onClick:()=>setCurrentScreen('mathematics')}}/>
    <div className="flex-1 overflow-y-auto" id="ps-scroll-region"><div className="max-w-[1180px] mx-auto p-4 sm:p-6 space-y-4">
      {chosen&&opened?<>
        <button type="button" onClick={closeLesson} className="inline-flex gap-2 items-center rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700"><ArrowLeft size={16}/>Back to Probability & Statistics</button>
        <section className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5"><p className="text-xs text-indigo-700 font-bold">{chosen.id} · Development lesson</p><h1 className="text-xl font-extrabold mt-1 text-slate-900">{chosen.title}</h1><p className="mt-2 text-sm text-slate-600">{chosen.summary}</p></section>
        <ManualLearnTracker trackingId={psTrackingId(chosen.id)} scopeLabel={`Probability & Statistics · ${chosen.title}`} compact/>
        <LearnReaderLayout key={chosen.id} lesson={PS_READER_LESSONS[chosen.id]} trackingId={psTrackingId(chosen.id)} trackingScopeLabel={`Probability & Statistics · ${chosen.title}`} onPractice={()=>openPractice(chosen.id,chosen.moduleId)} onClose={closeLesson}/>
        <button type="button" onClick={()=>openPractice(chosen.id,chosen.moduleId)} className="rounded-xl bg-indigo-700 text-white px-4 py-3 font-semibold text-sm">Practice this lesson</button>
      </>:<>
        <header className="flex items-center gap-3"><FeatureIcon name="mathematics" size="large"/><div><h1 className="text-xl sm:text-2xl font-black text-slate-900">Probability & Statistics</h1><p className="text-sm text-slate-600">Engineering Data Analysis · 8 modules · {PS_LESSONS.length} introductory draft lessons · {PS_PRACTICE_QUESTIONS.length} independent development practice questions</p></div></header>
        <nav className="flex gap-2 flex-wrap" aria-label="Probability Statistics activities">
          {([{id:'learn',label:'Lessons',Icon:BookOpen},{id:'formulas',label:'Formulas',Icon:FileText},{id:'practice',label:'Practice',Icon:ListChecks},{id:'readiness',label:'Review status',Icon:FileText}] as const).map(t=><button key={t.id} type="button" id={`ps-tab-${t.id}`} aria-current={tab===t.id?'page':undefined} onClick={()=>{closeLesson();setTab(t.id)}} className={`inline-flex gap-2 items-center rounded-xl px-4 py-2.5 font-bold text-sm ${tab===t.id?'bg-indigo-700 text-white':'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50'}`}><t.Icon size={16}/>{t.label}</button>)}
        </nav>
        {tab==='learn'&&<div className="space-y-3" id="ps-lessons-panel">
          <div className="rounded-xl border bg-white p-4 space-y-2"><p className="text-sm font-semibold text-slate-800">{studied} / {PS_LESSONS.length} lessons with self-reported study activity</p><p className="text-xs text-slate-600">This is not scored mastery or PRC readiness. Lessons are introductory editorial drafts; the complete curriculum will be expanded in later updates.</p><label className="block text-xs font-bold text-slate-700">Find a lesson<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search titles or topics..." className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"/></label></div>
          {PS_MODULES.map(m=>{const ls=matching.filter(l=>l.moduleId===m.id);if(!ls.length)return null;const isOpen=expanded===m.id||search.trim()!=='';return <section key={m.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <button type="button" id={`ps-module-${m.id}`} aria-expanded={isOpen} onClick={()=>{setExpanded(isOpen?'':m.id);setSearch('')}} className="w-full text-left p-4 flex gap-3 justify-between items-center hover:bg-indigo-50"><span><strong className="text-slate-900 text-sm">{m.id} · {m.title}</strong><span className="block text-xs text-slate-500 mt-1">{m.tos==='Foundation'?'Probability foundation':`PRC TOS ${m.tos}`} · {ls.length} lessons</span></span>{isOpen?<ChevronDown className="text-indigo-700 shrink-0" size={18}/>:<ChevronRight className="text-slate-400 shrink-0" size={18}/>}</button>
            {isOpen&&<div className="border-t border-slate-100">{ls.map(l=><button key={l.id} id={`ps-lesson-${l.id}`} type="button" onClick={()=>openLesson(l.id)} className="w-full flex text-left items-center gap-3 px-4 py-3 border-b last:border-b-0 border-slate-100 hover:bg-indigo-50"><BookOpen className="text-indigo-700 shrink-0" size={16}/><span className="flex-1 min-w-0 text-sm font-semibold text-slate-800">{l.title}</span><span className="text-[10px] text-slate-500">{getManualLearnRecord(manualStore,psTrackingId(l.id)).reviewCount>0?'Studied':'Draft'}</span><ChevronRight size={15} className="text-slate-400"/></button>)}<div className="px-4 py-2 bg-slate-50"><button type="button" onClick={()=>openPractice('',m.id)} className="text-xs font-bold text-indigo-700">Practice this module →</button></div></div>}
          </section>})}
        </div>}
        {tab==='formulas'&&<section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-6" id="ps-formulas-panel"><h2 className="font-bold text-lg text-slate-900">Formula Reference</h2><p className="text-xs text-slate-600">A concise developmental formula reference. Check assumptions in the related lessons.</p>{PS_MODULES.map(m=><div key={m.id} className="space-y-3"><h3 className="font-bold text-indigo-800 border-b pb-2">{m.title}</h3>{PS_LESSONS.filter(l=>l.moduleId===m.id).map(l=><div key={l.id} className="border border-slate-200 bg-slate-50 rounded-lg p-3"><h4 className="text-sm font-semibold text-slate-800">{l.title}</h4><div className="max-w-full overflow-x-auto mt-3"><MathFormula formula={l.latex} block/></div><p className="mt-2 text-xs text-amber-800">{l.guardrail}</p></div>)}</div>)}</section>}
        {tab==='readiness'&&<section id="ps-readiness-panel" className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 space-y-4">
          <h2 className="font-extrabold text-lg text-slate-900">PRC assessment readiness — editorial preflight</h2>
          <p role="status" className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">{PS_BOARD_EXAM_READY?'Competency count preflight met; independent examination certification is still required.':'Not approved for scored PRC mock exams.'} {PS_BOARD_EXAM_QUESTIONS.length} of {PS_PRACTICE_QUESTIONS.length} independent questions have passed every assessment gate. Practice answers and manual study activity are not certified board mastery.</p>
          <p className="text-xs text-slate-600">Blueprint: {PS_BLUEPRINT.version}. These targets describe the official 15-item Engineering Data Analysis distribution, not the number of draft questions to write. Classification and textbook section mappings remain provisional.</p>
          <p className="text-xs text-slate-700">Additional v10.68 checks: {Object.values(PS_SOURCE_SECTION_EVIDENCE).filter(e=>e.localSectionTopicCorroborated).length}/80 source sections locally corroborated; {PS_PRELIMINARY_CONCEPT_REVIEW.length}/41 conceptual answers received a preliminary logical review. Neither check is independent expert signoff; approvals remain zero.</p>
          <p className="text-xs text-slate-700">Source evidence: {PS_EDITORIAL_PREFLIGHT.sourcePageReadable}/{PS_EDITORIAL_PREFLIGHT.sourceRecords} lesson research-source pages checked during the audit; {PS_EDITORIAL_PREFLIGHT.fullLessonPassagesApproved}/{PS_EDITORIAL_PREFLIGHT.sourceRecords} entire lesson passages independently approved. Concept questions: {PS_EDITORIAL_PREFLIGHT.conceptualSMEApproved}/{PS_EDITORIAL_PREFLIGHT.conceptualQuestions} with editorial signoff. Readable reference pages and arithmetic checks do not certify a lesson or exam question.</p>
          <div className="overflow-x-auto"><table className="min-w-[540px] w-full text-sm text-left"><thead><tr className="border-b text-slate-700"><th className="py-2">Competency</th><th className="py-2">Target</th><th className="py-2">Approved</th><th className="py-2">Gap</th></tr></thead><tbody>{PS_READINESS_PREFLIGHT.map(c=><tr key={c.id} className="border-b border-slate-100"><td className="py-2 pr-3">{c.id} · {c.label}</td><td className="py-2">{c.items}</td><td className="py-2">{c.approved}</td><td className="py-2 font-bold text-amber-800">{c.missing}</td></tr>)}</tbody></table></div>
          <p className="text-xs text-slate-600">v10.69 release gate: SHA-256 fingerprints bind review records to exact lesson and question content. Editing a stem, option, answer, explanation or lesson text invalidates its old review fingerprint. A deterministic 15-item selector is available only after a jointly feasible, fully approved pool exists; no draft item can be selected.</p>
          <p className="text-xs text-slate-600">Provisional cognitive-level preflight: {PS_COGNITIVE_PREFLIGHT.map(c=>`${c.level} ${c.approved}/${c.target}`).join(" · ")}. Joint competency/cognitive allocation feasible: {PS_JOINT_BLUEPRINT_FEASIBLE?'yes':'no'}. Approved cognitive levels are required before any scored assessment selection.</p>
          <p className="text-xs text-slate-600">PS02 Combinatorics and PS03 Probability are prerequisites for the 5.2 competency, not independently allocated PRC item quotas. The proposed question cognitive levels have not been expert-approved. Reference locators identify textbook tables of contents only, not verified lesson passages.</p>
        </section>}
        {tab==='practice'&&<PSPracticePanel key={`${initialTopic}:${initialModule}`} initialTopic={initialTopic} initialModule={initialModule}/>}
      </>}
    </div></div>
  </div>;
};
