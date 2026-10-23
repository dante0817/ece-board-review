import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { useExclusiveDropdown } from '../hooks/useExclusiveDropdown';
import { Sliders, ChevronRight, CheckCircle2, XCircle, Info, ArrowRight, ListOrdered, Check, ChevronDown } from 'lucide-react';

export type PracticeMode =
  | 'quick-check'
  | 'quiz-drill'
  | 'mixed-practice'
  | 'custom-practice'
  | 'exam-mode';

export type ConceptId = 1 | 2 | 3 | 4;

export interface PracticeQuestion {
  id: string;
  conceptId: ConceptId;
  question: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correct: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  keyTakeaway: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const QUESTIONS_DATA: PracticeQuestion[] = [
  // Concept 1: Number Sets
  {
    id: 'c1-q1',
    conceptId: 1,
    question:
      'Which of the following numbers belongs to the Whole Numbers (W) but does NOT belong to the Natural Numbers (N)?',
    options: [
      { id: 'A', text: '1' },
      { id: 'B', text: '0' },
      { id: 'C', text: '-1' },
      { id: 'D', text: '1/2' },
    ],
    correct: 'B',
    explanation:
      '0 belongs to the whole numbers because W = {0, 1, 2, 3, ...}, but in this lesson natural numbers are defined as N = {1, 2, 3, ...}.',
    keyTakeaway:
      'Every natural number is a whole number, but 0 is not a natural number in this definition.',
    difficulty: 'Beginner',
  },
  {
    id: 'c1-q2',
    conceptId: 1,
    question:
      'Which symbol correctly expresses the relationship between the set of Integers (Z) and the set of Rational Numbers (Q)?',
    options: [
      { id: 'A', text: 'Z ⊆ Q' },
      { id: 'B', text: 'Q ⊆ Z' },
      { id: 'C', text: 'Z ∩ Q = ∅' },
      { id: 'D', text: 'Z ∪ Q = N' },
    ],
    correct: 'A',
    explanation:
      'Every integer k can be represented as the fraction k/1. Therefore, every integer is a rational number, meaning Z is a proper subset of Q (Z ⊆ Q).',
    keyTakeaway:
      'All integers are rationals with a denominator of 1: Z ⊂ Q ⊂ R.',
    difficulty: 'Beginner',
  },
  {
    id: 'c1-q3',
    conceptId: 1,
    question:
      'Which set contains negative whole quantities, zero, and positive whole quantities?',
    options: [
      { id: 'A', text: 'Natural Numbers (N)' },
      { id: 'B', text: 'Whole Numbers (W)' },
      { id: 'C', text: 'Integers (Z)' },
      { id: 'D', text: 'Irrational Numbers (I)' },
    ],
    correct: 'C',
    explanation:
      'Integers (Z) include all negative counting counterparts {..., -3, -2, -1}, zero {0}, and positive counting numbers {1, 2, 3, ...}.',
    keyTakeaway:
      'Integers bridge positive and negative discrete values through zero.',
    difficulty: 'Beginner',
  },

  // Concept 2: Rational vs. Irrational
  {
    id: 'c2-q1',
    conceptId: 2,
    question:
      'Why is 22/7 classified as a rational number even though it is commonly used to approximate π?',
    options: [
      { id: 'A', text: 'It can be written as a ratio of two integers with non-zero denominator' },
      { id: 'B', text: 'Its decimal expansion never terminates and never repeats' },
      { id: 'C', text: 'It is equal to the circumference divided by diameter' },
      { id: 'D', text: 'It is a non-algebraic transcendental constant' },
    ],
    correct: 'A',
    explanation:
      'By definition, any number in the form a/b where a, b ∈ Z and b ≠ 0 is rational. 22 and 7 are integers, so 22/7 is purely rational. It is only an approximation of π.',
    keyTakeaway:
      'Never confuse an approximation with the true value. 22/7 is rational; π is irrational.',
    difficulty: 'Intermediate',
  },
  {
    id: 'c2-q2',
    conceptId: 2,
    question:
      'Which of the following conditions guarantees that a reduced fraction a/b produces a terminating decimal?',
    options: [
      { id: 'A', text: 'b has only prime factors of 2 and/or 5' },
      { id: 'B', text: 'b is an odd prime number' },
      { id: 'C', text: 'a is divisible by b' },
      { id: 'D', text: 'b ends with 3, 7, or 9' },
    ],
    correct: 'A',
    explanation:
      'In base 10 (which is 2 × 5), a reduced fraction terminates if and only if its denominator factors strictly into 2^m · 5^n.',
    keyTakeaway:
      'Prime factors of 2 and 5 terminate; any other prime factor in lowest terms forces periodic repetition.',
    difficulty: 'Intermediate',
  },
  {
    id: 'c2-q3',
    conceptId: 2,
    question:
      'What is the result of adding the irrational number √2 to -√2?',
    options: [
      { id: 'A', text: '0 (Rational)' },
      { id: 'B', text: '2√2 (Irrational)' },
      { id: 'C', text: 'Undefined in Real Numbers' },
      { id: 'D', text: 'An imaginary unit' },
    ],
    correct: 'A',
    explanation:
      '√2 + (-√2) = 0. Zero is an integer and rational. This proves that the set of irrational numbers is NOT closed under addition.',
    keyTakeaway:
      'Irrationals are not closed under arithmetic operations.',
    difficulty: 'Intermediate',
  },

  // Concept 3: Classifying Numbers
  {
    id: 'c3-q1',
    conceptId: 3,
    question:
      'How is the quantity √9 classified within the real number system?',
    options: [
      { id: 'A', text: 'Irrational because it has a radical sign' },
      { id: 'B', text: 'Natural, Whole, Integer, Rational, and Real' },
      { id: 'C', text: 'Integer and Rational only' },
      { id: 'D', text: 'Complex non-real number' },
    ],
    correct: 'B',
    explanation:
      'Always simplify radicals first! √9 = 3. Since 3 is a positive counting integer, it belongs to N, W, Z, Q, and R.',
    keyTakeaway:
      'A radical sign does not automatically imply an irrational number. Simplify first!',
    difficulty: 'Beginner',
  },
  {
    id: 'c3-q2',
    conceptId: 3,
    question:
      'In which sets does the value -15 belong?',
    options: [
      { id: 'A', text: 'Natural and Whole only' },
      { id: 'B', text: 'Integers, Rational numbers, and Real numbers' },
      { id: 'C', text: 'Rational numbers only' },
      { id: 'D', text: 'Irrational numbers' },
    ],
    correct: 'B',
    explanation:
      '-15 is a negative integer. It can be written as -15/1, so it is rational, and it lies on the real line.',
    keyTakeaway:
      'Negative integers belong to Z, Q, and R, but not N or W.',
    difficulty: 'Beginner',
  },

  // Concept 4: Ordering & Comparing
  {
    id: 'c4-q1',
    conceptId: 4,
    question:
      'Which comparison statement is mathematically correct?',
    options: [
      { id: 'A', text: '-7 > -3' },
      { id: 'B', text: '-3 > -7' },
      { id: 'C', text: '√2 > 1.5' },
      { id: 'D', text: '-1/2 < -3/4' },
    ],
    correct: 'B',
    explanation:
      'On the real line, values to the right are greater. -3 is closer to 0 than -7, so -3 > -7.',
    keyTakeaway:
      'For negative values, larger absolute values represent smaller magnitudes on the left.',
    difficulty: 'Beginner',
  },
  {
    id: 'c4-q2',
    conceptId: 4,
    question:
      'Which list correctly orders the values from least to greatest: -1.5, 0, √2, and 4/3?',
    options: [
      { id: 'A', text: '-1.5, 0, 4/3, √2' },
      { id: 'B', text: '-1.5, 0, √2, 4/3' },
      { id: 'C', text: '0, -1.5, 4/3, √2' },
      { id: 'D', text: '-1.5, 4/3, 0, √2' },
    ],
    correct: 'A',
    explanation:
      'Convert all to decimals: -1.5 < 0 < 4/3 (1.333...) < √2 (1.414...).',
    keyTakeaway:
      'Convert fractions and radicals to decimal estimates to order quickly: 1.333... < 1.414...',
    difficulty: 'Intermediate',
  },
];

const CONCEPT_NAMES: Record<ConceptId, string> = {
  1: 'Number Sets',
  2: 'Rational vs. Irrational',
  3: 'Classifying Numbers',
  4: 'Ordering & Comparing',
};

interface RealNumbersPracticeProps {
  onOpenAIHelp?: (conceptTitle: string) => void;
  onNavigateLearn?: (stepId: number) => void;
}

export const RealNumbersPractice: React.FC<RealNumbersPracticeProps> = ({
  onOpenAIHelp,
  onNavigateLearn,
}) => {
  // Practice Mode state
  const [activeMode, setActiveMode] = useState<PracticeMode>('quick-check');

  // Selected Concept state
  const [selectedConcept, setSelectedConcept] = useState<ConceptId>(1);

  // Concept switcher dropdown/modal toggle
  const [isConceptDropdownOpen, setIsConceptDropdownOpen] = useExclusiveDropdown();

  // Difficulty dropdown
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [isDiffDropdownOpen, setIsDiffDropdownOpen] = useExclusiveDropdown();

  // Active question index in current concept
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  // User answer state (for active question)
  // Default to 'B' on concept 1 question 1 to match the screenshot!
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({
    'c1-q1': 'B',
  });

  // State to track if explanation is shown
  // Default to true for c1-q1 to match screenshot!
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  // Streak & stats
  const [correctCount, setCorrectCount] = useState<number>(1);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(1);
  const [bestStreak, setBestStreak] = useState<number>(3);

  // Questions for active concept or mixed
  const currentQuestions = useMemo(() => {
    if (activeMode === 'mixed-practice') {
      return QUESTIONS_DATA;
    }
    const filtered = QUESTIONS_DATA.filter((q) => q.conceptId === selectedConcept);
    return filtered.length > 0 ? filtered : QUESTIONS_DATA.slice(0, 3);
  }, [activeMode, selectedConcept]);

  const activeQuestion = currentQuestions[questionIndex] || currentQuestions[0];
  const userAns = selectedAnswers[activeQuestion.id];
  const isCorrect = userAns === activeQuestion.correct;
  const isAnswered = Boolean(userAns);

  // Switch question
  const handleSelectQuestion = (idx: number) => {
    setQuestionIndex(idx);
    setShowExplanation(Boolean(selectedAnswers[currentQuestions[idx]?.id]));
  };

  // Next Question
  const handleNext = () => {
    if (questionIndex < currentQuestions.length - 1) {
      const nextIdx = questionIndex + 1;
      setQuestionIndex(nextIdx);
      setShowExplanation(Boolean(selectedAnswers[currentQuestions[nextIdx]?.id]));
    } else {
      // Loop or finish
      setQuestionIndex(0);
      setShowExplanation(Boolean(selectedAnswers[currentQuestions[0]?.id]));
    }
  };

  // Choose Option
  const handleChooseOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: optId,
    }));
    setShowExplanation(true);

    if (optId === activeQuestion.correct) {
      setCorrectCount((prev) => prev + 1);
      setCurrentStreak((prev) => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      setIncorrectCount((prev) => prev + 1);
      setCurrentStreak(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= COLUMN 1: PRACTICE MODES & CURRENT CONCEPT (approx 3/12 cols) ================= */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">
                Practice
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose a practice mode to build mastery.
              </p>
            </div>

            {/* Mode 1: Quick Check */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('quick-check');
                  setQuestionIndex(0);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeMode === 'quick-check'
                    ? 'border-blue-300 bg-[#eff6ff] shadow-xs ring-1 ring-blue-400/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/80 flex items-center justify-center shrink-0 mt-0.5 app-artwork-tile">
                    <AppArtwork name="lightning" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Quick Check
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Short, focused questions with instant feedback
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
              </button>

              {/* Mode 2: Quiz Drill */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('quiz-drill');
                  setQuestionIndex(0);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeMode === 'quiz-drill'
                    ? 'border-purple-300 bg-purple-50/60 shadow-xs ring-1 ring-purple-400/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100/80 flex items-center justify-center shrink-0 mt-0.5 app-artwork-tile">
                    <AppArtwork name="target" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Quiz Drill
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      3–10 questions per concept
                    </p>
                  </div>
                </div>
              </button>

              {/* Mode 3: Mixed Practice */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('mixed-practice');
                  setQuestionIndex(0);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeMode === 'mixed-practice'
                    ? 'border-indigo-300 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-400/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100/80 flex items-center justify-center shrink-0 mt-0.5 app-artwork-tile">
                    <AppArtwork name="cycle" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Mixed Practice
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Questions from all concepts
                    </p>
                  </div>
                </div>
              </button>

              {/* Mode 4: Custom Practice */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('custom-practice');
                  setQuestionIndex(0);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeMode === 'custom-practice'
                    ? 'border-blue-300 bg-blue-50/60 shadow-xs ring-1 ring-blue-400/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100/80 flex items-center justify-center shrink-0 mt-0.5">
                    <Sliders className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Custom Practice
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Choose topics and difficulty
                    </p>
                  </div>
                </div>
              </button>

              {/* Mode 5: Exam Mode */}
              <button
                type="button"
                onClick={() => {
                  setActiveMode('exam-mode');
                  setQuestionIndex(0);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  activeMode === 'exam-mode'
                    ? 'border-amber-300 bg-amber-50/60 shadow-xs ring-1 ring-amber-400/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100/80 flex items-center justify-center shrink-0 mt-0.5 app-artwork-tile">
                    <AppArtwork name="exam" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Exam Mode
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Timed, no feedback (board-style)
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Current Concept Section */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-500">
                Current Concept
              </span>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#2563eb] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {selectedConcept}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {CONCEPT_NAMES[selectedConcept]}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">
                    100%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  3/3 answered
                </div>
              </div>

              {/* Change Concept dropdown button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsConceptDropdownOpen(!isConceptDropdownOpen)}
                  className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-slate-400" />
                    <span>Change Concept</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isConceptDropdownOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {isConceptDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 z-20 space-y-1">
                    {([1, 2, 3, 4] as ConceptId[]).map((cid) => (
                      <button
                        key={cid}
                        type="button"
                        onClick={() => {
                          setSelectedConcept(cid);
                          setQuestionIndex(0);
                          setIsConceptDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${
                          selectedConcept === cid
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>
                          {cid}. {CONCEPT_NAMES[cid]}
                        </span>
                        {selectedConcept === cid && (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2: CENTER ACTIVE QUESTION & EXPLANATION (approx 6/12 cols) ================= */}
        <div className="lg:col-span-8 xl:col-span-6 space-y-4">
          {/* Header row matching screenshot */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs app-artwork-tile">
                <AppArtwork name="shield" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  Quick Check — {CONCEPT_NAMES[selectedConcept]}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Build confidence with a few questions and get instant feedback.
                </p>
              </div>
            </div>

            {/* Beginner difficulty dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDiffDropdownOpen(!isDiffDropdownOpen)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
              >
                <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedDifficulty}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isDiffDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl border border-slate-200 shadow-lg p-1 z-20 space-y-0.5">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        setSelectedDifficulty(diff);
                        setIsDiffDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        selectedDifficulty === diff
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stepper Bar: Question 1 of 3 */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-800">
              Question {questionIndex + 1} of {currentQuestions.length}
            </span>

            {/* Step Indicators */}
            <div className="flex items-center gap-2">
              {currentQuestions.map((_, idx) => {
                const isActive = idx === questionIndex;
                const isPast = idx < questionIndex;
                return (
                  <React.Fragment key={idx}>
                    <button
                      type="button"
                      onClick={() => handleSelectQuestion(idx)}
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2563eb] text-white shadow-2xs ring-2 ring-blue-200'
                          : isPast
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                    {idx < currentQuestions.length - 1 && (
                      <div
                        className={`w-8 sm:w-12 h-0.5 ${
                          idx < questionIndex ? 'bg-blue-500' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Question Box Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {activeQuestion.question}
            </h2>

            {/* 2x2 Grid Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeQuestion.options.map((opt) => {
                const isSelected = userAns === opt.id;
                let optContainerStyle =
                  'bg-white border-slate-200 text-slate-800 hover:border-slate-300';

                if (isSelected) {
                  optContainerStyle =
                    'border-2 border-[#2563eb] bg-[#f0f7ff] text-slate-900 shadow-2xs font-bold';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChooseOption(opt.id)}
                    className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center gap-3 transition-all cursor-pointer ${optContainerStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#2563eb] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="font-medium text-slate-900">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation / Feedback Box (shown when answered or toggled) */}
            {isAnswered && showExplanation && (
              <div
                className={`rounded-2xl p-5 border space-y-3.5 animate-in fade-in duration-200 ${
                  isCorrect
                    ? 'bg-[#f0fdf4] border-[#bbf7d0]'
                    : 'bg-[#fff8f8] border-[#fecdd3]'
                }`}
              >
                {/* Top Status line */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="font-extrabold text-sm sm:text-base text-emerald-800">
                          Correct!
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span className="font-extrabold text-sm sm:text-base text-rose-800">
                          Incorrect
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => alert('Issue reported to TopNotch curriculum team.')}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    Report an issue
                  </button>
                </div>

                {/* Main Explanation */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {activeQuestion.explanation}
                </p>

                {/* Key Takeaway box matching image.png */}
                <div className="bg-[#fffdf0] border border-[#fef08a] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                    <AppArtwork name="bulb" inline className="w-4 h-4 text-amber-500" />
                    <span>Key Takeaway</span>
                  </div>
                  <p className="text-xs text-amber-900/90 leading-relaxed pl-5">
                    {activeQuestion.keyTakeaway}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions Row: Show Explanation & Next Question */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
              >
                {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: RIGHT PRACTICE STATS & NEED HELP (approx 3/12 cols) ================= */}
        <div className="lg:col-span-12 xl:col-span-3 space-y-4">
          {/* Card 1: Practice Stats */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900">
              Practice Stats
            </h4>

            {/* Session Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Session Progress</span>
                <span className="font-bold text-slate-700">
                  {questionIndex + 1} / {currentQuestions.length}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${((questionIndex + 1) / currentQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* 3 Metrics: Correct, Incorrect, Accuracy */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0]/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <div className="font-black text-slate-900 text-sm">{correctCount}</div>
                <div className="text-[10px] text-slate-500 font-semibold">Correct</div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#fff5f5] border border-rose-200/60">
                <XCircle className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                <div className="font-black text-slate-900 text-sm">{incorrectCount}</div>
                <div className="text-[10px] text-slate-500 font-semibold">Incorrect</div>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                <AppArtwork name="target" inline className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                <div className="font-black text-slate-900 text-sm">
                  {correctCount + incorrectCount === 0
                    ? '100%'
                    : `${Math.round((correctCount / (correctCount + incorrectCount)) * 100)}%`}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">Accuracy</div>
              </div>
            </div>

            {/* Current Streak */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">
                  Current Streak
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AppArtwork name="flame" inline className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-900">
                    {currentStreak} correct
                  </span>
                </div>
              </div>
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer" />
            </div>

            {/* Concept Mastery section */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Concept Mastery</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {CONCEPT_NAMES[selectedConcept]}
                </span>
                <span className="font-bold text-emerald-600">100%</span>
              </div>

              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-full" />
              </div>

              <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                <div className="flex justify-between">
                  <span>Questions Answered</span>
                  <span className="font-bold text-slate-700">3 / 3</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Practice</span>
                  <span className="font-medium text-slate-700">Today, 2:14 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Streak</span>
                  <span className="font-bold text-slate-700">{bestStreak}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Need Help? / Ask AI Tutor */}
          <div className="bg-[#f5f3ff] border border-[#ddd6fe] rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <AppArtwork name="chat" inline className="w-4 h-4 text-purple-600" />
              <h4 className="font-extrabold text-sm text-purple-950">
                Need Help?
              </h4>
            </div>

            <p className="text-xs text-purple-900/80 leading-relaxed">
              Get a hint, explanation, or a similar question from your AI Tutor.
            </p>

            <button
              type="button"
              onClick={() => {
                if (onOpenAIHelp) {
                  onOpenAIHelp(
                    `Practice question assistance on ${CONCEPT_NAMES[selectedConcept]}: ${activeQuestion.question}`
                  );
                } else {
                  alert(
                    `AI Tutor activated: Explaining why "${activeQuestion.options.find((o) => o.id === activeQuestion.correct)?.text}" is correct for ${CONCEPT_NAMES[selectedConcept]}.`
                  );
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <AppArtwork name="star" inline className="w-3.5 h-3.5" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
