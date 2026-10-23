import React, { useMemo, useState } from 'react';
import { ArrowRight, AlertTriangle, BookOpenCheck } from 'lucide-react';
import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import { useReview } from '../context/ReviewContext';
import { SmartQuizSection } from './SmartQuizSection';
import { AlgebraTimedChallengeModal } from './algebra/AlgebraTimedChallengeModal';
import { PracticeLibrary } from './practice/PracticeLibrary';

type Section='library'|'smart-quiz'|'external';
const areas=['All','Mathematics','Electronics','GEAS','EST'] as const;
type Area=typeof areas[number];
const areaOf=(id:string):Exclude<Area,'All'>=> id==='subj-geas'?'GEAS':id==='subj-communications'?'EST':
  id==='subj-electronics'?'Electronics':'Mathematics';

export const PracticeScreen:React.FC=()=>{
  const {allTopics,startReview,openTopicDrawer,errors,setCurrentScreen}=useReview();
  const [activeTab,setActiveTab]=useState<Section>('library');
  const [isTimedChallengeOpen,setIsTimedChallengeOpen]=useState(false);
  const [selectedCategory,setSelectedCategory]=useState<Area>('All');
  const [selectedTopicId,setSelectedTopicId]=useState('');
  const unresolved=errors.filter(e=>!e.isResolved).length;
  const filtered=useMemo(()=>allTopics.filter(t=>selectedCategory==='All'||areaOf(t.subjectId)===selectedCategory),[allTopics,selectedCategory]);
  const selected=filtered.find(t=>t.id===selectedTopicId)??filtered[0];
  return <div id="practice-screen-root" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1536px] mx-auto">
    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b pb-4">
      <div><div className="flex items-center gap-2"><FeatureIcon name="practice"/><h1 className="text-2xl font-black text-slate-900 tracking-tight">Practice & Exercises</h1></div>
        <p className="text-sm text-slate-600 mt-1">Explore categorized problems, study your weak spots, or log practice completed outside the app.</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" id="btn-practice-timed-challenge" onClick={()=>setIsTimedChallengeOpen(true)}
        className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex gap-2 items-center"><AppArtwork name="timer" inline className="w-4 h-4"/> Existing 5-question timed challenge</button>
        <button type="button" onClick={()=>setCurrentScreen('errors')} className="px-3 py-2 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-800 flex gap-1 items-center"><AlertTriangle size={15}/>{unresolved} logged mistakes <ArrowRight size={14}/></button></div>
    </header>
    <nav aria-label="Practice activities" className="flex gap-2 flex-wrap border-b border-slate-200 pb-3">
      {([{id:'library',text:'Browse & Solve'},{id:'smart-quiz',text:'Smart Quiz'},{id:'external',text:'Log External Practice'}] as const).map(item=><button key={item.id} type="button" onClick={()=>setActiveTab(item.id)}
        aria-current={activeTab===item.id?'page':undefined} className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab===item.id?'bg-blue-700 text-white':'bg-white border text-slate-600 hover:bg-slate-50'}`}>{item.text}</button>)}
    </nav>
    {activeTab==='library'&&<PracticeLibrary/>}
    {activeTab==='smart-quiz'&&<SmartQuizSection/>}
    {activeTab==='external'&&<div className="max-w-4xl space-y-4">
      <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-sm text-amber-950"><b>External practice log:</b> Use this when you solved exercises from a book, worksheet or class, rather than answering questions inside this app. Results are self-reported and are not independently graded.</div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
        <h2 className="font-bold text-slate-900 flex items-center gap-2"><BookOpenCheck size={18}/> Select the topic you studied</h2>
        <div className="space-y-2"><label className="block text-xs font-bold text-slate-700">Subject area</label>
          <div className="flex flex-wrap gap-2">{areas.map(area=><button key={area} type="button" onClick={()=>{setSelectedCategory(area);setSelectedTopicId('')}} className={`rounded-lg px-3 py-2 text-xs font-semibold ${selectedCategory===area?'bg-blue-700 text-white':'bg-slate-100 text-slate-700'}`}>{area}</button>)}</div></div>
        <div><label htmlFor="external-topic" className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
          <select id="external-topic" className="w-full p-3 bg-slate-50 border rounded-xl text-sm" value={selected?.id??''} onChange={e=>setSelectedTopicId(e.target.value)}>
            {filtered.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        {!selected&&<p className="text-sm text-rose-700">No topics are available in the selected category.</p>}
        <div className="flex flex-wrap gap-2"><button type="button" disabled={!selected} onClick={()=>selected&&startReview(selected,'External Practice Log')}
          className="px-5 py-3 rounded-xl bg-blue-700 text-white disabled:opacity-40 text-sm font-bold">Log external practice for {selected?.name??'topic'}</button>
          <button type="button" disabled={!selected} onClick={()=>selected&&openTopicDrawer(selected)} className="px-4 py-3 rounded-xl border text-sm font-medium">Topic details</button></div>
        <p className="text-xs text-slate-500">This opens the existing manual review form. Question-count and difficulty controls have been removed here because the form cannot enforce them.</p>
      </div>
    </div>}
    {isTimedChallengeOpen&&<AlgebraTimedChallengeModal isOpen onClose={()=>setIsTimedChallengeOpen(false)} initialSetId="set-1-core"/>}
  </div>;
};
