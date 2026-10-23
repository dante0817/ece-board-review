import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { ConceptId, recordQuizPerformanceForConcept } from '../utils/realNumbersScheduler';
import {
  recordConceptAssessment,
  ConceptMasteryData,
  MASTERY_LEVEL_COLORS,
  MASTERY_LEVEL_LABELS,
} from '../utils/conceptMasteryEngine';
import { MasterySegmentBar } from './MasterySegmentBar';

export interface AssessmentQuestion {
  id: string;
  conceptId: ConceptId;
  question: string;
  options: { id: string; text: string }[];
  correctId: string;
  explanation: string;
  difficulty: 'basic' | 'intermediate' | 'challenge';
}

const ADAPTIVE_BANK: Record<ConceptId, AssessmentQuestion[]> = {
  1: [
    {
      id: 'a1-1',
      conceptId: 1,
      question: 'Which number belongs to the Whole Numbers (W) but NOT to Natural Numbers (ℕ)?',
      options: [
        { id: 'a', text: '1' },
        { id: 'b', text: '0' },
        { id: 'c', text: '-1' },
        { id: 'd', text: '1/2' },
      ],
      correctId: 'b',
      explanation: 'Natural numbers ℕ start at 1. Whole numbers W = {0, 1, 2, ...} include zero. Zero is whole, but not natural.',
      difficulty: 'basic',
    },
    {
      id: 'a1-2',
      conceptId: 1,
      question: 'Which of the following set relations is FALSE?',
      options: [
        { id: 'a', text: 'ℕ ⊂ ℤ' },
        { id: 'b', text: 'ℤ ⊂ ℚ' },
        { id: 'c', text: 'ℚ ⊂ (ℝ \\ ℚ)' },
        { id: 'd', text: 'ℚ ⊂ ℝ' },
      ],
      correctId: 'c',
      explanation: 'Rational numbers ℚ and irrational numbers ℝ \\ ℚ are mutually disjoint. A rational number can never be a subset of irrationals.',
      difficulty: 'intermediate',
    },
    {
      id: 'a1-3',
      conceptId: 1,
      question: 'What is the value of -√64, and to which smallest standard set does it belong?',
      options: [
        { id: 'a', text: '-8, Integers (ℤ)' },
        { id: 'b', text: '-8, Whole Numbers (W)' },
        { id: 'c', text: '8, Natural Numbers (ℕ)' },
        { id: 'd', text: 'Irrational (ℝ \\ ℚ)' },
      ],
      correctId: 'a',
      explanation: '-√64 = -8. Because it is a negative whole number, its minimal standard set is the Integers ℤ.',
      difficulty: 'intermediate',
    },
    {
      id: 'a1-4',
      conceptId: 1,
      question: 'If a number x ∈ ℤ, which statement is GUARANTEED to be true?',
      options: [
        { id: 'a', text: 'x ∈ ℕ' },
        { id: 'b', text: 'x ∈ W' },
        { id: 'c', text: 'x ∈ ℚ' },
        { id: 'd', text: 'x > 0' },
      ],
      correctId: 'c',
      explanation: 'Because ℤ ⊂ ℚ, every integer is automatically a rational number (x = x/1). Negative integers are not in ℕ or W.',
      difficulty: 'challenge',
    },
    {
      id: 'a1-5',
      conceptId: 1,
      question: 'Under which operation are Integers (ℤ) NOT closed?',
      options: [
        { id: 'a', text: 'Addition' },
        { id: 'b', text: 'Subtraction' },
        { id: 'c', text: 'Multiplication' },
        { id: 'd', text: 'Division' },
      ],
      correctId: 'd',
      explanation: 'Dividing two integers can produce a fraction (e.g. 1 ÷ 2 = 0.5 ∉ ℤ). ℤ is not closed under division.',
      difficulty: 'challenge',
    },
  ],

  2: [
    {
      id: 'a2-1',
      conceptId: 2,
      question: 'Which of the following numbers is strictly IRRATIONAL?',
      options: [
        { id: 'a', text: '22/7' },
        { id: 'b', text: '0.333...' },
        { id: 'c', text: '√18' },
        { id: 'd', text: '√0.09' },
      ],
      correctId: 'c',
      explanation: '√18 = 3√2. Since 2 is not a square, √2 is irrational, making 3√2 irrational. 22/7 is rational (fraction of integers); 0.333... = 1/3; √0.09 = 0.3 = 3/10.',
      difficulty: 'basic',
    },
    {
      id: 'a2-2',
      conceptId: 2,
      question: 'Convert the repeating decimal 0.272727... (0.27) to a simplified rational fraction:',
      options: [
        { id: 'a', text: '27/100' },
        { id: 'b', text: '3/11' },
        { id: 'c', text: '27/90' },
        { id: 'd', text: '9/33' },
      ],
      correctId: 'b',
      explanation: 'For a two-digit repetend: 27/99. Dividing numerator and denominator by 9 gives 3/11.',
      difficulty: 'intermediate',
    },
    {
      id: 'a2-3',
      conceptId: 2,
      question: 'If a is a non-zero rational number and b is irrational, their sum (a + b) is always:',
      options: [
        { id: 'a', text: 'Rational' },
        { id: 'b', text: 'Irrational' },
        { id: 'c', text: 'Zero' },
        { id: 'd', text: 'An integer' },
      ],
      correctId: 'b',
      explanation: 'The sum of any rational and irrational number is always irrational. If a + b were rational (r), then b = r - a would be rational, a contradiction.',
      difficulty: 'intermediate',
    },
    {
      id: 'a2-4',
      conceptId: 2,
      question: 'Which of the following operations between two irrational numbers produces a RATIONAL result?',
      options: [
        { id: 'a', text: '√2 + √3' },
        { id: 'b', text: '√8 · √2' },
        { id: 'c', text: 'π · √5' },
        { id: 'd', text: '√3 ÷ √2' },
      ],
      correctId: 'b',
      explanation: '√8 · √2 = √(8 · 2) = √16 = 4, which is a rational whole integer.',
      difficulty: 'challenge',
    },
    {
      id: 'a2-5',
      conceptId: 2,
      question: 'Is 0.1010010001... (where zeroes increase by one) rational or irrational?',
      options: [
        { id: 'a', text: 'Rational because it follows a clear rule' },
        { id: 'b', text: 'Irrational because it never repeats a fixed block of digits' },
        { id: 'c', text: 'Rational because it only contains 0 and 1' },
        { id: 'd', text: 'Not a real number' },
      ],
      correctId: 'b',
      explanation: 'A pattern is not periodic repetition. Because no fixed finite block repeats endlessly, it is non-terminating and non-repeating, hence irrational.',
      difficulty: 'challenge',
    },
  ],

  3: [
    {
      id: 'a3-1',
      conceptId: 3,
      question: 'Evaluate the principal square root: √((-7)²)',
      options: [
        { id: 'a', text: '-7' },
        { id: 'b', text: '±7' },
        { id: 'c', text: '7' },
        { id: 'd', text: '49' },
      ],
      correctId: 'c',
      explanation: 'By standard mathematical definition, the principal radical symbol denotes the non-negative square root: √(x²) = |x|. √((-7)²) = |-7| = 7.',
      difficulty: 'basic',
    },
    {
      id: 'a3-2',
      conceptId: 3,
      question: 'Classify the number -√144 / 3 into all its applicable number sets:',
      options: [
        { id: 'a', text: 'Integer, Rational, and Real' },
        { id: 'b', text: 'Irrational and Real only' },
        { id: 'c', text: 'Natural, Whole, and Integer' },
        { id: 'd', text: 'Non-real imaginary' },
      ],
      correctId: 'a',
      explanation: '√144 = 12, so -12/3 = -4. The number -4 is an integer, rational (-4/1), and real. It is not natural or whole because it is negative.',
      difficulty: 'intermediate',
    },
    {
      id: 'a3-3',
      conceptId: 3,
      question: 'Which of the following is mathematically UNDEFINED in the real numbers?',
      options: [
        { id: 'a', text: '0 / 7' },
        { id: 'b', text: '7 / 0' },
        { id: 'c', text: '√0' },
        { id: 'd', text: '0²' },
      ],
      correctId: 'b',
      explanation: 'Division by zero is strictly undefined in ℝ. 0 / 7 = 0, but 7 / 0 is undefined.',
      difficulty: 'basic',
    },
    {
      id: 'a3-4',
      conceptId: 3,
      question: 'Simplify and classify: √(48) / √(3)',
      options: [
        { id: 'a', text: '4, which is Natural, Whole, Integer, Rational, and Real' },
        { id: 'b', text: '√16, which is strictly Irrational' },
        { id: 'c', text: '16, which is Rational only' },
        { id: 'd', text: '4/3, which is Rational only' },
      ],
      correctId: 'a',
      explanation: '√(48/3) = √16 = 4. The number 4 is in ℕ, W, ℤ, ℚ, and ℝ.',
      difficulty: 'challenge',
    },
  ],

  4: [
    {
      id: 'a4-1',
      conceptId: 4,
      question: 'Arrange in ascending order: 4/3, 1.4, √2, 3/2.',
      options: [
        { id: 'a', text: '4/3 < 1.4 < √2 < 3/2' },
        { id: 'b', text: '1.4 < 4/3 < √2 < 3/2' },
        { id: 'c', text: '√2 < 1.4 < 4/3 < 3/2' },
        { id: 'd', text: '4/3 < √2 < 1.4 < 3/2' },
      ],
      correctId: 'a',
      explanation: '4/3 ≈ 1.333, 1.4 = 1.400, √2 ≈ 1.414, 3/2 = 1.500. Order: 1.333 < 1.400 < 1.414 < 1.500.',
      difficulty: 'basic',
    },
    {
      id: 'a4-2',
      conceptId: 4,
      question: 'Compare the negative numbers -7/4 and -√3:',
      options: [
        { id: 'a', text: '-7/4 < -√3' },
        { id: 'b', text: '-7/4 > -√3' },
        { id: 'c', text: '-7/4 = -√3' },
        { id: 'd', text: 'Cannot compare rational and irrational' },
      ],
      correctId: 'a',
      explanation: '-7/4 = -1.750 and -√3 ≈ -1.732. Since -1.750 is further left on the number line, -1.750 < -1.732.',
      difficulty: 'intermediate',
    },
    {
      id: 'a4-3',
      conceptId: 4,
      question: 'Which of the following numbers lies strictly between -1.75 and -√2 on the coordinate line?',
      options: [
        { id: 'a', text: '-2.0' },
        { id: 'b', text: '-1.6' },
        { id: 'c', text: '-1.2' },
        { id: 'd', text: '0' },
      ],
      correctId: 'b',
      explanation: '-√2 ≈ -1.414. The interval is (-1.75, -1.414). The value -1.6 is greater than -1.75 and less than -1.414.',
      difficulty: 'intermediate',
    },
    {
      id: 'a4-4',
      conceptId: 4,
      question: 'The Density Property of the Real Numbers guarantees that:',
      options: [
        { id: 'a', text: 'Between any two distinct real numbers, there is infinitely many real numbers' },
        { id: 'b', text: 'Real numbers must be positive integers' },
        { id: 'c', text: 'Every real number has an immediate adjacent neighbor' },
        { id: 'd', text: 'Rational numbers outnumber irrational numbers' },
      ],
      correctId: 'a',
      explanation: 'Density means there are no "gaps" in ℝ: between any two distinct real numbers a < b, there are infinitely many real numbers.',
      difficulty: 'challenge',
    },
  ],
};

