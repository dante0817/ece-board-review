import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Question {
  id: string;
  topic: string;
  question: string;
  latexFormula?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  calculatorTip?: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    topic: 'Unit Normalization in Ratios',
    question: 'Express the ratio of 400 mA to 2.4 A in simplest integer fractional form:',
    options: ['5 : 3', '1 : 6', '167 : 1', '1 : 60'],
    correctIndex: 1,
    explanation:
      'First convert both terms into the exact same unit. 2.4 A = 2400 mA. The ratio is 400 mA : 2400 mA. Dividing both terms by their GCD (400) gives 1 : 6.',
    calculatorTip: 'Input on Casio: 400 / 2400 [=] returns 1/6 directly.',
  },
  {
    id: 'q2',
    topic: '3-Way Series Proportional Divider',
    question: 'Three series resistors have resistance ratios of R₁ : R₂ : R₃ = 2 : 5 : 8. If the total applied DC voltage is 120 V, what is the voltage drop across R₂?',
    options: ['16 V', '40 V', '64 V', '24 V'],
    correctIndex: 1,
    explanation:
      'Total parts = 2 + 5 + 8 = 15 parts. The share across R₂ is (5 / 15) × 120 V = (1 / 3) × 120 V = 40 V.',
  },
  {
    id: 'q3',
    topic: 'Cross-Multiplication Algebra',
    question: 'Solve for x in the proportion:',
    latexFormula: '\\frac{3x - 1}{4} = \\frac{2x + 5}{3}',
    options: ['x = 23', 'x = 17', 'x = 19', 'x = 14'],
    correctIndex: 0,
    explanation:
      'Cross-multiply extremes and means: 3(3x - 1) = 4(2x + 5) ⟹ 9x - 3 = 8x + 20 ⟹ 9x - 8x = 20 + 3 ⟹ x = 23.',
    calculatorTip: 'On Casio fx-991: Type (3X-1)/4 = (2X+5)/3, press SHIFT + CALC (SOLVE) to verify x = 23.',
  },
  {
    id: 'q4',
    topic: 'Conductor Resistance Scaling Law',
    question: 'A copper wire of resistance R is drawn through a die such that its length is tripled (L₂ = 3L₁) while maintaining constant volume. What is the new resistance R₂?',
    options: ['3 R', '6 R', '9 R', '27 R'],
    correctIndex: 2,
    explanation:
      'Because volume V = A · L is constant, when length triples (L₂ = 3L₁), cross-sectional area must reduce to one-third (A₂ = A₁ / 3). Since R = ρ(L/A), R₂ = ρ(3L₁ / (A₁/3)) = 9 · ρ(L₁/A₁) = 9 R.',
  },
  {
    id: 'q5',
    topic: 'Percent Asymmetry & Recovery',
    question: 'An electronic stock index drops by 20%. By what percentage must it subsequently increase to recover back to its original pre-crash level?',
    options: ['20.00%', '22.50%', '25.00%', '33.33%'],
    correctIndex: 2,
    explanation:
      'After a 20% drop, the remaining value is 100% - 20% = 80% (or 0.80). To return to 1.00, the required multiplier is 1 / 0.80 = 1.25. An increase from 1.00 to 1.25 is exactly +25.00%!',
  },
  {
    id: 'q6',
    topic: 'Voltage Divider with Resistor Tolerance',
    question: 'A voltage divider consists of Vin = 10 V, R₁ = 10 kΩ (exact), and R₂ = 10 kΩ with ±10% tolerance. What is the minimum possible output voltage across R₂?',
    options: ['4.50 V', '4.74 V', '5.00 V', '5.26 V'],
    correctIndex: 1,
    explanation:
      'Minimum Vout across R₂ occurs when R₂ is at its minimum value: R₂,min = 10 kΩ × (1 - 0.10) = 9 kΩ. Using VDR: Vout = 10 V × (9 kΩ / (10 kΩ + 9 kΩ)) = 10 × (9 / 19) = 90 / 19 ≈ 4.737 V (4.74 V).',
  },
];

export const RatioPracticeTab: React.FC = () => {
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

  const handleSelectOption = (qId: string, optIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setShowExplanation((prev) => ({ ...prev, [qId]: true }));
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowExplanation({});
  };

  const totalAnswered = Object.keys(userAnswers).length;
  const correctCount = QUESTIONS.filter((q) => userAnswers[q.id] === q.correctIndex).length;
  const scorePct = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return (
    <div className="space-y-8 text-slate-800">
      <CalculatorCompatibilityNotice/>
      {/* Score Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
            High-Yield Exam Drill
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Ratios, Proportions & Percent Practice Drill
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test your intuition on unit conversion, wire scaling laws, means-extremes, and asymmetric percentages.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-bold uppercase">Accuracy Score</div>
            <div className="text-2xl font-mono font-black text-blue-700">
              {correctCount} / {QUESTIONS.length} ({scorePct}%)
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Reset answers"
          >
            <AppArtwork name="cycle" inline className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {QUESTIONS.map((q, idx) => {
          const selected = userAnswers[q.id];
          const isAnswered = selected !== undefined;
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 space-y-4 shadow-xs ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-300'
                    : 'border-rose-300'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  Problem {idx + 1}: {q.topic}
                </span>
                {isAnswered && (
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {isCorrect ? 'Correct (+100)' : 'Incorrect (Review)'}
                  </span>
                )}
              </div>

              <div className="text-sm font-semibold text-slate-900 leading-relaxed">
                {q.question}
                {q.latexFormula && (
                  <div className="my-2 p-2 bg-slate-50 rounded-lg text-center border border-slate-200">
                    <MathFormula formula={q.latexFormula} />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIdx) => {
                  let optStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      optStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                    } else if (selected === optIdx) {
                      optStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-bold';
                    } else {
                      optStyle = 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && optIdx === q.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Dropdown / Section */}
              {showExplanation[q.id] && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <AppArtwork name="bulb" inline className="w-4 h-4 text-amber-500" />
                    <span>Detailed Solution Breakdown:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                  {q.calculatorTip && (
                    <div className="mt-2 p-2 bg-white rounded-lg border border-blue-200 text-indigo-900 font-mono text-[11px]">
                      <strong>Legacy Casio study example (not Canon key instructions):</strong> {q.calculatorTip}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
