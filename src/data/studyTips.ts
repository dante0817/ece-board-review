export interface ECEStudyTip {
  id: string;
  title: string;
  category: 'Electronics' | 'Mathematics' | 'Communications' | 'GEAS' | 'Exam Strategy' | 'Recall Technique';
  principle: string;
  actionableAdvice: string;
  ruleOfThumbOrFormula?: string;
  subjectRelevance: string;
}

export const ECE_STUDY_TIPS: ECEStudyTip[] = [
  {
    id: 'ece-tip-1',
    title: 'Phasor & Complex Calculator Reflexes',
    category: 'Mathematics',
    principle: 'Master direct rectangular-to-polar conversions on your scientific calculator.',
    actionableAdvice: 'For AC Circuit analysis, mesh, and transmission line problems, avoid manual trigonometric conversions. Practice converting complex impedances and use the complex-number mode supported by your selected calculator; check the actual device manual for its menu navigation.',
    ruleOfThumbOrFormula: 'Z = R + jX ↔ |Z|∠θ. Remember: Capacitive reactance is -j/(ωC) and inductive is +jωL.',
    subjectRelevance: 'Mathematics & Electronics (AC Circuits, Phasors, Filter Networks)',
  },
  {
    id: 'ece-tip-2',
    title: 'BJT DC-Q Point vs. AC Small-Signal Separation',
    category: 'Electronics',
    principle: 'Never mix DC bias conditions with AC signal excitation.',
    actionableAdvice: 'Always split transistor amplifier analysis into two strict stages: first, deactivate all AC sources and calculate DC Q-point (IB, IC, VCE) to confirm the transistor is in Active Mode. Only then compute dynamic parameters (re = 26mV / IE) and transition to the small-signal model.',
    ruleOfThumbOrFormula: 're ≈ 26 mV / IE(DC) at room temperature (300 K). If VCE < 0.2V, the BJT is in saturation.',
    subjectRelevance: 'Electronics Engineering (Transistor Biasing & Small-Signal Amplifiers)',
  },
  {
    id: 'ece-tip-3',
    title: 'Decibel Fast-Mental Math in RF & Communications',
    category: 'Communications',
    principle: 'Calculate power budgets and gains mentally using the 3 dB and 10 dB rules.',
    actionableAdvice: 'In communications link budget questions, avoid pulling out your calculator for basic power steps: +3 dB is 2× power, -3 dB is 1/2 power, +10 dB is 10× power, and +20 dB is 100× power. Convert all transmitter power, antenna gains, and path loss into dBm/dBW before summing.',
    ruleOfThumbOrFormula: 'P(dBm) = 10 · log10(P(mW)). Example: 1 Watt = 1000 mW = 30 dBm.',
    subjectRelevance: 'Communications Engineering (Link Budget, Antennas, Wave Propagation)',
  },
  {
    id: 'ece-tip-4',
    title: 'Dimensional Analysis in GEAS Physics & Thermodynamics',
    category: 'GEAS',
    principle: 'Verify formulas and eliminate impossible choices by tracking physical units.',
    actionableAdvice: 'In engineering mechanics, fluid mechanics, and thermodynamics, check unit dimensions before computing. When given 4 multiple-choice options, write the base SI units of your target variable ($kg \\cdot m/s^2$ for Newtons, $J = N \\cdot m$ for work). You can often eliminate 2 choices right away without calculating.',
    ruleOfThumbOrFormula: '[Work / Energy] = [Force] · [Distance] = kg · m² · s⁻² = N · m = Joules.',
    subjectRelevance: 'GEAS (Engineering Mechanics, Thermodynamics, Physics)',
  },
  {
    id: 'ece-tip-5',
    title: 'Source Transformation Before Solving Mesh Systems',
    category: 'Electronics',
    principle: 'Collapse complex circuit topologies prior to matrix calculations.',
    actionableAdvice: 'Before setting up 3 simultaneous mesh loop equations with Cramer\'s Rule, inspect if any voltage source in series with a resistor can be converted to an equivalent current source in parallel (Thevenin to Norton), or vice versa. Most board exam circuit problems collapse into a single loop with 1 or 2 transformations.',
    ruleOfThumbOrFormula: 'Vth = IN · Rth and Rth = RN. Norton and Thevenin resistances are identical.',
    subjectRelevance: 'Electronics & Circuits (Network Theorems & DC Circuit Analysis)',
  },
  {
    id: 'ece-tip-6',
    title: 'The "Blank-Page" Error Remediation Protocol',
    category: 'Recall Technique',
    principle: 'Passive reading of solution keys causes the illusion of explanatory competence.',
    actionableAdvice: 'Whenever you log an error in your Error Log, do NOT just read the explanation and nod. Close the notebook, wait 24 hours, and solve the question from scratch on a blank paper without peeking. If you get stuck at step 2, that step is your exact knowledge gap.',
    ruleOfThumbOrFormula: 'Error Log Protocol: Root Cause Tagging → Solution Hiding → 24-hr Blank Sheet Re-solve.',
    subjectRelevance: 'All ECE Board Subjects (Mathematics, GEAS, Electronics, Communications)',
  },
  {
    id: 'ece-tip-7',
    title: 'Pole Locations & Time-Domain Stability by Inspection',
    category: 'Mathematics',
    principle: 'Read transient system behavior straight from s-plane root coordinates.',
    actionableAdvice: 'In Laplace transforms and control systems, do not calculate complete inverse partial fractions if the question only asks about stability or oscillation frequency. Poles in the Left-Half Plane decay; poles on the imaginary axis oscillate at frequency ω = Im(s); poles in the Right-Half Plane explode unstably.',
    ruleOfThumbOrFormula: 's = -σ ± jω → decay rate e^(-σt) modulated by cos(ωt). Distance from origin = natural frequency ωn.',
    subjectRelevance: 'Mathematics & Advanced Circuit Theory (Laplace Transforms & Control Systems)',
  },
  {
    id: 'ece-tip-8',
    title: 'The 3-Pass Strategy for 100-Item Board Exams',
    category: 'Exam Strategy',
    principle: 'Maximize score-per-minute efficiency and safeguard your stamina.',
    actionableAdvice: 'A standard board subject has 100 items for 4 hours (approx. 2.4 min/item). Pass 1: Instantly answer conceptual questions and 30-second formula recalls (target: 35-45 items in 45 min). Pass 2: Solve familiar computational problems (target: 35 items in 90 min). Pass 3: Attack tricky, lengthy circuit design problems with the remaining time.',
    ruleOfThumbOrFormula: 'Never spend > 5 minutes on an unknown question during Pass 1. Flag it and advance.',
    subjectRelevance: 'Board Exam Test-Taking Strategy (All Subjects)',
  },
  {
    id: 'ece-tip-9',
    title: 'Quarter-Wave Transformer & Smith Chart Clockwise Rule',
    category: 'Communications',
    principle: 'Impedance patterns repeat cyclically every half-wavelength (λ/2).',
    actionableAdvice: 'Remember the golden rule of transmission lines: moving toward the generator corresponds to rotating clockwise around the Smith Chart. At a quarter-wavelength (λ/4), input impedance inverts, which is the exact basis for impedance matching transformers.',
    ruleOfThumbOrFormula: 'Zin = Z0² / ZL (for a λ/4 section). To match Zload to Zline, choose Ztransformer = √(Zline · Zload).',
    subjectRelevance: 'Communications Engineering (Transmission Lines, Waveguides, RF Matching)',
  },
  {
    id: 'ece-tip-10',
    title: 'Op-Amp Golden Rules for Fast Node Formulation',
    category: 'Electronics',
    principle: 'Exploit virtual short and zero input current constraints immediately.',
    actionableAdvice: 'For negative feedback operational amplifier circuits, write KCL at the inverting terminal using only two assumptions: (1) Virtual short: V⁻ = V⁺; (2) Infinite input impedance: I⁻ = I⁺ = 0 A. This immediately eliminates interior transistor details and produces the closed-loop gain in two lines of algebra.',
    ruleOfThumbOrFormula: 'V⁻ = V⁺ (Virtual Short) and Iin = 0. Inverting gain = -Rf/Rin, Non-inverting gain = 1 + Rf/R1.',
    subjectRelevance: 'Electronics Engineering (Operational Amplifiers & Linear ICs)',
  },
  {
    id: 'ece-tip-11',
    title: 'Interleaved Practice Across Dissimilar Board Subjects',
    category: 'Recall Technique',
    principle: 'Block practicing one topic creates rapid forgetting; interleaving builds long-term retrieval.',
    actionableAdvice: 'Instead of drilling 50 Integral Calculus problems on Monday and 50 Semiconductor problems on Tuesday, interleave them: 15 Calculus, 15 Modulation theory, and 15 Strength of Materials. This forces your brain to categorize problem types before selecting a retrieval strategy, mimicking board exam conditions.',
    ruleOfThumbOrFormula: 'Switch topic categories every 45-60 minutes or after every 15-20 problems.',
    subjectRelevance: 'Study Methodology & Cognitive Retention (Cross-Subject Mastery)',
  },
  {
    id: 'ece-tip-12',
    title: 'Nyquist-Shannon & Carson\'s Bandwidth Quick Rules',
    category: 'Communications',
    principle: 'Separate baseband sampling rates from modulated passband bandwidths.',
    actionableAdvice: 'Keep the fundamental communications formulas crystallized: for digital baseband PCM, the minimum sampling rate is fs ≥ 2 · fm. For analog angle modulation (FM/PM), use Carson\'s Rule to quickly estimate 98% power transmission bandwidth without Bessel function expansions.',
    ruleOfThumbOrFormula: 'Carson\'s Bandwidth: BW = 2 · (Δf + fm) = 2 · fm · (β + 1), where β = Δf / fm.',
    subjectRelevance: 'Communications Engineering (Sampling Theory, Analog & Digital Modulation)',
  }
];

/**
 * Returns today's ECE study tip based deterministically on the calendar date.
 */
export function getDailyStudyTip(dateStr?: string): ECEStudyTip {
  const targetDate = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  // Compute day of year
  const startOfYear = new Date(targetDate.getFullYear(), 0, 0);
  const diff = targetDate.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = Math.abs(dayOfYear) % ECE_STUDY_TIPS.length;
  return ECE_STUDY_TIPS[index];
}
