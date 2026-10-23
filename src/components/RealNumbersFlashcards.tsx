import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, HelpCircle, Play, ListOrdered, CheckCircle2, X } from 'lucide-react';

export interface FlashcardItem {
  id: string;
  deckId: 1 | 2 | 3 | 4;
  question: string;
  answerTitle: string;
  answerExplanation: string;
  formula?: string;
  category: 'definition' | 'concept';
  isDue?: boolean;
}

export interface DeckInfo {
  id: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  dueCount: number;
  totalCards: number;
  reviewedCards: number;
  progressPercentage: number;
  color: string;
  barColor: string;
  quickReferences: Array<{
    id: string;
    iconType: 'bulb-blue' | 'bulb-green' | 'hierarchy-purple';
    title: string;
    subtitle: string;
  }>;
}

export const DECKS: DeckInfo[] = [
  {
    id: 1,
    title: 'Number Sets',
    subtitle: 'Master key definitions and properties of number sets.',
    dueCount: 12,
    totalCards: 12,
    reviewedCards: 8,
    progressPercentage: 67,
    color: '#2563eb',
    barColor: '#10b981',
    quickReferences: [
      {
        id: 'q1',
        iconType: 'bulb-blue',
        title: 'N starts at 1',
        subtitle: 'N = {1, 2, 3, ...}',
      },
      {
        id: 'q2',
        iconType: 'bulb-green',
        title: 'W adds 0',
        subtitle: 'W = {0, 1, 2, 3, ...}',
      },
      {
        id: 'q3',
        iconType: 'hierarchy-purple',
        title: 'N ⊂ W ⊂ Z ⊂ Q ⊂ R',
        subtitle: 'Nested subsets of real numbers',
      },
    ],
  },
  {
    id: 2,
    title: 'Rational vs. Irrational',
    subtitle: 'Distinguish fractional quotients, decimals, and non-repeating roots.',
    dueCount: 4,
    totalCards: 10,
    reviewedCards: 6,
    progressPercentage: 60,
    color: '#2563eb',
    barColor: '#2563eb',
    quickReferences: [
      {
        id: 'q4',
        iconType: 'bulb-blue',
        title: 'Terminating condition',
        subtitle: 'b = 2ᵐ · 5ⁿ in reduced a/b',
      },
      {
        id: 'q5',
        iconType: 'bulb-green',
        title: 'π is Irrational',
        subtitle: '22/7 and 3.14 are approximations',
      },
      {
        id: 'q6',
        iconType: 'hierarchy-purple',
        title: 'Q ∩ (R \\ Q) = ∅',
        subtitle: 'Disjoint rational & irrational sets',
      },
    ],
  },
  {
    id: 3,
    title: 'Classifying Numbers',
    subtitle: 'Evaluate roots, simplify signs, and identify specific numerical sets.',
    dueCount: 0,
    totalCards: 16,
    reviewedCards: 14,
    progressPercentage: 88,
    color: '#4f46e5',
    barColor: '#8b5cf6',
    quickReferences: [
      {
        id: 'q7',
        iconType: 'bulb-blue',
        title: 'Simplify first!',
        subtitle: '√9 = 3 (Natural), ∛(-8) = -2 (Integer)',
      },
      {
        id: 'q8',
        iconType: 'bulb-green',
        title: '0 is Even & Neutral',
        subtitle: 'Neither + nor -; in W, Z, Q, R',
      },
      {
        id: 'q9',
        iconType: 'hierarchy-purple',
        title: 'Radical ≠ Irrational',
        subtitle: 'Only non-perfect roots are irrational',
      },
    ],
  },
  {
    id: 4,
    title: 'Ordering & Comparing',
    subtitle: 'Align square roots, negative coordinates, and inequalities on the line.',
    dueCount: 3,
    totalCards: 12,
    reviewedCards: 9,
    progressPercentage: 75,
    color: '#10b981',
    barColor: '#10b981',
    quickReferences: [
      {
        id: 'q10',
        iconType: 'bulb-blue',
        title: 'Decimal Conversion',
        subtitle: 'Convert fractions & roots to decimals',
      },
      {
        id: 'q11',
        iconType: 'bulb-green',
        title: 'Negatives Reversed',
        subtitle: 'More negative is smaller: -5 < -2',
      },
      {
        id: 'q12',
        iconType: 'hierarchy-purple',
        title: 'Density Property',
        subtitle: 'Infinite reals between any two points',
      },
    ],
  },
];

