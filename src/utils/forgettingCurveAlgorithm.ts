import { Topic, TopicActivityLog, ReviewError, MasteryLevel, ReviewActivityType } from '../types';
import { getLocalDateKey } from './date';

export type ForgettingCurveUrgency =
  | 'Critical Recall Lapse'
  | 'Optimal Retrieval Window'
  | 'Consolidation Due'
  | 'Stable Memory';

export interface ForgettingCurveLogAnalysis {
  totalLogsAnalyzed: number;
  lastLogDate: string | null;
  daysElapsedSinceLastReview: number;
  historicalAverageScore: number;
  historicalSuccessRate: number; // percentage of logs with score >= 70%
  notesRelianceTrend: 'Independent' | 'Occasional' | 'Heavy';
  recentLapseDetected: boolean;
  computedStabilityDays: number; // Memory stability S in days (half-life parameter)
  computedEaseFactor: number; // SM-2 EF
  currentRetentionPercent: number; // R(t) = e^(-t / S) * 100
  targetRetentionPercent: number; // e.g. 80%
  optimalNextReviewDate: string; // YYYY-MM-DD
  daysOverdueOrUntilDue: number; // Positive = overdue days, 0 = due today, Negative = days until due
  isDueNow: boolean;
  urgency: ForgettingCurveUrgency;
  urgencyScore: number; // For ranking
  decayRateModifier: number; // Multiplier based on errors and difficulty
  projectedRetentionAfterReview: number;
  projectedNewStabilityDays: number;
  recommendedActivity: ReviewActivityType;
  recommendedQuestionVolume: number;
  estimatedMinutes: number;
  logEvidence: string[];
  activeErrorsCount: number;
}

export interface DailyForgettingCurveSuggestion {
  topic: Topic;
  analysis: ForgettingCurveLogAnalysis;
  priorityRank: number;
  suggestedActionLabel: string;
  rationale: string;
}

export interface DailyForgettingCurveOverview {
  overallAverageRetention: number;
  criticalTopicsCount: number;
  optimalReviewCount: number;
  stableTopicsCount: number;
  totalDailyReviewMinutes: number;
  totalDailyRecommendedQuestions: number;
  suggestions: DailyForgettingCurveSuggestion[];
  retentionTargetThreshold: number;
}

export interface CurvePoint {
  day: number;
  dateStr: string;
  retention: number;
  isToday?: boolean;
  isReviewLog?: boolean;
  isTargetThreshold?: boolean;
  logScore?: number;
}

/**
 * Calculates number of calendar days between two YYYY-MM-DD strings.
 */
