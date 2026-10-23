import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import {
  SYNTAX_TREE_PROBLEMS,
  SyntaxTreeProblem,
  EvaluationStep,
} from '../../data/orderOfOperationsData';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SyntaxTreeTab: React.FC = () => {
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    SYNTAX_TREE_PROBLEMS[0].id
  );
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const activeProblem: SyntaxTreeProblem =
    SYNTAX_TREE_PROBLEMS.find((p) => p.id === selectedProblemId) ||
    SYNTAX_TREE_PROBLEMS[0];

  const handleSelectProblem = (id: string) => {
    setSelectedProblemId(id);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (currentStepIndex < activeProblem.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  const handleComplete = () => {
    setCurrentStepIndex(activeProblem.steps.length - 1);
  };

  const activeStep: EvaluationStep = activeProblem.steps[currentStepIndex];
  const isFinished = currentStepIndex === activeProblem.steps.length - 1;

  const getCategoryBadgeColor = (category: EvaluationStep['ruleCategory']) => {
    switch (category) {
      case 'Grouping':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Exponent':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Multiply/Divide':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Add/Subtract':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Problem Selector Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <AppArtwork name="lightning" inline className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Precedence Trap Expression:
            </span>
          </div>
          <span className="text-xs text-slate-400">
            {SYNTAX_TREE_PROBLEMS.length} Board Problems
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SYNTAX_TREE_PROBLEMS.map((prob) => {
            const isSelected = prob.id === selectedProblemId;
            return (
              <button
                key={prob.id}
                type="button"
                onClick={() => handleSelectProblem(prob.id)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-white border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      prob.difficulty === 'Hard'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {prob.difficulty}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {prob.category}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-900 line-clamp-1">
                  {prob.title}
                </div>
                <div className="mt-1.5 text-xs text-slate-600 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                  ${prob.initialExpression}$
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Reduction Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header & Target Formula */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950">
                  {activeProblem.category}
                </span>
                <span className="text-xs text-slate-300">
                  Step {currentStepIndex + 1} of {activeProblem.steps.length}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {activeProblem.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                {activeProblem.description}
              </p>
            </div>

            {/* Current Expression KaTeX Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 min-w-[220px] text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block mb-1">
                Target Expression
              </span>
              <div className="text-lg font-serif text-amber-300 py-0.5">
                <MathFormula formula={`$$${activeProblem.initialExpression}$$`} />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Step-by-Step Viewer */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Progress Timeline Dots */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
            {activeProblem.steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={step.stepNumber}
                  type="button"
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`flex-1 min-w-[80px] p-2 rounded-lg border text-left transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-50 border-blue-500 shadow-2xs'
                      : isPast
                      ? 'bg-slate-50 border-slate-300 opacity-80'
                      : 'bg-white border-dashed border-slate-200 opacity-40 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-slate-500">
                      Step {step.stepNumber}
                    </span>
                    {isPast ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    ) : null}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-800 truncate">
                    {step.ruleCategory}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Step Showcase Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getCategoryBadgeColor(
                  activeStep.ruleCategory
                )}`}
              >
                {activeStep.ruleApplied}
              </span>

              <span className="text-xs font-mono font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                Evaluating: <strong className="text-slate-800 font-bold">${activeStep.targetSubExpression}$</strong>
              </span>
            </div>

            {/* Rendered Math Formula for Current State */}
            <div className="my-4 p-4 rounded-xl bg-white border border-slate-200/80 text-center shadow-2xs">
              <div className="text-xs text-slate-400 font-medium mb-1">
                Expression State after Step {activeStep.stepNumber}:
              </div>
              <div className="text-xl sm:text-2xl font-serif text-slate-900 py-1 overflow-x-auto">
                <MathFormula formula={`$$${activeStep.expression}$$`} />
              </div>
            </div>

            {/* Step Explanation & Trap Warning */}
            <div className="space-y-3 mt-4">
              <div className="flex items-start gap-2.5 text-sm text-slate-700 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
                <AppArtwork name="book" inline className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-xs text-blue-900 mb-0.5">
                    Operational Derivation:
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {activeStep.explanation}
                  </p>
                </div>
              </div>

              {activeStep.boardTrapWarning && (
                <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-950">ECE Exam Pitfall: </span>
                    {activeStep.boardTrapWarning}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIndex === 0}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset to beginning"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {!isFinished ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Evaluation Complete (Reset)</span>
                </button>
              )}
            </div>
          </div>

          {/* Final Summary Card when finished */}
          {isFinished && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Final Evaluated Result:
                </span>
                <div className="text-xl font-bold font-serif text-emerald-950 mt-0.5">
                  <MathFormula formula={`$$${activeProblem.finalAnswer}$$`} />
                </div>
                {activeProblem.decimalEquivalent && (
                  <span className="text-xs text-emerald-700 font-mono">
                    Decimal Equivalent: {activeProblem.decimalEquivalent}
                  </span>
                )}
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-emerald-200 text-xs max-w-sm">
                <span className="font-bold text-rose-700 block mb-0.5">
                  Distractor Option Trap: {activeProblem.commonWrongAnswer}
                </span>
                <p className="text-slate-600 text-[11px]">
                  {activeProblem.wrongAnswerReason}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
