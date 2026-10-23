import React, { useState } from 'react';
import { Box, BookOpen, ChartScatter, ChevronDown, ChevronRight, Shapes, Square, ArrowRight } from 'lucide-react';
import { useReview } from '../../context/ReviewContext';
import { TreeMenuHeader } from '../../components/TreeMenuHeader';
import { AppArtwork } from '../../components/common/AppArtwork';
import { SOLID_LESSONS, SOLID_FORMULAS, SOLID_PRACTICE } from '../solid-mensuration/solidMensurationContent';
import { PLANE_LESSONS, PLANE_FORMULAS, PLANE_PRACTICE } from '../plane-geometry/planeGeometryContent';
import { ANALYTIC_LESSONS, ANALYTIC_FORMULAS, ANALYTIC_PRACTICE } from '../analytic-geometry/analyticGeometryContent';
import { GEOMETRY_MODULES, type GeometrySubjectId } from './geometryCatalog';

/** A navigation-only hub: does not create or modify lesson-tracking or exam records. */
export const GeometryScreen: React.FC = () => {
  const { setCurrentScreen } = useReview();
  const [expandedPlan, setExpandedPlan] = useState<GeometrySubjectId | null>(null);
  const icons = { plane: Square, solid: Box, analytic: ChartScatter };
  const tones = {
    plane: 'border-sky-200 bg-sky-50 text-sky-800',
    solid: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    analytic: 'border-violet-200 bg-violet-50 text-violet-800',
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]" id="geometry-app-screen">
      <TreeMenuHeader
        items={[
          {label:'Board Subjects', onClick:()=>setCurrentScreen('subjects')},
          {label:'Mathematics', onClick:()=>setCurrentScreen('mathematics')},
          {label:'Geometry', isActive:true},
        ]}
        backButton={{label:'Back to Mathematics', onClick:()=>setCurrentScreen('mathematics')}}
      />
      <div className="flex-1 overflow-y-auto pb-12" id="geometry-scroll-region">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:p-7 space-y-5">
          <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-[#eef5ff] via-white to-[#f1f6ff] p-5 sm:p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="icon-3d icon-3d--violet app-artwork-tile shrink-0" aria-hidden="true"><AppArtwork name="triangle" /></div>
              <div>
                <p className="text-xs font-bold tracking-wider uppercase text-indigo-700">Foundation Mathematics</p>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">Geometry</h1>
                <p className="mt-2 text-sm text-slate-600 max-w-3xl">Study two-dimensional figures, three-dimensional solids and coordinate methods. Available lessons are developmental learning material, not a certification of ECE board readiness.</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="geometry-modules-heading" className="space-y-3">
            <h2 id="geometry-modules-heading" className="text-lg font-black text-slate-900">Learning modules</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {GEOMETRY_MODULES.map(module=>{
                const Icon=icons[module.id];
                const available=module.availability==='available-draft';
                const isExpanded=expandedPlan===module.id;
                return <article key={module.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 flex flex-col min-w-0">
                  <div className="flex items-start gap-3">
                    <div className={`flex shrink-0 items-center justify-center rounded-xl w-12 h-12 border ${tones[module.id]}`} aria-hidden="true"><Icon size={26}/></div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-900 text-base">{module.name}</h3>
                      <span className={`inline-flex mt-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${available?'bg-emerald-50 text-emerald-800':'bg-slate-100 text-slate-700'}`}>
                        {available?'Available · editorial draft':'Planned · no lessons yet'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 mb-4 text-sm text-slate-600 flex-1">{module.summary}</p>
                  <p className="text-xs text-slate-500 mb-3">
                    {available ? (module.id==='plane' ? `${PLANE_LESSONS.length} lessons · ${PLANE_FORMULAS.length} formula notes · ${PLANE_PRACTICE.length} practice questions` : module.id==='analytic' ? `${ANALYTIC_LESSONS.length} lessons · ${ANALYTIC_FORMULAS.length} formula notes · ${ANALYTIC_PRACTICE.length} practice questions` : `${SOLID_LESSONS.length} lessons · ${SOLID_FORMULAS.length} formulas · ${SOLID_PRACTICE.length} practice questions`) : `${module.plannedTopics} planned subtopics`}
                  </p>
                  {available && module.id==='solid' ? <button id="btn-geometry-solid-mensuration" type="button" onClick={()=>setCurrentScreen('solid-mensuration')} className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    <BookOpen size={17}/> Continue Solid Mensuration <ArrowRight size={16}/>
                  </button> : available && module.id==='plane' ? <button id="btn-geometry-plane-geometry" type="button" onClick={()=>setCurrentScreen('plane-geometry')} className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-sky-700 text-white hover:bg-sky-800 px-4 py-2.5 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"><BookOpen size={17}/> Open Plane Geometry <ArrowRight size={16}/></button> : available && module.id==='analytic' ? <button id="btn-geometry-analytic-geometry" type="button" onClick={()=>setCurrentScreen('analytic-geometry')} className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-violet-700 text-white hover:bg-violet-800 px-4 py-2.5 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"><BookOpen size={17}/> Open Analytic Geometry <ArrowRight size={16}/></button> : <button
                    id={`btn-geometry-${module.id}-curriculum`}
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`geometry-${module.id}-outline`}
                    onClick={()=>setExpandedPlan(isExpanded?null:module.id)}
                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2.5 text-sm font-bold text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >View planned curriculum <ChevronDown size={16} className={isExpanded?'rotate-180':''}/></button>}
                  {!available && <div id={`geometry-${module.id}-outline`} hidden={!isExpanded} className="mt-3 border-t border-slate-100 pt-3">
                    <p className="text-xs font-semibold text-slate-700">Curriculum preview — not yet interactive lessons</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-slate-600">{module.curriculumUnits.map(unit=><li key={unit}>{unit}</li>)}</ul>
                  </div>}
                </article>;
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="geometry-supplementary-heading">
            <div className="flex gap-3 items-start"><Shapes className="text-indigo-600 shrink-0" size={24}/><div>
              <h2 id="geometry-supplementary-heading" className="font-bold text-slate-900">Spherical & advanced geometry</h2>
              <p className="text-sm text-slate-600 mt-1">Six spherical and nine advanced enrichment outcomes remain in the master curriculum. Spherical solids are addressed within Solid Mensuration; spherical triangle methods have related lessons in Trigonometry. They are not standalone completed modules.</p>
              <button type="button" onClick={()=>setCurrentScreen('trigonometry')} className="mt-3 inline-flex items-center gap-2 text-indigo-700 text-sm font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Explore related Trigonometry <ChevronRight size={16}/></button>
            </div></div>
          </section>
        </div>
      </div>
    </div>
  );
};
