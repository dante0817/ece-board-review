/**
 * 5-Level Concept Mastery Engine for Real Numbers & Number Systems
 *
 * Distinctly separates:
 * 1. Mastery: How well the student can currently understand and solve problems for the concept.
 * 2. Retention: How likely the student is to still remember the material over time (forgetting curve).
 *
 * Mastery Scale:
 *   1/5 — Needs Review (0–39%)
 *   2/5 — Developing   (40–59%)
 *   3/5 — Proficient   (60–74%)
 *   4/5 — Strong       (75–89%)
 *   5/5 — Mastered     (90–100%)
 *
 * Confidence:
 *   - Low: < 4 attempts or single test session (caps mastery level from reaching 5/5)
 *   - Medium: 4–8 attempts with moderate consistency
 *   - High: >= 9 attempts or multiple sessions with steady accuracy
 */

import { ConceptId, loadRealNumbersSchedule } from './realNumbersScheduler';
import { loadRealNumbersHeatmap } from './realNumbersHeatmap';

export type MasteryScaleLevel = 1 | 2 | 3 | 4 | 5;
export type MasteryConfidence = 'low' | 'medium' | 'high';
export type MasteryLevelLabel = 'Needs Review' | 'Developing' | 'Proficient' | 'Strong' | 'Mastered';
export type MasterySource = 'system' | 'user';

export type ConceptActionType =
  | 'review'
  | 'practice_basics'
  | 'practice_more'
  | 'challenge'
  | 'continue'
  | 'quick_review';

export interface DiscrepancyInfo {
  hasDiscrepancy: boolean;
  type: 'user_higher' | 'user_lower';
  userLevel: MasteryScaleLevel;
  systemLevel: MasteryScaleLevel;
  diff: number; // userLevel - systemLevel
  message: string;
  recommendedAction: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
}

export interface ConceptMasteryData {
  conceptId: ConceptId;
  title: string;
  shortTitle: string;

  // System-calculated mastery (objective evidence, recalculated in background)
  systemMasteryLevel: MasteryScaleLevel;       // 1–5
  systemMasteryScore: number;                 // 0–100
  masteryConfidence: MasteryConfidence;        // low | medium | high

  // User-set manual mastery override
  userMasteryLevel: MasteryScaleLevel | null;  // null or 1–5
  masterySource: MasterySource;               // 'system' | 'user'
  userMasteryUpdatedAt: string | null;        // ISO timestamp or null

  // Effective displayed mastery (userMasteryLevel if present, else systemMasteryLevel)
  masteryLevel: MasteryScaleLevel;            // 1–5
  masteryScore: number;                       // 0–100
  levelLabel: MasteryLevelLabel;

  retentionScore: number;               // separate 0–100% value
  retentionStatus: 'healthy' | 'review_due' | 'due_soon';
  recentAccuracy: number;               // 0-100%
  recentAttempts: number;               // relevant question attempts
  recentCorrect: number;                // correct in recent attempts
  repeatedMistakes: number;             // active uncorrected mistake traps
  lastAssessedAt: string;               // ISO or formatted
  nextRecommendedAction: string;        // e.g. "Review this concept, then reassess mastery."
  actionType: ConceptActionType;
  evidenceSummary: string;              // e.g. "Based on 3 relevant questions"
  evidenceDetails: string[];
}

export interface ConceptMasteryStore {
  version: number;
  lastUpdated: string;
  concepts: Record<ConceptId, ConceptMasteryData>;
}

const STORAGE_KEY = 'topnotch_real_numbers_concept_mastery_v1';
export const CONCEPT_MASTERY_UPDATED_EVENT = 'topnotch-concept-mastery-updated';

export const MASTERY_LEVEL_LABELS: Record<MasteryScaleLevel, MasteryLevelLabel> = {
  1: 'Needs Review',
  2: 'Developing',
  3: 'Proficient',
  4: 'Strong',
  5: 'Mastered',
};

