import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useEffect, useRef } from 'react';
import { MathFormula } from '../MathFormula';
import { X } from 'lucide-react';

interface FlashDrillQuestion {
  id: string;
  prompt: string;
  latex?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const FLASH_QUESTIONS: FlashDrillQuestion[] = [
  {
    id: 'f-1',
    prompt: 'Classify by number of terms:',
    latex: '5x^3 - 2x + 7',
    options: ['Monomial', 'Binomial', 'Trinomial', 'Non-Polynomial'],
    correctIndex: 2,
    explanation: 'Contains exactly three non-zero terms separated by + and -.',
  },
  {
    id: 'f-2',
    prompt: 'Total degree of the multivariable term:',
    latex: '4x^2 y^3 z',
    options: ['3', '5', '6', '9'],
    correctIndex: 2,
    explanation: 'Sum of all variable exponents: 2 + 3 + 1 = 6.',
  },
  {
    id: 'f-3',
    prompt: 'Is this expression a polynomial?',
    latex: '\\frac{3}{x} + 5',
    options: ['Yes', 'No (Variable in Denominator)', 'Undetermined'],
    correctIndex: 1,
    explanation: 'Variable in denominator equals x⁻¹; polynomials require non-negative integer exponents.',
  },
  {
    id: 'f-4',
    prompt: 'What is the degree of a non-zero constant (e.g., 42)?',
    latex: '42 = 42x^0',
    options: ['0', '1', 'Undefined', '42'],
    correctIndex: 0,
    explanation: 'Any non-zero constant has degree 0 (since x⁰ = 1).',
  },
  {
    id: 'f-5',
    prompt: 'Are these like terms?',
    latex: '7a^2b \\quad \\text{and} \\quad -3ab^2',
    options: ['Yes', 'No (Exponents on a and b differ)'],
    correctIndex: 1,
    explanation: 'Literal parts must have identical exponents for each variable (a²b ≠ ab²).',
  },
  {
    id: 'f-6',
    prompt: 'Evaluate with x = -4:',
    latex: '-x^2',
    options: ['16', '-16', '-8', '8'],
    correctIndex: 1,
    explanation: 'Unary minus precedence: -x² = -( (-4)² ) = -(16) = -16.',
  },
  {
    id: 'f-7',
    prompt: 'Is this expression a polynomial?',
    latex: '5\\sqrt{x} + 2',
    options: ['Yes', 'No (Fractional Exponent x^{1/2})', 'Undetermined'],
    correctIndex: 1,
    explanation: 'Radical √x represents x^(1/2), which violates the whole-number exponent rule.',
  },
  {
    id: 'f-8',
    prompt: 'Algebraic translation of "y subtracted from 2x":',
    latex: '',
    options: ['y - 2x', '2x - y', '2x / y', '(y - 2)x'],
    correctIndex: 1,
    explanation: '"Subtracted from" reverses operand sequence: 2x is the minuend, y is the subtrahend.',
  },
];

interface RapidSpeedDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RapidSpeedDrillModal: React.FC<RapidSpeedDrillModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<any>(null);

  // Initialize and run countdown timer
  useEffect(() => {
    if (!isOpen) return;

    setCurrentIndex(0);
    setSecondsRemaining(30);
    setIsGameOver(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setFeedback(null);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentQ = FLASH_QUESTIONS[currentIndex % FLASH_QUESTIONS.length];

  const handleSelectAnswer = (optionIdx: number) => {
    if (isGameOver) return;

    const isCorrect = optionIdx === currentQ.correctIndex;

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => {
        const next = st + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
      setFeedback('correct');
    } else {
      setStreak(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 >= FLASH_QUESTIONS.length) {
        setIsGameOver(true);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }, 450);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSecondsRemaining(30);
    setIsGameOver(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setFeedback(null);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black app-artwork-tile">
              <AppArtwork name="lightning" />
            </div>
            <div>
              <h3 className="text-base font-black">30-Second Rapid Speed Drill</h3>
              <p className="text-[11px] text-slate-400">
                Instant classification &amp; degree recognition
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Timer & Streak Bar */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold font-mono">
          <div className="flex items-center gap-2">
            <AppArtwork name="timer" inline className="w-4 h-4 text-blue-600" />
            <span
              className={`text-sm font-black ${
                secondsRemaining <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-900'
              }`}
            >
              {secondsRemaining}s remaining
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-600">
              <AppArtwork name="flame" inline className="w-4 h-4 fill-current" />
              <span>Streak: {streak}</span>
            </div>
            <div className="text-blue-600">Score: {score}</div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!isGameOver ? (
            <div className="space-y-5">
              {/* Question Index */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Question {currentIndex + 1} of {FLASH_QUESTIONS.length}
                </span>
                <span className="font-mono">Best Streak: {maxStreak}</span>
              </div>

              {/* Prompt */}
              <div className="space-y-2 text-center py-2">
                <p className="text-sm font-bold text-slate-700">{currentQ.prompt}</p>
                {currentQ.latex && (
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-white font-mono text-lg font-bold">
                    <MathFormula formula={currentQ.latex} inline />
                  </div>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  let btnColor = 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800';

                  if (feedback === 'correct' && optIdx === currentQ.correctIndex) {
                    btnColor = 'bg-emerald-500 border-emerald-600 text-white font-bold';
                  } else if (feedback === 'wrong' && optIdx === currentQ.correctIndex) {
                    btnColor = 'bg-emerald-500 border-emerald-600 text-white font-bold';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={feedback !== null}
                      onClick={() => handleSelectAnswer(optIdx)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${btnColor}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Game Over / Results Screen */
            <div className="py-4 text-center space-y-5 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center app-artwork-tile">
                <AppArtwork name="trophy" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">Drill Completed!</h4>
                <p className="text-xs text-slate-500">
                  {score >= 6
                    ? 'Superb automaticity! You identify terms and degrees at board-exam pace.'
                    : 'Good attempt. Review the anatomy tab to sharpen instant classification.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 font-mono text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Correct</div>
                  <div className="text-lg font-black text-emerald-600">{score}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Max Streak</div>
                  <div className="text-lg font-black text-amber-600">{maxStreak}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Total Items</div>
                  <div className="text-lg font-black text-slate-700">{FLASH_QUESTIONS.length}</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
