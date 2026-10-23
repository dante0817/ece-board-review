import React,{useState} from 'react';
import {Calculator,BookOpen,AlertTriangle,ExternalLink,CheckCircle2,ClipboardCheck,RotateCcw} from 'lucide-react';
import {useReview} from '../context/ReviewContext';
import {useCalculator} from './calculator/CalculatorProvider';
import {strictAssessmentLocked} from '../domain/assessment/assessmentAccess';
import {CANON_MANUAL_URL,PRC_CALCULATORS_URL,CALCULATOR_MODEL,CANON_PILOT_TECHNIQUES} from '../domain/calculator/canonTechniques';
import {CANON_FAMILY_TECHNIQUES,resolveFamilyTechnique} from '../domain/calculator/familyTechniques';
import {summarizeCalculatorCoverage} from '../domain/calculator/coverage';
import {MOCK_EXAM_QUESTIONS} from '../data/mockExamQuestions';
import {CalculatorTechniqueCard} from './CalculatorTechniqueCard';
import {CalculatorSpeedDrills} from './CalculatorSpeedDrills';
import {CalculatorNumericDrills} from './CalculatorNumericDrills';
import {CanonDeviceQaScreen} from './CanonDeviceQaScreen';
import {CANON_SKILLS_CURRICULUM,CANON_SKILL_BY_ID,gradeCalculatorSkill,type CalculatorSkillLevel} from '../domain/calculator/skillsCurriculum';
import {CALCULATOR_SKILLS_PROGRESS_KEY,readCalculatorSkillsProgress,recordCalculatorSkillAttempt,type CalculatorSkillsProgress} from '../domain/calculator/skillsProgress';
const levels:readonly CalculatorSkillLevel[]=['Foundations','Solving','Engineering','Verification'];
const loadLocalSkillProgress=():CalculatorSkillsProgress=>{
 try{return typeof window==='undefined'?{version:1,lessons:{}}:readCalculatorSkillsProgress(window.localStorage)}catch{return {version:1,lessons:{}}}
};
const coverageSnapshot=summarizeCalculatorCoverage(MOCK_EXAM_QUESTIONS);
const familyExamples=MOCK_EXAM_QUESTIONS.filter(q=>resolveFamilyTechnique(q).kind==='available').filter((q,index,list)=>list.findIndex(other=>other.questionFamilyId===q.questionFamilyId)===index);

