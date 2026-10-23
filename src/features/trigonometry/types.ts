import type { LessonStatus } from '../../domain/learn/lessonTypes';

export type LearningStatus = {
  read1: boolean;
  read2: boolean;
  read3: boolean;
  mastered: boolean;
  review: boolean;
};
export type StatusField = keyof LearningStatus;
export type CurriculumGroup = { id: string; name: string; short: string; tagline: string; tone: string; symbol: string };
export type CurriculumSubtopic = { id: string; number: string; title: string; prerequisiteIds: string[] };
export type CurriculumTopic = {
  id: string; number: string; group: string; title: string; symbol: string;
  summary: string; references: string; formula: string; note: string;
  optional: boolean; subtopics: CurriculumSubtopic[];
};
export type TrigBinding = {
  // Explicit mapping to actual existing ids. Never assume number/title equivalence.
  lessonId?: string;
  questionIds?: string[];
  // True when the production reader genuinely has this lesson.
  lessonAvailable?: boolean;
  lessonStatus?: LessonStatus;
  // True when the production question engine genuinely has suitable questions.
  practiceAvailable?: boolean;
};
export type TrigBindingMap = Record<string, TrigBinding>;
export type ProgressSnapshot = Record<string, LearningStatus>;
export type AppNavigateTarget =
  | { kind: 'learn'; subtopicId: string; lessonId: string }
  | { kind: 'practice'; subtopicId: string; questionIds: string[] }
  | { kind: 'mistakes'; subtopicId?: string }
  | { kind: 'progress' };
export type TrigIntegration = {
  // Returned ids MUST be stable new subtopic ids, mapped from old records by host.
  readProgress(): ProgressSnapshot | Promise<ProgressSnapshot>;
  // Persist first. Reject on failure so UI can roll back and show error.
  saveProgress(subtopicId: string, nextStatus: LearningStatus): Promise<void> | void;
  navigate(target: AppNavigateTarget): void;
  bindings: TrigBindingMap;
};
