import { AppArtwork } from './common/AppArtwork';
import { buildOptionOrders, orderedChoices, hasPositionSensitiveLanguage } from '../domain/assessment/optionOrder';
import { gradeResponses } from '../domain/assessment/grading';
import { makeAttemptId } from '../domain/assessment/attemptId';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useReview } from '../context/ReviewContext';
import {
  CustomWeakSpotQuiz,
  WeakSpotQuizQuestion,
} from '../types';
import { AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, X, Save, Check, HelpCircle, ArrowRight } from 'lucide-react';
import { MathFormula } from './MathFormula';

export const WeakSpotQuizModal: React.FC = () => {
  const {
    activeWeakSpotQuiz,
    closeWeakSpotQuiz,
    generateWeakSpotQuiz,
    startWeakSpotQuiz,
    toggleErrorResolved,
    addTestRecord,
    currentDateStr,
    errors,
  } = useReview();

  const [phase, setPhase] = useState<'intro' | 'active' | 'results'>('intro');
  const [optionOrders, setOptionOrders] = useState<Record<string,string[]>>({});
  const [attemptId, setAttemptId] = useState('');
  const [hintUsed, setHintUsed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // questionId -> optionId
  const [showFormulaHint, setShowFormulaHint] = useState<boolean>(false);
  const [savedToRecords, setSavedToRecords] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [resolvedErrorsInSession, setResolvedErrorsInSession] = useState<Set<string>>(new Set());

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Run timer when active
  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    setPhase('intro');setCurrentIndex(0);setUserAnswers({});setSavedToRecords(false);
    setShowFormulaHint(false);setSecondsElapsed(0);setResolvedErrorsInSession(new Set());
  }, [activeWeakSpotQuiz?.id]);

  const questions = activeWeakSpotQuiz?.questions ?? [];
  const currentQuestion: WeakSpotQuizQuestion | undefined = questions[currentIndex];
  // An inactive modal still executes all hooks in the same order.


  const handleStartQuiz = () => {
    setPhase('active');
    setCurrentIndex(0);
    setUserAnswers({});
    setShowFormulaHint(false);
    setHintUsed(false);
    setAttemptId(makeAttemptId());
    setOptionOrders(buildOptionOrders(questions.map(q=>({...q,preserveOptionOrder:hasPositionSensitiveLanguage(q.question,q.explanation,q.boardTip,...q.options.map(option=>option.text))}))));
    setSavedToRecords(false);
    setSecondsElapsed(0);
  };

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    setShowFormulaHint(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPhase('results');
    }
  };

  const handlePrev = () => {
    setShowFormulaHint(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate results
  const scoreResults = useMemo(() => {
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctOptionId) {
        correctCount += 1;
      }
    });
    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const isPassed = percentage >= 70;
    return { correctCount, percentage, isPassed };
  }, [questions, userAnswers]);

  // Handle saving score to TestRecords
  const handleSaveToRecords = () => {
    if (savedToRecords || !activeWeakSpotQuiz) return;
    const graded = gradeResponses(questions.map(q=>({
      questionId:q.id,topicId:q.topicId,
      subjectId:errors.find(e=>e.topicId===q.topicId)?.subjectId || activeWeakSpotQuiz.dominantSubjectId,
      correctOptionId:q.correctOptionId,options:q.options,questionFamilyId:q.id,
    })),userAnswers,optionOrders);
    const itemResults=graded.results;
    addTestRecord({
      provenance:'automatic',assessmentMode:'study',scope:'mixed',itemResults,
      attemptId,assistanceUsed:hintUsed,pausedSeconds:0,curriculumVersion:'v10.10',
      subjectId: activeWeakSpotQuiz.dominantSubjectId,
      testType: activeWeakSpotQuiz.title,
      date: currentDateStr,
      questions: graded.grade.questions,
      correct: graded.grade.correct,
      incorrect: graded.grade.incorrect,
      unanswered: graded.grade.unanswered,
      timeMinutes: Math.max(1, Math.round(secondsElapsed / 60)),
      topicIds: Array.from(new Set(questions.map((q) => q.topicId))),
      notes: `Custom Weak Spot Diagnostic targeting highest error frequency in ${activeWeakSpotQuiz.dominantSubjectName}. Time taken: ${formatTimer(secondsElapsed)}.`,
    });
    setSavedToRecords(true);
  };

  // Quick action to mark error as resolved from results
  const handleResolveError = (errorId: string) => {
    toggleErrorResolved(errorId);
    setResolvedErrorsInSession((prev) => {
      const next = new Set(prev);
      next.add(errorId);
      return next;
    });
  };

  // Generate another quiz
  const handleRegenerate = () => {
    if (!activeWeakSpotQuiz) return;
    const newQuiz = generateWeakSpotQuiz({
      questionCount: activeWeakSpotQuiz.totalQuestions,
    });
    startWeakSpotQuiz(newQuiz);
    setPhase('intro');
    setCurrentIndex(0);
    setOptionOrders({});
    setAttemptId('');
    setUserAnswers({});
    setSavedToRecords(false);
    setSecondsElapsed(0);
  };

  if (!activeWeakSpotQuiz) return null;

  return (
    <div
      id="weak-spot-quiz-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="weak-spot-quiz-modal"
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* MODAL HEADER */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 app-artwork-tile">
              <AppArtwork name="target" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Custom Weak Spot Quiz
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Error Log Driven
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Focus: {activeWeakSpotQuiz.dominantSubjectName} ({activeWeakSpotQuiz.dominantSubjectErrorPercent}% of errors)
              </p>
            </div>
          </div>

          <button
            id="close-weak-spot-quiz-btn"
            onClick={closeWeakSpotQuiz}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Close quiz"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PHASE 1: INTRO & SUBJECT BREAKDOWN */}
        {phase === 'intro' && (
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-rose-950">
                    Targeted Remediation Diagnostic
                  </h3>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    {activeWeakSpotQuiz.diagnosticExecutiveSummary}
                  </p>
                </div>
              </div>
            </div>

            {/* SUBJECT ERROR FREQUENCY DISTRIBUTION */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-stone-500" />
                  Subject Error Frequency Breakdown
                </span>
                <span className="text-xs text-stone-500">
                  Total Active Errors Analyzed: {activeWeakSpotQuiz.subjectBreakdown.reduce((s, b) => s + b.occurrenceTotal, 0)}
                </span>
              </div>

              <div className="space-y-2.5">
                {activeWeakSpotQuiz.subjectBreakdown.map((sb, idx) => {
                  const isTopWeak = sb.subjectId === activeWeakSpotQuiz.dominantSubjectId;
                  return (
                    <div
                      key={sb.subjectId}
                      className={`p-3 rounded-xl border transition-all ${
                        isTopWeak
                          ? 'bg-rose-50/40 border-rose-300 shadow-xs'
                          : 'bg-stone-50/50 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                              isTopWeak
                                ? 'bg-rose-600 text-white'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-sm font-bold text-stone-900">
                            {sb.subjectName}
                          </span>
                          {isTopWeak && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                              Highest Error Frequency
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-stone-800">
                            {sb.occurrenceTotal} occurrence{sb.occurrenceTotal !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs text-stone-500 ml-1.5 font-mono">
                            ({sb.errorFrequencyPercent}%)
                          </span>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isTopWeak ? 'bg-rose-500' : 'bg-stone-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(8, sb.errorFrequencyPercent))}%` }}
                        />
                      </div>

                      {/* Top weak topics & categories pills */}
                      {sb.topWeakTopics.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-stone-100">
                          <span className="text-[10px] font-medium text-stone-500">Weak Topics:</span>
                          {sb.topWeakTopics.slice(0, 3).map((t) => (
                            <span
                              key={t.topicId}
                              className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium"
                            >
                              {t.topicName} ({t.count})
                            </span>
                          ))}
                          {sb.topErrorCategories.slice(0, 2).map((c) => (
                            <span
                              key={c.category}
                              className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium"
                            >
                              {c.category}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUIZ SPECS */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] text-stone-500 block font-medium">Questions</span>
                <span className="text-lg font-bold text-stone-900 font-mono">
                  {activeWeakSpotQuiz.totalQuestions}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] text-stone-500 block font-medium">Pacing Target</span>
                <span className="text-lg font-bold text-stone-900 font-mono">
                  ~{activeWeakSpotQuiz.targetDurationMinutes} min
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] text-stone-500 block font-medium">Passing Score</span>
                <span className="text-lg font-bold text-emerald-700 font-mono">
                  70%
                </span>
              </div>
            </div>

            {/* RECOMMENDED FOCUS TIPS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-600" />
                Tailored Error Trap Warnings
              </h4>
              <div className="space-y-1.5">
                {activeWeakSpotQuiz.recommendedFocusTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200 flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* START BUTTON */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                id="cancel-weak-spot-quiz-btn"
                onClick={closeWeakSpotQuiz}
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Cancel
              </button>
              <button
                id="start-weak-spot-quiz-now-btn"
                onClick={handleStartQuiz}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm shadow-sm flex items-center gap-2 transition-all hover:translate-y-[-0.5px]"
              >
                <span>Begin Weak Spot Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PHASE 2: ACTIVE QUESTION TAKING */}
        {phase === 'active' && currentQuestion && (
          <div className="p-6 overflow-y-auto space-y-5 flex-1 flex flex-col justify-between">
            <div>
              {/* TOP BAR: PROGRESS & TIMER */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-600 font-medium">
                    {currentQuestion.subjectName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-stone-700">
                    <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-stone-500" />
                    <span>{formatTimer(secondsElapsed)}</span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      currentQuestion.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : currentQuestion.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-stone-800 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* WHY THIS QUESTION IS HERE (ERROR LOG RATIONALE) */}
              <div className="bg-rose-50/70 border border-rose-200/90 rounded-xl p-3 mb-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-rose-200/80 text-rose-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 app-artwork-tile">
                    <AppArtwork name="target" />
                  </div>
                  <div className="text-xs text-rose-950 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Targeted Weak Spot:</span>
                      <span className="px-1.5 py-0.2 rounded bg-rose-200/60 text-rose-900 font-semibold text-[10px]">
                        {currentQuestion.targetedErrorCategory}
                      </span>
                      <span className="text-stone-500 text-[10px]">
                        ({currentQuestion.topicName})
                      </span>
                    </div>
                    <p className="text-rose-900/90 leading-relaxed text-[11px]">
                      {currentQuestion.weaknessRationale}
                    </p>
                  </div>
                </div>
              </div>

              {/* QUESTION TEXT */}
              <div className="bg-stone-50/60 p-4 rounded-xl border border-stone-200 mb-4">
                <p className="text-sm font-medium text-stone-900 leading-relaxed whitespace-pre-line">
                  {currentQuestion.question}
                </p>
              </div>

              {/* MULTIPLE CHOICE OPTIONS */}
              <div className="space-y-2.5 mb-4">
                {orderedChoices(currentQuestion.options,optionOrders[currentQuestion.id] ?? currentQuestion.options.map(o=>o.id)).map((option,displayIndex) => {
                  const isSelected = userAnswers[currentQuestion.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 group ${
                        isSelected
                          ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                          : 'bg-white border-stone-200 text-stone-800 hover:border-stone-400 hover:bg-stone-50/80'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-white text-stone-900'
                            : 'bg-stone-100 text-stone-700 group-hover:bg-stone-200'
                        }`}
                      >
                        {String.fromCharCode(65+displayIndex)}
                      </span>
                      <span className="text-sm font-medium leading-relaxed pt-0.5">
                        {option.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* FORMULA HINT TOGGLE */}
              <div className="pt-1">
                {showFormulaHint ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 space-y-1 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between font-bold text-amber-950">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                        Formula & Pitfall Reminder
                      </span>
                      <button
                        onClick={() => setShowFormulaHint(false)}
                        className="text-[10px] text-amber-700 hover:text-amber-950 underline"
                      >
                        Hide
                      </button>
                    </div>
                    {currentQuestion.keyFormulaReminder && (
                      <p className="font-mono text-[11px] bg-white/70 p-1.5 rounded border border-amber-200/60">
                        {currentQuestion.keyFormulaReminder}
                      </p>
                    )}
                    {currentQuestion.pitfallWarning && (
                      <p className="text-[11px] text-amber-800">
                        ⚠️ <span className="font-semibold">Watch out:</span> {currentQuestion.pitfallWarning}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowFormulaHint(true); setHintUsed(true); }}
                    className="text-xs text-stone-500 hover:text-amber-700 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                    <span>Need a formula hint?</span>
                  </button>
                )}
              </div>
            </div>

            {/* NAVIGATION BUTTONS */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-stone-500 font-medium">
                {Object.keys(userAnswers).length} of {questions.length} answered
              </div>

              <button
                onClick={handleNext}
                className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all ${
                  currentIndex === questions.length - 1
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                <span>{currentIndex === questions.length - 1 ? 'Finish & Check Results' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PHASE 3: RESULTS & ERROR RESOLUTION */}
        {phase === 'results' && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* SCORE HERO BANNER */}
            <div
              className={`rounded-2xl p-5 border text-center relative overflow-hidden ${
                scoreResults.isPassed
                  ? 'bg-emerald-50/80 border-emerald-300'
                  : 'bg-rose-50/80 border-rose-300'
              }`}
            >
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/80 border border-stone-200 text-stone-800">
                  {scoreResults.isPassed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Weak Spot Remediated</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Continued Practice Needed</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-extrabold font-mono text-stone-900">
                    {scoreResults.percentage}%
                  </span>
                  <span className="text-sm font-semibold text-stone-500 self-end pb-1">
                    ({scoreResults.correctCount} / {questions.length} correct)
                  </span>
                </div>

                <p className="text-xs text-stone-700 max-w-md mx-auto leading-relaxed">
                  {scoreResults.isPassed
                    ? `Excellent work! You demonstrated solid mastery over the high-error topics in ${activeWeakSpotQuiz.dominantSubjectName}. You reached the app practice target; this does not imply an official PRC pass.`
                    : `Score fell below the app 70% practice target for ${activeWeakSpotQuiz.dominantSubjectName}. Review the detailed solutions below and re-test these specific traps.`}
                </p>

                {/* SAVE TO TEST RECORDS BUTTON */}
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={handleSaveToRecords}
                    disabled={savedToRecords}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      savedToRecords
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 shadow-2xs'
                    }`}
                  >
                    {savedToRecords ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Saved to Official Test Records</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-stone-600" />
                        <span>Save to Test Records</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* QUESTION BY QUESTION DETAILED BREAKDOWN & RESOLUTION */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AppArtwork name="book" inline className="w-3.5 h-3.5 text-stone-500" />
                  Remediation & Question Review
                </span>
                <span className="text-xs font-normal text-stone-500">
                  Click questions to review traps & formulas
                </span>
              </h3>

              <div className="space-y-3">
                {questions.map((q, idx) => {
                  const chosenOptionId = userAnswers[q.id];
                  const isCorrect = chosenOptionId === q.correctOptionId;
                  const isSourceResolved = q.sourceErrorId
                    ? resolvedErrorsInSession.has(q.sourceErrorId) ||
                      errors.find((e) => e.id === q.sourceErrorId)?.isResolved
                    : false;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isCorrect
                          ? 'bg-emerald-50/30 border-emerald-200/80'
                          : 'bg-rose-50/30 border-rose-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {isCorrect ? '✓' : '✗'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-stone-900">
                                Question {idx + 1}
                              </span>
                              <span className="text-stone-300">•</span>
                              <span className="text-xs text-stone-600 font-medium">
                                {q.topicName}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                                {q.targetedErrorCategory}
                              </span>
                            </div>
                            <p className="text-xs text-stone-800 font-medium mt-1">
                              {q.question}
                            </p>
                          </div>
                        </div>

                        {/* RESOLVE BUTTON IF ANSWERED CORRECTLY */}
                        {q.sourceErrorId && isCorrect && (
                          <div className="shrink-0">
                            <button
                              onClick={() => handleResolveError(q.sourceErrorId!)}
                              disabled={isSourceResolved}
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                                isSourceResolved
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                              }`}
                              title="Mark this mistake as resolved in your Error Log"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{isSourceResolved ? 'Error Resolved' : 'Mark Error Resolved'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ANSWERS COMPARISON */}
                      <div className="text-xs space-y-1 bg-white p-2.5 rounded-lg border border-stone-200 mt-2 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500">Your Answer:</span>
                          <span
                            className={`font-bold ${
                              isCorrect ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            Option {chosenOptionId || 'None'} ({q.options.find((o) => o.id === chosenOptionId)?.text || 'Unanswered'})
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                            <span className="text-stone-500">Correct Answer:</span>
                            <span className="font-bold text-emerald-700">
                              Option {q.correctOptionId} ({q.options.find((o) => o.id === q.correctOptionId)?.text})
                            </span>
                          </div>
                        )}
                      </div>

                      {/* EXPLANATION & KEY FORMULA */}
                      <div className="mt-2.5 pt-2 border-t border-stone-200/60 text-xs text-stone-700 space-y-1.5">
                        <p className="leading-relaxed whitespace-pre-line text-stone-600">
                          {q.explanation}
                        </p>
                        {q.keyFormula && (
                          <div className="text-[11px] font-mono bg-stone-100 p-1.5 rounded text-stone-800 border border-stone-200">
                            🔑 <span className="font-semibold">Key Identity:</span> {q.keyFormula}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 border border-stone-300 rounded-xl hover:bg-stone-50 flex items-center gap-1.5 transition-colors"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                <span>Generate Another Weak Spot Quiz</span>
              </button>

              <button
                onClick={closeWeakSpotQuiz}
                className="px-6 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
