import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React from 'react';
import { MathFormula } from '../MathFormula';
import { CASIO_COMPARISONS, CasioComparison } from '../../data/orderOfOperationsData';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

export const CasioSyntaxTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <CalculatorCompatibilityNotice/>
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950">
                <AppArtwork name="calculator" inline className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) PLUS / fx-991CW Syntax Simulator
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Precedence & Keystroke Traps in Board Calculators
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              In the PRC ECE Licensure Exam, the scientific calculator is your primary weapon. However, standard calculators strictly follow internal algebraic logic (VPAM / Natural Display). A missing set of parentheses can silently corrupt multi-step calculations by an order of magnitude.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-xs text-slate-200 shrink-0 max-w-xs">
            <span className="font-bold text-amber-400 block mb-1">
              Golden Calcu-Rule:
            </span>
            Always enclose multi-term denominators in brackets, or use the dedicated fraction key <strong>[■/■]</strong> instead of the linear division key <strong>[÷]</strong>.
          </div>
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="space-y-4">
        {CASIO_COMPARISONS.map((comp, idx) => (
          <div
            key={comp.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 transition-all hover:border-blue-300"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Case #{idx + 1}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {comp.conceptName}
                </h3>
              </div>

              <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-sm font-serif">
                <MathFormula formula={`$$${comp.mathFormula}$$`} />
              </div>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Naive Input (Wrong) */}
              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Naive Input (Common Board Slip)</span>
                </div>
                <div className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-rose-200 text-rose-900 break-all">
                  {comp.naiveInput}
                </div>
                <div className="text-xs text-rose-700 font-medium">
                  Result:{' '}
                  <strong className="font-mono text-rose-950 font-bold">
                    {comp.naiveResult}
                  </strong>
                </div>
              </div>

              {/* Correct Casio Input */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Correct Keystroke Sequence</span>
                </div>
                <div className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-emerald-200 text-emerald-900 break-all">
                  {comp.correctCasioInput}
                </div>
                <div className="text-xs text-emerald-700 font-medium">
                  Result:{' '}
                  <strong className="font-mono text-emerald-950 font-bold">
                    {comp.correctResult}
                  </strong>
                </div>
              </div>
            </div>

            {/* Explanatory Note */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Why this happens: </strong>
              {comp.explanation}
              {comp.modelDifferenceNote && (
                <div className="mt-1.5 text-blue-700 font-medium flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>{comp.modelDifferenceNote}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
