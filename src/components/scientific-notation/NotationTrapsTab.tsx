import { CalculatorCompatibilityNotice } from '../CalculatorCompatibilityNotice';
import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

interface TrapItem {
  id: string;
  title: string;
  category: string;
  badCode: string;
  goodCode: string;
  explanation: string;
  examRisk: string;
  counterExample: string;
}

const NOTATION_TRAPS: TrapItem[] = [
  {
    id: 'trap-non-normalized-scientific',
    title: 'The Un-normalized Scientific Mantissa',
    category: 'Scientific Form',
    badCode: '48.5 \\times 10^3 \\text{ (marked as scientific notation)}',
    goodCode: '4.85 \\times 10^4 \\quad (1 \\le |a| < 10)',
    explanation:
      'By international ISO definition, scientific notation strictly dictates that the mantissa must have exactly ONE non-zero digit to the left of the decimal point (1 ≤ |a| < 10). While 48.5 × 10³ is mathematically equivalent, it is engineering form, NOT scientific form.',
    examRisk: 'Extremely Frequent. PRC examiners offer both 48.5 × 10³ and 4.85 × 10⁴ in the multiple-choice items and ask for "standard scientific notation".',
    counterExample:
      '0.035 × 10⁶ is NOT scientific notation. The correct scientific notation is 3.5 × 10⁴.',
  },
  {
    id: 'trap-non-multiple-engineering',
    title: 'Non-Multiple of 3 in Engineering Notation',
    category: 'Engineering Form',
    badCode: '4.7 \\times 10^4\\text{ }\\Omega \\text{ (claimed as engineering notation)}',
    goodCode: '47 \\times 10^3\\text{ }\\Omega \\text{ (47 k}\\Omega\\text{)} \\quad (n \\in 3\\mathbb{Z})',
    explanation:
      'Engineering notation exists specifically to bridge numbers with SI metric prefixes (kilo, mega, giga, milli, micro). Therefore, the exponent MUST be an integer multiple of 3 (..., -6, -3, 0, 3, 6, 9, ...). 10⁴ does not map to any standard SI prefix.',
    examRisk: 'High. Board questions test whether students understand that engineering notation requires multiples of 3.',
    counterExample:
      'To put 2.5 × 10⁵ Hz into engineering notation, shift to 250 × 10³ Hz (250 kHz) or 0.25 × 10⁶ Hz (0.25 MHz).',
  },
  {
    id: 'trap-prefix-mismatch-addition',
    title: 'Prefix Mismatch in Direct Arithmetic Addition',
    category: 'Dimensional Analysis',
    badCode: '5\\text{ mA} + 200\\text{ }\\mu\\text{A} = 205\\text{ mA}',
    goodCode: '5\\text{ mA} + 0.2\\text{ mA} = 5.2\\text{ mA} \\quad (5200\\text{ }\\mu\\text{A})',
    explanation:
      'Different metric prefixes represent completely different orders of magnitude. 200 μA is 0.2 mA, NOT 200 mA! You cannot directly add the numbers without equalizing the SI prefixes first.',
    examRisk: 'Lethal trap in circuit analysis. When adding base currents in μA to collector currents in mA, adding raw numbers ruins the problem.',
    counterExample:
      'In a BJT transistor: I_E = I_C + I_B. If I_C = 2 mA and I_B = 50 μA, I_E = 2 mA + 0.05 mA = 2.05 mA, NOT 52 mA!',
  },
  {
    id: 'trap-negative-exponent-sign',
    title: 'Negative Exponent Inversion Fallacy (10⁻ⁿ ≠ -10ⁿ)',
    category: 'Exponent Law',
    badCode: '10^{-3} = -1000',
    goodCode: '10^{-3} = \\frac{1}{10^3} = \\frac{1}{1000} = +0.001',
    explanation:
      'A negative exponent is a measure of division (multiplicative inverse/reciprocal), NOT algebraic negation. 10⁻³ is a positive, fractional quantity (+0.001), never a negative value.',
    examRisk: 'Common in novice calculations of electric fields, capacitance, and path loss decibels.',
    counterExample:
      '5 × 10⁻⁴ = 5 / 10,000 = +0.0005. It is strictly greater than zero.',
  },
  {
    id: 'trap-casio-exp-key-redundancy',
    title: 'Casio fx-991 [×10ˣ] Redundancy Keystroke Trap',
    category: 'Calculator Technique',
    badCode: '\\text{Typing: } 3 \\times 10 \\text{ [\\times 10^x] } 4 \\implies 3 \\times 10^{14}!',
    goodCode: '\\text{Typing: } 3 \\text{ [\\times 10^x] } 4 \\implies 3 \\times 10^4',
    explanation:
      'The [×10ˣ] (or [EXP]) key on your scientific calculator already represents the entire operation "× 10^". If you type the number 10 before pressing the key, you accidentally multiply by an extra factor of 10¹⁰!',
    examRisk: 'Extremely Common cause of bizarre 10 orders-of-magnitude calculation blowups during timed exams.',
    counterExample:
      'To enter 4.7 × 10³, press: [4] [.] [7] [×10ˣ] [3]. Do NOT press [×] or type [1] [0].',
  },
];

