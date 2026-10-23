/**
 * ECE Board Review Mastery Tracker - Seed Data & Context Initializer
 * 
 * Contains the complete syllabus of 34 ECE Algebra topics structured by category:
 *   1. Foundations (5 topics)
 *   2. Equations (8 topics)
 *   3. Engineering-Relevant Algebra (6 topics)
 *   4. Sequences & Series (7 topics)
 *   5. Higher / Engineering Algebra (5 topics)
 *   6. Assessment & Board Practice (3 topics)
 * 
 * Provides a mock initialization function that populates the application context
 * and browser storage with realistic progress data for testing tracking, spaced repetition,
 * and progress analytics.
 */

import {
  Topic,
  TopicGroup,
  Subject,
  TestRecord,
  ReviewError,
  UserProfile,
  DailyTarget,
} from '../types';
import {
  INITIAL_SUBJECTS,
  INITIAL_TEST_RECORDS,
  INITIAL_ERRORS,
  INITIAL_DAILY_TARGET,
  INITIAL_USER_PROFILE,
} from '../data/initialData';
import { getLocalDateKey } from '../utils/date';

export interface AlgebraCategoryInfo {
  id: string;
  name: string;
  description: string;
  topicCount: number;
  topics: Topic[];
}

// Find Algebra subject from canonical data
const algebraSubject: Subject = INITIAL_SUBJECTS.find((s) => s.id === 'subj-math-algebra') || INITIAL_SUBJECTS[0];

// Extract groups structured by category
const foundationsGroup: TopicGroup = algebraSubject.groups.find((g) => g.id === 'grp-foundations') || {
  id: 'grp-foundations',
  subjectId: algebraSubject.id,
  name: 'Foundations',
  topics: [],
};

const equationsGroup: TopicGroup = algebraSubject.groups.find((g) => g.id === 'grp-equations') || {
  id: 'grp-equations',
  subjectId: algebraSubject.id,
  name: 'Equations',
  topics: [],
};

const engAlgebraGroup: TopicGroup = algebraSubject.groups.find((g) => g.id === 'grp-eng-algebra') || {
  id: 'grp-eng-algebra',
  subjectId: algebraSubject.id,
  name: 'Engineering-Relevant Algebra',
  topics: [],
};

const seqSeriesGroup: TopicGroup = algebraSubject.groups.find((g) => g.id === 'grp-seq-series') || {
  id: 'grp-seq-series',
  subjectId: algebraSubject.id,
  name: 'Sequences & Series',
  topics: [],
};

const higherAlgebraGroup: TopicGroup = algebraSubject.groups.find((g) => g.id === 'grp-higher-algebra') || {
  id: 'grp-higher-algebra',
  subjectId: algebraSubject.id,
  name: 'Higher / Engineering Algebra',
  topics: [],
};

const assessmentPracticeGroup: TopicGroup = algebraSubject.groups.find((g) => g.id === 'grp-assessment-practice') || {
  id: 'grp-assessment-practice',
  subjectId: algebraSubject.id,
  name: 'Assessment & Board Practice',
  topics: [],
};

// Structured Topic Exports by Category
export const FOUNDATIONS_TOPICS: Topic[] = foundationsGroup.topics;
export const EQUATIONS_TOPICS: Topic[] = equationsGroup.topics;
export const ENGINEERING_ALGEBRA_TOPICS: Topic[] = engAlgebraGroup.topics;
export const SEQUENCES_SERIES_TOPICS: Topic[] = seqSeriesGroup.topics;
export const HIGHER_ALGEBRA_TOPICS: Topic[] = higherAlgebraGroup.topics;
export const ASSESSMENT_PRACTICE_TOPICS: Topic[] = assessmentPracticeGroup.topics;

/**
 * ECE Algebra Topics structured into a clean map by category name
 */
