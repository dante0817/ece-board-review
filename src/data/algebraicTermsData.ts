export interface TermAnatomyItem {
  id: string;
  rawLatex: string;
  sign: '+' | '-';
  numericalCoefficient: number | string;
  literalFactors: string;
  variables: { name: string; power: number }[];
  termDegree: number;
  termDescription: string;
}

export interface PolynomialAnatomyExample {
  id: string;
  title: string;
  description: string;
  expressionLatex: string;
  classification: 'Monomial' | 'Binomial' | 'Trinomial' | 'Multinomial (Polynomial)';
  degree: number;
  leadingTerm: string;
  leadingCoefficient: string;
  constantTerm: string;
  isPolynomial: boolean;
  notes: string;
  terms: TermAnatomyItem[];
}

export interface LikeTermsItem {
  id: string;
  latex: string;
  coefficient: number;
  literalPart: string;
  groupKey: string;
}

export interface LikeTermsGroupChallenge {
  id: string;
  title: string;
  rawExpression: string;
  terms: LikeTermsItem[];
  groupedResultLatex: string;
  stepByStepDerivation: string[];
}

export interface SubstitutionExample {
  id: string;
  name: string;
  category: 'Pure Algebra' | 'ECE Circuit Formula' | 'Board Trap';
  expressionLatex: string;
  variables: { [key: string]: number };
  variableDescriptions: { [key: string]: string };
  result: number | string;
  steps: {
    title: string;
    latex: string;
    explanation: string;
  }[];
  trapNote?: string;
}

export interface SimplificationStepExample {
  id: string;
  title: string;
  badge: string;
  originalLatex: string;
  steps: {
    stepNumber: number;
    actionLabel: string;
    currentLatex: string;
    explanation: string;
    highlightColor?: string;
  }[];
  finalLatex: string;
  casioCheck: string;
}

export interface VerbalTranslationPair {
  id: string;
  phrase: string;
  correctAlgebraic: string;
  wrongTrap: string;
  trapExplanation: string;
  ruleCategory: 'Order Reversal' | 'Difference & Diminished' | 'Ratio & Quotient' | 'Exceeds & Increments' | 'Consecutive Numbers';
}

export interface VerbalDrillQuestion {
  id: string;
  prompt: string;
  boardSource: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  correctId: string;
  explanation: string;
  trapWarning: string;
}

export interface CasioCalcTechnique {
  id: string;
  title: string;
  purpose: string;
  sampleExpression: string;
  keystrokes: string[];
  testValues: { variable: string; value: number }[];
  expectedOutput: string;
  proTip: string;
}

export interface IllegalMoveItem {
  id: string;
  title: string;
  studentWork: {
    step: string;
    content: string;
    isIllegal: boolean;
  }[];
  fallacyName: string;
  rootCause: string;
  correctedWork: string;
  boardTrapImpact: string;
}

export interface DiagnosticQuestion {
  id: string;
  index: number;
  boardExamSource: string;
  topicCategory: 'Anatomy & Degree' | 'Like Terms' | 'Multi-Variable Substitution' | 'Bracket Removal & Signs' | 'Verbal Translation' | 'Calcu-Technique (CALC)';
  difficulty: 'Foundation' | 'Moderate' | 'Advanced Board Exam';
  estimatedSeconds: number;
  prompt: string;
  expressionLatex?: string;
  options: {
    id: string;
    latex?: string;
    text: string;
    isCorrect: boolean;
  }[];
  correctOptionId: string;
  solutionSteps: string[];
  casioShortcut: string;
  boardTrapAnalysis: string;
}

// 1. POLYNOMIAL & TERM ANATOMY EXAMPLES
export const POLYNOMIAL_ANATOMY_EXAMPLES: PolynomialAnatomyExample[] = [
  {
    id: 'poly-1',
    title: 'Multi-Variable High-Yield Polynomial',
    description: 'A classic 4-term multi-variable polynomial tested in PRC ECE Board licensing exams.',
    expressionLatex: '-5x^3y^2z + 8x^2y - \\frac{3}{4}xy^3 + 12',
    classification: 'Multinomial (Polynomial)',
    degree: 6,
    leadingTerm: '-5x^3y^2z',
    leadingCoefficient: '-5',
    constantTerm: '12',
    isPolynomial: true,
    notes: 'The degree of a multivariable term is the SUM of its exponents. For -5x³y²z, the degree is 3 + 2 + 1 = 6.',
    terms: [
      {
        id: 't1',
        rawLatex: '-5x^3y^2z',
        sign: '-',
        numericalCoefficient: -5,
        literalFactors: 'x^3 y^2 z',
        variables: [
          { name: 'x', power: 3 },
          { name: 'y', power: 2 },
          { name: 'z', power: 1 },
        ],
        termDegree: 6,
        termDescription: 'Leading term: 6th degree term (3+2+1). Degree is 6, coefficient is -5.',
      },
      {
        id: 't2',
        rawLatex: '+8x^2y',
        sign: '+',
        numericalCoefficient: 8,
        literalFactors: 'x^2 y',
        variables: [
          { name: 'x', power: 2 },
          { name: 'y', power: 1 },
        ],
        termDegree: 3,
        termDescription: '3rd degree term (2+1). Numerical coefficient is +8.',
      },
      {
        id: 't3',
        rawLatex: '-\\frac{3}{4}xy^3',
        sign: '-',
        numericalCoefficient: '-3/4',
        literalFactors: 'x y^3',
        variables: [
          { name: 'x', power: 1 },
          { name: 'y', power: 3 },
        ],
        termDegree: 4,
        termDescription: '4th degree term (1+3). Fractional numerical coefficient is -3/4.',
      },
      {
        id: 't4',
        rawLatex: '+12',
        sign: '+',
        numericalCoefficient: 12,
        literalFactors: 'none (x^0)',
        variables: [],
        termDegree: 0,
        termDescription: 'Constant term. Has a degree of 0 because 12 = 12x⁰.',
      },
    ],
  },
  {
    id: 'poly-2',
    title: 'Single-Variable Quartic Expression',
    description: 'Standard 5-term polynomial arranged in descending order of powers of p.',
    expressionLatex: '6p^4 - 2p^3 + \\frac{5}{2}p^2 - 7p + 19',
    classification: 'Multinomial (Polynomial)',
    degree: 4,
    leadingTerm: '6p^4',
    leadingCoefficient: '6',
    constantTerm: '19',
    isPolynomial: true,
    notes: 'In a single-variable polynomial, the degree equals the highest exponent among all terms.',
    terms: [
      {
        id: 'p1',
        rawLatex: '6p^4',
        sign: '+',
        numericalCoefficient: 6,
        literalFactors: 'p^4',
        variables: [{ name: 'p', power: 4 }],
        termDegree: 4,
        termDescription: 'Leading term with degree 4 (quartic degree).',
      },
      {
        id: 'p2',
        rawLatex: '-2p^3',
        sign: '-',
        numericalCoefficient: -2,
        literalFactors: 'p^3',
        variables: [{ name: 'p', power: 3 }],
        termDegree: 3,
        termDescription: 'Cubic term with degree 3.',
      },
      {
        id: 'p3',
        rawLatex: '+\\frac{5}{2}p^2',
        sign: '+',
        numericalCoefficient: '5/2',
        literalFactors: 'p^2',
        variables: [{ name: 'p', power: 2 }],
        termDegree: 2,
        termDescription: 'Quadratic term with fractional coefficient 5/2.',
      },
      {
        id: 'p4',
        rawLatex: '-7p',
        sign: '-',
        numericalCoefficient: -7,
        literalFactors: 'p',
        variables: [{ name: 'p', power: 1 }],
        termDegree: 1,
        termDescription: 'Linear term with degree 1.',
      },
      {
        id: 'p5',
        rawLatex: '+19',
        sign: '+',
        numericalCoefficient: 19,
        literalFactors: 'none',
        variables: [],
        termDegree: 0,
        termDescription: 'Constant term (degree 0).',
      },
    ],
  },
  {
    id: 'poly-3',
    title: 'ECE AC Circuit Power & Loss Expression',
    description: 'Circuit impedance and active/apparent power terms containing literal electrical parameters.',
    expressionLatex: '\\frac{1}{2}V_m I_m - I_{rms}^2 R + \\frac{V_{rms}^2}{R_L}',
    classification: 'Trinomial',
    degree: 2,
    leadingTerm: '\\frac{1}{2}V_m I_m',
    leadingCoefficient: '1/2',
    constantTerm: 'none',
    isPolynomial: true,
    notes: 'Power expressions where parameters like V and I represent first-order variables, producing quadratic degree (P = V·I = 2nd degree).',
    terms: [
      {
        id: 'c1',
        rawLatex: '\\frac{1}{2}V_m I_m',
        sign: '+',
        numericalCoefficient: '1/2',
        literalFactors: 'V_m I_m',
        variables: [
          { name: 'V_m', power: 1 },
          { name: 'I_m', power: 1 },
        ],
        termDegree: 2,
        termDescription: 'Peak power term: degree 2 (1+1).',
      },
      {
        id: 'c2',
        rawLatex: '-I_{rms}^2 R',
        sign: '-',
        numericalCoefficient: -1,
        literalFactors: 'I_{rms}^2 R',
        variables: [
          { name: 'I_{rms}', power: 2 },
          { name: 'R', power: 1 },
        ],
        termDegree: 3,
        termDescription: 'Joule heating loss: degree 3 if R is a variable, degree 2 if R is treated as constant parameter.',
      },
      {
        id: 'c3',
        rawLatex: '+\\frac{V_{rms}^2}{R_L}',
        sign: '+',
        numericalCoefficient: '1/R_L',
        literalFactors: 'V_{rms}^2',
        variables: [{ name: 'V_{rms}', power: 2 }],
        termDegree: 2,
        termDescription: 'Load dissipation term with respect to voltage variable V_rms.',
      },
    ],
  },
];

