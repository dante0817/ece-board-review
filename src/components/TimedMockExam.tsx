import { BOARD_CALCULATOR_POLICY } from '../data/boardCalculatorPolicy';
import { buildOptionOrders, orderedChoices, hasPositionSensitiveLanguage } from '../domain/assessment/optionOrder';
import { gradeResponses } from '../domain/assessment/grading';
import { makeAttemptId } from '../domain/assessment/attemptId';
import { AppArtwork } from './common/AppArtwork';
import { CalculatorTechniqueCard } from './CalculatorTechniqueCard';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useReview } from '../context/ReviewContext';
import { MockExamQuestion, MockExamConfig } from '../types';
import { generateMockExamQuestions, getAvailableMockQuestionCount, MOCK_EXAM_QUESTIONS, ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS } from '../data/mockExamQuestions';
import { ECE_BOARD_BLUEPRINT, inspectBoardPreview, assembleBoardPreview, calculateBoardAreaResults, getBoardAreaId, type BoardPreviewPlan } from '../domain/exam/boardBlueprint';
import { OFFICIAL_TOS_SOURCE } from '../data/officialTos';
import { CONTENT_REVIEW_FINDINGS_V1030 } from '../data/contentReviewV1030';
import { countQuestionQuality } from '../domain/exam/questionQuality';
import { inspectTosPreview, assembleTosPreview, tosToBoardPlan, getTosCourseId, type TosPreviewPlan } from '../domain/exam/tosCoverage';
import { Play, Pause, CheckCircle2, AlertTriangle, Flag, ChevronLeft, ChevronRight, Save, Check, AlertCircle } from 'lucide-react';

interface TimedMockExamProps {
  onBackToHistory?: () => void;
}

type ExamPhase = 'setup' | 'active' | 'review';
const STRICT_INTERRUPTION_NOTICE_KEY = 'ece_strict_interruption_notice_v1029';

