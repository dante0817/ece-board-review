export interface LinearWorkedExample {
  id: string;
  category: 'Single Variable' | '2x2 & 3x3 Systems' | 'Motion & Pursuit' | 'Work & Pipes' | 'Mixture & Investment';
  title: string;
  boardExamTag: string; // e.g. "PRC ECE Board Oct 2021"
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  problemLatex: string;
  problemText: string;
  prerequisites: string[];
  steps: {
    stepNumber: number;
    stepTitle: string;
    explanation: string;
    latexEquation?: string;
    proTip?: string;
  }[];
  finalAnswerLatex: string;
  finalAnswerText: string;
  casioHack?: {
    model: string;
    keystrokes: string;
    display: string;
    explanation: string;
  };
  examinerTrap: string;
  similarProblemId: string;
}

export const LINEAR_WORKED_EXAMPLES: LinearWorkedExample[] = [
  {
    id: 'we-linear-1',
    category: 'Single Variable',
    title: 'Clearing Nested Fractional Coefficients',
    boardExamTag: 'ECE Board Exam Style (Algebra)',
    difficulty: 'Moderate',
    problemLatex: '\\frac{2(x - 3)}{5} - \\frac{3(x + 1)}{4} = \\frac{1}{2} - \\frac{x - 4}{10}',
    problemText: 'Solve for x in the multi-fraction linear equation:',
    prerequisites: ['Finding LCM of {5, 4, 2, 10} = 20', 'Distributing negative signs across numerators'],
    steps: [
      {
        stepNumber: 1,
        stepTitle: 'Determine the Global Least Common Denominator',
        explanation: 'Identify the LCM of 5, 4, 2, and 10. The smallest positive integer divisible by all four is 20.',
        latexEquation: '\\text{LCD} = \\text{LCM}(5, 4, 2, 10) = 20',
      },
      {
        stepNumber: 2,
        stepTitle: 'Multiply Every Term by the LCD',
        explanation: 'Distribute 20 to every term on both left and right sides of the equation.',
        latexEquation: '20 \\cdot \\frac{2(x - 3)}{5} - 20 \\cdot \\frac{3(x + 1)}{4} = 20 \\cdot \\frac{1}{2} - 20 \\cdot \\frac{x - 4}{10}',
      },
      {
        stepNumber: 3,
        stepTitle: 'Simplify Coefficients Before Expanding',
        explanation: 'Reduce: 20/5 = 4; 20/4 = 5; 20/2 = 10; 20/10 = 2.',
        latexEquation: '4 \\cdot 2(x - 3) - 5 \\cdot 3(x + 1) = 10 - 2(x - 4) \\implies 8(x - 3) - 15(x + 1) = 10 - 2(x - 4)',
        proTip: 'Keep parentheses around numerators during this intermediate step to prevent sign errors!',
      },
      {
        stepNumber: 4,
        stepTitle: 'Expand and Distribute Negatives',
        explanation: 'Expand each product carefully. Notice -15(x + 1) becomes -15x - 15 and -2(x - 4) becomes -2x + 8.',
        latexEquation: '8x - 24 - 15x - 15 = 10 - 2x + 8',
      },
      {
        stepNumber: 5,
        stepTitle: 'Combine Like Terms and Isolate x',
        explanation: 'Combine variables and constants on each side, then collect all x terms on the left.',
        latexEquation: '-7x - 39 = 18 - 2x \\implies -7x + 2x = 18 + 39 \\implies -5x = 57',
      },
      {
        stepNumber: 6,
        stepTitle: 'Final Division',
        explanation: 'Divide both sides by -5 to find the exact rational value.',
        latexEquation: 'x = -\\frac{57}{5} = -11.4',
      },
    ],
    finalAnswerLatex: 'x = -\\frac{57}{5} = -11.4',
    finalAnswerText: 'x = -57/5 or -11.4',
    casioHack: {
      model: 'fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) / CW Solver',
      keystrokes: 'Enter equation using ALPHA [X] & ALPHA [=] -> SHIFT [SOLVE] -> [0] -> [=]',
      display: 'X = -11.4, L-R = 0',
      explanation: 'Takes 5 seconds to verify on Casio fx-991 without writing down a single line of paper algebra.',
    },
    examinerTrap: 'Forgetting to distribute the negative sign into (x - 4), producing -2x - 8 instead of -2x + 8.',
    similarProblemId: 'sim-linear-1',
  },
  {
    id: 'we-linear-2',
    category: '2x2 & 3x3 Systems',
    title: '3-Variable Mesh/Nodal Circuit Linear System',
    boardExamTag: 'PRC ECE Board Exam (Circuits / Math)',
    difficulty: 'Hard',
    problemLatex: '\\begin{cases} 2I_1 - I_2 + 3I_3 = 9 \\\\ I_1 + 2I_2 - I_3 = 4 \\\\ 3I_1 + I_2 + 2I_3 = 13 \\end{cases}',
    problemText: 'Solve for currents I₁, I₂, and I₃ in the simultaneous 3x3 linear system:',
    prerequisites: ['Cramer’s Rule', '3x3 Matrix Determinant Expansion', 'Casio MODE 5 EQN 2'],
    steps: [
      {
        stepNumber: 1,
        stepTitle: 'Write Coefficient Matrix and Find Δ',
        explanation: 'Construct the 3x3 coefficient determinant Δ and expand along row 1.',
        latexEquation: '\\Delta = \\begin{vmatrix} 2 & -1 & 3 \\\\ 1 & 2 & -1 \\\\ 3 & 1 & 2 \\end{vmatrix} = 2(4 - (-1)) - (-1)(2 - (-3)) + 3(1 - 6) = 2(5) + 1(5) + 3(-5) = 10 + 5 - 15 = 0? \\text{ Wait: } 10+5-15 = 0 \\implies \\text{recheck minor: } \\Delta = 2(5) - (-1)(5) + 3(-5) = 0? \\text{Let minor } a_{31}=3: 2(4+1) - (-1)(2+3) + 3(1-6) = 10 + 5 - 15 = 0',
        proTip: 'When Δ = 0, the system is either dependent or inconsistent! Check if row 1 + row 2 = row 3:',
      },
      {
        stepNumber: 2,
        stepTitle: 'Recognize Linear Dependence in Circuit Loops',
        explanation: 'Add Eq. 1 and Eq. 2: (2I₁ - I₂ + 3I₃) + (I₁ + 2I₂ - I₃) = 3I₁ + I₂ + 2I₃ = 9 + 4 = 13! This matches Eq. 3 exactly!',
        latexEquation: '\\text{Row } 1 + \\text{Row } 2 = \\text{Row } 3 \\implies \\Delta = 0 \\text{ and } 13 = 13 \\implies \\text{Infinitely Many Solutions}',
      },
      {
        stepNumber: 3,
        stepTitle: 'Express in Terms of Free Parameter t',
        explanation: 'Let I₃ = t. Express I₁ and I₂ in terms of parameter t using the first two equations.',
        latexEquation: 'I_1 = \\frac{22 - 5t}{5}, \\quad I_2 = \\frac{t - 1}{5}, \\quad I_3 = t \\quad (t \\in \\mathbb{R})',
      },
    ],
    finalAnswerLatex: '\\text{Consistent and Dependent (Infinitely Many Solutions)}',
    finalAnswerText: 'Dependent System (Infinitely Many Solutions, Δ = 0)',
    casioHack: {
      model: 'Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) PLUS / CW',
      keystrokes: 'MODE -> 5: EQN -> 2 -> enter coefficients -> [=]',
      display: 'Infinite Soln (or Math ERROR if inconsistent)',
      explanation: 'ClassWiz and fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) warn of "Infinite Soln" immediately when Δ = 0 and constants match.',
    },
    examinerTrap: 'Blindly trying to solve without checking Δ = 0, wasting 10 minutes looking for unique numerical roots.',
    similarProblemId: 'sim-linear-2',
  },
  {
    id: 'we-linear-3',
    category: 'Motion & Pursuit',
    title: 'Opposite Direction and Catch-up Pursuit',
    boardExamTag: 'PRC ECE Board Exam General Math',
    difficulty: 'Moderate',
    problemLatex: 'd_1 + d_2 = 330 \\text{ km}, \\quad r_1 = 60\\text{ kph}, \\quad r_2 = 50\\text{ kph}',
    problemText:
      'Two transmission maintenance vans leave Manila and Baguio (330 km apart) at 8:00 AM traveling toward each other. Van A travels at 60 kph, while Van B travels at 50 kph. At what time will they meet?',
    prerequisites: ['d = r × t formula', 'Relative speed for converging bodies = r1 + r2'],
    steps: [
      {
        stepNumber: 1,
        stepTitle: 'Establish Relative Speed of Approach',
        explanation: 'Because both vehicles travel toward each other, the distance between them closes at the sum of their velocities.',
        latexEquation: 'r_{\\text{combined}} = r_1 + r_2 = 60\\text{ kph} + 50\\text{ kph} = 110\\text{ kph}',
      },
      {
        stepNumber: 2,
        stepTitle: 'Compute Time Until Meeting',
        explanation: 'Divide total separation distance by relative speed.',
        latexEquation: 't = \\frac{D}{r_{\\text{combined}}} = \\frac{330\\text{ km}}{110\\text{ kph}} = 3.0\\text{ hours}',
      },
      {
        stepNumber: 3,
        stepTitle: 'Add Elapsed Time to Departure Clock',
        explanation: 'Both vans departed at 8:00 AM. Adding 3 hours gives the exact meeting time.',
        latexEquation: '8:00\\text{ AM} + 3\\text{ hours} = 11:00\\text{ AM}',
      },
    ],
    finalAnswerLatex: 't = 3\\text{ hours} \\implies 11:00\\text{ AM}',
    finalAnswerText: '11:00 AM (after 3 hours of travel)',
    casioHack: {
      model: 'Casio Standard Calculation',
      keystrokes: '330 / (60 + 50) = 3 [hr]',
      display: '3',
      explanation: 'Takes 3 seconds on the basic arithmetic screen.',
    },
    examinerTrap: 'Subtracting speeds instead of adding them when objects are moving toward each other.',
    similarProblemId: 'sim-linear-3',
  },
  {
    id: 'we-linear-4',
    category: 'Work & Pipes',
    title: 'Inlet and Outlet Pipes with Interrupted Times',
    boardExamTag: 'ECE Board Exam Classic',
    difficulty: 'Moderate',
    problemLatex: '\\frac{1}{t_{\\text{inlet}}} - \\frac{1}{t_{\\text{drain}}} = \\frac{1}{t_{\\text{net}}}',
    problemText:
      'Pipe A can fill an antenna cooling reservoir in 6 hours. Pipe B can fill it in 8 hours, while drain pipe C can empty it in 12 hours. If Pipe A and B are opened together for 2 hours, and then drain C is also opened, how much additional time is needed to completely fill the reservoir?',
    prerequisites: ['Rate of work = 1 / time', 'Part of job = Rate × Time'],
    steps: [
      {
        stepNumber: 1,
        stepTitle: 'Define Individual Hourly Rates',
        explanation: 'Express each pipe’s capability as fraction of tank per hour.',
        latexEquation: 'R_A = \\frac{1}{6}, \\quad R_B = \\frac{1}{8}, \\quad R_C = -\\frac{1}{12} \\text{ (drain)}',
      },
      {
        stepNumber: 2,
        stepTitle: 'Calculate Reservoir Fraction Filled in First 2 Hours',
        explanation: 'Pipes A and B operate together for 2 hours before C is opened.',
        latexEquation: 'W_1 = 2 \\cdot \\left(\\frac{1}{6} + \\frac{1}{8}\\right) = 2 \\cdot \\left(\\frac{4 + 3}{24}\\right) = 2 \\cdot \\frac{7}{24} = \\frac{7}{12}',
      },
      {
        stepNumber: 3,
        stepTitle: 'Determine Remaining Work to Full Capacity',
        explanation: 'Total capacity is 1 (100%). Subtract the fraction already filled.',
        latexEquation: 'W_{\\text{remaining}} = 1 - \\frac{7}{12} = \\frac{5}{12}',
      },
      {
        stepNumber: 4,
        stepTitle: 'Compute Net Rate with Drain C Open',
        explanation: 'Combine all three pipe rates with the LCD = 24.',
        latexEquation: 'R_{\\text{all}} = \\frac{1}{6} + \\frac{1}{8} - \\frac{1}{12} = \\frac{4 + 3 - 2}{24} = \\frac{5}{24}\\text{ tank/hr}',
      },
      {
        stepNumber: 5,
        stepTitle: 'Solve for Additional Time t',
        explanation: 'Divide remaining work by the combined rate.',
        latexEquation: 't_{\\text{additional}} = \\frac{W_{\\text{remaining}}}{R_{\\text{all}}} = \\frac{5/12}{5/24} = \\frac{5}{12} \\cdot \\frac{24}{5} = 2\\text{ hours}',
      },
    ],
    finalAnswerLatex: 't_{\\text{additional}} = 2\\text{ hours}',
    finalAnswerText: '2 additional hours (Total time = 4 hours)',
    casioHack: {
      model: 'Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) / CW',
      keystrokes: '(1 - 2*(1/6 + 1/8)) / (1/6 + 1/8 - 1/12)',
      display: '2',
      explanation: 'Single-line entry on natural textbook display gives exact integer 2.',
    },
    examinerTrap: 'Adding the drain pipe rate instead of subtracting it from the net inflow.',
    similarProblemId: 'sim-linear-4',
  },
];
