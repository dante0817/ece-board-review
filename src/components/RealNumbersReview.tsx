import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { ChevronRight, AlertTriangle, Sliders, ArrowRight, Check } from 'lucide-react';
import { MathFormula } from './MathFormula';

interface ReviewQueueItem {
  id: string;
  number: number;
  title: string;
  retention: number;
  dueStatus: string;
  dueType: 'due-now' | 'due-today' | 'tomorrow' | 'mastered';
  statusSubtext: string;
  question: {
    text: string;
    options: { id: string; label: string; text: string; isMath?: boolean }[];
    correctOptionId: string;
    explanation: string;
    commonTrap: string;
  };
  notes: {
    keyTakeaway: string;
    definition: string;
    example: string;
  };
}

const REVIEW_QUEUE_DATA: ReviewQueueItem[] = [
  {
    id: 'rational-irrational',
    number: 1,
    title: 'Rational vs. Irrational',
    retention: 67,
    dueStatus: 'Due now',
    dueType: 'due-now',
    statusSubtext: 'Retention 67%',
    question: {
      text: 'Which of the following numbers is irrational?',
      options: [
        { id: 'A', label: 'A', text: '0.25' },
        { id: 'B', label: 'B', text: '-7' },
        { id: 'C', label: 'C', text: '√2', isMath: true },
        { id: 'D', label: 'D', text: '3/4', isMath: true },
      ],
      correctOptionId: 'C',
      explanation: '√2 cannot be expressed as a ratio of integers, so it is irrational.',
      commonTrap:
        'A radical is not always irrational. For example, √9 = 3, which is rational because it can be written as a ratio of integers.',
    },
    notes: {
      keyTakeaway:
        'Irrational numbers cannot be written as a ratio of integers and have non-terminating, non-repeating decimals.',
      definition:
        'An irrational number is a real number that cannot be expressed as a/b, where a and b are integers and b ≠ 0.',
      example:
        '√2, π, and e are irrational numbers because their decimal expansions are non-terminating and non-repeating.',
    },
  },
  {
    id: 'classifying-numbers',
    number: 2,
    title: 'Classifying Numbers',
    retention: 74,
    dueStatus: 'Due today',
    dueType: 'due-today',
    statusSubtext: 'Retention 74%',
    question: {
      text: 'To which number sets does -5 belong?',
      options: [
        { id: 'A', label: 'A', text: 'Natural and Whole numbers' },
        { id: 'B', label: 'B', text: 'Integers, Rational, and Real numbers' },
        { id: 'C', label: 'C', text: 'Irrational and Real numbers' },
        { id: 'D', label: 'D', text: 'Whole numbers and Integers only' },
      ],
      correctOptionId: 'B',
      explanation:
        '-5 is an integer, can be expressed as -5/1 (rational), and lies on the real number line (real).',
      commonTrap:
        'Negative numbers are NOT whole numbers (W starts at 0: 0, 1, 2, 3...) or natural numbers.',
    },
    notes: {
      keyTakeaway:
        'Every natural number is a whole number, every whole number is an integer, and every integer is rational.',
      definition:
        'Integers (ℤ) include all positive and negative whole numbers and zero: {..., -2, -1, 0, 1, 2, ...}.',
      example:
        '0 is a whole number, integer, and rational, but NOT a natural number.',
    },
  },
  {
    id: 'ordering-comparing',
    number: 3,
    title: 'Ordering & Comparing',
    retention: 89,
    dueStatus: 'Tomorrow',
    dueType: 'tomorrow',
    statusSubtext: 'Retention 89%',
    question: {
      text: 'Which inequality correctly compares -3.5 and -2.8?',
      options: [
        { id: 'A', label: 'A', text: '-3.5 > -2.8' },
        { id: 'B', label: 'B', text: '-3.5 < -2.8' },
        { id: 'C', label: 'C', text: '-3.5 = -2.8' },
        { id: 'D', label: 'D', text: 'Cannot be determined' },
      ],
      correctOptionId: 'B',
      explanation:
        'On a horizontal number line, numbers further to the left are smaller. -3.5 lies to the left of -2.8, so -3.5 < -2.8.',
      commonTrap:
        'With negative numbers, larger absolute value means smaller value: |-3.5| = 3.5 > 2.8, hence -3.5 < -2.8.',
    },
    notes: {
      keyTakeaway:
        'For negative numbers, the number with the larger absolute value is smaller.',
      definition:
        'a < b if and only if (b - a) is strictly positive on the real number line.',
      example:
        '-100 is much smaller than -1 even though 100 > 1.',
    },
  },
  {
    id: 'number-sets',
    number: 4,
    title: 'Number Sets',
    retention: 100,
    dueStatus: 'Mastered',
    dueType: 'mastered',
    statusSubtext: 'Next in 3 days',
    question: {
      text: 'Which set of numbers has the density property on the real line?',
      options: [
        { id: 'A', label: 'A', text: 'Natural numbers only' },
        { id: 'B', label: 'B', text: 'Integers only' },
        { id: 'C', label: 'C', text: 'Rational numbers ℚ' },
        { id: 'D', label: 'D', text: 'Prime numbers' },
      ],
      correctOptionId: 'C',
      explanation:
        'Between any two distinct rational numbers, there exists infinitely many other rational numbers: (a + b) / 2 is rational.',
      commonTrap:
        'Integers do not have the density property: there are no integers between 2 and 3.',
    },
    notes: {
      keyTakeaway:
        'The rationals ℚ and reals ℝ are dense; integers ℤ and naturals ℕ are discrete.',
      definition:
        'A set S has density if between any two elements x, y ∈ S with x < y, there exists z ∈ S such that x < z < y.',
      example:
        'Between 0.1 and 0.2 lies 0.15, 0.155, 0.1555, ad infinitum.',
    },
  },
];

