import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { CASIO_CALC_TECHNIQUES, CasioCalcTechnique } from '../../data/algebraicTermsData';
import { CheckCircle2, AlertTriangle, Info, Terminal } from 'lucide-react';

export const CasioCalcTab: React.FC = () => {
  // Interactive Subtractive Simulator State
  const [selectedCandidate, setSelectedCandidate] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [testValueX, setTestValueX] = useState<number>(5);

  // Evaluate (2x - 3)^3
  const evaluateOriginal = (x: number) => Math.pow(2 * x - 3, 3);

  // Evaluate Candidates
  const evaluateCandidate = (opt: 'A' | 'B' | 'C' | 'D', x: number) => {
    switch (opt) {
      case 'A': // 8x^3 - 27 (Freshmen's Cube trap)
        return 8 * Math.pow(x, 3) - 27;
      case 'B': // 8x^3 - 36x^2 + 54x - 27 (Correct)
        return 8 * Math.pow(x, 3) - 36 * Math.pow(x, 2) + 54 * x - 27;
      case 'C': // 8x^3 + 36x^2 + 54x - 27 (Sign trap)
        return 8 * Math.pow(x, 3) + 36 * Math.pow(x, 2) + 54 * x - 27;
      case 'D': // 8x^3 - 18x^2 + 27x - 27 (Missing factors)
        return 8 * Math.pow(x, 3) - 18 * Math.pow(x, 2) + 27 * x - 27;
      default:
        return 0;
    }
  };

  const origVal = evaluateOriginal(testValueX);
  const candVal = evaluateCandidate(selectedCandidate, testValueX);
  const difference = origVal - candVal;
  const isMatch = Math.abs(difference) < 1e-6;

  return (
    <div className="space-y-6">
      <CalculatorCompatibilityNotice/>
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                Calcu-Technique
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) / EX / CW
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Casio [CALC] Button &amp; Subtractive Equivalence Method
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              A Casio-specific general-study procedure for spotting incorrect expansions. Numerical agreement at selected inputs is not a proof of algebraic identity.
            </p>
          </div>
        </div>

        {/* 2 Keystroke Technique Guides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {CASIO_CALC_TECHNIQUES.map((tech) => (
            <div
              key={tech.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                  <AppArtwork name="lightning" inline className="w-3.5 h-3.5" />
                  <span>{tech.title}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mb-3">{tech.purpose}</p>

                {/* Keystrokes List */}
                <div className="space-y-2 text-xs">
                  {tech.keystrokes.map((key, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-900">
                <span className="font-bold">Board Pro-Tip:</span> {tech.proTip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Casio LCD Subtractive Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-5 h-5 text-slate-800" />
          <h3 className="text-lg font-extrabold text-slate-900">
            Interactive Casio Subtractive Equivalence Simulator
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          Test the classic board exam expansion of <MathFormula formula="(2x - 3)^3" inline /> against 4 multiple choice options. For the selected test value, observe which candidate gives zero difference; a finite numerical check does not prove identity.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Controls (Options & Test X) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              1. Select Candidate Option to Test:
            </div>

            <div className="space-y-2">
              {[
                { id: 'A', text: '8x³ - 27 (Freshmen’s Cube trap)', latex: '8x^3 - 27' },
                { id: 'B', text: '8x³ - 36x² + 54x - 27 (Full Expansion)', latex: '8x^3 - 36x^2 + 54x - 27' },
                { id: 'C', text: '8x³ + 36x² + 54x - 27 (Sign Error)', latex: '8x^3 + 36x^2 + 54x - 27' },
                { id: 'D', text: '8x³ - 18x² + 27x - 27 (Omitted Coeffs)', latex: '8x^3 - 18x^2 + 27x - 27' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedCandidate(opt.id as any)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                    selectedCandidate === opt.id
                      ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20 text-blue-900'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-mono">
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </div>
                  <span className="font-mono text-xs text-slate-500">
                    <MathFormula formula={opt.latex} inline />
                  </span>
                </button>
              ))}
            </div>

            {/* Test Value X Input */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                2. Input Random Test Value for X (Notice: X ≠ 0, 1):
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="2"
                  max="15"
                  value={testValueX}
                  onChange={(e) => setTestValueX(Number(e.target.value))}
                  className="w-48 accent-blue-600 cursor-pointer"
                />
                <span className="font-mono font-bold text-sm bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 text-slate-900">
                  X = {testValueX}
                </span>
                <div className="flex items-center gap-1">
                  {[3, 5, 7, 11].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTestValueX(val)}
                      className={`px-2 py-0.5 text-xs rounded border cursor-pointer font-mono font-bold ${
                        testValueX === val
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Casio Dot-Matrix LCD Simulator Screen */}
          <div className="lg:col-span-6 bg-slate-950 p-5 rounded-2xl border-4 border-slate-700 shadow-2xl flex flex-col justify-between space-y-4">
            {/* Top Bar of Casio LCD */}
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400/80 border-b border-slate-800 pb-1.5">
              <span>CASIO fx-991EX CLASSWIZ</span>
              <span className="bg-emerald-950 px-1.5 py-0.5 rounded text-[10px]">MATH / D</span>
            </div>

            {/* Casio LCD Main Screen */}
            <div className="bg-[#7d937d] text-slate-950 p-4 rounded-xl font-mono shadow-inner space-y-2 border border-[#6b826b]">
              <div className="text-xs font-bold opacity-80">
                (2X - 3)³ - (Option {selectedCandidate})
              </div>
              <div className="text-[11px] opacity-70">
                X = {testValueX} | Calc: {origVal} - {candVal}
              </div>

              {/* Huge LCD Output */}
              <div className="text-right text-2xl sm:text-3xl font-black tracking-wider pt-2 border-t border-slate-950/20">
                {difference === 0 ? '0' : difference.toLocaleString()}
              </div>
            </div>

            {/* Outcome Badge */}
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 ${
                isMatch
                  ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500 text-rose-300'
              }`}
            >
              {isMatch ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-extrabold uppercase">100% Identity Match:</span> Result is exactly 0! Option {selectedCandidate} is algebraically identical to (2x - 3)³.
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-extrabold uppercase">Distractor Detected:</span> Difference is {difference}. Option {selectedCandidate} is mathematically NOT identical!
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pro Tip on Why 0 and 1 Are Forbidden */}
        <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-950">
              Why Are X = 0 and X = 1 Strictly Forbidden in Calcu-Techniques?
            </span>
            <p className="leading-relaxed text-amber-800">
              Testing <strong>X = 0</strong> annihilates all non-constant terms, masking erroneous coefficients (e.g. 5x and 12x both evaluate to 0). Testing <strong>X = 1</strong> makes all powers identical (x = x² = x³ = 1), causing wrong degrees to falsely evaluate as equal. Always test prime numbers like <strong>X = 3, 5, 7, or 11</strong>!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
