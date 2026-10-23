import type { AlgebraReferencePracticeQuestion, AlgebraReferenceTopicContent } from '../data/algebraReferenceContent';
import {canonicalSkillName, canonicalSkillId} from '../domain/curriculum/skillCatalog';
import {migrateAbsoluteValuePracticeEvidence} from './referenceEvidenceMigration';

export interface ReferencePracticeQuestionEvidence {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAttemptAt: string;
}

export interface ReferencePracticeEvidence {
  version: 1;
  questions: Record<string, ReferencePracticeQuestionEvidence>;
  misconceptionMisses: Record<string, number>;
}

export interface ReferenceSubskillStat {
  subskill: string;
  skillId: string;
  questionCount: number;
  attemptedQuestions: number;
  attempts: number;
  correct: number;
  accuracyPercent: number | null;
  coveragePercent: number;
  level: 'Not practiced' | 'Practiced once' | 'Developing' | 'Broad practice';
}

const STORAGE_PREFIX = 'ece_reference_practice_evidence_v1:';

export const emptyReferencePracticeEvidence = (): ReferencePracticeEvidence => ({
  version: 1,
  questions: {},
  misconceptionMisses: {},
});

export const loadReferencePracticeEvidence = (topicId: string): ReferencePracticeEvidence => {
  if (typeof window === 'undefined') return emptyReferencePracticeEvidence();
  try {
    migrateAbsoluteValuePracticeEvidence(window.localStorage);
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${topicId}`);
    if (!raw) return emptyReferencePracticeEvidence();
    const parsed = JSON.parse(raw) as Partial<ReferencePracticeEvidence>;
    return {
      version: 1,
      questions: parsed.questions ?? {},
      misconceptionMisses: parsed.misconceptionMisses ?? {},
    };
  } catch {
    return emptyReferencePracticeEvidence();
  }
};

export const saveReferencePracticeEvidence = (topicId: string, evidence: ReferencePracticeEvidence): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${topicId}`, JSON.stringify(evidence));
  } catch {
    // Practice evidence is supplemental and must never block the lesson UI.
  }
};

export const recordReferencePracticeAttempt = (
  evidence: ReferencePracticeEvidence,
  question: AlgebraReferencePracticeQuestion,
  isCorrect: boolean,
  attemptedAt = new Date().toISOString()
): ReferencePracticeEvidence => {
  const previous = evidence.questions[question.id] ?? { attempts: 0, correct: 0, lastCorrect: false, lastAttemptAt: attemptedAt };
  const misconceptionMisses = { ...evidence.misconceptionMisses };
  if (!isCorrect && question.misconceptionId) {
    misconceptionMisses[question.misconceptionId] = (misconceptionMisses[question.misconceptionId] ?? 0) + 1;
  }

  return {
    version: 1,
    questions: {
      ...evidence.questions,
      [question.id]: {
        attempts: previous.attempts + 1,
        correct: previous.correct + (isCorrect ? 1 : 0),
        lastCorrect: isCorrect,
        lastAttemptAt: attemptedAt,
      },
    },
    misconceptionMisses,
  };
};