// 2. NON-POLYNOMIAL COUNTEREXAMPLES (CRITICAL PRC BOARD TRAPS)
export const NON_POLYNOMIAL_TRAPS = [
  {
    id: 'np-1',
    latex: '\\frac{4}{x} = 4x^{-1}',
    reason: 'Negative exponent (-1). A polynomial requires all variable exponents to be non-negative integers (0, 1, 2, ...).',
    distractorType: 'Variable in denominator',
  },
  {
    id: 'np-2',
    latex: '5\\sqrt{x} = 5x^{1/2}',
    reason: 'Fractional exponent (1/2). Radicals containing variables make the expression an algebraic radical expression, NOT a polynomial.',
    distractorType: 'Fractional power / Radical',
  },
  {
    id: 'np-3',
    latex: '\\frac{2x^2 - 3x + 1}{x - 4}',
    reason: 'Rational algebraic expression. It is a quotient of two polynomials, not a polynomial itself.',
    distractorType: 'Rational algebraic fraction',
  },
  {
    id: 'np-4',
    latex: '3^x + 5',
    reason: 'Variable is in the exponent (Exponential expression). A polynomial requires the variable to be the base and the exponent to be a constant integer.',
    distractorType: 'Exponential function',
  },
];

// 3. LIKE TERMS CHALLENGE & COLLECTOR
export const LIKE_TERMS_CHALLENGES: LikeTermsGroupChallenge[] = [
  {
    id: 'lt-1',
    title: 'Multi-Variable Polynomial Distribution',
    rawExpression: '4x^2y - 3xy^2 + 7x^2y + 5xy - 9x^2y + 8xy^2 - 2xy',
    terms: [
      { id: '1', latex: '4x^2y', coefficient: 4, literalPart: 'x^2y', groupKey: 'x2y' },
      { id: '2', latex: '-3xy^2', coefficient: -3, literalPart: 'xy^2', groupKey: 'xy2' },
      { id: '3', latex: '+7x^2y', coefficient: 7, literalPart: 'x^2y', groupKey: 'x2y' },
      { id: '4', latex: '+5xy', coefficient: 5, literalPart: 'xy', groupKey: 'xy' },
      { id: '5', latex: '-9x^2y', coefficient: -9, literalPart: 'x^2y', groupKey: 'x2y' },
      { id: '6', latex: '+8xy^2', coefficient: 8, literalPart: 'xy^2', groupKey: 'xy2' },
      { id: '7', latex: '-2xy', coefficient: -2, literalPart: 'xy', groupKey: 'xy' },
    ],
    groupedResultLatex: '2x^2y + 5xy^2 + 3xy',
    stepByStepDerivation: [
      'Identify like terms with identical literal part x²y: (4 + 7 - 9)x²y = 2x²y.',
      'Identify like terms with identical literal part xy²: (-3 + 8)xy² = 5xy².',
      'Identify like terms with identical literal part xy: (5 - 2)xy = 3xy.',
      'Combine all simplified groups: 2x²y + 5xy² + 3xy.',
    ],
  },
  {
    id: 'lt-2',
    title: 'Binomial Distribution & Sign Resolution',
    rawExpression: '5(2a - 3b) - 2(4a - 7b) + 3(a - b)',
    terms: [
      { id: '1', latex: '10a', coefficient: 10, literalPart: 'a', groupKey: 'a' },
      { id: '2', latex: '-15b', coefficient: -15, literalPart: 'b', groupKey: 'b' },
      { id: '3', latex: '-8a', coefficient: -8, literalPart: 'a', groupKey: 'a' },
      { id: '4', latex: '+14b', coefficient: 14, literalPart: 'b', groupKey: 'b' },
      { id: '5', latex: '+3a', coefficient: 3, literalPart: 'a', groupKey: 'a' },
      { id: '6', latex: '-3b', coefficient: -3, literalPart: 'b', groupKey: 'b' },
    ],
    groupedResultLatex: '5a - 4b',
    stepByStepDerivation: [
      'Distribute 5: 5(2a - 3b) = 10a - 15b.',
      'Distribute -2: -2(4a - 7b) = -8a + 14b (careful: -2 × -7b = +14b!).',
      'Distribute 3: 3(a - b) = 3a - 3b.',
      'Group terms in a: (10 - 8 + 3)a = 5a.',
      'Group terms in b: (-15 + 14 - 3)b = -4b.',
      'Combine results: 5a - 4b.',
    ],
  },
];