export function calculateDaysBetween(fromIsoDate: string, toIsoDate: string): number {
  const from = new Date(fromIsoDate + 'T00:00:00');
  const to = new Date(toIsoDate + 'T00:00:00');
  const diffTime = to.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Adds days to a YYYY-MM-DD string and returns the resulting YYYY-MM-DD string.
 */
export function addDaysToDate(baseIsoDate: string, daysToAdd: number): string {
  const d = new Date(baseIsoDate + 'T00:00:00');
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().split('T')[0];
}

/**
 * Analyzes a single topic's review logs, error logs, and metrics using the Ebbinghaus forgetting curve:
 * R(t) = exp(-t / S)
 * where t is elapsed days since last practice, and S is memory stability derived from log history.
 */
export function analyzeTopicForgettingCurveFromLogs(
  topic: Topic,
  todayStr: string = getLocalDateKey(),
  errors: ReviewError[] = [],
  targetRetention: number = 80
): ForgettingCurveLogAnalysis {
  const logs: TopicActivityLog[] = [...(topic.activityHistory || [])].sort((a, b) => {
    return new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime();
  });

  const activeErrors = errors.filter((e) => e.topicId === topic.id && !e.isResolved);
  const activeErrorsCount = activeErrors.length;

  const totalLogsAnalyzed = logs.length;
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;

  // Determine effective last review date
  const effectiveLastReviewDate =
    lastLog?.date || topic.lastReviewDate || (topic.initialCovered ? '2026-08-25' : null);

  const daysElapsedSinceLastReview = effectiveLastReviewDate
    ? Math.max(0, calculateDaysBetween(effectiveLastReviewDate, todayStr))
    : 14; // Default if unrecorded

  // 1. Log Sequence Analysis
  let baseStability = 2.0; // Base stability S in days
  let easeFactor = topic.easeFactor || 2.5;
  let runningSuccessStreak = 0;
  let totalScoreSum = 0;
  let successfulLogsCount = 0;
  let frequentNotesCount = 0;
  let recentLapseDetected = false;
  const logEvidence: string[] = [];

  if (logs.length === 0) {
    // Topic has no detailed logs yet, derive stability from baseline mastery
    const initialMastery = topic.mastery || 1;
    baseStability = Math.max(1.5, initialMastery * 2.5);
    logEvidence.push(
      `No historical review logs recorded; stability estimated from syllabus status (L${initialMastery}).`
    );
  } else {
    // Iterate through historical logs to track memory consolidation & lapses
    logs.forEach((log, index) => {
      totalScoreSum += log.score;
      const isPassing = log.score >= 65;
      if (isPassing) successfulLogsCount++;

      if (log.usedNotes === 'Frequently') frequentNotesCount++;

      // Compute log-specific quality grade (0 - 5)
      let logQuality = 3;
      if (log.score >= 90) logQuality = 5;
      else if (log.score >= 80) logQuality = 4;
      else if (log.score >= 65) logQuality = 3;
      else if (log.score >= 50) logQuality = 2;
      else logQuality = 1;

      // Penalize notes reliance in recall grade
      if (log.usedNotes === 'Frequently') {
        logQuality = Math.min(2, logQuality - 1);
      } else if (log.usedNotes === 'Occasionally') {
        logQuality = Math.max(1, logQuality - 0.5);
      }

      // Stability update across review iterations
      if (index === 0) {
        // First log
        baseStability = logQuality >= 3 ? Math.max(2, logQuality * 1.2) : 1.2;
        runningSuccessStreak = logQuality >= 3 ? 1 : 0;
      } else {
        if (logQuality >= 3) {
          // Reinforced recall: stability grows exponentially scaled by ease factor
          runningSuccessStreak++;
          const growthFactor = easeFactor * (0.85 + (logQuality - 3) * 0.15);
          baseStability = Math.max(baseStability + 1.5, baseStability * growthFactor);
        } else {
          // Recall failure / lapse: stability resets towards foundational level
          recentLapseDetected = true;
          runningSuccessStreak = 0;
          baseStability = Math.max(1.2, baseStability * 0.35); // severe retrograde decay
        }
      }
    });

    const lastLogRef = logs[logs.length - 1];
    logEvidence.push(
      `Analyzed ${logs.length} review session log(s): Average accuracy was ${Math.round(
        totalScoreSum / logs.length
      )}%.`
    );

    logEvidence.push(
      `Most recent log on ${lastLogRef.date}: ${lastLogRef.score}% (${lastLogRef.questionsCorrect}/${lastLogRef.questionsAttempted} correct, notes: ${lastLogRef.usedNotes}).`
    );
  }

  // 2. Error Log Misconception Interference Factor
  // Unresolved conceptual errors accelerate forgetting by introducing interference
  let errorInterferenceMultiplier = 1.0;
  if (activeErrorsCount > 0) {
    errorInterferenceMultiplier = 1.0 + Math.min(0.8, activeErrorsCount * 0.18);
    logEvidence.push(
      `${activeErrorsCount} active error log entry(s) detected — accelerates forgetting decay rate by ${Math.round(
        (errorInterferenceMultiplier - 1) * 100
      )}%.`
    );
  }

  // 3. Board Priority Factor
  // High board relevance topics require higher retention scrutiny
  const isHighPriority = topic.isHighPriority || topic.boardRelevance === 'High';
  const boardPriorityMultiplier = isHighPriority ? 1.2 : 1.0;

  // Final adjusted memory stability S (days to reach 1/e or target threshold)
  // Higher stability S = slower decay
  const finalStabilityDays = Math.max(
    1.2,
    Number((baseStability / errorInterferenceMultiplier).toFixed(1))
  );

  // 4. Ebbinghaus Exponential Forgetting Equation:
  // R(t) = exp(-t / (S * k)) * 100
  // Scaling constant k ensures that at t = S, retention equals the optimal target threshold (e.g. ~80%)
  const k = -1 / Math.log(targetRetention / 100); // k ≈ 4.48 for 80% target
  const exponent = -daysElapsedSinceLastReview / (finalStabilityDays * k);
  const rawRetention = Math.exp(exponent) * 100;
  const currentRetentionPercent = Math.max(10, Math.min(100, Math.round(rawRetention)));

  // 5. Optimal Review Window calculation:
  // Find t when R(t) = targetRetention%
  // t_target = - (S * k) * ln(targetRetention / 100) = S
  const optimalIntervalDays = Math.max(1, Math.round(finalStabilityDays));
  const optimalNextReviewDate = effectiveLastReviewDate
    ? addDaysToDate(effectiveLastReviewDate, optimalIntervalDays)
    : todayStr;

  const daysOverdueOrUntilDue = calculateDaysBetween(optimalNextReviewDate, todayStr);
  const isDueNow = daysOverdueOrUntilDue >= 0 || currentRetentionPercent <= targetRetention;

  // 6. Urgency Classification
  let urgency: ForgettingCurveUrgency = 'Stable Memory';
  if (currentRetentionPercent < 65 || daysOverdueOrUntilDue >= 3) {
    urgency = 'Critical Recall Lapse';
  } else if (currentRetentionPercent <= targetRetention || daysOverdueOrUntilDue >= 0) {
    urgency = 'Optimal Retrieval Window';
  } else if (currentRetentionPercent <= targetRetention + 8 || daysOverdueOrUntilDue >= -2) {
    urgency = 'Consolidation Due';
  } else {
    urgency = 'Stable Memory';
  }

  // 7. Urgency Score for Prioritization (higher = review first)
  const retentionDeficit = Math.max(0, 100 - currentRetentionPercent);
  const urgencyScore = Math.round(
    retentionDeficit * boardPriorityMultiplier * (1 + (activeErrorsCount > 0 ? 0.3 : 0)) +
      (urgency === 'Critical Recall Lapse' ? 30 : 0) +
      (urgency === 'Optimal Retrieval Window' ? 15 : 0)
  );

  // 8. Synthesize Prescribed Daily Content & Activities based on Log Diagnostics
  let recommendedActivity: ReviewActivityType = 'Practice Problems';
  let recommendedQuestionVolume = 12;
  let estimatedMinutes = 15;

  const historicalAverageScore =
    logs.length > 0 ? Math.round(totalScoreSum / logs.length) : topic.latestScore || 65;
  const historicalSuccessRate =
    logs.length > 0 ? Math.round((successfulLogsCount / logs.length) * 100) : 70;
  const notesRelianceTrend: 'Independent' | 'Occasional' | 'Heavy' =
    frequentNotesCount > 0 ? 'Heavy' : logs.some((l) => l.usedNotes === 'Occasionally') ? 'Occasional' : 'Independent';

  if (notesRelianceTrend === 'Heavy') {
    recommendedActivity = 'Formula & Concept Drill';
    recommendedQuestionVolume = 14;
    estimatedMinutes = 15;
    logEvidence.push(
      'Logs indicate frequent formula sheet lookups; closed-book retrieval drill prescribed to build raw recall.'
    );
  } else if (activeErrorsCount >= 2) {
    recommendedActivity = 'Error Log Remediation';
    recommendedQuestionVolume = 15;
    estimatedMinutes = 20;
    logEvidence.push(
      'Active algebraic/misreading errors logged; targeted trap remediation prescribed before timed testing.'
    );
  } else if (historicalAverageScore >= 85 && currentRetentionPercent >= 65) {
    recommendedActivity = 'Timed Board Quiz';
    recommendedQuestionVolume = 10;
    estimatedMinutes = 12;
    logEvidence.push(
      'Solid historical concept foundation; high-speed exam quiz prescribed to reactive latent pathways.'
    );
  } else if (currentRetentionPercent < 55) {
    recommendedActivity = 'Practice Problems';
    recommendedQuestionVolume = 20;
    estimatedMinutes = 25;
    logEvidence.push(
      'Severe memory decay detected (<55% retention); comprehensive stepped practice prescribed to restore stability.'
    );
  } else {
    recommendedActivity = 'Practice Problems';
    recommendedQuestionVolume = 12;
    estimatedMinutes = 15;
  }

  // 9. Projected Post-Review Trajectory
  // When the student completes today's session, retention resets to ~98%,
  // and stability expands by the ease factor (SM-2 expansion)
  const projectedRetentionAfterReview = 98;
  const projectedNewStabilityDays = Math.min(
    60,
    Math.round(finalStabilityDays * (easeFactor * (activeErrorsCount > 0 ? 0.9 : 1.1)))
  );

  return {
    totalLogsAnalyzed,
    lastLogDate: effectiveLastReviewDate,
    daysElapsedSinceLastReview,
    historicalAverageScore,
    historicalSuccessRate,
    notesRelianceTrend,
    recentLapseDetected,
    computedStabilityDays: finalStabilityDays,
    computedEaseFactor: easeFactor,
    currentRetentionPercent,
    targetRetentionPercent: targetRetention,
    optimalNextReviewDate,
    daysOverdueOrUntilDue,
    isDueNow,
    urgency,
    urgencyScore,
    decayRateModifier: errorInterferenceMultiplier,
    projectedRetentionAfterReview,
    projectedNewStabilityDays,
    recommendedActivity,
    recommendedQuestionVolume,
    estimatedMinutes,
    logEvidence,
    activeErrorsCount,
  };
}

/**
 * Generates the daily content suggestion playlist based on the forgetting curve
 * for all covered syllabus topics.
 */
export function generateDailyForgettingCurveContent(
  topics: Topic[],
  todayStr: string = getLocalDateKey(),
  errors: ReviewError[] = [],
  options: {
    targetRetention?: number;
    maxSuggestions?: number;
    filterSubjectId?: string;
  } = {}
): DailyForgettingCurveOverview {
  const targetRetention = options.targetRetention ?? 80;
  const maxSuggestions = options.maxSuggestions ?? 8;

  // Filter to covered topics
  const coveredTopics = topics.filter((t) => {
    if (!t.initialCovered) return false;
    if (options.filterSubjectId && t.subjectId !== options.filterSubjectId) return false;
    return true;
  });

  if (coveredTopics.length === 0) {
    return {
      overallAverageRetention: 100,
      criticalTopicsCount: 0,
      optimalReviewCount: 0,
      stableTopicsCount: 0,
      totalDailyReviewMinutes: 0,
      totalDailyRecommendedQuestions: 0,
      suggestions: [],
      retentionTargetThreshold: targetRetention,
    };
  }

  // Perform forgetting curve analysis for each topic
  const analyzed = coveredTopics.map((topic) => {
    const analysis = analyzeTopicForgettingCurveFromLogs(topic, todayStr, errors, targetRetention);
    return {
      topic,
      analysis,
    };
  });

  // Calculate overall metrics
  const totalRetention = analyzed.reduce((acc, curr) => acc + curr.analysis.currentRetentionPercent, 0);
  const overallAverageRetention = Math.round(totalRetention / analyzed.length);

  const criticalTopicsCount = analyzed.filter(
    (item) => item.analysis.urgency === 'Critical Recall Lapse'
  ).length;

  const optimalReviewCount = analyzed.filter(
    (item) => item.analysis.urgency === 'Optimal Retrieval Window'
  ).length;

  const stableTopicsCount = analyzed.filter(
    (item) => item.analysis.urgency === 'Stable Memory'
  ).length;

  // Sort by urgency score descending (highest priority to review today)
  analyzed.sort((a, b) => b.analysis.urgencyScore - a.analysis.urgencyScore);

  // Take top items for daily suggested content
  const suggestions: DailyForgettingCurveSuggestion[] = analyzed
    .slice(0, maxSuggestions)
    .map((item, index) => {
      let suggestedActionLabel = 'Review Now';
      let rationale = '';

      if (item.analysis.urgency === 'Critical Recall Lapse') {
        suggestedActionLabel = 'Emergency Recall Rescue';
        rationale = `Retention has dropped to ${item.analysis.currentRetentionPercent}% (${item.analysis.daysElapsedSinceLastReview} days since review). Immediate practice needed to prevent full relearning.`;
      } else if (item.analysis.urgency === 'Optimal Retrieval Window') {
        suggestedActionLabel = 'Prime Retrieval Window';
        rationale = `Retention is at ${item.analysis.currentRetentionPercent}%, hitting the sweet spot where spaced retrieval maximizes long-term memory stabilization.`;
      } else if (item.analysis.urgency === 'Consolidation Due') {
        suggestedActionLabel = 'Upcoming Consolidation';
        rationale = `Retention is at ${item.analysis.currentRetentionPercent}%, scheduled to cross the ${targetRetention}% threshold within 24–48 hours.`;
      } else {
        suggestedActionLabel = 'Maintenance Refresh';
        rationale = `Memory stability is healthy (${item.analysis.currentRetentionPercent}%). Optional light refresh.`;
      }

      return {
        topic: item.topic,
        analysis: item.analysis,
        priorityRank: index + 1,
        suggestedActionLabel,
        rationale,
      };
    });

  // Calculate totals for due items
  const dueItems = suggestions.filter((s) => s.analysis.isDueNow);
  const totalDailyRecommendedQuestions = dueItems.reduce(
    (acc, curr) => acc + curr.analysis.recommendedQuestionVolume,
    0
  );
  const totalDailyReviewMinutes = dueItems.reduce(
    (acc, curr) => acc + curr.analysis.estimatedMinutes,
    0
  );

  return {
    overallAverageRetention,
    criticalTopicsCount,
    optimalReviewCount,
    stableTopicsCount,
    totalDailyReviewMinutes,
    totalDailyRecommendedQuestions,
    suggestions,
    retentionTargetThreshold: targetRetention,
  };
}

/**
 * Generates discrete (day, retention) coordinate points for rendering
 * the exponential Ebbinghaus forgetting curve graph:
 * R(t) = exp(-t / (S * k)) * 100
 */
export function generateForgettingCurvePoints(
  stabilityDays: number,
  daysElapsed: number,
  targetRetention: number = 80,
  maxDays: number = 24
): CurvePoint[] {
  const points: CurvePoint[] = [];
  const k = -1 / Math.log(targetRetention / 100);

  const step = Math.max(1, Math.round(maxDays / 20));

  for (let d = 0; d <= maxDays; d += step) {
    const exponent = -d / (stabilityDays * k);
    const retention = Math.max(5, Math.min(100, Math.round(Math.exp(exponent) * 100)));
    points.push({
      day: d,
      dateStr: `+${d}d`,
      retention,
      isToday: d === daysElapsed,
    });
  }

  // Ensure current day t is explicitly included if not already
  if (!points.some((p) => p.day === daysElapsed) && daysElapsed <= maxDays) {
    const exponent = -daysElapsed / (stabilityDays * k);
    const retention = Math.max(5, Math.min(100, Math.round(Math.exp(exponent) * 100)));
    points.push({
      day: daysElapsed,
      dateStr: `Today (+${daysElapsed}d)`,
      retention,
      isToday: true,
    });
    points.sort((a, b) => a.day - b.day);
  }

  return points;
}
