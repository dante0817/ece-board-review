import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { MathFormula } from '../MathFormula';
import { Plus, Minus, X, Divide } from 'lucide-react';

export const NotationArithmeticTab: React.FC = () => {
  // Operation: add, sub, mul, div
  const [op, setOp] = useState<'add' | 'sub' | 'mul' | 'div'>('add');

  // Operand 1: m1 * 10^e1
  const [m1, setM1] = useState<number>(3.5);
  const [e1, setE1] = useState<number>(4);

  // Operand 2: m2 * 10^e2
  const [m2, setM2] = useState<number>(4.2);
  const [e2, setE2] = useState<number>(3);

  // Computed arithmetic with intermediate steps
  const calculation = useMemo(() => {
    const val1 = m1 * Math.pow(10, e1);
    const val2 = m2 * Math.pow(10, e2);

    let rawResult = 0;
    let stepDescription = '';

    if (op === 'add') {
      rawResult = val1 + val2;
      const targetExp = Math.max(e1, e2);
      const shiftedM1 = m1 * Math.pow(10, e1 - targetExp);
      const shiftedM2 = m2 * Math.pow(10, e2 - targetExp);
      stepDescription = `Equalize exponents to 10^${targetExp}: (${shiftedM1} + ${shiftedM2}) × 10^${targetExp} = ${(shiftedM1 + shiftedM2).toFixed(4)} × 10^${targetExp}`;
    } else if (op === 'sub') {
      rawResult = val1 - val2;
      const targetExp = Math.max(e1, e2);
      const shiftedM1 = m1 * Math.pow(10, e1 - targetExp);
      const shiftedM2 = m2 * Math.pow(10, e2 - targetExp);
      stepDescription = `Equalize exponents to 10^${targetExp}: (${shiftedM1} - ${shiftedM2}) × 10^${targetExp} = ${(shiftedM1 - shiftedM2).toFixed(4)} × 10^${targetExp}`;
    } else if (op === 'mul') {
      rawResult = val1 * val2;
      const rawMantissa = m1 * m2;
      const rawExp = e1 + e2;
      stepDescription = `Multiply mantissas and add exponents: (${m1} × ${m2}) × 10^(${e1} + ${e2}) = ${rawMantissa.toFixed(4)} × 10^${rawExp}`;
    } else if (op === 'div') {
      rawResult = m2 !== 0 ? val1 / val2 : 0;
      const rawMantissa = m2 !== 0 ? m1 / m2 : 0;
      const rawExp = e1 - e2;
      stepDescription = `Divide mantissas and subtract exponents: (${m1} / ${m2}) × 10^(${e1} - ${e2}) = ${rawMantissa.toFixed(4)} × 10^${rawExp}`;
    }

    // Normalized scientific
    let normExp = 0;
    let normMan = 0;
    if (rawResult !== 0) {
      normExp = Math.floor(Math.log10(Math.abs(rawResult)));
      normMan = rawResult / Math.pow(10, normExp);
    }

    // Normalized engineering
    let engExp = 0;
    let engMan = 0;
    if (rawResult !== 0) {
      engExp = Math.floor(Math.floor(Math.log10(Math.abs(rawResult))) / 3) * 3;
      engMan = rawResult / Math.pow(10, engExp);
    }

    return {
      rawResult,
      stepDescription,
      normMan: parseFloat(normMan.toFixed(4)),
      normExp,
      engMan: parseFloat(engMan.toFixed(4)),
      engExp,
    };
  }, [op, m1, e1, m2, e2]);

  return (
    <div className="space-y-8 text-slate-800">
      {/* Banner */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 border border-emerald-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Computational Rigor
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              Arithmetic Operations in Scientific Notation
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              <strong>Addition/Subtraction</strong> requires equalizing exponents before combining mantissas.
              <strong> Multiplication/Division</strong> operates directly on mantissas and adds/subtracts exponents.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs shrink-0">
            Gold Rule: Never add mantissas with different powers!
          </div>
        </div>
      </div>

      {/* Interactive Arithmetic Sandbox */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Interactive Two-Operand Evaluator & Step Resolver
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the arithmetic operator and adjust the mantissas and powers of ten.
            </p>
          </div>
          {/* Operator picker */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setOp('add')}
              className={`p-2 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer ${
                op === 'add' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
            <button
              type="button"
              onClick={() => setOp('sub')}
              className={`p-2 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer ${
                op === 'sub' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Subtract</span>
            </button>
            <button
              type="button"
              onClick={() => setOp('mul')}
              className={`p-2 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer ${
                op === 'mul' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Multiply</span>
            </button>
            <button
              type="button"
              onClick={() => setOp('div')}
              className={`p-2 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer ${
                op === 'div' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Divide className="w-3.5 h-3.5" />
              <span>Divide</span>
            </button>
          </div>
        </div>

        {/* Two operand inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Operand 1 */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3">
            <span className="text-xs font-bold text-blue-900 block">First Operand (A × 10ⁿ)</span>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Mantissa A:</label>
                <input
                  type="number"
                  step="0.1"
                  value={m1}
                  onChange={(e) => setM1(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold bg-white text-sm"
                />
              </div>
              <div className="text-sm font-bold text-slate-400 mt-4">× 10^</div>
              <div className="w-24">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Power n:</label>
                <input
                  type="number"
                  value={e1}
                  onChange={(e) => setE1(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold bg-white text-sm"
                />
              </div>
            </div>
            <div className="text-center font-mono font-bold text-blue-700 text-xs">
              <MathFormula formula={`${m1} \\times 10^{${e1}}`} />
            </div>
          </div>

          {/* Operand 2 */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <span className="text-xs font-bold text-indigo-900 block">Second Operand (B × 10ᵐ)</span>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Mantissa B:</label>
                <input
                  type="number"
                  step="0.1"
                  value={m2}
                  onChange={(e) => setM2(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold bg-white text-sm"
                />
              </div>
              <div className="text-sm font-bold text-slate-400 mt-4">× 10^</div>
              <div className="w-24">
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Power m:</label>
                <input
                  type="number"
                  value={e2}
                  onChange={(e) => setE2(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold bg-white text-sm"
                />
              </div>
            </div>
            <div className="text-center font-mono font-bold text-indigo-700 text-xs">
              <MathFormula formula={`${m2} \\times 10^{${e2}}`} />
            </div>
          </div>
        </div>

        {/* Step-by-Step Derivation Output */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <AppArtwork name="bulb" inline className="w-4 h-4 text-amber-500" />
            <span>Intermediate Algorithmic Step:</span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-800">
            {calculation.stepDescription}
          </div>
        </div>

        {/* Final Standardized Outputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1 text-center font-mono">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
              Normalized Scientific Result (1 ≤ |a| &lt; 10)
            </span>
            <div className="text-xl font-black text-blue-900 mt-1">
              <MathFormula formula={`${calculation.normMan} \\times 10^{${calculation.normExp}}`} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1 text-center font-mono">
            <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
              Normalized Engineering Result (Exp is Multiple of 3)
            </span>
            <div className="text-xl font-black text-indigo-900 mt-1">
              <MathFormula formula={`${calculation.engMan} \\times 10^{${calculation.engExp}}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
