import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Bookmark, ListFilter, Play, Search, Clock3, CheckCircle2 } from 'lucide-react';
import { FormattedMathText, MathFormula } from '../MathFormula';
import { PRACTICE_CATALOG, filterPracticeQuestions, type CatalogFilters, type CatalogQuestion } from '../../domain/practice/catalog';
import { createPracticeSession, loadPracticeStore, savePracticeStore, validatePracticeStore, endPracticeSession, isPracticeExpired, recordSessionAnswer, MAX_PRACTICE_BYTES, PRACTICE_ENGINE_KEY, type PracticeStore, type PracticeMode } from '../../domain/practice/practiceStorage';

const PAGE_SIZE=8;
export const PRACTICE_REQUESTED_TOPIC_KEY='ece_practice_requested_topic_v1';
const emptyFilters:CatalogFilters={topicId:'',subskill:'',difficulty:'',search:'',status:'all'};
const initialFilters=():CatalogFilters=>{
  if(typeof window==='undefined')return emptyFilters;
  try {
    const requested=window.sessionStorage.getItem(PRACTICE_REQUESTED_TOPIC_KEY);
    window.sessionStorage.removeItem(PRACTICE_REQUESTED_TOPIC_KEY);
    if(requested&&PRACTICE_CATALOG.some(q=>q.topicId===requested))return {...emptyFilters,topicId:requested};
  }catch{/* Browsing remains available when sessionStorage is blocked. */}
  return emptyFilters;
};
const allTopics=[...new Map(PRACTICE_CATALOG.map(q=>[q.topicId,{id:q.topicId,name:q.topic,group:q.group}])).values()]
  .sort((a,b)=>a.name.localeCompare(b.name));

const QuestionBody:React.FC<{q:CatalogQuestion}>=({q})=>(
  <div className="space-y-3 min-w-0">
    <div className="text-sm text-slate-800 leading-7"><FormattedMathText text={q.prompt}/></div>
    {q.equation&&<div className="bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto p-3"><MathFormula math={q.equation} block/></div>}
  </div>
);

