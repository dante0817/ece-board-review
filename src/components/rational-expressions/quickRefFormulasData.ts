export interface FormulaItem {
  id: string;
  ruleNumber: number;
  category: 'factoring' | 'operations' | 'equations-inequalities' | 'partial-fractions-circuits' | 'asymptotes-graphs';
  categoryLabel: string;
  badgeColor: string;
  title: string;
  formula: string;
  condition?: string;
  description: string;
  recallPrompt: string; // The masked question / formula prompt
  recallQuestion?: string; // Guiding prompt for active retrieval
  isCoreProcedure?: boolean; // Domain, Multiplication, Division, Addition/Subtraction
  memoryCue: string;
  examinerTrap: string;
  example: {
    problem: string;
    result: string;
  };
  casioTip?: string;
  eceApplication?: string;
}

export const FORMULA_CATEGORIES = [
  { id: 'all', label: 'All Formulas' },
  { id: 'core-procedures', label: 'Core Procedures (Domain, Mult, Div, Add/Sub)' },
  { id: 'operations', label: 'Arithmetic & LCD' },
  { id: 'factoring', label: 'Factoring & Identities' },
  { id: 'equations-inequalities', label: 'Equations & Inequalities' },
  { id: 'partial-fractions-circuits', label: 'Partial Fractions & Circuits' },
  { id: 'asymptotes-graphs', label: 'Asymptotes & Calculator' },
] as const;

