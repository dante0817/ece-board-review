import { AppArtwork } from './common/AppArtwork';
import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { AlertTriangle, ArrowRight, Target } from 'lucide-react';
import { useReview } from '../context/ReviewContext';
import { Subject, TestRecord, Topic } from '../types';

interface SimpleSubjectRadarChartProps {
  selectedSubjectId?: string;
  onSelectSubject?: (subjectId: string) => void;
  className?: string;
}

interface SubjectRadarMetric {
  id: string;
  name: string;
  shortName: string;
  mastery: number; // 0-100%
  target: number; // e.g. 90%
  passing: number; // 70%
  gapToTarget: number;
  gapToPassing: number;
  totalTopics: number;
  coveredTopics: number;
  weakTopicsCount: number;
  weakTopics: Topic[];
  testAverage: number;
  status: 'Critical Weakness' | 'Needs Work' | 'Passing Range' | 'Board Ready';
  statusColor: string;
}

export const SimpleSubjectRadarChart: React.FC<SimpleSubjectRadarChartProps> = ({
  selectedSubjectId,
  onSelectSubject,
  className = '',
}) => {
  const { subjects, testRecords, startDeepStudySubject, pomodoro, isFocusMode } = useReview();
  const [showTarget, setShowTarget] = useState(true);
  const [showPassing, setShowPassing] = useState(true);

  // Compute mastery metrics for each subject
  const subjectMetrics: SubjectRadarMetric[] = useMemo(() => {
    return subjects.map((subj) => {
      const topics = subj.groups.flatMap((g) => g.topics);
      const totalTopics = topics.length;
      const coveredTopics = topics.filter((t) => t.initialCovered);
      const coveragePercent =
        totalTopics > 0 ? Math.round((coveredTopics.length / totalTopics) * 100) : 0;

      // Covered topic mastery average (1-5 converted to 0-100)
      const coveredMasteryAvg =
        coveredTopics.length > 0
          ? (coveredTopics.reduce((sum, t) => sum + (t.mastery || 1), 0) / coveredTopics.length) * 20
          : 20;

      // Overall syllabus mastery
      const syllabusMastery =
        totalTopics > 0
          ? (topics.reduce((sum, t) => sum + (t.mastery || 0), 0) / (totalTopics * 5)) * 100
          : 0;

      // Tests average for this subject
      const matchingTests = testRecords.filter((t) => t.subjectId === subj.id);
      const testAverage =
        matchingTests.length > 0
          ? Math.round(
              matchingTests.reduce((sum, t) => sum + t.scorePercent, 0) / matchingTests.length
            )
          : coveredMasteryAvg;

      // Balanced composite mastery: 40% covered topics mastery + 35% test score + 25% syllabus coverage
      const compositeMastery = Math.min(
        100,
        Math.max(
          10,
          Math.round(coveredMasteryAvg * 0.45 + testAverage * 0.35 + coveragePercent * 0.2)
        )
      );

      const target = subj.boardTarget || 90;
      const passing = 70;
      const gapToTarget = target - compositeMastery;
      const gapToPassing = passing - compositeMastery;

      const weakTopics = topics.filter(
        (t) => !t.mastery || t.mastery <= 2 || (t.latestScore !== null && t.latestScore < 65)
      );

      let status: SubjectRadarMetric['status'] = 'Board Ready';
      let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

      if (compositeMastery < 60) {
        status = 'Critical Weakness';
        statusColor = 'text-rose-800 bg-rose-50 border-rose-200';
      } else if (compositeMastery < passing) {
        status = 'Needs Work';
        statusColor = 'text-amber-800 bg-amber-50 border-amber-200';
      } else if (compositeMastery < 85) {
        status = 'Passing Range';
        statusColor = 'text-blue-800 bg-blue-50 border-blue-200';
      }

      // Simplify names for readable radar axis labels
      let shortName = subj.name
        .replace('Mathematics: ', '')
        .replace('Engineering', 'Eng.')
        .replace('Differential & Integral ', '');
      if (subj.id === 'subj-math-algebra') shortName = 'Algebra';
      if (subj.id === 'subj-math-trig') shortName = 'Trig & Geom';
      if (subj.id === 'subj-math-calc') shortName = 'Calculus';
      if (subj.id === 'subj-electronics') shortName = 'Electronics';
      if (subj.id === 'subj-communications') shortName = 'Communications';

      return {
        id: subj.id,
        name: subj.name,
        shortName,
        mastery: compositeMastery,
        target,
        passing,
        gapToTarget,
        gapToPassing,
        totalTopics,
        coveredTopics: coveredTopics.length,
        weakTopicsCount: weakTopics.length,
        weakTopics,
        testAverage,
        status,
        statusColor,
      };
    });
  }, [subjects, testRecords]);

  // Identify overall weakest and strongest subjects
  const sortedByMastery = useMemo(() => {
    return [...subjectMetrics].sort((a, b) => a.mastery - b.mastery);
  }, [subjectMetrics]);

  const weakestSubject = sortedByMastery[0];
  const strongestSubject = sortedByMastery[sortedByMastery.length - 1];

  // Recharts radar data structure
  const chartData = useMemo(() => {
    return subjectMetrics.map((m) => ({
      id: m.id,
      subject: m.shortName,
      fullName: m.name,
      Mastery: m.mastery,
      Target: m.target,
      Passing: m.passing,
      isWeakest: m.id === weakestSubject?.id,
      isSelected: m.id === selectedSubjectId,
    }));
  }, [subjectMetrics, weakestSubject, selectedSubjectId]);

  return (
    <div className={`bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <AppArtwork name="triangle" inline className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-stone-900 uppercase tracking-tight">
              Subject Mastery Balance Radar
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
              All 5 Board Subjects
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Visual overview of your board mastery distribution to instantly isolate and remediate your weakest subject
          </p>
        </div>

        {/* Legend / Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-900">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Mastery Score</span>
          </div>

          <button
            type="button"
            onClick={() => setShowTarget(!showTarget)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              showTarget
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-stone-50 border-stone-200 text-stone-400 line-through'
            }`}
            title="Toggle Board Target (90%) perimeter line"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Target (90%)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPassing(!showPassing)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
              showPassing
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-stone-50 border-stone-200 text-stone-400 line-through'
            }`}
            title="Toggle Passing Threshold (70%) safety line"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Passing (70%)</span>
          </button>
        </div>
      </div>

      {/* Main Content: Left = Radar Chart, Right = Weakest Subject Alert & Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-center">
        {/* Left: Recharts Radar Chart */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="w-full h-72 sm:h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="72%"
                data={chartData}
                onClick={(e: unknown) => {
                  const event = e as { activePayload?: Array<{ payload: { id: string } }> } | null;
                  const clickedId = event?.activePayload?.[0]?.payload?.id;
                  if (clickedId && onSelectSubject) {
                    onSelectSubject(clickedId);
                  }
                }}
              >
                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />

                <PolarAngleAxis
                  dataKey="subject"
                  tick={(props: any) => {
                    const val = props?.payload?.value;
                    const isWeakest = val === weakestSubject?.shortName;
                    const isSelected =
                      val === subjectMetrics.find((m) => m.id === selectedSubjectId)?.shortName;

                    return (
                      <text
                        x={props.x}
                        y={props.y}
                        textAnchor="middle"
                        fill={isWeakest ? '#e11d48' : isSelected ? '#1e293b' : '#64748b'}
                        fontSize={11}
                        fontWeight={isWeakest || isSelected ? 800 : 600}
                        className="cursor-pointer transition-colors"
                      >
                        {val}
                        {isWeakest ? ' ⚠️' : ''}
                      </text>
                    );
                  }}
                />

                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  ticks={[30, 50, 70, 90, 100]}
                  stroke="#cbd5e1"
                  tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
                />

                {/* Passing Line */}
                {showPassing && (
                  <Radar
                    name="Passing Line"
                    dataKey="Passing"
                    stroke="#f43f5e"
                    strokeDasharray="2 3"
                    strokeWidth={1.5}
                    fill="#f43f5e"
                    fillOpacity={0.03}
                    isAnimationActive={false}
                  />
                )}

                {/* Target Line */}
                {showTarget && (
                  <Radar
                    name="Board Target"
                    dataKey="Target"
                    stroke="#f59e0b"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    fill="#f59e0b"
                    fillOpacity={0.06}
                    isAnimationActive={false}
                  />
                )}

                {/* Actual Subject Mastery */}
                <Radar
                  name="Current Mastery"
                  dataKey="Mastery"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fill="#3b82f6"
                  fillOpacity={0.35}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0) {
                      const data = payload[0].payload as {
                        id: string;
                        fullName: string;
                        Mastery: number;
                        Target: number;
                        Passing: number;
                        isWeakest: boolean;
                      };
                      return (
                        <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl border border-stone-700 text-xs space-y-1.5">
                          <div className="font-bold flex items-center justify-between gap-3 border-b border-stone-800 pb-1">
                            <span>{data.fullName}</span>
                            {data.isWeakest && (
                              <span className="text-[10px] bg-rose-500 text-white font-black px-1.5 py-0.2 rounded">
                                WEAKEST
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-4 font-mono">
                            <span className="text-stone-300">Mastery:</span>
                            <span className="font-black text-amber-400 text-sm">
                              {data.Mastery}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 font-mono text-[11px] text-stone-400">
                            <span>Target:</span>
                            <span>{data.Target}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 font-mono text-[11px] text-stone-400">
                            <span>Passing:</span>
                            <span>{data.Passing}%</span>
                          </div>
                          <div className="text-[10px] text-blue-300 pt-1 border-t border-stone-800">
                            Click to switch to this subject
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-stone-400 font-medium text-center mt-1">
            Click any subject axis or point to switch focus
          </div>
        </div>

        {/* Right: Weakest Subject Alert & Ranking Cards */}
        <div className="lg:col-span-6 space-y-4">
          {/* WEAKEST SUBJECT ALERT CARD */}
          {weakestSubject && (
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50/60 p-4 sm:p-5 relative overflow-hidden transition-all shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Overall Weakest Subject</span>
                    </span>
                    <span className="text-[11px] font-bold text-rose-800">
                      High Diagnostic Priority
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-stone-900 tracking-tight">
                    {weakestSubject.name}
                  </h4>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-black font-mono text-rose-700">
                    {weakestSubject.mastery}%
                  </div>
                  <div className="text-[10px] font-bold text-rose-600 uppercase tracking-tight">
                    Mastery Level
                  </div>
                </div>
              </div>

              {/* Gap stats */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-rose-200/80 text-xs">
                <div className="bg-white/80 rounded-lg p-2 border border-rose-200/60">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">
                    Deficit to Target (90%)
                  </span>
                  <span className="font-mono font-bold text-rose-700 text-sm">
                    -{weakestSubject.gapToTarget}%
                  </span>
                </div>
                <div className="bg-white/80 rounded-lg p-2 border border-rose-200/60">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">
                    Status vs Passing (70%)
                  </span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      weakestSubject.gapToPassing > 0 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {weakestSubject.gapToPassing > 0
                      ? `-${weakestSubject.gapToPassing}% Below Passing`
                      : `+${Math.abs(weakestSubject.gapToPassing)}% Above Passing`}
                  </span>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-rose-900 font-medium">
                  {weakestSubject.weakTopicsCount > 0 ? (
                    <span>
                      {weakestSubject.weakTopicsCount} topics require immediate review &amp; practice
                    </span>
                  ) : (
                    <span>Review syllabus coverage and complete diagnostic mock tests</span>
                  )}
                </p>

                <div className="flex items-center gap-2 flex-wrap ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectSubject) onSelectSubject(weakestSubject.id);
                      startDeepStudySubject(weakestSubject.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      pomodoro.activeSubjectId === weakestSubject.id && pomodoro.isRunning && isFocusMode
                        ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500/40 font-black'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                    title={`Enter Focus Mode & start Pomodoro timer for ${weakestSubject.name}`}
                  >
                    <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {pomodoro.activeSubjectId === weakestSubject.id && pomodoro.isRunning && isFocusMode
                        ? 'Focusing Now'
                        : 'Deep Study (25m)'}
                    </span>
                  </button>

                  {onSelectSubject && (
                    <button
                      type="button"
                      onClick={() => onSelectSubject(weakestSubject.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Focus on {weakestSubject.shortName}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RANKED SUBJECTS BREAKDOWN LIST */}
          <div className="bg-stone-50 rounded-xl border border-stone-200 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-stone-500 px-1">
              <span>All Subjects Ranking (Lowest to Highest)</span>
              <span>Mastery</span>
            </div>

            <div className="space-y-1.5">
              {sortedByMastery.map((item, idx) => {
                const isWeakest = item.id === weakestSubject?.id;
                const isSelected = item.id === selectedSubjectId;

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectSubject && onSelectSubject(item.id)}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                        : isWeakest
                        ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50'
                        : 'bg-white border-stone-200/80 hover:bg-stone-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          isWeakest
                            ? 'bg-rose-600 text-white'
                            : idx === sortedByMastery.length - 1
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-bold text-stone-900 truncate">
                        {item.name}
                      </span>
                      {isWeakest && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded shrink-0">
                          Weakest
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 bg-stone-200 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${
                            item.mastery < 70
                              ? 'bg-rose-500'
                              : item.mastery < 85
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${item.mastery}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-stone-900 w-9 text-right">
                        {item.mastery}%
                      </span>

                      {/* Mini Deep Study trigger */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectSubject) onSelectSubject(item.id);
                          startDeepStudySubject(item.id);
                        }}
                        className={`p-1 rounded-md transition-colors ${
                          pomodoro.activeSubjectId === item.id && pomodoro.isRunning && isFocusMode
                            ? 'bg-amber-400 text-stone-950 font-bold'
                            : 'hover:bg-stone-200 text-stone-500 hover:text-stone-900'
                        }`}
                        title={`Deep Study ${item.name}`}
                      >
                        <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
