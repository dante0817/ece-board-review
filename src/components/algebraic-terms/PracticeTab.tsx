import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import {
  DIAGNOSTIC_PRACTICE_QUESTIONS,
  DiagnosticQuestion,
} from '../../data/algebraicTermsData';
import { useReview } from '../../context/ReviewContext';
import { RapidSpeedDrillModal } from './RapidSpeedDrillModal';
import { CheckCircle2, XCircle, AlertTriangle, Filter, ChevronDown, ChevronUp } from 'lucide-react';

interface PracticeTabProps {
  onQuestionCompleted?: (isCorrect: boolean) => void;
}

export const PracticeTab: React.FC<PracticeTabProps> = ({ onQuestionCompleted }) => {
  const { addReviewError } = useReview();

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  // Difficulty filter
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // User answers state: questionId -> selectedOptionId
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  // Submitted status: questionId -> boolean
  const [submittedQuestions, setSubmittedQuestions] = useState<{ [qId: string]: boolean }>({});
  // Toggled solution view: questionId -> boolean
  const [expandedSolutions, setExpandedSolutions] = useState<{ [qId: string]: boolean }>({});
  // Logged to error tracker state
  const [loggedErrors, setLoggedErrors] = useState<{ [qId: string]: boolean }>({});
  // Speed drill modal state
  const [isDrillOpen, setIsDrillOpen] = useState<boolean>(false);

  const categories = [
    'All',
    'Anatomy & Degree',
    'Like Terms',
    'Multi-Variable Substitution',
    'Bracket Removal & Signs',
    'Verbal Translation',
    'Calcu-Technique (CALC)',
  ];

  const filteredQuestions = DIAGNOSTIC_PRACTICE_QUESTIONS.filter((q) => {
    const matchesCategory = selectedCategory === 'All' || q.topicCategory === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  const handleSelectOption = (qId: string, optId: string) => {
    if (submittedQuestions[qId]) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleSubmitAnswer = (q: DiagnosticQuestion) => {
    if (!userAnswers[q.id] || submittedQuestions[q.id]) return;

    setSubmittedQuestions((prev) => ({ ...prev, [q.id]: true }));
    setExpandedSolutions((prev) => ({ ...prev, [q.id]: true }));

    const isCorrect = userAnswers[q.id] === q.correctOptionId;
    if (onQuestionCompleted) {
      onQuestionCompleted(isCorrect);
    }
  };

  const handleToggleSolution = (qId: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleResetAll = () => {
    setUserAnswers({});
    setSubmittedQuestions({});
    setExpandedSolutions({});
  };

  const handleLogToJournal = (q: DiagnosticQuestion) => {
    if (loggedErrors[q.id]) return;

    addReviewError({
      topicId: 'alg-algebraic-terms',
      topicName: 'Algebraic Expressions & Terms',
      subjectId: 'math',
      category: 'Sign / algebra errors',
      description: `Practice Question #${q.index}: "${q.prompt.slice(0, 80)}...". Trap: ${q.boardTrapAnalysis}`,
      solutionOrKeyFormula: q.solutionSteps.join('; '),
    });

    setLoggedErrors((prev) => ({ ...prev, [q.id]: true }));
  };

  // Stats calculation
  const totalAnswered = Object.keys(submittedQuestions).length;
  const totalCorrect = Object.entries(submittedQuestions).filter(
    ([qId, isSub]) => isSub && userAnswers[qId] === DIAGNOSTIC_PRACTICE_QUESTIONS.find((q) => q.id === qId)?.correctOptionId
  ).length;

  const scorePercentage = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="space-y-6">
      <CalculatorCompatibilityNotice/>
      {/* 1. Header & Stats Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                PRC Diagnostic
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                10 Board-Standard Problems
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Algebraic Terms &amp; Expressions Practice Exam
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive problem set spanning anatomy, negative power traps, nested brackets, and Casio CALC shortcuts.
            </p>
          </div>

          {/* Progress stats widget & Rapid Drill Button */}
          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setIsDrillOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <AppArtwork name="flame" inline className="w-4 h-4 text-white fill-current" />
              <span>30s Rapid Drill</span>
            </button>

            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Accuracy Rate
                </div>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {totalAnswered > 0 ? `${scorePercentage}%` : '—'}
                </div>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Completed
                </div>
                <div className="text-sm font-black text-blue-600 font-mono">
                  {totalAnswered} / {DIAGNOSTIC_PRACTICE_QUESTIONS.length}
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetAll}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors ml-1 cursor-pointer"
                title="Reset Practice Exam"
              >
                <AppArtwork name="cycle" inline className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1.5">
            {['All', 'Foundation', 'Moderate', 'Advanced Board Exam'].map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Questions List */}
      <div className="space-y-5">
        {filteredQuestions.map((q) => {
          const isSubmitted = !!submittedQuestions[q.id];
          const isExpanded = !!expandedSolutions[q.id];
          const selectedOpt = userAnswers[q.id];
          const isCorrect = selectedOpt === q.correctOptionId;

          const diffBadgeColor =
            q.difficulty === 'Foundation'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
              : q.difficulty === 'Moderate'
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-purple-100 text-purple-800 border-purple-200';

          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                    {q.index}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {q.boardExamSource}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-500">
                    {q.topicCategory}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${diffBadgeColor}`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                    <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
                    {q.estimatedSeconds}s
                  </span>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="space-y-2">
                <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {q.prompt}
                </p>
                {q.expressionLatex && (
                  <div className="p-3.5 rounded-xl bg-slate-900 text-white font-mono text-base sm:text-lg font-bold">
                    <MathFormula formula={q.expressionLatex} inline />
                  </div>
                )}
              </div>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {q.options.map((opt) => {
                  let optStyle = 'border-slate-200 bg-white hover:border-blue-300 text-slate-800';

                  if (selectedOpt === opt.id) {
                    optStyle = 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 font-bold';
                  }

                  if (isSubmitted) {
                    if (opt.id === q.correctOptionId) {
                      optStyle =
                        'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 text-emerald-950 font-bold';
                    } else if (selectedOpt === opt.id && !opt.isCorrect) {
                      optStyle =
                        'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/30 text-rose-950 font-bold';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      disabled={isSubmitted}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 text-xs sm:text-sm ${optStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>

                      {isSubmitted && opt.id === q.correctOptionId && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isSubmitted && selectedOpt === opt.id && !opt.isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action and Solution Toggle */}
              <div className="flex items-center justify-between pt-2">
                {!isSubmitted ? (
                  <button
                    type="button"
                    onClick={() => handleSubmitAnswer(q)}
                    disabled={!selectedOpt}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer disabled:opacity-40 transition-colors shadow-xs ml-auto"
                  >
                    Check Solution
                  </button>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Incorrect (Trap Triggered)
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleSolution(q.id)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Solution & Trap Analysis' : 'Show Solution & Trap Analysis'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded Solution Panel */}
              {isSubmitted && isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
                  {/* Step-by-step solution */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <AppArtwork name="book" inline className="w-4 h-4 text-blue-600" />
                      <span>PRC Board Step-by-Step Solution:</span>
                    </div>
                    <div className="space-y-1.5 text-slate-700 pl-5">
                      {q.solutionSteps.map((step, idx) => (
                        <div key={idx} className="leading-relaxed">
                          • {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Casio Shortcut */}
                  <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
                    <AppArtwork name="lightning" inline className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Casio Calcu-Technique:</strong>{' '}
                      {q.casioShortcut}
                    </div>
                  </div>

                  {/* Board Trap Analysis */}
                  <div className="bg-rose-50/70 rounded-xl p-3.5 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Board Trap &amp; Distractor Analysis:</strong>{' '}
                      {q.boardTrapAnalysis}
                    </div>
                  </div>

                  {/* 1-Click Error Journal Action */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleLogToJournal(q)}
                      disabled={loggedErrors[q.id]}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        loggedErrors[q.id]
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                      }`}
                    >
                      <AppArtwork name="book" inline className="w-3.5 h-3.5" />
                      <span>
                        {loggedErrors[q.id]
                          ? 'Logged to Error Tracker'
                          : 'Log Slip to Error Journal'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rapid 30s Speed Drill Modal */}
      {isDrillOpen && (
        <RapidSpeedDrillModal
          isOpen={isDrillOpen}
          onClose={() => setIsDrillOpen(false)}
        />
      )}
    </div>
  );
};
