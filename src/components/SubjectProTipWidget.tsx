import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, BookmarkCheck } from 'lucide-react';

export interface SubjectProTip {
  id: string;
  category: 'geas' | 'electronics' | 'est' | 'mathematics';
  badge: 'Memory Mnemonic' | 'Formula Anchor' | 'Exam Trap Alert' | 'Calculator Trick' | 'Mental Model';
  title: string;
  ruleOrMnemonic: string;
  formula?: string;
  explanation: string;
  boardRelevance: 'Guaranteed' | 'Very High' | 'High';
}

const SUBJECT_PRO_TIPS: SubjectProTip[] = [
  // ==========================================================================
  // GEAS (General Engineering & Applied Sciences - 20%)
  // ==========================================================================
  {
    id: 'geas-flea',
    category: 'geas',
    badge: 'Formula Anchor',
    title: 'Axial Deformation of Elastic Bars',
    ruleOrMnemonic: 'FLEA Formula: "Fleas stretch materials!"',
    formula: 'δ = (P · L) / (A · E)',
    explanation:
      'Where P = Axial Force (N), L = Length (m), A = Cross-Sectional Area (m²), and E = Modulus of Elasticity (Pa). In board questions with composite materials, sum the δ of each section!',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'geas-my-over-i',
    category: 'geas',
    badge: 'Formula Anchor',
    title: 'Flexural Bending Stress in Beams',
    ruleOrMnemonic: 'MY/I: "My stress is over I"',
    formula: 'σ_max = (M · c) / I = M / S',
    explanation:
      'M = Bending Moment, c = distance from neutral axis to outermost fiber, I = moment of inertia, S = section modulus (I/c). Maximum tensile and compressive stresses always occur at extreme fibers.',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'geas-oil-rig',
    category: 'geas',
    badge: 'Memory Mnemonic',
    title: 'Redox Reactions in Engineering Chemistry',
    ruleOrMnemonic: 'OIL RIG & LEO the Lion says GER',
    formula: 'Oxidation = Loss of e⁻ | Reduction = Gain of e⁻',
    explanation:
      'Oxidation Is Loss, Reduction Is Gain. Anode = site of Oxidation (AnOx); Cathode = site of Reduction (RedCat). Electrons always flow from Anode to Cathode in external circuits.',
    boardRelevance: 'Very High',
  },
  {
    id: 'geas-thermo-processes',
    category: 'geas',
    badge: 'Exam Trap Alert',
    title: 'The 4 Ideal Gas Thermodynamic Processes',
    ruleOrMnemonic: 'Check what is zero before solving work W:',
    formula: 'Isochoric (ΔV=0) ⇒ W=0 | Adiabatic (Q=0) ⇒ W = -ΔU',
    explanation:
      'Isobaric: W = P(V₂ - V₁). Isothermal (T=C): ΔU = 0, Q = W = P₁V₁ ln(V₂/V₁). Polytropic: PVⁿ = C. For adiabatic, P₁V₁ᵞ = P₂V₂ᵞ where γ = C_p / C_v (1.4 for air).',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'geas-sink-vs-cap',
    category: 'geas',
    badge: 'Mental Model',
    title: 'Sinking Fund vs Capital Recovery (Eng\'g Econ)',
    ruleOrMnemonic: 'Are you saving for the future (F) or paying back today (P)?',
    formula: 'A = F · [i / ((1+i)ⁿ - 1)] vs A = P · [i(1+i)ⁿ / ((1+i)ⁿ - 1)]',
    explanation:
      'Sinking Fund deposits A periodically to accumulate a future sum F. Capital Recovery pays uniform annuity A to amortize an immediate loan P with interest i.',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'geas-ra-9292',
    category: 'geas',
    badge: 'Memory Mnemonic',
    title: 'RA 9292 BEE Board Composition & Quorum',
    ruleOrMnemonic: 'Rule of 1 + 2 = 3 BEE Members',
    formula: '1 Chairman + 2 Members (Term: 3 years)',
    explanation:
      'Appointed by the Philippine President from 3 recommendees per position chosen by the PRC from 5 nominees submitted by IECEP (APO). Must be PECE with at least 10 years of practice.',
    boardRelevance: 'Very High',
  },
  {
    id: 'geas-stat-moment-pivot',
    category: 'geas',
    badge: 'Calculator Trick',
    title: 'Force Equilibrium Pivot Selection',
    ruleOrMnemonic: 'Always take ΣM = 0 at the hinge with the most unknowns',
    formula: 'ΣM_pivot = 0 (eliminates intersecting unknown reactions)',
    explanation:
      'Pivot on the pin with both H and V reactions. This instantly reduces a 3-variable system to a 1-variable single equation, solving your board problem in under 45 seconds!',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'geas-torsion-tr-j',
    category: 'geas',
    badge: 'Formula Anchor',
    title: 'Torsional Shearing Stress in Circular Shafts',
    ruleOrMnemonic: 'TR over J: "Torsion Rolls on J"',
    formula: 'τ_max = (T · r) / J, where J = (π · d⁴) / 32',
    explanation:
      'For solid shafts, τ_max = 16T / (π d³). Angle of twist θ = (T · L) / (J · G) in radians. Notice G is the Shear Modulus, not Young\'s Modulus E!',
    boardRelevance: 'High',
  },

  // ==========================================================================
  // ELECTRONICS ENGINEERING (ELEX - 30%)
  // ==========================================================================
  {
    id: 'elex-bjt-bias-modes',
    category: 'electronics',
    badge: 'Mental Model',
    title: 'BJT Active vs Saturation vs Cutoff Biasing',
    ruleOrMnemonic: 'BE junction determines ON/OFF; BC junction determines Mode',
    formula: 'Active: BE Forward (0.7V) + BC Reverse | Saturation: BE & BC Both Forward',
    explanation:
      'In Saturation, V_CE(sat) ≈ 0.2V and I_C < β·I_B (forced β is smaller). In Cutoff, both junctions are reverse biased, I_C ≈ 0, and V_CE = V_CC.',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'elex-opamp-golden-rules',
    category: 'electronics',
    badge: 'Memory Mnemonic',
    title: 'The 2 Golden Rules of Ideal Op-Amps',
    ruleOrMnemonic: '1. No input current | 2. Virtual Short in negative feedback',
    formula: 'I₊ = I₋ = 0  and  V₊ = V₋',
    explanation:
      'Because input impedance Z_in = ∞, no current enters the inputs. Because open-loop gain A_OL = ∞, negative feedback drives the differential input voltage (V₊ - V₋) to zero.',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'elex-diode-knees',
    category: 'electronics',
    badge: 'Formula Anchor',
    title: 'Semiconductor Knee Voltages & Thermal Voltage',
    ruleOrMnemonic: 'Si = 0.7V | Ge = 0.3V | GaAs = 1.2V | V_T ≈ 26 mV at 300K',
    formula: 'I_D = I_S · (e^(V_D / ηV_T) - 1)',
    explanation:
      'Thermal voltage V_T = kT/q = 25.86 mV ≈ 26 mV at room temperature (27°C or 300K). Forward dynamic resistance r_d = 26mV / I_DQ. Double I_S every 10°C rise!',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'elex-demorgan',
    category: 'electronics',
    badge: 'Memory Mnemonic',
    title: 'De Morgan\'s Digital Logic Theorems',
    ruleOrMnemonic: '"Break the line, change the sign!"',
    formula: 'NOT(A · B) = NOT(A) + NOT(B)  |  NOT(A + B) = NOT(A) · NOT(B)',
    explanation:
      'NAND gate is equivalent to a Negative-OR gate. NOR gate is equivalent to a Negative-AND gate. Essential for converting multi-level logic into universal NAND-only or NOR-only circuits.',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'elex-barkhausen',
    category: 'electronics',
    badge: 'Exam Trap Alert',
    title: 'Barkhausen Criterion for Sinusoidal Oscillators',
    ruleOrMnemonic: 'Loop Gain = 1, Loop Phase = 0° (or integer multiples of 360°)',
    formula: '|A · β| ≥ 1  and  ∠(A · β) = 0° or 360°',
    explanation:
      'In Wien Bridge oscillators, non-inverting gain must be exactly A_v = 3 to cancel feedback attenuation β = 1/3 at f_0 = 1 / (2πRC).',
    boardRelevance: 'Very High',
  },
  {
    id: 'elex-shockley-fet',
    category: 'electronics',
    badge: 'Formula Anchor',
    title: 'JFET & D-MOSFET Shockley Equation',
    ruleOrMnemonic: 'Drain current is parabolic with gate-to-source voltage:',
    formula: 'I_D = I_DSS · (1 - V_GS / V_P)²',
    explanation:
      'When V_GS = 0, I_D = I_DSS (maximum current). When V_GS = V_P (pinch-off voltage), I_D = 0. Transconductance g_m = g_m0 · (1 - V_GS / V_P) where g_m0 = 2·I_DSS / |V_P|.',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'elex-bjt-current-boss',
    category: 'electronics',
    badge: 'Memory Mnemonic',
    title: 'BJT Current Relations (Emitter is the Boss)',
    ruleOrMnemonic: 'I_E = I_B + I_C  |  I_C = β · I_B  |  I_E = (β + 1) · I_B',
    formula: 'α = β / (β + 1)  and  β = α / (1 - α)',
    explanation:
      'Since β is typically 100 to 300, α is close to 0.99. Always check if given α or β; using the wrong one is the #1 distraction trap in ELEX board questions!',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'elex-filter-roll-off',
    category: 'electronics',
    badge: 'Mental Model',
    title: 'Filter Pole Rolloff Rates',
    ruleOrMnemonic: 'Each independent pole adds -20 dB/decade (-6 dB/octave)',
    formula: 'N poles = -20·N dB/decade (Phase lag = -N × 90° at high frequencies)',
    explanation:
      'A 1st order filter rolls off at -20 dB/dec (-6 dB/oct). A 2nd order (e.g. Sallen-Key) rolls off at -40 dB/dec (-12 dB/oct). Half-power point f_c is always at -3 dB.',
    boardRelevance: 'High',
  },

  // ==========================================================================
  // EST / COMMUNICATIONS (30%)
  // ==========================================================================
  {
    id: 'est-db-mental-math',
    category: 'est',
    badge: 'Calculator Trick',
    title: 'Mental Decibel Math in 3 Seconds',
    ruleOrMnemonic: '+3 dB = ×2 power | +10 dB = ×10 power | +6 dB = ×2 voltage',
    formula: '0 dBm = 1 mW  |  30 dBm = 1 Watt  |  60 dBm = 1 Kilowatt',
    explanation:
      'Example: 20W into dBm? 20W = 2 × 10W = 30 dBm + 10 dB + 3 dB = 43 dBm! Never waste time punching log10 on your Casio for standard numbers.',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'est-carsons-rule',
    category: 'est',
    badge: 'Formula Anchor',
    title: 'Carson\'s Rule for FM Signal Bandwidth',
    ruleOrMnemonic: 'Bandwidth = 2 × (Peak Deviation + Modulating Frequency)',
    formula: 'BW_FM = 2 · (Δf + f_m) = 2 · f_m · (1 + β)',
    explanation:
      'Where β = Δf / f_m is the modulation index. Carson\'s rule captures approximately 98% of total transmitted FM spectral power.',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'est-shannon-capacity',
    category: 'est',
    badge: 'Formula Anchor',
    title: 'Shannon-Hartley Channel Capacity Limit',
    ruleOrMnemonic: 'Ultimate theoretical bit rate in a noisy AWGN channel:',
    formula: 'C = B · log₂(1 + S/N) bps',
    explanation:
      'CRITICAL BOARD TRAP: S/N must be in ABSOLUTE LINEAR ratio, not in decibels! If SNR = 30 dB, S/N = 10^(30/10) = 1000. C = B · log₂(1001) ≈ 9.97 · B.',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'est-quarter-wave-tx',
    category: 'est',
    badge: 'Formula Anchor',
    title: 'Quarter-Wave Transformer Impedance Matching',
    ruleOrMnemonic: 'Geometric mean of input and load impedances:',
    formula: 'Z_0\' = √(Z_in · Z_L)',
    explanation:
      'At λ/4 length, an open circuit looks like a short circuit, and a short circuit looks like an open circuit. At λ/2 length, impedance repeats identically (Z_in = Z_L).',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'est-thermal-noise',
    category: 'est',
    badge: 'Formula Anchor',
    title: 'Johnson-Nyquist Thermal Noise Power & Voltage',
    ruleOrMnemonic: 'N = k · T · B  |  -174 dBm/Hz at room temperature (290K)',
    formula: 'V_n = √(4 · k · T · B · R)',
    explanation:
      'k = Boltzmann\'s constant (1.38 × 10⁻²³ J/K), T = absolute temp in Kelvin (Room = 290K or 17°C standard), B = noise bandwidth in Hz. In dBm: N(dBm) = -174 + 10·log₁₀(B).',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'est-am-power-split',
    category: 'est',
    badge: 'Exam Trap Alert',
    title: 'AM DSB-FC Power Distribution Trap',
    ruleOrMnemonic: 'At 100% modulation (m=1), Carrier = 66.7%, Both Sidebands = 33.3%',
    formula: 'P_total = P_carrier · (1 + m² / 2)',
    explanation:
      'Each individual sideband carries P_c · (m² / 4), or only 16.7% of total power. This explains why Single Sideband (SSB) saves more than 83% of power compared to DSB-FC!',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'est-swr-reflection',
    category: 'est',
    badge: 'Formula Anchor',
    title: 'Standing Wave Ratio (SWR) & Reflection Coefficient',
    ruleOrMnemonic: 'Γ = (Z_L - Z_0) / (Z_L + Z_0)  |  SWR = (1 + |Γ|) / (1 - |Γ|)',
    formula: 'Return Loss (dB) = -20 · log₁₀(|Γ|)',
    explanation:
      'Perfect match: Z_L = Z_0 ⇒ Γ = 0, SWR = 1.0 (ideal). Pure reactive or open/short: |Γ| = 1.0, SWR = ∞. Always take the magnitude |Γ| when calculating SWR!',
    boardRelevance: 'Guaranteed',
  },
  {
    id: 'est-osi-mnemonic',
    category: 'est',
    badge: 'Memory Mnemonic',
    title: 'OSI 7-Layer Hierarchy (Top to Bottom / Bottom to Top)',
    ruleOrMnemonic: 'Top-down: "All People Seem To Need Data Processing"',
    formula: '7: Application → 6: Pres → 5: Session → 4: Transport → 3: Network → 2: Data Link → 1: Physical',
    explanation:
      'Bottom-up: "Please Do Not Throw Sausage Pizza Away". Routers operate at Layer 3 (Packets). Switches operate at Layer 2 (Frames). Hubs operate at Layer 1 (Bits).',
    boardRelevance: 'Guaranteed',
  },
];

