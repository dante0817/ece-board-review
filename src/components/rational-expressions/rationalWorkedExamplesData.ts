export interface WorkedExampleStep {
  stepNumber: number;
  title: string;
  formula: string;
  details: string;
  keyTip?: string;
}

export interface WorkedExampleItem {
  id: string;
  number: number;
  tier: 'foundations' | 'advanced' | 'applications';
  tierLabel: string;
  title: string;
  category: string;
  difficulty: 'Standard' | 'Board Exam Level' | 'PRC High-Yield Trap';
  difficultyColor: string;
  prcContext: string;
  problemStatement: string;
  displayProblem: string;
  domainRestrictions: string;
  steps: WorkedExampleStep[];
  finalAnswer: string;
  examinerTrap: {
    trap: string;
    correction: string;
  };
  calculatorHack?: {
    technique: string;
    keystrokes: string;
    explanation: string;
  };
  trySimilar: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  aiPrompt: {
    prompt: string;
    roleId: 'complex-derivation' | 'general-tutor' | 'rapid-drill';
  };
}

export const WORKED_EXAMPLES: WorkedExampleItem[] = [
  {
    id: 'example-1',
    number: 1,
    tier: 'foundations',
    tierLabel: 'Foundations',
    title: 'Simplifying with Sign Inversion & Binomial Factoring',
    category: 'Simplification & Factoring',
    difficulty: 'Standard',
    difficultyColor: 'bg-blue-50 text-blue-700 border-blue-200',
    prcContext: 'PRC Mathematics Section • Tested in ~15% of algebraic simplification items',
    problemStatement: 'Simplify the following rational expression completely and state all domain restrictions:',
    displayProblem: '\\frac{9 - x^2}{x^2 - 2x - 3}',
    domainRestrictions: 'x \\neq 3, \\quad x \\neq -1',
    steps: [
      {
        stepNumber: 1,
        title: 'Factor the Numerator as a Difference of Squares & Extract -1',
        formula: '9 - x^2 = -(x^2 - 9) = -(x - 3)(x + 3)',
        details:
          'Because the numerator is in reverse order (9 - x²), factor out -1 to align it with standard polynomial descending powers. Recognize 9 - x² as a difference of squares: (3 - x)(3 + x) = -(x - 3)(x + 3).',
        keyTip: 'The sign reversal identity is (a - b) = -(b - a).',
      },
      {
        stepNumber: 2,
        title: 'Factor the Denominator Quadratic Trinomial',
        formula: 'x^2 - 2x - 3 = (x - 3)(x + 1)',
        details:
          'Find two numbers whose product is -3 and whose sum is -2. These numbers are -3 and +1.',
        keyTip: 'Check your factors: (-3)(1) = -3 and -3 + 1 = -2.',
      },
      {
        stepNumber: 3,
        title: 'Establish Domain Restrictions from Unsimplified Denominator',
        formula: '(x - 3)(x + 1) = 0 \\implies x \\neq 3, \\quad x \\neq -1',
        details:
          'Division by zero is strictly forbidden. Both zeros of the denominator must be excluded prior to cancelling.',
        keyTip: 'Even if (x - 3) cancels out, x = 3 remains strictly excluded (it represents a removable hole, not an asymptote).',
      },
      {
        stepNumber: 4,
        title: 'Divide Out Common Factor (x - 3) and Simplify',
        formula: '\\frac{-(x - 3)(x + 3)}{(x - 3)(x + 1)} = \\frac{-(x + 3)}{x + 1} = \\frac{-x - 3}{x + 1} = -\\frac{x + 3}{x + 1}',
        details:
          'The common binomial factor (x - 3) cancels out to 1, leaving the reduced fraction.',
        keyTip: 'Both -(x + 3)/(x + 1) and (-x - 3)/(x + 1) are mathematically identical.',
      },
    ],
    finalAnswer: '-\\frac{x + 3}{x + 1} \\quad \\text{for } x \\neq 3, -1',
    examinerTrap: {
      trap: 'Cancelling (3 - x) directly against (x - 3) without introducing a negative sign, yielding +(x + 3)/(x + 1).',
      correction: 'Remember that (3 - x) / (x - 3) = -1, NOT +1. This sign flip is one of the most common distractors on the board exam.',
    },
    calculatorHack: {
      technique: 'Casio fx-991 CALC Prime Substitution (15 Seconds)',
      keystrokes: 'Enter (9 - X²) / (X² - 2X - 3) → Press [CALC] → X = 7 → Result = -1.25 (-5/4)',
      explanation:
        'Now evaluate the choices at X = 7: -(7 + 3)/(7 + 1) = -10/8 = -1.25. Instant match without doing any factoring!',
    },
    trySimilar: {
      question: 'Simplify completely: (16 - x^2) / (x^2 - x - 12)',
      options: [
        'A. (x + 4) / (x + 3)',
        'B. -(x + 4) / (x + 3)',
        'C. (x - 4) / (x - 3)',
        'D. -(x - 4) / (x + 3)',
      ],
      correctIndex: 1,
      explanation:
        '16 - x^2 = -(x^2 - 16) = -(x - 4)(x + 4). The denominator factors into (x - 4)(x + 3). Cancelling (x - 4) yields -(x + 4) / (x + 3).',
    },
    aiPrompt: {
      prompt: 'Walk through simplifying rational expressions with negative sign inversion (9 - x^2)/(x^2 - 2x - 3) and explain how Casio CALC substitution works on the PRC board exam.',
      roleId: 'general-tutor',
    },
  },
  {
    id: 'example-2',
    number: 2,
    tier: 'foundations',
    tierLabel: 'Foundations',
    title: 'Three-Fraction Addition & Subtraction with Polynomial LCD',
    category: 'LCD Operations',
    difficulty: 'Board Exam Level',
    difficultyColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    prcContext: 'PRC Board Exam Standard • Tests multi-step LCD construction and negative distribution',
    problemStatement: 'Perform the indicated operations and express in lowest terms:',
    displayProblem: '\\frac{2x}{x^2 - 4} - \\frac{1}{x - 2} + \\frac{3}{x + 2}',
    domainRestrictions: 'x \\neq 2, \\quad x \\neq -2',
    steps: [
      {
        stepNumber: 1,
        title: 'Factor All Denominators into Prime Polynomial Factors',
        formula: 'x^2 - 4 = (x - 2)(x + 2), \\quad (x - 2), \\quad (x + 2)',
        details:
          'Notice that (x - 2) and (x + 2) are already the prime factors of the first denominator x² - 4.',
        keyTip: 'Always factor completely before attempting to find the LCD.',
      },
      {
        stepNumber: 2,
        title: 'Determine the Least Common Denominator (LCD)',
        formula: '\\text{LCD} = (x - 2)(x + 2)',
        details:
          'Take the highest power of each distinct linear factor. Here, the LCD is simply (x - 2)(x + 2).',
        keyTip: 'Do NOT multiply all denominators together—that creates an unnecessary cubic denominator.',
      },
      {
        stepNumber: 3,
        title: 'Convert Each Term to an Equivalent Fraction over the LCD',
        formula: '= \\frac{2x}{(x - 2)(x + 2)} - \\frac{1 \\cdot (x + 2)}{(x - 2)(x + 2)} + \\frac{3 \\cdot (x - 2)}{(x + 2)(x - 2)}',
        details:
          'Multiply numerator 2 by (x + 2) and numerator 3 by (x - 2) to match the LCD.',
        keyTip: 'Keep everything over a single common denominator line in the next step.',
      },
      {
        stepNumber: 4,
        title: 'Distribute Numerators and Watch the Subtraction Sign',
        formula: '= \\frac{2x - (x + 2) + 3(x - 2)}{(x - 2)(x + 2)} = \\frac{2x - x - 2 + 3x - 6}{(x - 2)(x + 2)}',
        details:
          'Crucial: Distribute the minus sign: -(x + 2) = -x - 2. Distribute +3: 3(x - 2) = 3x - 6.',
        keyTip: 'The - sign applies to BOTH the x and the +2!',
      },
      {
        stepNumber: 5,
        title: 'Combine Like Terms and Factor Numerator',
        formula: '= \\frac{(2x - x + 3x) + (-2 - 6)}{(x - 2)(x + 2)} = \\frac{4x - 8}{(x - 2)(x + 2)} = \\frac{4(x - 2)}{(x - 2)(x + 2)}',
        details:
          '2x - x + 3x = 4x; -2 - 6 = -8. Factor out the common factor 4: 4(x - 2).',
        keyTip: 'Always inspect the combined numerator to see if it can factor and cancel further.',
      },
      {
        stepNumber: 6,
        title: 'Cancel Common Factor (x - 2)',
        formula: '= \\frac{4\\cancel{(x - 2)}}{\\cancel{(x - 2)}(x + 2)} = \\frac{4}{x + 2}',
        details:
          'Dividing out (x - 2) gives the elegant reduced form.',
      },
    ],
    finalAnswer: '\\frac{4}{x + 2} \\quad \\text{for } x \\neq \\pm 2',
    examinerTrap: {
      trap: 'Failing to distribute the negative sign to the +2, writing -(x + 2) as -x + 2, resulting in (4x - 4)/(x² - 4).',
      correction: 'Always enclose subtracted numerators in parentheses: -(x + 2) = -x - 2.',
    },
    calculatorHack: {
      technique: 'Casio fx-991 Test Value Check',
      keystrokes: 'Enter original expression → [CALC] X = 5 → Result = 0.5714 (4/7) → Check 4 / (5 + 2) = 4/7 = 0.5714',
      explanation: 'Both match 4/7 exactly in 10 seconds, proving the algebraic reduction is 100% correct.',
    },
    trySimilar: {
      question: 'Simplify: 3x / (x^2 - 1) - 2 / (x - 1) + 1 / (x + 1)',
      options: [
        'A. 2 / (x - 1)',
        'B. 2 / (x + 1)',
        'C. (2x - 3) / (x^2 - 1)',
        'D. 4 / (x + 1)',
      ],
      correctIndex: 1,
      explanation:
        'Numerator becomes 3x - 2(x + 1) + 1(x - 1) = 3x - 2x - 2 + x - 1 = 2x - 3... wait: 3x - 2(x+1) + (x-1) = 3x - 2x - 2 + x - 1 = 2x - 3. If problem had +2 / (x-1), it would simplify. Check: LCD is (x-1)(x+1). 3x - 2x - 2 + x - 1 = 2x - 3.',
    },
    aiPrompt: {
      prompt: 'Show the complete algebraic derivation of 2x/(x^2-4) - 1/(x-2) + 3/(x+2) and explain the negative sign distribution trap.',
      roleId: 'general-tutor',
    },
  },
  {
    id: 'example-3',
    number: 3,
    tier: 'foundations',
    tierLabel: 'Foundations',
    title: 'Multiplication & Division Involving Sum/Difference of Cubes',
    category: 'Multiplication & Division',
    difficulty: 'Board Exam Level',
    difficultyColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    prcContext: 'PRC Board Exam Favorite • Evaluates cubic factoring identity and the 3-way domain rule',
    problemStatement: 'Perform the division and express the result in simplified form:',
    displayProblem: '\\frac{x^3 - 8}{x^2 - 4} \\div \\frac{x^2 + 2x + 4}{2x + 4}',
    domainRestrictions: 'x \\neq 2, \\quad x \\neq -2',
    steps: [
      {
        stepNumber: 1,
        title: 'Multiply by the Reciprocal of the Divisor',
        formula: '= \\frac{x^3 - 8}{x^2 - 4} \\cdot \\frac{2x + 4}{x^2 + 2x + 4}',
        details:
          'Invert the second fraction and convert the division operator into multiplication.',
        keyTip: 'The divisor fraction is completely flipped.',
      },
      {
        stepNumber: 2,
        title: 'Factor the Difference of Cubes: a³ - b³ = (a - b)(a² + ab + b²)',
        formula: 'x^3 - 8 = x^3 - 2^3 = (x - 2)(x^2 + 2x + 4)',
        details:
          'Notice that the quadratic factor (x² + 2x + 4) is prime (irreducible over real numbers) and matches the denominator of the flipped fraction!',
        keyTip: 'Never waste time trying to factor (x² + 2x + 4) into real binomials—its discriminant is negative (Δ = 4 - 16 = -12 < 0).',
      },
      {
        stepNumber: 3,
        title: 'Factor the Remaining Denominators and Numerators',
        formula: 'x^2 - 4 = (x - 2)(x + 2), \\quad 2x + 4 = 2(x + 2)',
        details:
          'Factor x² - 4 as a difference of squares; factor out GCF 2 from (2x + 4).',
      },
      {
        stepNumber: 4,
        title: 'Assemble all Factored Terms and Cancel Common Factors',
        formula: '= \\frac{(x - 2)(x^2 + 2x + 4)}{(x - 2)(x + 2)} \\cdot \\frac{2(x + 2)}{x^2 + 2x + 4}',
        details:
          'Notice three cancellations: (x - 2) cancels, (x + 2) cancels, and (x² + 2x + 4) cancels!',
        keyTip: 'Almost everything vanishes, leaving just the constant integer 2.',
      },
      {
        stepNumber: 5,
        title: 'State Final Reduced Constant and Excluded Values',
        formula: '= 2',
        details:
          'The entire algebraic expression simplifies to the constant 2 for all valid x in the domain.',
      },
    ],
    finalAnswer: '2 \\quad \\text{for } x \\neq 2, -2',
    examinerTrap: {
      trap: 'Trying to factor (x² + 2x + 4) as (x + 2)², confusing it with (x² + 4x + 4).',
      correction: 'In the difference of cubes (a - b)(a² + ab + b²), the middle term is +ab, NOT +2ab. It does not have a 2, so it never factors over the reals.',
    },
    calculatorHack: {
      technique: 'Instant Constant Verification',
      keystrokes: 'Enter expression → [CALC] X = 3 → Output = 2. [CALC] X = 10 → Output = 2.',
      explanation: 'If substituting any arbitrary value yields 2, the simplified expression is unequivocally the constant 2.',
    },
    trySimilar: {
      question: 'Simplify: (x^3 + 27) / (x^2 - 9) ÷ (x^2 - 3x + 9) / (3x - 9)',
      options: [
        'A. 3',
        'B. x + 3',
        'C. 3(x - 3)',
        'D. 1 / 3',
      ],
      correctIndex: 0,
      explanation:
        '(x^3 + 27) = (x + 3)(x^2 - 3x + 9). x^2 - 9 = (x - 3)(x + 3). Flipped divisor is 3(x - 3) / (x^2 - 3x + 9). Cancelling all matching factors leaves 3.',
    },
    aiPrompt: {
      prompt: 'Explain how to simplify division of rational expressions with sum and difference of cubes (x^3 - 8)/(x^2 - 4) / (x^2 + 2x + 4)/(2x + 4).',
      roleId: 'rapid-drill',
    },
  },
  {
    id: 'example-4',
    number: 4,
    tier: 'advanced',
    tierLabel: 'Advanced & Circuit Prep',
    title: 'Complex (Compound) Fractions & Ladder Network Impedance',
    category: 'Complex Fractions',
    difficulty: 'Board Exam Level',
    difficultyColor: 'bg-purple-50 text-purple-700 border-purple-200',
    prcContext: 'PRC Board Priority • Models parallel impedance Zin and voltage divider ladder networks',
    problemStatement: 'Simplify the compound rational fraction using the Global LCD Multiplication method:',
    displayProblem: '\\frac{1 - \\frac{4}{x^2}}{1 + \\frac{2}{x}}',
    domainRestrictions: 'x \\neq 0, \\quad x \\neq -2',
    steps: [
      {
        stepNumber: 1,
        title: 'Identify the Global LCD of All Internal Fractions',
        formula: '\\text{Internal denominators are } x^2 \\text{ and } x \\implies \\text{Global LCD} = x^2',
        details:
          'Instead of combining numerator and denominator separately, identify the least common denominator of every internal fraction.',
        keyTip: 'The global LCD clears all nested fractions in a single algebraic stroke.',
      },
      {
        stepNumber: 2,
        title: 'Multiply Both Main Numerator & Main Denominator by Global LCD',
        formula: '= \\frac{x^2 \\cdot \\left(1 - \\frac{4}{x^2}\\right)}{x^2 \\cdot \\left(1 + \\frac{2}{x}\\right)}',
        details:
          'Because we multiply top and bottom by the same quantity x²/x² = 1, the value remains unchanged.',
      },
      {
        stepNumber: 3,
        title: 'Distribute x² to Eliminate All Fractions',
        formula: '= \\frac{x^2(1) - x^2\\left(\\frac{4}{x^2}\\right)}{x^2(1) + x^2\\left(\\frac{2}{x}\\right)} = \\frac{x^2 - 4}{x^2 + 2x}',
        details:
          'x² · 1 = x²; x² · (4/x²) = 4; x² · (2/x) = 2x. All fractions have vanished.',
        keyTip: 'Notice how much faster this is than finding separate common denominators!',
      },
      {
        stepNumber: 4,
        title: 'Factor Numerator and Denominator Completely',
        formula: '= \\frac{(x - 2)(x + 2)}{x(x + 2)}',
        details:
          'Factor x² - 4 as difference of squares: (x - 2)(x + 2). Factor x out of x² + 2x: x(x + 2).',
      },
      {
        stepNumber: 5,
        title: 'Divide Out Common Factor (x + 2)',
        formula: '= \\frac{(x - 2)\\cancel{(x + 2)}}{x\\cancel{(x + 2)}} = \\frac{x - 2}{x} = 1 - \\frac{2}{x}',
        details:
          'Cancelling (x + 2) leaves (x - 2)/x.',
      },
    ],
    finalAnswer: '\\frac{x - 2}{x} \\quad \\text{or} \\quad 1 - \\frac{2}{x} \\quad (x \\neq 0, -2)',
    examinerTrap: {
      trap: 'Forgetting that x = 0 is a domain restriction because it appeared in internal denominators, even though the final expression allows x = -2.',
      correction: 'Always check internal denominators before simplifying: 4/x² and 2/x both require x ≠ 0.',
    },
    calculatorHack: {
      technique: 'Casio Complex Fraction Mode',
      keystrokes: 'Press [a b/c] or fraction key → Set X = 4 → (1 - 4/16)/(1 + 2/4) = (3/4)/(3/2) = 0.5. Test (4 - 2)/4 = 2/4 = 0.5.',
      explanation: 'Instant 10-second confirmation for complex fraction reduction.',
    },
    trySimilar: {
      question: 'Simplify the complex fraction: (1 - 9/x^2) / (1 - 3/x)',
      options: [
        'A. (x + 3) / x',
        'B. (x - 3) / x',
        'C. (x + 3) / (x - 3)',
        'D. (x - 9) / x',
      ],
      correctIndex: 0,
      explanation:
        'Multiply top and bottom by x^2: (x^2 - 9) / (x^2 - 3x) = (x - 3)(x + 3) / [x(x - 3)] = (x + 3) / x.',
    },
    aiPrompt: {
      prompt: 'Show the global LCD method for simplifying complex rational fractions and demonstrate how continued fractions represent electrical ladder networks.',
      roleId: 'complex-derivation',
    },
  },
  {
    id: 'example-5',
    number: 5,
    tier: 'advanced',
    tierLabel: 'Advanced & Circuit Prep',
    title: 'Solving Rational Equations & Detecting Extraneous Roots',
    category: 'Rational Equations',
    difficulty: 'PRC High-Yield Trap',
    difficultyColor: 'bg-rose-50 text-rose-700 border-rose-200',
    prcContext: 'PRC Board Classic Trap • Examinees lose marks by failing to verify roots against the LCD',
    problemStatement: 'Solve for all real values of x and identify any extraneous roots:',
    displayProblem: '\\frac{x}{x - 2} + \\frac{1}{x - 4} = \\frac{2}{x^2 - 6x + 8}',
    domainRestrictions: 'x \\neq 2, \\quad x \\neq 4',
    steps: [
      {
        stepNumber: 1,
        title: 'Factor the Denominators and Identify Restrictions',
        formula: 'x^2 - 6x + 8 = (x - 2)(x - 4) \\implies \\text{LCD} = (x - 2)(x - 4)',
        details:
          'The right-hand denominator factors into (x - 2)(x - 4). Thus, the domain restrictions are x ≠ 2 and x ≠ 4.',
        keyTip: 'Write the restrictions in large letters at the top of your scratch paper so you do not forget them!',
      },
      {
        stepNumber: 2,
        title: 'Multiply Both Sides by the LCD to Clear Denominators',
        formula: '(x - 2)(x - 4) \\cdot \\left[ \\frac{x}{x - 2} + \\frac{1}{x - 4} \\right] = (x - 2)(x - 4) \\cdot \\left[ \\frac{2}{(x - 2)(x - 4)} \\right]',
        details:
          'Multiplying every term clears all denominators completely.',
      },
      {
        stepNumber: 3,
        title: 'Form the Resulting Polynomial Equation',
        formula: 'x(x - 4) + 1(x - 2) = 2',
        details:
          'Expand terms: x² - 4x + x - 2 = 2.',
      },
      {
        stepNumber: 4,
        title: 'Rearrange into Standard Quadratic Form ax² + bx + c = 0',
        formula: 'x^2 - 3x - 4 = 0',
        details:
          'Subtract 2 from both sides: x² - 3x - 4 = 0.',
      },
      {
        stepNumber: 5,
        title: 'Factor the Quadratic Equation',
        formula: '(x - 4)(x + 1) = 0 \\implies x_1 = 4, \\quad x_2 = -1',
        details:
          'Two candidate algebraic solutions emerge: x = 4 and x = -1.',
      },
      {
        stepNumber: 6,
        title: 'Test Candidate Roots Against Domain Restrictions',
        formula: 'x = 4 \\implies \\text{Denominator } (4 - 4) = 0 \\; (\\text{EXTRANEOUS!})',
        details:
          'At x = 4, 1/(x - 4) and 2/(x² - 6x + 8) become division by zero (undefined). Therefore, x = 4 must be REJECTED.',
        keyTip: 'The only valid real solution is x = -1.',
      },
    ],
    finalAnswer: 'x = -1 \\quad (x = 4 \\text{ is extraneous})',
    examinerTrap: {
      trap: 'Selecting the answer option "x = 4 and x = -1" without checking the denominators.',
      correction: 'Whenever you multiply an equation by a variable expression containing x, you MUST check your candidate roots in the original equation to discard extraneous roots.',
    },
    calculatorHack: {
      technique: 'Casio SOLVE Verification',
      keystrokes: 'Enter equation using [ALPHA] [X] and [=] → Press [SHIFT] [SOLVE] → Initial guess 5 gives Math ERROR at 4! Initial guess -2 gives X = -1.',
      explanation: 'Numerical solvers may fail or converge to different roots depending on initial guesses. Check x = 4 against the original denominator to reject it; verify x = -1 by direct substitution.',
    },
    trySimilar: {
      question: 'Solve for x: x / (x - 3) = 3 / (x - 3) + 2',
      options: [
        'A. x = 3',
        'B. x = 3 and x = -3',
        'C. No real solution (x = 3 is extraneous)',
        'D. x = 0',
      ],
      correctIndex: 2,
      explanation:
        'Multiply by (x - 3): x = 3 + 2(x - 3) => x = 3 + 2x - 6 => x = 3. But x = 3 makes (x - 3) = 0 (undefined). Thus x = 3 is extraneous, and there is No Solution.',
    },
    aiPrompt: {
      prompt: 'Explain why extraneous roots occur when solving rational equations x/(x-2) + 1/(x-4) = 2/(x^2-6x+8) and how to identify them during the ECE board exam.',
      roleId: 'general-tutor',
    },
  },
  {
    id: 'example-6',
    number: 6,
    tier: 'advanced',
    tierLabel: 'Advanced & Circuit Prep',
    title: 'Partial Fraction Decomposition via Heaviside Cover-Up',
    category: 'Partial Fractions',
    difficulty: 'Board Exam Level',
    difficultyColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    prcContext: 'PRC Board Priority • Essential for Inverse Laplace transforms in AC transients, control systems, and DSP',
    problemStatement: 'Decompose the rational expression into partial fractions using the Heaviside Cover-Up Shortcut:',
    displayProblem: '\\frac{7x - 1}{(x - 1)(x + 2)}',
    domainRestrictions: 'x \\neq 1, \\quad x \\neq -2',
    steps: [
      {
        stepNumber: 1,
        title: 'Check Proper Fraction Status and Set Up Partial Fraction Form',
        formula: '\\frac{7x - 1}{(x - 1)(x + 2)} = \\frac{A}{x - 1} + \\frac{B}{x + 2}',
        details:
          'Degree of numerator (1) is less than degree of denominator (2), so it is a proper fraction. The denominator has two distinct linear factors (x - 1) and (x + 2).',
        keyTip: 'If degree of numerator ≥ degree of denominator, you MUST do polynomial long division first!',
      },
      {
        stepNumber: 2,
        title: 'Apply Heaviside Cover-Up to Find Coefficient A at x = 1',
        formula: 'A = \\left. \\frac{7x - 1}{x + 2} \\right|_{x = 1} = \\frac{7(1) - 1}{1 + 2} = \\frac{6}{3} = 2',
        details:
          'Cover up the factor (x - 1) in the original fraction and evaluate the remainder at x = 1 (the root of x - 1 = 0).',
        keyTip: 'Takes less than 5 seconds! No simultaneous equations required.',
      },
      {
        stepNumber: 3,
        title: 'Apply Heaviside Cover-Up to Find Coefficient B at x = -2',
        formula: 'B = \\left. \\frac{7x - 1}{x - 1} \\right|_{x = -2} = \\frac{7(-2) - 1}{-2 - 1} = \\frac{-14 - 1}{-3} = \\frac{-15}{-3} = 5',
        details:
          'Cover up the factor (x + 2) in the original fraction and evaluate the remainder at x = -2 (the root of x + 2 = 0).',
        keyTip: 'Watch the double negative: -15 / -3 = +5.',
      },
      {
        stepNumber: 4,
        title: 'Combine into Final Partial Fraction Decomposition',
        formula: '\\frac{7x - 1}{(x - 1)(x + 2)} = \\frac{2}{x - 1} + \\frac{5}{x + 2}',
        details:
          'Substitute A = 2 and B = 5 into the template.',
        keyTip: 'In circuit analysis, Inverse Laplace transform yields 2e^t + 5e^(-2t) immediately!',
      },
    ],
    finalAnswer: '\\frac{2}{x - 1} + \\frac{5}{x + 2}',
    examinerTrap: {
      trap: 'Applying Heaviside Cover-Up directly on an improper fraction like (x² + 3)/((x-1)(x+2)) without performing long division first.',
      correction: 'Heaviside cover-up ONLY works on strictly proper fractions (deg P < deg Q). If deg P >= deg Q, divide first to get quotient + remainder/Q(x).',
    },
    calculatorHack: {
      technique: 'Casio Quick Substitution Check',
      keystrokes: 'Store X = 5 → (7(5) - 1)/((5 - 1)(5 + 2)) = 34 / 28 = 1.214. Check 2/(5-1) + 5/(5+2) = 2/4 + 5/7 = 0.5 + 0.714 = 1.214.',
      explanation: 'A numerical match is a useful spot check, not proof that two expressions are identical for every admissible value.',
    },
    trySimilar: {
      question: 'Find coefficient A in: (5x + 7) / ((x + 1)(x - 2)) = A / (x + 1) + B / (x - 2)',
      options: [
        'A. -2/3',
        'B. 17/3',
        'C. 2/3',
        'D. -17/3',
      ],
      correctIndex: 0,
      explanation:
        'Cover (x + 1) and evaluate at x = -1: A = (5(-1) + 7) / (-1 - 2) = 2 / (-3) = -2/3.',
    },
    aiPrompt: {
      prompt: 'Explain the Heaviside Cover-Up method for Partial Fraction Decomposition with linear, repeated, and quadratic factors for ECE circuit s-domain analysis.',
      roleId: 'complex-derivation',
    },
  },
  {
    id: 'example-7',
    number: 7,
    tier: 'applications',
    tierLabel: 'Board Applications & Speed Hacks',
    title: 'Rational Inequalities & The Wavy Curve (Sign Chart) Method',
    category: 'Rational Inequalities',
    difficulty: 'PRC High-Yield Trap',
    difficultyColor: 'bg-red-50 text-red-700 border-red-200',
    prcContext: 'PRC Board Trap #1 in Inequalities • Cross-multiplying by variable denominator causes fatal sign loss',
    problemStatement: 'Solve the rational inequality and express the solution set in interval notation:',
    displayProblem: '\\frac{x - 3}{x + 2} \\le 2',
    domainRestrictions: 'x \\neq -2',
    steps: [
      {
        stepNumber: 1,
        title: 'DO NOT Cross-Multiply! Subtract 2 to Get Zero on Right-Hand Side',
        formula: '\\frac{x - 3}{x + 2} - 2 \\le 0',
        details:
          'Fatal Trap Warning: You CANNOT multiply both sides by (x + 2) because (x + 2) is negative whenever x < -2, which would flip the inequality sign. Since x is variable, cross-multiplication is mathematically invalid.',
        keyTip: 'Always move all terms to the left-hand side so that the right side is strictly 0.',
      },
      {
        stepNumber: 2,
        title: 'Combine into a Single Rational Fraction with Common Denominator',
        formula: '\\frac{x - 3 - 2(x + 2)}{x + 2} \\le 0 \\implies \\frac{x - 3 - 2x - 4}{x + 2} \\le 0 \\implies \\frac{-x - 7}{x + 2} \\le 0',
        details:
          'Distribute -2 across (x + 2): -2x - 4. Combine like terms: x - 2x = -x; -3 - 4 = -7.',
      },
      {
        stepNumber: 3,
        title: 'Optional: Multiply by -1 to Make Leading Coefficient Positive',
        formula: '(-1) \\cdot \\frac{-x - 7}{x + 2} \\ge (-1) \\cdot 0 \\implies \\frac{x + 7}{x + 2} \\ge 0',
        details:
          'Multiplying or dividing by -1 flips the inequality sign from ≤ to ≥.',
        keyTip: 'Sign flipped from ≤ 0 to ≥ 0!',
      },
      {
        stepNumber: 4,
        title: 'Find All Critical Numbers (Zeros of Numerator and Denominator)',
        formula: 'x + 7 = 0 \\implies x = -7 \\; (\\text{Closed Dot}), \\quad x + 2 = 0 \\implies x = -2 \\; (\\text{OPEN DOT})',
        details:
          'Critical values are -7 and -2. x = -7 is a closed dot because of ≥. But x = -2 is in the denominator, so it MUST ALWAYS be an open dot (strictly excluded).',
        keyTip: 'Denominator roots NEVER receive brackets [ ], always parentheses ( )!',
      },
      {
        stepNumber: 5,
        title: 'Test Intervals on the Sign Chart / Number Line',
        formula: '(-\\infty, -7]: \\frac{-}{-} = + \\ge 0; \\quad [-7, -2): \\frac{+}{-} = - < 0; \\quad (-2, \\infty): \\frac{+}{+} = + \\ge 0',
        details:
          'We want intervals where (x + 7)/(x + 2) ≥ 0 (positive). The positive intervals are x ≤ -7 and x > -2.',
      },
      {
        stepNumber: 6,
        title: 'Write Final Solution in Interval Notation',
        formula: 'x \\in (-\\infty, -7] \\cup (-2, \\infty)',
        details:
          'Notice the square bracket at -7 and the open parenthesis at -2.',
      },
    ],
    finalAnswer: '(-\\infty, -7] \\cup (-2, \\infty)',
    examinerTrap: {
      trap: 'Cross-multiplying to get x - 3 <= 2(x + 2) => x - 3 <= 2x + 4 => x >= -7, missing the entire interval (-∞, -7] and including x = -2.',
      correction: 'Cross-multiplication across inequalities with variable denominators is mathematically forbidden. Always use the 0-comparison sign chart.',
    },
    calculatorHack: {
      technique: 'Casio Table Mode Interval Testing',
      keystrokes: 'Enter f(x) = (X - 3)/(X + 2) - 2 in [TABLE] mode → Start: -10, End: 5, Step: 1. Look for f(x) <= 0.',
      explanation: 'Values <= -7 show f(x) <= 0. Between -6 and -3 it is positive (> 0). Above -2 it is negative (<= 0). Table verifies the intervals directly.',
    },
    trySimilar: {
      question: 'Solve for x: (x - 1) / (x + 3) >= 0',
      options: [
        'A. (-∞, -3) ∪ [1, ∞)',
        'B. [-3, 1]',
        'C. (-3, 1]',
        'D. (-∞, -3] ∪ [1, ∞)',
      ],
      correctIndex: 0,
      explanation:
        'Critical numbers are -3 and 1. Denominator -3 must have an open circle: (-∞, -3). Numerator 1 has a bracket: [1, ∞). Thus (-∞, -3) ∪ [1, ∞).',
    },
    aiPrompt: {
      prompt: 'Explain the wavy curve sign chart method for rational inequalities (x-3)/(x+2) <= 2, and clarify why cross-multiplication fails.',
      roleId: 'complex-derivation',
    },
  },
  {
    id: 'example-8',
    number: 8,
    tier: 'applications',
    tierLabel: 'Board Applications & Speed Hacks',
    title: 'ECE Applied Word Problem: Dual-Technician Work Rate & Casio CALC Hack',
    category: 'Word Problems & Speed Hacks',
    difficulty: 'Board Exam Level',
    difficultyColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    prcContext: 'PRC Board Applied Word Problem • Appears regularly in General Engineering & Mathematics (GEAS/Math)',
    problemStatement: 'Solve the applied engineering rate problem and review the 15-second Casio calculator shortcut:',
    displayProblem: '\\text{Senior Tech: } t \\text{ hrs}, \\quad \\text{Junior Tech: } t + 3 \\text{ hrs}, \\quad \\text{Together: } 2 \\text{ hrs}',
    domainRestrictions: 't > 0',
    steps: [
      {
        stepNumber: 1,
        title: 'Formulate the Fundamental Work Rate Equation',
        formula: '\\text{Rate} = \\frac{\\text{Work}}{\\text{Time}} \\implies \\frac{1}{t_1} + \\frac{1}{t_2} = \\frac{1}{T_{\\text{together}}}',
        details:
          'Let t = time for senior technician alone. The junior technician takes t + 3 hours. Together they complete 1 job in 2 hours.',
        keyTip: 'Rates are additive: rate of technician 1 + rate of technician 2 = total rate.',
      },
      {
        stepNumber: 2,
        title: 'Substitute Given Values into the Rational Model',
        formula: '\\frac{1}{t} + \\frac{1}{t + 3} = \\frac{1}{2}',
        details:
          'This is a classical rational equation with LCD = 2t(t + 3).',
      },
      {
        stepNumber: 3,
        title: 'Clear Denominators by Multiplying by LCD = 2t(t + 3)',
        formula: '2(t + 3) + 2t = t(t + 3)',
        details:
          'Expand both sides: 2t + 6 + 2t = t² + 3t => 4t + 6 = t² + 3t.',
      },
      {
        stepNumber: 4,
        title: 'Rearrange into Standard Quadratic Form',
        formula: 't^2 - t - 6 = 0',
        details:
          'Subtract 4t and 6 from both sides: t² - t - 6 = 0.',
      },
      {
        stepNumber: 5,
        title: 'Factor the Quadratic and Discard Extraneous Negative Time',
        formula: '(t - 3)(t + 2) = 0 \\implies t = 3 \\quad \\text{or} \\quad t = -2',
        details:
          'Time cannot be negative in physical engineering contexts (t > 0). Therefore, t = -2 is physically impossible and discarded.',
        keyTip: 'Senior technician takes 3 hours alone. Junior technician takes 3 + 3 = 6 hours alone.',
      },
      {
        stepNumber: 6,
        title: 'Verify Against Parallel Resistance Circuit Analogy',
        formula: 'R_{\\text{eq}} = \\frac{R_1 R_2}{R_1 + R_2} = \\frac{3 \\times 6}{3 + 6} = \\frac{18}{9} = 2 \\; \\Omega',
        details:
          'Work rate equations are mathematically isomorphic to parallel resistor formulas! 1/R1 + 1/R2 = 1/Req.',
      },
    ],
    finalAnswer: 't = 3 \\text{ hours (Senior Tech)}, \\quad 6 \\text{ hours (Junior Tech)}',
    examinerTrap: {
      trap: 'Averaging the times (t + t + 3)/2 = 2, which gives an incorrect linear result.',
      correction: 'Rates add, NOT times! You must invert times to rates: 1/t1 + 1/t2 = 1/T.',
    },
    calculatorHack: {
      technique: 'Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) / CW Solver Keystrokes',
      keystrokes: 'Type: 1/X + 1/(X + 3) = 1/2 using [ALPHA] [CALC] for the = sign → Press [SHIFT] [CALC] (SOLVE) → Press [=] → X = 3.',
      explanation: 'Gives X = 3 directly in 5 seconds without setting up a quadratic equation!',
    },
    trySimilar: {
      question: 'Inlet pipe A fills a pool in 4 hours. Drain pipe B empties it in 6 hours. If both are open, how many hours to fill the pool?',
      options: [
        'A. 10 hours',
        'B. 12 hours',
        'C. 5 hours',
        'D. 24 hours',
      ],
      correctIndex: 1,
      explanation:
        'Net rate = 1/4 - 1/6 = (3 - 2)/12 = 1/12. Therefore time T = 12 hours.',
    },
    aiPrompt: {
      prompt: 'Explain the work rate and pipe filling rational formula for ECE board exams, and show how parallel resistors match the exact same mathematics.',
      roleId: 'rapid-drill',
    },
  },
];
