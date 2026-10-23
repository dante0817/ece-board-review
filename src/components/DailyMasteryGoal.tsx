import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useReview } from '../context/ReviewContext';
import { triggerDailyGoalConfetti } from '../utils/confetti';
import { CheckCircle2, Sliders, Plus, ChevronDown, ChevronUp, Check, HelpCircle } from 'lucide-react';

export interface MasteredProblemEntry {
  id: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  date: string;
  source: string;
  problemsCount: number;
  scorePercent?: number;
  masteryLevel?: number;
}

export const DailyMasteryGoal: React.FC = () => {
  const {
    subjects,
    dailyTarget,
    userProfile,
    currentDateStr,
    incrementDailyMasteredProblems,
    setDailyTargetMasteredProblems,
    priorityReviewTopic,
    startReview,
  } = useReview();

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCountInput, setCustomCountInput] = useState<number>(5);
  const [showActivityAudit, setShowActivityAudit] = useState(false);
  const [showFormulaHelp, setShowFormulaHelp] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Target count: user-defined or default (15 problems)
  const targetProblems =
    dailyTarget.targetMasteredProblems ||
    userProfile.dailyTargetMasteredProblems ||
    15;

  // Aggregate mastered problems for today across all sources
  const { masteredEntries, totalMasteredToday, highMasteryTopicsCount } = useMemo(() => {
    const entries: MasteredProblemEntry[] = [];
    let highMasteryCount = 0;

    // 1. Scan subjects -> groups -> topics -> activityHistory for today's successful activities
    subjects.forEach((subj) => {
      subj.groups.forEach((grp) => {
        grp.topics.forEach((topic) => {
          if (topic.mastery && topic.mastery >= 4) {
            highMasteryCount += 1;
          }

          (topic.activityHistory || []).forEach((act) => {
            if (act.date === currentDateStr) {
              const correct = act.questionsCorrect || 0;
              if (correct > 0) {
                entries.push({
                  id: act.id || `act-${topic.id}-${act.date}`,
                  topicId: topic.id,
                  topicName: topic.name,
                  subjectName: subj.name,
                  date: act.date,
                  source: act.type || 'Review Session',
                  problemsCount: correct,
                  scorePercent: act.score,
                  masteryLevel: topic.mastery || undefined,
                });
              }
            }
          });
        });
      });
    });

    // 2. Scan localStorage for review_sessions completed today
    try {
      const stored = localStorage.getItem('review_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((session: {
            id?: string;
            date?: string;
            topicName?: string;
            topicId?: string;
            subjectName?: string;
            questionsCorrect?: number;
            type?: string;
            score?: number;
          }) => {
            if (session.date === currentDateStr) {
              const correct = session.questionsCorrect || 0;
              if (correct > 0 && !entries.some((e) => e.id === session.id)) {
                entries.push({
                  id: session.id || `session-${Math.random()}`,
                  topicId: session.topicId || 'generic',
                  topicName: session.topicName || 'Algebra Practice',
                  subjectName: session.subjectName || 'Algebra',
                  date: session.date,
                  source: session.type || 'Board Drill',
                  problemsCount: correct,
                  scorePercent: session.score,
                });
              }
            }
          });
        }
      }
    } catch {
      // ignore
    }

    // Sum mastered problems from all verified entries
    const fromEntries = entries.reduce((sum, item) => sum + item.problemsCount, 0);
    const directManual = dailyTarget.completedMasteredProblemsToday || 0;
    const finalTotal = Math.max(fromEntries, directManual);

    return {
      masteredEntries: entries,
      totalMasteredToday: finalTotal,
      highMasteryTopicsCount: highMasteryCount,
    };
  }, [subjects, currentDateStr, dailyTarget.completedMasteredProblemsToday]);

  const rawPercent = Math.round((totalMasteredToday / Math.max(1, targetProblems)) * 100);
  const progressPercent = Math.min(100, rawPercent);
  const problemsRemaining = Math.max(0, targetProblems - totalMasteredToday);
  const bonusProblems = Math.max(0, totalMasteredToday - targetProblems);
  const isGoalAchieved = totalMasteredToday >= targetProblems;

  // Track celebratory transition
  const prevAchievedRef = useRef<boolean>(isGoalAchieved);
  useEffect(() => {
    if (!prevAchievedRef.current && isGoalAchieved && totalMasteredToday > 0) {
      triggerDailyGoalConfetti();
      setToastMessage('🏆 Daily Mastery Goal Achieved! Consistent practice builds topnotcher board stamina.');
    }
    prevAchievedRef.current = isGoalAchieved;
  }, [isGoalAchieved, totalMasteredToday]);

  // Quick preset selection
  const handleSelectPreset = (count: number) => {
    setDailyTargetMasteredProblems(count);
    setIsEditingTarget(false);
    setToastMessage(`Daily mastery target updated to ${count} problems.`);
  };

  const handleCustomTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customTargetInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 200) {
      setDailyTargetMasteredProblems(val);
      setIsEditingTarget(false);
      setCustomTargetInput('');
      setToastMessage(`Daily mastery target updated to ${val} problems.`);
    }
  };

  const handleQuickAdd = (amount: number) => {
    incrementDailyMasteredProblems(amount);
    setToastMessage(`+${amount} mastered problem${amount > 1 ? 's' : ''} logged for today.`);
  };

  const handleCustomLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCountInput > 0) {
      incrementDailyMasteredProblems(customCountInput);
      setShowCustomModal(false);
      setToastMessage(`+${customCountInput} mastered problem${customCountInput > 1 ? 's' : ''} logged.`);
    }
  };

  const handleUndo = () => {
    if (totalMasteredToday > 0) {
      incrementDailyMasteredProblems(-1);
      setToastMessage('Reverted 1 mastered problem.');
    }
  };

  // Dynamic coaching feedback
  const getCoachingMessage = () => {
    if (totalMasteredToday === 0) {
      return {
        tag: 'Consistency Starts Now',
        quote: 'Targeting problems to mastery—not just rushing through questions—builds true exam reflex speed.',
        color: 'text-stone-600',
      };
    }
    if (progressPercent < 50) {
      return {
        tag: 'Building Momentum',
        quote: `You’ve conquered ${totalMasteredToday} problem${totalMasteredToday > 1 ? 's' : ''}! Just ${problemsRemaining} more to lock in today’s retention quota.`,
        color: 'text-amber-800',
      };
    }
    if (progressPercent < 100) {
      return {
        tag: 'Final Push',
        quote: `Almost at your goal! ${problemsRemaining} more problem${problemsRemaining > 1 ? 's' : ''} to complete today’s mastery threshold. Keep up the disciplined rhythm.`,
        color: 'text-amber-900',
      };
    }
    return {
      tag: 'Goal Mastered 🎯',
      quote: `Daily Mastery Goal conquered! You've mastered ${totalMasteredToday} problem${totalMasteredToday > 1 ? 's' : ''} today (${rawPercent}% of target). Your board recall strength is peaking!`,
      color: 'text-emerald-900',
    };
  };

  const coaching = getCoachingMessage();

  return (
    <div
      id="daily-mastery-goal-card"
      className={`border rounded-xl p-5 sm:p-6 transition-all duration-300 shadow-xs ${
        isGoalAchieved
          ? 'bg-gradient-to-br from-white via-amber-50/30 to-white border-amber-300 ring-1 ring-amber-400/20'
          : 'bg-white border-stone-200'
      }`}
    >
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="mb-4 p-2.5 bg-stone-900 text-stone-100 rounded-lg text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[10px] text-stone-400 hover:text-white font-mono px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner: Title, Badges, and Target Setter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isGoalAchieved ? () => triggerDailyGoalConfetti() : undefined}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
              isGoalAchieved
                ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-xs cursor-pointer active:scale-95 hover:rotate-6'
                : 'bg-amber-100/70 text-amber-800 border border-amber-200 cursor-default'
            }`}
            title={isGoalAchieved ? 'Mastery Goal Smashed! Click for confetti blast 🎉' : 'Daily Mastery Goal'}
          >
            {isGoalAchieved ? (
              <AppArtwork name="trophy" inline className="w-5 h-5 text-stone-950 animate-bounce" />
            ) : (
              <AppArtwork name="brain" inline className="w-5 h-5 text-amber-700" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                Daily Mastery Goal
              </h2>

              {isGoalAchieved ? (
                <button
                  type="button"
                  onClick={() => triggerDailyGoalConfetti()}
                  className="text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 group"
                  title="Click to celebrate!"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mastery Target Conquered ({rawPercent}%)</span>
                  <span className="text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full group-hover:scale-105 transition-transform flex items-center gap-1">
                    <AppArtwork name="star" inline className="w-2.5 h-2.5" />
                    <span>Celebrate</span>
                  </span>
                </button>
              ) : totalMasteredToday > 0 ? (
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AppArtwork name="flame" inline className="w-3 h-3 text-amber-700" />
                  <span>{problemsRemaining} problem{problemsRemaining > 1 ? 's' : ''} to goal</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  0 problems mastered today
                </span>
              )}

              <button
                type="button"
                onClick={() => setShowFormulaHelp(!showFormulaHelp)}
                className="text-[11px] text-stone-400 hover:text-stone-600 flex items-center gap-0.5 ml-1"
                title="How problem mastery is tracked"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[10px]">How it works</span>
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Tracks individual problems solved with correct execution and verified mastery on {currentDateStr}
            </p>
          </div>
        </div>

        {/* User-set Target Pill & Quick Adjust Button */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-800">
            <AppArtwork name="trophy" inline className="w-3.5 h-3.5 text-amber-600" />
            <span>Target:</span>
            <strong className="text-stone-950 font-mono">{targetProblems}</strong>
            <span className="text-stone-500 text-[10px]">problems/day</span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border ${
              isEditingTarget
                ? 'bg-stone-900 text-amber-400 border-stone-900'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
            }`}
            title="Adjust daily mastery target"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Set Goal</span>
          </button>
        </div>
      </div>

      {/* Explanation Tooltip Panel */}
      {showFormulaHelp && (
        <div className="mt-3 p-3.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-600 space-y-1.5">
          <div className="flex items-center justify-between font-bold text-stone-900">
            <span className="flex items-center gap-1.5">
              <AppArtwork name="brain" inline className="w-3.5 h-3.5 text-amber-600" />
              <span>How Problem Mastery is Counted</span>
            </span>
            <button
              type="button"
              onClick={() => setShowFormulaHelp(false)}
              className="text-stone-400 hover:text-stone-700"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed">
            Every correct problem solved in practice sessions, topic timed drills, diagnostic tests, or quick logs counts toward your daily mastery streak. Consistent daily solving prevents the forgetting curve from eroding key formulas before the board exam.
          </p>
        </div>
      )}

      {/* Target Setter Drawer (Inline pop-down when clicking "Set Goal") */}
      {isEditingTarget && (
        <div className="mt-3 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Customize Daily Problem Mastery Target</span>
            </span>
            <span className="text-[11px] text-stone-500 font-mono">Current: {targetProblems} problems</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-600 mr-1">Quick Presets:</span>
            {[10, 15, 20, 25, 30, 40].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleSelectPreset(num)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                  targetProblems === num
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-white hover:bg-stone-200 text-stone-700 border border-stone-200'
                }`}
              >
                {num} problems
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <form onSubmit={handleCustomTargetSubmit} className="flex items-center gap-2 pt-1">
            <label className="text-xs text-stone-600 whitespace-nowrap">Or custom target:</label>
            <input
              type="number"
              min="1"
              max="200"
              placeholder="e.g. 18"
              value={customTargetInput}
              onChange={(e) => setCustomTargetInput(e.target.value)}
              className="w-24 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-900"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold rounded-lg transition-colors"
            >
              Save Target
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
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Problems Mastered Today
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-stone-900">
                {totalMasteredToday}
              </span>
              <span className="text-sm sm:text-base font-semibold text-stone-500 font-mono">
                / {targetProblems} problems
              </span>
              {bonusProblems > 0 && (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded ml-1">
                  +{bonusProblems} above target!
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              <span
                className={`text-2xl sm:text-3xl font-black font-mono ${
                  isGoalAchieved ? 'text-amber-600' : 'text-stone-900'
                }`}
              >
                {rawPercent}%
              </span>
            </div>
            <div className="text-xs font-semibold text-stone-500">
              {isGoalAchieved ? (
                <span className="text-amber-700 font-bold">Goal Completed 🎉</span>
              ) : (
                <span>{problemsRemaining} Remaining Today</span>
              )}
            </div>
          </div>
        </div>

        {/* PROGRESS BAR TRACK */}
        <div className="space-y-1.5">
          <div
            className="h-4 sm:h-5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/80 p-0.5 relative"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            title={`${totalMasteredToday} of ${targetProblems} problems mastered today (${rawPercent}%)`}
          >
            {/* Track Milestones */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
              <span className="w-px h-full bg-stone-200/90" style={{ left: '25%', position: 'absolute' }} />
              <span className="w-px h-full bg-stone-200/90" style={{ left: '50%', position: 'absolute' }} />
              <span className="w-px h-full bg-stone-200/90" style={{ left: '75%', position: 'absolute' }} />
              <span className="w-px h-full bg-stone-300" style={{ left: '100%', position: 'absolute' }} />
            </div>

            {/* Dynamic Animated Fill */}
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1.5 ${
                isGoalAchieved
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-xs'
                  : progressPercent >= 50
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              {progressPercent >= 20 && (
                <span className="text-[10px] font-mono font-bold leading-none text-stone-950">
                  {rawPercent}%
                </span>
              )}
            </div>
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between text-[10px] font-mono text-stone-600 px-1 pt-0.5">
            <span>0</span>
            <span>{Math.round(targetProblems * 0.25)} (25%)</span>
            <span>{Math.round(targetProblems * 0.5)} (50%)</span>
            <span>{Math.round(targetProblems * 0.75)} (75%)</span>
            <span className={isGoalAchieved ? 'text-amber-700 font-bold' : 'font-bold text-stone-800'}>
              {targetProblems} (100% Target)
            </span>
          </div>
        </div>

        {/* Motivational Coaching Callout Banner */}
        <div
          className={`p-3.5 rounded-lg border flex items-start gap-3 text-xs transition-colors ${
            isGoalAchieved
              ? 'bg-amber-50/80 border-amber-200/90 text-amber-950'
              : progressPercent >= 50
              ? 'bg-amber-50/50 border-amber-200/60 text-amber-900'
              : 'bg-stone-50 border-stone-200 text-stone-700'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {isGoalAchieved ? (
              <AppArtwork name="trophy" inline className="w-4 h-4 text-amber-600" />
            ) : progressPercent >= 50 ? (
              <AppArtwork name="star" inline className="w-4 h-4 text-amber-600" />
            ) : (
              <AppArtwork name="lightning" inline className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <strong className="font-bold uppercase tracking-wider text-[11px]">
                {coaching.tag}
              </strong>
              {isGoalAchieved && (
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.2 rounded font-mono">
                  RETENTION LOCKED
                </span>
              )}
            </div>
            <p className="mt-0.5 leading-relaxed text-stone-700">{coaching.quote}</p>
            {isGoalAchieved && (
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerDailyGoalConfetti()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 text-[11px] font-bold rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <AppArtwork name="star" inline className="w-3.5 h-3.5" />
                  <span>Launch Confetti Celebration 🎉</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Log Action Strip */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-500 font-medium">
            <AppArtwork name="trophy" inline className="w-3.5 h-3.5 text-stone-400" />
            <span>Quick log mastered problems:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickAdd(1)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono font-semibold transition-colors flex items-center gap-1 border border-stone-200/60"
              title="Log 1 mastered problem"
            >
              <Plus className="w-3 h-3 text-stone-500" />
              <span>+1</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAdd(5)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono font-semibold transition-colors flex items-center gap-1 border border-stone-200/60"
              title="Log 5 mastered problems"
            >
              <Plus className="w-3 h-3 text-stone-500" />
              <span>+5</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAdd(10)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-mono font-semibold transition-colors flex items-center gap-1 border border-stone-200/60"
              title="Log 10 mastered problems"
            >
              <Plus className="w-3 h-3 text-stone-500" />
              <span>+10</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold transition-colors border border-stone-200/60"
              title="Add custom problem count"
            >
              Custom...
            </button>

            {totalMasteredToday > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors border border-stone-200/60"
                title="Undo -1 problem"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
              </button>
            )}

            {priorityReviewTopic && (
              <button
                type="button"
                onClick={() => startReview(priorityReviewTopic)}
                className="ml-auto px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                title={`Practice problems for ${priorityReviewTopic.name}`}
              >
                <AppArtwork name="book" inline className="w-3 h-3 text-amber-400" />
                <span>Practice Priority Topic</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal for Custom Log Problems */}
        {showCustomModal && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <AppArtwork name="trophy" inline className="w-4 h-4 text-amber-600" />
                  <span>Log Mastered Problems</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs font-mono"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCustomLogSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Number of Problems Solved & Mastered:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={customCountInput}
                    onChange={(e) => setCustomCountInput(Number(e.target.value) || 0)}
                    className="w-full text-center text-2xl font-bold font-mono p-2.5 rounded-lg border border-stone-300 bg-white"
                    autoFocus
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Adds directly to today's {totalMasteredToday} problem count ({currentDateStr}).
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-2 rounded-lg text-xs transition-colors"
                  >
                    Log Problems
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold py-2 rounded-lg text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Collapsible Breakdown Audit of Today's Mastered Problems */}
        {masteredEntries.length > 0 && (
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowActivityAudit(!showActivityAudit)}
              className="w-full flex items-center justify-between text-xs text-stone-500 hover:text-stone-800 py-1 transition-colors"
            >
              <div className="flex items-center gap-1.5 font-medium">
                <span>View Today's Mastered Problem Sources ({masteredEntries.length} recorded)</span>
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
                {masteredEntries.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 flex items-center justify-between gap-2 hover:bg-white transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-stone-900">{item.topicName}</div>
                      <div className="text-[11px] text-stone-500">
                        {item.source} • {item.subjectName}
                        {item.scorePercent !== undefined && ` • Score: ${item.scorePercent}%`}
                        {item.masteryLevel && ` • Mastery: L${item.masteryLevel}`}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                      +{item.problemsCount} solved
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