interface SubjectProTipWidgetProps {
  category: 'geas' | 'electronics' | 'est';
  className?: string;
}

export const SubjectProTipWidget: React.FC<SubjectProTipWidgetProps> = ({
  category,
  className = '',
}) => {
  // Filter tips strictly for this subject category
  const categoryTips = useMemo(() => {
    return SUBJECT_PRO_TIPS.filter((t) => t.category === category);
  }, [category]);

  // Randomize initial tip on mount or category change
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedTips, setSavedTips] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ece_board_starred_protips');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (categoryTips.length > 0) {
      const randomIdx = Math.floor(Math.random() * categoryTips.length);
      setCurrentIndex(randomIdx);
    }
  }, [category, categoryTips.length]);

  const currentTip = categoryTips[currentIndex] || categoryTips[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % categoryTips.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + categoryTips.length) % categoryTips.length);
  };

  const handleShuffle = () => {
    if (categoryTips.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * categoryTips.length);
    if (nextIdx === currentIndex) {
      nextIdx = (currentIndex + 1) % categoryTips.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleCopy = async () => {
    if (!currentTip) return;
    const textToCopy = `[PRC ECE Board Pro-Tip: ${currentTip.title}]\n${currentTip.ruleOrMnemonic}\n${
      currentTip.formula ? `Formula: ${currentTip.formula}\n` : ''
    }${currentTip.explanation}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy tip', e);
    }
  };

  const isCurrentStarred = currentTip ? savedTips.includes(currentTip.id) : false;

  const handleToggleStar = () => {
    if (!currentTip) return;
    const next = isCurrentStarred
      ? savedTips.filter((id) => id !== currentTip.id)
      : [...savedTips, currentTip.id];
    setSavedTips(next);
    try {
      localStorage.setItem('ece_board_starred_protips', JSON.stringify(next));
    } catch {
      // localStorage error fallback
    }
  };

  if (!currentTip) return null;

  // Theme styling based on category
  const themeStyles = {
    geas: {
      border: 'border-emerald-200/80 dark:border-emerald-800/60',
      bg: 'bg-gradient-to-r from-emerald-50/90 via-[#f7fbf9] to-white dark:from-emerald-950/30 dark:via-stone-900 dark:to-stone-900',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border-emerald-300/80',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      accentText: 'text-emerald-700 dark:text-emerald-300',
      formulaBg: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200',
    },
    electronics: {
      border: 'border-amber-200/80 dark:border-amber-800/60',
      bg: 'bg-gradient-to-r from-amber-50/90 via-[#fffdf9] to-white dark:from-amber-950/30 dark:via-stone-900 dark:to-stone-900',
      badgeBg: 'bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 border-amber-300/80',
      iconColor: 'text-amber-600 dark:text-amber-400',
      accentText: 'text-amber-800 dark:text-amber-300',
      formulaBg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200',
    },
    est: {
      border: 'border-purple-200/80 dark:border-purple-800/60',
      bg: 'bg-gradient-to-r from-purple-50/90 via-[#faf8fe] to-white dark:from-purple-950/30 dark:via-stone-900 dark:to-stone-900',
      badgeBg: 'bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 border-purple-300/80',
      iconColor: 'text-purple-600 dark:text-purple-400',
      accentText: 'text-purple-800 dark:text-purple-300',
      formulaBg: 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/80 text-purple-950 dark:text-purple-200',
    },
  }[category];

  return (
    <div
      id={`pro-tip-widget-${category}`}
      className={`rounded-2xl border shadow-xs p-4 sm:p-4.5 transition-all relative overflow-hidden ${themeStyles.border} ${themeStyles.bg} ${className}`}
    >
      {/* Background ambient decoration */}
      <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-stone-200/20 dark:bg-stone-700/10 pointer-events-none blur-2xl" />

      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-stone-200/60 dark:border-stone-800">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider text-stone-900 dark:text-stone-100">
            <span className={`p-1 rounded-md bg-white dark:bg-stone-800 shadow-2xs ${themeStyles.iconColor}`}>
              <AppArtwork name="bulb" inline className="w-3.5 h-3.5" />
            </span>
            <span>Board Review Pro-Tip</span>
          </div>

          {/* Badge */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${themeStyles.badgeBg}`}
          >
            {currentTip.badge}
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-stone-500 dark:text-stone-400">
            <AppArtwork name="lightning" inline className="w-3 h-3 text-amber-500" />
            <span>PRC: {currentTip.boardRelevance} Yield</span>
          </span>
        </div>

        {/* Action Controls: Shuffle, Prev/Next, Copy, Bookmark */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 mr-1">
            {currentIndex + 1}/{categoryTips.length}
          </span>

          <button
            type="button"
            onClick={handleShuffle}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-colors cursor-pointer"
            title="Shuffle another random high-yield technique"
            aria-label="Randomize pro tip"
          >
            <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-colors cursor-pointer"
            title="Previous tip"
            aria-label="Previous tip"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-colors cursor-pointer"
            title="Next tip"
            aria-label="Next tip"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-colors cursor-pointer"
            title={copied ? 'Copied to clipboard!' : 'Copy tip to clipboard'}
            aria-label="Copy tip"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleStar}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-500 dark:hover:text-amber-400 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-colors cursor-pointer"
            title={isCurrentStarred ? 'Bookmarked' : 'Bookmark this tip'}
            aria-label="Bookmark tip"
          >
            {isCurrentStarred ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            ) : (
              <AppArtwork name="book" inline className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Tip Body */}
      <div className="pt-3 space-y-2">
        <div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <span>{currentTip.title}</span>
          </h4>
          <p className={`text-xs font-semibold mt-0.5 ${themeStyles.accentText}`}>
            {currentTip.ruleOrMnemonic}
          </p>
        </div>

        {/* Formula display if present */}
        {currentTip.formula && (
          <div
            className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold border flex items-center justify-between ${themeStyles.formulaBg}`}
          >
            <span className="truncate">{currentTip.formula}</span>
            <span className="text-[10px] font-sans font-medium text-stone-500 dark:text-stone-400 ml-2 shrink-0">
              Exam Formula
            </span>
          </div>
        )}

        {/* Explanation */}
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
          {currentTip.explanation}
        </p>
      </div>
    </div>
  );
};