export const TimedMockExam: React.FC<TimedMockExamProps> = ({ onBackToHistory }) => {
  const {
    subjects,
    currentSubject,
    addTestRecord,
    addReviewError,
    currentDateStr,
    startWeakSpotQuiz,
    learningPath,beginAssessment,finalizeAssessment,interruptAssessment,
  } = useReview();

  // Configuration state
  const [config, setConfig] = useState<MockExamConfig>({
    presetName: 'Mixed Practice Mock',
    subjectId: 'all',
    questionCount: 30,
    durationMinutes: 60,
    passingScorePercent: 70,
  });

  const blueprintPool = useMemo(() => [...MOCK_EXAM_QUESTIONS,...ALGEBRA_REFERENCE_ASSESSMENT_QUESTIONS], []);
  const qualityCounts = useMemo(() => countQuestionQuality(blueprintPool), [blueprintPool]);
  const previewPlan = useMemo(() => inspectBoardPreview(config.questionCount, blueprintPool), [config.questionCount, blueprintPool]);
  const tosPreviewPlan = useMemo(() => inspectTosPreview(config.questionCount, blueprintPool), [config.questionCount, blueprintPool]);
  const availableUniqueQuestions = config.subjectId === 'tos-preview' ? tosPreviewPlan.selectedQuestions
    : config.subjectId === 'board-preview' ? previewPlan.selectedQuestions : getAvailableMockQuestionCount(config.subjectId);
  const effectiveQuestionCount = Math.min(config.questionCount, availableUniqueQuestions);

  // Exam phase
  const [phase, setPhase] = useState<ExamPhase>('setup');
  const [wasStrictInterrupted, setWasStrictInterrupted] = useState(() => {
    try {
      const interrupted = sessionStorage.getItem(STRICT_INTERRUPTION_NOTICE_KEY) === '1';
      sessionStorage.removeItem(STRICT_INTERRUPTION_NOTICE_KEY);
      return interrupted;
    } catch { return false; }
  });

  // Active exam state
  const [questions, setQuestions] = useState<MockExamQuestion[]>([]);
  const [activeBlueprintPlan, setActiveBlueprintPlan] = useState<BoardPreviewPlan | null>(null);
  const [activeTosPlan, setActiveTosPlan] = useState<TosPreviewPlan | null>(null);
  const [assessmentCondition, setAssessmentCondition] = useState<'study'|'strict'>(() => learningPath === 'board' ? 'strict' : 'study');
  const activeAssessmentRef = useRef(false);
  const [optionOrders, setOptionOrders] = useState<Record<string,string[]>>({});
  const [attemptId, setAttemptId] = useState<string>('');
  const [attemptStartedAt, setAttemptStartedAt] = useState<string>('');
  const [pausedSeconds, setPausedSeconds] = useState(0);
  const [assistanceUsed, setAssistanceUsed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // questionId -> optionId ('A'|'B'|'C'|'D')
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<string[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60 * 60);
  const [totalExamSeconds, setTotalExamSeconds] = useState<number>(60 * 60);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [scratchpadNotes, setScratchpadNotes] = useState<string>('');

  // Results & Review state
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'flagged' | 'correct'>('all');
  const [savedToRecords, setSavedToRecords] = useState<boolean>(false);
  const [addedErrorQuestionIds, setAddedErrorQuestionIds] = useState<string[]>([]);

  // Path determines the initial setup, never alters an exam once started.
  useEffect(() => { if (phase === 'setup') setAssessmentCondition(learningPath === 'board' ? 'strict' : 'study'); }, [learningPath]);

  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const deadlineRef = useRef<number | null>(null);

  // A browser refresh/close abandons the strict practice attempt; never resume old answers.
  // Session storage holds only a one-time notice, never an answer or an exam score.
  useEffect(() => {
    if (phase !== 'active' || assessmentCondition !== 'strict') return;
    const markInterruption = () => {
      if (!activeAssessmentRef.current) return;
      try { sessionStorage.setItem(STRICT_INTERRUPTION_NOTICE_KEY, '1'); } catch {}
    };
    window.addEventListener('pagehide', markInterruption);
    return () => window.removeEventListener('pagehide', markInterruption);
  }, [phase, assessmentCondition]);

  // A route/tab unmount can never retain uninterrupted strict status.
  useEffect(()=>()=>{if(activeAssessmentRef.current)interruptAssessment();},[interruptAssessment]);
  useEffect(()=>{
    if(phase!=='active'||assessmentCondition!=='strict')return;
    const confirmLeave=(event:BeforeUnloadEvent)=>{event.preventDefault();event.returnValue='';};
    window.addEventListener('beforeunload',confirmLeave);
    return ()=>window.removeEventListener('beforeunload',confirmLeave);
  },[phase,assessmentCondition]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Wall-clock countdown: hidden or background tabs cannot lengthen strict attempts.
  useEffect(() => {
    if (phase !== 'active' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const tick = () => {
      if (deadlineRef.current === null) return;
      const remaining = Math.max(0,Math.ceil((deadlineRef.current-Date.now())/1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        activeAssessmentRef.current=false;
        finalizeAssessment('timeout');
        setPhase('review');
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    document.addEventListener('visibilitychange',tick);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange',tick);
    };
  }, [phase,isPaused]);

  const toggleStudyPause = () => {
    if (assessmentCondition !== 'study' || phase !== 'active') return;
    if (isPaused) {
      deadlineRef.current = Date.now() + secondsRemaining*1000;
      setIsPaused(false);
    } else {
      const remaining=Math.max(0,Math.ceil(((deadlineRef.current??Date.now())-Date.now())/1000));
      setSecondsRemaining(remaining);
      deadlineRef.current=null;
      setIsPaused(true);
    }
  };

  useEffect(() => {
    if (phase !== 'active' || !isPaused) return;
    const id = setInterval(() => setPausedSeconds(value => value + 1), 1000);
    return () => clearInterval(id);
  }, [phase, isPaused]);

  // Start exam
  const handleStartExam = () => {
    const boardPreview = config.subjectId === 'board-preview' ? assembleBoardPreview(config.questionCount, blueprintPool) : null;
    const tosPreview = config.subjectId === 'tos-preview' ? assembleTosPreview(config.questionCount, blueprintPool) : null;
    const examQuestions = tosPreview?.questions ?? boardPreview?.questions ?? generateMockExamQuestions(config.questionCount, config.subjectId);
    if (!examQuestions.length) return;
    setActiveTosPlan(tosPreview?.plan ?? null);
    setActiveBlueprintPlan(boardPreview?.plan ?? (tosPreview ? tosToBoardPlan(tosPreview.plan,blueprintPool) : null));
    const durationSec = config.durationMinutes * 60;

    setQuestions(examQuestions);
    setOptionOrders(buildOptionOrders(examQuestions.map(q=>({...q,preserveOptionOrder:hasPositionSensitiveLanguage(q.question,q.explanation,q.boardTip,...q.options.map(option=>option.text))}))));
    const startedId=makeAttemptId();
    setWasStrictInterrupted(false);
    beginAssessment(startedId,assessmentCondition);
    activeAssessmentRef.current=true;
    setAttemptId(startedId);
    setAttemptStartedAt(new Date().toISOString());
    setPausedSeconds(0);
    setAssistanceUsed(false);
    setShowScratchpad(false);
    deadlineRef.current=Date.now()+durationSec*1000;
    setTotalExamSeconds(durationSec);
    setSecondsRemaining(durationSec);
    setUserAnswers({});
    setFlaggedQuestionIds([]);
    setCurrentIndex(0);
    setIsPaused(false);
    setShowSubmitConfirm(false);
    setSavedToRecords(false);
    setAddedErrorQuestionIds([]);
    setPhase('active');
  };

  // Auto submit when time runs out
  // User confirmed manual submission
  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false);
    activeAssessmentRef.current=false;
    finalizeAssessment('submitted');
    setPhase('review');
  };

  const handleExitAttempt=()=>{
    if(!window.confirm('End this attempt without saving a strict assessment result? Answers from this attempt will be discarded.'))return;
    activeAssessmentRef.current=false;
    interruptAssessment();
    setPhase('setup');
    setShowSubmitConfirm(false);
    setUserAnswers({});
  };

  // Answer selection
  const handleSelectAnswer = (optionId: string) => {
    if (phase !== 'active' || isPaused) return;
    // Background tabs may delay timer callbacks; the deadline still locks responses.
    if (deadlineRef.current !== null && Date.now() >= deadlineRef.current) {
      setSecondsRemaining(0);
      activeAssessmentRef.current = false;
      finalizeAssessment('timeout');
      setPhase('review');
      return;
    }
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  // Toggle flag
  const handleToggleFlag = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setFlaggedQuestionIds((prev) =>
      prev.includes(currentQ.id)
        ? prev.filter((id) => id !== currentQ.id)
        : [...prev, currentQ.id]
    );
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (questions.length === 0) {
      return {
        total: 0,
        answered: 0,
        unanswered: 0,
        flagged: 0,
        correct: 0,
        incorrect: 0,
        scorePercent: 0,
        timeSpentSeconds: 0,
        timeSpentMinutes: 0,
      };
    }

    let correctCount = 0;
    let answeredCount = 0;

    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (ans !== undefined) {
        answeredCount++;
        if (ans === q.correctOptionId) {
          correctCount++;
        }
      }
    });

    const unansweredCount = questions.length - answeredCount;
    const incorrectCount = answeredCount - correctCount;
    const score = Math.round((correctCount / questions.length) * 100);
    const timeSpent = totalExamSeconds - secondsRemaining;

    return {
      total: questions.length,
      answered: answeredCount,
      unanswered: unansweredCount,
      flagged: flaggedQuestionIds.length,
      correct: correctCount,
      incorrect: incorrectCount,
      scorePercent: score,
      timeSpentSeconds: timeSpent,
      timeSpentMinutes: Math.max(1, Math.round(timeSpent / 60)),
    };
  }, [questions, userAnswers, flaggedQuestionIds, totalExamSeconds, secondsRemaining]);

  // Topic breakdown
  const topicBreakdown = useMemo(() => {
    if (questions.length === 0) return [];
    const map: Record<
      string,
      { topicName: string; subjectName: string; total: number; correct: number }
    > = {};

    questions.forEach((q) => {
      if (!map[q.topicId]) {
        map[q.topicId] = {
          topicName: q.topicName,
          subjectName: q.subjectName,
          total: 0,
          correct: 0,
        };
      }
      map[q.topicId].total += 1;
      if (userAnswers[q.id] === q.correctOptionId) {
        map[q.topicId].correct += 1;
      }
    });

    return Object.entries(map).map(([topicId, val]) => ({
      topicId,
      topicName: val.topicName,
      subjectName: val.subjectName,
      total: val.total,
      correct: val.correct,
      percent: Math.round((val.correct / val.total) * 100),
    }));
  }, [questions, userAnswers]);

  // All four official areas are shown, including 'Not assessed' when the bank has no items.
  const examAreaResults = useMemo(() => calculateBoardAreaResults(questions,userAnswers,activeBlueprintPlan??undefined), [questions,userAnswers,activeBlueprintPlan]);
  const tosCourseResults = useMemo(() => activeTosPlan?.courses.map(course => {
    const subset=questions.filter(q=>getTosCourseId(q)===course.id);
    const correct=subset.filter(q=>userAnswers[q.id]===q.correctOptionId).length;
    return {courseId:course.id,areaId:course.areaId,name:course.name,requested:course.requested,
      questions:subset.length,correct,scorePercent:subset.length?Math.round(100*correct/subset.length):null};
  }),[activeTosPlan,questions,userAnswers]);

  // Save to test records
  const handleSaveToRecords = () => {
    if (savedToRecords) return;

    const uniqueTopicIds = Array.from(new Set(questions.map((q) => q.topicId)));
    const targetSubjectId = (config.subjectId === 'all' || config.subjectId === 'board-preview' || config.subjectId === 'tos-preview') ? 'mixed' : config.subjectId;
    const graded = gradeResponses(questions.map(q => ({
      questionId:q.id,topicId:q.topicId,subjectId:q.subjectId,
      correctOptionId:q.correctOptionId,options:q.options,
      questionFamilyId:q.questionFamilyId??q.id,examAreaId:getBoardAreaId(q.subjectId)??undefined,
    })), userAnswers, optionOrders);
    const itemResults = activeTosPlan ? graded.results.map(item=>({...item,
      tosCourseId:getTosCourseId(questions.find(q=>q.id===item.questionId)!) ?? undefined,
    })) : graded.results;

    addTestRecord({
      provenance:'automatic',assessmentMode:assessmentCondition,
      attemptId, startedAt:attemptStartedAt, assistanceUsed, pausedSeconds,
      selfAttested: assessmentCondition==='strict' && !assistanceUsed && pausedSeconds===0,
      curriculumVersion:'v10.16',
      scope:(config.subjectId==='all'||config.subjectId==='board-preview'||config.subjectId==='tos-preview')?'mixed':'subject',itemResults,
      examBlueprint:activeBlueprintPlan ? {id:activeBlueprintPlan.blueprintId,requestedQuestions:activeBlueprintPlan.requestedQuestions,
        deliveredQuestions:activeBlueprintPlan.selectedQuestions,missingQuestions:activeBlueprintPlan.missingQuestions,
        quotaComplete:activeBlueprintPlan.quotaComplete,boardRepresentative:false} : undefined,
      examAreaResults,
      tosCourseResults,
      subjectId: targetSubjectId,
      testType: `Timed Practice: ${activeTosPlan?'TOS Course-Quota Practice':activeBlueprintPlan?'Board-Weight Practice Preview':config.presetName} (${stats.scorePercent}%)`,
      date: currentDateStr,
      questions: graded.grade.questions,
      correct: graded.grade.correct,
      incorrect: graded.grade.incorrect,
      unanswered: graded.grade.unanswered,
      timeMinutes: stats.timeSpentMinutes,
      topicIds: uniqueTopicIds,
      notes: `${assessmentCondition==='strict'?'Self-attested strict practice':'Guided/study practice'}; ${activeTosPlan?`PRC course-target practice with ${activeTosPlan.missingQuestions} missing questions and provisional editorial mappings;`:activeBlueprintPlan?`PRC subject-weight practice with ${activeBlueprintPlan.missingQuestions} missing questions;`: 'timed mixed practice;'} NOT a complete board simulation. Answered: ${stats.answered}/${stats.total}, Time used: ${Math.floor(
        stats.timeSpentSeconds / 60
      )}m ${stats.timeSpentSeconds % 60}s.`,
    });

    setSavedToRecords(true);
  };

  // Add individual question to error log
  const handleAddQuestionToErrorLog = (q: MockExamQuestion) => {
    if (addedErrorQuestionIds.includes(q.id)) return;

    addReviewError({
      topicId: q.topicId,
      topicName: q.topicName,
      subjectId: q.subjectId,
      category: 'Wrong method',
      description: `Missed in Timed Mock Exam: "${q.question.slice(0, 100)}..." User selected: ${
        userAnswers[q.id] || 'Unanswered'
      }, Correct: ${q.correctOptionId}.`,
      solutionOrKeyFormula: q.keyFormula || q.explanation,
    });

    setAddedErrorQuestionIds((prev) => [...prev, q.id]);
  };

  // Format seconds as HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
        .toString()
        .padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Presets
  const presets = [
    {
      name: 'Mixed Practice Mock',
      questions: 50,
      duration: 120,
      desc: 'Unbalanced question bank for timed mixed practice only; NOT a blueprint-representative PRC exam.',
      badge: 'Practice Only',
    },
    {
      name: 'Comprehensive Mid-Term Mock',
      questions: 30,
      duration: 60,
      desc: 'Short cross-subject diagnostic. Actual coverage follows the available pool, not PRC subject quotas.',
      badge: 'Practice Only',
    },
    {
      name: 'Rapid Speed & Accuracy Drill',
      questions: 15,
      duration: 25,
      desc: 'Fast paced session emphasizing rapid formula recall and mental pacing.',
      badge: 'Speed Drill',
    },
  ];

  // --------------------------------------------------------------------------
  // RENDER: SETUP PHASE
  // --------------------------------------------------------------------------
  if (phase === 'setup') {
    return (
      <div className="bg-white border-2 border-stone-900 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-200">
        {wasStrictInterrupted && (
          <div role="alert" className="rounded-xl bg-amber-50 border border-amber-400 p-4 text-sm text-amber-950">
            <strong>Previous strict attempt interrupted.</strong> Refreshing or closing the page discarded its unanswered and unsaved responses. No examination result was recorded.
            <button type="button" className="ml-3 underline font-semibold" onClick={() => setWasStrictInterrupted(false)}>Dismiss</button>
          </div>
        )}
        <div className="border-b border-stone-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-600 mb-1">
              <AppArtwork name="star" inline className="w-4 h-4" />
              <span>Timed Practice & Board-Coverage Preview</span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Timed Practice Examination
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xl">
              Timed mixed practice with live countdown, question palette and detailed scoring. Coverage is not representative of the official PRC exam.
            </p>
          </div>

          {onBackToHistory && (
            <button
              type="button"
              onClick={onBackToHistory}
              className="text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-300 hover:bg-stone-50 px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto"
            >
              View Past Records
            </button>
          )}
        </div>

        {/* WEAK SPOT DIAGNOSTIC BANNER */}
        <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs app-artwork-tile">
              <AppArtwork name="target" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900">
                  Targeted Weak Spot Diagnostic Quiz
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  Error Log Driven
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Automatically analyzes your error logs to isolate the subjects with the highest error frequency and launches a focused test.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => startWeakSpotQuiz()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            <span>Launch Weak Spot Quiz</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
            1. Select Exam Preset
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presets.map((preset) => {
              const isSelected =
                config.presetName === preset.name &&
                config.questionCount === preset.questions &&
                config.durationMinutes === preset.duration;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      presetName: preset.name,
                      questionCount: preset.questions,
                      durationMinutes: preset.duration,
                    }))
                  }
                  className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-stone-900 bg-stone-50 shadow-xs'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {preset.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-900">
                      {preset.duration} mins
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 mb-1">{preset.name}</h3>
                  <p className="text-[11px] text-stone-500 leading-relaxed mb-3">
                    {preset.desc}
                  </p>
                  <div className="text-[11px] font-mono text-stone-700 flex items-center gap-3">
                    <span>{preset.questions} Questions</span>
                    <span>•</span>
                    <span>~{(preset.duration / preset.questions).toFixed(1)}m / Q</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Subject Scope
            </label>
            <select
              value={config.subjectId}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, subjectId: e.target.value,
                  presetName: e.target.value === 'tos-preview' ? 'TOS Course-Quota Practice' : e.target.value === 'board-preview' ? 'Board-Weight Coverage Preview' :
                    ['Board-Weight Coverage Preview','TOS Course-Quota Practice'].includes(prev.presetName) ? 'Mixed Practice Mock' : prev.presetName }))
              }
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white font-medium"
            >
              <option value="all">All Subjects — Unweighted Mixed Practice</option>
              <option value="board-preview">ECE Board Subject-Weight Practice — TOS Unverified (course level)</option>
              <option value="tos-preview">PRC TOS Course-Quota Practice — Coverage Limited</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Number of Questions
            </label>
            <select
              value={config.questionCount}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  presetName: 'Custom Mock',
                  questionCount: Number(e.target.value),
                }))
              }
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white font-medium font-mono"
            >
              <option value={10}>10 Questions (Quick Diagnostic)</option>
              <option value={15}>15 Questions (Speed Drill)</option>
              <option value={20}>20 Questions (Standard Quiz)</option>
              <option value={30}>30 Questions (Mid-Length)</option>
              <option value={50}>50 Questions (Mixed Practice Block)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Duration (Minutes)
            </label>
            <select
              value={config.durationMinutes}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  presetName: 'Custom Mock',
                  durationMinutes: Number(e.target.value),
                }))
              }
              className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white font-medium font-mono"
            >
              <option value={15}>15 Minutes</option>
              <option value={25}>25 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (1 Hour)</option>
              <option value={90}>90 Minutes (1.5 Hours)</option>
              <option value={120}>120 Minutes (2 Hours)</option>
            </select>
          </div>
        </div>

        {/* Question-bank integrity */}
        <div className="p-4 rounded-xl border border-stone-200 bg-white text-xs text-stone-700 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-stone-900">
            <AppArtwork name="shield" inline className="w-4 h-4 text-emerald-700" />
            <span>Question-bank integrity</span>
          </div>
          <p className="text-[11px] leading-relaxed text-stone-600">
            Ordinary mixed practice does not clone or cycle questions and is unweighted. Subject-weight practice allocates only the four board areas. TOS course-quota practice additionally reserves the official within-subject course targets, using only explicitly editorially mapped questions. Missing course questions are never filled from unrelated courses. Mapping and numerical keys are not formally peer-reviewed; neither practice mode certifies full TOS subtopics/difficulty or board readiness.
          </p>
          <div className="text-[11px] font-mono text-stone-700">
            {config.subjectId==='tos-preview'?'Questions mapped within course quotas':config.subjectId==='board-preview'?'Questions available within area quotas':'Unique question slots available for this scope'}: <strong>{availableUniqueQuestions}</strong>
          </div>
          {config.subjectId === 'board-preview' && (
            <div className="mt-3 space-y-2">
              <p className="font-semibold">{ECE_BOARD_BLUEPRINT.name}: target {config.questionCount}, selectable {previewPlan.selectedQuestions}, shortage {previewPlan.missingQuestions}. Subject quotas can now be filled for supported lengths; within-subject TOS coverage is not verified. This remains practice, not a board simulation.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {previewPlan.areas.map(area=><div key={area.areaId} className={`rounded-lg border p-2 ${area.shortage?'border-amber-300 bg-amber-50':'border-emerald-200 bg-emerald-50'}`}>
                  <strong>{area.name} ({area.weightPercent}%)</strong>
                  <div>Target {area.requested} · Available {area.available} · Selected {area.selected} · Missing {area.shortage}<div className="text-[10px] text-stone-600">{area.distinctTopicCount} topic labels · {area.newFamilyCount} original question families ({area.newVariants} numerical variants) — not certified TOS coverage</div></div>
                </div>)}
              </div>
              <p className="text-[11px]">Official subject weights only. Within-subject Table of Specifications, question validation, and exam conditions are not yet established. <a href={ECE_BOARD_BLUEPRINT.url} target="_blank" rel="noopener noreferrer" className="underline">PRC October 2026 program</a></p>
            </div>
          )}
          {config.subjectId === 'tos-preview' && (
            <div className="mt-3 space-y-2 border-t border-stone-200 pt-3">
              <p className="font-semibold text-amber-900">Official enhanced TOS (Resolution No. 10 s. 2022, Annex A): requested {config.questionCount}, course-mapped selectable {tosPreviewPlan.selectedQuestions}, missing {tosPreviewPlan.missingQuestions}. {tosPreviewPlan.unmappedQuestionCount} source questions lack a defensible course assignment.</p>
              <p className="text-[11px]">Question review provenance in the current bank: {qualityCounts['numeric-fixture-checked']} variants checked against separately authored numeric fixtures, {qualityCounts['generator-checked']} generator-checked variants, and {qualityCounts['manual-review-required']} other questions awaiting independent mathematical review. No group has PRC or expert approval.</p>
              <p className="text-[11px]">This is a PROVISIONAL course-level alignment, not an approved PRC question set. Subtopics, difficulty distribution, answer explanations, and independent examination conditions remain unverified. Some mapped practice families have documented subtopic concerns; course assignment must not be read as subtopic evidence. <a className="underline font-bold" href={OFFICIAL_TOS_SOURCE.url} target="_blank" rel="noopener noreferrer">Read official Annex A</a>.</p>
              <details className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-900">
                <summary className="cursor-pointer font-semibold">Editorial subtopic review flags ({CONTENT_REVIEW_FINDINGS_V1030.length} families, 10 numerical variants)</summary>
                <p className="mt-1">Flags do not establish incorrect arithmetic. They identify course/subtopic mapping that is not yet defensible under Annex A. No flagged item is approved as PRC TOS coverage.</p>
                <ul className="mt-1 list-disc pl-4 space-y-1">
                  {CONTENT_REVIEW_FINDINGS_V1030.map(flag=><li key={flag.familyId}><strong>{flag.familyId}</strong> ({flag.severity}): {flag.finding}</li>)}
                </ul>
              </details>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ECE_BOARD_BLUEPRINT.areas.map(area=>{
                  const courses=tosPreviewPlan.courses.filter(course=>course.areaId===area.id);
                  const group=tosPreviewPlan.areas.find(a=>a.areaId===area.id)!;
                  return <div key={area.id} className="rounded-lg border border-stone-200 bg-stone-50 p-2 space-y-1">
                    <p className="font-bold">{area.name} · {group.selected}/{group.requested} mapped slots</p>
                    {courses.map(course=><div key={course.id} className="flex justify-between gap-2 text-[10px]">
                      <span>{course.name} ({course.officialItems}/100)</span>
                      <span className={course.shortage?'font-semibold text-amber-800':'text-stone-600'}>{course.selected}/{course.requested} · {course.knownFamilies} families</span>
                    </div>)}
                  </div>;
                })}
              </div>
            </div>
          )}
          {config.questionCount > availableUniqueQuestions && (
            <div className="flex items-start gap-1.5 text-[11px] text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Requested {config.questionCount}, but this scope can deliver only {effectiveQuestionCount}. The remaining {config.questionCount-effectiveQuestionCount} will not be fabricated or filled from unrelated areas.
              </span>
            </div>
          )}
        </div>

        {/* Board Exam Rules Reminder */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-700" />
            <span>App Timed-Practice Guidelines (not official PRC examination rules):</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-amber-900/90 text-[11px]">
            <li>1 point per question, no penalty for wrong answers (attempt all questions).</li>
            <li>This is an app practice target, not an official board passing determination; official subject-specific requirements apply.</li>
            <li>The countdown uses actual elapsed clock time; a backgrounded tab does not extend the attempt. On timeout, the app opens the results screen; save the result to retain it.</li>
            <li>You can flag challenging questions and jump to any item using the Question Palette.</li>
          </ul>
        </div>

        <section className="bg-white rounded-xl border border-stone-200 p-4 space-y-2">
          <div className="text-xs font-bold text-stone-800">Assessment conditions <span className="font-normal text-stone-500">(suggested for {learningPath === 'board' ? 'ECE Board Preparation' : 'Guided Learning'}; either is available)</span></div>
          <div className="flex gap-2">
            <button type="button" onClick={()=>setAssessmentCondition('study')} className={`flex-1 p-2 rounded border text-xs font-semibold ${assessmentCondition==='study'?'bg-amber-50 border-amber-400':'border-stone-200'}`}>Study Mode</button>
            <button type="button" onClick={()=>setAssessmentCondition('strict')} className={`flex-1 p-2 rounded border text-xs font-semibold ${assessmentCondition==='strict'?'bg-amber-50 border-amber-400':'border-stone-200'}`}>Strict Assessment</button>
          </div>
          <p className="text-xs text-stone-600">{assessmentCondition==='strict'?'No pause or in-app formula sheet; completion is self-attested and cannot prove off-screen independence.':'Pause and reference sheet are permitted; results count as study evidence only.'}</p>
        </section>
        {/* Start Button */}
        <button
          type="button"
          onClick={handleStartExam}
          disabled={effectiveQuestionCount === 0}
          className="w-full py-4 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed text-amber-400 font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer border border-stone-900 hover:border-amber-400/40"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>START {config.subjectId==='tos-preview'?'TOS COURSE-QUOTA PRACTICE':config.subjectId==='board-preview'?'BOARD-WEIGHT PRACTICE':'TIMED PRACTICE'} ({effectiveQuestionCount} UNIQUE QUESTIONS • {config.durationMinutes} MINS)</span>
        </button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: ACTIVE EXAM SIMULATION WITH COUNTDOWN
  // --------------------------------------------------------------------------
  if (phase === 'active') {
    const currentQ = questions[currentIndex];
    const isFlagged = currentQ ? flaggedQuestionIds.includes(currentQ.id) : false;
    const currentAnswer = currentQ ? userAnswers[currentQ.id] : undefined;

    // Timer urgency styling
    const isUnderTenMins = secondsRemaining <= 600;
    const isUnderTwoMins = secondsRemaining <= 120;
    const timerBg = isUnderTwoMins
      ? 'bg-rose-600 text-white animate-pulse'
      : isUnderTenMins
      ? 'bg-amber-500 text-stone-950 font-black'
      : 'bg-stone-900 text-amber-400';

    const percentTimeRemaining = Math.max(
      0,
      Math.min(100, (secondsRemaining / totalExamSeconds) * 100)
    );

    return (
      <div className="space-y-4 animate-in fade-in duration-150">
        <div className="flex items-center justify-between bg-amber-50 text-amber-950 border border-amber-200 rounded-xl p-3 text-xs">
          <span>{assessmentCondition==='strict'?'Strict self-attested practice: in-app tutor, formula and calculator guides are locked.':'Study mode: assistance is available and recorded separately.'}</span>
          <button type="button" onClick={handleExitAttempt} className="shrink-0 ml-3 border border-amber-700 rounded-lg px-3 py-1.5 font-bold hover:bg-amber-100">End &amp; Exit</button>
        </div>
        {/* Sticky Control & Countdown Bar */}
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 shadow-md border border-stone-800 sticky top-4 z-20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`px-3.5 py-1.5 rounded-xl font-mono text-base sm:text-lg font-black tracking-wider flex items-center gap-2 transition-all shadow-xs ${timerBg}`}
              >
                <AppArtwork name="timer" inline className="w-4 h-4" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>

              <button
                type="button"
                onClick={toggleStudyPause}
                disabled={assessmentCondition==='strict'}
                className="text-xs px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={isPaused ? 'Resume Timer' : 'Pause Timer'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-stone-400">Answered:</span>
              <span className="font-bold text-amber-400">
                {stats.answered} / {stats.total}
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-400">Flagged:</span>
              <span className="font-bold text-amber-300">{stats.flagged}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { if (assessmentCondition==='study') { setShowScratchpad((prev) => !prev); setAssistanceUsed(true); } }}
                disabled={assessmentCondition==='strict'}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showScratchpad
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <AppArtwork name="matrix" inline className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Formula Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finish & Submit</span>
              </button>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-1000 ${
                isUnderTwoMins
                  ? 'bg-rose-500'
                  : isUnderTenMins
                  ? 'bg-amber-500'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${percentTimeRemaining}%` }}
            />
          </div>
        </div>

        {/* Paused Overlay Modal */}
        {isPaused && (
          <div className="bg-stone-900/90 backdrop-blur-xs border-2 border-amber-400 text-stone-100 rounded-2xl p-8 text-center space-y-4 animate-in fade-in">
            <Pause className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-xl font-black">Examination Paused</h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto">
              The countdown timer is currently paused. Questions are hidden during pause to maintain board exam integrity.
            </p>
            <button
              type="button"
              onClick={toggleStudyPause}
              className="px-6 py-2.5 rounded-xl bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 transition-all cursor-pointer"
            >
              Resume Examination
            </button>
          </div>
        )}

        {/* Exam Body (When not paused) */}
        {!isPaused && currentQ && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Question Area (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white border-2 border-stone-900 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
                {/* Question Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-stone-900 font-mono">
                      QUESTION {currentIndex + 1} OF {questions.length}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {currentQ.subjectName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {currentQ.topicName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleFlag}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isFlagged
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'text-stone-500 hover:bg-stone-100 border border-transparent'
                    }`}
                  >
                    <Flag
                      className={`w-3.5 h-3.5 ${
                        isFlagged ? 'fill-amber-600 text-amber-600' : 'text-stone-400'
                      }`}
                    />
                    <span>{isFlagged ? 'Flagged for Review' : 'Mark for Review'}</span>
                  </button>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base font-semibold text-stone-900 leading-relaxed whitespace-pre-line">
                  {currentQ.question}
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2.5 pt-2">
                  {orderedChoices(currentQ.options,optionOrders[currentQ.id] ?? currentQ.options.map(o=>o.id)).map((opt,displayIndex) => {
                    const isSelected = currentAnswer === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectAnswer(opt.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'border-stone-900 bg-amber-50/50 shadow-xs'
                            : 'border-stone-200 hover:border-stone-400 bg-white'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-stone-900 text-amber-400'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {String.fromCharCode(65+displayIndex)}
                        </div>
                        <span
                          className={`text-xs sm:text-sm ${
                            isSelected ? 'font-bold text-stone-950' : 'text-stone-800'
                          }`}
                        >
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-5">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs flex items-center gap-1.5 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserAnswers((prev) => {
                        const copy = { ...prev };
                        delete copy[currentQ.id];
                        return copy;
                      });
                    }}
                    className="text-xs text-stone-500 hover:text-rose-600 font-medium transition-colors"
                  >
                    Clear Response
                  </button>

                  <button
                    type="button"
                    disabled={currentIndex === questions.length - 1}
                    onClick={() =>
                      setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                    }
                    className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Optional Formula Sheet / Scratchpad */}
              {showScratchpad && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                      <AppArtwork name="book" inline className="w-4 h-4 text-amber-700" />
                      <span>Exam Formula Reference Sheet</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowScratchpad(false)}
                      className="text-amber-800 hover:text-amber-950 text-xs font-bold"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono text-stone-800">
                    <div className="bg-white p-3 rounded-lg border border-amber-200/80">
                      <div className="font-bold text-stone-900 mb-0.5">Arithmetic Progression:</div>
                      <div>a_n = a₁ + (n-1)d</div>
                      <div>S_n = (n/2)[2a₁ + (n-1)d]</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200/80">
                      <div className="font-bold text-stone-900 mb-0.5">Geometric Progression:</div>
                      <div>a_n = a₁ · r^(n-1)</div>
                      <div>S_∞ = a₁ / (1 - r) for |r| &lt; 1</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200/80">
                      <div className="font-bold text-stone-900 mb-0.5">Electronics / Op-Amp:</div>
                      <div>A_v(inv) = -R_f / R_in</div>
                      <div>A_v(non-inv) = 1 + R_f / R_in</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-amber-200/80">
                      <div className="font-bold text-stone-900 mb-0.5">Communications:</div>
                      <div>P_total = P_c · [1 + m²/2]</div>
                      <div>BW(Carson) = 2(Δf + f_m)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Question Palette & Navigator (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Question Palette
                  </h3>
                  <span className="text-[11px] text-stone-500 font-mono">
                    {stats.answered} answered / {questions.length}
                  </span>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-stone-900 text-amber-400 font-mono text-[9px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-400 text-amber-900 font-mono text-[9px] flex items-center justify-center font-bold">
                      ⚑
                    </span>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded bg-white border border-stone-300 text-stone-400 font-mono text-[9px] flex items-center justify-center">
                      —
                    </span>
                    <span>Unanswered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded ring-2 ring-amber-500 bg-amber-50"></span>
                    <span>Current</span>
                  </div>
                </div>

                {/* Grid Buttons */}
                <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto p-1">
                  {questions.map((q, idx) => {
                    const isAns = userAnswers[q.id] !== undefined;
                    const isFlg = flaggedQuestionIds.includes(q.id);
                    const isCurr = idx === currentIndex;

                    let btnClass = 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400';
                    if (isAns) {
                      btnClass = 'bg-stone-900 text-stone-50 font-bold border-stone-900';
                    }
                    if (isFlg) {
                      btnClass = 'bg-amber-100 border-2 border-amber-500 text-amber-950 font-black';
                    }
                    if (isCurr) {
                      btnClass += ' ring-2 ring-amber-500 ring-offset-1';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-9 rounded-lg font-mono text-xs font-bold transition-all relative flex items-center justify-center cursor-pointer ${btnClass}`}
                      >
                        <span>{idx + 1}</span>
                        {isFlg && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Finish Button */}
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(true)}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Review & Submit Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border-2 border-stone-900 shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Confirm Exam Submission</h3>
                  <p className="text-xs text-stone-500">
                    Are you sure you want to finish your timed examination now?
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-600">Total Questions:</span>
                  <span className="font-bold text-stone-900">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Answered:</span>
                  <span className="font-bold text-emerald-700">{stats.answered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Unanswered (Blank):</span>
                  <span className="font-bold text-rose-700">{stats.unanswered}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Flagged for Review:</span>
                  <span className="font-bold text-amber-600">{stats.flagged}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200">
                  <span className="text-stone-600">Time Remaining:</span>
                  <span className="font-bold text-stone-900">{formatTime(secondsRemaining)}</span>
                </div>
              </div>

              {stats.unanswered > 0 && (
                <p className="text-xs text-rose-600 font-semibold italic">
                  Note: You have {stats.unanswered} unanswered question{stats.unanswered === 1 ? '' : 's'}. Unanswered questions will receive 0 points.
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition-colors"
                >
                  Return to Exam
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs transition-colors shadow-sm"
                >
                  Submit & View Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER: REVIEW & RESULTS SCORECARD PHASE
  // --------------------------------------------------------------------------
  const isPassing = stats.scorePercent >= config.passingScorePercent;
  const isDistinction = stats.scorePercent >= 90;

  const filteredQuestions = questions.filter((q) => {
    const isAns = userAnswers[q.id] !== undefined;
    const isCorr = userAnswers[q.id] === q.correctOptionId;
    const isFlg = flaggedQuestionIds.includes(q.id);

    if (reviewFilter === 'incorrect') return !isCorr;
    if (reviewFilter === 'correct') return isCorr;
    if (reviewFilter === 'flagged') return isFlg;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Scorecard Hero Banner */}
      <div className="bg-stone-900 text-stone-50 rounded-2xl p-6 sm:p-8 border-2 border-stone-900 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isDistinction
                    ? 'bg-emerald-400 text-stone-950 font-black'
                    : isPassing
                    ? 'bg-amber-400 text-stone-950 font-bold'
                    : 'bg-rose-500 text-white font-bold'
                }`}
              >
                {isDistinction
                  ? 'High Practice Accuracy'
                  : isPassing
                  ? 'Practice Target Met (Not Board Readiness)'
                  : 'Below Practice Target (Review Suggested)'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {config.presetName} Results
            </h2>
            <p className="text-xs text-stone-400">
              Exam completed in {Math.floor(stats.timeSpentSeconds / 60)}m {stats.timeSpentSeconds % 60}s • Practice target: {config.passingScorePercent}% • Not an official passing decision
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 bg-stone-800/80 p-4 rounded-xl border border-stone-700/60 self-start lg:self-auto">
            <div className="text-right">
              <div
                className={`text-4xl sm:text-5xl font-mono font-black ${
                  isDistinction
                    ? 'text-emerald-400'
                    : isPassing
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {stats.scorePercent}%
              </div>
              <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                {stats.correct} / {stats.total} points
              </div>
            </div>

            <div className="border-l border-stone-700 pl-4 space-y-1 text-xs font-mono">
              <div className="text-emerald-400 font-semibold">✓ {stats.correct} Correct</div>
              <div className="text-rose-400 font-semibold">✕ {stats.incorrect} Incorrect</div>
              <div className="text-stone-400 font-semibold">○ {stats.unanswered} Blank</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-stone-800">
          <button
            type="button"
            onClick={handleSaveToRecords}
            disabled={savedToRecords}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-emerald-600 disabled:text-white text-stone-950 font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            {savedToRecords ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to Test Records!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Practice Result to Test History</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setPhase('setup')}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
            <span>Retake or Configure New Mock</span>
          </button>

          {onBackToHistory && (
            <button
              type="button"
              onClick={onBackToHistory}
              className="px-4 py-2.5 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 font-bold text-xs transition-colors cursor-pointer ml-auto"
            >
              Back to Recorded Tests
            </button>
          )}
        </div>
      </div>

      {/* Subject-area diagnostics, including missing evidence. */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider">ECE Subject-Area Diagnostics</h3>
        <p className="text-xs text-stone-600">Practice accuracy only; a zero-question area is Not assessed, not 0%. No licensure pass/fail is calculated. {activeBlueprintPlan && `Preview target ${activeBlueprintPlan.requestedQuestions}, delivered ${activeBlueprintPlan.selectedQuestions}, missing ${activeBlueprintPlan.missingQuestions}.`}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {examAreaResults.map(area=><div key={area.areaId} className="border border-stone-200 rounded-xl bg-stone-50 p-3 text-xs space-y-1">
            <div className="font-bold text-stone-900">{area.name} · {area.weightPercent}% board area</div>
            <div className="font-mono">{area.questions ? `${area.correct}/${area.questions} (${area.scorePercent}%)` : 'Not assessed — no questions'}</div>
            {activeBlueprintPlan && <div className="text-amber-800">Target {area.requestedQuestions} · Available {area.availableQuestions} · Missing {Math.max(0,area.requestedQuestions-area.questions)}</div>}
            {area.questions>0 && <div className="text-stone-500">{area.incorrect} incorrect · {area.unanswered} unanswered</div>}
          </div>)}
        </div>
      </section>

      {activeTosPlan && <section className="bg-white border border-amber-200 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider">TOS Course-Quota Diagnostics — Provisional Alignment</h3>
        <p className="text-xs text-stone-600">Actual questions {activeTosPlan.selectedQuestions}/{activeTosPlan.requestedQuestions}; {activeTosPlan.missingQuestions} missing, never substituted. Zero-question courses are Not assessed. Editorial category mapping does not establish difficulty, subtopic coverage, content review, or PRC approval.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{tosCourseResults?.filter(course=>course.requested>0).map(course=><div className="border rounded-lg p-2 text-xs" key={course.courseId}>
          <div className="font-semibold">{course.name}</div>
          <div>Target {course.requested} · Delivered {course.questions} · {course.questions?`${course.correct}/${course.questions} (${course.scorePercent}%)`:'Not assessed'}</div>
        </div>)}</div>
      </section>}

      {/* Topic Diagnostics Breakdown */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <AppArtwork name="graph" inline className="w-4 h-4 text-amber-600" />
          <span>Topic Diagnostic Performance Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topicBreakdown.map((item) => (
            <div
              key={item.topicId}
              className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-900 truncate max-w-[200px]" title={item.topicName}>
                  {item.topicName}
                </span>
                <span className="font-mono font-bold text-stone-700">
                  {item.correct} / {item.total} ({item.percent}%)
                </span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    item.percent >= 90
                      ? 'bg-emerald-600'
                      : item.percent >= 70
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question-by-Question Review */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Question-by-Question Diagnostic Review ({questions.length})
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Review full step-by-step derivations, key formulas, and board trap warnings.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'all', label: `All (${questions.length})` },
                { id: 'incorrect', label: `Incorrect (${stats.incorrect + stats.unanswered})` },
                { id: 'flagged', label: `Flagged (${stats.flagged})` },
                { id: 'correct', label: `Correct (${stats.correct})` },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setReviewFilter(f.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  reviewFilter === f.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of reviewed questions */}
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const userAns = userAnswers[q.id];
            const isCorrect = userAns === q.correctOptionId;
            const isAddedToErrors = addedErrorQuestionIds.includes(q.id);

            return (
              <div
                key={q.id}
                className={`p-5 rounded-2xl border-2 transition-all space-y-4 ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-stone-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center ${
                        isCorrect
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {isCorrect ? '✓' : '✕'}
                    </span>
                    <span className="font-bold text-stone-900 text-xs font-mono">
                      Question #{questions.findIndex((orig) => orig.id === q.id) + 1}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {q.topicName}
                    </span>
                  </div>

                  {!isCorrect && (
                    <button
                      type="button"
                      onClick={() => handleAddQuestionToErrorLog(q)}
                      disabled={isAddedToErrors}
                      className="text-xs px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-rose-100 hover:bg-rose-200 text-rose-900 disabled:bg-stone-100 disabled:text-stone-500"
                    >
                      {isAddedToErrors ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Logged in Error Tracker</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Add to Error Log</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Question statement */}
                <div className="text-sm font-semibold text-stone-900 whitespace-pre-line">
                  {q.question}
                </div>

                {/* Options with highlighting */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt) => {
                    const isUserChoice = userAns === opt.id;
                    const isTargetCorrect = q.correctOptionId === opt.id;

                    let optClass = 'border-stone-200 bg-white text-stone-700';
                    if (isTargetCorrect) {
                      optClass = 'border-emerald-600 bg-emerald-100/70 text-emerald-950 font-bold';
                    } else if (isUserChoice && !isTargetCorrect) {
                      optClass = 'border-rose-500 bg-rose-100/70 text-rose-950 font-bold';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border-2 flex items-start gap-2 ${optClass}`}
                      >
                        <span className="font-mono font-bold w-5 h-5 rounded bg-black/5 flex items-center justify-center shrink-0">
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                        {isTargetCorrect && (
                          <span className="ml-auto text-[10px] font-extrabold text-emerald-800 uppercase">
                            Correct
                          </span>
                        )}
                        {isUserChoice && !isTargetCorrect && (
                          <span className="ml-auto text-[10px] font-extrabold text-rose-800 uppercase">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <CalculatorTechniqueCard key={q.id} questionId={q.id} question={q} disclosure="after-answer" />

                {/* Step by step derivation & Key formula */}
                <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2 text-xs">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <AppArtwork name="book" inline className="w-4 h-4 text-amber-600" />
                    <span>Step-by-Step Solution & Derivation:</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed font-sans whitespace-pre-line pl-5 border-l-2 border-amber-400">
                    {q.explanation}
                  </p>

                  {q.keyFormula && (
                    <div className="mt-2 text-[11px] font-mono font-bold text-stone-800 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      Key Formula: {q.keyFormula}
                    </div>
                  )}

                  {q.boardTip && (
                    <div className="text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 flex items-start gap-2">
                      <span className="font-bold shrink-0">PRC Board Tip:</span>
                      <span>{q.boardTip}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