export const NotationTrapsTab: React.FC = () => {
  const [selectedTrapId, setSelectedTrapId] = useState<string>(NOTATION_TRAPS[0].id);

  const currentTrap = NOTATION_TRAPS.find((t) => t.id === selectedTrapId) || NOTATION_TRAPS[0];

  return (
    <div className="space-y-8 text-slate-800">
      <CalculatorCompatibilityNotice/>
      {/* Banner */}
      <div className="bg-gradient-to-br from-rose-50 via-amber-50/40 to-slate-50 border border-rose-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
              Exam Error Immunity
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              Spot the Illegal Move: Notation & Prefix Traps
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Examine these 5 notorious traps—including calculator keystroke blunders and prefix mismatch additions—that
              derail examinees on board exams.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-800 shadow-2xs shrink-0 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>5 Core Pitfalls</span>
          </div>
        </div>
      </div>

      {/* Main interactive browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trap list */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
            Traps & Common Pitfalls
          </span>
          {NOTATION_TRAPS.map((trap, idx) => (
            <button
              key={trap.id}
              type="button"
              onClick={() => setSelectedTrapId(trap.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedTrapId === trap.id
                  ? 'bg-rose-50/80 border-rose-300 shadow-2xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Trap 0{idx + 1} • {trap.category}
                </span>
                {selectedTrapId === trap.id && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <h4
                className={`text-xs font-bold mt-1 line-clamp-1 ${
                  selectedTrapId === trap.id ? 'text-rose-900' : 'text-slate-800'
                }`}
              >
                {trap.title}
              </h4>
            </button>
          ))}
        </div>

        {/* Selected Trap Detailed Analysis */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
              {currentTrap.category}
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1.5">
              {currentTrap.title}
            </h3>
          </div>

          {/* Bad vs Good Visual Diff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* The Illegal Trap */}
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>ILLEGAL / INCORRECT FORM</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-rose-200 text-center">
                <MathFormula formula={currentTrap.badCode} />
              </div>
            </div>

            {/* The Correct Form */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>CORRECT MATHEMATICAL FORM</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-emerald-200 text-center">
                <MathFormula formula={currentTrap.goodCode} />
              </div>
            </div>
          </div>

          {/* Concrete Counter-Example */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <AppArtwork name="bulb" inline className="w-4 h-4 text-amber-600" />
              <span>Realistic Problem Illustration:</span>
            </div>
            <p className="text-xs font-mono text-amber-950 leading-relaxed bg-white/80 p-3 rounded-lg border border-amber-200">
              {currentTrap.counterExample}
            </p>
          </div>

          {/* Why It Fails & Exam Risk */}
          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                Reasoning & Practical Failure Mode:
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">{currentTrap.explanation}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700">Exam Trap Frequency:</span>
              <p className="text-slate-600 mt-0.5">{currentTrap.examRisk}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