export const MASTERY_LEVEL_COLORS: Record<MasteryScaleLevel, {
  barColor: string;
  textColor: string;
  bgLight: string;
  borderColor: string;
}> = {
  1: {
    barColor: 'bg-rose-500',
    textColor: 'text-rose-600',
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  2: {
    barColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  3: {
    barColor: 'bg-blue-600',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  4: {
    barColor: 'bg-indigo-600',
    textColor: 'text-indigo-600',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  5: {
    barColor: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
};

/**
 * Determine recommended next step based on mastery and separate retention
 */
export function determineRecommendedAction(
  level: MasteryScaleLevel,
  retentionScore: number
): { actionText: string; actionType: ConceptActionType } {
  if (level === 1) {
    return {
      actionText: 'Review this concept, then reassess mastery.',
      actionType: 'review',
    };
  }
  if (level === 2) {
    return {
      actionText: 'Practice foundational questions to build core familiarity.',
      actionType: 'practice_basics',
    };
  }
  if (level === 3) {
    return {
      actionText: 'Practice mixed questions to reinforce proficiency.',
      actionType: 'practice_more',
    };
  }
  if (level === 4) {
    return {
      actionText: 'Attempt challenge problems to solidify 5/5 mastery.',
      actionType: 'challenge',
    };
  }

  // Level 5
  if (retentionScore < 70) {
    return {
      actionText: 'Mastery is strong, but memory decay detected. Take a quick review.',
      actionType: 'quick_review',
    };
  }

  return {
    actionText: 'Mastery maintained with healthy retention. Continue to next concept.',
    actionType: 'continue',
  };
}

/**
 * Initial seed state matching the prompt and screenshot
 */
export function getInitialMasteryStore(): ConceptMasteryStore {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    concepts: {
      1: {
        conceptId: 1,
        title: 'Number Sets & Hierarchy',
        shortTitle: 'Number Sets',
        systemMasteryLevel: 5,
        systemMasteryScore: 100,
        masteryConfidence: 'high',
        userMasteryLevel: null,
        masterySource: 'system',
        userMasteryUpdatedAt: null,
        masteryLevel: 5,
        masteryScore: 100,
        levelLabel: 'Mastered',
        retentionScore: 88,
        retentionStatus: 'healthy',
        recentAccuracy: 100,
        recentAttempts: 9,
        recentCorrect: 9,
        repeatedMistakes: 0,
        lastAssessedAt: '2026-09-17T14:14:00.000Z',
        nextRecommendedAction: 'Mastery maintained with healthy retention. Continue to next concept.',
        actionType: 'continue',
        evidenceSummary: 'Based on 9 relevant questions across 3 sessions',
        evidenceDetails: [
          'High recent accuracy: 100% (9 of 9 correct)',
          'High confidence: Multiple consistent quiz sessions',
          'Zero active mistake traps',
        ],
      },
      2: {
        conceptId: 2,
        title: 'Rational vs. Irrational Numbers',
        shortTitle: 'Rational vs. Irrational',
        systemMasteryLevel: 1,
        systemMasteryScore: 39,
        masteryConfidence: 'medium',
        userMasteryLevel: null,
        masterySource: 'system',
        userMasteryUpdatedAt: null,
        masteryLevel: 1,
        masteryScore: 39,
        levelLabel: 'Needs Review',
        retentionScore: 67,
        retentionStatus: 'review_due',
        recentAccuracy: 33,
        recentAttempts: 3,
        recentCorrect: 1,
        repeatedMistakes: 1,
        lastAssessedAt: '2026-09-17T13:20:00.000Z',
        nextRecommendedAction: 'Review this concept, then reassess mastery.',
        actionType: 'review',
        evidenceSummary: 'Based on 3 relevant questions',
        evidenceDetails: [
          'Recent performance: 1 of 3 correct (33%)',
          'Active trap: Closure property of irrational numbers under addition',
          'Retention is 67% (Review due today)',
        ],
      },
      3: {
        conceptId: 3,
        title: 'Classifying Numbers & Board Traps',
        shortTitle: 'Classifying Numbers',
        systemMasteryLevel: 3,
        systemMasteryScore: 67,
        masteryConfidence: 'low',
        userMasteryLevel: null,
        masterySource: 'system',
        userMasteryUpdatedAt: null,
        masteryLevel: 3,
        masteryScore: 67,
        levelLabel: 'Proficient',
        retentionScore: 78,
        retentionStatus: 'due_soon',
        recentAccuracy: 67,
        recentAttempts: 3,
        recentCorrect: 2,
        repeatedMistakes: 0,
        lastAssessedAt: '2026-09-16T18:45:00.000Z',
        nextRecommendedAction: 'Practice mixed questions to reinforce proficiency.',
        actionType: 'practice_more',
        evidenceSummary: 'Based on 3 relevant questions',
        evidenceDetails: [
          'Recent performance: 2 of 3 correct (67%)',
          'Confidence: Low (only 3 relevant questions tested)',
          'Needs assessment to confirm proficiency',
        ],
      },
      4: {
        conceptId: 4,
        title: 'Ordering, Approximating & Inequalities',
        shortTitle: 'Ordering & Comparing',
        systemMasteryLevel: 5,
        systemMasteryScore: 100,
        masteryConfidence: 'high',
        userMasteryLevel: null,
        masterySource: 'system',
        userMasteryUpdatedAt: null,
        masteryLevel: 5,
        masteryScore: 100,
        levelLabel: 'Mastered',
        retentionScore: 80,
        retentionStatus: 'healthy',
        recentAccuracy: 100,
        recentAttempts: 6,
        recentCorrect: 6,
        repeatedMistakes: 0,
        lastAssessedAt: '2026-09-17T11:03:00.000Z',
        nextRecommendedAction: 'Mastery maintained with healthy retention. Continue to next concept.',
        actionType: 'continue',
        evidenceSummary: 'Based on 6 relevant questions',
        evidenceDetails: [
          'Recent performance: 6 of 6 correct (100%)',
          'High confidence: Consistently solved negative coordinate approximations',
          'Zero recurring mistakes',
        ],
      },
    },
  };
}

/**
 * Check if there is a strong discrepancy between user manual rating and system estimate
 */
export function getDiscrepancyInfo(concept: ConceptMasteryData): DiscrepancyInfo | null {
  if (concept.userMasteryLevel === null || concept.masterySource !== 'user') {
    return null;
  }
  const diff = concept.userMasteryLevel - concept.systemMasteryLevel;
  // If difference is 2 or more levels apart (e.g. 5 vs 2, 2 vs 4), flag gentle discrepancy
  if (Math.abs(diff) < 2) {
    return null;
  }

  if (diff >= 2) {
    return {
      hasDiscrepancy: true,
      type: 'user_higher',
      userLevel: concept.userMasteryLevel,
      systemLevel: concept.systemMasteryLevel,
      diff,
      message: 'Your self-rating is higher than your recent assessment results.',
      recommendedAction: 'Take a mastery check to validate this level against board-style questions.',
      primaryActionLabel: 'Take a Mastery Check',
      secondaryActionLabel: 'Reset to System Estimate',
    };
  }

  return {
    hasDiscrepancy: true,
    type: 'user_lower',
    userLevel: concept.userMasteryLevel,
    systemLevel: concept.systemMasteryLevel,
    diff,
    message: 'Your recent performance suggests stronger mastery.',
    recommendedAction: 'Your quiz accuracy demonstrates solid understanding. You can reassess or keep your conservative self-rating.',
    primaryActionLabel: 'Reassess',
    secondaryActionLabel: 'Keep My Rating',
  };
}

/**
 * Load concept mastery store from localStorage or return synchronized initial store
 */
export function loadConceptMasteryStore(): ConceptMasteryStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialMasteryStore();
      saveConceptMasteryStore(initial);
      return initial;
    }
    const parsed: ConceptMasteryStore = JSON.parse(raw);

    // Sync retention scores from realNumbersScheduler without altering mastery levels!
    const schedule = loadRealNumbersSchedule();
    let hasChanges = false;

    for (const id of [1, 2, 3, 4] as ConceptId[]) {
      const schedItem = schedule.concepts[id];
      const concept = parsed.concepts[id];
      if (concept) {
        // Migrate legacy store shape if needed
        if (concept.systemMasteryLevel === undefined) {
          concept.systemMasteryLevel = concept.masteryLevel;
          concept.systemMasteryScore = concept.masteryScore;
          concept.userMasteryLevel = null;
          concept.masterySource = 'system';
          concept.userMasteryUpdatedAt = null;
          hasChanges = true;
        }

        // Keep effective displayed level synced with user override if active
        if (concept.userMasteryLevel !== null && concept.masterySource === 'user') {
          concept.masteryLevel = concept.userMasteryLevel;
          concept.levelLabel = MASTERY_LEVEL_LABELS[concept.userMasteryLevel];
        } else {
          concept.masteryLevel = concept.systemMasteryLevel;
          concept.masteryScore = concept.systemMasteryScore;
          concept.levelLabel = MASTERY_LEVEL_LABELS[concept.systemMasteryLevel];
        }

        if (schedItem && concept.retentionScore !== schedItem.estimatedRetention) {
          concept.retentionScore = schedItem.estimatedRetention;
          concept.retentionStatus =
            schedItem.estimatedRetention < 70
              ? 'review_due'
              : schedItem.estimatedRetention < 80
              ? 'due_soon'
              : 'healthy';
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      saveConceptMasteryStore(parsed);
    }

    return parsed;
  } catch (err) {
    console.warn('Failed to load concept mastery store:', err);
    return getInitialMasteryStore();
  }
}

/**
 * Save concept mastery store and notify listeners
 */
export function saveConceptMasteryStore(store: ConceptMasteryStore): void {
  try {
    store.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CONCEPT_MASTERY_UPDATED_EVENT, { detail: store }));
    }
  } catch (err) {
    console.warn('Failed to save concept mastery store:', err);
  }
}

