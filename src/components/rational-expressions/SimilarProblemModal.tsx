import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, HelpCircle, ArrowRight, ChevronDown, ChevronUp, AlertTriangle, Check } from 'lucide-react';
import { MathFormula } from '../MathFormula';
import { SimilarProblemData, SimilarProblemVariation } from './similarProblemsData';
import { triggerDailyGoalConfetti } from '../../utils/confetti';
import { useReview } from '../../context/ReviewContext';

interface SimilarProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  problemData: SimilarProblemData | null;
  onMarkMistakeResolved?: (mistakeId: number) => void;
  isMistakeResolved?: boolean;
  onOpenPracticeDrills?: (subskill: string) => void;
}

export const SimilarProblemModal: React.FC<SimilarProblemModalProps> = ({
  isOpen,
  onClose,
  problemData,
  onMarkMistakeResolved,
  isMistakeResolved = false,
  onOpenPracticeDrills,
}) => {
  const { openChat } = useReview();

  const [variationIndex, setVariationIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showCalcHack, setShowCalcHack] = useState(false);
  const [showOriginalContext, setShowOriginalContext] = useState(true);
  const [showFullSolution, setShowFullSolution] = useState(false);
  const [localResolved, setLocalResolved] = useState(isMistakeResolved);

  // Sync state when modal opens or problemData changes
  useEffect(() => {
    if (isOpen) {
      setVariationIndex(0);
      setSelectedOption(null);
      setHasCheckedAnswer(false);
      setShowHint(false);
      setShowCalcHack(false);
      setShowFullSolution(false);
      setShowOriginalContext(true);
      setLocalResolved(isMistakeResolved);
    }
  }, [isOpen, problemData, isMistakeResolved]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !problemData) return null;

  const currentVariation: SimilarProblemVariation =
    problemData.variations[variationIndex] || problemData.variations[0];
  const totalVariations = problemData.variations.length;
  const isCorrect = selectedOption === currentVariation.correctIndex;

  const handleSelectOption = (index: number) => {
    if (hasCheckedAnswer && isCorrect) return;
    setSelectedOption(index);
    setHasCheckedAnswer(false);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setHasCheckedAnswer(true);
    if (selectedOption === currentVariation.correctIndex) {
      triggerDailyGoalConfetti();
    }
  };

  const handleNextVariation = () => {
    if (variationIndex + 1 < totalVariations) {
      setVariationIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasCheckedAnswer(false);
      setShowHint(false);
      setShowCalcHack(false);
      setShowFullSolution(false);
    }
  };

  const handleTryAgain = () => {
    setSelectedOption(null);
    setHasCheckedAnswer(false);
    setShowFullSolution(false);
  };

  const handleResolveMistake = () => {
    if (problemData.sourceType === 'mistake' && onMarkMistakeResolved) {
      onMarkMistakeResolved(Number(problemData.sourceId));
      setLocalResolved(true);
      triggerDailyGoalConfetti();
    }
  };

  const handleLaunchPracticeTab = () => {
    onClose();
    if (onOpenPracticeDrills) {
      onOpenPracticeDrills(problemData.subskill);
    }
  };

  const isFromMistake = problemData.sourceType === 'mistake';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="similar-problem-title"
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 border ${
                  isFromMistake
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <AppArtwork name="lightning" inline className="w-3 h-3 text-amber-500" />
                <span>{isFromMistake ? 'Mistake Remediation Drill' : 'Targeted Concept Practice'}</span>
              </span>

              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {problemData.subskill}
              </span>

              {totalVariations > 1 && (
                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  Variation {variationIndex + 1} of {totalVariations}
                </span>
              )}
            </div>

            <h2
              id="similar-problem-title"
              className="text-base sm:text-lg font-black text-slate-900 tracking-tight"
            >
              Practice Similar Problem: {problemData.conceptTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800">
          {/* Context Card: What was missed or reviewed */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden text-xs transition-all">
            <button
              type="button"
              onClick={() => setShowOriginalContext(!showOriginalContext)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between font-bold text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {isFromMistake ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                ) : (
                  <AppArtwork name="book" inline className="w-3.5 h-3.5 text-blue-500" />
                )}
                <span>
                  {isFromMistake ? 'Original Missed Problem & Error Root Cause' : 'Original Worked Solution Reference'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <span>{showOriginalContext ? 'Hide Context' : 'Show Context'}</span>
                {showOriginalContext ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {showOriginalContext && (
              <div className="p-3.5 border-t border-slate-200/80 bg-white space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {isFromMistake ? 'Missed Problem:' : 'Reference Problem:'}
                  </span>
                  {isFromMistake && localResolved && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Marked Resolved</span>
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center font-serif text-slate-900">
                  <MathFormula formula={problemData.originalProblem.problemLatex} block />
                </div>

                {isFromMistake && problemData.originalProblem.yourAnswerLatex && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-rose-50/60 rounded-lg border border-rose-200 text-rose-950">
                      <strong className="block text-rose-700 mb-0.5">Your Previous Answer:</strong>
                      <MathFormula formula={problemData.originalProblem.yourAnswerLatex} />
                    </div>
                    <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-200 text-emerald-950">
                      <strong className="block text-emerald-700 mb-0.5">Correct Answer:</strong>
                      <MathFormula formula={problemData.originalProblem.correctAnswerLatex || ''} />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <strong className="text-slate-800">
                    {isFromMistake ? 'Why you missed this: ' : 'Examiner Trap: '}
                  </strong>
                  {problemData.originalProblem.whatWentWrongOrTrap}
                </p>
              </div>
            )}
          </div>

          {/* Active Similar Problem Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-600" />
                <span>Immediate Practice Question</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                {currentVariation.question}
              </p>

              {currentVariation.problemLatex && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center shadow-2xs">
                  <MathFormula formula={currentVariation.problemLatex} block />
                </div>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Your Answer:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {currentVariation.options.map((option, idx) => {
                  const isOptionSelected = selectedOption === idx;
                  const isCorrectOption = idx === currentVariation.correctIndex;

                  let optionStyle =
                    'bg-white border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-blue-50/30';

                  if (isOptionSelected && !hasCheckedAnswer) {
                    optionStyle = 'bg-blue-50 border-blue-500 text-blue-950 font-bold ring-1 ring-blue-500';
                  }

                  if (hasCheckedAnswer) {
                    if (isCorrectOption) {
                      optionStyle =
                        'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                    } else if (isOptionSelected && !isCorrectOption) {
                      optionStyle =
                        'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-1 ring-rose-500';
                    } else {
                      optionStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 rounded-lg font-bold text-[11px] flex items-center justify-center shrink-0 ${
                            isOptionSelected
                              ? hasCheckedAnswer && !isCorrectOption
                                ? 'bg-rose-200 text-rose-800'
                                : 'bg-blue-600 text-white'
                              : hasCheckedAnswer && isCorrectOption
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-xs sm:text-sm font-medium">
                          <MathFormula formula={option} />
                        </span>
                      </div>

                      {hasCheckedAnswer && isCorrectOption && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                      )}
                      {hasCheckedAnswer && isOptionSelected && !isCorrectOption && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Check Answer Button Bar (shown before check) */}
            {!hasCheckedAnswer && (
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                  </button>

                  {currentVariation.calculatorHack && (
                    <button
                      type="button"
                      onClick={() => setShowCalcHack(!showCalcHack)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer ml-1"
                    >
                      <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-amber-500" />
                      <span>{showCalcHack ? 'Hide Calc Hack' : 'Casio Hack'}</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleCheckAnswer}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    selectedOption !== null
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Check Answer
                </button>
              </div>
            )}

            {/* Progressive Hint Drawer */}
            {showHint && !hasCheckedAnswer && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 animate-in fade-in duration-150">
                <div className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Solving Strategy Hint:</span>
                </div>
                <p className="leading-relaxed">{currentVariation.hint}</p>
              </div>
            )}

            {/* Calculator Hack Drawer */}
            {showCalcHack && currentVariation.calculatorHack && !hasCheckedAnswer && (
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs space-y-1.5 animate-in fade-in duration-150 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentVariation.calculatorHack.technique}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) / CW</span>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-[11px] text-amber-200">
                  {currentVariation.calculatorHack.keystrokes}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {currentVariation.calculatorHack.explanation}
                </p>
              </div>
            )}

            {/* Post-Check Feedback and Explanation Section */}
            {hasCheckedAnswer && (
              <div className="space-y-3 pt-2">
                {isCorrect ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                          ✓
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-emerald-900">
                            Excellent! Concept Mastered.
                          </div>
                          <div className="text-xs text-emerald-700">
                            You avoided the trap and reached the exact reduced form.
                          </div>
                        </div>
                      </div>

                      {/* If from Mistake, allow immediate resolution */}
                      {isFromMistake && !localResolved && onMarkMistakeResolved && (
                        <button
                          type="button"
                          onClick={handleResolveMistake}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors shrink-0"
                          title="Mark this mistake resolved in your review queue"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Mistake Resolved ✓</span>
                        </button>
                      )}
                      {isFromMistake && localResolved && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Resolved!</span>
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-emerald-200 space-y-1 leading-relaxed">
                      <strong className="text-slate-900 block font-bold">Textbook Solution:</strong>
                      <p className="whitespace-pre-line">{currentVariation.explanation}</p>
                    </div>

                    {currentVariation.calculatorHack && (
                      <div className="p-2.5 bg-slate-900 text-slate-100 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-amber-300 text-[11px] block uppercase tracking-wider">
                          ⚡ Speed Hack: {currentVariation.calculatorHack.technique}
                        </span>
                        <div className="font-mono text-[11px] text-amber-200">
                          {currentVariation.calculatorHack.keystrokes}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      <div>
                        <div className="font-extrabold text-xs sm:text-sm text-rose-900">
                          Not quite! Watch for algebraic sign and factoring traps.
                        </div>
                        <div className="text-[11px] text-rose-700">
                          Review the hint or try again to build rock-solid accuracy.
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleTryAgain}
                        className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                        <span>Try Another Option</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowFullSolution(!showFullSolution)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        {showFullSolution ? 'Hide Solution' : 'View Step-by-Step Solution'}
                      </button>
                    </div>

                    {showFullSolution && (
                      <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-rose-200 space-y-1 leading-relaxed">
                        <strong className="text-slate-900 block font-bold">Step-by-Step Solution:</strong>
                        <p className="whitespace-pre-line">{currentVariation.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom navigation actions after answer checked */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openChat(problemData.aiPrompt.prompt, problemData.aiPrompt.roleId)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Ask AI Tutor for deeper breakdown"
                    >
                      <AppArtwork name="chat" inline className="w-3.5 h-3.5 text-purple-600" />
                      <span>Ask AI Tutor</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLaunchPracticeTab}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <AppArtwork name="book" inline className="w-3.5 h-3.5 text-blue-600" />
                      <span>Open Full Practice Drills</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {variationIndex + 1 < totalVariations ? (
                      <button
                        type="button"
                        onClick={handleNextVariation}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Try Another Variation</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Finish &amp; Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>PRC Board Exam Pattern Alignment</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold cursor-pointer"
          >
            Close Drill
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimilarProblemModal;
