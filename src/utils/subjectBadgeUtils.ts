import { Subject, TestRecord } from '../types';

export type BadgeTierId = 'novice' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeTierDefinition {
  id: BadgeTierId;
  name: string;
  rankTitle: string;
  minCorrect: number;
  maxCorrect: number | null; // null for highest tier
  description: string;
  perks: string;
  bgGradient: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  ringColor: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  accentHex: string;
  medalColor: string;
  iconName: 'Shield' | 'Medal' | 'Award' | 'Trophy' | 'Crown';
}

export const BADGE_TIERS: BadgeTierDefinition[] = [
  {
    id: 'novice',
    name: 'In Training',
    rankTitle: 'Board Initiate',
    minCorrect: 0,
    maxCorrect: 24,
    description: 'Beginning structured question drills across syllabus topics.',
    perks: 'Baseline diagnostic calibration & error pattern tracking.',
    bgGradient: 'from-stone-100 to-stone-200',
    badgeBg: 'bg-stone-100',
    textColor: 'text-stone-700',
    borderColor: 'border-stone-300',
    ringColor: 'ring-stone-400/20',
    pillBg: 'bg-stone-100',
    pillText: 'text-stone-600',
    pillBorder: 'border-stone-200',
    accentHex: '#78716c',
    medalColor: '#a8a29e',
    iconName: 'Shield',
  },
  {
    id: 'bronze',
    name: 'Bronze',
    rankTitle: 'Bronze Board Scholar',
    minCorrect: 25,
    maxCorrect: 74,
    description: 'Achieved 25+ correct practice questions with steady fundamentals.',
    perks: 'Demonstrated core formula recall & standard problem solving.',
    bgGradient: 'from-amber-900/10 via-amber-800/10 to-orange-950/10',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-700/40',
    ringColor: 'ring-amber-700/25',
    pillBg: 'bg-amber-100/80',
    pillText: 'text-amber-900',
    pillBorder: 'border-amber-300',
    accentHex: '#b45309',
    medalColor: '#d97706',
    iconName: 'Medal',
  },
  {
    id: 'silver',
    name: 'Silver',
    rankTitle: 'Silver Board Practitioner',
    minCorrect: 75,
    maxCorrect: 174,
    description: 'Surpassed 75+ correct questions demonstrating reliable competency.',
    perks: 'Consistent speed on multi-step problems & high retention index.',
    bgGradient: 'from-slate-100 via-slate-200/80 to-zinc-200',
    badgeBg: 'bg-slate-100',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-400/60',
    ringColor: 'ring-slate-400/30',
    pillBg: 'bg-slate-200/70',
    pillText: 'text-slate-800',
    pillBorder: 'border-slate-300',
    accentHex: '#64748b',
    medalColor: '#94a3b8',
    iconName: 'Award',
  },
  {
    id: 'gold',
    name: 'Gold',
    rankTitle: 'Gold Board Specialist',
    minCorrect: 175,
    maxCorrect: 299,
    description: 'Surpassed 175+ correct practice questions with high board exam accuracy.',
    perks: 'Expert-level speed, traps avoided, and mixed-topic readiness.',
    bgGradient: 'from-amber-100/90 via-yellow-100/70 to-amber-200/60',
    badgeBg: 'bg-amber-100/80',
    textColor: 'text-amber-950',
    borderColor: 'border-amber-500/60',
    ringColor: 'ring-amber-400/35',
    pillBg: 'bg-amber-200/80',
    pillText: 'text-amber-950',
    pillBorder: 'border-amber-400',
    accentHex: '#eab308',
    medalColor: '#f59e0b',
    iconName: 'Trophy',
  },
  {
    id: 'platinum',
    name: 'Platinum',
    rankTitle: 'Platinum Board Master',
    minCorrect: 300,
    maxCorrect: null,
    description: 'Elite benchmark: 300+ correct questions answered with PRC topnotcher mastery.',
    perks: 'Full syllabus mastery, rapid mental calculations, and zero hesitation.',
    bgGradient: 'from-indigo-100/90 via-cyan-50 to-purple-100/80',
    badgeBg: 'bg-indigo-50',
    textColor: 'text-indigo-950',
    borderColor: 'border-indigo-400/70',
    ringColor: 'ring-indigo-400/35',
    pillBg: 'bg-indigo-100',
    pillText: 'text-indigo-900',
    pillBorder: 'border-indigo-300',
    accentHex: '#6366f1',
    medalColor: '#818cf8',
    iconName: 'Crown',
  },
];

