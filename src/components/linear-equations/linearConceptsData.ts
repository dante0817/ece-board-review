export interface LinearConceptItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  summary: string;
  latexFormula: string;
  corePrinciples: string[];
  casioMethod?: {
    model: string;
    keystrokes: string;
    note: string;
  };
  boardTrap: string;
  exampleProblem: {
    statement: string;
    steps: { text: string; latex?: string }[];
    answer: string;
  };
}

export const LINEAR_CONCEPTS: LinearConceptItem[] = [
  {
    id: 'single-variable',
    title: 'Single Variable Linear Equations',
    subtitle: 'Clearing Denominators, Distributing Negative Signs, and Isolating Unknowns',
    badge: 'Core Foundation',
    summary:
      'Standard form ax + b = 0. In board exams, problems feature multi-step fractional coefficients and parenthetical groupings. The fastest error-free technique is multiplying all terms by the Least Common Multiple (LCM) of denominators.',
    latexFormula: 'ax + b = 0 \\implies x = -\\frac{b}{a}',
    corePrinciples: [
      'Clear all fractions first by multiplying every single term by the LCD.',
      'Watch out for negative signs preceding a fraction: - (2x - 3)/4 means -2x + 3 when expanded.',
      'Linear equations have exactly ONE unique solution, unless they reduce to 0 = 0 (identity / all reals) or 0 = k (contradiction / no solution).',
    ],
    casioMethod: {
      model: 'Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) PLUS / fx-991CW',
      keystrokes: 'ALPHA [=] -> SHIFT [SOLVE] -> [=]',
      note: 'Type the exact equation using ALPHA [X] and ALPHA [=], press SHIFT + CALC (SOLVE), input an initial guess (e.g., 0), then press = to solve directly in 4 seconds.',
    },
    boardTrap:
      'Forgetting to multiply isolated integers or opposite side terms by the LCD. If clearing LCD = 12, an isolated "+ 5" must become "+ 60".',
    exampleProblem: {
      statement: 'Solve for x: \\frac{3x - 1}{4} - \\frac{x + 2}{3} = \\frac{5}{12}',
      steps: [
        { text: 'Find LCD of 4, 3, 12: LCD = 12. Multiply entire equation by 12:' },
        { text: 'Distribute 12 to all three terms:', latex: '12\\left(\\frac{3x - 1}{4}\\right) - 12\\left(\\frac{x + 2}{3}\\right) = 12\\left(\\frac{5}{12}\\right)' },
        { text: 'Simplify factors:', latex: '3(3x - 1) - 4(x + 2) = 5' },
        { text: 'Expand terms carefully (distribute negative sign!):', latex: '9x - 3 - 4x - 8 = 5' },
        { text: 'Combine like terms:', latex: '5x - 11 = 5 \\implies 5x = 16' },
        { text: 'Isolate x:', latex: 'x = \\frac{16}{5} = 3.2' },
      ],
      answer: 'x = \\frac{16}{5} \\text{ or } 3.2',
    },
  },
  {
    id: 'systems-2x2-3x3',
    title: 'Systems of Linear Equations & Cramer’s Rule',
    subtitle: 'Simultaneous Equations, Determinants, and Casio MODE 5 EQN',
    badge: 'High Board Frequency',
    summary:
      'Solves for multiple unknowns in mesh/nodal circuit analysis and statutory word problems. Cramer’s Rule provides an analytical determinant formula, while Casio Matrix/EQN mode provides immediate numerical evaluation.',
    latexFormula: 'x = \\frac{\\Delta_x}{\\Delta}, \\quad y = \\frac{\\Delta_y}{\\Delta}, \\quad z = \\frac{\\Delta_z}{\\Delta} \\quad (\\Delta \\neq 0)',
    corePrinciples: [
      'Write system in strictly aligned standard form: a_1 x + b_1 y = c_1 before writing matrices or entering coefficients.',
      'Main determinant Δ = det([a1, b1; a2, b2]) = a1*b2 - a2*b1.',
      'Δ_x is formed by replacing the x-column with constant vector c: [c1, b1; c2, b2].',
      'If Δ = 0 and Δ_x = 0, system has Infinitely Many Solutions (Dependent). If Δ = 0 and Δ_x ≠ 0, Inconsistent (No Solution).',
    ],
    casioMethod: {
      model: 'Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) PLUS / CW',
      keystrokes: 'MODE -> 5: EQN -> 1: anX + bnY = cn (or 2: for 3 unknowns)',
      note: 'Enter matrix coefficients sequentially row by row. Press [=] to toggle x, y, and z values instantly.',
    },
    boardTrap:
      'Entering constants on the left side (e.g. ax + by + c = 0) without moving c to the right side (cn). Casio EQN mode expects ax + by = c!',
    exampleProblem: {
      statement: 'Solve the system: 2x - 3y = 7 and 4x + y = 21',
      steps: [
        { text: 'Compute coefficient determinant Δ:', latex: '\\Delta = \\begin{vmatrix} 2 & -3 \\\\ 4 & 1 \\end{vmatrix} = (2)(1) - (-3)(4) = 2 + 12 = 14' },
        { text: 'Compute x-determinant Δ_x by substituting constants [7, 21]:', latex: '\\Delta_x = \\begin{vmatrix} 7 & -3 \\\\ 21 & 1 \\end{vmatrix} = (7)(1) - (-3)(21) = 7 + 63 = 70' },
        { text: 'Compute y-determinant Δ_y:', latex: '\\Delta_y = \\begin{vmatrix} 2 & 7 \\\\ 4 & 21 \\end{vmatrix} = (2)(21) - (7)(4) = 42 - 28 = 14' },
        { text: 'Apply Cramer’s ratio:', latex: 'x = \\frac{\\Delta_x}{\\Delta} = \\frac{70}{14} = 5, \\quad y = \\frac{\\Delta_y}{\\Delta} = \\frac{14}{14} = 1' },
      ],
      answer: 'x = 5, \\; y = 1',
    },
  },
  {
    id: 'uniform-motion',
    title: 'Uniform Motion & Pursuit Problems',
    subtitle: 'Distance = Rate × Time (Opposite Directions, Round Trips, and Current/Wind Drift)',
    badge: 'Classic Word Problem',
    summary:
      'Motion problems require establishing a consistent variable for time or distance. In river/aircraft problems, the medium rate adds or subtracts from the vehicle still rate: v_effective = v_still ± v_stream.',
    latexFormula: 'd = r \\cdot t \\quad \\iff \\quad t = \\frac{d}{r}',
    corePrinciples: [
      'With the wind / downstream: Effective speed = (v + w).',
      'Against the wind / upstream: Effective speed = (v - w).',
      'Round-trip travel (same distance d): Time ratio is inversely proportional to speeds: t_1 / t_2 = r_2 / r_1.',
      'Opposite directions moving apart: Combined relative rate = r_1 + r_2.',
    ],
    casioMethod: {
      model: 'General Table / Solver',
      keystrokes: 'Express in terms of single variable t and use SHIFT + SOLVE',
      note: 'Equate distance expressions d1 = d2 or sum of distances d1 + d2 = D_total.',
    },
    boardTrap:
      'Average speed for a round trip is NOT the arithmetic mean (r1 + r2)/2! It is the harmonic mean: 2*r1*r2 / (r1 + r2).',
    exampleProblem: {
      statement:
        'A motorboat travels 24 km upstream against a current in 3 hours. The return trip downstream takes 2 hours. What is the boat speed in still water and the current rate?',
      steps: [
        { text: 'Let v = boat speed in still water (km/h), c = speed of current (km/h).' },
        { text: 'Upstream speed:', latex: 'v - c = \\frac{24\\text{ km}}{3\\text{ h}} = 8\\text{ km/h}' },
        { text: 'Downstream speed:', latex: 'v + c = \\frac{24\\text{ km}}{2\\text{ h}} = 12\\text{ km/h}' },
        { text: 'Add the two equations:', latex: '(v - c) + (v + c) = 8 + 12 \\implies 2v = 20 \\implies v = 10\\text{ km/h}' },
        { text: 'Substitute to find c:', latex: '10 + c = 12 \\implies c = 2\\text{ km/h}' },
      ],
      answer: 'v = 10\\text{ km/h (boat in still water)}, \\; c = 2\\text{ km/h (river current)}',
    },
  },
  {
    id: 'work-mixture',
    title: 'Work, Rate & Mixture Problems',
    subtitle: 'Reciprocal Work Rates, Pipes/Tanks, and Conservation of Mass',
    badge: 'High Frequency',
    summary:
      'Work problems express rate as fractional job completed per unit time: Rate = 1/T. Mixture problems enforce conservation of pure solute: (Amount 1)(Conc 1) + (Amount 2)(Conc 2) = (Total Amount)(Final Conc).',
    latexFormula: '\\frac{1}{A} + \\frac{1}{B} = \\frac{1}{T_{\\text{combined}}} \\quad \\text{and} \\quad C_1 V_1 + C_2 V_2 = C_f(V_1 + V_2)',
    corePrinciples: [
      'Inlet pipe adds (+1/t_in), drain or leak subtracts (-1/t_out).',
      'If A works for 2 hours and B joins for x hours: 2(1/A) + x(1/A + 1/B) = 1 (complete job).',
      'For mixtures, pure water has 0% concentration; pure solute/acid has 100% (1.00).',
    ],
    casioMethod: {
      model: 'Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) PLUS / CW',
      keystrokes: '(1/A + 1/B)^(-1)',
      note: 'For simple two-worker simultaneous jobs, just compute (A^-1 + B^-1)^-1 on the home screen.',
    },
    boardTrap:
      'Adding completion times directly (e.g. if A takes 4h and B takes 6h, writing 4+6=10h). Together they must finish FASTER than the fastest worker: 4*6/(4+6) = 2.4 hours!',
    exampleProblem: {
      statement:
        'A chemist has 30 liters of a 20% acid solution. How many liters of pure 80% acid solution must be added to obtain a 50% solution?',
      steps: [
        { text: 'Let x = liters of 80% acid added.' },
        { text: 'Set up conservation of pure acid equation:', latex: '(0.20)(30) + (0.80)(x) = (0.50)(30 + x)' },
        { text: 'Multiply through to clear decimals:', latex: '6 + 0.80x = 15 + 0.50x' },
        { text: 'Isolate x on left side:', latex: '0.80x - 0.50x = 15 - 6 \\implies 0.30x = 9' },
        { text: 'Solve for x:', latex: 'x = \\frac{9}{0.30} = 30\\text{ liters}' },
      ],
      answer: '30\\text{ liters of 80% acid solution}',
    },
  },
];
