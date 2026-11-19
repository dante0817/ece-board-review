import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Atom, BookOpen, ChevronDown, ChevronRight, ClipboardList, ExternalLink } from 'lucide-react';
import { TreeMenuHeader } from '../../components/TreeMenuHeader';
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
 * Batch 1 syllabus/navigation screen.
 * No score or progress is inferred from outlines; full lessons and assessment
 * integration will arrive in the subsequent content batches.
 */
export const PhysicsScreen: React.FC<PhysicsScreenProps> = ({ courseId }) => {
  const { setCurrentScreen } = useReview();
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
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
                    Official topic groups and planned learning objectives for the BSECE Board Reviewer.
                    The syllabus is mapped; full lessons, solutions and scored questions are being developed.
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
                <p className="text-xs text-slate-500">Planned lesson objectives</p>
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

          <section aria-labelledby="physics-syllabus-heading" className="space-y-3">
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
                        <p className="text-xs text-slate-600 mt-1">{group.officialItems} PRC items · {objectives.length} planned objectives</p>
                        <p className="text-xs text-slate-500 mt-1">{allocation.join(' · ')}</p>
                      </div>
                    </div>
                    {expanded ? <ChevronDown className="shrink-0 text-blue-600" size={18} /> : <ChevronRight className="shrink-0 text-slate-500" size={18} />}
                  </button>
                  {expanded && (
                    <div id={`physics-topic-${group.id}`} className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50">
                      <p className="flex items-center gap-2 text-xs font-semibold text-amber-800 mb-3">
                        <ClipboardList size={15} aria-hidden="true" />
                        Lesson outlines only — no completed lessons or verified scored questions yet.
                      </p>
                      <ol className="space-y-2">
                        {objectives.map((lesson, lessonIndex) => (
                          <li key={lesson.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                            <span className="text-xs font-bold text-blue-700 mt-0.5 shrink-0">{index + 1}.{lessonIndex + 1}</span>
                            <span className="text-sm font-medium text-slate-800">{lesson.title}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
          <p className="text-xs text-slate-500 pb-2">
            Curriculum mapping is an editorial aid, not PRC approval. Learning objectives are planned content and are
            not included in completed-lesson counts or scored examination banks.
          </p>
        </div>
      </div>
    </div>
  );
};
