import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useState } from 'react';
import { useReview } from '../context/ReviewContext';

import { Analytics } from './Analytics';
import { SubjectMasteryRadarChart } from './SubjectMasteryRadarChart';
import { SubjectMasteryChart } from './SubjectMasteryChart';
import { SubjectMasteryMilestones } from './SubjectMasteryMilestones';
import { MasteryCelebrationModal, MilestoneCelebrationData } from './MasteryCelebrationModal';
import { StudyIntensityHeatmap } from './StudyIntensityHeatmap';
import { FormulaMemorizationCard } from './algebra/FormulaMemorizationCard';

export const ProgressScreen: React.FC = () => {
  const { subjects, allTopics } = useReview();

  // 1. Study Time by Subject (Hours estimated from review activities & tests)
  const studyTimeBySubject = [
    { name: 'Mathematics (Algebra, Trig, Calc)', hours: 38.5, color: 'bg-stone-900', target: 50 },
    { name: 'Electronics Engineering', hours: 16.0, color: 'bg-amber-500', target: 45 },
    { name: 'Communications Engineering', hours: 14.5, color: 'bg-stone-600', target: 45 },
  ];

  // 2. Accuracy by Subject
  const accuracyBySubject = [
    { name: 'Mathematics (Algebra)', accuracy: 88, target: 90, status: 'Near Target' },
    { name: 'Trigonometry & Geometry', accuracy: 84, target: 90, status: 'Developing' },
    { name: 'Calculus', accuracy: 80, target: 90, status: 'Developing' },
    { name: 'Electronics', accuracy: 75, target: 90, status: 'Needs Work' },
    { name: 'Communications', accuracy: 86, target: 90, status: 'Near Target' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
          <FeatureIcon name="progress" />
          <span>Decision-Supporting Progress & Readiness</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Metrics focused strictly on informing your next review decisions and verifying board readiness.
        </p>
      </div>

      {/* OVERALL READINESS HERO CARD */}
      <div className="bg-white border-2 border-stone-900 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600">
              BOARD READINESS INDEX
            </div>
            <h2 className="text-2xl font-extrabold text-stone-900 mt-0.5">
              84.2% Estimated Board Performance
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Target: 90% • Passing Score: 70% • 45 Days until Board Exam
            </p>
          </div>

          <div className="px-4 py-2 bg-stone-900 text-amber-400 font-mono font-bold rounded-lg text-sm self-start sm:self-center shadow-xs">
            ALGEBRA: 86% Mixed Test
          </div>
        </div>

        {/* Two kinds of progress: Coverage vs Mastery across all subjects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                <AppArtwork name="cards" inline className="w-3.5 h-3.5 text-stone-500" /> Syllabus Initial Coverage
              </span>
              <span className="font-mono font-bold text-stone-900">76% Covered</span>
            </div>
            <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
              <div className="h-full bg-stone-800 rounded-full" style={{ width: '76%' }} />
            </div>
            <p className="text-[11px] text-stone-500">
              Fraction of all topics across all 3 ECE areas read or practiced at least once
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-500" /> Evidence-Based Board Mastery
              </span>
              <span className="font-mono font-bold text-stone-900">68% Retained</span>
            </div>
            <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '68%' }} />
            </div>
            <p className="text-[11px] text-stone-500">
              Topics demonstrated at Level 4 or Level 5 under timed, independent conditions
            </p>
          </div>
        </div>
      </div>

      {/* PRC ECE FORMULA QUICK-SHEET MEMORIZATION & RETRIEVAL READINESS */}
      <FormulaMemorizationCard />

      {/* 100% SUBJECT MASTERY MILESTONES & CELEBRATION EFFECT */}
      <SubjectMasteryMilestones />

      {/* CALENDAR-STYLE STUDY INTENSITY HEATMAP (PAST MONTH PRODUCTIVITY & PEAK DAYS) */}
      <StudyIntensityHeatmap />

      {/* ECE BOARD SUBJECT MASTERY RADAR CHART (STRENGTHS & WEAKNESSES VISUALIZER) */}
      <SubjectMasteryRadarChart />

      {/* RECHARTS BOARD SUBJECT MASTERY & HISTORICAL PERFORMANCE */}
      <SubjectMasteryChart />

      {/* ANALYTICS COMPONENT: SCORE TRENDS OVER TIME & MASTERY DISTRIBUTION */}
      <Analytics />

      {/* COMPLEMENTARY BENCHMARK CHARTS: TIME & ACCURACY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CHART: STUDY TIME BY SUBJECT */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
              <AppArtwork name="timer" inline className="w-4 h-4 text-stone-700" /> Study Time by Subject
            </h3>
            <span className="text-[10px] font-mono text-stone-500">69.0 Hours Total</span>
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Cumulative problem solving and diagnostic review hours invested.
          </p>

          <div className="space-y-3.5 bg-stone-50 border border-stone-200 rounded-lg p-4">
            {studyTimeBySubject.map((item, idx) => {
              const percent = Math.min(100, Math.round((item.hours / item.target) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-stone-800">{item.name}</span>
                    <span className="font-mono font-bold text-stone-900">
                      {item.hours} hrs <span className="text-stone-400 font-normal">/ {item.target}h target</span>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART: ACCURACY BY SUBJECT */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
              <AppArtwork name="target" inline className="w-4 h-4 text-stone-700" /> Accuracy by Subject
            </h3>
            <span className="text-[10px] font-mono text-stone-500">Target: 90%</span>
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Benchmark question accuracy across the syllabus testing modules.
          </p>

          <div className="space-y-3 bg-stone-50 border border-stone-200 rounded-lg p-4">
            {accuracyBySubject.map((subj, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="font-medium text-stone-800 w-44 truncate">{subj.name}</div>
                <div className="flex-1 px-3">
                  <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        subj.accuracy >= 90
                          ? 'bg-emerald-600'
                          : subj.accuracy >= 80
                          ? 'bg-stone-800'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${subj.accuracy}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right font-mono font-bold text-stone-900">
                  {subj.accuracy}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
