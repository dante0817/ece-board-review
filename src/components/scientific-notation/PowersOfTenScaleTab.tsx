import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { Sliders, Sparkles, Zap, ArrowRight, CheckCircle2, Globe, HelpCircle } from 'lucide-react';

interface ScalePoint {
  exponent: number;
  label: string;
  example: string;
  category: 'subatomic' | 'micro' | 'human' | 'macro' | 'cosmic';
  valueNotation: string;
}

const SCALE_POINTS: ScalePoint[] = [
  {
    exponent: -19,
    label: 'Elementary Charge (e)',
    example: '1.602 × 10⁻¹⁹ Coulombs — Charge of a single electron',
    category: 'subatomic',
    valueNotation: '1.602 \\times 10^{-19}\\text{ C}',
  },
  {
    exponent: -15,
    label: 'Femtometer (Proton Radius)',
    example: '0.84 × 10⁻¹⁵ m — Size of atomic nucleus, femtosecond laser pulses',
    category: 'subatomic',
    valueNotation: '10^{-15}\\text{ m (1 fm)}',
  },
  {
    exponent: -12,
    label: 'Picofarad (Stray PCB Capacitance)',
    example: '10⁻¹² F — Typical high-frequency parasitic capacitance between PCB traces',
    category: 'subatomic',
    valueNotation: '10^{-12}\\text{ F (1 pF)}',
  },
  {
    exponent: -9,
    label: 'Nanometer (Lithography Gate)',
    example: '3 × 10⁻⁹ m — Modern 3nm semiconductor transistor gate oxide width',
    category: 'micro',
    valueNotation: '3 \\times 10^{-9}\\text{ m (3 nm)}',
  },
  {
    exponent: -6,
    label: 'Microsecond / Micron',
    example: '10⁻⁶ s / m — Period of 1 MHz clock pulse; wavelength of infrared lasers',
    category: 'micro',
    valueNotation: '10^{-6}\\text{ s (1 }\\mu\\text{s)}',
  },
  {
    exponent: -3,
    label: 'Milliampere / Millisecond',
    example: '10⁻³ A — Current threshold for human perception (1 mA)',
    category: 'micro',
    valueNotation: '10^{-3}\\text{ A (1 mA)}',
  },
  {
    exponent: 0,
    label: 'Unity Base Scale (10⁰ = 1)',
    example: '1.0 — Standard baseline meter, volt, ampere, ohm, second',
    category: 'human',
    valueNotation: '10^0 = 1',
  },
  {
    exponent: 3,
    label: 'Kilo-ohm / Kilohertz',
    example: '10³ Ω — Typical audio circuit biasing resistor; 1 kHz audio test tone',
    category: 'human',
    valueNotation: '10^3\\text{ }\\Omega\\text{ (1 k}\\Omega\\text{)}',
  },
  {
    exponent: 6,
    label: 'Megahertz / Megawatt',
    example: '10⁶ Hz — AM radio frequency broadcast band (540 kHz to 1600 kHz)',
    category: 'macro',
    valueNotation: '10^6\\text{ Hz (1 MHz)}',
  },
  {
    exponent: 8,
    label: 'Speed of Light in Vacuum (c)',
    example: '2.998 × 10⁸ m/s — Electromagnetic wave velocity in free space',
    category: 'macro',
    valueNotation: '3 \\times 10^8\\text{ m/s}',
  },
  {
    exponent: 9,
    label: 'Gigahertz (Modern CPU Clock)',
    example: '10⁹ Hz — 3.5 GHz desktop CPU clock; Wi-Fi 5 GHz microwave band',
    category: 'macro',
    valueNotation: '10^9\\text{ Hz (1 GHz)}',
  },
  {
    exponent: 12,
    label: 'Terabyte / Terahertz',
    example: '10¹² bytes — High-speed SSD storage capacity; far-infrared radiation',
    category: 'cosmic',
    valueNotation: '10^{12}\\text{ (1 Tera)}',
  },
];

