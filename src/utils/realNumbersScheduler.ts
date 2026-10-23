import { getLocalDateKey } from './date';
/**
 * Spaced-Repetition Scheduler for Real Numbers & Number Systems
 * Implements an adapted SuperMemo SM-2 & Ebbinghaus Forgetting Curve model
 * to prompt students when to revisit learned concepts based on Knowledge Check quiz performance.
 */

export type ConceptId = 1 | 2 | 3 | 4;

export interface ConceptHistoryEntry {
  date: string; // YYYY-MM-DD
  score: number; // 0, 1, 2, 3
  totalQuestions: number;
  quality: number; // 0 to 5
  nextReviewDate: string;
}

export interface ConceptScheduleItem {
  id: ConceptId;
  stepId: number;
  title: string;
  shortTitle: string;
  description: string;
  keyFormulas: string[];
  easeFactor: number; // SM-2 ease factor (default 2.50, min 1.30, max 2.80)
  intervalDays: number; // Scheduled interval in days
  repetitions: number; // Number of consecutive passing reviews
  lastAttemptDate: string; // YYYY-MM-DD
  lastScore: number; // Correct answers in last 3-question drill (0-3)
  lastTotalQuestions: number; // 3
  nextReviewDate: string; // YYYY-MM-DD
  status: 'due' | 'due_soon' | 'fresh' | 'remediation';
  estimatedRetention: number; // 0 - 100 percentage based on forgetting curve
  history: ConceptHistoryEntry[];
}

export interface RealNumbersScheduleState {
  currentSimulatedDate: string; // YYYY-MM-DD
  concepts: Record<ConceptId, ConceptScheduleItem>;
  lastUpdated: string;
}

const STORAGE_KEY = 'ece_real_numbers_spaced_schedule_v2';
export const SCHEDULE_UPDATED_EVENT = 'real-numbers-schedule-updated';

// Helper to format date YYYY-MM-DD
export function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Helper to add days to a YYYY-MM-DD string
export function addDaysYMD(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDateYMD(date);
}

