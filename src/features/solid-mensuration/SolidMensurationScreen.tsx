import React, { useMemo, useState, useEffect } from 'react';
import { BookOpen, Calculator, ChevronDown, FlaskConical, Search, Shapes, CheckCircle2, TriangleAlert, ArrowLeft, ArrowRight } from 'lucide-react';
import { BlockMath } from 'react-katex';
import { SolidGeometryIllustration } from './SolidGeometryIllustration';
import { SolidPracticePanel } from './SolidPracticePanel';
import 'katex/dist/katex.min.css';
import { useReview } from '../../context/ReviewContext';
import { TreeMenuHeader } from '../../components/TreeMenuHeader';
import { LearnReaderLayout } from '../../components/learn-reader/LearnReaderLayout';
import { ManualLearnTracker } from '../../components/learn-reader/ManualLearnTracker';
import { getManualLearnRecord, readManualLearnStore, MANUAL_LEARN_CHANGED_EVENT } from '../../domain/learn/manualLearnTracking';
import {
  SOLID_LESSONS, SOLID_UNITS, SOLID_FORMULAS, SOLID_NUMERIC_CHECKS, SOLID_PRACTICE, SOLID_READER_LESSONS, displayPracticeAnswer,
  formulasForLesson, checksForLesson, lessonIdToTrackingId,
} from './solidMensurationContent';

type ScreenTab='topics'|'formulas'|'practice';
type AnswerMap=Record<string,number>;
const inputClass='w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400';
const fmt=(v:number)=>Number(v.toPrecision(6)).toLocaleString('en-US',{maximumFractionDigits:5});
const answerText=(v:number|string,unit:string)=>`${typeof v==='number'?fmt(v):v}${unit?' '+unit:''}`;

/** Original vector illustrations, rather than copied textbook pages. Geometric shapes are schematic/not to scale. */
const SolidDiagram:React.FC<{unit:string}>=({unit})=>{
  const stroke='#4f46e5', faint='#a5b4fc';
  let geom:React.ReactNode;
  if(unit==='SM-U12')geom=<><path d="M190 26v168" stroke={stroke} strokeDasharray="7 4" strokeWidth="2"/><path d="M62 80 Q98 15 134 80 Q98 145 62 80Z" fill="#c7d2fe" stroke={stroke} strokeWidth="2"/><circle cx="102" cy="80" r="4" fill={stroke}/><path d="M102 80H190" stroke={stroke} strokeDasharray="5 4"/><text x="136" y="72" fontSize="12" fill="#4338ca">d</text><text x="166" y="210" fontSize="12" fill="#4338ca">axis</text></>;
  else if(['SM-U03','SM-U13'].includes(unit))geom=<><ellipse cx="126" cy="48" rx="71" ry="22" fill="#e0e7ff" stroke={stroke} strokeWidth="2"/><path d="M55 48v109a71 22 0 0 0 142 0V48" fill="#c7d2fe" fillOpacity=".35" stroke={stroke} strokeWidth="2"/><path d="M55 157a71 22 0 0 1 142 0" stroke={faint} strokeDasharray="6 5" fill="none"/><path d="M126 47v109" stroke="#818cf8" strokeDasharray="5 4"/><text x="130" y="102" fill="#4338ca" fontSize="13">h</text><path d="M126 48h70" stroke={stroke}/><text x="161" y="39" fontSize="13" fill="#4338ca">r</text></>;
  else if(['SM-U05','SM-U06','SM-U11'].includes(unit))geom=<><path d={unit==='SM-U06'?'M78 51 L57 157 Q126 207 195 157 L174 51 Z':'M126 22 L57 157 Q126 202 195 157 Z'} fill="#c7d2fe" fillOpacity=".55" stroke={stroke} strokeWidth="2"/><ellipse cx="126" cy="157" rx="69" ry="19" stroke={stroke} fill="none" strokeWidth="2"/><path d="M57 157a69 19 0 0 1 138 0" stroke={faint} strokeDasharray="5 4" fill="none"/>{unit==='SM-U06'&&<ellipse cx="126" cy="51" rx="48" ry="13" fill="#e0e7ff" stroke={stroke} strokeWidth="2"/>}<path d="M126 22v135" stroke="#818cf8" strokeDasharray="5 5"/></>;
  else if(['SM-U07','SM-U08','SM-U09'].includes(unit))geom=<><circle cx="126" cy="102" r="73" fill="#c7d2fe" fillOpacity=".55" stroke={stroke} strokeWidth="2"/><ellipse cx="126" cy="102" rx="73" ry="24" fill="none" stroke={stroke} strokeDasharray="5 4"/><path d="M126 102 L196 82" stroke={stroke} strokeWidth="2"/><circle cx="126" cy="102" r="3" fill={stroke}/><text x="163" y="89" fill="#4338ca" fontSize="13">r</text></>;
  else if(['SM-U04','SM-U12'].includes(unit))geom=<><path d="M126 17L48 157 127 190 208 156Z" fill="#c7d2fe" fillOpacity=".55" stroke={stroke} strokeWidth="2"/><path d="M126 17v154 M48 157l158 0 M127 190l81-34" stroke={faint} strokeDasharray="5 4" fill="none"/></>;
  else if(['SM-U01'].includes(unit))geom=<><path d="M32 115L137 43 219 98 110 180Z" fill="#c7d2fe" fillOpacity=".65" stroke={stroke} strokeWidth="2"/><path d="M32 66L137 109 212 43 108 19Z" fill="#f0abfc" fillOpacity=".4" stroke="#9333ea" strokeWidth="2"/><path d="M137 43L137 109" stroke={stroke} strokeDasharray="5 4"/><text x="30" y="190" fontSize="12" fill="#6366f1">Intersecting planes</text></>;
  else geom=<><path d="M44 67l118-31 51 34-122 35z" fill="#e0e7ff" stroke={stroke} strokeWidth="2"/><path d="M44 67v96l47 35v-93z" fill="#c7d2fe" stroke={stroke} strokeWidth="2"/><path d="M91 105l122-35v96l-122 32z" fill="#e0e7ff" fillOpacity=".8" stroke={stroke} strokeWidth="2"/><path d="M162 36v98L44 163" stroke={faint} strokeDasharray="5 4" fill="none"/></>;
  return <svg viewBox="0 0 250 215" role="img" aria-label="Schematic three-dimensional solid; not to scale" className="w-full h-44 max-w-[280px] mx-auto"><title>Illustrative solid diagram, not to scale</title>{geom}</svg>;
};