export const getReferenceSubskillStats = (
  content: AlgebraReferenceTopicContent,
  evidence: ReferencePracticeEvidence
): ReferenceSubskillStat[] => {
  const groups = new Map<string, AlgebraReferencePracticeQuestion[]>();
  for (const question of content.practiceQuestions) {
    const name = canonicalSkillName(content.canonicalTopicId, question.subskill);
    const existing = groups.get(name) ?? [];
    existing.push(question);
    groups.set(name, existing);
  }

  return [...groups.entries()].map(([subskill, questions]) => {
    // Some v10.10 item IDs have identical authored prompts. Preserve those IDs for
    // historical learner records, but count the repeated problem only once for coverage.
    const uniquePrompts = new Map<string, AlgebraReferencePracticeQuestion[]>();
    for (const question of questions) {
      const key=question.prompt.trim().replace(/\s+/g,' ').toLowerCase();
      uniquePrompts.set(key,[...(uniquePrompts.get(key)??[]),question]);
    }
    let attemptedQuestions = 0;
    let attempts = 0;
    let correct = 0;
    for (const samePromptItems of uniquePrompts.values()) {
      if(samePromptItems.some(q=>(evidence.questions[q.id]?.attempts??0)>0))attemptedQuestions++;
      for (const question of samePromptItems) {
        const qEvidence = evidence.questions[question.id];
        if (!qEvidence) continue;
        attempts += qEvidence.attempts;
        correct += qEvidence.correct;
      }
    }

    const accuracyPercent = attempts > 0 ? Math.round((correct / attempts) * 100) : null;
    const questionCount = uniquePrompts.size;
    const coveragePercent = questionCount ? Math.round((attemptedQuestions / questionCount) * 100) : 0;
    let level: ReferenceSubskillStat['level'] = 'Not practiced';
    // Local practice is never verified independent evidence; repeated answers to one item do not add breadth.
    if (attempts > 0) {
      if (attemptedQuestions === 1) level = 'Practiced once';
      else if (attemptedQuestions >= 3 && coveragePercent >= 75 && (accuracyPercent ?? 0) >= 85) level = 'Broad practice';
      else level = 'Developing';
    }

    return { subskill, skillId: canonicalSkillId(content.canonicalTopicId, subskill), questionCount, attemptedQuestions, attempts, correct, accuracyPercent, coveragePercent, level };
  });
};

export const getReferencePracticeSummary = (
  content: AlgebraReferenceTopicContent,
  evidence: ReferencePracticeEvidence
) => {
  const promptGroups = new Map<string, AlgebraReferencePracticeQuestion[]>();
  for(const q of content.practiceQuestions){const key=q.prompt.trim().replace(/\s+/g,' ').toLowerCase();promptGroups.set(key,[...(promptGroups.get(key)??[]),q]);}
  const attemptedQuestions=[...promptGroups.values()].filter(questions=>questions.some(q=>(evidence.questions[q.id]?.attempts??0)>0)).length;
  const attempts = content.practiceQuestions.reduce((sum,q)=>sum+(evidence.questions[q.id]?.attempts??0),0);
  const correct = content.practiceQuestions.reduce((sum,q)=>sum+(evidence.questions[q.id]?.correct??0),0);
  return {
    attemptedQuestions,
    totalQuestions: promptGroups.size,
    coveragePercent: promptGroups.size ? Math.round((attemptedQuestions / promptGroups.size) * 100) : 0,
    attempts,
    correct,
    accuracyPercent: attempts ? Math.round((correct / attempts) * 100) : null,
  };
};


export interface ReferenceAssessmentReadiness {
  status: 'No evidence' | 'Practice first' | 'Ready for quiz' | 'Broad practice';
  canTakeAssessment: boolean;
  coveragePercent: number;
  accuracyPercent: number | null;
  practicedSubskills: number;
  totalSubskills: number;
  reason: string;
}