/**
 * Set a manual mastery level override by the student
 * Preserves the system estimate in background without overwriting it!
 */
export function setUserMasteryOverride(
  conceptId: ConceptId,
  level: MasteryScaleLevel
): ConceptMasteryData {
  const store = loadConceptMasteryStore();
  const current = store.concepts[conceptId] || getInitialMasteryStore().concepts[conceptId];

  // Map 1-5 to a nominal score bracket for secondary display
  const nominalScore =
    level === 5 ? 100 : level === 4 ? 85 : level === 3 ? 68 : level === 2 ? 50 : 30;

  const updated: ConceptMasteryData = {
    ...current,
    userMasteryLevel: level,
    masterySource: 'user',
    userMasteryUpdatedAt: new Date().toISOString(),
    masteryLevel: level,
    masteryScore: nominalScore,
    levelLabel: MASTERY_LEVEL_LABELS[level],
  };

  // Adjust recommendation considering both values
  const discrepancy = getDiscrepancyInfo(updated);
  if (discrepancy) {
    updated.nextRecommendedAction = discrepancy.message;
  } else {
    const { actionText, actionType } = determineRecommendedAction(level, current.retentionScore);
    updated.nextRecommendedAction = actionText;
    updated.actionType = actionType;
  }

  store.concepts[conceptId] = updated;
  saveConceptMasteryStore(store);
  return updated;
}

