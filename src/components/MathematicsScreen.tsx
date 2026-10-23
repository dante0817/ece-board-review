import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, ChevronRight, ClipboardList, GraduationCap, ListChecks, X } from 'lucide-react';
import { useReview } from '../context/ReviewContext';
import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import { TreeMenuHeader } from './TreeMenuHeader';
import { SubjectOutlineModal } from './SubjectOutlineModal';
import { AlgebraFormulaModal } from './AlgebraFormulaModal';
import { FlashcardsModal } from './FlashcardsModal';
import { MATH_CATALOG, getRecentMathSubject, type MathCatalogEntry } from '../features/mathematics/mathCatalog';

/** Presentation-only v10.57 Mathematics home. Existing question and learner stores are untouched. */
export const MathematicsScreen: React.FC = () => {
  const {setCurrentScreen,subjects,allTopics,allDueOrOverdueTopics,testRecords} = useReview();
  const [activeTab,setActiveTab]=useState<'learn'|'practice'|'exams'|'progress'>('learn');
  const [preview,setPreview]=useState<MathCatalogEntry|null>(null);
  const [outlineOpen,setOutlineOpen]=useState(false);
  const [formulaOpen,setFormulaOpen]=useState(false);
  const [flashcardsOpen,setFlashcardsOpen]=useState(false);
  const lastMathSubject=getRecentMathSubject();

  const mathIds=useMemo(()=>new Set(subjects.filter(s=>s.category==='Mathematics').map(s=>s.id)),[subjects]);
  const mathTopics=useMemo(()=>allTopics.filter(t=>mathIds.has(t.subjectId)),[allTopics,mathIds]);
  const mathDue=allDueOrOverdueTopics.filter(t=>mathIds.has(t.subjectId));
  const canonicalMastered=mathTopics.filter(t=>t.mastery===5).length;
  const recordedMathTests=testRecords.filter(t=>t.subjectId && mathIds.has(t.subjectId));

  const entryButton=(entry:MathCatalogEntry)=>{
    const available=entry.destination!==null;
    return <button
      key={entry.id}
      type="button"
      id={`math-subject-${entry.id}`}
      onClick={()=>available?setCurrentScreen(entry.destination!):setPreview(entry)}
      aria-label={`${entry.label}${available?' — open subject':' — view planned curriculum'}`}
      className="group flex w-full min-h-[62px] items-center gap-3 px-3 sm:px-4 py-3 text-left transition-colors hover:bg-blue-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600 border-b last:border-b-0 border-slate-100"
    >
      <span aria-hidden="true" className={`icon-3d icon-3d--small icon-3d--${entry.tone} app-artwork-tile shrink-0`}><AppArtwork name={entry.icon}/></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm sm:text-[15px] font-bold text-slate-800 group-hover:text-blue-800">{entry.label}</span>
        <span className="block text-xs text-slate-500 mt-0.5">{entry.summary}</span>
      </span>
      {!available && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">Planned</span>}
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-700" aria-hidden="true"/>
    </button>;
  };

  const navTabs=[
    {id:'learn',label:'Learn',icon:BookOpen},
    {id:'practice',label:'Practice',icon:ListChecks},
    {id:'exams',label:'Exams',icon:ClipboardList},
    {id:'progress',label:'Progress',icon:GraduationCap},
  ] as const;

  return <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]" id="mathematics-app-screen">
    <TreeMenuHeader
      items={[{label:'Board Subjects',onClick:()=>setCurrentScreen('subjects')},{label:'Mathematics',isActive:true}]}
      backButton={{label:'Back to Board Subjects',onClick:()=>setCurrentScreen('subjects')}}
    />
    <div className="flex-1 overflow-y-auto pb-12" id="mathematics-scroll-region">
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-5">
        <header className="flex items-center gap-3 sm:gap-4">
          <FeatureIcon name="mathematics" size="large" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Mathematics</h1>
            <p className="text-sm text-slate-600 mt-0.5">Choose a subject, continue studying, or practice at your own pace.</p>
          </div>
          <button type="button" onClick={()=>setOutlineOpen(true)} className="hidden sm:inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">Board scope</button>
        </header>

        <nav aria-label="Mathematics activities" className="grid grid-cols-4 rounded-xl border border-slate-200 bg-white p-1 gap-1">
          {navTabs.map(tab=>{
            const Icon=tab.icon;
            return <button key={tab.id} type="button" id={`math-tab-${tab.id}`} aria-current={activeTab===tab.id?'page':undefined}
              onClick={()=>setActiveTab(tab.id)}
              className={`flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-1 sm:px-3 py-2.5 text-[11px] sm:text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${activeTab===tab.id?'bg-blue-700 text-white shadow-sm':'text-slate-600 hover:bg-slate-100'}`}>
              <Icon className="h-4 w-4 hidden sm:block" aria-hidden="true"/>{tab.label}
            </button>;
          })}
        </nav>

        {activeTab==='learn' && <div className="space-y-5" id="mathematics-learn-panel">
          <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-[#eaf2ff] to-white p-4 sm:p-5" aria-label="Continue learning">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black text-blue-700 uppercase tracking-wide">{lastMathSubject?'Continue studying':'Start learning'}</p>
                <h2 className="mt-1 text-base font-bold text-slate-900">{lastMathSubject?.label??'Choose your first Mathematics subject'}</h2>
                <p className="text-xs text-slate-600 mt-1">{lastMathSubject?'Return to the subject you last opened. Lesson selection stays with the existing subject screen.':'Algebra and Trigonometry are good foundations.'}</p>
              </div>
              <button type="button" id="math-continue" onClick={()=>setCurrentScreen(lastMathSubject?.destination??'algebra')}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 text-sm font-bold focus-visible:outline-2 focus-visible:outline-blue-600">
                {lastMathSubject?'Continue subject':'Start Algebra'} <ArrowRight className="h-4 w-4"/>
              </button>
            </div>
          </section>
          {MATH_CATALOG.map(group=><section key={group.id} aria-labelledby={`math-group-${group.id}`} className="space-y-2">
            <div className="px-1">
              <h2 id={`math-group-${group.id}`} className="text-sm sm:text-base font-extrabold text-slate-900">{group.label}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{group.subtitle}</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">{group.entries.map(entryButton)}</div>
          </section>)}
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={()=>setFormulaOpen(true)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Formula reference</button>
            <button type="button" onClick={()=>setFlashcardsOpen(true)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Flashcards</button>
            <button type="button" onClick={()=>setOutlineOpen(true)} className="sm:hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Board scope</button>
          </div>
        </div>}

        {activeTab==='practice' && <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-3" id="mathematics-practice-panel">
          <FeatureIcon name="practice"/>
          <h2 className="text-lg font-bold text-slate-900">Practice questions</h2>
          <p className="text-sm text-slate-600">Use the app's existing question library, quizzes and worked solutions. You can select Mathematics topics in Practice; the library also includes other board subjects.</p>
          <button type="button" onClick={()=>setCurrentScreen('practice')} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800">Open Practice <ArrowRight className="h-4 w-4"/></button>
        </section>}

        {activeTab==='exams' && <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-3" id="mathematics-exams-panel">
          <FeatureIcon name="exams"/>
          <h2 className="text-lg font-bold text-slate-900">Mock exams</h2>
          <p className="text-sm text-slate-600">Open the existing exam center for timed practice and saved test records. A fully verified 100-item Mathematics TOS simulator is planned for a later release.</p>
          <button type="button" onClick={()=>setCurrentScreen('tests')} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800">Open Exam Center <ArrowRight className="h-4 w-4"/></button>
        </section>}

        {activeTab==='progress' && <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-3" id="mathematics-progress-panel">
          <h2 className="text-lg font-bold text-slate-900">Mathematics progress</h2>
          <p className="text-sm text-slate-600">These figures describe the existing canonical Mathematics topic model, not completion of the newer Geometry or Trigonometry draft lessons.</p>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs text-slate-600">Canonical topics</dt><dd className="text-xl font-extrabold text-slate-900 mt-1">{mathTopics.length}</dd></div>
            <div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs text-slate-600">Canonical mastery (level 5)</dt><dd className="text-xl font-extrabold text-slate-900 mt-1">{canonicalMastered} / {mathTopics.length}</dd></div>
            <div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs text-slate-600">Due for review</dt><dd className="text-xl font-extrabold text-slate-900 mt-1">{mathDue.length}</dd></div>
          </dl>
          <p className="text-xs text-slate-500">{recordedMathTests.length} recorded Mathematics subject test{recordedMathTests.length===1?'':'s'} in the current app records. This is not an official board-readiness score.</p>
        </section>}
      </div>
    </div>

    {preview && <div role="dialog" aria-modal="true" aria-labelledby="math-preview-title" className="fixed inset-0 z-[80] bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center p-4" onMouseDown={event=>{if(event.target===event.currentTarget)setPreview(null)}} onKeyDown={event=>{if(event.key==='Escape')setPreview(null)}}>
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-6 shadow-xl" tabIndex={-1}>
        <div className="flex justify-between items-start gap-3"><div><p className="text-xs font-bold uppercase text-amber-700">Planned curriculum · lessons not yet available</p><h2 id="math-preview-title" className="mt-1 text-lg font-extrabold text-slate-900">{preview.label}</h2></div>
          <button type="button" autoFocus aria-label="Close curriculum preview" onClick={()=>setPreview(null)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-4 w-4"/></button>
        </div>
        <p className="text-sm text-slate-600 mt-3">{preview.summary}. The outline below is a development preview, not a published lesson bank.</p>
        <ul className="mt-4 list-disc pl-5 space-y-2 text-sm text-slate-700">{preview.overview.map(item=><li key={item}>{item}</li>)}</ul>
        <button type="button" onClick={()=>setPreview(null)} className="mt-5 w-full rounded-xl bg-blue-700 py-2.5 font-bold text-white hover:bg-blue-800">Back to Mathematics</button>
      </div>
    </div>}
    <SubjectOutlineModal isOpen={outlineOpen} onClose={()=>setOutlineOpen(false)}/>
    <AlgebraFormulaModal isOpen={formulaOpen} onClose={()=>setFormulaOpen(false)}/>
    <FlashcardsModal isOpen={flashcardsOpen} onClose={()=>setFlashcardsOpen(false)} selectedTopics={mathTopics} subjectName="Engineering Mathematics" title="Mathematics Review Flashcards" material={'ECE Mathematics foundational topics, calculus, differential equations, statistics and engineering applications.'}/>
  </div>;
};
