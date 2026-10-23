import {
  ReviewError,
  Subject,
  Topic,
  MockExamQuestion,
  WeakSpotQuizSubjectBreakdown,
  WeakSpotQuizQuestion,
  CustomWeakSpotQuiz,
  WeakSpotQuizOptions,
} from '../types';
import { MOCK_EXAM_QUESTIONS } from '../data/mockExamQuestions';

/**
 * Maps specific error items from the ECE Board Review log to direct diagnostic practice questions.
 * When available, these provide 1-to-1 remediation for the student's exact recorded pitfalls.
 */
const TARGETED_ERROR_QUESTIONS: Record<string, Partial<WeakSpotQuizQuestion>> = {
  'err-1': {
    id: 'weak-err-1-q',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-partial-fractions',
    topicName: 'Partial Fractions',
    question:
      'What is the correct general partial fraction decomposition form for the rational expression: (3x² + 5) / [(x + 2)(x - 1)²] ?',
    options: [
      { id: 'A', text: 'A / (x + 2) + B / (x - 1)' },
      { id: 'B', text: 'A / (x + 2) + B / (x - 1) + C / (x - 1)²' },
      { id: 'C', text: 'A / (x + 2) + (Bx + C) / (x - 1)²' },
      { id: 'D', text: '(Ax + B) / (x + 2) + C / (x - 1)²' },
    ],
    correctOptionId: 'B',
    explanation:
      'For a repeated linear factor (x - 1)², the decomposition must include separate terms for each power up to the multiplicity: B/(x - 1) + C/(x - 1)². The non-repeated factor (x + 2) requires A/(x + 2). Combining gives: A/(x + 2) + B/(x - 1) + C/(x - 1)².',
    keyFormula: 'Repeated linear factor (x - r)ᵏ requires k fractions: A₁/(x-r) + A₂/(x-r)² + ... + Aₖ/(x-r)ᵏ',
    boardTip: 'Do not use a linear numerator (Bx + C) for a repeated linear factor; reserve (Bx + C) strictly for irreducible quadratics (x² + bx + c).',
    difficulty: 'Medium',
    targetedErrorCategory: 'Formula recall',
    weaknessRationale:
      'Directly targets your logged error: omitting the repeated higher-power term B/(x-1)² in partial fraction expansion.',
    pitfallWarning: 'Omitting intermediate powers of repeated factors will produce unsolvable coefficient systems.',
  },
  'err-2': {
    id: 'weak-err-2-q',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-partial-fractions',
    topicName: 'Partial Fractions',
    question:
      'Given the decomposition (7x - 1) / [(x - 3)(x² + 1)] = A / (x - 3) + (Bx + C) / (x² + 1), which method is mathematically valid to solve for constants B and C?',
    options: [
      { id: 'A', text: 'Heaviside cover-up method by setting x = 3' },
      { id: 'B', text: 'Heaviside cover-up method by setting x = 1' },
      { id: 'C', text: 'Equating polynomial coefficients or substituting strategic values of x after finding A' },
      { id: 'D', text: 'Direct synthetic division of the quadratic factor' },
    ],
    correctOptionId: 'C',
    explanation:
      'The Heaviside cover-up method only applies to non-repeated linear factors (which readily gives A = 2). For the irreducible quadratic factor (x² + 1), you must multiply out and equate like powers of x (or substitute x = 0 and x = 1) to solve for B and C.',
    keyFormula: 'Equate coefficients: 7x - 1 = A(x² + 1) + (Bx + C)(x - 3)',
    boardTip: 'Use cover-up to instantly find A = 2, then substitute x = 0: -1 = 2(1) + C(-3) => C = 1.',
    difficulty: 'Medium',
    targetedErrorCategory: 'Wrong method',
    weaknessRationale:
      'Remediates your logged error: incorrectly attempting Heaviside cover-up on irreducible quadratic denominators.',
    pitfallWarning: 'Heaviside cover-up requires setting the factor to zero; quadratic x² + 1 has no real zeros.',
  },
  'err-3': {
    id: 'weak-err-3-q',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-complex-numbers',
    topicName: 'Complex Numbers',
    question:
      'Convert the complex number z = -3 + j4 into polar form (r ∠ θ), where -180° < θ ≤ 180°.',
    options: [
      { id: 'A', text: '5 ∠ -53.13°' },
      { id: 'B', text: '5 ∠ 53.13°' },
      { id: 'C', text: '5 ∠ 126.87°' },
      { id: 'D', text: '5 ∠ -126.87°' },
    ],
    correctOptionId: 'C',
    explanation:
      'Magnitude: r = √((-3)² + 4²) = 5.\nSince x = -3 < 0 and y = 4 > 0, z lies in Quadrant II.\nReference angle: α = arctan(|4 / -3|) = 53.13°.\nQuadrant II angle: θ = 180° - 53.13° = 126.87°.\nTherefore, z = 5 ∠ 126.87°.',
    keyFormula: 'Quadrant II (x < 0, y > 0): θ = 180° - arctan(|y/x|)',
    boardTip: 'Your calculator arctan(4 / -3) returns -53.13° (Quadrant IV). You MUST add 180° because x is negative!',
    difficulty: 'Easy',
    targetedErrorCategory: 'Sign / algebra errors',
    weaknessRationale:
      'Directly targets your logged quadrant error: forgetting to adjust the angle for Quadrant II when real part is negative.',
    pitfallWarning: 'Always sketch the complex plane vector to verify your quadrant visually.',
  },
  'err-4': {
    id: 'weak-err-4-q',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-complex-numbers',
    topicName: 'Complex Numbers',
    question:
      'Evaluate the cyclic power of the imaginary unit: j¹⁰⁷ + j⁵⁴.',
    options: [
      { id: 'A', text: '-j - 1' },
      { id: 'B', text: 'j - 1' },
      { id: 'C', text: '-j + 1' },
      { id: 'D', text: '0' },
    ],
    correctOptionId: 'A',
    explanation:
      'Powers of j repeat every 4 cycles (j¹ = j, j² = -1, j³ = -j, j⁴ = 1).\nFor j¹⁰⁷: 107 mod 4 = 3 => j¹⁰⁷ = j³ = -j.\nFor j⁵⁴: 54 mod 4 = 2 => j⁵⁴ = j² = -1.\nSum: j¹⁰⁷ + j⁵⁴ = -j + (-1) = -j - 1 (or -1 - j).',
    keyFormula: 'jᵐ = j^(m mod 4) ; j¹ = j, j² = -1, j³ = -j, j⁴ = 1',
    boardTip: 'Divide the exponent by 4 and look only at the remainder: remainder 3 is ALWAYS -j.',
    difficulty: 'Easy',
    targetedErrorCategory: 'Sign / algebra errors',
    weaknessRationale:
      'Remediates your logged error: miscalculating j³ as +j instead of -j.',
    pitfallWarning: 'Do not rush cyclic powers; j² is -1, so j³ = j² · j = -1 · j = -j.',
  },
  'err-5': {
    id: 'weak-err-5-q',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-logarithms',
    topicName: 'Logarithms',
    question:
      'According to the logarithmic change-of-base formula, log₅(32) is identically equal to:',
    options: [
      { id: 'A', text: 'ln(5) / ln(32)' },
      { id: 'B', text: 'ln(32) / ln(5)' },
      { id: 'C', text: 'ln(32) - ln(5)' },
      { id: 'D', text: 'ln(32 · 5)' },
    ],
    correctOptionId: 'B',
    explanation:
      'The change-of-base identity states: log_b(a) = log_c(a) / log_c(b). Here the base is 5 and the argument is 32, so log₅(32) = ln(32) / ln(5) or log₁₀(32) / log₁₀(5).',
    keyFormula: 'Change of Base: log_b(a) = ln(a) / ln(b) -> "Base goes to the Basement"',
    boardTip: 'Mnemonic: "Base goes to the Basement" (the denominator). Argument stays on top.',
    difficulty: 'Easy',
    targetedErrorCategory: 'Formula recall',
    weaknessRationale:
      'Directly corrects your logged formula inversion: writing ln(b)/ln(a) instead of ln(a)/ln(b).',
    pitfallWarning: 'Inverting change-of-base gives the reciprocal 1 / log_b(a) = log_a(b).',
  },
  'err-6': {
    id: 'weak-err-6-q',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-logarithms',
    topicName: 'Logarithms',
    question:
      'An audio amplifier increases output power from 2 Watts to 50 Watts across an 8-Ω load. What is the power gain in decibels (dB)?',
    options: [
      { id: 'A', text: '27.96 dB' },
      { id: 'B', text: '13.98 dB' },
      { id: 'C', text: '6.99 dB' },
      { id: 'D', text: '25.00 dB' },
    ],
    correctOptionId: 'B',
    explanation:
      'Power gain in dB uses the factor of 10: G_dB = 10 · log₁₀(P₂ / P₁).\nG_dB = 10 · log₁₀(50 / 2) = 10 · log₁₀(25) = 10 · 1.3979 ≈ 13.98 dB.\n(If it were voltage ratio, it would use 20 · log₁₀, which would give 27.96 dB).',
    keyFormula: 'Power Gain: G_dB = 10 · log₁₀(P₂ / P₁) ; Voltage Gain: G_dB = 20 · log₁₀(V₂ / V₁)',
    boardTip: 'Always check the units: Watts/milliwatts = 10 log, Volts/Amperes = 20 log.',
    difficulty: 'Medium',
    targetedErrorCategory: 'Question misreading',
    weaknessRationale:
      'Remediates your logged question misreading: using 20·log for power instead of 10·log.',
    pitfallWarning: 'Using 20 log on power ratios yields double the actual decibel gain.',
  },
  'err-7': {
    id: 'weak-err-7-q',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-infinite-series',
    topicName: 'Infinite Geometric Series',
    question:
      'Determine the sum of the infinite geometric series: 12 + 15 + 18.75 + 23.4375 + ...',
    options: [
      { id: 'A', text: '-48' },
      { id: 'B', text: '60' },
      { id: 'C', text: 'The series diverges and has no finite sum' },
      { id: 'D', text: '96' },
    ],
    correctOptionId: 'C',
    explanation:
      'First term a₁ = 12. Common ratio r = 15 / 12 = 1.25.\nAn infinite geometric series converges to a finite sum if and only if |r| < 1.\nSince |1.25| ≥ 1, each successive term grows larger, and the series diverges to infinity.',
    keyFormula: 'Infinite Geometric Sum: S = a₁ / (1 - r) ONLY if |r| < 1',
    boardTip: 'Fatal PRC board trap: Blindly plugging r = 1.25 into a/(1-r) yields 12 / (1 - 1.25) = -48, which is impossible for positive increasing terms!',
    difficulty: 'Medium',
    targetedErrorCategory: 'Wrong method',
    weaknessRationale:
      'Directly tests your logged error: applying S = a/(1-r) without first verifying the convergence condition |r| < 1.',
    pitfallWarning: 'A sum of positive numbers can never be negative; getting -48 is an immediate flag for divergence.',
  },
  'err-10': {
    id: 'weak-err-10-q',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-quadratics',
    topicName: 'Quadratic Equations',
    question:
      'Without solving for the roots, determine the PRODUCT of the roots of the quadratic equation: 3x² - 11x - 14 = 0.',
    options: [
      { id: 'A', text: '11 / 3' },
      { id: 'B', text: '-11 / 3' },
      { id: 'C', text: '-14 / 3' },
      { id: 'D', text: '14 / 3' },
    ],
    correctOptionId: 'C',
    explanation:
      "By Vieta's formulas for ax² + bx + c = 0:\nSum of roots: x₁ + x₂ = -b / a = -(-11) / 3 = +11 / 3.\nProduct of roots: x₁ · x₂ = c / a = -14 / 3.\nThe question explicitly asks for the PRODUCT, which is -14 / 3.",
    keyFormula: "Vieta's Formulas: Sum = -b/a , Product = c/a",
    boardTip: 'Watch out: the question asked for product (c/a), but option A is the sum (-b/a). Read carefully!',
    difficulty: 'Easy',
    targetedErrorCategory: 'Question misreading',
    weaknessRationale:
      'Addresses your logged error: confusing product of roots (c/a) with sum of roots (-b/a).',
    pitfallWarning: 'Sum has a negative sign (-b/a); product maintains the sign of c (c/a).',
  },
  'err-11': {
    id: 'weak-err-11-q',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-inequalities',
    topicName: 'Inequalities',
    question:
      'Solve the inequality: 5 - 3x > 26.',
    options: [
      { id: 'A', text: 'x > -7' },
      { id: 'B', text: 'x < -7' },
      { id: 'C', text: 'x > 7' },
      { id: 'D', text: 'x < 7' },
    ],
    correctOptionId: 'B',
    explanation:
      'Subtract 5 from both sides: -3x > 21.\nDivide both sides by -3. Since we divide by a negative number, the inequality sign MUST reverse:\nx < 21 / (-3)  =>  x < -7.',
    keyFormula: 'Dividing or multiplying an inequality by a negative number reverses the sign (> becomes <).',
    boardTip: 'Whenever multiplying or dividing by a negative coefficient, flip the inequality arrow immediately.',
    difficulty: 'Easy',
    targetedErrorCategory: 'Sign / algebra errors',
    weaknessRationale:
      'Directly corrects your recorded error: failing to reverse the inequality direction when dividing by negative numbers.',
    pitfallWarning: 'Forget the arrow flip and you will select the exact opposite half-plane.',
  },
  'err-12': {
    id: 'weak-err-12-q',
    subjectId: 'subj-math-algebra',
    subjectName: 'Algebra & Engineering Mathematics',
    topicId: 'top-word-problems',
    topicName: 'Word Problems / Engineering Applications',
    question:
      'Technician A can calibrate a microwave transceiver in 4 hours, while Technician B can calibrate the same unit in 6 hours. If they work together at their standard rates, how long will the calibration take?',
    options: [
      { id: 'A', text: '5.0 hours' },
      { id: 'B', text: '2.4 hours' },
      { id: 'C', text: '2.0 hours' },
      { id: 'D', text: '10.0 hours' },
    ],
    correctOptionId: 'B',
    explanation:
      'Work rates add, NOT times.\nRate of A = 1/4 unit/hr. Rate of B = 1/6 unit/hr.\nCombined rate: 1/4 + 1/6 = 3/12 + 2/12 = 5/12 unit/hr.\nTime required: T = 1 / (Combined rate) = 12 / 5 = 2.4 hours (2 hours 24 minutes).',
    keyFormula: 'Work Problem: 1/t₁ + 1/t₂ = 1/T_together => T = (t₁ · t₂) / (t₁ + t₂)',
    boardTip: 'Shortcut for two workers: Product over Sum: (4 × 6) / (4 + 6) = 24 / 10 = 2.4 hours.',
    difficulty: 'Easy',
    targetedErrorCategory: 'Wrong method',
    weaknessRationale:
      'Remediates your logged error: adding work hours directly instead of adding fractional work rates.',
    pitfallWarning: 'Two people working together must take LESS time than the fastest individual (less than 4 hours).',
  },
};

