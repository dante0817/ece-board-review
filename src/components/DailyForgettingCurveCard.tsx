import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { useReview } from '../context/ReviewContext';
import {
  DailyForgettingCurveSuggestion,
  generateForgettingCurvePoints,
  ForgettingCurveUrgency,
} from '../utils/forgettingCurveAlgorithm';
import { Play, ChevronDown, ChevronUp, CheckCircle2, HelpCircle, Sliders } from 'lucide-react';

interface DailyForgettingCurveCardProps {
  compact?: boolean;
}

export const DailyForgettingCurveCard: React.FC<DailyForgettingCurveCardProps> = ({ compact = false }) => {
  const {
    dailyForgettingCurveOverview,
    forgettingCurveThreshold,
    setForgettingCurveThreshold,
    startForgettingCurveReview,
    openTopicDrawer,
    currentDateStr,
  } = useReview();

  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'optimal' | 'upcoming'>('all');
  const [showFormulaModal, setShowFormulaModal] = useState<boolean>(false);

  const {
    overallAverageRetention,
    criticalTopicsCount,
    optimalReviewCount,
    stableTopicsCount,
    totalDailyReviewMinutes,
    totalDailyRecommendedQuestions,
    suggestions,
  } = dailyForgettingCurveOverview;

  const filteredSuggestions = suggestions.filter((s) => {
    if (activeFilter === 'critical') return s.analysis.urgency === 'Critical Recall Lapse';
    if (activeFilter === 'optimal') return s.analysis.urgency === 'Optimal Retrieval Window';
    if (activeFilter === 'upcoming') return s.analysis.urgency === 'Consolidation Due';
    return true;
  });

  const toggleCurveExpansion = (topicId: string) => {
    setExpandedTopicId((prev) => (prev === topicId ? null : topicId));
  };

  const getUrgencyBadge = (urgency: ForgettingCurveUrgency) => {
    switch (urgency) {
      case 'Critical Recall Lapse':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Critical Decay
          </span>
        );
      case 'Optimal Retrieval Window':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
            <AppArtwork name="star" inline className="w-3 h-3 text-amber-600" />
            Optimal Window
          </span>
        );
      case 'Consolidation Due':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
            <AppArtwork name="timer" inline className="w-3 h-3 text-blue-600" />
            Consolidation Due
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Stable
          </span>
        );
    }
  };

  const getRetentionColorClass = (retention: number) => {
    if (retention < 65) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (retention <= forgettingCurveThreshold) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  };

  const getRetentionBarBg = (retention: number) => {
    if (retention < 65) return 'bg-rose-500';
    if (retention <= forgettingCurveThreshold) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div
      id="daily-forgetting-curve-card"
      className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-800 shrink-0 app-artwork-tile">
            <AppArtwork name="brain" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-stone-900 uppercase tracking-tight flex items-center gap-2">
                Forgetting Curve Spaced Repetition
              </h2>
              <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                Review Logs Adaptive
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Suggests daily content by modeling memory stability and exponential retention decay from historical review logs.
            </p>
          </div>
        </div>

        {/* Target Retention Threshold Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200/80 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-1.5 flex items-center gap-1">
              <Sliders className="w-3 h-3" /> Target:
            </span>
            {[75, 80, 85].map((thresh) => (
              <button
                key={thresh}
                type="button"
                onClick={() => setForgettingCurveThreshold(thresh)}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  forgettingCurveThreshold === thresh
                    ? 'bg-stone-900 text-amber-400 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
                title={`Trigger spaced reviews when retention drops below ${thresh}%`}
              >
                {thresh}%
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowFormulaModal(!showFormulaModal)}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            title="How the algorithm uses review logs and the forgetting curve"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formula Explainer Modal / Drawer */}
      {showFormulaModal && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/90 rounded-xl text-xs text-amber-950 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between font-bold text-amber-900">
            <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
              <AppArtwork name="brain" inline className="w-3.5 h-3.5" /> Ebbinghaus Forgetting Curve & Review Log Architecture
            </span>
            <button
              type="button"
              onClick={() => setShowFormulaModal(false)}
              className="text-stone-400 hover:text-stone-700 font-bold"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed">
            The algorithm evaluates every practice attempt in your <strong>Topic Activity History</strong> (accuracy score, notes dependency, difficulty, time per question, and error log slips) to calculate memory stability <code className="font-mono bg-amber-100/90 px-1.5 py-0.5 rounded font-bold">S</code> (half-life in days).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] bg-white/80 p-2.5 rounded-lg border border-amber-200/60">
            <div>
              <strong className="text-stone-900">Retention Formula:</strong>
              <div className="text-amber-800 font-bold mt-0.5">R(t) = exp( -t / (S × k) ) × 100%</div>
              <div className="text-[10px] text-stone-500 font-sans mt-0.5">
                t = days elapsed since last review log
              </div>
            </div>
            <div>
              <strong className="text-stone-900">Optimal Review Window:</strong>
              <div className="text-amber-800 font-bold mt-0.5">When R(t) drops to {forgettingCurveThreshold}%</div>
              <div className="text-[10px] text-stone-500 font-sans mt-0.5">
                Maximum memory consolidation with minimum forgetting risk
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Retention Vital Signs Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Fleet Retention
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={`text-xl font-extrabold ${
                overallAverageRetention >= 80
                  ? 'text-emerald-700'
                  : overallAverageRetention >= 65
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {overallAverageRetention}%
            </span>
            <span className="text-[11px] text-stone-400 font-medium">average</span>
          </div>
          <div className="w-full h-1.5 bg-stone-200 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getRetentionBarBg(overallAverageRetention)}`}
              style={{ width: `${overallAverageRetention}%` }}
            />
          </div>
        </div>

        <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-xl">
          <div className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
            <span>Critical Lapses</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-extrabold text-rose-900">{criticalTopicsCount}</span>
            <span className="text-[11px] text-rose-700 font-medium">topics &lt;65%</span>
          </div>
          <p className="text-[10px] text-rose-600 mt-1 font-medium">Immediate recall rescue needed</p>
        </div>

        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Optimal Window</span>
            <AppArtwork name="star" inline className="w-3 h-3 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-extrabold text-amber-950">{optimalReviewCount}</span>
            <span className="text-[11px] text-amber-800 font-medium">at prime curve</span>
          </div>
          <p className="text-[10px] text-amber-700 mt-1 font-medium">Sweet spot for consolidation</p>
        </div>

        <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl">
          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            Daily Plan Prescribed
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-extrabold text-stone-900">
              {totalDailyRecommendedQuestions}
            </span>
            <span className="text-[11px] text-stone-500 font-medium">questions</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1 font-mono">~{totalDailyReviewMinutes} minutes targeted study</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap border-b border-stone-100 pb-2">
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            All Suggested ({suggestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeFilter === 'critical'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Critical ({criticalTopicsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('optimal')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeFilter === 'optimal'
                ? 'bg-amber-500 text-stone-950 font-extrabold'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            Optimal Retrieval ({optimalReviewCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              activeFilter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            Upcoming Consolidation
          </button>
        </div>

        <span className="text-[11px] font-mono text-stone-400">
          Ranked by Memory Urgency Index
        </span>
      </div>

      {/* Daily Suggestions List */}
      <div className="space-y-3">
        {filteredSuggestions.length === 0 ? (
          <div className="p-8 bg-stone-50 rounded-xl text-center text-stone-500 text-xs space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
            <div className="font-bold text-stone-800">No topics match this curve filter!</div>
            <p className="text-stone-400">All covered topics are currently in strong memory stability.</p>
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => {
            const { topic, analysis, priorityRank, suggestedActionLabel, rationale } = suggestion;
            const isExpanded = expandedTopicId === topic.id;

            // Generate points for the interactive SVG curve
            const curvePoints = generateForgettingCurvePoints(
              analysis.computedStabilityDays,
              analysis.daysElapsedSinceLastReview,
              forgettingCurveThreshold,
              Math.max(16, analysis.daysElapsedSinceLastReview + 8)
            );

            return (
              <div
                key={topic.id}
                className={`border rounded-xl transition-all ${
                  analysis.urgency === 'Critical Recall Lapse'
                    ? 'border-rose-300/80 bg-rose-50/15 hover:border-rose-400'
                    : analysis.urgency === 'Optimal Retrieval Window'
                    ? 'border-amber-300/80 bg-amber-50/15 hover:border-amber-400'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                {/* Main Card Summary */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-stone-900 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        #{priorityRank}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => openTopicDrawer(topic)}
                            className="font-bold text-stone-900 text-sm hover:text-amber-600 text-left transition-colors cursor-pointer"
                          >
                            {topic.name}
                          </button>
                          {getUrgencyBadge(analysis.urgency)}
                          {topic.isHighPriority && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                              High Priority
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                          <span>Mastery: L{topic.mastery ?? 1}/5</span>
                          <span>•</span>
                          <span>Last Reviewed: {analysis.lastLogDate || 'None'}</span>
                          <span>•</span>
                          <span className="font-semibold text-stone-700">
                            {analysis.daysElapsedSinceLastReview} days elapsed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Retention Pill & Value */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                          Current Retention
                        </div>
                        <div
                          className={`text-base font-extrabold font-mono ${
                            analysis.currentRetentionPercent < 65
                              ? 'text-rose-600'
                              : analysis.currentRetentionPercent <= forgettingCurveThreshold
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {analysis.currentRetentionPercent}%
                        </div>
                      </div>

                      {/* Primary Quick Start Action */}
                      <button
                        type="button"
                        onClick={() => startForgettingCurveReview(suggestion)}
                        className="px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                        title={`Start prescribed review: ${analysis.recommendedActivity}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{suggestedActionLabel}</span>
                      </button>
                    </div>
                  </div>

                  {/* Retention Gauge Bar with Threshold Marker */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-stone-500">
                      <span>Memory Decay Track</span>
                      <span className="font-mono">
                        Target Floor: {forgettingCurveThreshold}% • Stability S: {analysis.computedStabilityDays}d
                      </span>
                    </div>
                    <div className="relative h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/80">
                      {/* Target threshold indicator line */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-stone-400 z-10"
                        style={{ left: `${forgettingCurveThreshold}%` }}
                        title={`Target threshold: ${forgettingCurveThreshold}%`}
                      />
                      {/* Current retention bar */}
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getRetentionBarBg(
                          analysis.currentRetentionPercent
                        )}`}
                        style={{ width: `${analysis.currentRetentionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Prescribed Content & Log Diagnostics Banner */}
                  <div className="p-3 bg-stone-50/90 rounded-lg border border-stone-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">Prescribed Activity:</span>
                        <span className="font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-200/80">
                          {analysis.recommendedActivity}
                        </span>
                        <span className="text-stone-500">•</span>
                        <span className="font-bold text-stone-800">
                          {analysis.recommendedQuestionVolume} Questions
                        </span>
                        <span className="text-stone-400 font-mono">
                          (~{analysis.estimatedMinutes} mins)
                        </span>
                      </div>
                      <p className="text-stone-600 text-[11px] leading-relaxed">
                        {rationale}
                      </p>
                    </div>

                    {/* Secondary Actions & Curve Toggle */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => openTopicDrawer(topic)}
                        className="px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-white text-stone-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <AppArtwork name="book" inline className="w-3 h-3" />
                        <span>Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleCurveExpansion(topic.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <AppArtwork name="brain" inline className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isExpanded ? 'Hide Curve' : 'View Curve'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Interactive Forgetting Curve & Log Evidence */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-stone-200 space-y-4 animate-in fade-in">
                      {/* Detailed Review Log Evidence Audit */}
                      <div className="space-y-1.5">
                        <h4 className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                          <AppArtwork name="cards" inline className="w-3 h-3 text-stone-500" />
                          Review Log Diagnostics & Evidence
                        </h4>
                        <div className="space-y-1 text-xs">
                          {analysis.logEvidence.map((evidence, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-stone-600 bg-white p-2 rounded border border-stone-200/60"
                            >
                              <span className="text-amber-500 font-bold mt-0.5">•</span>
                              <span className="leading-snug">{evidence}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SVG Forgetting Curve Graph */}
                      <div className="bg-stone-900 rounded-xl p-4 text-stone-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                              Ebbinghaus Retention Decay Curve: {topic.name}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-stone-400">
                            R(t) = exp(-t / {analysis.computedStabilityDays}d)
                          </span>
                        </div>

                        {/* Interactive Graph Canvas */}
                        <div className="relative h-44 w-full bg-stone-950/60 rounded-lg p-2 border border-stone-800 flex items-center justify-center">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                            {/* Grid horizontal lines for 25%, 50%, 75%, 100% */}
                            <line x1="30" y1="10" x2="390" y2="10" stroke="#334155" strokeWidth="0.7" strokeDasharray="3,3" />
                            <line x1="30" y1="35" x2="390" y2="35" stroke="#334155" strokeWidth="0.7" strokeDasharray="3,3" />
                            <line x1="30" y1="65" x2="390" y2="65" stroke="#334155" strokeWidth="0.7" strokeDasharray="3,3" />
                            <line x1="30" y1="95" x2="390" y2="95" stroke="#334155" strokeWidth="0.7" strokeDasharray="3,3" />

                            {/* Target threshold horizontal line */}
                            {(() => {
                              const yThresh = 110 - (forgettingCurveThreshold / 100) * 100;
                              return (
                                <g>
                                  <line
                                    x1="30"
                                    y1={yThresh}
                                    x2="390"
                                    y2={yThresh}
                                    stroke="#f59e0b"
                                    strokeWidth="1.2"
                                    strokeDasharray="4,2"
                                  />
                                  <text x="35" y={yThresh - 3} fill="#f59e0b" fontSize="8" fontWeight="bold">
                                    Target Threshold ({forgettingCurveThreshold}%)
                                  </text>
                                </g>
                              );
                            })()}

                            {/* Curve path R(t) */}
                            {(() => {
                              const maxDay = Math.max(16, analysis.daysElapsedSinceLastReview + 8);
                              const pointsStr = curvePoints
                                .map((pt) => {
                                  const x = 30 + (pt.day / maxDay) * 360;
                                  const y = 110 - (pt.retention / 100) * 100;
                                  return `${x},${y}`;
                                })
                                .join(' ');

                              return (
                                <polyline
                                  fill="none"
                                  stroke="#38bdf8"
                                  strokeWidth="2.5"
                                  points={pointsStr}
                                />
                              );
                            })()}

                            {/* Projected post-review curve (dashed gold line) */}
                            {(() => {
                              const maxDay = Math.max(16, analysis.daysElapsedSinceLastReview + 8);
                              const newStability = analysis.projectedNewStabilityDays;
                              const k = -1 / Math.log(forgettingCurveThreshold / 100);
                              const projectedPoints: string[] = [];
                              const todayX = 30 + (analysis.daysElapsedSinceLastReview / maxDay) * 360;

                              for (let d = 0; d <= maxDay - analysis.daysElapsedSinceLastReview; d += 2) {
                                const x = todayX + (d / maxDay) * 360;
                                const expVal = -d / (newStability * k);
                                const ret = Math.exp(expVal) * 98;
                                const y = 110 - (ret / 100) * 100;
                                projectedPoints.push(`${x},${y}`);
                              }

                              return (
                                <g>
                                  <polyline
                                    fill="none"
                                    stroke="#fbbf24"
                                    strokeWidth="1.8"
                                    strokeDasharray="4,3"
                                    points={projectedPoints.join(' ')}
                                  />
                                </g>
                              );
                            })()}

                            {/* Current Day Marker Point */}
                            {(() => {
                              const maxDay = Math.max(16, analysis.daysElapsedSinceLastReview + 8);
                              const todayX = 30 + (analysis.daysElapsedSinceLastReview / maxDay) * 360;
                              const todayY = 110 - (analysis.currentRetentionPercent / 100) * 100;

                              return (
                                <g>
                                  <circle cx={todayX} cy={todayY} r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                                  <text
                                    x={todayX + 6}
                                    y={Math.max(16, todayY - 4)}
                                    fill="#f43f5e"
                                    fontSize="9"
                                    fontWeight="bold"
                                  >
                                    Today: {analysis.currentRetentionPercent}%
                                  </text>
                                </g>
                              );
                            })()}
                          </svg>
                        </div>

                        {/* Projection Rationale Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-stone-950 p-3 rounded-lg border border-stone-800">
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">
                              Current Memory State
                            </span>
                            <div className="font-semibold text-stone-200 mt-0.5">
                              Stability S = <strong className="text-amber-400">{analysis.computedStabilityDays} days</strong> (decay half-life)
                            </div>
                            <div className="text-[11px] text-stone-400">
                              Ease Factor: {analysis.computedEaseFactor} • {analysis.totalLogsAnalyzed} log(s) analyzed
                            </div>
                          </div>

                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">
                              Post-Review Projection
                            </span>
                            <div className="font-semibold text-stone-200 mt-0.5">
                              Retention resets to <strong className="text-emerald-400">~98%</strong>
                            </div>
                            <div className="text-[11px] text-stone-400">
                              Stability expands to <strong className="text-amber-400">{analysis.projectedNewStabilityDays} days</strong> until next required review
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / Quick Action Bar */}
      {suggestions.length > 0 && (
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-stone-500 flex items-center gap-2">
            <AppArtwork name="cycle" inline className="w-3.5 h-3.5 text-stone-400" />
            <span>
              Spaced repetition schedule dynamically updates every time you complete a review session or mock exam.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const topSuggestion = suggestions[0];
                if (topSuggestion) {
                  startForgettingCurveReview(topSuggestion);
                }
              }}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <AppArtwork name="lightning" inline className="w-3.5 h-3.5 fill-stone-950" />
              <span>Start Top Priority Session (#{suggestions[0]?.priorityRank})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