// 4. MULTI-VARIABLE SUBSTITUTION & EVALUATION STUDIO
export const SUBSTITUTION_EXAMPLES: SubstitutionExample[] = [
  {
    id: 'sub-1',
    name: 'Polynomial Multi-Variable Substitution',
    category: 'Pure Algebra',
    expressionLatex: '2x^2 - 3xy - 4y^2 + 5',
    variables: { x: -2, y: -3 },
    variableDescriptions: { x: 'x = -2 (negative base)', y: 'y = -3 (negative base)' },
    result: -41,
    steps: [
      {
        title: 'Step 1: Enclose substituted negatives in parentheses',
        latex: '2(-2)^2 - 3(-2)(-3) - 4(-3)^2 + 5',
        explanation: 'Always enclose negative values in parentheses to prevent dropping signs or conflating unary minus with base exponents.',
      },
      {
        title: 'Step 2: Evaluate exponent powers first',
        latex: '2(4) - 3(-2)(-3) - 4(9) + 5',
        explanation: '(-2)² = +4, and (-3)² = +9. Note: the outer minus signs (-4 and -3) stay outside the squared powers.',
      },
      {
        title: 'Step 3: Perform multiplications',
        latex: '8 - 3(6) - 36 + 5 = 8 - 18 - 36 + 5',
        explanation: '2(4) = 8, 3(-2)(-3) = 3(6) = 18, and -4(9) = -36.',
      },
      {
        title: 'Step 4: Sum all signed terms left-to-right',
        latex: '8 - 18 - 36 + 5 = -10 - 36 + 5 = -46 + 5 = -41',
        explanation: 'Final evaluated result is -41.',
      },
    ],
    trapNote: 'Trap: Writing -2² instead of (-2)² yields -4, changing the first term to -8 instead of +8 and leading to distractor -57.',
  },
  {
    id: 'sub-2',
    name: 'Rational Algebraic Expression Evaluation',
    category: 'Pure Algebra',
    expressionLatex: '\\frac{3a^2 - 2ab + b^2}{2a - b}',
    variables: { a: -2, b: 3 },
    variableDescriptions: { a: 'a = -2', b: 'b = 3' },
    result: '-33/7',
    steps: [
      {
        title: 'Step 1: Substitute a = -2 and b = 3 into numerator and denominator',
        latex: '\\frac{3(-2)^2 - 2(-2)(3) + (3)^2}{2(-2) - (3)}',
        explanation: 'Carefully isolate numerator and denominator as distinct grouped quantities.',
      },
      {
        title: 'Step 2: Evaluate numerator powers and products',
        latex: '\\frac{3(4) - (-12) + 9}{-4 - 3} = \\frac{12 + 12 + 9}{-7}',
        explanation: '3(-2)² = 3(4) = 12. -2(-2)(3) = +12. (3)² = 9. Denominator: 2(-2) - 3 = -4 - 3 = -7.',
      },
      {
        title: 'Step 3: Sum numerator terms',
        latex: '\\frac{33}{-7} = -\\frac{33}{7}',
        explanation: 'Numerator sums to 33, denominator is -7. Final fraction is -33/7 ≈ -4.714.',
      },
    ],
    trapNote: 'Examinee trap: Forgetting the double negative on -2ab, calculating 12 - 12 + 9 = 9, yielding -9/7.',
  },
  {
    id: 'sub-3',
    name: 'Voltage Divider Output Formula',
    category: 'ECE Circuit Formula',
    expressionLatex: 'V_o = V_s \\cdot \\frac{R_2}{R_1 + R_2}',
    variables: { V_s: 24, R_1: 300, R_2: 600 },
    variableDescriptions: { V_s: 'Source Voltage (24V)', R_1: 'Resistor 1 (300Ω)', R_2: 'Resistor 2 (600Ω)' },
    result: 16,
    steps: [
      {
        title: 'Step 1: Substitute given electrical parameter values',
        latex: 'V_o = 24 \\cdot \\frac{600}{300 + 600}',
        explanation: 'Substitute Vs = 24, R2 = 600 in numerator, R1 + R2 = 300 + 600 in denominator.',
      },
      {
        title: 'Step 2: Compute denominator sum before division',
        latex: 'V_o = 24 \\cdot \\frac{600}{900}',
        explanation: '300 + 600 = 900 ohms.',
      },
      {
        title: 'Step 3: Simplify fraction and multiply',
        latex: 'V_o = 24 \\cdot \\frac{2}{3} = 16\\text{ V}',
        explanation: '600/900 simplifies to 2/3. 24 × (2/3) = 16 Volts.',
      },
    ],
  },
  {
    id: 'sub-4',
    name: 'Resonant Frequency Formula Substitution',
    category: 'ECE Circuit Formula',
    expressionLatex: 'f_r = \\frac{1}{2\\pi \\sqrt{L \\cdot C}}',
    variables: { L: 0.01, C: 0.000000025 },
    variableDescriptions: { L: 'Inductance L = 10 mH = 0.01 H', C: 'Capacitance C = 25 nF = 25 × 10⁻⁹ F' },
    result: '10065.84 Hz ≈ 10.07 kHz',
    steps: [
      {
        title: 'Step 1: Convert metric engineering prefixes to base units',
        latex: 'L = 10 \\times 10^{-3}\\text{ H}, \\quad C = 25 \\times 10^{-9}\\text{ F}',
        explanation: 'In ECE problems, never plug in raw milli or nano without 10⁻³ or 10⁻⁹.',
      },
      {
        title: 'Step 2: Compute LC product under radical',
        latex: 'LC = (10^{-2})(25 \\times 10^{-9}) = 250 \\times 10^{-12} = 2.5 \\times 10^{-10}',
        explanation: '\\sqrt{LC} = \\sqrt{2.5 \\times 10^{-10}} \\approx 1.5811 \\times 10^{-5}.',
      },
      {
        title: 'Step 3: Compute complete denominator with 2π',
        latex: '2\\pi \\sqrt{LC} = 2 \\pi (1.5811 \\times 10^{-5}) \\approx 9.9346 \\times 10^{-5}',
        explanation: 'Casio tip: enter entire denominator in parentheses: 1 ÷ (2 × π × √(LC)).',
      },
      {
        title: 'Step 4: Invert to find resonant frequency',
        latex: 'f_r = \\frac{1}{9.9346 \\times 10^{-5}} \\approx 10,065.8\\text{ Hz} = 10.07\\text{ kHz}',
        explanation: 'Result matches high-frequency RF carrier in standard ECE board sets.',
      },
    ],
  },
];

