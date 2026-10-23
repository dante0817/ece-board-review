import React, {useCallback, useEffect, useMemo, useState} from 'react';
import rawCurriculum from './curriculum.json';
import {EMPTY_STATUS, normalizeStatus, overallStats, topicStats, transitionStatus} from './progress';
import type {CurriculumGroup, CurriculumTopic, CurriculumSubtopic, TrigIntegration, ProgressSnapshot, StatusField} from './types';
import './trigonometry.css';

const GROUPS = rawCurriculum.groups as CurriculumGroup[];
const TOPICS = rawCurriculum.topics as CurriculumTopic[];
type View = 'overview'|'topic'|'review';
type Tab = 'learn'|'practice'|'review';
export type ExistingTopicLink = { id: string; title: string; subtopicIds: string[] };
type Props = {
  integration: TrigIntegration;
  navigationMode?: 'internal'|'hash';
  className?: string;
  existingTopics?: ExistingTopicLink[];
  initialSubtopicId?: string | null;
  onOpenExistingTopic?: (topicId: string) => void;
  onReviewExistingTopic?: (topicId: string) => void;
  renderExistingTracker?: (topicId: string, title: string) => React.ReactNode;
  /** Render the app's real lesson reader inside the expanded subtopic. */
  renderInlineLesson?: (subtopicId: string, onCollapse: () => void) => React.ReactNode;
};
function findTopic(id: string|null) {return TOPICS.find(t=>t.id===id);}
function topicForSub(id: string) {return TOPICS.find(t=>t.subtopics.some(s=>s.id===id));}
function parseHash(): {view:View;topicId:string|null;subtopicId:string|null} {
  const m=location.hash.match(/^#\/trigonometry\/(overview|review|topic)(?:\/([^/]+))?(?:\/([^/]+))?$/);
  if (!m) return {view:'overview',topicId:null,subtopicId:null};
  if(m[1]==='topic' && findTopic(m[2])) return {view:'topic',topicId:m[2],subtopicId:findTopic(m[2])?.subtopics.some(s=>s.id===m[3])?m[3]:null};
  return {view:m[1]==='review'?'review':'overview',topicId:null,subtopicId:null};
}
const CHECKBOXES: {key:StatusField;label:string}[] = [
  {key:'read1',label:'Read 1×'}, {key:'read2',label:'Read 2×'}, {key:'read3',label:'Read 3×'},
  {key:'mastered',label:'Mastered (Self)'}, {key:'review',label:'Needs Review'}
];
export function TrigonometryModule({integration,navigationMode='internal',className='',existingTopics=[],initialSubtopicId=null,onOpenExistingTopic,onReviewExistingTopic,renderExistingTracker,renderInlineLesson}:Props) {
  const returnTopic=initialSubtopicId?topicForSub(initialSubtopicId):undefined;
  const initial=navigationMode==='hash' && typeof location!=='undefined'?parseHash():returnTopic?{view:'topic' as View,topicId:returnTopic.id,subtopicId:initialSubtopicId}:{view:'overview' as View,topicId:null,subtopicId:null};
  const [view,setView]=useState<View>(initial.view);
  const [topicId,setTopicId]=useState<string|null>(initial.topicId);
  const [subtopicId,setSubtopicId]=useState<string|null>(initial.subtopicId);
  const [tab,setTab]=useState<Tab>('learn');
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('all');
  const [progress,setProgress]=useState<ProgressSnapshot>({});
  const [loaded,setLoaded]=useState(false);
  const [busy,setBusy]=useState<string|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [showReviewList,setShowReviewList]=useState(false);

  useEffect(()=>{let live=true;setLoaded(false);Promise.resolve().then(()=>integration.readProgress()).then(snapshot=>{
    if(!live)return;const allowed=new Set(TOPICS.flatMap(t=>t.subtopics.map(s=>s.id)));
    const normalized:ProgressSnapshot={};Object.entries(snapshot??{}).forEach(([k,v])=>{if(allowed.has(k))normalized[k]=normalizeStatus(v)});
    setProgress(normalized);setLoaded(true);
  }).catch(()=>{if(live){setError('Learning progress could not be loaded. Changes are disabled until it loads.');setLoaded(false)}});return()=>{live=false};},[integration]);

  useEffect(()=>{if(navigationMode!=='hash')return;const listener=()=>{const state=parseHash();setView(state.view);setTopicId(state.topicId);setSubtopicId(state.subtopicId);setTab('learn');};window.addEventListener('hashchange',listener);window.addEventListener('popstate',listener);return()=>{window.removeEventListener('hashchange',listener);window.removeEventListener('popstate',listener)};},[navigationMode]);

  const navigate=useCallback((v:View, tId:string|null=null, sId:string|null=null)=>{
    setView(v);setTopicId(tId);setSubtopicId(sId);setTab('learn');setError(null);
    if(navigationMode==='hash'){
      const hash=v==='topic'&&tId?`#/trigonometry/topic/${tId}${sId?`/${sId}`:''}`:`#/trigonometry/${v}`;
      if(location.hash!==hash)history.pushState(null,'',hash);
    }
  },[navigationMode]);

  const setReading=async(s:CurriculumSubtopic,key:StatusField,checked:boolean)=>{
    if(busy||!loaded||!integration.bindings[s.id]?.lessonAvailable)return;
    const prev=normalizeStatus(progress[s.id]??EMPTY_STATUS);const next=transitionStatus(prev,key,checked);
    setBusy(s.id);setError(null);setProgress(p=>({...p,[s.id]:next}));
    try {await integration.saveProgress(s.id,next)} catch {
      setProgress(p=>({...p,[s.id]:prev}));setError('Could not save that learning status. The change has been reverted.');
    } finally {setBusy(null)}
  };

  const searchResults=useMemo(()=>{
    const q=query.trim().toLowerCase();return TOPICS.filter(t=>(filter==='all'||t.group===filter)&&(!q||[t.title,t.summary,...t.subtopics.map(s=>s.title)].some(x=>x.toLowerCase().includes(q))));
  },[filter,query]);
  const stats=overallStats(TOPICS,progress,integration.bindings);
  const selectedTopic=findTopic(topicId);
  const selectedSub=selectedTopic?.subtopics.find(s=>s.id===subtopicId);
  const selectedBinding=selectedSub?integration.bindings[selectedSub.id]:undefined;
  const selectedExisting=selectedSub?existingTopics.filter(t=>t.subtopicIds.includes(selectedSub.id)):[];
  const flagged=TOPICS.flatMap(t=>t.subtopics.filter(s=>progress[s.id]?.review).map(s=>({topic:t,sub:s})));
  const unread=TOPICS.filter(t=>!t.optional).flatMap(t=>t.subtopics.map(s=>({t,s}))).find(({s})=>integration.bindings[s.id]?.lessonAvailable&&!progress[s.id]?.mastered);

  function infoStats() {return <section className="trig-stats" aria-label="Trigonometry learning statistics">
    <div><small>CORE TOPICS</small><strong>{stats.coreTopics} <span>+ {stats.optionalTopics} optional</span></strong></div>
    <div><small>DEFINED CORE SUBTOPICS</small><strong>{stats.definedCore}</strong></div>
    <div><small>AVAILABLE LESSONS</small><strong>{stats.availableCore}<span> / {stats.definedCore}</span></strong></div>
    <div><small>SELF-MASTERED AVAILABLE</small><strong>{stats.selfMasteredAvailable}<span> / {stats.availableCore}</span></strong></div>
    <div><small>NEEDS REVIEW</small><strong>{stats.needsReview}</strong></div>
  </section>}
  function topicCard(t:CurriculumTopic){const ts=topicStats(t,progress,integration.bindings);return <button type="button" key={t.id} className="trig-card" onClick={()=>navigate('topic',t.id)} aria-label={`Open ${t.title}`}>
    <span className="trig-card-title"><span className={`trig-topic-icon trig-${t.group}`}>{t.symbol}</span><small>TOPIC {t.number}</small></span>
    <strong>{t.title}</strong><p>{t.summary}</p>
    <span className="trig-card-foot">{ts.available}/{ts.defined} lessons available <span>{ts.mastered}/{ts.available} mastered</span></span>
    <span className="trig-bar"><span style={{width:`${ts.mastery*100}%`}}/></span>
    {t.optional&&<span className="trig-badge">Optional · excluded from core progress</span>}
  </button>}
  return <section className={`trig-root ${className}`} aria-label="Trigonometry curriculum">
    <header className="trig-head"><div><div className="trig-kicker">BSECE REVIEWER · ENGINEERING MATHEMATICS</div><h1>Trigonometry</h1><p>Structured lessons, formulas, practice, and engineering applications.</p></div><div className="trig-head-actions"><button type="button" className={view==='overview'?'active':''} onClick={()=>navigate('overview')}>Topics</button><button type="button" className={view==='review'?'active':''} onClick={()=>navigate('review')}>Review center</button></div></header>
    {error&&<div className="trig-alert" role="alert">{error}<button type="button" onClick={()=>setError(null)}>Dismiss</button></div>}
    {!loaded&&<div className="trig-alert" role="status">Checking existing learning progress…</div>}
    {view==='overview'&&<>
      <section className="trig-hero"><div><h2>Learn the concept. Apply the technique.</h2><p>Four curriculum groups, 14 topics, and 102 subtopics. Lesson availability and progress reflect actual app data.</p><button type="button" onClick={()=>unread&&navigate('topic',unread.t.id,unread.s.id)} disabled={!unread}>Continue available lesson →</button></div><span aria-hidden="true">∿</span></section>
      {infoStats()}
      {existingTopics.length>0&&<section className="trig-existing" aria-label="Existing Trigonometry topics">
        <h2>Existing reviewer topics <small>Retained from v10.35.1 · separate from new lesson coverage</small></h2>
        <div className="trig-existing-grid">{existingTopics.map(topic=><article className="trig-existing-card" key={topic.id}>
          <strong>{topic.title}</strong>
          <p>Open the original topic details or the existing review workflow. These are not represented as 102 completed lessons.</p>
          <div className="trig-existing-buttons"><button type="button" onClick={()=>onOpenExistingTopic?.(topic.id)}>Open existing topic →</button>
            <button type="button" onClick={()=>onReviewExistingTopic?.(topic.id)}>Existing review</button></div>
          {renderExistingTracker?.(topic.id,topic.title)}
        </article>)}</div>
      </section>}
      <div className="trig-toolbar"><label className="trig-search">Search topics and subtopics<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="e.g. phase shift, vectors, identities"/></label><div className="trig-filters" aria-label="Curriculum group filter">{[{id:'all',short:'All topics'},...GROUPS].map(g=><button type="button" key={g.id} aria-pressed={filter===g.id} onClick={()=>setFilter(g.id)}>{g.short}</button>)}</div></div>
      {GROUPS.map(g=>{const related=searchResults.filter(t=>t.group===g.id);return related.length?<section key={g.id} className="trig-group"><h2><span className={`trig-topic-icon trig-${g.id}`}>{g.symbol}</span><span>{g.name}<small>{g.tagline}</small></span></h2><div className="trig-card-grid">{related.map(topicCard)}</div></section>:null})}
      {!searchResults.length&&<div className="trig-empty">No matching topics. <button type="button" onClick={()=>{setQuery('');setFilter('all')}}>Clear search and filters</button></div>}
    </>}
    {view==='topic'&&selectedTopic&&<>
      <button type="button" className="trig-back" onClick={()=>navigate('overview')}>← All topics</button>
      <div className="trig-topic-heading"><div><div className="trig-kicker">TOPIC {selectedTopic.number} · {GROUPS.find(g=>g.id===selectedTopic.group)?.name}</div><h2>{selectedTopic.title}</h2><p>{selectedTopic.summary}</p></div><span className="trig-badge">{selectedTopic.subtopics.length} subtopics</span></div>
      <section className="trig-topic-context" aria-label="Topic summary and references">
        {(()=>{const ts=topicStats(selectedTopic,progress,integration.bindings);return <div className="trig-topic-context-progress"><strong>{ts.mastered}/{ts.available} self-mastered</strong><span className="trig-bar"><span style={{width:`${ts.mastery*100}%`}}/></span><small>{ts.review} need review · {ts.defined-ts.available} lessons not linked</small></div>})()}
        <div><small>Topic formula</small><strong className="trig-topic-quick-formula">{selectedTopic.formula}</strong><small>{selectedTopic.note}</small></div>
        <div><small>Reference guides</small><strong>{selectedTopic.references}</strong></div>
      </section>
      <section className="trig-panel trig-accordion" aria-label={`${selectedTopic.title} subtopics`}>
        <h3>Subtopics <span className="trig-accordion-hint">Select a row to read its lesson here. Select it again to collapse.</span></h3>
        <div className="trig-accordion-list">{selectedTopic.subtopics.map(s=>{
          const binding=integration.bindings[s.id];
          const status=progress[s.id];
          const opened=subtopicId===s.id;
          const panelId=`trig-sub-panel-${s.id}`;
          const buttonId=`trig-sub-toggle-${s.id}`;
          return <div key={s.id} className={`trig-accordion-item${opened?' is-open':''}`}>
            <button type="button" id={buttonId} className="trig-accordion-toggle" aria-expanded={opened} aria-controls={panelId}
              onClick={()=>navigate('topic',selectedTopic.id,opened?null:s.id)}>
              <span className="trig-number">{s.number}</span>
              <span className="trig-accordion-name">{s.title}</span>
              <small className={binding?.lessonAvailable?'ready':'planned'}>{status?.review?'Needs review':binding?.lessonAvailable?status?.mastered?'Self-mastered':binding?.lessonStatus==='summary'?'Reference summary':binding?.lessonStatus==='draft'?'Draft lesson':binding?.lessonStatus==='reviewed'?'Reviewed lesson':binding?.lessonStatus==='verified'?'Verified lesson':'Lesson available':'Not yet linked'}</small>
              <span aria-hidden="true" className="trig-accordion-chevron">⌄</span>
            </button>
            <div id={panelId} className="trig-accordion-content" role="region" aria-labelledby={buttonId} hidden={!opened}>
              {opened&&selectedSub&&<>
              <div className="trig-accordion-actions">
                <div className="trig-tabs" role="tablist" aria-label={`${s.title} actions`}>
                  {(['learn','practice','review'] as const).map(k=><button key={k} type="button" role="tab" aria-selected={tab===k} aria-controls={`${panelId}-${k}`} onClick={()=>setTab(k)}>{k==='learn'?'Learn & track':k==='practice'?'Practice':'Review'}</button>)}
                </div>
              </div>
              {tab==='learn'&&<div id={`${panelId}-learn`} role="tabpanel" className="trig-accordion-tab-content">
                <p className="trig-muted">{binding?.lessonAvailable?'Lesson content appears below. Draft material awaits independent editorial review.':'This curriculum entry is not yet mapped to a real lesson.'}</p>
                {binding?.lessonAvailable&&<fieldset className="trig-checks" disabled={!loaded||busy===s.id}><legend>My study status · saved to the existing app</legend>{CHECKBOXES.map(c=><label key={c.key}><input type="checkbox" checked={Boolean((progress[s.id]??EMPTY_STATUS)[c.key])} onChange={e=>setReading(s,c.key,e.target.checked)}/>{c.label}</label>)}</fieldset>}
                {selectedExisting.length>0&&<div className="trig-related-existing"><strong>Related original reviewer topic</strong><p>The original topic and its historical progress are preserved separately.</p>{selectedExisting.map(t=><button key={t.id} type="button" className="trig-secondary" onClick={()=>onOpenExistingTopic?.(t.id)}>Open {t.title} →</button>)}</div>}
                {binding?.lessonAvailable&&binding.lessonId? <>
                  {renderInlineLesson ? <div className="trig-inline-reader">{renderInlineLesson(s.id,()=>navigate('topic',selectedTopic.id,null))}</div> : <button type="button" className="trig-primary" onClick={()=>integration.navigate({kind:'learn',subtopicId:s.id,lessonId:binding.lessonId!})}>Read lesson →</button>}
                  {renderInlineLesson&&<button type="button" className="trig-secondary trig-focus-action" onClick={()=>integration.navigate({kind:'learn',subtopicId:s.id,lessonId:binding.lessonId!})}>Open focused reading view ↗</button>}
                </> : <div className="trig-empty">Lesson unavailable until a real lesson ID is mapped.</div>}
              </div>}
              {tab==='practice'&&<div id={`${panelId}-practice`} role="tabpanel" className="trig-accordion-tab-content"><p className="trig-muted">Practice with this subtopic's questions in the existing practice engine.</p>{binding?.practiceAvailable&&binding.questionIds?.length?<button type="button" className="trig-primary" onClick={()=>integration.navigate({kind:'practice',subtopicId:s.id,questionIds:binding.questionIds!})}>Practice {binding.questionIds.length} mapped questions →</button>:<div className="trig-empty">No verified existing practice questions are mapped yet.</div>}{selectedExisting.map(t=><button key={t.id} type="button" className="trig-secondary" onClick={()=>onReviewExistingTopic?.(t.id)}>Open original topic review: {t.title} →</button>)}</div>}
              {tab==='review'&&<div id={`${panelId}-review`} role="tabpanel" className="trig-accordion-tab-content"><p className="trig-muted">Self-assessment and quiz performance are separate.</p><p>Self-mastered: <strong>{progress[s.id]?.mastered?'Yes':'No'}</strong> · Needs review: <strong>{progress[s.id]?.review?'Yes':'No'}</strong></p><button type="button" className="trig-secondary" onClick={()=>integration.navigate({kind:'mistakes',subtopicId:s.id})}>Open existing Mistakes / Review →</button></div>}
              </>}
            </div>
          </div>;
        })}</div>
      </section>
    </>}
    {view==='review'&&<><h2 className="trig-section-title">Review Center</h2><p className="trig-muted">Use the existing assessment system. Self-reported mastery remains distinct from exam performance.</p>{infoStats()}<div className="trig-review-cards"><div className="trig-panel"><h3>Needs review</h3><p>{flagged.length} flagged subtopics</p><button type="button" className="trig-secondary" onClick={()=>setShowReviewList(x=>!x)}>{showReviewList?'Hide flagged':'View flagged'} →</button></div><div className="trig-panel"><h3>Mistakes & assessments</h3><p>Access the actual app's mistakes and quiz history.</p><button type="button" className="trig-secondary" onClick={()=>integration.navigate({kind:'mistakes'})}>Open mistakes →</button></div><div className="trig-panel"><h3>Learning progress</h3><p>View complete learner statistics from the existing app.</p><button type="button" className="trig-secondary" onClick={()=>integration.navigate({kind:'progress'})}>Open progress →</button></div></div>{showReviewList&&<div className="trig-panel"><h3>Flagged subtopics</h3>{flagged.length?flagged.map(({topic,sub})=><button type="button" key={sub.id} className="trig-flagged" onClick={()=>navigate('topic',topic.id,sub.id)}>{sub.number} {sub.title} <small>{topic.title}</small></button>):<p>No subtopics flagged.</p>}</div>}</>}
    <footer className="trig-footer">Curriculum: 13 core + 1 optional · Availability and progress derive from connected app records · No existing records changed by this module's catalog</footer>
  </section>;
}
