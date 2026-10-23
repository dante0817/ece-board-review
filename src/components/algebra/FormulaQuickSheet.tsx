import { AppArtwork, createArtworkIcon } from '../common/AppArtwork';
import React, { useState, useMemo, useEffect } from 'react';
import { MathFormula } from '../MathFormula';
import {
  QUICK_SHEET_FORMULAS,
  FORMULA_QUICK_SHEET_CATEGORIES,
  QuickSheetFormula,
} from '../../data/formulaQuickSheetData';
import { FormulaPracticeMode } from './FormulaPracticeMode';
import { useReview } from '../../context/ReviewContext';
import { Search, Check, Filter, AlertTriangle, X, LayoutGrid, List, CheckCircle2, Circle, CheckCheck, EyeOff, ArrowUpDown } from 'lucide-react';

export type FormulaSortOption = 'category' | 'name' | 'high-yield' | 'unmemorized' | 'memorized';
export type SortDirection = 'asc' | 'desc';

export interface CategoryStyle {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  activeBg: string;
  activeText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconColor: string;
  barColor: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  all: {
    id: 'all',
    icon: createArtworkIcon('cards'),
    activeBg: 'bg-slate-900 text-white',
    activeText: 'text-white',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-200',
    iconColor: 'text-slate-600',
    barColor: 'bg-slate-700',
  },
  algebra: {
    id: 'algebra',
    icon: createArtworkIcon('sum'),
    activeBg: 'bg-blue-600 text-white',
    activeText: 'text-white',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    iconColor: 'text-blue-600',
    barColor: 'bg-blue-600',
  },
  calculus: {
    id: 'calculus',
    icon: createArtworkIcon('graph'),
    activeBg: 'bg-purple-600 text-white',
    activeText: 'text-white',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    iconColor: 'text-purple-600',
    barColor: 'bg-purple-600',
  },
  physics: {
    id: 'physics',
    icon: createArtworkIcon('lightning'),
    activeBg: 'bg-amber-600 text-white',
    activeText: 'text-white',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-200',
    iconColor: 'text-amber-600',
    barColor: 'bg-amber-600',
  },
  electronics: {
    id: 'electronics',
    icon: createArtworkIcon('chip'),
    activeBg: 'bg-emerald-600 text-white',
    activeText: 'text-white',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    barColor: 'bg-emerald-600',
  },
};

export interface FormulaQuickSheetProps {
  onClose?: () => void;
  isModal?: boolean;
  initialViewMode?: 'cards' | 'dense' | 'practice';
  initialCategory?: string;
  initialPracticeTarget?: 'memorized' | 'all' | 'unmemorized' | 'high-yield';
}

