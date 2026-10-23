import { INITIAL_SUBJECTS } from '../data/initialData';
import type { Subject } from '../types';

/** New learners receive curricular definitions, NEVER fictional achievement. */
export const createCleanSubjects = (): Subject[] => INITIAL_SUBJECTS.map(subject => ({
  ...subject,
  inMaintenance: false,
  groups: subject.groups.map(group => ({
    ...group,
    topics: group.topics.map(topic => ({
      ...topic,
      initialCovered: false,
      evidenceStatus:'unassessed',
      reviewCount: 0,
      mastery: null,
      latestScore: null,
      bestScore: null,
      averageScore: null,
      latestConfidence: null,
      lastReviewDate: null,
      nextReviewDate: null,
      isHighPriority: false,
      whyWeakReasons: undefined,
      recommendationNote: undefined,
      activityHistory: [],
      easeFactor: undefined,
      intervalDays: undefined,
      repetitions: undefined,
      lastReviewQuality: undefined,
      retentionStrengthPercent: undefined,
      isFlaggedForReview: false,
      flagReason: undefined,
      urgencyLevel: undefined,
      urgencyScore: undefined,
    }))
  }))
}));
