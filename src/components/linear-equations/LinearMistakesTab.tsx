import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { LINEAR_MISTAKES_DATA, LinearMistakeItem } from './linearMistakesData';
import { MathFormula } from '../MathFormula';
import { AlertTriangle, CheckCircle2, Check } from 'lucide-react';

interface MistakesTabProps {
  onTrySimilar: (similarProblemId: string) => void;
}

export const LinearMistakesTab: React.FC<MistakesTabProps> = ({ onTrySimilar }) => {
  const [resolvedIds, setResolvedIds] = useState<number[]>([]);

  const toggleResolved = (id: number) => {
    setResolvedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const unresolvedCount = LINEAR_MISTAKES_DATA.length - resolvedIds.length;

  return (
    <div className="space-y-6">
      <CalculatorCompatibilityNotice/>
      {/* Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">
              High-Frequency Board Traps & Error Log
            </h3>
            <p className="text-xs text-stone-500">
              Exam traps that cause 40%+ of examinee mark deductions in linear equations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-lg bg-stone-100 font-semibold text-stone-700">
            {unresolvedCount === 0 ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> All Traps Mastered
              </span>
            ) : (
              `${unresolvedCount} traps to review`
            )}
          </span>
        </div>
      </div>

      {/* Mistake Items */}
      <div className="space-y-5">
        {LINEAR_MISTAKES_DATA.map((item) => {
          const isResolved = resolvedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`bg-white border rounded-2xl p-6 shadow-xs space-y-4 transition-all ${
                isResolved
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-stone-200'
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-xs font-semibold text-stone-700">
                    {item.subskill}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {item.date}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => toggleResolved(item.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {isResolved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Resolved</span>
                      </>
                    ) : (
                      <span>Mark as Resolved</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onTrySimilar(item.similarProblemId)}
                    className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <AppArtwork name="star" inline className="w-3 h-3 text-blue-200" />
                    <span>Try Similar Problem</span>
                  </button>
                </div>
              </div>

              {/* Problem & Given Comparison */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-stone-800">{item.problemText}</p>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl overflow-x-auto text-center font-mono">
                  <MathFormula math={item.problemLatex} block />
                </div>
              </div>

              {/* Your Answer vs Correct Answer Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <span className="font-bold text-rose-900 block">Typical Error / Trap:</span>
                  <div className="font-mono text-rose-800">
                    <MathFormula math={item.yourAnswerLatex} inline />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-900 block">Board Exam Correct Answer:</span>
                  <div className="font-mono text-emerald-800 font-bold">
                    <MathFormula math={item.correctAnswerLatex} inline />
                  </div>
                </div>
              </div>

              {/* Why It Happened & Fix */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                <div>
                  <strong className="text-stone-900">What went wrong:</strong>
                  <p className="text-stone-700 mt-0.5 leading-relaxed">{item.whatWentWrong}</p>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex items-start gap-2 text-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Board Warning:</strong> {item.examTrapWarning}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-stone-700 font-mono text-[11px] pt-1">
                  <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    <strong>Casio Verification:</strong> {item.calculatorFix}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