export function CalculatorSkillsScreen(){
 const {setCurrentScreen,userProfile,assessmentSession,errors}=useReview();
 const {setOpen:setCalculatorOpen}=useCalculator();
 const [lessonId,setLessonId]=useState(CANON_SKILLS_CURRICULUM[0].id);
 const [exampleId,setExampleId]=useState(CANON_PILOT_TECHNIQUES[0]?.questionId??'');
 const [section,setSection]=useState<'lessons'|'examples'|'drills'|'numeric'|'device-qa'>('lessons');
 const [answers,setAnswers]=useState<Record<string,number>>({});
 const [submitted,setSubmitted]=useState(false);
 const [progress,setProgress]=useState<CalculatorSkillsProgress>(loadLocalSkillProgress);
 const [saveWarning,setSaveWarning]=useState('');
 const lesson=CANON_SKILL_BY_ID.get(lessonId)!;
 const answered=lesson.checks.every(check=>answers[check.id]!==undefined);
 const result=submitted?gradeCalculatorSkill(lesson.id,lesson.checks.map(check=>answers[check.id])):null;
 const completed=CANON_SKILLS_CURRICULUM.filter(item=>!!progress.lessons[item.id]?.completedAt).length;
 const question=MOCK_EXAM_QUESTIONS.find(q=>q.id===exampleId);
 const selectLesson=(id:string)=>{setLessonId(id);setAnswers({});setSubmitted(false);setSaveWarning('');};
 const submitPractice=()=>{
  if(submitted||!answered||strictAssessmentLocked(assessmentSession))return;
  const next=recordCalculatorSkillAttempt(progress,lesson.id,lesson.checks.map(check=>answers[check.id]),new Date().toISOString());
  if(!next)return;
  setProgress(next);setSubmitted(true);
  try{window.localStorage.setItem(CALCULATOR_SKILLS_PROGRESS_KEY,JSON.stringify(next));setSaveWarning('');}
  catch{setSaveWarning('This result is visible now but could not be saved locally. Check your browser storage settings.');}
 };
 if(strictAssessmentLocked(assessmentSession))return <main className="max-w-3xl mx-auto p-8" aria-label="Calculator skills locked"><div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-950"><h1 className="text-xl font-bold mb-2">Calculator Skills unavailable during strict assessment</h1><p>Submit or end the active strict attempt before opening instructional content. Your physical permitted calculator may still be used under the examination rules.</p><button type="button" onClick={()=>setCurrentScreen('mock-exams')} className="mt-4 underline font-semibold">Return to mock exam</button></div></main>;
 return <main className="max-w-6xl mx-auto px-4 py-7 space-y-6" aria-label="Canon Calculator Skills Center">
  <header className="rounded-2xl bg-[#112341] text-white p-6 space-y-3">
   <div className="flex items-center gap-2"><Calculator className="w-7 h-7 text-amber-300"/><h1 className="text-2xl font-black">Canon Calculator Skills Center</h1></div>
   <button type="button" onClick={()=>setCalculatorOpen(true)} className="rounded-xl border border-amber-300 bg-amber-300 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-200"><Calculator className="mr-2 inline h-4 w-4"/>Open F-789SGA-style simulator</button>
   <p className="text-sm text-slate-200">Selected profile: <strong>{userProfile.calculatorModel||CALCULATOR_MODEL}</strong>. Lessons and examples are written for Canon F-789SGA; do not transfer menu/key procedures from another model.</p>
   <div className="flex flex-wrap gap-3 items-center"><span className="rounded-lg bg-white/10 px-3 py-2 text-xs">{completed} of {CANON_SKILLS_CURRICULUM.length} knowledge checks completed</span><span className="rounded-lg bg-white/10 px-3 py-2 text-xs">Practice-only progress — not verified board readiness</span></div>
   <div className="w-full bg-white/20 rounded-full h-2" role="progressbar" aria-label="Calculator lesson completion" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={CANON_SKILLS_CURRICULUM.length}><div className="h-2 rounded-full bg-amber-300" style={{width:`${completed/CANON_SKILLS_CURRICULUM.length*100}%`}}/></div>
  </header>
  <section className="border border-amber-200 rounded-xl bg-amber-50 p-4 text-xs space-y-2 text-amber-950" role="note"><p className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Device instructions are preliminary</p><p>The Canon F-789SGA requires a <strong>transparent casing</strong> under the cited October 2026 PRC Electronics Engineers program. Verify current eligibility and examination instructions. Lesson explanations are conceptual; exact physical keys, menu sequences, and LCD output have <strong>not</strong> been independently tested on a device.</p><div className="flex gap-4 flex-wrap"><a href={PRC_CALCULATORS_URL} target="_blank" rel="noreferrer" className="underline">PRC calculator policy <ExternalLink className="inline w-3 h-3"/></a><a href={CANON_MANUAL_URL} target="_blank" rel="noreferrer" className="underline">Canon official manual <ExternalLink className="inline w-3 h-3"/></a></div></section>
  <section className="bg-white rounded-xl border border-slate-200 p-4 space-y-3" aria-label="Canon calculator technique question coverage">
    <div className="flex items-start justify-between gap-3 flex-wrap"><div><h2 className="font-bold text-base text-slate-900">Per-question calculator guidance coverage</h2><p className="text-xs text-slate-600">{coverageSnapshot.available} of {coverageSnapshot.total} unique questions have preliminary Canon guides ({coverageSnapshot.pilot} exact-question, {coverageSnapshot.familyVariants} parameter-bound). Others are pending; unsupported questions are never assigned guessed keystrokes.</p></div><span className="text-xs font-bold rounded-md bg-blue-50 text-blue-900 px-3 py-2">{coverageSnapshot.pending} pending</span></div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">{coverageSnapshot.areas.filter(area=>area.total>0).map(area=><div key={area.id} className="rounded-lg bg-slate-50 border p-3"><p className="text-xs font-semibold text-slate-800">{area.label}</p><p className="text-sm font-bold text-blue-900">{area.available} / {area.total}</p><div className="w-full h-1.5 rounded-full bg-slate-200 mt-2" aria-hidden="true"><div className="h-full bg-blue-700 rounded-full" style={{width:`${Math.min(100,area.available/area.total*100)}%`}}/></div></div>)}</div>
    <p className="text-[11px] text-slate-600">This measures question-level guidance availability, not complete syllabus coverage, hardware validation, exam readiness, or PRC endorsement. All methods remain preliminary until separately verified.</p>
  </section>
  <div className="flex flex-wrap gap-2" role="group" aria-label="Calculator skills sections">
   <button type="button" onClick={()=>setSection('lessons')} aria-pressed={section==='lessons'} className={`rounded-lg px-4 py-2 font-semibold text-sm border ${section==='lessons'?'bg-blue-800 text-white':'bg-white text-slate-800'}`}><BookOpen className="inline w-4 h-4 mr-2"/>Lessons & practice</button>
   <button type="button" onClick={()=>setSection('drills')} aria-pressed={section==='drills'} className={`rounded-lg px-4 py-2 font-semibold text-sm border ${section==='drills'?'bg-blue-800 text-white':'bg-white text-slate-800'}`}><Calculator className="inline w-4 h-4 mr-2"/>Speed drills & mistake review</button>
   <button type="button" onClick={()=>setSection('numeric')} aria-pressed={section==='numeric'} className={`rounded-lg px-4 py-2 font-semibold text-sm border ${section==='numeric'?'bg-blue-800 text-white':'bg-white text-slate-800'}`}><Calculator className="inline w-4 h-4 mr-2"/>Numerical answer drills</button>
   <button type="button" onClick={()=>setSection('device-qa')} aria-pressed={section==='device-qa'} className={`rounded-lg px-4 py-2 font-semibold text-sm border ${section==='device-qa'?'bg-blue-800 text-white':'bg-white text-slate-800'}`}><ClipboardCheck className="inline w-4 h-4 mr-2"/>Physical-device QA worksheet</button>
   <button type="button" onClick={()=>setSection('examples')} aria-pressed={section==='examples'} className={`rounded-lg px-4 py-2 font-semibold text-sm border ${section==='examples'?'bg-blue-800 text-white':'bg-white text-slate-800'}`}><Calculator className="inline w-4 h-4 mr-2"/>Real question examples</button>
  </div>
  {section==='lessons'?<div className="grid grid-cols-1 lg:grid-cols-[minmax(225px,300px)_minmax(0,1fr)] gap-5 items-start">
   <nav aria-label="Calculator lessons" className="bg-white rounded-xl border p-3 space-y-4">
    {levels.map(level=><div key={level} className="space-y-2"><h2 className="text-xs font-black text-slate-500 uppercase tracking-wider px-2">{level}</h2><div className="space-y-1">{CANON_SKILLS_CURRICULUM.filter(item=>item.level===level).map(item=><button key={item.id} type="button" onClick={()=>selectLesson(item.id)} aria-current={lessonId===item.id?'step':undefined} className={`w-full rounded-lg border p-3 text-left text-xs ${lessonId===item.id?'bg-blue-50 border-blue-500':'bg-white border-transparent hover:bg-slate-50'}`}><span className="flex justify-between gap-2 items-center"><span className="font-semibold text-slate-900">{item.title}</span>{progress.lessons[item.id]?.completedAt&&<CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-label="Completed"/>}</span><span className="text-[11px] text-slate-500">{item.estimatedMinutes} min · {progress.lessons[item.id]?.attempts??0} checks attempted</span></button>)}</div></div>)}
   </nav>
   <article className="rounded-xl border bg-white p-4 sm:p-6 space-y-5" key={lesson.id}>
    <div className="space-y-2"><p className="text-xs font-bold uppercase tracking-wide text-blue-700">{lesson.level} · {lesson.estimatedMinutes} minutes</p><h2 className="text-xl font-extrabold text-slate-900">{lesson.title}</h2><p className="text-sm text-slate-700"><strong>Goal:</strong> {lesson.objective}</p><p className="text-xs text-slate-500">Manual topic: {lesson.manualSection}</p>
    {lesson.prerequisites.length>0&&<p className="text-xs text-slate-600">Suggested prior lessons: {lesson.prerequisites.map(id=>CANON_SKILL_BY_ID.get(id)?.title).join('; ')} (not mandatory)</p>}</div>
    <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-800">{lesson.concept}</div>
    <section className="space-y-2"><h3 className="font-bold text-sm text-slate-900">Procedure and decision steps</h3><ol className="list-decimal ml-5 space-y-2 text-sm text-slate-700">{lesson.steps.map((step,i)=><li key={i}>{step}</li>)}</ol></section>
    <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2 text-sm"><h3 className="font-bold text-blue-950">Guided worked example</h3><p><strong>Problem:</strong> {lesson.example.problem}</p><p><strong>Entry / setup:</strong> {lesson.example.input}</p><p><strong>Expected:</strong> {lesson.example.expected}</p><p><strong>Independent check:</strong> {lesson.example.independentCheck}</p><p className="text-amber-900"><strong>Trap:</strong> {lesson.example.trap}</p></section>
    <section className="border-t pt-4 space-y-4" aria-label="Calculator lesson knowledge check"><div className="flex justify-between items-center gap-3"><h3 className="font-bold text-base text-slate-900 flex gap-2 items-center"><ClipboardCheck className="w-5 h-5"/>Knowledge check</h3><span className="text-xs text-slate-500">2 questions · all correct to complete</span></div>
     {lesson.checks.map((check,i)=><fieldset key={check.id} className="space-y-2" disabled={submitted}><legend className="font-semibold text-sm text-slate-900">{i+1}. {check.prompt}</legend><div className="space-y-1">{check.options.map((option,index)=><label key={index} className={`flex items-start gap-2 cursor-pointer rounded-lg border p-2.5 text-sm ${answers[check.id]===index?'border-blue-400 bg-blue-50':'bg-white'}`}><input type="radio" name={`${lesson.id}-${check.id}`} checked={answers[check.id]===index} onChange={()=>setAnswers(prev=>({...prev,[check.id]:index}))} className="mt-1"/><span>{option}</span></label>)}</div>
      {submitted&&<div className={`rounded-lg px-3 py-2 text-xs ${result?.feedback[i]?'bg-emerald-50 text-emerald-950':'bg-amber-50 text-amber-950'}`} role="status"><strong>{result?.feedback[i]?'Correct.':'Review:'}</strong> {check.explanation}</div>}
     </fieldset>)}
     {!submitted?<button type="button" onClick={submitPractice} disabled={!answered} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed">Check answers</button>:<div className="space-y-3" aria-live="polite"><p className={`text-sm font-bold ${result?.passed?'text-emerald-800':'text-amber-800'}`}>Result: {result?.correct}/{result?.total}. {result?.passed?'Knowledge check completed.':'Review explanations and retry.'}</p><button type="button" onClick={()=>{setSubmitted(false);setAnswers({});}} className="inline-flex gap-2 items-center rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white"><RotateCcw className="w-4 h-4"/>Try again</button></div>}
     {saveWarning&&<p role="alert" className="text-xs text-amber-800">{saveWarning}</p>}
     <p className="text-xs text-slate-500">Checks measure lesson comprehension, not calculator key-sequence proficiency or exam readiness. Progress is stored locally and included in learner backup.</p>
    </section>
   </article>
  </div>:section==='device-qa'?<CanonDeviceQaScreen/>:section==='drills'?<CalculatorSpeedDrills errors={errors} onOpenLesson={id=>{selectLesson(id);setSection('lessons');}}/>:section==='numeric'?<CalculatorNumericDrills onOpenLesson={id=>{selectLesson(id);setSection('lessons');}}/>:<section className="space-y-4"><h2 className="font-bold text-lg text-slate-900">Calculator techniques for actual app questions</h2><p className="text-xs text-slate-600">{CANON_PILOT_TECHNIQUES.length} exact-question pilot guides and {CANON_FAMILY_TECHNIQUES.length} parameter-bound family guides ({familyExamples.length} example families). These remain preliminary until manufacturer/manual and physical-device reviews are completed.</p>
   <label className="block text-xs font-semibold text-slate-800">Choose an example<select className="mt-1 w-full rounded-lg border bg-white p-3 text-sm" value={exampleId} onChange={event=>setExampleId(event.target.value)}>{CANON_PILOT_TECHNIQUES.map(t=><option value={t.questionId} key={t.id}>{t.title}</option>)}{familyExamples.map(q=><option value={q.id} key={q.id}>{q.topicName} — {q.id}</option>)}</select></label>
   {question&&<article className="space-y-3 rounded-xl bg-white p-4 border"><p className="text-sm font-semibold">{question.question}</p><p className="text-xs text-slate-700 whitespace-pre-line"><strong>Mathematical explanation:</strong> {question.explanation}</p><CalculatorTechniqueCard key={exampleId} questionId={exampleId} question={question} disclosure="skills-center"/></article>}
  </section>}
  <button type="button" onClick={()=>setCurrentScreen('mock-exams')} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white">Go to mock practice</button>
 </main>;
}
