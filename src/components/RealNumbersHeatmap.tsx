import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Filter, Grid, List, Info, ChevronRight } from 'lucide-react';
import { MathFormula } from './MathFormula';
import {
  SubTopicHeatmapItem,
  StepHeatmapSummary,
  StruggleLevel,
  loadRealNumbersHeatmap,
  getStepHeatmapSummaries,
  getStruggleVisualTokens,
  resetRealNumbersHeatmapToBaseline,
  clearRealNumbersHeatmapAttempts,
  recordQuestionAnswerForHeatmap,
  saveRealNumbersHeatmap,
  HEATMAP_UPDATED_EVENT,
} from '../utils/realNumbersHeatmap';
import { useReview } from '../context/ReviewContext';

interface RealNumbersHeatmapProps {
  onNavigateQuiz?: (stepId: number, subTopicId?: string) => void;
  onNavigateLearn?: (stepId: number) => void;
}

export const RealNumbersHeatmap: React.FC<RealNumbersHeatmapProps> = ({
  onNavigateQuiz,
  onNavigateLearn,
}) => {
  const { openChat } = useReview();

  // Heatmap data state
  const [heatmapData, setHeatmapData] = useState<Record<string, SubTopicHeatmapItem>>(() =>
    loadRealNumbersHeatmap()
  );

  // Selected sub-topic for detailed slide-out / modal inspection
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string | null>('sub-2-3');

  // Filter & view modes
  const [filterMode, setFilterMode] = useState<'all' | 'struggling' | '1' | '2' | '3' | '4'>('all');
  const [viewMode, setViewMode] = useState<'matrix' | 'ranked'>('matrix');

  // Simulation feedback alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setHeatmapData(loadRealNumbersHeatmap());
    };
    window.addEventListener(HEATMAP_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(HEATMAP_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const allItems: SubTopicHeatmapItem[] = useMemo(() => {
    return Object.values(heatmapData);
  }, [heatmapData]);

  // Summaries per step
  const stepSummaries: StepHeatmapSummary[] = useMemo(() => {
    return getStepHeatmapSummaries(heatmapData);
  }, [heatmapData]);

  // Overall stats
  const overallStats = useMemo(() => {
    const criticalList = allItems.filter((i) => i.struggleLevel === 'critical');
    const moderateList = allItems.filter((i) => i.struggleLevel === 'moderate');
    const developingList = allItems.filter((i) => i.struggleLevel === 'developing');
    const masteredList = allItems.filter((i) => i.struggleLevel === 'mastered');
    const untestedList = allItems.filter((i) => i.struggleLevel === 'untested');

    const testedItems = allItems.filter((i) => i.attempts > 0);
    const avgStruggle =
      testedItems.length > 0
        ? Math.round(testedItems.reduce((acc, i) => acc + i.struggleScore, 0) / testedItems.length)
        : 0;
    const avgAccuracy =
      testedItems.length > 0
        ? Math.round(testedItems.reduce((acc, i) => acc + i.accuracy, 0) / testedItems.length)
        : 0;

    // Top struggled sub-topics sorted by struggle score descending
    const sortedByStruggle = [...allItems]
      .filter((i) => i.attempts > 0)
      .sort((a, b) => b.struggleScore - a.struggleScore);

    return {
      criticalCount: criticalList.length,
      moderateCount: moderateList.length,
      developingCount: developingList.length,
      masteredCount: masteredList.length,
      untestedCount: untestedList.length,
      avgStruggle,
      avgAccuracy,
      topStruggles: sortedByStruggle.slice(0, 3),
      rankedAll: [...allItems].sort((a, b) => {
        // High struggle first; untested at the end
        if (a.attempts === 0 && b.attempts > 0) return 1;
        if (b.attempts === 0 && a.attempts > 0) return -1;
        return b.struggleScore - a.struggleScore;
      }),
    };
  }, [allItems]);

  // Filtered list for display
  const filteredItems = useMemo(() => {
    if (filterMode === 'struggling') {
      return allItems.filter(
        (i) => i.struggleLevel === 'critical' || i.struggleLevel === 'moderate'
      );
    }
    if (filterMode === '1' || filterMode === '2' || filterMode === '3' || filterMode === '4') {
      const stepNum = Number(filterMode);
      return allItems.filter((i) => i.stepId === stepNum);
    }
    return allItems;
  }, [allItems, filterMode]);

  const selectedSubTopic = selectedSubTopicId ? heatmapData[selectedSubTopicId] : null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Quick simulation helpers to show live reactivity
  const handleSimulateAnswer = (subTopicId: string, isCorrect: boolean) => {
    const item = heatmapData[subTopicId];
    if (!item) return;
    const questionId = item.questionIds[0] || `${item.id}-q`;
    recordQuestionAnswerForHeatmap(questionId, isCorrect);
    showToast(
      isCorrect
        ? `Recorded ✓ Correct answer for "${item.name}". Struggle score updated!`
        : `Recorded ✗ Incorrect answer for "${item.name}". Struggle heat increased!`
    );
  };

  const handleResetBaseline = () => {
    resetRealNumbersHeatmapToBaseline();
    showToast('Heatmap reset to baseline spaced repetition performance state.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Module Overview & Heat Diagnosis */}
      <div className="bg-linear-to-r from-rose-50 via-amber-50 to-blue-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-2xs app-artwork-tile">
                <AppArtwork name="flame" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Real Numbers Sub-Topic Struggle Heatmap
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
                Live Quiz Diagnostics
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Thermal visualization showing which granular sub-topics and board traps you struggle with
              most based on active quiz performance. Red &amp; amber cells highlight high error rates that
              need immediate review.
            </p>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="bg-white/90 border border-rose-200 px-3 py-2 rounded-xl text-center shadow-2xs min-w-[76px]">
              <div className="text-base sm:text-lg font-black text-rose-600">
                {overallStats.criticalCount}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Critical
              </div>
            </div>

            <div className="bg-white/90 border border-amber-200 px-3 py-2 rounded-xl text-center shadow-2xs min-w-[76px]">
              <div className="text-base sm:text-lg font-black text-amber-600">
                {overallStats.moderateCount}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Watchlist
              </div>
            </div>

            <div className="bg-white/90 border border-emerald-200 px-3 py-2 rounded-xl text-center shadow-2xs min-w-[76px]">
              <div className="text-base sm:text-lg font-black text-emerald-600">
                {overallStats.masteredCount}
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Mastered
              </div>
            </div>
          </div>
        </div>

        {/* Priority Stumbling Blocks Callout */}
        {overallStats.topStruggles.length > 0 && (
          <div className="bg-white/95 rounded-xl border border-rose-200/90 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Priority ECE Board Traps (Highest Struggle Index)</span>
              </div>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                Immediate Action Recommended
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {overallStats.topStruggles.map((item, idx) => {
                const tokens = getStruggleVisualTokens(item.struggleLevel);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSubTopicId(item.id)}
                    className="p-3 rounded-xl border border-rose-200/80 bg-rose-50/50 hover:bg-rose-100/70 text-left transition-all cursor-pointer space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-rose-200/80 text-rose-900 text-[10px] font-black">
                        #{idx + 1} Weakness
                      </span>
                      <span className="text-xs font-black text-rose-700">
                        {item.struggleScore}% Struggle
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-rose-900">
                      {item.name}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{item.stepTitle}</span>
                      <span className="font-semibold text-rose-700">
                        {item.correct}/{item.attempts} correct ({item.accuracy}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-linear-to-r from-rose-500 to-red-600 h-full rounded-full"
                        style={{ width: `${item.struggleScore}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Sub-Topics (16)
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('struggling')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterMode === 'struggling'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            <AppArtwork name="flame" inline className="w-3.5 h-3.5" />
            <span>Struggling Only ({overallStats.criticalCount + overallStats.moderateCount})</span>
          </button>

          {[
            { id: '1', label: 'Step 1: Sets' },
            { id: '2', label: 'Step 2: R vs I' },
            { id: '3', label: 'Step 3: Classify' },
            { id: '4', label: 'Step 4: Order' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setFilterMode(st.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                filterMode === st.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Thermal Matrix</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('ranked')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'ranked'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Ranked Trouble List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Thermal Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Thermal Struggle Scale:</span>
        </span>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-2xs shrink-0" />
            <span className="text-slate-700 font-semibold">Critical Struggle (≥60% error)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-2xs shrink-0" />
            <span className="text-slate-700 font-semibold">Moderate Struggle (35-59%)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-400 shadow-2xs shrink-0" />
            <span className="text-slate-700 font-semibold">Developing (70-84% accuracy)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-2xs shrink-0" />
            <span className="text-slate-700 font-semibold">Mastered (≥85% accuracy)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300 shadow-2xs shrink-0" />
            <span className="text-slate-500 font-medium">Untested</span>
          </div>
        </div>
      </div>

      {/* MAIN VIEW: Matrix or Ranked List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Heatmap Grid or Ranked List (8/12 width on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          {viewMode === 'matrix' ? (
            /* VIEW 1: THERMAL MATRIX BY STEP */
            <div className="space-y-6">
              {stepSummaries.map((summary) => {
                // If filtering by specific step, only show matching summary
                if (
                  filterMode !== 'all' &&
                  filterMode !== 'struggling' &&
                  String(summary.stepId) !== filterMode
                ) {
                  return null;
                }

                // If filtering by struggling, check if summary has struggling subtopics
                const visibleSubTopics = summary.subTopics.filter((item) => {
                  if (filterMode === 'struggling') {
                    return (
                      item.struggleLevel === 'critical' || item.struggleLevel === 'moderate'
                    );
                  }
                  return true;
                });

                if (visibleSubTopics.length === 0 && filterMode === 'struggling') {
                  return null;
                }

                return (
                  <div
                    key={summary.stepId}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4"
                  >
                    {/* Step Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                            {summary.stepId}
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {summary.stepTitle}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 pl-8">
                          <span>
                            Step Avg Accuracy:{' '}
                            <strong className="text-slate-800 font-bold">
                              {summary.averageAccuracy}%
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Avg Struggle Index:{' '}
                            <strong
                              className={`font-bold ${
                                summary.averageStruggle >= 50
                                  ? 'text-rose-600'
                                  : summary.averageStruggle >= 30
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                              }`}
                            >
                              {summary.averageStruggle}%
                            </strong>
                          </span>
                        </div>
                      </div>

                      {/* Quick Step Weakness Badge */}
                      <div className="flex items-center gap-2 pl-8 sm:pl-0">
                        {summary.criticalCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold flex items-center gap-1">
                            <AppArtwork name="flame" inline className="w-3 h-3 text-rose-600" />
                            <span>{summary.criticalCount} Critical Weakness</span>
                          </span>
                        )}
                        {summary.moderateCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>{summary.moderateCount} Watchlist</span>
                          </span>
                        )}
                        {summary.criticalCount === 0 && summary.moderateCount === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Strong Retention</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sub-Topics Heatmap Grid (4 tiles) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {visibleSubTopics.map((item) => {
                        const tokens = getStruggleVisualTokens(item.struggleLevel);
                        const isSelected = selectedSubTopicId === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedSubTopicId(item.id)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative space-y-2.5 ${tokens.tileBg} ${tokens.tileBorder} ${tokens.tileHover} ${
                              isSelected
                                ? 'ring-2 ring-blue-600 shadow-md translate-y-[-1px]'
                                : 'shadow-2xs'
                            }`}
                          >
                            {/* Top row: Code + Status Badge */}
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-black text-slate-800 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                                § {item.code}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${tokens.badgeBg} ${tokens.badgeText} ${tokens.badgeBorder}`}
                                >
                                  {tokens.shortLabel}
                                </span>
                              </div>
                            </div>

                            {/* Subtopic Title */}
                            <div>
                              <div className="font-extrabold text-slate-950 text-xs sm:text-sm leading-snug">
                                {item.name}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {item.boardTrap}
                              </p>
                            </div>

                            {/* Struggle Bar & Numbers */}
                            <div className="space-y-1 pt-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-medium">Struggle Index:</span>
                                <span className={`font-black ${tokens.textColor}`}>
                                  {item.struggleScore}%
                                </span>
                              </div>

                              <div className="w-full bg-slate-200/90 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 bg-linear-to-r ${tokens.heatBarGradient}`}
                                  style={{
                                    width: `${Math.max(item.attempts > 0 ? 6 : 0, item.struggleScore)}%`,
                                  }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                                <span>
                                  {item.attempts > 0
                                    ? `${item.correct}/${item.attempts} correct (${item.accuracy}%)`
                                    : 'No quiz attempts'}
                                </span>
                                {/* Recent Streak Dots */}
                                {item.recentResults.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] text-slate-400">Recent:</span>
                                    {item.recentResults.map((r, i) => (
                                      <span
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${
                                          r ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}
                                        title={r ? 'Correct' : 'Incorrect'}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW 2: RANKED TROUBLE LIST */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <List className="w-4 h-4 text-blue-600" />
                    <span>Ranked Real Numbers Trouble Index</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sub-topics ranked from highest struggle rate down to fully mastered concepts.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {filteredItems.length} Sub-Topics
                </span>
              </div>

              <div className="space-y-3">
                {overallStats.rankedAll.map((item, index) => {
                  const tokens = getStruggleVisualTokens(item.struggleLevel);
                  const isSelected = selectedSubTopicId === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedSubTopicId(item.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${tokens.tileBg} ${tokens.tileBorder} ${tokens.tileHover} ${
                        isSelected ? 'ring-2 ring-blue-600 shadow-md' : 'shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                            index < 3
                              ? 'bg-rose-600 text-white'
                              : index < 6
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          #{index + 1}
                        </span>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-slate-700 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">
                              § {item.code}
                            </span>
                            <span className="font-extrabold text-slate-900 text-sm">
                              {item.name}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-full border ${tokens.badgeBg} ${tokens.badgeText} ${tokens.badgeBorder}`}
                            >
                              {tokens.shortLabel}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>{item.stepTitle}</span>
                            <span>•</span>
                            <span className="truncate max-w-sm sm:max-w-md">{item.boardTrap}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Metrics & Bar */}
                      <div className="sm:w-48 shrink-0 space-y-1 pl-10 sm:pl-0">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Struggle:</span>
                          <span className={`font-black ${tokens.textColor}`}>
                            {item.struggleScore}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200/90 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 bg-linear-to-r ${tokens.heatBarGradient}`}
                            style={{
                              width: `${Math.max(item.attempts > 0 ? 5 : 0, item.struggleScore)}%`,
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>
                            {item.attempts > 0 ? `${item.accuracy}% accuracy` : 'Untested'}
                          </span>
                          <span>
                            {item.correct}/{item.attempts} correct
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Sub-Topic Deep Dive & Remediation Drawer (4/12 width) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedSubTopic ? (
            (() => {
              const tokens = getStruggleVisualTokens(selectedSubTopic.struggleLevel);

              return (
                <div className="bg-white rounded-2xl border-2 border-blue-200/90 shadow-sm p-5 space-y-5 sticky top-4">
                  {/* Header */}
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-xs font-black">
                        Sub-Topic {selectedSubTopic.code}
                      </span>
                      <span
                        className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${tokens.badgeBg} ${tokens.badgeText} ${tokens.badgeBorder}`}
                      >
                        {tokens.label}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {selectedSubTopic.fullTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Module: <strong>{selectedSubTopic.stepTitle}</strong>
                    </p>
                  </div>

                  {/* Struggle Score Banner */}
                  <div className={`p-3.5 rounded-xl border ${tokens.tileBg} ${tokens.tileBorder} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Quiz Struggle Index:</span>
                      <span className={`text-base font-black ${tokens.textColor}`}>
                        {selectedSubTopic.struggleScore}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 bg-linear-to-r ${tokens.heatBarGradient}`}
                        style={{
                          width: `${Math.max(selectedSubTopic.attempts > 0 ? 5 : 0, selectedSubTopic.struggleScore)}%`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px]">
                      <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200/60">
                        <div className="font-extrabold text-slate-900">
                          {selectedSubTopic.accuracy}%
                        </div>
                        <div className="text-[10px] text-slate-500">Accuracy</div>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200/60">
                        <div className="font-extrabold text-slate-900">
                          {selectedSubTopic.correct}/{selectedSubTopic.attempts}
                        </div>
                        <div className="text-[10px] text-slate-500">Correct</div>
                      </div>
                      <div className="bg-white/80 p-1.5 rounded-lg border border-slate-200/60">
                        <div className="font-extrabold text-rose-700">
                          {selectedSubTopic.incorrect}
                        </div>
                        <div className="text-[10px] text-slate-500">Mistakes</div>
                      </div>
                    </div>
                  </div>

                  {/* Core Formula & Rule */}
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <AppArtwork name="book" inline className="w-3.5 h-3.5 text-blue-600" />
                      <span>Key Mathematical Rule / Axiom:</span>
                    </div>
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-inner text-center">
                      <MathFormula
                        formula={selectedSubTopic.keyFormula}
                        className="text-white text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Detailed Board Trap */}
                  <div className="bg-amber-50/90 rounded-xl p-3.5 border border-amber-200 space-y-1.5">
                    <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Board Exam Trap Alert:</span>
                    </div>
                    <p className="text-xs text-amber-950 leading-relaxed font-medium">
                      {selectedSubTopic.boardTrap}
                    </p>
                  </div>

                  {/* Concept Summary Description */}
                  <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">Summary: </strong>
                    {selectedSubTopic.description}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateQuiz) {
                          onNavigateQuiz(selectedSubTopic.stepId, selectedSubTopic.id);
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <AppArtwork name="target" inline className="w-3.5 h-3.5" />
                      <span>Practice {selectedSubTopic.name}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        openChat(
                          `Explain the Real Numbers sub-topic "${selectedSubTopic.fullTitle}" in depth. Why is "${selectedSubTopic.boardTrap}" such a frequent board trap, and what mnemonic or rule prevents making this mistake?`,
                          'Mathematics Specialist'
                        );
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs border border-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <AppArtwork name="star" inline className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Ask AI Tutor to Explain Trap</span>
                    </button>

                    {onNavigateLearn && (
                      <button
                        type="button"
                        onClick={() => onNavigateLearn(selectedSubTopic.stepId)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>Jump to Lesson: {selectedSubTopic.stepTitle}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Live Simulation Testing Controls */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                      Live Quiz Drill Simulation:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSimulateAnswer(selectedSubTopic.id, true)}
                        className="py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Log Correct ✓</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSimulateAnswer(selectedSubTopic.id, false)}
                        className="py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <AppArtwork name="flame" inline className="w-3 h-3 text-rose-600" />
                        <span>Log Mistake ✗</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
              Select any sub-topic in the heatmap to view diagnostics, formulas, and board traps.
            </div>
          )}
        </div>
      </div>

      {/* Footer Controls & Reset Helper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <AppArtwork name="lightning" inline className="w-4 h-4 text-amber-500" />
          <span>
            Heatmap automatically updates whenever you answer questions in the{' '}
            <strong>Knowledge Check</strong> tab.
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleResetBaseline}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <AppArtwork name="cycle" inline className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset to Baseline Performance</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <AppArtwork name="star" inline className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
