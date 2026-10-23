export interface EvaluationStep {
  stepNumber: number;
  expression: string;
  latexExpression?: string;
  targetSubExpression: string;
  subResult: string;
  ruleApplied: string;
  ruleCategory: 'Grouping' | 'Exponent' | 'Multiply/Divide' | 'Add/Subtract' | 'Axiom';
  explanation: string;
  boardTrapWarning?: string;
}

export interface SyntaxTreeProblem {
  id: string;
  title: string;
  category: 'Unary Minus Trap' | 'Implicit Multiplication' | 'Fraction Vinculum' | 'Nested Grouping' | 'Distributive Signs';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  initialExpression: string;
  finalAnswer: string;
  decimalEquivalent?: string;
  commonWrongAnswer: string;
  wrongAnswerReason: string;
  description: string;
  steps: EvaluationStep[];
}

export interface IllegalMoveProblem {
  id: string;
  title: string;
  initialPrompt: string;
  steps: {
    stepNumber: number;
    statement: string;
    justification: string;
    isIllegal: boolean;
  }[];
  illegalStepNumber: number;
  violatedRule: string;
  correctionText: string;
  boardExamContext: string;
}

export interface FieldAxiom {
  id: string;
  name: string;
  additionForm: string;
  multiplicationForm: string;
  definition: string;
  eceRelevance: string;
  counterexampleOrTrap: string;
}

export interface CasioComparison {
  id: string;
  conceptName: string;
  mathFormula: string;
  naiveInput: string;
  naiveResult: string;
  correctCasioInput: string;
  correctResult: string;
  explanation: string;
  modelDifferenceNote?: string;
}

