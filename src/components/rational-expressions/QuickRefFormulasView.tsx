import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, EyeOff, Search, Check, BookmarkCheck, AlertOctagon, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { MathFormula } from '../MathFormula';
import {
  QUICK_REF_FORMULAS,
  FORMULA_CATEGORIES,
  FormulaItem,
} from './quickRefFormulasData';
import { useReview } from '../../context/ReviewContext';

interface QuickRefFormulasViewProps {
  onPracticeFormula?: (category: string) => void;
}

export const QuickRefFormulasView: React.FC<QuickRefFormulasViewProps> = ({
  onPracticeFormula,
}) => {
  const { openChat } = useReview();

  // Filter and search state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Recall Mode state
  const [recallMode, setRecallMode] = useState(false);
  const [revealedRules, setRevealedRules] = useState<Record<string, boolean>>({});

  // Bookmarked / flagged for review
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  // Copied formula state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Show/hide golden rule box
  const [showGoldenRule, setShowGoldenRule] = useState(true);

  // Show/hide calculator speed sheet
  const [showCalcSheet, setShowCalcSheet] = useState(false);

  const toggleRuleReveal = (id: string) => {
    setRevealedRules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const revealAll = () => {
    const allRevealed: Record<string, boolean> = {};
    QUICK_REF_FORMULAS.forEach((f) => {
      allRevealed[f.id] = true;
    });
    setRevealedRules(allRevealed);
  };

  const hideAll = () => {
    setRevealedRules({});
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyFormula = (id: string, formulaText: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filter formulas
  const filteredFormulas = useMemo(() => {
    return QUICK_REF_FORMULAS.filter((item) => {
      let matchesCategory = false;
      if (selectedCategory === 'all') {
        matchesCategory = true;
      } else if (selectedCategory === 'core-procedures') {
        matchesCategory = !!item.isCoreProcedure;
      } else {
        matchesCategory = item.category === selectedCategory;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.memoryCue.toLowerCase().includes(q) ||
        item.examinerTrap.toLowerCase().includes(q) ||
        (item.recallQuestion && item.recallQuestion.toLowerCase().includes(q)) ||
        (item.eceApplication && item.eceApplication.toLowerCase().includes(q)) ||
        (item.casioTip && item.casioTip.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const totalFilteredCount = filteredFormulas.length;
  const revealedCount = filteredFormulas.filter((f) => revealedRules[f.id]).length;
  const percentRecalled =
    totalFilteredCount > 0 ? Math.round((revealedCount / totalFilteredCount) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Formula Quick Reference
              </span>
              <span className="text-xs text-slate-500 font-medium">
                17 High-Yield PRC ECE Board Identities &amp; Procedures
              </span>
            </div>
            <h3 className="font-black text-slate-900 text-lg">
              Rational Expressions Formula Reference &amp; Active Recall
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1 max-w-3xl">
              Master core domain restrictions, multiplication, division, LCD addition/subtraction, extraneous roots, Heaviside Cover-Up templates, and Casio fx-991 verification hacks.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
            {/* Recall Mode Toggle Button */}
            <button
              type="button"
              onClick={() => {
                const nextMode = !recallMode;
                setRecallMode(nextMode);
                if (nextMode) {
                  // Default to masked when enabling recall mode
                  setRevealedRules({});
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                recallMode
                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              {recallMode ? (
                <AppArtwork name="eye" inline className="w-4 h-4 text-white" />
              ) : (
                <EyeOff className="w-4 h-4 text-amber-600" />
              )}
              <span>{recallMode ? 'Recall Mode: ACTIVE' : 'Recall Mode'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCalcSheet(!showCalcSheet)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-amber-400" />
              <span>fx-991 Hacks</span>
            </button>
          </div>
        </div>

        {/* Recall Mode Interactive Controller Strip */}
        {recallMode && (
          <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50/60 rounded-xl border border-amber-300/90 space-y-3 animate-in fade-in duration-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs app-artwork-tile">
                  <AppArtwork name="bulb" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-950 flex items-center gap-2">
                    <span>Active Recall Practice Mode</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Answers and rules are hidden behind &apos;Reveal Rule&apos; buttons. Test your memory for domain rules, multiplication, division, and addition/subtraction before revealing!
                  </p>
                </div>
              </div>

              {/* Reveal All / Mask All */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={revealAll}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <AppArtwork name="eye" inline className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reveal All Rules</span>
                </button>
                <button
                  type="button"
                  onClick={hideAll}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <AppArtwork name="cycle" inline className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hide All Rules</span>
                </button>
              </div>
            </div>

            {/* Progress Bar & Quick Topic Chips */}
            <div className="pt-2 border-t border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold text-amber-900 shrink-0">
                  Revealed: {revealedCount} / {totalFilteredCount} rules ({percentRecalled}%)
                </span>
                <div className="w-36 sm:w-48 h-2 bg-amber-200 rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full bg-amber-600 transition-all duration-300 rounded-full"
                    style={{ width: `${percentRecalled}%` }}
                  />
                </div>
              </div>

              {/* Quick Jump Buttons for Core Procedures */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-amber-900 mr-1">Focus on:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('core-procedures');
                    setSearchQuery('');
                  }}
                  className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedCategory === 'core-procedures' && !searchQuery
                      ? 'bg-amber-600 text-white'
                      : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  ★ Core 4 Procedures
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('domain');
                  }}
                  className="px-2 py-1 text-[11px] font-bold rounded-lg bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Domain Rules
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('multiplication');
                  }}
                  className="px-2 py-1 text-[11px] font-bold rounded-lg bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Multiplication
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('division');
                  }}
                  className="px-2 py-1 text-[11px] font-bold rounded-lg bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Division
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('addition');
                  }}
                  className="px-2 py-1 text-[11px] font-bold rounded-lg bg-white text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Add / Sub (LCD)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Casio fx-991 Calculator Cheat Sheet Drawer */}
      {showCalcSheet && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AppArtwork name="calculator" inline className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                PRC ECE Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) / fx-991CW Speed Solver Summary
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCalcSheet(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Close ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>1. CALC Prime Substitution</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Verify algebraic equivalence without factoring. Type expression with <code className="text-amber-200">[ALPHA] [X]</code>, press <code className="text-amber-200">[CALC]</code>, input <code className="text-amber-200">X = 7</code> or <code className="text-amber-200">X = 11</code>. Compare decimal against the 4 choices.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>2. SHIFT SOLVE Root Extraction</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Type full equation with <code className="text-amber-200">[ALPHA] [CALC] (=)</code>. Press <code className="text-amber-200">[SHIFT] [CALC] (SOLVE)</code>. If calculator yields &quot;Can&apos;t Solve&quot;, the candidate value is an asymptote/extraneous root.
              </p>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>3. TABLE Mode Interval Sign Chart</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                For rational inequalities, set <code className="text-amber-200">f(x) = (num)/(den)</code> in Table mode. Inspect sign flips (+ to -) across critical values. Eliminates manual number line sketching.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The Golden Rule of Rational Cancellation Callout */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div
          className="p-4 bg-slate-50 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/70 transition-colors"
          onClick={() => setShowGoldenRule(!showGoldenRule)}
        >
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              PRC Examiner Alert: The Cancellation Fallacy
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              {showGoldenRule ? 'Hide Axiom' : 'Show Axiom'}
            </span>
            {showGoldenRule ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {showGoldenRule && (
          <div className="p-4 sm:p-5 border-t border-slate-200/70 text-xs space-y-3 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>The Illegal Cancellation (Fatal Error)</span>
                </div>
                <div className="font-mono text-xs text-rose-800 text-center py-2 bg-white rounded-lg border border-rose-200 shadow-2xs">
                  <MathFormula formula="\frac{\textcolor{#e11d48}{\mathbf{x}} + 5}{\textcolor{#e11d48}{\mathbf{x}} + 7} \neq \frac{5}{7} \quad \text{and} \quad \frac{\textcolor{#e11d48}{\mathbf{x^2}} - 9}{\textcolor{#e11d48}{\mathbf{x}} - 3} \neq x^2 - 3" block />
                </div>
                <p className="text-[11px] text-rose-900/90 leading-relaxed">
                  Terms separated by plus or minus signs <strong>cannot</strong> be cancelled individually. Only entire common factors multiplied across the whole numerator and denominator can be simplified.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>The Legal Cancellation (Valid Factor Division)</span>
                </div>
                <div className="font-mono text-xs text-emerald-800 text-center py-2 bg-white rounded-lg border border-emerald-200 shadow-2xs">
                  <MathFormula formula="\frac{\textcolor{#059669}{\mathbf{(x - 3)}}(x + 3)}{\textcolor{#059669}{\mathbf{(x - 3)}}} = x + 3 \quad (\text{Domain: } \textcolor{#dc2626}{x \neq 3})" block />
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  Factor completely first. Common polynomial binomial factors divide out to yield 1, leaving the simplified quotient while preserving the domain exclusion.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {FORMULA_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rules, procedures, traps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFormulas.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            <Search className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">No rules found matching &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFormulas.map((item) => {
            const isRevealed = !recallMode || !!revealedRules[item.id];
            const isBookmarked = !!bookmarkedIds[item.id];
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-5 border transition-all space-y-3.5 flex flex-col justify-between ${
                  isBookmarked
                    ? 'border-amber-400/80 shadow-amber-50 shadow-sm bg-amber-50/10'
                    : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                        {item.ruleNumber}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.categoryLabel}
                      </span>
                      {item.isCoreProcedure && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          ★ Core Procedure
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* In Recall Mode: Show revealed/hidden indicator and individual toggle */}
                      {recallMode && (
                        <div className="mr-1">
                          {isRevealed ? (
                            <button
                              type="button"
                              onClick={() => toggleRuleReveal(item.id)}
                              className="px-2 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Mask this rule again to test recall"
                            >
                              <EyeOff className="w-3 h-3 text-amber-700" />
                              <span>Hide Rule</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              Masked
                            </span>
                          )}
                        </div>
                      )}

                      {/* Copy LaTeX button */}
                      <button
                        type="button"
                        onClick={() => handleCopyFormula(item.id, item.formula)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Copy formula LaTeX"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Bookmark for review */}
                      <button
                        type="button"
                        onClick={() => toggleBookmark(item.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-amber-600 bg-amber-50'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={isBookmarked ? 'Marked for review' : 'Bookmark for review'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <AppArtwork name="book" inline className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Ask AI Tutor */}
                      <button
                        type="button"
                        onClick={() =>
                          openChat(
                            `Explain the formula/procedure "${item.title}" (${item.formula}) and show a classic Philippine PRC board exam question testing this exact rule.`,
                            'general-tutor'
                          )
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                        title="Ask AI Tutor"
                      >
                        <AppArtwork name="chat" inline className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-black text-slate-900 text-sm">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Formula Display Area (Maskable in Recall Mode with explicit Reveal Rule button) */}
                <div className="space-y-2">
                  {isRevealed ? (
                    <div
                      className={`p-3.5 rounded-xl border text-center shadow-2xs relative group transition-colors ${
                        item.category === 'factoring'
                          ? 'bg-blue-50/40 border-blue-200/90'
                          : item.category === 'operations'
                          ? 'bg-emerald-50/40 border-emerald-200/90'
                          : item.category === 'equations-inequalities'
                          ? 'bg-amber-50/40 border-amber-200/90'
                          : item.category === 'partial-fractions-circuits'
                          ? 'bg-indigo-50/40 border-indigo-200/90'
                          : item.category === 'asymptotes-graphs'
                          ? 'bg-purple-50/40 border-purple-200/90'
                          : 'bg-slate-50 border-slate-200/90'
                      }`}
                    >
                      <MathFormula formula={item.formula} block />
                      {item.condition && (
                        <div className="text-[10px] text-rose-700 bg-white/80 inline-block px-2 py-0.5 rounded-md border border-rose-200/60 mt-1 font-mono">
                          <MathFormula formula={item.condition} />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Masked Recall Challenge with "Reveal Rule" Button */
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-dashed border-amber-300 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                          <span>Active Recall Challenge</span>
                        </span>
                        <span className="text-[10px] text-amber-700 font-medium">Recite rule first</span>
                      </div>

                      {item.recallQuestion && (
                        <p className="text-xs font-bold text-slate-800 leading-snug">
                          {item.recallQuestion}
                        </p>
                      )}

                      <div className="p-2.5 bg-white rounded-lg border border-amber-200/90 text-center font-mono shadow-2xs">
                        <MathFormula formula={item.recallPrompt} block />
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleRuleReveal(item.id)}
                        className="w-full py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <AppArtwork name="eye" inline className="w-3.5 h-3.5" />
                        <span>Reveal Rule</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Memory Cue / Mnemonic */}
                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-950 text-xs flex items-start gap-2">
                  <AppArtwork name="bulb" inline className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-900 font-bold">Memory Cue: </strong>
                    <span className="text-slate-700">{item.memoryCue}</span>
                  </div>
                </div>

                {/* Concrete Mini-Example */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Application Example
                  </div>
                  <div className="font-mono text-[11px] text-slate-800">
                    <MathFormula formula={item.example.problem} />
                  </div>
                  {recallMode && !isRevealed ? (
                    <div className="text-[11px] font-medium text-amber-800/80 bg-amber-50/60 py-1 px-2 rounded border border-amber-200/70 text-center italic">
                      Answer hidden in Recall Mode — click &quot;Reveal Rule&quot; above to check.
                    </div>
                  ) : (
                    <div className="text-[11px] font-bold text-emerald-800">
                      = <MathFormula formula={item.example.result} />
                    </div>
                  )}
                </div>

                {/* PRC Board Examiner Trap Alert */}
                <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-rose-900 font-bold">Examiner Trap: </strong>
                    <span className="text-rose-800 text-[11px] leading-relaxed">
                      {item.examinerTrap}
                    </span>
                  </div>
                </div>

                {/* ECE Circuit Application / Casio Tip (if present) */}
                {item.eceApplication && (
                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs flex items-start gap-2">
                    <AppArtwork name="chip" inline className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-purple-900 font-bold">ECE Circuit Impact: </strong>
                      <span className="text-purple-800 text-[11px] leading-relaxed">
                        <MathFormula formula={item.eceApplication} />
                      </span>
                    </div>
                  </div>
                )}

                {item.casioTip && (
                  <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-[11px] flex items-start gap-2">
                    <AppArtwork name="calculator" inline className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 font-bold">Casio Shortcut: </strong>
                      <span className="text-slate-300">{item.casioTip}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
