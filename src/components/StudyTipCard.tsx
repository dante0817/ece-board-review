import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ECE_STUDY_TIPS, getDailyStudyTip, ECEStudyTip } from '../data/studyTips';

interface StudyTipCardProps {
  currentDateStr?: string;
  onSelectCategoryFilter?: (category: string) => void;
}

export const StudyTipCard: React.FC<StudyTipCardProps> = ({ currentDateStr }) => {
  // Deterministic daily tip
  const dailyTip = getDailyStudyTip(currentDateStr);
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const idx = ECE_STUDY_TIPS.findIndex((t) => t.id === dailyTip.id);
    return idx >= 0 ? idx : 0;
  });

  // Keep track of helpful/applied bookmarked tips in localStorage
  const [appliedTips, setAppliedTips] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('ece_applied_study_tips');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [copiedFormula, setCopiedFormula] = useState(false);

  // Sync if date changes
  useEffect(() => {
    const newDaily = getDailyStudyTip(currentDateStr);
    const idx = ECE_STUDY_TIPS.findIndex((t) => t.id === newDaily.id);
    if (idx >= 0) setCurrentIndex(idx);
  }, [currentDateStr]);

  const currentTip: ECEStudyTip = ECE_STUDY_TIPS[currentIndex] || dailyTip;
  const isTodayTip = currentTip.id === dailyTip.id;
  const isApplied = Boolean(appliedTips[currentTip.id]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ECE_STUDY_TIPS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ECE_STUDY_TIPS.length) % ECE_STUDY_TIPS.length);
  };

  const handleRandom = () => {
    let nextIdx = Math.floor(Math.random() * ECE_STUDY_TIPS.length);
    if (nextIdx === currentIndex && ECE_STUDY_TIPS.length > 1) {
      nextIdx = (nextIdx + 1) % ECE_STUDY_TIPS.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleResetToToday = () => {
    const idx = ECE_STUDY_TIPS.findIndex((t) => t.id === dailyTip.id);
    if (idx >= 0) setCurrentIndex(idx);
  };

  const toggleApplied = () => {
    setAppliedTips((prev) => {
      const updated = { ...prev, [currentTip.id]: !prev[currentTip.id] };
      try {
        localStorage.setItem('ece_applied_study_tips', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleCopyFormula = () => {
    if (currentTip.ruleOfThumbOrFormula) {
      navigator.clipboard?.writeText(currentTip.ruleOfThumbOrFormula);
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2000);
    }
  };

  // Category Icon & Accent Color
  const getCategoryTheme = (category: ECEStudyTip['category']) => {
    switch (category) {
      case 'Electronics':
        return {
          icon: <AppArtwork name="chip" inline className="w-3.5 h-3.5 text-amber-600" />,
          bgBadge: 'bg-amber-50 text-amber-800 border-amber-200',
          borderAccent: 'border-l-amber-500',
        };
      case 'Communications':
        return {
          icon: <AppArtwork name="antenna" inline className="w-3.5 h-3.5 text-sky-600" />,
          bgBadge: 'bg-sky-50 text-sky-800 border-sky-200',
          borderAccent: 'border-l-sky-500',
        };
      case 'Mathematics':
        return {
          icon: <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-indigo-600" />,
          bgBadge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          borderAccent: 'border-l-indigo-500',
        };
      case 'GEAS':
        return {
          icon: <AppArtwork name="triangle" inline className="w-3.5 h-3.5 text-emerald-600" />,
          bgBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          borderAccent: 'border-l-emerald-500',
        };
      case 'Exam Strategy':
        return {
          icon: <AppArtwork name="cap" inline className="w-3.5 h-3.5 text-rose-600" />,
          bgBadge: 'bg-rose-50 text-rose-800 border-rose-200',
          borderAccent: 'border-l-rose-500',
        };
      case 'Recall Technique':
      default:
        return {
          icon: <AppArtwork name="brain" inline className="w-3.5 h-3.5 text-violet-600" />,
          bgBadge: 'bg-violet-50 text-violet-800 border-violet-200',
          borderAccent: 'border-l-violet-500',
        };
    }
  };

  const theme = getCategoryTheme(currentTip.category);

  return (
    <div
      id="study-tip-of-the-day-card"
      className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs transition-all"
    >
      {/* Top Banner Header */}
      <div className="bg-stone-50/80 border-b border-stone-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
            <AppArtwork name="bulb" inline className="w-3 h-3 text-amber-600 fill-amber-500" />
            <span>Study Tip of the Day</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${theme.bgBadge}`}
          >
            {theme.icon}
            <span>{currentTip.category}</span>
          </span>

          {isTodayTip ? (
            <span className="text-[10px] text-stone-500 flex items-center gap-1">
              <AppArtwork name="calendar" inline className="w-3 h-3 text-stone-400" />
              <span>Today's Strategy</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResetToToday}
              className="text-[10px] font-semibold text-amber-700 hover:text-amber-900 underline cursor-pointer"
            >
              Return to Today's Tip
            </button>
          )}
        </div>

        {/* Carousel & Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleRandom}
            title="Discover random strategy"
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-md text-xs transition-colors cursor-pointer"
          >
            <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-px bg-stone-300 mx-0.5" />

          <button
            type="button"
            onClick={handlePrev}
            title="Previous tip"
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-md text-xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[10px] font-mono text-stone-500 font-semibold px-1">
            {currentIndex + 1}/{ECE_STUDY_TIPS.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            title="Next tip"
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-md text-xs transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900 leading-snug flex items-center gap-2">
              <span>{currentTip.title}</span>
            </h3>
            <p className="text-xs font-semibold text-stone-600 mt-0.5">
              Core Principle: <span className="text-stone-800 font-normal">{currentTip.principle}</span>
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleApplied}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isApplied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
              title={isApplied ? 'Applied to current review routine' : 'Mark as adopted in my study routine'}
            >
              {isApplied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Applied</span>
                </>
              ) : (
                <>
                  <AppArtwork name="book" inline className="w-3.5 h-3.5 text-stone-400" />
                  <span>Adopt Strategy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actionable Strategy Guidance */}
        <div className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/70 border border-stone-200/70 rounded-lg p-3 sm:p-3.5 my-3">
          <div className="font-semibold text-stone-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-500" />
            <span>How to Apply in ECE Review:</span>
          </div>
          <p className="text-stone-800 text-xs sm:text-xs leading-relaxed">
            {currentTip.actionableAdvice}
          </p>
        </div>

        {/* Formula or Rule of Thumb callout */}
        {currentTip.ruleOfThumbOrFormula && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-stone-900 text-stone-100 font-mono text-[11px] sm:text-xs">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <span className="text-amber-400 font-bold uppercase shrink-0 text-[10px] tracking-wider font-sans">
                Key Rule:
              </span>
              <span className="text-stone-200">{currentTip.ruleOfThumbOrFormula}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyFormula}
              className="text-[10px] text-stone-400 hover:text-white shrink-0 px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer font-sans"
            >
              {copiedFormula ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        {/* Footer info: Board Subject Relevance */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1.5 truncate">
            <AppArtwork name="book" inline className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="truncate">Syllabus Scope: <strong>{currentTip.subjectRelevance}</strong></span>
          </span>

          <span className="text-stone-400 text-[10px] shrink-0 font-mono">
            {Object.keys(appliedTips).filter((k) => appliedTips[k]).length} of {ECE_STUDY_TIPS.length} strategies adopted
          </span>
        </div>
      </div>
    </div>
  );
};