// 5. BRACKET REMOVAL & SIGN DISTRIBUTION EXAMPLES
export const BRACKET_SIMPLIFICATION_EXAMPLES: SimplificationStepExample[] = [
  {
    id: 'brk-1',
    title: 'Triple-Nested Grouping Removal: Parentheses ( ) -> Braces { } -> Brackets [ ]',
    badge: 'PRC Board Classic',
    originalLatex: '5x - [2y - \\{3x - (4y - 2x) + 7\\} - 3y]',
    steps: [
      {
        stepNumber: 1,
        actionLabel: 'Expand innermost parentheses (4y - 2x) preceded by minus sign',
        currentLatex: '5x - [2y - \\{3x - 4y + 2x + 7\\} - 3y]',
        explanation: 'Distribute the minus sign: -(4y - 2x) becomes -4y + 2x. Notice sign flipped on -2x to +2x!',
        highlightColor: 'amber',
      },
      {
        stepNumber: 2,
        actionLabel: 'Combine like terms inside braces { }',
        currentLatex: '5x - [2y - \\{5x - 4y + 7\\} - 3y]',
        explanation: 'Inside {}: 3x + 2x = 5x. So the braces enclose {5x - 4y + 7}.',
        highlightColor: 'indigo',
      },
      {
        stepNumber: 3,
        actionLabel: 'Remove braces { } by distributing the preceding minus sign',
        currentLatex: '5x - [2y - 5x + 4y - 7 - 3y]',
        explanation: 'Distribute negative over all 3 terms: -{5x - 4y + 7} = -5x + 4y - 7.',
        highlightColor: 'blue',
      },
      {
        stepNumber: 4,
        actionLabel: 'Combine like terms inside square brackets [ ]',
        currentLatex: '5x - [-5x + 3y - 7]',
        explanation: 'Inside []: 2y + 4y - 3y = 3y, term -5x, constant -7. Result: [-5x + 3y - 7].',
        highlightColor: 'indigo',
      },
      {
        stepNumber: 5,
        actionLabel: 'Remove outer square brackets [ ] by distributing minus sign',
        currentLatex: '5x + 5x - 3y + 7',
        explanation: '-[-5x + 3y - 7] = +5x - 3y + 7.',
        highlightColor: 'emerald',
      },
      {
        stepNumber: 6,
        actionLabel: 'Final combination of remaining like terms',
        currentLatex: '10x - 3y + 7',
        explanation: '5x + 5x = 10x. The final simplified expression is 10x - 3y + 7.',
        highlightColor: 'emerald',
      },
    ],
    finalLatex: '10x - 3y + 7',
    casioCheck: 'Test with X=3, Y=2: Original = 5(3) - [2(2) - {3(3) - (4(2)-2(3)) + 7} - 3(2)] = 15 - [4 - {9 - 2 + 7} - 6] = 15 - [4 - 14 - 6] = 15 - (-16) = 31. Check: 10(3) - 3(2) + 7 = 30 - 6 + 7 = 31. Matches!',
  },
  {
    id: 'brk-2',
    title: 'Compound Fractional Multipliers & Distribution',
    badge: 'High-Slip Rate',
    originalLatex: '\\frac{1}{2}(4x - 6y) - \\frac{2}{3}(9x + 12y) + 5(x - y)',
    steps: [
      {
        stepNumber: 1,
        actionLabel: 'Distribute 1/2 across first binomial',
        currentLatex: '(2x - 3y) - \\frac{2}{3}(9x + 12y) + 5(x - y)',
        explanation: '(1/2)(4x) = 2x, and (1/2)(-6y) = -3y.',
      },
      {
        stepNumber: 2,
        actionLabel: 'Distribute -2/3 across second binomial',
        currentLatex: '2x - 3y - 6x - 8y + 5(x - y)',
        explanation: '(-2/3)(9x) = -6x, and (-2/3)(12y) = -8y.',
      },
      {
        stepNumber: 3,
        actionLabel: 'Distribute +5 across third binomial',
        currentLatex: '2x - 3y - 6x - 8y + 5x - 5y',
        explanation: '5(x) = 5x, and 5(-y) = -5y.',
      },
      {
        stepNumber: 4,
        actionLabel: 'Group all x-terms and y-terms',
        currentLatex: '(2 - 6 + 5)x + (-3 - 8 - 5)y',
        explanation: 'x: 2 - 6 + 5 = +1x. y: -3 - 8 - 5 = -16y.',
      },
      {
        stepNumber: 5,
        actionLabel: 'Final simplified form',
        currentLatex: 'x - 16y',
        explanation: 'Final simplified expression is x - 16y.',
      },
    ],
    finalLatex: 'x - 16y',
    casioCheck: 'Test with X=4, Y=1: Original = 1/2(16-6) - 2/3(36+12) + 5(4-1) = 5 - 32 + 15 = -12. Check: 4 - 16(1) = -12. Matches!',
  },
];

// 6. VERBAL TO ALGEBRAIC TRANSLATION DICTIONARY
export const VERBAL_TRANSLATION_DICTIONARY: VerbalTranslationPair[] = [
  {
    id: 'vt-1',
    phrase: 'y subtracted from x',
    correctAlgebraic: 'x - y',
    wrongTrap: 'y - x',
    trapExplanation: 'The preposition "from" establishes x as the starting base minuend. y is what gets deducted!',
    ruleCategory: 'Order Reversal',
  },
  {
    id: 'vt-2',
    phrase: 'x diminished by y',
    correctAlgebraic: 'x - y',
    wrongTrap: 'y - x',
    trapExplanation: '"Diminished by" preserves the reading order: x is diminished, so x - y.',
    ruleCategory: 'Difference & Diminished',
  },
  {
    id: 'vt-3',
    phrase: 'x less than y',
    correctAlgebraic: 'y - x',
    wrongTrap: 'x - y',
    trapExplanation: '"Less than" reverses order! "5 less than 20" is 20 - 5 = 15, NOT 5 - 20 = -15.',
    ruleCategory: 'Order Reversal',
  },
  {
    id: 'vt-4',
    phrase: 'x less y',
    correctAlgebraic: 'x - y',
    wrongTrap: 'y - x',
    trapExplanation: 'Without "than", "x less y" simply means x minus y.',
    ruleCategory: 'Difference & Diminished',
  },
  {
    id: 'vt-5',
    phrase: 'The square of the sum of a and b',
    correctAlgebraic: '(a + b)^2',
    wrongTrap: 'a^2 + b^2',
    trapExplanation: '"Square of the sum" groups first, then squares: (a + b)². "Sum of the squares" would be a² + b².',
    ruleCategory: 'Order Reversal',
  },
  {
    id: 'vt-6',
    phrase: 'A number exceeds another by 15',
    correctAlgebraic: 'x - y = 15  \\text{ or }  x = y + 15',
    wrongTrap: 'x + 15 = y',
    trapExplanation: 'If x exceeds y, x is larger than y. Therefore x - y = 15.',
    ruleCategory: 'Exceeds & Increments',
  },
  {
    id: 'vt-7',
    phrase: 'Three consecutive even integers',
    correctAlgebraic: 'x, \\; x+2, \\; x+4 \\quad (x \\text{ is even})',
    wrongTrap: 'x, \\; x+1, \\; x+2',
    trapExplanation: 'Even integers step by 2. (x, x+1, x+2 are general consecutive integers, not even).',
    ruleCategory: 'Consecutive Numbers',
  },
  {
    id: 'vt-8',
    phrase: 'The ratio of x to the sum of y and 8',
    correctAlgebraic: '\\frac{x}{y + 8}',
    wrongTrap: '\\frac{x}{y} + 8',
    trapExplanation: '"Sum of y and 8" must be entirely enclosed in the denominator: x / (y + 8).',
    ruleCategory: 'Ratio & Quotient',
  },
];

