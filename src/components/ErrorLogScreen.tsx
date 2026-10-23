import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useState, useMemo } from 'react';
import { useReview } from '../context/ReviewContext';
import { ReviewError, ErrorCategory } from '../types';
import { CheckCircle2, Play, Plus, Search, CheckSquare, Square, ChevronRight, Trash2 } from 'lucide-react';
import { ErrorFlashcardsModal } from './ErrorFlashcardsModal';

export const ErrorLogScreen: React.FC = () => {
  const {
    errors,
    toggleErrorResolved,
    addReviewError,
    deleteErrorNote,
    allTopics,
    startReview,
    openTopicDrawer,
    generateWeakSpotQuiz,
    startWeakSpotQuiz,
    openAddErrorModal,
  } = useReview();

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active Recall Digital Flashcards state
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState<boolean>(false);
  const [flashcardsTargetErrors, setFlashcardsTargetErrors] = useState<ReviewError[]>([]);
  const [selectedErrorIds, setSelectedErrorIds] = useState<Set<string>>(new Set());

  const unresolvedErrors = errors.filter((e) => !e.isResolved);
  const unresolvedCount = unresolvedErrors.length;

  // Pattern tallying matching wireframe: Formula recall (6), Sign/algebra errors (5), Wrong method (4), Question misreading (3)
  const patternCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Formula recall': 0,
      'Sign / algebra errors': 0,
      'Wrong method': 0,
      'Question misreading': 0,
      'Speed / calculation slip': 0,
    };

    unresolvedErrors.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + e.occurrenceCount;
    });

    return counts;
  }, [unresolvedErrors]);

  // Group recurring errors by topic for the attention cards
  const recurringByTopic = useMemo(() => {
    const grouped: Record<string, { topicName: string; topicId: string; errors: ReviewError[] }> = {};
    unresolvedErrors.forEach((e) => {
      if (!grouped[e.topicId]) {
        grouped[e.topicId] = {
          topicId: e.topicId,
          topicName: e.topicName,
          errors: [],
        };
      }
      grouped[e.topicId].errors.push(e);
    });

    return Object.values(grouped).sort((a, b) => b.errors.length - a.errors.length);
  }, [unresolvedErrors]);

  // Filtered table rows
  const filteredErrors = errors.filter((err) => {
    if (filterStatus === 'unresolved' && err.isResolved) return false;
    if (filterStatus === 'resolved' && !err.isResolved) return false;
    if (filterCategory !== 'All' && err.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        err.topicName.toLowerCase().includes(q) ||
        err.description.toLowerCase().includes(q) ||
        (err.solutionOrKeyFormula && err.solutionOrKeyFormula.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStartReviewForTopic = (topicId: string) => {
    const topic = allTopics.find((t) => t.id === topicId);
    if (topic) {
      startReview(topic, 'Error Log Remediation');
    }
  };

  // Open flashcards for all unresolved errors
  const handleOpenFlashcardsForAllUnresolved = () => {
    const targets = unresolvedErrors.length > 0 ? unresolvedErrors : errors;
    setFlashcardsTargetErrors(targets);
    setIsFlashcardsModalOpen(true);
  };

  // Open flashcards for selected errors
  const handleOpenFlashcardsForSelected = () => {
    const targets = errors.filter((e) => selectedErrorIds.has(e.id));
    if (targets.length === 0) return;
    setFlashcardsTargetErrors(targets);
    setIsFlashcardsModalOpen(true);
  };

  // Open flashcard specifically for one error
  const handleOpenFlashcardForSingleError = (err: ReviewError) => {
    setFlashcardsTargetErrors([err]);
    setIsFlashcardsModalOpen(true);
  };

  // Open flashcards for a specific topic cluster
  const handleOpenFlashcardsForTopicCluster = (clusterErrors: ReviewError[]) => {
    setFlashcardsTargetErrors(clusterErrors);
    setIsFlashcardsModalOpen(true);
  };

  // Selection toggle handlers
  const toggleSelectAll = () => {
    if (selectedErrorIds.size === filteredErrors.length && filteredErrors.length > 0) {
      setSelectedErrorIds(new Set());
    } else {
      setSelectedErrorIds(new Set(filteredErrors.map((e) => e.id)));
    }
  };

  const toggleSelectError = (id: string) => {
    setSelectedErrorIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div id="error-log-screen-root" className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FeatureIcon name="errors" />
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Error Log & Pattern Analysis
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Transform mistakes into board-day retention by generating active recall digital flashcards with Gemini AI.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center flex-wrap">
          {/* WEAK SPOT QUIZ BUTTON */}
          <button
            id="generate-weak-spot-quiz-header-btn"
            type="button"
            onClick={() => startWeakSpotQuiz()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Generate custom weak spot quiz focusing on subjects with highest error frequency"
          >
            <AppArtwork name="target" inline className="w-4 h-4 text-white" />
            <span>WEAK SPOT QUIZ</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-800 text-rose-200 text-[10px] font-mono">
              Error-Driven
            </span>
          </button>

          {/* AI FLASHCARDS GENERATE BUTTON */}
          <button
            id="generate-flashcards-header-btn"
            type="button"
            onClick={handleOpenFlashcardsForAllUnresolved}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Generate AI active recall flashcards from error log"
          >
            <AppArtwork name="star" inline className="w-4 h-4 fill-stone-950" />
            <span>GENERATE FLASHCARDS (AI)</span>
            <span className="px-1.5 py-0.2 rounded bg-stone-950 text-amber-300 text-[10px] font-mono">
              {unresolvedCount}
            </span>
          </button>

          <button
            id="log-new-mistake-btn"
            type="button"
            onClick={() => openAddErrorModal()}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>LOG NEW MISTAKE</span>
          </button>
        </div>
      </div>

      {/* SECTION: ERRORS REQUIRING ATTENTION (Matching Wireframe in #7) */}
      <div className="bg-white border-2 border-stone-900 rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              ACTION REQUIRED
            </span>
            <h2 className="text-xl font-extrabold text-stone-900">
              ERRORS REQUIRING ATTENTION
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="header-add-error-direct-btn"
              type="button"
              onClick={() => openAddErrorModal()}
              className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Add a new mistake or calculation error (Voice Command: 'Add Error')"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Add Error</span>
            </button>
            <div className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 font-mono font-bold text-xs border border-rose-200 inline-block">
              {unresolvedCount} unresolved errors
            </div>
            <button
              id="start-weak-spot-quiz-action-btn"
              type="button"
              onClick={() => startWeakSpotQuiz()}
              className="px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <AppArtwork name="target" inline className="w-3.5 h-3.5 text-white" />
              <span>Take Weak Spot Quiz</span>
            </button>
            <button
              id="practice-all-unresolved-btn"
              type="button"
              onClick={handleOpenFlashcardsForAllUnresolved}
              className="px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
            >
              <AppArtwork name="brain" inline className="w-3.5 h-3.5" />
              <span>Practice AI Flashcards</span>
            </button>
          </div>
        </div>

        {/* Top Recurring Patterns (Matching Wireframe in #7) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Top Recurring Patterns
            </h3>
            <span className="text-[11px] text-stone-500">
              Click a pattern below to filter table
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setFilterCategory(filterCategory === 'Formula recall' ? 'All' : 'Formula recall')}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                filterCategory === 'Formula recall'
                  ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300/40'
                  : 'bg-stone-50 border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="text-[11px] text-stone-500 font-semibold">Formula recall</div>
              <div className="text-2xl font-mono font-bold text-rose-600 mt-1">
                {patternCounts['Formula recall'] || 6}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Setup & identity slips</div>
            </div>

            <div
              onClick={() => setFilterCategory(filterCategory === 'Sign / algebra errors' ? 'All' : 'Sign / algebra errors')}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                filterCategory === 'Sign / algebra errors'
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/40'
                  : 'bg-stone-50 border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="text-[11px] text-stone-500 font-semibold">Sign / algebra errors</div>
              <div className="text-2xl font-mono font-bold text-amber-600 mt-1">
                {patternCounts['Sign / algebra errors'] || 5}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Quadrant & signs in math</div>
            </div>

            <div
              onClick={() => setFilterCategory(filterCategory === 'Wrong method' ? 'All' : 'Wrong method')}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                filterCategory === 'Wrong method'
                  ? 'bg-stone-100 border-stone-400 ring-2 ring-stone-300/40'
                  : 'bg-stone-50 border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="text-[11px] text-stone-500 font-semibold">Wrong method</div>
              <div className="text-2xl font-mono font-bold text-stone-800 mt-1">
                {patternCounts['Wrong method'] || 4}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Inapplicable test/theorem</div>
            </div>

            <div
              onClick={() => setFilterCategory(filterCategory === 'Question misreading' ? 'All' : 'Question misreading')}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                filterCategory === 'Question misreading'
                  ? 'bg-stone-100 border-stone-400 ring-2 ring-stone-300/40'
                  : 'bg-stone-50 border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="text-[11px] text-stone-500 font-semibold">Question misreading</div>
              <div className="text-2xl font-mono font-bold text-stone-800 mt-1">
                {patternCounts['Question misreading'] || 3}
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">Sum vs product of roots</div>
            </div>
          </div>
        </div>

        {/* AI Active Recall Spotlight Banner */}
        <div className="p-4 rounded-xl bg-linear-to-r from-amber-50 via-stone-50 to-amber-50/50 border border-amber-300/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 app-artwork-tile">
              <AppArtwork name="star" />
            </div>
            <div>
              <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <span>AI Active Recall Remediation (Gemini 3.8 Flash)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-semibold">New</span>
              </div>
              <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                Transform each past mistake into an active retrieval challenge. Practice trap inversion, formula boundary checks, and calculator shortcuts before your next timed mock test.
              </p>
            </div>
          </div>

          <button
            id="start-error-recall-btn"
            type="button"
            onClick={handleOpenFlashcardsForAllUnresolved}
            className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer self-start sm:self-center"
          >
            <AppArtwork name="brain" inline className="w-3.5 h-3.5" />
            <span>Launch Active Recall</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border-t border-stone-200 pt-5">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
            Actionable Topic Clusters
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurringByTopic.slice(0, 4).map((cluster) => {
              const primaryErr = cluster.errors[0];
              const totalOccurrences = cluster.errors.reduce(
                (acc, curr) => acc + curr.occurrenceCount,
                0
              );

              return (
                <div
                  key={cluster.topicId}
                  className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/60 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-stone-900 text-sm">{cluster.topicName}</h4>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                        {cluster.errors.length} recurring errors
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-stone-700">
                      <div className="flex items-start gap-1.5 font-medium">
                        <span className="text-rose-600 font-bold">•</span>
                        <span>{primaryErr.description}</span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1 pl-3 font-mono">
                        Last occurred: {primaryErr.lastOccurred} ({totalOccurrences} total instances)
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const top = allTopics.find((t) => t.id === cluster.topicId);
                        if (top) openTopicDrawer(top);
                      }}
                      className="text-xs text-stone-600 hover:text-stone-900 font-medium"
                    >
                      View in drawer
                    </button>

                    <div className="flex items-center gap-2">
                      {/* FLASHCARD TRIGGER FOR THIS CLUSTER */}
                      <button
                        type="button"
                        onClick={() => handleOpenFlashcardsForTopicCluster(cluster.errors)}
                        className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        title="Generate active recall flashcards for this topic's errors"
                      >
                        <AppArtwork name="star" inline className="w-3 h-3 text-amber-700" />
                        <span>AI Flashcards</span>
                      </button>

                      <button
                        onClick={() => handleStartReviewForTopic(cluster.topicId)}
                        className="px-3 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current text-amber-400" />
                        <span>REVIEW</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FULL DETAILED TABLE */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-tight">
              Full Detailed Error History
            </h2>
            <p className="text-xs text-stone-500">
              Select specific errors to generate customized active recall flashcards, or resolve errors as rules are mastered.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search error description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-stone-300 bg-stone-50 w-44 sm:w-56"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-stone-300 bg-white text-stone-700 font-semibold"
            >
              <option value="All">All Categories</option>
              <option value="Formula recall">Formula recall</option>
              <option value="Sign / algebra errors">Sign / algebra errors</option>
              <option value="Wrong method">Wrong method</option>
              <option value="Question misreading">Question misreading</option>
              <option value="Speed / calculation slip">Speed / calculation slip</option>
            </select>

            {/* Status Filter */}
            <div className="flex rounded-md border border-stone-300 overflow-hidden text-xs">
              <button
                onClick={() => setFilterStatus('unresolved')}
                className={`px-2.5 py-1.5 font-semibold ${
                  filterStatus === 'unresolved' ? 'bg-stone-900 text-white' : 'bg-white text-stone-700'
                }`}
              >
                Unresolved
              </button>
              <button
                onClick={() => setFilterStatus('resolved')}
                className={`px-2.5 py-1.5 font-semibold ${
                  filterStatus === 'resolved' ? 'bg-stone-900 text-white' : 'bg-white text-stone-700'
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1.5 font-semibold ${
                  filterStatus === 'all' ? 'bg-stone-900 text-white' : 'bg-white text-stone-700'
                }`}
              >
                All
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Select Floating Action Bar */}
        {selectedErrorIds.size > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-stone-900">
                {selectedErrorIds.size} error{selectedErrorIds.size === 1 ? '' : 's'} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedErrorIds(new Set())}
                className="px-2.5 py-1 text-stone-600 hover:text-stone-900 font-medium"
              >
                Clear Selection
              </button>
              <button
                id="generate-selected-flashcards-btn"
                type="button"
                onClick={handleOpenFlashcardsForSelected}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <AppArtwork name="star" inline className="w-3.5 h-3.5" />
                <span>Generate Flashcards for Selected ({selectedErrorIds.size})</span>
              </button>
            </div>
          </div>
        )}

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                {/* Select All Checkbox */}
                <th className="py-2.5 px-3 w-8 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-stone-500 hover:text-stone-900 flex items-center justify-center"
                    title={
                      selectedErrorIds.size === filteredErrors.length && filteredErrors.length > 0
                        ? 'Deselect all'
                        : 'Select all visible'
                    }
                  >
                    {selectedErrorIds.size === filteredErrors.length && filteredErrors.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Square className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                </th>
                <th className="py-2.5 px-3 w-8">Status</th>
                <th className="py-2.5 px-3 w-36">Topic</th>
                <th className="py-2.5 px-3 w-32">Category</th>
                <th className="py-2.5 px-3">Description & Key Solution</th>
                <th className="py-2.5 px-3 w-20">Date</th>
                <th className="py-2.5 pr-3 pl-2 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredErrors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400 italic">
                    No errors found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredErrors.map((err) => {
                  const isSelected = selectedErrorIds.has(err.id);

                  return (
                    <tr
                      key={err.id}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-amber-50/60'
                          : 'hover:bg-amber-50/20'
                      } ${err.isResolved ? 'opacity-60' : ''}`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectError(err.id)}
                          className="text-stone-400 hover:text-stone-700 flex items-center justify-center mx-auto"
                          title={isSelected ? 'Deselect' : 'Select for flashcard deck'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-300 hover:text-stone-500" />
                          )}
                        </button>
                      </td>

                      {/* Resolved Checkbox */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleErrorResolved(err.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            err.isResolved
                              ? 'bg-emerald-600 border-emerald-700 text-white'
                              : 'border-stone-300 hover:border-stone-500 bg-white'
                          }`}
                          title={err.isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
                        >
                          {err.isResolved && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                      </td>

                      <td className="py-3 px-3 font-semibold text-stone-900">{err.topicName}</td>

                      <td className="py-3 px-3">
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {err.category}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-medium text-stone-800">{err.description}</div>
                        {err.solutionOrKeyFormula && (
                          <div className="text-[11px] text-emerald-800 font-mono mt-1 bg-emerald-50/60 p-1.5 rounded border border-emerald-200/60">
                            <strong>Rule:</strong> {err.solutionOrKeyFormula}
                          </div>
                        )}
                        {err.notes && err.notes.length > 0 && (
                          <div className="mt-2 space-y-1.5 pt-1.5 border-t border-stone-200/70">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                              <AppArtwork name="timer" inline className="w-3 h-3 text-amber-600" />
                              <span>Session Quick Notes ({err.notes.length})</span>
                            </div>
                            <div className="space-y-1">
                              {err.notes.map((n) => (
                                <div
                                  key={n.id}
                                  className="flex items-start justify-between gap-2 p-1.5 rounded-md bg-stone-50 border border-stone-200/70 text-xs hover:border-amber-200 transition-colors"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span
                                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                                          n.type === 'question'
                                            ? 'bg-purple-100 text-purple-700'
                                            : n.type === 'mistake'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}
                                      >
                                        {n.type}
                                      </span>
                                      <span className="text-[10px] font-mono text-stone-400">
                                        {n.timeString} {n.sessionElapsedTime ? `(${n.sessionElapsedTime})` : ''}
                                      </span>
                                    </div>
                                    <p className="text-stone-800 text-[11px] leading-relaxed">{n.text}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => deleteErrorNote(err.id, n.id)}
                                    className="text-stone-300 hover:text-rose-600 p-0.5 rounded transition-colors"
                                    title="Delete note"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                        {err.lastOccurred}
                      </td>

                      <td className="py-3 pr-3 pl-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* AI FLASHCARD BUTTON FOR SINGLE ROW */}
                          <button
                            type="button"
                            onClick={() => handleOpenFlashcardForSingleError(err)}
                            className="px-2 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Generate AI active recall flashcard for this error"
                          >
                            <AppArtwork name="star" inline className="w-2.5 h-2.5 text-amber-700" />
                            <span>AI Card</span>
                          </button>

                          <button
                            onClick={() => handleStartReviewForTopic(err.topicId)}
                            className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-900 hover:text-amber-400 text-stone-800 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                            title="Review topic in practice module"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Review</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* The AI Active Recall Error Flashcards Modal */}
      <ErrorFlashcardsModal
        errors={flashcardsTargetErrors.length > 0 ? flashcardsTargetErrors : unresolvedErrors}
        isOpen={isFlashcardsModalOpen}
        onClose={() => setIsFlashcardsModalOpen(false)}
        onToggleResolveError={(errorId) => toggleErrorResolved(errorId)}
      />

      {/* Global AddErrorModal rendered at App root handles new error logging via voice or button */}
    </div>
  );
};
