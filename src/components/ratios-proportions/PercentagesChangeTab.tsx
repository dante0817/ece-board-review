import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { Percent, TrendingDown, ShieldAlert } from 'lucide-react';

export const PercentagesChangeTab: React.FC = () => {
  // 3-way percent solver
  const [calcMode, setCalcMode] = useState<'part' | 'percent' | 'base'>('part');
  const [baseVal, setBaseVal] = useState<number>(240);
  const [pctVal, setPctVal] = useState<number>(15);
  const [partVal, setPartVal] = useState<number>(36);

  // Asymmetry trap simulator
  const [increasePct, setIncreasePct] = useState<number>(25); // e.g. +25%
  const [dropPct, setDropPct] = useState<number>(20); // e.g. -20%

  // Resistor tolerance calculator
  const [nominalResistor, setNominalResistor] = useState<number>(4700); // 4.7k
  const [tolerancePct, setTolerancePct] = useState<number>(5); // 5% (Gold band)

  // Asymmetry calculations
  // Starting at 100
  const afterIncrease = 100 * (1 + increasePct / 100);
  const afterDropFromInc = afterIncrease * (1 - dropPct / 100);
  const netChangeFrom100 = afterDropFromInc - 100;

  // Recovery required after a loss
  const lossPct = increasePct; // say drop by X%
  const afterLoss = 100 * (1 - lossPct / 100);
  const recoveryPctNeeded = lossPct < 100 ? ((100 / afterLoss) - 1) * 100 : 0;

  // Resistor tolerance min and max
  const minResistor = nominalResistor * (1 - tolerancePct / 100);
  const maxResistor = nominalResistor * (1 + tolerancePct / 100);

  return (
    <div className="space-y-8 text-slate-800">
      {/* Banner */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 border border-emerald-100 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              Essential Board Concept
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              Percentages, Percent Change & Asymmetry
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Percent means <em>per hundred</em> (<MathFormula inline formula={`\\% = \\frac{1}{100}`} />).
              Master the base identity, reverse percentages, and the notorious <strong>Asymmetry Trap</strong>.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs shrink-0">
            Formula: Part = Base × (Percent / 100)
          </div>
        </div>
      </div>

      {/* The Famous ECE Asymmetry Trap Interactive Demo */}
      <div className="bg-white rounded-2xl border-2 border-amber-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
              Top 3 Board Exam Trap
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">
              The Asymmetry of Percentage Increases and Decreases
            </h3>
            <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
              <strong>Question:</strong> If a price increases by 25%, then drops by 20%, does it return to its original value?
              <strong> YES!</strong> (1.25 × 0.80 = 1.00). But if it increases by 25% then drops by 25%, you LOSE 6.25%!
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-emerald-900">
                <span className="flex items-center gap-1">
                  <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-emerald-600" />
                  Initial Increase (+X%):
                </span>
                <span className="font-mono text-base font-extrabold text-emerald-700">+{increasePct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={increasePct}
                onChange={(e) => setIncreasePct(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="text-[11px] text-emerald-800">
                Multiplier: <span className="font-mono font-bold">{(1 + increasePct / 100).toFixed(2)}×</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-rose-900">
                <span className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  Subsequent Decrease (-Y%):
                </span>
                <span className="font-mono text-base font-extrabold text-rose-700">-{dropPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={dropPct}
                onChange={(e) => setDropPct(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="text-[11px] text-rose-800">
                Multiplier: <span className="font-mono font-bold">{(1 - dropPct / 100).toFixed(2)}×</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Simulation Result */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Base Quantity: 100.00
              </span>
              <div className="text-xs font-mono font-semibold">
                Net Multiplier: (1 + {increasePct / 100}) × (1 - {dropPct / 100}) ={' '}
                <span className="font-bold text-blue-700">
                  {((1 + increasePct / 100) * (1 - dropPct / 100)).toFixed(4)}
                </span>
              </div>
            </div>

            {/* Visual step pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="text-[10px] uppercase font-bold text-slate-400">Step 1: Start</div>
                <div className="text-xl font-mono font-black text-slate-800 mt-1">100.00</div>
                <div className="text-[11px] text-slate-500">Original Base</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-[10px] uppercase font-bold text-emerald-600">Step 2: After +{increasePct}%</div>
                <div className="text-xl font-mono font-black text-emerald-700 mt-1">
                  {afterIncrease.toFixed(2)}
                </div>
                <div className="text-[11px] text-emerald-600">New Higher Base</div>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  Math.abs(netChangeFrom100) < 0.01
                    ? 'bg-blue-50 border-blue-300'
                    : netChangeFrom100 < 0
                    ? 'bg-rose-50 border-rose-300'
                    : 'bg-emerald-50 border-emerald-300'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-slate-500">Step 3: After -{dropPct}%</div>
                <div
                  className={`text-xl font-mono font-black mt-1 ${
                    Math.abs(netChangeFrom100) < 0.01
                      ? 'text-blue-700'
                      : netChangeFrom100 < 0
                      ? 'text-rose-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {afterDropFromInc.toFixed(2)}
                </div>
                <div className="text-[11px] font-bold">
                  Net: {netChangeFrom100 >= 0 ? `+${netChangeFrom100.toFixed(2)}%` : `${netChangeFrom100.toFixed(2)}%`}
                </div>
              </div>
            </div>

            {/* Reverse Recovery Rule */}
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-extrabold text-amber-950">Loss Recovery Formula:</span>
                <p className="text-amber-900 text-[11px] mt-0.5">
                  If an investment or component rating drops by <strong>-{lossPct}%</strong>, to return to 100% requires:
                </p>
              </div>
              <div className="px-4 py-2 bg-white rounded-lg border border-amber-300 font-mono font-black text-amber-900 text-sm shadow-2xs">
                +{recoveryPctNeeded.toFixed(2)}% Gain Required
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Way Percent Calculator (Part, Percent, Base) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span>Universal 3-Way Percent Calculator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select which variable is unknown: Part, Percentage, or Original Base.
            </p>
          </div>
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setCalcMode('part')}
              className={`px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                calcMode === 'part' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Find Part (A)
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('percent')}
              className={`px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                calcMode === 'percent' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Find % (P)
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('base')}
              className={`px-3 py-1 font-bold rounded-lg transition-colors cursor-pointer ${
                calcMode === 'base' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Find Base (B)
            </button>
          </div>
        </div>

        {/* Inputs based on calcMode */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {calcMode === 'part' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Percentage (P%):</label>
                <input
                  type="number"
                  value={pctVal}
                  onChange={(e) => setPctVal(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Base (B):</label>
                <input
                  type="number"
                  value={baseVal}
                  onChange={(e) => setBaseVal(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-sm bg-white"
                />
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-600">Calculated Part (A)</span>
                <div className="text-xl font-mono font-black text-emerald-900 mt-0.5">
                  {((pctVal / 100) * baseVal).toFixed(2)}
                </div>
              </div>
            </>
          )}

          {calcMode === 'percent' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Part (A):</label>
                <input
                  type="number"
                  value={partVal}
                  onChange={(e) => setPartVal(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Base (B):</label>
                <input
                  type="number"
                  value={baseVal}
                  onChange={(e) => setBaseVal(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-sm bg-white"
                />
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-600">Calculated Percent</span>
                <div className="text-xl font-mono font-black text-emerald-900 mt-0.5">
                  {baseVal !== 0 ? ((partVal / baseVal) * 100).toFixed(2) : 0}%
                </div>
              </div>
            </>
          )}

          {calcMode === 'base' && (
            <>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Part (A):</label>
                <input
                  type="number"
                  value={partVal}
                  onChange={(e) => setPartVal(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-sm bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Percentage (P%):</label>
                <input
                  type="number"
                  value={pctVal}
                  onChange={(e) => setPctVal(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold text-sm bg-white"
                />
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-600">Original Base (B)</span>
                <div className="text-xl font-mono font-black text-emerald-900 mt-0.5">
                  {pctVal !== 0 ? ((partVal / pctVal) * 100).toFixed(2) : 0}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resistor Tolerance Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
              ECE Component Application
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-1">
              Resistor Tolerance & Value Range
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard commercial resistors have tolerances of ±1% (Brown), ±2% (Red), ±5% (Gold), or ±10% (Silver).
            </p>
          </div>
          <div className="flex gap-2">
            {[
              { label: '±1%', val: 1, color: 'border-amber-700 text-amber-800' },
              { label: '±2%', val: 2, color: 'border-rose-600 text-rose-700' },
              { label: '±5% (Gold)', val: 5, color: 'border-amber-500 text-amber-700' },
              { label: '±10% (Silver)', val: 10, color: 'border-slate-400 text-slate-700' },
            ].map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setTolerancePct(t.val)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                  tolerancePct === t.val
                    ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                    : `bg-white ${t.color} hover:bg-slate-50`
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Range Display */}
        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-purple-900">
              Nominal: {nominalResistor} Ω ({nominalResistor / 1000} kΩ) ± {tolerancePct}%
            </span>
            <div className="text-sm font-mono text-slate-700">
              ΔR = ±{(nominalResistor * (tolerancePct / 100)).toFixed(1)} Ω
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono font-bold text-sm">
            <div className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Min Valid R</span>
              {minResistor.toFixed(1)} Ω
            </div>
            <span className="text-slate-400">to</span>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Max Valid R</span>
              {maxResistor.toFixed(1)} Ω
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
