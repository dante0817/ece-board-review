export type MasteryLevel = 1 | 2 | 3 | 4 | 5;

export type TopicStatusTier = 'NEEDS WORK' | 'DEVELOPING' | 'BOARD READY' | 'Not Started';

export type StatusMarker = '⚠' | '↗' | '✓' | '⏱' | '—';

export type ErrorCategory = 
  | 'Formula recall' 
  | 'Sign / algebra errors' 
  | 'Wrong method' 
  | 'Question misreading' 
  | 'Speed / calculation slip';

export type ReviewActivityType = 
  | 'Practice Problems' 
  | 'Timed Board Quiz' 
  | 'Formula & Concept Drill' 
  | 'Past Board Exam Questions' 
  | 'Error Log Remediation';

export interface TopicActivityLog {
  id: string;
  date: string; // YYYY-MM-DD or readable
  type: string;
  score: number; // 0 - 100
  questionsAttempted: number;
  questionsCorrect: number;
  timeSpentMinutes: number;
  usedNotes: 'No' | 'Occasionally' | 'Frequently';
  difficulty: 'Easy' | 'Normal' | 'Difficult';
  notes?: string;
  confidenceScore?: number; // 1-5 Self-assessment Confidence score
  confidenceVsPerformanceDelta?: number; // Actual Score % minus (Confidence * 20)%
}

export interface Topic {
  id: string;
  subjectId: string;
  groupId: string;
  name: string;
  initialCovered: boolean; // Only field directly editable in spreadsheet table
  reviewCount: number;
  mastery: MasteryLevel | null; // 1-5 or null
  latestScore: number | null;
  bestScore: number | null;
  averageScore: number | null;
  latestConfidence?: number | null; // 1-5 self-assessed confidence
  lastReviewDate: string | null; // ISO string or YYYY-MM-DD
  nextReviewDate: string | null; // ISO string or YYYY-MM-DD
  isHighPriority: boolean;
  boardRelevance: 'High' | 'Medium' | 'Standard';
  priorityLevel?: 'Critical' | 'High' | 'Foundation';
  skillsCovered?: string[];
  canonicalIndex?: number;
  whyWeakReasons?: string[];
  recommendationNote?: string;
  activityHistory: TopicActivityLog[];
  /** Verified is reserved for sufficient independent assessment evidence. */
  evidenceStatus?: 'unassessed'|'legacy'|'manual'|'practice'|'verified';
  easeFactor?: number; // SM-2 ease factor (e.g. 2.5, min 1.3, max 2.8)
  intervalDays?: number; // Scheduled interval in days
  repetitions?: number; // Consecutive successful retention review count
  lastReviewQuality?: number; // Last performance recall grade (0-5)
  retentionStrengthPercent?: number; // Estimated memory retention based on forgetting curve
  isFlaggedForReview?: boolean; // Flagged by Spaced Repetition Algorithm
  flagReason?: string; // Reason for automatic review flagging
  urgencyLevel?: 'critical' | 'high' | 'moderate';
  urgencyScore?: number;
}

export type SpacedFlagReason =
  | 'Overdue Spaced Interval'
  | 'Due Today'
  | 'Retention Decay'
  | 'Performance Lapse'
  | 'Unresolved Error Trap'
  | 'Initial Retention Check';

export interface DailyStudyQueueItem {
  topic: Topic;
  subjectName: string;
  subjectCategory: 'Mathematics' | 'Electronics' | 'Communications' | 'GEAS';
  urgencyScore: number;
  urgencyLevel: 'critical' | 'high' | 'moderate';
  flagReason: SpacedFlagReason;
  detailedRationale: string[];
  daysSinceLastReview: number;
  daysOverdue: number; // >0 means overdue, 0 means due today, <0 means days until due
  estimatedRetentionPercent: number;
  recommendedAction: string;
  suggestedQuestionCount: number;
  suggestedDurationMinutes: number;
  lastPerformanceSummary: string;
}

export interface TopicGroup {
  id: string;
  subjectId: string;
  name: string;
  topics: Topic[];
}

export interface SubjectReadiness {
  initialCoveragePercent: number;
  topicsBelowLevel3: number;
  highPriorityAvgMastery: number;
  latestMixedTestScore: number | null;
  timedBoardAccuracy: number | null;
  overdueCount: number;
  isReadyForMaintenance: boolean;
}

export interface Subject {
  id: string;
  category: 'Mathematics' | 'Electronics' | 'Communications' | 'GEAS';
  name: string;
  shortCode: string;
  description: string;
  boardWeightPercent: number;
  boardTarget: number; // e.g. 90%
  isCurrentFocus: boolean;
  inMaintenance: boolean;
  groups: TopicGroup[];
}