export const SYNTAX_TREE_PROBLEMS: SyntaxTreeProblem[] = [
  {
    id: 'pemdas-prob-1',
    title: 'Unary Minus & Nested Brackets (Classic Board Trap)',
    category: 'Unary Minus Trap',
    difficulty: 'Hard',
    initialExpression: '-3^2 - 2[5 - (2 - 4)^3] \\div 3',
    finalAnswer: '-\\frac{53}{3}',
    decimalEquivalent: '-17.67',
    commonWrongAnswer: '+1/3 or +0.33',
    wrongAnswerReason: 'Misinterpreting -3² as (-3)² = +9, which changes the lead term sign and leads directly to distractor Option B.',
    description: 'A benchmark ECE board question testing unary negation precedence versus exponentiation and nested grouping subtraction.',
    steps: [
      {
        stepNumber: 1,
        expression: '-3^2 - 2[5 - (-2)^3] \\div 3',
        targetSubExpression: '(2 - 4)',
        subResult: '-2',
        ruleApplied: 'PEMDAS Level 1: Innermost Grouping (Parentheses)',
        ruleCategory: 'Grouping',
        explanation: 'Evaluate innermost round parentheses first: 2 - 4 = -2.',
      },
      {
        stepNumber: 2,
        expression: '-9 - 2[5 - (-8)] \\div 3',
        targetSubExpression: '(-2)^3 \\text{ and } 3^2',
        subResult: '(-2)^3 = -8, \\; -3^2 = -(9) = -9',
        ruleApplied: 'PEMDAS Level 2: Exponents & Unary Precedence',
        ruleCategory: 'Exponent',
        explanation: 'Evaluate powers: (-2)³ = -8. Critical trap: -3² means -(3²) = -9 because exponentiation has higher precedence than the unary minus negation.',
        boardTrapWarning: '-3² is NOT (-3)². It evaluates as -9, never +9.',
      },
      {
        stepNumber: 3,
        expression: '-9 - 2[13] \\div 3',
        targetSubExpression: '[5 - (-8)]',
        subResult: '5 + 8 = 13',
        ruleApplied: 'PEMDAS Level 1: Outer Grouping (Brackets)',
        ruleCategory: 'Grouping',
        explanation: 'Resolve brackets: subtracting a negative equals adding its additive inverse: 5 - (-8) = 5 + 8 = 13.',
      },
      {
        stepNumber: 4,
        expression: '-9 - 26 \\div 3',
        targetSubExpression: '2[13]',
        subResult: '26',
        ruleApplied: 'PEMDAS Level 3: Multiplication (Left-to-Right)',
        ruleCategory: 'Multiply/Divide',
        explanation: 'Perform multiplication: 2 × 13 = 26.',
      },
      {
        stepNumber: 5,
        expression: '-9 - \\frac{26}{3}',
        targetSubExpression: '26 \\div 3',
        subResult: '\\frac{26}{3}',
        ruleApplied: 'PEMDAS Level 3: Division (Left-to-Right)',
        ruleCategory: 'Multiply/Divide',
        explanation: 'Compute division: 26 ÷ 3 = 26/3.',
      },
      {
        stepNumber: 6,
        expression: '-\\frac{27}{3} - \\frac{26}{3} = -\\frac{53}{3}',
        targetSubExpression: '-9 - \\frac{26}{3}',
        subResult: '-\\frac{53}{3} \\approx -17.67',
        ruleApplied: 'PEMDAS Level 4: Addition / Subtraction',
        ruleCategory: 'Add/Subtract',
        explanation: 'Convert -9 to LCD: -27/3 - 26/3 = -53/3.',
      },
    ],
  },
  {
    id: 'pemdas-prob-2',
    title: 'The Viral Precedence Ambiguity: 6 ÷ 2(1 + 2)',
    category: 'Implicit Multiplication',
    difficulty: 'Medium',
    initialExpression: '6 \\div 2(1 + 2)',
    finalAnswer: '9',
    decimalEquivalent: '9.0',
    commonWrongAnswer: '1',
    wrongAnswerReason: 'Assuming implied multiplication 2(3) has higher precedence than division 6 ÷ 2.',
    description: 'Resolving strict modern left-to-right division vs multiplication order, and how scientific calculators parse juxtaposition.',
    steps: [
      {
        stepNumber: 1,
        expression: '6 \\div 2(3)',
        targetSubExpression: '(1 + 2)',
        subResult: '3',
        ruleApplied: 'PEMDAS Level 1: Parentheses Grouping',
        ruleCategory: 'Grouping',
        explanation: 'Evaluate the expression inside parentheses: 1 + 2 = 3.',
      },
      {
        stepNumber: 2,
        expression: '3 \\times 3',
        targetSubExpression: '6 \\div 2',
        subResult: '3',
        ruleApplied: 'PEMDAS Level 3: Left-to-Right Priority for × and ÷',
        ruleCategory: 'Multiply/Divide',
        explanation: 'Multiplication and Division have equal rank! When they appear sequentially, evaluate strictly from Left to Right: 6 ÷ 2 = 3.',
        boardTrapWarning: 'Never multiply 2 × 3 first unless written as 6 ÷ [2(1+2)].',
      },
      {
        stepNumber: 3,
        expression: '9',
        targetSubExpression: '3 \\times 3',
        subResult: '9',
        ruleApplied: 'Final Multiplication',
        ruleCategory: 'Multiply/Divide',
        explanation: 'Perform remaining multiplication: 3 × 3 = 9.',
      },
    ],
  },
  {
    id: 'pemdas-prob-3',
    title: 'Absolute Value & Alternating Negative Powers',
    category: 'Nested Grouping',
    difficulty: 'Hard',
    initialExpression: '|2 - 5 \\cdot 3| - |(-2)^3 - 4| + (-1)^{101}',
    finalAnswer: '0',
    decimalEquivalent: '0',
    commonWrongAnswer: '-2 or 26',
    wrongAnswerReason: 'Forgetting that absolute value bars act as grouping symbols, or miscalculating (-1)^101 as +1.',
    description: 'Testing absolute value as strict grouping enclosures combined with odd integer powers of -1.',
    steps: [
      {
        stepNumber: 1,
        expression: '|2 - 15| - |(-8) - 4| + (-1)^{101}',
        targetSubExpression: '5 \\cdot 3 \\text{ and } (-2)^3',
        subResult: '15 \\text{ and } -8',
        ruleApplied: 'Internal Grouping Precedence',
        ruleCategory: 'Multiply/Divide',
        explanation: 'Inside the first absolute value: 5 × 3 = 15. Inside the second: (-2)³ = -8.',
      },
      {
        stepNumber: 2,
        expression: '|-13| - |-12| + (-1)',
        targetSubExpression: '2 - 15, \\; -8 - 4, \\; (-1)^{101}',
        subResult: '-13, \\; -12, \\; -1',
        ruleApplied: 'Additive Subtraction & Exponent Evaluation',
        ruleCategory: 'Exponent',
        explanation: 'Evaluate inner additions: 2 - 15 = -13, -8 - 4 = -12. For (-1)¹⁰¹, an odd exponent leaves -1.',
      },
      {
        stepNumber: 3,
        expression: '13 - 12 - 1',
        targetSubExpression: '|-13| \\text{ and } |-12|',
        subResult: '13 \\text{ and } 12',
        ruleApplied: 'Absolute Value Definition',
        ruleCategory: 'Grouping',
        explanation: 'Absolute value strips negative signs: |-13| = 13 and |-12| = 12.',
      },
      {
        stepNumber: 4,
        expression: '0',
        targetSubExpression: '13 - 12 - 1',
        subResult: '0',
        ruleApplied: 'Left-to-Right Subtraction',
        ruleCategory: 'Add/Subtract',
        explanation: '13 - 12 = 1, then 1 - 1 = 0.',
      },
    ],
  },
  {
    id: 'pemdas-prob-4',
    title: 'Fraction Vinculum with Compound Exponents',
    category: 'Fraction Vinculum',
    difficulty: 'Medium',
    initialExpression: '\\frac{4 - 2(3 - 5)^2}{3^2 - 1}',
    finalAnswer: '-\\frac{1}{2}',
    decimalEquivalent: '-0.5',
    commonWrongAnswer: '-2/8 = -1/4 or +1',
    wrongAnswerReason: 'Multiplying 2 by (3-5) before squaring, violating Exponent before Multiplication.',
    description: 'Numerator and Denominator are separate priority groups connected by the division vinculum.',
    steps: [
      {
        stepNumber: 1,
        expression: '\\frac{4 - 2(-2)^2}{9 - 1}',
        targetSubExpression: '(3 - 5) \\text{ and } 3^2',
        subResult: '-2 \\text{ and } 9',
        ruleApplied: 'Numerator & Denominator Independence',
        ruleCategory: 'Grouping',
        explanation: 'Simplify inner terms: 3 - 5 = -2 in numerator, and 3² = 9 in denominator.',
      },
      {
        stepNumber: 2,
        expression: '\\frac{4 - 2(4)}{8}',
        targetSubExpression: '(-2)^2 \\text{ and } 9 - 1',
        subResult: '4 \\text{ and } 8',
        ruleApplied: 'Exponent Evaluation',
        ruleCategory: 'Exponent',
        explanation: 'Square -2: (-2)² = +4. Simplify denominator: 9 - 1 = 8.',
      },
      {
        stepNumber: 3,
        expression: '\\frac{4 - 8}{8}',
        targetSubExpression: '2(4)',
        subResult: '8',
        ruleApplied: 'Multiplication Precedence in Numerator',
        ruleCategory: 'Multiply/Divide',
        explanation: 'Compute 2 × 4 = 8 before subtracting.',
      },
      {
        stepNumber: 4,
        expression: '\\frac{-4}{8} = -\\frac{1}{2}',
        targetSubExpression: '4 - 8',
        subResult: '-4',
        ruleApplied: 'Final Fraction Reduction',
        ruleCategory: 'Add/Subtract',
        explanation: '4 - 8 = -4. Then reduce -4/8 = -1/2 = -0.5.',
      },
    ],
  },
];

