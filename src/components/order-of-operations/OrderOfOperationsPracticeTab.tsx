import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { useReview } from '../../context/ReviewContext';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

export interface PracticeQuestion {
  id: string;
  title: string;
  question: string;
  latexQuestion?: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  keyRule: string;
  boardTip: string;
}

const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'pemdas-q-1',
    title: 'Unary Minus & Nested Operations',
    question: 'Evaluate the exact value of the expression:',
    latexQuestion: '-3^2 - 2[5 - (2 - 4)^3] \\div 3',
    options: [
      { id: 'A', text: '-53/3 (≈ -17.67)', isCorrect: true },
      { id: 'B', text: '1/3 (≈ +0.33)', isCorrect: false },
      { id: 'C', text: '-11', isCorrect: false },
      { id: 'D', text: '-35/3 (≈ -11.67)', isCorrect: false },
    ],
    explanation:
      'Step 1: (2 - 4) = -2.\nStep 2: (-2)³ = -8 and -3² = -(3²) = -9 (power takes precedence over unary negation!).\nStep 3: [5 - (-8)] = 5 + 8 = 13.\nStep 4: 2 × 13 = 26, then 26 ÷ 3 = 26/3.\nStep 5: -9 - 26/3 = -27/3 - 26/3 = -53/3.',
    keyRule: 'Unary negation has lower precedence than exponentiation: -x² = -(x²).',
    boardTip: 'Option B is the classic distractor designed for candidates who mistakenly square the negative sign to get +9.',
  },
  {
    id: 'pemdas-q-2',
    title: 'Identification of Field Properties',
    question:
      'In simplifying (3x + 5) + 7x into (5 + 3x) + 7x, and then into 5 + (3x + 7x) = 5 + 10x, which two real number field properties were applied in order?',
    options: [
      { id: 'A', text: 'Commutative Property of Addition, then Associative Property of Addition', isCorrect: true },
      { id: 'B', text: 'Associative Property of Addition, then Distributive Property', isCorrect: false },
      { id: 'C', text: 'Distributive Property, then Identity Property of Addition', isCorrect: false },
      { id: 'D', text: 'Commutative Property of Addition, then Inverse Property', isCorrect: false },
    ],
    explanation:
      '(3x + 5) -> (5 + 3x) reorders the addends (Commutative Property of Addition: a + b = b + a). Next, (5 + 3x) + 7x -> 5 + (3x + 7x) regroups parentheses without changing operand order (Associative Property of Addition: (a + b) + c = a + (b + c)).',
    keyRule: 'Commutative = Order change. Associative = Grouping change.',
    boardTip: 'Whenever the terms swap positions, it is Commutative. Whenever the terms stay in place but parentheses move, it is Associative.',
  },
  {
    id: 'pemdas-q-3',
    title: 'Absolute Value & Fractional Vinculum',
    question: 'Evaluate the algebraic value:',
    latexQuestion: '\\frac{|2 - 5 \\cdot 3| - |(-2)^3 - 4| + (-1)^{101}}{4 - 2(3 - 5)^2}',
    options: [
      { id: 'A', text: '0', isCorrect: true },
      { id: 'B', text: '-1/2', isCorrect: false },
      { id: 'C', text: '+2', isCorrect: false },
      { id: 'D', text: 'Undefined (division by zero)', isCorrect: false },
    ],
    explanation:
      'Numerator:\n|2 - 15| - |-8 - 4| + (-1) = |-13| - |-12| - 1 = 13 - 12 - 1 = 0.\nDenominator:\n4 - 2(-2)² = 4 - 2(4) = 4 - 8 = -4.\nSince the numerator is 0 and denominator is -4 ≠ 0, the quotient is 0 / -4 = 0.',
    keyRule: 'Absolute value bars act as strict grouping symbols. 0 divided by any non-zero real number is 0.',
    boardTip: 'Always calculate numerator and denominator as separate priority clusters before performing final division.',
  },
  {
    id: 'pemdas-q-4',
    title: 'Casio Calculator Resonant Frequency Trap',
    question:
      'In calculating resonant frequency f₀ = 1 / (2π√(LC)) with L = 10 mH and C = 100 pF, a student enters "1 / 2 * π * √(10×10⁻³ × 100×10⁻¹²)" without parentheses around the denominator. By what factor is the computed result off from the true resonant frequency?',
    options: [
      { id: 'A', text: 'Entered value is π²LC ≈ 9.87×10⁻¹² of the correct frequency (much too small)', isCorrect: true },
      { id: 'B', text: 'Off by a factor of 2π (≈ 6.28 times too small)', isCorrect: false },
      { id: 'C', text: 'Off by a factor of 10³ due to milli/pico error', isCorrect: false },
      { id: 'D', text: 'Exact match; calculators automatically group after division', isCorrect: false },
    ],
    explanation:
      'With L = 10 mH = 0.01 H and C = 100 pF = 10⁻¹⁰ F, LC = 10⁻¹². The incorrect left-to-right expression (1/2)×π×√(LC) = (π/2)×10⁻⁶ ≈ 1.5708×10⁻⁶ Hz. The correct f₀ = 1/[2π√(LC)] ≈ 159,154.94 Hz. Their ratio (incorrect/correct) = π²LC ≈ 9.8696×10⁻¹²: the entered result is enormously smaller, not 39.48 times larger. Keep the entire denominator grouped.',
    keyRule: 'Never enter a/b*c when you intend a/(b*c). On Canon F-789SGA, use explicit grouping around 2π√(LC) and compare with a scientific-notation estimate; this grouping advice is model-neutral.',
    boardTip: 'This is the single most common calculation trap in ECE Communications and Electronics subjects.',
  },
  {
    id: 'pemdas-q-5',
    title: 'Non-Commutative Algebraic Systems',
    question:
      'Which of the following mathematical systems fails the Commutative Property under multiplication?',
    options: [
      { id: 'A', text: 'Square Matrices of order 2×2 under matrix multiplication', isCorrect: true },
      { id: 'B', text: 'Real Numbers under standard arithmetic multiplication', isCorrect: false },
      { id: 'C', text: 'Complex Numbers (Phasors) under multiplication', isCorrect: false },
      { id: 'D', text: 'Rational Numbers under fractional multiplication', isCorrect: false },
    ],
    explanation:
      'Matrix multiplication is generally non-commutative: AB ≠ BA. For real numbers, complex phasors, and rationals, multiplication is strictly commutative.',
    keyRule: 'Commutativity holds for real and complex numbers, but fails for matrix algebra.',
    boardTip: 'Expect this in Advanced Math / Systems Engineering questions on state-space matrices.',
  },
  {
    id: 'pemdas-q-6',
    title: 'Binomial Expansion vs Distributive Fallacy',
    question: 'Which of the following algebraic equalities is TRUE for all real numbers a and b?',
    options: [
      { id: 'A', text: '-(a - b) = b - a', isCorrect: true },
      { id: 'B', text: '(a + b)² = a² + b²', isCorrect: false },
      { id: 'C', text: '√(a² + b²) = a + b', isCorrect: false },
      { id: 'D', text: '1 / (a + b) = 1/a + 1/b', isCorrect: false },
    ],
    explanation:
      'Distributing the negative sign: -(a - b) = -a + b = b - a (True!).\nOptions B, C, and D are the classic "Three Freshmen Fallacies" that violate distributivity.',
    keyRule: 'Negation distributes as -1(a - b) = -a + b = b - a.',
    boardTip: 'Remember that powers, radicals, and reciprocals NEVER distribute over addition or subtraction.',
  },
];