export const FormulaQuickSheet: React.FC<FormulaQuickSheetProps> = ({
  onClose,
  isModal = false,
  initialViewMode = 'cards',
  initialCategory = 'all',
  initialPracticeTarget = 'memorized',
}) => {
  const {
    memorizedFormulaIds,
    toggleFormulaMemorized,
    isFormulaMemorized,
    formulaMemorizationStats,
    memorizeAllFormulas,
    resetMemorizedFormulas,
    setFormulaMemorized,
  } = useReview();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<FormulaSortOption>('category');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [highYieldOnly, setHighYieldOnly] = useState<boolean>(false);
  const [memorizationFilter, setMemorizationFilter] = useState<'all' | 'memorized' | 'unmemorized'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'dense' | 'practice'>(initialViewMode);
  const [hideAllCardResults, setHideAllCardResults] = useState<boolean>(false);
  const [revealedCardIds, setRevealedCardIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync initialCategory if prop updates
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Precompute category formula counts & memorized counts
  const categoryStats = useMemo(() => {
    const totalAll = QUICK_SHEET_FORMULAS.length;
    const memorizedAll = QUICK_SHEET_FORMULAS.filter((f) => memorizedFormulaIds.includes(f.id)).length;
    const map: Record<string, { total: number; memorized: number }> = {
      all: { total: totalAll, memorized: memorizedAll },
    };

    FORMULA_QUICK_SHEET_CATEGORIES.forEach((cat) => {
      if (cat.id !== 'all') {
        const catItems = QUICK_SHEET_FORMULAS.filter((f) => f.category === cat.id);
        const catMem = catItems.filter((f) => memorizedFormulaIds.includes(f.id)).length;
        map[cat.id] = { total: catItems.length, memorized: catMem };
      }
    });

    return map;
  }, [memorizedFormulaIds]);

  // Sync initialViewMode if prop updates
  useEffect(() => {
    if (initialViewMode) {
      setViewMode(initialViewMode);
    }
  }, [initialViewMode]);

  const toggleCardRevealed = (id: string) => {
    setRevealedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter & Sort formulas
  const filteredFormulas = useMemo(() => {
    const filtered = QUICK_SHEET_FORMULAS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // High-yield filter
      if (highYieldOnly && !item.highYield) {
        return false;
      }

      // Memorization status filter
      const isMemorized = memorizedFormulaIds.includes(item.id);
      if (memorizationFilter === 'memorized' && !isMemorized) {
        return false;
      }
      if (memorizationFilter === 'unmemorized' && isMemorized) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesLatex = item.latex.toLowerCase().includes(q);
        const matchesPlain = item.plainText.toLowerCase().includes(q);
        const matchesNotes = item.conditionsOrNotes?.toLowerCase().includes(q);
        const matchesApp = item.eceApplicationOrTrap?.toLowerCase().includes(q);
        const matchesCategory = item.categoryLabel.toLowerCase().includes(q);
        const matchesSubCategory = item.subCategory?.toLowerCase().includes(q);
        return matchesName || matchesLatex || matchesPlain || matchesNotes || matchesApp || matchesCategory || matchesSubCategory;
      }

      return true;
    });

    const CATEGORY_ORDER: Record<string, number> = {
      algebra: 1,
      calculus: 2,
      physics: 3,
      electronics: 4,
    };

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'category') {
        const catA = CATEGORY_ORDER[a.category] ?? 99;
        const catB = CATEGORY_ORDER[b.category] ?? 99;
        comparison = catA - catB;
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name);
        }
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'high-yield') {
        const hyA = a.highYield ? 1 : 0;
        const hyB = b.highYield ? 1 : 0;
        comparison = hyB - hyA;
        if (comparison === 0) {
          const catA = CATEGORY_ORDER[a.category] ?? 99;
          const catB = CATEGORY_ORDER[b.category] ?? 99;
          comparison = catA - catB || a.name.localeCompare(b.name);
        }
      } else if (sortBy === 'unmemorized') {
        const aMem = memorizedFormulaIds.includes(a.id) ? 1 : 0;
        const bMem = memorizedFormulaIds.includes(b.id) ? 1 : 0;
        comparison = aMem - bMem;
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name);
        }
      } else if (sortBy === 'memorized') {
        const aMem = memorizedFormulaIds.includes(a.id) ? 1 : 0;
        const bMem = memorizedFormulaIds.includes(b.id) ? 1 : 0;
        comparison = bMem - aMem;
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name);
        }
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [selectedCategory, highYieldOnly, memorizationFilter, searchQuery, memorizedFormulaIds, sortBy, sortDirection]);

  // Group formulas by category when viewing all categories sorted by category
  const groupedFormulasByCategory = useMemo(() => {
    if (selectedCategory !== 'all' || sortBy !== 'category') {
      return null;
    }

    const categoryOrder = sortDirection === 'asc'
      ? ['algebra', 'calculus', 'physics', 'electronics']
      : ['electronics', 'physics', 'calculus', 'algebra'];

    return categoryOrder
      .map((catId) => {
        const catMeta = FORMULA_QUICK_SHEET_CATEGORIES.find((c) => c.id === catId);
        const formulas = filteredFormulas.filter((f) => f.category === catId);
        return {
          id: catId,
          label: catMeta?.label || catId,
          description: catMeta?.description || '',
          formulas,
        };
      })
      .filter((group) => group.formulas.length > 0);
  }, [selectedCategory, sortBy, sortDirection, filteredFormulas]);

  const handleCopy = (formula: QuickSheetFormula) => {
    navigator.clipboard.writeText(formula.latex);
    setCopiedId(formula.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMemorizeAllVisible = () => {
    filteredFormulas.forEach((item) => {
      setFormulaMemorized(item.id, true);
    });
  };

  const selectedCategoryMeta = FORMULA_QUICK_SHEET_CATEGORIES.find((c) => c.id === selectedCategory);

  const renderFormulaCard = (item: QuickSheetFormula) => {
    const memorized = isFormulaMemorized(item.id);
    const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.all;
    const CatIcon = catStyle.icon;

    return (
      <div
        key={item.id}
        className={`rounded-2xl border p-4 sm:p-5 flex flex-col justify-between transition-all print:border-slate-400 print:shadow-none print:p-3 print:rounded-lg print:break-inside-avoid ${
          memorized
            ? 'bg-emerald-50/25 border-emerald-300 hover:border-emerald-400 hover:shadow-xs'
            : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
        }`}
      >
        <div>
          {/* Top Bar: Category badge, Memorization Checkbox & copy button */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedCategory(item.category)}
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all cursor-pointer ${catStyle.badgeBg} ${catStyle.badgeBorder} ${catStyle.badgeText} hover:opacity-80 print:border-black print:bg-white print:text-black`}
                title={`Click to filter quick-sheet to ${item.categoryLabel}`}
              >
                <CatIcon className="w-3 h-3" />
                <span>{item.categoryLabel}</span>
              </button>
              {item.highYield && (
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-0.5 print:hidden">
                  <AppArtwork name="flame" inline className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>PRC Frequent</span>
                </span>
              )}
            </div>

            {/* Interactive Checkbox for Tracking Memorization */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => toggleFormulaMemorized(item.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer print:hidden ${
                  memorized
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                }`}
                title={
                  memorized
                    ? 'Click to uncheck (mark as needing review)'
                    : 'Click to mark as memorized (syncs with Progress Dashboard)'
                }
              >
                <div
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                    memorized
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-400 bg-white'
                  }`}
                >
                  {memorized && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span className="text-[11px] font-extrabold">
                  {memorized ? 'Memorized' : 'To Memorize'}
                </span>
              </button>

              {/* Print Mode Checkbox Indicator */}
              <span className="hidden print:inline-flex items-center gap-1 font-mono text-[10px] text-black">
                [{memorized ? '✓' : ' '}] Memorized
              </span>

              <button
                type="button"
                onClick={() => handleCopy(item)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer print:hidden"
                title="Copy LaTeX formula"
              >
                {copiedId === item.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Formula Name */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-black text-slate-900 print:text-xs">
              {item.name}
            </h3>
            {memorized && (
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded print:hidden">
                <Check className="w-3 h-3" />
                Mastered
              </span>
            )}
          </div>

          {/* KaTeX Formula Box with Optional Blind Recall Mask */}
          {hideAllCardResults && !revealedCardIds.has(item.id) ? (
            <div
              onClick={() => toggleCardRevealed(item.id)}
              className="my-3 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-100/90 hover:bg-blue-50/80 hover:border-blue-400 text-center cursor-pointer transition-all group"
              title="Click to reveal formula result and verify recall"
            >
              <div className="flex flex-col items-center justify-center gap-1 py-1">
                <AppArtwork name="eye" inline className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">
                  Result Hidden for Recall
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-500">
                  Click to reveal formula
                </span>
              </div>
            </div>
          ) : (
            <div
              className={`my-3 p-3 rounded-xl border text-center font-mono overflow-x-auto print:bg-white print:border-slate-300 print:p-2 print:my-1.5 relative group ${
                memorized
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <MathFormula formula={item.latex} block />
              {hideAllCardResults && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCardRevealed(item.id);
                  }}
                  className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-slate-200/80 hover:bg-slate-300 text-slate-600 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Hide result again"
                >
                  Hide
                </button>
              )}
            </div>
          )}

          {/* Conditions & Notes */}
          {item.conditionsOrNotes && (
            <p className="text-xs text-slate-600 leading-relaxed mb-2 print:text-[10px] print:leading-tight">
              <strong className="text-slate-800">Rule:</strong> {item.conditionsOrNotes}
            </p>
          )}
        </div>

        {/* ECE Application / Trap Footer */}
        {item.eceApplicationOrTrap && (
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-amber-900 bg-amber-50/70 p-2 rounded-lg border border-amber-200/80 flex items-start gap-1.5 print:bg-white print:text-black print:border-slate-300 print:p-1.5 print:text-[9px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5 print:hidden" />
            <div>
              <strong className="font-black text-amber-950 print:text-black">Exam Key:</strong>{' '}
              {item.eceApplicationOrTrap}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTableRow = (item: QuickSheetFormula) => {
    const memorized = isFormulaMemorized(item.id);
    const catStyle = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.all;
    const CatIcon = catStyle.icon;

    return (
      <tr
        key={item.id}
        className={`transition-colors print:break-inside-avoid ${
          memorized
            ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
            : 'hover:bg-blue-50/40'
        }`}
      >
        {/* Checkbox Column */}
        <td className="p-3 align-top text-center">
          <button
            type="button"
            onClick={() => toggleFormulaMemorized(item.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer print:hidden ${
              memorized
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
            }`}
            title={
              memorized
                ? 'Click to mark unmemorized'
                : 'Click to mark as memorized (syncs with Progress Dashboard)'
            }
          >
            <div
              className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                memorized
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-400 bg-white'
              }`}
            >
              {memorized && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span className="text-[10px]">
              {memorized ? 'Yes' : 'No'}
            </span>
          </button>

          {/* Print Checkbox */}
          <span className="hidden print:inline font-mono text-[10px] font-bold">
            [{memorized ? '✓' : ' '}]
          </span>
        </td>

        <td className="p-3 align-top font-bold text-slate-900 print:text-[10px]">
          <div className="flex items-center gap-1.5">
            <span>{item.name}</span>
            {item.highYield && (
              <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1 rounded print:hidden">
                High Yield
              </span>
            )}
          </div>
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setSelectedCategory(item.category)}
              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-80 print:text-[8px] ${catStyle.badgeBg} ${catStyle.badgeBorder} ${catStyle.badgeText}`}
              title={`Click to filter by ${item.categoryLabel}`}
            >
              <CatIcon className="w-2.5 h-2.5" />
              <span>{item.categoryLabel}</span>
            </button>
          </div>
        </td>

        <td className="p-3 align-top font-mono font-bold text-slate-900 bg-slate-50/60 print:bg-white print:text-[11px]">
          <MathFormula formula={item.latex} inline />
        </td>

        <td className="p-3 align-top text-slate-600 space-y-1 print:text-[9px]">
          {item.conditionsOrNotes && (
            <div className="leading-snug">{item.conditionsOrNotes}</div>
          )}
          {item.eceApplicationOrTrap && (
            <div className="text-[11px] text-amber-800 font-semibold print:text-[9px] print:text-black">
              • {item.eceApplicationOrTrap}
            </div>
          )}
        </td>

        <td className="p-3 align-middle text-center print:hidden">
          <button
            type="button"
            onClick={() => handleCopy(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            title="Copy LaTeX"
          >
            {copiedId === item.id ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
            )}
          </button>
        </td>
      </tr>
    );
  };

  const content = (
    <div className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none print:rounded-none print:p-0">
      {/* 1. Header Bar */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 print:bg-white print:text-black print:p-0 print:border-b-2 print:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500 text-white print:border print:border-black print:bg-white print:text-black">
                PRC ECE Board Exam
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 print:hidden">
                Quick-Sheet Reference
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 print:hidden flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Syncs with Progress Dashboard</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-2xl print:text-black">
              {selectedCategory === 'all'
                ? 'PRC ECE Formula Quick-Sheet'
                : `${selectedCategoryMeta?.label || ''} Formula Quick-Sheet`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-600 print:text-xs">
              {selectedCategory === 'all'
                ? 'Complete reference of high-yield formulas across Algebra, Calculus, Physics, and Electronics with board exam traps.'
                : selectedCategoryMeta?.description || 'High-yield engineering formula reference & PRC board exam traps.'}
            </p>
          </div>

          {/* Action Buttons (Hidden on Print) */}
          <div className="flex items-center gap-2 print:hidden self-start sm:self-auto shrink-0 flex-wrap sm:flex-nowrap">
            {/* Practice Mode Flashcards Button */}
            <button
              type="button"
              onClick={() => setViewMode((prev) => (prev === 'practice' ? 'cards' : 'practice'))}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border ${
                viewMode === 'practice'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
              }`}
              title="Practice memorized formulas as interactive recall flashcards"
            >
              <AppArtwork name="star" inline className="w-4 h-4" />
              <span>{viewMode === 'practice' ? 'Exit Practice' : 'Practice Flashcards'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Print Quick-Sheet or Save to PDF"
            >
              <AppArtwork name="printer" inline className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Quick-Sheet"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Memorization Progress Tracker Banner */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-300">
                  Formula Memorization Mastery:
                </span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {formulaMemorizationStats.memorized} / {formulaMemorizationStats.total} ({formulaMemorizationStats.percent}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Check off formulas as you memorize them. Changes automatically sync to your Board Readiness score and Progress Dashboard.
              </p>
            </div>
          </div>

          {/* Progress bar & Quick Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-44 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${formulaMemorizationStats.percent}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleMemorizeAllVisible}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                title="Mark all currently filtered formulas as memorized"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Mark Filtered</span>
              </button>
              <button
                type="button"
                onClick={resetMemorizedFormulas}
                className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                title="Clear all memorization checkmarks"
              >
                <AppArtwork name="cycle" inline className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Flashcard Practice View Mode */}
      {viewMode === 'practice' ? (
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
          <FormulaPracticeMode
            onExitPractice={() => setViewMode('cards')}
            initialTarget={initialPracticeTarget}
            initialCategory={selectedCategory}
          />
        </div>
      ) : (
        <>
          {/* 2. Interactive Filter & Search Controls (Hidden on Print) */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search formulas, ECE laws, Vieta, exponents, or traps..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Memorization status filter chips */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setMemorizationFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                memorizationFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({formulaMemorizationStats.total})
            </button>
            <button
              type="button"
              onClick={() => setMemorizationFilter('memorized')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                memorizationFilter === 'memorized'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Memorized ({formulaMemorizationStats.memorized})</span>
            </button>
            <button
              type="button"
              onClick={() => setMemorizationFilter('unmemorized')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                memorizationFilter === 'unmemorized'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <Circle className="w-3.5 h-3.5" />
              <span>To Memorize ({formulaMemorizationStats.unmemorized})</span>
            </button>
          </div>

          {/* High-Yield filter & View toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setHighYieldOnly((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                highYieldOnly
                  ? 'bg-amber-500 border-amber-600 text-slate-950 font-black'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <AppArtwork name="flame" inline className={`w-3.5 h-3.5 ${highYieldOnly ? 'fill-current' : 'text-amber-500'}`} />
              <span>High Yield</span>
            </button>

            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl border border-slate-300">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Expanded Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('dense')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'dense'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Dense Cheatsheet Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('practice')}
                className="px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 text-slate-600 hover:text-slate-900"
                title="Interactive Flashcard Practice Mode"
              >
                <AppArtwork name="cards" inline className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] hidden sm:inline">Practice</span>
              </button>
            </div>

            {/* Blind Recall Mode Toggle (Card view only) */}
            {viewMode === 'cards' && (
              <button
                type="button"
                onClick={() => {
                  setHideAllCardResults((prev) => !prev);
                  setRevealedCardIds(new Set());
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  hideAllCardResults
                    ? 'bg-blue-600 text-white border-blue-500 shadow-2xs'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                title="Hide formula results to self-test recall directly on cards"
              >
                {hideAllCardResults ? (
                  <EyeOff className="w-3.5 h-3.5 text-blue-200" />
                ) : (
                  <AppArtwork name="eye" inline className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span className="hidden sm:inline">
                  {hideAllCardResults ? 'Results Hidden' : 'Hide Results'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips & Sort Controls Toolbar */}
        <div className="pt-2.5 border-t border-slate-200/80 space-y-2">
          {/* Header row: Discipline Label + Sort By Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>Filter by Category:</span>
              </span>
              {selectedCategory !== 'all' ? (
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${CATEGORY_STYLES[selectedCategory]?.badgeBg} ${CATEGORY_STYLES[selectedCategory]?.badgeBorder} ${CATEGORY_STYLES[selectedCategory]?.badgeText}`}>
                    {selectedCategoryMeta?.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500">
                  (Select a category chip below)
                </span>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                <span>Sort by:</span>
              </span>

              <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSortBy('category')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    sortBy === 'category'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Group and sort formulas by subject category (Algebra → Calculus → Physics → Electronics)"
                >
                  <AppArtwork name="cards" inline className="w-3 h-3 text-blue-400" />
                  <span>Category</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('name')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === 'name'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Sort formulas alphabetically by name"
                >
                  <span>Name A-Z</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('high-yield')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    sortBy === 'high-yield'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Sort by PRC Board exam frequency (High-Yield first)"
                >
                  <AppArtwork name="flame" inline className="w-3 h-3 text-amber-400" />
                  <span>High-Yield</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('unmemorized')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    sortBy === 'unmemorized'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Show formulas needing memorization first"
                >
                  <span>Need Study</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                  sortDirection === 'desc'
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title={sortDirection === 'asc' ? 'Ascending Order (click to reverse)' : 'Descending Order (click to reverse)'}
              >
                <ArrowUpDown className={`w-3.5 h-3.5 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Interactive Category Filter Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
            {FORMULA_QUICK_SHEET_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const style = CATEGORY_STYLES[cat.id] || CATEGORY_STYLES.all;
              const Icon = style.icon;
              const stats = categoryStats[cat.id] || { total: 0, memorized: 0 };

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? `${style.activeBg} border-transparent shadow-xs ring-2 ring-blue-500/50`
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={`p-1 rounded-lg shrink-0 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : `${style.badgeBg} ${style.iconColor} border ${style.badgeBorder}`
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-black tracking-tight truncate">{cat.label}</span>
                    </div>
                    {isSelected ? (
                      <span className="text-[9px] uppercase font-black tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-600 shrink-0">
                        {stats.total}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] w-full pt-0.5">
                    <span className={isSelected ? 'text-white/80' : 'text-slate-400'}>
                      {cat.id === 'all' ? 'All disciplines' : cat.shortLabel}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md font-mono font-bold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {stats.memorized}/{stats.total} mem
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Formulas Content Area */}
      <div className="p-4 sm:p-6 print:p-0">
        {/* Results count banner */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 print:hidden flex-wrap gap-2">
          <span>
            Displaying <strong className="text-slate-900">{filteredFormulas.length}</strong> formula{filteredFormulas.length === 1 ? '' : 's'}
            {selectedCategory !== 'all' && (
              <span className="ml-1 text-blue-700 font-bold">
                in {selectedCategoryMeta?.label}
              </span>
            )}
            {memorizationFilter !== 'all' && (
              <span className="ml-1 text-slate-400">
                ({memorizationFilter === 'memorized' ? 'memorized only' : 'unmemorized only'})
              </span>
            )}
            {sortBy && (
              <span className="ml-1 text-slate-400">
                • sorted by {sortBy} ({sortDirection})
              </span>
            )}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Tip: Press Ctrl+P / Cmd+P to print or save as PDF
          </span>
        </div>

        {filteredFormulas.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No matching formulas found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search query, category filter chip, or memorization status tabs.
            </p>
            {selectedCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className="mt-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset to All Categories
              </button>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* CARD GRID VIEW */
          groupedFormulasByCategory ? (
            /* GROUPED BY DISCIPLINE CATEGORY */
            <div className="space-y-8">
              {groupedFormulasByCategory.map((group) => {
                const groupStyle = CATEGORY_STYLES[group.id] || CATEGORY_STYLES.all;
                const GroupIcon = groupStyle.icon;

                return (
                  <div key={group.id} className="space-y-3">
                    {/* Category Header Banner */}
                    <div className="flex items-center justify-between bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${groupStyle.badgeBg} ${groupStyle.iconColor} border ${groupStyle.badgeBorder}`}>
                          <GroupIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-slate-900">
                              {group.label}
                            </h2>
                            <span className="text-xs font-bold text-slate-500">
                              ({group.formulas.length} formulas)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 hidden sm:block">
                            {group.description}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(group.id)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer shrink-0"
                      >
                        Filter to {group.label} &rarr;
                      </button>
                    </div>

                    {/* Cards Grid for this category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 print:grid-cols-2 print:gap-3 print:space-y-0">
                      {group.formulas.map((item) => renderFormulaCard(item))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* SINGLE CATEGORY OR SORTED LIST */
            <div className="space-y-4">
              {selectedCategory !== 'all' && (
                <div className="flex items-center justify-between bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    {(() => {
                      const curStyle = CATEGORY_STYLES[selectedCategory] || CATEGORY_STYLES.all;
                      const CurIcon = curStyle.icon;
                      return (
                        <div className={`p-2 rounded-xl ${curStyle.badgeBg} ${curStyle.iconColor} border ${curStyle.badgeBorder}`}>
                          <CurIcon className="w-4 h-4" />
                        </div>
                      );
                    })()}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-black text-slate-900">
                          {selectedCategoryMeta?.label} Formulas
                        </h2>
                        <span className="text-xs font-bold text-slate-500">
                          ({filteredFormulas.length} formulas)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 hidden sm:block">
                        {selectedCategoryMeta?.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer shrink-0"
                  >
                    View All Categories &rarr;
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 print:grid-cols-2 print:gap-3 print:space-y-0">
                {filteredFormulas.map((item) => renderFormulaCard(item))}
              </div>
            </div>
          )
        ) : (
          /* DENSE TABLE CHEATSHEET VIEW */
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs print:border-slate-400 print:rounded-none">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 print:bg-slate-200 print:text-black">
                    <th className="p-3 text-center w-28 print:w-16">
                      <span className="print:hidden">Memorized</span>
                      <span className="hidden print:inline">Mem</span>
                    </th>
                    <th className="p-3 w-1/4">Name &amp; Category</th>
                    <th className="p-3 w-2/5">Formula / Identity</th>
                    <th className="p-3 w-1/3">Rule &amp; Board Note</th>
                    <th className="p-3 text-center print:hidden w-12">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                  {groupedFormulasByCategory
                    ? groupedFormulasByCategory.map((group) => {
                        const groupStyle = CATEGORY_STYLES[group.id] || CATEGORY_STYLES.all;
                        const GroupIcon = groupStyle.icon;

                        return (
                          <React.Fragment key={group.id}>
                            <tr className="bg-slate-100/80 border-y-2 border-slate-300 font-black text-slate-800">
                              <td colSpan={5} className="py-2.5 px-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <GroupIcon className={`w-3.5 h-3.5 ${groupStyle.iconColor}`} />
                                    <span className="text-xs font-black text-slate-900">
                                      {group.label} ({group.formulas.length} formulas)
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-normal hidden sm:inline">
                                      — {group.description}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCategory(group.id)}
                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                  >
                                    Filter to this category &rarr;
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {group.formulas.map((item) => renderTableRow(item))}
                          </React.Fragment>
                        );
                      })
                    : filteredFormulas.map((item) => renderTableRow(item))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* 4. Footer Note */}
      <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 print:bg-white print:border-slate-300 print:text-[9px] print:p-2">
        <span>
          Philippine PRC Electronics Engineering Board Exam (ECE) Foundation Review • Algebra &amp; Mathematics
        </span>
        <span className="font-mono text-[11px] text-slate-400 print:hidden">
          Checked items are saved locally and synced with your overall progress dashboard.
        </span>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
        <div className="w-full max-w-5xl my-auto">{content}</div>
      </div>
    );
  }

  return content;
};
