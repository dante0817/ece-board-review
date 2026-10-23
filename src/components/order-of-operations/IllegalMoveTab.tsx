import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import {
  ILLEGAL_MOVE_PROBLEMS,
  IllegalMoveProblem,
} from '../../data/orderOfOperationsData';
import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

export const IllegalMoveTab: React.FC = () => {
  const [selectedProblemIndex, setSelectedProblemIndex] = useState<number>(0);
  const [selectedStepByProblem, setSelectedStepByProblem] = useState<
    Record<string, number | null>
  >({});
  const [revealedByProblem, setRevealedByProblem] = useState<
    Record<string, boolean>
  >({});

  const problem: IllegalMoveProblem = ILLEGAL_MOVE_PROBLEMS[selectedProblemIndex];
  const userSelectedStep = selectedStepByProblem[problem.id] ?? null;
  const isRevealed = revealedByProblem[problem.id] ?? false;

  const handleSelectStep = (stepNumber: number) => {
    if (isRevealed) return;
    setSelectedStepByProblem((prev) => ({
      ...prev,
      [problem.id]: stepNumber,
    }));
  };

  const handleVerify = () => {
    if (userSelectedStep === null) return;
    setRevealedByProblem((prev) => ({
      ...prev,
      [problem.id]: true,
    }));
  };

  const handleResetCurrent = () => {
    setSelectedStepByProblem((prev) => ({
      ...prev,
      [problem.id]: null,
    }));
    setRevealedByProblem((prev) => ({
      ...prev,
      [problem.id]: false,
    }));
  };

  const isUserCorrect =
    isRevealed && userSelectedStep === problem.illegalStepNumber;

  return (
    <div className="space-y-6">
      {/* Exercise Overview */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-200">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Spot the Illegal Move (Diagnostic Error Detection)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              In board exams, incorrect options are carefully engineered based on common illegal algebraic transformations. Read the derivation below and tap the <strong>exact step</strong> where an illegal property or precedence rule was applied.
            </p>
          </div>
        </div>
      </div>

      {/* Problem Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {ILLEGAL_MOVE_PROBLEMS.map((prob, idx) => {
          const isCurrent = idx === selectedProblemIndex;
          const status = revealedByProblem[prob.id]
            ? selectedStepByProblem[prob.id] === prob.illegalStepNumber
              ? 'correct'
              : 'wrong'
            : 'unattempted';

          return (
            <button
              key={prob.id}
              type="button"
              onClick={() => setSelectedProblemIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                isCurrent
                  ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              <span>Case {idx + 1}: {prob.title}</span>
              {status === 'correct' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              )}
              {status === 'wrong' && (
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Diagnostic Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Derivation Analysis #{selectedProblemIndex + 1}
            </span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {problem.boardExamContext}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {problem.title}
          </h3>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-serif text-slate-800 text-sm sm:text-base">
            <MathFormula formula={`$$${problem.initialPrompt}$$`} />
          </div>
        </div>

        {/* Steps List */}
        <div className="p-5 sm:p-6 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Inspect each step below. Click the step where the illegal move occurred:
          </div>

          {problem.steps.map((step) => {
            const isSelected = userSelectedStep === step.stepNumber;
            const isThisStepIllegal = step.stepNumber === problem.illegalStepNumber;

            let stepCardStyle = 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800';
            if (isSelected && !isRevealed) {
              stepCardStyle = 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20';
            } else if (isRevealed) {
              if (isThisStepIllegal) {
                stepCardStyle = 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20';
              } else if (isSelected && !isThisStepIllegal) {
                stepCardStyle = 'bg-amber-50 border-amber-300';
              }
            }

            return (
              <div
                key={step.stepNumber}
                onClick={() => handleSelectStep(step.stepNumber)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${stepCardStyle}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {step.stepNumber}
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-serif font-bold text-slate-900">
                        <MathFormula formula={`$$${step.statement}$$`} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Claimed Reason: {step.justification}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isRevealed && isThisStepIllegal && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>ILLEGAL MOVE HERE!</span>
                      </span>
                    )}
                    {isRevealed && !isThisStepIllegal && isSelected && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-200 text-amber-900">
                        Valid Mathematical Step
                      </span>
                    )}
                    {!isRevealed && (
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-lg border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select Step'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Action Button Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-4">
            <button
              type="button"
              onClick={handleResetCurrent}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
              <span>Reset Selection</span>
            </button>

            {!isRevealed ? (
              <button
                type="button"
                onClick={handleVerify}
                disabled={userSelectedStep === null}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
              >
                Verify Diagnostic Answer
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                    isUserCorrect
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isUserCorrect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Spot on! You accurately caught the illegal move.</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Incorrect step chosen. Look at Step {problem.illegalStepNumber}.</span>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Comprehensive Explanation Breakdown */}
          {isRevealed && (
            <div className="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Violated Rule / Axiom:</span>
                <span className="font-mono text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {problem.violatedRule}
                </span>
              </div>

              <div className="text-xs leading-relaxed text-slate-700 bg-white p-3.5 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block mb-1">
                  Mathematical Correction:
                </strong>
                {problem.correctionText}
              </div>

              <div className="text-[11px] text-slate-500 italic">
                💡 Board Exam Tip: In multiple choice questions, if you accidentally apply this rule, your answer will match one of the wrong letter choices on the test paper!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