export const QUICK_REF_FORMULAS: FormulaItem[] = [
  // ==========================================
  // CATEGORY 1: Factoring & Identities
  // ==========================================
  {
    id: 'f-1',
    ruleNumber: 1,
    category: 'factoring',
    categoryLabel: 'Factoring & Identities',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Sign Inversion & Binomial Reversal Identity',
    formula: 'b - a = -(a - b) \\iff \\frac{b - a}{a - b} = -1',
    condition: 'a \\neq b',
    description: 'Factoring out -1 reverses the subtraction order of any binomial.',
    recallPrompt: 'b - a = -(?) \\iff \\frac{b - a}{a - b} = \\text{?}',
    recallQuestion: 'How do you invert the subtraction order of a binomial, and what is (b - a) / (a - b)?',
    memoryCue: 'Reversing order over a minus sign flips the sign: (b - a)/(a - b) is always -1, NEVER +1.',
    examinerTrap: 'Cancelling (3 - x) directly against (x - 3) as +1, losing a negative sign that ruins the entire solution.',
    example: {
      problem: '\\frac{9 - x^2}{x - 3} = \\frac{-(x - 3)(x + 3)}{x - 3}',
      result: '-(x + 3) = -x - 3',
    },
    casioTip: 'Test with x = 5: (9 - 25)/(5 - 3) = -16/2 = -8. Test -5 - 3 = -8.',
  },
  {
    id: 'f-2',
    ruleNumber: 2,
    category: 'factoring',
    categoryLabel: 'Factoring & Identities',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Difference of Squares Identity',
    formula: 'a^2 - b^2 = (a - b)(a + b)',
    condition: 'a, b \\in \\mathbb{R}',
    description: 'Decomposes any quadratic difference into conjugate binomial factors.',
    recallPrompt: 'a^2 - b^2 = \\text{?}',
    recallQuestion: 'What are the conjugate factors of a difference of squares a² - b²?',
    memoryCue: 'Conjugate pairs: the middle cross-terms (-ab and +ab) cancel out to zero.',
    examinerTrap: 'Mistaking a sum of squares (a² + b²) as factorable over real numbers. a² + b² is prime in real algebra.',
    example: {
      problem: '\\frac{4x^2 - 25}{2x + 5}',
      result: '\\frac{(2x - 5)(2x + 5)}{2x + 5} = 2x - 5',
    },
  },
  {
    id: 'f-3',
    ruleNumber: 3,
    category: 'factoring',
    categoryLabel: 'Factoring & Identities',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Sum and Difference of Cubes',
    formula: 'a^3 \\pm b^3 = (a \\pm b)(a^2 \\mp ab + b^2)',
    condition: '\\text{Trinomial factor has } \\Delta = (\\mp b)^2 - 4(1)(b^2) = -3b^2 < 0',
    description: 'The SOAP mnemonic governs signs: Same, Opposite, Always Positive.',
    recallPrompt: 'a^3 \\pm b^3 = \\text{?}',
    recallQuestion: 'State the SOAP cubic factorization for a³ ± b³.',
    memoryCue: 'SOAP: Same sign, Opposite sign, Always Positive. Middle term is (ab), NOT (2ab)!',
    examinerTrap: 'Writing the trinomial factor as (a² - 2ab + b²). It has NO factor of 2 and is strictly irreducible over real numbers.',
    example: {
      problem: '\\frac{x^3 - 8}{x - 2}',
      result: '\\frac{(x - 2)(x^2 + 2x + 4)}{x - 2} = x^2 + 2x + 4',
    },
  },

  // ==========================================
  // CATEGORY 2: Core Procedures & Arithmetic
  // ==========================================
  {
    id: 'proc-domain',
    ruleNumber: 4,
    category: 'operations',
    categoryLabel: 'Domain Rules',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    title: 'Domain Restriction Rules & Excluded Values',
    formula: 'Q(x) = 0 \\implies \\text{Domain} = \\mathbb{R} \\setminus \\{x \\mid Q(x) = 0\\}',
    condition: 'R(x) = \\frac{P(x)}{Q(x)}, \\quad Q(x) \\neq 0',
    description: 'Set every denominator factor to zero BEFORE cancelling to find all excluded domain values.',
    recallPrompt: 'Q(x) = 0 \\implies \\text{Domain} = \\text{?}',
    recallQuestion: 'How do you determine domain restrictions, and must they be found before or after cancelling common factors?',
    isCoreProcedure: true,
    memoryCue: 'Restrictions are permanent! Factors that cancel produce removable HOLES, but their x-values remain permanently forbidden.',
    examinerTrap: 'Simplifying (x - 2)/(x - 2)(x + 1) = 1/(x + 1) and reporting x ≠ -1 only, missing x ≠ 2.',
    example: {
      problem: 'f(x) = \\frac{x - 3}{(x - 3)(x + 5)} \\implies x - 3 = 0, \\; x + 5 = 0',
      result: '\\text{Excluded Values: } x \\neq 3, \\quad x \\neq -5',
    },
  },
  {
    id: 'proc-mult',
    ruleNumber: 5,
    category: 'operations',
    categoryLabel: 'Multiplication',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Multiplication Procedure for Rationals',
    formula: '\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d} = \\frac{ac}{bd}',
    condition: 'b \\neq 0, \\quad d \\neq 0',
    description: 'Factor all numerators and denominators completely, divide out common factors across any numerator and denominator, then multiply remaining factors.',
    recallPrompt: '\\frac{a}{b} \\cdot \\frac{c}{d} = \\text{?}',
    recallQuestion: 'What is the procedure for multiplying two rational expressions?',
    isCoreProcedure: true,
    memoryCue: 'Multiply straight across numerators and denominators, but factor and cancel FIRST to keep degrees manageable.',
    examinerTrap: 'Expanding polynomials before simplifying: multiplying (x² - 9)(x + 2) before factoring produces high-degree algebra errors.',
    example: {
      problem: '\\frac{x^2 - 4}{x + 3} \\cdot \\frac{x + 3}{x - 2} = \\frac{(x - 2)(x + 2)(x + 3)}{(x + 3)(x - 2)}',
      result: 'x + 2 \\quad (x \\neq -3, 2)',
    },
  },
  {
    id: 'proc-div',
    ruleNumber: 6,
    category: 'operations',
    categoryLabel: 'Division',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Division Procedure for Rationals (Invert & Multiply)',
    formula: '\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c} = \\frac{ad}{bc}',
    condition: 'b \\neq 0, \\quad c \\neq 0, \\quad d \\neq 0 \\; (\\text{3-Way Restriction})',
    description: 'Keep the dividend, change division to multiplication, flip the divisor (reciprocal), and exclude zeros of b, c, and d.',
    recallPrompt: '\\frac{a}{b} \\div \\frac{c}{d} = \\text{?}',
    recallQuestion: 'What is the procedure for dividing two rational expressions, and what are the 3 domain restrictions?',
    isCoreProcedure: true,
    memoryCue: 'Keep, Change, Flip (KCF) — and check zeros of BOTH the numerator and denominator of the divisor fraction!',
    examinerTrap: 'Forgetting to exclude zeros of c (numerator of the second fraction), which lands in the denominator after reciprocal inversion.',
    example: {
      problem: '\\frac{x}{x - 1} \\div \\frac{x + 2}{x - 3} = \\frac{x}{x - 1} \\cdot \\frac{x - 3}{x + 2}',
      result: '\\frac{x(x - 3)}{(x - 1)(x + 2)} \\quad (x \\neq 1, 3, -2)',
    },
  },
  {
    id: 'proc-addsub',
    ruleNumber: 7,
    category: 'operations',
    categoryLabel: 'Addition & Subtraction',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Addition & Subtraction Procedures (LCD Method)',
    formula: '\\frac{a}{\\text{LCD}} \\pm \\frac{b}{\\text{LCD}} = \\frac{a \\pm b}{\\text{LCD}}',
    condition: '\\text{LCD} = \\text{lcm}(B, D)',
    description: 'Find the LCD by taking highest powers of all distinct prime factors. Convert both numerators, combine over the single LCD, and distribute any minus sign.',
    recallPrompt: '\\frac{a}{\\text{LCD}} \\pm \\frac{b}{\\text{LCD}} = \\text{?}',
    recallQuestion: 'How do you combine rational expressions with unlike denominators, and how must subtraction signs be handled?',
    isCoreProcedure: true,
    memoryCue: 'Distribute the negative sign across ALL terms of the subtracted numerator: -(c · b) = -c · b - ...',
    examinerTrap: 'Failing to distribute the minus sign to the entire second numerator: -(x + 4) written as -x + 4 instead of -x - 4.',
    example: {
      problem: '\\frac{3}{x - 2} - \\frac{2}{x + 1} = \\frac{3(x + 1) - 2(x - 2)}{(x - 2)(x + 1)}',
      result: '\\frac{3x + 3 - 2x + 4}{(x - 2)(x + 1)} = \\frac{x + 7}{(x - 2)(x + 1)}',
    },
  },
  {
    id: 'f-8',
    ruleNumber: 8,
    category: 'operations',
    categoryLabel: 'Arithmetic & LCD',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Complex Fractions — Global LCD Method',
    formula: '\\frac{\\frac{A}{B} + \\frac{C}{D}}{\\frac{E}{F} + \\frac{G}{H}} = \\frac{\\text{LCD} \\cdot \\left(\\frac{A}{B} + \\frac{C}{D}\\right)}{\\text{LCD} \\cdot \\left(\\frac{E}{F} + \\frac{G}{H}\\right)}',
    condition: '\\text{LCD} = \\text{lcm}(B, D, F, H)',
    description: 'Multiplying top and bottom of the compound fraction by the Global LCD eliminates all nested fractions in one step.',
    recallPrompt: '\\frac{\\frac{A}{B}}{\\frac{C}{D}} \\text{ or Global LCD Method} = \\text{?}',
    recallQuestion: 'How does multiplying by the Global LCD simplify complex/nested fractions?',
    memoryCue: 'Clear all nested fractions at once by multiplying numerator and denominator by Global LCD/Global LCD = 1.',
    examinerTrap: 'Inverting only the bottom fraction without adding its terms first: (a/b) / (c/d + e/f) is NOT (a/b) * (d/c + f/e).',
    example: {
      problem: '\\frac{1 - \\frac{4}{x^2}}{1 + \\frac{2}{x}} \\cdot \\frac{x^2}{x^2}',
      result: '\\frac{x^2 - 4}{x^2 + 2x} = \\frac{(x - 2)(x + 2)}{x(x + 2)} = \\frac{x - 2}{x}',
    },
  },

  // ==========================================
  // CATEGORY 3: Equations & Inequalities
  // ==========================================
  {
    id: 'f-9',
    ruleNumber: 9,
    category: 'equations-inequalities',
    categoryLabel: 'Equations & Inequalities',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'Rational Equations & Extraneous Roots Rule',
    formula: 'P(x) \\cdot \\frac{A(x)}{P(x)} = B(x) \\implies A(x) = B(x) \\cdot P(x)',
    condition: 'P(x_{\\text{candidate}}) \\neq 0',
    description: 'Multiplying both sides by the LCD clears fractions but may introduce false solutions that make original denominators zero.',
    recallPrompt: '\\text{Clear LCD} \\implies \\text{Solve Polynomial} \\implies \\text{Check Extraneous for } P(x) = \\text{?}',
    recallQuestion: 'Why must candidate roots of rational equations be verified against the original denominators?',
    memoryCue: 'Golden Rule of Rational Equations: Any candidate root that makes ANY original denominator 0 is strictly EXTRANEOUS!',
    examinerTrap: 'Accepting candidate solutions without verifying against the original denominators, selecting false multiple-choice options.',
    example: {
      problem: '\\frac{x}{x - 3} = \\frac{3}{x - 3} + 2 \\implies x = 3 + 2(x - 3) \\implies x = 3',
      result: 'x = 3 \\text{ is EXTRANEOUS } \\implies \\text{No real solution}',
    },
    casioTip: 'Use [SHIFT] [SOLVE]. If it reports "Can\'t Solve" or a math error at that value, the root is an asymptote/extraneous.',
  },
  {
    id: 'f-10',
    ruleNumber: 10,
    category: 'equations-inequalities',
    categoryLabel: 'Equations & Inequalities',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'Rational Inequalities & The Wavy Curve (Sign Chart)',
    formula: '\\frac{P(x)}{Q(x)} \\le 0 \\iff P(x) = 0 \\; (\\text{Closed } [\\;]) \\quad \\text{and} \\quad Q(x) = 0 \\; (\\text{ALWAYS Open } (\\;))',
    condition: 'Q(x) \\neq 0 \\; \\forall x',
    description: 'NEVER cross-multiply by variable expressions across inequalities! Bring everything to one side and test intervals.',
    recallPrompt: '\\frac{P(x)}{Q(x)} \\ge 0 \\implies \\text{Poles always (open or closed)?}',
    recallQuestion: 'Can you cross-multiply variables across inequalities, and how are denominator poles represented on a sign chart?',
    memoryCue: 'Denominator roots are POLES and must ALWAYS have open parentheses ( ), even if the inequality has ≤ or ≥!',
    examinerTrap: 'Cross-multiplying by (x + 2). Since (x + 2) can be negative, cross-multiplication without knowing the sign is mathematically invalid.',
    example: {
      problem: '\\frac{x - 3}{x + 2} \\le 0',
      result: 'x \\in (-2, 3] \\quad \\text{(-2 is open, 3 is closed)}',
    },
  },

  // ==========================================
  // CATEGORY 4: Partial Fractions & Circuits
  // ==========================================
  {
    id: 'f-11',
    ruleNumber: 11,
    category: 'partial-fractions-circuits',
    categoryLabel: 'Partial Fractions & Circuits',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Heaviside Cover-Up Method (Distinct Linear Factors)',
    formula: '\\frac{P(x)}{(x - r_1)(x - r_2)} = \\frac{A}{x - r_1} + \\frac{B}{x - r_2} \\implies A = \\left. \\frac{P(x)}{x - r_2} \\right|_{x = r_1}',
    condition: '\\deg P(x) < \\deg Q(x) \\; (\\text{Proper Fraction})',
    description: 'Cover up the factor (x - r) in the original fraction and evaluate the rest at x = r to find that coefficient in 5 seconds.',
    recallPrompt: 'A = \\left. \\frac{P(x)}{\\dots} \\right|_{x = r_1} = \\text{?}',
    recallQuestion: 'How do you determine the partial fraction coefficient A using the Heaviside Cover-Up technique?',
    memoryCue: 'Cover the pole, plug in its root! Yields the exact residue coefficient without setting up simultaneous linear systems.',
    examinerTrap: 'Using Heaviside on improper fractions without performing polynomial division first. Always ensure deg P < deg Q.',
    example: {
      problem: '\\frac{7x - 1}{(x - 1)(x + 2)} \\implies A = \\left. \\frac{7(1)-1}{1+2} \\right. = \\frac{6}{3} = 2',
      result: '\\frac{2}{x - 1} + \\frac{5}{x + 2}',
    },
    eceApplication: 'Forms the backbone of Inverse Laplace Transforms: \\mathcal{L}^{-1}\\left\\{\\frac{A}{s - a}\\right\\} = A e^{at} in circuit transient analysis.',
  },
  {
    id: 'f-12',
    ruleNumber: 12,
    category: 'partial-fractions-circuits',
    categoryLabel: 'Partial Fractions & Circuits',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Partial Fractions: Repeated & Quadratic Factor Templates',
    formula: '\\frac{P(x)}{(x - a)^2 (x^2 + bx + c)} = \\frac{A_1}{x - a} + \\frac{A_2}{(x - a)^2} + \\frac{Bx + C}{x^2 + bx + c}',
    condition: 'x^2 + bx + c \\text{ is irreducible over } \\mathbb{R} \\; (b^2 - 4c < 0)',
    description: 'Repeated linear factors require ascending powers; irreducible quadratics require a linear numerator (Bx + C).',
    recallPrompt: '\\text{Template for } \\frac{P(x)}{(x - a)^2(x^2 + bx + c)} = \\text{?}',
    recallQuestion: 'What numerators are placed over repeated linear factors and irreducible quadratic factors?',
    memoryCue: 'Linear factor gets constant A; quadratic denominator gets linear numerator (Bx + C).',
    examinerTrap: 'Assigning a constant C instead of (Bx + C) over an irreducible quadratic denominator like (x² + 4).',
    example: {
      problem: '\\text{Template for } \\frac{3x + 1}{(x - 2)(x^2 + 9)}',
      result: '\\frac{A}{x - 2} + \\frac{Bx + C}{x^2 + 9}',
    },
    eceApplication: 'Underdamped RLC circuits: terms like \\frac{Bs + C}{s^2 + \\omega_0^2} invert into decaying sinusoids e^{-\\alpha t} \\cos(\\omega_d t).',
  },
  {
    id: 'f-13',
    ruleNumber: 13,
    category: 'partial-fractions-circuits',
    categoryLabel: 'Partial Fractions & Circuits',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Equivalent Parallel Resistance & Impedance',
    formula: '\\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} \\iff R_{\\text{eq}} = \\frac{R_1 R_2}{R_1 + R_2} = \\frac{\\text{Product}}{\\text{Sum}}',
    condition: 'R_1, R_2 > 0',
    description: 'Parallel resistors and series capacitors add inversely as reciprocal rational expressions.',
    recallPrompt: 'R_{\\text{eq}} = \\frac{\\text{Product}}{\\text{Sum}} = \\text{?}',
    recallQuestion: 'What is the closed-form Product-over-Sum formula for two parallel resistors or series capacitors?',
    memoryCue: 'Parallel: "Product over Sum" for two branches. For three: R_eq = (R1 R2 R3)/(R1 R2 + R2 R3 + R3 R1).',
    examinerTrap: 'Adding resistances directly (R1 + R2) in parallel instead of taking the reciprocal sum.',
    example: {
      problem: 'R_1 = 6\\,\\Omega, \\quad R_2 = 3\\,\\Omega',
      result: 'R_{\\text{eq}} = \\frac{6 \\times 3}{6 + 3} = \\frac{18}{9} = 2\\,\\Omega',
    },
    eceApplication: 'Applies to parallel impedance Z_p = (Z_1 Z_2)/(Z_1 + Z_2) and series capacitance 1/C_eq = 1/C_1 + 1/C_2.',
  },
  {
    id: 'f-14',
    ruleNumber: 14,
    category: 'partial-fractions-circuits',
    categoryLabel: 'Partial Fractions & Circuits',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Work / Rate & Pipe Flow Rational Model',
    formula: '\\frac{1}{t_1} + \\frac{1}{t_2} - \\frac{1}{t_{\\text{drain}}} = \\frac{1}{T_{\\text{together}}}',
    condition: 't > 0',
    description: 'Work rates (jobs per unit time) are additive. Inflow pipes add rates; drain pipes subtract rates.',
    recallPrompt: '\\frac{1}{t_1} + \\frac{1}{t_2} - \\frac{1}{t_{\\text{drain}}} = \\text{?}',
    recallQuestion: 'How do you set up the rational rate equation for cooperating workers or pipes?',
    memoryCue: 'Rates add, NOT hours! 1/A + 1/B = 1/Total. Invert at the end to get time.',
    examinerTrap: 'Averaging the two times: (t1 + t2)/2 is completely wrong. Total time is ALWAYS less than the fastest individual worker.',
    example: {
      problem: '\\text{Worker A: 4 hrs, Worker B: 6 hrs}',
      result: '\\frac{1}{4} + \\frac{1}{6} = \\frac{5}{12} \\implies T = \\frac{12}{5} = 2.4\\text{ hours}',
    },
  },

  // ==========================================
  // CATEGORY 5: Asymptotes & Calculator Hacks
  // ==========================================
  {
    id: 'f-15',
    ruleNumber: 15,
    category: 'asymptotes-graphs',
    categoryLabel: 'Asymptotes & Calculator',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    title: 'Vertical Asymptotes vs. Removable Discontinuities (Holes)',
    formula: 'Q(c) = 0: \\begin{cases} P(c) \\neq 0 \\implies x = c \\text{ is a Vertical Asymptote} \\\\ P(c) = 0 \\implies (c, L) \\text{ is a Removable Hole} \\end{cases}',
    condition: 'R(x) = \\frac{P(x)}{Q(x)}',
    description: 'Non-cancelling denominator factors produce vertical infinite asymptotes. Cancelling factors produce a point hole.',
    recallPrompt: 'Q(c) = 0 \\implies \\text{When is it a Hole vs Vertical Asymptote?}',
    recallQuestion: 'How do you distinguish a vertical asymptote from a removable point hole?',
    memoryCue: 'Cancels out = HOLE in the curve. Stays in denominator = INFINITE POLE (Asymptote).',
    examinerTrap: 'Claiming that every zero of the denominator is a vertical asymptote. If the factor cancels with numerator, it is a hole.',
    example: {
      problem: 'f(x) = \\frac{x - 3}{(x - 3)(x + 2)}',
      result: 'x = 3 \\text{ is a Hole at } (3, 1/5); \\quad x = -2 \\text{ is a Vertical Asymptote}',
    },
  },
  {
    id: 'f-16',
    ruleNumber: 16,
    category: 'asymptotes-graphs',
    categoryLabel: 'Asymptotes & Calculator',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    title: 'Horizontal & Slant (Oblique) Asymptotes Rules',
    formula: 'R(x) = \\frac{a_n x^n + \\dots}{b_m x^m + \\dots} \\implies \\begin{cases} n < m: & y = 0 \\\\ n = m: & y = \\frac{a_n}{b_m} \\\\ n = m + 1: & y = mx + b \\; (\\text{Slant by Division}) \\end{cases}',
    condition: 'n = \\deg(\\text{num}), \\quad m = \\deg(\\text{den})',
    description: 'Examines end behavior as x -> ±∞ based purely on the highest degree terms of numerator and denominator.',
    recallPrompt: 'n < m \\implies y = ?, \\quad n = m \\implies y = ?, \\quad n = m + 1 \\implies \\text{?}',
    recallQuestion: 'State the degree comparison rules for horizontal and slant asymptotes as x -> ±∞.',
    memoryCue: 'Bottom Heavy -> y = 0. Equal Degrees -> Ratio of Leading Coefficients. Top Heavy by 1 -> Slant Asymptote.',
    examinerTrap: 'Looking for a horizontal asymptote when degree of numerator exceeds degree of denominator. (There is none).',
    example: {
      problem: 'f(x) = \\frac{6x^2 + 5}{2x^2 - 3}',
      result: 'n = m = 2 \\implies y = \\frac{6}{2} = 3',
    },
  },
  {
    id: 'f-17',
    ruleNumber: 17,
    category: 'asymptotes-graphs',
    categoryLabel: 'Asymptotes & Calculator',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    title: 'Casio fx-991 [CALC] Prime Substitution Speed Hack',
    formula: 'f(x_{\\text{prime}}) \\equiv g(x_{\\text{prime}}) \\implies f(x) = g(x)',
    condition: 'x \\in \\{7, 11, 13\\} \\; (\\text{Avoid } 0, 1, -1 \\text{ and known poles})',
    description: 'Verify if your simplified expression or multiple choice option is correct in 15 seconds without factoring.',
    recallPrompt: 'x = 7, 11 \\implies f(x_{\\text{prime}}) = g(x_{\\text{prime}}) \\implies \\text{?}',
    recallQuestion: 'How does prime number substitution on Casio [CALC] verify algebraic equivalence without factoring?',
    memoryCue: 'Use [CALC] with prime x = 7 or 11. If problem and choice match decimals to 10 digits, they are identical.',
    examinerTrap: 'Testing with x = 0 or x = 1, where extraneous symmetries (like 0² = 0 or 1² = 1) can produce false positive matches across different options.',
    example: {
      problem: '\\text{Simplify } \\frac{x^2 - 9}{x^2 + 5x + 6}. \\quad \\text{Evaluate at } x = 7',
      result: '\\text{Orig: } \\frac{40}{90} = 0.4444; \\quad \\text{Choice } \\frac{x - 3}{x + 2} = \\frac{4}{9} = 0.4444 \\; (\\text{Instant Match!})',
    },
    casioTip: 'Type algebraic expression using [ALPHA] [X] -> Press [CALC] -> Input 7 -> Press [=].',
  },
];