export const ILLEGAL_MOVE_PROBLEMS: IllegalMoveProblem[] = [
  {
    id: 'illegal-1',
    title: 'The Radical Distributive Illusion',
    initialPrompt: 'Simplify the AC circuit magnitude expression: \\sqrt{R^2 + X_L^2} \\text{ where } R = 3\\,\\Omega, X_L = 4\\,\\Omega',
    steps: [
      {
        stepNumber: 1,
        statement: 'Z = \\sqrt{3^2 + 4^2}',
        justification: 'Substitute values into impedance formula',
        isIllegal: false,
      },
      {
        stepNumber: 2,
        statement: 'Z = \\sqrt{3^2} + \\sqrt{4^2}',
        justification: 'Distribute square root across addition terms',
        isIllegal: true,
      },
      {
        stepNumber: 3,
        statement: 'Z = 3 + 4 = 7\\,\\Omega',
        justification: 'Extract roots and sum',
        isIllegal: false,
      },
    ],
    illegalStepNumber: 2,
    violatedRule: 'Non-distributivity of Radicals over Addition: \\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}',
    correctionText: 'Radicals DO NOT distribute over sums! Evaluate under the radical vinculum first: \\sqrt{9 + 16} = \\sqrt{25} = 5\\,\\Omega, not 7\\,\\Omega.',
    boardExamContext: 'Very common in AC impedance, vector magnitudes, and distance formulas in ECE board exams.',
  },
  {
    id: 'illegal-2',
    title: 'The Binomial Freshmen Dream',
    initialPrompt: 'Expand and simplify: (2x - 3y)^2',
    steps: [
      {
        stepNumber: 1,
        statement: '(2x - 3y)^2 = (2x - 3y)(2x - 3y)',
        justification: 'Definition of exponentiation',
        isIllegal: false,
      },
      {
        stepNumber: 2,
        statement: '= (2x)^2 - (3y)^2',
        justification: 'Distribute exponent 2 directly to each term inside',
        isIllegal: true,
      },
      {
        stepNumber: 3,
        statement: '= 4x^2 - 9y^2',
        justification: 'Apply power of products',
        isIllegal: false,
      },
    ],
    illegalStepNumber: 2,
    violatedRule: 'Binomial Expansion Failure: (a - b)^2 = a^2 - 2ab + b^2 \\neq a^2 - b^2',
    correctionText: 'The middle cross-term -2ab was dropped! (2x - 3y)^2 = 4x^2 - 2(2x)(3y) + 9y^2 = 4x^2 - 12xy + 9y^2.',
    boardExamContext: 'Constantly appears in power calculations (P = I^2 R) and algebraic proofs.',
  },
  {
    id: 'illegal-3',
    title: 'The Negative Sign Distribution Lapse',
    initialPrompt: 'Simplify: 5x - (3x - 4) + 2(x - 5)',
    steps: [
      {
        stepNumber: 1,
        statement: '= 5x - 3x - 4 + 2x - 10',
        justification: 'Remove parentheses and distribute 2',
        isIllegal: true,
      },
      {
        stepNumber: 2,
        statement: '= (5x - 3x + 2x) + (-4 - 10)',
        justification: 'Group like terms',
        isIllegal: false,
      },
      {
        stepNumber: 3,
        statement: '= 4x - 14',
        justification: 'Combine coefficients',
        isIllegal: false,
      },
    ],
    illegalStepNumber: 1,
    violatedRule: 'Distributive Property of Negative Sign: -(a - b) = -a + b',
    correctionText: 'The minus sign must be distributed to BOTH terms: -(3x - 4) = -3x + 4. Correct expression is 5x - 3x + 4 + 2x - 10 = 4x - 6.',
    boardExamContext: 'The #1 cause of lost points in algebra during high-speed board exam solving.',
  },
  {
    id: 'illegal-4',
    title: 'Cancelling Across Addition in Rational Expressions',
    initialPrompt: 'Simplify: \\frac{6x + 9}{3x}',
    steps: [
      {
        stepNumber: 1,
        statement: '= \\frac{6x}{3x} + \\frac{9}{3x}',
        justification: 'Separate into common denominator partial fractions',
        isIllegal: false,
      },
      {
        stepNumber: 2,
        statement: '= 2 + \\frac{3}{x}',
        justification: 'Cancel common factors in each separate fraction',
        isIllegal: false,
      },
    ],
    illegalStepNumber: 0, // Used for contrast with bad variant: "\\frac{6x + 9}{3x} = 2 + 9 = 11"
    violatedRule: 'Valid Move Showcase: Terms cannot be cancelled, only factors!',
    correctionText: 'You can only cancel common factors that multiply the ENTIRE numerator and denominator. Factoring 3(2x + 3)/(3x) = (2x + 3)/x = 2 + 3/x is mathematically valid.',
    boardExamContext: 'Transfer functions in circuit analysis: H(s) = (s + 2) / (s + 4) cannot cancel "s" to get 2/4 = 1/2.',
  },
];

