export interface ConceptQuickCheck {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ConceptItem {
  id: string;
  category: 'foundations' | 'advanced' | 'applications';
  categoryLabel: string;
  number: number;
  title: string;
  tag: string;
  tagColor: string;
  eceRelevance: string;
  formula: string;
  summary: string;
  detailedPoints: string[];
  boardTrap: {
    trap: string;
    correction: string;
  };
  workedStep?: {
    problem: string;
    steps: { stepName: string; formula: string; note: string }[];
    domainNote?: string;
  };
  quickCheck: ConceptQuickCheck;
  aiPrompt: {
    prompt: string;
    roleId: 'complex-derivation' | 'general-tutor' | 'rapid-drill';
  };
}

export const RATIONAL_CONCEPTS: ConceptItem[] = [
  {
    id: 'concept-1',
    category: 'foundations',
    categoryLabel: 'Foundations',
    number: 1,
    title: 'Domain Restrictions, Poles & Excluded Values',
    tag: 'Foundational',
    tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    eceRelevance: 'PRC Board Trap #1 • Corresponds to poles in filter and transfer function stability',
    formula: 'Q(x) = 0 \\implies x \\in \\text{Excluded Values}, \\quad \\text{Domain} = \\mathbb{R} \\setminus \\{x \\mid Q(x) = 0\\}',
    summary:
      'Because division by zero is undefined in real and complex numbers, any variable values that make the denominator zero must be excluded from the domain before any algebraic cancellations occur.',
    detailedPoints: [
      'Always determine domain restrictions from the original, unsimplified denominator before cancelling factors.',
      'Differentiate between a Pole (vertical asymptote where factor remains in denominator) and a Removable Discontinuity (hole where factor cancels out). Both are strictly excluded from the domain.',
      'For compound denominators, factor into linear and quadratic irreducible factors and set each factor to zero individually.',
    ],
    boardTrap: {
      trap: 'Cancelling out a common factor such as (x - 2) / (x - 2) and assuming x = 2 is now allowed in the domain.',
      correction: 'The simplified form is only algebraically equivalent to the original for values where x ≠ 2. At x = 2, the original expression is undefined (a hole at that coordinate).',
    },
    workedStep: {
      problem: 'Find the domain of R(x) = \\frac{x^2 - 4}{x^2 - 5x + 6}',
      steps: [
        {
          stepName: 'Step 1 — Factor denominator completely',
          formula: 'x^2 - 5x + 6 = (x - 2)(x - 3)',
          note: 'Set denominator equal to zero: (x - 2)(x - 3) = 0.',
        },
        {
          stepName: 'Step 2 — Identify excluded values',
          formula: 'x = 2 \\quad \\text{and} \\quad x = 3',
          note: 'Notice (x - 2) also exists in the numerator (x^2 - 4 = (x-2)(x+2)), but x = 2 remains strictly excluded.',
        },
        {
          stepName: 'Step 3 — Write formal domain',
          formula: '\\text{Domain} = \\{x \\in \\mathbb{R} \\mid x \\neq 2, x \\neq 3\\}',
          note: 'At x = 2 there is a removable hole; at x = 3 there is a vertical asymptote (pole).',
        },
      ],
      domainNote: 'x ≠ 2, x ≠ 3',
    },
    quickCheck: {
      question: 'What are all the domain restrictions of the function f(x) = (x + 1) / (x^2 - 1)?',
      options: [
        'A. x ≠ -1 only',
        'B. x ≠ 1 only',
        'C. x ≠ -1 and x ≠ 1',
        'D. All real numbers',
      ],
      correctIndex: 2,
      explanation: 'Even though (x + 1) cancels out with the denominator (x^2 - 1 = (x-1)(x+1)), restrictions must be identified from the unsimplified denominator. Both x = -1 (hole) and x = 1 (pole) are excluded.',
    },
    aiPrompt: {
      prompt: 'Explain domain restrictions, poles, and removable holes in rational expressions for the ECE board exam. Include a PRC-style example.',
      roleId: 'general-tutor',
    },
  },
  {
    id: 'concept-2',
    category: 'foundations',
    categoryLabel: 'Foundations',
    number: 2,
    title: 'Simplifying Expressions by Factoring & Sign Reversal',
    tag: 'Core Technique',
    tagColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    eceRelevance: 'PRC Board Priority • Fundamental for simplifying impedance transfer ratios',
    formula: '\\frac{A(x) \\cdot C(x)}{B(x) \\cdot C(x)} = \\frac{A(x)}{B(x)}, \\quad \\frac{b - a}{a - b} = \\frac{-(a - b)}{a - b} = -1',
    summary:
      'To reduce a rational expression to lowest terms, factor both numerator and denominator into prime polynomial factors, divide out common multiplicative factors, and apply sign inversion when terms have opposite signs.',
    detailedPoints: [
      'Only factors (expressions joined by multiplication) can be cancelled out. Terms joined by addition or subtraction CANNOT be cancelled.',
      'Key factoring templates: GCF, Difference of Squares (a² - b² = (a-b)(a+b)), Sum/Difference of Cubes (a³ ± b³ = (a ± b)(a² ∓ ab + b²)), and quadratic trinomials.',
      'The Sign Inversion Identity: (b - a) = -(a - b). Therefore, (b - a) / (a - b) = -1. This is a favorite trick of PRC examiners.',
    ],
    boardTrap: {
      trap: 'Cancelling terms directly across a plus sign: e.g. cross-cancelling x² in (x² + 5) / (x² - 9) to get 5 / (-9).',
      correction: 'Never cancel terms across + or -! Only complete factors that multiply the entire numerator and denominator can be cancelled.',
    },
    workedStep: {
      problem: 'Simplify completely: \\frac{9 - x^2}{x^2 - 2x - 3}',
      steps: [
        {
          stepName: 'Step 1 — Factor numerator as difference of squares',
          formula: '9 - x^2 = (3 - x)(3 + x) = -(x - 3)(x + 3)',
          note: 'Factor out -1 to align with standard (x - a) form.',
        },
        {
          stepName: 'Step 2 — Factor denominator quadratic trinomial',
          formula: 'x^2 - 2x - 3 = (x - 3)(x + 1)',
          note: 'Check: (-3)(1) = -3 and -3 + 1 = -2.',
        },
        {
          stepName: 'Step 3 — Divide out common factor (x - 3)',
          formula: '\\frac{-(x - 3)(x + 3)}{(x - 3)(x + 1)} = -\\frac{x + 3}{x + 1} = \\frac{-x - 3}{x + 1}',
          note: 'Domain restrictions: x ≠ 3, x ≠ -1.',
        },
      ],
      domainNote: 'x ≠ 3, x ≠ -1',
    },
    quickCheck: {
      question: 'What is the simplified form of (4 - x^2) / (x^2 - 3x + 2)?',
      options: [
        'A. (x + 2) / (x - 1)',
        'B. -(x + 2) / (x - 1)',
        'C. (x - 2) / (x - 1)',
        'D. -(x - 2) / (x + 1)',
      ],
      correctIndex: 1,
      explanation: '4 - x^2 = -(x^2 - 4) = -(x - 2)(x + 2). The denominator factors to (x - 2)(x - 1). Cancelling (x - 2) leaves -(x + 2) / (x - 1).',
    },
    aiPrompt: {
      prompt: 'Show the step-by-step factorization and sign reversal identity for simplifying rational expressions, with common PRC exam pitfalls.',
      roleId: 'rapid-drill',
    },
  },
  {
    id: 'concept-3',
    category: 'foundations',
    categoryLabel: 'Foundations',
    number: 3,
    title: 'Multiplication & Division of Rational Expressions',
    tag: 'Core Technique',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    eceRelevance: 'Used for cascading two-port networks and gain stage multiplications',
    formula: '\\frac{P}{Q} \\div \\frac{R}{S} = \\frac{P}{Q} \\cdot \\frac{S}{R} = \\frac{P \\cdot S}{Q \\cdot R}, \\quad (Q \\neq 0, R \\neq 0, S \\neq 0)',
    summary:
      'Multiply numerators together and denominators together. For division, multiply by the reciprocal of the divisor fraction. Always factor completely before multiplying to cancel early.',
    detailedPoints: [
      'To divide two fractions, invert the divisor (the fraction following the division symbol) and multiply.',
      'The Three-Way Restriction Rule: In division P/Q ÷ R/S, excluded values come from Q(x) = 0, S(x) = 0, AND R(x) = 0, because R becomes the denominator after reciprocation.',
      'Never expand polynomials into long multiplied forms before cancelling; keep everything in factored form until the final step.',
    ],
    boardTrap: {
      trap: 'Forgetting that R(x) cannot be zero when dividing by R(x)/S(x).',
      correction: 'Because R(x) starts as a numerator and becomes a denominator upon inverting, both R(x) = 0 and S(x) = 0 generate domain restrictions.',
    },
    workedStep: {
      problem: 'Divide: \\frac{x^2 - 16}{2x + 6} \\div \\frac{x - 4}{x^2 - 9}',
      steps: [
        {
          stepName: 'Step 1 — Invert divisor and change to multiplication',
          formula: '= \\frac{x^2 - 16}{2x + 6} \\cdot \\frac{x^2 - 9}{x - 4}',
          note: 'Multiply by reciprocal.',
        },
        {
          stepName: 'Step 2 — Factor all polynomials completely',
          formula: '= \\frac{(x - 4)(x + 4)}{2(x + 3)} \\cdot \\frac{(x - 3)(x + 3)}{x - 4}',
          note: 'Notice (x - 4) and (x + 3) appear in both numerator and denominator.',
        },
        {
          stepName: 'Step 3 — Cancel common factors',
          formula: '= \\frac{(x + 4)(x - 3)}{2} = \\frac{x^2 + x - 12}{2}',
          note: 'Domain restrictions: x ≠ -3, x ≠ 4, x ≠ 3.',
        },
      ],
      domainNote: 'x ≠ -3, x ≠ 4, x ≠ 3',
    },
    quickCheck: {
      question: 'When simplifying (A/B) ÷ (C/D), which polynomials must not equal zero for the operation to be defined?',
      options: [
        'A. B only',
        'B. B and D only',
        'C. B, C, and D',
        'D. A, B, C, and D',
      ],
      correctIndex: 2,
      explanation: 'B cannot be zero (original denominator), D cannot be zero (original denominator of divisor), and C cannot be zero because after inverting it becomes a denominator in multiplication.',
    },
    aiPrompt: {
      prompt: 'Provide a rigorous derivation and worked example of rational expression division, highlighting the 3-fold excluded value rule for ECE board exams.',
      roleId: 'general-tutor',
    },
  },
  {
    id: 'concept-4',
    category: 'foundations',
    categoryLabel: 'Foundations',
    number: 4,
    title: 'Addition & Subtraction via Least Common Denominator (LCD)',
    tag: 'Board Priority',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    eceRelevance: 'PRC Board Priority • Tested in circuit nodal admittance equations',
    formula: '\\frac{A}{D_1} \\pm \\frac{B}{D_2} = \\frac{A \\cdot M_1 \\pm B \\cdot M_2}{\\text{LCD}}, \\quad \\text{LCD} = \\text{lcm}(D_1, D_2)',
    summary:
      'To add or subtract rational expressions, find the Least Common Denominator by taking the highest power of each unique prime polynomial factor, convert each fraction, and distribute negative signs carefully across the numerators.',
    detailedPoints: [
      'Factoring denominators first is non-negotiable: Never multiply denominators directly if they share common factors, or you will create unnecessary higher-degree polynomials.',
      'The LCD contains every unique factor with its greatest exponent among all denominators.',
      'Distribute the minus sign across EVERY term of the subtracted numerator: -(ax + b) = -ax - b.',
    ],
    boardTrap: {
      trap: 'Writing 3/x - (x - 1)/x as (3 - x - 1)/x = (2 - x)/x.',
      correction: 'The minus sign applies to the ENTIRE numerator: (3 - (x - 1))/x = (3 - x + 1)/x = (4 - x)/x.',
    },
    workedStep: {
      problem: 'Subtract and simplify: \\frac{3}{x - 2} - \\frac{2}{x + 1}',
      steps: [
        {
          stepName: 'Step 1 — Identify the LCD',
          formula: '\\text{LCD} = (x - 2)(x + 1)',
          note: 'Both denominators are prime linear factors.',
        },
        {
          stepName: 'Step 2 — Rewrite fractions over the LCD',
          formula: '= \\frac{3(x + 1) - 2(x - 2)}{(x - 2)(x + 1)}',
          note: 'Multiply numerator 1 by (x + 1) and numerator 2 by (x - 2).',
        },
        {
          stepName: 'Step 3 — Expand numerator and distribute -2',
          formula: '= \\frac{3x + 3 - 2x + 4}{(x - 2)(x + 1)} = \\frac{x + 7}{(x - 2)(x + 1)}',
          note: 'Notice -2 * (-2) = +4! Domain restrictions: x ≠ 2, x ≠ -1.',
        },
      ],
      domainNote: 'x ≠ 2, x ≠ -1',
    },
    quickCheck: {
      question: 'What is 5 / (x - 3) - 2 / (3 - x)?',
      options: [
        'A. 3 / (x - 3)',
        'B. 7 / (x - 3)',
        'C. 3 / (3 - x)',
        'D. 7 / (x^2 - 9)',
      ],
      correctIndex: 1,
      explanation: 'Since (3 - x) = -(x - 3), -2/(3 - x) becomes -2/(-(x - 3)) = +2/(x - 3). Therefore, 5/(x - 3) + 2/(x - 3) = 7/(x - 3).',
    },
    aiPrompt: {
      prompt: 'Demonstrate how to find the LCD of polynomial denominators with sign inversions, and explain the negative distribution trap in detail.',
      roleId: 'general-tutor',
    },
  },
  {
    id: 'concept-5',
    category: 'advanced',
    categoryLabel: 'Advanced & Circuit Prep',
    number: 5,
    title: 'Complex (Compound) Fractions & Continued Fractions',
    tag: 'Advanced Skill',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    eceRelevance: 'PRC Board Favorite • Directly models input impedance Zin of ladder networks',
    formula: '\\frac{\\frac{a}{b} + \\frac{c}{d}}{\\frac{e}{f} - \\frac{g}{h}} = \\frac{\\left(\\frac{a}{b} + \\frac{c}{d}\\right) \\cdot \\text{LCD}_{\\text{all}}}{\\left(\\frac{e}{f} - \\frac{g}{h}\\right) \\cdot \\text{LCD}_{\\text{all}}}',
    summary:
      'A complex fraction contains fractions in its numerator, denominator, or both. The fastest method for board exams is multiplying both main numerator and main denominator by the global LCD of all internal denominators in a single step.',
    detailedPoints: [
      'Method 1 (Global LCD Multiplication — Recommended): Identify the LCD of ALL internal denominators. Multiply top and bottom by this LCD to eliminate all fractions instantly.',
      'Method 2 (Consolidation): Combine numerator fractions into one, combine denominator fractions into one, then multiply by reciprocal.',
      'Continued fractions (e.g. R + 1 / (1/R + ...)): Evaluate from the bottom-most fraction upward iteratively.',
    ],
    boardTrap: {
      trap: 'Inverting only the secondary denominator fraction instead of inverting the combined denominator expression.',
      correction: 'You cannot invert until the entire denominator has been reduced to a single fraction, or simply use Method 1 (Global LCD) to avoid this trap completely.',
    },
    workedStep: {
      problem: 'Simplify: \\frac{1 - \\frac{4}{x^2}}{1 + \\frac{2}{x}}',
      steps: [
        {
          stepName: 'Step 1 — Identify global LCD of all internal fractions',
          formula: '\\text{Internal denominators are } x^2 \\text{ and } x \\implies \\text{LCD} = x^2',
          note: 'Multiply numerator and denominator by x^2.',
        },
        {
          stepName: 'Step 2 — Distribute x^2 to clear fractions',
          formula: '= \\frac{x^2 \\left(1 - \\frac{4}{x^2}\\right)}{x^2 \\left(1 + \\frac{2}{x}\\right)} = \\frac{x^2 - 4}{x^2 + 2x}',
          note: 'All internal fractions vanish in one algebraic step.',
        },
        {
          stepName: 'Step 3 — Factor and reduce',
          formula: '= \\frac{(x - 2)(x + 2)}{x(x + 2)} = \\frac{x - 2}{x}',
          note: 'Domain restrictions: x ≠ 0, x ≠ -2.',
        },
      ],
      domainNote: 'x ≠ 0, x ≠ -2',
    },
    quickCheck: {
      question: 'Simplify the continued fraction: 1 + 1 / (1 + 1 / x).',
      options: [
        'A. (2x + 1) / (x + 1)',
        'B. (x + 2) / (x + 1)',
        'C. 2x / (x + 1)',
        'D. (x + 1) / (2x + 1)',
      ],
      correctIndex: 0,
      explanation: 'First evaluate the bottom: 1 + 1/x = (x + 1)/x. Invert to get x / (x + 1). Then add 1: 1 + x/(x + 1) = (x + 1 + x)/(x + 1) = (2x + 1)/(x + 1).',
    },
    aiPrompt: {
      prompt: 'Derive the ladder network input impedance using continued fractions and demonstrate the global LCD clearing technique for complex rational expressions.',
      roleId: 'complex-derivation',
    },
  },
  {
    id: 'concept-6',
    category: 'advanced',
    categoryLabel: 'Advanced & Circuit Prep',
    number: 6,
    title: 'Solving Rational Equations & Extraneous Roots',
    tag: 'Board Priority',
    tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    eceRelevance: 'High Board Frequency • Used in resonance equations and DC circuit Ohm/Kirchhoff laws',
    formula: '\\frac{P(x)}{Q(x)} = 0 \\iff P(x) = 0 \\quad \\text{and} \\quad Q(x) \\neq 0',
    summary:
      'Clear fractions by multiplying both sides of the equation by the LCD. Solve the resulting polynomial equation, and ALWAYS substitute each candidate solution back to eliminate extraneous roots that make any denominator zero.',
    detailedPoints: [
      'Multiplying by an expression containing x can introduce roots that are solutions to the cleared equation but make an original denominator zero.',
      'An extraneous root is an algebraic solution that does not satisfy the original equation.',
      'Board Trap Warning: Examiners frequently structure questions where the ONLY algebraic root is extraneous, making the true answer "No Solution" (Ø).',
    ],
    boardTrap: {
      trap: 'Accepting x = 3 as the answer to x / (x - 3) = 3 / (x - 3) + 2 without checking denominators.',
      correction: 'Clearing denominators yields x = 3 + 2(x - 3) => x = 3 + 2x - 6 => x = 3. But substituting x = 3 gives 3/0, so x = 3 is extraneous! The true answer is "No real solution".',
    },
    workedStep: {
      problem: 'Solve for x: \\frac{x}{x - 2} + \\frac{1}{x - 4} = \\frac{2}{x^2 - 6x + 8}',
      steps: [
        {
          stepName: 'Step 1 — Factor denominators to find LCD',
          formula: 'x^2 - 6x + 8 = (x - 2)(x - 4) \\implies \\text{LCD} = (x - 2)(x - 4)',
          note: 'Restrictions: x ≠ 2, x ≠ 4.',
        },
        {
          stepName: 'Step 2 — Multiply both sides by the LCD',
          formula: 'x(x - 4) + 1(x - 2) = 2',
          note: 'All denominators clear completely.',
        },
        {
          stepName: 'Step 3 — Expand, form quadratic, and factor',
          formula: 'x^2 - 4x + x - 2 = 2 \\implies x^2 - 3x - 4 = 0 \\implies (x - 4)(x + 1) = 0',
          note: 'Candidate solutions: x = 4 or x = -1.',
        },
        {
          stepName: 'Step 4 — Check against domain restrictions',
          formula: 'x = 4 \\implies \\text{Denominator } (4 - 4) = 0 \\; (\\text{EXTRANEOUS!}) \\implies x = -1 \\; (\\text{VALID})',
          note: 'The only true solution is x = -1.',
        },
      ],
      domainNote: 'x = -1 (x = 4 is extraneous)',
    },
    quickCheck: {
      question: 'Solve for x: 2 / (x - 1) = 4 / (x^2 - 1). What is the solution set?',
      options: [
        'A. x = 1 only',
        'B. x = 1 and x = -1',
        'C. x = 1 is extraneous; No real solution',
        'D. x = 3',
      ],
      correctIndex: 0,
      explanation: '2(x + 1) = 4 => 2x + 2 = 4 => 2x = 2 => x = 1. But x = 1 makes (x - 1) and (x^2 - 1) equal to zero! Thus x = 1 is extraneous and there is No Solution.',
    },
    aiPrompt: {
      prompt: 'Walk through a classic PRC board exam rational equation where extraneous roots occur. Explain why multiplying by the LCD causes this phenomenon.',
      roleId: 'general-tutor',
    },
  },
  {
    id: 'concept-7',
    category: 'advanced',
    categoryLabel: 'Advanced & Circuit Prep',
    number: 7,
    title: 'Partial Fraction Decomposition (PFD) & Heaviside Cover-Up',
    tag: 'High-Yield ECE',
    tagColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    eceRelevance: 'PRC Board Critical • Mandatory for Inverse Laplace Transforms in AC circuit transients & ODEs',
    formula: '\\frac{P(x)}{(x-a)(x-b)} = \\frac{A}{x-a} + \\frac{B}{x-b}, \\quad A = \\lim_{x \\to a} (x - a) \\frac{P(x)}{Q(x)}',
    summary:
      'Partial Fraction Decomposition decomposes a proper rational fraction into a sum of simpler fractions. For distinct linear factors, the Heaviside Cover-Up Method computes coefficients in seconds without solving systems of equations.',
    detailedPoints: [
      'Proper Fraction Requirement: If degree of numerator ≥ degree of denominator, perform polynomial long division first!',
      'Case 1 (Distinct Linear Factors): Cover the factor (x - a) in the original fraction and evaluate at x = a to find coefficient A instantly.',
      'Case 2 (Repeated Linear Factors): (x - a)² requires terms A/(x - a) + B/(x - a)². Cover-up yields the highest power coefficient B directly.',
      'Case 3 (Irreducible Quadratic Factors): (x² + px + q) requires a linear numerator (Ax + B)/(x² + px + q).',
    ],
    boardTrap: {
      trap: 'Attempting partial fraction decomposition directly on an improper fraction without dividing first.',
      correction: 'If deg(P) >= deg(Q), you must first write P(x)/Q(x) = S(x) + R(x)/Q(x) via long division, then decompose R(x)/Q(x).',
    },
    workedStep: {
      problem: 'Decompose using Heaviside Cover-Up: \\frac{5x - 1}{(x - 1)(x + 2)}',
      steps: [
        {
          stepName: 'Step 1 — Set up partial fraction template',
          formula: '\\frac{5x - 1}{(x - 1)(x + 2)} = \\frac{A}{x - 1} + \\frac{B}{x + 2}',
          note: 'Distinct linear denominator factors.',
        },
        {
          stepName: 'Step 2 — Solve for A using Heaviside Cover-Up at x = 1',
          formula: 'A = \\left. \\frac{5x - 1}{x + 2} \\right|_{x = 1} = \\frac{5(1) - 1}{1 + 2} = \\frac{4}{3}',
          note: 'Cover (x - 1) and substitute x = 1.',
        },
        {
          stepName: 'Step 3 — Solve for B using Heaviside Cover-Up at x = -2',
          formula: 'B = \\left. \\frac{5x - 1}{x - 1} \\right|_{x = -2} = \\frac{5(-2) - 1}{-2 - 1} = \\frac{-11}{-3} = \\frac{11}{3}',
          note: 'Cover (x + 2) and substitute x = -2.',
        },
        {
          stepName: 'Step 4 — Final analytical expression',
          formula: '= \\frac{4/3}{x - 1} + \\frac{11/3}{x + 2} = \\frac{4}{3(x - 1)} + \\frac{11}{3(x + 2)}',
          note: 'Ready for instant Inverse Laplace Transform or integration.',
        },
      ],
      domainNote: 'x ≠ 1, x ≠ -2',
    },
    quickCheck: {
      question: 'Find the partial fraction coefficient A in (3x + 1) / ((x - 2)(x + 3)) = A / (x - 2) + B / (x + 3).',
      options: [
        'A. 7/5',
        'B. 8/5',
        'C. 2/5',
        'D. 1',
      ],
      correctIndex: 0,
      explanation: 'Using Heaviside Cover-Up: cover (x - 2) and evaluate at x = 2: A = (3(2) + 1) / (2 + 3) = 7 / 5.',
    },
    aiPrompt: {
      prompt: 'Show a full derivation of the Heaviside Cover-Up method for Partial Fraction Decomposition with distinct and repeated linear factors, citing ECE circuit s-domain applications.',
      roleId: 'complex-derivation',
    },
  },
  {
    id: 'concept-8',
    category: 'advanced',
    categoryLabel: 'Advanced & Circuit Prep',
    number: 8,
    title: 'Rational Inequalities & The Wavy Curve (Sign Chart) Method',
    tag: 'Examiner Trap',
    tagColor: 'bg-red-50 text-red-700 border-red-200',
    eceRelevance: 'PRC Board Trap #1 in Inequalities • Tested in cutoff and dynamic range calculations',
    formula: '\\frac{P(x)}{Q(x)} \\ge 0 \\implies \\text{Critical numbers: zeros of } P(x) \\text{ and } Q(x)',
    summary:
      'NEVER cross-multiply an inequality by an algebraic denominator containing the variable! Instead, bring all terms to one side, factor into a single fraction, determine critical zeros/poles, and use a sign chart.',
    detailedPoints: [
      'The Fatal Trap: You cannot multiply both sides of an inequality by (x - a) because if (x - a) is negative, the inequality sign must flip. Since x is unknown, cross-multiplication is invalid.',
      'Step 1: Move everything to the left side: P(x)/Q(x) ≥ 0.',
      'Step 2: Find all critical numbers (roots of numerator and roots of denominator).',
      'Step 3: Plot on a number line. Denominator roots must ALWAYS be plotted with OPEN circles (strictly excluded), even if the inequality is ≥ or ≤.',
      'Step 4: Test a value in each interval or use sign alternation based on odd/even factor multiplicities.',
    ],
    boardTrap: {
      trap: 'Cross-multiplying 1 / (x - 2) <= 3 to write 1 <= 3(x - 2).',
      correction: 'Cross-multiplying discards the sign change when x < 2. You must subtract 3 to get 1/(x - 2) - 3 <= 0 => (7 - 3x)/(x - 2) <= 0.',
    },
    workedStep: {
      problem: 'Solve the rational inequality: \\frac{x - 1}{x + 3} \\ge 0',
      steps: [
        {
          stepName: 'Step 1 — Find critical values',
          formula: 'x - 1 = 0 \\implies x = 1, \\quad x + 3 = 0 \\implies x = -3',
          note: 'Numerator zero = 1 (closed dot). Denominator pole = -3 (strictly open dot).',
        },
        {
          stepName: 'Step 2 — Divide number line into 3 intervals',
          formula: '(-\\infty, -3), \\quad (-3, 1], \\quad [1, \\infty)',
          note: 'Notice open parenthesis at -3 because denominator cannot be zero.',
        },
        {
          stepName: 'Step 3 — Test interval signs',
          formula: 'x = -4: \\frac{-}{-} = + > 0; \\quad x = 0: \\frac{-}{+} = - < 0; \\quad x = 2: \\frac{+}{+} = + > 0',
          note: 'Positive intervals satisfy >= 0.',
        },
        {
          stepName: 'Step 4 — Final solution set in interval notation',
          formula: 'x \\in (-\\infty, -3) \\cup [1, \\infty)',
          note: 'Examiners will provide options with [-3, 1] as distractors.',
        },
      ],
      domainNote: 'x ∈ (-∞, -3) ∪ [1, ∞)',
    },
    quickCheck: {
      question: 'Solve for x: (x + 2) / (x - 5) < 0.',
      options: [
        'A. (-2, 5)',
        'B. [-2, 5]',
        'C. (-∞, -2) ∪ (5, ∞)',
        'D. (-∞, -2] ∪ (5, ∞)',
      ],
      correctIndex: 0,
      explanation: 'Critical numbers are x = -2 and x = 5. Testing x = 0 gives 2/(-5) = -0.4 < 0 (negative). Thus the interval is strictly between -2 and 5: (-2, 5).',
    },
    aiPrompt: {
      prompt: 'Explain the wavy curve method for solving rational inequalities, and highlight why cross-multiplication is mathematically invalid in board exam questions.',
      roleId: 'complex-derivation',
    },
  },
  {
    id: 'concept-9',
    category: 'applications',
    categoryLabel: 'Board Applications & Speed Hacks',
    number: 9,
    title: 'Asymptotes, Removable Holes, & System Transfer Poles',
    tag: 'Syllabus Core',
    tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
    eceRelevance: 'PRC Board Priority • Directly corresponds to filter roll-off and Bode plot cutoff frequencies',
    formula: '\\text{V.A. at zeros of simplified } Q(x), \\quad \\text{H.A. depends on degree comparison}',
    summary:
      'Rational functions exhibit asymptotic behavior as x approaches infinity or points of discontinuity. Vertical asymptotes correspond to system poles, removable discontinuities correspond to holes, and horizontal asymptotes represent asymptotic steady-state limits.',
    detailedPoints: [
      'Removable Discontinuity (Hole): Occurs when (x - a) cancels from numerator and denominator. Coordinates of hole: (a, L), where L = lim_{x->a} R(x).',
      'Vertical Asymptotes (Poles): Occur at zeros of the simplified denominator where lim_{x->c} |R(x)| = ∞. In ECE circuit filters, poles determine frequency response and stability.',
      'Horizontal Asymptotes (lim x->±∞):',
      '  • deg(P) < deg(Q) => y = 0 (x-axis).',
      '  • deg(P) = deg(Q) => y = a_n / b_n (ratio of leading coefficients).',
      '  • deg(P) = deg(Q) + 1 => Slant (oblique) asymptote found via polynomial long division quotient.',
    ],
    boardTrap: {
      trap: 'Assuming every zero of the denominator creates a vertical asymptote.',
      correction: 'Zeros that cancel with identical factors in the numerator create removable holes, NOT vertical asymptotes.',
    },
    workedStep: {
      problem: 'Find all asymptotes of f(x) = \\frac{2x^2 + 3x - 5}{x^2 - 1}',
      steps: [
        {
          stepName: 'Step 1 — Factor both numerator and denominator',
          formula: 'f(x) = \\frac{(2x + 5)(x - 1)}{(x + 1)(x - 1)}',
          note: 'Notice (x - 1) cancels!',
        },
        {
          stepName: 'Step 2 — Identify removable hole at x = 1',
          formula: 'L = \\lim_{x \\to 1} \\frac{2x + 5}{x + 1} = \\frac{7}{2} = 3.5 \\implies \\text{Hole at } (1, 3.5)',
          note: 'x = 1 is NOT a vertical asymptote.',
        },
        {
          stepName: 'Step 3 — Find Vertical Asymptote from remaining denominator factor',
          formula: 'x + 1 = 0 \\implies x = -1 \\; (\\text{Vertical Asymptote})',
          note: 'x = -1 is the only vertical asymptote.',
        },
        {
          stepName: 'Step 4 — Find Horizontal Asymptote by comparing degrees',
          formula: '\\deg(P) = 2, \\; \\deg(Q) = 2 \\implies y = \\frac{2}{1} = 2 \\; (\\text{Horizontal Asymptote})',
          note: 'Ratio of leading coefficients.',
        },
      ],
      domainNote: 'V.A.: x = -1, H.A.: y = 2, Hole: (1, 3.5)',
    },
    quickCheck: {
      question: 'What is the horizontal asymptote of f(x) = (5x^2 - 3) / (2x^3 + 7)?',
      options: [
        'A. y = 5/2',
        'B. y = 0',
        'C. y = 5',
        'D. No horizontal asymptote',
      ],
      correctIndex: 1,
      explanation: 'Since the degree of the numerator (2) is strictly less than the degree of the denominator (3), the horizontal asymptote is y = 0.',
    },
    aiPrompt: {
      prompt: 'Explain how to determine vertical asymptotes, horizontal asymptotes, slant asymptotes, and removable holes of rational expressions with ECE circuit analogies.',
      roleId: 'general-tutor',
    },
  },
  {
    id: 'concept-10',
    category: 'applications',
    categoryLabel: 'Board Applications & Speed Hacks',
    number: 10,
    title: 'Board Exam Word Problems & The Casio fx-991 CALC Speed Hack',
    tag: 'Speed Hack',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    eceRelevance: 'Study-only numerical option elimination; algebraic proof still required',
    formula: '\\text{Work: } \\frac{1}{t_1} + \\frac{1}{t_2} = \\frac{1}{t_{\\text{tot}}}, \\quad \\text{Pipes: } \\frac{1}{t_{\\text{in}}} - \\frac{1}{t_{\\text{out}}} = \\frac{1}{t_{\\text{net}}}',
    summary:
      'Applied word problems in the board exam frequently reduce to rational equations. For multiple-choice algebraic simplification, a calculator substitution check can eliminate some wrong choices, but a finite set of checks does not prove algebraic identity and is not guaranteed to finish in a fixed time.',
    detailedPoints: [
      'Work & Team Rate Formula: Rate = Work / Time. Sum of individual rates equals combined rate: 1/A + 1/B = 1/T.',
      'Pipe Filling & Drainage: Inflow rate minus outflow rate equals net accumulation rate: 1/t_in - 1/t_out = 1/t_net.',
      'Uniform Motion with Current/Wind: t_total = d/(v + c) + d/(v - c), where v is speed in still medium and c is current/wind speed.',
      'Optional numerical substitution check (device-specific keys require verification):',
      '  1. In questions asking to simplify a complicated algebraic fraction, enter the original expression into your calculator.',
      '  2. Choose a valid non-singular test value and evaluate the expression with your calculator, following its own verified manual procedure.',
      '  3. Compare each candidate at the same valid value. Different results reject a choice, but matching results do not prove it correct. Confirm the surviving expression algebraically and check domains.',
    ],
    boardTrap: {
      trap: 'Picking x = 0 or x = 1 for the Casio CALC trick, where multiple choices might accidentally give the same value.',
      correction: 'Use more than one valid test input to reduce accidental agreement, then establish equivalence algebraically. Avoid every denominator zero and forbidden domain value.',
    },
    workedStep: {
      problem: 'Worker A can complete a PCB layout in 6 hours. Worker B takes 4 hours. How long will it take working together?',
      steps: [
        {
          stepName: 'Step 1 — Set up work rate equation',
          formula: '\\frac{1}{t_A} + \\frac{1}{t_B} = \\frac{1}{T} \\implies \\frac{1}{6} + \\frac{1}{4} = \\frac{1}{T}',
          note: 'Work = Rate * Time.',
        },
        {
          stepName: 'Step 2 — Combine fractions using LCD (12)',
          formula: '\\frac{2}{12} + \\frac{3}{12} = \\frac{5}{12} = \\frac{1}{T}',
          note: 'Combined rate is 5/12 of the job per hour.',
        },
        {
          stepName: 'Step 3 — Invert to solve for T',
          formula: 'T = \\frac{12}{5} = 2.4 \\text{ hours} = 2 \\text{ hours and } 24 \\text{ minutes}',
          note: '0.4 hours * 60 min/hr = 24 minutes.',
        },
      ],
      domainNote: 'T = 2.4 hours (2h 24m)',
    },
    quickCheck: {
      question: 'Pipe A fills a tank in 3 hours, and drain Pipe B empties it in 5 hours. How long to fill the tank if both are open?',
      options: [
        'A. 7.5 hours',
        'B. 4 hours',
        'C. 8 hours',
        'D. 15 hours',
      ],
      correctIndex: 0,
      explanation: 'Net rate = 1/3 - 1/5 = (5 - 3)/15 = 2/15 tank per hour. Time to fill = 15 / 2 = 7.5 hours.',
    },
    aiPrompt: {
      prompt: 'Demonstrate how to apply the Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) / fx-991CW CALC trick on rational expression simplification, and explain the rate formula for work and pipe problems.',
      roleId: 'rapid-drill',
    },
  },
];
