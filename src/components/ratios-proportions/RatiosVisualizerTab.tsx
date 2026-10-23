import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { MathFormula } from '../MathFormula';
import { Sliders, AlertCircle } from 'lucide-react';

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export const RatiosVisualizerTab: React.FC = () => {
  // Ratio A : B state
  const [valA, setValA] = useState<number>(6);
  const [valB, setValB] = useState<number>(10);

  // 3-way divider state
  const [threeA, setThreeA] = useState<number>(2);
  const [threeB, setThreeB] = useState<number>(3);
  const [threeC, setThreeC] = useState<number>(5);
  const [threeTotal, setThreeTotal] = useState<number>(120);

  // Unit consistency practice state
  const [unitValue1, setUnitValue1] = useState<number>(250);
  const [unit1, setUnit1] = useState<'mA' | 'cm' | 'kOhm' | 'ms'>('mA');
  const [unitValue2, setUnitValue2] = useState<number>(1.5);
  const [unit2, setUnit2] = useState<'A' | 'm' | 'MOhm' | 's'>('A');

  // Computed ratio values
  const safeA = Math.max(1, Math.round(valA));
  const safeB = Math.max(1, Math.round(valB));
  const divisor = gcd(safeA, safeB);
  const simplifiedA = safeA / divisor;
  const simplifiedB = safeB / divisor;

  const totalParts = safeA + safeB;
  const pctA = ((safeA / totalParts) * 100).toFixed(1);
  const pctB = ((safeB / totalParts) * 100).toFixed(1);

  // 3-way calculations
  const safe3A = Math.max(1, Math.round(threeA));
  const safe3B = Math.max(1, Math.round(threeB));
  const safe3C = Math.max(1, Math.round(threeC));
  const sum3 = safe3A + safe3B + safe3C;
  const shareA = ((safe3A / sum3) * threeTotal).toFixed(2);
  const shareB = ((safe3B / sum3) * threeTotal).toFixed(2);
  const shareC = ((safe3C / sum3) * threeTotal).toFixed(2);

  // Unit consistency calculation
  const unitResult = useMemo(() => {
    let multiplier1 = 1;
    let multiplier2 = 1;
    let baseUnit = '';

    if (unit1 === 'mA' && unit2 === 'A') {
      multiplier1 = 1e-3;
      multiplier2 = 1;
      baseUnit = 'A';
    } else if (unit1 === 'cm' && unit2 === 'm') {
      multiplier1 = 1e-2;
      multiplier2 = 1;
      baseUnit = 'm';
    } else if (unit1 === 'kOhm' && unit2 === 'MOhm') {
      multiplier1 = 1e3;
      multiplier2 = 1e6;
      baseUnit = 'Ω';
    } else if (unit1 === 'ms' && unit2 === 's') {
      multiplier1 = 1e-3;
      multiplier2 = 1;
      baseUnit = 's';
    }

    const standard1 = unitValue1 * multiplier1;
    const standard2 = unitValue2 * multiplier2;
    const ratioFloat = standard2 > 0 ? standard1 / standard2 : 1;

    return {
      standard1,
      standard2,
      baseUnit,
      ratioFloat,
    };
  }, [unitValue1, unit1, unitValue2, unit2]);

  return (
    <div className="space-y-8 text-slate-800">
      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50/40 to-slate-50 border border-blue-100 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
              Intuitive Mental Model
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              Ratios & Part-to-Whole Intuition
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              A <strong>ratio</strong> is a multiplicative comparison of two or more quantities. Ratios can compare
              <strong> Part-to-Part</strong> (e.g. quantity A vs. quantity B) or <strong>Part-to-Whole</strong> (e.g. component fraction of the total).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-xs font-bold text-blue-700 shadow-2xs">
              Board Focus: Voltage Dividers & Unit Normalization
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Ratio Scaler & Visualizer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Interactive 2-Term Ratio Scaler</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust values A and B to observe automatic GCD simplification, fraction equivalents, and part-to-whole conversion.
            </p>
          </div>
          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 font-semibold mr-1">Presets:</span>
            {[
              { label: '3 : 4', a: 3, b: 4 },
              { label: '6 : 10', a: 6, b: 10 },
              { label: '16 : 9', a: 16, b: 9 },
              { label: '25 : 75', a: 25, b: 75 },
              { label: '1 : 4', a: 1, b: 4 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setValA(p.a);
                  setValB(p.b);
                }}
                className={`px-2 py-1 rounded-lg font-mono text-xs font-bold border transition-colors cursor-pointer ${
                  safeA === p.a && safeB === p.b
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Sliders & Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                <span>Quantity A (First Term)</span>
                <span className="font-mono text-base text-blue-700 bg-white px-2.5 py-0.5 rounded-md border border-blue-200">
                  {safeA}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={safeA}
                onChange={(e) => setValA(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                <span>Quantity B (Second Term)</span>
                <span className="font-mono text-base text-indigo-700 bg-white px-2.5 py-0.5 rounded-md border border-indigo-200">
                  {safeB}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={safeB}
                onChange={(e) => setValB(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Core Mathematical Form Representation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Raw Input Ratio</div>
              <div className="text-xl font-mono font-black text-slate-800">
                {safeA} : {safeB}
              </div>
              <div className="text-xs text-slate-500">
                Fraction form: <MathFormula inline formula={`\\frac{${safeA}}{${safeB}}`} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Lowest Term (Reduced by GCD = {divisor})
              </div>
              <div className="text-2xl font-mono font-black text-blue-700">
                {simplifiedA} : {simplifiedB}
              </div>
              <div className="text-xs text-blue-600 font-semibold">
                Fraction form: <MathFormula inline formula={`\\frac{${simplifiedA}}{${simplifiedB}}`} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Decimal Quotient</div>
              <div className="text-2xl font-mono font-black text-emerald-700">
                {(safeA / safeB).toFixed(4)}
              </div>
              <div className="text-xs text-emerald-600">
                {safeA} is {( (safeA / safeB) * 100).toFixed(1)}% of {safeB}
              </div>
            </div>
          </div>

          {/* Part-to-Part vs Part-to-Whole Visualizer */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Visual Bar Comparison: Part-to-Part vs Part-to-Whole
            </h4>

            {/* Part-to-Whole Stacked Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span className="text-blue-700">
                  Part A: {safeA} parts ({pctA}% of total)
                </span>
                <span className="text-indigo-700">
                  Part B: {safeB} parts ({pctB}% of total)
                </span>
              </div>
              <div className="h-8 w-full rounded-xl overflow-hidden flex bg-slate-100 border border-slate-200 shadow-inner">
                <div
                  style={{ width: `${pctA}%` }}
                  className="bg-blue-600 flex items-center justify-center text-white text-xs font-mono font-bold transition-all"
                >
                  {Number(pctA) > 12 ? `${pctA}%` : ''}
                </div>
                <div
                  style={{ width: `${pctB}%` }}
                  className="bg-indigo-600 flex items-center justify-center text-white text-xs font-mono font-bold transition-all"
                >
                  {Number(pctB) > 12 ? `${pctB}%` : ''}
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>0% (Total parts = {totalParts})</span>
                <span>100%</span>
              </div>
            </div>

            {/* Algebraic Formulas for Part-to-Whole */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-around gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Fraction A of Whole:</span>
                <MathFormula formula={`\\frac{A}{A + B} = \\frac{${safeA}}{${safeA}+${safeB}} = \\frac{${safeA}}{${totalParts}}`} />
              </div>
              <div className="h-4 w-px bg-slate-300 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Fraction B of Whole:</span>
                <MathFormula formula={`\\frac{B}{A + B} = \\frac{${safeB}}{${safeA}+${safeB}} = \\frac{${safeB}}{${totalParts}}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Way Proportional Divider (e.g., Resistor Series / Concrete / Alloy) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
              Multi-Term Distribution
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <AppArtwork name="cards" inline className="w-4 h-4 text-purple-600" />
              <span>3-Way Ratio Proportional Divider: A : B : C</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribute any whole value (voltage, current, power, alloy mass, or money) proportionally among three terms.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500">Total Quantity:</span>
            <input
              type="number"
              value={threeTotal}
              onChange={(e) => setThreeTotal(Number(e.target.value) || 0)}
              className="w-24 px-2.5 py-1 rounded-lg border border-slate-300 font-mono font-bold text-slate-800 text-right focus:outline-blue-600"
            />
          </div>
        </div>

        {/* 3 Input controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex justify-between text-xs font-bold text-amber-900 mb-1.5">
              <span>Ratio Term A (R₁)</span>
              <span className="font-mono text-sm">{safe3A}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={safe3A}
              onChange={(e) => setThreeA(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="mt-2 text-xs font-bold text-amber-800">
              Share: <span className="font-mono text-sm">{shareA}</span> ({((safe3A / sum3) * 100).toFixed(1)}%)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex justify-between text-xs font-bold text-blue-900 mb-1.5">
              <span>Ratio Term B (R₂)</span>
              <span className="font-mono text-sm">{safe3B}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={safe3B}
              onChange={(e) => setThreeB(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="mt-2 text-xs font-bold text-blue-800">
              Share: <span className="font-mono text-sm">{shareB}</span> ({((safe3B / sum3) * 100).toFixed(1)}%)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="flex justify-between text-xs font-bold text-emerald-900 mb-1.5">
              <span>Ratio Term C (R₃)</span>
              <span className="font-mono text-sm">{safe3C}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={safe3C}
              onChange={(e) => setThreeC(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="mt-2 text-xs font-bold text-emerald-800">
              Share: <span className="font-mono text-sm">{shareC}</span> ({((safe3C / sum3) * 100).toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* Visual 3-part bar */}
        <div className="space-y-1.5">
          <div className="h-8 w-full rounded-xl overflow-hidden flex bg-slate-100 border border-slate-200 shadow-inner">
            <div
              style={{ width: `${(safe3A / sum3) * 100}%` }}
              className="bg-amber-500 flex items-center justify-center text-white text-xs font-mono font-bold"
            >
              {((safe3A / sum3) * 100) > 10 ? `${shareA}` : ''}
            </div>
            <div
              style={{ width: `${(safe3B / sum3) * 100}%` }}
              className="bg-blue-600 flex items-center justify-center text-white text-xs font-mono font-bold"
            >
              {((safe3B / sum3) * 100) > 10 ? `${shareB}` : ''}
            </div>
            <div
              style={{ width: `${(safe3C / sum3) * 100}%` }}
              className="bg-emerald-600 flex items-center justify-center text-white text-xs font-mono font-bold"
            >
              {((safe3C / sum3) * 100) > 10 ? `${shareC}` : ''}
            </div>
          </div>
          <div className="text-center text-xs text-slate-500 font-mono">
            {shareA} + {shareB} + {shareC} = {threeTotal} (Total Sum of Parts: {safe3A} + {safe3B} + {safe3C} = {sum3})
          </div>
        </div>
      </div>

      {/* Critical Board Rule: Unit Consistency & Normalization */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-extrabold text-amber-950">
              Board Exam Trap: Unit Consistency Before Ratio Reduction
            </h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              A ratio comparing quantities with units is only meaningful when both terms are converted into the <strong>exact same unit</strong>.
              For example, <span className="font-mono font-bold text-amber-900">250 mA : 1.5 A ≠ 250 : 1.5</span>. You must first convert to amperes:
              <span className="font-mono font-bold text-amber-900"> 0.25 A : 1.5 A = 25 : 150 = 1 : 6</span>!
            </p>
          </div>
        </div>

        {/* Live unit normalization test */}
        <div className="p-4 rounded-xl bg-white border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500">First Quantity:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={unitValue1}
                onChange={(e) => setUnitValue1(Number(e.target.value))}
                className="w-24 px-2 py-1 border rounded-lg text-xs font-mono font-bold"
              />
              <select
                value={unit1}
                onChange={(e) => setUnit1(e.target.value as any)}
                className="px-2 py-1 border rounded-lg text-xs font-bold bg-slate-50"
              >
                <option value="mA">mA</option>
                <option value="cm">cm</option>
                <option value="kOhm">kΩ</option>
                <option value="ms">ms</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Second Quantity:</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={unitValue2}
                onChange={(e) => setUnitValue2(Number(e.target.value))}
                className="w-24 px-2 py-1 border rounded-lg text-xs font-mono font-bold"
              />
              <select
                value={unit2}
                onChange={(e) => setUnit2(e.target.value as any)}
                className="px-2 py-1 border rounded-lg text-xs font-bold bg-slate-50"
              >
                <option value="A">A</option>
                <option value="m">m</option>
                <option value="MOhm">MΩ</option>
                <option value="s">s</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Normalized Ratio</div>
            <div className="text-base font-mono font-black text-emerald-900 mt-0.5">
              1 : {(1 / unitResult.ratioFloat).toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
              ({unitResult.standard1.toFixed(4)} {unitResult.baseUnit} : {unitResult.standard2.toFixed(4)} {unitResult.baseUnit})
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
