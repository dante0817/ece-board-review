import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { SimilarLinearProblem } from './linearSimilarProblemsData';
import { MathFormula } from '../MathFormula';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface SimilarProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: SimilarLinearProblem | null;
  onMarkResolved?: (problemId: string) => void;
}

export const LinearSimilarProblemModal: React.FC<SimilarProblemModalProps> = ({
  isOpen,
  onClose,
  problem,
  onMarkResolved,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDerivation, setShowDerivation] = useState(false);

  if (!isOpen || !problem) return null;

  const isCorrect = selectedOption === problem.correctOptionId;

  const handleReset = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowDerivation(false);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    if (selectedOption === problem.correctOptionId && onMarkResolved) {
      onMarkResolved(problem.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider">
                Similar Practice Drill
              </span>
              <span className="text-xs text-stone-500 font-medium">
                Targeting: {problem.subskill}
              </span>
            </div>
            <h3 className="text-lg font-bold text-stone-900 mt-1">
              Reinforce: {problem.sourceTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-sm font-mono p-1"
          >
            ✕
          </button>
        </div>

        {/* Problem Statement */}
        <div className="py-4 space-y-3">
          <p className="text-sm font-medium text-stone-800">{problem.question}</p>
          {problem.latexEquation && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl overflow-x-auto text-center">
              <MathFormula math={problem.latexEquation} block />
            </div>
          )}

          {/* Multiple Choice Options */}
          <div className="space-y-2 pt-2">
            {problem.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              const isAnswerCorrect = opt.id === problem.correctOptionId;

              let btnStyle = 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200';
              if (isSelected) {
                btnStyle = 'bg-blue-50 text-blue-900 border-blue-400 ring-2 ring-blue-300';
              }
              if (isSubmitted) {
                if (isAnswerCorrect) {
                  btnStyle = 'bg-emerald-50 text-emerald-900 border-emerald-500 ring-2 ring-emerald-300';
                } else if (isSelected && !isAnswerCorrect) {
                  btnStyle = 'bg-rose-50 text-rose-900 border-rose-400';
                }
              }

              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full p-3 rounded-xl border text-left text-sm font-medium flex items-center justify-between transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white border border-current text-xs font-bold flex items-center justify-center shrink-0">
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                  {isSubmitted && isAnswerCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                  {isSubmitted && isSelected && !isAnswerCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Area */}
        {isSubmitted && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 mb-4 ${
              isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Concept Solidified! Correct Answer.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Not quite. Review the step-by-step logic below:</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">{problem.explanation}</p>

            {problem.casioCheck && (
              <div className="pt-1.5 flex items-center gap-1.5 text-stone-700 font-mono text-[11px]">
                <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Casio Check: {problem.casioCheck}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowDerivation(!showDerivation)}
              className="text-blue-700 underline font-semibold text-[11px] block mt-2"
            >
              {showDerivation ? 'Hide' : 'Show'} Step-by-Step Derivation
            </button>

            {showDerivation && (
              <ul className="list-disc list-inside space-y-1 text-stone-700 pt-1">
                {problem.stepByStepSolution.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-stone-100 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
          >
            <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
            <span>Reset Problem</span>
          </button>

          <div className="flex items-center gap-2">
            {!isSubmitted ? (
              <button
                type="button"
                disabled={!selectedOption}
                onClick={handleSubmit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Check Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all"
              >
                Done / Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
