import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { BRACKET_SIMPLIFICATION_EXAMPLES, SimplificationStepExample } from '../../data/algebraicTermsData';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';

export const SimplificationTab: React.FC = () => {
  // Active example selection
  const [selectedExampleIndex, setSelectedExampleIndex] = useState<number>(0);
  const currentExample: SimplificationStepExample = BRACKET_SIMPLIFICATION_EXAMPLES[selectedExampleIndex];

  // Active step index (0 to currentExample.steps.length - 1)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const currentStep = currentExample.steps[activeStepIndex];

  const handleNextStep = () => {
    if (activeStepIndex < currentExample.steps.length - 1) {
      setActiveStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setActiveStepIndex(0);
  };

  return (
    <div className="space-y-6">
      <CalculatorCompatibilityNotice/>
      {/* 1. Master Scrubber Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase tracking-wider">
                Bracket Elimination
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Innermost-to-Outermost Rule
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Nested Bracket Removal &amp; Sign Distribution
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Follow the canonical order of nesting symbols: Parentheses ( ) → Braces {'{ }'} → Square Brackets [ ]. Watch sign flips when distributing negatives.
            </p>
          </div>

          {/* Selector */}
          <div className="flex items-center gap-2">
            {BRACKET_SIMPLIFICATION_EXAMPLES.map((ex, idx) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  setSelectedExampleIndex(idx);
                  setActiveStepIndex(0);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedExampleIndex === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Example {idx + 1} ({ex.badge})
              </button>
            ))}
          </div>
        </div>

        {/* Current State Display */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-inner space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {currentExample.title}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Step {activeStepIndex + 1} of {currentExample.steps.length}
            </span>
          </div>

          {/* Original Expression Banner */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-400 font-medium">Original Expression:</span>
            <span className="font-mono font-bold text-white text-sm sm:text-base">
              <MathFormula formula={currentExample.originalLatex} inline />
            </span>
          </div>

          {/* Current Reduced Formula */}
          <div className="bg-indigo-950/80 rounded-2xl p-5 border-2 border-indigo-500/50 shadow-md text-center space-y-2">
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              {currentStep.actionLabel}
            </div>
            <div className="font-mono text-xl sm:text-2xl lg:text-3xl font-black text-amber-300 py-2">
              <MathFormula formula={currentStep.currentLatex} inline />
            </div>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl mx-auto font-medium">
              {currentStep.explanation}
            </p>
          </div>

          {/* Scrubber Navigation Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            {/* Step Indicators */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {currentExample.steps.map((st, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveStepIndex(i)}
                  className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    activeStepIndex === i
                      ? 'bg-amber-400 text-slate-900 shadow-xs scale-110'
                      : i < activeStepIndex
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleReset}
                disabled={activeStepIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handlePrevStep}
                disabled={activeStepIndex === 0}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Step</span>
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={activeStepIndex === currentExample.steps.length - 1}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Casio Check verification note */}
        <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-emerald-950">
              Casio fx-991 CALC Equivalence Verification:
            </span>
            <p className="text-emerald-800 font-mono text-[11px] leading-relaxed">
              {currentExample.casioCheck}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Distributive Law Rule Card & Sign Flip Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <AppArtwork name="cards" inline className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-extrabold text-slate-900">
            PRC Board Distributive Sign Flip Rules
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Rule 1: Preceding Plus Sign
            </div>
            <div className="font-mono text-base font-bold text-slate-900">
              <MathFormula formula="+(a - b + c) = a - b + c" inline />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              When parentheses are preceded by a positive sign, drop the parentheses without changing any interior signs.
            </p>
          </div>

          <div className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50/60 space-y-2">
            <div className="text-xs font-bold text-rose-800 uppercase tracking-wide">
              Rule 2: Preceding Minus Sign (FLIP ALL!)
            </div>
            <div className="font-mono text-base font-bold text-rose-900">
              <MathFormula formula="-(a - b + c) = -a + b - c" inline />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every single term inside changes sign: positive becomes negative, negative becomes positive!
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Rule 3: Negative Multiplier
            </div>
            <div className="font-mono text-base font-bold text-amber-950">
              <MathFormula formula="-k(a - b) = -ka + kb" inline />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multiply magnitude <span className="font-mono">k</span> and distribute negative simultaneously: <span className="font-mono">-2(3x - 4) = -6x + 8</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