/**
 * Reset user override back to system estimate
 */
export function resetUserMasteryToSystem(conceptId: ConceptId): ConceptMasteryData {
  const store = loadConceptMasteryStore();
  const current = store.concepts[conceptId] || getInitialMasteryStore().concepts[conceptId];

  const { actionText, actionType } = determineRecommendedAction(
    current.systemMasteryLevel,
    current.retentionScore
  );

  const updated: ConceptMasteryData = {
    ...current,
    userMasteryLevel: null,
    masterySource: 'system',
    userMasteryUpdatedAt: null,
    masteryLevel: current.systemMasteryLevel,
    masteryScore: current.systemMasteryScore,
    levelLabel: MASTERY_LEVEL_LABELS[current.systemMasteryLevel],
    nextRecommendedAction: actionText,
    actionType,
  };

  store.concepts[conceptId] = updated;
  saveConceptMasteryStore(store);
  return updated;
}

/**
 * Calculate mastery level & score from evidence
 * Weights recent performance 70% vs lifetime performance 30%.
 * Older mistakes that have been corrected do NOT permanently drag down mastery.
 * Assigns Confidence (low, medium, high) based on sample size and consistency.
 * If confidence is low, caps mastery from reaching 5/5.
 */
export function calculateMasteryFromEvidence(params: {
  recentCorrect: number;
  recentTotal: number;
  lifetimeCorrect: number;
  lifetimeTotal: number;
  repeatedMistakes: number;
  priorLevel: MasteryScaleLevel;
}): {
  masteryScore: number;
  masteryLevel: MasteryScaleLevel;
  confidence: MasteryConfidence;
  evidenceSummary: string;
  evidenceDetails: string[];
} {
  const {
    recentCorrect,
    recentTotal,
    lifetimeCorrect,
    lifetimeTotal,
    repeatedMistakes,
  } = params;

  const recentPct = recentTotal > 0 ? (recentCorrect / recentTotal) * 100 : 50;
  const lifetimePct = lifetimeTotal > 0 ? (lifetimeCorrect / lifetimeTotal) * 100 : recentPct;

  // Weight recent attempts more heavily (70%) than lifetime (30%)
  let blendedScore = Math.round(recentPct * 0.70 + lifetimePct * 0.30);

  // Apply mistake penalty ONLY if repeated mistakes are actively uncorrected
  if (repeatedMistakes > 0) {
    blendedScore = Math.max(0, blendedScore - Math.min(15, repeatedMistakes * 8));
  }

  blendedScore = Math.max(0, Math.min(100, blendedScore));

  // Determine Confidence
  let confidence: MasteryConfidence = 'low';
  if (lifetimeTotal >= 9 && recentTotal >= 4) {
    confidence = 'high';
  } else if (lifetimeTotal >= 4 || recentTotal >= 3) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Determine Mastery Level:
  // 0–39% -> Level 1 (Needs Review)
  // 40–59% -> Level 2 (Developing)
  // 60–74% -> Level 3 (Proficient)
  // 75–89% -> Level 4 (Strong)
  // 90–100% -> Level 5 (Mastered)
  let level: MasteryScaleLevel = 1;
  if (blendedScore >= 90) {
    level = 5;
  } else if (blendedScore >= 75) {
    level = 4;
  } else if (blendedScore >= 60) {
    level = 3;
  } else if (blendedScore >= 40) {
    level = 2;
  } else {
    level = 1;
  }

  // Guardrail: A single test / low confidence cannot produce 5/5 Mastered!
  // It requires at least medium confidence to reach Level 4 and high confidence for Level 5.
  if (confidence === 'low' && level > 3) {
    level = 3;
  } else if (confidence === 'medium' && level === 5 && recentTotal < 5) {
    level = 4;
  }

  const evidenceSummary = `Based on ${recentTotal} relevant question${recentTotal === 1 ? '' : 's'}`;
  const evidenceDetails: string[] = [
    `Recent accuracy: ${Math.round(recentPct)}% (${recentCorrect} of ${recentTotal} correct)`,
    `Confidence: ${confidence.charAt(0).toUpperCase() + confidence.slice(1)} (${lifetimeTotal} total questions tracked)`,
  ];

  if (repeatedMistakes > 0) {
    evidenceDetails.push(`${repeatedMistakes} uncorrected recurring mistake trap${repeatedMistakes === 1 ? '' : 's'}`);
  } else if (lifetimeTotal > 3) {
    evidenceDetails.push('Zero active mistake traps; prior errors successfully remediated');
  }

  return {
    masteryScore: blendedScore,
    masteryLevel: level,
    confidence,
    evidenceSummary,
    evidenceDetails,
  };
}