export interface SubjectMasteryBadgeData {
  subjectId: string;
  subjectName: string;
  tier: BadgeTierDefinition;
  totalQuestionsCorrect: number;
  totalQuestionsAttempted: number;
  accuracyPercent: number;
  topicDrillCorrect: number;
  testCorrect: number;
  totalSessions: number;
  nextTier: BadgeTierDefinition | null;
  questionsToNextTier: number;
  progressToNextTierPercent: number;
  isMaxTier: boolean;
}

/**
 * Calculates practice question statistics and the corresponding visual mastery badge for a subject
 */
export function calculateSubjectMasteryBadge(
  subject: Subject,
  testRecords: TestRecord[] = []
): SubjectMasteryBadgeData {
  let topicDrillCorrect = 0;
  let topicDrillAttempted = 0;
  let topicDrillSessions = 0;

  if (subject && subject.groups) {
    subject.groups.forEach((group) => {
      if (group.topics) {
        group.topics.forEach((topic) => {
          if (topic.activityHistory) {
            topic.activityHistory.forEach((act) => {
              topicDrillCorrect += act.questionsCorrect || 0;
              topicDrillAttempted += act.questionsAttempted || 0;
              topicDrillSessions += 1;
            });
          }
        });
      }
    });
  }

  let testCorrect = 0;
  let testAttempted = 0;
  let testSessions = 0;

  if (testRecords && subject) {
    const subjectTests = testRecords.filter((t) => t.subjectId === subject.id);
    subjectTests.forEach((t) => {
      testCorrect += t.correct || 0;
      testAttempted += t.questions || 0;
      testSessions += 1;
    });
  }

  const totalQuestionsCorrect = topicDrillCorrect + testCorrect;
  const totalQuestionsAttempted = topicDrillAttempted + testAttempted;
  const accuracyPercent =
    totalQuestionsAttempted > 0
      ? Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 100)
      : 0;

  // Determine current tier from thresholds
  let currentTier = BADGE_TIERS[0];
  for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
    if (totalQuestionsCorrect >= BADGE_TIERS[i].minCorrect) {
      currentTier = BADGE_TIERS[i];
      break;
    }
  }

  const currentIndex = BADGE_TIERS.findIndex((t) => t.id === currentTier.id);
  const nextTier =
    currentIndex < BADGE_TIERS.length - 1 ? BADGE_TIERS[currentIndex + 1] : null;

  const isMaxTier = nextTier === null;

  let questionsToNextTier = 0;
  let progressToNextTierPercent = 100;

  if (nextTier) {
    questionsToNextTier = Math.max(0, nextTier.minCorrect - totalQuestionsCorrect);
    const tierSpan = nextTier.minCorrect - currentTier.minCorrect;
    const progressInSpan = totalQuestionsCorrect - currentTier.minCorrect;
    progressToNextTierPercent = Math.min(
      100,
      Math.max(0, Math.round((progressInSpan / Math.max(1, tierSpan)) * 100))
    );
  }

  return {
    subjectId: subject?.id || '',
    subjectName: subject?.name || 'Subject',
    tier: currentTier,
    totalQuestionsCorrect,
    totalQuestionsAttempted,
    accuracyPercent,
    topicDrillCorrect,
    testCorrect,
    totalSessions: topicDrillSessions + testSessions,
    nextTier,
    questionsToNextTier,
    progressToNextTierPercent,
    isMaxTier,
  };
}