export const OrderOfOperationsPracticeTab: React.FC = () => {
  const { openChat } = useReview();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  // Calculate score
  const correctCount = PRACTICE_QUESTIONS.filter(
    (q) => selectedAnswers[q.id] === q.options.find((o) => o.isCorrect)?.id
  ).length;

  const scorePercentage = Math.round(
    (correctCount / PRACTICE_QUESTIONS.length) * 100
  );

  return (
    <div className="space-y-6">
      <CalculatorCompatibilityNotice/>
      {/* Quiz Progress & Score Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                Board Licensure Readiness Drill
              </span>
              <span className="text-xs text-slate-400">
                {PRACTICE_QUESTIONS.length} Questions
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Order of Operations & Algebraic Axioms Diagnostic Exam
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Answer all 6 questions to test your precision against board-level traps.
            </p>
          </div>

          {submitted && (
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base ${
                  scorePercentage >= 80
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {scorePercentage}%
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {correctCount} of {PRACTICE_QUESTIONS.length} Correct
                </div>
                <div className="text-[11px] text-slate-500">
                  {scorePercentage >= 80
                    ? 'Board Ready Accuracy!'
                    : 'Review highlighted traps below'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {PRACTICE_QUESTIONS.map((q, idx) => {
          const userChoice = selectedAnswers[q.id];
          const isAnswered = !!userChoice;
          const correctOption = q.options.find((o) => o.isCorrect);
          const isUserCorrect = submitted && userChoice === correctOption?.id;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-xs transition-all ${
                submitted
                  ? isUserCorrect
                    ? 'border-emerald-200'
                    : 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question {idx + 1} of {PRACTICE_QUESTIONS.length}
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {q.title}
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-2">
                {q.question}
              </h3>

              {q.latexQuestion && (
                <div className="p-3.5 my-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-serif text-slate-900 text-base sm:text-lg">
                  <MathFormula formula={`$$${q.latexQuestion}$$`} />
                </div>
              )}

              {/* Options */}
              <div className="space-y-2 mt-4">
                {q.options.map((opt) => {
                  const isSelected = userChoice === opt.id;
                  let optionClass =
                    'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

                  if (isSelected && !submitted) {
                    optionClass =
                      'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900';
                  } else if (submitted) {
                    if (opt.isCorrect) {
                      optionClass =
                        'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold';
                    } else if (isSelected && !opt.isCorrect) {
                      optionClass =
                        'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20 text-rose-950';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${optionClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>

                      {submitted && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {submitted && isSelected && !opt.isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Post-Submit Detailed Breakdown */}
              {submitted && (
                <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>Board Exam Solution & Derivation:</span>
                  </div>
                  <pre className="text-xs text-slate-700 font-sans whitespace-pre-line leading-relaxed">
                    {q.explanation}
                  </pre>

                  <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-blue-700 font-medium">
                      <strong>Key Rule: </strong> {q.keyRule}
                    </div>
                    <div className="text-amber-800 font-medium">
                      💡 {q.boardTip}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submission Footer Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
          <span>Reset Exam</span>
        </button>

        <div className="flex items-center gap-2">
          {!submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors cursor-pointer"
            >
              Submit & Check Answers ({Object.keys(selectedAnswers).length}/{PRACTICE_QUESTIONS.length})
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                openChat(
                  `Help me review my performance on the Order of Operations & Algebraic Axioms exam. I scored ${scorePercentage}%. Can you provide more practice on nested grouping and unary minus traps?`,
                  'algebra'
                )
              }
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AppArtwork name="star" inline className="w-3.5 h-3.5" />
              <span>Ask AI Tutor for Remediation</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