// Helper to compute difference in days between two YYYY-MM-DD strings (date2 - date1)
export function diffDaysYMD(date1Str: string, date2Str: string): number {
  const [y1, m1, d1] = date1Str.split('-').map(Number);
  const [y2, m2, d2] = date2Str.split('-').map(Number);
  const d1Obj = new Date(y1, m1 - 1, d1);
  const d2Obj = new Date(y2, m2 - 1, d2);
  const diffTime = d2Obj.getTime() - d1Obj.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Compute retention using Ebbinghaus exponential decay model: R = exp(-t / (interval * 1.25))
export function calculateRetentionRate(
  elapsedDays: number,
  intervalDays: number,
  easeFactor: number,
  lastScore: number
): number {
  if (lastScore <= 1) {
    // If the student failed or had low recall on the last attempt, decay is much steeper
    const baseDecay = Math.max(0.1, 1 - (elapsedDays * 0.4));
    return Math.max(20, Math.min(65, Math.round(baseDecay * 65)));
  }

  const stability = Math.max(1, intervalDays * (easeFactor / 2.5) * 1.2);
  const retention = Math.exp(-Math.max(0, elapsedDays) / stability);
  return Math.max(15, Math.min(100, Math.round(retention * 100)));
}

// Determine status based on current date, nextReviewDate, retention, and lastScore
export function determineConceptStatus(
  currentDateStr: string,
  nextReviewDateStr: string,
  retentionRate: number,
  lastScore: number
): 'due' | 'due_soon' | 'fresh' | 'remediation' {
  const daysUntilDue = diffDaysYMD(currentDateStr, nextReviewDateStr);

  if (lastScore <= 1 && daysUntilDue <= 0) {
    return 'remediation';
  }

  if (daysUntilDue <= 0 || retentionRate < 70) {
    return 'due';
  }

  if (daysUntilDue === 1 || (daysUntilDue === 2 && retentionRate < 80)) {
    return 'due_soon';
  }

  return 'fresh';
}

// Initial seed state uses the learner's current local date as the active schedule date.
// Historical attempts remain as seed evidence; stale next-review dates therefore surface as overdue.
export function getInitialRealNumbersSchedule(): RealNumbersScheduleState {
  const baseDate = getLocalDateKey();

  return {
    currentSimulatedDate: baseDate,
    lastUpdated: new Date().toISOString(),
    concepts: {
      1: {
        id: 1,
        stepId: 1,
        title: 'Number Sets & Hierarchy',
        shortTitle: 'Number Sets',
        description: 'Hierarchical containment: Natural N ⊂ Whole W ⊂ Integers Z ⊂ Rational Q ⊂ Real R.',
        keyFormulas: ['\\mathbb{N} \\subset \\mathbb{W} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}', '0 \\in \\mathbb{W}, 0 \\notin \\mathbb{N}'],
        easeFactor: 2.6,
        intervalDays: 4,
        repetitions: 2,
        lastAttemptDate: '2026-09-11',
        lastScore: 3,
        lastTotalQuestions: 3,
        nextReviewDate: '2026-09-15',
        status: 'fresh',
        estimatedRetention: 88,
        history: [
          { date: '2026-09-08', score: 2, totalQuestions: 3, quality: 3, nextReviewDate: '2026-09-11' },
          { date: '2026-09-11', score: 3, totalQuestions: 3, quality: 5, nextReviewDate: '2026-09-15' },
        ],
      },
      2: {
        id: 2,
        stepId: 2,
        title: 'Rational vs. Irrational Numbers',
        shortTitle: 'Rational vs. Irrational',
        description: 'Decimals (terminating/repeating vs non-repeating), ratio of integers, algebraic vs transcendental.',
        keyFormulas: ['x = \\frac{a}{b}, b \\neq 0', '0.\\bar{a} = \\frac{a}{9}, 0.\\bar{ab} = \\frac{ab}{99}'],
        easeFactor: 2.2,
        intervalDays: 1,
        repetitions: 0,
        lastAttemptDate: '2026-09-12',
        lastScore: 1, // Stumbled on closure or repeating decimal conversion
        lastTotalQuestions: 3,
        nextReviewDate: '2026-09-13', // Due today!
        status: 'remediation',
        estimatedRetention: 58,
        history: [
          { date: '2026-09-10', score: 2, totalQuestions: 3, quality: 3, nextReviewDate: '2026-09-12' },
          { date: '2026-09-12', score: 1, totalQuestions: 3, quality: 1, nextReviewDate: '2026-09-13' },
        ],
      },
      3: {
        id: 3,
        stepId: 3,
        title: 'Classifying Numbers & Board Traps',
        shortTitle: 'Classifying & Traps',
        description: 'Principal root non-negativity √(x²) = |x|, zero properties, division by zero, and density.',
        keyFormulas: ['\\sqrt{x^2} = |x|', '\\frac{a}{0} = \\text{undefined}'],
        easeFactor: 2.45,
        intervalDays: 2,
        repetitions: 1,
        lastAttemptDate: '2026-09-12',
        lastScore: 2,
        lastTotalQuestions: 3,
        nextReviewDate: '2026-09-14',
        status: 'due_soon',
        estimatedRetention: 78,
        history: [
          { date: '2026-09-12', score: 2, totalQuestions: 3, quality: 3, nextReviewDate: '2026-09-14' },
        ],
      },
      4: {
        id: 4,
        stepId: 4,
        title: 'Ordering, Approximating & Inequalities',
        shortTitle: 'Ordering & Approximating',
        description: 'Coordinate line positioning, negative numbers magnitude inversion (-1.75 < -1.414), and radical approximations.',
        keyFormulas: ['-a < -b \\iff a > b', '\\sqrt{2} \\approx 1.414, \\sqrt{3} \\approx 1.732'],
        easeFactor: 2.5,
        intervalDays: 3,
        repetitions: 1,
        lastAttemptDate: '2026-09-11',
        lastScore: 3,
        lastTotalQuestions: 3,
        nextReviewDate: '2026-09-14',
        status: 'due_soon',
        estimatedRetention: 80,
        history: [
          { date: '2026-09-11', score: 3, totalQuestions: 3, quality: 5, nextReviewDate: '2026-09-14' },
        ],
      },
    },
  };
}

// Load schedule from localStorage or fallback
export function loadRealNumbersSchedule(): RealNumbersScheduleState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialRealNumbersSchedule();
      saveRealNumbersSchedule(initial);
      return initial;
    }
    const parsed: RealNumbersScheduleState = JSON.parse(raw);

    // Never leave the production reviewer frozen on an old simulated day. If the
    // learner previously advanced the simulator into the future, preserve that
    // future date; otherwise move the schedule forward to the current local date.
    const localToday = getLocalDateKey();
    const effectiveDate = parsed.currentSimulatedDate > localToday
      ? parsed.currentSimulatedDate
      : localToday;

    const updated = refreshScheduleStatus({
      ...parsed,
      currentSimulatedDate: effectiveDate,
    });
    return updated;
  } catch (err) {
    console.warn('Failed to load Real Numbers spaced schedule from localStorage:', err);
    return getInitialRealNumbersSchedule();
  }
}

