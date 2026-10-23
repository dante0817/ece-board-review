import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { DailyStudyQueueItem, SpacedFlagReason } from '../types';
import { AlertTriangle, TrendingDown, CheckCircle2, Play, ShieldAlert, Info, ChevronDown, ChevronUp } from 'lucide-react';

export const DailyStudyQueue: React.FC = () => {
  const {
    dailyStudyQueue,
    startReview,
    openTopicDrawer,
    openRecordTestForTopic,
    autoFlagTopicsForReview,
    runSpacedRepetitionAudit,
  } = useReview();

  const [filter, setFilter] = useState<'all' | 'critical' | 'overdue' | 'decay' | 'performance'>('all');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [auditNotification, setAuditNotification] = useState<string | null>(null);

  const handleRunAudit = () => {
    autoFlagTopicsForReview();
    const stats = runSpacedRepetitionAudit();
    setAuditNotification(
      `Algorithm audited ${stats.totalEvaluated} topics: ${stats.flaggedCount} flagged (${stats.criticalCount} critical, fleet avg retention: ${stats.averageRetentionPercent}%).`
    );
    setTimeout(() => {
      setAuditNotification(null);
    }, 4500);
  };

  const filteredQueue = dailyStudyQueue.filter((item) => {
    if (filter === 'critical') return item.urgencyLevel === 'critical';
    if (filter === 'overdue') return item.daysOverdue > 0;
    if (filter === 'decay') return item.flagReason === 'Retention Decay' || item.estimatedRetentionPercent < 75;
    if (filter === 'performance') return item.flagReason === 'Performance Lapse' || (item.topic.latestScore !== null && item.topic.latestScore < 70);
    return true;
  });

  const criticalCount = dailyStudyQueue.filter((i) => i.urgencyLevel === 'critical').length;
  const overdueCount = dailyStudyQueue.filter((i) => i.daysOverdue > 0).length;
  const decayCount = dailyStudyQueue.filter(
    (i) => i.flagReason === 'Retention Decay' || i.estimatedRetentionPercent < 75
  ).length;
  const performanceCount = dailyStudyQueue.filter(
    (i) => i.flagReason === 'Performance Lapse' || (i.topic.latestScore !== null && i.topic.latestScore < 70)
  ).length;

  const getUrgencyBadge = (level: 'critical' | 'high' | 'moderate') => {
    switch (level) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            Critical Priority
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AppArtwork name="flame" inline className="w-3 h-3 text-amber-600" />
            High Urgency
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
            Moderate
          </span>
        );
    }
  };

  const getReasonBadge = (reason: SpacedFlagReason) => {
    switch (reason) {
      case 'Overdue Spaced Interval':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AppArtwork name="timer" inline className="w-3 h-3 text-rose-600" />
            Overdue Interval
          </span>
        );
      case 'Retention Decay':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <TrendingDown className="w-3 h-3 text-amber-600" />
            Retention Decay
          </span>
        );
      case 'Performance Lapse':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertTriangle className="w-3 h-3 text-purple-600" />
            Performance Lapse
          </span>
        );
      case 'Unresolved Error Trap':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <ShieldAlert className="w-3 h-3 text-orange-600" />
            Active Error Trap
          </span>
        );
      case 'Due Today':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <AppArtwork name="calendar" inline className="w-3 h-3 text-sky-600" />
            Due Today
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-50 text-stone-700 border border-stone-200">
            {reason}
          </span>
        );
    }
  };

  return (
    <div id="daily-study-queue" className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header & Algorithm Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-bold app-artwork-tile">
              <AppArtwork name="brain" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                Spaced Repetition Study Queue
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  SM-2 Auto-Flagged
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Automatically prioritized by last review date, memory stability, historical test scores, and PRC board weighting.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRunAudit}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors self-start sm:self-auto border border-stone-200"
          title="Re-run Spaced Repetition Auto-Flagging Algorithm across all covered syllabus topics"
        >
          <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
          <span>Re-Evaluate Fleet</span>
        </button>
      </div>

      {/* Toast Notification */}
      {auditNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{auditNotification}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-stone-900 text-stone-100 font-bold'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All Flagged ({dailyStudyQueue.length})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'critical'
              ? 'bg-rose-700 text-white font-bold'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          Critical Urgency ({criticalCount})
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'overdue'
              ? 'bg-amber-700 text-white font-bold'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          Overdue Interval ({overdueCount})
        </button>
        <button
          onClick={() => setFilter('decay')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'decay'
              ? 'bg-orange-700 text-white font-bold'
              : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
          }`}
        >
          Retention Decay ({decayCount})
        </button>
        <button
          onClick={() => setFilter('performance')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            filter === 'performance'
              ? 'bg-purple-700 text-white font-bold'
              : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
          }`}
        >
          Performance Lapse ({performanceCount})
        </button>
      </div>

      {/* Queue Items */}
      {filteredQueue.length === 0 ? (
        <div className="py-8 text-center text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-800">No topics match the selected filter.</p>
          <p className="text-xs text-stone-500 mt-1">All topics in this category are retained above the target threshold.</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
          {filteredQueue.map((item, index) => {
            const isExpanded = expandedTopicId === item.topic.id;
            const retentionPercent = item.estimatedRetentionPercent;
            const retentionColor =
              retentionPercent >= 80
                ? 'bg-emerald-500'
                : retentionPercent >= 65
                ? 'bg-amber-500'
                : 'bg-rose-500';

            return (
              <div
                key={item.topic.id}
                className={`p-3.5 sm:p-4 transition-colors ${
                  item.urgencyLevel === 'critical'
                    ? 'bg-rose-50/20 hover:bg-rose-50/40'
                    : 'hover:bg-stone-50/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Priority Rank, Topic Info */}
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                          item.urgencyLevel === 'critical'
                            ? 'bg-rose-600 text-white'
                            : item.urgencyLevel === 'high'
                            ? 'bg-amber-500 text-white'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => openTopicDrawer(item.topic)}
                          className="text-sm font-bold text-stone-900 hover:text-amber-700 text-left transition-colors"
                        >
                          {item.topic.name}
                        </button>
                        <span className="text-[10px] uppercase font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {item.subjectName}
                        </span>
                        {getUrgencyBadge(item.urgencyLevel)}
                        {getReasonBadge(item.flagReason)}
                      </div>

                      {/* Subtitle / Metrics */}
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 flex-wrap">
                        <span>Last Review: {item.daysSinceLastReview}d ago</span>
                        <span>•</span>
                        <span>Score: {item.lastPerformanceSummary}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <span>Est. Retention:</span>
                          <div className="w-14 bg-stone-200 h-2 rounded-full overflow-hidden inline-block">
                            <div
                              className={`h-full ${retentionColor}`}
                              style={{ width: `${retentionPercent}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-stone-700">{retentionPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => setExpandedTopicId(isExpanded ? null : item.topic.id)}
                      className="text-xs text-stone-500 hover:text-stone-800 p-1.5 rounded flex items-center gap-1"
                      title="View spaced repetition algorithm rationale"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{isExpanded ? 'Hide Info' : 'Why Flagged?'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      onClick={() => openRecordTestForTopic(item.topic.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                      title="Log diagnostic or quiz result"
                    >
                      Log Test
                    </button>

                    <button
                      onClick={() => startReview(item.topic)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-stone-100 text-xs font-bold hover:bg-stone-800 transition-colors shadow-xs"
                      title="Start prioritized spaced repetition practice session"
                    >
                      <Play className="w-3 h-3 fill-current text-amber-400" />
                      <span>Review ({item.suggestedQuestionCount}Q)</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Rationale Panel */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3 border-t border-stone-100 pl-9 space-y-2 text-xs bg-stone-50/60 p-3 rounded-lg">
                    <div className="font-bold text-stone-800 flex items-center gap-1.5">
                      <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-600" />
                      <span>Algorithm Rationale & Priority Diagnostics:</span>
                    </div>

                    <ul className="space-y-1 text-stone-600 list-disc list-inside">
                      {item.detailedRationale.map((rationale, rIdx) => (
                        <li key={rIdx} className="leading-relaxed">
                          {rationale}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-2 pt-2 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-stone-700">
                      <div>
                        <span className="font-semibold text-stone-900">Recommended Action: </span>
                        <span>{item.recommendedAction}</span>
                      </div>
                      <div className="text-[11px] font-mono text-stone-500 shrink-0">
                        Urgency Score: {item.urgencyScore} / 100 • Target Time: ~{item.suggestedDurationMinutes}m
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
