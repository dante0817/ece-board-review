import { MockExamQuestion } from '../types';
import { MOCK_EXAM_QUESTIONS } from '../data/mockExamQuestions';
import { getLocalDateKey } from './date';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionReviewGrade = 'Again' | 'Hard' | 'Good' | 'Easy';
export type QuestionDueStatus = 'Overdue' | 'Due Today' | 'Due Tomorrow' | 'Upcoming';

export interface QuestionPracticeHistoryItem {
  id: string;
  date: string;
  grade: QuestionReviewGrade;
  intervalAssigned: number;
  easeFactorAssigned: number;
  userSelectedOption?: string;
  isCorrect: boolean;
}

export interface ScheduledQuestionRecord {
  id: string;
  questionId: string;
  question: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
  keyFormula?: string;
  boardTip?: string;
  difficulty: QuestionDifficulty;
  subjectName: string;
  subjectId: string;
  topicName: string;
  topicId: string;

  // Spaced Repetition tracking state
  lastPracticedDate: string; // YYYY-MM-DD
  nextReviewDate: string; // YYYY-MM-DD
  intervalDays: number; // Scheduled interval in days
  easeFactor: number; // Dynamic ease factor (SM-2 standard)
  repetitions: number; // Consecutive successful reviews
  lapses: number; // Number of failed recall reviews
  totalAttempts: number;
  successfulAttempts: number;

  history: QuestionPracticeHistoryItem[];
}