export const ECE_ALGEBRA_TOPICS_BY_CATEGORY: Record<string, Topic[]> = {
  Foundations: FOUNDATIONS_TOPICS,
  Equations: EQUATIONS_TOPICS,
  'Engineering-Relevant Algebra': ENGINEERING_ALGEBRA_TOPICS,
  'Sequences & Series': SEQUENCES_SERIES_TOPICS,
  'Higher / Engineering Algebra': HIGHER_ALGEBRA_TOPICS,
  'Assessment & Board Practice': ASSESSMENT_PRACTICE_TOPICS,
};

/**
 * Detailed category metadata and topics list for ECE Algebra
 */
export const ECE_ALGEBRA_CATEGORIES: AlgebraCategoryInfo[] = [
  {
    id: foundationsGroup.id,
    name: foundationsGroup.name,
    description: 'Fundamental algebraic operations, laws of exponents, radicals, and rational fractions.',
    topicCount: FOUNDATIONS_TOPICS.length,
    topics: FOUNDATIONS_TOPICS,
  },
  {
    id: equationsGroup.id,
    name: equationsGroup.name,
    description: 'Linear, quadratic, polynomial, nonlinear systems, and inequalities.',
    topicCount: EQUATIONS_TOPICS.length,
    topics: EQUATIONS_TOPICS,
  },
  {
    id: engAlgebraGroup.id,
    name: engAlgebraGroup.name,
    description: 'Functions, exponential equations, logarithms, complex numbers, and variation.',
    topicCount: ENGINEERING_ALGEBRA_TOPICS.length,
    topics: ENGINEERING_ALGEBRA_TOPICS,
  },
  {
    id: seqSeriesGroup.id,
    name: seqSeriesGroup.name,
    description: 'Arithmetic/geometric progressions, infinite series, sigma summations, and binomial theorem.',
    topicCount: SEQUENCES_SERIES_TOPICS.length,
    topics: SEQUENCES_SERIES_TOPICS,
  },
  {
    id: higherAlgebraGroup.id,
    name: higherAlgebraGroup.name,
    description: 'Partial fractions, matrices, determinants, Cramer’s Rule, and engineering word applications.',
    topicCount: HIGHER_ALGEBRA_TOPICS.length,
    topics: HIGHER_ALGEBRA_TOPICS,
  },
  {
    id: assessmentPracticeGroup.id,
    name: assessmentPracticeGroup.name,
    description: 'Mixed algebra problem sets, timed board simulations, and past PRC examination questions.',
    topicCount: ASSESSMENT_PRACTICE_TOPICS.length,
    topics: ASSESSMENT_PRACTICE_TOPICS,
  },
];

/**
 * Re-export the canonical mock dataset for full context initialization
 */
export {
  INITIAL_SUBJECTS,
  INITIAL_TEST_RECORDS,
  INITIAL_ERRORS,
  INITIAL_DAILY_TARGET,
  INITIAL_USER_PROFILE,
};

export interface SeedPayload {
  subjects: Subject[];
  testRecords: TestRecord[];
  errors: ReviewError[];
  dailyTarget: DailyTarget;
  userProfile: UserProfile;
  stats: {
    totalTopics: number;
    coveredTopics: number;
    overdueTopics: number;
    dueTodayTopics: number;
    testRecordsCount: number;
    activeErrorsCount: number;
  };
}

export interface ContextSetters {
  setSubjects?: (subjects: Subject[]) => void;
  setTestRecords?: (records: TestRecord[]) => void;
  setErrors?: (errors: ReviewError[]) => void;
  setDailyTarget?: (target: DailyTarget) => void;
  setUserProfile?: (profile: UserProfile) => void;
}

export const STORAGE_KEYS = {
  SUBJECTS: 'ece_board_review_subjects_v4',
  TESTS: 'ece_board_review_tests_v3',
  ERRORS: 'ece_board_review_errors_v3',
  DAILY: 'ece_board_review_daily_v3',
  DAILY_DATE: 'ece_board_review_daily_date_v1',
  PROFILE: 'ece_board_review_profile_v3',
};

