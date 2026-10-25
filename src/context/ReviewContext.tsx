import { TopicLaunchIntent } from '../domain/learn/lessonTypes';
import { LEARN_READER_STORAGE_KEY } from '../domain/learn/readerProgress';
import { MANUAL_LEARN_STORAGE_KEY, MANUAL_LEARN_CHANGED_EVENT } from '../domain/learn/manualLearnTracking';
import { areaResultsMatchRecord } from '../domain/exam/boardBlueprint';
import { tosResultsMatchRecord } from '../domain/exam/tosCoverage';
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Subject,
  Topic,
  TestRecord,
  ReviewError,
  DailyTarget,
  UserProfile,
  SubjectReadiness,
  MasteryLevel,
  ActiveSession,
  PomodoroPhase,
  PomodoroState,
  PomodoroNotification,
  ThemeMode,
  DeepFocusState,
  SilencedNotification,
  BlockedNavigationAttempt,
  ErrorNote,
  ErrorCategory,
} from '../types';
import {
  INITIAL_SUBJECTS,
  INITIAL_TEST_RECORDS,
  INITIAL_ERRORS,
  INITIAL_DAILY_TARGET,
  INITIAL_USER_PROFILE,
} from '../data/initialData';
import { calculateMasteryRecommendation } from '../utils/masteryCalculator';
import { createCleanSubjects } from '../utils/learnerData';
import { migrateLearnerV109, DATA_MODE_KEY } from '../utils/learnerMigration';
import { gradeItems, topicResults, validateAggregate, getSubjectReadiness } from '../utils/assessmentIntegrity';
import { calculateRecommendedTarget, RecommendedTargetResult } from '../utils/targetCalculator';
import {
  calculateSpacedRepetitionSchedule,
  buildPrioritizedDailyStudyQueue,
  evaluateTopicSpacedRepetitionFlag,
} from '../utils/spacedRepetition';
import {
  DailyStudyQueueItem,
  SpacedFlagReason,
  CustomWeakSpotQuiz,
  WeakSpotQuizOptions,
} from '../types';
import { generateWeakSpotQuizFromErrors } from '../utils/weakSpotQuizGenerator';
import {
  generateDailyForgettingCurveContent,
  DailyForgettingCurveOverview,
  DailyForgettingCurveSuggestion,
} from '../utils/forgettingCurveAlgorithm';
import { playPomodoroChime, playDeepFocusChime } from '../utils/soundEffects';
import { recordRecentTopicId } from '../utils/recentTopics';
import { getLocalDateKey } from '../utils/date';
import {INACTIVE_ASSESSMENT, startAssessment, finishAssessment, strictAssessmentLocked, canAccessAid, type AssessmentSession, type InstructionalAid} from '../domain/assessment/assessmentAccess';
import {appendAidEvent, type AidDisclosureEvent} from '../domain/assessment/aidEvidence';
import { DEFAULT_LEARNING_PATH, LEARNING_PATH_KEY, isLearningPath, type LearningPath } from '../domain/learning/learningPaths';
import {
  migrateSubjectsToCurrentCurriculum,
  migrateTestRecordsToCurrentCurriculum,
  migrateErrorsToCurrentCurriculum,
} from '../utils/curriculumMigration';
import {
  QUICK_SHEET_FORMULAS,
  FORMULA_QUICK_SHEET_CATEGORIES,
  INITIAL_MEMORIZED_FORMULA_IDS,
} from '../data/formulaQuickSheetData';

export type ScreenType =
  | 'mathematics'
  | 'algebra'
  | 'trigonometry'
  | 'geometry'
  | 'plane-geometry'
  | 'analytic-geometry'
  | 'probability-statistics'
  | 'differential-equations'
  | 'differential-calculus'
  | 'integral-calculus'
  | 'solid-mensuration'
  | 'real-numbers'
  | 'rational-expressions'
  | 'linear-equations'
  | 'quadratic-equations'
  | 'functions'
  | 'factoring'
  | 'polynomials'
  | 'exponents-radicals'
  | 'inequalities'
  | 'absolute-value'
  | 'rational-radical-equations'
  | 'exponential-logarithmic'
  | 'systems-equations'
  | 'complex-numbers'
  | 'arithmetic-progressions'
  | 'geometric-progressions'
  | 'binomial-theorem'
  | 'matrices'
  | 'partial-fractions'
  | 'word-problems'
  | 'inverse-functions'
  | 'polynomial-functions'
  | 'rational-functions'
  | 'harmonic-progressions'
  | 'order-of-operations'
  | 'algebraic-terms'
  | 'ratios-proportions'
  | 'scientific-notation'
  | 'today'
  | 'overview'
  | 'subjects'
  | 'tests'
  | 'errors'
  | 'progress'
  | 'queue'
  | 'practice'
  | 'calculator-skills'
  | 'mock-exams'
  | 'readiness'
  | 'geas'
  | 'electronics'
  | 'est'
  | 'formula-flashcard'
  | 'chat';

export interface ReviewCompletionSummary {
  topicId: string;
  topicName: string;
  subjectId: string;
  activityType: string;
  scorePercent: number;
  questionsAttempted: number;
  questionsCorrect: number;
  timeSpentMinutes: number;
  previousMastery: MasteryLevel | null;
  newMastery: MasteryLevel;
  nextReviewDate: string;
}

interface ReviewContextType {
  assessmentSession:AssessmentSession;
  beginAssessment:(attemptId:string,mode:'study'|'strict')=>void;
  finalizeAssessment:(reason:'submitted'|'timeout')=>void;
  interruptAssessment:()=>void;
  canAccessInstruction:(aid:InstructionalAid)=>boolean;
  recordAidDisclosure:(event:AidDisclosureEvent)=>void;
  learningPath: LearningPath;
  setLearningPath: (path: LearningPath) => void;
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  topicLaunchIntent: TopicLaunchIntent | null;
  navigateToReferenceTopic: (screen: ScreenType, intent: Omit<TopicLaunchIntent,'nonce'>) => void;
  clearTopicLaunchIntent: () => void;
  isLearnReaderActive: boolean;
  setIsLearnReaderActive: (active:boolean) => void;
  selectedMathModuleId: string;
  setSelectedMathModuleId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSubjectId: string;
  setSelectedSubjectId: (id: string) => void;
  selectedTopic: Topic | null;
  setSelectedTopic: (topic: Topic | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  openTopicDrawer: (topic: Topic) => void;
  closeTopicDrawer: () => void;
  
  // Theme state & controls
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  isDarkMode: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Focus mode state
  isFocusMode: boolean;
  setIsFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleFocusMode: () => void;
  isSessionModalMinimized: boolean;
  setIsSessionModalMinimized: React.Dispatch<React.SetStateAction<boolean>>;

  // Deep Focus Mode State & Controls
  deepFocus: DeepFocusState;
  isDeepFocusActive: boolean;
  deepFocusTimeRemaining: number;
  startDeepFocus: (durationMinutes?: number) => void;
  stopDeepFocus: () => void;
  extendDeepFocus: (extraMinutes: number) => void;
  toggleDeepFocus: () => void;
  isDeepFocusModalOpen: boolean;
  setIsDeepFocusModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openDeepFocusModal: () => void;
  closeDeepFocusModal: () => void;
  blockedNavigationAttempt: BlockedNavigationAttempt | null;
  dismissBlockedNavigation: () => void;
  unlockAndNavigateScreen: (targetScreen: ScreenType) => void;
  silencedNotifications: SilencedNotification[];
  clearSilencedNotifications: () => void;
  postNotification: (notif: {
    title: string;
    message: string;
    category?: SilencedNotification['category'];
    essential?: boolean;
  }) => boolean;

  // Active review session state
  activeSession: ActiveSession | null;
  activeSessionSeconds: number;
  isSessionRunning: boolean;
  pauseActiveSession: () => void;
  resumeActiveSession: () => void;
  updateActiveSessionScratchpad: (scratchpad: string) => void;
  updateActiveSessionConfidence: (confidence: number) => void;
  startReview: (topic: Topic, activityType?: string) => void;
  cancelReview: () => void;
  endReviewToModal: () => void;
  isEndModalOpen: boolean;
  setIsEndModalOpen: (open: boolean) => void;
  reviewCompletionSummary: ReviewCompletionSummary | null;
  dismissReviewCompletion: () => void;
  completeReview: (payload: {
    topicId: string;
    questionsAttempted: number;
    questionsCorrect: number;
    timeSpentMinutes: number;
    usedNotes: 'No' | 'Occasionally' | 'Frequently';
    difficulty: 'Easy' | 'Normal' | 'Difficult';
    independenceRating: number;
    newMastery: MasteryLevel;
    nextReviewDate: string;
    notes?: string;
    confidenceScore?: number;
  }) => void;

  // Pomodoro timer state & controls
  pomodoro: PomodoroState;
  togglePomodoro: () => void;
  startPomodoroTimer: () => void;
  pausePomodoroTimer: () => void;
  setPomodoroCyclePreset: (workMins: number, restMins: number) => void;
  setPomodoroWorkMinutes: (mins: number) => void;
  setPomodoroRestMinutes: (mins: number) => void;
  switchPomodoroPhase: (targetPhase?: PomodoroPhase) => void;
  resetPomodoroPhaseTimer: () => void;
  togglePomodoroSound: () => void;
  togglePomodoroAutoSwitch: () => void;
  logStudyDurationMinutes: (minutes: number) => void;
  startDeepStudySubject: (subjectId: string, durationMinutes?: number) => void;
  pomodoroNotification: PomodoroNotification | null;
  dismissPomodoroNotification: () => void;
  isPomodoroModalOpen: boolean;
  setIsPomodoroModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openPomodoroModal: () => void;

  // Data collections
  subjects: Subject[];
  testRecords: TestRecord[];
  errors: ReviewError[];
  dailyTarget: DailyTarget;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setDailyTarget: React.Dispatch<React.SetStateAction<DailyTarget>>;

  // Data mutators
  toggleTopicInitialCovered: (topicId: string) => void;
  addTestRecord: (test: Omit<TestRecord, 'id' | 'scorePercent'>) => void;
  addReviewError: (err: {
    topicId: string;
    topicName: string;
    subjectId: string;
    category: ReviewError['category'];
    description: string;
    solutionOrKeyFormula?: string;
  }) => void;
  appendQuickNoteToErrorLog: (params: {
    topicId: string;
    topicName: string;
    subjectId: string;
    text: string;
    type?: 'observation' | 'question' | 'mistake';
    targetErrorId?: string;
    category?: ReviewError['category'];
    solutionOrKeyFormula?: string;
    sessionElapsedTime?: string;
  }) => { note: ErrorNote; errorId: string; isNewError: boolean };
  deleteErrorNote: (errorId: string, noteId: string) => void;
  toggleErrorResolved: (errorId: string) => void;
  markSubjectMaintenance: (subjectId: string, inMaintenance: boolean) => void;
  resetAllData: () => void;
  reseedDemoData: () => void;

  // Modals
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isRecordTestModalOpen: boolean;
  setIsRecordTestModalOpen: (open: boolean) => void;
  testModalPreselectedTopicId: string | null;
  openRecordTestForTopic: (topicId?: string) => void;
  isVoiceModalOpen: boolean;
  setIsVoiceModalOpen: (open: boolean) => void;
  voiceModalInitialTopic: string | null;
  openVoiceConversation: (topicName?: string) => void;
  closeVoiceConversation: () => void;
  isAddErrorModalOpen: boolean;
  setIsAddErrorModalOpen: (open: boolean) => void;
  addErrorDefaultTopicId: string | null;
  openAddErrorModal: (topicId?: string) => void;
  closeAddErrorModal: () => void;
  isChatDrawerOpen: boolean;
  setIsChatDrawerOpen: (open: boolean) => void;
  chatInitialPrompt: string | null;
  chatInitialRole: string | null;
  openChat: (prompt?: string, roleId?: string) => void;
  closeChatDrawer: () => void;

  // Target & Pacing
  recommendedTarget: RecommendedTargetResult;
  applyRecommendedTarget: () => void;
  incrementDailyQuestions: (amount: number) => void;
  incrementDailySessions: (amount: number) => void;
  incrementDailyMinutes: (amount: number) => void;
  setDailyTargetMinutes: (minutes: number) => void;
  incrementDailyMasteredProblems: (amount: number) => void;
  setDailyTargetMasteredProblems: (target: number) => void;
  incrementDailyMasteredTopics: (amount: number) => void;
  setDailyTargetMasteredTopics: (target: number) => void;
  totalMinutesStudiedToday: number;

  // Computed properties
  currentDateStr: string;
  currentSubject: Subject;
  allTopics: Topic[];
  priorityReviewTopic: Topic | null;
  nextReviewQueue: Topic[];
  dueTodayTopics: Topic[];
  overdueTopics: Topic[];
  allDueOrOverdueTopics: Topic[];
  scheduleTopicSpacedReview: (
    topicId: string,
    performance: {
      accuracyPercent: number;
      usedNotes?: 'No' | 'Occasionally' | 'Frequently';
      difficulty?: 'Easy' | 'Normal' | 'Difficult';
      independenceRating?: number;
    }
  ) => void;
  algebraReadiness: SubjectReadiness;
  algebraCoveragePercent: number;
  algebraMasteryPercent: number;

  // Spaced Repetition Auto-Flagging & Prioritized Daily Study Queue
  dailyStudyQueue: DailyStudyQueueItem[];
  flaggedTopicsCount: number;
  criticalFlaggedCount: number;
  autoFlagTopicsForReview: () => void;
  runSpacedRepetitionAudit: () => {
    totalEvaluated: number;
    flaggedCount: number;
    criticalCount: number;
    highUrgencyCount: number;
    moderateUrgencyCount: number;
    averageRetentionPercent: number;
    topUrgentTopicName: string | null;
  };
  completeSpacedReview: (
    topicId: string,
    performance: {
      accuracyPercent: number;
      questionsAttempted: number;
      questionsCorrect: number;
      timeSpentMinutes?: number;
      difficulty?: 'Easy' | 'Normal' | 'Difficult';
      usedNotes?: 'No' | 'Occasionally' | 'Frequently';
      independenceRating?: number;
      confidenceScore?: number;
      notes?: string;
    }
  ) => void;

  // Forgetting Curve Spaced Repetition
  forgettingCurveThreshold: number;
  setForgettingCurveThreshold: (threshold: number) => void;
  dailyForgettingCurveOverview: DailyForgettingCurveOverview;
  startForgettingCurveReview: (suggestion: DailyForgettingCurveSuggestion) => void;

  // Weak Spot Quiz Generator (Error Log Driven)
  generateWeakSpotQuiz: (options?: WeakSpotQuizOptions) => CustomWeakSpotQuiz;
  activeWeakSpotQuiz: CustomWeakSpotQuiz | null;
  startWeakSpotQuiz: (optionsOrQuiz?: WeakSpotQuizOptions | CustomWeakSpotQuiz) => void;
  closeWeakSpotQuiz: () => void;

  // Formula Quick-Sheet Memorization Tracking
  memorizedFormulaIds: string[];
  toggleFormulaMemorized: (formulaId: string) => void;
  isFormulaMemorized: (formulaId: string) => boolean;
  setFormulaMemorized: (formulaId: string, memorized: boolean) => void;
  resetMemorizedFormulas: () => void;
  memorizeAllFormulas: () => void;
  formulaMemorizationStats: FormulaMemorizationStats;
  isFormulaQuickSheetOpen: boolean;
  setIsFormulaQuickSheetOpen: (open: boolean) => void;
  formulaQuickSheetInitialMode: 'cards' | 'dense' | 'practice';
  formulaQuickSheetInitialCategory: string;
  openFormulaQuickSheet: (initialMode?: 'cards' | 'dense' | 'practice', initialCategory?: string) => void;
  closeFormulaQuickSheet: () => void;
  flashcardSelectedSubject: 'all' | 'mathematics' | 'geas' | 'electronics' | 'est';
  setFlashcardSelectedSubject: (subj: 'all' | 'mathematics' | 'geas' | 'electronics' | 'est') => void;
  openFormulaFlashcards: (subject?: 'all' | 'mathematics' | 'geas' | 'electronics' | 'est') => void;
}

export interface FormulaCategoryProgress {
  categoryId: string;
  categoryLabel: string;
  total: number;
  memorized: number;
  percent: number;
}

export interface FormulaMemorizationStats {
  total: number;
  memorized: number;
  unmemorized: number;
  percent: number;
  byCategory: FormulaCategoryProgress[];
}

const STORAGE_KEYS = {
  SUBJECTS: 'ece_board_review_subjects_v4',
  TESTS: 'ece_board_review_tests_v3',
  ERRORS: 'ece_board_review_errors_v3',
  DAILY: 'ece_board_review_daily_v3',
  DAILY_DATE: 'ece_board_review_daily_date_v1',
  PROFILE: 'ece_board_review_profile_v3',
  MEMORIZED_FORMULAS: 'ece_board_memorized_formulas_v1',
};

const migrationStatus = typeof window !== 'undefined' ? migrateLearnerV109(window.localStorage) : 'fresh';
if (migrationStatus === 'blocked') {
  throw new Error('Cannot safely migrate saved learner data. Export localStorage before continuing; no records were intentionally erased.');
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => getLocalDateKey());

