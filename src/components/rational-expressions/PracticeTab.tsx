import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, CheckCircle2, XCircle, HelpCircle, ArrowRight, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { MathView, FormattedMathText } from '../MathView';
import {
  PracticeQuestion,
  QuestionDifficulty,
  PRACTICE_QUESTIONS_BANK,
} from './practiceQuestionsData';

interface PracticeTabProps {
  onOpenQuickRefModal?: () => void;
  initialSubskill?: string;
  autoStart?: boolean;
}

interface QuestionAttemptRecord {
  questionId: number;
  question: PracticeQuestion;
  userAnswerIndex: number | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  usedHint: boolean;
  retried: boolean;
}

export const PracticeTab: React.FC<PracticeTabProps> = ({
  onOpenQuickRefModal,
  initialSubskill,
  autoStart,
}) => {
  // Setup configuration state
  const [practiceMode, setPracticeMode] = useState<'guided' | 'standard' | 'timed'>('guided');
  const [difficulty, setDifficulty] = useState<'Basic' | 'Intermediate' | 'Board-Level' | 'Mixed'>('Mixed');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedSubskills, setSelectedSubskills] = useState<string[]>(() => {
    if (initialSubskill) {
      return [initialSubskill];
    }
    return [
      'Domain restrictions',
      'Simplifying expressions',
      'Multiplication & division',
      'Addition & Subtraction',
      'Complex rational expressions',
      'Rational Equations',
    ];
  });

  // Session drill state
  const [isPracticing, setIsPracticing] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [hintStep, setHintStep] = useState(0); // 0 = none, 1 = first hint, 2 = all hints
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [attemptsLog, setAttemptsLog] = useState<QuestionAttemptRecord[]>([]);

  // Interactive Learning Tools State
  const [hasAttemptedOnce, setHasAttemptedOnce] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [scratchNotes, setScratchNotes] = useState('');
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);

  // Timed Sprint countdown state
  const TIMED_SECONDS_PER_Q = 90;
  const [timeLeft, setTimeLeft] = useState<number>(TIMED_SECONDS_PER_Q);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  const subskillsList = [
    'Domain restrictions',
    'Simplifying expressions',
    'Multiplication & division',
    'Addition & Subtraction',
    'Complex rational expressions',
    'Rational Equations',
  ];

  // Sync initialSubskill if it changes from outside
  useEffect(() => {
    if (initialSubskill) {
      const matched =
        subskillsList.find(
          (s) =>
            s.toLowerCase().includes(initialSubskill.toLowerCase()) ||
            initialSubskill.toLowerCase().includes(s.toLowerCase())
        ) || initialSubskill;
      setSelectedSubskills([matched]);
      if (autoStart) {
        startPracticeSession([matched], difficulty, questionCount);
      }
    }
  }, [initialSubskill, autoStart]);

  // Compute question pool according to subskills and difficulty
  const activeQuestions = useMemo(() => {
    let pool = PRACTICE_QUESTIONS_BANK;

    // Filter by subskills
    if (selectedSubskills.length > 0) {
      pool = pool.filter((q) =>
        selectedSubskills.some((s) => s.toLowerCase() === q.subskill.toLowerCase())
      );
    }

    // Filter by difficulty
    if (difficulty !== 'Mixed') {
      pool = pool.filter((q) => q.difficulty === difficulty);
    }

    return pool;
  }, [selectedSubskills, difficulty]);

  const toggleSubskill = (skill: string) => {
    setSelectedSubskills((prev) =>
      prev.includes(skill)
        ? prev.length > 1
          ? prev.filter((s) => s !== skill)
          : prev
        : [...prev, skill]
    );
  };

  const startPracticeSession = (
    skills = selectedSubskills,
    selectedDiff = difficulty,
    count = questionCount
  ) => {
    const eligible=PRACTICE_QUESTIONS_BANK.filter(q=>
      skills.some(s=>s.toLowerCase()===q.subskill.toLowerCase()) &&
      (selectedDiff==='Mixed'||q.difficulty===selectedDiff));
    if(!eligible.length)return; // Never silently widen an empty selection.
    const shuffled=[...eligible];
    for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
    setSessionQuestions(shuffled.slice(0,Math.min(count,shuffled.length)));
    setIsPracticing(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setHasAttemptedOnce(false);
    setHintStep(0);
    setScore(0);
    setIsCompleted(false);
    setAttemptsLog([]);
    questionStartTimeRef.current = Date.now();
    setTimeLeft(TIMED_SECONDS_PER_Q);
  };

  // Timer countdown for Timed mode
  useEffect(() => {
    if (!isPracticing || isCompleted || hasAnswered || practiceMode !== 'timed') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto submit timeout as incorrect if unanswered
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPracticing, isCompleted, hasAnswered, practiceMode, currentIndex]);

  const handleTimeout = () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    const q = sessionQuestions[currentIndex] || sessionQuestions[0];
    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

    setAttemptsLog((prev) => [
      ...prev,
      {
        questionId: q.id,
        question: q,
        userAnswerIndex: null,
        isCorrect: false,
        timeSpentSeconds: timeSpent,
        usedHint: hintStep > 0,
        retried: hasAttemptedOnce,
      },
    ]);
  };

  const handleSelectOption = (idx: number) => {
    if (hasAnswered) return;

    const q = sessionQuestions[currentIndex] || sessionQuestions[0];
    setSelectedOption(idx);
    setHasAnswered(true);

    const isCorrect = idx === q.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setHasAttemptedOnce(true);
    }

    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    setAttemptsLog((prev) => [
      ...prev,
      {
        questionId: q.id,
        question: q,
        userAnswerIndex: idx,
        isCorrect,
        timeSpentSeconds: timeSpent,
        usedHint: hintStep > 0,
        retried: hasAttemptedOnce,
      },
    ]);
  };

  const handleRetryQuestion = () => {
    setSelectedOption(null);
    setHasAnswered(false);
  };

  const totalQuestionsInDrill = sessionQuestions.length;

  const handleNextQuestion = () => {
    if (currentIndex + 1 < totalQuestionsInDrill) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
      setHasAttemptedOnce(false);
      setHintStep(0);
      setTimeLeft(TIMED_SECONDS_PER_Q);
      questionStartTimeRef.current = Date.now();
    } else {
      setIsCompleted(true);
      setIsPracticing(false);
    }
  };

  const currentQ = sessionQuestions[currentIndex] || sessionQuestions[0];

  // Subskill accuracy breakdown calculations
  const subskillStats = useMemo(() => {
    const stats: Record<string, { correct: number; total: number }> = {};
    attemptsLog.forEach((att) => {
      const skill = att.question.subskill;
      if (!stats[skill]) stats[skill] = { correct: 0, total: 0 };
      stats[skill].total += 1;
      if (att.isCorrect) stats[skill].correct += 1;
    });
    return stats;
  }, [attemptsLog]);

  return (
    <div className="space-y-6">
      <CalculatorCompatibilityNotice/>
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Practice Drills</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {isPracticing ? (practiceMode === 'timed' ? 'Timed Sprint' : 'Interactive Session') : 'Learning Mode'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Practice is for building technique and speed. Progressive hints, calculator hacks, and step-by-step textbook solutions are available.
          </p>
        </div>

        {onOpenQuickRefModal && (
          <button
            type="button"
            onClick={onOpenQuickRefModal}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <AppArtwork name="book" inline className="w-3.5 h-3.5 text-blue-600" />
            <span>Formula Sheet</span>
          </button>
        )}
      </div>

      {!isPracticing && !isCompleted ? (
        /* Setup Drill Card */
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          {/* Practice Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Drill Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'guided',
                  title: 'Guided Practice',
                  desc: 'Multi-stage hints, calculator hacks, and retry options before full solution reveal.',
                },
                {
                  id: 'standard',
                  title: 'Standard Drill',
                  desc: 'Solve on your own first. Hints unlock only after answering.',
                },
                {
                  id: 'timed',
                  title: 'Timed Sprint',
                  desc: '90s countdown per question to simulate board exam speed and pressure.',
                },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setPracticeMode(mode.id as any)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    practiceMode === mode.id
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{mode.title}</span>
                    {mode.id === 'timed' && <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Difficulty Level
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  {difficulty === 'Mixed' ? 'All tiers blended' : `${difficulty} problems`}
                </span>
              </div>
              <div className="flex gap-2">
                {(['Basic', 'Intermediate', 'Board-Level', 'Mixed'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Question Count
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  {activeQuestions.length} available in pool
                </span>
              </div>
              <div className="flex gap-2">
                {[3, 5, 8, 12].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setQuestionCount(c)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      questionCount === c
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {c} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subskills Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Target Subskills
              </label>
              <button
                type="button"
                onClick={() =>
                  setSelectedSubskills(
                    selectedSubskills.length === subskillsList.length
                      ? [subskillsList[0]]
                      : [...subskillsList]
                  )
                }
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {selectedSubskills.length === subskillsList.length ? 'Reset to Single' : 'Select All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {subskillsList.map((skill) => {
                const isSelected = selectedSubskills.includes(skill);
                const countForSkill = PRACTICE_QUESTIONS_BANK.filter(
                  (q) => q.subskill.toLowerCase() === skill.toLowerCase()
                ).length;
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSubskill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-2xs'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{skill}</span>
                    <span className="text-[10px] opacity-70">({countForSkill})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeQuestions.length===0&&<div role="status" className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900">No questions match this subskill and difficulty. Choose another filter; unrelated questions will not be substituted.</div>}

          {/* Start Practice Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => startPracticeSession()}
              disabled={activeQuestions.length===0}
              className="w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                Start Practice ({Math.min(questionCount, activeQuestions.length)} Questions)
              </span>
            </button>
          </div>
        </div>
      ) : isPracticing && !isCompleted ? (
        /* Live Practice Drill Player */
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500">
                Question {currentIndex + 1} of {totalQuestionsInDrill}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {currentQ.subskill}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentQ.difficulty === 'Board-Level'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : currentQ.difficulty === 'Intermediate'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {currentQ.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Timed Sprint Clock */}
              {practiceMode === 'timed' && (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${
                    timeLeft <= 15
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : timeLeft <= 30
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
                  <span>
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* Toggle Scratchpad Button */}
              <button
                type="button"
                onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border flex items-center gap-1 transition-colors cursor-pointer ${
                  isScratchpadOpen
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AppArtwork name="exam" inline className="w-3 h-3" />
                <span>Scratchpad</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsPracticing(false);
                  setIsCompleted(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium cursor-pointer transition-colors"
              >
                Exit Practice
              </button>
            </div>
          </div>

          {/* Quick Scratchpad Drawer */}
          {isScratchpadOpen && (
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-amber-700" />
                  <span>Scratch Working / Root Tracker</span>
                </span>
                <button
                  type="button"
                  onClick={() => setScratchNotes('')}
                  className="text-[10px] text-amber-700 hover:underline font-normal cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={scratchNotes}
                onChange={(e) => setScratchNotes(e.target.value)}
                placeholder="Jot down LCD factors, exclusions, intermediate quadratic terms..."
                className="w-full text-xs font-mono p-2.5 bg-white rounded-lg border border-amber-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-slate-800 resize-y min-h-[60px]"
              />
            </div>
          )}

          {/* Question Prompt */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 leading-relaxed shadow-2xs">
            <FormattedMathText text={currentQ.question} />
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              let optionStyle =
                'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 text-slate-800';
              if (selectedOption === idx) {
                optionStyle = 'bg-blue-50 border-blue-500 text-blue-900 font-bold';
              }
              if (hasAnswered) {
                if (idx === currentQ.correctIndex) {
                  optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                } else if (selectedOption === idx) {
                  optionStyle = 'bg-rose-50 border-rose-500 text-rose-900';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-sm">
                      <MathView math={option} />
                    </span>
                  </div>
                  {hasAnswered && idx === currentQ.correctIndex && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                  )}
                  {hasAnswered && selectedOption === idx && idx !== currentQ.correctIndex && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Remediation & Multi-stage Hints Area */}
          <div className="pt-2 flex flex-col gap-3">
            {/* Guided Progressive Hints */}
            {(!hasAnswered || practiceMode === 'guided') && (
              <div className="space-y-2">
                {hintStep === 0 ? (
                  <button
                    type="button"
                    onClick={() => setHintStep(1)}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Need a progressive hint?</span>
                  </button>
                ) : (
                  <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Hint {hintStep} of {currentQ.hints.length}</span>
                      </span>
                      {hintStep < currentQ.hints.length && (
                        <button
                          type="button"
                          onClick={() => setHintStep((prev) => prev + 1)}
                          className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                        >
                          Show Next Hint ({hintStep + 1}/{currentQ.hints.length}) →
                        </button>
                      )}
                    </div>
                    <div className="leading-relaxed">
                      <FormattedMathText text={currentQ.hints[hintStep - 1]} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Answer Feedback & Error Handling */}
            {hasAnswered && (
              <div className="space-y-3">
                {/* Incorrect Trap Callout */}
                {selectedOption !== null && selectedOption !== currentQ.correctIndex && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
                    <div className="font-bold text-rose-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Common Distractor Pitfall</span>
                      </span>
                      {/* Retry Question Option */}
                      <button
                        type="button"
                        onClick={handleRetryQuestion}
                        className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <AppArtwork name="cycle" inline className="w-3 h-3" />
                        <span>Try Answering Again</span>
                      </button>
                    </div>
                    <p className="text-rose-700 leading-relaxed">
                      {currentQ.trapWarning ||
                        'Double check sign distribution, LCD multiplication, and whether cancelation across plus/minus terms was mistakenly performed.'}
                    </p>
                  </div>
                )}

                {/* Complete Textbook Explanation */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-600" />
                    <span>Step-by-Step Textbook Derivation</span>
                  </div>
                  <div className="leading-relaxed text-slate-600 whitespace-pre-line">
                    <FormattedMathText text={currentQ.explanation} />
                  </div>
                </div>

                {/* Casio fx-991 Calculator Hack */}
                {currentQ.calculatorHack && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                    <AppArtwork name="calculator" inline className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-emerald-950 font-semibold mb-0.5">
                        Casio fx-991 Verification Hack:
                      </strong>
                      <span className="leading-relaxed text-emerald-800">{currentQ.calculatorHack}</span>
                    </div>
                  </div>
                )}

                {/* Next Question Navigation */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <span>
                      {currentIndex + 1 < totalQuestionsInDrill ? 'Next Problem' : 'View Session Breakdown'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Detailed Drill Completion & Analytics Dashboard */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 max-w-2xl mx-auto">
          {/* Header Score Badge */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50 app-artwork-tile">
              <AppArtwork name="trophy" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Practice Session Completed!</h3>
              <p className="text-xs text-slate-500 mt-1">
                You correctly solved <span className="font-extrabold text-slate-800">{score}</span> out of{' '}
                <span className="font-extrabold text-slate-800">{attemptsLog.length || totalQuestionsInDrill}</span> questions (
                {Math.round(
                  (score / (attemptsLog.length || totalQuestionsInDrill || 1)) * 100
                )}
                %)
              </p>
            </div>
          </div>

          {/* Subskills Mastery Breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-blue-600" />
              <span>Subskill Accuracy Breakdown</span>
            </h4>
            <div className="space-y-2">
              {Object.entries(subskillStats).map(([skill, stat]) => {
                const percent = Math.round((stat.correct / stat.total) * 100);
                return (
                  <div key={skill} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{skill}</span>
                      <span className="font-bold text-slate-900">
                        {stat.correct}/{stat.total} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent >= 80 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Question-by-Question Review List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Problem Review & Solutions
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {attemptsLog.map((attempt, i) => {
                const isExpanded = expandedReviewId === attempt.questionId;
                return (
                  <div key={attempt.questionId} className="bg-white">
                    <button
                      type="button"
                      onClick={() => setExpandedReviewId(isExpanded ? null : attempt.questionId)}
                      className="w-full p-3.5 text-left flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        {attempt.isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-800">Question {i + 1}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {attempt.question.subskill}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-500">
                          {attempt.timeSpentSeconds}s
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-slate-50/70 border-t border-slate-100 space-y-3 text-xs">
                        <div className="font-semibold text-slate-800">
                          <FormattedMathText text={attempt.question.question} />
                        </div>
                        <div className="space-y-1 text-slate-600">
                          <div>
                            <strong>Correct Answer:</strong> Option{' '}
                            {String.fromCharCode(65 + attempt.question.correctIndex)} (
                            <MathView math={attempt.question.options[attempt.question.correctIndex]} />)
                          </div>
                          {attempt.userAnswerIndex !== null && !attempt.isCorrect && (
                            <div className="text-rose-700">
                              <strong>Your Answer:</strong> Option{' '}
                              {String.fromCharCode(65 + attempt.userAnswerIndex)} (
                              <MathView math={attempt.question.options[attempt.userAnswerIndex]} />)
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line">
                          <FormattedMathText text={attempt.question.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <button
              type="button"
              onClick={() => startPracticeSession()}
              disabled={activeQuestions.length===0}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
              <span>Practice Again</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCompleted(false);
                setIsPracticing(false);
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Configure New Drill
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
