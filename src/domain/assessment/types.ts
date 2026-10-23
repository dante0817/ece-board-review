/** Canonical immutable choice IDs refer to authored answers, never display positions. */
export interface Choice { id: string; text: string }
export interface AssessmentItem {
  questionId: string;
  questionFamilyId?: string;
  topicId: string;
  subjectId: string;
  skillId?: string;
  examAreaId?: string;
  correctOptionId: string;
  options: Choice[];
  preserveOptionOrder?: boolean;
}
export type AttemptCondition = 'study' | 'strict';
export interface AttemptConditions {
  attemptId: string;
  condition: AttemptCondition;
  assistanceUsed: boolean;
  pausedSeconds: number;
  startedAt: string;
  curriculumVersion: string;
  /** The client cannot independently prove uninterrupted or unaided conditions. */
  selfAttested?: boolean;
}
export interface CanonicalItemResult {
  questionId: string;
  questionFamilyId?: string;
  topicId: string;
  subjectId: string;
  skillId?: string;
  examAreaId?: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  optionOrder: string[];
}