export const ALL_FLASHCARDS: FlashcardItem[] = [
  // DECK 1: Number Sets (12 cards)
  {
    id: 'd1-c1',
    deckId: 1,
    question: 'What are Natural Numbers (ℕ) and what is the smallest element?',
    answerTitle: 'Natural Numbers (ℕ)',
    answerExplanation: 'Natural numbers are counting numbers {1, 2, 3, ...}. In board exams, the smallest natural number is strictly 1 (zero is not included).',
    category: 'definition',
    isDue: true,
  },
  {
    id: 'd1-c2',
    deckId: 1,
    question: 'How do Whole Numbers (W) differ from Natural Numbers (ℕ)?',
    answerTitle: 'Whole Numbers (W)',
    answerExplanation: 'Whole numbers include zero along with all natural numbers: W = {0, 1, 2, 3, ...}. 0 is the only whole number that is not natural.',
    category: 'definition',
    isDue: true,
  },
  {
    id: 'd1-c3',
    deckId: 1,
    question: 'What set is formed by whole numbers and their negative opposites?',
    answerTitle: 'Integers (ℤ)',
    answerExplanation: 'The integers {..., -3, -2, -1, 0, 1, 2, 3, ...}. Denoted by ℤ (from German "Zahlen"). Zero is an integer with no sign.',
    category: 'definition',
    isDue: true,
  },
  {
    id: 'd1-c4',
    deckId: 1,
    question: 'Which set includes 0, 1, 2, 3, ... but not negative numbers?',
    answerTitle: 'Whole Numbers (W)',
    answerExplanation: 'Whole numbers include 0 and all positive counting numbers, but do not include negatives.',
    category: 'definition',
    isDue: true,
  },
  {
    id: 'd1-c5',
    deckId: 1,
    question: 'What is the standard notation for Rational Numbers and why is that symbol used?',
    answerTitle: 'Rational Numbers (ℚ)',
    answerExplanation: 'Symbol ℚ stands for "Quotient", representing all numbers expressible as a/b where a, b ∈ ℤ and b ≠ 0.',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd1-c6',
    deckId: 1,
    question: 'Is 0 a positive integer, a negative integer, or neither?',
    answerTitle: 'Neither Positive nor Negative',
    answerExplanation: 'Zero is neutral: it is neither positive nor negative, but it is an even integer (divisible by 2 with remainder 0).',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd1-c7',
    deckId: 1,
    question: 'What is the complete subset chain relating ℕ, W, ℤ, ℚ, and ℝ?',
    answerTitle: 'ℕ ⊂ W ⊂ ℤ ⊂ ℚ ⊂ ℝ',
    answerExplanation: 'Natural numbers are nested inside Whole numbers, which are inside Integers, which are inside Rationals, all within Real numbers.',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd1-c8',
    deckId: 1,
    question: 'Can a number be both Rational and Irrational at the same time?',
    answerTitle: 'No, they are mutually disjoint',
    answerExplanation: 'ℚ ∩ (ℝ \\ ℚ) = ∅. A real number is either rational or irrational, never both.',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd1-c9',
    deckId: 1,
    question: 'Are natural numbers closed under subtraction? Why or why not?',
    answerTitle: 'No, not closed under subtraction',
    answerExplanation: 'For example, 3 - 5 = -2, which is not a natural number (it belongs to ℤ).',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd1-c10',
    deckId: 1,
    question: 'What constitutes the Real Number system (ℝ)?',
    answerTitle: 'The union of Rationals and Irrationals',
    answerExplanation: 'ℝ = ℚ ∪ (ℝ \\ ℚ). It represents all continuous coordinates along the unbroken number line.',
    category: 'definition',
    isDue: true,
  },
  {
    id: 'd1-c11',
    deckId: 1,
    question: 'Is √(-16) a real number?',
    answerTitle: 'No, it is an imaginary / complex number',
    answerExplanation: 'Even roots of negative numbers cannot be represented on the real number line; √(-16) = 4i.',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd1-c12',
    deckId: 1,
    question: 'Why are integers not closed under division?',
    answerTitle: 'Quotients often yield non-integers',
    answerExplanation: 'For example, 7 ÷ 2 = 3.5, which is a rational fraction, not an integer.',
    category: 'definition',
    isDue: true,
  },

  // DECK 2: Rational vs. Irrational (10 cards)
  {
    id: 'd2-c1',
    deckId: 2,
    question: 'What is the precise condition for a reduced fraction a/b to terminate as a decimal?',
    answerTitle: 'Denominator factors only into 2 and/or 5',
    answerExplanation: 'In lowest terms, b = 2ᵐ · 5ⁿ. Any other prime factor (such as 3, 7, 11) forces an infinite repeating decimal.',
    category: 'definition',
    isDue: true,
  },
  {
    id: 'd2-c2',
    deckId: 2,
    question: 'Why does 22/7 qualify as a rational number even though π is irrational?',
    answerTitle: '22/7 is a ratio of integers; π is not',
    answerExplanation: '22/7 = 22 ÷ 7 is an exact rational number (3.142857...). It is merely an approximation of π, not π itself.',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd2-c3',
    deckId: 2,
    question: 'Is 0.333... rational or irrational?',
    answerTitle: 'Rational (ℚ)',
    answerExplanation: 'Any infinitely repeating periodic decimal is rational because it can be converted to an exact fraction: 0.333... = 1/3.',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd2-c4',
    deckId: 2,
    question: 'Is the sum of two irrational numbers always irrational?',
    answerTitle: 'No! Counterexample: √2 + (-√2) = 0',
    answerExplanation: 'Irrationals are NOT closed under addition. The sum can evaluate to 0 or any other rational integer.',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd2-c5',
    deckId: 2,
    question: 'What is a transcendental number?',
    answerTitle: 'Non-algebraic real number',
    answerExplanation: 'A real number that is not the root of any non-zero polynomial with rational coefficients (e.g., π and e). All transcendentals are irrational.',
    category: 'definition',
    isDue: false,
  },
  {
    id: 'd2-c6',
    deckId: 2,
    question: 'Is √2 algebraic or transcendental?',
    answerTitle: 'Algebraic Irrational',
    answerExplanation: '√2 is a root of the polynomial x² - 2 = 0 with integer coefficients, so it is algebraic, though still irrational.',
    category: 'concept',
    isDue: false,
  },
  {
    id: 'd2-c7',
    deckId: 2,
    question: 'What is 0.999... equal to in the real number system?',
    answerTitle: 'Exactly 1',
    answerExplanation: 'By algebraic proof (10x - x = 9) or infinite geometric series, 0.999... = 1.',
    category: 'concept',
    isDue: false,
  },
  {
    id: 'd2-c8',
    deckId: 2,
    question: 'Does the fraction 9/30 terminate or repeat?',
    answerTitle: 'Terminates (0.3)',
    answerExplanation: 'Always reduce first: 9/30 = 3/10. The denominator 10 = 2 × 5, so it terminates as 0.3.',
    category: 'concept',
    isDue: false,
  },
  {
    id: 'd2-c9',
    deckId: 2,
    question: 'Can an irrational number ever be written in the form a/b where a, b ∈ ℤ?',
    answerTitle: 'Never by definition',
    answerExplanation: 'By definition, irrationals are real numbers that cannot be expressed as a ratio of integers.',
    category: 'definition',
    isDue: false,
  },
  {
    id: 'd2-c10',
    deckId: 2,
    question: 'What happens when a non-zero rational is multiplied by an irrational?',
    answerTitle: 'Always Irrational',
    answerExplanation: 'If q ∈ ℚ (q ≠ 0) and r is irrational, q · r is always irrational (e.g., 5√2).',
    category: 'concept',
    isDue: false,
  },

  // DECK 3: Classifying Numbers (16 cards)
  {
    id: 'd3-c1',
    deckId: 3,
    question: 'How do you classify √9 across number sets?',
    answerTitle: 'Natural, Whole, Integer, Rational, Real',
    answerExplanation: '√9 evaluates to 3, which is a positive counting number. It belongs to all sets except irrational.',
    category: 'concept',
    isDue: false,
  },
  {
    id: 'd3-c2',
    deckId: 3,
    question: 'Classify -15 in the real number hierarchy.',
    answerTitle: 'Integer (ℤ), Rational (ℚ), Real (ℝ)',
    answerExplanation: '-15 is a negative whole counterpart, expressible as -15/1. It is not natural and not whole.',
    category: 'concept',
    isDue: false,
  },
  {
    id: 'd3-c3',
    deckId: 3,
    question: 'Classify ∛(-8) in the real number system.',
    answerTitle: 'Integer (ℤ), Rational (ℚ), Real (ℝ)',
    answerExplanation: '∛(-8) = -2 because (-2)³ = -8. Odd roots of negative numbers are real integers!',
    category: 'concept',
    isDue: false,
  },
  {
    id: 'd3-c4',
    deckId: 3,
    question: 'Classify 0.121121112... where the number of 1s increases indefinitely.',
    answerTitle: 'Irrational (ℝ \\ ℚ) and Real (ℝ)',
    answerExplanation: 'The digits never repeat a fixed finite block periodically, and it never terminates, so it is irrational.',
    category: 'concept',
    isDue: false,
  },

  // DECK 4: Ordering & Comparing (12 cards)
  {
    id: 'd4-c1',
    deckId: 4,
    question: 'Which is greater: -7 or -3?',
    answerTitle: '-3 is greater',
    answerExplanation: 'On the real number line, numbers farther to the right are greater. -3 lies to the right of -7.',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd4-c2',
    deckId: 4,
    question: 'What is the standard approximation of √2 and √3 for board exams?',
    answerTitle: '√2 ≈ 1.414, √3 ≈ 1.732',
    answerExplanation: 'Memorize these high-frequency approximations to order radicals rapidly without a calculator.',
    category: 'concept',
    isDue: true,
  },
  {
    id: 'd4-c3',
    deckId: 4,
    question: 'Order the numbers: -1.5, 0, √2, and 4/3 from least to greatest.',
    answerTitle: '-1.5 < 0 < 4/3 (1.333...) < √2 (1.414...)',
    answerExplanation: 'Convert to decimals: -1.5 < 0 < 1.333... < 1.414...',
    category: 'concept',
    isDue: true,
  },
];

