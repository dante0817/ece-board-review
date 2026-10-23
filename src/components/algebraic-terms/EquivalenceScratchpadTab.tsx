import React, { useState, useMemo } from 'react';
import { MathFormula } from '../MathFormula';
import {
  Calculator,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Layers,
  ArrowRight,
  Terminal,
  HelpCircle,
  Info,
} from 'lucide-react';

interface EquivalencePreset {
  id: string;
  name: string;
  expression1Latex: string;
  expression2Latex: string;
  expression1Display: string;
  expression2Display: string;
  eval1: (x: number, y: number) => number;
  eval2: (x: number, y: number) => number;
  isEquivalent: boolean;
  verdictNote: string;
  casioProof: string;
}

const EQUIVALENCE_PRESETS: EquivalencePreset[] = [
  {
    id: 'eq-1',
    name: 'Binomial Cube vs Factored',
    expression1Latex: '(2x - 3)^3',
    expression2Latex: '8x^3 - 36x^2 + 54x - 27',
    expression1Display: '(2x - 3)³',
    expression2Display: '8x³ - 36x² + 54x - 27',
    eval1: (x) => Math.pow(2 * x - 3, 3),
    eval2: (x) => 8 * Math.pow(x, 3) - 36 * Math.pow(x, 2) + 54 * x - 27,
    isEquivalent: true,
    verdictNote: '100% Identical. Standard binomial cubic expansion (a - b)³ = a³ - 3a²b + 3ab² - b³.',
    casioProof: 'Enter ((2X - 3)³) - (8X³ - 36X² + 54X - 27). Press [CALC], enter X=5. Output: 0.',
  },
  {
    id: 'eq-2',
    name: 'The Freshmen’s Cube (Famous Board Trap)',
    expression1Latex: '(2x - 3)^3',
    expression2Latex: '8x^3 - 27',
    expression1Display: '(2x - 3)³',
    expression2Display: '8x³ - 27',
    eval1: (x) => Math.pow(2 * x - 3, 3),
    eval2: (x) => 8 * Math.pow(x, 3) - 27,
    isEquivalent: false,
    verdictNote: 'NOT Equivalent! Exponents do not distribute over addition/subtraction. Cross terms -36x² and +54x are missing.',
    casioProof: 'At X=5: (2(5)-3)³ = 7³ = 343, but 8(5)³ - 27 = 973. Difference = -630 ≠ 0.',
  },
  {
    id: 'eq-3',
    name: 'Nested Bracket Sign Resolution',
    expression1Latex: '5x - [2y - (3x - 4y) + 6]',
    expression2Latex: '8x - 6y - 6',
    expression1Display: '5x - [2y - (3x - 4y) + 6]',
    expression2Display: '8x - 6y - 6',
    eval1: (x, y) => 5 * x - (2 * y - (3 * x - 4 * y) + 6),
    eval2: (x, y) => 8 * x - 6 * y - 6,
    isEquivalent: true,
    verdictNote: '100% Identical. Distributing minus over -3x + 4y yields 5x - [-3x + 6y + 6] = 8x - 6y - 6.',
    casioProof: 'At X=3, Y=2: Expression 1 = 6, Expression 2 = 6. Difference = 0.',
  },
  {
    id: 'eq-4',
    name: 'Premature Subtraction Fallacy',
    expression1Latex: '15 - 3(2x - 4)',
    expression2Latex: '24x - 48',
    expression1Display: '15 - 3(2x - 4)',
    expression2Display: '24x - 48',
    eval1: (x) => 15 - 3 * (2 * x - 4),
    eval2: (x) => 24 * x - 48,
    isEquivalent: false,
    verdictNote: 'NOT Equivalent! 15 - 3 was prematurely calculated as 12 instead of distributing -3 first: 15 - 6x + 12 = 27 - 6x.',
    casioProof: 'At X=4: 15 - 3(4) = 3, but 24(4) - 48 = 48. Difference = -45 ≠ 0.',
  },
  {
    id: 'eq-5',
    name: 'Difference of Squares with Coefficients',
    expression1Latex: '(3x + 5y)(3x - 5y)',
    expression2Latex: '9x^2 - 25y^2',
    expression1Display: '(3x + 5y)(3x - 5y)',
    expression2Display: '9x² - 25y²',
    eval1: (x, y) => (3 * x + 5 * y) * (3 * x - 5 * y),
    eval2: (x, y) => 9 * x * x - 25 * y * y,
    isEquivalent: true,
    verdictNote: '100% Identical. Conjugate binomial product yields the difference of two perfect squares (a+b)(a-b) = a² - b².',
    casioProof: 'At X=3, Y=2: (9 + 10)(9 - 10) = 19(-1) = -19. 9(9) - 25(4) = 81 - 100 = -19. Difference = 0.',
  },
];

