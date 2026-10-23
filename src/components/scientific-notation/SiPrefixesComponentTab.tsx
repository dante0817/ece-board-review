import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';


interface PrefixItem {
  prefix: string;
  symbol: string;
  power: number;
  multiplier: string;
  eceApplication: string;
}

const SI_PREFIXES: PrefixItem[] = [
  { prefix: 'Tera', symbol: 'T', power: 12, multiplier: '10¹²', eceApplication: 'Terabit data transmission, terahertz band' },
  { prefix: 'Giga', symbol: 'G', power: 9, multiplier: '10⁹', eceApplication: 'Gigahertz CPU clock, microwave satellite links' },
  { prefix: 'Mega', symbol: 'M', power: 6, multiplier: '10⁶', eceApplication: 'Megahertz radio broadcast, megaohm insulation' },
  { prefix: 'kilo', symbol: 'k', power: 3, multiplier: '10³', eceApplication: 'Kilohertz audio, kilovolt high-tension lines' },
  { prefix: 'base', symbol: '—', power: 0, multiplier: '10⁰ = 1', eceApplication: 'Volts, Amperes, Ohms, Watts, Farads, Henrys' },
  { prefix: 'milli', symbol: 'm', power: -3, multiplier: '10⁻³', eceApplication: 'Milliampere bias current, millivolt thermocouple' },
  { prefix: 'micro', symbol: 'μ', power: -6, multiplier: '10⁻⁶', eceApplication: 'Microfarad electrolytic capacitor, microsecond rise time' },
  { prefix: 'nano', symbol: 'n', power: -9, multiplier: '10⁻⁹', eceApplication: 'Nanosecond propagation delay, nanofarad ceramic cap' },
  { prefix: 'pico', symbol: 'p', power: -12, multiplier: '10⁻¹²', eceApplication: 'Picofarad RF capacitor, stray PCB capacitance' },
  { prefix: 'femto', symbol: 'f', power: -15, multiplier: '10⁻¹⁵', eceApplication: 'Femtoampere ultra-low input bias current in op-amps' },
];

export const SiPrefixesComponentTab: React.FC = () => {
  // Capacitor 3-digit code decoder state
  const [capCode, setCapCode] = useState<string>('104');

  // Prefix converter test state
  const [convVal, setConvVal] = useState<number>(47);
  const [fromPrefixExp, setFromPrefixExp] = useState<number>(3); // kilo
  const [toPrefixExp, setToPrefixExp] = useState<number>(6); // mega

  // Decode 3-digit capacitor code
  const decodedCap = React.useMemo(() => {
    if (!capCode || capCode.length < 2) {
      return { pf: 0, nf: 0, uf: 0, valid: false };
    }
    const d1 = parseInt(capCode.charAt(0), 10);
    const d2 = parseInt(capCode.charAt(1), 10);
    const d3 = capCode.length >= 3 ? parseInt(capCode.charAt(2), 10) : 0;

    if (isNaN(d1) || isNaN(d2) || isNaN(d3)) {
      return { pf: 0, nf: 0, uf: 0, valid: false };
    }

    const basePf = (d1 * 10 + d2) * Math.pow(10, d3);
    const nf = basePf / 1000;
    const uf = basePf / 1000000;

    return {
      pf: basePf,
      nf,
      uf,
      valid: true,
      d1,
      d2,
      d3,
    };
  }, [capCode]);

  // Prefix conversion result: value * 10^(from - to)
  const convertedResult = convVal * Math.pow(10, fromPrefixExp - toPrefixExp);

  return (
    <div className="space-y-8 text-slate-800">
      {/* Overview Banner */}
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50/40 to-slate-50 border border-purple-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
              Standard Engineering Metric System
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              SI Prefixes & Component EIA Decoders
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Every electronics component is coded in powers of ten. Master the <strong>SI prefix scale</strong> and
              the industry-standard <strong>3-digit capacitor code</strong> to decode values effortlessly.
            </p>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-xs font-bold text-purple-800 shadow-2xs shrink-0">
            Capacitor Base Unit = Picofarad (10⁻¹² F)
          </div>
        </div>
      </div>

      {/* Capacitor 3-Digit Code Decoder (Ceramic / Film / Mylar) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
              ECE Board Exam Classic
            </span>
            <h3 className="text-base font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <AppArtwork name="chip" inline className="w-4 h-4 text-amber-600" />
              <span>3-Digit Capacitor EIA Code Decoder</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the 3-digit code stamped on a disc capacitor to decode its value across pF, nF, and μF.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 font-semibold mr-1">Common Codes:</span>
            {['104', '472', '103', '223', '102', '334'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCapCode(c)}
                className={`px-2 py-1 font-mono text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                  capCode === c
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-black'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Decoder Input & Disc Graphic */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Disc Graphic */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-4 border-amber-700 flex flex-col items-center justify-center text-slate-950 shadow-md">
              <span className="text-lg font-mono font-black tracking-widest">{capCode || '---'}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-950">50V 10%</span>
            </div>
            {/* Leads */}
            <div className="flex gap-6 mt-1">
              <div className="w-1 h-8 bg-slate-400 rounded-b" />
              <div className="w-1 h-8 bg-slate-400 rounded-b" />
            </div>
          </div>

          {/* Value Readouts Across Scales */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Code Stamped on Body:</label>
              <input
                type="text"
                maxLength={3}
                value={capCode}
                onChange={(e) => setCapCode(e.target.value.replace(/\D/g, ''))}
                className="w-24 px-3 py-1.5 text-center font-mono font-black text-lg border-2 border-amber-400 rounded-xl bg-amber-50/50"
              />
              <span className="text-xs text-slate-400">
                Formula: <MathFormula inline formula={`\\text{Value} = AB \\times 10^C\\text{ pF}`} />
              </span>
            </div>

            {/* 3 Metric Units Output */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-mono">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Picofarads (pF)</span>
                <span className="text-lg font-black text-slate-800 mt-1 block">
                  {decodedCap.pf.toLocaleString()} pF
                </span>
                <span className="text-[11px] text-slate-500 block">{decodedCap.pf} × 10⁻¹² F</span>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Nanofarads (nF)</span>
                <span className="text-lg font-black text-purple-900 mt-1 block">
                  {decodedCap.nf} nF
                </span>
                <span className="text-[11px] text-purple-700 block">{decodedCap.nf} × 10⁻⁹ F</span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Microfarads (μF)</span>
                <span className="text-lg font-black text-amber-950 mt-1 block">
                  {decodedCap.uf} μF
                </span>
                <span className="text-[11px] text-amber-800 block">{decodedCap.uf} × 10⁻⁶ F</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SI Prefixes Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-extrabold text-slate-900">
            SI Metric Engineering Prefixes Reference Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            The standard engineering multipliers with symbol representations and typical ECE domain uses.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 sm:px-6">Prefix</th>
                <th className="p-3">Symbol</th>
                <th className="p-3">Power of 10</th>
                <th className="p-3">Decimal Multiplier</th>
                <th className="p-3 sm:px-6">Electronics Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {SI_PREFIXES.map((item) => (
                <tr key={item.prefix} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 sm:px-6 font-sans font-bold text-slate-900">{item.prefix}</td>
                  <td className="p-3 font-bold text-blue-600">{item.symbol}</td>
                  <td className="p-3 font-bold text-indigo-700">10^{item.power}</td>
                  <td className="p-3 text-slate-600">{item.multiplier}</td>
                  <td className="p-3 sm:px-6 font-sans text-slate-600">{item.eceApplication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
