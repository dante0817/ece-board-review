import { MasteryLevel, Topic, Subject, ReviewError, DailyStudyQueueItem, SpacedFlagReason } from '../types';
import { getLocalDateKey } from './date';

export interface SpacedRepetitionPerformanceInput {
  accuracyPercent: number; // 0 - 100
  questionsAttempted: number;
  questionsCorrect: number;
  timeSpentMinutes: number;
  difficulty: 'Easy' | 'Normal' | 'Difficult';
  usedNotes: 'No' | 'Occasionally' | 'Frequently';
  independenceRating: number; // 1 to 5 (1 = constant hints, 5 = autonomous exam condition)
  confidenceScore?: number; // 1 to 5 (Self-assessment: 1 = Very Low 20%, 5 = Very High 100%)
  previousMastery?: MasteryLevel | null;
  currentEaseFactor?: number; // SM-2 ease factor, default 2.5
  currentIntervalDays?: number; // Previous scheduled interval in days
  currentRepetitions?: number; // Previous consecutive retention streaks
  isHighPriority?: boolean;
  unresolvedErrorsCount?: number;
  anchorDateStr?: string; // Target calculation date; defaults to the user's local date.
}

export interface SpacedRepetitionScheduleResult {
  qualityGrade: number; // 0 - 5 recall grade (SuperMemo SM-2 standard)
  qualityDescription: string;
  newEaseFactor: number;
  newRepetitions: number;
  newIntervalDays: number;
  nextReviewDate: string; // YYYY-MM-DD
  isLapse: boolean;
  recommendedMastery: MasteryLevel;
  explanation: string;
  retentionPacingLabel: string;
  confidenceScore?: number;
  confidenceMultiplier: number;
  confidencePacingNote: string;
  calibrationSafetyApplied: boolean;
  factors: {
    scoreFactor: string;
    notesFactor: string;
    difficultyFactor: string;
    repetitionFactor: string;
    confidenceFactor?: string;
  };
}

/**
 * Computes performance recall quality q (0 to 5) based on board exam accuracy,
 * dependency on reference notes, self-reported recall independence, and self-assessment confidence.
 */
