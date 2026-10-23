import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { Volume2 } from 'lucide-react';

export const EceApplicationsTab: React.FC = () => {
  // Voltage Divider State
  const [vin, setVin] = useState<number>(12);
  const [r1, setR1] = useState<number>(1000); // 1k
  const [r2, setR2] = useState<number>(2000); // 2k

  // Current Divider State
  const [iTotal, setITotal] = useState<number>(30); // 30 mA
  const [cr1, setCr1] = useState<number>(300);
  const [cr2, setCr2] = useState<number>(600);

  // Transformer State
  const [np, setNp] = useState<number>(500); // Primary turns
  const [ns, setNs] = useState<number>(100); // Secondary turns
  const [vp, setVp] = useState<number>(120); // 120V input
  const [zs, setZs] = useState<number>(8); // 8 ohm speaker load

  // Decibel Converter State
  const [dbMode, setDbMode] = useState<'power' | 'voltage'>('power');
  const [val1, setVal1] = useState<number>(1);
  const [val2, setVal2] = useState<number>(2);

  // VDR Calculations
  const rTotal = r1 + r2;
  const v1 = rTotal > 0 ? vin * (r1 / rTotal) : 0;
  const v2 = rTotal > 0 ? vin * (r2 / rTotal) : 0;

  // CDR Calculations
  const crTotal = cr1 + cr2;
  const i1 = crTotal > 0 ? iTotal * (cr2 / crTotal) : 0; // Notice cr2 in numerator!
  const i2 = crTotal > 0 ? iTotal * (cr1 / crTotal) : 0;

  // Transformer Calculations
  const turnsRatio = ns > 0 ? np / ns : 1; // a = Np / Ns
  const vs = turnsRatio > 0 ? vp / turnsRatio : 0;
  const reflectedZp = turnsRatio * turnsRatio * zs;

  // Decibel calculation
  const ratio = val1 > 0 ? val2 / val1 : 1;
  const calculatedDb =
    dbMode === 'power'
      ? 10 * Math.log10(ratio > 0 ? ratio : 1e-6)
      : 20 * Math.log10(ratio > 0 ? ratio : 1e-6);

  return (
    <div className="space-y-8 text-slate-800">
      {/* Banner */}
      <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              Board Exam Direct Application
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              ECE Circuit & Signal Ratios
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              In electronics engineering, ratios govern <strong>voltage dividers</strong>, <strong>current dividers</strong>,
              <strong> transformer impedance matching</strong>, and <strong>decibel logarithmic ratios</strong>.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-xs font-bold text-blue-800 shadow-2xs shrink-0">
            High-Yield: 4 to 6 Questions per Exam
          </div>
        </div>
      </div>

      {/* 1. Voltage Divider Rule (VDR) & Current Divider Rule (CDR) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VDR Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              Voltage Divider Rule (VDR)
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">Series: I is Constant</span>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900">Direct Resistance Ratio</h3>
            <div className="mt-1 text-xs">
              <MathFormula formula={`V_{R2} = V_{in} \\cdot \\frac{R_2}{R_1 + R_2}`} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Voltage divides <em>directly</em> proportional to resistance. The larger resistor drops more voltage.
            </p>
          </div>

          {/* Interactive controls */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3 text-xs">
            <div className="flex justify-between font-bold text-blue-900">
              <span>Input Voltage (V_in):</span>
              <span className="font-mono text-sm">{vin} V</span>
            </div>
            <input
              type="range"
              min="1"
              max="48"
              value={vin}
              onChange={(e) => setVin(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-600 block mb-1">R₁ (Ω):</label>
                <input
                  type="number"
                  value={r1}
                  onChange={(e) => setR1(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded-lg font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">R₂ (Ω):</label>
                <input
                  type="number"
                  value={r2}
                  onChange={(e) => setR2(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded-lg font-mono font-bold bg-white"
                />
              </div>
            </div>

            {/* Voltage readout */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-center font-mono">
              <div className="p-2.5 bg-white rounded-lg border border-blue-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Drop V₁</span>
                <span className="text-base font-black text-blue-700">{v1.toFixed(2)} V</span>
                <span className="text-[10px] text-slate-400 block">{((r1 / rTotal) * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-blue-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Drop V₂ (Output)</span>
                <span className="text-base font-black text-blue-700">{v2.toFixed(2)} V</span>
                <span className="text-[10px] text-slate-400 block">{((r2 / rTotal) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CDR Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
              Current Divider Rule (CDR)
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">Parallel: V is Constant</span>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900">Inverse Resistance Ratio</h3>
            <div className="mt-1 text-xs">
              <MathFormula formula={`I_1 = I_{total} \\cdot \\frac{R_2}{R_1 + R_2}`} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Current takes the path of least resistance! Notice that <strong>R₂</strong> is in the numerator to find <strong>I₁</strong>.
            </p>
          </div>

          {/* Interactive controls */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-3 text-xs">
            <div className="flex justify-between font-bold text-purple-900">
              <span>Total Current (I_total):</span>
              <span className="font-mono text-sm">{iTotal} mA</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={iTotal}
              onChange={(e) => setITotal(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Branch R₁ (Ω):</label>
                <input
                  type="number"
                  value={cr1}
                  onChange={(e) => setCr1(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded-lg font-mono font-bold bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 block mb-1">Branch R₂ (Ω):</label>
                <input
                  type="number"
                  value={cr2}
                  onChange={(e) => setCr2(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded-lg font-mono font-bold bg-white"
                />
              </div>
            </div>

            {/* Current readout */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-center font-mono">
              <div className="p-2.5 bg-white rounded-lg border border-purple-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Current I₁ (thru R₁)</span>
                <span className="text-base font-black text-purple-700">{i1.toFixed(2)} mA</span>
                <span className="text-[10px] text-slate-400 block">{((cr2 / crTotal) * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-purple-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Current I₂ (thru R₂)</span>
                <span className="text-base font-black text-purple-700">{i2.toFixed(2)} mA</span>
                <span className="text-[10px] text-slate-400 block">{((cr1 / crTotal) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ideal Transformer Turns Ratio & Impedance Matching */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              Magnetic Coupling
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <AppArtwork name="chip" inline className="w-4 h-4 text-amber-600" />
              <span>Transformer Turns Ratio & Impedance Matching</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Voltage scales with turns ratio a, while impedance scales with the square of the turns ratio a²!
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
            Z_p = (N_p / N_s)² · Z_s
          </div>
        </div>

        {/* Turns Ratio Master Formula Box */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <MathFormula formula={`\\frac{N_p}{N_s} = \\frac{V_p}{V_s} = \\frac{I_s}{I_p} = \\sqrt{\\frac{Z_p}{Z_s}} = a`} />
        </div>

        {/* Transformer interactive simulator */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-600">Primary Turns N_p:</span>
            <input
              type="number"
              value={np}
              onChange={(e) => setNp(Number(e.target.value))}
              className="w-full px-2 py-1 border rounded font-mono font-bold"
            />
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-600">Secondary Turns N_s:</span>
            <input
              type="number"
              value={ns}
              onChange={(e) => setNs(Number(e.target.value))}
              className="w-full px-2 py-1 border rounded font-mono font-bold"
            />
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-600">Primary Voltage V_p (V):</span>
            <input
              type="number"
              value={vp}
              onChange={(e) => setVp(Number(e.target.value))}
              className="w-full px-2 py-1 border rounded font-mono font-bold"
            />
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="font-bold text-slate-600">Load Impedance Z_s (Ω):</span>
            <input
              type="number"
              value={zs}
              onChange={(e) => setZs(Number(e.target.value))}
              className="w-full px-2 py-1 border rounded font-mono font-bold"
            />
          </div>
        </div>

        {/* Output metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Turns Ratio (a)</span>
            <span className="text-xl font-black text-amber-900">{turnsRatio.toFixed(2)} : 1</span>
            <span className="text-[11px] text-amber-700 block mt-0.5">
              {turnsRatio > 1 ? 'Step-Down' : turnsRatio < 1 ? 'Step-Up' : '1:1 Isolation'}
            </span>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">Secondary Voltage (V_s)</span>
            <span className="text-xl font-black text-blue-900">{vs.toFixed(2)} V</span>
            <span className="text-[11px] text-blue-700 block mt-0.5">V_s = V_p / a</span>
          </div>

          <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-[10px] uppercase font-bold text-purple-800 block">Reflected Impedance (Z_p)</span>
            <span className="text-xl font-black text-purple-900">{reflectedZp.toFixed(1)} Ω</span>
            <span className="text-[11px] text-purple-700 block mt-0.5">Z_p = a² × Z_s</span>
          </div>
        </div>
      </div>

      {/* 3. Decibels (dB) Logarithmic Ratios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
              Logarithmic Ratios
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-rose-600" />
              <span>Decibels (dB) Power & Voltage Ratios</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Decibels represent logarithmic ratios to compress wide dynamic ranges (sound, RF signals, amplifier gain).
            </p>
          </div>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setDbMode('power')}
              className={`px-3 py-1 font-bold rounded-lg cursor-pointer ${
                dbMode === 'power' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Power: 10 log(P₂/P₁)
            </button>
            <button
              type="button"
              onClick={() => setDbMode('voltage')}
              className={`px-3 py-1 font-bold rounded-lg cursor-pointer ${
                dbMode === 'voltage' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Voltage: 20 log(V₂/V₁)
            </button>
          </div>
        </div>

        {/* Quick Reference Benchmark Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px]">Ratio 1:1</span>
            <span className="text-base font-bold text-slate-800">0 dB</span>
            <span className="text-[10px] text-slate-500 block">Unity Gain</span>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-rose-400 block text-[10px]">Ratio 2:1 Power</span>
            <span className="text-base font-bold text-rose-700">+3.01 dB</span>
            <span className="text-[10px] text-rose-500 block">Double Power</span>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-blue-400 block text-[10px]">Ratio 1:2 Power</span>
            <span className="text-base font-bold text-blue-700">-3.01 dB</span>
            <span className="text-[10px] text-blue-500 block">Half-Power Cutoff</span>
          </div>
          <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
            <span className="text-purple-400 block text-[10px]">Ratio 10:1</span>
            <span className="text-base font-bold text-purple-700">
              {dbMode === 'power' ? '+10 dB' : '+20 dB'}
            </span>
            <span className="text-[10px] text-purple-500 block">Decade Scale</span>
          </div>
        </div>

        {/* Interactive Converter */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              Input {dbMode === 'power' ? 'Power P₁' : 'Voltage V₁'}:
            </label>
            <input
              type="number"
              value={val1}
              onChange={(e) => setVal1(Number(e.target.value))}
              className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold bg-white text-sm"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              Output {dbMode === 'power' ? 'Power P₂' : 'Voltage V₂'}:
            </label>
            <input
              type="number"
              value={val2}
              onChange={(e) => setVal2(Number(e.target.value))}
              className="w-full px-3 py-1.5 border rounded-lg font-mono font-bold bg-white text-sm"
            />
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Calculated Gain</span>
            <div className="text-2xl font-mono font-black text-rose-800 mt-0.5">
              {calculatedDb.toFixed(2)} dB
            </div>
            <span className="text-[11px] text-rose-600 font-mono">
              (Linear Ratio: {ratio.toFixed(3)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
