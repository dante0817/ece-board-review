import { AppArtwork } from '../common/AppArtwork';
import { FeatureIcon } from '../common/FeatureIcon';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  FORMULA_FLASHCARDS,
  FLASHCARD_SUBJECTS,
  FormulaFlashcard,
  FlashcardSubject,
  FormulaComponent,
  FormulaDistractor,
} from '../../data/formulaFlashcardData';
import { MathFormula } from '../MathFormula';
import { useReview } from '../../context/ReviewContext';
import { playFlashcardChime } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { CheckCircle2, AlertCircle, HelpCircle, ChevronLeft, ChevronRight, Volume2, VolumeX, ArrowRight, Check, X } from 'lucide-react';

interface ComponentOption {
  id: string;
  symbol: string;
  name: string;
  unitOrType?: string;
  description: string;
  isCorrect: boolean;
  examTrap?: string;
}

export const FormulaFlashcardMode: React.FC = () => {
  const {
    flashcardSelectedSubject,
    setFlashcardSelectedSubject,
    setCurrentScreen,
    isDarkMode,
  } = useReview();

  // Active Subject Filter
  const [activeSubject, setActiveSubject] = useState<FlashcardSubject>(
    (flashcardSelectedSubject as FlashcardSubject) || 'all'
  );

  // Sync with context if updated externally
  useEffect(() => {
    if (flashcardSelectedSubject && flashcardSelectedSubject !== activeSubject) {
      setActiveSubject(flashcardSelectedSubject as FlashcardSubject);
    }
  }, [flashcardSelectedSubject]);

  // High Yield filter
  const [highYieldOnly, setHighYieldOnly] = useState<boolean>(false);

  // Filtered pool of formulas
  const filteredFormulas = useMemo(() => {
    return FORMULA_FLASHCARDS.filter((f) => {
      if (activeSubject !== 'all' && f.subject !== activeSubject) return false;
      if (highYieldOnly && !f.highYield) return false;
      return true;
    });
  }, [activeSubject, highYieldOnly]);

  // Current Card Index & Card
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentCard: FormulaFlashcard | undefined = filteredFormulas[currentIndex] || filteredFormulas[0];

  // Game state for current card
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [userScratchpad, setUserScratchpad] = useState<string>('');
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Gamification Session State
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewQueueIds, setReviewQueueIds] = useState<Set<string>>(new Set());
  const [reviewedCount, setReviewedCount] = useState<number>(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [showSessionSummary, setShowSessionSummary] = useState<boolean>(false);

  // Timer per card
  useEffect(() => {
    if (isRevealed) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRevealed, currentCard?.id]);

  // Generate randomized recall options (components + distractors)
  const recallOptions: ComponentOption[] = useMemo(() => {
    if (!currentCard) return [];

    const correct: ComponentOption[] = currentCard.components.map((c, i) => ({
      id: `c-${i}-${c.symbol}`,
      symbol: c.symbol,
      name: c.name,
      unitOrType: c.unitOrType,
      description: c.description,
      isCorrect: true,
      examTrap: c.examTrap,
    }));

    const distractors: ComponentOption[] = currentCard.distractors.map((d, i) => ({
      id: `d-${i}-${d.symbol}`,
      symbol: d.symbol,
      name: d.name,
      unitOrType: d.unitOrType,
      description: d.description,
      isCorrect: false,
    }));

    // Combined and deterministic shuffle based on card ID
    const combined = [...correct, ...distractors];
    // Seeded shuffle using card ID hash
    let hash = 0;
    for (let i = 0; i < currentCard.id.length; i++) {
      hash = (hash << 5) - hash + currentCard.id.charCodeAt(i);
      hash |= 0;
    }
    return combined.sort((a, b) => {
      const charA = (a.symbol.charCodeAt(0) * 17 + hash) % 31;
      const charB = (b.symbol.charCodeAt(0) * 17 + hash) % 31;
      return charA - charB;
    });
  }, [currentCard?.id]);

  // Reset card interaction state when card changes
  const resetCardState = useCallback(() => {
    setIsRevealed(false);
    setSelectedOptionIds([]);
    setUserScratchpad('');
    setSecondsElapsed(0);
  }, []);

  // Pick a random formula
  const pickRandomFormula = useCallback(() => {
    if (filteredFormulas.length <= 1) return;
    let nextIdx = currentIndex;
    while (nextIdx === currentIndex) {
      nextIdx = Math.floor(Math.random() * filteredFormulas.length);
    }
    setCurrentIndex(nextIdx);
    resetCardState();
    if (soundEnabled) playFlashcardChime('card-flip');
  }, [filteredFormulas.length, currentIndex, resetCardState, soundEnabled]);

  // Next / Previous Navigation
  const handleNext = useCallback(() => {
    if (currentIndex < filteredFormulas.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    resetCardState();
    if (soundEnabled) playFlashcardChime('card-flip');
  }, [currentIndex, filteredFormulas.length, resetCardState, soundEnabled]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredFormulas.length - 1);
    }
    resetCardState();
    if (soundEnabled) playFlashcardChime('card-flip');
  }, [currentIndex, filteredFormulas.length, resetCardState, soundEnabled]);

  // Toggle component selection
  const toggleOption = (id: string) => {
    if (isRevealed) return;
    if (soundEnabled) playFlashcardChime('select-chip');
    setSelectedOptionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Reveal Answer
  const handleReveal = () => {
    if (isRevealed) return;
    setIsRevealed(true);
    if (soundEnabled) playFlashcardChime('reveal');
  };

  // User Self-Rating
  const handleRate = (rating: 'perfect' | 'partial' | 'missed') => {
    if (!currentCard) return;

    setReviewedCount((prev) => prev + 1);

    if (rating === 'perfect') {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      const earnedXp = 15 + Math.min(newStreak * 2, 20);
      setTotalXp((prev) => prev + earnedXp);

      setMasteredIds((prev) => new Set(prev).add(currentCard.id));
      setReviewQueueIds((prev) => {
        const next = new Set(prev);
        next.delete(currentCard.id);
        return next;
      });

      if (soundEnabled) {
        if (newStreak > 0 && newStreak % 3 === 0) {
          playFlashcardChime('streak-bonus');
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.7 },
          });
        } else {
          playFlashcardChime('mastered');
        }
      }
    } else if (rating === 'partial') {
      setTotalXp((prev) => prev + 8);
      // Streak holds
      if (soundEnabled) playFlashcardChime('reveal');
    } else {
      // Missed
      setStreak(0);
      setReviewQueueIds((prev) => new Set(prev).add(currentCard.id));
      if (soundEnabled) playFlashcardChime('missed');
    }

    // Auto-advance to next random card after rating
    setTimeout(() => {
      pickRandomFormula();
    }, 450);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in textarea scratchpad, do not intercept alphanumeric keys
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRevealed) {
          handleReveal();
        } else {
          pickRandomFormula();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (isRevealed) {
        if (e.key === '1') {
          e.preventDefault();
          handleRate('perfect');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate('partial');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate('missed');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRevealed, handleNext, handlePrev, pickRandomFormula]);

  // Calculate component selection stats
  const selectionStats = useMemo(() => {
    if (!currentCard) return { correctSelected: 0, totalCorrect: 0, wrongSelected: 0, accuracy: 0 };
    const correctOptions = recallOptions.filter((o) => o.isCorrect);
    const selectedCorrect = selectedOptionIds.filter((id) =>
      correctOptions.some((c) => c.id === id)
    ).length;
    const selectedWrong = selectedOptionIds.filter((id) =>
      recallOptions.some((o) => o.id === id && !o.isCorrect)
    ).length;
    const accuracy =
      correctOptions.length > 0
        ? Math.round((selectedCorrect / correctOptions.length) * 100)
        : 0;

    return {
      correctSelected: selectedCorrect,
      totalCorrect: correctOptions.length,
      wrongSelected: selectedWrong,
      accuracy,
    };
  }, [currentCard, recallOptions, selectedOptionIds]);

  if (!currentCard) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No formulas matched your criteria</h2>
        <p className="text-stone-500 text-sm mb-6">
          Try resetting the subject filter or disabling the high-yield restriction.
        </p>
        <button
          onClick={() => {
            setActiveSubject('all');
            setHighYieldOnly(false);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shadow hover:bg-blue-700 transition"
        >
          Reset Filters
        </button>
      </div>
    );
  }

  const subjectBadge = FLASHCARD_SUBJECTS.find((s) => s.id === currentCard.subject);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 font-sans">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50">
              <AppArtwork name="star" inline className="w-3.5 h-3.5" />
              Formula Flashcard Game
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              PRC ECE Board Memorization Drill
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-3">
            <FeatureIcon name="flashcards" />
            Formula Component Recall
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5">
            Recall all key variables, units, and board exam traps before revealing the formula.
          </p>
        </div>

        {/* Live Gamification Metrics Bar */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Streak Counter */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-300/60 dark:border-amber-700/50">
            <AppArtwork name="flame" inline className={`w-5 h-5 ${
                streak > 0
                  ? 'text-orange-500 animate-pulse fill-orange-500'
                  : 'text-stone-400 dark:text-stone-500'
              }`} />
            <div>
              <div className="text-xs text-stone-500 dark:text-stone-400 leading-none">Streak</div>
              <div className="text-base font-bold text-stone-900 dark:text-white leading-none mt-0.5">
                {streak}{' '}
                {bestStreak > 0 && (
                  <span className="text-xs font-normal text-stone-500">/ Best {bestStreak}</span>
                )}
              </div>
            </div>
          </div>

          {/* XP Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
            <AppArtwork name="trophy" inline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-xs text-stone-500 dark:text-stone-400 leading-none">Score</div>
              <div className="text-base font-bold text-blue-700 dark:text-blue-300 leading-none mt-0.5">
                {totalXp} XP
              </div>
            </div>
          </div>

          {/* Mute/Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Mute audio' : 'Enable sound'}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Session Summary Drawer Toggle */}
          <button
            onClick={() => setShowSessionSummary((prev) => !prev)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center gap-1.5 transition"
          >
            <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
            Session ({reviewedCount})
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        {/* Subject Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
          {FLASHCARD_SUBJECTS.map((subj) => {
            const isActive = activeSubject === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => {
                  setActiveSubject(subj.id as FlashcardSubject);
                  setFlashcardSelectedSubject(subj.id as FlashcardSubject);
                  setCurrentIndex(0);
                  resetCardState();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm border border-stone-200/80 dark:border-stone-700'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <span>{subj.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2">
          {/* High Yield Only Toggle */}
          <button
            onClick={() => {
              setHighYieldOnly((prev) => !prev);
              setCurrentIndex(0);
              resetCardState();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition flex items-center gap-1.5 ${
              highYieldOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
                : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <AppArtwork name="star" inline className="w-3 h-3 text-amber-500" />
            Top High-Yield Only
          </button>

          {/* Random Pick Button */}
          <button
            onClick={pickRandomFormula}
            title="Present a random formula"
            className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 shadow-sm transition flex items-center gap-1.5"
          >
            <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
            Random Formula
          </button>
        </div>
      </div>

      {/* Main Flashcard Arena */}
      <div
        id="formula-flashcard-card"
        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-lg ${
          isRevealed
            ? 'bg-white dark:bg-stone-900 border-emerald-300 dark:border-emerald-800/60 shadow-emerald-500/5'
            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
        }`}
      >
        {/* Card Header Strip */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800/80 flex flex-wrap items-center justify-between gap-3 bg-stone-50/50 dark:bg-stone-900/50">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                subjectBadge?.badgeColor || 'bg-stone-800 text-white'
              }`}
            >
              {currentCard.subjectName}
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {currentCard.category}
            </span>
            {currentCard.highYield && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/40">
                ★ {currentCard.boardRelevance} Board Exam
              </span>
            )}
          </div>

          {/* Card Sequence Indicator & Navigation */}
          <div className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
            <span className="font-mono">
              {currentIndex + 1} of {filteredFormulas.length}
            </span>
            <div className="flex items-center ml-2 border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
              <button
                onClick={handlePrev}
                title="Previous formula (Left Arrow)"
                className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNext}
                title="Next formula (Right Arrow)"
                className="p-1 hover:bg-stone-200 dark:hover:bg-stone-800 transition border-l border-stone-200 dark:border-stone-700"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8">
          {/* Formula Title */}
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              {currentCard.name}
            </h2>
            <p className="text-sm font-medium text-stone-600 dark:text-stone-300 mt-1">
              {currentCard.recallQuestion}
            </p>
          </div>

          {/* Formula Display Area */}
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200/80 dark:border-stone-800 text-center relative">
            {!isRevealed ? (
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Prompt Structure with Missing Components
                </div>
                <div className="py-2 overflow-x-auto text-stone-800 dark:text-stone-200 font-serif">
                  <MathFormula formula={currentCard.promptLatex} block />
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-medium">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Recall all active variables and identify the equation components below</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Official Board Formula Solution
                </div>
                <div className="py-3 overflow-x-auto text-stone-900 dark:text-stone-100 text-lg sm:text-xl">
                  <MathFormula formula={currentCard.latex} block />
                </div>
                {currentCard.conditionsOrNotes && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                    {currentCard.conditionsOrNotes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Component Recall Challenge Area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AppArtwork name="brain" inline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {!isRevealed
                    ? 'Interactive Recall: Select all components in this formula'
                    : 'Recall Breakdown & Analysis'}
                </span>
              </div>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                {!isRevealed
                  ? `${selectedOptionIds.length} / ${currentCard.components.length} components selected`
                  : `${selectionStats.correctSelected} of ${selectionStats.totalCorrect} correctly identified`}
              </span>
            </div>

            {/* Component Chips Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recallOptions.map((opt) => {
                const isSelected = selectedOptionIds.includes(opt.id);

                let chipStyle =
                  'border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 hover:border-blue-300 dark:hover:border-blue-700';

                if (!isRevealed) {
                  if (isSelected) {
                    chipStyle =
                      'border-blue-500 bg-blue-50/90 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-2 ring-blue-400/30';
                  }
                } else {
                  // In Revealed state, show whether it was correct or wrong distractor
                  if (opt.isCorrect && isSelected) {
                    // Correctly selected
                    chipStyle =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200';
                  } else if (opt.isCorrect && !isSelected) {
                    // Missed component
                    chipStyle =
                      'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-dashed';
                  } else if (!opt.isCorrect && isSelected) {
                    // Wrongly selected distractor
                    chipStyle =
                      'border-red-400 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200 line-through opacity-80';
                  } else {
                    // Distractor not selected
                    chipStyle =
                      'border-stone-200 dark:border-stone-800 bg-stone-100/40 dark:bg-stone-900/40 text-stone-400 dark:text-stone-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    disabled={isRevealed}
                    className={`p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 ${chipStyle}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100 px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-700/60">
                          {opt.symbol}
                        </span>
                        <span className="text-xs font-semibold truncate">{opt.name}</span>
                      </div>
                      {opt.unitOrType && (
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          {opt.unitOrType}
                        </div>
                      )}
                      {isRevealed && opt.description && (
                        <div className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 leading-snug">
                          {opt.description}
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 mt-0.5">
                      {!isRevealed ? (
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-stone-300 dark:border-stone-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      ) : (
                        <div>
                          {opt.isCorrect && isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          )}
                          {opt.isCorrect && !isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <AlertCircle className="w-4 h-4" />
                              Missed
                            </span>
                          )}
                          {!opt.isCorrect && isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                              <X className="w-4 h-4" />
                              Distractor
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Mental Scratchpad Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowScratchpad((prev) => !prev)}
              className="text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1.5 transition"
            >
              <AppArtwork name="exam" inline className="w-3.5 h-3.5" />
              {showScratchpad ? 'Hide Mental Scratchpad' : 'Open Scratchpad to Write Formula First'}
            </button>
            {showScratchpad && (
              <div className="mt-2.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                <textarea
                  value={userScratchpad}
                  onChange={(e) => setUserScratchpad(e.target.value)}
                  placeholder="Type your recalled formula or variable names here..."
                  rows={2}
                  disabled={isRevealed}
                  className="w-full text-xs font-mono bg-transparent border-0 resize-none focus:outline-none text-stone-800 dark:text-stone-200"
                />
              </div>
            )}
          </div>

          {/* REVEAL ACTION BUTTON (Pre-Reveal) */}
          {!isRevealed ? (
            <div className="pt-2">
              <button
                id="reveal-formula-button"
                onClick={handleReveal}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <AppArtwork name="eye" inline className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Reveal Formula & Component Breakdown
                <span className="text-xs opacity-75 ml-2 py-0.5 px-2 rounded-md bg-white/20">
                  Space
                </span>
              </button>
            </div>
          ) : (
            /* REVEALED STATE: Analysis, PRC Exam Pitfalls & Self-Rating */
            <div className="space-y-6 pt-2 border-t border-stone-100 dark:border-stone-800">
              {/* PRC Board Exam Trap Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      PRC Board Exam Trap & Pitfall
                    </h4>
                    <p className="text-sm text-amber-900 dark:text-amber-200 font-medium mt-0.5">
                      {currentCard.boardTrap}
                    </p>
                  </div>
                </div>
              </div>

              {/* Complete Component Itemized Breakdown Table */}
              <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-stone-100/70 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                    Component Reference & Unit Dimensions
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {currentCard.components.length} components
                  </span>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {currentCard.components.map((comp, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50/50 dark:hover:bg-stone-800/20"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-sm font-bold">
                          {comp.symbol}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                            {comp.name}
                          </div>
                          <div className="text-xs text-stone-500 dark:text-stone-400">
                            {comp.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-left sm:text-right flex flex-col sm:items-end">
                        <span className="text-xs font-mono text-stone-600 dark:text-stone-300 font-medium">
                          {comp.unitOrType || 'Standard Dimension'}
                        </span>
                        {comp.examTrap && (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            Trap: {comp.examTrap}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Self-Rating & Next Flow */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    How well did you recall this formula?
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Your self-assessment updates your mastery streak and spaced review queue.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleRate('perfect')}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow transition flex flex-col items-center gap-1 group"
                  >
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Recalled Perfectly</span>
                    </div>
                    <span className="text-[11px] opacity-80 font-normal">+15 XP [Press 1]</span>
                  </button>

                  <button
                    onClick={() => handleRate('partial')}
                    className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow transition flex flex-col items-center gap-1 group"
                  >
                    <div className="flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Partially Recalled</span>
                    </div>
                    <span className="text-[11px] opacity-80 font-normal">+8 XP [Press 2]</span>
                  </button>

                  <button
                    onClick={() => handleRate('missed')}
                    className="py-3 px-4 rounded-xl bg-stone-700 hover:bg-stone-800 text-white font-semibold text-sm shadow transition flex flex-col items-center gap-1 group"
                  >
                    <div className="flex items-center gap-1.5">
                      <AppArtwork name="cycle" inline className="w-4 h-4" />
                      <span>Missed / Need Practice</span>
                    </div>
                    <span className="text-[11px] opacity-80 font-normal">Add to Review [Press 3]</span>
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <button
                    onClick={pickRandomFormula}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                    Skip to another random formula
                  </button>
                  <button
                    onClick={handleNext}
                    className="text-xs font-bold text-stone-700 dark:text-stone-300 hover:underline flex items-center gap-1"
                  >
                    <span>Next Formula</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Progress & Queue Drawer Modal */}
      {showSessionSummary && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <AppArtwork name="trophy" inline className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Flashcard Session Progress
                </h3>
              </div>
              <button
                onClick={() => setShowSessionSummary(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5 text-center">
              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                <div className="text-xl font-bold text-stone-900 dark:text-white">
                  {reviewedCount}
                </div>
                <div className="text-xs text-stone-500">Reviewed</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {masteredIds.size}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400">Mastered</div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {reviewQueueIds.size}
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-400">To Review</div>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                Formulas in Current Subject
              </div>
              {filteredFormulas.map((f, i) => {
                const isMastered = masteredIds.has(f.id);
                const isQueued = reviewQueueIds.has(f.id);
                const isCurrent = i === currentIndex;
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setCurrentIndex(i);
                      resetCardState();
                      setShowSessionSummary(false);
                    }}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 font-bold'
                        : 'border-stone-100 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-stone-400">{i + 1}.</span>
                      <span className="truncate text-stone-800 dark:text-stone-200">{f.name}</span>
                    </div>
                    <div>
                      {isMastered && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Mastered
                        </span>
                      )}
                      {isQueued && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Review
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => setShowSessionSummary(false)}
                className="px-4 py-2 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 rounded-xl text-xs font-bold"
              >
                Continue Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FormulaFlashcardMode;