// Save to localStorage and notify listeners
export function saveRealNumbersSchedule(state: RealNumbersScheduleState): void {
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(SCHEDULE_UPDATED_EVENT, { detail: state }));
    }
  } catch (err) {
    console.warn('Failed to save Real Numbers spaced schedule:', err);
  }
}

// Recalculates status and retention for all concepts based on current simulated date
export function refreshScheduleStatus(state: RealNumbersScheduleState): RealNumbersScheduleState {
  const currentDateStr = state.currentSimulatedDate;
  const updatedConcepts = { ...state.concepts };

  (Object.keys(updatedConcepts) as unknown as ConceptId[]).forEach((cid) => {
    const item = { ...updatedConcepts[cid] };
    const elapsedDays = diffDaysYMD(item.lastAttemptDate, currentDateStr);
    const retention = calculateRetentionRate(
      elapsedDays,
      item.intervalDays,
      item.easeFactor,
      item.lastScore
    );
    const status = determineConceptStatus(
      currentDateStr,
      item.nextReviewDate,
      retention,
      item.lastScore
    );

    item.estimatedRetention = retention;
    item.status = status;
    updatedConcepts[cid] = item;
  });

  return {
    ...state,
    concepts: updatedConcepts,
  };
}

/**
 * Updates a concept's spaced-repetition schedule following a Knowledge Check quiz.
 *
 * @param conceptId The concept (1, 2, 3, or 4)
 * @param score Number of correct answers (0, 1, 2, or 3)
 * @param totalQuestions Total questions answered for this concept (typically 3)
 */
export function recordQuizPerformanceForConcept(
  conceptId: ConceptId,
  score: number,
  totalQuestions: number = 3
): { updatedItem: ConceptScheduleItem; schedule: RealNumbersScheduleState } {
  const schedule = loadRealNumbersSchedule();
  const currentDateStr = schedule.currentSimulatedDate;
  const concept = schedule.concepts[conceptId];

  if (!concept) {
    throw new Error(`Concept ${conceptId} not found in schedule`);
  }

  // Calculate quality grade q (0 to 5) based on score in 3-question quiz
  let quality = 0;
  if (score === 3) {
    quality = 5; // Perfect recall, independent
  } else if (score === 2) {
    quality = 3; // Passing recall (67%), passing threshold
  } else if (score === 1) {
    quality = 1; // Severe lapse (33%)
  } else {
    quality = 0; // Complete lapse
  }

  // SM-2 Ease Factor calculation
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEF = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  let newEaseFactor = concept.easeFactor + deltaEF;
  // Clamp ease factor
  newEaseFactor = Math.max(1.30, Math.min(2.80, Number(newEaseFactor.toFixed(2))));

  let newRepetitions = concept.repetitions;
  let newIntervalDays = 1;

  if (quality < 3) {
    // Retention lapse: reset streak, schedule for immediate remediation in 1 day
    newRepetitions = 0;
    newIntervalDays = 1;
  } else {
    // Successful retention
    newRepetitions = concept.repetitions + 1;

    if (newRepetitions === 1) {
      newIntervalDays = score === 3 ? 3 : 2;
    } else if (newRepetitions === 2) {
      newIntervalDays = Math.round(5 * (newEaseFactor / 2.5));
    } else {
      newIntervalDays = Math.round(concept.intervalDays * newEaseFactor);
    }
  }

  // Ensure interval is at least 1 day
  newIntervalDays = Math.max(1, newIntervalDays);

  const nextReviewDate = addDaysYMD(currentDateStr, newIntervalDays);

  const newHistoryEntry: ConceptHistoryEntry = {
    date: currentDateStr,
    score,
    totalQuestions,
    quality,
    nextReviewDate,
  };

  const updatedConcept: ConceptScheduleItem = {
    ...concept,
    easeFactor: newEaseFactor,
    intervalDays: newIntervalDays,
    repetitions: newRepetitions,
    lastAttemptDate: currentDateStr,
    lastScore: score,
    lastTotalQuestions: totalQuestions,
    nextReviewDate,
    status: determineConceptStatus(currentDateStr, nextReviewDate, 95, score),
    estimatedRetention: score === 3 ? 98 : score === 2 ? 88 : 55,
    history: [...concept.history, newHistoryEntry],
  };

  schedule.concepts[conceptId] = updatedConcept;
  saveRealNumbersSchedule(schedule);

  return { updatedItem: updatedConcept, schedule };
}

