/**
 * Real Numbers Sub-Topic Performance & Struggle Heatmap Engine
 * Tracks user quiz drill performance at granular sub-topic level,
 * computing a struggle index (0-100) and heat classification.
 */

export interface SubTopicPerformance {
  id: string; // e.g. 'sub-1-1'
  stepId: 1 | 2 | 3 | 4;
  stepTitle: string;
  code: string; // '1.1', '1.2', etc.
  name: string;
  fullTitle: string;
  description: string;
  keyFormula: string;
  boardTrap: string;
  questionIds: string[];
  attempts: number;
  correct: number;
  incorrect: number;
  recentResults: boolean[]; // last 5 results: true = correct, false = incorrect
  lastTestedDate: string | null;
}

export type StruggleLevel = 'critical' | 'moderate' | 'developing' | 'mastered' | 'untested';

export interface SubTopicHeatmapItem extends SubTopicPerformance {
  accuracy: number; // 0 - 100 percentage
  struggleScore: number; // 0 (no struggle/mastered) to 100 (maximum struggle)
  struggleLevel: StruggleLevel;
  errorRate: number; // 0 - 100 percentage
}

export interface StepHeatmapSummary {
  stepId: 1 | 2 | 3 | 4;
  stepTitle: string;
  averageStruggle: number;
  averageAccuracy: number;
  criticalCount: number;
  moderateCount: number;
  masteredCount: number;
  untestedCount: number;
  totalAttempts: number;
  subTopics: SubTopicHeatmapItem[];
}

export const HEATMAP_STORAGE_KEY = 'ece_real_numbers_subtopic_heatmap_v2';
export const HEATMAP_UPDATED_EVENT = 'real-numbers-heatmap-updated';