  // Navigation
  const [learningPath, setLearningPathState] = useState<LearningPath>(() => {
    try {
      const saved = typeof window === 'undefined' ? null : window.localStorage.getItem(LEARNING_PATH_KEY);
      return isLearningPath(saved) ? saved : DEFAULT_LEARNING_PATH;
    } catch { return DEFAULT_LEARNING_PATH; }
  });
  const setLearningPath = useCallback((path: LearningPath) => {
    if (isLearningPath(path)) setLearningPathState(path);
  }, []);
  useEffect(() => {
    try { window.localStorage.setItem(LEARNING_PATH_KEY, learningPath); } catch { /* Storage may be disabled. */ }
  }, [learningPath]);
  const [currentScreen, setCurrentScreenRaw] = useState<ScreenType>('today');
  const [topicLaunchIntent,setTopicLaunchIntent]=useState<TopicLaunchIntent|null>(null);
  const [isLearnReaderActive,setIsLearnReaderActive]=useState(false);
  const [assessmentSession,setAssessmentSession]=useState<AssessmentSession>(INACTIVE_ASSESSMENT);
  const assessmentRef=useRef<AssessmentSession>(INACTIVE_ASSESSMENT);
  const canAccessInstruction=useCallback((aid:InstructionalAid)=>canAccessAid(assessmentRef.current,aid),[]);
  const beginAssessment=useCallback((id:string,mode:'study'|'strict')=>{
    const next=startAssessment(assessmentRef.current,id,mode,new Date().toISOString());
    assessmentRef.current=next;
    setAssessmentSession(next);
    // Close already open instructional overlays BEFORE any strict questions are displayed.
    if(mode==='strict'){
      setIsChatDrawerOpen(false);setIsVoiceModalOpen(false);setIsFormulaQuickSheetOpen(false);setIsDrawerOpen(false);
      setIsSettingsOpen(false);setIsAddErrorModalOpen(false);setIsRecordTestModalOpen(false);
    }
  },[]);
  const finishAssessmentState=useCallback((reason:'submitted'|'timeout'|'exited')=>{
    const next=finishAssessment(assessmentRef.current,reason,new Date().toISOString());
    assessmentRef.current=next;setAssessmentSession(next);
  },[]);
  const finalizeAssessment=useCallback((reason:'submitted'|'timeout')=>finishAssessmentState(reason),[finishAssessmentState]);
  const interruptAssessment=useCallback(()=>finishAssessmentState('exited'),[finishAssessmentState]);
  const recordAidDisclosure=useCallback((event:AidDisclosureEvent)=>{
    if(!canAccessAid(assessmentRef.current,'calculator'))return;
    // Pre-answer help is never quietly attributed to independent assessment.
    if(event.phase==='before-answer' && assessmentRef.current.status==='strict-active')return;
    try {appendAidEvent(localStorage,event);}catch(e){console.warn('Could not save assistance provenance',e);}
  },[]);
  const [selectedMathModuleId, setSelectedMathModuleId] = useState<string>('algebra');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('subj-math-algebra');