/**
 * Record an adaptive assessment or quiz drill for a concept
 * Updates mastery level, score, confidence, and recommended next step.
 */
export function recordConceptAssessment(
  conceptId: ConceptId,
  questionsAttempted: number,
  questionsCorrect: number,
  mistakesUnresolved: number = 0
): ConceptMasteryData {
  const store = loadConceptMasteryStore();
  const current = store.concepts[conceptId] || getInitialMasteryStore().concepts[conceptId];

  // Weight new attempt into lifetime counts
  const newLifetimeTotal = current.recentAttempts + questionsAttempted;
  const newLifetimeCorrect = current.recentCorrect + questionsCorrect;

  const result = calculateMasteryFromEvidence({
    recentCorrect: questionsCorrect,
    recentTotal: questionsAttempted,
    lifetimeCorrect: newLifetimeCorrect,
    lifetimeTotal: newLifetimeTotal,
    repeatedMistakes: mistakesUnresolved,
    priorLevel: current.masteryLevel,
  });

  const { actionText, actionType } = determineRecommendedAction(
    result.masteryLevel,
    current.retentionScore
  );

  const hasUserOverride = current.userMasteryLevel !== null && current.masterySource === 'user';
  const effectiveLevel = hasUserOverride ? current.userMasteryLevel! : result.masteryLevel;
  const effectiveScore = hasUserOverride ? current.masteryScore : result.masteryScore;

  const updated: ConceptMasteryData = {
    ...current,
    systemMasteryLevel: result.masteryLevel,
    systemMasteryScore: result.masteryScore,
    masteryConfidence: result.confidence,
    masteryLevel: effectiveLevel,
    masteryScore: effectiveScore,
    levelLabel: MASTERY_LEVEL_LABELS[effectiveLevel],
    recentAccuracy: Math.round((questionsCorrect / Math.max(1, questionsAttempted)) * 100),
    recentAttempts: questionsAttempted,
    recentCorrect: questionsCorrect,
    repeatedMistakes: mistakesUnresolved,
    lastAssessedAt: new Date().toISOString(),
    nextRecommendedAction: actionText,
    actionType,
    evidenceSummary: result.evidenceSummary,
    evidenceDetails: result.evidenceDetails,
  };

  // If user override is active, evaluate discrepancy with new system estimate
  if (hasUserOverride) {
    const discrepancy = getDiscrepancyInfo(updated);
    if (discrepancy) {
      updated.nextRecommendedAction = discrepancy.message;
    }
  }

  store.concepts[conceptId] = updated;
  saveConceptMasteryStore(store);
  return updated;
}
