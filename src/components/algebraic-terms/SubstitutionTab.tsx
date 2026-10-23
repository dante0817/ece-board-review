import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { MathFormula } from '../MathFormula';
import { SUBSTITUTION_EXAMPLES, SubstitutionExample } from '../../data/algebraicTermsData';
import { AlertCircle } from 'lucide-react';

export const SubstitutionTab: React.FC = () => {
  // Active preset example
  const [selectedExampleId, setSelectedExampleId] = useState<string>('sub-1');
  const activeExample: SubstitutionExample =
    SUBSTITUTION_EXAMPLES.find((ex) => ex.id === selectedExampleId) || SUBSTITUTION_EXAMPLES[0];

  // Custom live values for active example
  const [customVars, setCustomVars] = useState<{ [key: string]: number }>(() => ({
    ...activeExample.variables,
  }));

  // Handle switching preset
  const handleSelectPreset = (ex: SubstitutionExample) => {
    setSelectedExampleId(ex.id);
    setCustomVars({ ...ex.variables });
  };

  // Reset custom values to default preset values
  const handleResetVars = () => {
    setCustomVars({ ...activeExample.variables });
  };

  // Live evaluated result for custom polynomial 2x^2 - 3xy - 4y^2 + 5
  const livePolyResult = useMemo(() => {
    if (selectedExampleId === 'sub-1') {
      const x = customVars['x'] ?? -2;
      const y = customVars['y'] ?? -3;
      return 2 * (x * x) - 3 * (x * y) - 4 * (y * y) + 5;
    }
    if (selectedExampleId === 'sub-2') {
      const a = customVars['a'] ?? -2;
      const b = customVars['b'] ?? 3;
      const num = 3 * a * a - 2 * a * b + b * b;
      const den = 2 * a - b;
      if (den === 0) return 'Undefined (Division by zero)';
      return `${(num / den).toFixed(3)} (${num}/${den})`;
    }
    if (selectedExampleId === 'sub-3') {
      const Vs = customVars['V_s'] ?? 24;
      const R1 = customVars['R_1'] ?? 300;
      const R2 = customVars['R_2'] ?? 600;
      const den = R1 + R2;
      if (den === 0) return 'Undefined';
      return `${((Vs * R2) / den).toFixed(2)} V`;
    }
    return activeExample.result;
  }, [selectedExampleId, customVars, activeExample.result]);

  // Unary Minus Trap Interactive Simulator state
  const [unaryX, setUnaryX] = useState<number>(-3);
  const unaryMinusSquare = -(unaryX * unaryX); // -x^2 = -(x^2)
  const parenUnarySquare = (-unaryX) * (-unaryX); // (-x)^2
  const parenXSquare = Math.pow(unaryX, 2); // (x)^2

  return (
    <div className="space-y-6">
      {/* 1. Header & Preset Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                Substitution Studio
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Sign &amp; Precedence Integrity
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Multi-Variable Evaluation &amp; Unary Precedence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Numerical substitution is the #1 source of algebraic slips in the ECE Board Exam. Always enclose substituted negatives in parentheses.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {SUBSTITUTION_EXAMPLES.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectPreset(ex)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedExampleId === ex.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Expression & Variable Sliders Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-inner space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {activeExample.category} Mode
              </span>
              <div className="font-mono text-xl sm:text-2xl font-black text-white mt-1">
                <MathFormula formula={activeExample.expressionLatex} inline />
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleResetVars}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>

          {/* Interactive Variable Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            {Object.keys(activeExample.variables).map((varKey) => {
              const currentVal = customVars[varKey] ?? activeExample.variables[varKey];
              const desc = activeExample.variableDescriptions[varKey] || `Variable ${varKey}`;

              return (
                <div key={varKey} className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{desc}</span>
                    <span className="font-mono font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded">
                      {varKey} = {currentVal}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={currentVal}
                      step={varKey.includes('R') ? 50 : 1}
                      onChange={(e) =>
                        setCustomVars((prev) => ({
                          ...prev,
                          [varKey]: Number(e.target.value),
                        }))
                      }
                      className="w-full px-2.5 py-1 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-Time Result Bar */}
          <div className="bg-blue-950/80 border border-blue-800/70 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="text-xs text-blue-200">
              Computed Evaluation with Active Inputs:
            </div>
            <div className="font-mono font-black text-xl text-emerald-400">
              {String(livePolyResult)}
            </div>
          </div>
        </div>

        {/* Step-by-Step Derivation */}
        <div className="mt-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Canonical Step-by-Step Derivation (PRC Exam Method)
          </div>
          <div className="space-y-2.5">
            {activeExample.steps.map((st, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span>{st.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 pl-7">{st.explanation}</p>
                </div>
                <div className="font-mono font-bold text-sm text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 self-start sm:self-auto">
                  <MathFormula formula={st.latex} inline />
                </div>
              </div>
            ))}
          </div>

          {activeExample.trapNote && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 mt-3">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950">Examiner Trap Alert:</span>{' '}
                {activeExample.trapNote}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Interactive Unary Minus Precedence Trap Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <AppArtwork name="lightning" inline className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-extrabold text-slate-900">
            The Infamous Unary Minus Trap: <MathFormula formula="-x^2" inline /> vs.{' '}
            <MathFormula formula="(-x)^2" inline />
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-4">
          38% of PRC ECE board examinees commit this exact error. In mathematics, <strong>exponentiation has higher precedence than unary negation</strong>!
        </p>

        {/* Interactive Slider for X */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700">
              Drag to change value of <span className="font-mono">x</span> (test negative vs positive):
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-6"
                max="6"
                value={unaryX}
                onChange={(e) => setUnaryX(Number(e.target.value))}
                className="w-48 accent-amber-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-base text-slate-900 bg-white px-3 py-0.5 rounded border border-slate-200">
                x = {unaryX}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUnaryX(-3)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unaryX === -3 ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              x = -3 (Exam Classic)
            </button>
            <button
              type="button"
              onClick={() => setUnaryX(-5)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unaryX === -5 ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              x = -5
            </button>
            <button
              type="button"
              onClick={() => setUnaryX(4)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                unaryX === 4 ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              x = +4
            </button>
          </div>
        </div>

        {/* 3-Column Comparative Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card A: -x^2 */}
          <div className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                Case 1: No Parentheses
              </span>
              <span className="text-xs font-bold text-rose-600">High Slip Trap</span>
            </div>
            <div className="font-mono text-xl font-black text-rose-900">
              <MathFormula formula={`-x^2 = -(${unaryX})^2`} inline />
            </div>
            <div className="text-2xl font-black font-mono text-rose-700">
              = {unaryMinusSquare}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Order of operations applies: square first (({unaryX})² = {unaryX * unaryX}), then apply the minus sign: -({unaryX * unaryX}) = <strong>{unaryMinusSquare}</strong>.
            </p>
          </div>

          {/* Card B: (-x)^2 */}
          <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                Case 2: Negated Inside
              </span>
              <span className="text-xs font-bold text-blue-600">Grouped Base</span>
            </div>
            <div className="font-mono text-xl font-black text-blue-900">
              <MathFormula formula={`(-x)^2 = (-(${unaryX}))^2`} inline />
            </div>
            <div className="text-2xl font-black font-mono text-blue-700">
              = {parenUnarySquare}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Negate x first: -({unaryX}) = {-unaryX}. Then square the result: ({-unaryX})² = <strong>{parenUnarySquare}</strong>. Always non-negative.
            </p>
          </div>

          {/* Card C: -(x)^2 */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Case 3: Explicit Bracket
              </span>
              <span className="text-xs font-bold text-slate-500">Explicit Enclosure</span>
            </div>
            <div className="font-mono text-xl font-black text-slate-900">
              <MathFormula formula={`-(x)^2 = -((${unaryX})^2)`} inline />
            </div>
            <div className="text-2xl font-black font-mono text-slate-700">
              = {unaryMinusSquare}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Square inside brackets first, then negate outside. This is identical to Case 1: <strong>{unaryMinusSquare}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
