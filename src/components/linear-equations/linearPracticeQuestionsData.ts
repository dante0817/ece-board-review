export interface LinearPracticeQuestion {
  id: string;
  subskill: 'Single Variable' | '2x2 & 3x3 Systems' | 'Motion & Pursuit' | 'Work & Pipes' | 'Mixture & Age';
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  question: string;
  latexEquation?: string;
  options: {
    id: string;
    text: string;
    latex?: string;
  }[];
  correctOptionId: string;
  explanation: string;
  stepByStepDerivation: {
    step: string;
    latex?: string;
  }[];
  casioShortcut?: string;
  boardExamTip: string;
}

export const LINEAR_PRACTICE_QUESTIONS: LinearPracticeQuestion[] = [
  {
    id: 'lp-1',
    subskill: 'Single Variable',
    difficulty: 'Easy',
    question: 'Solve for x in the equation: 5(2x - 3) - 3(x + 4) = 4(x - 2) - 7',
    options: [
      { id: 'A', text: 'x = 4' },
      { id: 'B', text: 'x = 6' },
      { id: 'C', text: 'x = 8' },
      { id: 'D', text: 'x = 12' },
    ],
    correctOptionId: 'A',
    explanation: 'Expand both sides: 10x - 15 - 3x - 12 = 4x - 8 - 7 => 7x - 27 = 4x - 15. Subtract 4x and add 27: 3x = 12 => x = 4.',
    stepByStepDerivation: [
      { step: 'Expand left side: 10x - 15 - 3x - 12 = 7x - 27' },
      { step: 'Expand right side: 4x - 8 - 7 = 4x - 15' },
      { step: 'Equate: 7x - 27 = 4x - 15' },
      { step: 'Isolate variables: 3x = 12 => x = 4' },
    ],
    casioShortcut: 'Type 5(2X-3)-3(X+4)=4(X-2)-7 into fx-991, press SHIFT+CALC [SOLVE] = 4.',
    boardExamTip: 'Distributing negative numbers (-3*(+4) = -12) is the #1 place examinees drop signs.',
  },
  {
    id: 'lp-2',
    subskill: 'Single Variable',
    difficulty: 'Moderate',
    question: 'Find the solution to the fractional linear equation:',
    latexEquation: '\\frac{3x + 1}{4} - \\frac{x - 1}{2} = 1',
    options: [
      { id: 'A', text: 'x = 1' },
      { id: 'B', text: 'x = 2' },
      { id: 'C', text: 'x = -1' },
      { id: 'D', text: 'x = 3' },
    ],
    correctOptionId: 'A',
    explanation: 'Multiply all terms by LCD = 4: (3x + 1) - 2(x - 1) = 4. Expand: 3x + 1 - 2x + 2 = 4 => x + 3 = 4 => x = 1.',
    stepByStepDerivation: [
      { step: 'LCD of 4 and 2 is 4. Multiply entire equation by 4.' },
      { step: 'Expand: (3x + 1) - 2(x - 1) = 4' },
      { step: 'Distribute negative sign: 3x + 1 - 2x + 2 = 4' },
      { step: 'Combine like terms: x + 3 = 4 => x = 1' },
    ],
    casioShortcut: 'Solve (3X+1)/4 - (X-1)/2 = 1 using SHIFT+CALC [SOLVE] = 1.',
    boardExamTip: 'Always check that every single term on both sides, including isolated integers, is multiplied by the LCD.',
  },
  {
    id: 'lp-3',
    subskill: '2x2 & 3x3 Systems',
    difficulty: 'Moderate',
    question: 'Solve for y in the system of equations using determinants (Cramer’s Rule):',
    latexEquation: '\\begin{cases} 3x + 2y = 13 \\\\ 5x - 4y = 7 \\end{cases}',
    options: [
      { id: 'A', text: 'y = 2' },
      { id: 'B', text: 'y = 3' },
      { id: 'C', text: 'y = 4' },
      { id: 'D', text: 'y = -1' },
    ],
    correctOptionId: 'A',
    explanation: 'Δ = (3)(-4) - (2)(5) = -12 - 10 = -22. Δ_y = (3)(7) - (13)(5) = 21 - 65 = -44. y = Δ_y / Δ = -44 / -22 = 2. Also x = Δ_x / Δ = [(-13*4 - 7*2) / -22] = (-52 - 14) / -22 = -66 / -22 = 3.',
    stepByStepDerivation: [
      { step: 'Main determinant Δ:', latex: '\\Delta = \\begin{vmatrix} 3 & 2 \\\\ 5 & -4 \\end{vmatrix} = -12 - 10 = -22' },
      { step: 'y determinant Δ_y (replace column 2 with constants):', latex: '\\Delta_y = \\begin{vmatrix} 3 & 13 \\\\ 5 & 7 \\end{vmatrix} = 21 - 65 = -44' },
      { step: 'Evaluate ratio:', latex: 'y = \\frac{-44}{-22} = 2' },
    ],
    casioShortcut: 'MODE 5 -> 1: a=3, b=2, c=13; a=5, b=-4, c=7. Press = -> X=3, Y=2 in 4 seconds.',
    boardExamTip: 'For ECE board exam multiple choice questions with 2 equations, Casio MODE 5 1 solves it 10x faster than hand elimination.',
  },
  {
    id: 'lp-4',
    subskill: '2x2 & 3x3 Systems',
    difficulty: 'Hard',
    question: 'For what value of parameter k will the following system have NO solution (inconsistent)?',
    latexEquation: '\\begin{cases} 2x - 5y = 8 \\\\ 6x + ky = 15 \\end{cases}',
    options: [
      { id: 'A', text: 'k = -15' },
      { id: 'B', text: 'k = 15' },
      { id: 'C', text: 'k = -10' },
      { id: 'D', text: 'k = 10' },
    ],
    correctOptionId: 'A',
    explanation: 'A 2x2 linear system has no solution when the coefficient lines are parallel (slopes equal, Δ = 0) but intercepts are different (ratios a1/a2 = b1/b2 ≠ c1/c2). 2/6 = -5/k => 1/3 = -5/k => k = -15. Check constants: 8/15 ≠ 1/3, confirming inconsistency.',
    stepByStepDerivation: [
      { step: 'Inconsistency requires parallel lines: a1/a2 = b1/b2 ≠ c1/c2' },
      { step: 'Set determinant Δ = 0:', latex: '2(k) - (-5)(6) = 0 \\implies 2k + 30 = 0 \\implies k = -15' },
      { step: 'Verify constant ratio: 2/6 = 1/3, while 8/15 ≠ 1/3. Hence, no solution exists.' },
    ],
    boardExamTip: 'If the constant ratio also matched (e.g. 8/24 = 1/3), the system would have infinitely many solutions (dependent) rather than no solution.',
  },
  {
    id: 'lp-5',
    subskill: 'Motion & Pursuit',
    difficulty: 'Moderate',
    question:
      'A drone flies from station A to B with a tailwind of 20 kph in 2 hours. Returning against the same wind, the trip takes 3 hours. What is the drone’s cruising speed in calm air?',
    options: [
      { id: 'A', text: '100 kph' },
      { id: 'B', text: '80 kph' },
      { id: 'C', text: '120 kph' },
      { id: 'D', text: '60 kph' },
    ],
    correctOptionId: 'A',
    explanation: 'Let v = drone speed. Distance is the same in both directions: d = (v + 20)*2 = (v - 20)*3 => 2v + 40 = 3v - 60 => v = 100 kph.',
    stepByStepDerivation: [
      { step: 'Distance with tailwind: d = (v + 20) * 2' },
      { step: 'Distance against headwind: d = (v - 20) * 3' },
      { step: 'Equate distances: 2v + 40 = 3v - 60' },
      { step: 'Solve for v: 3v - 2v = 40 + 60 => v = 100 kph' },
    ],
    casioShortcut: 'Solve (X+20)*2 = (X-20)*3 using SHIFT+SOLVE -> X=100.',
    boardExamTip: 'Tailwind adds to airspeed; headwind subtracts from airspeed.',
  },
  {
    id: 'lp-6',
    subskill: 'Work & Pipes',
    difficulty: 'Moderate',
    question:
      'Technician Juan can calibrate a radar station in 12 hours. His senior colleague Rommel can do it in 8 hours. If Juan works alone for 3 hours and then Rommel joins him, how many more hours will it take to finish the calibration?',
    options: [
      { id: 'A', text: '3.6 hours' },
      { id: 'B', text: '4.2 hours' },
      { id: 'C', text: '5.0 hours' },
      { id: 'D', text: '2.8 hours' },
    ],
    correctOptionId: 'A',
    explanation: 'Juan completes 3 * (1/12) = 1/4 of the job. Remaining work = 1 - 1/4 = 3/4. Working together, their combined rate is 1/12 + 1/8 = 2/24 + 3/24 = 5/24 job/hr. Time required = (3/4) / (5/24) = (3/4) * (24/5) = 18/5 = 3.6 hours.',
    stepByStepDerivation: [
      { step: 'Juan’s rate = 1/12, Rommel’s rate = 1/8' },
      { step: 'Work completed by Juan in first 3 hours = 3 * (1/12) = 1/4' },
      { step: 'Remaining work = 1 - 1/4 = 3/4' },
      { step: 'Combined hourly rate = 1/12 + 1/8 = 5/24' },
      { step: 'Time needed = (3/4) / (5/24) = 18/5 = 3.6 hours' },
    ],
    casioShortcut: '(1 - 3/12) / (1/12 + 1/8) = 18/5 = 3.6 directly on Casio.',
    boardExamTip: 'Always calculate the remaining portion of work before dividing by the joint rate.',
  },
  {
    id: 'lp-7',
    subskill: 'Mixture & Age',
    difficulty: 'Moderate',
    question:
      'A father is currently four times as old as his daughter. In 18 years, the father will be only twice as old as his daughter will be then. How old is the daughter today?',
    options: [
      { id: 'A', text: '9 years old' },
      { id: 'B', text: '12 years old' },
      { id: 'C', text: '8 years old' },
      { id: 'D', text: '10 years old' },
    ],
    correctOptionId: 'A',
    explanation: 'Let D = daughter’s current age, F = father’s current age = 4D. In 18 years: F + 18 = 2(D + 18) => 4D + 18 = 2D + 36 => 2D = 18 => D = 9 years old.',
    stepByStepDerivation: [
      { step: 'Current ages: Daughter = D, Father = 4D' },
      { step: 'Ages in 18 years: Daughter = D + 18, Father = 4D + 18' },
      { step: 'Set up future ratio: 4D + 18 = 2(D + 18)' },
      { step: 'Expand and solve: 4D + 18 = 2D + 36 => 2D = 18 => D = 9' },
    ],
    casioShortcut: 'Test options or solve 4X+18=2(X+18) in SOLVE mode -> X=9.',
    boardExamTip: 'Remember to add the elapsed years (+18) to BOTH persons, not just one.',
  },
  {
    id: 'lp-8',
    subskill: 'Mixture & Age',
    difficulty: 'Hard',
    question:
      'How many liters of pure alcohol must be added to 40 liters of a 15% alcohol antiseptic to create a 32% medical grade sanitizer?',
    options: [
      { id: 'A', text: '10.0 liters' },
      { id: 'B', text: '8.5 liters' },
      { id: 'C', text: '12.0 liters' },
      { id: 'D', text: '15.0 liters' },
    ],
    correctOptionId: 'A',
    explanation: 'Conservation of pure alcohol: 0.15(40) + 1.00(x) = 0.32(40 + x) => 6 + x = 12.8 + 0.32x => 0.68x = 6.8 => x = 10 liters.',
    stepByStepDerivation: [
      { step: 'Pure alcohol initially: 0.15 * 40 = 6 liters' },
      { step: 'Alcohol added = 1.00 * x liters (pure = 100%)' },
      { step: 'Equation: 6 + x = 0.32(40 + x) = 12.8 + 0.32x' },
      { step: 'Isolate x: 1x - 0.32x = 12.8 - 6 => 0.68x = 6.8 => x = 10 liters' },
    ],
    casioShortcut: '0.15*40 + X = 0.32(40+X) -> SHIFT SOLVE -> X = 10.',
    boardExamTip: 'Pure substance is 100% (1.00). Pure water or solvent is 0% (0.00).',
  },
];
