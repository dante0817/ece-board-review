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

const TRAPS_DATA: TrapItem[] = [
  {
    id: 'trap-additive-ratio',
    title: 'The Additive Ratio Fallacy (Adding k to Both Terms)',
    category: 'Ratio Invariance',
    badCode: '\\frac{a}{b} = \\frac{a + k}{b + k}',
    goodCode: '\\frac{a}{b} = \\frac{a \\cdot k}{b \\cdot k} \\quad (k \\neq 0)',
    explanation:
      'A ratio is strictly a multiplicative relationship, NOT an additive one. Multiplying or dividing both terms by non-zero k preserves the quotient, but adding k alters the quotient unless a = b.',
    examRisk: 'Very High (18% board exam slip rate). Seen when students attempt to balance mixtures or resistors by adding constants.',
    counterExample:
      'If a/b = 2/3 (0.667) and you add 5 to both: (2+5)/(3+5) = 7/8 = 0.875! Notice 0.875 ≠ 0.667.',
  },
  {
    id: 'trap-symmetrical-percent',
    title: 'The Symmetrical Percentage Illusion (+X% then -X%)',
    category: 'Percent Change',
    badCode: '+X\\% \\text{ then } -X\\% = 0\\% \\text{ net change}',
    goodCode: '\\text{Net Multiplier} = (1 + x)(1 - x) = 1 - x^2 < 1',
    explanation:
      'Because the second percentage is calculated on a larger base, the decrease in absolute terms is always greater than the initial increase. Successive identical percentage increases and decreases always result in a net deficit of x².',
    examRisk: 'High (22% slip rate). Frequent in cost-analysis, power efficiency fluctuation, and battery degradation questions.',
    counterExample:
      'Start with 100. Increase by 20% → 120. Now decrease by 20% of 120 (which is 24) → 96. You lost 4% (0.20² = 0.04)!',
  },
  {
    id: 'trap-pct-points-vs-pct-change',
    title: 'Percentage Points vs. Percent Change Confusion',
    category: 'Terminology Trap',
    badCode: '10\\% \\to 15\\% = +5\\% \\text{ increase}',
    goodCode: '10\\% \\to 15\\% = +5\\text{ percentage points} = +50\\% \\text{ relative increase}',
    explanation:
      'Percentage points are the simple arithmetic difference (15 - 10 = 5 pp). Relative percentage change is (New - Old) / Old × 100% = (15 - 10)/10 × 100% = +50%! Board questions often deliberately offer both in the choices.',
    examRisk: 'Extremely High. PRC examiners love using the exact wording "relative percentage increase" to eliminate students who pick the simple difference.',
    counterExample:
      'If an amplifier duty cycle shifts from 20% to 25%, the change is 5 percentage points, but the relative increase is +25%!',
  },
  {
    id: 'trap-unnormalized-units',
    title: 'Unnormalized Unit Comparison in Ratios',
    category: 'Dimensional Analysis',
    badCode: '300\\text{ mA} : 1.5\\text{ A} = 300 : 1.5 = 200 : 1',
    goodCode: '300\\text{ mA} : 1500\\text{ mA} = 300 : 1500 = 1 : 5',
    explanation:
      'You cannot form a valid mathematical ratio between physical quantities without first matching their prefixes and units. Comparing raw magnitudes without unit conversion is a complete dimensional failure.',
    examRisk: 'Moderate to High. Common when computing current gains, transconductance, or resistor-capacitor time constant ratios.',
    counterExample:
      '300 mA = 0.3 A. The ratio of 0.3 A to 1.5 A is 0.3 / 1.5 = 1/5 (or 1 : 5), NOT 200 : 1!',
  },
  {
    id: 'trap-inverted-cdr',
    title: 'Current Divider Rule Inverted Numerator Fallacy',
    category: 'Circuit Analysis',
    badCode: 'I_1 = I_T \\cdot \\frac{R_1}{R_1 + R_2}',
    goodCode: 'I_1 = I_T \\cdot \\frac{R_2}{R_1 + R_2} = I_T \\cdot \\frac{G_1}{G_1 + G_2}',
    explanation:
      'In a parallel circuit, current divides INVERSELY with resistance. Therefore, the fraction of current flowing through branch 1 is proportional to the resistance of the OPPOSITE branch R₂!',
    examRisk: 'Extremely Common in early ECE problem sets. Students confuse Voltage Divider (direct R) with Current Divider (inverse R).',
    counterExample:
      'If R₁ = 10 Ω and R₂ = 90 Ω, 90% of the current should flow through R₁! Thus I₁ = I_T × (90 / 100) = 0.9 I_T.',
  },
];

export const RatioTrapsTab: React.FC = () => {
  const [selectedTrapId, setSelectedTrapId] = useState<string>(TRAPS_DATA[0].id);

  const currentTrap = TRAPS_DATA.find((t) => t.id === selectedTrapId) || TRAPS_DATA[0];

  return (
    <div className="space-y-8 text-slate-800">
      {/* Banner */}
      <div className="bg-gradient-to-br from-rose-50 via-amber-50/40 to-slate-50 border border-rose-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
              Board Exam Immunity
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              Spot the Illegal Move & Exam Pitfalls
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Examiners design distractor choices around known cognitive biases. Master these 5 lethal traps
              to guarantee full marks on ratio, proportion, and percent questions.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-800 shadow-2xs shrink-0 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>5 Critical Exam Traps</span>
          </div>
        </div>
      </div>

      {/* Main interactive trap browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trap List Column */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
            Common Traps Catalog
          </span>
          {TRAPS_DATA.map((trap, idx) => (
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
                <span>ILLEGAL BOARD DISTRACTOR</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-rose-200 text-center">
                <MathFormula formula={currentTrap.badCode} />
              </div>
            </div>

            {/* The Rigorous Truth */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>MATHEMATICALLY RIGOROUS TRUTH</span>
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
              <span>Intuitive Concrete Counter-Example:</span>
            </div>
            <p className="text-xs font-mono text-amber-950 leading-relaxed bg-white/80 p-3 rounded-lg border border-amber-200">
              {currentTrap.counterExample}
            </p>
          </div>

          {/* Why It Fails & Exam Risk */}
          <div className="space-y-3 text-xs">
            <div>
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                Mathematical Mechanism & Why It Fails:
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