export const FIELD_AXIOMS: FieldAxiom[] = [
  {
    id: 'ax-closure',
    name: 'Closure Property',
    additionForm: 'a + b \\in \\mathbb{R}',
    multiplicationForm: 'a \\cdot b \\in \\mathbb{R}',
    definition: 'Performing the operation on any two real numbers always produces another real number.',
    eceRelevance: 'Guarantees stability of physical signal operations over real-valued voltages and currents.',
    counterexampleOrTrap: 'Division is NOT closed under real numbers because division by zero (a / 0) is undefined.',
  },
  {
    id: 'ax-commutative',
    name: 'Commutative Property',
    additionForm: 'a + b = b + a',
    multiplicationForm: 'a \\cdot b = b \\cdot a',
    definition: 'The order of operands does not change the resulting value.',
    eceRelevance: 'Allows rearranging components in series (R1 + R2 = R2 + R1) or parallel admittances.',
    counterexampleOrTrap: 'FAILS in Matrix Multiplication! For state-space matrices, AB \\neq BA in general.',
  },
  {
    id: 'ax-associative',
    name: 'Associative Property',
    additionForm: '(a + b) + c = a + (b + c)',
    multiplicationForm: '(ab)c = a(bc)',
    definition: 'The grouping of operands does not affect the outcome.',
    eceRelevance: 'Permits cascading filters and re-associating gain stages A1(A2·A3) = (A1·A2)A3.',
    counterexampleOrTrap: 'Floating-point computation on microcontrollers is not strictly associative due to round-off error!',
  },
  {
    id: 'ax-distributive',
    name: 'Distributive Property',
    additionForm: 'a(b + c) = ab + ac',
    multiplicationForm: '(b + c)a = ba + ca',
    definition: 'Multiplication distributes over addition/subtraction.',
    eceRelevance: 'Essential for expanding polynomial impedances and solving mesh/nodal linear systems.',
    counterexampleOrTrap: 'Powers and roots DO NOT distribute: (a + b)^n \\neq a^n + b^n and \\sqrt{a + b} \\neq \\sqrt{a} + \\sqrt{b}.',
  },
  {
    id: 'ax-identity',
    name: 'Identity Property',
    additionForm: 'a + 0 = a \\; (0 = \\text{Additive Identity})',
    multiplicationForm: 'a \\cdot 1 = a \\; (1 = \\text{Multiplicative Identity})',
    definition: 'Operating with the identity element leaves the original element unchanged.',
    eceRelevance: 'Multiplying by (1) in the form of conjugate/conjugate is used to rationalize AC complex impedances (R - jX).',
    counterexampleOrTrap: 'Zero is NOT a multiplicative identity (a · 0 = 0, not a).',
  },
  {
    id: 'ax-inverse',
    name: 'Inverse Property',
    additionForm: 'a + (-a) = 0 \\; (\\text{Additive Inverse})',
    multiplicationForm: 'a \\cdot \\frac{1}{a} = 1 \\; (a \\neq 0, \\text{Reciprocal})',
    definition: 'Every real number has an inverse that yields the corresponding identity element.',
    eceRelevance: 'Kirchhoff’s Current Law: \\sum I = 0 uses additive inverse cancellation.',
    counterexampleOrTrap: 'The number 0 has NO multiplicative inverse (1/0 is undefined).',
  },
  {
    id: 'ax-zero-product',
    name: 'Zero-Product Property',
    additionForm: 'N/A',
    multiplicationForm: '\\text{If } ab = 0, \\text{ then } a = 0 \\text{ or } b = 0',
    definition: 'A product can only be zero if at least one of its factors is zero.',
    eceRelevance: 'Foundation for solving characteristic equations to find circuit poles and resonant frequencies.',
    counterexampleOrTrap: 'Does NOT hold if the product equals any non-zero number (if ab = 6, neither a nor b must be 6).',
  },
];

