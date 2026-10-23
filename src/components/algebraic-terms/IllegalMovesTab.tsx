import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { ILLEGAL_MOVES_DATA, IllegalMoveItem } from '../../data/algebraicTermsData';
import { useReview } from '../../context/ReviewContext';
import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert, Search } from 'lucide-react';

export const IllegalMovesTab: React.FC = () => {
  const { addReviewError } = useReview();
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number>(0);
  const [userFlaggedStep, setUserFlaggedStep] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [loggedErrors, setLoggedErrors] = useState<{ [scenarioId: string]: boolean }>({});

  const currentScenario: IllegalMoveItem = ILLEGAL_MOVES_DATA[selectedScenarioIndex];

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    setUserFlaggedStep(null);
    setIsRevealed(false);
  };

  const handleFlagStep = (stepName: string) => {
    setUserFlaggedStep(stepName);
    setIsRevealed(true);
  };

  const handleLogToJournal = () => {
    if (loggedErrors[currentScenario.id]) return;

    addReviewError({
      topicId: 'alg-algebraic-terms',
      topicName: 'Algebraic Expressions & Terms',
      subjectId: 'math',
      category: 'Sign / algebra errors',
      description: `Illegal Move Blunder: ${currentScenario.fallacyName} in expression "${currentScenario.title}". Root cause: ${currentScenario.rootCause}`,
      solutionOrKeyFormula: currentScenario.correctedWork,
    });

    setLoggedErrors((prev) => ({ ...prev, [currentScenario.id]: true }));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase tracking-wider">
                Forensic Analysis
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Spot the Trap
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Spot the Illegal Move: Common Examinee Blunders
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Over 40% of wrong answers on the PRC ECE board examination stem from these six specific fallacies. Spot which step breaks mathematical laws!
            </p>
          </div>

          {/* Scenario Selector Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {ILLEGAL_MOVES_DATA.map((sc, idx) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => handleSelectScenario(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedScenarioIndex === idx
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Blunder #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Forensic Challenge Workspace */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-inner space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Examinee Work Under Review
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {currentScenario.title}
              </h3>
            </div>
            <div className="text-xs text-slate-400">
              Click on the step where the illegal violation occurs:
            </div>
          </div>

          {/* Interactive Steps List */}
          <div className="space-y-3">
            {currentScenario.studentWork.map((stepItem, idx) => {
              const isSelected = userFlaggedStep === stepItem.step;
              const isIllegalStep = stepItem.isIllegal;

              let buttonStyle =
                'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200';

              if (isRevealed) {
                if (isIllegalStep) {
                  buttonStyle =
                    'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
                } else if (isSelected && !isIllegalStep) {
                  buttonStyle =
                    'bg-amber-950/80 border-amber-500 text-amber-200 ring-2 ring-amber-500/40';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleFlagStep(stepItem.step)}
                  className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${buttonStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-slate-300 font-mono text-xs font-black flex items-center justify-center shrink-0 border border-slate-700">
                      {stepItem.step}
                    </span>
                    <span className="font-mono text-base font-bold">
                      <MathFormula formula={stepItem.content} inline />
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isRevealed && isIllegalStep && (
                      <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold text-xs flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ILLEGAL MOVE HERE</span>
                      </span>
                    )}
                    {isRevealed && !isIllegalStep && (
                      <span className="text-xs text-slate-400 font-medium">Valid</span>
                    )}
                    {!isRevealed && (
                      <span className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        <Search className="w-3.5 h-3.5" />
                        <span>Flag this step</span>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Reveal & Detailed Forensic Report */}
          {isRevealed && (
            <div className="mt-5 bg-slate-800/90 rounded-2xl p-5 border border-slate-700 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Diagnostic Post-Mortem Report</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Fallacy & Root Cause */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                  <div className="font-bold text-amber-400">
                    Fallacy: {currentScenario.fallacyName}
                  </div>
                  <p className="text-slate-300 leading-relaxed font-medium">
                    {currentScenario.rootCause}
                  </p>
                </div>

                {/* Corrected Work */}
                <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800/60 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mathematically Correct Derivation:</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-emerald-100 py-1">
                    <MathFormula formula={currentScenario.correctedWork} inline />
                  </div>
                </div>
              </div>

              {/* Board Trap Impact & Error Journal Integration */}
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-300 font-bold">Examiner Trap Impact:</strong>{' '}
                    {currentScenario.boardTrapImpact}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogToJournal}
                  disabled={loggedErrors[currentScenario.id]}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer ${
                    loggedErrors[currentScenario.id]
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                  }`}
                >
                  <AppArtwork name="book" inline className="w-3.5 h-3.5" />
                  <span>
                    {loggedErrors[currentScenario.id]
                      ? 'Logged to Error Tracker'
                      : 'Log Slip to Error Journal'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
