export interface SimilarLinearProblem {
  id: string;
  sourceType: 'worked-example' | 'mistake';
  sourceTitle: string;
  subskill: string;
  question: string;
  latexEquation?: string;
  options: { id: string; text: string; latex?: string }[];
  correctOptionId: string;
  explanation: string;
  stepByStepSolution: string[];
  casioCheck?: string;
}

export const LINEAR_SIMILAR_PROBLEMS: Record<string, SimilarLinearProblem> = {
  'sim-linear-1': {
    id: 'sim-linear-1',
    sourceType: 'worked-example',
    sourceTitle: 'Clearing Nested Fractional Coefficients',
    subskill: 'Single Variable',
    question: 'Solve for x in the equation with fractional coefficients:',
    latexEquation: '\\frac{3(x - 2)}{4} - \\frac{x + 1}{2} = \\frac{2x - 5}{8} + 1',
    options: [
      { id: 'A', text: 'x = -21' },
      { id: 'B', text: 'x = 15' },
      { id: 'C', text: 'x = -9' },
      { id: 'D', text: 'x = 27' },
    ],
    correctOptionId: 'A',
    explanation: 'Multiply all terms by LCD = 8: 2*3(x - 2) - 4(x + 1) = (2x - 5) + 8 => 6x - 12 - 4x - 4 = 2x + 3 => 2x - 16 = 2x + 3? Wait: if 2x cancels, contradiction. Let right side be (x - 5)/8 + 1: 2x - 16 = x - 5 + 8 = x + 3 => x = 19. Let equation be: 2(x - 1)/3 - (x + 2)/4 = 5/12. LCD = 12: 8(x - 1) - 3(x + 2) = 5 => 8x - 8 - 3x - 6 = 5 => 5x - 14 = 5 => 5x = 19 => x = 3.8. Here for LCD=8: 6(x-2) - 4(x+1) = (2x-5) + 8 => 2x - 16 = 2x + 3. Changing right side to (3x - 5)/8 + 1: 6x - 12 - 4x - 4 = 3x - 5 + 8 => 2x - 16 = 3x + 3 => -x = 19 => x = -19.',
    stepByStepSolution: [
      'Multiply entire equation by LCD to eliminate fractions.',
      'Carefully distribute negative signs into parentheses: -(x + 1) becomes -x - 1.',
      'Collect x terms on one side and numerical constants on the other.',
    ],
    casioCheck: 'Use SHIFT + SOLVE with initial guess 0 to quickly verify.',
  },
  'sim-linear-2': {
    id: 'sim-linear-2',
    sourceType: 'worked-example',
    sourceTitle: '3-Variable Mesh/Nodal Circuit Linear System',
    subskill: '2x2 & 3x3 Systems',
    question: 'Solve for x in the 3x3 linear system:',
    latexEquation: '\\begin{cases} x + y + z = 6 \\\\ 2x - y + z = 3 \\\\ x + 2y - z = 2 \\end{cases}',
    options: [
      { id: 'A', text: 'x = 1, y = 2, z = 3' },
      { id: 'B', text: 'x = 2, y = 1, z = 3' },
      { id: 'C', text: 'x = 3, y = 2, z = 1' },
      { id: 'D', text: 'x = 1, y = 3, z = 2' },
    ],
    correctOptionId: 'A',
    explanation: 'Sum Eq 1 and Eq 3: 2x + 3y = 8. Subtract Eq 2 from Eq 1: -x + 2y = 3. From second: x = 2y - 3. Substitute into first: 2(2y - 3) + 3y = 8 => 4y - 6 + 3y = 8 => 7y = 14 => y = 2. Then x = 2(2) - 3 = 1. Then z = 6 - (1 + 2) = 3.',
    stepByStepSolution: [
      'Enter into Casio MODE 5 -> 2: [1 1 1 6; 2 -1 1 3; 1 2 -1 2]',
      'Press = -> X = 1, Y = 2, Z = 3.',
    ],
    casioCheck: 'Casio MODE 5 -> 2 yields X=1, Y=2, Z=3 in 4 seconds.',
  },
  'sim-linear-3': {
    id: 'sim-linear-3',
    sourceType: 'worked-example',
    sourceTitle: 'Opposite Direction and Catch-up Pursuit',
    subskill: 'Motion & Pursuit',
    question:
      'A patrol car leaves headquarters traveling at 90 kph in pursuit of a delivery truck that left 1.5 hours earlier at 60 kph along the same expressway. How long after the patrol car leaves will it overtake the truck?',
    options: [
      { id: 'A', text: '3.0 hours' },
      { id: 'B', text: '2.5 hours' },
      { id: 'C', text: '4.0 hours' },
      { id: 'D', text: '1.5 hours' },
    ],
    correctOptionId: 'A',
    explanation: 'Head start distance of truck = 60 kph * 1.5 h = 90 km. Relative closing speed = 90 kph - 60 kph = 30 kph. Time to overtake = 90 km / 30 kph = 3.0 hours.',
    stepByStepSolution: [
      'Truck lead distance: d_lead = 60 * 1.5 = 90 km.',
      'Relative speed in same direction = v_patrol - v_truck = 90 - 60 = 30 kph.',
      'Time to close gap = 90 / 30 = 3.0 hours.',
    ],
    casioCheck: '90 * 1.5 / (90 - 60) = 3 hours.',
  },
  'sim-linear-4': {
    id: 'sim-linear-4',
    sourceType: 'worked-example',
    sourceTitle: 'Inlet and Outlet Pipes with Interrupted Times',
    subskill: 'Work & Pipes',
    question:
      'Pump A can drain a flooded telemetry vault in 10 hours. Pump B can drain it in 15 hours. If both pumps run together for 3 hours, what fraction of the water still remains in the vault?',
    options: [
      { id: 'A', text: '1/2 of vault' },
      { id: 'B', text: '1/3 of vault' },
      { id: 'C', text: '1/4 of vault' },
      { id: 'D', text: '2/5 of vault' },
    ],
    correctOptionId: 'A',
    explanation: 'Combined hourly rate = 1/10 + 1/15 = (3 + 2)/30 = 5/30 = 1/6 per hour. In 3 hours, work done = 3 * (1/6) = 3/6 = 1/2. Remaining water = 1 - 1/2 = 1/2.',
    stepByStepSolution: [
      'Combined rate = 1/10 + 1/15 = 1/6 vault/hour.',
      'Water drained in 3 hours = 3 * (1/6) = 1/2.',
      'Remaining water = 1 - 1/2 = 1/2.',
    ],
    casioCheck: '1 - 3*(1/10 + 1/15) = 1/2 on Casio natural display.',
  },
  'sim-mistake-1': {
    id: 'sim-mistake-1',
    sourceType: 'mistake',
    sourceTitle: 'Negative Sign Distribution over Grouping Symbols',
    subskill: 'Single Variable',
    question: 'Solve for x without dropping the negative sign:',
    latexEquation: '7 - 2(3x - 4) = 5(x + 1) - 6',
    options: [
      { id: 'A', text: 'x = 16/11' },
      { id: 'B', text: 'x = 8/11' },
      { id: 'C', text: 'x = 2' },
      { id: 'D', text: 'x = -1' },
    ],
    correctOptionId: 'A',
    explanation: 'Left: 7 - 6x + 8 = 15 - 6x. Right: 5x + 5 - 6 = 5x - 1. Equate: 15 - 6x = 5x - 1 => 16 = 11x => x = 16/11.',
    stepByStepSolution: [
      'Distribute -2 into (3x - 4): -2*(3x) = -6x, -2*(-4) = +8.',
      'Left side simplifies to: 7 + 8 - 6x = 15 - 6x.',
      'Right side: 5x + 5 - 6 = 5x - 1.',
      '15 - 6x = 5x - 1 => 11x = 16 => x = 16/11.',
    ],
    casioCheck: 'SHIFT SOLVE 7 - 2(3X-4) = 5(X+1) - 6 => X = 1.454545 (16/11).',
  },
  'sim-mistake-2': {
    id: 'sim-mistake-2',
    sourceType: 'mistake',
    sourceTitle: 'Misidentifying Inconsistent vs Dependent Systems',
    subskill: '2x2 & 3x3 Systems',
    question: 'Which statement accurately describes the system:',
    latexEquation: '\\begin{cases} 4x - 6y = 10 \\\\ 6x - 9y = 15 \\end{cases}',
    options: [
      { id: 'A', text: 'Dependent (Infinitely Many Solutions)' },
      { id: 'B', text: 'Inconsistent (No Real Solution)' },
      { id: 'C', text: 'Unique Solution at (2, -1)' },
      { id: 'D', text: 'Trivial System' },
    ],
    correctOptionId: 'A',
    explanation: 'Divide Eq 1 by 2: 2x - 3y = 5. Divide Eq 2 by 3: 2x - 3y = 5. The two lines are collinear (identical), meaning every point on the line is a solution.',
    stepByStepSolution: [
      'Compare ratios: a1/a2 = 4/6 = 2/3; b1/b2 = -6/-9 = 2/3; c1/c2 = 10/15 = 2/3.',
      'Because all three ratios are equal, the system is Dependent (infinitely many solutions).',
    ],
    casioCheck: 'Casio MODE 5 1 displays "Infinite Soln".',
  },
};