export interface TestRecord {
  id: string;
  subjectId: string;
  testType: string;
  date: string;
  questions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  timeMinutes: number;
  topicIds: string[];
  scorePercent: number;
  notes?: string;
  /** Explicit provenance: pre-v10.9 records cannot be promoted to verified evidence. */
  provenance?: 'automatic' | 'manual' | 'legacy';
  assessmentMode?: 'practice' | 'timed' | 'manual' | 'study' | 'strict';
  attemptId?: string;
  assistanceUsed?: boolean;
  pausedSeconds?: number;
  startedAt?: string;
  curriculumVersion?: string;
  selfAttested?: boolean;
  scope?: 'topic' | 'subject' | 'mixed' | 'legacy';
  /** Area weights and shortages are descriptive, never proof of exam representativeness. */
  examBlueprint?: { id: string; requestedQuestions: number; deliveredQuestions: number; missingQuestions: number; quotaComplete: boolean; boardRepresentative: false };
  examAreaResults?: Array<{areaId: string; name: string; weightPercent: number; requestedQuestions: number; availableQuestions: number; questions: number; correct: number; incorrect: number; unanswered: number; scorePercent: number | null}>;
  /** Provisional PRC course mapping on TOS-targeted practice; not validated mastery. */
  tosCourseResults?: Array<{courseId:string;areaId:string;name:string;requested:number;questions:number;correct:number;scorePercent:number|null}>;
  itemResults?: Array<{
    questionId: string;
    topicId: string;
    subjectId: string;
    selectedOptionId: string | null;
    correctOptionId: string;
    optionOrder?: string[];
    questionFamilyId?: string;
    /** Provisional PRC Annex A course assignment, present on TOS-targeted practice only. */
    tosCourseId?: string;
    skillId?: string;
    examAreaId?: string;
  }>;
}

export interface ErrorNote {
  id: string;
  timestamp: number;
  timeString: string;
  sessionElapsedTime?: string;
  text: string;
  type: 'observation' | 'question' | 'mistake';
}

export interface ReviewError {
  id: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  category: ErrorCategory;
  description: string;
  lastOccurred: string;
  isResolved: boolean;
  solutionOrKeyFormula?: string;
  occurrenceCount: number;
  misconceptionTag?: string; // Optional reference-informed misconception taxonomy tag
  notes?: ErrorNote[];
}