export const SUB_TOPICS_DEFINITIONS: Omit<SubTopicPerformance, 'attempts' | 'correct' | 'incorrect' | 'recentResults' | 'lastTestedDate'>[] = [
  // --- STEP 1: NUMBER SETS & HIERARCHY ---
  {
    id: 'sub-1-1',
    stepId: 1,
    stepTitle: 'Number Sets',
    code: '1.1',
    name: 'Zero & Natural vs. Whole',
    fullTitle: 'Zero Inclusion: Natural Numbers vs. Whole Numbers',
    description: 'Natural counting numbers ℕ = {1, 2, 3, ...} start at 1. Whole numbers W = {0, 1, 2, ...} include 0. Zero is whole and integer, but NOT natural.',
    keyFormula: '0 \\in \\mathbb{W}, \\quad 0 \\notin \\mathbb{N}, \\quad 0 \\in \\mathbb{Z}',
    boardTrap: 'Board exam questions often claim 0 is a natural number or positive. Zero is non-negative and even, but neither positive nor natural.',
    questionIds: ['s1-q1'],
  },
  {
    id: 'sub-1-2',
    stepId: 1,
    stepTitle: 'Number Sets',
    code: '1.2',
    name: 'Set Containment & Disjoint Sets',
    fullTitle: 'Subset Hierarchy: ℕ ⊂ W ⊂ ℤ ⊂ ℚ ⊂ ℝ',
    description: 'Strict hierarchical nested inclusion of standard sets, and the mutual disjointness of Rational (ℚ) and Irrational (ℝ \\ ℚ) numbers.',
    keyFormula: '\\mathbb{N} \\subset \\mathbb{W} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}, \\quad \\mathbb{Q} \\cap (\\mathbb{R} \\setminus \\mathbb{Q}) = \\emptyset',
    boardTrap: 'Assuming a number can belong to both ℚ and ℝ \\ ℚ. They are completely disjoint partition sets.',
    questionIds: ['s1-q2'],
  },
  {
    id: 'sub-1-3',
    stepId: 1,
    stepTitle: 'Number Sets',
    code: '1.3',
    name: 'Integers & Negative Inverses',
    fullTitle: 'Integers ℤ & Additive Inverses (No Fractional Parts)',
    description: 'Integers include whole numbers and negative whole numbers. Fractions like 1/2 or 0.75 are rational, but strictly NOT integers.',
    keyFormula: '\\mathbb{Z} = \\{..., -3, -2, -1, 0, 1, 2, 3, ...\\}',
    boardTrap: 'Assuming negative numbers with fractional parts (e.g. -2.5) are integers.',
    questionIds: ['s1-q3'],
  },
  {
    id: 'sub-1-4',
    stepId: 1,
    stepTitle: 'Number Sets',
    code: '1.4',
    name: 'Radicals Evaluating to Integers',
    fullTitle: 'Radicals with Perfect Square Radicands in ℤ',
    description: 'Negative square roots of perfect squares simplify into clean integers. For example, -√64 = -8, which belongs to ℤ.',
    keyFormula: '-\\sqrt{64} = -8 \\in \\mathbb{Z}',
    boardTrap: 'Assuming any expression carrying a radical sign (√) is automatically irrational before fully evaluating.',
    questionIds: ['s1-q4'],
  },

  // --- STEP 2: RATIONAL VS. IRRATIONAL ---
  {
    id: 'sub-2-1',
    stepId: 2,
    stepTitle: 'Rational vs. Irrational',
    code: '2.1',
    name: 'Non-Square Radicals vs. 22/7',
    fullTitle: 'True Irrationals vs. Rational Integer Ratios (22/7)',
    description: 'Square roots of non-perfect squares are non-terminating and non-repeating (irrational). 22/7 is a ratio of integers and strictly rational.',
    keyFormula: '\\sqrt{20} = 2\\sqrt{5} \\in \\mathbb{R} \\setminus \\mathbb{Q}, \\quad \\frac{22}{7} \\in \\mathbb{Q}',
    boardTrap: 'Believing 22/7 is irrational because it approximates π. 22/7 is an explicit ratio of integers a/b and therefore strictly rational.',
    questionIds: ['s2-q1'],
  },
  {
    id: 'sub-2-2',
    stepId: 2,
    stepTitle: 'Rational vs. Irrational',
    code: '2.2',
    name: 'Terminating Decimal Condition',
    fullTitle: 'Denominator Prime Factorization (b = 2ᵐ · 5ⁿ)',
    description: 'A reduced fraction a/b yields a terminating decimal iff the denominator prime factorization consists solely of powers of 2 and/or 5.',
    keyFormula: 'b = 2^m \\cdot 5^n \\iff \\text{Terminating Decimal}',
    boardTrap: 'Factoring the denominator before reducing the fraction to simplest terms (e.g., 21/30 = 7/10 terminates, even though 30 has factor 3).',
    questionIds: ['s2-q2'],
  },
  {
    id: 'sub-2-3',
    stepId: 2,
    stepTitle: 'Rational vs. Irrational',
    code: '2.3',
    name: 'Closure Properties & Counterexamples',
    fullTitle: 'Non-Closure of Irrationals under Arithmetic (+, −, ×, ÷)',
    description: 'The set of irrationals is NOT closed under any arithmetic operation. For example, √3 + (-√3) = 0 (rational) and √2 × √2 = 2 (rational).',
    keyFormula: '\\sqrt{3} + (-\\sqrt{3}) = 0 \\in \\mathbb{Q}, \\quad \\sqrt{2} \\cdot \\sqrt{2} = 2 \\in \\mathbb{Q}',
    boardTrap: 'Assuming irrational numbers form an algebraic field closed under addition or multiplication.',
    questionIds: ['s2-q3'],
  },
  {
    id: 'sub-2-4',
    stepId: 2,
    stepTitle: 'Rational vs. Irrational',
    code: '2.4',
    name: 'Repeating Decimal to Fraction',
    fullTitle: 'Converting Periodic Decimals to Fractions (0.1818... = 2/11)',
    description: 'Using 100x - x = 99x substitution to express infinite repeating decimals as exact integer quotients a/b.',
    keyFormula: 'x = 0.\\overline{18} \\implies 100x - x = 18 \\implies x = \\frac{18}{99} = \\frac{2}{11}',
    boardTrap: 'Dividing by 100 instead of 99 for a two-digit period (e.g. 18/100 instead of 18/99).',
    questionIds: ['s2-q4'],
  },

  // --- STEP 3: CLASSIFYING NUMBERS ---
  {
    id: 'sub-3-1',
    stepId: 3,
    stepTitle: 'Classifying Numbers',
    code: '3.1',
    name: 'Principal Radical Non-Negativity',
    fullTitle: 'Principal Square Root Non-Negativity: √(x²) = |x|',
    description: 'The radical symbol √ denotes the non-negative principal root. Therefore, √((-7)²) = √49 = 7 = |-7|, never -7.',
    keyFormula: '\\sqrt{x^2} = |x| \\implies \\sqrt{(-7)^2} = |-7| = 7 \\neq -7',
    boardTrap: 'Blindly canceling the square root radical and exponent 2 to answer -7. Principal roots are strictly non-negative.',
    questionIds: ['s3-q1'],
  },
  {
    id: 'sub-3-2',
    stepId: 3,
    stepTitle: 'Classifying Numbers',
    code: '3.2',
    name: 'Non-Periodic Pattern vs. Periodic',
    fullTitle: 'Infinite Patterned Decimals (0.121121112... is Irrational)',
    description: 'A decimal is rational ONLY if it terminates or repeats a fixed period. A pattern with increasing runs of digits never repeats periodically and is irrational.',
    keyFormula: '0.12112111211112... \\in \\mathbb{R} \\setminus \\mathbb{Q}',
    boardTrap: 'Confusing having a mathematical pattern with being periodic. Only periodic repeating decimals are rational.',
    questionIds: ['s3-q2'],
  },
  {
    id: 'sub-3-3',
    stepId: 3,
    stepTitle: 'Classifying Numbers',
    code: '3.3',
    name: 'Multi-Set Classification & Simplification',
    fullTitle: 'Complete Set Membership (-√144 / 3 = -4 ∈ ℤ, ℚ, ℝ)',
    description: 'Evaluating composite radicals and fraction operations to identify all parent sets a number belongs to.',
    keyFormula: '-\\frac{\\sqrt{144}}{3} = -\\frac{12}{3} = -4 \\in \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}',
    boardTrap: 'Missing higher-order parent sets (e.g. declaring -4 is only an integer, forgetting it is also rational and real).',
    questionIds: ['s3-q3'],
  },
  {
    id: 'sub-3-4',
    stepId: 3,
    stepTitle: 'Classifying Numbers',
    code: '3.4',
    name: 'Transcendental Numbers vs. Fractions',
    fullTitle: 'Transcendental Numbers (π, e) vs. Rational Approximations',
    description: 'Numbers like π and e cannot be roots of any non-zero polynomial with rational coefficients; they belong to ℝ \\ ℚ.',
    keyFormula: '\\pi \\approx 3.14159265... \\in \\mathbb{R} \\setminus \\mathbb{Q}, \\quad -\\frac{22}{7} \\in \\mathbb{Q}',
    boardTrap: 'Classifying π as rational because π ≈ 3.14 or 22/7. Both 3.14 and 22/7 are rational, but π itself is strictly transcendental.',
    questionIds: ['s3-q4'],
  },

  // --- STEP 4: ORDERING & COMPARING ---
  {
    id: 'sub-4-1',
    stepId: 4,
    stepTitle: 'Ordering & Comparing',
    code: '4.1',
    name: 'Ascending Order & Approximations',
    fullTitle: 'Ascending Order & Radical Decimal Approximations',
    description: 'Converting mixed forms (fractions, decimals, and square roots) to consistent decimal places to arrange in ascending sequence.',
    keyFormula: '\\frac{4}{3} \\approx 1.333 < 1.400 < \\sqrt{2} \\approx 1.414 < \\frac{3}{2} = 1.500',
    boardTrap: 'Truncating √2 to 1.4, which incorrectly places it before 1.4 instead of after 1.4.',
    questionIds: ['s4-q1'],
  },
  {
    id: 'sub-4-2',
    stepId: 4,
    stepTitle: 'Ordering & Comparing',
    code: '4.2',
    name: 'Real Line Density Property',
    fullTitle: 'Density of Reals & Rationals (Infinitely Many Values Between)',
    description: 'Between any two distinct real numbers a and b (a < b), there exist infinitely many rational and irrational numbers.',
    keyFormula: '\\forall a, b \\in \\mathbb{R}, a < b \\implies \\exists c \\in \\mathbb{R} : a < c < b \\quad \\left(c = \\frac{a+b}{2}\\right)',
    boardTrap: 'Assuming numbers on the real line have "adjacent" or immediate next-neighbor integers or fractions.',
    questionIds: ['s4-q2'],
  },
  {
    id: 'sub-4-3',
    stepId: 4,
    stepTitle: 'Ordering & Comparing',
    code: '4.3',
    name: 'Interval Bounding & Inequalities',
    fullTitle: 'Compound Negative Interval Bounds (-1.75 < x < -√2)',
    description: 'Evaluating square roots and comparing positions on the negative coordinate axis to find numbers within target intervals.',
    keyFormula: '-1.75 < -1.60 < -\\sqrt{2} \\approx -1.414',
    boardTrap: 'Reversing inequality directions on negative numbers, or thinking -1.6 is smaller than -1.75.',
    questionIds: ['s4-q3'],
  },
  {
    id: 'sub-4-4',
    stepId: 4,
    stepTitle: 'Ordering & Comparing',
    code: '4.4',
    name: 'Negative Magnitude Inversion',
    fullTitle: 'Negative Number Magnitude Inversion (-7/4 < -√3)',
    description: 'For negative real numbers, greater absolute value corresponds to a position further left (smaller value): -a < -b iff a > b.',
    keyFormula: '-\\frac{7}{4} = -1.750 < -\\sqrt{3} \\approx -1.732 \\iff 1.750 > 1.732',
    boardTrap: 'Claiming -7/4 is greater than -√3 because 7/4 > √3. With negatives, greater magnitude means lesser value.',
    questionIds: ['s4-q4'],
  },
];

