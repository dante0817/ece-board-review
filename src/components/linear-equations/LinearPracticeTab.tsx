import { claimLinearDailyCredit } from '../../domain/practice/linearDailyCredit';
import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { LINEAR_PRACTICE_QUESTIONS, LinearPracticeQuestion } from './linearPracticeQuestionsData';
import { MathFormula } from '../MathFormula';
import { useReview } from '../../context/ReviewContext';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, Filter } from 'lucide-react';

interface PracticeTabProps {
  initialSubskill?: string;
  autoStart?: boolean;
}

export const LinearPracticeTab: React.FC<PracticeTabProps> = ({ initialSubskill }) => {
  const { incrementDailyQuestions, incrementDailyMasteredProblems, currentDateStr } = useReview();

  const [selectedSubskill, setSelectedSubskill] = useState<string>(initialSubskill || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  const filteredQuestions = LINEAR_PRACTICE_QUESTIONS.filter((q) => {
    if (selectedSubskill !== 'all' && q.subskill !== selectedSubskill) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submittedQuestions[questionId]) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = (q: LinearPracticeQuestion) => {
    const selected = userAnswers[q.id];
    if (!selected) return;

    setSubmittedQuestions((prev) => ({ ...prev, [q.id]: true }));
    setShowExplanation((prev) => ({ ...prev, [q.id]: true }));

    // Count each question at most once during this mounted practice visit.
    // Retries still provide feedback but cannot inflate first-attempt/daily totals.
    if (typeof window!=='undefined' && claimLinearDailyCredit(window.localStorage,currentDateStr,q.id)) {
      incrementDailyQuestions(1);
      if (selected === q.correctOptionId) incrementDailyMasteredProblems(1);
    }
  };

  const handleResetQuestion = (questionId: string) => {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setSubmittedQuestions((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    setShowExplanation((prev) => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  };

  const completedCount = Object.keys(submittedQuestions).length;
  const correctCount = Object.entries(submittedQuestions).filter(([qId, submitted]) => {
    if (!submitted) return false;
    const q = LINEAR_PRACTICE_QUESTIONS.find((item) => item.id === qId);
    return q && userAnswers[qId] === q.correctOptionId;
  }).length;

  return (
    <div className="space-y-6">
      <CalculatorCompatibilityNotice/>
      {/* Top Filter and Performance Ribbon */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 font-bold text-stone-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Subskills:</span>
          </div>

          {[
            { id: 'all', label: 'All Subskills' },
            { id: 'Single Variable', label: 'Single Variable' },
            { id: '2x2 & 3x3 Systems', label: '2x2 & 3x3 Systems' },
            { id: 'Motion & Pursuit', label: 'Motion & Pursuit' },
            { id: 'Work & Pipes', label: 'Work & Pipes' },
            { id: 'Mixture & Age', label: 'Mixture & Age' },
          ].map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubskill(sub.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedSubskill === sub.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
          <div className="px-3.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs flex items-center gap-2">
            <span className="text-stone-500">Attempted:</span>
            <strong className="font-mono text-stone-900">{completedCount}</strong>
            <span className="text-stone-300">|</span>
            <span className="text-emerald-700 font-semibold">Correct:</span>
            <strong className="font-mono text-emerald-800">{correctCount}</strong>
          </div>
        </div>
      </div>

      {/* Question Cards */}
      <div className="space-y-6">
        {filteredQuestions.map((q, index) => {
          const isSubmitted = !!submittedQuestions[q.id];
          const selectedOption = userAnswers[q.id];
          const isCorrect = selectedOption === q.correctOptionId;

          return (
            <div
              key={q.id}
              className={`bg-white border rounded-2xl p-6 shadow-xs space-y-4 transition-all ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-300 ring-1 ring-emerald-300/40'
                    : 'border-rose-300 ring-1 ring-rose-300/40'
                  : 'border-stone-200'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-stone-400">
                    Q{index + 1}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                    {q.subskill}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700'
                        : q.difficulty === 'Moderate'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                {isSubmitted && (
                  <button
                    type="button"
                    onClick={() => handleResetQuestion(q.id)}
                    className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1 font-medium"
                  >
                    <AppArtwork name="cycle" inline className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>

              {/* Question Content */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-stone-900 leading-relaxed">
                  {q.question}
                </p>
                {q.latexEquation && (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl overflow-x-auto text-center font-mono">
                    <MathFormula math={q.latexEquation} block />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt) => {
                  const isSelected = selectedOption === opt.id;
                  const isAnswerCorrect = opt.id === q.correctOptionId;

                  let optClass =
                    'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200';
                  if (isSelected) {
                    optClass = 'bg-blue-50 text-blue-900 border-blue-400 ring-2 ring-blue-300';
                  }
                  if (isSubmitted) {
                    if (isAnswerCorrect) {
                      optClass =
                        'bg-emerald-50 text-emerald-950 border-emerald-500 ring-2 ring-emerald-300';
                    } else if (isSelected && !isAnswerCorrect) {
                      optClass = 'bg-rose-50 text-rose-950 border-rose-400';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${optClass}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-white border border-current font-bold text-[11px] flex items-center justify-center shrink-0">
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isSubmitted && isAnswerCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isSubmitted && isSelected && !isAnswerCorrect && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              {!isSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!selectedOption}
                    onClick={() => handleSubmit(q)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>Confirm & Check Answer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Feedback & Explanation Box */}
              {isSubmitted && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    isCorrect
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct! +1 Problem Mastered Today</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Incorrect. Review the derivation below:</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed text-stone-800">{q.explanation}</p>

                  {/* Derivation Steps */}
                  <div className="p-3 bg-white border border-stone-200 rounded-lg space-y-1 text-stone-700 font-mono text-[11px]">
                    <div className="font-bold text-stone-900 mb-1">Step Derivation:</div>
                    {q.stepByStepDerivation.map((s, idx) => (
                      <div key={idx}>
                        • {s.step}
                        {s.latex && (
                          <span className="block pl-4 mt-0.5 text-blue-900">
                            <MathFormula math={s.latex} inline />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {q.casioShortcut && (
                    <div className="flex items-center gap-1.5 text-stone-800 font-mono text-[11px]">
                      <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{q.casioShortcut}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                    <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <strong>Examiner Strategy:</strong> {q.boardExamTip}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