export const PracticeLibrary:React.FC=()=>{
  const [filters,setFilters]=useState<CatalogFilters>(initialFilters);
  const [page,setPage]=useState(0);
  const [store,setStore]=useState<PracticeStore>(()=>loadPracticeStore());
  const [selectedCount,setSelectedCount]=useState(5);
  const [selectedMode,setSelectedMode]=useState<PracticeMode>('guided');
  const [durationSeconds,setDurationSeconds]=useState(600);
  const [clockNow,setClockNow]=useState(()=>Date.now());
  const [activeSessionId,setActiveSessionId]=useState<string|null>(()=>loadPracticeStore().activeSessionId);
  const [expanded,setExpanded]=useState<string|null>(null);
  const [error,setError]=useState(()=>{
    if(typeof window==='undefined')return '';
    try{
      const raw=window.localStorage.getItem(PRACTICE_ENGINE_KEY);
      if(raw && (raw.length>MAX_PRACTICE_BYTES || !validatePracticeStore(JSON.parse(raw))))
        return 'Saved Practice Library data is invalid. Saving is blocked until it is recovered or explicitly reset.';
    }catch{return 'Practice storage is corrupted or inaccessible. Saving is blocked until recovery.';}
    return '';
  });
  useEffect(()=>{
    const onStorage=(event:StorageEvent)=>{
      if(event.key===PRACTICE_ENGINE_KEY){const latest=loadPracticeStore();setStore(latest);setActiveSessionId(latest.activeSessionId);}
    };
    window.addEventListener('storage',onStorage);
    return ()=>window.removeEventListener('storage',onStorage);
  },[]);
  const [showContents,setShowContents]=useState(false);
  const [showHint,setShowHint]=useState<string|null>(null);

  const [questionView,setQuestionView]=useState<'browse'|'focus'>(()=>{const state=loadPracticeStore();return state.sessions.find(s=>s.id===state.activeSessionId)?.mode==='timed'?'focus':'browse';});
  const [focusIndex,setFocusIndex]=useState(0);

  const save=(next:PracticeStore):boolean=>{
    try {if(typeof window==='undefined')throw new Error('Browser storage unavailable');
      savePracticeStore(window.localStorage,next);setStore(next);setError('');return true;
    }catch(e){setError(`Could not save practice progress: ${e instanceof Error?e.message:'storage unavailable'}. Export your learner backup or free browser space before continuing.`);return false;}
  };
  const updateFilter=(change:Partial<CatalogFilters>)=>{
    setFilters(f=>({...f,...change,...('topicId' in change?{subskill:''}:{})}));setPage(0);setExpanded(null);setError('');
  };
  const matching=useMemo(()=>filterPracticeQuestions(PRACTICE_CATALOG,filters,store.firstAttempts),[filters,store]);
  const scoped=useMemo(()=>PRACTICE_CATALOG.filter(q=>!filters.topicId||q.topicId===filters.topicId),[filters.topicId]);
  const subskills=useMemo(()=>[...new Set(scoped.map(q=>q.subskill))].sort(),[scoped]);
  const currentSession=store.sessions.find(s=>s.id===activeSessionId);
  const questionsByKey=useMemo(()=>new Map(PRACTICE_CATALOG.map(q=>[q.key,q])),[]);
  const hasChanged=Boolean(currentSession?.keys.some(key=>{
    const q=questionsByKey.get(key);return !q||q.revision!==currentSession.revisions[key];
  }));
  const sessionQuestions=currentSession&&!hasChanged?currentSession.keys.map(k=>questionsByKey.get(k)!).filter(Boolean):[];
  const answeredCount=currentSession?Object.keys(currentSession.answers).length:0;
  const sessionCorrect=currentSession?sessionQuestions.filter(q=>currentSession.answers[q.key]===q.correctOptionId).length:0;
  const timeLeft=currentSession?.mode==='timed'&&currentSession.deadlineAt?
    Math.max(0,Math.ceil((Date.parse(currentSession.deadlineAt)-clockNow)/1000)):null;
  const isEnded=Boolean(currentSession?.endedAt)||Boolean(currentSession&&isPracticeExpired(currentSession,clockNow));
  useEffect(()=>{
    if(!currentSession || currentSession.mode!=='timed' || currentSession.endedAt)return;
    const tick=()=>{
      const now=Date.now();setClockNow(now);
      if(isPracticeExpired(currentSession,now)){
        const latest=loadPracticeStore();const live=latest.sessions.find(s=>s.id===currentSession.id);
        if(live&&!live.endedAt){try{savePracticeStore(window.localStorage,endPracticeSession(latest,live.id,new Date(now).toISOString()));
          setStore(loadPracticeStore());}catch{setError('The timed drill expired, but completion could not be saved. Restore browser storage before continuing.');}}
      }
    };
    tick();const timer=window.setInterval(tick,1000);return ()=>window.clearInterval(timer);
  },[currentSession?.id,currentSession?.deadlineAt,currentSession?.endedAt]);
  const displayed=currentSession?questionView==='focus'?[sessionQuestions[Math.min(focusIndex,sessionQuestions.length-1)]].filter(Boolean)
    :sessionQuestions.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE)
    :matching.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
  const total=currentSession?sessionQuestions.length:matching.length;
  const maxPage=Math.max(0,Math.ceil(total/PAGE_SIZE)-1);

  const startSession=()=>{
    if(!matching.length){setError('No questions match these filters. Adjust a filter; the app will not substitute unrelated questions.');return;}
    if(matching.length<selectedCount){setError(`Only ${matching.length} matching question(s), but ${selectedCount} requested. Choose a smaller set or broaden your filters; questions will not repeat automatically.`);return;}
    const pool=[...matching];
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    const selected=pool.slice(0,selectedCount);
    const id=`${selectedMode}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
    const next=createPracticeSession(loadPracticeStore(),selected.map(q=>({key:q.key,revision:q.revision})),id,new Date().toISOString(),selectedMode,durationSeconds);
    if(save(next)){setActiveSessionId(id);setExpanded(null);setShowHint(null);setPage(0);setFocusIndex(0);
      setClockNow(Date.now());if(selectedMode==='timed')setQuestionView('focus');}
  };
  const completeSession=()=>{
    if(!currentSession || currentSession.endedAt)return;
    const latest=loadPracticeStore();
    if(save(endPracticeSession(latest,currentSession.id,new Date().toISOString())))setClockNow(Date.now());
  };
  const finishSession=()=>{
    const latest=loadPracticeStore();
    const finalized=currentSession&&!currentSession.endedAt?endPracticeSession(latest,currentSession.id,new Date().toISOString()):latest;
    if(save({...finalized,activeSessionId:null})){setActiveSessionId(null);setPage(0);setExpanded(null);setShowHint(null);setFocusIndex(0);}
  };
  const submit=(q:CatalogQuestion)=>{
    if(!currentSession||hasChanged||isEnded||currentSession.answers[q.key]!==undefined)return;
    // Re-read stored state before accepting; not an atomic transaction across concurrent tabs.
    const base=loadPracticeStore();
    const latest=base.sessions.find(s=>s.id===currentSession.id);
    if(!latest||latest.endedAt||isPracticeExpired(latest,Date.now())||latest.answers[q.key]!==undefined){setStore(base);return;}
    const selected=latest.drafts[q.key];if(!selected||!q.options.some(option=>option.id===selected)){
      setError('Choose a valid answer first.');return;
    }
    const record=recordSessionAnswer(base,latest.id,q.key,selected,q.correctOptionId,q.revision,new Date().toISOString());
    if(!record.accepted){setStore(loadPracticeStore());return;}
    const updated=record.store.sessions.find(s=>s.id===latest.id)!;
    const next=Object.keys(updated.answers).length===updated.keys.length?
      endPracticeSession(record.store,latest.id,new Date().toISOString()):record.store;
    save(next);
  };
  const bookmark=(key:string)=>{
    const latest=loadPracticeStore();
    save({...latest,bookmarks:latest.bookmarks.includes(key)?latest.bookmarks.filter(v=>v!==key):[...latest.bookmarks,key]});
  };
  const choiceFor=(q:CatalogQuestion)=>currentSession?.answers[q.key]??currentSession?.drafts[q.key];
  const choose=(q:CatalogQuestion,optionId:string)=>{
    if(!currentSession || isEnded || currentSession.answers[q.key]!==undefined)return;
    const latest=loadPracticeStore();
    const entry=latest.sessions.find(s=>s.id===currentSession.id);
    if(!entry||entry.endedAt||isPracticeExpired(entry,Date.now())||entry.answers[q.key]!==undefined)return;
    save({...latest,sessions:latest.sessions.map(s=>s.id===entry.id?
      {...s,drafts:{...s.drafts,[q.key]:optionId}}:s)});
  };

  return <div id="practice-library" className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl sm:text-2xl font-black text-slate-900">Browse & Solve Problems</h2>
        <p className="text-sm text-slate-600 mt-1">Textbook-informed Algebra and Trigonometry learning exercises, grouped by topic and subskill.</p></div>
      <span className="px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-900 text-xs font-bold">Learning drills only · independent editorial review pending</span>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {[['Available questions',PRACTICE_CATALOG.length],['Practice topics',allTopics.length],['Matching questions',matching.length],['Unique first attempts',Object.keys(store.firstAttempts).length]].map(([label,value])=><div key={label} className="rounded-xl border bg-white p-3"><div className="text-xs text-slate-500">{label}</div><div className="text-xl font-black text-slate-900 mt-1">{value}</div></div>)}
    </div>
    <div className="flex gap-2 flex-wrap items-center">
      <button type="button" onClick={()=>setShowContents(!showContents)} className="lg:hidden flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold bg-white"><ListFilter size={15}/> {showContents?'Hide':'Show'} topics</button>
      <div className="flex-1 min-w-[180px] relative"><Search size={16} className="absolute left-3 top-3 text-slate-400"/>
        <input aria-label="Search practice problems" disabled={!!currentSession} className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white" placeholder="Search questions, topics, subskills…" value={filters.search} onChange={e=>updateFilter({search:e.target.value})}/></div>
      <select aria-label="Difficulty" disabled={!!currentSession} value={filters.difficulty} onChange={e=>updateFilter({difficulty:e.target.value})} className="border rounded-xl px-3 py-2.5 bg-white text-xs font-bold">
        <option value="">Any difficulty</option>{['Basic','Intermediate','Advanced','Board-level'].map(x=><option key={x}>{x}</option>)}</select>
      <select aria-label="Attempt status" disabled={!!currentSession} value={filters.status} onChange={e=>updateFilter({status:e.target.value as CatalogFilters['status']})} className="border rounded-xl px-3 py-2.5 bg-white text-xs font-bold">
        <option value="all">All attempts</option><option value="unattempted">Unattempted</option><option value="attempted">Attempted</option><option value="incorrect">Incorrect first try</option></select>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-[245px_minmax(0,1fr)] gap-4 items-start">
      <aside className={`${showContents?'block':'hidden'} lg:block bg-white rounded-2xl border border-slate-200 p-3 lg:sticky lg:top-5 max-h-[75vh] overflow-y-auto`} aria-label="Practice topic categories">
        <div className="flex justify-between mb-2"><b className="text-xs text-slate-800">Practice topics</b><span className="text-xs text-slate-500">{allTopics.length}</span></div>
        <button type="button" disabled={!!currentSession} onClick={()=>updateFilter({topicId:''})} className={`w-full text-left rounded-lg px-2.5 py-2 text-xs ${!filters.topicId?'bg-blue-50 text-blue-800 font-bold':'hover:bg-slate-50'}`}>All topics <span className="float-right">{PRACTICE_CATALOG.length}</span></button>
        {allTopics.map(topic=>{const count=PRACTICE_CATALOG.filter(q=>q.topicId===topic.id).length;return <button type="button" key={topic.id} disabled={!!currentSession} onClick={()=>{updateFilter({topicId:topic.id});setShowContents(false)}}
          className={`w-full text-left rounded-lg px-2.5 py-2 text-xs ${filters.topicId===topic.id?'bg-blue-50 text-blue-800 font-bold':'text-slate-700 hover:bg-slate-50'}`}>
            {topic.name}<span className="float-right ml-1 text-slate-400">{count}</span></button>})}
      </aside>
      <div className="space-y-4 min-w-0">
        <div className="bg-white rounded-2xl border p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-bold text-slate-900">{allTopics.find(t=>t.id===filters.topicId)?.name??'All Practice Exercises'}</h3>
            <p className="text-xs text-slate-500">{matching.length} matching question(s) · {subskills.length} available subskills</p></div>
          <select aria-label="Subskill" disabled={!!currentSession} className="max-w-full rounded-lg border p-2 text-xs" value={filters.subskill} onChange={e=>updateFilter({subskill:e.target.value})}>
            <option value="">All subskills</option>{subskills.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          {!currentSession?<div className="space-y-3 border-t pt-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Practice mode">
              {([{key:'guided',label:'Guided',help:'Hints + immediate solutions'},{key:'independent',label:'Independent',help:'No hints; feedback after submission'},
                {key:'timed',label:'Timed Drill',help:'Countdown; answers after finish'}] as const).map(mode=><button key={mode.key} type="button"
                aria-pressed={selectedMode===mode.key} onClick={()=>setSelectedMode(mode.key)}
                className={`rounded-lg px-3 py-2 text-xs font-bold border ${selectedMode===mode.key?'border-blue-600 bg-blue-50 text-blue-800':'border-slate-200 text-slate-600'}`}
                title={mode.help}>{mode.label}</button>)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="practice-set-count" className="text-xs font-bold text-slate-700">Questions</label>
              <select id="practice-set-count" className="rounded-lg border px-2 py-2 text-xs" value={selectedCount} onChange={e=>setSelectedCount(Number(e.target.value))}>
                {[1,2,3,5,10,20,30,50].map(n=><option value={n} key={n}>{n}</option>)}</select>
              {selectedMode==='timed'&&<><label htmlFor="practice-duration" className="text-xs font-bold text-slate-700">Time limit</label>
                <select id="practice-duration" className="rounded-lg border px-2 py-2 text-xs" value={durationSeconds} onChange={e=>setDurationSeconds(Number(e.target.value))}>
                  {[300,600,1200,1800,3600].map(n=><option key={n} value={n}>{n/60} minutes</option>)}</select></>}
              {matching.length>0&&matching.length<selectedCount&&<button type="button" onClick={()=>setSelectedCount(matching.length)} className="text-xs text-blue-700 underline font-bold">Use all {matching.length} available</button>}
              <button type="button" onClick={startSession} disabled={!matching.length} className="rounded-xl px-4 py-2 bg-blue-700 text-white text-xs font-bold flex gap-2 items-center disabled:opacity-40"><Play size={14}/> Start {selectedMode==='timed'?'Timed Drill':'Solving'}</button>
            </div>
            <p className="text-xs text-slate-500">{selectedMode==='guided'?'Hints and explanations after each attempt.':selectedMode==='independent'? 'Unassisted problem-solving, with feedback after each submission.':'No solutions until the set is completed or time expires. Unanswered questions count as incorrect.'} These are learning-only results, not certified board-readiness scores.</p>
          </div>:<div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
            <div className="space-y-1">
              <div className="text-xs text-slate-700 font-semibold capitalize">{currentSession.mode} session · {answeredCount}/{sessionQuestions.length} answered
                {(currentSession.mode!=='timed'||isEnded)&&` · ${sessionCorrect} correct`}</div>
              {timeLeft!==null&&!isEnded&&<div className="flex items-center gap-1 text-xs font-bold text-amber-800" role="timer"><Clock3 size={14}/> Remaining: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}</div>}
              <p className="text-xs text-slate-500">Results are practice-only and never update official mastery or mock-exam evidence.</p>
            </div>
            <div className="flex gap-2 flex-wrap"><button type="button" onClick={()=>setQuestionView(questionView==='browse'?'focus':'browse')} className="rounded-lg border px-3 py-1.5 text-xs">{questionView==='browse'?'Focus view':'Browse view'}</button>
              {!isEnded&&<button type="button" onClick={completeSession} className="rounded-lg border border-amber-300 text-amber-900 px-3 py-1.5 text-xs">Finish & see results</button>}
              <button type="button" onClick={finishSession} className="rounded-lg border px-3 py-1.5 text-xs">Back to library</button></div>
          </div>}
        </div>
        {error&&<div role="alert" className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">{error}</div>}
        {hasChanged&&<div role="alert" className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">The saved question set has changed after an app update. It has been paused rather than silently substituted. <button type="button" className="underline font-bold" onClick={finishSession}>Return to library</button>.</div>}
        {!currentSession&&!matching.length&&<div className="bg-white border rounded-xl p-6 text-sm text-slate-700">No matching exercises. Try clearing difficulty, topic or status filters. Questions are never replaced without telling you. <button type="button" className="text-blue-700 underline font-semibold" onClick={()=>updateFilter(emptyFilters)}>Clear filters</button></div>}
        {!hasChanged&&displayed.map((q,index)=>{
          const open=Boolean(currentSession)||expanded===q.key;
          const submitted=Boolean(currentSession&&currentSession.answers[q.key]!==undefined);
          const chosen=choiceFor(q);const correct=chosen===q.correctOptionId;
          const old=Boolean(store.firstAttempts[q.key]);
          const reveal=isEnded||(submitted&&currentSession?.mode!=='timed');
          return <article key={q.key} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm min-w-0">
            <div className="flex items-center justify-between gap-2"><div className="flex flex-wrap gap-2 items-center text-xs text-slate-500"><b>#{currentSession?questionView==='focus'?focusIndex+1:page*PAGE_SIZE+index+1:page*PAGE_SIZE+index+1}</b>
              <span className="rounded-md bg-blue-50 text-blue-800 px-2 py-1 font-bold">{q.subskill}</span><span>{q.difficulty}</span>{q.reviewStatus==='automated-checked'&&<span className="text-emerald-700 font-semibold" title="Automated algebra/structure checks; independent expert editorial review still pending">Algebra-checked</span>}</div>
              <div className="flex items-center gap-2"><button type="button" title={store.bookmarks.includes(q.key)?'Remove bookmark':'Bookmark question'} aria-label="Bookmark question" onClick={()=>bookmark(q.key)} className={`p-1.5 rounded-lg ${store.bookmarks.includes(q.key)?'text-blue-700 bg-blue-50':'text-slate-400'}`}><Bookmark size={16}/></button>
                {!currentSession&&<button type="button" onClick={()=>setExpanded(open?null:q.key)} className="flex items-center gap-1 text-xs font-bold text-blue-700">{open?'Collapse':'Preview'} {open?<ChevronDown size={14}/>:<ChevronRight size={14}/>}</button>}</div></div>
            <QuestionBody q={q}/>
            {open&&currentSession&&<div className="space-y-2 pt-2 border-t">
              <fieldset disabled={submitted||isEnded}><legend className="text-xs font-bold text-slate-700 mb-2">Select your answer</legend>
                {q.options.map(opt=><label key={opt.id} className={`flex items-start gap-2 p-3 border rounded-xl text-sm cursor-pointer ${chosen===opt.id?'bg-blue-50 border-blue-300':'border-slate-200'} ${reveal&&opt.id===q.correctOptionId?'ring-1 ring-emerald-400':''}`}>
                  <input type="radio" name={`answer-${q.key}`} className="mt-1" value={opt.id} checked={chosen===opt.id} onChange={()=>choose(q,opt.id)}/>
                  <div className="min-w-0 break-words"><FormattedMathText text={opt.text}/>{opt.latex&&<MathFormula math={opt.latex}/>}</div></label>)}</fieldset>
              {!submitted&&!isEnded?<div className="flex flex-wrap items-center gap-2"><button type="button" onClick={()=>submit(q)} disabled={!chosen} className="px-4 py-2 bg-blue-700 text-white text-xs rounded-lg font-bold disabled:opacity-40">Submit Answer</button>
                {currentSession.mode==='guided'&&q.hints.length>0&&<button type="button" className="px-3 py-2 rounded-lg border text-xs font-semibold" onClick={()=>setShowHint(q.key)}>Show hint (assisted)</button>}</div>:reveal?
                <div className={`p-3 rounded-lg ${correct?'bg-emerald-50 text-emerald-900':'bg-rose-50 text-rose-900'}`} role="status"><b>{!submitted?'Unanswered':correct?'Correct':'Not correct'}</b>{old?' · Repeated question (no extra first-attempt credit)':''}
                  <div className="mt-2 text-sm"><b>Correct answer:</b> <FormattedMathText text={q.options.find(option=>option.id===q.correctOptionId)?.text??'See solution'}/></div>
                  <div className="mt-2 text-sm"><b>Explanation:</b> <FormattedMathText text={q.explanation}/></div></div>:
                <div className="p-3 rounded-lg bg-slate-50 text-slate-600 text-xs">{submitted?'Answer saved. Feedback unlocks when the timed drill finishes.':'Unanswered — no answer was submitted before the session ended.'}</div>}
              {showHint===q.key&&!submitted&&currentSession.mode==='guided'&&<div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs space-y-1"><b>Hint — this question is assisted</b><div><FormattedMathText text={q.hints[0]}/></div></div>}
            </div>}
            {!currentSession&&open&&<p className="text-xs text-slate-500">Select Start Solving above to answer a finite question set. Previewing does not record an attempt.</p>}
          </article>;
        })}
        {currentSession&&isEnded&&sessionQuestions.length>0&&<div className="p-5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
          <h3 className="font-bold text-blue-950">{timeLeft===0?'Time expired':answeredCount===sessionQuestions.length?'Practice set complete':'Practice set ended'} · {sessionCorrect} of {sessionQuestions.length} correct · {sessionQuestions.length-answeredCount} unanswered</h3>
          <p className="text-xs text-blue-900">Results are learning diagnostics only. Automated algebra checks do not replace expert answer certification. No official board-readiness evidence is written.</p>
          <button type="button" onClick={finishSession} className="px-4 py-2 rounded-lg bg-blue-700 text-white text-xs font-bold">Choose another set</button>
        </div>}
        {total>PAGE_SIZE&&questionView==='browse'&&<div className="flex justify-between items-center bg-white p-3 border rounded-xl text-sm">
          <button type="button" disabled={page===0} className="px-3 py-2 rounded-lg border disabled:opacity-30" onClick={()=>setPage(p=>Math.max(0,p-1))}>Previous</button>
          <span>Page {Math.min(page+1,maxPage+1)} of {maxPage+1}</span>
          <button type="button" disabled={page>=maxPage} className="px-3 py-2 rounded-lg border disabled:opacity-30" onClick={()=>setPage(p=>Math.min(maxPage,p+1))}>Next</button></div>}
        {currentSession&&questionView==='focus'&&<div className="flex justify-between bg-white p-3 border rounded-xl text-sm">
          <button type="button" disabled={focusIndex===0} onClick={()=>setFocusIndex(n=>Math.max(0,n-1))}>← Previous</button><span>{focusIndex+1} / {sessionQuestions.length}</span>
          <button type="button" disabled={focusIndex>=sessionQuestions.length-1} onClick={()=>setFocusIndex(n=>Math.min(sessionQuestions.length-1,n+1))}>Next →</button></div>}
      </div>
    </div>
  </div>;
};