/**
 * Initial realistic baseline data matching the user's current spaced schedule
 * Concept 2 is in remediation (stumbled on closure / repeating decimals)
 * Concept 3 has stumbles on principal roots
 * Concepts 1 and 4 have solid grasp with minor refresher needed on negatives
 */
export function getInitialHeatmapData(): Record<string, SubTopicPerformance> {
  const initialMap: Record<string, SubTopicPerformance> = {};

  SUB_TOPICS_DEFINITIONS.forEach((def) => {
    let attempts = 0;
    let correct = 0;
    let incorrect = 0;
    let recentResults: boolean[] = [];
    let lastTestedDate: string | null = null;

    // Baseline seeding aligned with SM-2 state
    switch (def.id) {
      // Step 1: Strong mastery
      case 'sub-1-1':
        attempts = 3;
        correct = 3;
        incorrect = 0;
        recentResults = [true, true, true];
        lastTestedDate = '2026-09-11';
        break;
      case 'sub-1-2':
        attempts = 2;
        correct = 2;
        incorrect = 0;
        recentResults = [true, true];
        lastTestedDate = '2026-09-11';
        break;
      case 'sub-1-3':
        attempts = 2;
        correct = 2;
        incorrect = 0;
        recentResults = [true, true];
        lastTestedDate = '2026-09-08';
        break;
      case 'sub-1-4':
        attempts = 2;
        correct = 2;
        incorrect = 0;
        recentResults = [true, true];
        lastTestedDate = '2026-09-11';
        break;

      // Step 2: High Struggle / Remediation
      case 'sub-2-1': // Non-square radicals vs 22/7
        attempts = 3;
        correct = 1;
        incorrect = 2;
        recentResults = [false, true, false];
        lastTestedDate = '2026-09-12';
        break;
      case 'sub-2-2': // Terminating denominator
        attempts = 2;
        correct = 2;
        incorrect = 0;
        recentResults = [true, true];
        lastTestedDate = '2026-09-10';
        break;
      case 'sub-2-3': // Closure properties (CRITICAL WEAKNESS!)
        attempts = 2;
        correct = 0;
        incorrect = 2;
        recentResults = [false, false];
        lastTestedDate = '2026-09-12';
        break;
      case 'sub-2-4': // Repeating decimal conversion
        attempts = 2;
        correct = 1;
        incorrect = 1;
        recentResults = [true, false];
        lastTestedDate = '2026-09-12';
        break;

      // Step 3: Moderate Struggle on Traps
      case 'sub-3-1': // Principal root non-negativity (CRITICAL WEAKNESS!)
        attempts = 3;
        correct = 1;
        incorrect = 2;
        recentResults = [false, false, true];
        lastTestedDate = '2026-09-12';
        break;
      case 'sub-3-2': // Non-periodic patterns
        attempts = 2;
        correct = 1;
        incorrect = 1;
        recentResults = [true, false];
        lastTestedDate = '2026-09-12';
        break;
      case 'sub-3-3': // Multi-set
        attempts = 2;
        correct = 2;
        incorrect = 0;
        recentResults = [true, true];
        lastTestedDate = '2026-09-12';
        break;
      case 'sub-3-4': // Transcendental
        attempts = 2;
        correct = 2;
        incorrect = 0;
        recentResults = [true, true];
        lastTestedDate = '2026-09-12';
        break;

      // Step 4: Good grasp, slight struggle on negative magnitude
      case 'sub-4-1': // Ascending order
        attempts = 2;
        correct = 2;
        incorrect = 0;
        recentResults = [true, true];
        lastTestedDate = '2026-09-11';
        break;
      case 'sub-4-2': // Density
        attempts = 2;
        correct = 2;
        incorrect = 0;
        recentResults = [true, true];
        lastTestedDate = '2026-09-11';
        break;
      case 'sub-4-3': // Interval bounding
        attempts = 2;
        correct = 2;
        incorrect = 0;
        recentResults = [true, true];
        lastTestedDate = '2026-09-11';
        break;
      case 'sub-4-4': // Negative magnitude inversion
        attempts = 2;
        correct = 1;
        incorrect = 1;
        recentResults = [false, true];
        lastTestedDate = '2026-09-11';
        break;
    }

    initialMap[def.id] = {
      ...def,
      attempts,
      correct,
      incorrect,
      recentResults,
      lastTestedDate,
    };
  });

  return initialMap;
}

