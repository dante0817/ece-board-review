import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Atom, BookOpen, ChevronDown, ChevronRight, ClipboardList, ExternalLink } from 'lucide-react';
import { TreeMenuHeader } from '../../components/TreeMenuHeader';
import { LearnReaderLayout } from '../../components/learn-reader/LearnReaderLayout';
import { PHYSICS_ENGINEER_LESSONS, physicsTrackingId } from './physicsEngineersContent';
import { PHYSICS_ENGINEER_QUESTIONS } from './physicsEngineersQuestions';
import { PhysicsEngineersPracticePanel } from './PhysicsEngineersPracticePanel';
import { useReview } from '../../context/ReviewContext';
import {
  getPhysicsGroups,
  getPhysicsLessonOutlines,
  PHYSICS_COURSES,
  PHYSICS_TOS_SOURCE,
  type PhysicsCourseId,
  type PhysicsCognitiveLevel,
} from './physicsCatalog';

const COGNITIVE_LABELS: Readonly<Record<PhysicsCognitiveLevel, string>> = {
  knowledge: 'Knowledge',
  comprehension: 'Comprehension',
  application: 'Application',
  analysis: 'Analysis',
  synthesis: 'Synthesis',
};

interface PhysicsScreenProps {
  courseId: PhysicsCourseId;
}

/**
 * PRC syllabus plus draft Physics for Engineers learning/practice reader.
 * Self-reported study and educational practice never imply board-exam mastery.
 * Physics 2 remains an outline until its separate content batch.
 */
