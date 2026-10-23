import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useState, useMemo } from 'react';
import { useReview } from '../context/ReviewContext';
import { Subject, Topic } from '../types';
import { DailyGoalWidget } from './DailyGoalWidget';
import { StudyTimeline } from './StudyTimeline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Cell,
} from 'recharts';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export type OverviewFilter = 'all' | 'intensive' | 'maintenance' | 'transition';

export interface SubjectOverviewStats {
  subject: Subject;
  totalTopics: number;
  coveredTopics: number;
  unstudiedTopics: number;
  coveragePercent: number;
  avgMastery: number;
  masteryPercent: number;
  weakTopicsCount: number;
  boardReadyTopicsCount: number;
  overdueCount: number;
  latestScore: number | null;
  highPriorityCount: number;
  highPriorityCovered: number;
  isReadyForMaintenance: boolean;
  mode: 'intensive' | 'maintenance' | 'transition';
  modeLabel: string;
  reason: string;
  strategy: string;
  nextTopicToStudy: Topic | null;
}

export const OverviewDashboard: React.FC = () => {
  const {
    subjects,
    testRecords,
    currentDateStr,
    setSelectedSubjectId,
    setCurrentScreen,
    markSubjectMaintenance,
    startReview,
    openTopicDrawer,
    startDeepStudySubject,
    pomodoro,
    isFocusMode,
  } = useReview();

  const [activeFilter, setActiveFilter] = useState<OverviewFilter>('all');
  const [chartView, setChartView] = useState<'comparison' | 'gap'>('comparison');
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<string | null>(null);

  // Compute detailed metrics & classification for every subject
  const subjectStatsList = useMemo<SubjectOverviewStats[]>(() => {
    return subjects.map((subj) => {
      const allTopics: Topic[] = subj.groups.flatMap((g) => g.topics);
      const totalTopics = allTopics.length;
      const coveredTopics = allTopics.filter((t) => t.initialCovered);
      const unstudiedTopics = allTopics.filter((t) => !t.initialCovered);
      const coveragePercent = totalTopics > 0 ? Math.round((coveredTopics.length / totalTopics) * 100) : 0;

      // Mastery calculations
      const topicsWithMastery = coveredTopics.filter((t) => t.mastery !== null);
      const avgMastery =
        topicsWithMastery.length > 0
          ? Number((topicsWithMastery.reduce((acc, t) => acc + (t.mastery || 0), 0) / topicsWithMastery.length).toFixed(1))
          : 0;
      const masteryPercent = Math.round((avgMastery / 5) * 100);

      // Weak topics (< L3) & Board Ready topics (>= L4)
      const weakTopics = coveredTopics.filter((t) => (t.mastery || 0) < 3);
      const boardReadyTopics = coveredTopics.filter((t) => (t.mastery || 0) >= 4);

      // Overdue review items
      const overdueTopics = coveredTopics.filter(
        (t) => t.nextReviewDate && t.nextReviewDate < currentDateStr
      );

      // Latest test record
      const subjectTests = testRecords.filter((t) => t.subjectId === subj.id);
      const latestTest = subjectTests.length > 0 ? subjectTests[0] : null;
      const latestScore = latestTest ? latestTest.scorePercent : null;

      // High priority items
      const highPriorityTopics = allTopics.filter((t) => t.isHighPriority);
      const highPriorityCovered = highPriorityTopics.filter((t) => t.initialCovered);

      // Readiness determination
      const isReadyForMaintenance =
        coveragePercent >= 90 && weakTopics.length === 0 && avgMastery >= 3.6;

      // Classification into Maintenance Review vs New Intensive Study vs Transition
      let mode: 'intensive' | 'maintenance' | 'transition' = 'intensive';
      let modeLabel = 'New Intensive Study';
      let reason = '';
      let strategy = '';

      if (subj.inMaintenance) {
        mode = 'maintenance';
        modeLabel = 'Maintenance Review';
        reason = `Maintenance active (${coveragePercent}% coverage, ${avgMastery}/5 avg mastery). Retention pacing in effect.`;
        strategy = 'Low-frequency spaced repetition, weekly mixed board mocks, and targeted error log remediation.';
      } else if (coveragePercent < 85 || unstudiedTopics.length > 0 || avgMastery < 3.2) {
        mode = 'intensive';
        modeLabel = 'New Intensive Study';
        reason =
          unstudiedTopics.length > 0
            ? `${unstudiedTopics.length} unstudied topic(s) remain (${coveragePercent}% syllabus covered).`
            : `Foundation mastery is developing (${avgMastery}/5). High-intensity drill required.`;
        strategy = 'First-pass concept reading, high-yield board problem sets, and rapid mastery floor drills (aim for Level 3+).';
      } else if (isReadyForMaintenance) {
        mode = 'maintenance';
        modeLabel = 'Ready for Maintenance';
        reason = `All criteria met (${coveragePercent}% covered, 0 weak topics, ${avgMastery}/5 mastery). Ready to lock into maintenance.`;
        strategy = 'Transition to maintenance mode to shift study focus to other developing subjects while preserving retention.';
      } else {
        mode = 'transition';
        modeLabel = 'Mastery Consolidation';
        reason = `High syllabus coverage (${coveragePercent}%), but ${weakTopics.length} topic(s) remain below Level 3.`;
        strategy = 'Targeted error elimination on weak topics before passing the maintenance gate.';
      }

      // Identify next recommended topic to study
      let nextTopicToStudy: Topic | null = null;
      if (unstudiedTopics.length > 0) {
        // First unstudied high priority topic or first unstudied
        nextTopicToStudy = unstudiedTopics.find((t) => t.isHighPriority) || unstudiedTopics[0];
      } else if (overdueTopics.length > 0) {
        nextTopicToStudy = overdueTopics[0];
      } else if (weakTopics.length > 0) {
        nextTopicToStudy = weakTopics[0];
      } else if (allTopics.length > 0) {
        nextTopicToStudy = allTopics[0];
      }

      return {
        subject: subj,
        totalTopics,
        coveredTopics: coveredTopics.length,
        unstudiedTopics: unstudiedTopics.length,
        coveragePercent,
        avgMastery,
        masteryPercent,
        weakTopicsCount: weakTopics.length,
        boardReadyTopicsCount: boardReadyTopics.length,
        overdueCount: overdueTopics.length,
        latestScore,
        highPriorityCount: highPriorityTopics.length,
        highPriorityCovered: highPriorityCovered.length,
        isReadyForMaintenance,
        mode,
        modeLabel,
        reason,
        strategy,
        nextTopicToStudy,
      };
    });
  }, [subjects, testRecords, currentDateStr]);

  // Overall Board Readiness Index (weighted average based on board exam weight)
  const weightedReadinessIndex = useMemo(() => {
    return Math.round(
      subjectStatsList.reduce((sum, s) => {
        const composite = s.coveragePercent * 0.45 + s.masteryPercent * 0.55;
        return sum + composite * (s.subject.boardWeightPercent / 100);
      }, 0)
    );
  }, [subjectStatsList]);

  // Counts
  const intensiveCount = subjectStatsList.filter((s) => s.mode === 'intensive').length;
  const maintenanceCount = subjectStatsList.filter((s) => s.mode === 'maintenance').length;
  const transitionCount = subjectStatsList.filter((s) => s.mode === 'transition').length;

  const totalUncoveredTopics = subjectStatsList.reduce((acc, s) => acc + s.unstudiedTopics, 0);
  const totalOverdueTopics = subjectStatsList.reduce((acc, s) => acc + s.overdueCount, 0);

  // Filtered list
  const filteredSubjects = useMemo(() => {
    if (activeFilter === 'all') return subjectStatsList;
    if (activeFilter === 'intensive') return subjectStatsList.filter((s) => s.mode === 'intensive');
    if (activeFilter === 'maintenance') return subjectStatsList.filter((s) => s.mode === 'maintenance');
    if (activeFilter === 'transition') return subjectStatsList.filter((s) => s.mode === 'transition');
    return subjectStatsList;
  }, [subjectStatsList, activeFilter]);

  // Recharts Chart Data
  const chartData = useMemo(() => {
    const BOARD_TARGET = 90;
    const PASSING_FLOOR = 70;
    return subjectStatsList.map((s) => {
      const gap = s.masteryPercent - BOARD_TARGET;
      return {
        name: s.subject.shortCode || s.subject.name.slice(0, 8),
        fullName: s.subject.name,
        coverage: s.coveragePercent,
        masteryIndex: s.masteryPercent,
        boardTarget: BOARD_TARGET,
        passingFloor: PASSING_FLOOR,
        gap,
        gapLabel: gap >= 0 ? `+${gap}% (Met)` : `${gap}% Gap`,
        boardWeight: s.subject.boardWeightPercent,
        mode: s.mode,
        avgMastery: s.avgMastery,
        unstudied: s.unstudiedTopics,
        weak: s.weakTopicsCount,
      };
    });
  }, [subjectStatsList]);

  // Action: Navigate to Subject Drilldown
  const handleNavigateToSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setCurrentScreen('subjects');
  };

  // Action: Start Study / Review for Subject
  const handleQuickStudyTopic = (topic: Topic, subjectId: string) => {
    setSelectedSubjectId(subjectId);
    if (!topic.initialCovered) {
      openTopicDrawer(topic);
    } else {
      startReview(topic);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-16">
      {/* EXECUTIVE HEADER BANNER */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <FeatureIcon name="dashboard" />
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-stone-900">
                Subject Overview & Readiness Dashboard
              </h1>
              <span className="text-[11px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-stone-900 text-amber-400">
                BOARD EXAM STRATEGY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 max-w-3xl">
              Cross-subject comparative analysis of syllabus completion, foundation mastery, and board exam weight.
              Quickly distinguishes subjects requiring <strong>New Intensive Study</strong> from subjects locked in <strong>Maintenance Review</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <button
              onClick={() => setCurrentScreen('today')}
              className="px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <AppArtwork name="target" inline className="w-3.5 h-3.5 text-amber-400" />
              <span>Today's Target</span>
            </button>
            <button
              onClick={() => setCurrentScreen('subjects')}
              className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-stone-300"
            >
              <AppArtwork name="book" inline className="w-3.5 h-3.5 text-stone-600" />
              <span>Subject Syllabus</span>
            </button>
          </div>
        </div>

        {/* HIGH-LEVEL KPI METRICS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-5">
          {/* KPI 1: Weighted Board Readiness */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">
                <span>Weighted Board Readiness</span>
                <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-stone-900">
                  {weightedReadinessIndex}%
                </span>
                <span className="text-xs font-semibold text-stone-500">/ 90% Target</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, weightedReadinessIndex)}%` }}
                />
              </div>
            </div>
            <div className="text-[11px] text-stone-500 mt-2">
              Weighted by PRC board exam subject distribution
            </div>
          </div>

          {/* KPI 2: Intensive Study Needed */}
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-rose-700 mb-1">
                <span>New Intensive Study</span>
                <AppArtwork name="flame" inline className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-rose-900">
                  {intensiveCount}
                </span>
                <span className="text-xs font-medium text-rose-700">Subjects</span>
              </div>
              <div className="text-xs font-semibold text-rose-800 mt-1">
                {totalUncoveredTopics} unstudied topic(s) remaining
              </div>
            </div>
            <div className="text-[11px] text-rose-600/90 mt-2">
              Requires first-pass concepts & foundational sets
            </div>
          </div>

          {/* KPI 3: Maintenance Review Active */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                <span>Maintenance Review</span>
                <AppArtwork name="shield" inline className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-900">
                  {maintenanceCount}
                </span>
                <span className="text-xs font-medium text-emerald-700">Subjects</span>
              </div>
              <div className="text-xs font-semibold text-emerald-800 mt-1">
                High coverage & solid foundation
              </div>
            </div>
            <div className="text-[11px] text-emerald-700/90 mt-2">
              Low-frequency spaced repetition to protect retention
            </div>
          </div>

          {/* KPI 4: Transition & Consolidation */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">
                <span>Consolidation Gate</span>
                <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-900">
                  {transitionCount}
                </span>
                <span className="text-xs font-medium text-amber-700">Subjects</span>
              </div>
              <div className="text-xs font-semibold text-amber-800 mt-1">
                {totalOverdueTopics} overdue review items
              </div>
            </div>
            <div className="text-[11px] text-amber-700/90 mt-2">
              Remediation needed to pass into Maintenance Mode
            </div>
          </div>
        </div>
      </div>

      {/* DAILY GOAL PROGRESS WIDGET */}
      <DailyGoalWidget />

      {/* COMPARATIVE VISUALIZATION: COMPLETION & READINESS CHARTS */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-stone-900 flex items-center gap-2">
              <BarChart className="w-4 h-4 text-amber-600" />
              <span>
                {chartView === 'comparison'
                  ? 'Comparative Syllabus Completion vs. Mastery Index'
                  : 'Subject Mastery vs. 90% Board Target Gap Analysis'}
              </span>
            </h2>
            <p className="text-xs text-stone-500">
              {chartView === 'comparison'
                ? 'Side-by-side comparison of initial syllabus coverage % against foundation mastery readiness % across all subjects.'
                : 'Directly visualizes the delta gap between current subject mastery and the 90% board exam passing & retention target.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Switcher */}
            <div className="flex items-center p-0.5 bg-stone-100 rounded-lg border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setChartView('comparison')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  chartView === 'comparison'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Coverage vs Mastery
              </button>
              <button
                type="button"
                onClick={() => setChartView('gap')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  chartView === 'gap'
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Mastery vs 90% Target
              </button>
            </div>

            {chartView === 'comparison' ? (
              <div className="flex items-center gap-3 text-xs font-medium text-stone-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
                  <span>Coverage %</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
                  <span>Mastery %</span>
                </span>
                <span className="flex items-center gap-1.5 text-stone-400">
                  <span className="w-3 h-0.5 bg-stone-400 inline-block" />
                  <span>90% Target</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs font-medium text-stone-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
                  <span>Target Met (&ge;85%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
                  <span>Passing Floor (70-84%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
                  <span>Intensive (&lt;70%)</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'comparison' ? (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 20 }}
                barGap={6}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede8" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#44403c', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#d6d3d1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 90, 100]}
                  tick={{ fill: '#78716c', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#d6d3d1' }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-stone-100 p-3 rounded-lg shadow-lg border border-stone-700 text-xs space-y-1.5 min-w-[210px]">
                          <div className="font-bold text-white flex items-center justify-between border-b border-stone-800 pb-1">
                            <span>{data.fullName}</span>
                            <span className="text-[10px] font-mono text-amber-400">
                              {data.boardWeight}% Exam Weight
                            </span>
                          </div>
                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="flex justify-between text-amber-300">
                              <span>Syllabus Coverage:</span>
                              <span className="font-bold">{data.coverage}%</span>
                            </div>
                            <div className="flex justify-between text-emerald-300">
                              <span>Actual Mastery:</span>
                              <span className="font-bold">{data.masteryIndex}% ({data.avgMastery}/5)</span>
                            </div>
                            <div className="flex justify-between text-stone-300">
                              <span>Board Target (90%):</span>
                              <span className={data.gap >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {data.gapLabel}
                              </span>
                            </div>
                            {data.unstudied > 0 && (
                              <div className="flex justify-between text-rose-300">
                                <span>Unstudied Topics:</span>
                                <span className="font-bold">{data.unstudied}</span>
                              </div>
                            )}
                            {data.weak > 0 && (
                              <div className="flex justify-between text-orange-300">
                                <span>Sub-L3 Weak Topics:</span>
                                <span className="font-bold">{data.weak}</span>
                              </div>
                            )}
                          </div>
                          <div className="pt-1 text-[10px] font-sans font-semibold border-t border-stone-800">
                            Classification:{' '}
                            <span
                              className={
                                data.mode === 'intensive'
                                  ? 'text-rose-400'
                                  : data.mode === 'maintenance'
                                  ? 'text-emerald-400'
                                  : 'text-amber-400'
                              }
                            >
                              {data.mode === 'intensive'
                                ? 'New Intensive Study'
                                : data.mode === 'maintenance'
                                ? 'Maintenance Review'
                                : 'Mastery Consolidation'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={90}
                  stroke="#78716c"
                  strokeDasharray="4 4"
                  label={{
                    value: '90% Target',
                    position: 'insideTopRight',
                    fill: '#78716c',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <ReferenceLine
                  y={70}
                  stroke="#d6d3d1"
                  strokeDasharray="2 2"
                  label={{
                    value: '70% Pass Floor',
                    position: 'insideBottomRight',
                    fill: '#a8a29e',
                    fontSize: 9,
                  }}
                />
                <Bar dataKey="coverage" name="Coverage %" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
                <Bar dataKey="masteryIndex" name="Mastery %" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 20, left: -10, bottom: 20 }}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0ede8" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#44403c', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#d6d3d1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 70, 90, 100]}
                  tick={{ fill: '#78716c', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#d6d3d1' }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-stone-900 text-stone-100 p-3 rounded-lg shadow-lg border border-stone-700 text-xs space-y-1.5 min-w-[210px]">
                          <div className="font-bold text-white flex items-center justify-between border-b border-stone-800 pb-1">
                            <span>{data.fullName}</span>
                            <span className="text-[10px] font-mono text-amber-400">
                              {data.boardWeight}% Weight
                            </span>
                          </div>
                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="flex justify-between text-emerald-300">
                              <span>Actual Mastery:</span>
                              <span className="font-bold">{data.masteryIndex}%</span>
                            </div>
                            <div className="flex justify-between text-stone-300">
                              <span>Board Target:</span>
                              <span className="font-bold">90%</span>
                            </div>
                            <div className="flex justify-between text-amber-300">
                              <span>Distance to Target:</span>
                              <span className={data.gap >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {data.gapLabel}
                              </span>
                            </div>
                            <div className="flex justify-between text-stone-400 pt-1 border-t border-stone-800">
                              <span>Passing Floor (70%):</span>
                              <span className={data.masteryIndex >= 70 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                {data.masteryIndex >= 70 ? 'Surpassed ✓' : 'Below Floor ⚠'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={90}
                  stroke="#059669"
                  strokeDasharray="4 4"
                  label={{
                    value: '90% Target (Maintenance)',
                    position: 'insideTopRight',
                    fill: '#059669',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <ReferenceLine
                  y={70}
                  stroke="#d97706"
                  strokeDasharray="3 3"
                  label={{
                    value: '70% Passing Floor',
                    position: 'insideBottomRight',
                    fill: '#d97706',
                    fontSize: 9,
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey="masteryIndex"
                  name="Mastery %"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={40}
                >
                  {chartData.map((entry, index) => {
                    let fillColor = '#e11d48'; // Rose (<70)
                    if (entry.masteryIndex >= 85) {
                      fillColor = '#059669'; // Emerald (>=85)
                    } else if (entry.masteryIndex >= 70) {
                      fillColor = '#f59e0b'; // Amber (70-84)
                    }
                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                  })}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Board Weight Distribution Strip */}
        <div className="pt-2 border-t border-stone-100">
          <div className="text-xs font-semibold text-stone-600 mb-2 flex items-center justify-between">
            <span>Board Licensure Weight Distribution (100% Total):</span>
            <span className="text-[11px] text-stone-500 font-normal">
              Communications (34%) and Electronics (30%) constitute 64% of total board score
            </span>
          </div>
          <div className="h-4 w-full bg-stone-100 rounded-md overflow-hidden flex shadow-inner">
            {subjectStatsList.map((s) => {
              const bgClass =
                s.mode === 'intensive'
                  ? 'bg-rose-500 hover:bg-rose-600'
                  : s.mode === 'maintenance'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-amber-500 hover:bg-amber-600';
              return (
                <div
                  key={s.subject.id}
                  style={{ width: `${s.subject.boardWeightPercent}%` }}
                  className={`${bgClass} transition-colors relative group cursor-pointer border-r border-white/40 flex items-center justify-center text-[10px] font-bold text-white font-mono overflow-hidden`}
                  title={`${s.subject.name} (${s.subject.boardWeightPercent}% weight) - Mode: ${s.modeLabel}`}
                  onClick={() => setSelectedSubjectDetail(s.subject.id)}
                >
                  <span className="truncate px-1">
                    {s.subject.shortCode} {s.subject.boardWeightPercent}%
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Intensive Study Weight:{' '}
                <strong>
                  {subjectStatsList
                    .filter((s) => s.mode === 'intensive')
                    .reduce((acc, s) => acc + s.subject.boardWeightPercent, 0)}
                  %
                </strong>
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Maintenance Weight:{' '}
                <strong>
                  {subjectStatsList
                    .filter((s) => s.mode === 'maintenance')
                    .reduce((acc, s) => acc + s.subject.boardWeightPercent, 0)}
                  %
                </strong>
              </span>
            </div>
            <span>Click any section to inspect</span>
          </div>
        </div>
      </div>

      {/* CHRONOLOGICAL STUDY TIMELINE VIEW */}
      <StudyTimeline />

      {/* STRATEGIC STUDY ALLOCATION: MAINTENANCE REVIEW VS INTENSIVE STUDY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Maintenance Box */}
        <div className="bg-white border border-emerald-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                  <AppArtwork name="shield" inline className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Maintenance Review Protocol
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                15%–20% DAILY TIME
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              For subjects where syllabus coverage is complete (&ge;90%) and average mastery meets or approaches the 90% board target.
            </p>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 space-y-1.5 text-xs text-emerald-950">
              <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Prescribed Tactics:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-800/95 font-medium pl-1">
                <li>Low-frequency spaced repetition (15–20 mins per session).</li>
                <li>Weekly mixed-topic mini board simulation tests.</li>
                <li>Targeted refresher on any item falling due without re-reading entire textbooks.</li>
              </ul>
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Eligible subjects:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {subjectStatsList
                .filter((s) => s.mode === 'maintenance')
                .map((s) => (
                  <span
                    key={s.subject.id}
                    className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold"
                  >
                    {s.subject.shortCode} ({s.masteryPercent}%)
                  </span>
                ))}
              {subjectStatsList.filter((s) => s.mode === 'maintenance').length === 0 && (
                <span className="text-stone-400 italic text-[11px]">None yet (Close gap &ge;85%)</span>
              )}
            </div>
          </div>
        </div>

        {/* Intensive Study Box */}
        <div className="bg-white border border-rose-200 rounded-xl p-4.5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-rose-100 text-rose-800 rounded-lg">
                  <AppArtwork name="flame" inline className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  New Intensive Study Protocol
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                80%–85% DAILY TIME
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              For subjects with unstudied syllabus topics, sub-L3 foundational gaps, or large negative deltas to the 90% target.
            </p>
            <div className="bg-rose-50/70 border border-rose-100 rounded-lg p-3 space-y-1.5 text-xs text-rose-950">
              <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Prescribed Tactics:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-800/95 font-medium pl-1">
                <li>Aggressive first-pass syllabus expansion (60–90 min deep blocks).</li>
                <li>High-volume practice drills immediately following conceptual review.</li>
                <li>Formula memorization and error logging to advance mastery from Level 1–2 to Level 4–5.</li>
              </ul>
            </div>
          </div>
          <div className="pt-2 border-t border-rose-100 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">Critical focus subjects:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {subjectStatsList
                .filter((s) => s.mode === 'intensive')
                .map((s) => (
                  <span
                    key={s.subject.id}
                    className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-mono font-bold"
                  >
                    {s.subject.shortCode} (Gap: {s.masteryPercent - 90}%)
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS: MAINTENANCE VS INTENSIVE STUDY */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-lg border border-stone-300">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Subjects ({subjectStatsList.length})
          </button>
          <button
            onClick={() => setActiveFilter('intensive')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'intensive'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-100'
            }`}
          >
            <AppArtwork name="flame" inline className="w-3.5 h-3.5" />
            <span>New Intensive Study ({intensiveCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('maintenance')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'maintenance'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <AppArtwork name="shield" inline className="w-3.5 h-3.5" />
            <span>Maintenance Review ({maintenanceCount})</span>
          </button>
          {transitionCount > 0 && (
            <button
              onClick={() => setActiveFilter('transition')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeFilter === 'transition'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-800 hover:bg-amber-100'
              }`}
            >
              <AppArtwork name="graph" inline className="w-3.5 h-3.5" />
              <span>Consolidation Gate ({transitionCount})</span>
            </button>
          )}
        </div>

        <div className="text-xs text-stone-500 font-mono">
          Showing {filteredSubjects.length} of {subjectStatsList.length} subjects
        </div>
      </div>

      {/* DETAILED SUBJECT COMPARISON CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSubjects.map((stat) => {
          const isIntensive = stat.mode === 'intensive';
          const isMaintenance = stat.mode === 'maintenance';
          const cardBorder = isIntensive
            ? 'border-rose-300 hover:border-rose-400 bg-white'
            : isMaintenance
            ? 'border-emerald-300 hover:border-emerald-400 bg-white'
            : 'border-amber-300 hover:border-amber-400 bg-white';

          return (
            <div
              key={stat.subject.id}
              className={`border-2 rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ${cardBorder}`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-stone-900 tracking-tight">
                        {stat.subject.name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                        {stat.subject.shortCode}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        {stat.subject.boardWeightPercent}% Exam Weight
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-1 line-clamp-1">
                      {stat.subject.description}
                    </div>
                  </div>

                  {/* Mode Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 border shadow-2xs ${
                      isIntensive
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : isMaintenance
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {isIntensive ? (
                      <AppArtwork name="flame" inline className="w-3.5 h-3.5 text-rose-600" />
                    ) : isMaintenance ? (
                      <AppArtwork name="shield" inline className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{stat.modeLabel}</span>
                  </span>
                </div>

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5 mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200 text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-stone-500">Syllabus Coverage</div>
                    <div className="text-base font-black font-mono text-stone-900 mt-0.5">
                      {stat.coveragePercent}%
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      {stat.coveredTopics}/{stat.totalTopics} topics
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-stone-500">Avg Mastery</div>
                    <div className="text-base font-black font-mono text-amber-600 mt-0.5">
                      {stat.avgMastery} <span className="text-xs font-normal text-stone-400">/ 5</span>
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      {stat.boardReadyTopicsCount} board ready
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-stone-500">Foundation Health</div>
                    <div
                      className={`text-base font-black font-mono mt-0.5 ${
                        stat.weakTopicsCount > 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {stat.weakTopicsCount > 0 ? `${stat.weakTopicsCount} Weak` : 'Floor Met ✓'}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      {stat.overdueCount > 0 ? `${stat.overdueCount} due` : 'Up to date'}
                    </div>
                  </div>
                </div>

                {/* Classification Rationale & Strategy */}
                <div className="mt-3.5 space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-stone-100/80 border border-stone-200/80">
                    <div className="font-semibold text-stone-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <AppArtwork name="target" inline className="w-3 h-3 text-stone-500" />
                      <span>Diagnostic Evaluation</span>
                    </div>
                    <p className="text-stone-600 mt-0.5">{stat.reason}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-stone-100/80 border border-stone-200/80">
                    <div className="font-semibold text-stone-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      <AppArtwork name="lightning" inline className="w-3 h-3 text-amber-600" />
                      <span>Recommended Strategy</span>
                    </div>
                    <p className="text-stone-600 mt-0.5">{stat.strategy}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Maintenance Toggle */}
              <div className="pt-3 border-t border-stone-200 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {/* Maintenance Toggle */}
                  <button
                    type="button"
                    onClick={() => markSubjectMaintenance(stat.subject.id, !stat.subject.inMaintenance)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1.5 ${
                      stat.subject.inMaintenance
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    <AppArtwork name="shield" inline className="w-3.5 h-3.5" />
                    <span>{stat.subject.inMaintenance ? 'Maintenance Active' : 'Enable Maintenance'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Primary Action Button */}
                    {stat.nextTopicToStudy && (
                      <button
                        onClick={() => handleQuickStudyTopic(stat.nextTopicToStudy!, stat.subject.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                          isIntensive
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                        }`}
                        title={
                          !stat.nextTopicToStudy.initialCovered
                            ? `Study new topic: ${stat.nextTopicToStudy.name}`
                            : `Review: ${stat.nextTopicToStudy.name}`
                        }
                      >
                        <AppArtwork name="lightning" inline className="w-3.5 h-3.5 fill-current" />
                        <span>
                          {!stat.nextTopicToStudy.initialCovered ? 'Study Next Topic' : 'Review Priority'}
                        </span>
                      </button>
                    )}

                    {/* Deep Study Pomodoro Focus Button */}
                    <button
                      onClick={() => startDeepStudySubject(stat.subject.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                        pomodoro.activeSubjectId === stat.subject.id && pomodoro.isRunning && isFocusMode
                          ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500/40 font-black'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                      title={`Enter Focus Mode & start Pomodoro timer for ${stat.subject.name}`}
                    >
                      <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {pomodoro.activeSubjectId === stat.subject.id && pomodoro.isRunning && isFocusMode
                          ? 'Focusing Now'
                          : 'Deep Study'}
                      </span>
                    </button>

                    {/* View Subject Syllabus Drilldown */}
                    <button
                      onClick={() => handleNavigateToSubject(stat.subject.id)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <span>Drilldown</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {stat.nextTopicToStudy && (
                  <div className="text-[11px] text-stone-500 flex items-center justify-between font-mono bg-stone-50 px-2.5 py-1 rounded border border-stone-200">
                    <span className="truncate">
                      Next:{' '}
                      <strong className="text-stone-800 font-sans">
                        {stat.nextTopicToStudy.name}
                      </strong>
                    </span>
                    <span className="shrink-0 text-[10px] text-stone-400">
                      {stat.nextTopicToStudy.initialCovered ? 'Spaced Review' : 'New Material'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL COMPARATIVE MATRIX TABLE */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-stone-900 flex items-center gap-2">
              <AppArtwork name="cards" inline className="w-4 h-4 text-stone-700" />
              <span>Comprehensive Subject Readiness Matrix</span>
            </h2>
            <p className="text-xs text-stone-500">
              Side-by-side tabular view across all 5 licensure subjects for audit and schedule calibration.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-stone-500">
            5 SUBJECTS AUDITED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-stone-200 text-[11px] font-bold uppercase text-stone-600 bg-stone-50/80">
                <th className="py-2.5 px-3">Subject & Code</th>
                <th className="py-2.5 px-3 text-center">Board Weight</th>
                <th className="py-2.5 px-3">Syllabus Coverage</th>
                <th className="py-2.5 px-3 text-center">Avg Mastery</th>
                <th className="py-2.5 px-3 text-center">Weak (&lt; L3)</th>
                <th className="py-2.5 px-3 text-center">Board Ready (L4-5)</th>
                <th className="py-2.5 px-3 text-center">Latest Test</th>
                <th className="py-2.5 px-3">Study Classification</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-sans">
              {subjectStatsList.map((stat) => {
                const isIntensive = stat.mode === 'intensive';
                const isMaintenance = stat.mode === 'maintenance';

                return (
                  <tr
                    key={stat.subject.id}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    <td className="py-3 px-3 font-semibold text-stone-900">
                      <div>{stat.subject.name}</div>
                      <div className="text-[10px] font-mono text-stone-400 font-normal">
                        {stat.subject.shortCode} • {stat.subject.category}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-stone-800">
                      {stat.subject.boardWeightPercent}%
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              stat.coveragePercent >= 90
                                ? 'bg-emerald-600'
                                : stat.coveragePercent >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${stat.coveragePercent}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-stone-800">
                          {stat.coveragePercent}%
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          ({stat.coveredTopics}/{stat.totalTopics})
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">
                      {stat.avgMastery} / 5
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      {stat.weakTopicsCount > 0 ? (
                        <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[11px]">
                          {stat.weakTopicsCount} topics
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold">0 ✓</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-semibold text-emerald-800">
                      {stat.boardReadyTopicsCount}
                    </td>

                    <td className="py-3 px-3 text-center font-mono">
                      {stat.latestScore !== null ? (
                        <span className="font-bold text-stone-800">{stat.latestScore}%</span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                          isIntensive
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : isMaintenance
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {isIntensive ? (
                          <AppArtwork name="flame" inline className="w-3 h-3 text-rose-600" />
                        ) : isMaintenance ? (
                          <AppArtwork name="shield" inline className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AppArtwork name="graph" inline className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{stat.modeLabel}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleNavigateToSubject(stat.subject.id)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold rounded transition-colors border border-stone-300 inline-flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const Overview = OverviewDashboard;
export default OverviewDashboard;
