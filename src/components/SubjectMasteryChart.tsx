import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';

import { useReview } from '../context/ReviewContext';
import { Subject, TestRecord, Topic } from '../types';

export type ChartViewMode = 'mastery' | 'comparison' | 'rating';
export type GroupingMode = 'modules' | 'prc_areas';

interface SubjectMasteryData {
  id: string;
  name: string;
  shortName: string;
  category: Subject['category'];
  boardWeight: number; // e.g. 12%
  boardTarget: number; // 90%
  passingThreshold: number; // 70%
  masteryPercent: number; // 0 - 100
  masteryLevel5Scale: number; // 1.0 - 5.0
  quizAverage: number; // 0 - 100
  quizCount: number;
  testAverage: number; // 0 - 100
  testCount: number;
  gapToTarget: number;
  status: 'Study Target Met' | 'Developing' | 'Needs Remediation' | 'Not assessed';
  statusColor: string;
  barColor: string;
  topicsCount: number;
  coveredTopicsCount: number;
  recentTests: TestRecord[];
}

export const SubjectMasteryChart: React.FC = () => {
  const { subjects, testRecords, allTopics, isDarkMode, openRecordTestForTopic } = useReview();

  const [viewMode, setViewMode] = useState<ChartViewMode>('mastery');
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('modules');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Compute metrics for each of the 5 board subject modules
  const moduleData = useMemo<SubjectMasteryData[]>(() => {
    return subjects.map((subj) => {
      // 1. Find all topics belonging to this subject
      const subjectTopics = allTopics.filter((t) => t.subjectId === subj.id);
      const coveredTopics = subjectTopics.filter((t) => t.initialCovered);

      // 2. Aggregate historical quiz and drill performance from activity logs
      const allActivities = subjectTopics.filter(t => t.evidenceStatus === 'verified').flatMap((t) => t.activityHistory || []);
      const quizScores = allActivities.map((a) => a.score);

      // Only qualified evidence contributes to the score; no legacy/test/demo averages
      const topicScores = subjectTopics.filter(t => t.evidenceStatus === 'verified')
        .map((t) => t.averageScore || t.latestScore)
        .filter((s): s is number => typeof s === 'number' && s > 0);

      const combinedQuizScores = quizScores.length > 0 ? quizScores : topicScores;
      const quizAverage =
        combinedQuizScores.length > 0
          ? Math.round(
              (combinedQuizScores.reduce((acc, curr) => acc + curr, 0) /
                combinedQuizScores.length) *
                10
            ) / 10
          : 0;
      const quizCount = allActivities.length > 0 ? allActivities.length : topicScores.length;

      // 3. Find all test records for this subject
      const matchingTests = testRecords.filter((t) => {
        if (t.subjectId === subj.id && t.scope !== 'mixed' && t.provenance === 'automatic') return true;
        if (t.provenance === 'automatic' && t.itemResults?.length && t.scope !== 'mixed' && t.topicIds && t.topicIds.some((topId) => subjectTopics.some((st) => st.id === topId))) {
          return true;
        }
        return false;
      });

      // Sort recent tests chronologically descending
      const sortedTests = [...matchingTests].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Never synthesize diagnostic tests or scores when no assessment was taken.
      const testCount = matchingTests.length;
      const testAverage = testCount > 0
        ? Math.round(matchingTests.reduce((sum,t) => sum + t.scorePercent,0) / testCount * 10) / 10
        : 0;

      // 4. Topic mastery on 1 to 5 scale
      const masteries = coveredTopics.filter(t => t.evidenceStatus === 'verified')
        .map((t) => t.mastery)
        .filter((m): m is NonNullable<typeof m> => m !== null && m > 0);
      const avgMastery5 =
        masteries.length > 0
          ? masteries.reduce((acc, curr) => acc + curr, 0) / masteries.length
          : 0;
      const mastery5Normalized = (avgMastery5 / 5) * 100;

      // 5. Composite Mastery Score (%):
      // Weighting: 45% formal tests, 35% quizzes/drills, 20% verified syllabus mastery ratings
      const masteryPercent =
        Math.round((testAverage * 0.45 + quizAverage * 0.35 + mastery5Normalized * 0.2) * 10) / 10;

      const masteryLevel5Scale = Math.round((masteryPercent / 20) * 10) / 10;

      const gapToTarget = Math.max(0, Math.round((subj.boardTarget - masteryPercent) * 10) / 10);

      let status: 'Study Target Met' | 'Developing' | 'Needs Remediation' | 'Not assessed' = 'Not assessed';
      let statusColor = '#0284c7'; // sky-600
      let barColor = '#0284c7';

      if (testCount === 0 && quizCount === 0 && masteries.length === 0) {
        status = 'Not assessed';
        statusColor = '#78716c';
        barColor = '#a8a29e';
      } else if (masteryPercent >= 85) {
        status = 'Study Target Met';
        statusColor = '#059669'; // emerald-600
        barColor = '#059669';
      } else if (masteryPercent >= 70) {
        status = 'Developing';
        statusColor = '#d97706'; // amber-600
        barColor = '#f59e0b';
      } else {
        status = 'Needs Remediation';
        statusColor = '#e11d48'; // rose-600
        barColor = '#f43f5e';
      }

      let shortName = subj.name;
      if (subj.id === 'subj-math-algebra') shortName = 'Algebra';
      else if (subj.id === 'subj-math-trig') shortName = 'Trig & Geom';
      else if (subj.id === 'subj-math-calc') shortName = 'Calculus';
      else if (subj.id === 'subj-electronics') shortName = 'Electronics';
      else if (subj.id === 'subj-communications') shortName = 'Communications';

      return {
        id: subj.id,
        name: subj.name,
        shortName,
        category: subj.category,
        boardWeight: subj.boardWeightPercent,
        boardTarget: subj.boardTarget || 90,
        passingThreshold: 70,
        masteryPercent,
        masteryLevel5Scale,
        quizAverage,
        quizCount,
        testAverage,
        testCount,
        gapToTarget,
        status,
        statusColor,
        barColor,
        topicsCount: subjectTopics.length,
        coveredTopicsCount: coveredTopics.length,
        recentTests: sortedTests,
      };
    });
  }, [subjects, testRecords, allTopics]);

  // Legacy three-group learning overview; NOT the four-area official PRC blueprint
  const prcAreaData = useMemo<SubjectMasteryData[]>(() => {
    // 1. Math & GEAS Area (Algebra + Trig + Calc)
    const mathModules = moduleData.filter((m) => m.category === 'Mathematics');
    const mathWeight = mathModules.reduce((acc, curr) => acc + curr.boardWeight, 0) || 30;
    const mathMastery =
      Math.round(
        (mathModules.reduce((acc, curr) => acc + curr.masteryPercent * curr.boardWeight, 0) /
          mathWeight) *
          10
      ) / 10;
    const mathQuizAvg =
      Math.round(
        (mathModules.reduce((acc, curr) => acc + curr.quizAverage, 0) /
          Math.max(1, mathModules.length)) *
          10
      ) / 10;
    const mathTestAvg =
      Math.round(
        (mathModules.reduce((acc, curr) => acc + curr.testAverage, 0) /
          Math.max(1, mathModules.length)) *
          10
      ) / 10;
    const mathTests = mathModules.flatMap((m) => m.recentTests);

    // 2. Electronics Area
    const elecModule = moduleData.find((m) => m.category === 'Electronics') || moduleData[3];

    // 3. Communications Area
    const commModule = moduleData.find((m) => m.category === 'Communications') || moduleData[4];

    const makeArea = (
      id: string,
      name: string,
      shortName: string,
      category: 'Mathematics' | 'Electronics' | 'Communications',
      boardWeight: number,
      masteryPercent: number,
      quizAverage: number,
      quizCount: number,
      testAverage: number,
      testCount: number,
      tests: TestRecord[],
      topicsCount: number,
      coveredCount: number
    ): SubjectMasteryData => {
      const gapToTarget = Math.max(0, Math.round((90 - masteryPercent) * 10) / 10);
      let status: 'Study Target Met' | 'Developing' | 'Needs Remediation' | 'Not assessed' = 'Not assessed';
      let statusColor = '#d97706';
      let barColor = '#f59e0b';

      if (testCount === 0 && quizCount === 0) {
        status = 'Not assessed'; statusColor = '#78716c'; barColor = '#a8a29e';
      } else if (masteryPercent >= 85) {
        status = 'Study Target Met';
        statusColor = '#059669';
        barColor = '#059669';
      } else if (masteryPercent >= 70) {
        status = 'Developing';
        statusColor = '#0284c7';
        barColor = '#0284c7';
      } else {
        status = 'Needs Remediation';
        statusColor = '#e11d48';
        barColor = '#f43f5e';
      }

      return {
        id,
        name,
        shortName,
        category,
        boardWeight,
        boardTarget: 90,
        passingThreshold: 70,
        masteryPercent,
        masteryLevel5Scale: Math.round((masteryPercent / 20) * 10) / 10,
        quizAverage,
        quizCount,
        testAverage,
        testCount,
        gapToTarget,
        status,
        statusColor,
        barColor,
        topicsCount,
        coveredTopicsCount: coveredCount,
        recentTests: tests,
      };
    };

    return [
      makeArea(
        'prc-math',
        'Mathematics learning modules',
        'Math topics',
        'Mathematics',
        30,
        mathMastery,
        mathQuizAvg,
        mathModules.reduce((acc, curr) => acc + curr.quizCount, 0),
        mathTestAvg,
        mathTests.length,
        mathTests,
        mathModules.reduce((acc, curr) => acc + curr.topicsCount, 0),
        mathModules.reduce((acc, curr) => acc + curr.coveredTopicsCount, 0)
      ),
      makeArea(
        'prc-elec',
        'Electronics learning modules',
        'Electronics topics',
        'Electronics',
        30,
        elecModule ? elecModule.masteryPercent : 0,
        elecModule ? elecModule.quizAverage : 0,
        elecModule ? elecModule.quizCount : 0,
        elecModule ? elecModule.testAverage : 0,
        elecModule ? elecModule.testCount : 0,
        elecModule ? elecModule.recentTests : [],
        elecModule ? elecModule.topicsCount : 0,
        elecModule ? elecModule.coveredTopicsCount : 0
      ),
      makeArea(
        'prc-comm',
        'Communications learning modules',
        'Communications topics',
        'Communications',
        40,
        commModule ? commModule.masteryPercent : 0,
        commModule ? commModule.quizAverage : 0,
        commModule ? commModule.quizCount : 0,
        commModule ? commModule.testAverage : 0,
        commModule ? commModule.testCount : 0,
        commModule ? commModule.recentTests : [],
        commModule ? commModule.topicsCount : 0,
        commModule ? commModule.coveredTopicsCount : 0
      ),
    ];
  }, [moduleData]);

  const activeDataset = groupingMode === 'modules' ? moduleData : prcAreaData;

  // Selected subject for detail drill-down
  const activeSubject = useMemo(() => {
    if (!selectedSubjectId) return activeDataset[0];
    return activeDataset.find((d) => d.id === selectedSubjectId) || activeDataset[0];
  }, [selectedSubjectId, activeDataset]);

  // Weighted practice indicator across existing modules (not a PRC prediction)
  const weightedOverallMastery = useMemo(() => {
    const totalWeight = activeDataset.reduce((acc, curr) => acc + curr.boardWeight, 0) || 100;
    const weightedSum = activeDataset.reduce(
      (acc, curr) => acc + curr.masteryPercent * curr.boardWeight,
      0
    );
    return Math.round((weightedSum / totalWeight) * 10) / 10;
  }, [activeDataset]);

  // Styling based on dark mode
  const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
  const axisTextColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <div className="bg-white dark:bg-stone-900 border-2 border-stone-900 dark:border-stone-700 rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-lg border border-amber-300 dark:border-amber-800">
              <AppArtwork name="graph" inline className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </span>
            <h2 className="text-base font-extrabold uppercase tracking-tight text-stone-900 dark:text-stone-100">
              Subject Practice Evidence & Historical Performance
            </h2>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-stone-900 dark:bg-stone-800 text-amber-400 border border-stone-700">
              RECHARTS ENGINE
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Learning analytics from qualifying graded attempts only. A missing assessment is not an assumed score; this chart is not a board exam readiness verdict.
          </p>
        </div>

        {/* View & Grouping Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Grouping Mode Toggle */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
            <button
              type="button"
              onClick={() => {
                setGroupingMode('modules');
                setSelectedSubjectId(null);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                groupingMode === 'modules'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              5 Learning Modules
            </button>
            <button
              type="button"
              onClick={() => {
                setGroupingMode('prc_areas');
                setSelectedSubjectId(null);
              }}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                groupingMode === 'prc_areas'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              3 Learning Groups
            </button>
          </div>

          {/* Chart Metric Mode Toggle */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('mastery')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'mastery'
                  ? 'bg-stone-900 dark:bg-amber-500 text-amber-400 dark:text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Show composite board mastery level"
            >
              Mastery %
            </button>
            <button
              type="button"
              onClick={() => setViewMode('comparison')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'comparison'
                  ? 'bg-stone-900 dark:bg-amber-500 text-amber-400 dark:text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Compare quizzes vs formal mock tests side-by-side"
            >
              Quizzes vs Tests
            </button>
            <button
              type="button"
              onClick={() => setViewMode('rating')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'rating'
                  ? 'bg-stone-900 dark:bg-amber-500 text-amber-400 dark:text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="Show on Level 1.0 - 5.0 rubric scale"
            >
              L1–L5 Scale
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
          <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
            Weighted Practice Indicator
          </div>
          <div className="text-xl font-mono font-extrabold text-stone-900 dark:text-stone-100 mt-0.5 flex items-baseline gap-1.5">
            <span>{moduleData.some(m => m.testCount > 0 || m.quizCount > 0) ? `${weightedOverallMastery}%` : 'Not assessed'}</span>
            <span
              className={`text-[10px] font-sans font-bold ${
                weightedOverallMastery >= 85
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : weightedOverallMastery >= 70
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {!moduleData.some(m => m.testCount > 0 || m.quizCount > 0)
                ? 'No verified test history'
                : weightedOverallMastery >= 85
                ? 'Study Target Met'
                : weightedOverallMastery >= 70
                ? 'Developing'
                : 'Needs evidence'}
            </span>
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
            Target: <span className="font-bold text-stone-800 dark:text-stone-200">90%</span> (Gap:{' '}
            {Math.max(0, Math.round((90 - weightedOverallMastery) * 10) / 10)}%)
          </div>
        </div>

        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
          <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
            Lead Subject
          </div>
          {(() => {
            const topSubject = [...activeDataset].sort(
              (a, b) => b.masteryPercent - a.masteryPercent
            )[0];
            return (
              <>
                <div className="text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  {topSubject.shortName}
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 flex items-center justify-between">
                  <span>Score: <span className="font-bold text-stone-800 dark:text-stone-200">{topSubject.status === 'Not assessed' ? 'Not assessed' : `${topSubject.masteryPercent}%`}</span></span>
                  <span className="text-emerald-600 font-bold">L{topSubject.masteryLevel5Scale}</span>
                </div>
              </>
            );
          })()}
        </div>

        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
          <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
            Focus Remediation Area
          </div>
          {(() => {
            const lowestSubject = [...activeDataset].sort(
              (a, b) => a.masteryPercent - b.masteryPercent
            )[0];
            return (
              <>
                <div className="text-xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                  {lowestSubject.shortName}
                </div>
                <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 flex items-center justify-between">
                  <span>Score: <span className="font-bold text-stone-800 dark:text-stone-200">{lowestSubject.status === 'Not assessed' ? 'Not assessed' : `${lowestSubject.masteryPercent}%`}</span></span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">Gap: {lowestSubject.gapToTarget}%</span>
                </div>
              </>
            );
          })()}
        </div>

        <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700">
          <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">
            Historical Data Volume
          </div>
          <div className="text-xl font-mono font-extrabold text-stone-900 dark:text-stone-100 mt-0.5">
            {testRecords.filter(t=>t.provenance === 'automatic').length}{' '}
            <span className="text-xs font-sans text-stone-500 font-normal">Tests</span> •{' '}
            {activeDataset.reduce((acc, curr) => acc + curr.quizCount, 0)}{' '}
            <span className="text-xs font-sans text-stone-500 font-normal">Quizzes</span>
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
            Graded practice attempts only; manual and legacy results excluded
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* RECHARTS BAR CHART CONTAINER                                           */}
      {/* ====================================================================== */}
      <div className="w-full bg-stone-50/70 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <AppArtwork name="star" inline className="w-4 h-4 text-amber-500" />
              <span>
                {viewMode === 'mastery' && 'Subject Mastery Levels (% vs 90% Target)'}
                {viewMode === 'comparison' && 'Historical Quiz Accuracy vs Mock Test Scores by Subject'}
                {viewMode === 'rating' && 'Internal Practice Rubric (Level 1.0 – 5.0)'}
              </span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Click any bar to inspect underlying test diagnostics, question counts, and syllabus coverage.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
              <span>90% Target</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-amber-500 inline-block" />
              <span>70% Study Reference</span>
            </span>
          </div>
        </div>

        {/* Chart Rendering */}
        <div className="w-full h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeDataset}
              margin={{ top: 25, right: 20, left: -10, bottom: 25 }}
              onClick={(e: unknown) => {
                const event = e as { activePayload?: Array<{ payload: SubjectMasteryData }> } | null;
                if (event?.activePayload?.[0]?.payload) {
                  setSelectedSubjectId(event.activePayload[0].payload.id);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.7} />

              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11, fill: axisTextColor, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
                dy={8}
              />

              {viewMode === 'rating' ? (
                <YAxis
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: axisTextColor, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `L${val}.0`}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
              ) : (
                <YAxis
                  domain={[50, 100]}
                  ticks={[50, 60, 70, 80, 90, 100]}
                  tick={{ fontSize: 11, fill: axisTextColor, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val}%`}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
              )}

              {/* Reference Lines for Passing & Target */}
              {viewMode !== 'rating' ? (
                <>
                  <ReferenceLine
                    y={90}
                    stroke="#059669"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: '90% Target',
                      fill: '#059669',
                      fontSize: 10,
                      position: 'insideTopRight',
                      fontWeight: 700,
                    }}
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#d97706"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: '70% Study Reference',
                      fill: '#d97706',
                      fontSize: 10,
                      position: 'insideBottomRight',
                      fontWeight: 700,
                    }}
                  />
                </>
              ) : (
                <>
                  <ReferenceLine
                    y={4.5}
                    stroke="#059669"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: 'L4.5 (90% Target)',
                      fill: '#059669',
                      fontSize: 10,
                      position: 'insideTopRight',
                      fontWeight: 700,
                    }}
                  />
                  <ReferenceLine
                    y={3.5}
                    stroke="#d97706"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: 'L3.5 (70% Pass)',
                      fill: '#d97706',
                      fontSize: 10,
                      position: 'insideBottomRight',
                      fontWeight: 700,
                    }}
                  />
                </>
              )}

              {/* Custom Rich Tooltip */}
              <Tooltip
                cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as SubjectMasteryData;
                    return (
                      <div className="bg-stone-900 text-white p-3.5 rounded-xl shadow-xl border border-stone-700 text-xs space-y-2 max-w-xs z-50">
                        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1.5">
                          <span className="font-bold text-amber-400 text-sm">{data.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 font-semibold">
                            {data.boardWeight}% Weight
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-stone-400">Board Mastery Level:</span>
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              {data.masteryPercent}% (L{data.masteryLevel5Scale})
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-stone-400">Historical Tests ({data.testCount}):</span>
                            <span className="font-mono font-semibold text-white">
                              {data.testAverage}% Avg
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-stone-400">Quiz & Drills ({data.quizCount}):</span>
                            <span className="font-mono font-semibold text-white">
                              {data.quizAverage}% Avg
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[11px] pt-0.5">
                            <span className="text-stone-400">Gap to 90% Target:</span>
                            <span
                              className={`font-mono font-bold ${
                                data.gapToTarget === 0 ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {data.gapToTarget === 0 ? 'Achieved' : `-${data.gapToTarget}%`}
                            </span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-stone-800 flex items-center justify-between text-[10px]">
                          <span
                            className="font-bold px-2 py-0.5 rounded"
                            style={{
                              backgroundColor: `${data.statusColor}25`,
                              color: data.statusColor === '#059669' ? '#34d399' : '#fbbf24',
                            }}
                          >
                            {data.status}
                          </span>
                          <span className="text-stone-400">
                            {data.coveredTopicsCount}/{data.topicsCount} Topics Active
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* RENDER BARS BASED ON VIEW MODE */}
              {viewMode === 'mastery' && (
                <Bar
                  dataKey="masteryPercent"
                  name="Mastery Level %"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={56}
                >
                  {activeDataset.map((entry) => (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={entry.barColor}
                      stroke={selectedSubjectId === entry.id ? '#1c1917' : undefined}
                      strokeWidth={selectedSubjectId === entry.id ? 2 : 0}
                      className="cursor-pointer transition-opacity hover:opacity-85"
                    />
                  ))}
                </Bar>
              )}

              {viewMode === 'comparison' && (
                <>
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                  />
                  <Bar
                    dataKey="quizAverage"
                    name="Quiz & Drill Avg %"
                    fill="#38bdf8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="testAverage"
                    name="Formal Test Avg %"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="masteryPercent"
                    name="Composite Mastery %"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </>
              )}

              {viewMode === 'rating' && (
                <Bar
                  dataKey="masteryLevel5Scale"
                  name="Rubric Level (1-5)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={56}
                >
                  {activeDataset.map((entry) => (
                    <Cell
                      key={`cell-rating-${entry.id}`}
                      fill={entry.barColor}
                      stroke={selectedSubjectId === entry.id ? '#1c1917' : undefined}
                      strokeWidth={selectedSubjectId === entry.id ? 2 : 0}
                      className="cursor-pointer transition-opacity hover:opacity-85"
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Status Pill Badges */}
        <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
              <span>Study target (≥ 85%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
              <span>Developing (70–84%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500 inline-block" />
              <span>Needs Remediation (&lt; 70%)</span>
            </span>
          </div>

          <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
            Click any bar to view diagnostic history
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* SUBJECT DETAIL DRILL-DOWN CARD (Selected Subject)                      */}
      {/* ====================================================================== */}
      {activeSubject && (
        <div className="border border-stone-200 dark:border-stone-700 rounded-xl p-4 sm:p-5 bg-stone-50 dark:bg-stone-800/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-700 pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-3 h-8 rounded-full"
                style={{ backgroundColor: activeSubject.statusColor }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-stone-100">
                    {activeSubject.name}
                  </h4>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${activeSubject.statusColor}20`,
                      color: activeSubject.statusColor,
                    }}
                  >
                    {activeSubject.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Learning Category: <span className="font-semibold text-stone-700 dark:text-stone-300">{activeSubject.category}</span> •{' '}
                  Exam Weight: <span className="font-mono font-bold text-stone-900 dark:text-stone-100">{activeSubject.boardWeight}%</span> •{' '}
                  Syllabus Coverage: <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{activeSubject.coveredTopicsCount}/{activeSubject.topicsCount} topics</span>
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              onClick={() => openRecordTestForTopic()}
              className="px-3 py-1.5 bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-amber-400 dark:text-stone-950" />
              <span>Record Test for {activeSubject.shortName}</span>
            </button>
          </div>

          {/* Detailed Metric Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
              <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold">
                Formal Mock & Diagnostic Tests
              </div>
              <div className="text-lg font-mono font-bold text-stone-900 dark:text-stone-100 mt-0.5 flex items-baseline justify-between">
                <span>{activeSubject.testAverage}% Avg</span>
                <span className="text-xs text-stone-500 font-sans font-normal">
                  {activeSubject.testCount} tests
                </span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                45% weighted towards board composite
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
              <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold">
                Timed Quizzes & Problem Sets
              </div>
              <div className="text-lg font-mono font-bold text-stone-900 dark:text-stone-100 mt-0.5 flex items-baseline justify-between">
                <span>{activeSubject.quizAverage}% Accuracy</span>
                <span className="text-xs text-stone-500 font-sans font-normal">
                  {activeSubject.quizCount} sessions
                </span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                35% weighted towards board composite
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
              <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold">
                Target Gap & Board Trajectory
              </div>
              <div className="text-lg font-mono font-bold mt-0.5 flex items-baseline justify-between">
                <span
                  className={
                    activeSubject.gapToTarget === 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }
                >
                  {activeSubject.gapToTarget === 0
                    ? 'Target Met (90%)'
                    : `-${activeSubject.gapToTarget}% to 90%`}
                </span>
                <span className="text-xs font-sans text-stone-500">
                  Pass Margin: +{Math.max(0, Math.round((activeSubject.masteryPercent - 70) * 10) / 10)}%
                </span>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                70% is a learning reference, not proof of passing the PRC ECE exam
              </div>
            </div>
          </div>

          {/* Recent Tests Table for this subject if any */}
          {activeSubject.recentTests && activeSubject.recentTests.length > 0 && (
            <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 p-3">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2 flex items-center justify-between">
                <span>Recent Diagnostic Records ({activeSubject.recentTests.length})</span>
                <span className="text-[10px] text-stone-400 font-normal">Chronological order</span>
              </div>
              <div className="space-y-2">
                {activeSubject.recentTests.slice(0, 3).map((test) => (
                  <div
                    key={test.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 p-2 rounded-md bg-stone-50 dark:bg-stone-800 text-xs border border-stone-100 dark:border-stone-700"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {test.testType}
                      </div>
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{test.date}</span>
                        <span>•</span>
                        <span>{test.correct}/{test.questions} correct</span>
                        <span>•</span>
                        <span>{test.timeMinutes} mins</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                        {test.scorePercent}%
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          test.scorePercent >= 85
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : test.scorePercent >= 70
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {test.scorePercent >= 85 ? 'High' : test.scorePercent >= 70 ? 'Pass' : 'Remediate'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid of all subject cards for rapid comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {activeDataset.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedSubjectId(s.id)}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedSubjectId === s.id
                ? 'bg-amber-500/10 border-amber-500 dark:border-amber-400 shadow-xs'
                : 'bg-stone-50 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800 border-stone-200 dark:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                {s.name}
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.2 rounded font-mono shrink-0"
                style={{
                  backgroundColor: `${s.statusColor}20`,
                  color: s.statusColor,
                }}
              >
                {s.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-2">
              <div className="text-xl font-mono font-extrabold text-stone-900 dark:text-stone-100">
                {s.masteryPercent}%
              </div>
              <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                L{s.masteryLevel5Scale} • {s.boardWeight}% Weight
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="h-1.5 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, s.masteryPercent)}%`,
                  backgroundColor: s.barColor,
                }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-stone-500 dark:text-stone-400 mt-2">
              <span>Tests: <span className="font-mono font-bold text-stone-700 dark:text-stone-300">{s.testAverage}%</span></span>
              <span>Quizzes: <span className="font-mono font-bold text-stone-700 dark:text-stone-300">{s.quizAverage}%</span></span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