  // Deep Focus Mode State
  const [deepFocus, setDeepFocus] = useState<DeepFocusState>(() => {
    try {
      const saved = localStorage.getItem('ece_deep_focus_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        if (parsed.isActive && parsed.expiresAt > now) {
          return {
            ...parsed,
            secondsLeft: Math.max(0, Math.round((parsed.expiresAt - now) / 1000)),
          };
        }
      }
    } catch {
      // ignore
    }
    return {
      isActive: false,
      durationMinutes: 25,
      secondsLeft: 25 * 60,
      lockedScreen: 'rational-expressions',
      startedAt: 0,
      expiresAt: 0,
      silencedCount: 0,
    };
  });

  const [isDeepFocusModalOpen, setIsDeepFocusModalOpen] = useState<boolean>(false);
  const [blockedNavigationAttempt, setBlockedNavigationAttempt] = useState<BlockedNavigationAttempt | null>(null);
  const [silencedNotifications, setSilencedNotifications] = useState<SilencedNotification[]>([]);

  const openDeepFocusModal = useCallback(() => setIsDeepFocusModalOpen(true), []);
  const closeDeepFocusModal = useCallback(() => setIsDeepFocusModalOpen(false), []);
  const dismissBlockedNavigation = useCallback(() => setBlockedNavigationAttempt(null), []);
  const clearSilencedNotifications = useCallback(() => setSilencedNotifications([]), []);

  // Screen navigation with Deep Focus interception
  const setCurrentScreen = useCallback(
    (targetScreen: ScreenType) => {
      if (strictAssessmentLocked(assessmentRef.current) && targetScreen !== currentScreen) return;
      if (deepFocus.isActive && targetScreen !== currentScreen) {
        setBlockedNavigationAttempt({
          targetScreen,
          currentScreen,
          timestamp: Date.now(),
          secondsRemaining: deepFocus.secondsLeft,
        });
        playDeepFocusChime('locked-attempt');
        return;
      }
      setTopicLaunchIntent(null);
      setCurrentScreenRaw(targetScreen);
    },
    [deepFocus.isActive, deepFocus.secondsLeft, currentScreen]
  );

  const navigateToReferenceTopic=useCallback((targetScreen:ScreenType,intent:Omit<TopicLaunchIntent,'nonce'>)=>{
    if (strictAssessmentLocked(assessmentRef.current))return;
    if (deepFocus.isActive && targetScreen!==currentScreen){setCurrentScreen(targetScreen);return;}
    setTopicLaunchIntent({...intent,nonce:Date.now()+Math.random()});
    setCurrentScreenRaw(targetScreen);
  },[deepFocus.isActive,currentScreen,setCurrentScreen]);
  const clearTopicLaunchIntent=useCallback(()=>setTopicLaunchIntent(null),[]);

  // Allow explicit early exit & navigation if user confirms
  const unlockAndNavigateScreen = useCallback((targetScreen: ScreenType) => {
    if(strictAssessmentLocked(assessmentRef.current))return;
    setDeepFocus((prev) => {
      const updated: DeepFocusState = {
        ...prev,
        isActive: false,
        secondsLeft: 0,
      };
      try {
        localStorage.setItem('ece_deep_focus_state', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setBlockedNavigationAttempt(null);
    setCurrentScreenRaw(targetScreen);
    playDeepFocusChime('exit');
  }, []);

  const startDeepFocus = useCallback(
    (durationMinutes = 25) => {
      const mins = Math.max(1, durationMinutes);
      const now = Date.now();
      const expiresAt = now + mins * 60 * 1000;
      const newState: DeepFocusState = {
        isActive: true,
        durationMinutes: mins,
        secondsLeft: mins * 60,
        lockedScreen: currentScreen,
        startedAt: now,
        expiresAt,
        silencedCount: 0,
      };
      setDeepFocus(newState);
      setBlockedNavigationAttempt(null);
      try {
        localStorage.setItem('ece_deep_focus_state', JSON.stringify(newState));
      } catch {
        // ignore
      }
      playDeepFocusChime('activate');
    },
    [currentScreen]
  );

  const stopDeepFocus = useCallback(() => {
    setDeepFocus((prev) => {
      const updated: DeepFocusState = {
        ...prev,
        isActive: false,
        secondsLeft: 0,
      };
      try {
        localStorage.setItem('ece_deep_focus_state', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setBlockedNavigationAttempt(null);
    playDeepFocusChime('exit');
  }, []);

  const extendDeepFocus = useCallback((extraMinutes: number) => {
    setDeepFocus((prev) => {
      const addedSeconds = Math.max(1, extraMinutes) * 60;
      const newSeconds = prev.secondsLeft + addedSeconds;
      const newDuration = prev.durationMinutes + extraMinutes;
      const newExpiresAt = Date.now() + newSeconds * 1000;
      const updated: DeepFocusState = {
        ...prev,
        isActive: true,
        durationMinutes: newDuration,
        secondsLeft: newSeconds,
        expiresAt: newExpiresAt,
      };
      try {
        localStorage.setItem('ece_deep_focus_state', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const toggleDeepFocus = useCallback(() => {
    if (deepFocus.isActive) {
      stopDeepFocus();
    } else {
      startDeepFocus(deepFocus.durationMinutes || 25);
    }
  }, [deepFocus.isActive, deepFocus.durationMinutes, startDeepFocus, stopDeepFocus]);

  // Non-essential notification filtering
  const postNotification = useCallback(
    (notif: {
      title: string;
      message: string;
      category?: SilencedNotification['category'];
      essential?: boolean;
    }): boolean => {
      if (deepFocus.isActive && !notif.essential) {
        const silenced: SilencedNotification = {
          id: `silenced-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: notif.title,
          message: notif.message,
          category: notif.category || 'routine-reminder',
          timestamp: Date.now(),
        };
        setSilencedNotifications((prev) => [silenced, ...prev.slice(0, 19)]);
        setDeepFocus((prev) => ({
          ...prev,
          silencedCount: prev.silencedCount + 1,
        }));
        return false;
      }
      return true;
    },
    [deepFocus.isActive]
  );

  // Topic Drawer
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Focus Mode State
  const [isFocusMode, setIsFocusModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ece_focus_mode') === 'true';
    } catch {
      return false;
    }
  });

  const setIsFocusMode = useCallback((valOrFn: React.SetStateAction<boolean>) => {
    setIsFocusModeState((prev) => {
      const next = typeof valOrFn === 'function' ? (valOrFn as (p: boolean) => boolean)(prev) : valOrFn;
      try {
        localStorage.setItem('ece_focus_mode', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => !prev);
  }, [setIsFocusMode]);

  // Theme State ('light' | 'dark' | 'system')
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('ece_board_theme') as ThemeMode | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('ece_board_theme') as ThemeMode | null;
      if (stored === 'dark') return 'dark';
      if (stored === 'light') return 'light';
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  // Apply theme to document & listen to OS color scheme if in system mode
  useEffect(() => {
    const computeIsDark = (): boolean => {
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const isDark = computeIsDark();
    setResolvedTheme(isDark ? 'dark' : 'light');

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        const darkActive = mediaQuery.matches;
        setResolvedTheme(darkActive ? 'dark' : 'light');
        if (darkActive) {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
      } else if ((mediaQuery as any).addListener) {
        (mediaQuery as any).addListener(listener);
        return () => (mediaQuery as any).removeListener(listener);
      }
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('ece_board_theme', newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  // Global keyboard shortcuts:
  // - Ctrl+Shift+D or Cmd+Shift+D: Toggle theme (Night / Day)
  // - Ctrl+Shift+F or Cmd+Shift+F: Toggle Focus Mode (distraction-free review)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        toggleTheme();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        toggleFocusMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resolvedTheme, toggleFocusMode]);

  const [isSessionModalMinimized, setIsSessionModalMinimized] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ece_session_minimized') === 'true';
    } catch {
      return false;
    }
  });

  // Active Session
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [activeSessionSeconds, setActiveSessionSeconds] = useState<number>(0);
  const [isEndModalOpen, setIsEndModalOpen] = useState<boolean>(false);
  const [reviewCompletionSummary, setReviewCompletionSummary] = useState<ReviewCompletionSummary | null>(null);

  const dismissReviewCompletion = () => setReviewCompletionSummary(null);

  // Timer effect for active session with precise timestamp synchronization
  useEffect(() => {
    if (!activeSession) {
      setActiveSessionSeconds(0);
      return;
    }

    const calculateCurrentSeconds = () => {
      const now = activeSession.isPaused && activeSession.lastPausedAt
        ? activeSession.lastPausedAt
        : Date.now();
      const elapsedMs = now - activeSession.startedAt - (activeSession.pausedAccumulatedMs || 0);
      return Math.max(0, Math.floor(elapsedMs / 1000));
    };

    setActiveSessionSeconds(calculateCurrentSeconds());

    if (activeSession.isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setActiveSessionSeconds(calculateCurrentSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const pauseActiveSession = () => {
    setActiveSession((prev) => {
      if (!prev || prev.isPaused) return prev;
      return {
        ...prev,
        isPaused: true,
        lastPausedAt: Date.now(),
      };
    });
  };

  const resumeActiveSession = () => {
    setActiveSession((prev) => {
      if (!prev || !prev.isPaused) return prev;
      const pauseDuration = prev.lastPausedAt ? Date.now() - prev.lastPausedAt : 0;
      return {
        ...prev,
        isPaused: false,
        lastPausedAt: null,
        pausedAccumulatedMs: (prev.pausedAccumulatedMs || 0) + pauseDuration,
      };
    });
  };

  const updateActiveSessionScratchpad = (scratchpad: string) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        scratchpad,
      };
    });
  };

  const isSessionRunning = activeSession ? !activeSession.isPaused : false;

  // Pomodoro Timer State
  const [pomodoro, setPomodoro] = useState<PomodoroState>(() => {
    try {
      const saved = localStorage.getItem('ece_pomodoro_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        const workM = Number(parsed.workMinutes) || 25;
        const restM = Number(parsed.restMinutes) || 5;
        return {
          enabled: Boolean(parsed.enabled),
          phase: 'work',
          workMinutes: workM,
          restMinutes: restM,
          secondsLeft: workM * 60,
          completedCycles: 0,
          autoSwitch: parsed.autoSwitch !== undefined ? Boolean(parsed.autoSwitch) : true,
          soundEnabled: parsed.soundEnabled !== undefined ? Boolean(parsed.soundEnabled) : true,
          isRunning: false,
          totalStudySeconds: 0,
          activeSubjectId: parsed.activeSubjectId || undefined,
          activeSubjectName: parsed.activeSubjectName || undefined,
        };
      }
    } catch {
      // ignore
    }
    return {
      enabled: false,
      phase: 'work',
      workMinutes: 25,
      restMinutes: 5,
      secondsLeft: 25 * 60,
      completedCycles: 0,
      autoSwitch: true,
      soundEnabled: true,
      isRunning: false,
      totalStudySeconds: 0,
    };
  });

  const [pomodoroNotification, setPomodoroNotification] = useState<PomodoroNotification | null>(null);
  const [isPomodoroModalOpen, setIsPomodoroModalOpen] = useState<boolean>(false);

  const dismissPomodoroNotification = () => {
    setPomodoroNotification(null);
  };

  const openPomodoroModal = () => {
    setIsPomodoroModalOpen(true);
  };

  const logStudyDurationMinutes = (minutes: number) => {
    if (minutes <= 0) return;
    setDailyTarget((prev) => ({
      ...prev,
      completedMinutesToday: (prev.completedMinutesToday || 0) + minutes,
    }));
  };

  // Deep Focus Timer Countdown Effect (1s interval)
  useEffect(() => {
    if (!deepFocus.isActive) return;

    const interval = setInterval(() => {
      setDeepFocus((prev) => {
        if (!prev.isActive) return prev;
        const now = Date.now();
        const remaining = Math.max(0, Math.round((prev.expiresAt - now) / 1000));

        if (remaining <= 0) {
          playDeepFocusChime('complete');

          // Add completed minutes to daily target
          setDailyTarget((dPrev) => ({
            ...dPrev,
            completedMinutesToday: (dPrev.completedMinutesToday || 0) + prev.durationMinutes,
            completedSessionsToday: (dPrev.completedSessionsToday || 0) + 1,
          }));

          // Post essential completion notification
          setPomodoroNotification({
            id: `deep-focus-complete-${Date.now()}`,
            title: '🎯 Deep Focus Block Complete!',
            message: `Terrific achievement! You completed your ${prev.durationMinutes}-minute uninterrupted deep focus block. Screen navigation is now unlocked.`,
            phase: 'work',
            timestamp: Date.now(),
          });

          // Browser notification if permitted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('🎯 Deep Focus Block Complete!', {
                body: `Terrific achievement! You completed your ${prev.durationMinutes}-minute focus block uninterrupted.`,
              });
            } catch {
              // ignore
            }
          }

          const completed: DeepFocusState = {
            ...prev,
            isActive: false,
            secondsLeft: 0,
          };
          try {
            localStorage.setItem('ece_deep_focus_state', JSON.stringify(completed));
          } catch {
            // ignore
          }
          return completed;
        }

        return {
          ...prev,
          secondsLeft: remaining,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [deepFocus.isActive]);

  const savePomodoroStorage = (updated: Partial<PomodoroState>) => {
    try {
      const current = {
        enabled: updated.enabled !== undefined ? updated.enabled : pomodoro.enabled,
        workMinutes: updated.workMinutes !== undefined ? updated.workMinutes : pomodoro.workMinutes,
        restMinutes: updated.restMinutes !== undefined ? updated.restMinutes : pomodoro.restMinutes,
        autoSwitch: updated.autoSwitch !== undefined ? updated.autoSwitch : pomodoro.autoSwitch,
        soundEnabled: updated.soundEnabled !== undefined ? updated.soundEnabled : pomodoro.soundEnabled,
        activeSubjectId: updated.activeSubjectId !== undefined ? updated.activeSubjectId : pomodoro.activeSubjectId,
        activeSubjectName: updated.activeSubjectName !== undefined ? updated.activeSubjectName : pomodoro.activeSubjectName,
      };
      localStorage.setItem('ece_pomodoro_config', JSON.stringify(current));
    } catch {
      // ignore
    }
  };

  const startPomodoroTimer = () => {
    setPomodoro((prev) => {
      const nextSeconds = prev.secondsLeft > 0 ? prev.secondsLeft : prev.workMinutes * 60;
      savePomodoroStorage({ enabled: true });
      return {
        ...prev,
        enabled: true,
        isRunning: true,
        secondsLeft: nextSeconds,
      };
    });
    if (activeSession && activeSession.isPaused) {
      resumeActiveSession();
    }
  };

  const pausePomodoroTimer = () => {
    setPomodoro((prev) => ({
      ...prev,
      isRunning: false,
    }));
    if (activeSession && !activeSession.isPaused) {
      pauseActiveSession();
    }
  };

  const togglePomodoro = () => {
    setPomodoro((prev) => {
      const nextEnabled = !prev.enabled;
      savePomodoroStorage({ enabled: nextEnabled });
      return {
        ...prev,
        enabled: nextEnabled,
        isRunning: nextEnabled ? (!activeSession?.isPaused && (isSessionRunning || prev.isRunning)) : false,
        secondsLeft: prev.secondsLeft > 0 ? prev.secondsLeft : prev.workMinutes * 60,
      };
    });
  };

  const setPomodoroCyclePreset = (workMins: number, restMins: number) => {
    setPomodoro((prev) => {
      const currentDuration = prev.phase === 'work' ? workMins : restMins;
      savePomodoroStorage({ workMinutes: workMins, restMinutes: restMins });
      return {
        ...prev,
        workMinutes: workMins,
        restMinutes: restMins,
        secondsLeft: currentDuration * 60,
      };
    });
  };

  const setPomodoroWorkMinutes = (mins: number) => {
    const valid = Math.max(1, Math.min(120, mins));
    setPomodoro((prev) => {
      savePomodoroStorage({ workMinutes: valid });
      return {
        ...prev,
        workMinutes: valid,
        secondsLeft: prev.phase === 'work' ? valid * 60 : prev.secondsLeft,
      };
    });
  };

  const setPomodoroRestMinutes = (mins: number) => {
    const valid = Math.max(1, Math.min(60, mins));
    setPomodoro((prev) => {
      savePomodoroStorage({ restMinutes: valid });
      return {
        ...prev,
        restMinutes: valid,
        secondsLeft: prev.phase === 'rest' ? valid * 60 : prev.secondsLeft,
      };
    });
  };

  const switchPomodoroPhase = (targetPhase?: PomodoroPhase) => {
    setPomodoro((prev) => {
      const nextPhase: PomodoroPhase = targetPhase || (prev.phase === 'work' ? 'rest' : 'work');
      const nextDuration = nextPhase === 'work' ? prev.workMinutes : prev.restMinutes;
      return {
        ...prev,
        phase: nextPhase,
        secondsLeft: nextDuration * 60,
      };
    });
  };

  const resetPomodoroPhaseTimer = () => {
    setPomodoro((prev) => {
      const duration = prev.phase === 'work' ? prev.workMinutes : prev.restMinutes;
      return {
        ...prev,
        secondsLeft: duration * 60,
      };
    });
  };

  const togglePomodoroSound = () => {
    setPomodoro((prev) => {
      const nextSound = !prev.soundEnabled;
      savePomodoroStorage({ soundEnabled: nextSound });
      return {
        ...prev,
        soundEnabled: nextSound,
      };
    });
  };

  const togglePomodoroAutoSwitch = () => {
    setPomodoro((prev) => {
      const nextAuto = !prev.autoSwitch;
      savePomodoroStorage({ autoSwitch: nextAuto });
      return {
        ...prev,
        autoSwitch: nextAuto,
      };
    });
  };

  // Pomodoro tick effect (synced with active session or standalone study timer)
  useEffect(() => {
    const isRunning =
      pomodoro.enabled &&
      (pomodoro.isRunning || (activeSession !== null && !activeSession.isPaused));

    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setPomodoro((prev) => {
        if (!prev.enabled) return prev;

        // If in work phase, increment cumulative study session duration
        const newTotalStudy =
          prev.phase === 'work' ? (prev.totalStudySeconds || 0) + 1 : prev.totalStudySeconds || 0;

        if (prev.secondsLeft > 1) {
          return {
            ...prev,
            secondsLeft: prev.secondsLeft - 1,
            totalStudySeconds: newTotalStudy,
          };
        }

        // Phase finished!
        if (prev.phase === 'work') {
          const nextCycles = prev.completedCycles + 1;

          // Automatically record completed focus minutes to daily target
          setDailyTarget((dPrev) => ({
            ...dPrev,
            completedMinutesToday: (dPrev.completedMinutesToday || 0) + prev.workMinutes,
            completedSessionsToday: dPrev.completedSessionsToday + 1,
          }));

          const notif: PomodoroNotification = {
            id: `pomodoro-${Date.now()}`,
            title: '🎉 Focus Block Completed!',
            message: `Congratulations! You completed a ${prev.workMinutes}-minute study interval. +${prev.workMinutes}m added to today's study target. Time for a ${prev.restMinutes}-minute rest.`,
            phase: 'work',
            timestamp: Date.now(),
          };

          // If Deep Focus is active, do not disrupt with break popups
          if (!deepFocus.isActive) {
            if (prev.soundEnabled) {
              playPomodoroChime('work-complete');
            }
            setPomodoroNotification(notif);

            // Browser Notification API
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('ECE Focus Block Finished! 🎯', {
                  body: `Great job! You finished a ${prev.workMinutes}-minute study session. Time for a well-deserved ${prev.restMinutes}-minute break.`,
                });
              } catch {
                // ignore
              }
            }
          } else {
            postNotification({
              title: notif.title,
              message: notif.message,
              category: 'pomodoro',
              essential: false,
            });
          }

          return {
            ...prev,
            phase: 'rest',
            secondsLeft: prev.restMinutes * 60,
            completedCycles: nextCycles,
            isRunning: prev.autoSwitch,
            totalStudySeconds: newTotalStudy,
          };
        } else {
          // Rest finished!
          const notif: PomodoroNotification = {
            id: `pomodoro-${Date.now()}`,
            title: '☕ Break Completed!',
            message: `Your ${prev.restMinutes}-minute rest period is over. Ready to begin your next board problem set?`,
            phase: 'rest',
            timestamp: Date.now(),
          };

          if (!deepFocus.isActive) {
            if (prev.soundEnabled) {
              playPomodoroChime('rest-complete');
            }
            setPomodoroNotification(notif);

            // Browser Notification API
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('Break Finished! ⚡', {
                  body: 'Time to dive back into your ECE review session with high focus.',
                });
              } catch {
                // ignore
              }
            }
          } else {
            postNotification({
              title: notif.title,
              message: notif.message,
              category: 'pomodoro',
              essential: false,
            });
          }

          return {
            ...prev,
            phase: 'work',
            secondsLeft: prev.workMinutes * 60,
            isRunning: prev.autoSwitch,
            totalStudySeconds: newTotalStudy,
          };
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoro.enabled, pomodoro.isRunning, activeSession?.isPaused, !activeSession]);

  // Settings & Test Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRecordTestModalOpen, setIsRecordTestModalOpen] = useState<boolean>(false);
  const [testModalPreselectedTopicId, setTestModalPreselectedTopicId] = useState<string | null>(null);

  // Live Voice Conversation Modal
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [voiceModalInitialTopic, setVoiceModalInitialTopic] = useState<string | null>(null);

  const openVoiceConversation = (topicName?: string) => {
    if(!canAccessInstruction('voice-tutor'))return;
    setVoiceModalInitialTopic(topicName || null);
    setIsVoiceModalOpen(true);
  };

  const closeVoiceConversation = () => {
    setIsVoiceModalOpen(false);
    setVoiceModalInitialTopic(null);
  };

  // Add Error Modal (accessible globally via UI or Voice Command "Add Error")
  const [isAddErrorModalOpen, setIsAddErrorModalOpen] = useState<boolean>(false);
  const [addErrorDefaultTopicId, setAddErrorDefaultTopicId] = useState<string | null>(null);

  const openAddErrorModal = (topicId?: string) => {
    if (topicId) {
      setAddErrorDefaultTopicId(topicId);
    }
    setIsAddErrorModalOpen(true);
  };

  const closeAddErrorModal = () => {
    setIsAddErrorModalOpen(false);
    setAddErrorDefaultTopicId(null);
  };

  // Gemini Multi-Turn Chatbot Modal / Drawer
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);
  const [chatInitialRole, setChatInitialRole] = useState<string | null>(null);

  const openChat = (prompt?: string, roleId?: string) => {
    if(!canAccessInstruction('tutor'))return;
    if (prompt) setChatInitialPrompt(prompt);
    if (roleId) setChatInitialRole(roleId);
    setIsChatDrawerOpen(true);
  };

  const closeChatDrawer = () => {
    setIsChatDrawerOpen(false);
  };

  // Stored State
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (!saved) return createCleanSubjects();
      return migrateSubjectsToCurrentCurriculum(JSON.parse(saved), createCleanSubjects());
    } catch {
      return createCleanSubjects();
    }
  });

  const startDeepStudySubject = useCallback(
    (subjectId: string, durationMinutes = 25) => {
      const subj = subjects.find((s) => s.id === subjectId);
      const subjectName = subj?.name || 'Subject Review';
      const mins = Math.max(1, durationMinutes);

      // 1. Select the subject
      setSelectedSubjectId(subjectId);

      // 2. Enter Focus Mode
      setIsFocusMode(true);

      // 3. Set Pomodoro timer for this specific subject
      setPomodoro((prev) => {
        const nextSeconds = mins * 60;
        const current = {
          enabled: true,
          workMinutes: mins,
          restMinutes: prev.restMinutes,
          autoSwitch: prev.autoSwitch,
          soundEnabled: prev.soundEnabled,
          activeSubjectId: subjectId,
          activeSubjectName: subjectName,
        };
        try {
          localStorage.setItem('ece_pomodoro_config', JSON.stringify(current));
        } catch {
          // ignore
        }
        return {
          ...prev,
          enabled: true,
          isRunning: true,
          phase: 'work',
          workMinutes: mins,
          secondsLeft: nextSeconds,
          activeSubjectId: subjectId,
          activeSubjectName: subjectName,
        };
      });

      // 4. Start deep focus locked on this subject screen
      startDeepFocus(mins);

      // 5. Navigate to subjects screen
      setCurrentScreen('subjects');

      // 6. Play chime
      playDeepFocusChime('activate');
    },
    [subjects, setSelectedSubjectId, setIsFocusMode, startDeepFocus, setCurrentScreen]
  );

  const [testRecords, setTestRecords] = useState<TestRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TESTS);
      return saved ? migrateTestRecordsToCurrentCurriculum(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  const [errors, setErrors] = useState<ReviewError[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ERRORS);
      return saved ? migrateErrorsToCurrentCurriculum(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  const [dailyTarget, setDailyTarget] = useState<DailyTarget>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAILY);
      const savedDate = localStorage.getItem(STORAGE_KEYS.DAILY_DATE);
      if (!saved) return INITIAL_DAILY_TARGET;

      const parsed = JSON.parse(saved) as DailyTarget;
      if (savedDate === currentDateStr) return parsed;

      // A new local calendar day starts with zero completed work while preserving
      // the learner's configured targets from the previous day.
      return {
        ...INITIAL_DAILY_TARGET,
        targetSessions: parsed.targetSessions ?? INITIAL_DAILY_TARGET.targetSessions,
        targetQuestions: parsed.targetQuestions ?? INITIAL_DAILY_TARGET.targetQuestions,
        targetMinutes: parsed.targetMinutes ?? INITIAL_DAILY_TARGET.targetMinutes,
        targetMasteredProblems:
          parsed.targetMasteredProblems ?? INITIAL_DAILY_TARGET.targetMasteredProblems,
        targetMasteredTopics:
          parsed.targetMasteredTopics ?? INITIAL_DAILY_TARGET.targetMasteredTopics,
      };
    } catch {
      return INITIAL_DAILY_TARGET;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
      return INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(testRecords));
  }, [testRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ERRORS, JSON.stringify(errors));
  }, [errors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(dailyTarget));
    localStorage.setItem(STORAGE_KEYS.DAILY_DATE, currentDateStr);
  }, [dailyTarget, currentDateStr]);

  // Keep date-sensitive review queues correct even when the app remains open
  // across midnight. Polling once per minute is inexpensive and avoids a stale
  // "today" boundary.
  useEffect(() => {
    const refreshLocalDate = () => {
      const nextDate = getLocalDateKey();
      setCurrentDateStr((prev) => (prev === nextDate ? prev : nextDate));
    };

    refreshLocalDate();
    const timer = window.setInterval(refreshLocalDate, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const previousLocalDateRef = useRef(currentDateStr);

  // Reset only the completed counters when the learner crosses into a new local
  // calendar day while the app is still open; target preferences are preserved.
  useEffect(() => {
    if (previousLocalDateRef.current === currentDateStr) return;
    previousLocalDateRef.current = currentDateStr;

    setDailyTarget((prev) => ({
      ...prev,
      completedSessionsToday: 0,
      completedQuestionsToday: 0,
      completedMinutesToday: 0,
      completedMasteredProblemsToday: 0,
      completedMasteredTopicsToday: 0,
    }));
  }, [currentDateStr]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  // Formula Quick-Sheet Memorization Tracking
  const [memorizedFormulaIds, setMemorizedFormulaIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMORIZED_FORMULAS);
      return saved ? JSON.parse(saved) : INITIAL_MEMORIZED_FORMULA_IDS;
    } catch {
      return INITIAL_MEMORIZED_FORMULA_IDS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMORIZED_FORMULAS, JSON.stringify(memorizedFormulaIds));
  }, [memorizedFormulaIds]);

  const [isFormulaQuickSheetOpen, setIsFormulaQuickSheetOpen] = useState<boolean>(false);
  const [formulaQuickSheetInitialMode, setFormulaQuickSheetInitialMode] = useState<'cards' | 'dense' | 'practice'>('cards');
  const [formulaQuickSheetInitialCategory, setFormulaQuickSheetInitialCategory] = useState<string>('all');
  const openFormulaQuickSheet = useCallback((initialMode?: 'cards' | 'dense' | 'practice', initialCategory?: string) => {
    if(!canAccessInstruction('formula'))return;
    if (initialMode) {
      setFormulaQuickSheetInitialMode(initialMode);
    } else {
      setFormulaQuickSheetInitialMode('cards');
    }
    if (initialCategory) {
      setFormulaQuickSheetInitialCategory(initialCategory);
    } else {
      setFormulaQuickSheetInitialCategory('all');
    }
    setIsFormulaQuickSheetOpen(true);
  }, []);
  const closeFormulaQuickSheet = useCallback(() => setIsFormulaQuickSheetOpen(false), []);

  const [flashcardSelectedSubject, setFlashcardSelectedSubject] = useState<'all' | 'mathematics' | 'geas' | 'electronics' | 'est'>('all');
  const openFormulaFlashcards = useCallback(
    (subject?: 'all' | 'mathematics' | 'geas' | 'electronics' | 'est') => {
      if (subject) {
        setFlashcardSelectedSubject(subject);
      }
      setCurrentScreen('formula-flashcard');
    },
    [setCurrentScreen]
  );

  const isFormulaMemorized = useCallback(
    (formulaId: string) => {
      return memorizedFormulaIds.includes(formulaId);
    },
    [memorizedFormulaIds]
  );

  const toggleFormulaMemorized = useCallback((formulaId: string) => {
    setMemorizedFormulaIds((prev) => {
      const exists = prev.includes(formulaId);
      if (exists) {
        return prev.filter((id) => id !== formulaId);
      } else {
        return [...prev, formulaId];
      }
    });
  }, []);

  const setFormulaMemorized = useCallback((formulaId: string, memorized: boolean) => {
    setMemorizedFormulaIds((prev) => {
      const exists = prev.includes(formulaId);
      if (memorized && !exists) {
        return [...prev, formulaId];
      } else if (!memorized && exists) {
        return prev.filter((id) => id !== formulaId);
      }
      return prev;
    });
  }, []);

  const resetMemorizedFormulas = useCallback(() => {
    setMemorizedFormulaIds([]);
  }, []);

  const memorizeAllFormulas = useCallback(() => {
    setMemorizedFormulaIds(QUICK_SHEET_FORMULAS.map((f) => f.id));
  }, []);

  const formulaMemorizationStats = useMemo<FormulaMemorizationStats>(() => {
    const total = QUICK_SHEET_FORMULAS.length;
    const memorizedSet = new Set(memorizedFormulaIds);
    const memorizedCount = QUICK_SHEET_FORMULAS.filter((f) => memorizedSet.has(f.id)).length;
    const unmemorized = Math.max(0, total - memorizedCount);
    const percent = total > 0 ? Math.round((memorizedCount / total) * 100) : 0;

    const realCategories = FORMULA_QUICK_SHEET_CATEGORIES.filter((c) => c.id !== 'all');
    const byCategory: FormulaCategoryProgress[] = realCategories.map((cat) => {
      const catFormulas = QUICK_SHEET_FORMULAS.filter((f) => f.category === cat.id);
      const catTotal = catFormulas.length;
      const catMemorized = catFormulas.filter((f) => memorizedSet.has(f.id)).length;
      const catPercent = catTotal > 0 ? Math.round((catMemorized / catTotal) * 100) : 0;
      return {
        categoryId: cat.id,
        categoryLabel: cat.label,
        total: catTotal,
        memorized: catMemorized,
        percent: catPercent,
      };
    });

    return {
      total,
      memorized: memorizedCount,
      unmemorized,
      percent,
      byCategory,
    };
  }, [memorizedFormulaIds]);

  // Synchronize selectedTopic when subjects update
  useEffect(() => {
    if (selectedTopic) {
      for (const subj of subjects) {
        for (const grp of subj.groups) {
          const found = grp.topics.find((t) => t.id === selectedTopic.id);
          if (found) {
            setSelectedTopic(found);
            return;
          }
        }
      }
    }
  }, [subjects]);

  const openTopicDrawer = (topic: Topic) => {
    if(!canAccessInstruction('topic-drawer'))return;
    setSelectedTopic(topic);
    setIsDrawerOpen(true);
    recordRecentTopicId(topic.id);
  };

  const closeTopicDrawer = () => {
    setIsDrawerOpen(false);
  };

  const startReview = (topic: Topic, activityType = 'Practice Problems') => {
    recordRecentTopicId(topic.id);
    setActiveSession({
      topic,
      activityType,
      startedAt: Date.now(),
      confidenceScore: topic.latestConfidence ?? 3,
    });
    // Reset pomodoro cycle state for the fresh session
    setPomodoro((prev) => ({
      ...prev,
      phase: 'work',
      secondsLeft: prev.workMinutes * 60,
      completedCycles: 0,
    }));
    // If in Focus Mode, default session to docked in-page mode on TodayScreen
    if (isFocusMode) {
      setIsSessionModalMinimized(true);
    }
    setIsDrawerOpen(false);
  };

  const updateActiveSessionConfidence = (confidence: number) => {
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        confidenceScore: confidence,
      };
    });
  };

  const cancelReview = () => {
    setActiveSession(null);
    setIsEndModalOpen(false);
  };

  const endReviewToModal = () => {
    setIsEndModalOpen(true);
  };

  const openRecordTestForTopic = (topicId?: string) => {
    setTestModalPreselectedTopicId(topicId || null);
    setCurrentScreen('tests');
    setIsRecordTestModalOpen(true);
  };

  // Complete review session workflow
  const completeReview = (payload: {
    topicId: string;
    questionsAttempted: number;
    questionsCorrect: number;
    timeSpentMinutes: number;
    usedNotes: 'No' | 'Occasionally' | 'Frequently';
    difficulty: 'Easy' | 'Normal' | 'Difficult';
    independenceRating: number;
    newMastery: MasteryLevel;
    nextReviewDate: string;
    notes?: string;
    confidenceScore?: number;
  }) => {
    const score = Math.round((payload.questionsCorrect / Math.max(1, payload.questionsAttempted)) * 100);
    const activeErrorsForTopic = errors.filter((e) => e.topicId === payload.topicId && !e.isResolved);
    const confidence = payload.confidenceScore ?? activeSession?.confidenceScore ?? 3;
    const confidenceNorm = confidence * 20;
    const confidenceDelta = Math.round(score - confidenceNorm);
    const completedTopicBeforeUpdate = allTopics.find((topic) => topic.id === payload.topicId);

    setSubjects((prevSubjects) => {
      return prevSubjects.map((subj) => {
        return {
          ...subj,
          groups: subj.groups.map((grp) => {
            return {
              ...grp,
              topics: grp.topics.map((t) => {
                if (t.id !== payload.topicId) return t;

                // Spaced Repetition calculation based on user performance & confidence score
                const srSchedule = calculateSpacedRepetitionSchedule({
                  accuracyPercent: score,
                  questionsAttempted: payload.questionsAttempted,
                  questionsCorrect: payload.questionsCorrect,
                  timeSpentMinutes: payload.timeSpentMinutes,
                  difficulty: payload.difficulty,
                  usedNotes: payload.usedNotes,
                  independenceRating: payload.independenceRating,
                  confidenceScore: confidence,
                  previousMastery: t.mastery,
                  currentEaseFactor: t.easeFactor ?? 2.5,
                  currentIntervalDays: t.intervalDays ?? 1,
                  currentRepetitions: t.repetitions ?? 0,
                  isHighPriority: t.isHighPriority,
                  unresolvedErrorsCount: activeErrorsForTopic.length,
                  anchorDateStr: currentDateStr,
                });

                const newHistory = [
                  {
                    id: `act-${Date.now()}`,
                    date: currentDateStr,
                    type: activeSession?.activityType || 'Practice Problems',
                    score,
                    questionsAttempted: payload.questionsAttempted,
                    questionsCorrect: payload.questionsCorrect,
                    timeSpentMinutes: payload.timeSpentMinutes,
                    usedNotes: payload.usedNotes,
                    difficulty: payload.difficulty,
                    notes: payload.notes,
                    confidenceScore: confidence,
                    confidenceVsPerformanceDelta: confidenceDelta,
                  },
                  ...t.activityHistory,
                ];

                const scores = newHistory.map((h) => h.score);
                const best = Math.max(...scores);
                const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

                return {
                  ...t,
                  initialCovered: true,
                  reviewCount: t.reviewCount + 1,
                  mastery: payload.newMastery,
                  evidenceStatus: 'manual',
                  latestScore: score,
                  bestScore: best,
                  averageScore: avg,
                  latestConfidence: confidence,
                  lastReviewDate: currentDateStr,
                  nextReviewDate: payload.nextReviewDate || srSchedule.nextReviewDate,
                  easeFactor: srSchedule.newEaseFactor,
                  intervalDays: srSchedule.newIntervalDays,
                  repetitions: srSchedule.newRepetitions,
                  lastReviewQuality: srSchedule.qualityGrade,
                  recommendationNote: srSchedule.explanation,
                  activityHistory: newHistory,
                  isHighPriority: payload.newMastery <= 2,
                };
              }),
            };
          }),
        };
      });
    });

    // Update Daily Target counter
    setDailyTarget((prev) => ({
      ...prev,
      completedSessionsToday: prev.completedSessionsToday + 1,
      completedQuestionsToday: prev.completedQuestionsToday + payload.questionsAttempted,
      completedMinutesToday: (prev.completedMinutesToday || 0) + payload.timeSpentMinutes,
      completedMasteredProblemsToday: (prev.completedMasteredProblemsToday || 0) + (payload.questionsCorrect || 0),
    }));

    setReviewCompletionSummary({
      topicId: payload.topicId,
      topicName: completedTopicBeforeUpdate?.name ?? activeSession?.topic.name ?? 'Completed Topic',
      subjectId: completedTopicBeforeUpdate?.subjectId ?? activeSession?.topic.subjectId ?? '',
      activityType: activeSession?.activityType || 'Practice Problems',
      scorePercent: score,
      questionsAttempted: payload.questionsAttempted,
      questionsCorrect: payload.questionsCorrect,
      timeSpentMinutes: payload.timeSpentMinutes,
      previousMastery: completedTopicBeforeUpdate?.mastery ?? null,
      newMastery: payload.newMastery,
      nextReviewDate: payload.nextReviewDate,
    });

    // Cleanup active session
    setActiveSession(null);
    setIsEndModalOpen(false);
  };

  // Only the initial completion checkbox is directly editable in the spreadsheet
  const toggleTopicInitialCovered = (topicId: string) => {
    setSubjects((prevSubjects) =>
      prevSubjects.map((subj) => ({
        ...subj,
        groups: subj.groups.map((grp) => ({
          ...grp,
          topics: grp.topics.map((t) => {
            if (t.id === topicId) {
              const nextVal = !t.initialCovered;
              // A completion checkbox is self-report, not an independently verified assessment.
              return {
                ...t,
                initialCovered: nextVal,
                evidenceStatus:'manual',
                mastery: nextVal ? (t.mastery || 1) : null,
                nextReviewDate: nextVal ? (t.nextReviewDate || currentDateStr) : null,
              };
            }
            return t;
          }),
        })),
      }))
    );
  };

  const savedAttemptIdsRef = useRef<Set<string>>(new Set());
  const addTestRecord = (test: Omit<TestRecord, 'id' | 'scorePercent'>) => {
    if (!validateAggregate(test)) {
      console.error('Invalid aggregate counts: test record not saved', test);
      return;
    }
    let scorePercent = Math.round(test.correct / test.questions * 100);
    let verifiedTopics: ReturnType<typeof topicResults> = [];
    if (test.provenance === 'automatic') {
      if (!test.itemResults || test.itemResults.length !== test.questions) return;
      try {
        const graded=gradeItems(test.itemResults);
        if (graded.correct !== test.correct || graded.incorrect !== test.incorrect || graded.unanswered !== test.unanswered) return;
        scorePercent=graded.scorePercent;
        verifiedTopics=topicResults(test.itemResults);
      } catch { return; }
    }
    if (!areaResultsMatchRecord(test) || !tosResultsMatchRecord(test)) return;
    // Reject duplicate submissions by stable attempt ID, including UI double-clicks.
    if (test.attemptId && (savedAttemptIdsRef.current.has(test.attemptId) || testRecords.some(record => record.attemptId === test.attemptId))) return;
    if (test.attemptId) savedAttemptIdsRef.current.add(test.attemptId);
    const newRecord: TestRecord = {
      ...test,
      provenance: test.provenance === 'automatic' ? 'automatic' : 'manual',
      assessmentMode: test.assessmentMode || (test.provenance === 'automatic' ? 'practice':'manual'),
      scope: test.scope || (test.provenance === 'automatic' ? 'topic':'subject'),
      id: `test-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      scorePercent,
    };
    setTestRecords(prev => test.attemptId && prev.some(record => record.attemptId === test.attemptId) ? prev : [newRecord, ...prev]);
    // No overall-score fanout. Update only topics actually assessed by saved item results.
    if (verifiedTopics.length) setSubjects(prev => prev.map(subj => ({
      ...subj, groups:subj.groups.map(group => ({ ...group,
        topics:group.topics.map(topic => {
          const outcome=verifiedTopics.find(r=>r.topicId===topic.id);
          if (!outcome) return topic;
          return { ...topic, evidenceStatus:'practice', latestScore:outcome.scorePercent,
            bestScore:Math.max(topic.bestScore??0,outcome.scorePercent),
            lastReviewDate:test.date };
        })
      }))
    })));
  };

  const addReviewError = (err: {
    topicId: string;
    topicName: string;
    subjectId: string;
    category: ReviewError['category'];
    description: string;
    solutionOrKeyFormula?: string;
  }) => {
    const newError: ReviewError = {
      id: `err-${Date.now()}`,
      topicId: err.topicId,
      topicName: err.topicName,
      subjectId: err.subjectId,
      category: err.category,
      description: err.description,
      solutionOrKeyFormula: err.solutionOrKeyFormula,
      lastOccurred: currentDateStr,
      isResolved: false,
      occurrenceCount: 1,
    };
    setErrors((prev) => [newError, ...prev]);
  };

  const appendQuickNoteToErrorLog = useCallback(
    (params: {
      topicId: string;
      topicName: string;
      subjectId: string;
      text: string;
      type?: 'observation' | 'question' | 'mistake';
      targetErrorId?: string;
      category?: ReviewError['category'];
      solutionOrKeyFormula?: string;
      sessionElapsedTime?: string;
    }): { note: ErrorNote; errorId: string; isNewError: boolean } => {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let elapsedStr = params.sessionElapsedTime;
      if (!elapsedStr && activeSessionSeconds > 0) {
        const mins = Math.floor(activeSessionSeconds / 60);
        const secs = activeSessionSeconds % 60;
        elapsedStr = `+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      } else if (!elapsedStr) {
        elapsedStr = '+00:00';
      }

      const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const noteType = params.type || 'observation';
      const newNote: ErrorNote = {
        id: noteId,
        timestamp: Date.now(),
        timeString,
        sessionElapsedTime: elapsedStr,
        text: params.text.trim(),
        type: noteType,
      };

      let assignedErrorId = params.targetErrorId || '';
      let isNewError = false;

      setErrors((prev) => {
        // 1. If targetErrorId specified, find and update that specific error
        if (assignedErrorId) {
          const exists = prev.some((e) => e.id === assignedErrorId);
          if (exists) {
            return prev.map((err) => {
              if (err.id === assignedErrorId) {
                return {
                  ...err,
                  lastOccurred: currentDateStr,
                  occurrenceCount: err.occurrenceCount + 1,
                  notes: [newNote, ...(err.notes || [])],
                };
              }
              return err;
            });
          }
        }

        // 2. If no target specified, check if an unresolved error exists for this topic
        const existingTopicError = prev.find(
          (e) => e.topicId === params.topicId && !e.isResolved
        );
        if (existingTopicError && !assignedErrorId) {
          assignedErrorId = existingTopicError.id;
          return prev.map((err) => {
            if (err.id === existingTopicError.id) {
              return {
                ...err,
                lastOccurred: currentDateStr,
                notes: [newNote, ...(err.notes || [])],
              };
            }
            return err;
          });
        }

        // 3. Otherwise, create a new error log entry
        isNewError = true;
        const newErrId = `err-${Date.now()}`;
        assignedErrorId = newErrId;
        const typeLabel =
          noteType === 'question'
            ? '❓ Question'
            : noteType === 'mistake'
            ? '⚠️ Mistake Trap'
            : '🔍 Observation';

        const newError: ReviewError = {
          id: newErrId,
          topicId: params.topicId,
          topicName: params.topicName,
          subjectId: params.subjectId,
          category: params.category || 'Formula recall',
          description: `${typeLabel}: ${params.text.trim()}`,
          solutionOrKeyFormula: params.solutionOrKeyFormula,
          lastOccurred: currentDateStr,
          isResolved: false,
          occurrenceCount: 1,
          notes: [newNote],
        };
        return [newError, ...prev];
      });

      return {
        note: newNote,
        errorId: assignedErrorId,
        isNewError,
      };
    },
    [activeSessionSeconds, currentDateStr]
  );

  const deleteErrorNote = useCallback((errorId: string, noteId: string) => {
    setErrors((prev) =>
      prev.map((err) => {
        if (err.id === errorId && err.notes) {
          return {
            ...err,
            notes: err.notes.filter((n) => n.id !== noteId),
          };
        }
        return err;
      })
    );
  }, []);

  const toggleErrorResolved = (errorId: string) => {
    setErrors((prev) =>
      prev.map((e) => (e.id === errorId ? { ...e, isResolved: !e.isResolved } : e))
    );
  };

  const markSubjectMaintenance = (subjectId: string, inMaintenance: boolean) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, inMaintenance } : s))
    );
  };

  const resetAllData = () => {
    setSubjects(createCleanSubjects());
    setTestRecords([]);
    setErrors([]);
    setDailyTarget(INITIAL_DAILY_TARGET);
    setUserProfile(INITIAL_USER_PROFILE);
    setMemorizedFormulaIds(INITIAL_MEMORIZED_FORMULA_IDS);
    try {localStorage.removeItem(LEARN_READER_STORAGE_KEY);localStorage.removeItem(MANUAL_LEARN_STORAGE_KEY);window.dispatchEvent(new Event(MANUAL_LEARN_CHANGED_EVENT));}catch{/* Storage may be unavailable. */}
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TESTS);
    localStorage.removeItem(STORAGE_KEYS.ERRORS);
    localStorage.removeItem(STORAGE_KEYS.DAILY);
    localStorage.removeItem(STORAGE_KEYS.DAILY_DATE);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.MEMORIZED_FORMULAS);
    localStorage.setItem(DATA_MODE_KEY, 'clean');
  };

  const reseedDemoData = () => {
    try {localStorage.removeItem(LEARN_READER_STORAGE_KEY);localStorage.removeItem(MANUAL_LEARN_STORAGE_KEY);window.dispatchEvent(new Event(MANUAL_LEARN_CHANGED_EVENT));}catch{/* Study storage is best-effort. */}
    setSubjects(structuredClone(INITIAL_SUBJECTS));
    setTestRecords(INITIAL_TEST_RECORDS.map(record=>({...record,provenance:'legacy',scope:'legacy',assessmentMode:'manual'})));
    setErrors(structuredClone(INITIAL_ERRORS));
    localStorage.setItem(DATA_MODE_KEY, 'demo');
  };

  // Flattened topics
  const allTopics = useMemo(() => {
    const list: Topic[] = [];
    for (const subj of subjects) {
      for (const grp of subj.groups) {
        for (const t of grp.topics) {
          list.push(t);
        }
      }
    }
    return list;
  }, [subjects]);

  const currentSubject = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  }, [subjects, selectedSubjectId]);

  // --------------------------------------------------------------------------
  // SPACED REPETITION ALGORITHM: AUTOMATIC FLAGGING & DAILY STUDY QUEUE
  // Evaluates memory decay (Ebbinghaus), performance accuracy, SM-2 overdue status,
  // and active error logs to automatically flag and prioritize topics for review.
  // --------------------------------------------------------------------------
  const dailyStudyQueue = useMemo<DailyStudyQueueItem[]>(() => {
    return buildPrioritizedDailyStudyQueue(allTopics, subjects, errors, currentDateStr);
  }, [allTopics, subjects, errors, currentDateStr]);

  const flaggedTopicsCount = dailyStudyQueue.length;

  const criticalFlaggedCount = useMemo(() => {
    return dailyStudyQueue.filter((item) => item.urgencyLevel === 'critical').length;
  }, [dailyStudyQueue]);

  // Derived Priority Topic for "Today" (ranked #1 in urgency by spaced repetition algorithm)
  const priorityReviewTopic = useMemo<Topic | null>(() => {
    if (dailyStudyQueue.length > 0) {
      return dailyStudyQueue[0].topic;
    }
    return allTopics.find((t) => t.initialCovered) || null;
  }, [dailyStudyQueue, allTopics]);

  // Next up in review queue (ranked #2 through #8 by urgency score)
  const nextReviewQueue = useMemo<Topic[]>(() => {
    if (dailyStudyQueue.length > 1) {
      return dailyStudyQueue.slice(1, 8).map((item) => item.topic);
    }
    return allTopics
      .filter((t) => t.initialCovered && t.id !== priorityReviewTopic?.id)
      .slice(0, 6);
  }, [dailyStudyQueue, allTopics, priorityReviewTopic]);

  // Function to persist computed spaced repetition flags directly onto subjects state
  const autoFlagTopicsForReview = useCallback(() => {
    const queue = buildPrioritizedDailyStudyQueue(allTopics, subjects, errors, currentDateStr);
    const queueMap = new Map<string, DailyStudyQueueItem>();
    queue.forEach((item) => queueMap.set(item.topic.id, item));

    setSubjects((prevSubjects) => {
      return prevSubjects.map((subj) => ({
        ...subj,
        groups: subj.groups.map((grp) => ({
          ...grp,
          topics: grp.topics.map((t) => {
            const queueItem = queueMap.get(t.id);
            if (queueItem) {
              return {
                ...t,
                isFlaggedForReview: true,
                flagReason: queueItem.flagReason,
                urgencyLevel: queueItem.urgencyLevel,
                urgencyScore: queueItem.urgencyScore,
                retentionStrengthPercent: queueItem.estimatedRetentionPercent,
              };
            } else if (t.initialCovered) {
              return {
                ...t,
                isFlaggedForReview: false,
                flagReason: undefined,
                urgencyLevel: undefined,
                urgencyScore: 0,
              };
            }
            return t;
          }),
        })),
      }));
    });
  }, [allTopics, subjects, errors, currentDateStr]);

  // Spaced repetition fleet audit report
  const runSpacedRepetitionAudit = useCallback(() => {
    const queue = buildPrioritizedDailyStudyQueue(allTopics, subjects, errors, currentDateStr);
    const coveredTopics = allTopics.filter((t) => t.initialCovered);
    const retentions = queue.map((q) => q.estimatedRetentionPercent);
    const avgRetention =
      retentions.length > 0
        ? Math.round(retentions.reduce((a, b) => a + b, 0) / retentions.length)
        : 80;

    return {
      totalEvaluated: coveredTopics.length,
      flaggedCount: queue.length,
      criticalCount: queue.filter((q) => q.urgencyLevel === 'critical').length,
      highUrgencyCount: queue.filter((q) => q.urgencyLevel === 'high').length,
      moderateUrgencyCount: queue.filter((q) => q.urgencyLevel === 'moderate').length,
      averageRetentionPercent: avgRetention,
      topUrgentTopicName: queue.length > 0 ? queue[0].topic.name : null,
    };
  }, [allTopics, subjects, errors, currentDateStr]);

  // Complete spaced review with updated performance metrics
  const completeSpacedReview = useCallback(
    (
      topicId: string,
      performance: {
        accuracyPercent: number;
        questionsAttempted: number;
        questionsCorrect: number;
        timeSpentMinutes?: number;
        difficulty?: 'Easy' | 'Normal' | 'Difficult';
        usedNotes?: 'No' | 'Occasionally' | 'Frequently';
        independenceRating?: number;
        confidenceScore?: number;
        notes?: string;
      }
    ) => {
      const activeErrorsForTopic = errors.filter((e) => e.topicId === topicId && !e.isResolved);
      const minutesSpent = performance.timeSpentMinutes ?? 15;

      setSubjects((prevSubjects) => {
        return prevSubjects.map((subj) => ({
          ...subj,
          groups: subj.groups.map((grp) => ({
            ...grp,
            topics: grp.topics.map((t) => {
              if (t.id !== topicId) return t;

              const srSchedule = calculateSpacedRepetitionSchedule({
                accuracyPercent: performance.accuracyPercent,
                questionsAttempted: performance.questionsAttempted,
                questionsCorrect: performance.questionsCorrect,
                timeSpentMinutes: minutesSpent,
                difficulty: performance.difficulty || 'Normal',
                usedNotes: performance.usedNotes || 'No',
                independenceRating: performance.independenceRating || 4,
                confidenceScore: performance.confidenceScore ?? t.latestConfidence ?? 3,
                previousMastery: t.mastery,
                currentEaseFactor: t.easeFactor ?? 2.5,
                currentIntervalDays: t.intervalDays ?? 1,
                currentRepetitions: t.repetitions ?? 0,
                isHighPriority: t.isHighPriority,
                unresolvedErrorsCount: activeErrorsForTopic.length,
                anchorDateStr: currentDateStr,
              });

              const newLog = {
                id: `act-sr-${Date.now()}`,
                date: currentDateStr,
                type: 'Practice Problems' as const,
                score: performance.accuracyPercent,
                questionsAttempted: performance.questionsAttempted,
                questionsCorrect: performance.questionsCorrect,
                timeSpentMinutes: minutesSpent,
                usedNotes: performance.usedNotes || 'No',
                difficulty: performance.difficulty || 'Normal',
                notes: performance.notes,
              };

              const newHistory = [newLog, ...t.activityHistory];
              const scores = newHistory.map((h) => h.score);
              const best = Math.max(...scores);
              const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

              return {
                ...t,
                initialCovered: true,
                reviewCount: t.reviewCount + 1,
                mastery: srSchedule.recommendedMastery,
                latestScore: performance.accuracyPercent,
                bestScore: best,
                averageScore: avg,
                lastReviewDate: currentDateStr,
                nextReviewDate: srSchedule.nextReviewDate,
                easeFactor: srSchedule.newEaseFactor,
                intervalDays: srSchedule.newIntervalDays,
                repetitions: srSchedule.newRepetitions,
                lastReviewQuality: srSchedule.qualityGrade,
                recommendationNote: srSchedule.explanation,
                activityHistory: newHistory,
                retentionStrengthPercent: 96,
                isFlaggedForReview: srSchedule.isLapse,
                flagReason: srSchedule.isLapse ? 'Performance Lapse' : undefined,
                urgencyLevel: srSchedule.isLapse ? 'critical' : undefined,
              };
            }),
          })),
        }));
      });

      // Update daily target counters
      setDailyTarget((prev) => ({
        ...prev,
        completedSessionsToday: prev.completedSessionsToday + 1,
        completedQuestionsToday: prev.completedQuestionsToday + performance.questionsAttempted,
        completedMinutesToday: (prev.completedMinutesToday || 0) + minutesSpent,
        completedMasteredProblemsToday:
          (prev.completedMasteredProblemsToday || 0) + performance.questionsCorrect,
      }));
    },
    [errors, currentDateStr]
  );

  // Spaced Repetition Due Today and Overdue Queues
  const dueTodayTopics = useMemo(() => {
    return allTopics
      .filter((t) => t.initialCovered && t.nextReviewDate === currentDateStr)
      .sort((a, b) => {
        if (a.isHighPriority !== b.isHighPriority) return a.isHighPriority ? -1 : 1;
        if ((a.mastery ?? 5) !== (b.mastery ?? 5)) return (a.mastery ?? 5) - (b.mastery ?? 5);
        return (a.latestScore ?? 100) - (b.latestScore ?? 100);
      });
  }, [allTopics, currentDateStr]);

  const overdueTopics = useMemo(() => {
    return allTopics
      .filter((t) => t.initialCovered && t.nextReviewDate && t.nextReviewDate < currentDateStr)
      .sort((a, b) => {
        const diffA = new Date(currentDateStr + 'T00:00:00').getTime() - new Date(a.nextReviewDate! + 'T00:00:00').getTime();
        const diffB = new Date(currentDateStr + 'T00:00:00').getTime() - new Date(b.nextReviewDate! + 'T00:00:00').getTime();
        if (diffB !== diffA) return diffB - diffA;
        return (a.mastery ?? 5) - (b.mastery ?? 5);
      });
  }, [allTopics, currentDateStr]);

  const allDueOrOverdueTopics = useMemo(() => {
    return [...overdueTopics, ...dueTodayTopics];
  }, [overdueTopics, dueTodayTopics]);

  const scheduleTopicSpacedReview = (
    topicId: string,
    performance: {
      accuracyPercent: number;
      usedNotes?: 'No' | 'Occasionally' | 'Frequently';
      difficulty?: 'Easy' | 'Normal' | 'Difficult';
      independenceRating?: number;
    }
  ) => {
    const activeErrorsForTopic = errors.filter((e) => e.topicId === topicId && !e.isResolved);
    setSubjects((prevSubjects) => {
      return prevSubjects.map((subj) => ({
        ...subj,
        groups: subj.groups.map((grp) => ({
          ...grp,
          topics: grp.topics.map((t) => {
            if (t.id !== topicId) return t;
            const srSchedule = calculateSpacedRepetitionSchedule({
              accuracyPercent: performance.accuracyPercent,
              questionsAttempted: 10,
              questionsCorrect: Math.round((performance.accuracyPercent / 100) * 10),
              timeSpentMinutes: 15,
              difficulty: performance.difficulty || 'Normal',
              usedNotes: performance.usedNotes || 'No',
              independenceRating: performance.independenceRating || 4,
              previousMastery: t.mastery,
              currentEaseFactor: t.easeFactor ?? 2.5,
              currentIntervalDays: t.intervalDays ?? 1,
              currentRepetitions: t.repetitions ?? 0,
              isHighPriority: t.isHighPriority,
              unresolvedErrorsCount: activeErrorsForTopic.length,
              anchorDateStr: currentDateStr,
            });

            return {
              ...t,
              nextReviewDate: srSchedule.nextReviewDate,
              easeFactor: srSchedule.newEaseFactor,
              intervalDays: srSchedule.newIntervalDays,
              repetitions: srSchedule.newRepetitions,
              lastReviewQuality: srSchedule.qualityGrade,
              recommendationNote: srSchedule.explanation,
            };
          }),
        })),
      }));
    });
  };

  // Algebra Coverage & Mastery
  const { algebraCoveragePercent, algebraMasteryPercent, algebraReadiness } = useMemo(() => {
    const algebra = subjects.find((s) => s.id === 'subj-math-algebra');
    if (!algebra) {
      return {
        algebraCoveragePercent: 0,
        algebraMasteryPercent: 0,
        algebraReadiness: {
          initialCoveragePercent: 0,
          topicsBelowLevel3: 0,
          highPriorityAvgMastery: 0,
          latestMixedTestScore: null,
          timedBoardAccuracy: null,
          overdueCount: 0,
          isReadyForMaintenance: false,
        },
      };
    }

    const topics=algebra.groups.flatMap(g=>g.topics);
    const coveragePercent=topics.length ? Math.round(topics.filter(t=>t.initialCovered).length/topics.length*100) : 0;
    const masteryPercent=topics.length ? Math.round(topics.reduce((s,t)=>s+(t.mastery||0),0)/(topics.length*5)*100) : 0;
    return { algebraCoveragePercent: coveragePercent, algebraMasteryPercent: masteryPercent,
      algebraReadiness:getSubjectReadiness(algebra,testRecords,currentDateStr) };

  }, [subjects, testRecords, currentDateStr]);

  // Recommended Daily Target calculation based on current mastery, overdue reviews, and error logs
  const recommendedTarget = useMemo(() => {
    return calculateRecommendedTarget(allTopics, errors, userProfile, currentDateStr);
  }, [allTopics, errors, userProfile, currentDateStr]);

  const applyRecommendedTarget = () => {
    setDailyTarget((prev) => ({
      ...prev,
      targetSessions: recommendedTarget.recommendedSessions,
      targetQuestions: recommendedTarget.recommendedQuestions,
    }));
  };

  const incrementDailyQuestions = (amount: number) => {
    setDailyTarget((prev) => ({
      ...prev,
      completedQuestionsToday: Math.max(0, prev.completedQuestionsToday + amount),
    }));
  };

  const incrementDailySessions = (amount: number) => {
    setDailyTarget((prev) => ({
      ...prev,
      completedSessionsToday: Math.max(0, prev.completedSessionsToday + amount),
    }));
  };

  // Total study minutes today derived from activity history + tests + direct logged minutes
  const totalMinutesStudiedToday = useMemo(() => {
    let minutesFromActivity = 0;
    subjects.forEach((subj) => {
      subj.groups.forEach((grp) => {
        grp.topics.forEach((t) => {
          (t.activityHistory || []).forEach((act) => {
            if (act.date === currentDateStr) {
              minutesFromActivity += act.timeSpentMinutes || 0;
            }
          });
        });
      });
    });

    let minutesFromTests = 0;
    testRecords.forEach((test) => {
      if (test.date === currentDateStr) {
        minutesFromTests += test.timeMinutes || 0;
      }
    });

    return Math.max(dailyTarget.completedMinutesToday || 0, minutesFromActivity + minutesFromTests);
  }, [subjects, testRecords, dailyTarget.completedMinutesToday, currentDateStr]);

  const incrementDailyMinutes = (amount: number) => {
    setDailyTarget((prev) => {
      const current = Math.max(prev.completedMinutesToday || 0, totalMinutesStudiedToday);
      return {
        ...prev,
        completedMinutesToday: Math.max(0, current + amount),
      };
    });
  };

  const setDailyTargetMinutes = (minutes: number) => {
    const val = Math.max(5, Math.min(600, minutes));
    setDailyTarget((prev) => ({
      ...prev,
      targetMinutes: val,
    }));
    setUserProfile((prev) => ({
      ...prev,
      dailyTargetMinutes: val,
    }));
  };

  const incrementDailyMasteredProblems = (amount: number) => {
    setDailyTarget((prev) => ({
      ...prev,
      completedMasteredProblemsToday: Math.max(0, (prev.completedMasteredProblemsToday || 0) + amount),
    }));
  };

  const setDailyTargetMasteredProblems = (target: number) => {
    const val = Math.max(1, Math.min(200, target));
    setDailyTarget((prev) => ({
      ...prev,
      targetMasteredProblems: val,
    }));
    setUserProfile((prev) => ({
      ...prev,
      dailyTargetMasteredProblems: val,
    }));
  };

  const incrementDailyMasteredTopics = (amount: number) => {
    setDailyTarget((prev) => ({
      ...prev,
      completedMasteredTopicsToday: Math.max(0, (prev.completedMasteredTopicsToday || 0) + amount),
    }));
  };

  const setDailyTargetMasteredTopics = (target: number) => {
    const val = Math.max(1, Math.min(50, target));
    setDailyTarget((prev) => ({
      ...prev,
      targetMasteredTopics: val,
    }));
    setUserProfile((prev) => ({
      ...prev,
      dailyTargetMasteredTopics: val,
    }));
  };

  // Forgetting Curve Spaced Repetition Engine
  const [forgettingCurveThreshold, setForgettingCurveThreshold] = useState<number>(80);

  const dailyForgettingCurveOverview = useMemo(() => {
    return generateDailyForgettingCurveContent(allTopics, currentDateStr, errors, {
      targetRetention: forgettingCurveThreshold,
      maxSuggestions: 8,
    });
  }, [allTopics, currentDateStr, errors, forgettingCurveThreshold]);

  const startForgettingCurveReview = (suggestion: DailyForgettingCurveSuggestion) => {
    startReview(suggestion.topic, suggestion.analysis.recommendedActivity);
  };

  // --------------------------------------------------------------------------
  // WEAK SPOT QUIZ GENERATOR (ERROR LOG DRIVEN)
  // Generates a custom diagnostic test focusing on subjects with highest error frequency
  // --------------------------------------------------------------------------
  const [activeWeakSpotQuiz, setActiveWeakSpotQuiz] = useState<CustomWeakSpotQuiz | null>(null);

  const generateWeakSpotQuiz = useCallback(
    (options?: WeakSpotQuizOptions): CustomWeakSpotQuiz => {
      return generateWeakSpotQuizFromErrors(errors, subjects, allTopics, options);
    },
    [errors, subjects, allTopics]
  );

  const startWeakSpotQuiz = useCallback(
    (optionsOrQuiz?: WeakSpotQuizOptions | CustomWeakSpotQuiz) => {
      if (optionsOrQuiz && 'questions' in optionsOrQuiz) {
        setActiveWeakSpotQuiz(optionsOrQuiz);
      } else {
        const quiz = generateWeakSpotQuiz(optionsOrQuiz as WeakSpotQuizOptions | undefined);
        setActiveWeakSpotQuiz(quiz);
      }
    },
    [generateWeakSpotQuiz]
  );

  const closeWeakSpotQuiz = useCallback(() => {
    setActiveWeakSpotQuiz(null);
  }, []);

  return (
    <ReviewContext.Provider
      value={{
        assessmentSession,beginAssessment,finalizeAssessment,interruptAssessment,canAccessInstruction,recordAidDisclosure,
        learningPath,
        setLearningPath,
        currentScreen,
        setCurrentScreen,
        topicLaunchIntent, navigateToReferenceTopic, clearTopicLaunchIntent, isLearnReaderActive, setIsLearnReaderActive,
        selectedMathModuleId,
        setSelectedMathModuleId,
        searchQuery,
        setSearchQuery,
        selectedSubjectId,
        setSelectedSubjectId,
        selectedTopic,
        setSelectedTopic,
        isDrawerOpen,
        setIsDrawerOpen: (open:boolean)=>{if(!open || canAccessInstruction('topic-drawer'))setIsDrawerOpen(open);},
        openTopicDrawer,
        closeTopicDrawer,
        activeSession,
        activeSessionSeconds,
        isSessionRunning,
        pauseActiveSession,
        resumeActiveSession,
        updateActiveSessionScratchpad,
        updateActiveSessionConfidence,
        startReview,
        cancelReview,
        endReviewToModal,
        isEndModalOpen,
        setIsEndModalOpen,
        reviewCompletionSummary,
        dismissReviewCompletion,
        isFocusMode,
        setIsFocusMode,
        toggleFocusMode,
        isSessionModalMinimized,
        setIsSessionModalMinimized,
        deepFocus,
        isDeepFocusActive: deepFocus.isActive,
        deepFocusTimeRemaining: deepFocus.secondsLeft,
        startDeepFocus,
        stopDeepFocus,
        extendDeepFocus,
        toggleDeepFocus,
        isDeepFocusModalOpen,
        setIsDeepFocusModalOpen,
        openDeepFocusModal,
        closeDeepFocusModal,
        blockedNavigationAttempt,
        dismissBlockedNavigation,
        unlockAndNavigateScreen,
        silencedNotifications,
        clearSilencedNotifications,
        postNotification,
        completeReview,
        pomodoro,
        togglePomodoro,
        startPomodoroTimer,
        pausePomodoroTimer,
        setPomodoroCyclePreset,
        setPomodoroWorkMinutes,
        setPomodoroRestMinutes,
        switchPomodoroPhase,
        resetPomodoroPhaseTimer,
        togglePomodoroSound,
        togglePomodoroAutoSwitch,
        logStudyDurationMinutes,
        startDeepStudySubject,
        pomodoroNotification,
        dismissPomodoroNotification,
        isPomodoroModalOpen,
        setIsPomodoroModalOpen,
        openPomodoroModal,
        subjects,
        testRecords,
        errors,
        dailyTarget,
        userProfile,
        setUserProfile,
        setDailyTarget,
        recommendedTarget,
        applyRecommendedTarget,
        incrementDailyQuestions,
        incrementDailySessions,
        incrementDailyMinutes,
        setDailyTargetMinutes,
        incrementDailyMasteredProblems,
        setDailyTargetMasteredProblems,
        incrementDailyMasteredTopics,
        setDailyTargetMasteredTopics,
        totalMinutesStudiedToday,
        toggleTopicInitialCovered,
        addTestRecord,
        addReviewError,
        appendQuickNoteToErrorLog,
        deleteErrorNote,
        toggleErrorResolved,
        markSubjectMaintenance,
        resetAllData,
        reseedDemoData,
        isSettingsOpen,
        setIsSettingsOpen,
        isRecordTestModalOpen,
        setIsRecordTestModalOpen,
        testModalPreselectedTopicId,
        openRecordTestForTopic,
        isVoiceModalOpen,
        setIsVoiceModalOpen: (open:boolean)=>{if(!open || canAccessInstruction('voice-tutor'))setIsVoiceModalOpen(open);},
        voiceModalInitialTopic,
        openVoiceConversation,
        closeVoiceConversation,
        isAddErrorModalOpen,
        setIsAddErrorModalOpen,
        addErrorDefaultTopicId,
        openAddErrorModal,
        closeAddErrorModal,
        isChatDrawerOpen,
        setIsChatDrawerOpen: (open:boolean)=>{if(!open || canAccessInstruction('tutor'))setIsChatDrawerOpen(open);},
        chatInitialPrompt,
        chatInitialRole,
        openChat,
        closeChatDrawer,
        currentDateStr,
        currentSubject,
        allTopics,
        priorityReviewTopic,
        nextReviewQueue,
        dueTodayTopics,
        overdueTopics,
        allDueOrOverdueTopics,
        scheduleTopicSpacedReview,
        dailyStudyQueue,
        flaggedTopicsCount,
        criticalFlaggedCount,
        autoFlagTopicsForReview,
        runSpacedRepetitionAudit,
        completeSpacedReview,
        algebraReadiness,
        algebraCoveragePercent,
        algebraMasteryPercent,
        forgettingCurveThreshold,
        setForgettingCurveThreshold,
        dailyForgettingCurveOverview,
        startForgettingCurveReview,
        generateWeakSpotQuiz,
        activeWeakSpotQuiz,
        startWeakSpotQuiz,
        closeWeakSpotQuiz,
        memorizedFormulaIds,
        toggleFormulaMemorized,
        isFormulaMemorized,
        setFormulaMemorized,
        resetMemorizedFormulas,
        memorizeAllFormulas,
        formulaMemorizationStats,
        isFormulaQuickSheetOpen,
        setIsFormulaQuickSheetOpen: (open:boolean)=>{if(!open || canAccessInstruction('formula'))setIsFormulaQuickSheetOpen(open);},
        formulaQuickSheetInitialMode,
        formulaQuickSheetInitialCategory,
        openFormulaQuickSheet,
        closeFormulaQuickSheet,
        flashcardSelectedSubject,
        setFlashcardSelectedSubject,
        openFormulaFlashcards,
        theme,
        resolvedTheme,
        isDarkMode: resolvedTheme === 'dark',
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};