export const PhysicsScreen: React.FC<PhysicsScreenProps> = ({ courseId }) => {
  const { setCurrentScreen, setIsLearnReaderActive } = useReview();
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [openedLessonId, setOpenedLessonId] = useState<string | null>(null);
  const [view, setView] = useState<'syllabus' | 'practice'>('syllabus');
  const [practiceLessonId, setPracticeLessonId] = useState<string | null>(null);
  useEffect(() => () => setIsLearnReaderActive(false), [setIsLearnReaderActive]);
  useEffect(() => {setOpenedLessonId(null);setPracticeLessonId(null);setView('syllabus');}, [courseId]);
  const openLesson=(id:string)=>{
    if(courseId!=='geas-physics'||!PHYSICS_ENGINEER_LESSONS[id])return;
    setOpenedLessonId(id);
    setIsLearnReaderActive(true);
  };
  const closeLesson=()=>{setOpenedLessonId(null);setIsLearnReaderActive(false);};
  const openPractice=(id:string|null)=>{
    closeLesson();
    setPracticeLessonId(id);
    setView('practice');
  };
  const activeLesson=openedLessonId?PHYSICS_ENGINEER_LESSONS[openedLessonId]:null;
  const course = PHYSICS_COURSES.find(candidate => candidate.id === courseId);
  const groups = getPhysicsGroups(courseId);

  if (!course) {
    return (
      <div className="p-6 text-red-800" role="alert">
        Physics course configuration is unavailable.
        <button type="button" className="ml-3 underline" onClick={() => setCurrentScreen('geas')}>Back to GEAS</button>
      </div>
    );
  }

  const objectiveCount = groups.reduce((count, group) => count + group.objectives.length, 0);
  if (activeLesson) {
    return <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]" id="physics-engineers-reader-screen">
      <TreeMenuHeader items={[
        {label:'Board Subjects',onClick:()=>setCurrentScreen('subjects')},
        {label:'GEAS',onClick:()=>setCurrentScreen('geas')},
        {label:'Physics for Engineers',onClick:closeLesson},
        {label:activeLesson.title,isActive:true}
      ]} backButton={{label:'Back to Physics for Engineers',onClick:closeLesson}}/>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-5">
        <div className="max-w-6xl mx-auto space-y-4">
          <p className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-900">
            Original developmental lesson · no independent expert certification · self-reported reading is not exam mastery.
          </p>
          <LearnReaderLayout key={activeLesson.id} lesson={activeLesson}
            trackingId={physicsTrackingId(activeLesson.id)}
            trackingScopeLabel={`Physics for Engineers · ${activeLesson.title}`}
            onPractice={()=>openPractice(activeLesson.id)} onClose={closeLesson}/>
        </div>
      </div>
    </div>;
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
      <TreeMenuHeader
        items={[
          { label: 'Board Subjects', onClick: () => setCurrentScreen('subjects') },
          { label: 'GEAS', onClick: () => setCurrentScreen('geas') },
          { label: course.name, isActive: true },
        ]}
        backButton={{ label: 'Back to GEAS', onClick: () => setCurrentScreen('geas') }}
      />
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-3 items-start">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
                  <Atom size={26} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">General Engineering &amp; Applied Sciences</p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{course.name}</h1>
                  <p className="mt-2 text-sm text-slate-600 max-w-2xl">
                    {courseId==='geas-physics'
                      ? 'Explore 18 original draft lessons, guided worked examples and 75 ungraded practice questions. These remain subject to independent review; no scored Physics exam items are approved.'
                      : 'Official topic groups and planned learning objectives. Lessons, solutions and scored practice will be developed in the Physics 2 batch.'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setCurrentScreen('geas')}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:underline">
                <ArrowLeft size={16} /> GEAS overview
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-500">Official exam items</p>
                <p className="text-2xl font-extrabold text-slate-900">{course.officialItems}<span className="text-sm font-medium text-slate-500"> / 100 GEAS</span></p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-500">Official topic groups</p>
                <p className="text-2xl font-extrabold text-slate-900">{groups.length}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-xs text-slate-500">{courseId==='geas-physics'?'Authored draft lessons':'Planned lesson objectives'}</p>
                <p className="text-2xl font-extrabold text-slate-900">{objectiveCount}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Physics courses">
              {PHYSICS_COURSES.map(other => (
                <button
                  key={other.id}
                  type="button"
                  aria-pressed={other.id === courseId}
                  onClick={() => setCurrentScreen(other.screen)}
                  className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${other.id === courseId
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'}`}
                >
                  {other.name}{other.id !== courseId && <ArrowRight size={14} className="inline ml-1.5" />}
                </button>
              ))}
            </div>
          </div>

          {courseId==='geas-physics'&&<nav className="flex flex-wrap gap-2" aria-label="Physics for Engineers activities">
            <button type="button" onClick={()=>{setView('syllabus');setPracticeLessonId(null)}} aria-current={view==='syllabus'?'page':undefined}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${view==='syllabus'?'bg-blue-700 text-white':'bg-white text-blue-700 border border-blue-200'}`}>Lessons</button>
            <button type="button" onClick={()=>openPractice(null)} aria-current={view==='practice'?'page':undefined}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${view==='practice'?'bg-blue-700 text-white':'bg-white text-blue-700 border border-blue-200'}`}>
              Ungraded practice ({PHYSICS_ENGINEER_QUESTIONS.length})
            </button>
          </nav>}
          {(courseId!=='geas-physics'||view==='syllabus')&&<section aria-labelledby="physics-syllabus-heading" className="space-y-3">
            <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
              <div>
                <h2 id="physics-syllabus-heading" className="text-xl font-extrabold text-slate-900">PRC-aligned syllabus</h2>
                <p className="text-sm text-slate-600 mt-1">Select a group to view its planned learning objectives and examination cognitive allocation.</p>
              </div>
              <a href={PHYSICS_TOS_SOURCE} target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-700 hover:underline inline-flex items-center gap-1">
                Official PRC TOS <ExternalLink size={14} />
              </a>
            </div>

            {groups.map((group, index) => {
              const expanded = expandedGroupId === group.id;
              const objectives = getPhysicsLessonOutlines(group.id);
              const allocation = Object.entries(group.cognitive)
                .filter(([, number]) => number > 0)
                .map(([level, number]) => `${COGNITIVE_LABELS[level as PhysicsCognitiveLevel]} ${number}`);
              return (
                <article key={group.id} className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`physics-topic-${group.id}`}
                    onClick={() => setExpandedGroupId(expanded ? null : group.id)}
                    className="w-full px-4 sm:px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-blue-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <BookOpen size={18} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Topic group {index + 1}</p>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{group.name}</h3>
                        <p className="text-xs text-slate-600 mt-1">{group.officialItems} PRC items · {objectives.length} {courseId==='geas-physics'?'draft lessons':'planned objectives'}</p>
                        <p className="text-xs text-slate-500 mt-1">{allocation.join(' · ')}</p>
                      </div>
                    </div>
                    {expanded ? <ChevronDown className="shrink-0 text-blue-600" size={18} /> : <ChevronRight className="shrink-0 text-slate-500" size={18} />}
                  </button>
                  {expanded && (
                    <div id={`physics-topic-${group.id}`} className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50">
                      <p className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-3">
                        <ClipboardList size={15} aria-hidden="true" />
                        {courseId==='geas-physics'?'Original draft lessons and formative practice are available; no independently approved scored questions.':'Lesson outlines only — no completed lessons or verified scored questions yet.'}
                      </p>
                      <ol className="space-y-2">
                        {objectives.map((lesson, lessonIndex) => (
                          <li key={lesson.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                            <span className="text-xs font-bold text-blue-700 mt-0.5 shrink-0">{index + 1}.{lessonIndex + 1}</span>
                            <span className="text-sm font-medium text-slate-800 flex-1 min-w-0">{lesson.title}</span>
                            {courseId==='geas-physics'&&PHYSICS_ENGINEER_LESSONS[lesson.id]&&
                              <button type="button" onClick={()=>openLesson(lesson.id)}
                                className="shrink-0 text-xs font-bold text-blue-700 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 hover:bg-blue-100">Read lesson</button>}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </article>
              );
            })}
          </section>}
          {courseId==='geas-physics'&&view==='practice'&&
            <PhysicsEngineersPracticePanel key={practiceLessonId??'all'} initialLessonId={practiceLessonId}
              onBack={()=>{setView('syllabus');setPracticeLessonId(null)}}
              onLearnLesson={openLesson}/>}
          <p className="text-xs text-slate-500 pb-2">
            Curriculum mapping is an editorial aid, not PRC approval.
            {courseId==='geas-physics'
              ? ' The 18 authored lessons and 75 original questions are developmental, not independently approved. Reader progress and answer reveals never count as exam mastery.'
              : ' Physics 2 remains a planned course outline, excluded from completed lessons and scored examination banks.'}
          </p>
        </div>
      </div>
    </div>
  );
};
