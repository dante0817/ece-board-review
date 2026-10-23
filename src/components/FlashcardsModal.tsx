import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useState, useEffect } from 'react';
import { Topic, Flashcard } from '../types';
import { generateFlashcardsFromGemini } from '../services/flashcardService';
import { X, ChevronLeft, ChevronRight, CheckCircle, HelpCircle, AlertTriangle, Check, Sliders } from 'lucide-react';

interface FlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTopics?: Topic[];
  subjectName?: string;
  material?: string;
  title?: string;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  isOpen,
  onClose,
  selectedTopics = [],
  subjectName,
  material,
  title,
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cardCount, setCardCount] = useState<number>(6);
  const [focusArea, setFocusArea] = useState<'mixed' | 'formulas' | 'traps' | 'concepts'>('mixed');
  const [copied, setCopied] = useState<boolean>(false);
  const [sourceTag, setSourceTag] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [knownStatusMap, setKnownStatusMap] = useState<Record<string, 'learning' | 'mastered'>>({});

  // Auto-generate on open if flashcards empty
  useEffect(() => {
    if (isOpen && (selectedTopics.length > 0 || material) && flashcards.length === 0) {
      handleGenerate();
    }
  }, [isOpen, selectedTopics, material]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, flashcards.length]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (selectedTopics.length === 0 && !material) return;
    setIsLoading(true);
    setIsFlipped(false);
    setCurrentIndex(0);
    setStatusMessage('');

    try {
      const response = await generateFlashcardsFromGemini(selectedTopics, {
        count: cardCount,
        focusArea,
        material,
        subjectName,
      });

      setFlashcards(response.flashcards);
      setSourceTag(response.source);
      setStatusMessage(response.message);
      setKnownStatusMap({});
    } catch (err: any) {
      setStatusMessage(err.message || 'Error generating flashcards.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    if (flashcards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleShuffle = () => {
    if (flashcards.length <= 1) return;
    setIsFlipped(false);
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

    // Auto advance if not at last card
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 250);
    }
  };

  const handleCopyAll = () => {
    if (flashcards.length === 0) return;
    const text = flashcards
      .map(
        (c, idx) =>
          `Card ${idx + 1}: ${c.topicName} [${c.difficulty}]\n` +
          `Q: ${c.front}\n` +
          `A: ${c.back}\n` +
          `Formula/Principle: ${c.keyFormulaOrConcept}\n` +
          `Board Tip: ${c.boardExamTip}\n` +
          `---\n`
      )
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const currentCard: Flashcard | undefined = flashcards[currentIndex];
  const masteredCount = Object.values(knownStatusMap).filter((s) => s === 'mastered').length;
  const learningCount = Object.values(knownStatusMap).filter((s) => s === 'learning').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <FeatureIcon name="flashcards" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">
                  {title || 'AI-Powered Board Flashcards'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <AppArtwork name="brain" inline className="w-3 h-3 text-amber-700" />
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {selectedTopics.length > 0 ? (
                  <>
                    {selectedTopics.length} topic{selectedTopics.length === 1 ? '' : 's'} selected:{' '}
                    <span className="font-semibold text-stone-700">
                      {selectedTopics.map((t) => t.name).join(', ')}
                    </span>
                  </>
                ) : (
                  <>
                    Summary deck synthesized from:{' '}
                    <span className="font-semibold text-stone-700">
                      {subjectName || 'Current Material'}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="px-6 py-2.5 bg-stone-100/70 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Focus selector */}
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-600 font-medium">Focus:</span>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value as any)}
                disabled={isLoading}
                className="bg-white border border-stone-300 rounded-md px-2 py-1 text-xs font-semibold text-stone-800 focus:ring-1 focus:ring-amber-500 outline-hidden"
              >
                <option value="mixed">Mixed (Formulas & Traps)</option>
                <option value="formulas">Formulas & Identities</option>
                <option value="traps">Board Exam Traps</option>
                <option value="concepts">Core Concepts</option>
              </select>
            </div>

            {/* Count selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-600 font-medium">Cards:</span>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                disabled={isLoading}
                className="bg-white border border-stone-300 rounded-md px-2 py-1 text-xs font-semibold text-stone-800 focus:ring-1 focus:ring-amber-500 outline-hidden"
              >
                <option value={4}>4 Cards</option>
                <option value={6}>6 Cards</option>
                <option value={8}>8 Cards</option>
                <option value={12}>12 Cards</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || (selectedTopics.length === 0 && !material)}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <AppArtwork name="cycle" inline className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Generating with Gemini...' : 'Regenerate'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-between">
          {isLoading ? (
            /* Loading State */
            <div className="h-72 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-3 border-amber-200 border-t-amber-600 animate-spin flex items-center justify-center">
                <AppArtwork name="brain" inline className="w-5 h-5 text-amber-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Gemini API Generating Board Review Flashcards...
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Extracting key formulas, board exam pitfalls, and calculator shortcuts for{' '}
                  <span className="font-semibold text-stone-700">
                    {selectedTopics.map((t) => t.name).join(', ')}
                  </span>
                </p>
              </div>
            </div>
          ) : flashcards.length > 0 && currentCard ? (
            /* Active Flashcard Viewer */
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Progress & Card Counter */}
              <div className="flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-stone-800">
                    Card {currentIndex + 1} of {flashcards.length}
                  </span>
                  <span className="text-stone-300">•</span>
                  <span className="font-semibold text-amber-800">
                    {currentCard.topicName}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle className="w-3 h-3" /> Mastered: {masteredCount}
                  </span>
                  <span className="flex items-center gap-1 text-amber-700 font-medium">
                    <HelpCircle className="w-3 h-3" /> Learning: {learningCount}
                  </span>
                  <button
                    type="button"
                    onClick={handleShuffle}
                    className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded"
                    title="Shuffle Flashcards"
                  >
                    <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300 rounded-full"
                  style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                />
              </div>

              {/* The Flippable Flashcard */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                role="button"
                tabIndex={0}
                className="flex-1 min-h-[260px] sm:min-h-[300px] rounded-2xl border-2 border-stone-200 hover:border-amber-400/80 bg-stone-50/60 hover:bg-stone-50 p-6 sm:p-8 flex flex-col justify-between transition-all cursor-pointer relative select-none shadow-xs group"
              >
                {/* Top Card Badge Row */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      currentCard.difficulty === 'Hard'
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : currentCard.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {currentCard.difficulty} Difficulty
                  </span>

                  <span className="text-xs font-semibold text-stone-400 group-hover:text-amber-700 flex items-center gap-1 transition-colors">
                    <AppArtwork name="cycle" inline className="w-3 h-3" />
                    {isFlipped ? 'Click to show question' : 'Click to flip (or Space)'}
                  </span>
                </div>

                {/* Card Face Content */}
                <div className="my-auto py-3">
                  {!isFlipped ? (
                    /* FRONT FACE: Question / Prompt */
                    <div className="space-y-3 animate-in fade-in duration-150">
                      <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                        <AppArtwork name="book" inline className="w-3.5 h-3.5" />
                        Prompt / Board Question
                      </div>
                      <p className="text-base sm:text-lg font-bold text-stone-900 leading-relaxed">
                        {currentCard.front}
                      </p>
                    </div>
                  ) : (
                    /* BACK FACE: Answer & Insights */
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Correct Solution & Core Answer
                      </div>
                      <p className="text-sm sm:text-base font-medium text-stone-800 leading-relaxed whitespace-pre-line">
                        {currentCard.back}
                      </p>

                      {/* Highlighted Formula / Rule */}
                      {currentCard.keyFormulaOrConcept && (
                        <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                            <AppArtwork name="bulb" inline className="w-3 h-3 text-amber-500" />
                            Key Formula / Identity
                          </div>
                          <div className="font-mono text-xs sm:text-sm font-bold text-amber-900 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                            {currentCard.keyFormulaOrConcept}
                          </div>
                        </div>
                      )}

                      {/* Board Exam Tip */}
                      {currentCard.boardExamTip && (
                        <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-100 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div className="text-xs text-rose-900 leading-normal">
                            <strong className="font-bold">Board Exam Tip / Trap: </strong>
                            {currentCard.boardExamTip}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Card Status Ribbon */}
                <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-400">
                  <span>Topic: {currentCard.topicName}</span>
                  {knownStatusMap[currentCard.id] && (
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        knownStatusMap[currentCard.id] === 'mastered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {knownStatusMap[currentCard.id] === 'mastered' ? '✓ Mastered' : '⏱ Still Learning'}
                    </span>
                  )}
                </div>
              </div>

              {/* Self-Rating Controls (Got It vs Still Learning) */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => markCardStatus('learning')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    knownStatusMap[currentCard.id] === 'learning'
                      ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/40'
                      : 'bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-800 border-stone-200'
                  }`}
                >
                  <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                  <span>Still Learning</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-stone-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <AppArtwork name="cycle" inline className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFlipped ? 'Show Prompt' : 'Reveal Answer'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => markCardStatus('mastered')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                    knownStatusMap[currentCard.id] === 'mastered'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400/40'
                      : 'bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border-stone-200'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Got It! (Mastered)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-stone-300" />
              <p className="text-sm text-stone-600 font-medium">
                No flashcards loaded. Click "Generate" to create cards using Gemini API.
              </p>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-4 py-2 rounded-lg bg-stone-900 text-amber-400 font-bold text-xs hover:bg-stone-800"
              >
                Generate Flashcards
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyAll}
              disabled={flashcards.length === 0}
              className="px-2.5 py-1.5 rounded-lg border border-stone-300 hover:bg-white text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors disabled:opacity-40"
              title="Copy all flashcards as plain text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <AppArtwork name="cards" inline className="w-3.5 h-3.5 text-stone-400" />
                  <span>Copy All</span>
                </>
              )}
            </button>

            {statusMessage && (
              <span className="text-[11px] text-stone-500 truncate max-w-xs hidden sm:inline">
                {statusMessage}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={flashcards.length <= 1 || currentIndex === 0}
              className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-white text-stone-700 flex items-center gap-1 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={flashcards.length <= 1 || currentIndex === flashcards.length - 1}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold flex items-center gap-1 disabled:opacity-30 transition-colors shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
