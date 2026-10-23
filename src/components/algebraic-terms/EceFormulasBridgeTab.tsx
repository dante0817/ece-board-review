import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import {
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Sliders,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';

interface EceFormulaItem {
  id: string;
  name: string;
  domain: 'Circuits & GEAS' | 'Electronics' | 'Communications';
  rawFormulaLatex: string;
  description: string;
  targetIsolations: {
    variable: string;
    latex: string;
    derivationSteps: string[];
  }[];
  sampleInputs: { [key: string]: number };
  sampleInputLabels: { [key: string]: string };
  computeResult: (inputs: { [key: string]: number }) => { value: string; unit: string };
  boardTrap: string;
}

const ECE_FORMULAS: EceFormulaItem[] = [
  {
    id: 'ece-parallel-z',
    name: 'Parallel Equivalent Impedance / Resistance',
    domain: 'Circuits & GEAS',
    rawFormulaLatex: 'Z_T = \\frac{Z_1 Z_2}{Z_1 + Z_2}',
    description: 'Two impedances in parallel. Frequently requires isolating one branch impedance when the total equivalent impedance is known.',
    targetIsolations: [
      {
        variable: 'Z_1',
        latex: 'Z_1 = \\frac{Z_T \\cdot Z_2}{Z_2 - Z_T}',
        derivationSteps: [
          'Multiply both sides by denominator: Z_T(Z_1 + Z_2) = Z_1 Z_2',
          'Distribute Z_T: Z_T Z_1 + Z_T Z_2 = Z_1 Z_2',
          'Collect terms containing Z_1 on one side: Z_T Z_2 = Z_1 Z_2 - Z_T Z_1',
          'Factor out common factor Z_1: Z_T Z_2 = Z_1(Z_2 - Z_T)',
          'Divide by (Z_2 - Z_T): Z_1 = \\frac{Z_T Z_2}{Z_2 - Z_T}',
        ],
      },
      {
        variable: 'Z_2',
        latex: 'Z_2 = \\frac{Z_T \\cdot Z_1}{Z_1 - Z_T}',
        derivationSteps: [
          'By algebraic symmetry of identical branches, isolate Z_2 similarly.',
        ],
      },
    ],
    sampleInputs: { Z_T: 200, Z_2: 300 },
    sampleInputLabels: { Z_T: 'Target Total Z_T (Ω)', Z_2: 'Branch 2 Z_2 (Ω)' },
    computeResult: (inputs) => {
      const ZT = inputs['Z_T'] || 200;
      const Z2 = inputs['Z_2'] || 300;
      const den = Z2 - ZT;
      if (den <= 0) return { value: 'Invalid (Z2 must be > ZT)', unit: '' };
      const res = (ZT * Z2) / den;
      return { value: res.toFixed(2), unit: 'Ω' };
    },
    boardTrap: 'Denominator trap: students often write Z2 + ZT instead of Z2 - ZT when isolating Z1, leading to parallel instead of series subtraction.',
  },
  {
    id: 'ece-opamp-gain',
    name: 'Op-Amp Non-Inverting Closed-Loop Voltage Gain',
    domain: 'Electronics',
    rawFormulaLatex: 'A_v = 1 + \\frac{R_f}{R_1} = \\frac{R_1 + R_f}{R_1}',
    description: 'Closed-loop voltage amplification factor of a non-inverting operational amplifier configuration.',
    targetIsolations: [
      {
        variable: 'R_f',
        latex: 'R_f = R_1(A_v - 1)',
        derivationSteps: [
          'Subtract 1 from both sides: A_v - 1 = \\frac{R_f}{R_1}',
          'Multiply by R_1: R_f = R_1(A_v - 1)',
        ],
      },
      {
        variable: 'R_1',
        latex: 'R_1 = \\frac{R_f}{A_v - 1}',
        derivationSteps: [
          'From R_f = R_1(A_v - 1), divide both sides by (A_v - 1): R_1 = \\frac{R_f}{A_v - 1}',
        ],
      },
    ],
    sampleInputs: { A_v: 11, R_1: 1000 },
    sampleInputLabels: { A_v: 'Desired Gain Av (V/V)', R_1: 'Input Resistor R1 (Ω)' },
    computeResult: (inputs) => {
      const Av = inputs['A_v'] || 11;
      const R1 = inputs['R_1'] || 1000;
      const Rf = R1 * (Av - 1);
      return { value: Rf.toLocaleString(), unit: 'Ω (Feedback Resistor)' };
    },
    boardTrap: 'Forgetting the +1 in non-inverting gain, confusing it with inverting amplifier gain magnitude Av = Rf / R1.',
  },
  {
    id: 'ece-resonant-freq',
    name: 'LC Resonant Frequency Formula',
    domain: 'Communications',
    rawFormulaLatex: 'f_r = \\frac{1}{2\\pi \\sqrt{L \\cdot C}}',
    description: 'Resonance condition where inductive reactance equals capacitive reactance (X_L = X_C).',
    targetIsolations: [
      {
        variable: 'L',
        latex: 'L = \\frac{1}{4\\pi^2 f_r^2 C}',
        derivationSteps: [
          'Square both sides: f_r^2 = \\frac{1}{4\\pi^2 L C}',
          'Multiply both sides by L: L \\cdot f_r^2 = \\frac{1}{4\\pi^2 C}',
          'Divide by f_r^2: L = \\frac{1}{4\\pi^2 f_r^2 C}',
        ],
      },
      {
        variable: 'C',
        latex: 'C = \\frac{1}{4\\pi^2 f_r^2 L}',
        derivationSteps: [
          'Symmetrically isolate C: C = \\frac{1}{4\\pi^2 f_r^2 L}',
        ],
      },
    ],
    sampleInputs: { f_r: 1000000, C: 0.0000000001 },
    sampleInputLabels: { f_r: 'Frequency fr (1 MHz = 10⁶ Hz)', C: 'Capacitance C (100 pF = 10⁻¹⁰ F)' },
    computeResult: (inputs) => {
      const fr = inputs['f_r'] || 1e6;
      const C = inputs['C'] || 1e-10;
      const L = 1 / (4 * Math.PI * Math.PI * fr * fr * C);
      const microH = L * 1e6;
      return { value: `${microH.toFixed(2)} µH (${L.toExponential(3)} H)`, unit: '' };
    },
    boardTrap: 'Squaring 2π to get 2π² instead of (2π)² = 4π²; omitting parentheses around entire denominator on Casio.',
  },
  {
    id: 'ece-energy-cap',
    name: 'Electrostatic Energy Stored in Capacitor',
    domain: 'Circuits & GEAS',
    rawFormulaLatex: 'W = \\frac{1}{2} C V^2',
    description: 'Energy stored in the dielectric electric field of a capacitor under voltage V.',
    targetIsolations: [
      {
        variable: 'V',
        latex: 'V = \\sqrt{\\frac{2W}{C}}',
        derivationSteps: [
          'Multiply both sides by 2: 2W = C V^2',
          'Divide by C: V^2 = \\frac{2W}{C}',
          'Take positive square root: V = \\sqrt{\\frac{2W}{C}}',
        ],
      },
      {
        variable: 'C',
        latex: 'C = \\frac{2W}{V^2}',
        derivationSteps: [
          'Multiply by 2 and divide by V²: C = \\frac{2W}{V^2}',
        ],
      },
    ],
    sampleInputs: { W: 0.05, C: 0.00001 },
    sampleInputLabels: { W: 'Stored Energy W (0.05 J = 50 mJ)', C: 'Capacitance C (10 µF = 10⁻⁵ F)' },
    computeResult: (inputs) => {
      const W = inputs['W'] || 0.05;
      const C = inputs['C'] || 1e-5;
      const V = Math.sqrt((2 * W) / C);
      return { value: V.toFixed(2), unit: 'V' };
    },
    boardTrap: 'Neglecting the factor of 2, calculating √(W/C) instead of √(2W/C), which underestimates voltage by a factor of √2 ≈ 1.414.',
  },
];

export const EceFormulasBridgeTab: React.FC = () => {
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>('ece-parallel-z');
  const activeFormula =
    ECE_FORMULAS.find((f) => f.id === selectedFormulaId) || ECE_FORMULAS[0];

  const [activeIsoVar, setActiveIsoVar] = useState<string>(
    activeFormula.targetIsolations[0]?.variable || ''
  );

  const [liveInputs, setLiveInputs] = useState<{ [key: string]: number }>(
    activeFormula.sampleInputs
  );

  const handleSelectFormula = (f: EceFormulaItem) => {
    setSelectedFormulaId(f.id);
    setActiveIsoVar(f.targetIsolations[0]?.variable || '');
    setLiveInputs(f.sampleInputs);
  };

  const currentIsolation =
    activeFormula.targetIsolations.find((iso) => iso.variable === activeIsoVar) ||
    activeFormula.targetIsolations[0];

  const computedResult = activeFormula.computeResult(liveInputs);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                Engineering Bridge
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                PRC ECE Board Applications
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Literal Equations &amp; ECE Formula Isolation Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Real PRC board problems test your ability to algebraically rearrange literal formulas before plugging in engineering values.
            </p>
          </div>

          {/* Formula Selectors */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {ECE_FORMULAS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleSelectFormula(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFormulaId === f.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.name.split(' ')[0]} {f.name.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Formula Display */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-inner space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                {activeFormula.domain}
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">{activeFormula.name}</h3>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-amber-300">
              <MathFormula formula={activeFormula.rawFormulaLatex} inline />
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium">{activeFormula.description}</p>

          {/* Variable Isolation Switcher */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Select Parameter to Algebraically Isolate:
              </span>
              <div className="flex items-center gap-1.5">
                {activeFormula.targetIsolations.map((iso) => (
                  <button
                    key={iso.variable}
                    type="button"
                    onClick={() => setActiveIsoVar(iso.variable)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      activeIsoVar === iso.variable
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Solve for {iso.variable}
                  </button>
                ))}
              </div>
            </div>

            {/* Rearranged Formula Showcase */}
            {currentIsolation && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Isolated Literal Form:
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">Ready for Substitution</span>
                </div>
                <div className="font-mono text-xl sm:text-2xl font-black text-white text-center py-2">
                  <MathFormula formula={currentIsolation.latex} inline />
                </div>

                {/* Step-by-Step Isolation Derivation */}
                <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs text-slate-300">
                  <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                    Step-by-Step Algebraic Isolation:
                  </span>
                  {currentIsolation.derivationSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Numerical Calculator Sandbox */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">
              Plug-and-Chug Engineering Evaluation:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.keys(activeFormula.sampleInputs).map((key) => (
                <div key={key} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    {activeFormula.sampleInputLabels[key] || key}:
                  </label>
                  <input
                    type="number"
                    value={liveInputs[key] ?? activeFormula.sampleInputs[key]}
                    onChange={(e) =>
                      setLiveInputs((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Computed Output Box */}
            <div className="p-4 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-between gap-4">
              <div className="text-xs text-blue-200">
                Calculated Value for <strong className="text-white font-mono">{activeIsoVar}</strong>:
              </div>
              <div className="font-mono text-xl sm:text-2xl font-black text-emerald-400">
                {computedResult.value} {computedResult.unit}
              </div>
            </div>
          </div>
        </div>

        {/* Board Trap Alert */}
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-950 font-bold">PRC Board Examiner Trap:</strong>{' '}
            {activeFormula.boardTrap}
          </div>
        </div>
      </div>
    </div>
  );
};