interface RealNumbersReviewProps {
  onOpenAIHelp?: (prompt: string) => void;
  onNavigateLearn?: (stepId: number) => void;
}

export const RealNumbersReview: React.FC<RealNumbersReviewProps> = ({
  onOpenAIHelp,
  onNavigateLearn,
}) => {
  const [activeQueueFilter, setActiveQueueFilter] = useState<'due' | 'weak' | 'mistakes' | 'scheduled'>('due');
  const [selectedQueueIndex, setSelectedQueueIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('C');
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState<boolean>(true);
  const [showExplanationDetail, setShowExplanationDetail] = useState<boolean>(false);
  const [activeReviewMode, setActiveReviewMode] = useState<string>('spaced');
  const [feedbackRating, setFeedbackRating] = useState<'again' | 'good' | 'easy' | null>(null);

  const currentItem = REVIEW_QUEUE_DATA[selectedQueueIndex] || REVIEW_QUEUE_DATA[0];
  const isCorrect = selectedOptionId === currentItem.question.correctOptionId;

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
    setHasCheckedAnswer(true);
  };

  const handleNextItem = () => {
    const nextIdx = (selectedQueueIndex + 1) % REVIEW_QUEUE_DATA.length;
    setSelectedQueueIndex(nextIdx);
    // Set default selected option for demonstration or reset
    setSelectedOptionId(REVIEW_QUEUE_DATA[nextIdx].question.correctOptionId);
    setHasCheckedAnswer(true);
    setShowExplanationDetail(false);
    setFeedbackRating(null);
  };

  const handleSelectQueueItem = (idx: number) => {
    setSelectedQueueIndex(idx);
    setSelectedOptionId(REVIEW_QUEUE_DATA[idx].question.correctOptionId);
    setHasCheckedAnswer(true);
    setShowExplanationDetail(false);
    setFeedbackRating(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* 3-Column Grid Layout matching image.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLUMN 1 (LEFT): Review Queue & Review Modes ================= */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          
          {/* CARD 1: Review Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Review Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review concepts to strengthen your mastery.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveQueueFilter('due')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeQueueFilter === 'due'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
                <span>Due Today</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveQueueFilter('weak')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeQueueFilter === 'weak'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AppArtwork name="book" inline className="w-3.5 h-3.5" />
                <span>Weak Concepts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveQueueFilter('mistakes')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeQueueFilter === 'mistakes'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AppArtwork name="star" inline className="w-3.5 h-3.5" />
                <span>Mistakes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveQueueFilter('scheduled')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeQueueFilter === 'scheduled'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <AppArtwork name="calendar" inline className="w-3.5 h-3.5" />
                <span>Scheduled</span>
              </button>
            </div>

            {/* Queue Items List */}
            <div className="space-y-2.5 pt-1">
              {REVIEW_QUEUE_DATA.map((item, idx) => {
                const isSelected = selectedQueueIndex === idx;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectQueueItem(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Number Circle Badge */}
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.number}
                      </span>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.title}
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.dueType === 'mastered' ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${item.retention}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right status */}
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <div
                          className={`text-xs font-bold ${
                            item.dueType === 'due-now' || item.dueType === 'due-today'
                              ? 'text-rose-600'
                              : item.dueType === 'mastered'
                              ? 'text-emerald-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {item.dueStatus}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {item.statusSubtext}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 2: Review Modes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Review Modes</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose a review mode that fits your goal.
              </p>
            </div>

            <div className="space-y-2">
              {/* Mode 1: Spaced Repetition */}
              <button
                type="button"
                onClick={() => setActiveReviewMode('spaced')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  activeReviewMode === 'spaced'
                    ? 'border-blue-300 bg-blue-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 app-artwork-tile">
                    <AppArtwork name="timer" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Spaced Repetition</div>
                    <div className="text-[11px] text-slate-500">Review at optimal intervals</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Mode 2: Mistake Review */}
              <button
                type="button"
                onClick={() => setActiveReviewMode('mistakes')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  activeReviewMode === 'mistakes'
                    ? 'border-rose-300 bg-rose-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Mistake Review</div>
                    <div className="text-[11px] text-slate-500">Focus on questions you missed</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Mode 3: Quick Refresh */}
              <button
                type="button"
                onClick={() => setActiveReviewMode('quick')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  activeReviewMode === 'quick'
                    ? 'border-blue-300 bg-blue-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 app-artwork-tile">
                    <AppArtwork name="lightning" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Quick Refresh</div>
                    <div className="text-[11px] text-slate-500">Short review of key concepts</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Mode 4: Custom Review */}
              <button
                type="button"
                onClick={() => setActiveReviewMode('custom')}
                className={`w-full p-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  activeReviewMode === 'custom'
                    ? 'border-blue-300 bg-blue-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Custom Review</div>
                    <div className="text-[11px] text-slate-500">Choose specific topics or cards</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2 (CENTER): Today's Review Question Workspace ================= */}
        <div className="lg:col-span-8 xl:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Today&apos;s Review — {currentItem.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Test your understanding and reinforce key concepts.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/80 text-xs font-bold shrink-0">
                Card {selectedQueueIndex + 1} of {REVIEW_QUEUE_DATA.length}
              </span>
            </div>

            {/* Question Text */}
            <div className="pt-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {currentItem.question.text}
              </h3>
            </div>

            {/* 2x2 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentItem.question.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const isItemCorrect = option.id === currentItem.question.correctOptionId;

                let cardStyle =
                  'bg-white border-slate-200 text-slate-800 hover:border-slate-300';
                let badgeStyle = 'bg-slate-100 text-slate-700';

                if (isSelected) {
                  if (isItemCorrect) {
                    cardStyle =
                      'bg-emerald-50/40 border-emerald-500 ring-1 ring-emerald-500 text-slate-900 font-semibold';
                    badgeStyle = 'bg-emerald-500 text-white font-bold';
                  } else {
                    cardStyle =
                      'bg-rose-50/40 border-rose-500 ring-1 ring-rose-500 text-slate-900 font-semibold';
                    badgeStyle = 'bg-rose-500 text-white font-bold';
                  }
                }

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center gap-3 transition-all cursor-pointer ${cardStyle}`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${badgeStyle}`}
                    >
                      {option.label}
                    </span>
                    <span className="font-medium text-slate-900">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Correct Feedback Box */}
            {hasCheckedAnswer && isCorrect && (
              <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Correct!</span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900 pl-7 leading-relaxed">
                  {currentItem.question.explanation}
                </p>
              </div>
            )}

            {/* Common Trap Banner */}
            <div className="p-4 rounded-2xl bg-[#fff8f8] border border-rose-200/80 space-y-1">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Common Trap</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 pl-6 leading-relaxed">
                {currentItem.question.commonTrap}
              </p>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between gap-2 pt-2 flex-wrap sm:flex-nowrap border-t border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowExplanationDetail(!showExplanationDetail)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-blue-600 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  {showExplanationDetail ? 'Hide Explanation' : 'Show Explanation'}
                </button>

                {/* Rating Buttons */}
                <button
                  type="button"
                  onClick={() => setFeedbackRating('again')}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    feedbackRating === 'again'
                      ? 'bg-rose-100 text-rose-700 border-rose-300'
                      : 'bg-rose-50/60 hover:bg-rose-100 text-rose-600 border-rose-200'
                  }`}
                >
                  <span>☹</span>
                  <span>Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackRating('good')}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    feedbackRating === 'good'
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-blue-50/60 hover:bg-blue-100 text-blue-600 border-blue-200'
                  }`}
                >
                  <span>🙂</span>
                  <span>Good</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackRating('easy')}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    feedbackRating === 'easy'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : 'bg-emerald-50/60 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                  }`}
                >
                  <span>😄</span>
                  <span>Easy</span>
                </button>
              </div>

              {/* Next Review Item Button */}
              <button
                type="button"
                onClick={handleNextItem}
                className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ml-auto"
              >
                <span>Next Review Item</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Expanded Explanation if toggled */}
            {showExplanationDetail && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-slate-900">Step-by-Step Proof &amp; Analysis:</div>
                <p>
                  Assume √2 is rational: then √2 = a/b in lowest terms (gcd(a, b) = 1).
                  Squaring gives 2 = a²/b², so a² = 2b², meaning a² is even and therefore a is even (a = 2k).
                  Substituting gives (2k)² = 2b² ⇒ 4k² = 2b² ⇒ b² = 2k², so b is also even.
                  This contradicts gcd(a, b) = 1! Hence, √2 cannot be rational and must be irrational.
                </p>
              </div>
            )}
          </div>

          {/* Related Concept Notes (3 Cards matching image.png) */}
          <div className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Related Concept Notes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Note 1: Key Takeaway */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60 app-artwork-tile">
                    <AppArtwork name="bulb" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Key Takeaway</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {currentItem.notes.keyTakeaway}
                </p>
              </div>

              {/* Note 2: Definition */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 app-artwork-tile">
                    <AppArtwork name="book" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Definition</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {currentItem.notes.definition}
                </p>
              </div>

              {/* Note 3: Example */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 app-artwork-tile">
                    <AppArtwork name="exam" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Example</h3>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {currentItem.notes.example}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3 (RIGHT): Retention Overview & Schedule ================= */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-6">
          
          {/* CARD 1: Retention Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Retention Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your progress across this module.
              </p>
            </div>

            {/* Circular Donut + Stats Row */}
            <div className="flex items-center justify-between gap-4 py-1">
              {/* Circular Gauge / Donut */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Mastered / Green arc */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="92, 100"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Due / Red arc */}
                  <path
                    className="text-rose-500"
                    strokeDasharray="15, 100"
                    strokeDashoffset="-75"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
                  <span className="text-base font-extrabold text-slate-900 leading-none">92%</span>
                  <span className="text-[9px] font-medium text-slate-500 mt-0.5 leading-tight">
                    Overall<br />Retention
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <span>Due Today</span>
                  </div>
                  <span className="font-bold text-slate-900">12</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <span>Reviewed</span>
                  </div>
                  <span className="font-bold text-slate-900">5</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Mastered</span>
                  </div>
                  <span className="font-bold text-slate-900">2</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                    <span>Accuracy</span>
                  </div>
                  <span className="font-bold text-slate-900">92%</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Upcoming Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AppArtwork name="calendar" inline className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Upcoming Schedule
                </h2>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <p className="text-xs text-slate-500 -mt-2">
              Cards due for review in the coming days.
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="font-medium">Today</span>
                </div>
                <span className="font-bold text-rose-600">12 cards</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-medium">Tomorrow</span>
                </div>
                <span className="font-semibold text-slate-600">8 cards</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-medium">Sep 20</span>
                </div>
                <span className="font-semibold text-slate-600">6 cards</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-medium">Sep 21</span>
                </div>
                <span className="font-semibold text-slate-600">4 cards</span>
              </div>
            </div>
          </div>

          {/* CARD 3: Need Help? */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 app-artwork-tile">
                <AppArtwork name="chat" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Need Help?</h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Get a hint, explanation, or a similar question from your AI Tutor.
            </p>

            <button
              type="button"
              onClick={() =>
                onOpenAIHelp?.(
                  `Help me review Real Numbers & Number Systems, specifically: "${currentItem.title}". Explain the underlying theory and solve example problems.`
                )
              }
              className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <AppArtwork name="star" inline className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
