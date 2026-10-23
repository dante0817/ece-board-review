import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { MathFormula } from '../MathFormula';
import {
  VERBAL_TRANSLATION_DICTIONARY,
  VERBAL_DRILL_QUESTIONS,
  VerbalTranslationPair,
  VerbalDrillQuestion,
} from '../../data/algebraicTermsData';
import { AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const VerbalTranslationTab: React.FC = () => {
  // Category filter for dictionary
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Drill state
  const [activeDrillIndex, setActiveDrillIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [userScore, setUserScore] = useState<number>(0);
  const [drillCompleted, setDrillCompleted] = useState<boolean>(false);

  const currentDrill: VerbalDrillQuestion = VERBAL_DRILL_QUESTIONS[activeDrillIndex];

  const filteredDictionary =
    selectedCategory === 'All'
      ? VERBAL_TRANSLATION_DICTIONARY
      : VERBAL_TRANSLATION_DICTIONARY.filter((p) => p.ruleCategory === selectedCategory);

  const categories = [
    'All',
    'Order Reversal',
    'Difference & Diminished',
    'Ratio & Quotient',
    'Exceeds & Increments',
    'Consecutive Numbers',
  ];

  const handleSelectOption = (optId: string) => {
    if (hasSubmitted) return;
    setSelectedOptionId(optId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || hasSubmitted) return;
    setHasSubmitted(true);
    if (selectedOptionId === currentDrill.correctId) {
      setUserScore((prev) => prev + 1);
    }
  };

  const handleNextDrill = () => {
    if (activeDrillIndex < VERBAL_DRILL_QUESTIONS.length - 1) {
      setActiveDrillIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setHasSubmitted(false);
    } else {
      setDrillCompleted(true);
    }
  };

  const handleRestartDrill = () => {
    setActiveDrillIndex(0);
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setUserScore(0);
    setDrillCompleted(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Verbal Dictionary
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Beware Reversals
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Verbal to Algebraic Translation Master Dictionary
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              The English phrasing in word problems often conceals reversed mathematical operations. Master the contrast pairs below.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Contrast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDictionary.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {item.ruleCategory}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  Board Key
                </span>
              </div>

              <div className="text-sm font-extrabold text-slate-900">
                &ldquo;{item.phrase}&rdquo;
              </div>

              {/* Side-by-Side: Correct vs Wrong Trap */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Correct Algebraic</span>
                  </div>
                  <div className="font-mono font-black text-sm text-emerald-950">
                    <MathFormula formula={item.correctAlgebraic} inline />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 space-y-1">
                  <div className="flex items-center gap-1 font-bold text-rose-800">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Common Trap</span>
                  </div>
                  <div className="font-mono font-black text-sm text-rose-950">
                    <MathFormula formula={item.wrongTrap} inline />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                <strong className="text-slate-800">Why:</strong> {item.trapExplanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Interactive Verbal Speed Drill */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase tracking-wider">
                Speed Drill
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Question {activeDrillIndex + 1} of {VERBAL_DRILL_QUESTIONS.length}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">
              PRC Board Verbal Translation Challenge
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">
              Score: <strong className="text-blue-600 font-mono text-sm">{userScore}</strong> /{' '}
              {VERBAL_DRILL_QUESTIONS.length}
            </span>
            <button
              type="button"
              onClick={handleRestartDrill}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Restart Drill"
            >
              <AppArtwork name="cycle" inline className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!drillCompleted ? (
          <div className="space-y-4">
            {/* Prompt Card */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 uppercase tracking-wide">
                {currentDrill.boardSource}
              </span>
              <p className="text-sm sm:text-base font-bold leading-snug text-slate-100">
                {currentDrill.prompt}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentDrill.options.map((opt) => {
                let borderClass = 'border-slate-200 hover:border-blue-300 bg-white';
                let textClass = 'text-slate-800';

                if (selectedOptionId === opt.id) {
                  borderClass = 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20';
                }

                if (hasSubmitted) {
                  if (opt.id === currentDrill.correctId) {
                    borderClass = 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30';
                    textClass = 'text-emerald-900 font-bold';
                  } else if (selectedOptionId === opt.id && !opt.isCorrect) {
                    borderClass = 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/30';
                    textClass = 'text-rose-900 font-bold';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={hasSubmitted}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${borderClass}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                        {opt.id}
                      </span>
                      <span className={`text-xs sm:text-sm ${textClass}`}>{opt.text}</span>
                    </div>

                    {hasSubmitted && opt.id === currentDrill.correctId && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {hasSubmitted && selectedOptionId === opt.id && !opt.isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              {!hasSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOptionId}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer disabled:opacity-40 transition-colors shadow-xs ml-auto"
                >
                  Confirm Answer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextDrill}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs ml-auto flex items-center gap-1.5"
                >
                  <span>
                    {activeDrillIndex === VERBAL_DRILL_QUESTIONS.length - 1
                      ? 'Finish Drill'
                      : 'Next Question'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Explanation when submitted */}
            {hasSubmitted && (
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-slate-700 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <AppArtwork name="star" inline className="w-4 h-4 text-blue-600" />
                  <span>Explanation &amp; Breakdown:</span>
                </div>
                <p className="leading-relaxed">{currentDrill.explanation}</p>
                <div className="pt-1 text-rose-700 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{currentDrill.trapWarning}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Drill Completed Card */
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-black text-slate-900">Verbal Drill Complete!</h4>
            <p className="text-xs sm:text-sm text-slate-500">
              You scored <strong>{userScore}</strong> out of {VERBAL_DRILL_QUESTIONS.length}.
            </p>
            <button
              type="button"
              onClick={handleRestartDrill}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
              <span>Retry Drill</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
