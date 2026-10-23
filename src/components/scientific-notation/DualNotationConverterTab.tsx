import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import React, { useState, useMemo } from 'react';
import { MathFormula } from '../MathFormula';
import { RefreshCw, Calculator, ArrowRight, CheckCircle2, AlertTriangle, Layers, Zap } from 'lucide-react';

export const DualNotationConverterTab: React.FC = () => {
  // Input raw number
  const [inputVal, setInputVal] = useState<string>('470000');

  // Casio ENG shift offset (multiples of 3)
  const [engShiftOffset, setEngShiftOffset] = useState<number>(0);

  // Parse numeric value
  const num = useMemo(() => {
    const parsed = parseFloat(inputVal);
    return isNaN(parsed) ? 0 : parsed;
  }, [inputVal]);

  // Scientific Notation: a * 10^n where 1 <= |a| < 10
  const scientific = useMemo(() => {
    if (num === 0) return { mantissa: 0, exponent: 0 };
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const man = num / Math.pow(10, exp);
    return {
      mantissa: parseFloat(man.toFixed(4)),
      exponent: exp,
    };
  }, [num]);

  // Engineering Notation: a * 10^n where 1 <= |a| < 1000 and n is multiple of 3
  const baseEngineering = useMemo(() => {
    if (num === 0) return { mantissa: 0, exponent: 0, prefix: '' };
    const rawExp = Math.floor(Math.log10(Math.abs(num)));
    const engExp = Math.floor(rawExp / 3) * 3;
    const man = num / Math.pow(10, engExp);

    let prefix = '';
    switch (engExp) {
      case 12:
        prefix = 'Tera (T)';
        break;
      case 9:
        prefix = 'Giga (G)';
        break;
      case 6:
        prefix = 'Mega (M)';
        break;
      case 3:
        prefix = 'kilo (k)';
        break;
      case 0:
        prefix = 'base (units)';
        break;
      case -3:
        prefix = 'milli (m)';
        break;
      case -6:
        prefix = 'micro (μ)';
        break;
      case -9:
        prefix = 'nano (n)';
        break;
      case -12:
        prefix = 'pico (p)';
        break;
      case -15:
        prefix = 'femto (f)';
        break;
      default:
        prefix = `10^${engExp}`;
    }

    return {
      mantissa: parseFloat(man.toFixed(4)),
      exponent: engExp,
      prefix,
    };
  }, [num]);

  // Dynamic engineering notation shifted by ENG key
  const shiftedEngineering = useMemo(() => {
    const finalExp = baseEngineering.exponent + engShiftOffset * 3;
    const finalMan = num / Math.pow(10, finalExp);
    return {
      mantissa: parseFloat(finalMan.toFixed(6)),
      exponent: finalExp,
    };
  }, [baseEngineering, engShiftOffset, num]);

  // Presets
  const setPreset = (val: string) => {
    setInputVal(val);
    setEngShiftOffset(0);
  };

  return (
    <div className="space-y-8 text-slate-800">
      <CalculatorCompatibilityNotice/>
      {/* Banner */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50/40 to-slate-50 border border-blue-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
              Side-by-Side Dual Analysis
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              Scientific vs. Engineering Notation
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              While <strong>Scientific Notation</strong> restricts the mantissa to <MathFormula inline formula="1 \le |a| < 10" />,
              <strong> Engineering Notation</strong> requires the exponent to be an exact <strong>multiple of 3</strong> to match SI metric prefixes.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-blue-200 text-xs font-bold text-blue-800 shadow-2xs shrink-0">
            Rule: Engineering Exponent ∈ {`{..., -6, -3, 0, 3, 6, 9, ...}`}
          </div>
        </div>
      </div>

      {/* Interactive Input & Presets */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
              Enter Any Number (Decimal, Integer, or Exponent):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => {
                  setInputVal(e.target.value);
                  setEngShiftOffset(0);
                }}
                placeholder="e.g. 470000 or 0.000047"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-mono text-base font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-blue-600"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 font-semibold mr-1">ECE Presets:</span>
            {[
              { label: '470 kΩ (470000)', val: '470000' },
              { label: '2.5 mA (0.0025)', val: '0.0025' },
              { label: '100 nF (0.0000001)', val: '0.0000001' },
              { label: '15.75 MHz (15750000)', val: '15750000' },
              { label: '0.047', val: '0.047' },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPreset(p.val)}
                className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition-colors cursor-pointer ${
                  inputVal === p.val
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side Dual Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Scientific Notation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-50/70 to-slate-50 border border-blue-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                Scientific Notation
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">1 ≤ |a| &lt; 10</span>
            </div>

            <div>
              <div className="text-3xl font-mono font-black text-blue-950">
                <MathFormula formula={`${scientific.mantissa} \\times 10^{${scientific.exponent}}`} />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Mantissa has exactly <strong>one non-zero digit</strong> before the decimal point:
                <span className="font-mono font-bold text-blue-900 mx-1">{scientific.mantissa}</span>.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Significand / Mantissa:</span>
                <span className="font-mono font-bold text-slate-800">{scientific.mantissa}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Exponent of Ten:</span>
                <span className="font-mono font-bold text-slate-800">{scientific.exponent}</span>
              </div>
            </div>
          </div>

          {/* Engineering Notation Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/70 to-slate-50 border border-indigo-200 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                Engineering Notation
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">Exp is Multiple of 3</span>
            </div>

            <div>
              <div className="text-3xl font-mono font-black text-indigo-950">
                <MathFormula formula={`${baseEngineering.mantissa} \\times 10^{${baseEngineering.exponent}}`} />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Exponent is constrained to a <strong>multiple of 3</strong> to directly match SI metric prefixes:
                <span className="font-bold text-indigo-900 mx-1">{baseEngineering.prefix}</span>.
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-indigo-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Engineering Mantissa (1 to 999.9):</span>
                <span className="font-mono font-bold text-slate-800">{baseEngineering.mantissa}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Multiple-of-3 Exponent:</span>
                <span className="font-mono font-bold text-slate-800">{baseEngineering.exponent}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Casio fx-991 [ENG] Key Interactive Simulator */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-mono font-black text-sm">
              ENG
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Casio fx-991 Calculator [ENG] Key Simulator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pressing <span className="text-amber-400 font-mono font-bold">[ENG]</span> decreases the exponent by 3;
                pressing <span className="text-indigo-400 font-mono font-bold">[SHIFT] + [ENG]</span> increases the exponent by 3.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Offset: <span className="text-amber-400 font-bold">{engShiftOffset * 3}</span> exponents
          </div>
        </div>

        {/* Calculator LCD Screen */}
        <div className="p-4 rounded-xl bg-[#0f172a] border border-slate-800 font-mono flex flex-col items-end justify-center min-h-[90px] shadow-inner">
          <div className="text-xs text-slate-500 font-semibold mb-1">fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) PLUS NATURAL-V.P.A.M.</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider">
            {shiftedEngineering.mantissa} × 10^{shiftedEngineering.exponent}
          </div>
        </div>

        {/* Physical Keystroke Buttons */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => setEngShiftOffset((prev) => prev + 1)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>[SHIFT] + [ENG]</span>
            <span className="text-[10px] text-slate-400">(Exp +3)</span>
          </button>

          <button
            type="button"
            onClick={() => setEngShiftOffset((prev) => prev - 1)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>[ENG]</span>
            <span className="text-[10px] text-slate-900 font-bold">(Exp -3)</span>
          </button>

          <button
            type="button"
            onClick={() => setEngShiftOffset(0)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 text-xs font-mono font-semibold cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
