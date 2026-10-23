import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { AlertTriangle, Play, HelpCircle } from 'lucide-react';
import { MathView, FormattedMathText } from '../MathView';

interface ReviewTabProps {
  onNavigateTab: (tab: 'learn' | 'practice' | 'quiz' | 'mistakes', subtab?: string) => void;
  onStartStudyPlanModal: () => void;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  onNavigateTab,
  onStartStudyPlanModal,
}) => {
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticAnswer, setDiagnosticAnswer] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. Today's Recommended Review Main Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 app-artwork-tile">
            <AppArtwork name="target" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Today's Recommended Review
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Based on your progress, recent performance, and spaced repetition schedule.
            </p>
          </div>
        </div>

        {/* Callout Box */}
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-sky-50/50 to-indigo-50/70 border border-blue-100 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              Focus today
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              Addition &amp; Subtraction + Rational Equations
            </div>
            <p className="text-xs text-slate-600">
              These subskills are below your mastery target (2/5).
            </p>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                <AppArtwork name="calendar" inline className="w-3 h-3" /> Due for spaced review
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <AppArtwork name="trophy" inline className="w-3 h-3" /> Latest quiz 68%
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> 2 unresolved mistakes
              </span>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-blue-100/80 max-w-xs shrink-0 shadow-xs hidden md:block">
            <div className="text-[11px] font-serif italic text-slate-600 leading-relaxed text-center">
              “Small, consistent practice leads to big results.”
            </div>
          </div>
        </div>

        {/* 4 Steps Checklist */}
        <div className="mt-6 space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
            <span>Today's session (estimated time: 35 minutes)</span>
            <span className="text-slate-400 font-normal">4 activities</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Step 1 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 bg-[#fbfcfd] hover:bg-white hover:border-blue-200 transition-all group">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <AppArtwork name="bulb" inline className="w-3.5 h-3.5 text-amber-500" />
                    <span>Active rule recall</span>
                    <span className="text-[11px] text-slate-400 font-normal">~ 5 min</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Test what you remember from key rules and restrictions before looking at formulas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('learn', 'quick-ref-recall')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shrink-0 ml-2"
              >
                Start Recall
              </button>
            </div>

            {/* Step 2 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 bg-[#fbfcfd] hover:bg-white hover:border-blue-200 transition-all group">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <AppArtwork name="book" inline className="w-3.5 h-3.5 text-blue-500" />
                    <span>Review weakest concepts</span>
                    <span className="text-[11px] text-slate-400 font-normal">~ 8 min</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Short, focused review with examples for Addition &amp; Subtraction and Rational Equations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('learn', 'worked-examples')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shrink-0 ml-2"
              >
                Review Concepts
              </button>
            </div>

            {/* Step 3 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 bg-[#fbfcfd] hover:bg-white hover:border-blue-200 transition-all group">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Targeted practice</span>
                    <span className="text-[11px] text-slate-400 font-normal">~ 15 min</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    15 questions focusing specifically on Addition &amp; Subtraction and Rational Equations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('practice')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shrink-0 ml-2"
              >
                Start Practice
              </button>
            </div>

            {/* Step 4 */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 bg-[#fbfcfd] hover:bg-white hover:border-blue-200 transition-all group">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <AppArtwork name="trophy" inline className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mastery quiz</span>
                    <span className="text-[11px] text-slate-400 font-normal">~ 10 min</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    10 questions with strict test rules (no hints, no notes) to measure topic mastery.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('quiz')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shrink-0 ml-2"
              >
                Take Quiz
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigateTab('learn', 'quick-ref-recall')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Review</span>
            </button>
            <button
              type="button"
              onClick={onStartStudyPlanModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <AppArtwork name="calendar" inline className="w-3.5 h-3.5 text-slate-500" />
              <span>Study Plan</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowDiagnostic(!showDiagnostic)}
            className="text-xs text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Check What I Know — 5 Questions</span>
          </button>
        </div>

        {/* Optional Diagnostic Mini-Drawer */}
        {showDiagnostic && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Quick Diagnostic Check</span>
              <span className="text-[11px] text-slate-500">Question 1 of 5</span>
            </div>
            <div className="text-slate-700 space-y-2">
              <span>For what value of <MathView math="x" /> is the rational expression undefined?</span>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center">
                <MathView math="\frac{x - 4}{2x - 10}" block />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['x = 4', 'x = 5', 'x = 10', 'x = 0'].map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setDiagnosticAnswer(idx)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    diagnosticAnswer === idx
                      ? idx === 1
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                        : 'bg-rose-50 border-rose-400 text-rose-700'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <MathView math={opt} />
                </button>
              ))}
            </div>
            {diagnosticAnswer !== null && (
              <p className="text-[11px] text-slate-600">
                {diagnosticAnswer === 1 ? (
                  <span className="text-emerald-600 font-bold">
                    ✓ Correct! Setting the denominator <MathView math="2x - 10 = 0 \implies 2x = 10 \implies x = 5" />.
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold">
                    ✕ Remember: Undefined occurs when the denominator is zero, not the numerator!
                  </span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
