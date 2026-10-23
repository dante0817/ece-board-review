import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Calculator, ClipboardList, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { TreeMenuHeader } from '../../components/TreeMenuHeader';
import { LearnReaderLayout } from '../../components/learn-reader/LearnReaderLayout';
import { ManualLearnTracker } from '../../components/learn-reader/ManualLearnTracker';
import { getManualLearnRecord, readManualLearnStore, MANUAL_LEARN_CHANGED_EVENT } from '../../domain/learn/manualLearnTracking';
import { useReview } from '../../context/ReviewContext';
import { PlaneGeometryIllustration } from './PlaneGeometryIllustration';
import { PlanePracticePanel } from './PlanePracticePanel';
import { PLANE_LESSONS, PLANE_UNITS, PLANE_FORMULAS, PLANE_PRACTICE, PLANE_READER_LESSONS,planeTrackingId } from './planeGeometryContent';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

type Tab='topics'|'formulas'|'practice';
export const PlaneGeometryScreen:React.FC=()=>{
 const {setCurrentScreen,setIsLearnReaderActive}=useReview();
 const [tab,setTab]=useState<Tab>('topics');
 const [selected,setSelected]=useState<string|null>(null);
 const [initialPractice,setInitialPractice]=useState('');
 const [expanded,setExpanded]=useState('PG-U01');
 const [search,setSearch]=useState('');
 const [priority,setPriority]=useState('all');
 const [store,setStore]=useState(readManualLearnStore);
 useEffect(()=>{const update=()=>setStore(readManualLearnStore());window.addEventListener(MANUAL_LEARN_CHANGED_EVENT,update);return()=>window.removeEventListener(MANUAL_LEARN_CHANGED_EVENT,update)},[]);
 useEffect(()=>()=>setIsLearnReaderActive(false),[setIsLearnReaderActive]);
 const openLesson=(id:string)=>{setSelected(id);setIsLearnReaderActive(true)};
 const closeLesson=()=>{setSelected(null);setIsLearnReaderActive(false)};
 const openPractice=(id?:string)=>{closeLesson();setInitialPractice(id||'');setTab('practice')};
 const lesson=PLANE_LESSONS.find(l=>l.topic_id===selected);
 const visible=useMemo(()=>PLANE_LESSONS.filter(l=>(priority==='all'||l.priority===priority)&&`${l.topic_id} ${l.title} ${l.concept}`.toLowerCase().includes(search.toLowerCase())),[search,priority]);
 const filteredFormulas=useMemo(()=>PLANE_FORMULAS.filter(f=>`${f.topic_id} ${f.name} ${f.conditions}`.toLowerCase().includes(search.toLowerCase())),[search]);
 const manualProgress=PLANE_LESSONS.filter(l=>{const r=getManualLearnRecord(store,planeTrackingId(l.topic_id));return r.reviewCount>0||r.selfStatus!=='unrated'}).length;
 const btn=(id:Tab,label:string,Icon:typeof BookOpen)=><button type="button" role="tab" aria-selected={tab===id} onClick={()=>{closeLesson();setTab(id)}} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold focus-visible:outline-2 focus-visible:outline-indigo-500 ${tab===id?'bg-indigo-600 text-white':'bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50'}`}><Icon size={17}/>{label}</button>;
 return <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]" id="plane-geometry-app-screen">
   <TreeMenuHeader items={[{label:'Board Subjects',onClick:()=>setCurrentScreen('subjects')},{label:'Mathematics',onClick:()=>setCurrentScreen('mathematics')},{label:'Geometry',onClick:()=>setCurrentScreen('geometry')},{label:'Plane Geometry',isActive:true}]} backButton={{label:'Back to Geometry',onClick:()=>setCurrentScreen('geometry')}}/>
   <div className="flex-1 overflow-y-auto" id="plane-geometry-scroll-region"><div className="max-w-[1400px] mx-auto p-3 sm:p-6 space-y-4">
     {lesson&&selected?<>
       <button type="button" onClick={closeLesson} className="inline-flex items-center gap-2 text-sm rounded-lg border border-indigo-200 bg-white text-indigo-700 px-3 py-2 font-bold"><ArrowLeft size={17}/>Back to Plane Geometry topics</button>
       <section className="rounded-2xl bg-white border border-indigo-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center"><div className="w-full sm:w-64"><PlaneGeometryIllustration topicId={selected}/></div><div><p className="text-xs font-bold text-indigo-600">{lesson.topic_id} · {lesson.unit} · {lesson.priority}</p><h2 className="text-xl font-black text-slate-900 mt-2">{lesson.title}</h2><p className="text-slate-600 text-sm mt-2">{lesson.goal}</p><p className="text-xs text-amber-800 mt-2">Original diagram is schematic, not to scale. Draft lesson pending editorial verification.</p></div></section>
       <div className="bg-white rounded-xl p-3 border"><ManualLearnTracker trackingId={planeTrackingId(lesson.topic_id)} scopeLabel="Plane Geometry topic · self-reported status" compact/></div>
       <LearnReaderLayout key={selected} lesson={PLANE_READER_LESSONS[selected]} trackingId={planeTrackingId(selected)} trackingScopeLabel="Plane Geometry topic" onClose={closeLesson} onPractice={()=>openPractice(selected)}/>
     </>:<>
       <section className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-indigo-50 border border-indigo-100 p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row gap-5 items-center justify-between">
         <div><p className="text-xs font-black uppercase tracking-widest text-indigo-600">Engineering Mathematics / Geometry</p><h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Plane Geometry & Mensuration</h1><p className="text-sm text-slate-600 mt-2 max-w-3xl">Shapes, angles, triangles, polygons, circles, perimeter and area. All lessons and questions are original instructional drafts, not official board-exam items.</p><div className="mt-4 text-xs text-indigo-800 font-semibold flex flex-wrap gap-2"><span className="bg-white border rounded-lg py-2 px-3">{PLANE_LESSONS.length} lessons</span><span className="bg-white border rounded-lg py-2 px-3">{PLANE_FORMULAS.length} formula notes</span><span className="bg-white border rounded-lg py-2 px-3">{PLANE_PRACTICE.length} practice questions</span><span className="bg-white border rounded-lg py-2 px-3">{manualProgress} self-tracked topics</span></div></div>
         <div className="w-full max-w-[215px] shrink-0"><PlaneGeometryIllustration topicId="GEO-007"/></div>
       </section>
       <nav role="tablist" aria-label="Plane Geometry sections" className="flex flex-wrap gap-2">{btn('topics','Learn topics',BookOpen)}{btn('formulas','Formula library',Calculator)}{btn('practice','Practice questions',ClipboardList)}</nav>
       {tab!=='practice'&&<label className="relative block max-w-xl"><Search className="absolute text-slate-400 left-3 top-3" size={18}/><span className="sr-only">Search plane geometry {tab}</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${tab==='topics'?'topics':'formulas'}...`} className="bg-white border border-slate-200 rounded-xl w-full pl-10 pr-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-indigo-600"/></label>}
       {tab==='topics'&&<section role="tabpanel" className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-slate-600">{visible.length} of {PLANE_LESSONS.length} topics</p><label className="text-xs font-semibold text-slate-700">Priority <select aria-label="Topic priority" value={priority} onChange={e=>setPriority(e.target.value)} className="ml-1 px-3 py-2 border rounded-lg bg-white"><option value="all">All</option><option value="Core">Core</option><option value="Extended">Extended</option></select></label></div>
         {PLANE_UNITS.map(unit=>{const sub=visible.filter(l=>l.unit_id===unit.unit_id);if(!sub.length)return null;const active=expanded===unit.unit_id;return <section key={unit.unit_id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"><button type="button" onClick={()=>setExpanded(active?'':unit.unit_id)} aria-expanded={active} aria-controls={`plane-unit-${unit.unit_id}`} className="w-full text-left p-4 flex justify-between items-center gap-3 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600"><span className="font-extrabold text-slate-900">{unit.name} <span className="font-normal text-slate-500 text-sm">({sub.length} topics)</span></span>{active?<ChevronDown size={20}/>:<ChevronRight size={20}/>}</button><div id={`plane-unit-${unit.unit_id}`} hidden={!active} className="border-t border-slate-200 p-3 grid grid-cols-1 xl:grid-cols-2 gap-2">{sub.map(l=><button type="button" key={l.topic_id} onClick={()=>openLesson(l.topic_id)} className="flex items-center justify-between gap-3 text-left rounded-xl border border-slate-100 p-3 hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600"><span className="min-w-0"><span className="text-xs text-indigo-700 font-bold">{l.topic_id} · {l.priority}</span><span className="block text-sm font-semibold mt-1 text-slate-900">{l.title}</span></span><BookOpen className="shrink-0 text-indigo-600" size={19}/></button>)}</div></section>})}
       </section>}
       {tab==='formulas'&&<section role="tabpanel" className="grid grid-cols-1 md:grid-cols-2 gap-3">{filteredFormulas.map(f=><article key={f.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm"><div className="text-xs font-mono text-indigo-600">{f.id} · {f.topic_id}</div><h3 className="font-bold text-slate-900 mt-2">{f.name}</h3><div className="overflow-auto text-sm my-3"><BlockMath math={f.latex}/></div><p className="text-xs text-amber-800">Conditions: {f.conditions}</p><button onClick={()=>openLesson(f.topic_id)} type="button" className="text-xs font-bold text-indigo-700 mt-3">Open lesson →</button></article>)}</section>}
       {tab==='practice'&&<div role="tabpanel"><PlanePracticePanel initialTopic={initialPractice}/></div>}
     </>}
   </div></div>
 </div>;
};
