import type { DailyStudyQueueItem, ReviewError, Subject, TestRecord, Topic } from '../../types';
import { getDedicatedMathScreen } from '../../utils/mathTopicNavigation';

/** Preferences only: choosing a path must never rewrite learner evidence. */
export type LearningPath = 'guided' | 'board';
export const LEARNING_PATH_KEY = 'ece_learning_path_v1';
export const DEFAULT_LEARNING_PATH: LearningPath = 'board'; // Preserve the v10.11 board-review emphasis on upgrade.
export const isLearningPath = (value: unknown): value is LearningPath => value === 'guided' || value === 'board';
export const LEARNING_PATHS = {
  guided: { label: 'Guided Learning', shortLabel: 'Guided', description: 'Follow the existing topic sequence, learn concepts, and practice with explanations.' },
  board: { label: 'ECE Board Preparation', shortLabel: 'Board Prep', description: 'Prioritize independent practice, mistakes, timed work, and known coverage gaps.' },
} as const;

export type RecommendationAction = 'lesson' | 'practice' | 'review' | 'mock' | 'catalog';
export interface PathRecommendation {
  path: LearningPath;
  topic: Topic | null;
  title: string;
  explanation: string;
  actionLabel: string;
  action: RecommendationAction;
  evidenceLabel: string;
  reasons: string[];
}

/** No syllabus prerequisite claims: canonicalIndex represents only this application's published topic order. */
function orderedMathTopics(subjects: readonly Subject[]): Topic[] {
  return subjects.filter(subject => subject.category === 'Mathematics')
    .flatMap(subject => subject.groups.flatMap(group => group.topics))
    .sort((a, b) => (a.canonicalIndex ?? 10_000) - (b.canonicalIndex ?? 10_000) || a.name.localeCompare(b.name));
}

function latestAutomaticTopicResults(records: readonly TestRecord[]): Map<string, {correct: number; total: number; families: Set<string>}> {
  const byTopic = new Map<string, {correct: number; total: number; families: Set<string>}>();
  for (const record of records) {
    if (record.provenance !== 'automatic' || !Array.isArray(record.itemResults)) continue;
    for (const result of record.itemResults) {
      if (!result.topicId || !result.correctOptionId) continue;
      const value = byTopic.get(result.topicId) ?? {correct: 0, total: 0, families: new Set<string>()};
      value.total += 1;
      if (result.selectedOptionId === result.correctOptionId) value.correct += 1;
      if (record.assessmentMode === 'strict' && record.selfAttested && result.questionFamilyId) value.families.add(result.questionFamilyId);
      byTopic.set(result.topicId, value);
    }
  }
  return byTopic;
}