/**
 * Mock Initialization Function: Populates the context and local storage with initial
 * ECE Algebra progress data for testing tracking and progress analytics.
 * 
 * Can be called with:
 * 1. No arguments: Populates browser localStorage directly.
 * 2. Context setters: Directly updates React context state hooks if provided.
 * 3. Returns the full seeded dataset snapshot with calculated summary stats.
 */
export function populateContextWithSeedData(
  setters?: ContextSetters,
  options: { syncLocalStorage?: boolean; referenceDate?: string } = {}
): SeedPayload {
  const { syncLocalStorage = true, referenceDate = getLocalDateKey() } = options;

  const subjects = INITIAL_SUBJECTS;
  const testRecords = INITIAL_TEST_RECORDS;
  const errors = INITIAL_ERRORS;
  const dailyTarget = INITIAL_DAILY_TARGET;
  const userProfile = INITIAL_USER_PROFILE;

  // 1. If React context setters are provided, execute them to update state
  if (setters) {
    if (setters.setSubjects) setters.setSubjects(subjects);
    if (setters.setTestRecords) setters.setTestRecords(testRecords);
    if (setters.setErrors) setters.setErrors(errors);
    if (setters.setDailyTarget) setters.setDailyTarget(dailyTarget);
    if (setters.setUserProfile) setters.setUserProfile(userProfile);
  }

  // 2. Populate browser localStorage if running in browser environment
  if (syncLocalStorage && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
      window.localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(testRecords));
      window.localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(errors));
      window.localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(dailyTarget));
      window.localStorage.setItem(STORAGE_KEYS.DAILY_DATE, referenceDate);
      window.localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
    } catch (err) {
      console.warn('Could not synchronize seed data to localStorage:', err);
    }
  }

  // 3. Calculate statistics for testing verification
  const refDateObj = new Date(referenceDate + 'T00:00:00');
  const allTopics: Topic[] = [];
  for (const s of subjects) {
    for (const g of s.groups) {
      for (const t of g.topics) {
        allTopics.push(t);
      }
    }
  }

  let coveredCount = 0;
  let overdueCount = 0;
  let dueTodayCount = 0;

  for (const t of allTopics) {
    if (t.initialCovered) coveredCount++;
    if (t.nextReviewDate) {
      const revDate = new Date(t.nextReviewDate + 'T00:00:00');
      const diffDays = Math.round((refDateObj.getTime() - revDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 0) overdueCount++;
      else if (diffDays === 0) dueTodayCount++;
    }
  }

  const activeErrorsCount = errors.filter((e) => !e.isResolved).length;

  return {
    subjects,
    testRecords,
    errors,
    dailyTarget,
    userProfile,
    stats: {
      totalTopics: allTopics.length,
      coveredTopics: coveredCount,
      overdueTopics: overdueCount,
      dueTodayTopics: dueTodayCount,
      testRecordsCount: testRecords.length,
      activeErrorsCount,
    },
  };
}

/**
 * Convenient alias for mock test runners and test suites
 */
export const initializeSeedData = populateContextWithSeedData;

/**
 * Helper to get all topics belonging to a given category
 */
export function getTopicsByCategory(categoryName: string): Topic[] {
  return ECE_ALGEBRA_TOPICS_BY_CATEGORY[categoryName] || [];
}

/**
 * Helper to get a summary snapshot of all categories and topic counts
 */
export function getCategorySummary() {
  return ECE_ALGEBRA_CATEGORIES.map((cat) => ({
    category: cat.name,
    topicsCount: cat.topics.length,
    topics: cat.topics.map((t) => ({
      id: t.id,
      name: t.name,
      mastery: t.mastery,
      latestScore: t.latestScore,
      initialCovered: t.initialCovered,
    })),
  }));
}
