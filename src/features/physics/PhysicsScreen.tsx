import React, { useMemo, useState } from 'react';
import { Atom, BookOpen, ChevronDown, ChevronRight, ClipboardList, FileText, ShieldAlert } from 'lucide-react';
import { TreeMenuHeader } from '../../components/TreeMenuHeader';
import { useReview } from '../../context/ReviewContext';
import {
  PHYSICS_COURSES, PHYSICS_REFERENCES, PHYSICS_TOS_GROUPS, PHYSICS_TOS_SOURCE, PHYSICS_NAV_COURSE_KEY,
  physicsCourseGroups, physicsLessonsForGroup, physicsCourseCognitiveTotal, physicsCourseItemTotal,
  type PhysicsCourseId, type PhysicsCognitiveLevel,
} from './physicsCurriculum';

type PhysicsTab = 'curriculum' | 'blueprint' | 'references';
const levels: readonly {id:PhysicsCognitiveLevel; label:string}[] = [
  {id:'knowledge',label:'Knowledge'},
  {id:'comprehension',label:'Comprehension'},
  {id:'application',label:'Application'},
  {id:'analysis',label:'Analysis'},
  {id:'synthesis',label:'Synthesis'},
];

export const PhysicsScreen: React.FC = () => {
  const {setCurrentScreen} = useReview();
  const [selectedCourse,setSelectedCourse] = useState<PhysicsCourseId>(()=>{
    if (typeof window==='undefined')return 'geas-physics';
    try {
      const requested=window.sessionStorage.getItem(PHYSICS_NAV_COURSE_KEY);
      window.sessionStorage.removeItem(PHYSICS_NAV_COURSE_KEY);
      return requested==='geas-physics2'?'geas-physics2':'geas-physics';
    } catch {
      return 'geas-physics';
    }
  });
  const [tab,setTab] = useState<PhysicsTab>('curriculum');
  const [expandedGroup,setExpandedGroup] = useState(()=>selectedCourse==='geas-physics2'?'p2-01':'pfe-01');
  const course = PHYSICS_COURSES.find(item=>item.id===selectedCourse)!;
  const groups = useMemo(()=>physicsCourseGroups(selectedCourse),[selectedCourse]);
  const chooseCourse = (id:PhysicsCourseId) => {
    setSelectedCourse(id);
    setExpandedGroup(id==='geas-physics'?'pfe-01':'p2-01');
    setTab('curriculum');
  };
  return <div id="physics-module-screen" className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
    <TreeMenuHeader
      items={[{label:'GEAS',onClick:()=>setCurrentScreen('geas')},{label:'Physics',isActive:true}]}
      backButton={{label:'Back to GEAS',onClick:()=>setCurrentScreen('geas')}}
    />
    <div className="flex-1 overflow-y-auto pb-16">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center"><Atom size={24}/></div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">General Engineering & Applied Sciences</p>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">Physics</h1>
              <p className="text-sm text-slate-600">Physics for Engineers · Physics 2 · 25 GEAS items across both courses</p>
            </div>
          </div>
          <div role="status" className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <ShieldAlert className="mt-0.5 shrink-0" size={18}/>
            <span><strong>Curriculum scaffold only.</strong> This Batch 1 screen lists planned learning objectives and the editorial PRC 2022 allocation. It does not contain completed Physics lessons, independently verified questions, or an eligible scored Physics examination. These follow in later batches.</span>
          </div>
        </header>

        <section aria-label="Physics course selection" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PHYSICS_COURSES.map(item=><button
            id={item.id==='geas-physics'?'physics-course-engineers':'physics-course-2'}
            type="button" key={item.id} onClick={()=>chooseCourse(item.id)}
            aria-pressed={selectedCourse===item.id}
            className={`rounded-xl p-4 text-left border-2 shadow-sm transition-colors ${selectedCourse===item.id?'bg-indigo-50 border-indigo-600':'bg-white border-slate-200 hover:border-indigo-300'}`}
          >
            <span className="flex justify-between gap-2 items-center">
              <strong className="text-base text-slate-900">{item.title}</strong>
              <span className="shrink-0 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full px-2.5 py-1">{item.officialItems} items</span>
            </span>
            <span className="block text-xs mt-2 leading-relaxed text-slate-600">{item.description}</span>
            <span className="block mt-3 text-xs font-bold text-indigo-700">{selectedCourse===item.id?'Selected course':'Explore course →'}</span>
          </button>)}
        </section>

        <nav aria-label="Physics activities" className="flex flex-wrap gap-2">
          {([
            {id:'curriculum',label:'Curriculum',icon:BookOpen},
            {id:'blueprint',label:'PRC TOS blueprint',icon:ClipboardList},
            {id:'references',label:'References',icon:FileText},
          ] as const).map(item=><button key={item.id} id={`physics-tab-${item.id}`} type="button"
            aria-current={tab===item.id?'page':undefined}
            onClick={()=>setTab(item.id)}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold flex gap-2 items-center ${tab===item.id?'bg-indigo-700 text-white':'bg-white text-slate-700 border border-slate-200 hover:bg-indigo-50'}`}
          ><item.icon size={16}/>{item.label}</button>)}
        </nav>

        {tab==='curriculum' && <section id="physics-curriculum-panel" className="space-y-3">
          <div className="rounded-xl bg-white border border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900">{course.title}</h2>
            <p className="text-sm text-slate-600 mt-1">Four official TOS topic groups · {physicsCourseItemTotal(selectedCourse)} questions allocated in a 100-item GEAS examination. Detailed lessons and assessments are scheduled for Batches 2–4.</p>
            <p className="text-xs mt-2 text-amber-800">Learning topics below are planned outlines, not an indicator of completed or approved study material.</p>
          </div>
          {groups.map(group=>{
            const isExpanded=expandedGroup===group.id;
            const lessons=physicsLessonsForGroup(group);
            return <div key={group.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <button type="button" id={`physics-group-${group.id}`} aria-expanded={isExpanded}
                onClick={()=>setExpandedGroup(isExpanded?'':group.id)}
                className="w-full px-4 py-4 text-left flex items-center gap-3 justify-between hover:bg-indigo-50"
              >
                <span className="min-w-0">
                  <strong className="block text-sm sm:text-base text-slate-900">{group.title}</strong>
                  <span className="block text-xs mt-1 text-slate-600">{group.officialItems} official items · {lessons.length} proposed learning units</span>
                </span>
                <span className="flex gap-2 items-center shrink-0">
                  <span className="text-[11px] font-bold rounded-full bg-amber-50 border border-amber-200 px-2 py-1 text-amber-900">Planned</span>
                  {isExpanded?<ChevronDown size={18}/>:<ChevronRight size={18}/>}
                </span>
              </button>
              {isExpanded&&<div className="border-t border-slate-100 px-4 py-3 space-y-3">
                <p className="text-xs text-slate-600">{group.note}</p>
                <div className="divide-y divide-slate-100">
                  {lessons.map(lesson=><div key={lesson.id} className="py-3 flex items-start gap-3">
                    <BookOpen className="shrink-0 mt-0.5 text-slate-400" size={16}/>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{lesson.title}</p>
                      <p className="text-xs mt-1 text-slate-600">{lesson.objective}</p>
                      <p className="text-[11px] font-semibold mt-1 text-amber-800">Lesson content not yet authored</p>
                    </div>
                  </div>)}
                </div>
              </div>}
            </div>;
          })}
        </section>}

        {tab==='blueprint' && <section id="physics-blueprint-panel" className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">PRC TOS · {course.title}</h2>
            <p className="text-xs text-slate-600 my-2">Editorial transcription of the course/topic cognitive allocation. These are examination allocations, not currently available question counts.</p>
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full text-xs sm:text-sm">
                <thead><tr className="border-b border-slate-200 text-left text-slate-700">
                  <th className="py-3 pr-4">Topic group</th>
                  {levels.map(l=><th key={l.id} className="px-2 py-3 text-center">{l.label}</th>)}
                  <th className="px-2 py-3 text-center">Items</th>
                </tr></thead>
                <tbody>{groups.map(g=><tr key={g.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 font-medium text-slate-900">{g.title}</td>
                  {levels.map(l=><td key={l.id} className="px-2 text-center text-slate-700">{g.cognitive[l.id]||'—'}</td>)}
                  <td className="px-2 text-center font-bold text-indigo-800">{g.officialItems}</td>
                </tr>)}
                  <tr className="bg-slate-50 font-bold text-slate-900"><td className="py-3 pr-4">Total</td>
                    {levels.map(l=><td key={l.id} className="text-center px-2">{physicsCourseCognitiveTotal(selectedCourse,l.id)||'—'}</td>)}
                    <td className="text-center px-2">{physicsCourseItemTotal(selectedCourse)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-4 text-amber-800">The verified scored-question pool currently has no Physics Batch 1 additions. Future items must pass the existing question-integrity policy before admission to examinations.</p>
          </div>
        </section>}

        {tab==='references' && <section id="physics-references-panel" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Core Physics development references</h2>
          <p className="text-sm text-slate-600">The texts inform curriculum preparation and independently authored examples. No textbook PDF or instructor solutions manual is bundled here.</p>
          {PHYSICS_REFERENCES.map(ref=><div key={ref.id} className="border border-slate-200 rounded-lg px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{ref.label}</p>
            <p className="text-xs mt-1 text-slate-600">{ref.role}</p>
          </div>)}
          <p className="text-xs text-slate-600">Source for course allocations: <a href={PHYSICS_TOS_SOURCE.url} target="_blank" rel="noopener noreferrer" className="text-indigo-700 underline">{PHYSICS_TOS_SOURCE.title}</a>. {PHYSICS_TOS_SOURCE.status}.</p>
        </section>}

        <footer className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          Batch 1: Curriculum and navigation framework. No artificial progress, scores, verified-question claims or pseudo-lessons are generated.
          Official allocation across both courses: {PHYSICS_TOS_GROUPS.reduce((total,g)=>total+g.officialItems,0)} of 100 GEAS items.
        </footer>
      </div>
    </div>
  </div>;
};
