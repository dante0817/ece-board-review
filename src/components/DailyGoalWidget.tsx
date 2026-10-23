import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useReview } from '../context/ReviewContext';
import { triggerDailyGoalConfetti } from '../utils/confetti';
import { Topic } from '../types';
import { CheckCircle2, Sliders, Plus, Minus, ChevronDown, ChevronUp, ArrowRight, HelpCircle } from 'lucide-react';

export interface MasteredTopicRecord {
  topic: Topic;
  subjectName: string;
  subjectShortCode: string;
  subjectId: string;
  masteryLevel: number;
  latestScore?: number;
  completedAt?: string;
  source: string;
}

export const DailyGoalWidget: React.FC = () => {
  const {
    subjects,
    dailyTarget,
    userProfile,
    currentDateStr,
    incrementDailyMasteredTopics,
    setDailyTargetMasteredTopics,
    allTopics,
    dueTodayTopics,
    priorityReviewTopic,
    startReview,
    openTopicDrawer,
    setSelectedSubjectId,
  } = useReview();

  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Daily target: user-configured or profile default (fallback: 3 topics)
  const targetTopics =
    dailyTarget.targetMasteredTopics ||
    userProfile.dailyTargetMasteredTopics ||
    3;

  // Scan all subjects to find topics mastered or practiced to mastery today
  const { masteredTopicsToday, detectedCount } = useMemo(() => {
    const list: MasteredTopicRecord[] = [];
    const seenTopicIds = new Set<string>();

    subjects.forEach((subj) => {
      subj.groups.forEach((grp) => {
        grp.topics.forEach((topic) => {
          // Check if topic was active or reviewed today
          const todayActivities = (topic.activityHistory || []).filter(
            (act) => act.date === currentDateStr
          );
          const hasTodayActivity = todayActivities.length > 0;
          const isReviewedToday = topic.lastReviewDate === currentDateStr || hasTodayActivity;
          const isMastered = (topic.mastery || 0) >= 4; // Level 4 (Advanced) or Level 5 (Board Ready)

          if (isReviewedToday && isMastered && !seenTopicIds.has(topic.id)) {
            seenTopicIds.add(topic.id);
            const latestAct = todayActivities[0];
            list.push({
              topic,
              subjectName: subj.name,
              subjectShortCode: subj.shortCode,
              subjectId: subj.id,
              masteryLevel: topic.mastery || 4,
              latestScore: latestAct?.score ?? topic.latestScore ?? undefined,
              completedAt: latestAct?.date || currentDateStr,
              source: latestAct?.type || 'Spaced Repetition Review',
            });
          }
        });
      });
    });

    return {
      masteredTopicsToday: list,
      detectedCount: list.length,
    };
  }, [subjects, currentDateStr]);

  // Total topics mastered today takes the max of detected items and manually logged count
  const manualCount = dailyTarget.completedMasteredTopicsToday || 0;
  const totalMasteredToday = Math.max(detectedCount, manualCount);

  const rawPercent = Math.round((totalMasteredToday / Math.max(1, targetTopics)) * 100);
  const progressPercent = Math.min(100, rawPercent);
  const remaining = Math.max(0, targetTopics - totalMasteredToday);
  const bonus = Math.max(0, totalMasteredToday - targetTopics);
  const isGoalAchieved = totalMasteredToday >= targetTopics;

  // Trigger celebratory confetti once when target is achieved
  const prevAchievedRef = useRef<boolean>(isGoalAchieved);
  useEffect(() => {
    if (!prevAchievedRef.current && isGoalAchieved && totalMasteredToday > 0) {
      triggerDailyGoalConfetti();
      setToastMessage('🏆 Daily Topic Goal Achieved! Board mastery stamina is leveling up.');
      const timer = setTimeout(() => setToastMessage(null), 6000);
      return () => clearTimeout(timer);
    }
    prevAchievedRef.current = isGoalAchieved;
  }, [isGoalAchieved, totalMasteredToday]);

  // Quick preset targets
  const handleSelectPreset = (count: number) => {
    setDailyTargetMasteredTopics(count);
    setIsEditingTarget(false);
    setToastMessage(`Daily target updated to ${count} topics.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCustomTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customTargetInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 30) {
      handleSelectPreset(val);
      setCustomTargetInput('');
    }
  };

  const handleQuickAddMastered = () => {
    incrementDailyMasteredTopics(1);
    setToastMessage('+1 Mastered Topic logged for today!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleQuickSubtractMastered = () => {
    if (totalMasteredToday > 0) {
      incrementDailyMasteredTopics(-1);
    }
  };

  // Recommended candidate topics to master next today
  const candidateTopicsToMaster = useMemo(() => {
    const list: { topic: Topic; subjectName: string; subjectCode: string; subjectId: string; reason: string }[] = [];
    const masteredIds = new Set(masteredTopicsToday.map((m) => m.topic.id));

    // Priority 1: Due today topics not yet mastered
    dueTodayTopics.forEach((topic) => {
      if (!masteredIds.has(topic.id) && list.length < 3) {
        const subj = subjects.find((s) => s.id === topic.subjectId);
        list.push({
          topic,
          subjectName: subj?.name || 'Review',
          subjectCode: subj?.shortCode || 'ECE',
          subjectId: topic.subjectId,
          reason: 'Spaced review due today',
        });
        masteredIds.add(topic.id);
      }
    });

    // Priority 2: Priority review topic if available
    if (priorityReviewTopic && !masteredIds.has(priorityReviewTopic.id) && list.length < 3) {
      const subj = subjects.find((s) => s.id === priorityReviewTopic.subjectId);
      list.push({
        topic: priorityReviewTopic,
        subjectName: subj?.name || 'Review',
        subjectCode: subj?.shortCode || 'ECE',
        subjectId: priorityReviewTopic.subjectId,
        reason: 'Recommended focus topic',
      });
      masteredIds.add(priorityReviewTopic.id);
    }

    // Priority 3: Topics near mastery (level 2 or 3)
    if (list.length < 3) {
      subjects.forEach((subj) => {
        subj.groups.forEach((grp) => {
          grp.topics.forEach((t) => {
            if (
              t.initialCovered &&
              (t.mastery === 2 || t.mastery === 3) &&
              !masteredIds.has(t.id) &&
              list.length < 3
            ) {
              list.push({
                topic: t,
                subjectName: subj.name,
                subjectCode: subj.shortCode,
                subjectId: subj.id,
                reason: `Level ${t.mastery}/5 - Ready to advance`,
              });
              masteredIds.add(t.id);
            }
          });
        });
      });
    }

    return list;
  }, [dueTodayTopics, priorityReviewTopic, subjects, masteredTopicsToday]);

  const handleStudyCandidate = (item: { topic: Topic; subjectId: string }) => {
    setSelectedSubjectId(item.subjectId);
    if (!item.topic.initialCovered) {
      openTopicDrawer(item.topic);
    } else {
      startReview(item.topic);
    }
  };

  return (
    <div
      id="daily-goal-widget"
      className="bg-white border-2 border-stone-200 hover:border-stone-300 rounded-xl p-5 sm:p-6 shadow-xs transition-all space-y-4"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-900 text-emerald-100 text-xs font-semibold rounded-lg flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-2">
            <AppArtwork name="star" inline className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white text-[11px] font-bold ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-lg border transition-colors ${
              isGoalAchieved
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {isGoalAchieved ? (
              <AppArtwork name="trophy" inline className="w-5 h-5 text-emerald-600" />
            ) : (
              <AppArtwork name="target" inline className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black uppercase tracking-tight text-stone-900 flex items-center gap-1.5">
                <span>Daily Goal</span>
              </h2>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isGoalAchieved
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : totalMasteredToday > 0
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-stone-100 text-stone-600 border-stone-300'
                }`}
              >
                {isGoalAchieved
                  ? 'GOAL ACHIEVED'
                  : totalMasteredToday > 0
                  ? 'IN PROGRESS'
                  : 'TODAY\'S TARGET'}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              PRC Board Mastery: Target <strong className="text-stone-700">{targetTopics} topics</strong> at Level 4+ (Advanced/Board Ready) each day
            </p>
          </div>
        </div>

        {/* Target Adjust & Info Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setIsEditingTarget(!isEditingTarget)}
            className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg border border-stone-300 transition-colors flex items-center gap-1.5"
            title="Adjust daily topics target"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-500" />
            <span>Target: {targetTopics}/day</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            title="What is a Mastered Topic?"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Setting Inline Drawer */}
      {isEditingTarget && (
        <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-stone-700">
            <span>Choose Daily Topic Mastery Target:</span>
            <button
              type="button"
              onClick={() => setIsEditingTarget(false)}
              className="text-stone-400 hover:text-stone-700 text-[11px]"
            >
              Close
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleSelectPreset(count)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  targetTopics === count
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {count} {count === 1 ? 'Topic' : 'Topics'}
              </button>
            ))}
          </div>

          <form onSubmit={handleCustomTargetSubmit} className="flex items-center gap-2 pt-1">
            <input
              type="number"
              min="1"
              max="30"
              placeholder="Custom count..."
              value={customTargetInput}
              onChange={(e) => setCustomTargetInput(e.target.value)}
              className="w-36 px-2.5 py-1 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-md shadow-2xs"
            >
              Save
            </button>
          </form>
        </div>
      )}

      {/* Definition Info Box */}
      {showInfoModal && (
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5 text-stone-700">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-600" />
            <span>Mastery Metric Definition:</span>
          </div>
          <p className="leading-relaxed">
            A topic counts as <strong>Mastered Today</strong> when it achieves <strong>Level 4 (Advanced)</strong> or <strong>Level 5 (Board Ready)</strong> during today&apos;s practice sessions, active reviews, or spaced repetition drills with high accuracy (&ge;85%).
          </p>
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="text-amber-800 font-bold hover:underline text-[11px]"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Main Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Left Column: Big Counter */}
        <div className="md:col-span-1 p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center justify-between">
            <span>Topics Mastered Today</span>
            <span className="font-mono text-xs text-stone-400">Target: {targetTopics}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span
              className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                isGoalAchieved ? 'text-emerald-700' : 'text-stone-900'
              }`}
            >
              {totalMasteredToday}
            </span>
            <span className="text-sm font-bold text-stone-400 font-mono">
              / {targetTopics} topics
            </span>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="font-semibold text-stone-600">
              {rawPercent}% Completed
            </span>
            {remaining > 0 ? (
              <span className="text-amber-700 font-bold">
                {remaining} more needed
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {bonus > 0 ? `+${bonus} Bonus!` : 'Target Met!'}
              </span>
            )}
          </div>
        </div>

        {/* Center & Right Columns: Progress Bar & Milestone Status */}
        <div className="md:col-span-2 space-y-3.5">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 mb-1.5">
              <span>Progress Towards Daily Mastered Topics</span>
              <span className="font-mono font-bold text-stone-900">{progressPercent}%</span>
            </div>

            {/* Custom Visual Progress Bar */}
            <div className="relative h-4 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isGoalAchieved
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Milestone Indicators */}
            <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 pt-1">
              <span>0% Start</span>
              <span>50% Midpoint</span>
              <span className="font-bold text-stone-700">100% Goal ({targetTopics} Topics)</span>
            </div>
          </div>

          {/* Quick Manual Log / Adjust Buttons */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Quick Topic Count:</span>
              <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={handleQuickSubtractMastered}
                  disabled={totalMasteredToday <= 0}
                  className="px-2 py-1 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Remove 1 mastered topic"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-mono font-bold text-stone-900">
                  {totalMasteredToday}
                </span>
                <button
                  type="button"
                  onClick={handleQuickAddMastered}
                  className="px-2 py-1 text-stone-600 hover:bg-stone-100"
                  title="Add 1 mastered topic"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* View Details Accordion Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold text-stone-700 hover:text-stone-950 flex items-center gap-1 transition-colors"
            >
              <span>{isExpanded ? 'Hide Topic Details' : 'View Topic Details'}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Topics Details & Recommendations */}
      {isExpanded && (
        <div className="pt-4 border-t border-stone-100 space-y-4">
          {/* Mastered Topics Today List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mastered Topics Today ({masteredTopicsToday.length})</span>
              </h3>
              {masteredTopicsToday.length > 0 && (
                <span className="text-[11px] font-mono text-emerald-700 font-bold">
                  {masteredTopicsToday.length} verified level 4+ today
                </span>
              )}
            </div>

            {masteredTopicsToday.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {masteredTopicsToday.map((record, idx) => (
                  <div
                    key={`${record.topic.id}-${idx}`}
                    className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-stone-900 text-xs line-clamp-1">
                          {record.topic.name}
                        </span>
                        <span className="shrink-0 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-300">
                          L{record.masteryLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {record.subjectShortCode} • {record.subjectName}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-emerald-900 pt-1 border-t border-emerald-200/60 font-mono">
                      <span>{record.latestScore ? `${record.latestScore}% accuracy` : 'Mastered ✓'}</span>
                      <span className="text-[10px] text-emerald-700 truncate max-w-[120px]">
                        {record.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg text-center space-y-1">
                <p className="text-xs text-stone-600 font-medium">
                  No topics have achieved Level 4+ mastery yet today.
                </p>
                <p className="text-[11px] text-stone-400">
                  Complete a practice session or review one of the recommended topics below to count towards today&apos;s goal!
                </p>
              </div>
            )}
          </div>

          {/* Recommended Topics to Master Next (if goal not met or for bonus practice) */}
          {candidateTopicsToMaster.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {isGoalAchieved ? 'Bonus Topic Candidates' : 'Suggested Topics to Master Next Today'}
                  </span>
                </h4>
                <span className="text-[11px] text-stone-400">Click to start practice</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {candidateTopicsToMaster.map((cand) => (
                  <div
                    key={cand.topic.id}
                    className="p-3 bg-white border border-stone-200 hover:border-amber-400 rounded-lg shadow-2xs flex flex-col justify-between space-y-2 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[10px] font-mono text-stone-500">
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded font-bold">
                          {cand.subjectCode}
                        </span>
                        <span className="text-amber-700 font-semibold">
                          Current: L{cand.topic.mastery || 1}
                        </span>
                      </div>
                      <div className="font-bold text-stone-900 text-xs mt-1 line-clamp-1">
                        {cand.topic.name}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {cand.reason}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStudyCandidate(cand)}
                      className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold rounded border border-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Study & Master</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyGoalWidget;