export function computeReviewQualityGrade(input: {
  accuracyPercent: number;
  usedNotes: 'No' | 'Occasionally' | 'Frequently';
  independenceRating: number;
  difficulty: 'Easy' | 'Normal' | 'Difficult';
  confidenceScore?: number;
}): { quality: number; description: string; scoreFactor: string; notesFactor: string; confidenceFactor?: string } {
  const { accuracyPercent, usedNotes, independenceRating, difficulty, confidenceScore } = input;

  let scoreFactor = `${accuracyPercent}% accuracy`;
  let notesFactor = `Notes: ${usedNotes}`;
  let confidenceFactor = confidenceScore ? `Confidence: ${confidenceScore}/5` : undefined;

  // Confidence 1 (Very Low / Guessing): Even if accuracy was high, recall is fragile
  if (confidenceScore === 1) {
    if (accuracyPercent >= 80) {
      return {
        quality: 2,
        description: 'Fragile Recall (Accurate on paper, but self-assessed as guessing/uncertain)',
        scoreFactor: `${accuracyPercent}% accuracy (Discounted due to guessing)`,
        notesFactor: 'Fragile retention requiring immediate reinforcement',
        confidenceFactor: 'Confidence 1/5: Fragile recall penalty applied',
      };
    }
    return {
      quality: 1,
      description: 'Severe Recall Deficit (Low Confidence & Low Accuracy)',
      scoreFactor: `${accuracyPercent}% accuracy`,
      notesFactor: 'Unable to recall key formulas independently',
      confidenceFactor: 'Confidence 1/5: Immediate review required',
    };
  }

  // 5: Perfect response, complete independence, no hesitation, high accuracy (>= 90%)
  if (accuracyPercent >= 90 && usedNotes === 'No' && independenceRating >= 4 && (confidenceScore === undefined || confidenceScore >= 4)) {
    return {
      quality: 5,
      description: 'Superb Recall (Independent & Exam-Ready)',
      scoreFactor: `${accuracyPercent}% accuracy (Exceeds 90% benchmark)`,
      notesFactor: 'Closed book recall with zero reference lookups',
      confidenceFactor: confidenceScore ? `Confidence ${confidenceScore}/5: Validated by 90%+ exam performance` : undefined,
    };
  }

  // 4: Correct response after minor hesitation or >=80% accuracy
  if (accuracyPercent >= 80 && usedNotes !== 'Frequently' && independenceRating >= 3) {
    return {
      quality: 4,
      description: 'Solid Recall (Strong Retention)',
      scoreFactor: `${accuracyPercent}% accuracy (Above 80% threshold)`,
      notesFactor: usedNotes === 'Occasionally' ? 'Minor formula lookups' : 'Autonomous problem solving',
      confidenceFactor: confidenceScore ? `Confidence ${confidenceScore}/5: Strong recall confirmed` : undefined,
    };
  }

  // 3: Passing threshold (>= 65% board passing benchmark)
  if (accuracyPercent >= 65 && usedNotes !== 'Frequently') {
    return {
      quality: 3,
      description: 'Passing Retention (Acceptable Recall)',
      scoreFactor: `${accuracyPercent}% accuracy (Meets 65% board passing standard)`,
      notesFactor: usedNotes === 'Occasionally' ? 'Moderate reference dependency' : 'Independent execution',
      confidenceFactor: confidenceScore ? `Confidence ${confidenceScore}/5: Steady progression` : undefined,
    };
  }

  // 2: Hesitant recall / struggling (50-64% accuracy OR used notes frequently)
  if (accuracyPercent >= 50 || usedNotes === 'Frequently') {
    return {
      quality: 2,
      description: 'Hesitant Recall / Heavy Notes Reliance',
      scoreFactor: `${accuracyPercent}% accuracy (Sub-passing performance)`,
      notesFactor: usedNotes === 'Frequently' ? 'Heavy dependency on reference formulas' : 'Struggled on unfamiliar variations',
      confidenceFactor: confidenceScore ? `Confidence ${confidenceScore}/5: Early follow-up recommended` : undefined,
    };
  }

  // 1: Significant retention deficit (25-49%)
  if (accuracyPercent >= 25) {
    return {
      quality: 1,
      description: 'Severe Retention Deficit (Rapid Decay)',
      scoreFactor: `${accuracyPercent}% accuracy (Severe comprehension breakdown)`,
      notesFactor: 'Unable to formulate solution without guidance',
      confidenceFactor: confidenceScore ? `Confidence ${confidenceScore}/5: Concept remediation required` : undefined,
    };
  }

  // 0: Complete breakdown / unfamiliar (< 25%)
  return {
    quality: 0,
    description: 'Complete Recall Failure',
    scoreFactor: `${accuracyPercent}% accuracy (Total memory lapse)`,
    notesFactor: 'Requires complete concept re-learning',
    confidenceFactor: confidenceScore ? `Confidence ${confidenceScore}/5: Complete recall lapse` : undefined,
  };
}

/**
 * Calculates adaptive spaced repetition schedule based on SuperMemo SM-2,
 * tailored for ECE Board Exam preparation constraints (error count, topic urgency, and days to exam).
 */