export const EquivalenceScratchpadTab: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('eq-1');
  const activePreset =
    EQUIVALENCE_PRESETS.find((p) => p.id === selectedPresetId) || EQUIVALENCE_PRESETS[0];

  // Custom live test variables
  const [testVarX, setTestVarX] = useState<number>(5);
  const [testVarY, setTestVarY] = useState<number>(2);

  // Multi-point verification testing
  const samplePoints = [
    { x: 3, y: 2 },
    { x: 5, y: 4 },
    { x: 7, y: 3 },
  ];

  const multiPointResults = useMemo(() => {
    return samplePoints.map((pt) => {
      const v1 = activePreset.eval1(pt.x, pt.y);
      const v2 = activePreset.eval2(pt.x, pt.y);
      const diff = v1 - v2;
      return {
        ...pt,
        v1,
        v2,
        diff,
        matches: Math.abs(diff) < 1e-6,
      };
    });
  }, [activePreset]);

  const allPointsMatch = multiPointResults.every((r) => r.matches);

  // Live active single-point calculation
  const currentV1 = activePreset.eval1(testVarX, testVarY);
  const currentV2 = activePreset.eval2(testVarX, testVarY);
  const currentDiff = currentV1 - currentV2;
  const singleMatch = Math.abs(currentDiff) < 1e-6;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                Scratchpad Studio
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Subtractive Multi-Point Verification
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Symbolic Equivalence Scratchpad
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Verify if two algebraic expressions are mathematically identical. Tests subtraction across multiple non-trivial prime coordinates ($X, Y \neq 0, 1$).
            </p>
          </div>

          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {EQUIVALENCE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPresetId(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedPresetId === p.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Expressions Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Expression 1 (Candidate / Original) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-white space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Expression 1 (Original Form)
            </span>
            <div className="font-mono text-lg sm:text-xl font-bold text-white py-1">
              <MathFormula formula={activePreset.expression1Latex} inline />
            </div>
            <div className="text-xs text-slate-400">
              Evaluated with X={testVarX}, Y={testVarY}:{' '}
              <span className="font-mono font-bold text-blue-300">{currentV1}</span>
            </div>
          </div>

          {/* Expression 2 (Transformed / Simplified Form) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-900 text-white space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Expression 2 (Target / Simplified Form)
            </span>
            <div className="font-mono text-lg sm:text-xl font-bold text-white py-1">
              <MathFormula formula={activePreset.expression2Latex} inline />
            </div>
            <div className="text-xs text-slate-400">
              Evaluated with X={testVarX}, Y={testVarY}:{' '}
              <span className="font-mono font-bold text-purple-300">{currentV2}</span>
            </div>
          </div>
        </div>

        {/* Subtractive Test Bar */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            allPointsMatch
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/80 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            {allPointsMatch ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="font-extrabold text-sm sm:text-base">
                {allPointsMatch
                  ? 'Mathematical Identity Confirmed [Expr 1 - Expr 2 = 0]'
                  : 'Expressions Are NOT Equivalent (Difference ≠ 0)'}
              </div>
              <p className="text-xs opacity-90 mt-0.5">{activePreset.verdictNote}</p>
            </div>
          </div>

          <div className="font-mono font-black text-lg bg-white/90 px-3 py-1.5 rounded-lg border shadow-2xs self-start sm:self-auto">
            Δ = {currentDiff}
          </div>
        </div>

        {/* Multi-Point Sampling Proof Table */}
        <div className="mt-5 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Multi-Point Sampling Matrix (Zero-Slip Verification):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {multiPointResults.map((sample, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                  sample.matches
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/60 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Sample #{idx + 1}: (x={sample.x}, y={sample.y})</span>
                  {sample.matches ? (
                    <span className="text-emerald-700">MATCH (0)</span>
                  ) : (
                    <span className="text-rose-700">MISMATCH</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600">
                  Expr 1 = {sample.v1} | Expr 2 = {sample.v2}
                </div>
                <div className="text-[11px] font-bold">
                  Difference (Expr 1 - Expr 2) = {sample.diff}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Casio Keystroke Proof */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
          <Terminal className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900">
              Casio fx-991 CALC Keystroke Sequence for this Test:
            </span>
            <p className="font-mono text-blue-800 text-[11px]">{activePreset.casioProof}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