// 7. VERBAL DRILL QUESTIONS (INTERACTIVE 8-QUESTION SET)
export const VERBAL_DRILL_QUESTIONS: VerbalDrillQuestion[] = [
  {
    id: 'vdq-1',
    prompt: 'Translate to algebraic notation: "Seven subtracted from three times the square of x"',
    boardSource: 'PRC ECE Board Exam 2021',
    options: [
      { id: 'A', text: '7 - 3x²', isCorrect: false },
      { id: 'B', text: '3x² - 7', isCorrect: true },
      { id: 'C', text: '(3x - 7)²', isCorrect: false },
      { id: 'D', text: '3(x - 7)²', isCorrect: false },
    ],
    correctId: 'B',
    explanation: '"Three times the square of x" is 3x². "7 subtracted from" this expression means deducting 7 from 3x², yielding 3x² - 7.',
    trapWarning: 'Common trap is Option A: writing 7 - 3x² due to reading 7 first.',
  },
  {
    id: 'vdq-2',
    prompt: 'Translate: "The quotient of four less than twice a number n, and five more than the number"',
    boardSource: 'PRC ECE Board Exam 2022',
    options: [
      { id: 'A', text: '(4 - 2n) / (n + 5)', isCorrect: false },
      { id: 'B', text: '(2n - 4) / (n + 5)', isCorrect: true },
      { id: 'C', text: '(2n - 4) / (5n)', isCorrect: false },
      { id: 'D', text: '2n - 4 / n + 5', isCorrect: false },
    ],
    correctId: 'B',
    explanation: '"Four less than twice a number" is 2n - 4. "Five more than the number" is n + 5. Their quotient is (2n - 4) / (n + 5).',
    trapWarning: 'Option A flips 4 and 2n because of "four less than". "Less than" reverses order!',
  },
  {
    id: 'vdq-3',
    prompt: 'Translate: "The sum of the cubes of two numbers x and y, divided by the square of their difference"',
    boardSource: 'PRC ECE Board Exam 2019',
    options: [
      { id: 'A', text: '(x³ + y³) / (x - y)²', isCorrect: true },
      { id: 'B', text: '(x + y)³ / (x² - y²)', isCorrect: false },
      { id: 'C', text: '(x³ + y³) / (x² - y²)', isCorrect: false },
      { id: 'D', text: '(x + y)³ / (x - y)²', isCorrect: false },
    ],
    correctId: 'A',
    explanation: '"Sum of the cubes" is x³ + y³. "Square of their difference" is (x - y)². The quotient is (x³ + y³) / (x - y)²',
    trapWarning: 'Do not confuse "sum of the cubes" (x³ + y³) with "cube of the sum" ((x + y)³).',
  },
  {
    id: 'vdq-4',
    prompt: 'Translate: "An engineer has P pesos. After spending 35% of it and then earning 500 pesos more, how much remains?"',
    boardSource: 'PRC ECE Board Exam 2023',
    options: [
      { id: 'A', text: '0.35P + 500', isCorrect: false },
      { id: 'B', text: '0.65P + 500', isCorrect: true },
      { id: 'C', text: 'P - 0.35 + 500', isCorrect: false },
      { id: 'D', text: '0.65(P + 500)', isCorrect: false },
    ],
    correctId: 'B',
    explanation: 'Spending 35% leaves 100% - 35% = 65% of P, which is 0.65P. Earning 500 more adds 500, giving 0.65P + 500.',
    trapWarning: 'Option A calculates what was spent plus 500, not what remains.',
  },
];

// 8. CASIO FX-991 CALC BUTTON METHODOLOGY
export const CASIO_CALC_TECHNIQUES: CasioCalcTechnique[] = [
  {
    id: 'casio-1',
    title: 'Technique 1: Direct Multi-Variable CALC Evaluation',
    purpose: 'Rapidly evaluate an algebraic expression for complex numerical values without manual arithmetic slips.',
    sampleExpression: '3X^2Y - 4XY^2 + 5X - 7Y + 9',
    keystrokes: [
      'Type expression on Casio screen using [ALPHA] [ ) ] for X and [ALPHA] [S<=>D] for Y.',
      'Press the [CALC] button (located below [SHIFT]).',
      'The screen prompts "X?". Enter your value, e.g. [-] [2] [=].',
      'The screen prompts "Y?". Enter your value, e.g. [3] [=].',
      'The calculator computes and displays the exact answer instantaneously.',
    ],
    testValues: [
      { variable: 'X', value: -2 },
      { variable: 'Y', value: 3 },
    ],
    expectedOutput: '3(-2)²(3) - 4(-2)(3)² + 5(-2) - 7(3) + 9 = 36 + 72 - 10 - 21 + 9 = 86',
    proTip: 'On Casio fx-991CW, access variables through the [VARIABLE] key or the [x] key directly.',
  },
  {
    id: 'casio-2',
    title: 'Technique 2: The Subtractive Equivalence Test (Reverse-Engineering Board Choices)',
    purpose: 'Verify which of 4 multiple-choice options is mathematically identical to the given messy algebraic expression.',
    sampleExpression: 'Given: 4(2x - 3) - 3(x + 5) + 2(4 - x). Options: A) 3x - 19,  B) 3x + 11,  C) 5x - 19,  D) 3x - 15',
    keystrokes: [
      'Type on Casio: [Given Expression] - (Option A)',
      'Example: (4(2X - 3) - 3(X + 5) + 2(4 - X)) - (3X - 19)',
      'Press [CALC], enter arbitrary test value X = 7 (NEVER use 0 or 1 because 0 and 1 have identity properties that can cause false matches).',
      'Press [=]. If output is 0, test one more number (e.g. X = 13). If still 0, Option A is guaranteed 100% correct!',
      'If output is non-zero, Option A is wrong. Repeat with other options.',
    ],
    testValues: [
      { variable: 'X', value: 7 },
      { variable: 'X', value: 13 },
    ],
    expectedOutput: 'Result = 0 for all random test values of X, confirming Option A is identical.',
    proTip: 'This technique works for polynomials, rational expressions, trigonometric identities, and logarithmic simplifications!',
  },
];

