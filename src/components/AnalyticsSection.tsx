import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';

import { useReview } from '../context/ReviewContext';
import { TestRecord, Topic } from '../types';

interface ScoreDataPoint {
  id: string;
  date: string;
  displayDate: string;
  score: number;
  testType: string;
  questions: number;
  correct: number;
  timeMinutes: number;
}

interface MasteryLevelData {
  level: number;
  levelLabel: string;
  descriptor: string;
  count: number;
  percent: number;
  color: string;
  topics: string[];
}

export const Analytics: React.FC = () => {
  const { testRecords, allTopics, openRecordTestForTopic } = useReview();
  const [distributionMode, setDistributionMode] = useState<'count' | 'percent'>('count');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'recent'>('all');

  // 1. Process and sort Score Trends over time from testRecords
  const scoreTrendData = useMemo(() => {
    if (!testRecords || testRecords.length === 0) {
      // Fallback baseline points if no tests exist yet
      return [
        {
          id: 'base-1',
          date: '2026-08-15',
          displayDate: 'Aug 15',
          score: 72,
          testType: 'Mathematics Baseline Diagnostic #1',
          questions: 50,
          correct: 36,
          timeMinutes: 75,
        },
        {
          id: 'base-2',
          date: '2026-08-30',
          displayDate: 'Aug 30',
          score: 82.5,
          testType: 'Algebra Equations Diagnostic',
          questions: 40,
          correct: 33,
          timeMinutes: 52,
        },
        {
          id: 'base-3',
          date: '2026-09-04',
          displayDate: 'Sep 04',
          score: 86.7,
          testType: 'Sequences & Series Timed Quiz',
          questions: 30,
          correct: 26,
          timeMinutes: 38,
        },
        {
          id: 'base-4',
          date: '2026-09-06',
          displayDate: 'Sep 06',
          score: 88,
          testType: 'Mixed Algebra Comprehensive',
          questions: 50,
          correct: 44,
          timeMinutes: 67,
        },
      ];
    }

    // Sort chronologically ascending
    const sorted = [...testRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const mapped: ScoreDataPoint[] = sorted.map((t: TestRecord) => {
      const dateObj = new Date(t.date + 'T00:00:00');
      const displayDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : t.date;

      return {
        id: t.id,
        date: t.date,
        displayDate,
        score: Math.round(t.scorePercent * 10) / 10,
        testType: t.testType || 'Diagnostic Test',
        questions: t.questions,
        correct: t.correct,
        timeMinutes: t.timeMinutes,
      };
    });

    if (scoreFilter === 'recent' && mapped.length > 5) {
      return mapped.slice(-5);
    }
    return mapped;
  }, [testRecords, scoreFilter]);

  // Score stats calculations
  const scoreStats = useMemo(() => {
    if (scoreTrendData.length === 0) {
      return { startScore: 0, latestScore: 0, delta: 0, avgScore: 0, highestScore: 0 };
    }
    const startScore = scoreTrendData[0].score;
    const latestScore = scoreTrendData[scoreTrendData.length - 1].score;
    const delta = Math.round((latestScore - startScore) * 10) / 10;
    const avgScore =
      Math.round(
        (scoreTrendData.reduce((acc, curr) => acc + curr.score, 0) / scoreTrendData.length) * 10
      ) / 10;
    const highestScore = Math.max(...scoreTrendData.map((d) => d.score));

    return { startScore, latestScore, delta, avgScore, highestScore };
  }, [scoreTrendData]);

  // 2. Process Mastery Distribution across Level 1 to 5
  const masteryDistribution = useMemo(() => {
    const coveredTopics = allTopics.filter((t) => t.initialCovered);
    const totalCovered = Math.max(1, coveredTopics.length);

    const levelConfigs = [
      {
        level: 1,
        levelLabel: 'L1 Novice',
        descriptor: '< 50% Accuracy / Conceptual Refresher Needed',
        color: '#f43f5e', // rose-500
      },
      {
        level: 2,
        levelLabel: 'L2 Developing',
        descriptor: '50% - 69% Accuracy / Needs Remediation Drill',
        color: '#f97316', // orange-500
      },
      {
        level: 3,
        levelLabel: 'L3 Competent',
        descriptor: '70% - 79% Passing Baseline / Spaced Maintenance',
        color: '#eab308', // yellow-500
      },
      {
        level: 4,
        levelLabel: 'L4 Board Ready',
        descriptor: '80% - 89% Board Standard / High Independence',
        color: '#0284c7', // sky-600
      },
      {
        level: 5,
        levelLabel: 'L5 Mastered',
        descriptor: '90%+ Peak Board Mastery / Locked Retention',
        color: '#059669', // emerald-600
      },
    ];

    const result: MasteryLevelData[] = levelConfigs.map((cfg) => {
      const matchingTopics = coveredTopics.filter(
        (t) => (t.mastery === null ? 1 : t.mastery) === cfg.level
      );
      const count = matchingTopics.length;
      const percent = Math.round((count / totalCovered) * 100);

      return {
        level: cfg.level,
        levelLabel: cfg.levelLabel,
        descriptor: cfg.descriptor,
        count,
        percent,
        color: cfg.color,
        topics: matchingTopics.map((t) => t.name),
      };
    });

    const readyTopicsCount = result
      .filter((r) => r.level >= 4)
      .reduce((acc, curr) => acc + curr.count, 0);
    const readyPercent = Math.round((readyTopicsCount / totalCovered) * 100);

    const remediationTopicsCount = result
      .filter((r) => r.level <= 2)
      .reduce((acc, curr) => acc + curr.count, 0);

    return {
      distribution: result,
      totalCovered,
      readyTopicsCount,
      readyPercent,
      remediationTopicsCount,
    };
  }, [allTopics]);

  return (
    <div className="bg-white border-2 border-stone-900 rounded-xl p-6 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 text-amber-900 rounded-lg border border-amber-300">
              <AppArtwork name="graph" inline className="w-4 h-4" />
            </span>
            <h2 className="text-base font-extrabold uppercase tracking-tight text-stone-900">
              Analytics & Performance Trends
            </h2>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-stone-900 text-amber-400">
              ECE BOARD CALIBRATED
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Visualizing score trajectory over time and syllabus mastery distribution to identify readiness and remediation priorities.
          </p>
        </div>

        {/* Quick Trajectory & Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-stone-400 uppercase font-semibold">Latest Trajectory</div>
            <div className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1 justify-end">
              <AppArtwork name="graph" inline className="w-3 h-3" />
              <span>+{scoreStats.delta}% Net Gain</span>
            </div>
          </div>
          <button
            onClick={() => openRecordTestForTopic()}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-400" />
            <span>Record Test</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Stat Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
          <div className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Latest Test Score</div>
          <div className="text-xl font-mono font-extrabold text-stone-900 mt-0.5 flex items-baseline gap-1.5">
            <span>{scoreStats.latestScore}%</span>
            <span className="text-[10px] font-sans font-semibold text-emerald-600">
              {scoreStats.latestScore >= 90 ? 'Board Ready' : 'Passing Range'}
            </span>
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Target: <span className="font-bold text-stone-800">90%</span> (gap: {Math.max(0, Math.round((90 - scoreStats.latestScore) * 10) / 10)}%)
          </div>
        </div>

        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
          <div className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Score Progression</div>
          <div className="text-xl font-mono font-extrabold text-emerald-600 mt-0.5 flex items-baseline gap-1">
            <span>+{scoreStats.delta}%</span>
            <span className="text-[10px] font-sans font-normal text-stone-500">
              from {scoreStats.startScore}%
            </span>
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Across <span className="font-bold text-stone-800">{scoreTrendData.length}</span> diagnostic sessions
          </div>
        </div>

        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
          <div className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Board Ready (L4–L5)</div>
          <div className="text-xl font-mono font-extrabold text-stone-900 mt-0.5 flex items-baseline gap-1">
            <span>{masteryDistribution.readyTopicsCount}</span>
            <span className="text-xs text-stone-500">/ {masteryDistribution.totalCovered}</span>
            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded ml-auto">
              {masteryDistribution.readyPercent}%
            </span>
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Demonstrated high independence
          </div>
        </div>

        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
          <div className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Sub-L3 Remediation</div>
          <div className="text-xl font-mono font-extrabold text-rose-600 mt-0.5 flex items-baseline gap-1">
            <span>{masteryDistribution.remediationTopicsCount}</span>
            <span className="text-xs text-stone-500">topics</span>
            {masteryDistribution.remediationTopicsCount > 0 && (
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded ml-auto">
                Priority
              </span>
            )}
          </div>
          <div className="text-[10px] text-stone-500 mt-1">
            Requires targeted question drills
          </div>
        </div>
      </div>

      {/* 2 CHARTS GRID: LINE CHART (Score Trends) & BAR CHART (Mastery Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* ====================================================================== */}
        {/* 1. LINE CHART: SCORE TRENDS OVER TIME                                  */}
        {/* ====================================================================== */}
        <div className="border border-stone-200 rounded-xl p-4 sm:p-5 bg-stone-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <AppArtwork name="graph" inline className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-stone-900">
                  Score Trends Over Time
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setScoreFilter('all')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    scoreFilter === 'all'
                      ? 'bg-stone-900 text-amber-400'
                      : 'text-stone-500 hover:text-stone-800 bg-white border border-stone-200'
                  }`}
                >
                  All ({scoreTrendData.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScoreFilter('recent')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    scoreFilter === 'recent'
                      ? 'bg-stone-900 text-amber-400'
                      : 'text-stone-500 hover:text-stone-800 bg-white border border-stone-200'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Historical exam & diagnostic trajectory measured against the 90% Board Target and 70% Passing Line.
            </p>
          </div>

          {/* Recharts LineChart */}
          <div className="w-full h-64 bg-white rounded-lg border border-stone-200 p-2 sm:p-3 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={scoreTrendData}
                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'monospace' }}
                  tickLine={false}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis
                  domain={[55, 100]}
                  ticks={[60, 70, 80, 90, 100]}
                  tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val}%`}
                  tickLine={false}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ScoreDataPoint;
                      return (
                        <div className="bg-stone-900 text-white p-3 rounded-lg shadow-lg border border-stone-700 text-xs space-y-1">
                          <div className="text-amber-400 font-bold">{data.testType}</div>
                          <div className="text-stone-400 text-[10px] flex items-center gap-1">
                            <AppArtwork name="calendar" inline className="w-3 h-3" />
                            <span>{data.date}</span>
                          </div>
                          <div className="text-base font-mono font-bold text-white pt-1">
                            Score: {data.score}%
                          </div>
                          <div className="text-[10px] text-stone-300">
                            Accuracy: {data.correct} / {data.questions} questions ({data.timeMinutes} mins)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* 90% Target Reference Line */}
                <ReferenceLine
                  y={90}
                  stroke="#059669"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '90% Board Target',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideTopRight',
                    fontWeight: 700,
                  }}
                />
                {/* 70% Passing Threshold Reference Line */}
                <ReferenceLine
                  y={70}
                  stroke="#d97706"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '70% Passing Line',
                    fill: '#d97706',
                    fontSize: 10,
                    position: 'insideBottomRight',
                    fontWeight: 700,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Score %"
                  stroke="#1c1917"
                  strokeWidth={3}
                  dot={{
                    r: 4.5,
                    fill: '#f59e0b',
                    stroke: '#1c1917',
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#f59e0b',
                    stroke: '#1c1917',
                    strokeWidth: 3,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer Legend / Insights */}
          <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-stone-900" />
                <span>Test Scores</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
                <span>90% Target</span>
              </span>
              <span className="flex items-center gap-1 text-amber-700">
                <span className="w-3 h-0.5 bg-amber-500 inline-block" />
                <span>70% Pass</span>
              </span>
            </div>
            <span className="font-mono font-bold text-stone-700">
              Avg: {scoreStats.avgScore}%
            </span>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* 2. BAR CHART: MASTERY DISTRIBUTION (Levels 1 to 5)                     */}
        {/* ====================================================================== */}
        <div className="border border-stone-200 rounded-xl p-4 sm:p-5 bg-stone-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5">
                <AppArtwork name="graph" inline className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold uppercase tracking-tight text-stone-900">
                  Mastery Distribution
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setDistributionMode('count')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    distributionMode === 'count'
                      ? 'bg-stone-900 text-amber-400'
                      : 'text-stone-500 hover:text-stone-800 bg-white border border-stone-200'
                  }`}
                >
                  Count
                </button>
                <button
                  type="button"
                  onClick={() => setDistributionMode('percent')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    distributionMode === 'percent'
                      ? 'bg-stone-900 text-amber-400'
                      : 'text-stone-500 hover:text-stone-800 bg-white border border-stone-200'
                  }`}
                >
                  % Syllabus
                </button>
              </div>
            </div>
            <p className="text-xs text-stone-500 mb-4">
              Breakdown of covered topics across mastery levels (1 to 5) determined by retention and speed.
            </p>
          </div>

          {/* Recharts BarChart */}
          <div className="w-full h-64 bg-white rounded-lg border border-stone-200 p-2 sm:p-3 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={masteryDistribution.distribution}
                margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="levelLabel"
                  tick={{ fontSize: 11, fill: '#4b5563', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <YAxis
                  dataKey={distributionMode === 'count' ? 'count' : 'percent'}
                  tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'monospace' }}
                  tickFormatter={(val) => (distributionMode === 'percent' ? `${val}%` : `${val}`)}
                  tickLine={false}
                  axisLine={{ stroke: '#d1d5db' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as MasteryLevelData;
                      return (
                        <div className="bg-stone-900 text-white p-3 rounded-lg shadow-lg border border-stone-700 text-xs space-y-1.5 max-w-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-amber-400">{data.levelLabel}</span>
                            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-stone-800 text-white">
                              {data.count} topics ({data.percent}%)
                            </span>
                          </div>
                          <p className="text-[10px] text-stone-300 italic">{data.descriptor}</p>
                          {data.topics.length > 0 && (
                            <div className="pt-1 border-t border-stone-800">
                              <span className="text-[10px] text-stone-400 font-bold block mb-1">
                                Topics ({data.topics.length}):
                              </span>
                              <div className="text-[10px] text-stone-300 max-h-24 overflow-y-auto space-y-0.5 pr-1">
                                {data.topics.map((tName, i) => (
                                  <div key={i} className="truncate">• {tName}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey={distributionMode === 'count' ? 'count' : 'percent'}
                  radius={[4, 4, 0, 0]}
                >
                  {masteryDistribution.distribution.map((entry) => (
                    <Cell key={`cell-${entry.level}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Level Guide & Breakdown */}
          <div className="mt-3 pt-3 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                <span className="text-stone-700">L5: Mastered</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-600" />
                <span className="text-stone-700">L4: Ready</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />
                <span className="text-stone-700">L3: Pass</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span className="text-stone-700">L1-2: Drill</span>
              </span>
            </div>
            <span className="font-mono font-bold text-stone-800">
              {masteryDistribution.totalCovered} Topics Measured
            </span>
          </div>
        </div>
      </div>

      {/* Analytical Takeaways & Decision Guidance */}
      <div className="p-4 bg-stone-900 text-stone-100 rounded-xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
            <AppArtwork name="trophy" inline className="w-4 h-4" />
            <span>Board Examination Readiness Synthesis</span>
          </div>
          <p className="text-xs text-stone-300">
            {masteryDistribution.readyPercent >= 65
              ? `Solid performance: ${masteryDistribution.readyPercent}% of syllabus is at Board Standard (L4–L5). Remediate the remaining ${masteryDistribution.remediationTopicsCount} sub-L3 topics to graduate Algebra to maintenance.`
              : `Foundational focus: currently ${masteryDistribution.readyPercent}% at Board Standard. Prioritize daily question volume on L1 and L2 topics.`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <div className="px-3 py-1.5 bg-stone-800 rounded-lg border border-stone-700 text-center">
            <div className="text-[10px] text-stone-400 uppercase">Board Target</div>
            <div className="font-bold text-emerald-400">90.0%</div>
          </div>
          <div className="px-3 py-1.5 bg-stone-800 rounded-lg border border-stone-700 text-center">
            <div className="text-[10px] text-stone-400 uppercase">Passing Benchmark</div>
            <div className="font-bold text-amber-400">70.0%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnalyticsSection = Analytics;
export default Analytics;
