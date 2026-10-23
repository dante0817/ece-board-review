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
    topic: 'Engineering Notation & SI Prefixes',
    question: 'Express a measured capacitance of 0.0000472 F in standard engineering notation with the appropriate SI prefix:',
    options: ['4.72 × 10⁻⁵ F', '47.2 μF', '47200 pF', '0.0472 mF'],
    correctIndex: 1,
    explanation:
      'To convert 0.0000472 F to engineering notation, move the decimal point 6 places to the right (multiples of 3): 47.2 × 10⁻⁶ F. Since 10⁻⁶ corresponds to the micro (μ) prefix, this is 47.2 μF. (Notice that 4.72 × 10⁻⁵ is scientific notation, NOT engineering notation because -5 is not a multiple of 3!).',
    calculatorTip: 'Enter 0.0000472, press [=], then press [ENG] on your Casio.',
  },
  {
    id: 'q2',
    topic: 'Ceramic Capacitor 3-Digit EIA Code',
    question: 'A ceramic disc capacitor is stamped with the marking "223". What is its nominal capacitance?',
    options: ['223 pF', '22 nF', '2.2 μF', '0.0022 μF'],
    correctIndex: 1,
    explanation:
      'For a 3-digit EIA capacitor code: Digits 1 & 2 are significands (22), and digit 3 is the power of 10 in picofarads. Thus: 22 × 10³ pF = 22,000 pF. Converting to nanofarads: 22,000 / 1000 = 22 nF (which is also 0.022 μF).',
  },
  {
    id: 'q3',
    topic: 'Prefix Mismatch Kirchhoff Current Law',
    question: 'Two parallel branch currents merge at a circuit node: I₁ = 3.2 mA and I₂ = 450 μA. What is the total current leaving the node?',
    options: ['453.2 mA', '3.65 mA', '7.70 mA', '36.5 mA'],
    correctIndex: 1,
    explanation:
      'Never add raw numbers with mismatched prefixes! First convert 450 μA to milliamperes: 450 μA = 450 × 10⁻⁶ A = 0.45 × 10⁻³ A = 0.45 mA. Now add: IT = 3.2 mA + 0.45 mA = 3.65 mA (or 3650 μA).',
  },
  {
    id: 'q4',
    topic: 'Order of Magnitude Microelectronics Power',
    question: 'A modern AI processor contains 2 × 10⁹ transistors. If each individual transistor dissipates an average leakage power of 150 nW, what is the total chip power dissipation?',
    options: ['30 W', '300 W', '3 kW', '0.3 W'],
    correctIndex: 1,
    explanation:
      'P_total = N × P_single = (2 × 10⁹) × (150 × 10⁻⁹ W). Multiply mantissas and add powers of ten: (2 × 150) × 10^(9 + (-9)) = 300 × 10⁰ W = 300 Watts!',
  },
  {
    id: 'q5',
    topic: 'Electromagnetic Wave Wavelength (λ = c / f)',
    question: 'A 5G cellular transceiver transmits at a carrier frequency of 6.0 GHz. Given the speed of light in free space c = 3.0 × 10⁸ m/s, what is the free-space wavelength λ?',
    options: ['50 cm', '5.0 cm', '0.5 cm', '1.8 m'],
    correctIndex: 1,
    explanation:
      'λ = c / f = (3.0 × 10⁸ m/s) / (6.0 × 10⁹ Hz) = (3.0 / 6.0) × 10^(8 - 9) = 0.5 × 10⁻¹ m = 0.05 m = 5.0 cm.',
    calculatorTip: 'Input on Casio: (3 × 10^8) / (6 × 10^9) = 0.05 m = 5 cm.',
  },
  {
    id: 'q6',
    topic: 'RC Time Constant (τ = R · C)',
    question: 'Calculate the time constant τ of a circuit with resistor R = 4.7 kΩ and capacitor C = 100 nF:',
    options: ['470 μs', '47 ms', '4.7 ms', '0.047 s'],
    correctIndex: 0,
    explanation:
      'τ = R × C = (4.7 × 10³ Ω) × (100 × 10⁻⁹ F) = (4.7 × 100) × 10^(3 - 9) = 470 × 10⁻⁶ s = 470 μs (or 0.47 ms).',
  },
];

export const ScientificPracticeTab: React.FC = () => {
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
      {/* Score Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full">
            High-Yield Exam Drill
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Scientific & Engineering Notation Board Drill
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Test your proficiency with powers of ten, capacitor 3-digit EIA codes, prefix arithmetic, and RC constants.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-xs text-slate-400 font-bold uppercase">Accuracy Score</div>
            <div className="text-2xl font-mono font-black text-indigo-700">
              {correctCount} / {QUESTIONS.length} ({scorePct}%)
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Reset drill"
          >
            <AppArtwork name="cycle" inline className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Questions list */}
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
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
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

              {/* Solution */}
              {showExplanation[q.id] && (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                    <AppArtwork name="bulb" inline className="w-4 h-4 text-amber-500" />
                    <span>Step-by-Step Solution Breakdown:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                  {q.calculatorTip && (
                    <div className="mt-2 p-2 bg-white rounded-lg border border-indigo-200 text-indigo-900 font-mono text-[11px]">
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