export interface DailyTarget {
  targetSessions: number;
  targetQuestions: number;
  completedSessionsToday: number;
  completedQuestionsToday: number;
  targetMinutes?: number;
  completedMinutesToday?: number;
  targetMasteredProblems?: number;
  completedMasteredProblemsToday?: number;
  targetMasteredTopics?: number;
  completedMasteredTopicsToday?: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserProfile {
  name: string;
  examName: string;
  targetExamDate: string;
  targetExamDateEnd?: string;
  targetExamDisplay?: string;
  dailyTargetSessions: number;
  dailyTargetQuestions: number;
  dailyTargetMinutes?: number;
  dailyTargetMasteredProblems?: number;
  dailyTargetMasteredTopics?: number;
  theme?: ThemeMode;
  /** Pilot device profile; all published model-specific techniques currently target Canon F-789SGA. */
  calculatorModel?: 'Canon F-789SGA';
}

export interface ActiveSession {
  topic: Topic;
  activityType: string;
  startedAt: number;
  isPaused?: boolean;
  pausedAccumulatedMs?: number;
  lastPausedAt?: number | null;
  scratchpad?: string;
  confidenceScore?: number; // 1-5 pre-session or active self-assessed confidence
}

export type PomodoroPhase = 'work' | 'rest';

export interface PomodoroState {
  enabled: boolean;
  phase: PomodoroPhase;
  workMinutes: number; // default 25
  restMinutes: number; // default 5
  secondsLeft: number;
  completedCycles: number;
  autoSwitch: boolean;
  soundEnabled: boolean;
  isRunning?: boolean;
  totalStudySeconds?: number;
  activeSubjectId?: string;
  activeSubjectName?: string;
}

export interface PomodoroNotification {
  id: string;
  title: string;
  message: string;
  phase: PomodoroPhase;
  timestamp: number;
}

export interface DeepFocusState {
  isActive: boolean;
  durationMinutes: number;
  secondsLeft: number;
  lockedScreen: string; // ScreenType
  startedAt: number;
  expiresAt: number;
  silencedCount: number;
}

export interface SilencedNotification {
  id: string;
  title: string;
  message: string;
  category: 'routine-reminder' | 'study-queue' | 'spaced-repetition' | 'pomodoro' | 'system';
  timestamp: number;
}

export interface BlockedNavigationAttempt {
  targetScreen: string;
  currentScreen: string;
  timestamp: number;
  secondsRemaining: number;
}

export interface Flashcard {
  id: string;
  topicId: string;
  topicName: string;
  front: string; // Question or concept prompt
  back: string; // Solution, definition, derivation or core answer
  keyFormulaOrConcept: string; // Short formula or key rule
  boardExamTip: string; // Mnemonic or exam trap warning
  difficulty: 'Easy' | 'Medium' | 'Hard';
  knownStatus?: 'learning' | 'mastered' | null;
}

export interface ErrorFlashcard extends Flashcard {
  errorId?: string;
  errorCategory?: ErrorCategory;
  originalMistake?: string;
  remedyRule?: string;
  activeRecallCue?: string;
  counterExampleOrCheck?: string;
}

export interface FlashcardGenerationOptions {
  count: number;
  focusArea: 'formulas' | 'traps' | 'concepts' | 'mixed';
  material?: string;
  subjectName?: string;
}

export interface ErrorFlashcardGenerationOptions {
  count?: number;
  focusStyle?: 'targeted-remediation' | 'trap-inversion' | 'formula-drill' | 'board-exam-scenario' | 'mixed';
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'mixed';
}

export interface MockExamQuestion {
  /** Authored/generator-bound values; never parsed from the visible question statement. */
  calculatorInputs?: import('./domain/calculator/familyTechniques').CalculatorInputBinding;
  id: string;
  /** Distinct reasoning family; numeric variants are not new competency families. */
  questionFamilyId?: string;
  contentOrigin?: 'original-v10.14' | 'original-v10.16';
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  question: string;
  options: {
    id: string; // 'A' | 'B' | 'C' | 'D'
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  keyFormula?: string;
  boardTip?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface MockExamConfig {
  presetName: string;
  subjectId: string; // 'all' or specific subject id
  questionCount: number;
  durationMinutes: number;
  passingScorePercent: number;
}

export type ChatModelType = 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  model?: ChatModelType;
  roleTitle?: string;
  isFallback?: boolean;
  isError?: boolean;
}

export interface ChatRolePreset {
  id: string;
  name: string;
  badgeLabel: string;
  description: string;
  recommendedModel: ChatModelType;
  taskCategory: 'complex' | 'general' | 'fast';
  systemInstruction: string;
  suggestedPrompts: string[];
}

export interface WeakSpotQuizSubjectBreakdown {
  subjectId: string;
  subjectName: string;
  category: 'Mathematics' | 'Electronics' | 'Communications' | 'GEAS';
  errorCount: number;
  occurrenceTotal: number;
  errorFrequencyPercent: number;
  topErrorCategories: { category: string; count: number }[];
  topWeakTopics: { topicId: string; topicName: string; count: number }[];
  allocatedQuestionCount: number;
}

export interface WeakSpotQuizQuestion extends MockExamQuestion {
  sourceErrorId?: string;
  weaknessRationale: string;
  targetedErrorCategory: string;
  keyFormulaReminder?: string;
  pitfallWarning?: string;
}

export interface CustomWeakSpotQuiz {
  id: string;
  title: string;
  createdAt: string;
  totalQuestions: number;
  targetDurationMinutes: number;
  dominantSubjectId: string;
  dominantSubjectName: string;
  dominantSubjectErrorPercent: number;
  subjectBreakdown: WeakSpotQuizSubjectBreakdown[];
  questions: WeakSpotQuizQuestion[];
  diagnosticExecutiveSummary: string;
  recommendedFocusTips: string[];
}

export interface WeakSpotQuizOptions {
  questionCount?: number;
  includeResolved?: boolean;
  targetSubjectId?: string; // If specified, filters specifically to that subject; otherwise targets highest error frequency subjects
  focusErrorCategory?: string;
}

export type {
  ForgettingCurveUrgency,
  ForgettingCurveLogAnalysis,
  DailyForgettingCurveSuggestion,
  DailyForgettingCurveOverview,
  CurvePoint,
} from './utils/forgettingCurveAlgorithm';

export interface DayStudyActivitySummary {
  date: string;
  isQueueCompleted: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  totalMinutes: number;
  totalQuestions: number;
  correctQuestions: number;
  averageScore: number | null;
  reviewedTopics: Array<{
    id: string;
    topicId: string;
    topicName: string;
    subjectId: string;
    type: string;
    score: number;
    minutes: number;
    questionsAttempted: number;
    questionsCorrect: number;
  }>;
  mockTests: Array<{
    id: string;
    title: string;
    score: number;
    minutes: number;
    questions: number;
    correct: number;
  }>;
  scheduledTopics: Array<{
    id: string;
    name: string;
    subjectId: string;
    urgencyLevel?: 'critical' | 'high' | 'moderate';
    isHighPriority?: boolean;
    mastery?: number | null;
  }>;
}

export interface ConsistencyStreakMetrics {
  currentStreakDays: number;
  longestStreakDays: number;
  totalCompletedDays: number;
  monthCompletionRatePercent: number;
  completedThisMonth: number;
  totalStudyDaysThisMonth: number;
  totalHoursThisMonth: number;
}