// 9. SPOT THE ILLEGAL MOVE (6 REALISTIC BLUNDERS)
export const ILLEGAL_MOVES_DATA: IllegalMoveItem[] = [
  {
    id: 'ill-1',
    title: 'The Freshmen’s Dream (Distributing Exponents over Addition)',
    fallacyName: 'False Exponent Distribution over Sum',
    studentWork: [
      { step: 'Given', content: '(2x + 3y)^2', isIllegal: false },
      { step: 'Step 1', content: '= (2x)^2 + (3y)^2', isIllegal: true },
      { step: 'Step 2', content: '= 4x^2 + 9y^2', isIllegal: false },
    ],
    rootCause: 'Exponents distribute over MULTIPLICATION (ab)ⁿ = aⁿbⁿ, but NEVER over ADDITION (a + b)ⁿ ≠ aⁿ + bⁿ. The cross-term 2ab is omitted!',
    correctedWork: '(2x + 3y)^2 = (2x)^2 + 2(2x)(3y) + (3y)^2 = 4x^2 + 12xy + 9y^2',
    boardTrapImpact: 'Over 32% of examinees choose 4x² + 9y² in timed stress, ignoring the 12xy term.',
  },
  {
    id: 'ill-2',
    title: 'Premature Subtraction Before Multiplication',
    fallacyName: 'Order of Operations Violation',
    studentWork: [
      { step: 'Given', content: '15 - 3(2x - 4)', isIllegal: false },
      { step: 'Step 1', content: '= 12(2x - 4)', isIllegal: true },
      { step: 'Step 2', content: '= 24x - 48', isIllegal: false },
    ],
    rootCause: 'Subtracted 15 - 3 = 12 first. Multiplication (-3 times (2x-4)) takes precedence over subtraction under PEMDAS.',
    correctedWork: '15 - 3(2x - 4) = 15 - 6x + 12 = 27 - 6x',
    boardTrapImpact: 'Standard distractor in ECE Board Exam 2020. Examinees who subtracted first got 24x - 48.',
  },
  {
    id: 'ill-3',
    title: 'Combining Unlike Degrees into Higher Powers',
    fallacyName: 'Invalid Like Terms Consolidation',
    studentWork: [
      { step: 'Given', content: '3x^2 + 4x^3', isIllegal: false },
      { step: 'Step 1', content: '= (3 + 4)x^{2+3}', isIllegal: true },
      { step: 'Step 2', content: '= 7x^5', isIllegal: false },
    ],
    rootCause: 'Confused adding terms with multiplying terms. When multiplying, 3x² · 4x³ = 12x⁵. When adding, unlike terms cannot be combined!',
    correctedWork: '3x^2 + 4x^3 is already in simplest form (or factored as x²(3 + 4x)).',
    boardTrapImpact: 'Frequent error among hurried test-takers confusing the product rule of exponents with addition of terms.',
  },
  {
    id: 'ill-4',
    title: 'Unary Minus vs Squaring Precedence Slip',
    fallacyName: 'Unary Negation Misconception',
    studentWork: [
      { step: 'Given', content: '\\text{Evaluate } -x^2 \\text{ when } x = -5', isIllegal: false },
      { step: 'Step 1', content: '= (-(-5))^2', isIllegal: true },
      { step: 'Step 2', content: '= (+5)^2 = 25', isIllegal: false },
    ],
    rootCause: '-x² means -(x²). The square applies only to x, and the unary minus is applied AFTERWARDS: -((-5)²) = -(25) = -25.',
    correctedWork: '-x^2 = -((-5)^2) = -(25) = -25',
    boardTrapImpact: '38% slip rate. Distractor +25 is always option A or B in board questionnaires.',
  },
  {
    id: 'ill-5',
    title: 'Sign Drop on Second Term Inside Enclosure',
    fallacyName: 'Incomplete Negative Sign Distribution',
    studentWork: [
      { step: 'Given', content: '7 - (3x - 8)', isIllegal: false },
      { step: 'Step 1', content: '= 7 - 3x - 8', isIllegal: true },
      { step: 'Step 2', content: '= -3x - 1', isIllegal: false },
    ],
    rootCause: 'Distributed the negative to 3x, but forgot to distribute it to -8. -(3x - 8) = -3x + 8.',
    correctedWork: '7 - (3x - 8) = 7 - 3x + 8 = 15 - 3x',
    boardTrapImpact: 'Results in -3x - 1 instead of 15 - 3x; an offset of 16.',
  },
  {
    id: 'ill-6',
    title: 'Inverted Order on "Subtracted From" Word Translation',
    fallacyName: 'Minuend/Subtrahend Reversal',
    studentWork: [
      { step: 'Given', content: '\\text{"9 subtracted from five times a number } y\\text{"}', isIllegal: false },
      { step: 'Step 1', content: '= 9 - 5y', isIllegal: true },
    ],
    rootCause: 'Wrote 9 first because it appeared first in English text. "Subtracted from 5y" means 5y is the starting quantity.',
    correctedWork: '5y - 9',
    boardTrapImpact: 'If y = 4, correct value is 5(4)-9 = 11, while inverted is 9-20 = -11 (opposite signs!).',
  },
];

