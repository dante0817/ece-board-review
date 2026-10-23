import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { AppArtwork } from '../common/AppArtwork';
import { MathView, FormattedMathText } from '../MathView';
import { useReview } from '../../context/ReviewContext';
import { gradeItems } from '../../utils/assessmentIntegrity';
import { gradeResponses } from '../../domain/assessment/grading';
import { shuffledOptionIds } from '../../domain/assessment/optionOrder';
import { makeAttemptId } from '../../domain/assessment/attemptId';
import type { TestRecord } from '../../types';

interface QuizTabProps { onPracticeWeakAreas: () => void; }

// Five authored items only. A single response per subskill is NOT strong mastery evidence.
export const RATIONAL_QUIZ_QUESTIONS = [
  { id:'rat-q1', subskill:'Domain Restrictions', question:'Find all values of $x$ for which $$\\frac{2x + 1}{x^2 - 9}$$ is undefined.',
    options:['x = -\\frac{1}{2}', 'x = 3 \\text{ and } x = -3', 'x = 9', 'x = 0'], correct:1 },
  { id:'rat-q2', subskill:'Simplification', question:'Simplify completely: $$\\frac{x^2 - 4x}{x^2 - 16}$$',
    options:['\\frac{x}{x + 4}', '\\frac{-4x}{-16}', '\\frac{x}{x - 4}', '\\frac{x - 4}{x + 4}'], correct:0 },
  { id:'rat-q3', subskill:'Multiply / Divide', question:'Compute: $$\\left(\\frac{3x}{2y}\\right) \\cdot \\left(\\frac{4y^2}{9x^2}\\right)$$',
    options:['\\frac{2y}{3x}', '\\frac{12xy^2}{18yx^2}', '\\frac{3y}{2x}', '\\frac{2}{3}'], correct:0 },
  { id:'rat-q4', subskill:'Add / Subtract', question:'Compute and simplify: $$\\frac{5}{x - 2} - \\frac{3}{x - 2}$$',
    options:['\\frac{2}{x - 2}', '2', '\\frac{8}{x - 2}', '\\frac{2}{2x - 4}'], correct:0 },
  { id:'rat-q5', subskill:'Rational Equations', question:'Solve for $x$: $$\\frac{4}{x} = 2$$',
    options:['x = 2', 'x = 8', 'x = \\frac{1}{2}', 'x = -2'], correct:0 },
] as const;

