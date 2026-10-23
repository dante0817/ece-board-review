import { AppArtwork, type AppArtworkName } from '../common/AppArtwork';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MathFormula } from '../MathFormula';
import {
  QUICK_SHEET_FORMULAS,
  FORMULA_QUICK_SHEET_CATEGORIES,
  QuickSheetFormula,
} from '../../data/formulaQuickSheetData';
import { getFormulaPrompt, FormulaPromptConfig } from '../../data/formulaPromptData';
import { useReview } from '../../context/ReviewContext';
import { CheckCircle2, ChevronLeft, ChevronRight, Check, X, AlertTriangle, Filter } from 'lucide-react';

export interface FormulaPracticeModeProps {
  onExitPractice?: () => void;
  initialTarget?: 'memorized' | 'all' | 'unmemorized' | 'high-yield';
  initialCategory?: string;
}

export const FormulaPracticeMode: React.FC<FormulaPracticeModeProps> = ({
  onExitPractice,
  initialTarget = 'memorized',
  initialCategory = 'all',
}) => {
  const {
    memorizedFormulaIds,
    setFormulaMemorized,
    isFormulaMemorized,
    formulaMemorizationStats,
  } = useReview();

  // Target filter: default to 'memorized' as requested by the user
  const [deckTarget, setDeckTarget] = useState<'memorized' | 'all' | 'unmemorized' | 'high-yield'>(
    initialTarget
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Deck items computed from filters
  const baseDeck = useMemo<QuickSheetFormula[]>(() => {
    return QUICK_SHEET_FORMULAS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Target filter
      const memorized = memorizedFormulaIds.includes(item.id);
      if (deckTarget === 'memorized' && !memorized) return false;
      if (deckTarget === 'unmemorized' && memorized) return false;
      if (deckTarget === 'high-yield' && !item.highYield) return false;

      return true;
    });
  }, [selectedCategory, deckTarget, memorizedFormulaIds]);

  // Active deck with optional shuffle
  const [deck, setDeck] = useState<QuickSheetFormula[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Session results tracking
  const [sessionResults, setSessionResults] = useState<Record<string, 'correct' | 'missed'>>({});
  const [isSessionCompleted, setIsSessionCompleted] = useState<boolean>(false);

  // Initialize or re-shuffle deck when baseDeck changes or shuffle toggled
  useEffect(() => {
    let items = [...baseDeck];
    if (isShuffled) {
      items = items.sort(() => Math.random() - 0.5);
    }
    setDeck(items);
    setCurrentIndex(0);
    setIsRevealed(false);
    setShowHint(false);
    setSessionResults({});
    setIsSessionCompleted(false);
  }, [baseDeck, isShuffled]);

  const currentFormula: QuickSheetFormula | undefined = deck[currentIndex];
  const promptConfig: FormulaPromptConfig | null = currentFormula
    ? getFormulaPrompt(currentFormula.id, currentFormula.name, currentFormula.latex)
    : null;

  // Reveal toggle
  const handleToggleReveal = useCallback(() => {
    setIsRevealed((prev) => !prev);
  }, []);

  // Answer handler
  const handleRateRecall = useCallback(
    (recalled: boolean) => {
      if (!currentFormula) return;

      // Update session stats
      setSessionResults((prev) => ({
        ...prev,
        [currentFormula.id]: recalled ? 'correct' : 'missed',
      }));

      // If user recalled correctly, ensure it's marked as memorized!
      // If user forgot, mark as unmemorized so they can re-study it
      if (recalled) {
        setFormulaMemorized(currentFormula.id, true);
      } else {
        setFormulaMemorized(currentFormula.id, false);
      }

      // Advance to next card or complete
      if (currentIndex < deck.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsRevealed(false);
        setShowHint(false);
      } else {
        setIsSessionCompleted(true);
      }
    },
    [currentFormula, currentIndex, deck.length, setFormulaMemorized]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
      setShowHint(false);
    } else {
      setIsSessionCompleted(true);
    }
  }, [currentIndex, deck.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsRevealed(false);
      setShowHint(false);
    }
  }, [currentIndex]);

  const handleRestartDeck = () => {
    let items = [...baseDeck];
    if (isShuffled) {
      items = items.sort(() => Math.random() - 0.5);
    }
    setDeck(items);
    setCurrentIndex(0);
    setIsRevealed(false);
    setShowHint(false);
    setSessionResults({});
    setIsSessionCompleted(false);
  };

  // Keyboard shortcut navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleToggleReveal();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1' && isRevealed) {
        e.preventDefault();
        handleRateRecall(false);
      } else if (e.key === '2' && isRevealed) {
        e.preventDefault();
        handleRateRecall(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleReveal, handleNext, handlePrev, handleRateRecall, isRevealed]);

  // Calculate session metrics
  const sessionVerified = Object.values(sessionResults).filter((v) => v === 'correct').length;
  const sessionMissed = Object.values(sessionResults).filter((v) => v === 'missed').length;
  const sessionTotal = Object.keys(sessionResults).length;
  const sessionAccuracy = sessionTotal > 0 ? Math.round((sessionVerified / sessionTotal) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* 1. Practice Deck Controls & Target Switcher */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3.5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 app-artwork-tile">
              <AppArtwork name="star" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Formula Flashcard Recall Practice
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Active Recall Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hide the formula result, mentally derive or recall the identity, then reveal to verify.
              </p>
            </div>
          </div>

          {/* Shuffle and Exit Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsShuffled((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isShuffled
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Shuffle card order"
            >
              <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            {onExitPractice && (
              <button
                type="button"
                onClick={onExitPractice}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
              >
                Exit Practice
              </button>
            )}
          </div>
        </div>

        {/* Deck Target Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-bold mr-1">Practice Deck:</span>

            <button
              type="button"
              onClick={() => setDeckTarget('memorized')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                deckTarget === 'memorized'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Memorized Only ({formulaMemorizationStats.memorized})</span>
            </button>

            <button
              type="button"
              onClick={() => setDeckTarget('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                deckTarget === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Formulas ({formulaMemorizationStats.total})
            </button>

            <button
              type="button"
              onClick={() => setDeckTarget('unmemorized')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                deckTarget === 'unmemorized'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              To Memorize ({formulaMemorizationStats.unmemorized})
            </button>

            <button
              type="button"
              onClick={() => setDeckTarget('high-yield')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                deckTarget === 'high-yield'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <AppArtwork name="flame" inline className="w-3.5 h-3.5 text-amber-400" />
              <span>PRC High Yield</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-bold mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-blue-400" />
              <span>Category:</span>
            </span>
            {FORMULA_QUICK_SHEET_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const artwork: AppArtworkName = cat.id === 'algebra' ? 'sum'
                : cat.id === 'calculus' ? 'integral'
                : cat.id === 'physics' ? 'lightning'
                : cat.id === 'electronics' ? 'chip' : 'cards';

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <AppArtwork name={artwork} inline className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.id === 'all' ? 'All' : cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Empty State Handling (e.g. 0 memorized formulas) */}
      {deck.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center app-artwork-tile">
            <AppArtwork name="book" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-black text-slate-900">
              No formulas in the &quot;{deckTarget}&quot; deck
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {deckTarget === 'memorized'
                ? 'You have not checked off any formulas as memorized yet. Switch to all formulas to start drilling, or check off formulas in the Quick-Sheet.'
                : 'No formulas match the current category or filter criteria.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setDeckTarget('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Practice All 28 Formulas
            </button>
            <button
              type="button"
              onClick={() => {
                setDeckTarget('high-yield');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <AppArtwork name="flame" inline className="w-4 h-4 text-amber-600" />
              <span>Practice High-Yield Formulas</span>
            </button>
          </div>
        </div>
      ) : isSessionCompleted ? (
        /* 3. Session Completed Screen */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 text-center space-y-6 shadow-sm animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-600 mx-auto flex items-center justify-center shadow-xs app-artwork-tile">
            <AppArtwork name="trophy" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
              Recall Drill Completed
            </span>
            <h3 className="text-2xl font-black text-slate-900">
              Great Session! Here Is Your Recall Verification
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              You reviewed {deck.length} formulas in active recall mode. Checked formulas are saved and synced with your overall Board Readiness score.
            </p>
          </div>

          {/* Score Stats Grid */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Accuracy</div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {sessionAccuracy}%
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Verified</div>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
                {sessionVerified}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="text-[11px] font-bold text-amber-700 uppercase">Needs Drill</div>
              <div className="text-2xl font-black text-amber-700 font-mono mt-0.5">
                {sessionMissed}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleRestartDeck}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <AppArtwork name="cycle" inline className="w-4 h-4" />
              <span>Practice Deck Again</span>
            </button>

            {onExitPractice && (
              <button
                type="button"
                onClick={onExitPractice}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
              >
                Back to Reference Quick-Sheet
              </button>
            )}
          </div>
        </div>
      ) : (
        /* 4. Active Interactive Flashcard */
        currentFormula && (
          <div className="space-y-4">
            {/* Top Deck Progress Header */}
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="font-extrabold text-slate-900">
                  Card {currentIndex + 1} of {deck.length}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-700 font-bold">
                  Verified: {sessionVerified}
                </span>
                {sessionMissed > 0 && (
                  <span className="text-amber-700 font-bold">
                    Need Drill: {sessionMissed}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-32 sm:w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Flashcard Frame */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden transition-all flex flex-col min-h-[420px] justify-between">
              {/* Card Top Banner */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-slate-300">
                    {currentFormula.categoryLabel}
                  </span>
                  {currentFormula.highYield && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                      <AppArtwork name="flame" inline className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>PRC Frequent</span>
                    </span>
                  )}
                </div>

                {/* Memorization state indicator on card */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
                      isFormulaMemorized(currentFormula.id)
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {isFormulaMemorized(currentFormula.id) ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        <span>Memorized</span>
                      </>
                    ) : (
                      <span>To Memorize</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Card Core Content */}
              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center text-center space-y-5">
                {/* Question / Name Title */}
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                    Formula Recall Challenge
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    {currentFormula.name}
                  </h3>
                  {promptConfig?.question && (
                    <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto">
                      {promptConfig.question}
                    </p>
                  )}
                </div>

                {/* Question / Prompt KaTeX Box */}
                {promptConfig?.promptLatex && (
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-blue-950 font-mono text-base sm:text-lg max-w-xl mx-auto w-full overflow-x-auto shadow-2xs">
                    <MathFormula formula={promptConfig.promptLatex} block />
                  </div>
                )}

                {/* Hint Drawer */}
                {promptConfig?.hint && (
                  <div className="max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={() => setShowHint((prev) => !prev)}
                      className="text-xs text-slate-500 hover:text-amber-700 font-bold flex items-center justify-center gap-1.5 cursor-pointer mx-auto transition-colors"
                    >
                      <AppArtwork name="bulb" inline className="w-3.5 h-3.5 text-amber-500" />
                      <span>{showHint ? 'Hide Mnemonic / Hint' : 'Need a Hint / Mnemonic?'}</span>
                    </button>
                    {showHint && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium animate-fadeIn">
                        {promptConfig.hint}
                      </div>
                    )}
                  </div>
                )}

                {/* THE RESULT AREA: Hidden vs Revealed */}
                <div className="pt-2">
                  {!isRevealed ? (
                    /* Hidden Result Mask & Reveal Trigger */
                    <div className="max-w-md mx-auto space-y-2">
                      <button
                        type="button"
                        onClick={handleToggleReveal}
                        className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer group"
                      >
                        <AppArtwork name="eye" inline className="w-5 h-5 text-blue-300 group-hover:text-white transition-colors" />
                        <span>Reveal Formula Result</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20 text-slate-200">
                          Space / Enter
                        </span>
                      </button>
                      <p className="text-[11px] text-slate-400">
                        Try reciting or deriving the exact equation on paper first.
                      </p>
                    </div>
                  ) : (
                    /* Revealed Result Box */
                    <div className="space-y-4 max-w-2xl mx-auto animate-fadeIn">
                      {/* Full LaTeX Formula */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 font-mono text-base sm:text-xl overflow-x-auto shadow-xs">
                        <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1">
                          Verified Identity / Formula:
                        </div>
                        <MathFormula formula={currentFormula.latex} block />
                      </div>

                      {/* Conditions & Notes */}
                      {currentFormula.conditionsOrNotes && (
                        <div className="text-xs text-slate-600 text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <strong className="text-slate-800">Rule &amp; Conditions:</strong>{' '}
                          {currentFormula.conditionsOrNotes}
                        </div>
                      )}

                      {/* ECE Exam Key / Trap Callout */}
                      {currentFormula.eceApplicationOrTrap && (
                        <div className="text-xs text-amber-900 text-left bg-amber-50/80 p-3 rounded-xl border border-amber-200 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-amber-950 font-black">Board Trap &amp; Key:</strong>{' '}
                            {currentFormula.eceApplicationOrTrap}
                          </div>
                        </div>
                      )}

                      {/* Recall Self-Assessment Bar */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="text-xs font-bold text-slate-700 mb-3">
                          Did you recall this formula correctly?
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleRateRecall(false)}
                            className="flex-1 max-w-[200px] py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Press 1 on keyboard"
                          >
                            <X className="w-4 h-4 text-rose-500" />
                            <span>Needed Help (1)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRateRecall(true)}
                            className="flex-1 max-w-[220px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                            title="Press 2 on keyboard"
                          >
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                            <span>Recalled Correctly (2)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Navigation Toolbar */}
              <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-600 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleReveal}
                    className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    {isRevealed ? 'Hide Result' : 'Reveal Result'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>{currentIndex === deck.length - 1 ? 'Finish' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Guide */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
              <span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded border border-slate-300 font-bold">
                  Space
                </kbd>{' '}
                Reveal
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded border border-slate-300 font-bold">
                  2
                </kbd>{' '}
                Recalled
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded border border-slate-300 font-bold">
                  1
                </kbd>{' '}
                Forgot
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded border border-slate-300 font-bold">
                  ← / →
                </kbd>{' '}
                Navigate
              </span>
            </div>
          </div>
        )
      )}
    </div>
  );
};