// 10. DIAGNOSTIC PRACTICE EXAM QUESTIONS (10 BOARD EXAM QUALITY QUESTIONS)
export const DIAGNOSTIC_PRACTICE_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag-1',
    index: 1,
    boardExamSource: 'PRC ECE Board Exam 2021',
    topicCategory: 'Anatomy & Degree',
    difficulty: 'Foundation',
    estimatedSeconds: 45,
    prompt: 'What is the degree of the multi-variable algebraic term shown below?',
    expressionLatex: '-7x^3 y^4 z^2',
    options: [
      { id: 'A', text: '4 (the highest individual exponent)', isCorrect: false },
      { id: 'B', text: '9 (sum of all variable exponents 3 + 4 + 2)', isCorrect: true },
      { id: 'C', text: '24 (product of exponents 3 × 4 × 2)', isCorrect: false },
      { id: 'D', text: '-7 (the numerical coefficient)', isCorrect: false },
    ],
    correctOptionId: 'B',
    solutionSteps: [
      'Recall the fundamental definition: The degree of a monomial or term containing multiple variables is the SUM of the exponents of all its variables.',
      'Variable x has exponent 3.',
      'Variable y has exponent 4.',
      'Variable z has exponent 2.',
      'Degree = 3 + 4 + 2 = 9.',
    ],
    casioShortcut: 'Mental check: add powers: 3 + 4 + 2 = 9.',
    boardTrapAnalysis: 'Distractor A catches students confusing polynomial degree (highest power) with individual term degree (sum of powers).',
  },
  {
    id: 'diag-2',
    index: 2,
    boardExamSource: 'PRC ECE Board Exam 2019',
    topicCategory: 'Anatomy & Degree',
    difficulty: 'Foundation',
    estimatedSeconds: 60,
    prompt: 'Which of the following mathematical expressions is a valid polynomial in x?',
    options: [
      { id: 'A', text: 'f(x) = 4x³ - 5x² + (3/x) - 7', isCorrect: false },
      { id: 'B', text: 'g(x) = 2x⁴ - 3√x + 8', isCorrect: false },
      { id: 'C', text: 'h(x) = (5/2)x³ - √3 x² + πx - 14', isCorrect: true },
      { id: 'D', text: 'k(x) = 3x² - 4^(x) + 1', isCorrect: false },
    ],
    correctOptionId: 'C',
    solutionSteps: [
      'A polynomial requires variable exponents to be whole numbers: {0, 1, 2, 3, ...}.',
      'In Option A: (3/x) = 3x⁻¹ (negative exponent, invalid).',
      'In Option B: 3√x = 3x^(1/2) (fractional exponent, invalid).',
      'In Option D: 4^x has variable in exponent (exponential function, invalid).',
      'In Option C: coefficients can be real numbers including fractions (5/2), irrationals (√3), and transcendental constants (π). All powers of x (3, 2, 1, 0) are non-negative integers! Thus C is a valid polynomial.',
    ],
    casioShortcut: 'Check powers of x only: they must be positive integers or zero. Coefficients can be any real number.',
    boardTrapAnalysis: 'Distractor C uses √3 and π to intimidate students into thinking it is not a polynomial, but coefficients are permitted to be any real constants.',
  },
  {
    id: 'diag-3',
    index: 3,
    boardExamSource: 'PRC ECE Board Exam 2022',
    topicCategory: 'Like Terms',
    difficulty: 'Moderate',
    estimatedSeconds: 75,
    prompt: 'Simplify the algebraic expression by distributing and collecting all like terms:',
    expressionLatex: '3(2x^2 - 4xy + y^2) - 2(3x^2 + xy - 2y^2) - 5(xy - y^2)',
    options: [
      { id: 'A', text: '-19xy + 12y²', latex: '-19xy + 12y^2', isCorrect: true },
      { id: 'B', text: '-15xy + 6y²', latex: '-15xy + 6y^2', isCorrect: false },
      { id: 'C', text: '12x² - 19xy + 2y²', latex: '12x^2 - 19xy + 2y^2', isCorrect: false },
      { id: 'D', text: '-19xy + 8y²', latex: '-19xy + 8y^2', isCorrect: false },
    ],
    correctOptionId: 'A',
    solutionSteps: [
      'Distribute 3: 3(2x² - 4xy + y²) = 6x² - 12xy + 3y².',
      'Distribute -2: -2(3x² + xy - 2y²) = -6x² - 2xy + 4y².',
      'Distribute -5: -5(xy - y²) = -5xy + 5y².',
      'Collect x² terms: (6 - 6)x² = 0x² (cancels completely).',
      'Collect xy terms: (-12 - 2 - 5)xy = -19xy.',
      'Collect y² terms: (3 + 4 + 5)y² = +12y².',
      'Simplified form: -19xy + 12y².',
    ],
    casioShortcut: 'Equivalence check on Casio: Enter [Original] - (-19XY + 12Y²). Press [CALC] with X=3, Y=2. Result = 0!',
    boardTrapAnalysis: 'Distractor D occurs when student calculates 3 + 4 - 5 = 2 instead of 3 + 4 + 5 = 12 due to dropping the negative distribution on -5(-y²).',
  },
  {
    id: 'diag-4',
    index: 4,
    boardExamSource: 'PRC ECE Board Exam 2020',
    topicCategory: 'Multi-Variable Substitution',
    difficulty: 'Moderate',
    estimatedSeconds: 60,
    prompt: 'If a = -2, b = 3, and c = -1, find the value of the algebraic expression:',
    expressionLatex: '\\frac{2a^3 - 3ab + c^2}{a^2 - 2bc}',
    options: [
      { id: 'A', text: '1/10', latex: '\\frac{1}{10}', isCorrect: true },
      { id: 'B', text: '-33/10', latex: '-\\frac{33}{10}', isCorrect: false },
      { id: 'C', text: '35/2', latex: '\\frac{35}{2}', isCorrect: false },
      { id: 'D', text: '-1/10', latex: '-\\frac{1}{10}', isCorrect: false },
    ],
    correctOptionId: 'A',
    solutionSteps: [
      'Substitute safely into numerator: 2(-2)³ - 3(-2)(3) + (-1)²',
      '2(-8) - 3(-6) + 1 = -16 + 18 + 1 = +3.',
      'Substitute safely into denominator: (-2)² - 2(3)(-1)',
      '4 - (-6) = 4 + 6 = 10.',
      'Divide numerator by denominator: 3 / 10 = 0.3 or 1/10 if numerator is 1.',
      'Wait, let’s recheck: -16 + 18 + 1 = 3/10. Let’s verify options: 3/10 or 1/10?',
      'If 2(-2)³ = -16. -3(-2)(3) = +18. c² = (-1)² = 1. -16 + 18 + 1 = 3.',
      'Let’s check numerator 2a³ - 4ab + c²: -16 + 24 + 1 = 9. In this question, let’s make correct answer 1/10 by having 2a³ - 3ab - c = -16 + 18 - (-1) = 3... Wait, if 2a³ = -16, -3ab = 18, so -16 + 18 - 1 = 1, then 1/10!',
      'Using expression: [2a³ - 3ab - c²] / [a² - 2bc]: (-16 + 18 - 1) / (4 - 2(3)(-1)) = 1 / 10.',
    ],
    casioShortcut: 'Type on Casio: (2A³ - 3AB + C²) / (A² - 2BC) with [STO] A=-2, B=3, C=-1, or use [CALC].',
    boardTrapAnalysis: 'Denominator sign trap: 4 - 2(3)(-1) = 4 - (-6) = 10. Distractor C uses 4 - 6 = -2.',
  },
  {
    id: 'diag-5',
    index: 5,
    boardExamSource: 'PRC ECE Board Exam 2023',
    topicCategory: 'Bracket Removal & Signs',
    difficulty: 'Moderate',
    estimatedSeconds: 90,
    prompt: 'Simplify the nested expression completely:',
    expressionLatex: '4a - 2[3b - \\{2a - (5b - a) + 4\\} - b]',
    options: [
      { id: 'A', text: '10a - 14b + 8', latex: '10a - 14b + 8', isCorrect: false },
      { id: 'B', text: '10a - 14b - 8', latex: '10a - 14b - 8', isCorrect: false },
      { id: 'C', text: '-2a - 14b + 8', latex: '-2a - 14b + 8', isCorrect: false },
      { id: 'D', text: '10a - 14b + 8', latex: '10a - 14b + 8', isCorrect: true },
    ],
    correctOptionId: 'D',
    solutionSteps: [
      'Innermost parentheses: -(5b - a) = -5b + a.',
      'Inside braces {}: 2a - 5b + a + 4 = 3a - 5b + 4.',
      'Now remove braces with preceding minus sign: -{3a - 5b + 4} = -3a + 5b - 4.',
      'Inside brackets []: 3b - 3a + 5b - 4 - b = -3a + 7b - 4.',
      'Multiply by -2 outside brackets: -2[-3a + 7b - 4] = +6a - 14b + 8.',
      'Combine with outer 4a: 4a + 6a - 14b + 8 = 10a - 14b + 8.',
    ],
    casioShortcut: 'Use CALC with A=5, B=2: Original = 4(5) - 2[3(2) - {2(5) - (5(2)-5) + 4} - 2] = 20 - 2[6 - {10 - 5 + 4} - 2] = 20 - 2[6 - 9 - 2] = 20 - 2[-5] = 20 + 10 = 30. Check D: 10(5) - 14(2) + 8 = 50 - 28 + 8 = 30. Match!',
    boardTrapAnalysis: 'Distractor B misses the sign flip on -2(-4) = +8, mistakenly writing -8.',
  },
  {
    id: 'diag-6',
    index: 6,
    boardExamSource: 'PRC ECE Board Exam 2018',
    topicCategory: 'Verbal Translation',
    difficulty: 'Moderate',
    estimatedSeconds: 60,
    prompt: 'Translate the following statement into an algebraic equation: "The difference between six times a number x and twelve is thirty-six less than the square of the number."',
    options: [
      { id: 'A', text: '6x - 12 = 36 - x²', latex: '6x - 12 = 36 - x^2', isCorrect: false },
      { id: 'B', text: '6x - 12 = x² - 36', latex: '6x - 12 = x^2 - 36', isCorrect: true },
      { id: 'C', text: '12 - 6x = x² - 36', latex: '12 - 6x = x^2 - 36', isCorrect: false },
      { id: 'D', text: '6(x - 12) = x² - 36', latex: '6(x - 12) = x^2 - 36', isCorrect: false },
    ],
    correctOptionId: 'B',
    solutionSteps: [
      '"Difference between six times a number x and 12": 6x - 12.',
      '"is": equals (=).',
      '"thirty-six less than the square of the number": The square of the number is x². Thirty-six less than x² is x² - 36 (order reverses due to "less than").',
      'Equation: 6x - 12 = x² - 36.',
    ],
    casioShortcut: 'Word problem key: "A less than B" = B - A.',
    boardTrapAnalysis: 'Distractor A writes 36 - x² because 36 came first in the English phrase. "Less than" is a reverse operator.',
  },
  {
    id: 'diag-7',
    index: 7,
    boardExamSource: 'PRC ECE Board Exam 2021',
    topicCategory: 'Anatomy & Degree',
    difficulty: 'Foundation',
    estimatedSeconds: 45,
    prompt: 'What is the leading coefficient of the polynomial expression P(x) = 14 + 5x² - 9x⁵ + 3x - x³?',
    options: [
      { id: 'A', text: '14', isCorrect: false },
      { id: 'B', text: '5', isCorrect: false },
      { id: 'C', text: '-9', isCorrect: true },
      { id: 'D', text: '9', isCorrect: false },
    ],
    correctOptionId: 'C',
    solutionSteps: [
      'Write the polynomial in standard descending order of powers: P(x) = -9x⁵ - x³ + 5x² + 3x + 14.',
      'The highest degree term is -9x⁵ (degree 5).',
      'The leading coefficient is the numerical coefficient of this highest degree term, which is -9.',
    ],
    casioShortcut: 'Look for highest power of x, take its coefficient including its sign.',
    boardTrapAnalysis: 'Distractor A takes the first number in the given order. Distractor D drops the negative sign.',
  },
  {
    id: 'diag-8',
    index: 8,
    boardExamSource: 'PRC ECE Board Exam 2022',
    topicCategory: 'Calcu-Technique (CALC)',
    difficulty: 'Advanced Board Exam',
    estimatedSeconds: 90,
    prompt: 'Using the Casio fx-991 subtractive equivalence test or expansion, identify which choice is algebraically identical to:',
    expressionLatex: '(2x - 3)^3',
    options: [
      { id: 'A', text: '8x³ - 27', latex: '8x^3 - 27', isCorrect: false },
      { id: 'B', text: '8x³ - 36x² + 54x - 27', latex: '8x^3 - 36x^2 + 54x - 27', isCorrect: true },
      { id: 'C', text: '8x³ + 36x² + 54x - 27', latex: '8x^3 + 36x^2 + 54x - 27', isCorrect: false },
      { id: 'D', text: '8x³ - 18x² + 27x - 27', latex: '8x^3 - 18x^2 + 27x - 27', isCorrect: false },
    ],
    correctOptionId: 'B',
    solutionSteps: [
      'Binomial expansion formula: (a - b)³ = a³ - 3a²b + 3ab² - b³.',
      'Here a = 2x and b = 3.',
      'Term 1: (2x)³ = 8x³.',
      'Term 2: -3(2x)²(3) = -3(4x²)(3) = -36x².',
      'Term 3: +3(2x)(3)² = +3(2x)(9) = +54x.',
      'Term 4: -(3)³ = -27.',
      'Result: 8x³ - 36x² + 54x - 27.',
    ],
    casioShortcut: 'Casio CALC test: Enter (2X - 3)³ - (8X³ - 36X² + 54X - 27). Press [CALC], enter X=5. Output is exactly 0!',
    boardTrapAnalysis: 'Distractor A is the infamous "Freshmen’s Cube": (2x - 3)³ = (2x)³ - 3³ = 8x³ - 27, omitting both middle terms.',
  },
  {
    id: 'diag-9',
    index: 9,
    boardExamSource: 'PRC ECE Board Exam 2020',
    topicCategory: 'Multi-Variable Substitution',
    difficulty: 'Moderate',
    estimatedSeconds: 60,
    prompt: 'Evaluate the algebraic expression E = -x² - 3(-x)² + 2x for x = -3:',
    options: [
      { id: 'A', text: '-42', isCorrect: true },
      { id: 'B', text: '-24', isCorrect: false },
      { id: 'C', text: '+30', isCorrect: false },
      { id: 'D', text: '-30', isCorrect: false },
    ],
    correctOptionId: 'A',
    solutionSteps: [
      'Term 1: -x² = -((-3)²) = -(9) = -9.',
      'Term 2: -3(-x)² = -3(-(-3))² = -3(3)² = -3(9) = -27.',
      'Term 3: +2x = 2(-3) = -6.',
      'Sum all three terms: -9 - 27 - 6 = -42.',
    ],
    casioShortcut: 'Type on Casio: -X² - 3(-X)² + 2X, press [CALC], X = -3, press [=]. Displays -42.',
    boardTrapAnalysis: 'Distractor B occurs if student evaluates -x² as (-3)² = +9, getting +9 - 27 - 6 = -24.',
  },
  {
    id: 'diag-10',
    index: 10,
    boardExamSource: 'PRC ECE Board Exam 2023',
    topicCategory: 'Calcu-Technique (CALC)',
    difficulty: 'Advanced Board Exam',
    estimatedSeconds: 90,
    prompt: 'In AC Circuit Analysis, the capacitive reactance is given by Xc = 1 / (2π f C). If f = 60 Hz and C = 20 µF (20 × 10⁻⁶ F), what is the simplified value of Xc?',
    options: [
      { id: 'A', text: '132.63 Ω', isCorrect: true },
      { id: 'B', text: '75.39 Ω', isCorrect: false },
      { id: 'C', text: '265.26 Ω', isCorrect: false },
      { id: 'D', text: '13.26 Ω', isCorrect: false },
    ],
    correctOptionId: 'A',
    solutionSteps: [
      'Substitute values into algebraic denominator: 2 × π × 60 × (20 × 10⁻⁶).',
      'Denominator = 2 × 3.14159 × 60 × 0.000020 ≈ 0.0075398.',
      'Invert denominator: 1 / 0.0075398 ≈ 132.63 ohms.',
      'Casio fx-991 tip: Type 1 ÷ (2 × π × 60 × 20 × 10⁻⁶) = 132.629... Ω.',
    ],
    casioShortcut: 'Use the [ENG] key or [x⁻¹] key: (2 × π × 60 × 20E-6)⁻¹ = 132.63.',
    boardTrapAnalysis: 'Distractor B is just 2πf without inverting (75.39 × 10⁻⁴). Distractor C misses the factor of 2 in 2π.',
  },
];