export function recommendNextForPath(
  path: LearningPath,
  subjects: readonly Subject[],
  records: readonly TestRecord[],
  errors: readonly ReviewError[],
  studyQueue: readonly DailyStudyQueueItem[],
): PathRecommendation {
  const ordered = orderedMathTopics(subjects);
  if (!ordered.length) return {path, topic: null, title: 'Explore the curriculum', explanation: 'No Mathematics topics are configured yet.', actionLabel: 'Browse subjects', action: 'catalog', evidenceLabel: 'Not assessed', reasons: ['No available Mathematics lessons']};
  const results = latestAutomaticTopicResults(records);
  if (path === 'guided') {
    const next = ordered.find(topic => !topic.initialCovered)
      ?? ordered.find(topic => topic.activityHistory.length === 0 && !results.has(topic.id))
      ?? ordered.find(topic => topic.mastery !== null && topic.mastery <= 2)
      ?? studyQueue.find(item => ordered.some(topic => topic.id === item.topic.id))?.topic
      ?? ordered[0];
    const newLesson = !next.initialCovered;
    const hasLesson = Boolean(getDedicatedMathScreen(next.id));
    const noResults = !results.has(next.id);
    return {
      path, topic: next, title: newLesson ? 'Next lesson in Algebra' : noResults ? 'Build confidence with practice' : 'Strengthen your understanding',
      explanation: newLesson ? (hasLesson ? 'Continue the app’s current topic sequence with explanations and guided practice.' : 'Next in the app sequence. This topic has a progress/review overview but no dedicated teaching module yet; use the full library for other lessons.') : 'Review the lesson or topic overview and work through explained examples where available.',
      actionLabel: newLesson && hasLesson ? 'Open lesson' : 'Open topic overview', action: 'lesson',
      evidenceLabel: newLesson ? 'Not studied' : noResults ? 'No automatic assessment' : 'Prior learning evidence',
      reasons: [newLesson ? 'Next uncovered topic in the application order' : 'Continue concept and solution practice', ...(hasLesson ? [] : ['A complete lesson for this topic is not yet mapped']), 'This sequence has not been certified against a university syllabus', 'Timed tests remain available at any time'],
    };
  }

  // Board prioritization considers only automatic scored item results for measured accuracy.
  // Legacy/manual scores and simulated mastery values must not be treated as verified performance.
  const wrongAnswers = ordered.map(topic => {
    const outcome = results.get(topic.id);
    return {topic, outcome, mistakes: errors.filter(error => !error.isResolved && error.topicId === topic.id).length};
  });
  const assessedWeak = wrongAnswers.filter(value => value.outcome && value.outcome.total > 0 && value.outcome.correct / value.outcome.total < .8)
    .sort((a, b) => (a.outcome!.correct / a.outcome!.total) - (b.outcome!.correct / b.outcome!.total))[0];
  if (assessedWeak) {
    const {topic, outcome} = assessedWeak;
    return {path, topic, title: 'Target a measured weak area', explanation: 'Rework missed questions, review the explanation, and then attempt a different question family when available.', actionLabel: 'Practice this topic', action: 'practice', evidenceLabel: `${outcome!.correct}/${outcome!.total} automatic scored answers`, reasons: ['Weak area identified from actual graded item results', 'This is practice evidence, not official board readiness', `${assessedWeak.mistakes} unresolved mistake${assessedWeak.mistakes === 1 ? '' : 's'} logged`]};
  }
  const urgent = studyQueue.find(item => ordered.some(topic => topic.id === item.topic.id));
  if (urgent) return {path, topic: urgent.topic, title: 'Keep retention on track', explanation: 'Review a due or at-risk Algebra skill before returning to mixed questions.', actionLabel: 'Start review', action: 'review', evidenceLabel: 'Retention schedule', reasons: [urgent.flagReason, 'Review priority is not an independent examination result']};
  const unresolved = wrongAnswers.find(value => value.mistakes > 0);
  if (unresolved) return {path, topic: unresolved.topic, title: 'Resolve a recorded mistake', explanation: 'Practice the concept connected to an unresolved error.', actionLabel: 'Open topic', action: 'practice', evidenceLabel: `${unresolved.mistakes} unresolved mistake(s)`, reasons: ['Selected from your mistake history', 'Historic or manually entered errors are not verified assessment results']};
  const unassessed = ordered.find(topic => !results.has(topic.id));
  if (unassessed) return {path, topic: unassessed, title: 'Establish a board-practice baseline', explanation: 'Start with this available Algebra topic. An unassessed topic must not be displayed as proficient.', actionLabel: getDedicatedMathScreen(unassessed.id) ? 'Open Algebra topic' : 'Open topic overview', action: 'lesson', evidenceLabel: 'Not assessed automatically', reasons: ['No automatic question-level assessment yet for this topic', 'A full-board simulation is not available with the current question-bank coverage']};
  return {path, topic: ordered[0], title: 'Continue mixed board-style practice', explanation: 'Use the current mixed practice mock for pacing. It is not a blueprint-complete licensure simulation.', actionLabel: 'Open practice mock', action: 'mock', evidenceLabel: 'Practice only', reasons: ['Board coverage is incomplete', 'Subject-level evidence and permitted calculator rules still apply']};
}