/**
 * Computes frequency and categorization of errors across all subjects.
 * Ranks subjects from highest error frequency to lowest.
 */
export function analyzeSubjectErrorFrequencies(
  errors: ReviewError[],
  subjects: Subject[],
  allTopics: Topic[],
  includeResolved = false
): WeakSpotQuizSubjectBreakdown[] {
  const targetErrors = includeResolved ? errors : errors.filter((e) => !e.isResolved);
  const activeErrors = targetErrors.length > 0 ? targetErrors : errors;

  // Build subject lookup maps
  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Map topicId to subject
  const topicToSubject = new Map<string, Subject>();
  allTopics.forEach((t) => {
    const s = subjectMap.get(t.subjectId);
    if (s) topicToSubject.set(t.id, s);
  });

  const subjectStats = new Map<
    string,
    {
      subject: Subject;
      errorCount: number;
      occurrenceTotal: number;
      categoryCounts: Map<string, number>;
      topicCounts: Map<string, { topicName: string; count: number }>;
    }
  >();

  // Initialize with all known subjects
  subjects.forEach((s) => {
    subjectStats.set(s.id, {
      subject: s,
      errorCount: 0,
      occurrenceTotal: 0,
      categoryCounts: new Map(),
      topicCounts: new Map(),
    });
  });

  let grandTotalOccurrences = 0;

  activeErrors.forEach((err) => {
    let subject = subjectMap.get(err.subjectId);
    if (!subject && err.topicId) {
      subject = topicToSubject.get(err.topicId);
    }
    if (!subject) {
      subject = subjects.find((s) => s.id === 'subj-math-algebra') || subjects[0];
    }

    const stat = subjectStats.get(subject.id);
    if (stat) {
      const occurrences = Math.max(1, err.occurrenceCount || 1);
      stat.errorCount += 1;
      stat.occurrenceTotal += occurrences;
      grandTotalOccurrences += occurrences;

      // Category count
      const cat = err.category || 'General error';
      stat.categoryCounts.set(cat, (stat.categoryCounts.get(cat) || 0) + occurrences);

      // Topic count
      const existingTopic = stat.topicCounts.get(err.topicId);
      if (existingTopic) {
        existingTopic.count += occurrences;
      } else {
        stat.topicCounts.set(err.topicId, {
          topicName: err.topicName || 'Topic',
          count: occurrences,
        });
      }
    }
  });

  const breakdown: WeakSpotQuizSubjectBreakdown[] = [];

  subjectStats.forEach((stat, subjectId) => {
    const errorFrequencyPercent =
      grandTotalOccurrences > 0
        ? Math.round((stat.occurrenceTotal / grandTotalOccurrences) * 100)
        : 0;

    const topCategories = Array.from(stat.categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const topWeakTopics = Array.from(stat.topicCounts.entries())
      .map(([topicId, val]) => ({ topicId, topicName: val.topicName, count: val.count }))
      .sort((a, b) => b.count - a.count);

    breakdown.push({
      subjectId,
      subjectName: stat.subject.name,
      category: stat.subject.category,
      errorCount: stat.errorCount,
      occurrenceTotal: stat.occurrenceTotal,
      errorFrequencyPercent,
      topErrorCategories: topCategories,
      topWeakTopics,
      allocatedQuestionCount: 0,
    });
  });

  // Sort descending by occurrenceTotal (highest error frequency first)
  return breakdown.sort((a, b) => {
    if (b.occurrenceTotal !== a.occurrenceTotal) {
      return b.occurrenceTotal - a.occurrenceTotal;
    }
    return b.errorCount - a.errorCount;
  });
}

/**
 * Generates a custom 'weak spot' quiz focusing on subjects where the user has the highest error frequency.
 */
export function generateWeakSpotQuizFromErrors(
  errors: ReviewError[],
  subjects: Subject[],
  allTopics: Topic[],
  options?: WeakSpotQuizOptions
): CustomWeakSpotQuiz {
  const questionCount = Math.max(3, Math.min(25, options?.questionCount ?? 10));
  const includeResolved = options?.includeResolved ?? false;
  const filteredErrors = (includeResolved ? errors : errors.filter(e=>!e.isResolved))
    .filter(e=>!options?.targetSubjectId || e.subjectId===options.targetSubjectId)
    .filter(e=>!options?.focusErrorCategory || e.category===options.focusErrorCategory);
  const subjectBreakdown = analyzeSubjectErrorFrequencies(filteredErrors, subjects, allTopics, true);
  const dominant = (options?.targetSubjectId
      ? subjectBreakdown.find(s=>s.subjectId===options.targetSubjectId) : undefined)
    ?? subjectBreakdown[0];
  // No special-case fallback to the entire mock pool when a category has no errors.
  const selectedTopicIds = new Set(filteredErrors.map(e=>e.topicId));
  const diagnosticCandidates: WeakSpotQuizQuestion[] = [];
  const seen = new Set<string>();
  const eligibleSubject=(id:string)=>!options?.targetSubjectId||id===options.targetSubjectId;
  for(const err of filteredErrors){
    const t=TARGETED_ERROR_QUESTIONS[err.id];
    if(!t?.id||!t.question||!t.options||!t.correctOptionId||!eligibleSubject(t.subjectId??err.subjectId)||seen.has(t.id))continue;
    seen.add(t.id);
    diagnosticCandidates.push({
      id:t.id,subjectId:t.subjectId??err.subjectId,subjectName:t.subjectName??dominant?.subjectName??'Practice',
      topicId:t.topicId??err.topicId,topicName:t.topicName??err.topicName,
      question:t.question,options:t.options,correctOptionId:t.correctOptionId,explanation:t.explanation??'',
      keyFormula:t.keyFormula??err.solutionOrKeyFormula,boardTip:t.boardTip,difficulty:t.difficulty??'Medium',
      sourceErrorId:err.id,weaknessRationale:t.weaknessRationale??`Review ${err.topicName}`,
      targetedErrorCategory:err.category,keyFormulaReminder:err.solutionOrKeyFormula,
      pitfallWarning:t.pitfallWarning??'Check your methods and constraints.',
    });
  }
  // Retain the legacy diagnostic source for backward compatibility, but *never* treat
  // its items as unseen mock-exam evidence; the UI explicitly discloses overlap.
  for(const q of MOCK_EXAM_QUESTIONS){
    if(seen.has(q.id)||!eligibleSubject(q.subjectId))continue;
    if(options?.focusErrorCategory && !selectedTopicIds.has(q.topicId))continue;
    seen.add(q.id);
    const matchingError=filteredErrors.find(e=>e.topicId===q.topicId||e.subjectId===q.subjectId);
    diagnosticCandidates.push({...q,sourceErrorId:matchingError?.id,
      weaknessRationale:matchingError?`Practice for ${matchingError.topicName}: ${matchingError.category}`:'Additional general practice question (may also appear in the mock pool)',
      targetedErrorCategory:matchingError?.category??'General practice',
      keyFormulaReminder:matchingError?.solutionOrKeyFormula??q.keyFormula,
      pitfallWarning:q.boardTip??'Review concepts and units.'});
  }
  // Ensure allocated counts reflect the *actual* selected items, not aspirational quotas.
  const subjectIds = options?.targetSubjectId ? [options.targetSubjectId] :
    [...subjectBreakdown].sort((a,b)=>b.occurrenceTotal-a.occurrenceTotal).map(x=>x.subjectId);
  const grouped = new Map(subjectIds.map(id=>[id, diagnosticCandidates.filter(q=>q.subjectId===id)]));
  const quizQuestions:WeakSpotQuizQuestion[]=[];
  // Prefer high-error subjects, but guarantee real quotas and no cross-subject fallback.
  while(quizQuestions.length<questionCount){
    const available=subjectIds.filter(id=>(grouped.get(id)?.length??0)>0);
    if(!available.length)break;
    const best=available.sort((a,b)=>{
      const aErrors=subjectBreakdown.find(s=>s.subjectId===a)?.occurrenceTotal??0;
      const bErrors=subjectBreakdown.find(s=>s.subjectId===b)?.occurrenceTotal??0;
      const aTaken=quizQuestions.filter(q=>q.subjectId===a).length;
      const bTaken=quizQuestions.filter(q=>q.subjectId===b).length;
      // weighted fair allocation (weights 1+count, preferentially allocate to weak subjects)
      return (aTaken+1)/(aErrors+1)-(bTaken+1)/(bErrors+1);
    })[0];
    const remaining=grouped.get(best)!;
    // Prefer error-specific and related-topic exercises within each subject.
    remaining.sort((a,b)=>Number(Boolean(b.sourceErrorId))-Number(Boolean(a.sourceErrorId)));
    quizQuestions.push(remaining.shift()!);
  }
  subjectBreakdown.forEach(s=>{s.allocatedQuestionCount=quizQuestions.filter(q=>q.subjectId===s.subjectId).length;});
  const activeErrors=filteredErrors;
  const topCategoriesText = (dominant?.topErrorCategories??[]).slice(0,3).map(c=>`${c.category} (${c.count})`).join(', ');
  const diagnosticExecutiveSummary = quizQuestions.length===0
    ? 'No diagnostic exercises meet these filters. Clear a filter or select another subject.'
    : `Selected ${quizQuestions.length} of ${questionCount} requested exercises based on available bank items and ${activeErrors.length} matching error logs. ${topCategoriesText?`Focus categories: ${topCategoriesText}. `:''}Some questions are shared with the mock-exam practice pool and must not be treated as unseen assessment evidence.`;
  const recommendedFocusTips:string[] = [
    'Use this as a study diagnostic, not an unseen board-exam simulation.',
    dominant?.topWeakTopics[0]?`Review ${dominant.topWeakTopics[0].topicName} carefully.`:'Review the matching topic in Learn.',
    'Verify your solution and question constraints before looking at the explanation.',
  ];
  // Calculate target duration (~1.5 minutes per question for board speed standard)
  const targetDurationMinutes = Math.max(5, Math.round(quizQuestions.length * 1.5));

  return {
    id: `quiz-weakspot-${Date.now()}`,
    title: `Weak Spot Diagnostic: ${dominant?.subjectName??'Practice'}`,
    createdAt: new Date().toISOString().split('T')[0],
    totalQuestions: quizQuestions.length,
    targetDurationMinutes,
    dominantSubjectId: dominant?.subjectId??options?.targetSubjectId??'subj-math-algebra',
    dominantSubjectName: dominant?.subjectName??'Practice',
    dominantSubjectErrorPercent: dominant?.errorFrequencyPercent??0,
    subjectBreakdown,
    questions: quizQuestions,
    diagnosticExecutiveSummary,
    recommendedFocusTips,
  };
}
