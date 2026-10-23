import { MasteryLevel, Topic, TopicStatusTier, StatusMarker } from '../types';
import { calculateSpacedRepetitionSchedule } from './spacedRepetition';
import { getLocalDateKey } from './date';

export interface MasteryEvidenceInput {
  accuracyPercent: number;
  difficulty: 'Easy' | 'Normal' | 'Difficult';
  usedNotes: 'No' | 'Occasionally' | 'Frequently';
  questionsAttempted: number;
  timeSpentMinutes: number;
  independenceRating: number; // 1 to 5: "How well can you solve this independently now?"
  confidenceScore?: number; // 1 to 5: Self-assessed certainty rating
  previousMastery: MasteryLevel | null;
  previousScore: number | null;
  anchorDateStr?: string;
}

export interface MasteryRecommendation {
  suggestedMastery: MasteryLevel;
  nextReviewIntervalDays: number;
  nextReviewDate: string;
  confidenceScore?: number;
  confidencePacingNote?: string;
  confidenceMultiplier?: number;
  calibrationSafetyApplied?: boolean;
  reasons: string[];
  evidenceSummary: {
    accuracy: string;
    difficulty: string;
    notes: string;
    timed: string;
    questions: number;
    confidence?: string;
  };
}

export function computeTopicTier(topic: Topic): TopicStatusTier {
  if (!topic.initialCovered && topic.reviewCount === 0) {
    return 'Not Started';
  }
  if (!topic.mastery || topic.mastery <= 2 || (topic.latestScore !== null && topic.latestScore < 65)) {
    return 'NEEDS WORK';
  }
  if (topic.mastery === 5 && (topic.latestScore === null || topic.latestScore >= 85)) {
    return 'BOARD READY';
  }
  return 'DEVELOPING';
}

export function computeTopicMarker(topic: Topic, todayStr: string = getLocalDateKey()): StatusMarker {
  if (!topic.initialCovered && topic.reviewCount === 0) {
    return '—';
  }
  if (topic.mastery === 5 && (topic.latestScore === null || topic.latestScore >= 85)) {
    return '✓';
  }
  
  // Overdue check
  const isOverdue = topic.nextReviewDate && topic.nextReviewDate < todayStr;
  const isDueToday = topic.nextReviewDate === todayStr;

  if (topic.isHighPriority || (topic.mastery !== null && topic.mastery <= 2) || isOverdue) {
    return '⚠';
  }
  if (isDueToday) {
    return '⏱';
  }
  
  // Score improving check
  if (topic.activityHistory.length >= 2) {
    const latest = topic.activityHistory[0]?.score ?? 0;
    const prev = topic.activityHistory[1]?.score ?? 0;
    if (latest > prev) {
      return '↗';
    }
  }

  return '⏱';
}

export function calculateMasteryRecommendation(input: MasteryEvidenceInput): MasteryRecommendation {
  const {
    accuracyPercent,
    difficulty,
    usedNotes,
    questionsAttempted,
    independenceRating,
    confidenceScore,
    previousMastery = 1,
    previousScore,
    anchorDateStr = getLocalDateKey(),
  } = input;

  const reasons: string[] = [];

  // Weighted scoring algorithm
  // Base score from accuracy
  let points = (accuracyPercent / 100) * 40; // max 40

  // Independence contribution
  points += (independenceRating / 5) * 30; // max 30

  // Notes adjustment
  if (usedNotes === 'No') {
    points += 15;
    reasons.push('Completed fully without reference notes');
  } else if (usedNotes === 'Occasionally') {
    points += 7;
    reasons.push('Minimal formula lookups required');
  } else {
    points += 0;
    reasons.push('Relied frequently on formulas or solved examples');
  }

  // Difficulty adjustment
  if (difficulty === 'Difficult') {
    points += 15;
    reasons.push('Tested on board-level / difficult problems');
  } else if (difficulty === 'Normal') {
    points += 10;
  } else {
    points += 4;
    reasons.push('Practice set consisted of basic foundation problems');
  }

  // Volume weighting
  if (questionsAttempted >= 25) {
    points += 5;
    reasons.push(`Substantial question volume (${questionsAttempted} problems attempted)`);
  } else if (questionsAttempted < 10) {
    points -= 8;
    reasons.push('Sample size too low for automatic jump to highest mastery');
  }

  // Trend comparison
  if (previousScore !== null) {
    if (accuracyPercent > previousScore) {
      reasons.push(`Score improved from previous ${previousScore}% to ${accuracyPercent}%`);
    } else if (accuracyPercent < previousScore - 15) {
      reasons.push(`Significant regression from prior ${previousScore}%`);
    }
  }

  // Determine suggested level 1..5
  let suggested: MasteryLevel = 1;
  if (points >= 88 && accuracyPercent >= 85 && usedNotes !== 'Frequently' && questionsAttempted >= 15) {
    suggested = 5;
  } else if (points >= 74 && accuracyPercent >= 75) {
    suggested = 4;
  } else if (points >= 58 && accuracyPercent >= 65) {
    suggested = 3;
  } else if (points >= 40 && accuracyPercent >= 50) {
    suggested = 2;
  } else {
    suggested = 1;
  }

  // Safety dampener: Prevent jumping more than +2 levels in one single review session
  const prevLevel = previousMastery || 1;
  if (suggested > prevLevel + 2) {
    suggested = (prevLevel + 2) as MasteryLevel;
    reasons.push('Capped at +2 progression step to preserve retention integrity');
  }

  // Spaced repetition schedule based on user performance & Confidence Score
  const srResult = calculateSpacedRepetitionSchedule({
    accuracyPercent,
    questionsAttempted,
    questionsCorrect: Math.round((accuracyPercent / 100) * Math.max(1, questionsAttempted)),
    timeSpentMinutes: input.timeSpentMinutes,
    difficulty,
    usedNotes,
    independenceRating,
    confidenceScore,
    previousMastery: (prevLevel as MasteryLevel) || null,
    anchorDateStr,
  });

  const intervalDays = srResult.newIntervalDays;
  const nextDateStr = srResult.nextReviewDate;
  
  if (srResult.confidencePacingNote) {
    reasons.push(srResult.confidencePacingNote);
  }
  reasons.push(srResult.explanation);

  return {
    suggestedMastery: suggested,
    nextReviewIntervalDays: intervalDays,
    nextReviewDate: nextDateStr,
    confidenceScore: srResult.confidenceScore,
    confidencePacingNote: srResult.confidencePacingNote,
    confidenceMultiplier: srResult.confidenceMultiplier,
    calibrationSafetyApplied: srResult.calibrationSafetyApplied,
    reasons,
    evidenceSummary: {
      accuracy: `${accuracyPercent}%`,
      difficulty: difficulty,
      notes: usedNotes === 'No' ? 'None (Independent)' : usedNotes,
      timed: 'Yes',
      questions: questionsAttempted,
      confidence: confidenceScore ? `${confidenceScore}/5` : '—',
    },
  };
}

export function formatReviewDate(dateStr: string | null, todayStr: string = getLocalDateKey()): string {
  if (!dateStr) return '—';
  if (dateStr === todayStr) return 'Today';
  
  const today = new Date(todayStr + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays === -1) return '1d overdue';
  if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays > 1 && diffDays <= 7) return `in ${diffDays} days`;

  // Format as "Sep 18"
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
