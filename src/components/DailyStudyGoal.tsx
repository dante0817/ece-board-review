import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useReview } from '../context/ReviewContext';
import { triggerDailyGoalConfetti } from '../utils/confetti';
import { CheckCircle2, Play, Plus, Sliders, ChevronDown, ChevronUp, Check } from 'lucide-react';

export const DailyStudyGoal: React.FC = () => {
  const {
    dailyTarget,
    userProfile,
    totalMinutesStudiedToday,
    incrementDailyMinutes,
    setDailyTargetMinutes,
    priorityReviewTopic,
    startReview,
    currentDateStr,
    subjects,
    testRecords,
  } = useReview();

  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [customTargetInput, setCustomTargetInput] = useState<string>('');
  const [showActivityAudit, setShowActivityAudit] = useState<boolean>(false);
  const [showCustomLogModal, setShowCustomLogModal] = useState<boolean>(false);
  const [customLogMinutes, setCustomLogMinutes] = useState<number>(20);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User-set daily target in minutes (fallback to 60 if not set)
  const targetMinutes = dailyTarget.targetMinutes || userProfile.dailyTargetMinutes || 60;
  const minutesStudied = totalMinutesStudiedToday;

  // Percentage calculations
  const progressPercent = Math.min(
    100,
    Math.round((minutesStudied / Math.max(1, targetMinutes)) * 100)
  );
  const rawPercent = Math.round((minutesStudied / Math.max(1, targetMinutes)) * 100);
  const isGoalAchieved = minutesStudied >= targetMinutes;
  const minutesRemaining = Math.max(0, targetMinutes - minutesStudied);
  const bonusMinutes = Math.max(0, minutesStudied - targetMinutes);

  // Collect today's specific logged study sessions & tests for the breakdown audit
  const todayActivities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      type: string;
      minutes: number;
      source: 'Review Session' | 'Mock Test' | 'Manual Log';
      score?: number;
    }> = [];

    subjects.forEach((subj) => {
      subj.groups.forEach((grp) => {
        grp.topics.forEach((t) => {
          (t.activityHistory || []).forEach((act) => {
            if (act.date === currentDateStr) {
              list.push({
                id: act.id,
                title: t.name,
                type: act.type,
                minutes: act.timeSpentMinutes || 0,
                source: 'Review Session',
                score: act.score,
              });
            }
          });
        });
      });
    });

    testRecords.forEach((test) => {
      if (test.date === currentDateStr && test.timeMinutes) {
        list.push({
          id: test.id,
          title: test.testType,
          type: 'Diagnostic Mock',
          minutes: test.timeMinutes,
          source: 'Mock Test',
          score: test.scorePercent,
        });
      }
    });

    return list;
  }, [subjects, testRecords, currentDateStr]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectPreset = (mins: number) => {
    setDailyTargetMinutes(mins);
    setIsEditingTarget(false);
    showToast(`Daily study target updated to ${mins} minutes`);
  };

  const handleCustomTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customTargetInput, 10);
    if (!isNaN(val) && val >= 5 && val <= 600) {
      setDailyTargetMinutes(val);
      setIsEditingTarget(false);
      setCustomTargetInput('');
      showToast(`Daily study target updated to ${val} minutes`);
    }
  };

  const handleQuickAdd = (amount: number) => {
    incrementDailyMinutes(amount);
    showToast(`+${amount} minutes logged to today's study goal`);
  };

  const handleCustomLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLogMinutes > 0) {
      incrementDailyMinutes(customLogMinutes);
      setShowCustomLogModal(false);
      showToast(`+${customLogMinutes} minutes added to today's study log`);
    }
  };

  const handleUndo = () => {
    if (minutesStudied > 0) {
      incrementDailyMinutes(-15);
      showToast(`Reverted 15 minutes from today's study count`);
    }
  };

  // Helper formatting for readable time
  const formatTimeHoursMins = (totalMins: number) => {
    if (totalMins < 60) return `${totalMins}m`;
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  // Dynamic ECE board motivational message based on percentage
  const getMotivationalMessage = () => {
    if (minutesStudied === 0) {
      return {
        quote: 'Ready to kick off today’s board review? Consistency is the single biggest differentiator in topnotcher results.',
        tag: 'Ready to Start',
        color: 'text-stone-600',
      };
    }
    if (progressPercent < 50) {
      return {
        quote: `Great focus so far! You've completed ${minutesStudied} minutes — only ${minutesRemaining} minutes left to reach today's target.`,
        tag: 'Building Momentum',
        color: 'text-amber-800',
      };
    }
    if (progressPercent < 100) {
      return {
        quote: `Over halfway there! ${minutesRemaining} minutes remaining. Every solved problem reinforces your formula recall for the board exam.`,
        tag: 'Home Stretch',
        color: 'text-amber-900',
      };
    }
    return {
      quote: `Daily study goal conquered! 🎯 You’ve invested ${minutesStudied} minutes into board exam readiness today. Excellent discipline!`,
      tag: 'Goal Achieved',
      color: 'text-emerald-900',
    };
  };

  const motivation = getMotivationalMessage();

  // Track completion transition to trigger celebratory confetti animation
  const prevAchievedRef = useRef<boolean>(isGoalAchieved);

  useEffect(() => {
    // When transitioning from uncompleted to completed, trigger confetti!
    if (!prevAchievedRef.current && isGoalAchieved && minutesStudied > 0) {
      triggerDailyGoalConfetti();
      setToastMessage('🎉 Daily Study Goal achieved! Confetti celebration unleashed!');
    }
    prevAchievedRef.current = isGoalAchieved;
  }, [isGoalAchieved, minutesStudied]);

  return (
    <div
      id="daily-study-goal-card"
      className={`border rounded-xl p-5 sm:p-6 transition-all duration-300 shadow-xs ${
        isGoalAchieved
          ? 'bg-gradient-to-br from-white via-emerald-50/40 to-white border-emerald-300 ring-1 ring-emerald-400/20'
          : 'bg-white border-stone-200'
      }`}
    >
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="mb-4 p-2.5 bg-stone-900 text-stone-100 rounded-lg text-xs flex items-center justify-between shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[10px] text-stone-400 hover:text-white font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner: Title, Target Pill, and Goal Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isGoalAchieved ? () => triggerDailyGoalConfetti() : undefined}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
              isGoalAchieved
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs cursor-pointer active:scale-95 hover:rotate-6'
                : 'bg-amber-100 text-amber-800 border border-amber-200 cursor-default'
            }`}
            title={isGoalAchieved ? 'Goal Completed! Click to trigger confetti 🎉' : 'Daily Study Goal'}
          >
            {isGoalAchieved ? (
              <AppArtwork name="trophy" inline className="w-5 h-5 text-white animate-bounce" />
            ) : (
              <AppArtwork name="flame" inline className="w-5 h-5 text-amber-600" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                Daily Study Goal
              </h2>
              {isGoalAchieved ? (
                <button
                  type="button"
                  onClick={() => triggerDailyGoalConfetti()}
                  className="text-[11px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 group"
                  title="Click to launch celebration confetti!"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Target Smashed ({rawPercent}%)</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full group-hover:scale-105 transition-transform flex items-center gap-1">
                    <AppArtwork name="star" inline className="w-2.5 h-2.5" />
                    <span>Confetti</span>
                  </span>
                </button>
              ) : minutesStudied > 0 ? (
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AppArtwork name="timer" inline className="w-3 h-3 text-amber-700" />
                  <span>{minutesRemaining}m to go</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  0m logged today
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Tracks total minutes studied vs. your user-set daily target to build exam endurance
            </p>
          </div>
        </div>

        {/* User-set Target Pill & Quick Adjust Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-800">
            <AppArtwork name="target" inline className="w-3.5 h-3.5 text-amber-600" />
            <span>Target:</span>
            <strong className="text-stone-950 font-mono">{formatTimeHoursMins(targetMinutes)}</strong>
            <span className="text-stone-400 text-[10px]">({targetMinutes}m)</span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border ${
              isEditingTarget
                ? 'bg-stone-900 text-amber-400 border-stone-900'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
            title="Set daily study target"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Set Target</span>
          </button>
        </div>
      </div>

      {/* Target Setter Drawer (Inline pop-down when clicking "Set Target") */}
      {isEditingTarget && (
        <div className="mt-3 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Customize Your Daily Study Target</span>
            </span>
            <span className="text-[11px] text-stone-500 font-mono">Current: {targetMinutes} mins</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-600 mr-1">Quick Presets:</span>
            {[30, 45, 60, 90, 120, 180].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleSelectPreset(mins)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                  targetMinutes === mins
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                }`}
              >
                {formatTimeHoursMins(mins)} ({mins}m)
              </button>
            ))}
          </div>

          {/* Custom Minute Input */}
          <form onSubmit={handleCustomTargetSubmit} className="flex items-center gap-2 pt-1">
            <label className="text-xs text-stone-600 whitespace-nowrap">Or custom minutes:</label>
            <input
              type="number"
              min="5"
              max="600"
              step="5"
              placeholder="e.g. 75"
              value={customTargetInput}
              onChange={(e) => setCustomTargetInput(e.target.value)}
              className="w-24 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-900"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold rounded-lg transition-colors"
            >
              Save Goal
            </button>
            <button
              type="button"
              onClick={() => setIsEditingTarget(false)}
              className="px-2.5 py-1.5 text-stone-500 hover:text-stone-800 text-xs"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Main Metric Displays & Progress Bar */}
      <div className="pt-4 space-y-3">
        {/* Metric Headers Row */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Time Studied Today
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-stone-900">
                {minutesStudied}
              </span>
              <span className="text-sm sm:text-base font-semibold text-stone-500 font-mono">
                / {targetMinutes} mins
              </span>
              {minutesStudied >= 60 && (
                <span className="text-xs font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded ml-1 hidden sm:inline">
                  ({formatTimeHoursMins(minutesStudied)})
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span
                className={`text-2xl sm:text-3xl font-black font-mono ${
                  isGoalAchieved ? 'text-emerald-600' : 'text-stone-900'
                }`}
              >
                {rawPercent}%
              </span>
            </div>
            <div className="text-xs font-semibold text-stone-500">
              {isGoalAchieved ? (
                <span className="text-emerald-700 font-bold">
                  +{bonusMinutes}m Bonus Study
                </span>
              ) : (
                <span>{minutesRemaining}m Remaining</span>
              )}
            </div>
          </div>
        </div>

        {/* PRIMARY PROGRESS BAR */}
        <div className="space-y-1.5">
          <div
            className="h-4 sm:h-5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/80 p-0.5 relative"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            title={`${minutesStudied} of ${targetMinutes} minutes studied (${rawPercent}%)`}
          >
            {/* Milestone markers along the track */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
              <span className="w-px h-full bg-stone-200/90" style={{ left: '25%', position: 'absolute' }} />
              <span className="w-px h-full bg-stone-200/90" style={{ left: '50%', position: 'absolute' }} />
              <span className="w-px h-full bg-stone-200/90" style={{ left: '70%', position: 'absolute' }} />
              <span className="w-px h-full bg-stone-300" style={{ left: '100%', position: 'absolute' }} />
            </div>

            {/* Dynamic Animated Progress Fill */}
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1.5 ${
                isGoalAchieved
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-xs'
                  : progressPercent >= 50
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              {progressPercent >= 20 && (
                <span
                  className={`text-[10px] font-mono font-bold leading-none ${
                    isGoalAchieved ? 'text-white' : 'text-stone-950'
                  }`}
                >
                  {rawPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Milestone markers labels */}
          <div className="flex justify-between text-[10px] font-mono text-stone-600 px-1 pt-0.5">
            <span>0m (Start)</span>
            <span>{Math.round(targetMinutes * 0.25)}m (25%)</span>
            <span>{Math.round(targetMinutes * 0.5)}m (50%)</span>
            <span>{Math.round(targetMinutes * 0.75)}m (75%)</span>
            <span className={isGoalAchieved ? 'text-emerald-700 font-bold' : 'font-bold text-stone-800'}>
              {targetMinutes}m (100% Target)
            </span>
          </div>
        </div>

        {/* Motivational Coaching Callout Banner */}
        <div
          className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs transition-colors ${
            isGoalAchieved
              ? 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950'
              : progressPercent >= 50
              ? 'bg-amber-50/80 border-amber-200/90 text-amber-950'
              : 'bg-stone-50 border-stone-200 text-stone-700'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {isGoalAchieved ? (
              <AppArtwork name="trophy" inline className="w-4 h-4 text-emerald-600" />
            ) : progressPercent >= 50 ? (
              <AppArtwork name="star" inline className="w-4 h-4 text-amber-600" />
            ) : (
              <AppArtwork name="lightning" inline className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <strong className="font-bold uppercase tracking-wider text-[11px]">
                {motivation.tag}
              </strong>
              {isGoalAchieved && (
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded font-mono">
                  BOARD READY PACE
                </span>
              )}
            </div>
            <p className="mt-0.5 leading-relaxed text-stone-700">{motivation.quote}</p>
            {isGoalAchieved && (
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerDailyGoalConfetti()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                  title="Trigger celebration confetti blast"
                >
                  <AppArtwork name="star" inline className="w-3.5 h-3.5" />
                  <span>Launch Confetti Celebration 🎉</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Log Action Strip (for offline book study or scratchpad review) */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-500 font-medium">
            <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-stone-400" />
            <span>Quick log study time:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickAdd(15)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono font-semibold transition-colors flex items-center gap-1 border border-stone-200/60"
              title="Log 15 minutes of study"
            >
              <Plus className="w-3 h-3 text-stone-500" />
              <span>15m</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAdd(30)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono font-semibold transition-colors flex items-center gap-1 border border-stone-200/60"
              title="Log 30 minutes of study"
            >
              <Plus className="w-3 h-3 text-stone-500" />
              <span>30m</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAdd(45)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono font-semibold transition-colors flex items-center gap-1 border border-stone-200/60"
              title="Log 45 minutes of study"
            >
              <Plus className="w-3 h-3 text-stone-500" />
              <span>45m</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomLogModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition-colors border border-stone-200/60"
              title="Add custom minutes"
            >
              Custom...
            </button>

            {minutesStudied > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors border border-stone-200/60"
                title="Undo -15m"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
              </button>
            )}

            {priorityReviewTopic && (
              <button
                type="button"
                onClick={() => startReview(priorityReviewTopic)}
                className="ml-auto px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                title={`Start timed review for ${priorityReviewTopic.name}`}
              >
                <Play className="w-3 h-3 fill-current text-amber-400" />
                <span>Start Review Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal for Custom Log Minutes */}
        {showCustomLogModal && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <AppArtwork name="timer" inline className="w-4 h-4 text-amber-600" />
                  <span>Log Study Minutes</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCustomLogModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCustomLogSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Minutes to Add Today:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={customLogMinutes}
                    onChange={(e) => setCustomLogMinutes(Number(e.target.value) || 0)}
                    className="w-full text-center text-xl font-bold font-mono p-2.5 rounded-lg border border-stone-300 bg-white"
                    autoFocus
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Adds directly to today's {minutesStudied}m count ({currentDateStr}).
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-2 rounded-lg text-xs transition-colors"
                  >
                    Add Minutes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomLogModal(false)}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2 rounded-lg text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Collapsible Breakdown Audit of Today's Study Log */}
        {todayActivities.length > 0 && (
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowActivityAudit(!showActivityAudit)}
              className="w-full flex items-center justify-between text-xs text-stone-500 hover:text-stone-800 py-1 transition-colors"
            >
              <div className="flex items-center gap-1.5 font-medium">
                <span>View Today's Activity Breakdown ({todayActivities.length} sessions logged)</span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <span>{showActivityAudit ? 'Hide' : 'Show'}</span>
                {showActivityAudit ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {showActivityAudit && (
              <div className="mt-2 divide-y divide-stone-100 rounded-lg border border-stone-200 overflow-hidden bg-stone-50/60 text-xs">
                {todayActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 flex items-center justify-between gap-2 hover:bg-white transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-stone-900">{act.title}</div>
                      <div className="text-[11px] text-stone-500">
                        {act.type} • {act.source}
                        {act.score !== undefined && ` • Score: ${act.score}%`}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-stone-800 bg-white px-2 py-0.5 rounded border border-stone-200 text-[11px]">
                      +{act.minutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
