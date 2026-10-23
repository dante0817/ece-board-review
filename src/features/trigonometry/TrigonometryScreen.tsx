import React, { useMemo, useState, useEffect } from 'react';
import { useReview } from '../../context/ReviewContext';
import { TreeMenuHeader } from '../../components/TreeMenuHeader';
import { TrigonometryModule, type ExistingTopicLink } from './TrigonometryModule';
import type { TrigIntegration } from './types';
import { ManualLearnTracker } from '../../components/learn-reader/ManualLearnTracker';
import { chapterTrackingId } from '../../domain/learn/manualLearnTracking';
import { LearnReaderLayout } from '../../components/learn-reader/LearnReaderLayout';
import { PRACTICE_CATALOG } from '../../domain/practice/catalog';
import { PRACTICE_REQUESTED_TOPIC_KEY } from '../../components/practice/PracticeLibrary';
import { TRIGONOMETRY_PILOT_LESSONS } from '../../data/lessons/trigonometryPilot';
import { TRIGONOMETRY_FOUNDATIONS_LESSONS } from '../../data/lessons/trigonometryFoundations';
import { TRIGONOMETRY_FOUNDATION_COMPLETION_LESSONS } from '../../data/lessons/trigonometryFoundationCompletion';
import { TRIGONOMETRY_FUNDAMENTAL_IDENTITIES_LESSONS } from '../../data/lessons/trigonometryFundamentalIdentities';
import { TRIGONOMETRY_ADVANCED_IDENTITIES_LESSONS } from '../../data/lessons/trigonometryAdvancedIdentities';
import { TRIGONOMETRY_INVERSE_FUNCTIONS_LESSONS } from '../../data/lessons/trigonometryInverseFunctions';
import { TRIGONOMETRY_EQUATIONS_LESSONS } from '../../data/lessons/trigonometryEquations';
import { TRIGONOMETRY_OBLIQUE_TRIANGLES_LESSONS } from '../../data/lessons/trigonometryObliqueTriangles';
import { TRIGONOMETRY_VECTORS_LESSONS } from '../../data/lessons/trigonometryVectors';
import { TRIGONOMETRY_COMPLEX_POLAR_LESSONS } from '../../data/lessons/trigonometryComplexPolar';
import { TRIGONOMETRY_POLAR_PARAMETRIC_LESSONS } from '../../data/lessons/trigonometryPolarParametric';
import { TRIGONOMETRY_WAVES_PHASE_LESSONS } from '../../data/lessons/trigonometryWavesPhase';
import { TRIGONOMETRY_ADVANCED_ENRICHMENT_LESSONS } from '../../data/lessons/trigonometryAdvancedEnrichment';
import { readTrigManualProgress, saveTrigManualProgress } from './manualProgressAdapter';

/** Known original v10.35.1 canonical Trigonometry topic identities. */
export const ORIGINAL_TRIGONOMETRY_TOPICS: ExistingTopicLink[] = [
  {
    id:'top-trig-identities',title:'Fundamental & Double-Angle Identities',
    subtopicIds:[
      'trig-basic-identities-reciprocal-identities',
      'trig-basic-identities-pythagorean-identities',
      'trig-basic-identities-verifying-identities-and-domain-restrictions',
      'trig-advanced-identities-double-angle-formulas',
    ],
  },
  {
    id:'top-spherical-trig',title:'Spherical Trigonometry (Napier Rules)',
    subtopicIds:['trig-advanced-spherical-trigonometry'],
  },
];

export const TRIGONOMETRY_CONNECTED_LESSONS = {...TRIGONOMETRY_PILOT_LESSONS,...TRIGONOMETRY_FOUNDATIONS_LESSONS,...TRIGONOMETRY_FOUNDATION_COMPLETION_LESSONS,...TRIGONOMETRY_FUNDAMENTAL_IDENTITIES_LESSONS,...TRIGONOMETRY_ADVANCED_IDENTITIES_LESSONS,...TRIGONOMETRY_INVERSE_FUNCTIONS_LESSONS,...TRIGONOMETRY_EQUATIONS_LESSONS,...TRIGONOMETRY_OBLIQUE_TRIANGLES_LESSONS,...TRIGONOMETRY_VECTORS_LESSONS,...TRIGONOMETRY_COMPLEX_POLAR_LESSONS,...TRIGONOMETRY_POLAR_PARAMETRIC_LESSONS,...TRIGONOMETRY_WAVES_PHASE_LESSONS,...TRIGONOMETRY_ADVANCED_ENRICHMENT_LESSONS};
export const TRIGONOMETRY_CONNECTED_IDS = Object.keys(TRIGONOMETRY_CONNECTED_LESSONS);
/** Only authored lessons with mapped question records are marked available. All 102 entries now have draft lessons; none is editorially certified. */
export const EXISTING_TRIGONOMETRY_BINDINGS: TrigIntegration['bindings'] = Object.fromEntries(
  TRIGONOMETRY_CONNECTED_IDS.map(id=>{
    const questionIds=PRACTICE_CATALOG.filter(q=>q.topicId===id).map(q=>q.key);
    return [id,{lessonId:id,lessonAvailable:true,lessonStatus:TRIGONOMETRY_CONNECTED_LESSONS[id].status,questionIds,practiceAvailable:questionIds.length>0}];
  })
);