interface AdaptiveMasteryAssessmentModalProps {
  conceptId: ConceptId;
  conceptTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onAssessmentCompleted?: (updated: ConceptMasteryData) => void;
}

export const AdaptiveMasteryAssessmentModal: React.FC<AdaptiveMasteryAssessmentModalProps> = ({
  conceptId,
  conceptTitle,
  isOpen,
  onClose,
  onAssessmentCompleted,
}) => {
  const allQuestions = ADAPTIVE_BANK[conceptId] || ADAPTIVE_BANK[1];

  // Active question index (0-based)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<ConceptMasteryData | null>(null);

  // Dynamic active questions list (starts with 3, can expand to 4 or 5 based on consistency)
  const [activeQuestions, setActiveQuestions] = useState<AssessmentQuestion[]>(() =>
    allQuestions.slice(0, 3)
  );

  if (!isOpen) return null;

  const currentQ = activeQuestions[currentIndex];
  const totalQ = activeQuestions.length;

  const handleSelectOption = (optionId: string) => {
    if (hasSubmittedCurrent) return;
    setSelectedOption(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || hasSubmittedCurrent) return;
    setHasSubmittedCurrent(true);

    const newAnswers = {
      ...answers,
      [currentQ.id]: selectedOption,
    };
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    // Check if we should stop or adapt
    const nextIdx = currentIndex + 1;

    // If we've completed the initial 3 questions, evaluate adaptive criteria
    if (nextIdx === 3 && activeQuestions.length === 3) {
      // Calculate score so far
      const correctSoFar = activeQuestions.filter(
        (q) => answers[q.id] === q.correctId
      ).length;

      // If mixed results (1 or 2 correct out of 3) and more questions exist in bank,
      // add question 4 to get higher confidence!
      if ((correctSoFar === 1 || correctSoFar === 2) && allQuestions.length > 3) {
        const nextQ = allQuestions[3];
        setActiveQuestions((prev) => [...prev, nextQ]);
        setCurrentIndex(nextIdx);
        setSelectedOption(null);
        setHasSubmittedCurrent(false);
        return;
      }
    }

    if (nextIdx < activeQuestions.length) {
      setCurrentIndex(nextIdx);
      setSelectedOption(null);
      setHasSubmittedCurrent(false);
    } else {
      // Assessment Completed!
      const correctCount = activeQuestions.filter(
        (q) => answers[q.id] === q.correctId
      ).length;

      // Also record in scheduler for retention consistency
      recordQuizPerformanceForConcept(conceptId, correctCount, activeQuestions.length);

      // Record in concept mastery engine
      const updated = recordConceptAssessment(
        conceptId,
        activeQuestions.length,
        correctCount,
        0
      );

      setFinalResult(updated);
      setIsFinished(true);
      onAssessmentCompleted?.(updated);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setHasSubmittedCurrent(false);
    setIsFinished(false);
    setFinalResult(null);
    setActiveQuestions(allQuestions.slice(0, 3));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 app-artwork-tile">
              <AppArtwork name="brain" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Adaptive Mastery Assessment
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
                {conceptTitle}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!isFinished && currentQ && (
            <>
              {/* Progress & Adaptive indicator */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    Question {currentIndex + 1} of {totalQ}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="capitalize text-slate-500">
                    {currentQ.difficulty} Difficulty
                  </span>
                </div>
                <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                  Adaptive evidence gathering
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  const isCorrect = option.id === currentQ.correctId;
                  const isUserWrong = hasSubmittedCurrent && isSelected && !isCorrect;
                  const isRevealedCorrect = hasSubmittedCurrent && isCorrect;

                  let borderClass = 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/70';
                  let bgClass = 'bg-white';
                  let badgeClass = 'border-slate-300 text-slate-600 bg-slate-50';

                  if (isSelected && !hasSubmittedCurrent) {
                    borderClass = 'border-blue-500 ring-2 ring-blue-500/20';
                    bgClass = 'bg-blue-50/30';
                    badgeClass = 'bg-blue-600 text-white border-blue-600';
                  } else if (isRevealedCorrect) {
                    borderClass = 'border-emerald-500 ring-2 ring-emerald-500/20';
                    bgClass = 'bg-emerald-50/40';
                    badgeClass = 'bg-emerald-600 text-white border-emerald-600';
                  } else if (isUserWrong) {
                    borderClass = 'border-rose-400 ring-2 ring-rose-400/20';
                    bgClass = 'bg-rose-50/40';
                    badgeClass = 'bg-rose-600 text-white border-rose-600';
                  }

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(option.id)}
                      className={`p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${borderClass} ${bgClass}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full border text-xs font-bold flex items-center justify-center shrink-0 uppercase transition-colors ${badgeClass}`}
                      >
                        {option.id}
                      </span>
                      <span className="text-slate-800 leading-snug">{option.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* Feedback banner once submitted */}
              {hasSubmittedCurrent && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    selectedOption === currentQ.correctId
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {selectedOption === currentQ.correctId ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Correct!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>Incorrect</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs pl-6">
                    {currentQ.explanation}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Results Summary Screen */}
          {isFinished && finalResult && (
            <div className="space-y-6 py-1">
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 border border-blue-200 shadow-xs mb-1 app-artwork-tile">
                  <AppArtwork name="shield" />
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Assessment Complete
                </h4>
                <p className="text-xs text-slate-500">
                  Mastery level updated with calibrated confidence.
                </p>
              </div>

              {/* Master Card with 5-segment bar */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-[#f8fbff] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Assigned Mastery
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 capitalize">
                    Confidence: {finalResult.masteryConfidence}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {finalResult.masteryLevel}/5
                    </span>
                    <span
                      className={`text-sm sm:text-base font-bold ${
                        MASTERY_LEVEL_COLORS[finalResult.masteryLevel].textColor
                      }`}
                    >
                      {finalResult.levelLabel}
                    </span>
                  </div>

                  <MasterySegmentBar level={finalResult.masteryLevel} size="md" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-100 text-xs">
                  <div>
                    <span className="text-slate-500 block">Mastery Score</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {finalResult.masteryScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Recent Accuracy</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {finalResult.recentAccuracy}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Why this level was assigned (Evidence explanation) */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-600" />
                  <span>Evidence Justification</span>
                </span>
                <ul className="space-y-1 text-slate-600 text-[11px] list-disc pl-4 leading-relaxed">
                  {finalResult.evidenceDetails.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>

              {/* Retention status reminder (clearly separate) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">Retention Score: </span>
                  <span className="font-extrabold text-slate-900">{finalResult.retentionScore}%</span>
                  <span className="text-slate-400 mx-1.5">·</span>
                  <span className="text-slate-500">
                    {finalResult.retentionScore < 70 ? 'Review due' : 'Healthy memory curve'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Independent of mastery</span>
              </div>

              {/* Recommended Next Step */}
              <div className="p-3.5 rounded-xl border border-blue-200/80 bg-blue-50/50 space-y-1 text-xs">
                <span className="font-bold text-blue-900">Recommended Next Step:</span>
                <p className="text-blue-800 leading-relaxed text-[11px]">
                  {finalResult.nextRecommendedAction}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          {!isFinished ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {!hasSubmittedCurrent ? (
                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={handleSubmitAnswer}
                  className="px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>{currentIndex + 1 < totalQ ? 'Next Question' : 'View Mastery Result'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