interface FlashcardProps {
  onBackToLearn?: () => void;
  onOpenAIHelp?: (concept: string) => void;
}

export const RealNumbersFlashcards: React.FC<FlashcardProps> = ({
  onBackToLearn,
  onOpenAIHelp,
}) => {
  // Active Deck Selection (1: Number Sets, 2: Rational vs Irrational, 3: Classifying, 4: Ordering)
  const [selectedDeckId, setSelectedDeckId] = useState<1 | 2 | 3 | 4>(1);

  // Deck filter pill: 'all' | 'due' | 'starred'
  const [filterMode, setFilterMode] = useState<'all' | 'due' | 'starred'>('all');

  // Study Mode: 'definition' | 'concept' | 'mixed' | 'favorites'
  const [studyMode, setStudyMode] = useState<'definition' | 'concept' | 'mixed' | 'favorites'>('definition');

  // Starred cards map
  const [starredCards, setStarredCards] = useState<Record<string, boolean>>({});

  // Card Flip state (whether answer is revealed)
  const [isFlipped, setIsFlipped] = useState<boolean>(true); // default true to match screenshot view!

  // Active card index in current deck
  const [cardIndex, setCardIndex] = useState<number>(3); // card 4 of 12 (0-indexed = 3) to match screenshot!

  // Session Statistics
  const [reviewedCount, setReviewedCount] = useState<number>(4);
  const [masteredCount, setMasteredCount] = useState<number>(2);
  const [accuracy, setAccuracy] = useState<number>(92);

  // Modal: View All Cards in Deck
  const [isViewAllOpen, setIsViewAllOpen] = useState<boolean>(false);

  // Get Active Deck Info
  const activeDeck = useMemo(() => {
    return DECKS.find((d) => d.id === selectedDeckId) || DECKS[0];
  }, [selectedDeckId]);

  // Filter cards based on selected deck and filter mode
  const currentDeckCards = useMemo(() => {
    let cards = ALL_FLASHCARDS.filter((c) => {
      if (studyMode === 'mixed') return true; // mixed deck takes across all
      return c.deckId === selectedDeckId;
    });

    if (filterMode === 'due') {
      cards = cards.filter((c) => c.isDue);
    } else if (filterMode === 'starred' || studyMode === 'favorites') {
      cards = cards.filter((c) => starredCards[c.id]);
    }

    if (studyMode === 'definition') {
      const defCards = cards.filter((c) => c.category === 'definition');
      if (defCards.length > 0) cards = defCards;
    } else if (studyMode === 'concept') {
      const conceptCards = cards.filter((c) => c.category === 'concept');
      if (conceptCards.length > 0) cards = conceptCards;
    }

    return cards.length > 0 ? cards : ALL_FLASHCARDS.filter((c) => c.deckId === selectedDeckId);
  }, [selectedDeckId, filterMode, studyMode, starredCards]);

  // Ensure cardIndex stays within bounds
  const safeIndex = cardIndex >= currentDeckCards.length ? 0 : cardIndex;
  const currentCard = currentDeckCards[safeIndex] || currentDeckCards[0] || ALL_FLASHCARDS[0];

  // Flip Toggle
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Previous Card
  const handlePrev = useCallback(() => {
    setCardIndex((prev) => (prev - 1 + currentDeckCards.length) % currentDeckCards.length);
    setIsFlipped(true); // show answer box like screenshot
  }, [currentDeckCards.length]);

  // Next Card
  const handleNext = useCallback(() => {
    setCardIndex((prev) => (prev + 1) % currentDeckCards.length);
    setIsFlipped(true);
  }, [currentDeckCards.length]);

  // Toggle Starred
  const handleToggleStar = (cardId: string) => {
    setStarredCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  // SM-2 Review Rating Action
  const handleRate = (rating: 'again' | 'good' | 'easy') => {
    setReviewedCount((prev) => prev + 1);
    if (rating === 'easy') {
      setMasteredCount((prev) => prev + 1);
      setAccuracy((prev) => Math.min(100, prev + 1));
    } else if (rating === 'again') {
      setAccuracy((prev) => Math.max(50, prev - 2));
    }
    handleNext();
  };

  // Shuffle Deck
  const handleShuffle = () => {
    const randomIdx = Math.floor(Math.random() * currentDeckCards.length);
    setCardIndex(randomIdx);
    setIsFlipped(true);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  return (
    <div className="space-y-6">
      {/* 3-Column Grid Matching image.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= COLUMN 1: FLASHCARD DECKS (approx 3/12 cols) ================= */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <AppArtwork name="book" inline className="w-5 h-5 text-slate-800" />
            <h3 className="font-extrabold text-base text-slate-900">
              Flashcard Decks
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#dbeafe] text-[#1d4ed8] shadow-2xs'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              All Cards
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('due')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterMode === 'due'
                  ? 'bg-[#dbeafe] text-[#1d4ed8] font-bold shadow-2xs'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
              <span>Due Today</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('starred')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filterMode === 'starred'
                  ? 'bg-[#dbeafe] text-[#1d4ed8] font-bold shadow-2xs'
                  : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <AppArtwork name="star" inline className="w-3.5 h-3.5" />
              <span>Starred</span>
            </button>
          </div>

          {/* Decks List */}
          <div className="space-y-3 pt-1">
            {DECKS.map((deck) => {
              const isSelected = selectedDeckId === deck.id;
              return (
                <div
                  key={deck.id}
                  onClick={() => {
                    setSelectedDeckId(deck.id);
                    setCardIndex(0);
                    setIsFlipped(true);
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#93c5fd] bg-[#eff6ff] shadow-xs ring-1 ring-blue-400/30'
                      : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#2563eb] text-white'
                            : 'border border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        {deck.id}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {deck.title}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        deck.dueCount > 0 ? 'text-[#ef4444]' : 'text-[#059669]'
                      }`}
                    >
                      {deck.dueCount} due
                    </span>
                  </div>

                  {/* Progress Bar & Subtext */}
                  <div className="mt-2.5 pl-9 space-y-1.5">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${deck.progressPercentage}%`,
                          backgroundColor: deck.barColor,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        {deck.reviewedCards} / {deck.totalCards} cards
                      </span>
                      <span className="font-semibold text-slate-600">
                        {deck.progressPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= COLUMN 2: CENTER ACTIVE FLASHCARD & QUICK REF (approx 6/12 cols) ================= */}
        <div className="lg:col-span-8 xl:col-span-6 space-y-4">
          {/* Header Row above Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-start gap-2">
              <AppArtwork name="book" inline className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  Flashcards — {activeDeck.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeDeck.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
              <span className="text-xs text-slate-500 font-semibold">
                Card {safeIndex + 1} of {currentDeckCards.length}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-[#ef4444]">
                <AppArtwork name="calendar" inline className="w-3.5 h-3.5" />
                <span>{activeDeck.dueCount} due today</span>
              </div>
            </div>
          </div>

          {/* Main Flashcard Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
            {/* Top Sub-Card (Question Section) */}
            <div
              onClick={handleFlip}
              className="border border-slate-200/90 rounded-2xl p-6 sm:p-7 bg-[#fcfdfe] relative min-h-[200px] flex flex-col justify-between cursor-pointer hover:border-blue-300 transition-all shadow-2xs group"
            >
              {/* Question Badge & Star Toggle */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#dbeafe] text-[#1d4ed8] text-xs font-bold">
                  Question
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStar(currentCard.id);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Toggle Favorite"
                >
                  <AppArtwork name="star" inline className={`w-5 h-5 ${
                      starredCards[currentCard.id]
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-300 hover:text-slate-400'
                    }`} />
                </button>
              </div>

              {/* Large Question Typography */}
              <div className="py-5 sm:py-7 text-center">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 max-w-lg mx-auto leading-snug tracking-tight">
                  {currentCard.question}
                </h2>
              </div>

              {/* Tap to flip hint */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                <span>Tap or click to flip</span>
              </div>
            </div>

            {/* Answer Section (Light Green Box matching image.png) */}
            {isFlipped && (
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 sm:p-5 space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#dcfce7] text-[#15803d] text-xs font-bold">
                    Answer
                  </span>

                  {onOpenAIHelp && (
                    <button
                      type="button"
                      onClick={() => onOpenAIHelp(currentCard.answerTitle)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      <AppArtwork name="star" inline className="w-3 h-3" />
                      <span>Ask AI Tutor</span>
                    </button>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 pt-0.5">
                  {currentCard.answerTitle}
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentCard.answerExplanation}
                </p>
              </div>
            )}

            {/* Action Buttons Row 1: Prev, Flip, Next */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={handlePrev}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleFlip}
                className="py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <AppArtwork name="cycle" inline className="w-4 h-4" />
                <span>Flip Card</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons Row 2: SM-2 Ratings (Again, Good, Easy) */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleRate('again')}
                className="py-2 px-3 rounded-xl border border-rose-200 bg-[#fff5f5] hover:bg-rose-100 text-[#ef4444] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <span className="text-sm">🙁</span>
                <span>Again</span>
              </button>

              <button
                type="button"
                onClick={() => handleRate('good')}
                className="py-2 px-3 rounded-xl border-2 border-[#2563eb] bg-white hover:bg-blue-50 text-[#2563eb] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <span className="text-sm">🙂</span>
                <span>Good</span>
              </button>

              <button
                type="button"
                onClick={() => handleRate('easy')}
                className="py-2 px-3 rounded-xl border border-emerald-200 bg-[#f0fdf4] hover:bg-emerald-100 text-[#059669] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
              >
                <span className="text-sm">😄</span>
                <span>Easy</span>
              </button>
            </div>

            {/* Keyboard Shortcuts Strip */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">
                  ← Prev
                </kbd>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">
                  Space
                </kbd>
                <span>Flip</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">
                  → Next
                </kbd>
              </span>
            </div>
          </div>

          {/* Quick Reference Strip for Active Deck */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <AppArtwork name="book" inline className="w-4 h-4 text-blue-600" />
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                Quick Reference — {activeDeck.title}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeDeck.quickReferences.map((ref) => {
                let bgStyle = 'bg-blue-50/70 border-blue-100 text-blue-900';
                let icon = <AppArtwork name="bulb" inline className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;

                if (ref.iconType === 'bulb-green') {
                  bgStyle = 'bg-emerald-50/70 border-emerald-100 text-emerald-900';
                  icon = <AppArtwork name="bulb" inline className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
                } else if (ref.iconType === 'hierarchy-purple') {
                  bgStyle = 'bg-purple-50/70 border-purple-100 text-purple-900';
                  icon = <AppArtwork name="cards" inline className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />;
                }

                return (
                  <div
                    key={ref.id}
                    className={`border rounded-xl p-3 flex items-start gap-2.5 ${bgStyle} shadow-2xs`}
                  >
                    {icon}
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">
                        {ref.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {ref.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: RIGHT PROGRESS, MODES, ACTIONS, TIPS ================= */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-4">
          {/* Card 1: Session Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AppArtwork name="graph" inline className="w-4 h-4 text-blue-600" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  Session Progress
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                25 min
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Today's Flashcard Session
            </p>

            <div className="flex items-center gap-4 pt-1">
              {/* Circular SVG Donut Chart */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Arc 50% */}
                  <path
                    className="text-[#10b981]"
                    strokeDasharray="50, 100"
                    strokeLinecap="round"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-sm font-black text-slate-900 leading-none">
                    50%
                  </span>
                  <span className="text-[8px] font-semibold text-slate-400 mt-0.5">
                    Complete
                  </span>
                </div>
              </div>

              {/* Stats List */}
              <div className="space-y-1 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                    <span>Due Today</span>
                  </div>
                  <span className="font-extrabold text-[#ef4444]">12</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                    <span>Reviewed</span>
                  </div>
                  <span className="font-extrabold text-slate-800">{reviewedCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span>Mastered</span>
                  </div>
                  <span className="font-extrabold text-[#059669]">{masteredCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
                    <span>Accuracy</span>
                  </div>
                  <span className="font-extrabold text-slate-800">{accuracy}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Study Mode */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AppArtwork name="target" inline className="w-4 h-4 text-blue-600" />
                <h4 className="font-extrabold text-sm text-slate-900">
                  Study Mode
                </h4>
              </div>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStudyMode('definition')}
                className={`py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  studyMode === 'definition'
                    ? 'border-2 border-[#2563eb] bg-[#eff6ff] text-[#2563eb] font-bold shadow-2xs'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                }`}
              >
                <AppArtwork name="book" inline className="w-3.5 h-3.5" />
                <span>Definition</span>
              </button>

              <button
                type="button"
                onClick={() => setStudyMode('concept')}
                className={`py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  studyMode === 'concept'
                    ? 'border-2 border-[#2563eb] bg-[#eff6ff] text-[#2563eb] font-bold shadow-2xs'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                }`}
              >
                <AppArtwork name="bulb" inline className="w-3.5 h-3.5" />
                <span>Concept</span>
              </button>

              <button
                type="button"
                onClick={() => setStudyMode('mixed')}
                className={`py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  studyMode === 'mixed'
                    ? 'border-2 border-[#2563eb] bg-[#eff6ff] text-[#2563eb] font-bold shadow-2xs'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                }`}
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                <span>Mixed</span>
              </button>

              <button
                type="button"
                onClick={() => setStudyMode('favorites')}
                className={`py-2 px-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  studyMode === 'favorites'
                    ? 'border-2 border-[#2563eb] bg-[#eff6ff] text-[#2563eb] font-bold shadow-2xs'
                    : 'border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold'
                }`}
              >
                <AppArtwork name="star" inline className="w-3.5 h-3.5" />
                <span>Favorites</span>
              </button>
            </div>
          </div>

          {/* Card 3: Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <AppArtwork name="lightning" inline className="w-4 h-4 text-blue-600" />
              <h4 className="font-extrabold text-sm text-slate-900">
                Quick Actions
              </h4>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleShuffle}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <AppArtwork name="cycle" inline className="w-4 h-4 text-slate-400" />
                <span>Shuffle Deck</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStudyMode('mixed');
                  setCardIndex(0);
                }}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 text-slate-400" />
                <span>Start Mixed Deck</span>
              </button>

              <button
                type="button"
                onClick={() => setIsViewAllOpen(true)}
                className="w-full text-left p-2 rounded-xl hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <ListOrdered className="w-4 h-4 text-slate-400" />
                <span>View All Cards</span>
              </button>
            </div>
          </div>

          {/* Card 4: Study Tips (Yellow Banner matching image.png) */}
          <div className="bg-[#fffdf0] border border-[#fef08a] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <AppArtwork name="bulb" inline className="w-4 h-4 text-amber-500" />
              <h4 className="font-extrabold text-sm text-amber-950">
                Study Tips
              </h4>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2 text-xs text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Try to recall the answer before flipping.</span>
              </div>

              <div className="flex items-start gap-2 text-xs text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Focus on understanding, not just memorizing.</span>
              </div>

              <div className="flex items-start gap-2 text-xs text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Review missed cards more often.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: View All Cards in Current Deck */}
      {isViewAllOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  All Cards — {activeDeck.title} ({currentDeckCards.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Browse and review all questions and answers in this deck.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsViewAllOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 divide-y divide-slate-100">
              {currentDeckCards.map((card, idx) => (
                <div key={card.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-blue-600">
                      Card #{idx + 1}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      {card.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {card.question}
                  </h4>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900">{card.answerTitle}: </strong>
                    <span>{card.answerExplanation}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewAllOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