export function calculateSpacedRepetitionSchedule(
  input: SpacedRepetitionPerformanceInput
): SpacedRepetitionScheduleResult {
  const anchorDateStr = input.anchorDateStr || getLocalDateKey();
  const currentEaseFactor = input.currentEaseFactor ?? 2.5;
  const currentIntervalDays = Math.max(1, input.currentIntervalDays ?? 1);
  const currentRepetitions = Math.max(0, input.currentRepetitions ?? 0);

  const confidence = input.confidenceScore ?? 3;

  const { quality, description, scoreFactor, notesFactor, confidenceFactor } = computeReviewQualityGrade({
    accuracyPercent: input.accuracyPercent,
    usedNotes: input.usedNotes,
    independenceRating: input.independenceRating,
    difficulty: input.difficulty,
    confidenceScore: confidence,
  });

  // Calculate new Ease Factor using SM-2 adaptation:
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEF = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  let newEaseFactor = currentEaseFactor + deltaEF;

  // Additional modifiers for Board exam rigor
  if (input.difficulty === 'Difficult' && input.accuracyPercent >= 80) {
    newEaseFactor += 0.05; // Bonus for conquering difficult board problems
  } else if (input.difficulty === 'Easy' && input.accuracyPercent < 75) {
    newEaseFactor -= 0.05; // Penalty for stumbling on fundamental easy topics
  }

  if (input.usedNotes === 'Frequently') {
    newEaseFactor -= 0.1;
  }

  // Modulate Ease Factor based on Confidence Score:
  if (confidence === 1) {
    newEaseFactor -= 0.20; // High anxiety / guessing penalty
  } else if (confidence === 2) {
    newEaseFactor -= 0.10; // Hesitant recall penalty
  } else if (confidence === 4) {
    newEaseFactor += 0.08; // High confidence stability boost
  } else if (confidence === 5) {
    newEaseFactor += 0.16; // Very high fluency stability boost
  }

  // Clamp Ease Factor between 1.30 and 2.80
  newEaseFactor = Math.max(1.3, Math.min(2.8, Number(newEaseFactor.toFixed(2))));

  let newRepetitions = currentRepetitions;
  let newIntervalDays = 1;
  let isLapse = false;

  if (quality < 3 || confidence === 1) {
    // Retention lapse or very low confidence: reset repetition streak
    isLapse = true;
    newRepetitions = 0;
    // Low performance requires rapid remediation within 1-2 days
    newIntervalDays = input.accuracyPercent < 50 || confidence === 1 ? 1 : 2;
  } else {
    // Successful recall
    newRepetitions = currentRepetitions + 1;

    if (newRepetitions === 1) {
      // First successful repetition
      if (input.accuracyPercent >= 92 && input.usedNotes === 'No' && confidence >= 4) {
        newIntervalDays = 3;
      } else if (input.difficulty === 'Difficult') {
        newIntervalDays = 1;
      } else {
        newIntervalDays = 2;
      }
    } else if (newRepetitions === 2) {
      // Second repetition: scale by ease factor
      const base = 5;
      newIntervalDays = Math.round(base * (newEaseFactor / 2.5));
      if (input.usedNotes === 'Occasionally') {
        newIntervalDays = Math.max(3, newIntervalDays - 1);
      }
    } else {
      // Third and subsequent repetitions: previous interval * Ease Factor
      let calculatedInterval = Math.round(currentIntervalDays * newEaseFactor);

      // If occasional notes were used, temper the expansion
      if (input.usedNotes === 'Occasionally') {
        calculatedInterval = Math.round(calculatedInterval * 0.85);
      }

      newIntervalDays = Math.max(currentIntervalDays + 2, calculatedInterval);
    }
  }

  // CONFIDENCE-BASED SRS PACING & SCHEDULING MODULATION:
  let confidenceMultiplier = 1.0;
  let confidencePacingNote = '';
  let calibrationSafetyApplied = false;

  if (confidence === 1) {
    confidenceMultiplier = 0.4;
    newIntervalDays = 1; // Immediate next-day follow-up
    confidencePacingNote = 'SRS Confidence 1/5 (Very Low): Scheduled for immediate next-day review to prevent memory decay.';
  } else if (confidence === 2) {
    confidenceMultiplier = 0.65;
    newIntervalDays = Math.max(2, Math.min(3, Math.round(newIntervalDays * 0.65)));
    confidencePacingNote = `SRS Confidence 2/5 (Low): Tightly scheduled in ${newIntervalDays} days to build fluency and eliminate doubt.`;
  } else if (confidence === 3) {
    confidenceMultiplier = 1.0;
    confidencePacingNote = `SRS Confidence 3/5 (Moderate): Standard spaced repetition pacing applied (${newIntervalDays} days).`;
  } else if (confidence === 4) {
    confidenceMultiplier = 1.35;
    newIntervalDays = Math.max(newIntervalDays + 1, Math.round(newIntervalDays * 1.35));
    confidencePacingNote = `SRS Confidence 4/5 (High): Interval expanded to ${newIntervalDays} days (+35% boost) based on strong self-assessed certainty.`;
  } else if (confidence === 5) {
    confidenceMultiplier = 1.75;
    newIntervalDays = Math.max(newIntervalDays + 2, Math.round(newIntervalDays * 1.75));
    confidencePacingNote = `SRS Confidence 5/5 (Very High): Accelerated spaced interval of ${newIntervalDays} days (+75% boost) for exam-ready maintenance.`;
  }

  // Metacognitive Safety Calibration Override:
  // Overconfidence Trap: Felt confident (>= 4), but objective accuracy was below passing (< 70%)
  if (confidence >= 4 && input.accuracyPercent < 70) {
    calibrationSafetyApplied = true;
    newIntervalDays = Math.min(newIntervalDays, 2);
    confidencePacingNote = `SRS Blindspot Alert (Overconfident): Confidence was ${confidence}/5 but accuracy was ${input.accuracyPercent}%. Overrode expansion to ${newIntervalDays} day(s) for urgent concept repair.`;
  } else if (confidence <= 2 && input.accuracyPercent >= 85) {
    // Underconfidence (Hidden Strength): Low confidence despite high score
    calibrationSafetyApplied = true;
    newIntervalDays = Math.max(3, Math.min(newIntervalDays, 5));
    confidencePacingNote = `SRS Calibration (Hidden Strength): High test accuracy (${input.accuracyPercent}%) with low confidence (${confidence}/5). Scheduled in ${newIntervalDays} days to consolidate self-trust without over-reviewing.`;
  }

  // Safety boundaries for ECE Board Exam preparation:
  // 1. Unresolved errors limit interval expansion
  if ((input.unresolvedErrorsCount ?? 0) > 0) {
    newIntervalDays = Math.min(newIntervalDays, 7);
  }

  // 2. High priority board topics get tighter intervals for safety
  if (input.isHighPriority) {
    newIntervalDays = Math.min(newIntervalDays, Math.round(newIntervalDays * 0.9));
    newIntervalDays = Math.min(newIntervalDays, 18);
  }

  // 3. Spaced repetition interval safety bounds
  newIntervalDays = Math.max(1, Math.min(60, newIntervalDays));

  // Determine recommended Mastery Level (1 - 5)
  let recommendedMastery: MasteryLevel = 1;
  if (quality >= 5 && newRepetitions >= 3 && input.accuracyPercent >= 90) {
    recommendedMastery = 5; // Board Ready
  } else if (quality >= 4 && newRepetitions >= 2 && input.accuracyPercent >= 80) {
    recommendedMastery = 4; // Exam Standard
  } else if (quality >= 3 && input.accuracyPercent >= 65) {
    recommendedMastery = 3; // Passing Level
  } else if (quality === 2 || input.accuracyPercent >= 50) {
    recommendedMastery = 2; // Developing
  } else {
    recommendedMastery = 1; // Needs Attention
  }

  // Calculate nextReviewDate by adding interval days to anchorDateStr
  const anchorDate = new Date(anchorDateStr + 'T00:00:00');
  anchorDate.setDate(anchorDate.getDate() + newIntervalDays);
  const nextReviewDate = anchorDate.toISOString().split('T')[0];

  let explanation = '';
  if (isLapse) {
    explanation = `Recall lapsed (Quality ${quality}/5). Resetting spaced repetition interval to ${newIntervalDays} day(s) for immediate reinforcement.`;
  } else if (newRepetitions === 1) {
    explanation = `Initial retention verified (Quality ${quality}/5). Scheduled for next check-in in ${newIntervalDays} day(s).`;
  } else {
    explanation = `Successful retention repetition #${newRepetitions} (Quality ${quality}/5). Interval expanded to ${newIntervalDays} days (Ease Factor: ${newEaseFactor}).`;
  }

  const difficultyFactor = `Difficulty: ${input.difficulty} ${
    input.difficulty === 'Difficult' && input.accuracyPercent >= 80 ? '(+0.05 EF bonus)' : ''
  }`;
  const repetitionFactor = `Repetition #${newRepetitions} ${
    isLapse ? '(Reset after recall lapse)' : `(Interval expanded to ${newIntervalDays}d)`
  }`;

  const retentionPacingLabel =
    newIntervalDays === 1
      ? 'Review tomorrow (Immediate Reinforcement)'
      : newIntervalDays <= 3
      ? `Review in ${newIntervalDays} days (Short-cycle)`
      : `Review in ${newIntervalDays} days (Spaced Expansion)`;

  return {
    qualityGrade: quality,
    qualityDescription: description,
    newEaseFactor,
    newRepetitions,
    newIntervalDays,
    nextReviewDate,
    isLapse,
    recommendedMastery,
    explanation,
    retentionPacingLabel,
    confidenceScore: confidence,
    confidenceMultiplier,
    confidencePacingNote,
    calibrationSafetyApplied,
    factors: {
      scoreFactor,
      notesFactor,
      difficultyFactor,
      repetitionFactor,
      confidenceFactor,
    },
  };
}