export const PowersOfTenScaleTab: React.FC = () => {
  const [selectedExp, setSelectedExp] = useState<number>(0);

  const currentPoint =
    SCALE_POINTS.find((p) => p.exponent === selectedExp) ||
    SCALE_POINTS.reduce((prev, curr) =>
      Math.abs(curr.exponent - selectedExp) < Math.abs(prev.exponent - selectedExp) ? curr : prev
    );

  return (
    <div className="space-y-8 text-slate-800">
      {/* Overview Banner */}
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50/40 to-slate-50 border border-indigo-100 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
              Physical Intuition
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              Powers of Ten & Scale of the Universe
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Electronics engineering spans over <strong>30 orders of magnitude</strong>—from subatomic electron charges
              (<MathFormula inline formula="10^{-19}\text{ C}" />) to gigahertz microwaves (<MathFormula inline formula="10^9\text{ Hz}" />).
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-indigo-700 shadow-2xs shrink-0">
            Rule: 10ⁿ means 1 followed by n zeros; 10⁻ⁿ = 1 / 10ⁿ
          </div>
        </div>
      </div>

      {/* Interactive Scale Explorer Slider */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Interactive Physical Scale Explorer: 10⁻¹⁹ to 10¹²</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag the slider to explore the physical reality of exponents in physics and electronics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Current Exponent:</span>
            <span className="font-mono text-base font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
              10^{selectedExp >= 0 ? `+${selectedExp}` : selectedExp}
            </span>
          </div>
        </div>

        {/* Exponent Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="-19"
            max="12"
            step="1"
            value={selectedExp}
            onChange={(e) => setSelectedExp(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>10⁻¹⁹ (Electron Charge)</span>
            <span>10⁻⁹ (Nano)</span>
            <span>10⁰ (Base Unit)</span>
            <span>10⁶ (Mega)</span>
            <span>10¹² (Tera)</span>
          </div>
        </div>

        {/* Current Benchmark Card */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-slate-50 border border-indigo-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                Order: 10^{currentPoint.exponent}
              </span>
              <h4 className="text-base font-black text-slate-900">{currentPoint.label}</h4>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xl">
              {currentPoint.example}
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-indigo-200 text-center font-mono shrink-0 shadow-2xs">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Mathematical Value</span>
            <div className="text-base font-bold text-indigo-900 mt-0.5">
              <MathFormula formula={currentPoint.valueNotation} />
            </div>
          </div>
        </div>

        {/* Clickable Preset Benchmarks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {SCALE_POINTS.map((sp) => (
            <button
              key={sp.exponent}
              type="button"
              onClick={() => setSelectedExp(sp.exponent)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedExp === sp.exponent
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span
                className={`font-mono font-bold block text-xs ${
                  selectedExp === sp.exponent ? 'text-indigo-200' : 'text-indigo-600'
                }`}
              >
                10^{sp.exponent >= 0 ? `+${sp.exponent}` : sp.exponent}
              </span>
              <span className="text-[11px] font-semibold line-clamp-1 mt-0.5">{sp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Exponent Laws for Powers of Ten */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            The Fundamental Laws
          </span>
          <h3 className="text-base font-extrabold text-slate-900 mt-1">
            Exponent Arithmetic Rules for Powers of Ten
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Memorize these core identities to simplify fast calculations without touching your calculator.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold text-blue-700">1. Product Rule (Add Powers)</span>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
              <MathFormula formula="10^a \\cdot 10^b = 10^{a + b}" />
            </div>
            <p className="text-[11px] text-slate-600">
              Example: <MathFormula inline formula="10^3 \\times 10^6 = 10^{3+6} = 10^9" /> (kilo × mega = giga).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold text-indigo-700">2. Quotient Rule (Subtract Powers)</span>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
              <MathFormula formula="\\frac{10^a}{10^b} = 10^{a - b}" />
            </div>
            <p className="text-[11px] text-slate-600">
              Example: <MathFormula inline formula="\\frac{10^3}{10^{-3}} = 10^{3 - (-3)} = 10^6" /> (kilo / milli = mega).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold text-purple-700">3. Power of a Power (Multiply)</span>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
              <MathFormula formula="(10^a)^b = 10^{a \\cdot b}" />
            </div>
            <p className="text-[11px] text-slate-600">
              Example: <MathFormula inline formula="(10^3)^2 = 10^{3 \\times 2} = 10^6" /> (1 kilometer squared = 10⁶ m²).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold text-rose-700">4. Negative Exponent (Reciprocal)</span>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
              <MathFormula formula="10^{-n} = \\frac{1}{10^n}" />
            </div>
            <p className="text-[11px] text-slate-600">
              Example: <MathFormula inline formula="10^{-3} = \\frac{1}{1000} = 0.001" />. A negative exponent NEVER means a negative number!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold text-emerald-700">5. Zero Exponent (Unity)</span>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
              <MathFormula formula="10^0 = 1" />
            </div>
            <p className="text-[11px] text-slate-600">
              Any non-zero base raised to the power of 0 equals exactly 1.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-extrabold text-amber-700">6. Fractional Exponent (Roots)</span>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
              <MathFormula formula="10^{m/n} = \\sqrt[n]{10^m}" />
            </div>
            <p className="text-[11px] text-slate-600">
              Example: <MathFormula inline formula="10^{1/2} = \\sqrt{10} \\approx 3.162" />.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
