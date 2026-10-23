export type QuestionDifficulty = 'Basic' | 'Intermediate' | 'Board-Level';

export interface PracticeQuestion {
  id: number;
  subskill: string;
  difficulty: QuestionDifficulty;
  question: string;
  options: string[];
  correctIndex: number;
  hints: string[]; // Progressive hints
  explanation: string;
  trapWarning?: string; // What common misconception leads to wrong answers
  calculatorHack?: string; // Casio fx-991 verification tip
}

export const PRACTICE_QUESTIONS_BANK: PracticeQuestion[] = [
  // 1. Domain Restrictions
  {
    id: 101,
    subskill: 'Domain restrictions',
    difficulty: 'Basic',
    question: 'Find all excluded values (restrictions on $x$) for: $$\\frac{3x - 1}{2x - 8}$$',
    options: ['x = 4', 'x = \\frac{1}{3}', 'x = -4', 'x = 0'],
    correctIndex: 0,
    hints: [
      'Excluded values come solely from making the denominator zero: $2x - 8 = 0$.',
      'Solve $2x = 8 \\implies x = 4$.',
    ],
    explanation:
      'Set denominator $2x - 8 = 0 \\implies 2x = 8 \\implies x = 4$. The numerator root $x = 1/3$ does not cause division by zero.',
    trapWarning: 'Never set the numerator to 0 for domain restrictions; only denominators cause undefined division by zero.',
    calculatorHack: 'Casio fx-991: Type `(3X - 1)/(2X - 8)` and press CALC, enter `4`. The calculator displays `Math ERROR`, proving $x = 4$ is undefined.',
  },
  {
    id: 102,
    subskill: 'Domain restrictions',
    difficulty: 'Intermediate',
    question: 'Determine the domain of: $$\\frac{x + 5}{x^2 - 16}$$',
    options: [
      '\\{x \\in \\mathbb{R} \\mid x \\neq 4, -4\\}',
      '\\{x \\in \\mathbb{R} \\mid x \\neq -5\\}',
      '\\{x \\in \\mathbb{R} \\mid x \\neq 16\\}',
      '\\{x \\in \\mathbb{R} \\mid x \\neq 4\\}',
    ],
    correctIndex: 0,
    hints: [
      'Factor denominator as a difference of two squares: $x^2 - 16 = (x - 4)(x + 4)$.',
      'Set each factor to zero to find the restricted values.',
    ],
    explanation:
      'The denominator factors as $(x - 4)(x + 4) = 0 \\implies x = 4$ and $x = -4$. Thus, the domain is all real numbers except $x = 4$ and $x = -4$.',
    trapWarning: 'Remember difference of squares yields both positive and negative square roots: $\\pm 4$, not just $+4$.',
    calculatorHack: 'Test both CALC `4` and CALC `-4`; both must yield Math ERROR.',
  },
  {
    id: 103,
    subskill: 'Domain restrictions',
    difficulty: 'Board-Level',
    question: 'Determine all values of $x$ for which the expression is undefined: $$\\frac{x - 3}{\\frac{2}{x + 1} - 1}$$',
    options: [
      'x = -1 \\text{ and } x = 1',
      'x = -1 \\text{ only}',
      'x = 1 \\text{ only}',
      'x = 3, -1, 1',
    ],
    correctIndex: 0,
    hints: [
      'Check internal denominators first: $x + 1 = 0 \\implies x = -1$.',
      'Now check the main denominator: $\\frac{2}{x + 1} - 1 = 0 \\implies \\frac{2}{x + 1} = 1$.',
      'Solve $2 = x + 1 \\implies x = 1$. Both $-1$ and $1$ cause division by zero.',
    ],
    explanation:
      'In a compound rational expression, any sub-denominator AND the main denominator cannot be 0:\n1) Sub-denominator: $x + 1 = 0 \\implies x = -1$.\n2) Main denominator: $\\frac{2}{x + 1} - 1 = 0 \\implies 2 = x + 1 \\implies x = 1$.\nHence, $x = -1$ and $x = 1$ are both excluded.',
    trapWarning: 'Common board trap: Students only solve the main denominator and forget the embedded denominator $x + 1 = 0$.',
    calculatorHack: 'Store `-1` then `1` into X and evaluate. Both fail with Math ERROR.',
  },

  // 2. Simplifying expressions
  {
    id: 201,
    subskill: 'Simplifying expressions',
    difficulty: 'Basic',
    question: 'Simplify to lowest terms: $$\\frac{6x^3 y^2}{15x y^5}$$',
    options: [
      '\\frac{2x^2}{5y^3}',
      '\\frac{2x^4}{5y^7}',
      '\\frac{2x^2 y^3}{5}',
      '\\frac{3x^2}{5y^3}',
    ],
    correctIndex: 0,
    hints: [
      'Reduce coefficients: $6/15 = 2/5$.',
      'Apply quotient rule for exponents: $x^{3-1} = x^2$ and $y^{2-5} = y^{-3} = 1/y^3$.',
    ],
    explanation:
      '$\\frac{6}{15} \\cdot \\frac{x^3}{x} \\cdot \\frac{y^2}{y^5} = \\frac{2}{5} \\cdot x^2 \\cdot \\frac{1}{y^3} = \\frac{2x^2}{5y^3}$.',
    trapWarning: 'Subtract powers of the same base; do not add them.',
  },
  {
    id: 202,
    subskill: 'Simplifying expressions',
    difficulty: 'Intermediate',
    question: 'Simplify completely: $$\\frac{x^2 - 9}{x^2 - 2x - 3}$$',
    options: [
      '\\frac{x + 3}{x + 1}',
      '\\frac{x - 3}{x + 1}',
      '\\frac{x + 3}{x - 1}',
      '\\frac{9}{2x + 3}',
    ],
    correctIndex: 0,
    hints: [
      'Factor numerator as difference of squares: $(x - 3)(x + 3)$.',
      'Factor denominator into binomials: find two numbers that multiply to $-3$ and add to $-2$: $(x - 3)(x + 1)$.',
      'Cancel identical factor $(x - 3)$.',
    ],
    explanation:
      'Numerator $= (x - 3)(x + 3)$. Denominator $= (x - 3)(x + 1)$. Cancelling $(x - 3)$ leaves $\\frac{x + 3}{x + 1}$ for $x \\neq 3, -1$.',
    trapWarning: 'Never cancel individual terms like $x^2$ with $x^2$. Only cancel factored multiplicands!',
    calculatorHack: 'Test equivalence with CALC: Pick an arbitrary non-restricted number like $x = 7$. Original: $(49-9)/(49-14-3) = 40/32 = 1.25$. Option A: $(7+3)/(7+1) = 10/8 = 1.25$. Matches exactly!',
  },
  {
    id: 203,
    subskill: 'Simplifying expressions',
    difficulty: 'Board-Level',
    question: 'Simplify completely: $$\\frac{x^3 - 8}{2x^2 - 3x - 2}$$',
    options: [
      '\\frac{x^2 + 2x + 4}{2x + 1}',
      '\\frac{x^2 - 2x + 4}{2x + 1}',
      '\\frac{(x - 2)^2}{2x + 1}',
      '\\frac{x^2 + 4}{2x + 1}',
    ],
    correctIndex: 0,
    hints: [
      'Factor difference of cubes in numerator: $a^3 - b^3 = (a - b)(a^2 + ab + b^2)$ where $a=x, b=2$.',
      'Factor denominator $2x^2 - 3x - 2 = (2x + 1)(x - 2)$.',
      'Cancel common factor $(x - 2)$.',
    ],
    explanation:
      'Numerator factors as $(x - 2)(x^2 + 2x + 4)$. Denominator factors as $(2x + 1)(x - 2)$. Canceling $(x - 2)$ leaves $\\frac{x^2 + 2x + 4}{2x + 1}$. Note $x^2 + 2x + 4$ has discriminant $\\Delta = 4 - 16 = -12 < 0$, so it cannot factor further over reals.',
    trapWarning: 'The quadratic factor in difference of cubes is $x^2 + 2x + 4$, NOT $(x - 2)^2$ and NOT $x^2 - 2x + 4$.',
    calculatorHack: 'Evaluate both original and simplified expression at $X = 5$. Both equal $39/11 \\approx 3.545$.',
  },

  // 3. Multiplication & division
  {
    id: 301,
    subskill: 'Multiplication & division',
    difficulty: 'Basic',
    question: 'Multiply and simplify: $$\\frac{4a}{3b} \\cdot \\frac{9b^2}{8a^2}$$',
    options: ['\\frac{3b}{2a}', '\\frac{3a}{2b}', '\\frac{12b}{24a}', '\\frac{3b^2}{2a^2}'],
    correctIndex: 0,
    hints: [
      'Cancel numerical factors: $(4 \\times 9) / (3 \\times 8) = 36 / 24 = 3/2$.',
      'Cancel variables: $a / a^2 = 1/a$, and $b^2 / b = b$.',
    ],
    explanation:
      'Cross-cancelling: $4$ and $8$ reduce to $1$ and $2$. $9$ and $3$ reduce to $3$ and $1$. $a/a^2 = 1/a$ and $b^2/b = b$. Combining gives $\\frac{3b}{2a}$.',
  },
  {
    id: 302,
    subskill: 'Multiplication & division',
    difficulty: 'Intermediate',
    question: 'Divide: $$\\frac{x^2 - 4}{x + 3} \\div \\frac{x - 2}{x^2 - 9}$$',
    options: [
      '(x + 2)(x - 3)',
      '\\frac{x + 2}{x - 3}',
      '\\frac{x - 2}{x + 3}',
      '(x - 2)(x + 3)',
    ],
    correctIndex: 0,
    hints: [
      'Change division to multiplication by inverting the divisor: $\\frac{x^2 - 4}{x + 3} \\cdot \\frac{x^2 - 9}{x - 2}$.',
      'Factor each difference of squares: $(x - 2)(x + 2)$ and $(x - 3)(x + 3)$.',
      'Cancel common binomial factors.',
    ],
    explanation:
      'Invert and multiply:\n$$\\frac{(x - 2)(x + 2)}{x + 3} \\cdot \\frac{(x - 3)(x + 3)}{x - 2}$$\nCanceling $(x - 2)$ and $(x + 3)$ yields $(x + 2)(x - 3) = x^2 - x - 6$.',
    trapWarning: 'Always remember to flip the SECOND fraction (reciprocal) when dividing.',
  },
  {
    id: 303,
    subskill: 'Multiplication & division',
    difficulty: 'Board-Level',
    question: 'Perform the operations: $$\\frac{x^2 - 5x + 6}{x^2 - 1} \\cdot \\frac{x^2 + 2x + 1}{x - 3} \\div \\frac{x^2 - 4}{x - 1}$$',
    options: [
      '\\frac{x + 1}{x + 2}',
      '\\frac{x - 1}{x + 2}',
      '\\frac{x + 2}{x + 1}',
      '1',
    ],
    correctIndex: 0,
    hints: [
      'Convert the third fraction to multiplication: $\\cdot \\frac{x - 1}{x^2 - 4}$.',
      'Factor all 6 polynomials:\n• $x^2 - 5x + 6 = (x - 2)(x - 3)$\n• $x^2 - 1 = (x - 1)(x + 1)$\n• $x^2 + 2x + 1 = (x + 1)^2$\n• $x^2 - 4 = (x - 2)(x + 2)$',
      'Multiply across and cancel identical binomial factors.',
    ],
    explanation:
      'Rewrite as single product:\n$$\\frac{(x - 2)(x - 3)}{(x - 1)(x + 1)} \\cdot \\frac{(x + 1)^2}{x - 3} \\cdot \\frac{x - 1}{(x - 2)(x + 2)}$$\nFactors $(x - 3)$, $(x - 2)$, $(x - 1)$, and one $(x + 1)$ cancel out from top and bottom. Remaining: $\\frac{x + 1}{x + 2}$.',
    trapWarning: 'Be meticulous when keeping track of powers of $(x + 1)$ and which terms are in the denominator.',
    calculatorHack: 'Plug in $X = 4$. Original: $(2/15) \\cdot (25/1) \\div (12/3) = (50/15) \\div 4 = (10/3)/4 = 5/6$. Simplified at $X = 4$: $(4+1)/(4+2) = 5/6$. Correct!',
  },

  // 4. Addition & Subtraction
  {
    id: 401,
    subskill: 'Addition & Subtraction',
    difficulty: 'Basic',
    question: 'Compute: $$\\frac{5x + 2}{x - 4} - \\frac{2x - 10}{x - 4}$$',
    options: ['\\frac{3x + 12}{x - 4}', '\\frac{3x - 8}{x - 4}', '3', '\\frac{3x + 12}{2x - 8}'],
    correctIndex: 0,
    hints: [
      'Denominators are already identical $(x - 4)$.',
      'Distribute the negative sign across BOTH terms of $(2x - 10)$: $(5x + 2) - (2x - 10) = 5x + 2 - 2x + 10$.',
    ],
    explanation:
      'Combine over common denominator: $\\frac{(5x + 2) - (2x - 10)}{x - 4} = \\frac{5x + 2 - 2x + 10}{x - 4} = \\frac{3x + 12}{x - 4}$. Note $3x + 12 = 3(x + 4)$, which does not cancel with $(x - 4)$.',
    trapWarning: 'Distribute the minus sign! Failing to negate $-10$ to $+10$ is the most frequent subtraction error.',
  },
  {
    id: 402,
    subskill: 'Addition & Subtraction',
    difficulty: 'Intermediate',
    question: 'Combine and simplify: $$\\frac{2}{x - 3} + \\frac{5}{x + 2}$$',
    options: [
      '\\frac{7x - 11}{(x - 3)(x + 2)}',
      '\\frac{7}{2x - 1}',
      '\\frac{7x + 11}{(x - 3)(x + 2)}',
      '\\frac{10}{(x - 3)(x + 2)}',
    ],
    correctIndex: 0,
    hints: [
      'Find the LCD: $(x - 3)(x + 2)$.',
      'Multiply first fraction by $\\frac{x + 2}{x + 2}$ and second by $\\frac{x - 3}{x - 3}$.',
      'Combine numerators: $2(x + 2) + 5(x - 3) = 2x + 4 + 5x - 15 = 7x - 11$.',
    ],
    explanation:
      'The LCD is $(x - 3)(x + 2)$. Rewriting over LCD: $\\frac{2(x + 2) + 5(x - 3)}{(x - 3)(x + 2)} = \\frac{2x + 4 + 5x - 15}{(x - 3)(x + 2)} = \\frac{7x - 11}{(x - 3)(x + 2)}$.',
    trapWarning: 'Never add denominators directly ($x - 3 + x + 2 \\neq 2x - 1$). You must find the least common denominator.',
  },
  {
    id: 403,
    subskill: 'Addition & Subtraction',
    difficulty: 'Board-Level',
    question: 'Simplify completely: $$\\frac{x}{x^2 - 4} - \\frac{1}{x^2 - 2x}$$',
    options: [
      '\\frac{x - 1}{x(x + 2)}',
      '\\frac{x + 1}{x(x - 2)}',
      '\\frac{1}{x(x - 2)}',
      '\\frac{x - 1}{x^2 - 4}',
    ],
    correctIndex: 0,
    hints: [
      'Factor each denominator completely:\n• $x^2 - 4 = (x - 2)(x + 2)$\n• $x^2 - 2x = x(x - 2)$',
      'Determine the LCD: $x(x - 2)(x + 2)$.',
      'Adjust numerators: first needs $x$, second needs $(x + 2)$.\nNumerator becomes $x(x) - 1(x + 2) = x^2 - x - 2$.',
      'Factor the resulting numerator $(x - 2)(x + 1)$ and cancel $(x - 2)$.',
    ],
    explanation:
      'Factoring denominators:\n$$\\frac{x}{(x - 2)(x + 2)} - \\frac{1}{x(x - 2)}$$\nLCD is $x(x - 2)(x + 2)$. Numerator is $x^2 - (x + 2) = x^2 - x - 2 = (x - 2)(x + 1)$.\nPutting over LCD:\n$$\\frac{(x - 2)(x + 1)}{x(x - 2)(x + 2)} = \\frac{x + 1}{x(x + 2)}$$\nWait, let us check the subtraction: $x \\cdot x - 1(x + 2) = x^2 - x - 2 = (x - 2)(x + 1)$. Canceling $(x - 2)$ gives $\\frac{x + 1}{x(x + 2)}$.',
    trapWarning: 'Always re-factor the combined numerator; it frequently shares a common factor with the denominator that can be reduced!',
  },

  // 5. Complex rational expressions
  {
    id: 501,
    subskill: 'Complex rational expressions',
    difficulty: 'Basic',
    question: 'Simplify the compound fraction: $$\\frac{\\frac{3}{x}}{\\frac{6}{x^2}}$$',
    options: ['\\frac{x}{2}', '\\frac{2}{x}', '\\frac{18}{x^3}', '2x'],
    correctIndex: 0,
    hints: [
      'Rewrite as division of fractions: $\\frac{3}{x} \\div \\frac{6}{x^2}$.',
      'Invert and multiply: $\\frac{3}{x} \\cdot \\frac{x^2}{6}$.',
    ],
    explanation:
      '$\\frac{3}{x} \\cdot \\frac{x^2}{6} = \\frac{3}{6} \\cdot \\frac{x^2}{x} = \\frac{1}{2} \\cdot x = \\frac{x}{2}$.',
  },
  {
    id: 502,
    subskill: 'Complex rational expressions',
    difficulty: 'Intermediate',
    question: 'Simplify the compound fraction: $$\\frac{\\frac{1}{x} - \\frac{1}{y}}{\\frac{1}{x} + \\frac{1}{y}}$$',
    options: [
      '\\frac{y - x}{y + x}',
      '\\frac{x - y}{x + y}',
      '\\frac{1}{xy}',
      '\\frac{y - x}{xy}',
    ],
    correctIndex: 0,
    hints: [
      'Find the global LCD of all minor denominators: $\\text{LCD} = xy$.',
      'Multiply both the numerator and denominator by $xy$.',
      '$xy(\\frac{1}{x} - \\frac{1}{y}) = y - x$, and $xy(\\frac{1}{x} + \\frac{1}{y}) = y + x$.',
    ],
    explanation:
      'Multiply entire numerator and denominator by $xy$:\n$$\\frac{xy \\left(\\frac{1}{x} - \\frac{1}{y}\\right)}{xy \\left(\\frac{1}{x} + \\frac{1}{y}\\right)} = \\frac{y - x}{y + x}$$.',
    trapWarning: 'Watch the sign order: $xy(1/x) = y$, and $xy(1/y) = x$, producing $y - x$, not $x - y$.',
    calculatorHack: 'Test with $x = 2, y = 3$: Numerator is $1/2 - 1/3 = 1/6$. Denominator is $1/2 + 1/3 = 5/6$. Ratio is $(1/6)/(5/6) = 1/5$. Option A: $(3-2)/(3+2) = 1/5$. Matches!',
  },
  {
    id: 503,
    subskill: 'Complex rational expressions',
    difficulty: 'Board-Level',
    question: 'Simplify completely: $$\\frac{1 - \\frac{2}{x} - \\frac{15}{x^2}}{1 - \\frac{9}{x^2}}$$',
    options: [
      '\\frac{x - 5}{x - 3}',
      '\\frac{x + 5}{x + 3}',
      '\\frac{x - 5}{x + 3}',
      '\\frac{x + 3}{x - 5}',
    ],
    correctIndex: 0,
    hints: [
      'The global LCD of all internal denominators is $x^2$.',
      'Multiply numerator and denominator by $x^2$: yields $\\frac{x^2 - 2x - 15}{x^2 - 9}$.',
      'Factor both polynomials: numerator is $(x - 5)(x + 3)$, denominator is $(x - 3)(x + 3)$.',
      'Cancel common factor $(x + 3)$.',
    ],
    explanation:
      'Multiply by $x^2 / x^2$:\n$$\\frac{x^2(1 - 2/x - 15/x^2)}{x^2(1 - 9/x^2)} = \\frac{x^2 - 2x - 15}{x^2 - 9}$$\nFactoring:\n$$\\frac{(x - 5)(x + 3)}{(x - 3)(x + 3)} = \\frac{x - 5}{x - 3}$$ (for $x \\neq 0, \\pm 3$).',
    trapWarning: 'Remember to cancel $(x + 3)$ from both, leaving $\\frac{x - 5}{x - 3}$.',
    calculatorHack: 'With $X = 4$: Top is $1 - 2/4 - 15/16 = 1 - 0.5 - 0.9375 = -0.4375 = -7/16$. Bottom is $1 - 9/16 = 7/16$. Ratio is $-1$. Option A with $X = 4$: $(4 - 5)/(4 - 3) = -1/1 = -1$. Identical!',
  },

  // 6. Rational Equations
  {
    id: 601,
    subskill: 'Rational Equations',
    difficulty: 'Basic',
    question: 'Solve for $x$: $$\\frac{3}{x - 1} = \\frac{2}{x + 4}$$',
    options: ['x = -14', 'x = 14', 'x = 2', 'x = -10'],
    correctIndex: 0,
    hints: [
      'Apply cross-multiplication: $3(x + 4) = 2(x - 1)$.',
      'Expand: $3x + 12 = 2x - 2$.',
      'Subtract $2x$ and subtract $12$ to isolate $x$.',
    ],
    explanation:
      'Cross-multiplying gives $3(x + 4) = 2(x - 1) \\implies 3x + 12 = 2x - 2 \\implies x = -14$. Check excluded values $x \\neq 1, -4$. Since $-14$ is not excluded, it is a valid solution.',
    calculatorHack: 'Casio fx-991: Type `3/(X-1) = 2/(X+4)` (using ALPHA CALC for `=`), then press SHIFT CALC (SOLVE). The calculator immediately returns `X = -14`.',
  },
  {
    id: 602,
    subskill: 'Rational Equations',
    difficulty: 'Intermediate',
    question: 'Solve for $x$: $$\\frac{x}{x - 2} = \\frac{2}{x - 2} + 1$$',
    options: ['\\text{No real solution}', 'x = 2', 'x = 0', 'x = 4'],
    correctIndex: 0,
    hints: [
      'Note excluded value: $x - 2 = 0 \\implies x \\neq 2$.',
      'Multiply entire equation by $(x - 2)$ to clear fractions.',
      'Solve $x = 2 + (x - 2) \\implies x = x$.',
      'Examine whether $x = 2$ can be accepted.',
    ],
    explanation:
      'Multiplying by $(x - 2)$ gives $x = 2 + 1(x - 2) \\implies x = x$. This holds for all real numbers except where the denominator was $0$. Because $x = 2$ makes the original denominators $0$, it is an extraneous solution. There are no valid solutions that satisfy the original equation.',
    trapWarning: 'Always verify candidate solutions against the original excluded values before declaring an answer!',
    calculatorHack: 'If you test CALC $X = 2$ in the equation, you get Math ERROR. No valid point satisfies the equation.',
  },
  {
    id: 603,
    subskill: 'Rational Equations',
    difficulty: 'Board-Level',
    question: 'Solve for $x$: $$\\frac{x}{x - 3} - \\frac{2}{x + 1} = \\frac{8}{x^2 - 2x - 3}$$',
    options: ['x = -1 \\text{ (extraneous, so no solution)}', 'x = 2 \\text{ only}', 'x = 2 \\text{ and } x = -1', 'x = 3'],
    correctIndex: 1,
    hints: [
      'Factor the RHS denominator: $x^2 - 2x - 3 = (x - 3)(x + 1)$.',
      'The LCD is $(x - 3)(x + 1)$. Note excluded values: $x \\neq 3, -1$.',
      'Multiply by LCD: $x(x + 1) - 2(x - 3) = 8$.',
      'Expand: $x^2 + x - 2x + 6 = 8 \\implies x^2 - x - 2 = 0$.',
      'Factor $(x - 2)(x + 1) = 0 \\implies x = 2$ or $x = -1$. Check against exclusions!',
    ],
    explanation:
      'Multiply through by $(x - 3)(x + 1)$:\n$$x(x + 1) - 2(x - 3) = 8$$\n$$x^2 + x - 2x + 6 = 8 \\implies x^2 - x - 2 = 0$$\nFactoring gives $(x - 2)(x + 1) = 0$, yielding roots $x = 2$ and $x = -1$.\nHowever, $x = -1$ causes division by zero in $\\frac{2}{x + 1}$ and $\\frac{8}{x^2 - 2x - 3}$, making $x = -1$ extraneous!\nTherefore, the only valid solution is $x = 2$.',
    trapWarning: 'Classic board exam pitfall: leaving both roots without checking for extraneous values will cost full marks.',
    calculatorHack: 'Test $X = 2$: LHS is $2/(2-3) - 2/(2+1) = -2 - 2/3 = -8/3$. RHS is $8/(4-4-3) = -8/3$. Matches! Test $X = -1$: gives division by zero error.',
  },
];
