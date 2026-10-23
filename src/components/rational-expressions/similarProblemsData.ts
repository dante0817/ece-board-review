export interface SimilarProblemVariation {
  variationNumber: number;
  question: string;
  problemLatex?: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
  calculatorHack?: {
    technique: string;
    keystrokes: string;
    explanation: string;
  };
}

export interface SimilarProblemData {
  id: string;
  sourceType: 'mistake' | 'worked-example';
  sourceId: string | number;
  conceptTitle: string;
  subskill: string;
  category: string;
  difficulty: string;
  originalProblem: {
    statement?: string;
    problemLatex: string;
    yourAnswerLatex?: string;
    correctAnswerLatex?: string;
    whatWentWrongOrTrap: string;
    correction: string;
  };
  variations: SimilarProblemVariation[];
  aiPrompt: {
    prompt: string;
    roleId: 'complex-derivation' | 'general-tutor' | 'rapid-drill';
  };
}

export const MISTAKE_SIMILAR_PROBLEMS: Record<number, SimilarProblemData> = {
  1: {
    id: 'mistake-1-similar',
    sourceType: 'mistake',
    sourceId: 1,
    conceptTitle: 'Rational Subtraction & Sign Distribution',
    subskill: 'Addition & Subtraction',
    category: 'Sign / Algebra Error Remediation',
    difficulty: 'Board Exam Level',
    originalProblem: {
      statement: 'Simplify the expression completely:',
      problemLatex: '\\frac{x - 2}{x^2 - 4} - \\frac{3}{x + 2}',
      yourAnswerLatex: '\\frac{x - 5}{x^2 - 4}',
      correctAnswerLatex: '-\\frac{2}{x + 2}',
      whatWentWrongOrTrap:
        'The negative sign was not distributed properly, and the first fraction was not simplified before forming the LCD, resulting in an unnecessarily messy algebraic expansion.',
      correction:
        'Factor x² - 4 = (x - 2)(x + 2). Cancel (x - 2) first to get 1/(x + 2). Then 1/(x + 2) - 3/(x + 2) = (1 - 3)/(x + 2) = -2/(x + 2).',
    },
    variations: [
      {
        variationNumber: 1,
        question: 'Simplify the rational expression completely by factoring before finding the LCD:',
        problemLatex: '\\frac{x - 3}{x^2 - 9} - \\frac{2}{x + 3}',
        options: [
          '-\\frac{1}{x + 3}',
          '\\frac{x - 5}{x^2 - 9}',
          '\\frac{1}{x + 3}',
          '-\\frac{5}{x + 3}',
        ],
        correctIndex: 0,
        hint: 'Factor the difference of squares in the first denominator: x² - 9 = (x - 3)(x + 3). Cancel (x - 3) before subtracting!',
        explanation:
          'Step 1: Notice that \\frac{x - 3}{x^2 - 9} = \\frac{x - 3}{(x - 3)(x + 3)} = \\frac{1}{x + 3} for x ≠ ±3.\nStep 2: The fractions now share the exact same denominator (x + 3).\nStep 3: Combine numerators: \\frac{1 - 2}{x + 3} = -\\frac{1}{x + 3}.',
        calculatorHack: {
          technique: 'Casio CALC Substitution Check',
          keystrokes: 'Enter: (X - 3)/(X² - 9) - 2/(X + 3) → [CALC] X = 5 → Output: -0.125 (-1/8). Check -1/(5 + 3) = -1/8 = -0.125.',
          explanation: 'Both original and reduced expression yield -0.125 at X = 5 in under 10 seconds.',
        },
      },
      {
        variationNumber: 2,
        question: 'Perform the subtraction and distribute the negative sign carefully:',
        problemLatex: '\\frac{3x}{x^2 - 1} - \\frac{2}{x - 1}',
        options: [
          '\\frac{x - 2}{(x - 1)(x + 1)}',
          '\\frac{x + 2}{(x - 1)(x + 1)}',
          '\\frac{3x - 2}{x^2 - 1}',
          '\\frac{x - 2}{x - 1}',
        ],
        correctIndex: 0,
        hint: 'The LCD is (x - 1)(x + 1). Multiply 2/(x - 1) by (x + 1)/(x + 1). Carefully distribute: -(2)(x + 1) = -2x - 2.',
        explanation:
          'Step 1: LCD = (x - 1)(x + 1).\nStep 2: \\frac{3x}{(x - 1)(x + 1)} - \\frac{2(x + 1)}{(x - 1)(x + 1)} = \\frac{3x - (2x + 2)}{(x - 1)(x + 1)}.\nStep 3: Distribute the minus sign: 3x - 2x - 2 = x - 2.\nStep 4: Result is \\frac{x - 2}{(x - 1)(x + 1)}.',
        calculatorHack: {
          technique: 'Casio CALC Check',
          keystrokes: 'Enter expression → [CALC] X = 3 → 9/8 - 2/2 = 9/8 - 1 = 0.125 (1/8). Option A: (3 - 2)/((2)(4)) = 1/8 = 0.125.',
          explanation: 'Matches 1/8 instantly.',
        },
      },
    ],
    aiPrompt: {
      prompt:
        'Help me master rational expression subtraction and sign distribution: explain why factoring first makes (x - 2)/(x^2 - 4) - 3/(x + 2) simple and how to avoid sign errors on the PRC board exam.',
      roleId: 'general-tutor',
    },
  },

  2: {
    id: 'mistake-2-similar',
    sourceType: 'mistake',
    sourceId: 2,
    conceptTitle: 'Rational Equations & Extraneous Roots',
    subskill: 'Rational Equations',
    category: 'Method Error Remediation',
    difficulty: 'PRC High-Yield Trap',
    originalProblem: {
      statement: 'Solve for x and identify any extraneous roots:',
      problemLatex: '\\frac{2x}{x - 3} = \\frac{6}{x - 3} + 4',
      yourAnswerLatex: 'x = 3',
      correctAnswerLatex: '\\text{No real solution } (x = 3 \\text{ is extraneous})',
      whatWentWrongOrTrap:
        'Overlooked the domain restriction x ≠ 3. The algebraic steps produced x = 3, but substituting x = 3 back into the original denominators yields division by zero.',
      correction:
        'Always state domain restrictions before multiplying by the LCD: x - 3 ≠ 0 => x ≠ 3. Any candidate solution matching an excluded value must be discarded.',
    },
    variations: [
      {
        variationNumber: 1,
        question: 'Solve for all real values of x and test for extraneous roots:',
        problemLatex: '\\frac{x}{x - 4} = \\frac{4}{x - 4} + 3',
        options: [
          'x = 4',
          '\\text{No real solution } (x = 4 \\text{ is extraneous})',
          'x = -2',
          'x = 0',
        ],
        correctIndex: 1,
        hint: 'First note: x ≠ 4. Multiply both sides by (x - 4) to solve for x. Does your candidate solution make any denominator zero?',
        explanation:
          'Step 1: Domain restriction: x - 4 ≠ 0 => x ≠ 4.\nStep 2: Multiply both sides by (x - 4): x = 4 + 3(x - 4).\nStep 3: Expand: x = 4 + 3x - 12 => x = 3x - 8 => -2x = -8 => x = 4.\nStep 4: Check domain restriction: x = 4 causes division by zero in the original equation (4/0 is undefined).\nStep 5: Therefore, x = 4 is an extraneous root and the equation has No Real Solution.',
        calculatorHack: {
          technique: 'Casio SOLVE Error Identification',
          keystrokes: 'Enter: X/(X - 4) = 4/(X - 4) + 3 → Press [SHIFT] [CALC] (SOLVE) → Output: "Can\'t Solve" or "Math ERROR"',
          explanation: 'The calculator detects that the function never crosses the line because x = 4 is a vertical asymptote.',
        },
      },
      {
        variationNumber: 2,
        question: 'Solve the rational equation for x:',
        problemLatex: '\\frac{3x}{x - 2} = \\frac{6}{x - 2} + 1',
        options: [
          'x = 2',
          '\\text{No real solution } (x = 2 \\text{ is extraneous})',
          'x = -2',
          'x = 4',
        ],
        correctIndex: 1,
        hint: 'Multiply through by (x - 2): 3x = 6 + 1(x - 2). Solve for x, then compare with the domain restriction x ≠ 2.',
        explanation:
          'Step 1: Restriction is x ≠ 2.\nStep 2: 3x = 6 + (x - 2) => 3x = x + 4 => 2x = 4 => x = 2.\nStep 3: Since x = 2 makes the original denominators zero, x = 2 is extraneous.\nStep 4: Conclusion: No real solution.',
        calculatorHack: {
          technique: 'Direct Asymptote Test',
          keystrokes: 'Plug X = 2: 3(2)/(2 - 2) = 6/0 (Math ERROR).',
          explanation: 'Any candidate root that yields Math ERROR on your calculator must be immediately rejected.',
        },
      },
    ],
    aiPrompt: {
      prompt:
        'Explain why extraneous roots occur in rational equations like x/(x - 4) = 4/(x - 4) + 3 and how PRC board exam examinees can spot them in under 15 seconds.',
      roleId: 'general-tutor',
    },
  },
};

