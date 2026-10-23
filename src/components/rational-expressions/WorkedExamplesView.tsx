import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { AlertOctagon, CheckCircle2, ChevronRight, Search, ArrowRight, Check, X } from 'lucide-react';
import { MathFormula } from '../MathFormula';
import {
  WORKED_EXAMPLES,
  WorkedExampleItem,
} from './rationalWorkedExamplesData';
import { useReview } from '../../context/ReviewContext';

interface WorkedExamplesViewProps {
  onTrySimilar: (problemName: string) => void;
}

export const WorkedExamplesView: React.FC<WorkedExamplesViewProps> = ({
  onTrySimilar,
}) => {
  const { openChat } = useReview();

  // Tier filter & search query
  const [selectedTier, setSelectedTier] = useState<'all' | 'foundations' | 'advanced' | 'applications'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Step-by-step progress tracking: how many steps are currently revealed for each example
  // default first example has 2 steps revealed, others 0
  const [revealedStepsCount, setRevealedStepsCount] = useState<Record<string, number>>({
    'example-1': 4, // all revealed for first example by default
    'example-2': 1,
    'example-3': 0,
    'example-4': 0,
    'example-5': 0,
    'example-6': 0,
    'example-7': 0,
    'example-8': 0,
  });

  // Active quiz selections
  const [quickCheckAnswers, setQuickCheckAnswers] = useState<Record<string, number>>({});
  const [showQuickCheckExplanations, setShowQuickCheckExplanations] = useState<Record<string, boolean>>({});

  // Reveal handlers
  const handleRevealNextStep = (example: WorkedExampleItem) => {
    const current = revealedStepsCount[example.id] ?? 0;
    if (current < example.steps.length) {
      setRevealedStepsCount((prev) => ({ ...prev, [example.id]: current + 1 }));
    }
  };

  const handleRevealAllSteps = (example: WorkedExampleItem) => {
    setRevealedStepsCount((prev) => ({ ...prev, [example.id]: example.steps.length }));
  };

  const handleHideAllSteps = (example: WorkedExampleItem) => {
    setRevealedStepsCount((prev) => ({ ...prev, [example.id]: 0 }));
  };

  const handleSelectQuiz = (exampleId: string, optionIndex: number) => {
    setQuickCheckAnswers((prev) => ({ ...prev, [exampleId]: optionIndex }));
    setShowQuickCheckExplanations((prev) => ({ ...prev, [exampleId]: true }));
  };

  // Filtered examples
  const filteredExamples = useMemo(() => {
    return WORKED_EXAMPLES.filter((item) => {
      const matchesTier = selectedTier === 'all' || item.tier === selectedTier;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.prcContext.toLowerCase().includes(q) ||
        item.problemStatement.toLowerCase().includes(q) ||
        item.steps.some((s) => s.details.toLowerCase().includes(q) || s.title.toLowerCase().includes(q));
      return matchesTier && matchesSearch;
    });
  }, [selectedTier, searchQuery]);

  return (
    <div className="space-y-5">
      <CalculatorCompatibilityNotice/>
      {/* Top Banner Overview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800">
                Step-by-Step Mastery
              </span>
              <span className="text-xs text-slate-500 font-medium">
                8 PRC Board Exam Standard Problems
              </span>
            </div>
            <h3 className="font-black text-slate-900 text-lg">
              Comprehensive Worked Solutions &amp; Speed Hacks
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1 max-w-3xl">
              Work through complete algebraic solutions step-by-step. Use the &quot;Reveal Next Step&quot; button to test your own line-by-line derivation before viewing the solution, inspect PRC board examiner traps, and study the Casio fx-991 calculator hacks to verify in seconds.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Exam Strategy</div>
              <div className="text-xs font-black text-slate-900">Target: 90s / Problem</div>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-left">
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Casio CALC Hack</div>
              <div className="text-xs font-black text-emerald-950">15s Direct Match</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Tier Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedTier('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTier === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Examples ({WORKED_EXAMPLES.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier('foundations')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTier === 'foundations'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Core Operations (3)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier('advanced')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTier === 'advanced'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Advanced &amp; Circuits (3)
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier('applications')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedTier === 'applications'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Inequalities &amp; Word Problems (2)
          </button>
        </div>

        {/* Search */}
        <div className="relative md:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problems, tricks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Examples List */}
      <div className="space-y-6">
        {filteredExamples.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No worked examples found for &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedTier('all');
              }}
              className="mt-3 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredExamples.map((example) => {
            const revealedCount = revealedStepsCount[example.id] ?? 0;
            const totalSteps = example.steps.length;
            const isFullyRevealed = revealedCount >= totalSteps;
            const isPartiallyRevealed = revealedCount > 0 && !isFullyRevealed;
            const selectedQuizAnswer = quickCheckAnswers[example.id];
            const showQuizExplanation = showQuickCheckExplanations[example.id];

            return (
              <div
                key={example.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 transition-all hover:border-slate-300"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {example.number}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {example.title}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${example.difficultyColor}`}>
                        {example.difficulty}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {example.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {example.prcContext}
                    </div>
                  </div>

                  {/* Top Right Quick Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onTrySimilar(example.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-blue-200/80 cursor-pointer shadow-2xs"
                    >
                      <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>Try Similar Problem</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openChat(example.aiPrompt.prompt, example.aiPrompt.roleId)}
                      className="p-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Ask AI Tutor about this problem"
                    >
                      <AppArtwork name="chat" inline className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Problem Statement Box */}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-slate-700">
                    {example.problemStatement}
                  </p>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-center shadow-2xs">
                    <MathFormula formula={example.displayProblem} block />
                  </div>
                  {example.domainRestrictions && (
                    <div className="text-[11px] text-slate-500 text-right">
                      Domain restrictions: <MathFormula formula={example.domainRestrictions} />
                    </div>
                  )}
                </div>

                {/* Step Reveal Control Bar */}
                <div className="p-3 bg-slate-100/70 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="text-xs font-black text-slate-800">
                      Solution Walkthrough:
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-white text-slate-600 border border-slate-200">
                      Step {revealedCount} of {totalSteps} revealed
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {revealedCount < totalSteps && (
                      <button
                        type="button"
                        onClick={() => handleRevealNextStep(example)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Reveal Next Step ({revealedCount + 1})</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isFullyRevealed ? (
                      <button
                        type="button"
                        onClick={() => handleRevealAllSteps(example)}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reveal All Steps
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleHideAllSteps(example)}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Hide Solution
                      </button>
                    )}
                  </div>
                </div>

                {/* Active Steps Container */}
                {revealedCount > 0 && (
                  <div className="space-y-3 pt-1">
                    {example.steps.slice(0, revealedCount).map((step) => (
                      <div
                        key={step.stepNumber}
                        className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 text-xs text-slate-800 space-y-2 animate-in fade-in duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-blue-950 flex items-center gap-1.5 text-xs">
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                              {step.stepNumber}
                            </span>
                            <span>{step.title}</span>
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-lg border border-blue-100 text-center shadow-2xs">
                          <MathFormula formula={step.formula} block />
                        </div>

                        <p className="text-slate-600 leading-relaxed text-xs">
                          {step.details}
                        </p>

                        {step.keyTip && (
                          <div className="p-2 bg-amber-50/80 rounded-md border border-amber-200/70 text-amber-900 text-[11px] flex items-start gap-1.5">
                            <AppArtwork name="bulb" inline className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Pro Tip:</strong> {step.keyTip}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Final Answer Banner when fully revealed */}
                    {isFullyRevealed && (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                          Final Simplified Result
                        </div>
                        <div className="text-sm font-black text-emerald-950">
                          <MathFormula formula={example.finalAnswer} block />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PRC Board Examiner Trap Alert Box */}
                <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase tracking-wider">
                    <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Board Examiner Trap Alert</span>
                  </div>
                  <div className="text-xs text-rose-900 leading-relaxed">
                    <strong className="text-rose-950 font-bold">The Error: </strong>
                    {example.examinerTrap.trap}
                  </div>
                  <div className="text-xs text-emerald-900 bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-200 leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-950 font-bold">Examiner Correction: </strong>
                      {example.examinerTrap.correction}
                    </div>
                  </div>
                </div>

                {/* Casio fx-991 Calculator Speed Hack Box */}
                {example.calculatorHack && (
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AppArtwork name="calculator" inline className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                          {example.calculatorHack.technique}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) / CW
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-200 leading-relaxed">
                      {example.calculatorHack.keystrokes}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {example.calculatorHack.explanation}
                    </p>
                  </div>
                )}

                {/* Instant Check Mini-Quiz */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-600" />
                      <span>Instant Diagnostic Practice</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Verify Your Understanding
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800">
                    {example.trySimilar.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {example.trySimilar.options.map((option, oIdx) => {
                      const isSelected = selectedQuizAnswer === oIdx;
                      const isCorrect = oIdx === example.trySimilar.correctIndex;
                      let btnClass =
                        'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/40';

                      if (isSelected) {
                        if (isCorrect) {
                          btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                        } else {
                          btnClass = 'bg-rose-50 border-rose-500 text-rose-950 font-bold';
                        }
                      } else if (showQuizExplanation && isCorrect) {
                        btnClass = 'bg-emerald-50 border-emerald-300 text-emerald-900';
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectQuiz(example.id, oIdx)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${btnClass}`}
                        >
                          <span>{option}</span>
                          {isSelected && (
                            <span>
                              {isCorrect ? (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showQuizExplanation && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-slate-900">
                        {selectedQuizAnswer === example.trySimilar.correctIndex
                          ? '✅ Correct Solution!'
                          : '❌ Review the Explanation:'}
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        {example.trySimilar.explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Footer Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onTrySimilar(example.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>Try Similar Problem</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openChat(example.aiPrompt.prompt, example.aiPrompt.roleId)}
                    className="text-xs font-bold text-slate-500 hover:text-purple-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Ask AI Tutor to derive variation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
