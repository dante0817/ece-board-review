import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { useReview } from '../../context/ReviewContext';
import { QUICK_SHEET_FORMULAS, QuickSheetFormula } from '../../data/formulaQuickSheetData';
import { MathFormula } from '../MathFormula';
import { CheckCircle2, ExternalLink, Check, ChevronRight } from 'lucide-react';

export const FormulaMemorizationCard: React.FC = () => {
  const {
    formulaMemorizationStats,
    memorizedFormulaIds,
    toggleFormulaMemorized,
    isFormulaMemorized,
    openFormulaQuickSheet,
    memorizeAllFormulas,
    resetMemorizedFormulas,
  } = useReview();

  const [activeTab, setActiveTab] = useState<'to-memorize' | 'memorized' | 'high-yield'>('to-memorize');

  // Filter formulas for quick checklist
  const displayFormulas = React.useMemo(() => {
    if (activeTab === 'to-memorize') {
      return QUICK_SHEET_FORMULAS.filter((f) => !memorizedFormulaIds.includes(f.id)).slice(0, 6);
    } else if (activeTab === 'memorized') {
      return QUICK_SHEET_FORMULAS.filter((f) => memorizedFormulaIds.includes(f.id)).slice(0, 6);
    } else {
      return QUICK_SHEET_FORMULAS.filter((f) => f.highYield).slice(0, 6);
    }
  }, [activeTab, memorizedFormulaIds]);

  const percent = formulaMemorizationStats.percent;
  const statusInfo =
    percent >= 90
      ? { label: 'Board Mastered', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
      : percent >= 70
      ? { label: 'Exam Ready', color: 'bg-blue-100 text-blue-800 border-blue-300' }
      : percent >= 50
      ? { label: 'Moderate Retention', color: 'bg-amber-100 text-amber-800 border-amber-300' }
      : { label: 'Needs Intensive Drill', color: 'bg-rose-100 text-rose-800 border-rose-300' };

  return (
    <div className="bg-white border-2 border-stone-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1">
              <AppArtwork name="star" inline className="w-3.5 h-3.5" />
              ECE Board Exam Recall Metrics
            </span>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wide ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <AppArtwork name="book" inline className="w-5 h-5 text-amber-600" />
            <span>Formula Quick-Sheet Memorization</span>
          </h2>
          <p className="text-xs text-stone-500">
            Instant-recall readiness across special products, exponents, quadratics, series, and ECE isolates.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => openFormulaQuickSheet('practice')}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Launch interactive flashcards to test formula recall"
          >
            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-300" />
            <span>Practice Flashcards</span>
          </button>

          <button
            type="button"
            onClick={() => openFormulaQuickSheet('cards')}
            className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Open printable & filterable Formula Quick-Sheet"
          >
            <AppArtwork name="book" inline className="w-4 h-4" />
            <span>Quick-Sheet</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI & Progress Meter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50 border border-stone-200 rounded-xl p-4">
        {/* Metric 1: Count & Percentage */}
        <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-stone-200 pb-3 md:pb-0 md:pr-4">
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
            Mastered Formulas
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black font-mono text-stone-900">
              {formulaMemorizationStats.memorized}
            </span>
            <span className="text-sm text-stone-500 font-mono">
              / {formulaMemorizationStats.total} total
            </span>
            <span className="text-lg font-black font-mono text-emerald-600 ml-auto">
              {percent}%
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {formulaMemorizationStats.unmemorized > 0
              ? `${formulaMemorizationStats.unmemorized} formulas remaining to reach 100% mastery.`
              : 'All tracked algebraic formulas have been memorized!'}
          </p>
        </div>

        {/* Metric 2: Target vs Actual Progress Bar */}
        <div className="md:col-span-2 flex flex-col justify-center space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700 flex items-center gap-1">
              <AppArtwork name="cards" inline className="w-3.5 h-3.5 text-stone-500" />
              Retrieval Readiness Progress
            </span>
            <span className="font-mono text-stone-600 text-[11px]">
              Board Target: <strong>90%</strong> (Passing baseline: 70%)
            </span>
          </div>

          <div className="relative w-full h-3.5 bg-stone-200 rounded-full overflow-hidden">
            {/* 90% benchmark indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-stone-800 z-10 opacity-70"
              style={{ left: '90%' }}
              title="Board 90% Target"
            />
            {/* 70% passing indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-stone-400 z-10"
              style={{ left: '70%' }}
              title="70% Passing Benchmark"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percent >= 90
                  ? 'bg-emerald-500'
                  : percent >= 70
                  ? 'bg-blue-600'
                  : percent >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
            <span>0%</span>
            <span>70% Passing</span>
            <span className="font-bold text-stone-700">90% Board Target</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Tiles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide">
            Memorization by Algebra Category
          </h3>
          <span className="text-[11px] text-stone-500">
            6 Syllabus Domains
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formulaMemorizationStats.byCategory.map((cat) => {
            const isComplete = cat.memorized === cat.total && cat.total > 0;

            return (
              <div
                key={cat.categoryId}
                className={`p-3 rounded-xl border transition-all ${
                  isComplete
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-stone-50/60 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-800 truncate" title={cat.categoryLabel}>
                    {cat.categoryLabel}
                  </span>
                  <span
                    className={`font-mono text-xs font-extrabold ${
                      isComplete ? 'text-emerald-700' : 'text-stone-700'
                    }`}
                  >
                    {cat.memorized}/{cat.total}
                  </span>
                </div>

                <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-emerald-500' : 'bg-stone-700'
                    }`}
                    style={{ width: `${cat.percent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500">
                  <span>{cat.percent}% memorized</span>
                  {isComplete ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Complete
                    </span>
                  ) : (
                    <span>{cat.total - cat.memorized} to go</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Quick-Check / Drill List */}
      <div className="border border-stone-200 rounded-xl p-4 bg-white space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-900">
              Interactive Formula Checklist
            </span>
            <span className="text-[11px] text-stone-500">
              (Live-syncs with Quick-Sheet)
            </span>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('to-memorize')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'to-memorize'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              To Memorize ({formulaMemorizationStats.unmemorized})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('memorized')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'memorized'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Memorized ({formulaMemorizationStats.memorized})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('high-yield')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeTab === 'high-yield'
                  ? 'bg-white text-amber-800 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <AppArtwork name="flame" inline className="w-3 h-3 text-amber-500" />
              <span>High Yield</span>
            </button>
          </div>
        </div>

        {displayFormulas.length === 0 ? (
          <div className="text-center py-6 text-xs text-stone-500 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-stone-700">No formulas in this view</p>
            <p className="text-stone-400">
              {activeTab === 'to-memorize'
                ? 'Congratulations! You have memorized all tracked formulas.'
                : 'Check off formulas in the list to populate this view.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {displayFormulas.map((item) => {
              const memorized = isFormulaMemorized(item.id);

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border flex items-start justify-between gap-3 transition-colors ${
                    memorized
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-stone-50/50 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {/* Interactive Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleFormulaMemorized(item.id)}
                      className={`mt-0.5 p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                        memorized
                          ? 'text-emerald-600 hover:text-emerald-700 bg-emerald-100'
                          : 'text-stone-400 hover:text-stone-600 bg-white border border-stone-300'
                      }`}
                      title={memorized ? 'Mark as unmemorized' : 'Mark as memorized'}
                    >
                      {memorized ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <div className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {item.name}
                        </span>
                        {item.highYield && (
                          <span className="text-[9px] font-black text-amber-800 bg-amber-100 px-1 py-0.2 rounded">
                            PRC High Yield
                          </span>
                        )}
                      </div>
                      <div className="mt-1 font-mono text-[11px] text-stone-800 overflow-x-auto">
                        <MathFormula formula={item.latex} inline />
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      memorized
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {memorized ? 'Memorized' : 'To Memorize'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
          <span className="text-stone-500 text-[11px]">
            Toggling formulas updates your Board Readiness metrics immediately.
          </span>
          <button
            type="button"
            onClick={() => openFormulaQuickSheet('cards')}
            className="text-stone-900 font-bold hover:text-amber-600 flex items-center gap-1 text-xs cursor-pointer"
          >
            <span>View all 29 formulas in Quick-Sheet</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