/**
 * Calculate struggle metrics for a sub-topic
 */
export function calculateSubTopicMetrics(perf: SubTopicPerformance): SubTopicHeatmapItem {
  const { attempts, correct, incorrect, recentResults } = perf;

  if (attempts === 0) {
    return {
      ...perf,
      accuracy: 0,
      struggleScore: 0,
      struggleLevel: 'untested',
      errorRate: 0,
    };
  }

  const accuracy = Math.round((correct / attempts) * 100);
  const errorRate = 100 - accuracy;

  // Recent penalty: if the most recent quiz attempt was a mistake, increase struggle weight
  let recencyStruggleBoost = 0;
  if (recentResults.length > 0) {
    const lastResult = recentResults[recentResults.length - 1];
    if (!lastResult) {
      recencyStruggleBoost += 15;
    }
  }

  // Raw struggle score 0 to 100
  let rawStruggle = errorRate + recencyStruggleBoost;
  // If zero correct out of 2+ attempts, bump to 95+
  if (correct === 0 && attempts >= 1) {
    rawStruggle = Math.max(rawStruggle, 90 + Math.min(10, attempts * 3));
  }
  const struggleScore = Math.max(0, Math.min(100, Math.round(rawStruggle)));

  // Classify struggle tier
  let struggleLevel: StruggleLevel;
  if (struggleScore >= 55 || accuracy <= 40) {
    struggleLevel = 'critical';
  } else if (struggleScore >= 30 || accuracy < 70) {
    struggleLevel = 'moderate';
  } else if (accuracy < 85) {
    struggleLevel = 'developing';
  } else {
    struggleLevel = 'mastered';
  }

  return {
    ...perf,
    accuracy,
    struggleScore,
    struggleLevel,
    errorRate,
  };
}