export interface QuestionScheduleAnalysis {
  daysElapsed: number;
  daysUntilDue: number; // Negative = overdue, 0 = due today, positive = days in future
  dueStatus: QuestionDueStatus;
  estimatedRetentionPercent: number; // 0 - 100%
  urgencyScore: number; // Higher means review sooner
  difficultyFactorLabel: string;
  recommendedGradeIntervals: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

/**
 * Adds days to a YYYY-MM-DD string and returns the resulting YYYY-MM-DD string.
 */
export function addDays(baseDateStr: string, days: number): string {
  const d = new Date(baseDateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates calendar days between two YYYY-MM-DD strings.
 */
export function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  const d1 = new Date(fromIsoDate + 'T00:00:00').getTime();
  const d2 = new Date(toIsoDate + 'T00:00:00').getTime();
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Difficulty-based constants defining base interval and decay rates.
 */
export const DIFFICULTY_CONFIG: Record<
  QuestionDifficulty,
  {
    baseIntervalDays: number;
    initialEaseFactor: number;
    difficultyMultiplier: number;
    memoryDecayRate: number; // Ebbinghaus exponential decay parameter lambda
    label: string;
    description: string;
  }
> = {
  Hard: {
    baseIntervalDays: 1,
    initialEaseFactor: 1.8,
    difficultyMultiplier: 0.85,
    memoryDecayRate: 0.28,
    label: 'Hard (Aggressive Spacing)',
    description: '1-day base interval. Frequent repetitions to cement complex multi-step board problems.',
  },
  Medium: {
    baseIntervalDays: 2,
    initialEaseFactor: 2.2,
    difficultyMultiplier: 1.0,
    memoryDecayRate: 0.16,
    label: 'Medium (Standard Spacing)',
    description: '2-day base interval. Balanced spacing for standard conceptual and analytical questions.',
  },
  Easy: {
    baseIntervalDays: 4,
    initialEaseFactor: 2.6,
    difficultyMultiplier: 1.25,
    memoryDecayRate: 0.09,
    label: 'Easy (Gradual Spacing)',
    description: '4-day base interval. Rapidly expanding intervals for definitions and foundational recall.',
  },
};

/**
 * Computes the next interval (in days) and ease factor based on question difficulty,
 * past repetition count, and the user's recall grade.
 */
export function computeNextQuestionInterval(
  difficulty: QuestionDifficulty,
  currentInterval: number,
  currentEaseFactor: number,
  currentRepetitions: number,
  grade: QuestionReviewGrade
): { nextInterval: number; nextEaseFactor: number; nextRepetitions: number; isLapse: boolean } {
  const config = DIFFICULTY_CONFIG[difficulty];
  let nextEaseFactor = currentEaseFactor;
  let nextRepetitions = currentRepetitions;
  let nextInterval = currentInterval;
  let isLapse = false;

  switch (grade) {
    case 'Again': {
      // Complete recall failure / lapse
      isLapse = true;
      nextRepetitions = 0;
      nextEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
      // Hard questions reset to 1 day; easy questions reset to 1-2 days
      nextInterval = difficulty === 'Hard' ? 1 : 1;
      break;
    }

    case 'Hard': {
      // Recalled with great difficulty or hints
      nextRepetitions += 1;
      nextEaseFactor = Math.max(1.3, currentEaseFactor - 0.15);
      if (currentRepetitions === 0) {
        nextInterval = config.baseIntervalDays;
      } else if (currentRepetitions === 1) {
        nextInterval = Math.max(config.baseIntervalDays + 1, Math.round(config.baseIntervalDays * 1.5));
      } else {
        nextInterval = Math.max(currentInterval + 1, Math.round(currentInterval * 1.2));
      }
      break;
    }

    case 'Good': {
      // Successful normal recall
      nextRepetitions += 1;
      // Ease factor remains stable for Good
      if (currentRepetitions === 0) {
        nextInterval = config.baseIntervalDays;
      } else if (currentRepetitions === 1) {
        // Second review interval scales with difficulty
        nextInterval = Math.round(config.baseIntervalDays * 2.4);
      } else {
        // SM-2 exponential scaling modulated by question difficulty
        nextInterval = Math.round(currentInterval * nextEaseFactor * config.difficultyMultiplier);
      }
      break;
    }

    case 'Easy': {
      // Effortless instantaneous recall
      nextRepetitions += 1;
      nextEaseFactor = Math.min(3.2, currentEaseFactor + 0.15);
      if (currentRepetitions === 0) {
        nextInterval = Math.round(config.baseIntervalDays * 1.8);
      } else if (currentRepetitions === 1) {
        nextInterval = Math.round(config.baseIntervalDays * 3.6);
      } else {
        nextInterval = Math.round(currentInterval * nextEaseFactor * 1.35 * config.difficultyMultiplier);
      }
      break;
    }
  }

  // Ensure monotonic progression when successful
  if (grade !== 'Again') {
    nextInterval = Math.max(currentInterval + 1, nextInterval);
  }

  // Cap interval at 180 days (board review timeframe)
  nextInterval = Math.min(180, nextInterval);

  return {
    nextInterval,
    nextEaseFactor: Math.round(nextEaseFactor * 100) / 100,
    nextRepetitions,
    isLapse,
  };
}

/**
 * Analyzes a scheduled question against the current review anchor date (today).
 */
export function analyzeScheduledQuestion(
  question: ScheduledQuestionRecord,
  todayStr: string = getLocalDateKey()
): QuestionScheduleAnalysis {
  const daysElapsed = Math.max(0, daysBetween(question.lastPracticedDate, todayStr));
  const daysUntilDue = daysBetween(todayStr, question.nextReviewDate);

  let dueStatus: QuestionDueStatus = 'Upcoming';
  if (daysUntilDue < 0) {
    dueStatus = 'Overdue';
  } else if (daysUntilDue === 0) {
    dueStatus = 'Due Today';
  } else if (daysUntilDue === 1) {
    dueStatus = 'Due Tomorrow';
  } else {
    dueStatus = 'Upcoming';
  }

  // Ebbinghaus Memory Retention Decay R(t) = exp(-t * lambda / S)
  const config = DIFFICULTY_CONFIG[question.difficulty];
  const stabilityFactor = Math.max(1, question.intervalDays);
  const decayExponent = (daysElapsed / stabilityFactor) * config.memoryDecayRate * 2.2;
  const estimatedRetentionPercent = Math.max(
    5,
    Math.min(100, Math.round(Math.exp(-decayExponent) * 100))
  );

  // Urgency score: higher for overdue, low retention, hard difficulty
  let urgencyScore = 0;
  if (dueStatus === 'Overdue') {
    urgencyScore += 100 + Math.abs(daysUntilDue) * 15;
  } else if (dueStatus === 'Due Today') {
    urgencyScore += 70;
  } else if (dueStatus === 'Due Tomorrow') {
    urgencyScore += 30;
  } else {
    urgencyScore += Math.max(0, 20 - daysUntilDue);
  }

  // Difficulty urgency bonus
  if (question.difficulty === 'Hard') urgencyScore += 25;
  if (question.difficulty === 'Medium') urgencyScore += 10;

  // Retention penalty bonus (lower retention = higher urgency)
  urgencyScore += Math.max(0, Math.round((100 - estimatedRetentionPercent) * 0.4));

  // Compute what intervals would be assigned for each grade right now
  const againCalc = computeNextQuestionInterval(
    question.difficulty,
    question.intervalDays,
    question.easeFactor,
    question.repetitions,
    'Again'
  );
  const hardCalc = computeNextQuestionInterval(
    question.difficulty,
    question.intervalDays,
    question.easeFactor,
    question.repetitions,
    'Hard'
  );
  const goodCalc = computeNextQuestionInterval(
    question.difficulty,
    question.intervalDays,
    question.easeFactor,
    question.repetitions,
    'Good'
  );
  const easyCalc = computeNextQuestionInterval(
    question.difficulty,
    question.intervalDays,
    question.easeFactor,
    question.repetitions,
    'Easy'
  );

  return {
    daysElapsed,
    daysUntilDue,
    dueStatus,
    estimatedRetentionPercent,
    urgencyScore,
    difficultyFactorLabel: config.label,
    recommendedGradeIntervals: {
      again: againCalc.nextInterval,
      hard: hardCalc.nextInterval,
      good: goodCalc.nextInterval,
      easy: easyCalc.nextInterval,
    },
  };
}

/**
 * Generates an initial realistic dataset of scheduled questions mapped from MOCK_EXAM_QUESTIONS
 * with varying practice dates, difficulties, and intervals.
 */
export function getInitialScheduledQuestions(todayStr: string = getLocalDateKey()): ScheduledQuestionRecord[] {
  // Use a curated sample of diverse questions across Mathematics, Electronics, and Communications
  const sampleQuestions = MOCK_EXAM_QUESTIONS.slice(0, 18);

  // Realistic seed parameters:
  // Item 0: Hard question practiced 2 days ago, 1-day interval -> OVERDUE by 1 day
  // Item 1: Medium question practiced 3 days ago, 2-day interval -> OVERDUE by 1 day
  // Item 2: Hard question practiced yesterday, 1-day interval -> DUE TODAY
  // Item 3: Medium question practiced 2 days ago, 2-day interval -> DUE TODAY
  // Item 4: Easy question practiced 4 days ago, 4-day interval -> DUE TODAY
  // Item 5: Hard question practiced 3 days ago, failed (interval 1d) -> OVERDUE by 2 days
  // Item 6: Medium question practiced yesterday, interval 2d -> DUE TOMORROW
  // Item 7: Easy question practiced 2 days ago, interval 4d -> UPCOMING (in 2 days)
  // Item 8: Medium question practiced 1 day ago, interval 5d -> UPCOMING (in 4 days)
  // etc.

  const seedConfigs: Array<{
    daysAgoPracticed: number;
    intervalDays: number;
    repetitions: number;
    easeFactor: number;
    lapses: number;
    forcedDifficulty?: QuestionDifficulty;
  }> = [
    { daysAgoPracticed: 2, intervalDays: 1, repetitions: 1, easeFactor: 1.7, lapses: 1, forcedDifficulty: 'Hard' }, // Overdue
    { daysAgoPracticed: 4, intervalDays: 2, repetitions: 1, easeFactor: 2.1, lapses: 0, forcedDifficulty: 'Medium' }, // Overdue
    { daysAgoPracticed: 1, intervalDays: 1, repetitions: 1, easeFactor: 1.8, lapses: 0, forcedDifficulty: 'Hard' }, // Due Today
    { daysAgoPracticed: 2, intervalDays: 2, repetitions: 1, easeFactor: 2.2, lapses: 0, forcedDifficulty: 'Medium' }, // Due Today
    { daysAgoPracticed: 4, intervalDays: 4, repetitions: 1, easeFactor: 2.6, lapses: 0, forcedDifficulty: 'Easy' }, // Due Today
    { daysAgoPracticed: 3, intervalDays: 1, repetitions: 0, easeFactor: 1.6, lapses: 2, forcedDifficulty: 'Hard' }, // Overdue
    { daysAgoPracticed: 1, intervalDays: 2, repetitions: 1, easeFactor: 2.2, lapses: 0, forcedDifficulty: 'Medium' }, // Due Tomorrow
    { daysAgoPracticed: 2, intervalDays: 4, repetitions: 1, easeFactor: 2.5, lapses: 0, forcedDifficulty: 'Easy' }, // In 2 days
    { daysAgoPracticed: 1, intervalDays: 5, repetitions: 2, easeFactor: 2.3, lapses: 0, forcedDifficulty: 'Medium' }, // In 4 days
    { daysAgoPracticed: 3, intervalDays: 8, repetitions: 3, easeFactor: 2.7, lapses: 0, forcedDifficulty: 'Easy' }, // In 5 days
    { daysAgoPracticed: 5, intervalDays: 5, repetitions: 2, easeFactor: 2.2, lapses: 1, forcedDifficulty: 'Medium' }, // Due Today
    { daysAgoPracticed: 1, intervalDays: 3, repetitions: 2, easeFactor: 1.9, lapses: 0, forcedDifficulty: 'Hard' }, // In 2 days
    { daysAgoPracticed: 6, intervalDays: 6, repetitions: 2, easeFactor: 2.3, lapses: 0, forcedDifficulty: 'Medium' }, // Due Today
    { daysAgoPracticed: 4, intervalDays: 12, repetitions: 3, easeFactor: 2.8, lapses: 0, forcedDifficulty: 'Easy' }, // In 8 days
    { daysAgoPracticed: 2, intervalDays: 2, repetitions: 1, easeFactor: 2.0, lapses: 1, forcedDifficulty: 'Hard' }, // Due Today
    { daysAgoPracticed: 7, intervalDays: 4, repetitions: 1, easeFactor: 2.1, lapses: 2, forcedDifficulty: 'Medium' }, // Overdue
    { daysAgoPracticed: 3, intervalDays: 7, repetitions: 2, easeFactor: 2.6, lapses: 0, forcedDifficulty: 'Easy' }, // In 4 days
    { daysAgoPracticed: 1, intervalDays: 1, repetitions: 0, easeFactor: 1.7, lapses: 1, forcedDifficulty: 'Hard' }, // Due Today
  ];

  return sampleQuestions.map((q, idx) => {
    const seed = seedConfigs[idx % seedConfigs.length];
    const difficulty: QuestionDifficulty = seed.forcedDifficulty || (q.difficulty as QuestionDifficulty) || 'Medium';
    const lastPracticedDate = addDays(todayStr, -seed.daysAgoPracticed);
    const nextReviewDate = addDays(lastPracticedDate, seed.intervalDays);

    return {
      id: `scheduled-${q.id}`,
      questionId: q.id,
      question: q.question,
      options: q.options,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      keyFormula: q.keyFormula,
      boardTip: q.boardTip,
      difficulty,
      subjectName: q.subjectName,
      subjectId: q.subjectId,
      topicName: q.topicName,
      topicId: q.topicId,
      lastPracticedDate,
      nextReviewDate,
      intervalDays: seed.intervalDays,
      easeFactor: seed.easeFactor,
      repetitions: seed.repetitions,
      lapses: seed.lapses,
      totalAttempts: seed.repetitions + seed.lapses,
      successfulAttempts: seed.repetitions,
      history: [
        {
          id: `hist-${q.id}-0`,
          date: lastPracticedDate,
          grade: seed.lapses > 0 ? 'Hard' : 'Good',
          intervalAssigned: seed.intervalDays,
          easeFactorAssigned: seed.easeFactor,
          isCorrect: seed.lapses === 0,
        },
      ],
    };
  });
}
