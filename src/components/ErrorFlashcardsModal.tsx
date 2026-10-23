import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, X, Check, AlertTriangle, Sliders, CheckCheck } from 'lucide-react';
import { ReviewError, ErrorFlashcard, ErrorFlashcardGenerationOptions } from '../types';
import { generateFlashcardsFromErrors } from '../services/flashcardService';
import { MathFormula } from './MathFormula';

interface ErrorFlashcardsModalProps {
  errors: ReviewError[];
  isOpen: boolean;
  onClose: () => void;
  onToggleResolveError?: (errorId: string) => void;
}

export const ErrorFlashcardsModal: React.FC<ErrorFlashcardsModalProps> = ({
  errors,
  isOpen,
  onClose,
  onToggleResolveError,
}) => {
  const [flashcards, setFlashcards] = useState<ErrorFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sourceInfo, setSourceInfo] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Generation options
  const [focusStyle, setFocusStyle] = useState<
    'targeted-remediation' | 'trap-inversion' | 'formula-drill' | 'board-exam-scenario'
  >('targeted-remediation');
  const [cardCount, setCardCount] = useState<number>(() => Math.min(10, Math.max(3, errors.length)));
  const [difficulty, setDifficulty] = useState<'mixed' | 'Easy' | 'Medium' | 'Hard'>('mixed');

  // Study progress state
  const [knownStatusMap, setKnownStatusMap] = useState<Record<string, 'learning' | 'mastered'>>({});
  const [copied, setCopied] = useState(false);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);

  // Filter state inside modal (allows focusing on specific error categories)
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredErrors = React.useMemo(() => {
    if (categoryFilter === 'all') return errors;
    return errors.filter((e) => e.category === categoryFilter);
  }, [errors, categoryFilter]);

  const distinctCategories = React.useMemo(() => {
    const cats = new Set<string>();
    errors.forEach((e) => cats.add(e.category));
    return Array.from(cats);
  }, [errors]);

  const handleGenerate = useCallback(async () => {
    const targetList = filteredErrors.length > 0 ? filteredErrors : errors;
    if (targetList.length === 0) return;

    setIsLoading(true);
    setErrorMessage(null);
    setIsFlipped(false);
    setShowCompletionSummary(false);

    try {
      const options: Partial<ErrorFlashcardGenerationOptions> = {
        count: cardCount,
        focusStyle,
        difficulty,
      };

      const res = await generateFlashcardsFromErrors(targetList, options);
      if (res.flashcards && res.flashcards.length > 0) {
        setFlashcards(res.flashcards);
        setCurrentIndex(0);
        setSourceInfo(res.source);
        setStatusMessage(res.message);
        setKnownStatusMap({});
      } else {
        setErrorMessage('No flashcards could be generated. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate flashcards.');
    } finally {
      setIsLoading(false);
    }
  }, [filteredErrors, errors, cardCount, focusStyle, difficulty]);

  // Generate on open
  useEffect(() => {
    if (isOpen && errors.length > 0) {
      handleGenerate();
    }
  }, [isOpen, errors, handleGenerate]);

  const handleNext = useCallback(() => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    if (currentIndex === flashcards.length - 1) {
      setShowCompletionSummary(true);
    } else {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }
  }, [flashcards.length, currentIndex]);

  const handlePrev = useCallback(() => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    setShowCompletionSummary(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  }, [flashcards.length]);

  const handleShuffle = () => {
    if (flashcards.length <= 1) return;
    setIsFlipped(false);
    setShowCompletionSummary(false);
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
  };

  const markCardStatus = (status: 'learning' | 'mastered') => {
    const currentCard = flashcards[currentIndex];
    if (!currentCard) return;

    setKnownStatusMap((prev) => ({
      ...prev,
      [currentCard.id]: status,
    }));

    // If marked mastered and linked to an error, we can offer to resolve it
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 250);
    } else {
      setTimeout(() => {
        setShowCompletionSummary(true);
      }, 300);
    }
  };

  const handleCopyAll = () => {
    if (flashcards.length === 0) return;
    const text = flashcards
      .map(
        (c, idx) =>
          `Card ${idx + 1}: ${c.topicName} [${c.errorCategory || 'Error Remediation'}]\n` +
          `Cue: ${c.activeRecallCue || 'Active Recall'}\n` +
          `Original Logged Mistake: ${c.originalMistake || 'N/A'}\n` +
          `Q: ${c.front}\n` +
          `A: ${c.back}\n` +
          `Formula/Rule: ${c.keyFormulaOrConcept}\n` +
          `Board Exam Tip: ${c.boardExamTip}\n` +
          (c.counterExampleOrCheck ? `Verification Check: ${c.counterExampleOrCheck}\n` : '') +
          `---\n`
      )
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a select/input
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 'j') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'k') {
        handlePrev();
      } else if (e.key === '1') {
        markCardStatus('learning');
      } else if (e.key === '2') {
        markCardStatus('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev, isFlipped]);

  if (!isOpen) return null;

  const currentCard: ErrorFlashcard | undefined = flashcards[currentIndex];
  const masteredCount = Object.values(knownStatusMap).filter((s) => s === 'mastered').length;
  const learningCount = Object.values(knownStatusMap).filter((s) => s === 'learning').length;

  // Find linked error in current errors list
  const linkedError = currentCard?.errorId ? errors.find((e) => e.id === currentCard.errorId) : null;

  return (
    <div
      id="error-flashcards-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="error-flashcards-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <FeatureIcon name="flashcards" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-stone-900">
                  Active Recall Flashcards from Error Log
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <AppArtwork name="brain" inline className="w-3 h-3 text-amber-700" />
                  Gemini 3.8 Flash
                </span>
                {sourceInfo === 'gemini-3.8-flash' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live AI
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Remediating <span className="font-semibold text-stone-800">{filteredErrors.length}</span> logged error{filteredErrors.length === 1 ? '' : 's'} across{' '}
                <span className="font-semibold text-stone-800">
                  {new Set(filteredErrors.map((e) => e.topicName)).size}
                </span> topic{new Set(filteredErrors.map((e) => e.topicName)).size === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <button
            id="close-error-flashcards-btn"
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-stone-100/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category Filter */}
            {distinctCategories.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-stone-500 font-medium">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  disabled={isLoading}
                  className="bg-white border border-stone-300 rounded-md px-2 py-1 text-xs font-semibold text-stone-800 focus:ring-1 focus:ring-amber-500 outline-hidden"
                >
                  <option value="all">All Categories ({errors.length})</option>
                  {distinctCategories.map((c) => (
                    <option key={c} value={c}>
                      {c} ({errors.filter((e) => e.category === c).length})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Focus Style */}
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-500 font-medium">Focus:</span>
              <select
                value={focusStyle}
                onChange={(e) => setFocusStyle(e.target.value as any)}
                disabled={isLoading}
                className="bg-white border border-stone-300 rounded-md px-2 py-1 text-xs font-semibold text-stone-800 focus:ring-1 focus:ring-amber-500 outline-hidden"
              >
                <option value="targeted-remediation">Targeted Remediation (Fix Mistakes)</option>
                <option value="trap-inversion">Trap Inversion (Spot Distractors)</option>
                <option value="formula-drill">Formula & Identity Drill</option>
                <option value="board-exam-scenario">Board Exam Scenario</option>
              </select>
            </div>

            {/* Card Count */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium">Deck Size:</span>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                disabled={isLoading}
                className="bg-white border border-stone-300 rounded-md px-2 py-1 text-xs font-semibold text-stone-800 focus:ring-1 focus:ring-amber-500 outline-hidden"
              >
                <option value={3}>3 Cards</option>
                <option value={5}>5 Cards</option>
                <option value={8}>8 Cards</option>
                <option value={10}>10 Cards</option>
                <option value={14}>14 Cards</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="regenerate-error-flashcards-btn"
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || errors.length === 0}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <AppArtwork name="cycle" inline className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Generating with Gemini...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between min-h-[380px]">
          {isLoading ? (
            /* Loading State */
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-3 border-amber-200 border-t-amber-600 animate-spin flex items-center justify-center">
                <AppArtwork name="brain" inline className="w-5 h-5 text-amber-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Synthesizing Active Recall Flashcards...
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mt-1">
                  Gemini 3.8 Flash is analyzing your logged errors, formulating retrieval prompts, and engineering trap-inversion scenarios for board review.
                </p>
              </div>
            </div>
          ) : errorMessage ? (
            /* Error State */
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-stone-800">{errorMessage}</p>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-4 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors inline-flex items-center gap-1.5"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          ) : showCompletionSummary ? (
            /* Deck Completion Summary Screen */
            <div className="py-8 flex flex-col items-center text-center max-w-lg mx-auto animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 shadow-xs">
                <CheckCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900">
                Active Recall Round Completed!
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-md">
                You have reviewed all {flashcards.length} flashcards targeted at your personal logged mistakes.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 w-full my-6">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-2xl font-black text-emerald-700">{masteredCount}</div>
                  <div className="text-xs font-semibold text-emerald-900 mt-0.5">Mastered / Recalled</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-2xl font-black text-amber-700">{learningCount}</div>
                  <div className="text-xs font-semibold text-amber-900 mt-0.5">Needs Another Review</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompletionSummary(false);
                    setCurrentIndex(0);
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                  Restart This Deck
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <AppArtwork name="star" inline className="w-3.5 h-3.5" />
                  Generate New Variations
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Back to Error Log
                </button>
              </div>
            </div>
          ) : currentCard ? (
            /* Active Flashcard View */
            <div className="flex flex-col flex-1">
              {/* Progress & Deck Controls Bar */}
              <div className="flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-800">
                    Card {currentIndex + 1} of {flashcards.length}
                  </span>
                  <div className="w-24 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{
                        width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status badges */}
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ {masteredCount} Mastered
                  </span>
                  {learningCount > 0 && (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      ⚡ {learningCount} Review
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleShuffle}
                    className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    title="Shuffle deck"
                  >
                    <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyAll}
                    className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    title="Copy all cards to clipboard"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* The Interactive Flip Card */}
              <div
                id={`flashcard-${currentIndex}`}
                tabIndex={0}
                role="button"
                onClick={() => setIsFlipped((prev) => !prev)}
                className={`w-full min-h-[300px] sm:min-h-[330px] rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between p-5 sm:p-6 shadow-sm hover:shadow-md select-none outline-hidden ${
                  isFlipped
                    ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-white border-stone-300 hover:border-amber-400'
                }`}
              >
                {/* Card Top Metadata */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-stone-900 text-stone-100">
                        {currentCard.topicName}
                      </span>
                      {currentCard.errorCategory && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                          {currentCard.errorCategory}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          currentCard.difficulty === 'Easy'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : currentCard.difficulty === 'Hard'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {currentCard.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
                      <span>{isFlipped ? 'Answer Side' : 'Question Prompt'}</span>
                    </div>
                  </div>

                  {/* Active Recall Cue */}
                  {currentCard.activeRecallCue && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300 mb-3">
                      <AppArtwork name="bulb" inline className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{currentCard.activeRecallCue}</span>
                    </div>
                  )}

                  {/* Card Body: Front vs Back */}
                  {!isFlipped ? (
                    /* FRONT: Question Prompt */
                    <div className="space-y-4 my-2">
                      <div className="text-base sm:text-lg font-semibold text-stone-900 leading-relaxed">
                        {currentCard.front}
                      </div>

                      {/* Reminder of the logged mistake to stimulate reflection */}
                      {currentCard.originalMistake && (
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
                          <span className="font-bold text-stone-700">Logged Mistake Trigger: </span>
                          <span className="italic font-serif text-stone-800">"{currentCard.originalMistake}"</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* BACK: Answer, Derivation, and Key Formula */
                    <div className="space-y-3.5 my-1 text-xs sm:text-sm text-stone-800 leading-relaxed">
                      {/* Solution Text */}
                      <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                        <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                          Correct Method & Solution:
                        </div>
                        <div className="whitespace-pre-line text-stone-900 font-medium">
                          {currentCard.back}
                        </div>
                      </div>

                      {/* Formula Box */}
                      {currentCard.keyFormulaOrConcept && (
                        <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200">
                          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-amber-700" />
                            Key Rule / Governing Formula:
                          </div>
                          <div className="font-semibold text-amber-950">
                            <MathFormula formula={currentCard.keyFormulaOrConcept} />
                          </div>
                        </div>
                      )}

                      {/* Board Exam Tip Box */}
                      {currentCard.boardExamTip && (
                        <div className="p-3 rounded-xl bg-blue-50/90 border border-blue-200 text-xs">
                          <div className="font-bold text-blue-900 mb-0.5 flex items-center gap-1">
                            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-700" />
                            PRC Board Exam Tip / Mnemonic:
                          </div>
                          <div className="text-blue-950 font-medium">
                            {currentCard.boardExamTip}
                          </div>
                        </div>
                      )}

                      {/* Counter Example / Verification Check */}
                      {currentCard.counterExampleOrCheck && (
                        <div className="text-xs text-stone-600 italic bg-stone-100/70 p-2.5 rounded-lg border border-stone-200">
                          <span className="font-semibold text-stone-700 not-italic">Verification Sanity Check: </span>
                          {currentCard.counterExampleOrCheck}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Cue */}
                <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-400 mt-4">
                  <span className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-stone-200/80 text-stone-700 font-mono text-[10px]">
                      Space
                    </span>{' '}
                    or Click to {isFlipped ? 'view Question' : 'reveal Answer & Rule'}
                  </span>
                  <span className="text-[11px] font-medium text-amber-700">
                    {isFlipped ? 'Solution Revealed' : 'Active Recall Active'}
                  </span>
                </div>
              </div>

              {/* Linked Error Resolver Banner */}
              {isFlipped && linkedError && onToggleResolveError && (
                <div className="mt-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-700">
                      Linked Error: <span className="font-bold">"{linkedError.description.slice(0, 50)}..."</span>
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        linkedError.isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {linkedError.isResolved ? 'Resolved' : 'Unresolved'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleResolveError(linkedError.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                      linkedError.isResolved
                        ? 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{linkedError.isResolved ? 'Mark as Unresolved' : 'Mark Error as Resolved'}</span>
                  </button>
                </div>
              )}

              {/* Self-Rating & Navigation Controls */}
              <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                {/* Grading buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => markCardStatus('learning')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      knownStatusMap[currentCard.id] === 'learning'
                        ? 'bg-amber-500 text-stone-950 shadow-xs'
                        : 'bg-stone-100 hover:bg-amber-100 text-stone-700 border border-stone-300'
                    }`}
                    title="Press 1"
                  >
                    <XCircle className="w-4 h-4 text-amber-600" />
                    <span>Needs Review</span>
                    <span className="text-[10px] text-stone-500 font-mono">(1)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => markCardStatus('mastered')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      knownStatusMap[currentCard.id] === 'mastered'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-emerald-100 text-stone-700 border border-stone-300'
                    }`}
                    title="Press 2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Mastered / Recalled</span>
                    <span className="text-[10px] text-stone-500 font-mono">(2)</span>
                  </button>
                </div>

                {/* Deck Step Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    id="prev-flashcard-btn"
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-3 py-1.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev</span>
                  </button>

                  <button
                    id="next-flashcard-btn"
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>{currentIndex === flashcards.length - 1 ? 'Finish' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 text-center space-y-3">
              <p className="text-sm font-medium text-stone-600">No error cards in this deck.</p>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-4 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors inline-flex items-center gap-1.5"
              >
                <AppArtwork name="star" inline className="w-3.5 h-3.5" />
                Generate Flashcards
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Keybindings Helper */}
        <div className="px-5 sm:px-6 py-2 bg-stone-100/80 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-3">
            <span>⌨️ Shortcuts:</span>
            <span><kbd className="font-mono bg-white px-1 py-0.5 rounded border border-stone-300 text-[10px]">Space</kbd> Flip</span>
            <span><kbd className="font-mono bg-white px-1 py-0.5 rounded border border-stone-300 text-[10px]">←</kbd> <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-stone-300 text-[10px]">→</kbd> Nav</span>
            <span><kbd className="font-mono bg-white px-1 py-0.5 rounded border border-stone-300 text-[10px]">1</kbd> Review</span>
            <span><kbd className="font-mono bg-white px-1 py-0.5 rounded border border-stone-300 text-[10px]">2</kbd> Mastered</span>
          </div>
          {statusMessage && (
            <span className="text-stone-600 font-medium truncate max-w-xs">
              {statusMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
