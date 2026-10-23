import React, {useMemo,useRef,useState,useEffect} from 'react';
import {getAlgebraReferenceContent, type AlgebraReferencePracticeQuestion} from '../../data/algebraReferenceContent';
import {independentQuestionsForTopic, type IndependentAlgebraQuestion} from '../../data/independentAlgebraAssessment';
import {canonicalSkillId, ALGEBRA_COVERAGE_CATALOG_VERSION} from '../../domain/curriculum/skillCatalog';
import {selectReservedQuestionIds, countReservedFamilies} from '../../domain/curriculum/reservedSelection';
import {useReview} from '../../context/ReviewContext';
import {buildOptionOrders,orderedChoices,shuffledOptionIds,hasPositionSensitiveLanguage} from '../../domain/assessment/optionOrder';
import {gradeResponses} from '../../domain/assessment/grading';
import {makeAttemptId} from '../../domain/assessment/attemptId';

interface Props { topicId:string; title:string }
type Phase = 'intro'|'active'|'results';
type QuizMode = 'study'|'independent';
type Question = AlgebraReferencePracticeQuestion | IndependentAlgebraQuestion;
/** Guide-exposed practice and separately authored, self-attested assessment families. */
export const ReferenceTopicQuiz:React.FC<Props> = ({topicId,title}) => {
  const {subjects,testRecords,addTestRecord,currentDateStr}=useReview();
  const content=getAlgebraReferenceContent(topicId);
  const [phase,setPhase]=useState<Phase>('intro');
  const [mode,setMode]=useState<QuizMode>('study');
  const [attested,setAttested]=useState(false);
  const [questionIds,setQuestionIds]=useState<string[]>([]);
  const [optionOrders,setOptionOrders]=useState<Record<string,string[]>>({});
  const [responses,setResponses]=useState<Record<string,string>>({});
  const [cursor,setCursor]=useState(0);
  const [attemptId,setAttemptId]=useState('');
  const [startedAt,setStartedAt]=useState('');
  const [elapsed,setElapsed]=useState(0);
  const submitted=useRef(false);
  // When the same quiz component is reused for another topic, discard the old unsent attempt.
  useEffect(()=>{setPhase('intro');setMode('study');setQuestionIds([]);setOptionOrders({});setResponses({});setCursor(0);setAttested(false);submitted.current=false;},[topicId]);
  const subjectId=useMemo(()=>subjects.find(subject=>subject.groups.some(g=>g.topics.some(t=>t.id===topicId)))?.id??'subj-math-algebra',[subjects,topicId]);
  const reserved=useMemo(()=>independentQuestionsForTopic(topicId),[topicId]);
  const alreadyAttempted=useMemo(()=>new Set(testRecords.flatMap(test=>(test.itemResults??[]).map(item=>item.questionId))),[testRecords]);
  const unseenReserved=useMemo(()=>reserved.filter(q=>!alreadyAttempted.has(q.id)),[reserved,alreadyAttempted]);
  const unseenFamilyCount=countReservedFamilies(unseenReserved);
  const bank:readonly Question[] = mode==='independent'?reserved:content?.practiceQuestions??[];
  const questions=useMemo(()=>questionIds.map(id=>bank.find(q=>q.id===id)).filter((q):q is Question=>Boolean(q)),[questionIds,bank]);
  const current=questions[cursor];
  useEffect(()=>{if(phase!=='active')return;const timer=setInterval(()=>setElapsed(v=>v+1),1000);return ()=>clearInterval(timer);},[phase]);

  const start=(requested:QuizMode)=>{
    const candidates:readonly Question[]=requested==='independent'?unseenReserved:content?.practiceQuestions??[];
    if(requested==='independent' && (!attested || countReservedFamilies(unseenReserved)<3))return;
    if(!candidates.length)return;
    const shuffled=shuffledOptionIds(candidates.map(q=>({id:q.id,text:q.prompt})));
    const selected=requested==='independent'
      ? selectReservedQuestionIds(candidates as IndependentAlgebraQuestion[],3)
      : shuffled.slice(0,Math.min(10,candidates.length));
    if(requested==='independent' && selected.length<3)return;
    const chosen=selected.map(id=>candidates.find(q=>q.id===id)!);
    setMode(requested);
    setQuestionIds(selected);
    setOptionOrders(buildOptionOrders(chosen.map(q=>({id:q.id,options:q.options.map((text,index)=>({id:String(index),text})),preserveOptionOrder:hasPositionSensitiveLanguage(q.prompt,q.explanation,...q.options)}))));
    setResponses({});setCursor(0);setAttemptId(makeAttemptId());setStartedAt(new Date().toISOString());setElapsed(0);
    submitted.current=false;setPhase('active');
  };
  const graded=useMemo(()=>{
    if(!questions.length || !Object.keys(optionOrders).length)return null;
    try{return gradeResponses(questions.map(q=>({
      questionId:q.id,topicId,subjectId,questionFamilyId:'familyId' in q?q.familyId:q.id,
      skillId:canonicalSkillId(topicId,q.subskill),
      correctOptionId:String(q.correctIndex),options:q.options.map((text,index)=>({id:String(index),text})),
    })),responses,optionOrders);}catch{return null;}
  },[questions,responses,optionOrders,topicId,subjectId]);
  const submit=()=>{
    if(submitted.current||!graded)return;
    submitted.current=true;
    const independent=mode==='independent';
    addTestRecord({
      attemptId,startedAt,provenance:'automatic',assessmentMode:independent?'strict':'study',assistanceUsed:false,pausedSeconds:0,
      selfAttested:independent,curriculumVersion:independent?'v10.11':'v10.10',scope:'topic',subjectId,
      testType:`${title} ${independent?'Independent Check':'Reference Practice Quiz'}`,date:currentDateStr,
      questions:graded.grade.questions,correct:graded.grade.correct,incorrect:graded.grade.incorrect,unanswered:graded.grade.unanswered,
      timeMinutes:Number((elapsed/60).toFixed(2)),topicIds:[topicId],itemResults:graded.results,
      notes:independent
        ? `Self-attested unaided attempt from unused original variants in distinct problem families; catalog ${ALGEBRA_COVERAGE_CATALOG_VERSION}. Not independently proctored or official board readiness.`
        : 'Exposed reference question families; automatically graded study evidence only.',
    });
    setPhase('results');
  };
  if(!content?.practiceQuestions.length)return <section className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">An assessment bank is not yet available for {title}. Use guided lessons and reviews; no exam evidence is inferred.</section>;
  return <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 max-w-4xl">
    {phase==='intro'&&<>
      <h2 className="text-lg font-bold text-slate-900">{title} — Assessment choices</h2>
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
        <h3 className="text-sm font-bold text-blue-950">Scored practice · {Math.min(10,content.practiceQuestions.length)} familiar questions</h3>
        <p className="text-xs text-blue-800">Explanations are available after submission. Reusing lesson questions builds practice evidence, not independent mastery.</p>
        <button type="button" onClick={()=>start('study')} className="bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">Start scored practice</button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <h3 className="text-sm font-bold text-slate-900">Original-family independent check</h3>
        {reserved.length? <>
          <p className="text-xs text-slate-700">{unseenReserved.length} unused of {reserved.length} original question variants remain. Each check selects three different problem families. A delayed check may use a different variant of an already assessed family.</p>
          <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer"><input type="checkbox" checked={attested} onChange={e=>setAttested(e.target.checked)} className="mt-0.5"/> I will answer without hints, other people, or external tools. I understand this is self-attested, not a proctored or PRC-certified assessment.</label>
          <button type="button" disabled={!attested||unseenFamilyCount<3} onClick={()=>start('independent')} className="bg-slate-800 text-white disabled:bg-slate-300 rounded-lg px-4 py-2 text-sm font-semibold">Start independent check</button>
          {unseenFamilyCount<3&&<p className="text-xs text-amber-800">Not enough unused variants across distinct families for another check. Additional validated families are required; familiar items remain available in practice.</p>}
        </>:<p className="text-xs text-amber-800">No separately authored assessment families for this topic yet. No independent evidence can be claimed.</p>}
      </div>
    </>}
    {phase==='active'&&current&&<>
      <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-slate-600"><span>{mode==='independent'?'Self-attested independent check':'Scored practice'} · Question {cursor+1} of {questions.length} · {current.subskill}</span><span>{Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,'0')} elapsed</span></div>
      <p className="text-base font-semibold text-slate-900">{current.prompt}</p>
      <div className="space-y-2">{orderedChoices(current.options.map((text,index)=>({id:String(index),text})),optionOrders[current.id]).map((choice,displayIndex)=><button key={choice.id} type="button" onClick={()=>setResponses(prev=>({...prev,[current.id]:choice.id}))} className={`w-full flex gap-3 p-3 text-left border rounded-lg text-sm ${responses[current.id]===choice.id?'bg-blue-50 border-blue-500 text-blue-950':'bg-white border-slate-200 text-slate-800'}`}><strong>{String.fromCharCode(65+displayIndex)}.</strong> {choice.text}</button>)}</div>
      <div className="flex justify-between gap-2"><button disabled={cursor===0} type="button" onClick={()=>setCursor(v=>v-1)} className="border rounded-lg p-2 text-xs disabled:opacity-40">Previous</button>{cursor===questions.length-1?<button type="button" onClick={submit} className="bg-emerald-700 text-white rounded-lg px-4 py-2 text-xs font-semibold">Submit & grade</button>:<button type="button" onClick={()=>setCursor(v=>v+1)} className="bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold">Next</button>}</div>
    </>}
    {phase==='results'&&graded&&<>
      <h2 className="text-lg font-bold text-slate-900">Saved {mode==='independent'?'self-attested check':'study quiz'}: {graded.grade.correct}/{graded.grade.questions} ({graded.grade.scorePercent}%)</h2>
      <p className="text-xs bg-amber-50 border border-amber-200 rounded p-3">{mode==='independent'?'Previously unattempted question variants · Self-attested, not proctored; distinct families and delayed checks are needed before consistent performance can be indicated.':'Exposed study questions · Not independent evidence.'} · {graded.grade.unanswered} unanswered.</p>
      {questions.map(q=><div key={q.id} className="border border-slate-200 rounded-lg p-3 text-sm"><strong>{q.subskill}: </strong>{q.prompt}<p className="text-xs mt-1">{responses[q.id]===undefined?'Unanswered':responses[q.id]===String(q.correctIndex)?'Correct':'Incorrect'} · Correct answer: {q.options[q.correctIndex]}</p><p className="text-xs text-slate-600 mt-1">{q.explanation}</p></div>)}
      <button type="button" onClick={()=>{setPhase('intro');setAttested(false);}} className="border border-blue-300 text-blue-800 rounded-lg px-4 py-2 text-xs font-semibold">Back to assessment choices</button>
    </>}
  </section>;
};
