import { Topic, ReviewError, UserProfile, DailyTarget } from '../types';
import { getLocalDateKey } from './date';

export interface TargetItemBreakdown {
  id: string;
  category: 'Overdue Remediation' | 'Scheduled Review' | 'Weak Mastery Drill' | 'New Topic Intake';
  topicName: string;
  topicId: string;
  urgency: 'Critical' | 'High' | 'Standard';
  currentMastery: number | null;
  recommendedQuestions: number;
  reason: string;
}

export interface RecommendedTargetResult {
  recommendedSessions: number;
  recommendedQuestions: number;
  urgencyLevel: 'Critical' | 'High' | 'Standard' | 'Maintenance';
  overdueTopicsCount: number;
  dueTodayTopicsCount: number;
  weakTopicsCount: number;
  unresolvedErrorsCount: number;
  daysToExam: number;
  recommendedPacingMinutes: number;
  items: TargetItemBreakdown[];
  summaryHeadline: string;
  rationale: string[];
}

/**
 * Calculates adaptive daily study sessions and question count targets
 * based on current topic mastery levels, spaced-repetition overdue status,
 * error log density, and days remaining until the board licensure examination.
 */
export function calculateRecommendedTarget(
  topics: Topic[],
  errors: ReviewError[],
  userProfile: UserProfile,
  todayStr: string = getLocalDateKey()
): RecommendedTargetResult {
  const today = new Date(todayStr + 'T00:00:00');
  const examDate = new Date(userProfile.targetExamDate + 'T00:00:00');
  const diffTime = examDate.getTime() - today.getTime();
  const daysToExam = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  const overdueTopics: { topic: Topic; daysOverdue: number }[] = [];
  const dueTodayTopics: Topic[] = [];
  const weakTopics: Topic[] = [];
  const uncoveredTopics: Topic[] = [];

  for (const t of topics) {
    if (!t.initialCovered) {
      uncoveredTopics.push(t);
      continue;
    }

    if (t.nextReviewDate) {
      const reviewDate = new Date(t.nextReviewDate + 'T00:00:00');
      const diff = Math.round((today.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0) {
        overdueTopics.push({ topic: t, daysOverdue: diff });
      } else if (diff === 0) {
        dueTodayTopics.push(t);
      }
    }

    // Check weak topics (Mastery <= 2 or latestScore < 65)
    if (t.mastery !== null && (t.mastery <= 2 || (t.latestScore !== null && t.latestScore < 65))) {
      weakTopics.push(t);
    }
  }

  // Sort overdue topics by urgency: days overdue descending, then lower mastery
  overdueTopics.sort((a, b) => {
    if (b.daysOverdue !== a.daysOverdue) return b.daysOverdue - a.daysOverdue;
    return (a.topic.mastery ?? 1) - (b.topic.mastery ?? 1);
  });

  const activeErrors = errors.filter((e) => !e.isResolved);
  const items: TargetItemBreakdown[] = [];
  const rationale: string[] = [];

  // 1. Process Overdue Topics
  for (const { topic, daysOverdue } of overdueTopics) {
    const topicErrors = activeErrors.filter((e) => e.topicId === topic.id);
    let qCount = 12;
    if (topic.mastery !== null && topic.mastery <= 2) {
      qCount = 18; // Deeper remediation for low mastery
    }
    if (topicErrors.length >= 2) {
      qCount += 2; // Extra buffer for active recurring errors
    }

    items.push({
      id: `target-overdue-${topic.id}`,
      category: 'Overdue Remediation',
      topicName: topic.name,
      topicId: topic.id,
      urgency: daysOverdue >= 2 || (topic.mastery !== null && topic.mastery <= 2) ? 'Critical' : 'High',
      currentMastery: topic.mastery,
      recommendedQuestions: qCount,
      reason: `${daysOverdue}d overdue (Mastery: ${topic.mastery ?? '—'}/5)${
        topicErrors.length > 0 ? ` • ${topicErrors.length} recurring error logs` : ''
      }`,
    });
  }

  // 2. Process Topics Due Today
  for (const topic of dueTodayTopics) {
    const topicErrors = activeErrors.filter((e) => e.topicId === topic.id);
    let qCount = 12;
    if (topic.mastery !== null && topic.mastery <= 2) {
      qCount = 15;
    }

    items.push({
      id: `target-due-${topic.id}`,
      category: 'Scheduled Review',
      topicName: topic.name,
      topicId: topic.id,
      urgency: topic.isHighPriority ? 'High' : 'Standard',
      currentMastery: topic.mastery,
      recommendedQuestions: qCount,
      reason: `Due today on spaced schedule (Mastery: ${topic.mastery ?? '—'}/5)${
        topicErrors.length > 0 ? ` • ${topicErrors.length} error logs` : ''
      }`,
    });
  }

  // 3. Process Weak Topics not already in overdue or due today
  const existingTopicIds = new Set(items.map((i) => i.topicId));
  const remainingWeakTopics = weakTopics.filter((t) => !existingTopicIds.has(t.id));

  // Take top 1 or 2 remaining weak topics
  for (const topic of remainingWeakTopics.slice(0, 2)) {
    items.push({
      id: `target-weak-${topic.id}`,
      category: 'Weak Mastery Drill',
      topicName: topic.name,
      topicId: topic.id,
      urgency: 'High',
      currentMastery: topic.mastery,
      recommendedQuestions: 10,
      reason: `Sub-board threshold (Mastery: ${topic.mastery ?? '—'}/5, Score: ${
        topic.latestScore ?? '—'
      }%)`,
    });
  }

  // 4. Initial syllabus intake if coverage is low
  if (uncoveredTopics.length > 0 && items.length < 4) {
    const nextUncovered = uncoveredTopics[0];
    items.push({
      id: `target-new-${nextUncovered.id}`,
      category: 'New Topic Intake',
      topicName: nextUncovered.name,
      topicId: nextUncovered.id,
      urgency: 'Standard',
      currentMastery: null,
      recommendedQuestions: 10,
      reason: 'Syllabus coverage expansion for unstudied board topic',
    });
  }

  // Calculate sum of recommended questions
  let totalQuestions = items.reduce((sum, item) => sum + item.recommendedQuestions, 0);

  // Fallback baseline if all topics are fully on track
  if (totalQuestions === 0) {
    totalQuestions = Math.max(30, userProfile.dailyTargetQuestions);
    items.push({
      id: 'target-maintenance-mixed',
      category: 'Scheduled Review',
      topicName: 'Mixed Board Practice & Speed Drills',
      topicId: 'mixed-board',
      urgency: 'Standard',
      currentMastery: 5,
      recommendedQuestions: totalQuestions,
      reason: 'All topics are up to date! Retain speed and mixed test stamina.',
    });
  }

  // Calculate recommended study sessions
  // Base is 2 sessions.
  // +1 if there are any overdue topics.
  // +1 if there are >= 3 weak topics or >= 2 overdue topics.
  let recommendedSessions = 2;
  if (overdueTopics.length >= 1) {
    recommendedSessions += 1;
  }
  if (overdueTopics.length >= 2 || weakTopics.length >= 4) {
    recommendedSessions += 1;
  }
  // Cap at 4 sessions max (e.g., Morning Remediation, Afternoon Pacing, Evening Board Quiz, Error Drill)
  recommendedSessions = Math.min(4, Math.max(2, recommendedSessions));

  // Determine overall urgency level
  let urgencyLevel: RecommendedTargetResult['urgencyLevel'] = 'Standard';
  if (overdueTopics.some((o) => o.daysOverdue >= 2 && (o.topic.mastery ?? 1) <= 2)) {
    urgencyLevel = 'Critical';
  } else if (overdueTopics.length > 0 || weakTopics.length >= 3) {
    urgencyLevel = 'High';
  } else if (weakTopics.length === 0 && overdueTopics.length === 0) {
    urgencyLevel = 'Maintenance';
  }

  // Formulate rationale statements
  if (overdueTopics.length > 0) {
    const topOverdue = overdueTopics[0];
    rationale.push(
      `${overdueTopics.length} spaced-repetition topic${
        overdueTopics.length > 1 ? 's are' : ' is'
      } overdue, led by ${topOverdue.topic.name} (${topOverdue.daysOverdue}d overdue, Level ${
        topOverdue.topic.mastery ?? '—'
      }).`
    );
  }

  if (dueTodayTopics.length > 0) {
    rationale.push(
      `${dueTodayTopics.length} topic${dueTodayTopics.length > 1 ? 's are' : ' is'} due for spaced retention reinforcement today (${dueTodayTopics.map((t) => t.name).join(', ')}).`
    );
  }

  if (weakTopics.length > 0) {
    rationale.push(
      `${weakTopics.length} topic${weakTopics.length > 1 ? 's sit' : ' sits'} below Level 3 mastery, requiring focused problem drills.`
    );
  }

  if (activeErrors.length > 0) {
    rationale.push(
      `${activeErrors.length} unresolved error log entries need dedicated formula and algebra verification.`
    );
  }

  rationale.push(
    `Board target date is in ${daysToExam} days (${userProfile.examName}). High-intensity pacing is active.`
  );

  const summaryHeadline =
    urgencyLevel === 'Critical'
      ? `Critical Remediation Required (${overdueTopics.length} Overdue, ${weakTopics.length} Below L3)`
      : urgencyLevel === 'High'
      ? `High-Intensity Review (${overdueTopics.length} Overdue, ${dueTodayTopics.length} Due Today)`
      : urgencyLevel === 'Maintenance'
      ? `Maintenance & Speed Practice (Syllabus on Track)`
      : `Standard Spaced Review Queue`;

  const recommendedPacingMinutes = Math.round(totalQuestions * 1.6); // ~1.6 minutes per question board pacing

  return {
    recommendedSessions,
    recommendedQuestions: totalQuestions,
    urgencyLevel,
    overdueTopicsCount: overdueTopics.length,
    dueTodayTopicsCount: dueTodayTopics.length,
    weakTopicsCount: weakTopics.length,
    unresolvedErrorsCount: activeErrors.length,
    daysToExam,
    recommendedPacingMinutes,
    items,
    summaryHeadline,
    rationale,
  };
}
