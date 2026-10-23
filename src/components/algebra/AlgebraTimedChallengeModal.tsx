import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useEffect, useRef } from 'react';
import { useReview } from '../../context/ReviewContext';
import { MathFormula } from '../MathFormula';
import {
  ALGEBRA_TIMED_CHALLENGE_SETS,
  TimedChallengeSet,
  TimedChallengeQuestion,
} from '../../data/algebraTimedChallengeData';
import { playPomodoroChime } from '../../utils/soundEffects';
import { Play, Pause, CheckCircle2, AlertTriangle, ArrowRight, X, ChevronRight, PlusCircle } from 'lucide-react';

interface AlgebraTimedChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSetId?: string;
}

export const AlgebraTimedChallengeModal: React.FC<AlgebraTimedChallengeModalProps> = ({
  isOpen,
  onClose,
  initialSetId = 'set-1-core',
}) => {
  const {
    addTestRecord,
    incrementDailyQuestions,
    incrementDailyMinutes,
    incrementDailyMasteredProblems,
    addReviewError,
    setCurrentScreen,
    openChat,
  } = useReview();

  // Screen phases: 'config' -> 'active' -> 'results'
  const [phase, setPhase] = useState<'config' | 'active' | 'results'>('config');

  // Selected challenge configuration
  const [selectedSetId, setSelectedSetId] = useState<string>(initialSetId);
  const [timeLimitOption, setTimeLimitOption] = useState<number>(150); // seconds

  // Active quiz state
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(150);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchpadText, setScratchpadText] = useState<string>('');
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Performance logging feedback
  const [hasLoggedResult, setHasLoggedResult] = useState<boolean>(false);
  const [loggedErrors, setLoggedErrors] = useState<Record<string, boolean>>({});

  // Active challenge set
  const currentSet =
    ALGEBRA_TIMED_CHALLENGE_SETS.find((s) => s.id === selectedSetId) ||
    ALGEBRA_TIMED_CHALLENGE_SETS[0];

  const currentQuestion = currentSet.questions[currentIdx];

  // Sync initialSetId if changed from parent
  useEffect(() => {
    if (initialSetId) {
      setSelectedSetId(initialSetId);
      const targetSet = ALGEBRA_TIMED_CHALLENGE_SETS.find((s) => s.id === initialSetId);
      if (targetSet) {
        setTimeLimitOption(targetSet.defaultTimeSeconds);
      }
    }
  }, [initialSetId]);

  // Reset challenge
  const handleResetToConfig = () => {
    setPhase('config');
    setCurrentIdx(0);
    setUserAnswers({});
    setTimeElapsed(0);
    setTimeRemaining(timeLimitOption);
    setIsPaused(false);
    setHasLoggedResult(false);
    setLoggedErrors({});
    setExpandedSolutions({});
    setScratchpadText('');
  };

  // Start challenge
  const handleStartChallenge = () => {
    setCurrentIdx(0);
    setUserAnswers({});
    setTimeElapsed(0);
    setTimeRemaining(timeLimitOption);
    setIsPaused(false);
    setHasLoggedResult(false);
    setLoggedErrors({});
    setExpandedSolutions({});
    setPhase('active');
  };

  // Timer effect
  useEffect(() => {
    if (phase !== 'active' || isPaused) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinishChallenge();
          return 0;
        }
        return prev - 1;
      });
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isPaused, userAnswers]);

  // Select an option
  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    if (phase !== 'active') return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  // Next / Prev question
  const handleNext = () => {
    if (currentIdx < currentSet.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      handleFinishChallenge();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  // Finish challenge and log to performance dashboard
  const handleFinishChallenge = () => {
    setPhase('results');
    playPomodoroChime('work-complete');

    // Calculate score
    const correctCount = currentSet.questions.filter(
      (q) => userAnswers[q.id] === q.correctOptionId
    ).length;

    const totalQuestions = currentSet.questions.length;
    const timeSpentMins = Math.max(1, Math.round(timeElapsed / 60));

    // Log to Dashboard through TestRecord
    const uniqueTopics = Array.from(new Set(currentSet.questions.map((q) => q.subtopicId)));

    addTestRecord({
      subjectId: 'subj-math-algebra',
      testType: 'Timed Challenge',
      date: new Date().toISOString().split('T')[0],
      questions: totalQuestions,
      correct: correctCount,
      incorrect: totalQuestions - correctCount,
      unanswered: totalQuestions - Object.keys(userAnswers).length,
      timeMinutes: timeSpentMins,
      topicIds: uniqueTopics,
      notes: `Algebra Timed Challenge (${currentSet.title}): ${correctCount}/${totalQuestions} solved in ${formatTime(timeElapsed)} (target pace: ${formatTime(timeLimitOption)}).`,
    });

    // Increment daily target counters for dashboard
    incrementDailyQuestions(totalQuestions);
    incrementDailyMinutes(timeSpentMins);
    incrementDailyMasteredProblems(correctCount);

    setHasLoggedResult(true);
  };

  // Log single missed error to ReviewError log
  const handleLogError = (question: TimedChallengeQuestion) => {
    if (loggedErrors[question.id]) return;

    addReviewError({
      topicId: question.subtopicId,
      topicName: question.topicName,
      subjectId: 'subj-math-algebra',
      category: 'Sign / algebra errors',
      description: `Timed Challenge Error on ${question.levelDifficulty}: ${question.prompt} ${question.boardExamTrap}`,
      solutionOrKeyFormula: question.stepByStepSolution[0] || question.casioShortcut,
    });

    setLoggedErrors((prev) => ({
      ...prev,
      [question.id]: true,
    }));
  };

  // Helper: format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Score statistics
  const correctCount = currentSet.questions.filter(
    (q) => userAnswers[q.id] === q.correctOptionId
  ).length;
  const scorePercent = Math.round((correctCount / currentSet.questions.length) * 100);

  // Timer urgency color
  const timerPercentage = (timeRemaining / timeLimitOption) * 100;
  const isUrgent = timeRemaining <= 30 && timeRemaining > 10;
  const isCritical = timeRemaining <= 10;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Top Modal Header */}
        <div className="px-5 py-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 font-black shadow-xs">
              <AppArtwork name="timer" inline className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-amber-300">
                  Timed Challenge Mode
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/10">
                  5 Increasing Difficulty Levels
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight mt-0.5">
                {currentSet.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {phase === 'active' && (
              <div
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-xs sm:text-sm font-black transition-all ${
                  isCritical
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse ring-2 ring-rose-400/50'
                    : isUrgent
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/10 border-white/20 text-white'
                }`}
              >
                <AppArtwork name="timer" inline className="w-4 h-4" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PHASE 1: CONFIGURATION & SET SELECTION */}
        {/* ========================================================= */}
        {phase === 'config' && (
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
            {/* Overview Banner */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-5 border border-blue-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                    <AppArtwork name="lightning" inline className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Speed, Accuracy & Board Licensure Resilience</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Solve 5 Expressions Under Exam Conditions
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    You are given a set time limit to solve 5 algebraic expressions of increasing complexity (Level 1 Foundation through Level 5 Board Exam Trap). When completed, your score, time pace, and accuracy are automatically recorded to your <strong>Performance Dashboard</strong> and <strong>ECE Tests Log</strong>.
                  </p>
                </div>

                <div className="bg-white/90 backdrop-blur-xs p-3.5 rounded-xl border border-blue-200 text-xs text-slate-700 space-y-1.5 shrink-0 sm:max-w-xs shadow-2xs">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Automatic Performance Logging:
                  </span>
                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>• Generates ECE Test Record</div>
                    <div>• Updates Daily Target Progress</div>
                    <div>• Identifies High-Risk Traps for Error Log</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Select Challenge Set */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                1. Select Challenge Set:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {ALGEBRA_TIMED_CHALLENGE_SETS.map((set) => {
                  const isSelected = selectedSetId === set.id;
                  return (
                    <button
                      key={set.id}
                      type="button"
                      onClick={() => {
                        setSelectedSetId(set.id);
                        setTimeLimitOption(set.defaultTimeSeconds);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {set.badge}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            5 Questions
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug">
                          {set.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {set.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="text-slate-400">Default Pace:</span>
                        <strong className="font-mono text-slate-900">
                          {formatTime(set.defaultTimeSeconds)} ({Math.round(set.defaultTimeSeconds / 5)}s/q)
                        </strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Pacing & Time Limit */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                2. Select Challenge Time Limit:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    seconds: 90,
                    label: 'Sprint Mode (90 sec)',
                    pace: '18 sec / question',
                    tag: 'High Pressure',
                    color: 'text-rose-600',
                  },
                  {
                    seconds: 150,
                    label: 'Standard Board Pace (2.5 min)',
                    pace: '30 sec / question',
                    tag: 'Recommended',
                    color: 'text-blue-600',
                  },
                  {
                    seconds: 240,
                    label: 'Deliberate Practice (4.0 min)',
                    pace: '48 sec / question',
                    tag: 'Foundational',
                    color: 'text-emerald-600',
                  },
                ].map((option) => {
                  const isSelected = timeLimitOption === option.seconds;
                  return (
                    <button
                      key={option.seconds}
                      type="button"
                      onClick={() => setTimeLimitOption(option.seconds)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {option.label}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {option.tag}
                        </span>
                      </div>
                      <div className={`text-xs font-semibold ${option.color}`}>
                        {option.pace}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Breakdown Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                5-Level Progression Structure in this Sprint:
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {currentSet.questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1"
                  >
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] border ${q.difficultyColor}`}
                    >
                      {q.levelBadge}
                    </span>
                    <div className="font-bold text-slate-800 text-[11px] truncate">
                      {q.levelDifficulty.split(':')[1]}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {q.topicName}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartChallenge}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Begin Timed Challenge ({formatTime(timeLimitOption)})</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 2: ACTIVE TIMED CHALLENGE */}
        {/* ========================================================= */}
        {phase === 'active' && currentQuestion && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Countdown Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 overflow-hidden shrink-0">
              <div
                className={`h-full transition-all duration-1000 ${
                  isCritical
                    ? 'bg-rose-500'
                    : isUrgent
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.max(0, timerPercentage)}%` }}
              />
            </div>

            {/* Stepper & Controls Subheader */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 shrink-0 flex-wrap">
              {/* Question Stepper */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {currentSet.questions.map((q, idx) => {
                  const isCurrent = currentIdx === idx;
                  const isAnswered = !!userAnswers[q.id];
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{q.levelBadge}</span>
                      {isAnswered && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Controls: Pause, Scratchpad, Pacing */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowScratchpad(!showScratchpad)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    showScratchpad
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AppArtwork name="exam" inline className="w-3.5 h-3.5" />
                  <span>Scratchpad</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isPaused
                      ? 'bg-amber-100 border-amber-300 text-amber-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-slate-600" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleFinishChallenge}
                  className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Finish
                </button>
              </div>
            </div>

            {/* Paused Overlay */}
            {isPaused ? (
              <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/90 text-center">
                <div className="max-w-md space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <Pause className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Challenge Paused</h3>
                  <p className="text-xs text-slate-500">
                    The timer is stopped. Click Resume whenever you are ready to continue.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPaused(false)}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                  >
                    Resume Challenge
                  </button>
                </div>
              </div>
            ) : (
              /* Question Body & Options */
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
                {/* Level and Topic Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${currentQuestion.difficultyColor}`}
                    >
                      {currentQuestion.levelDifficulty}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Topic: {currentQuestion.topicName}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    Question {currentIdx + 1} of {currentSet.questions.length}
                  </span>
                </div>

                {/* Prompt */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {currentQuestion.prompt}
                </h3>

                {/* Mathematical Expression display */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center font-serif text-slate-900 text-base sm:text-xl shadow-2xs">
                  <MathFormula formula={`$$${currentQuestion.expressionLatex}$$`} />
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = userAnswers[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 text-blue-900 font-bold shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="text-sm font-medium">
                            {opt.latex ? (
                              <MathFormula formula={`$${opt.latex}$`} />
                            ) : (
                              opt.text
                            )}
                          </span>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Scratchpad (Collapsible) */}
                {showScratchpad && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>Quick Scratchpad & Intermediate Work</span>
                      <span className="text-[10px] text-amber-700">
                        Type numbers or notes here
                      </span>
                    </div>
                    <textarea
                      value={scratchpadText}
                      onChange={(e) => setScratchpadText(e.target.value)}
                      placeholder="Calculate steps, e.g.: 4 - 9 = -5, -8 - (-5) = -3..."
                      rows={2}
                      className="w-full text-xs font-mono p-2.5 rounded-xl border border-amber-200 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Active Footer Navigation */}
            <div className="px-5 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Previous
              </button>

              <div className="text-xs font-medium text-slate-500">
                {Object.keys(userAnswers).length} of {currentSet.questions.length} answered
              </div>

              {currentIdx === currentSet.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleFinishChallenge}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                >
                  <span>Submit & Log Results</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>Next Expression</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 3: RESULTS & DASHBOARD LOGGING CONFIRMATION */}
        {/* ========================================================= */}
        {phase === 'results' && (
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
            {/* Score & Pace Overview Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-xs ${
                      scorePercent >= 80
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : scorePercent >= 60
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {scorePercent}%
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Challenge Completed
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          scorePercent >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : scorePercent >= 60
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {scorePercent >= 80
                          ? 'Board Licensure Ready!'
                          : scorePercent >= 60
                          ? 'Passing Precision'
                          : 'Requires Trap Review'}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      {correctCount} of {currentSet.questions.length} Expressions Correct
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pacing: {formatTime(timeElapsed)} spent (
                      {Math.round(timeElapsed / currentSet.questions.length)}s average per problem)
                    </p>
                  </div>
                </div>

                {/* Performance Logging Badge */}
                {hasLoggedResult && (
                  <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 flex items-start gap-3 sm:max-w-xs shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-emerald-950 block">
                        Logged to Performance Dashboard!
                      </span>
                      <p className="text-[11px] text-emerald-800 leading-snug">
                        Created ECE Test Record, updated Daily Study Target, and logged topic mastery.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Granular Level Breakdown & Solutions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Step-by-Step Question Derivations & Board Traps:
                </h4>
                <span className="text-xs text-slate-400">
                  Click to inspect detailed derivation
                </span>
              </div>

              <div className="space-y-3">
                {currentSet.questions.map((q, idx) => {
                  const userChoice = userAnswers[q.id];
                  const isCorrect = userChoice === q.correctOptionId;
                  const isExpanded = !!expandedSolutions[q.id];
                  const isErrorLogged = !!loggedErrors[q.id];

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border transition-all ${
                        isCorrect
                          ? 'bg-emerald-50/30 border-emerald-200'
                          : 'bg-rose-50/30 border-rose-200'
                      }`}
                    >
                      {/* Accordion Row Header */}
                      <div
                        onClick={() =>
                          setExpandedSolutions((prev) => ({
                            ...prev,
                            [q.id]: !prev[q.id],
                          }))
                        }
                        className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {q.levelBadge}
                          </span>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {q.levelDifficulty}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                • {q.topicName}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 font-medium truncate mt-0.5">
                              {q.prompt}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isCorrect ? 'Correct' : `Missed (${userChoice || 'None'} vs ${q.correctOptionId})`}
                          </span>
                          <ChevronRight
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expanded Derivation Body */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 border-t border-slate-200/60 space-y-4">
                          {/* Formula representation */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-center font-serif text-slate-900 text-base">
                            <MathFormula formula={`$$${q.expressionLatex}$$`} />
                          </div>

                          {/* Derivation steps */}
                          <div className="space-y-1.5">
                            <span className="text-xs font-bold text-slate-800 block">
                              Rigorous Step-by-Step Derivation:
                            </span>
                            <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1 text-xs text-slate-700">
                              {q.stepByStepSolution.map((step, sIdx) => (
                                <div key={sIdx} className="flex items-start gap-2">
                                  <span className="text-blue-600 font-bold">•</span>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Casio shortcut and Board Exam Trap */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900">
                              <span className="font-bold block mb-0.5 flex items-center gap-1.5">
                                <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-blue-600" />
                                Casio fx-991 Keystroke Shortcut:
                              </span>
                              <span className="font-mono text-[11px] leading-relaxed">
                                {q.casioShortcut}
                              </span>
                            </div>

                            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                              <span className="font-bold block mb-0.5 flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                Licensure Exam Trap Analysis:
                              </span>
                              <span className="leading-relaxed text-[11px]">
                                {q.boardExamTrap}
                              </span>
                            </div>
                          </div>

                          {/* Option to log missed error */}
                          {!isCorrect && (
                            <div className="pt-2 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => handleLogError(q)}
                                disabled={isErrorLogged}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isErrorLogged
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                }`}
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>
                                  {isErrorLogged ? 'Added to Spaced Repetition Error Log' : 'Add to Spaced Repetition Error Log'}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Results Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setCurrentScreen('overview');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AppArtwork name="graph" inline className="w-4 h-4 text-blue-600" />
                  <span>View in Performance Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setCurrentScreen('tests');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AppArtwork name="matrix" inline className="w-4 h-4 text-emerald-600" />
                  <span>View Tests Log</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetToConfig}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AppArtwork name="cycle" inline className="w-4 h-4 text-slate-600" />
                  <span>Try Another Challenge Set</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openChat(
                      `I just completed an Algebra Timed Challenge with a score of ${scorePercent}% in ${formatTime(timeElapsed)}. Can you help me review the expressions I missed and share Casio CALC tips?`,
                      'algebra'
                    );
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AppArtwork name="star" inline className="w-4 h-4" />
                  <span>Ask AI Tutor for Remediation</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