const DURATION_SECONDS=15*60;
export const QuizTab: React.FC<QuizTabProps> = ({ onPracticeWeakAreas }) => {
  const { addTestRecord, currentDateStr } = useReview();
  const [quizState,setQuizState] = useState<'intro'|'active'|'result'>('intro');
  const [currentQuizQ,setCurrentQuizQ]=useState(0);
  const [selectedAnswers,setSelectedAnswers]=useState<Record<number,number>>({});
  const [secondsLeft,setSecondsLeft]=useState(DURATION_SECONDS);
  const submitted=useRef(false);
  const [optionOrders,setOptionOrders]=useState<Record<string,string[]>>({});
  const [attemptId,setAttemptId]=useState('');
  const [result,setResult]=useState<ReturnType<typeof gradeItems>|null>(null);

  const startQuiz=()=>{
    submitted.current=false;
    setAttemptId(makeAttemptId());
    setOptionOrders(Object.fromEntries(RATIONAL_QUIZ_QUESTIONS.map(q=>[q.id,shuffledOptionIds(q.options.map((text,index)=>({id:String(index),text}))) ])));
    setResult(null);setCurrentQuizQ(0);setSelectedAnswers({});
    setSecondsLeft(DURATION_SECONDS);setQuizState('active');
  };
  const submitQuiz=()=>{
    if(submitted.current)return;
    submitted.current=true;
    const graded=gradeResponses(RATIONAL_QUIZ_QUESTIONS.map(q=>({
      questionId:q.id,topicId:'top-alg-fractions',subjectId:'subj-math-algebra',
      questionFamilyId:q.id,skillId:q.subskill,correctOptionId:String(q.correct),
      options:q.options.map((text,index)=>({id:String(index),text})),
    })), Object.fromEntries(RATIONAL_QUIZ_QUESTIONS.map((q,index)=>[q.id,selectedAnswers[index]===undefined?null:String(selectedAnswers[index])])),optionOrders);
    const itemResults:NonNullable<TestRecord['itemResults']> = graded.results;
    const grade=graded.grade;
    setResult(grade);
    addTestRecord({
      subjectId:'subj-math-algebra', testType:'Rational Expressions Practice Quiz',date:currentDateStr,
      questions:grade.questions,correct:grade.correct,incorrect:grade.incorrect,unanswered:grade.unanswered,
      timeMinutes:Number(((DURATION_SECONDS-secondsLeft)/60).toFixed(2)),
      topicIds:['top-alg-fractions'],provenance:'automatic',assessmentMode:'study',scope:'topic',itemResults,
      attemptId,assistanceUsed:false,pausedSeconds:0,curriculumVersion:'v10.10',
      notes:'Five-item topic practice quiz; each subskill has a single item. This is not sufficient to verify mastery.',
    });
    setQuizState('result');
  };
  useEffect(()=>{
    if(quizState!=='active')return;
    const handle=window.setInterval(()=>setSecondsLeft(v=>Math.max(0,v-1)),1000);
    return ()=>window.clearInterval(handle);
  },[quizState]);
  useEffect(()=>{if(quizState==='active' && secondsLeft===0)submitQuiz();},[quizState,secondsLeft]);
  const secondsLabel=`${String(Math.floor(secondsLeft/60)).padStart(2,'0')}:${String(secondsLeft%60).padStart(2,'0')}`;
  const question=RATIONAL_QUIZ_QUESTIONS[currentQuizQ];
  return <div className="space-y-6">
    {quizState==='intro' && <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-2xl mx-auto text-center space-y-5">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center"><AppArtwork name="trophy"/></div>
      <h2 className="text-xl font-extrabold text-slate-900">Rational Expressions Practice Quiz</h2>
      <p className="text-sm text-slate-500">{RATIONAL_QUIZ_QUESTIONS.length} questions • 15-minute timer • Results based on submitted answers</p>
      <p className="bg-amber-50 p-4 border border-amber-200 rounded-xl text-xs text-amber-900 text-left"><ShieldAlert className="inline w-4 h-4 mr-1"/>Each subskill contains only one question. The score is practice evidence, not verified mastery.</p>
      <button type="button" onClick={startQuiz} className="bg-blue-600 text-white px-5 py-3 rounded-xl text-xs font-bold">Begin Practice Quiz <ArrowRight className="inline w-4 h-4"/></button>
    </div>}
    {quizState==='active' && <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
      <div className="flex justify-between items-center border-b pb-3"><span className="text-xs font-bold">Question {currentQuizQ+1} of {RATIONAL_QUIZ_QUESTIONS.length} · {question.subskill}</span><span className="font-mono font-bold text-rose-700">{secondsLabel} remaining</span></div>
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200"><FormattedMathText text={question.question}/></div>
      <div className="space-y-2">{(optionOrders[question.id] ?? question.options.map((_,i)=>String(i))).map((optionId,displayIndex)=>{const index=Number(optionId);return <button key={optionId} type="button" onClick={()=>setSelectedAnswers(a=>({...a,[currentQuizQ]:index}))} className={`w-full border rounded-lg p-3 flex gap-3 text-left text-sm ${selectedAnswers[currentQuizQ]===index?'bg-blue-50 border-blue-500':'bg-white border-slate-200'}`}><span>{String.fromCharCode(65+displayIndex)}.</span><MathView math={question.options[index]}/></button>;})}</div>
      <div className="flex justify-between"><button disabled={currentQuizQ===0} type="button" onClick={()=>setCurrentQuizQ(v=>v-1)} className="border rounded-lg px-4 py-2 disabled:opacity-40">Previous</button>{currentQuizQ<RATIONAL_QUIZ_QUESTIONS.length-1?<button type="button" onClick={()=>setCurrentQuizQ(v=>v+1)} className="bg-blue-600 text-white rounded-lg px-4 py-2">Next</button>:<button type="button" onClick={submitQuiz} className="bg-emerald-600 text-white rounded-lg px-4 py-2">Submit Quiz</button>}</div>
    </div>}
    {quizState==='result' && result && <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b pb-4"><div><h2 className="font-bold text-xl">Practice Quiz Result</h2><p className="text-xs text-slate-500">Completed {currentDateStr}</p></div><div className="text-right"><span className="font-black text-2xl">{result.correct} / {result.questions}</span><p className="font-bold text-sm">{result.scorePercent}%</p><p className="text-xs text-slate-500">{result.unanswered} unanswered</p></div></div>
      <div className="space-y-2"><h3 className="font-bold text-sm">Subskill breakdown (one item each)</h3>{RATIONAL_QUIZ_QUESTIONS.map((q,index)=><div key={q.id} className="p-3 bg-slate-50 border rounded-lg flex justify-between gap-3 text-xs"><span>{q.subskill}</span><span className={selectedAnswers[index]===q.correct?'text-emerald-700':'text-rose-700'}>{selectedAnswers[index]===undefined?'Unanswered':selectedAnswers[index]===q.correct?'Correct (1/1)':'Incorrect (0/1)'}</span></div>)}</div>
      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-900"><AlertTriangle className="inline w-4 h-4 mr-1"/>This result is saved as an auto-graded topic practice attempt. More independent questions are needed for reliable mastery assessment.</div>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={onPracticeWeakAreas} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Practice weak areas</button><button type="button" onClick={startQuiz} className="border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold">Retake Quiz</button></div>
    </div>}
  </div>;
};
