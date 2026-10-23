import { AppArtwork } from './common/AppArtwork';
import React, { useMemo, useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { triggerDailyGoalConfetti } from '../utils/confetti';
import { CheckCircle2, Play, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { MasteryLevel, Topic } from '../types';

interface TodayReviewEntry {
  id: string;
  topicId: string;
  topicName: string;
  subjectName?: string;
  date: string;
  type: string;
  score: number;
  questionsAttempted: number;
  questionsCorrect: number;
  timeSpentMinutes: number;
}

export const TodayTargetVisualizer: React.FC = () => {
  const {
    subjects,
    dailyTarget,
    setDailyTarget,
    userProfile,
    totalMinutesStudiedToday,
    currentDateStr,
    startReview,
    completeReview,
    priorityReviewTopic,
    allTopics,
    incrementDailySessions,
    incrementDailyQuestions,
  } = useReview();

  const [showSessionsList, setShowSessionsList] = useState<boolean>(true);

  // 1. Calculate completions directly from review_sessions / activityHistory entries made today
  const todayReviewSessions = useMemo<TodayReviewEntry[]>(() => {
    const list: TodayReviewEntry[] = [];

    // Scan all topics for activity history entries recorded with today's date
    subjects.forEach((subj) => {
      subj.groups.forEach((grp) => {
        grp.topics.forEach((topic) => {
          (topic.activityHistory || []).forEach((act) => {
            if (act.date === currentDateStr) {
              list.push({
                id: act.id,
                topicId: topic.id,
                topicName: topic.name,
                subjectName: subj.name,
                date: act.date,
                type: act.type,
                score: act.score,
                questionsAttempted: act.questionsAttempted || 0,
                questionsCorrect: act.questionsCorrect || 0,
                timeSpentMinutes: act.timeSpentMinutes || 0,
              });
            }
          });
        });
      });
    });

    // Also check localStorage for any direct review_sessions array entries
    try {
      const stored = localStorage.getItem('review_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((s: TodayReviewEntry) => {
            if (s.date === currentDateStr && !list.some((existing) => existing.id === s.id)) {
              list.push(s);
            }
          });
        }
      }
    } catch {
      // ignore parse errors
    }

    return list;
  }, [subjects, currentDateStr]);

  // Explicit Today's Target: 2 review sessions, 40 questions (or synced to dailyTarget if customized)
  const targetSessions = dailyTarget.targetSessions || 2;
  const targetQuestions = dailyTarget.targetQuestions || 40;
  const targetMinutes = dailyTarget.targetMinutes || userProfile.dailyTargetMinutes || 60;

  // Completions calculated from today's entries (synchronized with dailyTarget counters)
  const sessionsFromEntries = todayReviewSessions.length;
  const questionsFromEntries = todayReviewSessions.reduce(
    (sum, entry) => sum + entry.questionsAttempted,
    0
  );

  const completedSessions = Math.max(dailyTarget.completedSessionsToday, sessionsFromEntries);
  const completedQuestions = Math.max(dailyTarget.completedQuestionsToday, questionsFromEntries);
  const completedMinutes = totalMinutesStudiedToday;

  // Percentage calculations
  const sessionPercent = Math.min(100, Math.round((completedSessions / Math.max(1, targetSessions)) * 100));
  const questionPercent = Math.min(100, Math.round((completedQuestions / Math.max(1, targetQuestions)) * 100));
  const minutePercent = Math.min(100, Math.round((completedMinutes / Math.max(1, targetMinutes)) * 100));
  const overallScore = Math.min(100, Math.round(sessionPercent * 0.5 + questionPercent * 0.5));
  const isTargetAchieved = completedSessions >= targetSessions && completedQuestions >= targetQuestions;

  // SVG Progress Ring Geometry
  // Outer Ring (Sessions - Amber): radius = 58, inner radius = 44 (Questions - Emerald)
  const outerR = 58;
  const outerCircumference = 2 * Math.PI * outerR; // ~364.42
  const outerStrokeDashoffset =
    outerCircumference - (Math.min(100, sessionPercent) / 100) * outerCircumference;

  const innerR = 44;
  const innerCircumference = 2 * Math.PI * innerR; // ~276.46
  const innerStrokeDashoffset =
    innerCircumference - (Math.min(100, questionPercent) / 100) * innerCircumference;

  // Quick Action: Log a completed session for the priority topic
  const handleQuickLogSession = (questionsCount = 20) => {
    const topicToReview = priorityReviewTopic || allTopics[0];
    if (!topicToReview) return;

    const correct = Math.max(1, Math.round(questionsCount * 0.88));
    const nextMastery = topicToReview.mastery
      ? (Math.min(5, topicToReview.mastery + 1) as MasteryLevel)
      : (3 as MasteryLevel);

    // Save to persistent review_sessions store
    const newEntry: TodayReviewEntry = {
      id: `session-${Date.now()}`,
      topicId: topicToReview.id,
      topicName: topicToReview.name,
      subjectName: 'Algebra',
      date: currentDateStr,
      type: 'Target Review Block',
      score: Math.round((correct / questionsCount) * 100),
      questionsAttempted: questionsCount,
      questionsCorrect: correct,
      timeSpentMinutes: Math.round(questionsCount * 1.2),
    };

    try {
      const stored = localStorage.getItem('review_sessions');
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem('review_sessions', JSON.stringify([...existing, newEntry]));
    } catch {
      // ignore
    }

    completeReview({
      topicId: topicToReview.id,
      questionsAttempted: questionsCount,
      questionsCorrect: correct,
      timeSpentMinutes: Math.round(questionsCount * 1.2),
      usedNotes: 'No',
      difficulty: 'Normal',
      independenceRating: 4,
      newMastery: nextMastery,
      nextReviewDate: '2026-09-16',
      notes: `Target review session completed for ${currentDateStr}`,
    });
  };

  const handleUndo = () => {
    incrementDailySessions(-1);
    incrementDailyQuestions(-20);

    try {
      const stored = localStorage.getItem('review_sessions');
      if (stored) {
        const existing: TodayReviewEntry[] = JSON.parse(stored);
        if (Array.isArray(existing) && existing.length > 0) {
          for (let i = existing.length - 1; i >= 0; i--) {
            if (existing[i].date === currentDateStr) {
              existing.splice(i, 1);
              localStorage.setItem('review_sessions', JSON.stringify(existing));
              break;
            }
          }
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-stone-900 text-stone-100 border border-stone-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Top Banner: Target Definition & Today's Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 app-artwork-tile">
            <AppArtwork name="target" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                Today's Target Tracker
              </h2>
              <span className="text-[10px] font-mono font-bold bg-amber-400 text-stone-950 px-2 py-0.5 rounded-full">
                2 Sessions • 40 Questions
              </span>
              {isTargetAchieved && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Target Complete
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Calculated dynamically from <strong className="text-stone-300">review_sessions</strong> completed on {currentDateStr}.
            </p>
          </div>
        </div>

        {/* Quick Review Launch Button */}
        {priorityReviewTopic && (
          <button
            onClick={() => startReview(priorityReviewTopic)}
            className="self-start sm:self-center px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Priority Session</span>
          </button>
        )}
      </div>

      {/* Main Visual Display: Progress Ring + Dual Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Visual Progress Ring (SVG Circular Dual Gauge) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center bg-stone-950/60 border border-stone-800/80 rounded-xl p-4">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              {/* Outer Ring Background (Sessions) */}
              <circle
                cx="70"
                cy="70"
                r={outerR}
                className="text-stone-800"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Outer Ring Active (Sessions - Amber) */}
              <circle
                cx="70"
                cy="70"
                r={outerR}
                className="text-amber-400 transition-all duration-700 ease-out"
                strokeWidth="8"
                strokeDasharray={outerCircumference}
                strokeDashoffset={outerStrokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />

              {/* Inner Ring Background (Questions) */}
              <circle
                cx="70"
                cy="70"
                r={innerR}
                className="text-stone-800/70"
                strokeWidth="7"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Inner Ring Active (Questions - Emerald) */}
              <circle
                cx="70"
                cy="70"
                r={innerR}
                className="text-emerald-400 transition-all duration-700 ease-out"
                strokeWidth="7"
                strokeDasharray={innerCircumference}
                strokeDashoffset={innerStrokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Ring Center Metrics */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {isTargetAchieved ? (
                <button
                  type="button"
                  onClick={() => triggerDailyGoalConfetti()}
                  className="flex flex-col items-center cursor-pointer group p-1 transition-transform active:scale-95"
                  title="Target Achieved! Click to launch confetti 🎉"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform animate-bounce" />
                  <span className="text-xs font-bold text-emerald-300 mt-0.5">100%</span>
                  <span className="text-[9px] font-mono uppercase text-emerald-400 flex items-center gap-1 font-bold">
                    <span>CONFETTI</span>
                    <AppArtwork name="star" inline className="w-2.5 h-2.5" />
                  </span>
                </button>
              ) : (
                <>
                  <span className="text-2xl font-black font-mono tracking-tight text-white">
                    {overallScore}%
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400">
                    TARGET
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Ring Legend */}
          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] font-medium">
            <div className="flex items-center gap-1.5 text-stone-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span>Sessions ({completedSessions}/{targetSessions})</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span>Questions ({completedQuestions}/{targetQuestions})</span>
            </div>
          </div>
        </div>

        {/* Dual Progress Bars & Detailed Metric Cards */}
        <div className="md:col-span-8 space-y-4">
          {/* BAR 1: REVIEW SESSIONS TRACKER */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Review Sessions Quota</span>
              </span>
              <span className="font-mono text-amber-400 font-bold text-xs">
                {completedSessions} of {targetSessions} Sessions ({sessionPercent}%)
              </span>
            </div>

            {/* Interactive Session Blocks Visualizer */}
            <div className="grid grid-cols-2 gap-2">
              {/* Session 1 Block */}
              <div
                className={`p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                  completedSessions >= 1
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-200'
                    : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    {completedSessions >= 1 ? (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-stone-600" />
                    )}
                    <span>Session 1: 20 Questions</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {completedSessions >= 1
                      ? 'Completed & logged'
                      : 'Pending completion'}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    completedSessions >= 1
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {completedSessions >= 1 ? 'DONE' : 'NEXT'}
                </span>
              </div>

              {/* Session 2 Block */}
              <div
                className={`p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                  completedSessions >= 2
                    ? 'bg-amber-400/10 border-amber-400/40 text-amber-200'
                    : 'bg-stone-900 border-stone-800 text-stone-400'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    {completedSessions >= 2 ? (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-stone-600" />
                    )}
                    <span>Session 2: 20 Questions</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {completedSessions >= 2
                      ? 'Completed & logged'
                      : 'Pending completion'}
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    completedSessions >= 2
                      ? 'bg-amber-400 text-stone-950'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {completedSessions >= 2 ? 'DONE' : 'WAITING'}
                </span>
              </div>
            </div>

            {/* Sessions Linear Progress Bar */}
            <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${sessionPercent}%` }}
              />
            </div>
          </div>

          {/* BAR 2: QUESTIONS SOLVED TRACKER */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                <AppArtwork name="star" inline className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Questions Solved Quota</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold text-xs">
                {completedQuestions} of {targetQuestions} Questions ({questionPercent}%)
              </span>
            </div>

            {/* Questions Linear Progress Bar */}
            <div className="h-3 w-full bg-stone-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  completedQuestions >= targetQuestions
                    ? 'bg-emerald-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${questionPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
              <span>
                {completedQuestions >= targetQuestions
                  ? 'Goal reached! 40+ board questions solved today.'
                  : `${Math.max(0, targetQuestions - completedQuestions)} questions remaining to satisfy today's 40Q goal.`}
              </span>
              <span className="font-mono font-semibold text-stone-300">
                Pacing: ~1.5 min/q
              </span>
            </div>
          </div>

          {/* BAR 3: DAILY STUDY GOAL (MINUTES) */}
          <div className="bg-stone-950/60 border border-stone-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Daily Study Goal (Minutes)</span>
              </span>
              <span className="font-mono text-amber-400 font-bold text-xs">
                {completedMinutes} of {targetMinutes} Mins ({minutePercent}%)
              </span>
            </div>

            {/* Minutes Linear Progress Bar */}
            <div className="h-3 w-full bg-stone-800 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  completedMinutes >= targetMinutes ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${minutePercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
              <span>
                {completedMinutes >= targetMinutes
                  ? `Goal achieved! ${completedMinutes}m invested in board exam prep today.`
                  : `${Math.max(0, targetMinutes - completedMinutes)} mins remaining to reach your user-set daily target.`}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-semibold text-stone-300">
                  Target: {targetMinutes}m
                </span>
                {completedMinutes >= targetMinutes && (
                  <button
                    type="button"
                    onClick={() => triggerDailyGoalConfetti()}
                    className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Launch celebration confetti"
                  >
                    <AppArtwork name="star" inline className="w-2.5 h-2.5" />
                    <span>Confetti 🎉</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Logging Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-1 border-t border-stone-800 text-xs">
        <div className="flex items-center gap-2 text-stone-400">
          <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick actions (auto-creates review entry):</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleQuickLogSession(20)}
            className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 rounded-lg font-semibold transition-colors flex items-center gap-1 border border-stone-700"
            title="Log 1 complete session with 20 questions"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log 1 Session (20 Qs)</span>
          </button>

          <button
            onClick={() => incrementDailyQuestions(5)}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-mono font-medium transition-colors border border-stone-700"
            title="Add 5 questions solved"
          >
            +5 Qs
          </button>

          <button
            onClick={() => incrementDailyQuestions(10)}
            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-mono font-medium transition-colors border border-stone-700"
            title="Add 10 questions solved"
          >
            +10 Qs
          </button>

          <button
            onClick={handleUndo}
            disabled={completedSessions === 0 && completedQuestions === 0}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 text-stone-400 hover:text-stone-200 rounded-lg transition-colors border border-stone-700"
            title="Undo / Decrement"
          >
            <AppArtwork name="cycle" inline className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE AUDIT: REVIEW SESSIONS ENTRIES LOGGED TODAY */}
      <div className="border-t border-stone-800 pt-3">
        <button
          type="button"
          onClick={() => setShowSessionsList(!showSessionsList)}
          className="w-full flex items-center justify-between text-xs text-stone-400 hover:text-stone-200 py-1 font-semibold transition-colors"
        >
          <div className="flex items-center gap-2">
            <AppArtwork name="book" inline className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Today's Completed Review Sessions ({todayReviewSessions.length} logged entries)
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-stone-400">
            <span>{showSessionsList ? 'Hide Entries' : 'Show Entries'}</span>
            {showSessionsList ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </div>
        </button>

        {showSessionsList && (
          <div className="mt-3">
            {todayReviewSessions.length === 0 ? (
              <div className="p-4 rounded-lg bg-stone-950/60 border border-stone-800 text-center text-xs text-stone-400 space-y-2">
                <p>
                  No review sessions recorded for today (<span className="font-mono text-stone-300">{currentDateStr}</span>) yet.
                </p>
                <p className="text-[11px] text-stone-500">
                  Target: 2 sessions of 20 questions each to maintain retention and hit your 45-day board exam pacing.
                </p>
                {priorityReviewTopic && (
                  <div className="pt-1">
                    <button
                      onClick={() => startReview(priorityReviewTopic)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs hover:bg-amber-300 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Review: {priorityReviewTopic.name}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="divide-y divide-stone-800 border border-stone-800 rounded-lg overflow-hidden bg-stone-950/70">
                  {todayReviewSessions.map((session, idx) => (
                    <div
                      key={session.id || idx}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-stone-800/40 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{session.topicName}</span>
                            <span className="text-[10px] text-stone-400 font-normal">
                              ({session.type || 'Practice Problems'})
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-3 font-mono">
                            <span>{session.questionsAttempted} questions</span>
                            <span>•</span>
                            <span>{session.questionsCorrect} correct ({session.score}%)</span>
                            {session.timeSpentMinutes > 0 && (
                              <>
                                <span>•</span>
                                <span>{session.timeSpentMinutes} mins</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-center">
                        Verified Entry
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 pt-1 font-mono">
                  <span>Total from entries today:</span>
                  <span className="text-amber-400 font-bold">
                    {sessionsFromEntries} sessions • {questionsFromEntries} questions
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
