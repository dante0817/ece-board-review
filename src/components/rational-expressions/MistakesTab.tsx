import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { Info, Check } from 'lucide-react';
import { MathView, FormattedMathText } from '../MathView';

interface MistakesTabProps {
  onTrySimilarProblem: (subskill: string, mistakeId?: number) => void;
  resolvedIds?: number[];
  onToggleResolved?: (id: number) => void;
}

export const MistakesTab: React.FC<MistakesTabProps> = ({
  onTrySimilarProblem,
  resolvedIds: externalResolvedIds,
  onToggleResolved: externalToggleResolved,
}) => {
  const [internalResolvedIds, setInternalResolvedIds] = useState<number[]>([]);
  const resolvedIds = externalResolvedIds ?? internalResolvedIds;

  const toggleResolved = (id: number) => {
    if (externalToggleResolved) {
      externalToggleResolved(id);
    } else {
      setInternalResolvedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    }
  };

  const mistakes = [
    {
      id: 1,
      date: 'Sep 10, 2024',
      category: 'SIGN / ALGEBRA ERROR',
      subskill: 'Addition & Subtraction',
      problemLatex: '\\text{Simplify: } \\frac{x - 2}{x^2 - 4} - \\frac{3}{x + 2}',
      yourAnswerLatex: '\\frac{x - 5}{x^2 - 4}',
      correctAnswerLatex: '-\\frac{2}{x + 2}',
      whatWentWrong:
        'Negative sign was not properly distributed across numerator terms, and (x - 2)/(x² - 4) could have been simplified to 1/(x + 2) first to avoid a messy LCD calculation.',
    },
    {
      id: 2,
      date: 'Sep 8, 2024',
      category: 'METHOD ERROR',
      subskill: 'Rational Equations',
      problemLatex: '\\text{Solve for } x: \\frac{2x}{x - 3} = \\frac{6}{x - 3} + 4',
      yourAnswerLatex: 'x = 3',
      correctAnswerLatex: '\\text{No real solution } (x = 3 \\text{ is an extraneous root})',
      whatWentWrong:
        'Overlooked the domain restriction x ≠ 3. When solving algebraic steps, x = 3 was produced, but substituting it back makes the original denominators zero.',
    },
  ];

  const unresolvedCount = mistakes.length - resolvedIds.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>My Mistakes — Rational Expressions</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                unresolvedCount > 0
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {unresolvedCount} unresolved
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Error remediation log. Review root causes and re-test to prevent recurring board exam mistakes.
          </p>
        </div>
      </div>

      {/* Mistakes Cards */}
      <div className="space-y-4">
        {mistakes.map((m) => {
          const isResolved = resolvedIds.includes(m.id);

          return (
            <div
              key={m.id}
              className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all ${
                isResolved
                  ? 'border-slate-200 opacity-60 bg-slate-50/50'
                  : 'border-rose-200 shadow-xs ring-1 ring-rose-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                    {m.category}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{m.subskill}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{m.date}</span>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Problem Statement
                  </span>
                  <div className="mt-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <MathView math={m.problemLatex} block />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-rose-950">
                    <span className="font-sans font-bold text-rose-700 text-[11px] block mb-1">
                      Your Answer (Incorrect)
                    </span>
                    <div className="p-2 bg-white rounded-lg border border-rose-200 text-center">
                      <MathView math={m.yourAnswerLatex} block />
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950">
                    <span className="font-sans font-bold text-emerald-700 text-[11px] block mb-1">
                      Correct Answer
                    </span>
                    <div className="p-2 bg-white rounded-lg border border-emerald-200 text-center">
                      <MathView math={m.correctAnswerLatex} block />
                    </div>
                  </div>
                </div>

                {/* What went wrong analysis */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-500" />
                    <span>What Went Wrong</span>
                  </span>
                  <p className="leading-relaxed text-slate-600">{m.whatWentWrong}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onTrySimilarProblem(m.subskill, m.id)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200/80 cursor-pointer shadow-2xs"
                >
                  <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Try Similar Problem</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleResolved(m.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isResolved
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isResolved ? 'Marked Resolved' : 'Mark as Resolved ✓'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
