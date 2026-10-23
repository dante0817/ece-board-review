import { AppArtwork } from './AppArtwork';
import React from 'react';
import { AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';

export interface SubtopicMasteryItem {
  id: string;
  name: string;
  category?: string;
  historyScores: number[]; // e.g. [55, 60, 58, 62, 59]
  currentMasteryPct: number; // e.g. 59
  attemptsCount: number;
  status: 'at-risk' | 'recovering' | 'proficient' | 'mastered' | 'unassessed';
  riskReason?: string;
  recommendedAction?: string;
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  status?: 'at-risk' | 'recovering' | 'proficient' | 'mastered' | 'unassessed';
}

export const SparklineMiniChart: React.FC<SparklineProps> = ({
  data,
  width = 72,
  height = 24,
  status = 'proficient',
}) => {
  if (!data || data.length === 0) {
    return <span className="text-[10px] text-stone-400 font-mono">No data</span>;
  }

  const min = Math.min(...data, 40);
  const max = Math.max(...data, 100);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1 || 1)) * (width - 4) + 2;
      const y = height - 3 - ((val - min) / range) * (height - 6);
      return `${x},${y}`;
    })
    .join(' ');

  // Color selection based on status
  let strokeColor = '#3b82f6'; // blue
  let fillColor = '#dbeafe';
  let dotColor = '#2563eb';

  if (status === 'at-risk') {
    strokeColor = '#e11d48'; // rose
    fillColor = '#ffe4e6';
    dotColor = '#be123c';
  } else if (status === 'recovering') {
    strokeColor = '#d97706'; // amber
    fillColor = '#fef3c7';
    dotColor = '#b45309';
  } else if (status === 'mastered') {
    strokeColor = '#10b981'; // emerald
    fillColor = '#d1fae5';
    dotColor = '#059669';
  }

  const lastPoint = points.split(' ').pop()?.split(',') || [0, 0];
  const lastX = Number(lastPoint[0]) || 0;
  const lastY = Number(lastPoint[1]) || 0;

  return (
    <div className="relative inline-flex items-center gap-1.5 shrink-0" title={`Trend: ${data.join(' → ')}%`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Subtle baseline */}
        <line
          x1="2"
          y1={height - 2}
          x2={width - 2}
          y2={height - 2}
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
        {/* Sparkline curve */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Last data point dot */}
        <circle cx={lastX} cy={lastY} r="2.5" fill={dotColor} />
      </svg>
    </div>
  );
};

interface SubtopicMasteryTrackerCardProps {
  title: string;
  subtitle?: string;
  items: SubtopicMasteryItem[];
  onPracticeSubtopic: (subtopicName: string) => void;
}

export const SubtopicMasteryTrackerCard: React.FC<SubtopicMasteryTrackerCardProps> = ({
  title,
  subtitle = "Sub-topic accuracy trends based on your last 5 sessions. Track 'At-Risk' modules before the exam.",
  items,
  onPracticeSubtopic,
}) => {
  const atRiskCount = items.filter((i) => i.status === 'at-risk').length;
  const assessedCount = items.filter((i) => i.status !== 'unassessed').length;

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">
              {title}
            </h3>
            {assessedCount === 0 ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">Not assessed</span>
            ) : atRiskCount > 0 ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>{atRiskCount} at-risk concepts</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>All concepts on track</span>
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{subtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium shrink-0">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> At-Risk (&lt;70%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Recovering (70–84%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Mastered (≥85%)
          </span>
        </div>
      </div>

      {/* Subtopic Grid/Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => {
          const isUnassessed = item.status === 'unassessed';
          const isAtRisk = item.status === 'at-risk';
          const isRecovering = item.status === 'recovering';
          const isMastered = item.status === 'mastered' || item.status === 'proficient';

          // Score delta between first and last recorded score
          const firstScore = item.historyScores[0] ?? item.currentMasteryPct;
          const latestScore = item.currentMasteryPct;
          const delta = latestScore - firstScore;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                isAtRisk
                  ? 'bg-rose-50/40 border-rose-200/90 ring-1 ring-rose-200/50'
                  : isRecovering
                  ? 'bg-amber-50/30 border-amber-200/80'
                  : 'bg-stone-50/60 hover:bg-white border-stone-200/80'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-stone-900 block leading-tight">
                      {item.name}
                    </span>
                    {item.category && (
                      <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                      isAtRisk
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : isRecovering
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : isUnassessed ? 'bg-stone-100 text-stone-700 border-stone-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {isAtRisk
                      ? '⚠️ AT RISK'
                      : isRecovering
                      ? '📈 RECOVERING'
                      : isUnassessed ? 'NOT ASSESSED' : '✓ MASTERED'}
                  </span>
                </div>

                {/* Risk or status comment */}
                {item.riskReason && (
                  <p className="text-[11px] text-stone-600 mt-1.5 leading-snug line-clamp-2">
                    <span className="font-semibold text-stone-700">Diagnosis: </span>
                    {item.riskReason}
                  </p>
                )}
              </div>

              {/* Sparkline & Progress section */}
              <div className="pt-2 border-t border-stone-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 font-medium text-[11px]">Accuracy:</span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        isAtRisk
                          ? 'text-rose-700'
                          : isRecovering
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {isUnassessed ? 'Not assessed' : `${item.currentMasteryPct}%`}
                    </span>
                    {!isUnassessed && delta !== 0 && (
                      <span
                        className={`text-[10px] font-mono flex items-center font-semibold ${
                          delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {delta > 0 ? (
                          <>
                            <AppArtwork name="graph" inline className="w-2.5 h-2.5 inline mr-0.5" />+{delta}%
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-2.5 h-2.5 inline mr-0.5" />
                            {delta}%
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Sparkline */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400 font-mono">Trend:</span>
                    <SparklineMiniChart
                      data={item.historyScores}
                      status={item.status}
                      width={64}
                      height={20}
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isAtRisk
                        ? 'bg-rose-500'
                        : isRecovering
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: isUnassessed ? '0%' : `${Math.min(100, Math.max(5, item.currentMasteryPct))}%` }}
                  />
                </div>

                {/* Quick Practice button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-stone-400 font-mono">
                    {item.attemptsCount} verified question attempts logged
                  </span>
                  <button
                    type="button"
                    onClick={() => onPracticeSubtopic(item.name)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      isAtRisk
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs'
                        : isRecovering
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {isAtRisk ? 'Drill Weak Concept' : 'Practice Drill'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