export const getReferenceAssessmentReadiness = (
  content: AlgebraReferenceTopicContent,
  evidence: ReferencePracticeEvidence
): ReferenceAssessmentReadiness => {
  const summary = getReferencePracticeSummary(content, evidence);
  const stats = getReferenceSubskillStats(content, evidence);
  const practiced = stats.filter((stat) => stat.attempts > 0);
  const practicedRatio = stats.length ? practiced.length / stats.length : 0;
  const hasSevereWeakness = practiced.some((stat) => (stat.accuracyPercent ?? 0) < 50);
  const allPracticed = stats.length > 0 && practiced.length === stats.length;
  const enoughBreadth = stats.length > 0 && stats.every((stat) => stat.attemptedQuestions >= 2 && (stat.accuracyPercent ?? 0) >= 75);

  if (summary.attempts === 0) {
    return {
      status: 'No evidence', canTakeAssessment: false,
      coveragePercent: summary.coveragePercent, accuracyPercent: summary.accuracyPercent,
      practicedSubskills: practiced.length, totalSubskills: stats.length,
      reason: 'Try representative practice before using local evidence to recommend a scored assessment.',
    };
  }

  if (summary.coveragePercent >= 90 && (summary.accuracyPercent ?? 0) >= 85 && allPracticed && enoughBreadth) {
    return {
      status: 'Broad practice', canTakeAssessment: true,
      coveragePercent: summary.coveragePercent, accuracyPercent: summary.accuracyPercent,
      practicedSubskills: practiced.length, totalSubskills: stats.length,
      reason: 'Broad local practice supports taking a scored quiz; results remain practice evidence, not verified mastery.',
    };
  }

  if (summary.coveragePercent >= 60 && (summary.accuracyPercent ?? 0) >= 75 && practicedRatio >= 0.7 && !hasSevereWeakness) {
    return {
      status: 'Ready for quiz', canTakeAssessment: true,
      coveragePercent: summary.coveragePercent, accuracyPercent: summary.accuracyPercent,
      practicedSubskills: practiced.length, totalSubskills: stats.length,
      reason: 'Local practice evidence is broad enough to recommend the scored mastery quiz.',
    };
  }

  return {
    status: 'Practice first', canTakeAssessment: false,
    coveragePercent: summary.coveragePercent, accuracyPercent: summary.accuracyPercent,
    practicedSubskills: practiced.length, totalSubskills: stats.length,
    reason: hasSevereWeakness
      ? 'At least one practiced subskill is below 50% accuracy; target that weakness before the scored assessment.'
      : 'Increase practice coverage and accuracy before the scored assessment.',
  };
};

export const findWeakestReferenceSubskill = (
  content: AlgebraReferenceTopicContent,
  evidence: ReferencePracticeEvidence
): ReferenceSubskillStat | undefined => {
  const stats = getReferenceSubskillStats(content, evidence);
  if (!stats.length) return undefined;
  return [...stats].sort((a, b) => {
    const aScore = a.accuracyPercent == null ? -1 : a.accuracyPercent;
    const bScore = b.accuracyPercent == null ? -1 : b.accuracyPercent;
    if (aScore !== bScore) return aScore - bScore;
    if (a.coveragePercent !== b.coveragePercent) return a.coveragePercent - b.coveragePercent;
    return a.subskill.localeCompare(b.subskill);
  })[0];
};

export const findTargetReferenceQuestionIndex = (
  content: AlgebraReferenceTopicContent,
  evidence: ReferencePracticeEvidence,
  preferredSubskill?: string,
  misconceptionId?: string
): number => {
  if (!content.practiceQuestions.length) return 0;

  const candidates = content.practiceQuestions
    .map((question, index) => ({ question, index, evidence: evidence.questions[question.id] }))
    .filter(({ question }) => !preferredSubskill || canonicalSkillName(content.canonicalTopicId, question.subskill) === preferredSubskill)
    .filter(({ question }) => !misconceptionId || question.misconceptionId === misconceptionId);

  const pool = candidates.length ? candidates : content.practiceQuestions.map((question, index) => ({ question, index, evidence: evidence.questions[question.id] }));
  const unattempted = pool.find((item) => !item.evidence?.attempts);
  if (unattempted) return unattempted.index;

  return [...pool].sort((a, b) => {
    const aRate = a.evidence?.attempts ? a.evidence.correct / a.evidence.attempts : 0;
    const bRate = b.evidence?.attempts ? b.evidence.correct / b.evidence.attempts : 0;
    if (aRate !== bRate) return aRate - bRate;
    return (a.evidence?.attempts ?? 0) - (b.evidence?.attempts ?? 0);
  })[0].index;
};