/**
 * Fast-forward or simulate date change to demonstrate spaced repetition prompts.
 */
export function advanceSimulatedDays(days: number): RealNumbersScheduleState {
  const schedule = loadRealNumbersSchedule();
  const newDate = addDaysYMD(schedule.currentSimulatedDate, days);
  schedule.currentSimulatedDate = newDate;
  const updated = refreshScheduleStatus(schedule);
  saveRealNumbersSchedule(updated);
  return updated;
}

/**
 * Reset scheduler to initial baseline.
 */
export function resetScheduleToDefault(): RealNumbersScheduleState {
  const initial = getInitialRealNumbersSchedule();
  saveRealNumbersSchedule(initial);
  return initial;
}

/**
 * Manually marks a concept as reviewed today, advancing its schedule.
 */
export function markConceptReviewedToday(conceptId: ConceptId): RealNumbersScheduleState {
  return recordQuizPerformanceForConcept(conceptId, 3, 3).schedule;
}

export interface ConceptMasteryInfo {
  percentage: number; // 0 to 100
  label: 'Mastered' | 'Proficient' | 'Developing' | 'Needs Review' | 'Not Assessed';
  color: string; // Tailwind background color for progress bar
  barGradient: string; // Tailwind gradient for progress bar
  textColor: string;
  badgeBg: string;
  scoreText: string; // e.g. "3/3 (100%)" or "1/3 (33%)"
  totalAttempts: number;
}

/**
 * Calculates a student's mastery level for a concept based on their Knowledge Check results.
 * Blends the latest drill accuracy (65%) with cumulative historical quiz accuracy (35%),
 * rewarding consistency and consecutive retention streaks.
 */
export function getConceptMastery(concept?: ConceptScheduleItem | null): ConceptMasteryInfo {
  if (!concept || !concept.history || concept.history.length === 0) {
    return {
      percentage: 0,
      label: 'Not Assessed',
      color: 'bg-slate-300',
      barGradient: 'from-slate-300 to-slate-400',
      textColor: 'text-slate-500',
      badgeBg: 'bg-slate-100 text-slate-600 border-slate-200',
      scoreText: 'No quiz taken',
      totalAttempts: 0,
    };
  }

  // Calculate cumulative accuracy across all Knowledge Check attempts
  const totalCorrect = concept.history.reduce((acc, h) => acc + h.score, 0);
  const totalQ = concept.history.reduce((acc, h) => acc + h.totalQuestions, 0);
  const historicalAvg = totalQ > 0 ? (totalCorrect / totalQ) * 100 : 0;

  // Latest quiz drill score percentage
  const latestPct =
    concept.lastTotalQuestions > 0
      ? (concept.lastScore / concept.lastTotalQuestions) * 100
      : historicalAvg;

  // Blended mastery: 65% weight on latest drill + 35% weight on cumulative quiz history
  let blended = Math.round(latestPct * 0.65 + historicalAvg * 0.35);

  // Bonus for consecutive repetitions if latest score was 3/3
  if (concept.lastScore === concept.lastTotalQuestions && concept.repetitions >= 2) {
    blended = 100;
  }

  const percentage = Math.max(0, Math.min(100, blended));

  let label: ConceptMasteryInfo['label'] = 'Needs Review';
  let color = 'bg-rose-500';
  let barGradient = 'from-rose-500 to-rose-600';
  let textColor = 'text-rose-600';
  let badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';

  if (percentage >= 85) {
    label = 'Mastered';
    color = 'bg-emerald-500';
    barGradient = 'from-emerald-500 to-teal-500';
    textColor = 'text-emerald-700';
    badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (percentage >= 65) {
    label = 'Proficient';
    color = 'bg-blue-500';
    barGradient = 'from-blue-500 to-indigo-500';
    textColor = 'text-blue-700';
    badgeBg = 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (percentage >= 45) {
    label = 'Developing';
    color = 'bg-amber-500';
    barGradient = 'from-amber-500 to-orange-500';
    textColor = 'text-amber-700';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return {
    percentage,
    label,
    color,
    barGradient,
    textColor,
    badgeBg,
    scoreText: `${concept.lastScore}/${concept.lastTotalQuestions} (${Math.round(latestPct)}%)`,
    totalAttempts: concept.history.length,
  };
}
