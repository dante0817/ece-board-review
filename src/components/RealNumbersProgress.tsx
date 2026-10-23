import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Sliders, Check, ArrowRight } from 'lucide-react';
import {
  loadConceptMasteryStore,
  CONCEPT_MASTERY_UPDATED_EVENT,
  ConceptMasteryStore,
  MASTERY_LEVEL_COLORS,
} from '../utils/conceptMasteryEngine';
import { MasterySegmentBar } from './MasterySegmentBar';
import { ConceptId } from '../utils/realNumbersScheduler';

interface RealNumbersProgressProps {
  onOpenAIHelp?: (prompt: string) => void;
  onNavigateLearn?: (stepId: number) => void;
  onNavigateReview?: () => void;
}

export const RealNumbersProgress: React.FC<RealNumbersProgressProps> = ({
  onOpenAIHelp,
  onNavigateLearn,
  onNavigateReview,
}) => {
  const [trendRange, setTrendRange] = useState<'7' | '14' | '30'>('7');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');
  const [masteryStore, setMasteryStore] = useState<ConceptMasteryStore>(() =>
    loadConceptMasteryStore()
  );

  useEffect(() => {
    const handleUpdate = () => {
      setMasteryStore(loadConceptMasteryStore());
    };
    window.addEventListener(CONCEPT_MASTERY_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(CONCEPT_MASTERY_UPDATED_EVENT, handleUpdate);
  }, []);

  return (
    <div className="w-full space-y-6">
      {/* ================= TOP ROW: 3 Primary Cards ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CARD 1: Overall Progress (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Overall Progress</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your mastery and retention in this module.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 py-1">
            {/* Left: Circular Gauge (92% Overall Mastery) */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Track */}
                <path
                  className="text-slate-100"
                  strokeWidth="3.4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Progress Arc 92% */}
                <path
                  className="text-emerald-500"
                  strokeDasharray="92, 100"
                  strokeWidth="3.4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                  92%
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1 leading-tight">
                  Overall<br />Mastery
                </span>
              </div>
            </div>

            {/* Right: 4 Metrics Grid */}
            <div className="grid grid-cols-1 gap-2.5 flex-1 pl-2">
              {/* Metric 1 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 app-artwork-tile">
                  <AppArtwork name="cap" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                    4 / 4
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Concepts Completed
                  </div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 app-artwork-tile">
                  <AppArtwork name="target" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                    67%
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Retention Rate
                  </div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100 app-artwork-tile">
                  <AppArtwork name="flame" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                    3 days
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Study Streak
                  </div>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 app-artwork-tile">
                  <AppArtwork name="chat" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-slate-900 leading-none">
                    48
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Total Questions
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Concept Mastery (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Concept Mastery</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                5-level evidence scale based on accuracy &amp; consistency.
              </p>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              5-Level Scale
            </span>
          </div>

          <div className="space-y-3.5">
            {[
              { id: 1, name: 'Number Sets' },
              { id: 2, name: 'Rational vs. Irrational' },
              { id: 3, name: 'Classifying Numbers' },
              { id: 4, name: 'Ordering & Comparing' },
            ].map((concept) => {
              const cData = masteryStore.concepts[concept.id as ConceptId];
              const level = cData ? cData.masteryLevel : 1;
              const label = cData ? cData.levelLabel : 'Needs Review';
              const color = cData ? MASTERY_LEVEL_COLORS[cData.masteryLevel].textColor : 'text-rose-600';
              const score = cData ? cData.masteryScore : 0;

              return (
                <div
                  key={concept.id}
                  onClick={() => onNavigateLearn && onNavigateLearn(concept.id)}
                  className="space-y-1.5 p-2 -mx-2 rounded-xl hover:bg-slate-50/80 transition-colors cursor-pointer"
                  title="Click to learn and review concept"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black flex items-center justify-center">
                        {concept.id}
                      </span>
                      <span>{concept.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-700">
                      {level}/5
                    </span>
                  </div>

                  <div className="pl-7 space-y-1">
                    <MasterySegmentBar level={level} size="sm" />
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-semibold ${color}`}>{label}</span>
                        {cData?.masterySource === 'user' && (
                          <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.2 rounded">
                            User Set
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-medium text-[10px]">
                        {score}% score
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CARD 3: Retention Trend (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Retention Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your retention rate over recent study sessions.
              </p>
            </div>
            
            <div className="relative">
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <span>Last 7 days</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Retention Line Chart SVG */}
          <div className="pt-2">
            <div className="relative h-44 w-full">
              {/* Y Axis Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] text-slate-400 font-mono pointer-events-none pb-5">
                <div className="flex items-center gap-2 border-b border-dashed border-slate-100 w-full">
                  <span className="w-7 text-right">100%</span>
                </div>
                <div className="flex items-center gap-2 border-b border-dashed border-slate-100 w-full">
                  <span className="w-7 text-right">75%</span>
                </div>
                <div className="flex items-center gap-2 border-b border-dashed border-slate-100 w-full">
                  <span className="w-7 text-right">50%</span>
                </div>
                <div className="flex items-center gap-2 border-b border-dashed border-slate-100 w-full">
                  <span className="w-7 text-right">25%</span>
                </div>
                <div className="flex items-center gap-2 border-b border-dashed border-slate-100 w-full">
                  <span className="w-7 text-right">0%</span>
                </div>
              </div>

              {/* SVG Curve overlay */}
              <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 320 150">
                {/* Curve path */}
                <path
                  d="M 40 100 C 70 85, 100 80, 130 75 C 160 70, 190 65, 230 60 C 260 57, 280 52, 295 48"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                <circle cx="40" cy="100" r="3.5" fill="#2563eb" className="stroke-white stroke-2" />
                <circle cx="85" cy="85" r="3.5" fill="#2563eb" className="stroke-white stroke-2" />
                <circle cx="130" cy="75" r="3.5" fill="#2563eb" className="stroke-white stroke-2" />
                <circle cx="175" cy="68" r="3.5" fill="#2563eb" className="stroke-white stroke-2" />
                <circle cx="220" cy="62" r="3.5" fill="#2563eb" className="stroke-white stroke-2" />
                <circle cx="260" cy="56" r="3.5" fill="#2563eb" className="stroke-white stroke-2" />
                
                {/* Sep 20 Point with active badge */}
                <circle cx="295" cy="48" r="4.5" fill="#2563eb" className="stroke-white stroke-2" />
              </svg>

              {/* 67% Pill Badge above the latest point */}
              <div className="absolute right-3 top-2.5 bg-[#2563eb] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-2xs flex items-center justify-center">
                67%
              </div>

              {/* X Axis Dates */}
              <div className="absolute bottom-0 inset-x-0 flex justify-between pl-8 text-[9px] text-slate-400 font-medium">
                <span>Sep 14</span>
                <span>Sep 15</span>
                <span>Sep 16</span>
                <span>Sep 17</span>
                <span>Sep 18</span>
                <span>Sep 19</span>
                <span className="font-bold text-slate-600">Sep 20</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ================= BOTTOM ROW: 3 Columns ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLUMN 1 (LEFT): Study Activity ================= */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Study Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your recent activity in this module.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateReview}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Activity List */}
          <div className="space-y-3.5 pt-1">
            {/* Item 1 */}
            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 app-artwork-tile">
                  <AppArtwork name="chat" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">
                    Practiced Number Sets
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    12 questions · 92% correct
                  </div>
                </div>
              </div>
              <span className="text-slate-400 text-[11px] shrink-0">Today, 2:14 PM</span>
            </div>

            {/* Item 2 */}
            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 app-artwork-tile">
                  <AppArtwork name="book" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">
                    Reviewed flashcards
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    18 cards · 100% correct
                  </div>
                </div>
              </div>
              <span className="text-slate-400 text-[11px] shrink-0">Today, 11:03 AM</span>
            </div>

            {/* Item 3 */}
            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">
                    Practice session
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    10 questions · 70% correct
                  </div>
                </div>
              </div>
              <span className="text-slate-400 text-[11px] shrink-0">Yesterday, 4:32 PM</span>
            </div>

            {/* Item 4 */}
            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100 app-artwork-tile">
                  <AppArtwork name="exam" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">
                    Reviewed Rational vs. Irrational
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    15 cards · 60% correct
                  </div>
                </div>
              </div>
              <span className="text-slate-400 text-[11px] shrink-0">Yesterday, 1:20 PM</span>
            </div>

            {/* Item 5 */}
            <div className="flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Sliders className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 truncate">
                    Studied Classifying Numbers
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    8 questions · 75% correct
                  </div>
                </div>
              </div>
              <span className="text-slate-400 text-[11px] shrink-0">Sep 18, 6:45 PM</span>
            </div>
          </div>
        </div>

        {/* ================= COLUMN 2 (MIDDLE): Strengths & Achievements ================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: Strengths & Focus Areas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Strengths &amp; Focus Areas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Here&apos;s what you&apos;re doing well and what to work on.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Strong Concepts */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <AppArtwork name="trophy" inline className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs sm:text-sm text-emerald-900">
                      Strong Concepts
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-800">
                    <div className="flex items-center gap-2 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>Number Sets</span>
                    </div>

                    <div className="flex items-center gap-2 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>Ordering &amp; Comparing</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-700 font-medium pt-2 border-t border-emerald-200/60 leading-relaxed">
                  You&apos;ve mastered these concepts! Keep up the great work!
                </p>
              </div>

              {/* Focus Areas */}
              <div className="bg-[#fff8f8] border border-rose-200/80 rounded-2xl p-4 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <AppArtwork name="target" inline className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-xs sm:text-sm text-rose-900">
                      Focus Areas
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-800">
                    <div className="flex items-center gap-2 font-medium">
                      <div className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        !
                      </div>
                      <span>Rational vs. Irrational</span>
                    </div>

                    <div className="flex items-center gap-2 font-medium">
                      <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        !
                      </div>
                      <span>Classifying Numbers</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 font-medium pt-2 border-t border-rose-200/60 leading-relaxed">
                  Keep practicing these concepts to improve your mastery.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Achievements */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">Achievements</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Milestones in this module.
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Achievement Badges Showcase */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* Badge 1 */}
              <div className="p-3 rounded-xl border border-amber-200/70 bg-[#fffdfa] flex flex-col items-center text-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-2xs app-artwork-tile">
                  <AppArtwork name="trophy" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  First Mastery
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  100% on Number Sets
                </div>
              </div>

              {/* Badge 2 */}
              <div className="p-3 rounded-xl border border-blue-200/70 bg-[#f8fbff] flex flex-col items-center text-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs app-artwork-tile">
                  <AppArtwork name="target" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Sharp Shooter
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  92% Overall Accuracy
                </div>
              </div>

              {/* Badge 3 */}
              <div className="p-3 rounded-xl border border-purple-200/70 bg-[#faf8ff] flex flex-col items-center text-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-2xs app-artwork-tile">
                  <AppArtwork name="lightning" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Quick Reflexes
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  Sub-30s Drill Answers
                </div>
              </div>

              {/* Badge 4 */}
              <div className="p-3 rounded-xl border border-emerald-200/70 bg-[#f6fdf9] flex flex-col items-center text-center space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs app-artwork-tile">
                  <AppArtwork name="trophy" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Mastery Scholar
                </div>
                <div className="text-[10px] text-slate-500 leading-tight">
                  4/4 Concepts Passed
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= COLUMN 3 (RIGHT): Review Schedule & Need Help ================= */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Review Schedule */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AppArtwork name="calendar" inline className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Review Schedule
                </h2>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>

            <p className="text-xs text-slate-500 -mt-2">
              Upcoming reviews for this module.
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              {/* Row 1 */}
              <div
                onClick={onNavigateReview}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 px-1 rounded transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-medium">Today</span>
                </div>
                <div className="flex items-center gap-1 text-rose-600 font-bold">
                  <span>1 concept</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Row 2 */}
              <div
                onClick={onNavigateReview}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 px-1 rounded transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-medium">Tomorrow</span>
                </div>
                <div className="flex items-center gap-1 text-rose-600 font-bold">
                  <span>1 concept</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Row 3 */}
              <div
                onClick={onNavigateReview}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 cursor-pointer hover:bg-slate-50 px-1 rounded transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="font-medium">Sep 22</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span>1 concept</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Row 4 */}
              <div
                onClick={onNavigateReview}
                className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-slate-50 px-1 rounded transition-colors"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="font-medium">Sep 25</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span>1 concept</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Need Help? */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 app-artwork-tile">
                <AppArtwork name="chat" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Need Help?</h2>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Get a hint, explanation, or a similar question from your AI Tutor.
            </p>

            <button
              type="button"
              onClick={() =>
                onOpenAIHelp?.(
                  'Explain the progress analytics for Real Numbers & Number Systems, particularly how to strengthen Rational vs. Irrational classification and boost my overall retention.'
                )
              }
              className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <AppArtwork name="star" inline className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
