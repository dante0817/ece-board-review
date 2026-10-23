export interface LinearQuickRefFormula {
  id: string;
  ruleNumber: number;
  category: 'equations' | 'systems' | 'motion' | 'work-mixture' | 'casio-hacks';
  categoryLabel: string;
  badgeColor: string;
  title: string;
  formulaLatex: string;
  condition?: string;
  description: string;
  recallPrompt: string;
  recallQuestion?: string;
  memoryCue: string;
  examinerTrap: string;
  example: {
    problem: string;
    result: string;
  };
  casioTip?: string;
}

export const LINEAR_QUICK_REF_FORMULAS: LinearQuickRefFormula[] = [
  {
    id: 'lqf-1',
    ruleNumber: 1,
    category: 'equations',
    categoryLabel: 'Single Variable Equations',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'Clearing Denominators with LCD',
    formulaLatex: '\\text{LCD} \\cdot \\left(\\frac{A}{d_1} + \\frac{B}{d_2}\\right) = \\text{LCD} \\cdot C',
    condition: 'd_1, d_2 \\neq 0',
    description: 'Multiply all terms on BOTH sides by the lowest common multiple of denominators to convert to standard integer form.',
    recallPrompt: '\\text{LCD} \\cdot \\left(\\frac{A}{d_1} + \\frac{B}{d_2}\\right) = \\text{?}',
    recallQuestion: 'What must you multiply both sides by to eliminate all fraction denominators in a single step?',
    memoryCue: 'Every term must taste the LCD—even isolated integers without fractions.',
    examinerTrap: 'Failing to multiply whole numbers or constants on the right-hand side by the LCD.',
    example: {
      problem: '\\frac{x}{3} + 4 = \\frac{x}{2} \\implies 6\\left(\\frac{x}{3}\\right) + 6(4) = 6\\left(\\frac{x}{2}\\right)',
      result: '2x + 24 = 3x \\implies x = 24',
    },
    casioTip: 'Use SHIFT+CALC (SOLVE) directly on fx-991 to bypass fraction steps.',
  },
  {
    id: 'lqf-2',
    ruleNumber: 2,
    category: 'systems',
    categoryLabel: 'Systems & Determinants',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    title: 'Cramer’s Rule (2x2 System)',
    formulaLatex: 'x = \\frac{\\Delta_x}{\\Delta}, \\quad y = \\frac{\\Delta_y}{\\Delta}, \\quad \\Delta = a_1 b_2 - a_2 b_1',
    condition: '\\Delta \\neq 0',
    description: 'Calculates simultaneous unknowns via ratios of matrix determinants.',
    recallPrompt: 'x = \\frac{?}{\\Delta}, \\quad y = \\frac{?}{\\Delta}',
    recallQuestion: 'What determinant replaces the coefficients of x with the constant vector?',
    memoryCue: 'Δ_x replaces the x-column with constants; Δ_y replaces the y-column with constants.',
    examinerTrap: 'Forgetting the negative sign on the off-diagonal product (-a2*b1).',
    example: {
      problem: '2x + 3y = 8, \\; x - 2y = -3 \\implies \\Delta = (2)(-2) - (3)(1) = -7',
      result: '\\Delta_x = (8)(-2) - (3)(-3) = -7 \\implies x = 1, \\; y = 2',
    },
    casioTip: 'MODE 5 -> 1 on fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) or MENU A -> 1 on ClassWiz.',
  },
  {
    id: 'lqf-3',
    ruleNumber: 3,
    category: 'systems',
    categoryLabel: 'Systems & Determinants',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    title: 'Classification of Linear Systems',
    formulaLatex: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2} \\implies \\text{Inconsistent}, \\quad \\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2} \\implies \\text{Dependent}',
    condition: 'Standard form: a_i x + b_i y = c_i',
    description: 'Parallel lines with different intercepts have NO solution. Collinear lines have INFINITELY MANY solutions.',
    recallPrompt: '\\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2} \\implies \\text{?}',
    recallQuestion: 'If slopes are equal but y-intercepts differ, how many solutions does the system have?',
    memoryCue: 'Parallel = Never meet (0 solutions). Same line = Everywhere together (∞ solutions).',
    examinerTrap: 'Mistaking a dependent system for an inconsistent system because Δ = 0.',
    example: {
      problem: '2x - 4y = 6 \\text{ and } x - 2y = 3',
      result: '2/1 = -4/-2 = 6/3 = 2 \\implies \\text{Dependent (Infinite Solutions)}',
    },
  },
  {
    id: 'lqf-4',
    ruleNumber: 4,
    category: 'motion',
    categoryLabel: 'Motion & Pursuit',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Harmonic Mean for Round-Trip Average Speed',
    formulaLatex: 'v_{\\text{avg}} = \\frac{2 v_1 v_2}{v_1 + v_2} = \\frac{2}{\\frac{1}{v_1} + \\frac{1}{v_2}}',
    condition: '\\text{Equal distance in both directions } (d_1 = d_2)',
    description: 'Average speed over identical travel distances is always the harmonic mean, NEVER the arithmetic mean.',
    recallPrompt: 'v_{\\text{avg}} = \\frac{2 v_1 v_2}{?}',
    recallQuestion: 'What is the exact formula for round-trip average speed over equal distances?',
    memoryCue: 'More time is spent at the slower speed, dragging down the true average.',
    examinerTrap: 'Choosing the arithmetic average (v1 + v2)/2 from the board choices.',
    example: {
      problem: 'v_1 = 30\\text{ kph}, \\; v_2 = 60\\text{ kph}',
      result: 'v_{\\text{avg}} = \\frac{2(30)(60)}{30 + 60} = \\frac{3600}{90} = 40\\text{ kph (NOT 45!)}',
    },
    casioTip: '2 / (1/30 + 1/60) gives 40 instantly.',
  },
  {
    id: 'lqf-5',
    ruleNumber: 5,
    category: 'motion',
    categoryLabel: 'Motion & Pursuit',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    title: 'Effective Speed in Wind or River Current',
    formulaLatex: 'v_{\\text{downstream/tailwind}} = v + c, \\quad v_{\\text{upstream/headwind}} = v - c',
    condition: 'v > c > 0',
    description: 'Vector addition of medium velocity to vehicle still-air/still-water speed.',
    recallPrompt: 'v_{\\text{downstream}} = v + c, \\quad v_{\\text{upstream}} = \\text{?}',
    recallQuestion: 'How does a headwind affect vehicle ground speed?',
    memoryCue: 'Tailwind pushes you (+c), headwind fights you (-c).',
    examinerTrap: 'Subtracting current from downstream or mixing up vehicle speed with river speed.',
    example: {
      problem: 'Boat at 15 kph in still water with 3 kph current:',
      result: 'Downstream = 18 kph, Upstream = 12 kph',
    },
  },
  {
    id: 'lqf-6',
    ruleNumber: 6,
    category: 'work-mixture',
    categoryLabel: 'Work & Mixture Problems',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    title: 'Reciprocal Combined Work Formula',
    formulaLatex: '\\frac{1}{T} = \\frac{1}{t_1} + \\frac{1}{t_2} \\implies T = \\frac{t_1 t_2}{t_1 + t_2}',
    condition: 'Rates are constant and independent',
    description: 'Calculates the combined completion time when two agents work together.',
    recallPrompt: 'T = \\frac{t_1 t_2}{?}',
    recallQuestion: 'For two workers taking t1 and t2 days, what is the combined time T?',
    memoryCue: 'Product over Sum: (t1 * t2) / (t1 + t2). Always faster than the fastest worker!',
    examinerTrap: 'Adding the days directly (e.g. 4 days + 6 days = 10 days).',
    example: {
      problem: 'Worker A takes 4 hours, Worker B takes 6 hours:',
      result: 'T = \\frac{4 \\cdot 6}{4 + 6} = \\frac{24}{10} = 2.4\\text{ hours}',
    },
    casioTip: '(4^-1 + 6^-1)^-1 = 2.4 hrs on Casio display.',
  },
  {
    id: 'lqf-7',
    ruleNumber: 7,
    category: 'casio-hacks',
    categoryLabel: 'Casio fx-991 Hacks',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'Casio MODE 5 EQN Systems Solver',
    formulaLatex: '\\text{MODE } 5 \\rightarrow 1: \\; a_n X + b_n Y = c_n, \\quad 2: \\; a_n X + b_n Y + c_n Z = d_n',
    condition: 'Must align equations with constants on right-hand side',
    description: 'Equation-solver functionality differs by calculator model. Confirm the exact calculator is permitted by the current PRC program; fx-991ES and fx-991ES Plus are prohibited in October 2026.',
    recallPrompt: '\\text{MODE } 5 \\rightarrow 1 \\text{ for 2 unknowns, } \\text{MODE } 5 \\rightarrow ? \\text{ for 3 unknowns}',
    recallQuestion: 'Which menu option in MODE 5 EQN handles 3-variable linear systems?',
    memoryCue: 'Option 1 = 2 unknowns; Option 2 = 3 unknowns.',
    examinerTrap: 'Entering constants that are on the left side of the equation without changing their sign.',
    example: {
      problem: '3x + 2y = 12, \\; x - y = 1',
      result: 'MODE 5 1 -> [3 2 12; 1 -1 1] -> X = 2.8, Y = 1.8',
    },
    casioTip: 'Press S<=>D to toggle between decimal and fractional answers.',
  },
];