export const CASIO_COMPARISONS: CasioComparison[] = [
  {
    id: 'casio-1',
    conceptName: 'Resonant Frequency Denominator Grouping',
    mathFormula: 'f_0 = \\frac{1}{2\\pi \\sqrt{LC}}',
    naiveInput: '1 / 2 * pi * sqrt(10e-3 * 100e-12)',
    naiveResult: '5032.92 Hz (Off by factor of 4π² ≈ 39.48!)',
    correctCasioInput: '1 / (2 * pi * sqrt(10e-3 * 100e-12)) OR use the [a b/c] fraction template',
    correctResult: '159.15 kHz',
    explanation: 'Without parentheses around the entire denominator, the calculator evaluates (1/2) * pi * sqrt(...) placing pi and sqrt in the numerator!',
    modelDifferenceNote: 'Always press the dedicated Fraction key [■/■] on fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) PLUS or fx-991CW to avoid ambiguous division.',
  },
  {
    id: 'casio-2',
    conceptName: 'Unary Minus vs Exponentiation',
    mathFormula: '-x^2 \\text{ when } x = 3',
    naiveInput: '(-3)^2',
    naiveResult: '+9',
    correctCasioInput: '- 3 ^ 2',
    correctResult: '-9',
    explanation: 'If the algebraic problem says -x² with x=3, typing (-3)² squares the negative sign, creating an opposite result. Use (-) 3 x².',
  },
  {
    id: 'casio-3',
    conceptName: 'Parallel Resistor Reciprocal Law',
    mathFormula: 'R_{eq} = \\frac{1}{\\frac{1}{R_1} + \\frac{1}{R_2}}',
    naiveInput: '1 / 100 + 1 / 200',
    naiveResult: '0.015 (This is 1/Req, not Req!)',
    correctCasioInput: '(100^-1 + 200^-1)^-1',
    correctResult: '66.67 Ω',
    explanation: 'Using the [x⁻¹] key twice is 3x faster than writing nested fractions on the calculator during board exam pressure.',
  },
  {
    id: 'casio-4',
    conceptName: 'Engineering Scientific Notation vs Times Ten',
    mathFormula: '10 \\times 10^{-6}',
    naiveInput: '10 * 10 ^ -6',
    naiveResult: '1e-5 (Vulnerable to grouping errors when divided)',
    correctCasioInput: '10 [×10^x] -6 (Single token)',
    correctResult: '10 µ',
    explanation: 'The [×10^x] or [EXP] key treats the coefficient and exponent as a SINGLE mathematical token with highest grouping precedence.',
  },
];
