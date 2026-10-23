import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { GitCompare, CheckCircle2 } from 'lucide-react';

export const ProportionsVariationTab: React.FC = () => {
  // Cross multiplication solver state: a/b = c/x
  const [termA, setTermA] = useState<number>(3);
  const [termB, setTermB] = useState<number>(5);
  const [termC, setTermC] = useState<number>(12);

  // Direct variation state: y = kx
  const [directK, setDirectK] = useState<number>(2.5); // e.g. R = 2.5 ohms (V = I * R)
  const [directX, setDirectX] = useState<number>(4); // I = 4A

  // Inverse variation state: y = k / x
  const [inverseK, setInverseK] = useState<number>(120); // e.g. P = 120W (I = P / V)
  const [inverseX, setInverseX] = useState<number>(24); // V = 24V

  // Conductor Resistance Wire Proportionality Lab: R = rho * (L / A)
  const [lengthMultiplier, setLengthMultiplier] = useState<number>(2); // Length multiplied by
  const [diameterMultiplier, setDiameterMultiplier] = useState<number>(0.5); // Diameter multiplied by

  // Cross multiplication solution
  const computedX = termA !== 0 ? (termB * termC) / termA : 0;

  // Resistance change calculation: A varies as d^2
  // Area multiplier = (diameterMultiplier)^2
  const areaMultiplier = diameterMultiplier * diameterMultiplier;
  const resistanceMultiplier = areaMultiplier !== 0 ? lengthMultiplier / areaMultiplier : 0;

  return (
    <div className="space-y-8 text-slate-800">
      {/* Overview Banner */}
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50/40 to-slate-50 border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
              Algebraic Foundations
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              Proportions & Types of Variation
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              A <strong>proportion</strong> is an equation stating that two ratios are equal:
              <span className="font-mono font-bold text-indigo-900 mx-1">a/b = c/d</span>.
              Variations model how physical variables scale directly, inversely, or jointly.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-indigo-700 shadow-2xs shrink-0">
            Rule: Product of Extremes = Product of Means (ad = bc)
          </div>
        </div>
      </div>

      {/* Interactive Cross-Multiplication Solver */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-blue-600" />
            <span>Interactive Cross-Multiplication Sandbox: Solve for x</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Set the three known terms of the proportion <MathFormula inline formula={`\\frac{a}{b} = \\frac{c}{x}`} /> to see the algebraic steps.
          </p>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Proportion Equation Input Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            {/* Left fraction a/b */}
            <div className="flex flex-col items-center bg-blue-50/70 border border-blue-200 rounded-xl p-3 min-w-[120px]">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Term a</span>
              <input
                type="number"
                value={termA}
                onChange={(e) => setTermA(Number(e.target.value))}
                className="w-20 px-2 py-1 text-center font-mono font-bold text-base border border-blue-300 rounded-lg bg-white"
              />
              <div className="w-16 h-0.5 bg-blue-400 my-2" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Term b</span>
              <input
                type="number"
                value={termB}
                onChange={(e) => setTermB(Number(e.target.value))}
                className="w-20 px-2 py-1 text-center font-mono font-bold text-base border border-blue-300 rounded-lg bg-white"
              />
            </div>

            <div className="text-2xl font-black text-slate-400 select-none">=</div>

            {/* Right fraction c/x */}
            <div className="flex flex-col items-center bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 min-w-[120px]">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Term c</span>
              <input
                type="number"
                value={termC}
                onChange={(e) => setTermC(Number(e.target.value))}
                className="w-20 px-2 py-1 text-center font-mono font-bold text-base border border-indigo-300 rounded-lg bg-white"
              />
              <div className="w-16 h-0.5 bg-indigo-400 my-2" />
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Unknown x</span>
              <div className="w-20 px-2 py-1 text-center font-mono font-black text-base border border-dashed border-indigo-400 rounded-lg bg-white text-indigo-700 shadow-inner">
                {computedX.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Step-by-Step Derivation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Step-by-Step Means-Extremes Derivation:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-blue-600">Step 1: Cross-Multiply</span>
                <MathFormula formula={`(${termA}) \\cdot x = (${termB}) \\cdot (${termC})`} />
                <p className="text-[11px] text-slate-500">Multiply numerator of one side with denominator of opposite side.</p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-indigo-600">Step 2: Simplify Product</span>
                <MathFormula formula={`${termA}x = ${termB * termC}`} />
                <p className="text-[11px] text-slate-500">Calculate the product of the means on the right-hand side.</p>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <span className="font-bold text-emerald-600">Step 3: Isolate x</span>
                <MathFormula formula={`x = \\frac{${termB * termC}}{${termA}} = ${computedX.toFixed(2)}`} />
                <p className="text-[11px] text-slate-500">Divide both sides by the coefficient {termA}.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variation Comparison: Direct vs Inverse vs Joint */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Direct Variation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              Direct Variation: y = kx
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">y₁ / x₁ = y₂ / x₂</span>
          </div>

          <div>
            <h4 className="text-base font-extrabold text-slate-900">Directly Proportional Quantities</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              When one variable doubles, the other variable doubles. The ratio <MathFormula inline formula={`\\frac{y}{x} = k`} /> remains constant.
              <strong> ECE Law: Ohm&apos;s Law</strong> <MathFormula inline formula={`V = R \\cdot I`} /> (voltage increases linearly with current).
            </p>
          </div>

          {/* Interactive Direct Controls */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-3">
            <div className="flex justify-between text-xs font-bold text-emerald-900">
              <span>Slope Constant k (e.g. Resistance R):</span>
              <span className="font-mono text-sm">{directK} Ω</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={directK}
              onChange={(e) => setDirectK(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="flex justify-between text-xs font-bold text-emerald-900">
              <span>Input Variable x (e.g. Current I):</span>
              <span className="font-mono text-sm">{directX} A</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={directX}
              onChange={(e) => setDirectX(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            <div className="p-3 bg-white border border-emerald-200 rounded-lg text-center font-mono text-sm font-bold text-emerald-800">
              Output y = k · x = {directK} × {directX} = {(directK * directX).toFixed(2)} V
            </div>
          </div>
        </div>

        {/* Inverse Variation */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
              Inverse Variation: y = k / x
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">x₁ · y₁ = x₂ · y₂</span>
          </div>

          <div>
            <h4 className="text-base font-extrabold text-slate-900">Inversely Proportional Quantities</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              When one variable doubles, the other variable is halved. Their product <MathFormula inline formula={`x \\cdot y = k`} /> is constant.
              <strong> ECE Law:</strong> Current <MathFormula inline formula={`I = P / V`} /> for constant power dissipation.
            </p>
          </div>

          {/* Interactive Inverse Controls */}
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 space-y-3">
            <div className="flex justify-between text-xs font-bold text-rose-900">
              <span>Product Constant k (e.g. Power P):</span>
              <span className="font-mono text-sm">{inverseK} W</span>
            </div>
            <input
              type="range"
              min="12"
              max="240"
              step="12"
              value={inverseK}
              onChange={(e) => setInverseK(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />

            <div className="flex justify-between text-xs font-bold text-rose-900">
              <span>Input Variable x (e.g. Voltage V):</span>
              <span className="font-mono text-sm">{inverseX} V</span>
            </div>
            <input
              type="range"
              min="2"
              max="48"
              step="2"
              value={inverseX}
              onChange={(e) => setInverseX(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />

            <div className="p-3 bg-white border border-rose-200 rounded-lg text-center font-mono text-sm font-bold text-rose-800">
              Output y = k / x = {inverseK} / {inverseX} = {(inverseK / inverseX).toFixed(2)} A
            </div>
          </div>
        </div>
      </div>

      {/* Classic ECE Board Exam Problem: Conductor Resistance Proportionality Lab */}
      <div className="bg-white rounded-2xl border border-blue-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Classic Board Exam Case Study
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <AppArtwork name="lightning" inline className="w-4 h-4 text-amber-500" />
              <span>Conductor Resistance Scaling Law: R = ρ · (L / A)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Resistance is directly proportional to length (L) and inversely proportional to cross-sectional area (<MathFormula inline formula={`A = \\frac{\\pi d^2}{4}`} />).
            </p>
          </div>
          <div className="text-xs font-bold text-slate-600">
            Formula: <MathFormula inline formula={`R_2 = R_1 \\cdot \\frac{L_2}{L_1} \\cdot \\left(\\frac{d_1}{d_2}\\right)^2`} />
          </div>
        </div>

        {/* Experiment with multipliers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Length Multiplier (L₂ / L₁):</span>
              <span className="font-mono text-sm text-blue-600">{lengthMultiplier}× length</span>
            </div>
            <div className="flex gap-2">
              {[0.5, 1, 2, 3, 4].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLengthMultiplier(m)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    lengthMultiplier === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m}×
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Wire Diameter Multiplier (d₂ / d₁):</span>
              <span className="font-mono text-sm text-indigo-600">{diameterMultiplier}× diameter</span>
            </div>
            <div className="flex gap-2">
              {[0.5, 0.707, 1, 1.414, 2].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDiameterMultiplier(m)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                    diameterMultiplier === m
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {m}×
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-xs font-extrabold uppercase tracking-wider text-blue-800">
              Resulting Resistance Multiplier:
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-blue-950">
              R₂ = {resistanceMultiplier.toFixed(2)} × R₁
            </div>
            <p className="text-xs text-slate-600">
              Area scales by diameter² = ({diameterMultiplier})² = {areaMultiplier.toFixed(2)}×.
              Resistance scales by {lengthMultiplier} / {areaMultiplier.toFixed(2)} = <strong>{resistanceMultiplier.toFixed(2)}×</strong>.
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs text-slate-700 space-y-1 shrink-0 max-w-xs shadow-2xs">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Board Exam Insight:</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-normal">
              If a wire is <em>stretched</em> to twice its length without adding material, its volume is constant, so area halves!
              Thus resistance becomes <span className="font-mono font-bold text-indigo-700">2 / (1/2) = 4× R₁</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