export const SolidMensurationScreen:React.FC=()=>{
 const {setCurrentScreen,setIsLearnReaderActive}=useReview();
 const [tab,setTab]=useState<ScreenTab>('topics');
 const [selected,setSelected]=useState<string|null>(null);
 const [expanded,setExpanded]=useState('SM-U01');
 const [search,setSearch]=useState('');
 const [filter,setFilter]=useState<'All'|'Core'|'Extended'>('All');
 const [answers,setAnswers]=useState<AnswerMap>({});
 const [checkIndex,setCheckIndex]=useState(0);
 const [startTopic,setStartTopic]=useState('all');
 const [tracked,setTracked]=useState(()=>readManualLearnStore());
 useEffect(()=>{const update=()=>setTracked(readManualLearnStore());window.addEventListener(MANUAL_LEARN_CHANGED_EVENT,update);return()=>window.removeEventListener(MANUAL_LEARN_CHANGED_EVENT,update)},[]);
 useEffect(()=>()=>setIsLearnReaderActive(false),[setIsLearnReaderActive]);
 const openLesson=(id:string)=>{setSelected(id);setIsLearnReaderActive(true);};
 const closeLesson=()=>{setSelected(null);setIsLearnReaderActive(false);};
 const openPractice=(id:string)=>{const first=SOLID_PRACTICE.findIndex(q=>q.topic_id===id);closeLesson();setStartTopic(id);setTab('practice');if(first>=0)setCheckIndex(first);};
 const lesson=selected?SOLID_LESSONS.find(l=>l.topic_id===selected):undefined;
 const matched=useMemo(()=>SOLID_LESSONS.filter(l=>(filter==='All'||l.priority===filter)&&`${l.title} ${l.topic_id} ${l.unit} ${l.demonstrable_learning_goal}`.toLowerCase().includes(search.toLowerCase())),[search,filter]);
 const formulaList=useMemo(()=>SOLID_FORMULAS.filter(f=>`${f.id} ${f.name} ${f.topic_ids} ${f.conditions} ${f.source}`.toLowerCase().includes(search.toLowerCase())),[search]);
 const manualProgress=SOLID_LESSONS.filter(l=>{const record=getManualLearnRecord(tracked,lessonIdToTrackingId(l.topic_id));return record.reviewCount>0||record.selfStatus!=='unrated'}).length;
 return <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]" id="solid-mensuration-app-screen">
  <TreeMenuHeader items={[{label:'Board Subjects',onClick:()=>setCurrentScreen('subjects')},{label:'Mathematics',onClick:()=>setCurrentScreen('mathematics')},{label:'Geometry',onClick:()=>setCurrentScreen('geometry')},{label:'Solid Mensuration',isActive:true}]} backButton={{label:'Back to Geometry',onClick:()=>setCurrentScreen('geometry')}}/>
  <div className="flex-1 overflow-y-auto" id="solid-mensuration-scroll-region"><div className="max-w-[1400px] mx-auto p-3 sm:p-6 space-y-4">
   {selected&&lesson?<div className="space-y-3">
     <button className="text-sm text-indigo-700 font-bold inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white p-2" onClick={closeLesson}><ArrowLeft size={17}/> Back to {SOLID_LESSONS.length} topics</button>
     <div className="rounded-2xl border border-indigo-100 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"><div className="w-full sm:w-72 shrink-0"><SolidGeometryIllustration topicId={lesson.topic_id}/></div><div className="flex-1"><div className="text-xs text-indigo-700 font-black">{lesson.topic_id} · {lesson.unit} · {lesson.priority}</div><h2 className="text-xl font-black text-slate-900 mt-1">{lesson.title}</h2><p className="text-sm text-slate-600 mt-2">{lesson.demonstrable_learning_goal}</p><p className="text-xs text-amber-700 mt-3">Original labeled illustration; schematic and not to scale. Learning material is a draft pending editorial approval.</p></div></div>
     <div className="border rounded-xl border-slate-200 bg-white p-4"><ManualLearnTracker trackingId={lessonIdToTrackingId(lesson.topic_id)} scopeLabel="Solid Mensuration topic · manual study status" compact/></div>
     <LearnReaderLayout key={lesson.topic_id} lesson={SOLID_READER_LESSONS[lesson.topic_id]} trackingId={lessonIdToTrackingId(lesson.topic_id)} trackingScopeLabel="Solid Mensuration topic" onClose={closeLesson} onPractice={()=>openPractice(lesson.topic_id)}/>
     <button onClick={closeLesson} className="text-indigo-700 font-semibold text-sm">Back to Solid Mensuration topics</button>
   </div>:<>
    <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-[#eef2ff] via-white to-[#ecfeff] shadow-sm p-5 sm:p-7">
     <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"><div><p className="text-[11px] font-black tracking-[.16em] uppercase text-indigo-600">Engineering Mathematics / Geometry</p><h1 className="text-2xl sm:text-3xl font-black mt-1 text-slate-950">Solid Geometry &amp; Mensuration</h1><p className="text-slate-600 text-sm mt-2 max-w-2xl">Explore solids, surface areas, volumes, measurement theorems and engineering applications. Questions here are developmental drills, not official board questions.</p></div><div className="w-full md:w-56 shrink-0"><SolidDiagram unit="SM-U03"/></div></div>
     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">{[[SOLID_LESSONS.length,'Expanded lessons'],[SOLID_FORMULAS.length,'Formula entries'],[SOLID_PRACTICE.length,'Practice questions'],[manualProgress,'Topics studied (self-report)']].map(([n,label])=><div key={label} className="bg-white/85 border border-indigo-100 rounded-xl px-3 py-3"><strong className="block text-xl text-indigo-900">{n}</strong><span className="text-xs text-slate-600">{label}</span></div>)}</div>
    </section>
    <nav aria-label="Solid Mensuration sections" className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">{([['topics','Lessons',BookOpen],['formulas','Formula Library',Calculator],['practice','Practice Questions',FlaskConical]] as const).map(([key,label,Icon])=><button key={key} aria-current={tab===key?'page':undefined} onClick={()=>{setTab(key);setSearch('')}} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold border ${tab===key?'bg-indigo-600 text-white border-indigo-600':'bg-white text-slate-700 border-slate-200 hover:border-indigo-200'}`}><Icon size={16}/>{label}</button>)}</nav>
    {tab==='topics'&&<section className="space-y-3">
     <div className="flex flex-col sm:flex-row gap-3"><label className="flex-1 relative"><Search className="absolute top-3 left-3 text-slate-400" size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} className={`${inputClass} pl-10`} placeholder="Find a topic, term, or topic ID" aria-label="Search Solid Mensuration lessons"/></label><select value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} className={`${inputClass} sm:w-44`} aria-label="Filter learning priority"><option>All</option><option>Core</option><option>Extended</option></select></div>
     <p className="text-xs text-slate-500">{matched.length} of {SOLID_LESSONS.length} draft topics · Existing Algebra/Trigonometry history is unchanged · Study checkmarks are self-reported only.</p>
     {SOLID_UNITS.map(unit=>{const members=matched.filter(l=>l.unit_id===unit.unit_id);if(!members.length)return null;return <div key={unit.unit_id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm"><button type="button" aria-expanded={expanded===unit.unit_id} onClick={()=>setExpanded(prev=>prev===unit.unit_id?'':unit.unit_id)} className="w-full text-left px-4 sm:px-5 py-4 flex justify-between gap-4 items-center bg-white hover:bg-slate-50"><span className="flex items-center gap-3"><span className="bg-indigo-50 text-indigo-700 rounded-xl w-10 h-10 flex items-center justify-center"><Shapes size={20}/></span><span><strong className="block text-slate-950 text-sm sm:text-base">{unit.name}</strong><span className="text-xs text-slate-500">{members.length} topic{members.length!==1?'s':''} · {unit.unit_id}</span></span></span><ChevronDown size={18} className={`text-slate-500 shrink-0 transition-transform ${expanded===unit.unit_id?'rotate-180':''}`}/></button>
      {(expanded===unit.unit_id||search.trim().length>0)&&<div className="px-4 sm:px-5 pb-4 border-t border-slate-100 divide-y divide-slate-100">{members.map(l=>{const progress=getManualLearnRecord(tracked,lessonIdToTrackingId(l.topic_id));return <div key={l.topic_id} className="py-3 flex flex-col sm:flex-row gap-2 justify-between sm:items-center"><div className="min-w-0"><div className="flex gap-2 items-center flex-wrap"><span className="font-mono text-[11px] text-indigo-600">{l.topic_id}</span><span className="font-bold text-slate-900 text-sm">{l.title}</span><span className={`px-2 py-0.5 rounded-full text-[10px] ${l.priority==='Core'?'bg-indigo-50 text-indigo-700':'bg-slate-100 text-slate-600'}`}>{l.priority}</span>{progress.reviewCount>0&&<span className="text-[11px] text-emerald-700">Reviewed {progress.reviewCount}×</span>}</div><p className="text-xs text-slate-500 mt-1">{l.demonstrable_learning_goal}</p></div><button onClick={()=>openLesson(l.topic_id)} className="shrink-0 self-start rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 text-xs font-bold">Open lesson →</button></div>})}</div>}
     </div>})}{!matched.length&&<p className="bg-white border border-slate-200 rounded-xl p-6 text-slate-500">No matching topics.</p>}
    </section>}
    {tab==='formulas'&&<section className="space-y-4">
      <label className="relative block"><Search className="absolute top-3 left-3 text-slate-400" size={18}/><input className={`${inputClass} pl-10`} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, source, applicability, or ID" aria-label="Search formula library"/></label><div className="flex gap-2 items-center text-xs text-amber-800 rounded-xl bg-amber-50 border border-amber-200 p-3"><TriangleAlert size={16}/><span>Reference-informed draft formulas; review applicability restrictions before use. Source locations are editorial mapping notes, not endorsement or exam weighting.</span></div>
      <p className="text-xs text-slate-500">Showing {formulaList.length} of {SOLID_FORMULAS.length} equations and theorems.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{formulaList.map(f=><article key={f.id} className="min-w-0 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm"><div className="flex justify-between gap-2"><h3 className="text-base font-bold text-slate-950">{f.name}</h3><span className="font-mono text-[11px] text-indigo-600 shrink-0">{f.id}</span></div><div className="my-3 overflow-x-auto bg-indigo-50/60 rounded-xl p-3 text-indigo-950"><BlockMath math={f.latex}/></div><p className="text-xs text-slate-600"><b>Variables:</b> {f.variables}</p><p className="text-xs text-amber-800 mt-2"><b>Applies when:</b> {f.conditions}</p><p className="text-[11px] text-slate-500 mt-2"><b>Reference:</b> {f.source}</p><p className="text-[11px] text-slate-500 mt-1"><b>Linked topics:</b> {f.topic_ids}</p></article>)}</div>{!formulaList.length&&<p className="text-slate-500">No matching formulas.</p>}
    </section>}
    {tab==='practice'&&<SolidPracticePanel answers={answers} setAnswers={setAnswers} selectedIndex={checkIndex} setSelectedIndex={setCheckIndex} startTopic={startTopic}/>}
   </>}
  </div></div>
 </div>;
};