export const TrigonometryScreen: React.FC = () => {
  const {setCurrentScreen,allTopics,openTopicDrawer,startReview,setIsLearnReaderActive} = useReview();
  const [activeLessonId,setActiveLessonId] = useState<string|null>(null);
  const [returnSubtopicId,setReturnSubtopicId] = useState<string|null>(null);
  useEffect(()=>()=>setIsLearnReaderActive(false),[setIsLearnReaderActive]);
  const original = useMemo(()=>ORIGINAL_TRIGONOMETRY_TOPICS.filter(link=>
    allTopics.some(topic=>topic.id===link.id && topic.subjectId==='subj-math-trig')),[allTopics]);
  const openOriginal = (id:string) => {
    const topic=allTopics.find(t=>t.id===id && t.subjectId==='subj-math-trig');
    if(topic)openTopicDrawer(topic);
  };
  const reviewOriginal = (id:string) => {
    const topic=allTopics.find(t=>t.id===id && t.subjectId==='subj-math-trig');
    if(topic)startReview(topic,'Practice Problems');
  };
  const openPractice=(id:string)=>{
    try{window.sessionStorage.setItem(PRACTICE_REQUESTED_TOPIC_KEY,id);}catch{/* Can still browse Practice. */}
    setActiveLessonId(null);
    setIsLearnReaderActive(false);
    setCurrentScreen('practice');
  };
  const integration:TrigIntegration = useMemo(()=>({
    bindings: EXISTING_TRIGONOMETRY_BINDINGS,
    readProgress:()=>readTrigManualProgress(TRIGONOMETRY_CONNECTED_IDS),
    saveProgress:(subtopicId,nextStatus)=>saveTrigManualProgress(subtopicId,nextStatus),
    navigate:(target)=>{
      if(target.kind==='learn' && TRIGONOMETRY_CONNECTED_LESSONS[target.lessonId]){
        setReturnSubtopicId(target.subtopicId);
        setActiveLessonId(target.lessonId);
        setIsLearnReaderActive(true);
      }else if(target.kind==='practice')openPractice(target.subtopicId);
      else if(target.kind==='mistakes')setCurrentScreen('errors');
      else if(target.kind==='progress')setCurrentScreen('progress');
    },
  }),[setCurrentScreen,setIsLearnReaderActive]);
  const openedLesson=activeLessonId?TRIGONOMETRY_CONNECTED_LESSONS[activeLessonId]:undefined;
  return <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]" id="trigonometry-app-screen">
    <TreeMenuHeader items={[
      {label:'Board Subjects',onClick:()=>setCurrentScreen('subjects')},
      {label:'Mathematics',onClick:()=>setCurrentScreen('mathematics')},
      {label:'Trigonometry',isActive:true}
    ]} backButton={{label:'Back to Mathematics',onClick:()=>setCurrentScreen('mathematics')}}/>
    <div className="flex-1 overflow-y-auto" id="trigonometry-scroll-region">
      <div className="max-w-[1480px] mx-auto p-2 sm:p-3">
        {openedLesson?<div className="space-y-3">
          <button type="button" onClick={()=>{setActiveLessonId(null);setIsLearnReaderActive(false)}} className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 bg-white border border-blue-200">← Back to Trigonometry topics</button>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3"><ManualLearnTracker trackingId={openedLesson.id} scopeLabel="Whole Trigonometry subtopic · manual study status" compact/></div>
          <LearnReaderLayout lesson={openedLesson} trackingId={openedLesson.id} trackingScopeLabel="Trigonometry subtopic" onPractice={()=>openPractice(openedLesson.id)} onClose={()=>{setActiveLessonId(null);setIsLearnReaderActive(false)}} />
        </div>:<TrigonometryModule integration={integration} initialSubtopicId={returnSubtopicId} existingTopics={original} onOpenExistingTopic={openOriginal} onReviewExistingTopic={reviewOriginal}
          renderExistingTracker={(id,title)=><div className="trig-original-manual"><ManualLearnTracker trackingId={chapterTrackingId(id)} scopeLabel={`${title} · existing broad-topic tracker`} compact/></div>}
          renderInlineLesson={(id,onCollapse)=>{const lesson=TRIGONOMETRY_CONNECTED_LESSONS[id];return lesson?<LearnReaderLayout key={id} lesson={lesson} trackingId={id} trackingScopeLabel="Trigonometry subtopic" onPractice={()=>openPractice(id)} onClose={onCollapse}/>:null;}}/>}

      </div>
    </div>
  </div>;
};