/**
 * Returns categorical due status of a topic relative to today's date.
 */
export function getTopicDueStatus(
  topic: Topic,
  todayStr: string = getLocalDateKey()
): 'due_today' | 'overdue' | 'future' | 'uncovered' | 'unreviewed' {
  if (!topic.initialCovered) return 'uncovered';
  if (!topic.nextReviewDate) return 'unreviewed';

  if (topic.nextReviewDate === todayStr) return 'due_today';
  if (topic.nextReviewDate < todayStr) return 'overdue';
  return 'future';
}

/**
 * Calculates days overdue (positive number) or days until due (negative number).
 * 0 means due today.
 */
export function getDaysOverdueOrUntilDue(topic: Topic, todayStr: string = getLocalDateKey()): number | null {
  if (!topic.nextReviewDate) return null;
  const today = new Date(todayStr + 'T00:00:00');
  const reviewDate = new Date(topic.nextReviewDate + 'T00:00:00');
  const diffDays = Math.round((today.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculates estimated retention percentage based on the Ebbinghaus exponential forgetting curve:
 * R = e^(-t / S) * 100
 * where t = days elapsed since last review, and S = memory stability (proportional to scheduled interval)
 */
export function calculateEstimatedRetention(topic: Topic, todayStr: string = getLocalDateKey()): number {
  if (!topic.initialCovered) return 0;
  if (!topic.lastReviewDate) return 40;

  const today = new Date(todayStr + 'T00:00:00');
  const lastReview = new Date(topic.lastReviewDate + 'T00:00:00');
  const daysElapsed = Math.max(0, (today.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

  // Stability S is roughly proportional to the interval or mastery
  const stability = Math.max(2, topic.intervalDays ?? (topic.mastery ? topic.mastery * 4 : 4));

  // Exponential decay
  const retention = Math.exp(-daysElapsed / (stability * 1.6)) * 100;
  return Math.max(10, Math.min(100, Math.round(retention)));
}

export interface TopicFlagEvaluationResult {
  isFlagged: boolean;
  urgencyScore: number;
  urgencyLevel: 'critical' | 'high' | 'moderate';
  flagReason: SpacedFlagReason;
  detailedRationale: string[];
  daysSinceLastReview: number;
  daysOverdue: number;
  estimatedRetention: number;
  recommendedAction: string;
  suggestedQuestionCount: number;
  suggestedDurationMinutes: number;
  lastPerformanceSummary: string;
}

/**
 * Evaluates whether a topic should be automatically flagged for review based on:
 * 1. Days elapsed since last review (Ebbinghaus forgetting curve decay)
 * 2. Historical performance (latestScore, averageScore, lastReviewQuality, mastery level)
 * 3. Overdue status relative to SuperMemo SM-2 scheduled nextReviewDate
 * 4. Active unresolved conceptual errors in Error Log
 * 5. High-priority ECE Board Exam relevance
 */
export function evaluateTopicSpacedRepetitionFlag(
  topic: Topic,
  todayStr: string = getLocalDateKey(),
  activeErrorsCount: number = 0,
  subjectWeightPercent: number = 15
): TopicFlagEvaluationResult {
  if (!topic.initialCovered) {
    return {
      isFlagged: false,
      urgencyScore: 0,
      urgencyLevel: 'moderate',
      flagReason: 'Initial Retention Check',
      detailedRationale: ['Topic has not yet been initially studied or covered in syllabus.'],
      daysSinceLastReview: 0,
      daysOverdue: 0,
      estimatedRetention: 0,
      recommendedAction: 'Read textbook chapter and complete first 5 orientation problems.',
      suggestedQuestionCount: 5,
      suggestedDurationMinutes: 15,
      lastPerformanceSummary: 'Uncovered',
    };
  }

  const today = new Date(todayStr + 'T00:00:00');

  // 1. Calculate days elapsed since last review
  let daysSinceLastReview = 0;
  if (topic.lastReviewDate) {
    const lastReviewDate = new Date(topic.lastReviewDate + 'T00:00:00');
    daysSinceLastReview = Math.max(
      0,
      Math.round((today.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24))
    );
  } else if (topic.activityHistory && topic.activityHistory.length > 0) {
    const lastDate = topic.activityHistory[0].date;
    const histDate = new Date(lastDate + 'T00:00:00');
    daysSinceLastReview = Math.max(
      0,
      Math.round((today.getTime() - histDate.getTime()) / (1000 * 60 * 60 * 24))
    );
  } else {
    // Covered but no formal review logged yet
    daysSinceLastReview = 7;
  }

  // 2. Calculate days overdue relative to nextReviewDate
  let daysOverdue = 0;
  if (topic.nextReviewDate) {
    const nextDate = new Date(topic.nextReviewDate + 'T00:00:00');
    daysOverdue = Math.round((today.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
  } else {
    // If no explicit next review date, derive from intervalDays
    const interval = topic.intervalDays || 3;
    daysOverdue = daysSinceLastReview - interval;
  }

  // 3. Dynamic Memory Stability (S) and Estimated Retention
  // Base stability from interval and SM-2 Ease Factor
  const baseInterval = Math.max(1, topic.intervalDays ?? 3);
  const easeFactor = topic.easeFactor ?? 2.5;
  let stability = baseInterval * (easeFactor / 2.5);

  // Performance modifiers on stability:
  const latestScore = topic.latestScore ?? (topic.averageScore ?? 75);
  if (latestScore < 60) {
    stability *= 0.55; // Sub-passing performance cuts memory stability in half
  } else if (latestScore < 75) {
    stability *= 0.75;
  } else if (latestScore >= 90) {
    stability *= 1.2; // High recall extends retention stability
  }

  if (topic.mastery !== null) {
    if (topic.mastery <= 1) stability *= 0.6;
    else if (topic.mastery === 2) stability *= 0.8;
    else if (topic.mastery >= 4) stability *= 1.25;
  }

  // Active errors introduce cognitive interference and accelerate forgetting
  if (activeErrorsCount > 0) {
    stability *= Math.max(0.5, 1 - activeErrorsCount * 0.12);
  }

  // Calculate exponential retention percentage: R = e^(-t / S) * 100
  const decayRate = Math.max(1.2, stability * 1.6);
  const estimatedRetention = Math.max(
    10,
    Math.min(100, Math.round(Math.exp(-daysSinceLastReview / decayRate) * 100))
  );

  // 4. Evaluate Flagging Triggers
  const isOverdue = daysOverdue > 0;
  const isDueToday = daysOverdue === 0;
  const retentionThreshold = topic.isHighPriority ? 80 : 72;
  const hasRetentionDecay = estimatedRetention < retentionThreshold;
  const hasPerformanceLapse =
    (topic.latestScore !== null && topic.latestScore < 70) ||
    (topic.mastery !== null && topic.mastery <= 2) ||
    (topic.lastReviewQuality !== undefined && topic.lastReviewQuality < 3);
  const hasActiveErrors = activeErrorsCount > 0 && daysSinceLastReview >= 1;
  const isUnreviewed = topic.reviewCount === 0;

  const isFlagged =
    isOverdue || isDueToday || hasRetentionDecay || hasPerformanceLapse || hasActiveErrors || isUnreviewed;

  // 5. Composite Urgency Scoring (0 - 100+)
  let urgencyScore = 0;

  // Overdue urgency
  if (isOverdue) {
    urgencyScore += 35 + Math.min(30, daysOverdue * 6);
  } else if (isDueToday) {
    urgencyScore += 26;
  } else if (hasRetentionDecay) {
    urgencyScore += 16 + Math.round((retentionThreshold - estimatedRetention) * 0.8);
  }

  // Retention deficit points
  if (estimatedRetention < 85) {
    urgencyScore += Math.round((85 - estimatedRetention) * 0.45);
  }

  // Performance risk points
  if (topic.latestScore !== null) {
    if (topic.latestScore < 55) urgencyScore += 26;
    else if (topic.latestScore < 70) urgencyScore += 18;
    else if (topic.latestScore < 80) urgencyScore += 8;
  }

  if (topic.mastery !== null) {
    urgencyScore += (5 - topic.mastery) * 5;
  } else {
    urgencyScore += 15;
  }

  // Error interference
  if (activeErrorsCount > 0) {
    urgencyScore += Math.min(25, activeErrorsCount * 8);
  }

  // Board relevance / Exam priority
  if (topic.isHighPriority) {
    urgencyScore += 16;
  }
  if (topic.boardRelevance === 'High') {
    urgencyScore += 8;
  }
  urgencyScore += Math.round(subjectWeightPercent * 0.3);

  // Classify Urgency Level
  let urgencyLevel: 'critical' | 'high' | 'moderate' = 'moderate';
  if (urgencyScore >= 68 || (isOverdue && hasPerformanceLapse)) {
    urgencyLevel = 'critical';
  } else if (urgencyScore >= 42 || isOverdue || isDueToday) {
    urgencyLevel = 'high';
  }

  // Determine Primary Flag Reason
  let flagReason: SpacedFlagReason = 'Due Today';
  if (isOverdue) {
    flagReason = 'Overdue Spaced Interval';
  } else if (hasPerformanceLapse && (topic.latestScore ?? 100) < 70) {
    flagReason = 'Performance Lapse';
  } else if (hasRetentionDecay) {
    flagReason = 'Retention Decay';
  } else if (hasActiveErrors) {
    flagReason = 'Unresolved Error Trap';
  } else if (isUnreviewed) {
    flagReason = 'Initial Retention Check';
  } else if (isDueToday) {
    flagReason = 'Due Today';
  }

  // 6. Detailed Rationale Formulations
  const detailedRationale: string[] = [];

  if (isOverdue) {
    detailedRationale.push(
      `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} on scheduled SM-2 interval (${topic.nextReviewDate}).`
    );
  } else if (isDueToday) {
    detailedRationale.push(`Scheduled for retention review today (${todayStr}).`);
  } else if (daysSinceLastReview > 0) {
    detailedRationale.push(`Last reviewed ${daysSinceLastReview} days ago (${topic.lastReviewDate || 'earlier'}).`);
  }

  if (estimatedRetention < 80) {
    detailedRationale.push(
      `Estimated memory retention decayed to ${estimatedRetention}% (Target benchmark: ≥80%).`
    );
  } else {
    detailedRationale.push(`Estimated memory retention currently at ${estimatedRetention}%.`);
  }

  if (topic.latestScore !== null) {
    if (topic.latestScore < 70) {
      detailedRationale.push(
        `Latest score of ${topic.latestScore}% is below the 70% PRC passing benchmark.`
      );
    } else {
      detailedRationale.push(
        `Latest verified accuracy: ${topic.latestScore}% (Mastery Level ${topic.mastery ?? '—'}/5).`
      );
    }
  }

  if (activeErrorsCount > 0) {
    detailedRationale.push(
      `${activeErrorsCount} active conceptual error${activeErrorsCount > 1 ? 's' : ''} logged requiring reinforcement.`
    );
  }

  if (topic.isHighPriority) {
    detailedRationale.push(
      'Flagged as Critical Board Priority topic with high recurrence on previous licensure exams.'
    );
  }

  // 7. Actionable Recommendations
  let recommendedAction = 'Practice 10 timed problems to re-anchor core formulas.';
  let suggestedQuestionCount = 10;
  let suggestedDurationMinutes = 15;

  if (hasPerformanceLapse || (topic.latestScore ?? 100) < 60) {
    recommendedAction = 'Review key formulas and complete a targeted 10-problem diagnostic set.';
    suggestedQuestionCount = 10;
    suggestedDurationMinutes = 20;
  } else if (activeErrorsCount > 0) {
    recommendedAction = `Target the ${activeErrorsCount} logged error trap(s) with focused formula verification.`;
    suggestedQuestionCount = 8;
    suggestedDurationMinutes = 15;
  } else if (estimatedRetention < 70) {
    recommendedAction = 'Conduct timed retrieval drill to arrest exponential memory decay.';
    suggestedQuestionCount = 10;
    suggestedDurationMinutes = 15;
  } else if (isOverdue) {
    recommendedAction = 'Complete scheduled maintenance review to restore SM-2 interval expansion.';
    suggestedQuestionCount = 10;
    suggestedDurationMinutes = 15;
  } else {
    recommendedAction = 'Perform rapid 5-problem check-in to confirm retention.';
    suggestedQuestionCount = 5;
    suggestedDurationMinutes = 10;
  }

  let lastPerformanceSummary = 'Never reviewed';
  if (topic.latestScore !== null) {
    lastPerformanceSummary = `${topic.latestScore}% (Score) • L${topic.mastery ?? '—'}`;
  }

  return {
    isFlagged,
    urgencyScore,
    urgencyLevel,
    flagReason,
    detailedRationale,
    daysSinceLastReview,
    daysOverdue,
    estimatedRetention,
    recommendedAction,
    suggestedQuestionCount,
    suggestedDurationMinutes,
    lastPerformanceSummary,
  };
}

/**
 * Builds the prioritized daily study queue from all covered topics,
 * automatically applying the spaced repetition algorithm and sorting by composite urgency.
 */
export function buildPrioritizedDailyStudyQueue(
  allTopics: Topic[],
  subjects: Subject[],
  errors: ReviewError[],
  todayStr: string = getLocalDateKey()
): DailyStudyQueueItem[] {
  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  const queue: DailyStudyQueueItem[] = [];

  for (const topic of allTopics) {
    if (!topic.initialCovered) continue;

    const subject = subjectMap.get(topic.subjectId);
    const subjectName = subject ? subject.name : 'Mathematics';
    const subjectCategory = subject ? subject.category : 'Mathematics';
    const subjectWeight = subject ? subject.boardWeightPercent : 15;

    const topicErrors = errors.filter((e) => e.topicId === topic.id && !e.isResolved);

    const evaluation = evaluateTopicSpacedRepetitionFlag(
      topic,
      todayStr,
      topicErrors.length,
      subjectWeight
    );

    if (evaluation.isFlagged) {
      queue.push({
        topic: {
          ...topic,
          isFlaggedForReview: true,
          flagReason: evaluation.flagReason,
          urgencyLevel: evaluation.urgencyLevel,
          urgencyScore: evaluation.urgencyScore,
          retentionStrengthPercent: evaluation.estimatedRetention,
        },
        subjectName,
        subjectCategory,
        urgencyScore: evaluation.urgencyScore,
        urgencyLevel: evaluation.urgencyLevel,
        flagReason: evaluation.flagReason,
        detailedRationale: evaluation.detailedRationale,
        daysSinceLastReview: evaluation.daysSinceLastReview,
        daysOverdue: evaluation.daysOverdue,
        estimatedRetentionPercent: evaluation.estimatedRetention,
        recommendedAction: evaluation.recommendedAction,
        suggestedQuestionCount: evaluation.suggestedQuestionCount,
        suggestedDurationMinutes: evaluation.suggestedDurationMinutes,
        lastPerformanceSummary: evaluation.lastPerformanceSummary,
      });
    }
  }

  // Sort queue strictly in priority order: Highest urgency score first
  return queue.sort((a, b) => b.urgencyScore - a.urgencyScore);
}