/**
 * Load heatmap state from localStorage
 */
export function loadRealNumbersHeatmap(): Record<string, SubTopicHeatmapItem> {
  let stored: Record<string, SubTopicPerformance> | null = null;
  try {
    const raw = localStorage.getItem(HEATMAP_STORAGE_KEY);
    if (raw) {
      stored = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse real numbers heatmap from storage', err);
  }

  if (!stored) {
    stored = getInitialHeatmapData();
    try {
      localStorage.setItem(HEATMAP_STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // ignore
    }
  }

  // Ensure all definitions exist
  const result: Record<string, SubTopicHeatmapItem> = {};
  SUB_TOPICS_DEFINITIONS.forEach((def) => {
    const rawItem = stored?.[def.id] || {
      ...def,
      attempts: 0,
      correct: 0,
      incorrect: 0,
      recentResults: [],
      lastTestedDate: null,
    };
    result[def.id] = calculateSubTopicMetrics(rawItem);
  });

  return result;
}

/**
 * Save raw subtopics to localStorage and notify listeners
 */
export function saveRealNumbersHeatmap(data: Record<string, SubTopicPerformance>): void {
  try {
    localStorage.setItem(HEATMAP_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(HEATMAP_UPDATED_EVENT));
  } catch (err) {
    console.warn('Failed to save heatmap to storage', err);
  }
}

/**
 * Record a user's answer for a specific question ID
 */
export function recordQuestionAnswerForHeatmap(questionId: string, isCorrect: boolean): void {
  const current = loadRealNumbersHeatmap();
  let touched = false;

  const rawMap: Record<string, SubTopicPerformance> = {};
  Object.values(current).forEach((item) => {
    const isTarget = item.questionIds.includes(questionId);
    let attempts = item.attempts;
    let correct = item.correct;
    let incorrect = item.incorrect;
    let recent = [...item.recentResults];
    let lastDate = item.lastTestedDate;

    if (isTarget) {
      attempts += 1;
      if (isCorrect) {
        correct += 1;
      } else {
        incorrect += 1;
      }
      recent.push(isCorrect);
      if (recent.length > 5) {
        recent = recent.slice(-5);
      }
      lastDate = new Date().toISOString().split('T')[0];
      touched = true;
    }

    rawMap[item.id] = {
      id: item.id,
      stepId: item.stepId,
      stepTitle: item.stepTitle,
      code: item.code,
      name: item.name,
      fullTitle: item.fullTitle,
      description: item.description,
      keyFormula: item.keyFormula,
      boardTrap: item.boardTrap,
      questionIds: item.questionIds,
      attempts,
      correct,
      incorrect,
      recentResults: recent,
      lastTestedDate: lastDate,
    };
  });

  if (touched) {
    saveRealNumbersHeatmap(rawMap);
  }
}

/**
 * Reset heatmap data to initial baseline
 */
export function resetRealNumbersHeatmapToBaseline(): Record<string, SubTopicHeatmapItem> {
  const initial = getInitialHeatmapData();
  saveRealNumbersHeatmap(initial);
  return loadRealNumbersHeatmap();
}

/**
 * Clear all attempts (Untested state)
 */
export function clearRealNumbersHeatmapAttempts(): Record<string, SubTopicHeatmapItem> {
  const blankMap: Record<string, SubTopicPerformance> = {};
  SUB_TOPICS_DEFINITIONS.forEach((def) => {
    blankMap[def.id] = {
      ...def,
      attempts: 0,
      correct: 0,
      incorrect: 0,
      recentResults: [],
      lastTestedDate: null,
    };
  });
  saveRealNumbersHeatmap(blankMap);
  return loadRealNumbersHeatmap();
}

/**
 * Group sub-topics by step (1 to 4) for matrix heatmap display
 */
export function getStepHeatmapSummaries(
  heatmap: Record<string, SubTopicHeatmapItem>
): StepHeatmapSummary[] {
  const steps: { stepId: 1 | 2 | 3 | 4; stepTitle: string }[] = [
    { stepId: 1, stepTitle: 'Step 1: Number Sets & Hierarchy' },
    { stepId: 2, stepTitle: 'Step 2: Rational vs. Irrational' },
    { stepId: 3, stepTitle: 'Step 3: Classifying Numbers' },
    { stepId: 4, stepTitle: 'Step 4: Ordering & Comparing' },
  ];

  return steps.map(({ stepId, stepTitle }) => {
    const subTopics = Object.values(heatmap).filter((item) => item.stepId === stepId);
    const tested = subTopics.filter((item) => item.attempts > 0);

    const averageStruggle =
      tested.length > 0
        ? Math.round(tested.reduce((sum, item) => sum + item.struggleScore, 0) / tested.length)
        : 0;

    const averageAccuracy =
      tested.length > 0
        ? Math.round(tested.reduce((sum, item) => sum + item.accuracy, 0) / tested.length)
        : 0;

    const criticalCount = subTopics.filter((item) => item.struggleLevel === 'critical').length;
    const moderateCount = subTopics.filter((item) => item.struggleLevel === 'moderate').length;
    const masteredCount = subTopics.filter((item) => item.struggleLevel === 'mastered').length;
    const untestedCount = subTopics.filter((item) => item.struggleLevel === 'untested').length;
    const totalAttempts = subTopics.reduce((sum, item) => sum + item.attempts, 0);

    return {
      stepId,
      stepTitle,
      averageStruggle,
      averageAccuracy,
      criticalCount,
      moderateCount,
      masteredCount,
      untestedCount,
      totalAttempts,
      subTopics,
    };
  });
}

/**
 * Get visual styling tokens for a given struggle level
 */
export function getStruggleVisualTokens(level: StruggleLevel): {
  tileBg: string;
  tileBorder: string;
  tileHover: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  textColor: string;
  heatBarGradient: string;
  flameIconColor: string;
  label: string;
  shortLabel: string;
  description: string;
} {
  switch (level) {
    case 'critical':
      return {
        tileBg: 'bg-rose-50/90',
        tileBorder: 'border-rose-300 shadow-rose-100',
        tileHover: 'hover:border-rose-400 hover:bg-rose-100/70',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-800',
        badgeBorder: 'border-rose-200',
        textColor: 'text-rose-950',
        heatBarGradient: 'from-rose-500 to-red-600',
        flameIconColor: 'text-rose-600',
        label: 'Critical Struggle',
        shortLabel: 'High Struggle',
        description: 'Frequent errors in quiz drills; high risk for board traps.',
      };
    case 'moderate':
      return {
        tileBg: 'bg-amber-50/90',
        tileBorder: 'border-amber-300 shadow-amber-100',
        tileHover: 'hover:border-amber-400 hover:bg-amber-100/70',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800',
        badgeBorder: 'border-amber-200',
        textColor: 'text-amber-950',
        heatBarGradient: 'from-amber-400 to-orange-500',
        flameIconColor: 'text-amber-600',
        label: 'Moderate Struggle',
        shortLabel: 'Watchlist',
        description: 'Inconsistent quiz performance (40-69% accuracy). Needs drill reinforcement.',
      };
    case 'developing':
      return {
        tileBg: 'bg-blue-50/80',
        tileBorder: 'border-blue-200 shadow-blue-50',
        tileHover: 'hover:border-blue-300 hover:bg-blue-100/70',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800',
        badgeBorder: 'border-blue-200',
        textColor: 'text-blue-950',
        heatBarGradient: 'from-blue-400 to-indigo-500',
        flameIconColor: 'text-blue-600',
        label: 'Developing / Good',
        shortLabel: 'Developing',
        description: 'Passing accuracy (70-84%). Solid fundamentals with occasional hesitation.',
      };
    case 'mastered':
      return {
        tileBg: 'bg-emerald-50/80',
        tileBorder: 'border-emerald-200 shadow-emerald-50',
        tileHover: 'hover:border-emerald-300 hover:bg-emerald-100/70',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800',
        badgeBorder: 'border-emerald-200',
        textColor: 'text-emerald-950',
        heatBarGradient: 'from-emerald-400 to-teal-500',
        flameIconColor: 'text-emerald-600',
        label: 'Mastered / Low Struggle',
        shortLabel: 'Mastered',
        description: 'Consistent 85%+ accuracy. High confidence on rules and definitions.',
      };
    case 'untested':
    default:
      return {
        tileBg: 'bg-slate-50/80',
        tileBorder: 'border-slate-200 shadow-slate-50',
        tileHover: 'hover:border-slate-300 hover:bg-slate-100/80',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-600',
        badgeBorder: 'border-slate-200',
        textColor: 'text-slate-700',
        heatBarGradient: 'from-slate-300 to-slate-400',
        flameIconColor: 'text-slate-400',
        label: 'Untested',
        shortLabel: 'Untested',
        description: 'No quiz attempts recorded yet. Take a drill to calculate struggle index.',
      };
  }
}
