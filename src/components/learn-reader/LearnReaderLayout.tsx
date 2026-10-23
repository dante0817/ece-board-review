import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, CheckCircle2, List, PanelLeftClose, PanelLeftOpen, Type, X } from 'lucide-react';
import { LearnLesson } from '../../domain/learn/lessonTypes';
import { readReaderStore, resolveReaderProgress, saveReaderStore, updateReaderTopic, type LearnReaderStore } from '../../domain/learn/readerProgress';
import { LearnSectionRenderer } from './LearnSectionRenderer';
import { ManualLearnTracker } from './ManualLearnTracker';
import { lessonCardTrackingId } from '../../domain/learn/manualLearnTracking';

interface Props {
  lesson:LearnLesson;
  trackingId:string;
  trackingScopeLabel:string;
  requestedSectionId?:string;
  onPractice:()=>void;
  onClose?:()=>void;
  onSectionChange?:()=>void;
}
export const LearnReaderLayout:React.FC<Props> = ({lesson,trackingId,trackingScopeLabel,requestedSectionId,onPractice,onClose,onSectionChange})=>{
  const [store,setStore]=useState(readReaderStore);
  const state=useMemo(()=>resolveReaderProgress(lesson,store),[lesson,store]);
  const [activeSectionId,setActiveSectionId]=useState(()=>requestedSectionId && lesson.sections.some(s=>s.id===requestedSectionId)?requestedSectionId:state.lastSectionId);
  const [tocOpen,setTocOpen]=useState(true);
  const [mobileTocOpen,setMobileTocOpen]=useState(false);
  const [saveWarning,setSaveWarning]=useState(false);
  const currentIndex=Math.max(0,lesson.sections.findIndex(s=>s.id===activeSectionId));
  const current=lesson.sections[currentIndex];
  const isBookmarked=state.bookmarkedSectionIds.includes(current.id);
  const isDone=state.completedSectionIds.includes(current.id);
  const completed=state.completedSectionIds.length;

  // A new topic must not reuse a previous topic's selected page.
  useEffect(()=>{
    const saved=readReaderStore();
    setStore(saved);
    const resumed=resolveReaderProgress(lesson,saved).lastSectionId;
    setActiveSectionId(requestedSectionId && lesson.sections.some(s=>s.id===requestedSectionId)?requestedSectionId:resumed);
  },[lesson.id,requestedSectionId]);

  const write=(patch:Parameters<typeof updateReaderTopic>[2])=>{
    const next=updateReaderTopic(lesson,store,patch);
    setStore(next);
    if(!saveReaderStore(next))setSaveWarning(true);else setSaveWarning(false);
  };
  const navigate=(id:string)=>{
    if(!lesson.sections.some(s=>s.id===id))return;
    setActiveSectionId(id);
    write({lastSectionId:id});
    setMobileTocOpen(false);
    onSectionChange?.();
  };
  const toggleMark=(field:'bookmarkedSectionIds'|'completedSectionIds')=>{
    const prior=state[field];
    write({[field]:prior.includes(current.id)?prior.filter(id=>id!==current.id):[...prior,current.id]});
  };
  useEffect(()=>{
    if(!mobileTocOpen)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setMobileTocOpen(false);};
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[mobileTocOpen]);

  const toc=(mobile=false)=><nav aria-label="Lesson contents" className="space-y-1">
    {lesson.sections.map((section,index)=>{
      const selected=section.id===current.id;
      return <button type="button" key={section.id} aria-current={selected?'location':undefined} onClick={()=>navigate(section.id)}
        className={`w-full text-left rounded-lg px-3 py-3 flex items-start gap-2.5 text-sm leading-5 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${selected?'bg-blue-100 text-blue-900 font-bold':'text-slate-600 hover:bg-slate-100'}`}>
          <span className="text-xs text-slate-400 w-5 shrink-0 pt-0.5 tabular-nums">{index+1}.</span><span className="flex-1">{section.title}</span>{state.completedSectionIds.includes(section.id)&&<CheckCircle2 aria-label="Read" className="w-4 h-4 text-emerald-600 shrink-0"/>}{state.bookmarkedSectionIds.includes(section.id)&&<Bookmark aria-label="Bookmarked" className="w-3.5 h-3.5 text-amber-600 shrink-0 fill-amber-100"/>}
      </button>;
    })}
    {!mobile && <div className="mt-5 px-3 text-xs text-slate-500 leading-5">Reading is separate from independent quiz and mastery evidence.</div>}
  </nav>;

  return <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" aria-label={`Learn reader: ${lesson.title}`}>
    <div className="flex justify-between items-center gap-3 border-b border-slate-200 px-3 sm:px-5 py-3 bg-slate-50">
      <div className="flex items-center gap-2 min-w-0"><BookOpen className="w-5 h-5 text-blue-600 shrink-0"/><div className="min-w-0"><div className="text-sm font-bold text-slate-900 truncate">{lesson.title}</div><div className="text-xs text-slate-500">{lesson.status==='summary'?'Reference-informed summary · full lesson in development':`Expanded lesson · ${lesson.status === 'draft' ? 'awaiting expert verification' : lesson.status}`}</div></div></div>
      <div className="flex gap-1 items-center shrink-0">
        <button type="button" aria-label="Show contents" onClick={()=>setMobileTocOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-200"><List className="w-5 h-5"/></button>
        <button type="button" aria-label={tocOpen?'Hide contents':'Show contents'} onClick={()=>setTocOpen(v=>!v)} className="hidden lg:inline-flex p-2 rounded-lg hover:bg-slate-200">{tocOpen?<PanelLeftClose className="w-5 h-5"/>:<PanelLeftOpen className="w-5 h-5"/>}</button>
        <button type="button" aria-label="Change text size" title="Change text size" onClick={()=>{const next:LearnReaderStore={...store,fontSize:store.fontSize==='normal'?'large':'normal'};setStore(next);if(!saveReaderStore(next))setSaveWarning(true);}} className="p-2 rounded-lg hover:bg-slate-200"><Type className="w-5 h-5"/></button>
        {onClose&&<button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200" aria-label="Back to topic"><X className="w-5 h-5"/></button>}
      </div>
    </div>
    <div className="flex items-start min-w-0">
      {tocOpen&&<aside className="hidden lg:block shrink-0 w-[260px] border-r border-slate-200 bg-slate-50/70 p-3 sticky top-0 max-h-[80vh] overflow-y-auto">
        <div className="text-xs font-bold tracking-wide uppercase text-slate-500 px-3 py-3">Contents</div>{toc(false)}
      </aside>}
      <article className={`min-w-0 flex-1 px-4 sm:px-7 lg:px-10 py-7 sm:py-10 ${store.fontSize==='large'?'[&_p]:!text-lg [&_li]:!text-lg [&_figure]:!text-lg':''}`}>
        <div className="mx-auto max-w-[760px] min-w-0">
          <div className="flex justify-between flex-wrap gap-2 text-xs text-slate-500 mb-4"><span>Section {currentIndex+1} of {lesson.sections.length}</span><span>{completed} sections marked read</span></div>
          <div role="progressbar" aria-label="Sections marked read" aria-valuemin={0} aria-valuemax={lesson.sections.length} aria-valuenow={completed} className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-9"><div className="h-full bg-blue-500" style={{width:`${lesson.sections.length?completed/lesson.sections.length*100:0}%`}}/></div>
          <h2 className="text-2xl sm:text-3xl leading-tight font-bold tracking-tight text-slate-900 mb-3">{current.title}</h2>
          <div className="mb-6"><ManualLearnTracker compact key={lessonCardTrackingId(trackingId,current.id)} trackingId={lessonCardTrackingId(trackingId,current.id)} scopeLabel={`${current.title} · ${trackingScopeLabel}`}/></div>
          {current.objectiveIds.length>0&&<p className="text-xs text-slate-500 mb-7">Learning objectives: {current.objectiveIds.length} linked</p>}
          <LearnSectionRenderer key={`${lesson.id}-${current.id}`} blocks={current.blocks}/>
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap gap-2 items-center">
            <button type="button" onClick={()=>toggleMark('completedSectionIds')} aria-pressed={isDone} className={`rounded-lg px-4 py-2.5 text-sm font-semibold border ${isDone?'bg-emerald-50 border-emerald-300 text-emerald-800':'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}><CheckCircle2 className="w-4 h-4 inline mr-2"/>{isDone?'Marked read':'Mark section read'}</button>
            <button type="button" onClick={()=>toggleMark('bookmarkedSectionIds')} aria-pressed={isBookmarked} className="rounded-lg px-4 py-2.5 text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50"><Bookmark className="w-4 h-4 inline mr-2"/>{isBookmarked?'Remove bookmark':'Bookmark'}</button>
          </div>
          {saveWarning&&<p role="alert" className="mt-3 text-xs text-amber-800">Changes are visible in this session but could not be saved to this browser. Check storage permissions or space.</p>}
          <div className="flex gap-3 flex-wrap justify-between border-t border-slate-200 pt-5 mt-7">
            <button type="button" disabled={currentIndex===0} onClick={()=>navigate(lesson.sections[currentIndex-1].id)} className="inline-flex gap-2 items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40"><ArrowLeft className="w-4 h-4"/>Previous</button>
            {currentIndex<lesson.sections.length-1?<button type="button" onClick={()=>navigate(lesson.sections[currentIndex+1].id)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold">Next section<ArrowRight className="w-4 h-4"/></button>:<button type="button" onClick={onPractice} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-sm font-semibold">Practice this topic<ArrowRight className="w-4 h-4"/></button>}
          </div>
        </div>
      </article>
    </div>
    {mobileTocOpen&&<div className="fixed inset-0 z-[90] lg:hidden" role="presentation"><button type="button" className="absolute inset-0 bg-slate-900/50 w-full" aria-label="Close contents" onClick={()=>setMobileTocOpen(false)}/><div className="absolute inset-y-0 left-0 bg-white w-[min(90vw,320px)] shadow-2xl overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label="Lesson contents"><div className="flex justify-between items-center mb-4"><strong>Lesson contents</strong><button type="button" autoFocus aria-label="Close contents" onClick={()=>setMobileTocOpen(false)} className="p-2"><X className="w-5 h-5"/></button></div>{toc(true)}</div></div>}
  </div>;
};