export const WORKED_EXAMPLE_SIMILAR_PROBLEMS: Record<string, SimilarProblemData> = {
  'example-1': {
    id: 'worked-example-1-similar',
    sourceType: 'worked-example',
    sourceId: 'example-1',
    conceptTitle: 'Simplifying with Sign Inversion & Binomial Factoring',
    subskill: 'Simplifying expressions',
    category: 'Simplification & Factoring',
    difficulty: 'Standard',
    originalProblem: {
      statement: 'Simplify completely and state all domain restrictions:',
      problemLatex: '\\frac{9 - x^2}{x^2 - 2x - 3}',
      correctAnswerLatex: '-\\frac{x + 3}{x + 1} \\quad (x \\neq 3, -1)',
      whatWentWrongOrTrap: 'Cancelling (3 - x) against (x - 3) without inserting a negative factor.',
      correction: 'Remember that (3 - x) = -(x - 3), so (3 - x)/(x - 3) = -1, NOT +1.',
    },
    variations: [
      {
        variationNumber: 1,
        question: 'Simplify completely and state domain restrictions:',
        problemLatex: '\\frac{16 - x^2}{x^2 - x - 12}',
        options: [
          '\\frac{x + 4}{x + 3}',
          '-\\frac{x + 4}{x + 3}',
          '\\frac{x - 4}{x - 3}',
          '-\\frac{x - 4}{x + 3}',
        ],
        correctIndex: 1,
        hint: 'Factor out -1 from the numerator: 16 - x² = -(x² - 16) = -(x - 4)(x + 4). Factor the denominator into (x - 4)(x + 3).',
        explanation:
          '16 - x² = -(x² - 16) = -(x - 4)(x + 4). Denominator factors as (x - 4)(x + 3). Cancelling the common factor (x - 4) leaves -\\frac{x + 4}{x + 3} for x ≠ 4, -3.',
        calculatorHack: {
          technique: 'Casio CALC Substitution',
          keystrokes: 'Enter (16 - X²)/(X² - X - 12) → [CALC] X = 5 → Output: -9/8 = -1.125. Option B: -(5 + 4)/(5 + 3) = -9/8.',
          explanation: 'Matches -1.125 in 5 seconds.',
        },
      },
      {
        variationNumber: 2,
        question: 'Simplify the rational expression:',
        problemLatex: '\\frac{25 - x^2}{x^2 - 7x + 10}',
        options: [
          '-\\frac{x + 5}{x - 2}',
          '\\frac{x + 5}{x - 2}',
          '-\\frac{x - 5}{x - 2}',
          '\\frac{x - 5}{x + 2}',
        ],
        correctIndex: 0,
        hint: '25 - x² = -(x - 5)(x + 5). Denominator: (x - 5)(x - 2).',
        explanation:
          'Factor numerator: -(x² - 25) = -(x - 5)(x + 5). Denominator: (x - 5)(x - 2). Cancel (x - 5) to get -\\frac{x + 5}{x - 2}.',
      },
    ],
    aiPrompt: {
      prompt: 'Walk through sign inversion factoring for (16 - x^2)/(x^2 - x - 12) and explain the -1 factor rule.',
      roleId: 'general-tutor',
    },
  },

  'example-2': {
    id: 'worked-example-2-similar',
    sourceType: 'worked-example',
    sourceId: 'example-2',
    conceptTitle: 'Three-Fraction Addition & Subtraction with Polynomial LCD',
    subskill: 'Addition & Subtraction',
    category: 'LCD Operations',
    difficulty: 'Board Exam Level',
    originalProblem: {
      statement: 'Perform the indicated operations and express in lowest terms:',
      problemLatex: '\\frac{2x}{x^2 - 4} - \\frac{1}{x - 2} + \\frac{3}{x + 2}',
      correctAnswerLatex: '\\frac{4}{x + 2} \\quad (x \\neq \\pm 2)',
      whatWentWrongOrTrap: 'Failing to distribute the negative sign: -(x + 2) = -x - 2.',
      correction: 'Always enclose subtracted numerators in parentheses: -(x + 2) = -x - 2.',
    },
    variations: [
      {
        variationNumber: 1,
        question: 'Perform the operations and simplify:',
        problemLatex: '\\frac{3x}{x^2 - 1} - \\frac{2}{x - 1} + \\frac{1}{x + 1}',
        options: [
          '\\frac{2}{x - 1}',
          '\\frac{2x - 3}{(x - 1)(x + 1)}',
          '\\frac{2}{x + 1}',
          '\\frac{4}{x + 1}',
        ],
        correctIndex: 1,
        hint: 'The LCD is (x - 1)(x + 1). The numerator becomes 3x - 2(x + 1) + 1(x - 1). Expand carefully: 3x - 2x - 2 + x - 1.',
        explanation:
          'Numerator = 3x - 2(x + 1) + 1(x - 1) = 3x - 2x - 2 + x - 1 = (3x - 2x + x) + (-2 - 1) = 2x - 3. Over LCD (x - 1)(x + 1), the simplified fraction is \\frac{2x - 3}{(x - 1)(x + 1)}.',
        calculatorHack: {
          technique: 'Casio CALC Check',
          keystrokes: 'Enter expression → [CALC] X = 3 → 9/8 - 2/2 + 1/4 = 9/8 - 1 + 1/4 = 3/8 (0.375). Option B: (2(3) - 3)/(8) = 3/8.',
          explanation: 'Instant 10-second verification.',
        },
      },
      {
        variationNumber: 2,
        question: 'Simplify the multi-term expression:',
        problemLatex: '\\frac{x}{x^2 - 9} + \\frac{2}{x + 3} - \\frac{1}{x - 3}',
        options: [
          '\\frac{2x - 9}{(x - 3)(x + 3)}',
          '\\frac{2}{x + 3}',
          '\\frac{2x + 9}{(x - 3)(x + 3)}',
          '\\frac{x}{x - 3}',
        ],
        correctIndex: 0,
        hint: 'LCD is (x - 3)(x + 3). Numerator = x + 2(x - 3) - 1(x + 3). Distribute: x + 2x - 6 - x - 3 = 2x - 9.',
        explanation:
          'Numerator = x + 2(x - 3) - (x + 3) = x + 2x - 6 - x - 3 = 2x - 9. Over LCD (x - 3)(x + 3), we have \\frac{2x - 9}{(x - 3)(x + 3)}.',
      },
    ],
    aiPrompt: {
      prompt: 'Show step-by-step LCD construction for multi-fraction addition and subtraction with polynomial denominators.',
      roleId: 'general-tutor',
    },
  },

  'example-3': {
    id: 'worked-example-3-similar',
    sourceType: 'worked-example',
    sourceId: 'example-3',
    conceptTitle: 'Multiplication & Division with Sum/Difference of Cubes',
    subskill: 'Multiplication & division',
    category: 'Multiplication & Division',
    difficulty: 'Board Exam Level',
    originalProblem: {
      statement: 'Perform the division and express in simplified form:',
      problemLatex: '\\frac{x^3 - 8}{x^2 - 4} \\div \\frac{x^2 + 2x + 4}{2x + 4}',
      correctAnswerLatex: '2 \\quad (x \\neq \\pm 2)',
      whatWentWrongOrTrap: 'Trying to factor the prime cubic quadratic (x² + 2x + 4).',
      correction: 'In a³ - b³ = (a - b)(a² + ab + b²), the quadratic factor has discriminant < 0 and never factors over real numbers.',
    },
    variations: [
      {
        variationNumber: 1,
        question: 'Perform the division and simplify completely:',
        problemLatex: '\\frac{x^3 + 27}{x^2 - 9} \\div \\frac{x^2 - 3x + 9}{3x - 9}',
        options: [
          '3',
          'x + 3',
          '3(x - 3)',
          '\\frac{1}{3}',
        ],
        correctIndex: 0,
        hint: 'Factor the sum of cubes: x³ + 27 = (x + 3)(x² - 3x + 9). Invert the second fraction: 3(x - 3)/(x² - 3x + 9).',
        explanation:
          'Step 1: Multiply by reciprocal: \\frac{(x + 3)(x^2 - 3x + 9)}{(x - 3)(x + 3)} \\cdot \\frac{3(x - 3)}{x^2 - 3x + 9}.\nStep 2: Cancel (x + 3), (x - 3), and (x² - 3x + 9).\nStep 3: Only the constant integer 3 remains!',
        calculatorHack: {
          technique: 'Instant Constant Verification',
          keystrokes: 'Enter expression → [CALC] X = 4 → Output = 3. [CALC] X = 10 → Output = 3.',
          explanation: 'Any arbitrary substitution immediately produces 3.',
        },
      },
      {
        variationNumber: 2,
        question: 'Simplify the algebraic division:',
        problemLatex: '\\frac{x^3 - 1}{x^2 - 1} \\div \\frac{x^2 + x + 1}{4x + 4}',
        options: [
          '4',
          '\\frac{1}{4}',
          '4(x - 1)',
          'x + 1',
        ],
        correctIndex: 0,
        hint: 'x³ - 1 = (x - 1)(x² + x + 1). Inverted divisor is 4(x + 1)/(x² + x + 1).',
        explanation:
          '\\frac{(x - 1)(x^2 + x + 1)}{(x - 1)(x + 1)} \\cdot \\frac{4(x + 1)}{x^2 + x + 1} = 4.',
      },
    ],
    aiPrompt: {
      prompt: 'Explain how to divide rational expressions containing sum and difference of cubes.',
      roleId: 'rapid-drill',
    },
  },

  'example-4': {
    id: 'worked-example-4-similar',
    sourceType: 'worked-example',
    sourceId: 'example-4',
    conceptTitle: 'Complex Fractions & Ladder Network Impedance',
    subskill: 'Complex rational expressions',
    category: 'Complex Fractions',
    difficulty: 'Board Exam Level',
    originalProblem: {
      statement: 'Simplify using the Global LCD method:',
      problemLatex: '\\frac{1 - \\frac{4}{x^2}}{1 + \\frac{2}{x}}',
      correctAnswerLatex: '\\frac{x - 2}{x} \\quad (x \\neq 0, -2)',
      whatWentWrongOrTrap: 'Forgetting internal denominator restrictions like x ≠ 0.',
      correction: 'Any denominator inside compound fractions must be included in the domain restrictions.',
    },
    variations: [
      {
        variationNumber: 1,
        question: 'Simplify the compound fraction completely:',
        problemLatex: '\\frac{1 - \\frac{9}{x^2}}{1 - \\frac{3}{x}}',
        options: [
          '\\frac{x + 3}{x}',
          '\\frac{x - 3}{x}',
          '\\frac{x + 3}{x - 3}',
          '\\frac{x - 9}{x}',
        ],
        correctIndex: 0,
        hint: 'Multiply numerator and denominator by the global LCD = x²: (x² - 9)/(x² - 3x).',
        explanation:
          'Multiply top and bottom by x²: \\frac{x^2(1 - 9/x^2)}{x^2(1 - 3/x)} = \\frac{x^2 - 9}{x^2 - 3x} = \\frac{(x - 3)(x + 3)}{x(x - 3)} = \\frac{x + 3}{x}.',
        calculatorHack: {
          technique: 'Casio Fraction Mode Evaluation',
          keystrokes: 'Enter with X = 4: (1 - 9/16)/(1 - 3/4) = (7/16)/(1/4) = 7/4 = 1.75. Option A: (4 + 3)/4 = 7/4 = 1.75.',
          explanation: 'Matches 7/4 directly.',
        },
      },
      {
        variationNumber: 2,
        question: 'Simplify the complex rational expression:',
        problemLatex: '\\frac{\\frac{1}{x} + \\frac{1}{y}}{\\frac{1}{x^2} - \\frac{1}{y^2}}',
        options: [
          '\\frac{xy}{y - x}',
          '\\frac{xy}{x - y}',
          '\\frac{1}{y - x}',
          '\\frac{y + x}{xy}',
        ],
        correctIndex: 0,
        hint: 'Multiply top and bottom by x²y²: xy(y + x) / (y² - x²). Factor difference of squares: (y - x)(y + x).',
        explanation:
          'Global LCD = x²y². Top becomes xy(y + x). Bottom becomes y² - x² = (y - x)(y + x). Cancelling (y + x) gives \\frac{xy}{y - x}.',
      },
    ],
    aiPrompt: {
      prompt: 'Explain the Global LCD shortcut for compound rational expressions and how it applies to electrical parallel circuits.',
      roleId: 'complex-derivation',
    },
  },

  'example-5': {
    id: 'worked-example-5-similar',
    sourceType: 'worked-example',
    sourceId: 'example-5',
    conceptTitle: 'Solving Rational Equations & Detecting Extraneous Roots',
    subskill: 'Rational Equations',
    category: 'Rational Equations',
    difficulty: 'PRC High-Yield Trap',
    originalProblem: {
      statement: 'Solve for x and identify extraneous roots:',
      problemLatex: '\\frac{x}{x - 2} + \\frac{1}{x - 4} = \\frac{2}{x^2 - 6x + 8}',
      correctAnswerLatex: 'x = -1 \\quad (x = 4 \\text{ is extraneous})',
      whatWentWrongOrTrap: 'Selecting candidate roots without testing against denominators.',
      correction: 'Substitute roots back into the LCD to ensure no division by zero occurs.',
    },
    variations: [
      {
        variationNumber: 1,
        question: 'Solve for x and eliminate extraneous roots:',
        problemLatex: '\\frac{x}{x - 3} = \\frac{3}{x - 3} + 2',
        options: [
          'x = 3',
          'x = 3 \\text{ and } x = -3',
          '\\text{No real solution } (x = 3 \\text{ is extraneous})',
          'x = 0',
        ],
        correctIndex: 2,
        hint: 'Domain is x ≠ 3. Multiply both sides by (x - 3): x = 3 + 2(x - 3). Solve for x and verify against x ≠ 3.',
        explanation:
          'x = 3 + 2(x - 3) => x = 3 + 2x - 6 => x = 2x - 3 => -x = -3 => x = 3. But x = 3 makes (x - 3) = 0 (undefined). Thus x = 3 is extraneous and there is No Real Solution.',
        calculatorHack: {
          technique: 'Casio SOLVE Verification',
          keystrokes: 'Enter equation using [ALPHA] [CALC] for =. Press [SHIFT] [CALC] (SOLVE). Notice error at X = 3.',
          explanation: 'Confirms no solution exists.',
        },
      },
      {
        variationNumber: 2,
        question: 'Solve for x:',
        problemLatex: '\\frac{2}{x - 1} = \\frac{x + 1}{x - 1}',
        options: [
          'x = 1',
          '\\text{No real solution } (x = 1 \\text{ is extraneous})',
          'x = 2',
          'x = 0',
        ],
        correctIndex: 1,
        hint: '2 = x + 1 => x = 1. But x ≠ 1!',
        explanation:
          'Multiplying by (x - 1) gives 2 = x + 1 => x = 1. But at x = 1, denominators equal zero. Extraneous root => No Real Solution.',
      },
    ],
    aiPrompt: {
      prompt: 'Explain extraneous roots in rational equations and how to avoid them during time-pressured board exams.',
      roleId: 'general-tutor',
    },
  },

  'example-6': {
    id: 'worked-example-6-similar',
    sourceType: 'worked-example',
    sourceId: 'example-6',
    conceptTitle: 'Partial Fraction Decomposition via Heaviside Cover-Up',
    subskill: 'Simplifying expressions',
    category: 'Partial Fractions',
    difficulty: 'Board Exam Level',
    originalProblem: {
      statement: 'Decompose into partial fractions using the Cover-Up method:',
      problemLatex: '\\frac{7x - 1}{(x - 1)(x + 2)}',
      correctAnswerLatex: '\\frac{2}{x - 1} + \\frac{5}{x + 2}',
      whatWentWrongOrTrap: 'Using cover-up on improper fractions before dividing.',
      correction: 'Heaviside cover-up requires degree of numerator < degree of denominator.',
    },
    variations: [
      {
        variationNumber: 1,
        question: 'Find coefficient A in the partial fraction decomposition:',
        problemLatex: '\\frac{5x + 7}{(x + 1)(x - 2)} = \\frac{A}{x + 1} + \\frac{B}{x - 2}',
        options: [
          'A = -\\frac{2}{3}',
          'A = \\frac{17}{3}',
          'A = \\frac{2}{3}',
          'A = -\\frac{17}{3}',
        ],
        correctIndex: 0,
        hint: 'Cover up (x + 1) in the original fraction and evaluate at x = -1: A = (5(-1) + 7) / (-1 - 2).',
        explanation:
          'By the Heaviside Cover-Up method: A = \\left.\\frac{5x + 7}{x - 2}\\right|_{x = -1} = \\frac{-5 + 7}{-1 - 2} = \\frac{2}{-3} = -\\frac{2}{3}.',
        calculatorHack: {
          technique: 'Casio Quick Substitution Check',
          keystrokes: 'Store X = -1: (5X + 7)/(X - 2) = (-5 + 7)/(-3) = -2/3.',
          explanation: 'Computes coefficient in under 3 seconds.',
        },
      },
      {
        variationNumber: 2,
        question: 'Find coefficient B in the partial fraction decomposition:',
        problemLatex: '\\frac{3x + 1}{(x - 2)(x + 3)} = \\frac{A}{x - 2} + \\frac{B}{x + 3}',
        options: [
          'B = \\frac{8}{5}',
          'B = -\\frac{8}{5}',
          'B = \\frac{7}{5}',
          'B = 2',
        ],
        correctIndex: 0,
        hint: 'Cover up (x + 3) and evaluate at x = -3: (3(-3) + 1) / (-3 - 2).',
        explanation:
          'B = \\left.\\frac{3x + 1}{x - 2}\\right|_{x = -3} = \\frac{-9 + 1}{-3 - 2} = \\frac{-8}{-5} = \\frac{8}{5}.',
      },
    ],
    aiPrompt: {
      prompt: 'Explain the Heaviside Cover-Up method for partial fraction decomposition in Laplace s-domain circuit analysis.',
      roleId: 'complex-derivation',
    },
  },

  'example-7': {
    id: 'worked-example-7-similar',
    sourceType: 'worked-example',
    sourceId: 'example-7',
    conceptTitle: 'Rational Inequalities & The Wavy Curve Method',
    subskill: 'Rational Equations',
    category: 'Rational Inequalities',
    difficulty: 'PRC High-Yield Trap',
    originalProblem: {
      statement: 'Solve the rational inequality in interval notation:',
      problemLatex: '\\frac{x - 3}{x + 2} \\le 2',
      correctAnswerLatex: '(-\\infty, -7] \\cup (-2, \\infty)',
      whatWentWrongOrTrap: 'Cross-multiplying by variable denominator (x + 2).',
      correction: 'Never cross-multiply across inequalities when denominators contain variables. Move 2 to the left side.',
    },
    variations: [
      {
        variationNumber: 1,
        question: 'Solve the rational inequality for all real values of x:',
        problemLatex: '\\frac{x - 1}{x + 3} \\ge 0',
        options: [
          '(-\\infty, -3) \\cup [1, \\infty)',
          '[-3, 1]',
          '(-3, 1]',
          '(-\\infty, -3] \\cup [1, \\infty)',
        ],
        correctIndex: 0,
        hint: 'Critical numbers are -3 and 1. Remember: the denominator root x = -3 CANNOT have a square bracket (strictly excluded!).',
        explanation:
          'Zeros: numerator x = 1, denominator x = -3.\nTest intervals: (-\u221e, -3) -> (-)/(-) = + (valid); (-3, 1) -> (-)/(+) = -; (1, \u221e) -> (+)/(+) = + (valid).\nx = 1 has bracket [1, \u221e) because of \u2265 0. x = -3 has parenthesis (-\u221e, -3) because denominator \u2260 0. Result: (-\u221e, -3) \u222a [1, \u221e).',
        calculatorHack: {
          technique: 'Casio Table Mode Testing',
          keystrokes: 'Enter f(x) = (X - 1)/(X + 3) in [TABLE] mode → Test X = -4 gives 5 > 0; X = 0 gives -1/3 < 0; X = 2 gives 1/5 > 0.',
          explanation: 'Directly checks sign on each interval.',
        },
      },
      {
        variationNumber: 2,
        question: 'Solve the rational inequality:',
        problemLatex: '\\frac{x + 2}{x - 5} < 0',
        options: [
          '(-2, 5)',
          '[-2, 5)',
          '(-\\infty, -2) \\cup (5, \\infty)',
          '(-2, 5]',
        ],
        correctIndex: 0,
        hint: 'Critical numbers are -2 and 5. The fraction is negative when numerator and denominator have opposite signs.',
        explanation:
          'Numerator zero is -2, denominator zero is 5. For x between -2 and 5 (e.g. x = 0): (0 + 2)/(0 - 5) = -2/5 < 0. Both endpoints are strictly open because inequality is strict (< 0). Solution is (-2, 5).',
      },
    ],
    aiPrompt: {
      prompt: 'Explain the sign chart and wavy curve method for rational inequalities without cross-multiplying.',
      roleId: 'complex-derivation',
    },
  },

  'example-8': {
    id: 'worked-example-8-similar',
    sourceType: 'worked-example',
    sourceId: 'example-8',
    conceptTitle: 'ECE Applied Word Problem: Dual-Technician Work Rate',
    subskill: 'Rational Equations',
    category: 'Word Problems & Speed Hacks',
    difficulty: 'Board Exam Level',
    originalProblem: {
      statement: 'Solve the applied rate problem:',
      problemLatex: '\\text{Senior: } t \\text{ hrs}, \\quad \\text{Junior: } t + 3 \\text{ hrs}, \\quad \\text{Together: } 2 \\text{ hrs}',
      correctAnswerLatex: 't = 3 \\text{ hrs (Senior)}, \\quad 6 \\text{ hrs (Junior)}',
      whatWentWrongOrTrap: 'Averaging times instead of adding rates: 1/t1 + 1/t2 = 1/T.',
      correction: 'Work rate formula is 1/t1 + 1/t2 = 1/T, exactly like parallel resistors 1/R1 + 1/R2 = 1/Req.',
    },
    variations: [
      {
        variationNumber: 1,
        question: 'Inlet pipe A fills a reservoir in 4 hours. Drain pipe B empties it in 6 hours. If both pipes are opened together, how many hours will it take to fill the reservoir?',
        problemLatex: '\\frac{1}{4} - \\frac{1}{6} = \\frac{1}{T}',
        options: [
          '10 hours',
          '12 hours',
          '5 hours',
          '24 hours',
        ],
        correctIndex: 1,
        hint: 'Net filling rate = Rate of pipe A - Rate of pipe B = 1/4 - 1/6.',
        explanation:
          'Net rate = 1/4 - 1/6 = (3 - 2)/12 = 1/12 of the reservoir per hour.\nTime T = 1 / (1/12) = 12 hours.',
        calculatorHack: {
          technique: 'Casio Direct Inversion Shortcut',
          keystrokes: 'Type: (4⁻¹ - 6⁻¹)⁻¹ → Press [=] → Output = 12.',
          explanation: 'Using the [x⁻¹] key solves work rate and parallel resistor problems in 3 seconds flat.',
        },
      },
      {
        variationNumber: 2,
        question: 'Two antennas transfer data to a satellite. Antenna A takes 3 hours alone. Together with Antenna B, they finish in 2 hours. How long does Antenna B take alone?',
        problemLatex: '\\frac{1}{3} + \\frac{1}{T_B} = \\frac{1}{2}',
        options: [
          '6 hours',
          '5 hours',
          '4 hours',
          '1.5 hours',
        ],
        correctIndex: 0,
        hint: '1/TB = 1/2 - 1/3 = (3 - 2)/6 = 1/6.',
        explanation:
          '1/TB = 1/2 - 1/3 = (3 - 2)/6 = 1/6 => TB = 6 hours alone. Check parallel formula: (3 * 6)/(3 + 6) = 18/9 = 2 hours.',
      },
    ],
    aiPrompt: {
      prompt: 'Explain the work rate rational equation and show how parallel resistors match the exact same formula on the ECE board exam.',
      roleId: 'rapid-drill',
    },
  },
};
