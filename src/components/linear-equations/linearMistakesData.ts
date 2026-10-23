export interface LinearMistakeItem {
  id: number;
  date: string;
  category: 'SIGN / ALGEBRA ERROR' | 'METHOD ERROR' | 'FORMULA RECALL' | 'CASIO INPUT ERROR';
  subskill: string;
  problemLatex: string;
  problemText: string;
  yourAnswerLatex: string;
  correctAnswerLatex: string;
  whatWentWrong: string;
  examTrapWarning: string;
  calculatorFix: string;
  similarProblemId: string;
}

export const LINEAR_MISTAKES_DATA: LinearMistakeItem[] = [
  {
    id: 1,
    date: 'Sep 9, 2024',
    category: 'SIGN / ALGEBRA ERROR',
    subskill: 'Single Variable',
    problemLatex: '\\text{Solve: } 5 - 3(2x - 7) = 4(x + 1) - 2',
    problemText: 'Solve for x without dropping signs during binomial distribution:',
    yourAnswerLatex: 'x = -2.2',
    correctAnswerLatex: 'x = 2.4 \\;\\left(\\frac{12}{5}\\right)',
    whatWentWrong:
      'Distributed -3 into (2x - 7) and wrote -6x - 21 instead of -6x + 21. A negative multiplied by a negative MUST yield a positive.',
    examTrapWarning: 'Never skip writing out the intermediate step: -3 · (-7) = +21.',
    calculatorFix: 'Use fx-991 [ALPHA] [=] and [SHIFT] [SOLVE] to verify your sign expansion in 5 seconds.',
    similarProblemId: 'sim-mistake-1',
  },
  {
    id: 2,
    date: 'Sep 7, 2024',
    category: 'METHOD ERROR',
    subskill: '2x2 & 3x3 Systems',
    problemLatex: '\\begin{cases} 3x - 6y = 12 \\\\ x - 2y = 4 \\end{cases}',
    problemText: 'Determine the nature of solutions for the simultaneous linear system:',
    yourAnswerLatex: '\\text{No Solution (Inconsistent)}',
    correctAnswerLatex: '\\text{Infinitely Many Solutions (Dependent System)}',
    whatWentWrong:
      'Saw that Δ = 0 (3*(-2) - (-6)*(1) = -6 + 6 = 0) and jumped to "No solution". But dividing equation 1 by 3 gives x - 2y = 4, exactly matching equation 2!',
    examTrapWarning: 'When Δ = 0, check the constant terms! If the equations are identical multiples, solutions are INFINITE, not zero.',
    calculatorFix: 'Casio MODE 5 -> 1 shows "Infinite Soln" for dependent systems and "No Solution" for parallel lines.',
    similarProblemId: 'sim-mistake-2',
  },
  {
    id: 3,
    date: 'Sep 4, 2024',
    category: 'FORMULA RECALL',
    subskill: 'Motion & Pursuit',
    problemLatex: 'v_{\\text{average}} = \\frac{2 v_1 v_2}{v_1 + v_2}',
    problemText:
      'An engineer drives to a transmitter station at 40 kph and returns along the exact same road at 60 kph. Find the average speed for the round trip.',
    yourAnswerLatex: 'v_{\\text{avg}} = 50\\text{ kph}',
    correctAnswerLatex: 'v_{\\text{avg}} = 48\\text{ kph}',
    whatWentWrong:
      'Averaged the two velocities using arithmetic mean (40 + 60)/2 = 50. Since the distance is constant, average speed is the Harmonic Mean, because more time was spent at the slower speed.',
    examTrapWarning: 'The board exam will ALWAYS put 50 kph as Option A to trap examinees using the arithmetic average!',
    calculatorFix: 'Casio formula: 2 / (1/40 + 1/60) = 48 kph directly on textbook display.',
    similarProblemId: 'sim-linear-3',
  },
  {
    id: 4,
    date: 'Sep 1, 2024',
    category: 'CASIO INPUT ERROR',
    subskill: '2x2 & 3x3 Systems',
    problemLatex: '\\begin{cases} 2x + 3y + 12 = 0 \\\\ 5x - y - 4 = 0 \\end{cases}',
    problemText: 'Solve for x and y using Casio MODE 5 EQN:',
    yourAnswerLatex: 'x = 0, y = -4',
    correctAnswerLatex: 'x = 0, y = -4 \\text{ (wait: with correct form } 2x+3y=-12 \\text{ and } 5x-y=4 \\implies x=0, y=-4)',
    whatWentWrong:
      'Entered constants as +12 and -4 directly into column C without transposing them to the right-hand side. Casio expects ax + by = c, meaning c1 = -12 and c2 = +4!',
    examTrapWarning: 'Always rearrange equations to ax + by = c BEFORE pressing keys in MODE 5 EQN.',
    calculatorFix: 'Verify that the constant term sits alone on the right of the equal sign.',
    similarProblemId: 'sim-linear-2',
  },
];
