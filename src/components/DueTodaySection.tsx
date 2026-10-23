import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { formatReviewDate } from '../utils/masteryCalculator';
import { calculateEstimatedRetention } from '../utils/spacedRepetition';
import { Topic } from '../types';
import { Play, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const DueTodaySection: React.FC = () => {
  const {
    dueTodayTopics,
    overdueTopics,
    allDueOrOverdueTopics,
    allTopics,
    startReview,
    openTopicDrawer,
    openRecordTestForTopic,
    currentDateStr,
  } = useReview();

  const [activeTab, setActiveTab] = useState<'due_today' | 'overdue' | 'all'>('due_today');
  const [showAlgorithmInfo, setShowAlgorithmInfo] = useState<boolean>(false);
  const [selectedTopicForSim, setSelectedTopicForSim] = useState<Topic | null>(null);
  const [simAccuracy, setSimAccuracy] = useState<number>(85);
  const [simNotes, setSimNotes] = useState<'No' | 'Occasionally' | 'Frequently'>('No');

  // Find upcoming topics for empty state suggestions
  const upcomingTopics = allTopics
    .filter((t) => t.initialCovered && t.nextReviewDate && t.nextReviewDate > currentDateStr)
    .sort((a, b) => new Date(a.nextReviewDate!).getTime() - new Date(b.nextReviewDate!).getTime());

  const displayedTopics =
    activeTab === 'due_today'
      ? dueTodayTopics
      : activeTab === 'overdue'
      ? overdueTopics
      : allDueOrOverdueTopics;

  // Render mastery badge helper
  const renderMasteryPills = (mastery: number | null) => {
    const level = mastery ?? 1;
    return (
      <div className="flex items-center gap-1" title={`Mastery Level ${level} of 5`}>
        {[1, 2, 3, 4, 5].map((idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${
              idx <= level
                ? level >= 4
                  ? 'bg-emerald-500'
                  : level === 3
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
                : 'bg-stone-200'
            }`}
          />
        ))}
        <span className="text-[11px] font-mono font-bold text-stone-700 ml-1">L{level}</span>
      </div>
    );
  };

  return (
    <div id="due-today-section" className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 app-artwork-tile">
            <AppArtwork name="calendar" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Due Today (Spaced Repetition)
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  dueTodayTopics.length > 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {dueTodayTopics.length > 0
                  ? `${dueTodayTopics.length} Due Today`
                  : 'All Caught Up Today'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Scheduled intervals adapted to your test accuracy, notes reliance, and recall speed.
            </p>
          </div>
        </div>

        {/* Tab Filter & Explainer Trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex p-1 bg-stone-100 rounded-lg text-xs font-semibold text-stone-600">
            <button
              type="button"
              onClick={() => setActiveTab('due_today')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'due_today'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'hover:text-stone-900'
              }`}
            >
              Due Today ({dueTodayTopics.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('overdue')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'overdue'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'hover:text-stone-900'
              }`}
            >
              Overdue ({overdueTopics.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'hover:text-stone-900'
              }`}
            >
              All Due ({allDueOrOverdueTopics.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAlgorithmInfo(!showAlgorithmInfo)}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors"
            title="How Spaced Repetition Algorithm Works"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Algorithm Explainer Box (Collapsible) */}
      {showAlgorithmInfo && (
        <div className="p-4 bg-stone-900 text-stone-100 rounded-xl space-y-3 text-xs border border-stone-800">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <AppArtwork name="brain" inline className="w-4 h-4 text-amber-400" />
              <span className="font-bold uppercase tracking-wider text-amber-400">
                Spaced Repetition Algorithm (SM-2 Performance Scheduling)
              </span>
            </div>
            <button
              onClick={() => setShowAlgorithmInfo(false)}
              className="text-stone-400 hover:text-white text-[11px]"
            >
              Dismiss
            </button>
          </div>

          <p className="text-stone-300 leading-relaxed">
            The system tracks each topic's <strong>Ease Factor (EF)</strong>, repetition count, and 
            performance quality grade (0–5) calculated after each review session:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            <div className="bg-stone-800/80 p-3 rounded-lg border border-stone-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <AppArtwork name="trophy" inline className="w-3.5 h-3.5" />
                <span>Superb Recall (≥90% Acc)</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Zero notes used. Ease Factor expands (+0.10), doubling the review interval (e.g. 7d → 18d).
              </p>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-lg border border-stone-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <AppArtwork name="wave" inline className="w-3.5 h-3.5" />
                <span>Passing Recall (65–89%)</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Minor notes lookups. Interval expands moderately based on current mastery stability (e.g. 3d → 7d).
              </p>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-lg border border-stone-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                <span>Recall Lapse (&lt;65% Acc)</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Heavy note reliance or low accuracy resets repetition streak to 0, scheduling immediate remediation in 1–2 days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Topics List or Empty State */}
      {displayedTopics.length > 0 ? (
        <div className="space-y-3">
          {displayedTopics.map((topic) => {
            const isDueToday = topic.nextReviewDate === currentDateStr;
            const isOverdue = topic.nextReviewDate && topic.nextReviewDate < currentDateStr;
            const dateBadge = formatReviewDate(topic.nextReviewDate, currentDateStr);
            const retentionEstimate = calculateEstimatedRetention(topic, currentDateStr);

            return (
              <div
                key={topic.id}
                className="p-4 rounded-xl border border-stone-200 hover:border-amber-300 bg-stone-50/50 hover:bg-white transition-all space-y-3 group shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                        {topic.groupId.replace('grp-', '').replace('-', ' ')}
                      </span>

                      {topic.isHighPriority && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-2.5 h-2.5" /> High Board Relevance
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isDueToday
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : 'bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {isDueToday ? '⏱ Due Today' : `⚠ ${dateBadge}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => openTopicDrawer(topic)}
                      className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-amber-800 text-left transition-colors truncate block max-w-full"
                    >
                      {topic.name}
                    </button>

                    {topic.whyWeakReasons && topic.whyWeakReasons.length > 0 && (
                      <p className="text-xs text-stone-600 line-clamp-1">
                        <span className="font-semibold text-stone-700">Focus: </span>
                        {topic.whyWeakReasons[0]}
                      </p>
                    )}
                  </div>

                  {/* Right side metrics and actions */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 self-end sm:self-center">
                    {/* Mastery Level */}
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-stone-400">Mastery</div>
                      {renderMasteryPills(topic.mastery)}
                    </div>

                    {/* Action button */}
                    <button
                      type="button"
                      onClick={() => startReview(topic, 'Practice Problems')}
                      className="bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Review</span>
                    </button>
                  </div>
                </div>

                {/* Spaced Repetition Meta Strip */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-600">
                      <AppArtwork name="timer" inline className="w-3 h-3 text-stone-400" />
                      Interval:{' '}
                      <strong className="text-stone-800">
                        {topic.intervalDays ?? (topic.mastery ? topic.mastery * 4 : 4)}d
                      </strong>
                    </span>

                    <span className="text-stone-300">•</span>

                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-600">
                      EF:{' '}
                      <strong className="text-stone-800">
                        {topic.easeFactor?.toFixed(2) ?? '2.50'}
                      </strong>
                    </span>

                    <span className="text-stone-300">•</span>

                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-600">
                      Reviews: <strong className="text-stone-800">{topic.reviewCount}</strong>
                    </span>

                    <span className="text-stone-300">•</span>

                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-600">
                      Latest Score:{' '}
                      <strong className="text-stone-800">
                        {topic.latestScore !== null ? `${topic.latestScore}%` : '—'}
                      </strong>
                    </span>
                  </div>

                  {/* Retention curve indicator */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-stone-500">Retention:</span>
                    <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          retentionEstimate >= 80
                            ? 'bg-emerald-500'
                            : retentionEstimate >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${retentionEstimate}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-stone-700">
                      {retentionEstimate}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              {activeTab === 'due_today'
                ? 'Zero Topics Due for Spaced Review Today!'
                : activeTab === 'overdue'
                ? 'No Overdue Topics in Queue!'
                : 'All Scheduled Topics Are Up to Date!'}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
              You have completed all spaced review intervals for today. Your memory retention is 
              protected on current syllabus items.
            </p>
          </div>

          {upcomingTopics.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-stone-700">
                Next scheduled review:{' '}
                <button
                  type="button"
                  onClick={() => openTopicDrawer(upcomingTopics[0])}
                  className="font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                >
                  {upcomingTopics[0].name} ({formatReviewDate(upcomingTopics[0].nextReviewDate, currentDateStr)})
                </button>
              </p>
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => startReview(upcomingTopics[0], 'Practice Problems')}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-900 text-amber-400 font-bold text-xs hover:bg-stone-800 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Review Early</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
