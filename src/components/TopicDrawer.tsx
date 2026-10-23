import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useReview } from '../context/ReviewContext';
import { formatReviewDate } from '../utils/masteryCalculator';
import { X, Play, AlertOctagon, TrendingDown, Search, ArrowRight, ChevronDown, CheckCircle2, Scale } from 'lucide-react';
import { ErrorCategory, Topic, Subject } from '../types';

// Subject badge helper with clear color coding across all 4 ECE Board areas
const getSubjectBadge = (subjectId: string, subjectsList: Subject[]) => {
  const s = subjectsList.find((sub) => sub.id === subjectId);
  const sId = subjectId.toLowerCase();

  if (sId.includes('math') || sId.includes('algebra') || sId.includes('calc') || sId.includes('trig')) {
    return {
      category: 'math' as const,
      label: 'MATH',
      name: s?.name || 'Mathematics',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      dotColor: 'bg-blue-500',
    };
  }
  if (sId.includes('electronics')) {
    return {
      category: 'electronics' as const,
      label: 'ECE',
      name: s?.name || 'Electronics Engineering',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      dotColor: 'bg-amber-500',
    };
  }
  if (sId.includes('comm') || sId.includes('est')) {
    return {
      category: 'est' as const,
      label: 'EST',
      name: s?.name || 'Electronics Systems (EST)',
      className: 'bg-purple-50 text-purple-700 border-purple-200',
      dotColor: 'bg-purple-500',
    };
  }
  return {
    category: 'geas' as const,
    label: 'GEAS',
    name: s?.name || 'General Engineering (GEAS)',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  };
};

export const TopicDrawer: React.FC = () => {
  const {
    selectedTopic,
    isDrawerOpen,
    closeTopicDrawer,
    startReview,
    openRecordTestForTopic,
    addReviewError,
    errors,
    currentDateStr,
    setCurrentScreen,
    allTopics,
    openTopicDrawer,
    subjects,
  } = useReview();

  const [isAddingError, setIsAddingError] = useState(false);
  const [errorCategory, setErrorCategory] = useState<ErrorCategory>('Formula recall');
  const [errorDesc, setErrorDesc] = useState('');
  const [errorSolution, setErrorSolution] = useState('');
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Search & Navigation state
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'all' | 'math' | 'electronics' | 'est' | 'geas'>('all');
  const [isBrowseExpanded, setIsBrowseExpanded] = useState(false);
  const [justJumpedTopic, setJustJumpedTopic] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);

  // Clear feedback banner timer
  useEffect(() => {
    if (justJumpedTopic) {
      const timer = setTimeout(() => setJustJumpedTopic(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [justJumpedTopic]);

  // Reset search when drawer closes or opens
  useEffect(() => {
    if (!isDrawerOpen) {
      setSearchQuery('');
      setIsBrowseExpanded(false);
      setIsAddingError(false);
    }
  }, [isDrawerOpen]);

  // Filtered topics matching search query and subject filter
  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return allTopics
      .filter((topic) => {
        const badge = getSubjectBadge(topic.subjectId, subjects);

        // Subject pill filter
        if (subjectFilter !== 'all' && badge.category !== subjectFilter) {
          return false;
        }

        // Query filter
        if (!q) return true;

        const nameMatch = topic.name.toLowerCase().includes(q);
        const subjectMatch = badge.name.toLowerCase().includes(q) || badge.label.toLowerCase().includes(q);
        const skillMatch = topic.skillsCovered?.some((s) => s.toLowerCase().includes(q));

        return nameMatch || subjectMatch || skillMatch;
      })
      .sort((a, b) => {
        if (!q) return 0;
        // Prioritize exact/prefix matches on topic name
        const aStarts = a.name.toLowerCase().startsWith(q);
        const bStarts = b.name.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
  }, [allTopics, searchQuery, subjectFilter, subjects]);

  if (!isDrawerOpen || !selectedTopic) return null;

  const nextFormatted = formatReviewDate(selectedTopic.nextReviewDate, currentDateStr);
  const topicErrors = errors.filter((e) => e.topicId === selectedTopic.id && !e.isResolved);
  const currentBadge = getSubjectBadge(selectedTopic.subjectId, subjects);

  // Sibling topics (other topics in the same subject)
  const siblingTopics = allTopics.filter(
    (t) => t.subjectId === selectedTopic.subjectId && t.id !== selectedTopic.id
  );

  // Handle jump to topic
  const handleJumpToTopic = (targetTopic: Topic) => {
    if (targetTopic.id === selectedTopic.id) return;
    openTopicDrawer(targetTopic);
    setJustJumpedTopic(targetTopic.name);
    setSearchQuery('');
    setIsBrowseExpanded(false);

    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      setIsBrowseExpanded(false);
      searchInputRef.current?.blur();
    } else if (e.key === 'Enter') {
      if (filteredTopics.length > 0) {
        e.preventDefault();
        handleJumpToTopic(filteredTopics[0]);
      }
    }
  };

  const handleAddError = (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorDesc.trim()) return;

    addReviewError({
      topicId: selectedTopic.id,
      topicName: selectedTopic.name,
      subjectId: selectedTopic.subjectId,
      category: errorCategory,
      description: errorDesc.trim(),
      solutionOrKeyFormula: errorSolution.trim() || undefined,
    });

    setErrorDesc('');
    setErrorSolution('');
    setIsAddingError(false);
  };

  const activities = selectedTopic.activityHistory;
  const displayedActivities = showFullHistory ? activities : activities.slice(0, 3);

  const isSearchActive = searchQuery.trim().length > 0 || isBrowseExpanded;

  return (
    <div id="topic-drawer-root" className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={closeTopicDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* HEADER */}
          <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/70">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {selectedTopic.isHighPriority && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 uppercase tracking-wider border border-rose-200">
                      HIGH PRIORITY
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${currentBadge.className}`}
                  >
                    {currentBadge.label} • {currentBadge.name}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-stone-900 leading-tight truncate">
                  {selectedTopic.name}
                </h2>
              </div>
              <button
                id="close-topic-drawer-btn"
                onClick={closeTopicDrawer}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors shrink-0"
                title="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SEARCH BAR & JUMP NAVIGATION */}
          <div className="p-3 bg-stone-100/90 border-b border-stone-200 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                id="topic-drawer-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search & jump to topic (e.g. Diode, Laplace, Op-Amp)..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-stone-300 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 rounded-xl placeholder:text-stone-400 text-stone-900 transition-all outline-none"
              />
              {searchQuery ? (
                <button
                  id="clear-topic-drawer-search-btn"
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 rounded"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 hidden sm:inline-block">
                  ESC
                </kbd>
              )}
            </div>

            {/* SUBJECT FILTER PILLS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] no-scrollbar">
              <button
                type="button"
                onClick={() => setSubjectFilter('all')}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  subjectFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                All ECE ({allTopics.length})
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('math')}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  subjectFilter === 'math'
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                Math
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('electronics')}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  subjectFilter === 'electronics'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Electronics
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('est')}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  subjectFilter === 'est'
                    ? 'bg-purple-700 text-white'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                EST
              </button>
              <button
                type="button"
                onClick={() => setSubjectFilter('geas')}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  subjectFilter === 'geas'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                GEAS
              </button>
            </div>

            {/* SIBLING TOPICS / QUICK BROWSE TOGGLE (WHEN SEARCH IS EMPTY) */}
            {!searchQuery && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-500 font-medium">
                  {siblingTopics.length > 0 ? (
                    <span>
                      Sibling topics in {currentBadge.name}:
                    </span>
                  ) : (
                    <span>Quickly jump to another topic:</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => setIsBrowseExpanded(!isBrowseExpanded)}
                  className="text-[11px] text-stone-700 hover:text-stone-950 font-bold flex items-center gap-1 transition-colors"
                >
                  <AppArtwork name="cards" inline className="w-3 h-3 text-stone-500" />
                  <span>{isBrowseExpanded ? 'Hide Topic List' : 'Browse All Topics'}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      isBrowseExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            )}

            {/* SIBLING CHIPS QUICK JUMP BAR (WHEN NOT SEARCHING AND NOT EXPANDED) */}
            {!searchQuery && !isBrowseExpanded && siblingTopics.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-0.5">
                {siblingTopics.slice(0, 5).map((sib) => (
                  <button
                    key={sib.id}
                    onClick={() => handleJumpToTopic(sib)}
                    className="px-2 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-stone-200/80 text-stone-700 border border-stone-200/90 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
                    title={`Jump to ${sib.name}`}
                  >
                    <span>{sib.name}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-stone-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* QUICK JUMP DROPDOWN RESULTS (WHEN SEARCHING OR BROWSE EXPANDED) */}
          {isSearchActive && (
            <div
              id="topic-drawer-search-results"
              className="bg-white border-b-2 border-stone-300 max-h-72 overflow-y-auto shadow-inner divide-y divide-stone-100 z-10"
            >
              <div className="px-3.5 py-2 bg-stone-50 flex items-center justify-between text-[11px] text-stone-500 border-b border-stone-200">
                <span className="font-semibold text-stone-700">
                  {filteredTopics.length} topic{filteredTopics.length !== 1 ? 's' : ''} found
                  {searchQuery && ` for "${searchQuery}"`}
                </span>
                <span className="text-[10px]">Click to jump immediately</span>
              </div>

              {filteredTopics.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <p className="text-xs text-stone-500">
                    No ECE topics found matching <span className="font-semibold">"{searchQuery}"</span>.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSubjectFilter('all');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                  >
                    Reset search and filters
                  </button>
                </div>
              ) : (
                filteredTopics.map((topic) => {
                  const badge = getSubjectBadge(topic.subjectId, subjects);
                  const isCurrent = topic.id === selectedTopic.id;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleJumpToTopic(topic)}
                      className={`w-full text-left p-3 flex items-center justify-between gap-2.5 transition-colors group cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50/70 hover:bg-blue-50'
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                          {topic.isHighPriority && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 uppercase tracking-wider">
                              HIGH PRIORITY
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                              Active in Drawer
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-stone-900 group-hover:text-blue-600 transition-colors truncate">
                          {topic.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                          {topic.mastery ? `Lvl ${topic.mastery}/5` : 'Lvl 0'}
                        </span>
                        <div className="w-5 h-5 rounded-md bg-stone-100 text-stone-500 group-hover:bg-stone-900 group-hover:text-white flex items-center justify-center transition-colors">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* JUMP CONFIRMATION TOAST BANNER */}
          {justJumpedTopic && (
            <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Jumped to {justJumpedTopic}</span>
              </div>
              <button
                onClick={() => setJustJumpedTopic(null)}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* DRAWER CONTENT */}
          <div
            ref={contentScrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-6"
          >
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-[10px] uppercase font-semibold text-stone-500">Mastery</div>
                <div className="text-base font-bold font-mono text-stone-900">
                  {selectedTopic.mastery ? `${selectedTopic.mastery} / 5` : '—'}
                </div>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-[10px] uppercase font-semibold text-stone-500">Latest Score</div>
                <div className="text-base font-bold font-mono text-stone-900">
                  {selectedTopic.latestScore !== null ? `${selectedTopic.latestScore}%` : '—'}
                </div>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-[10px] uppercase font-semibold text-stone-500">Confidence</div>
                <div className="text-base font-bold font-mono text-stone-900">
                  {selectedTopic.latestConfidence !== undefined && selectedTopic.latestConfidence !== null
                    ? `${selectedTopic.latestConfidence}/5`
                    : '—'}
                </div>
              </div>

              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-[10px] uppercase font-semibold text-stone-500">Best Score</div>
                <div className="text-base font-bold font-mono text-stone-900">
                  {selectedTopic.bestScore !== null ? `${selectedTopic.bestScore}%` : '—'}
                </div>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-[10px] uppercase font-semibold text-stone-500">Reviews</div>
                <div className="text-sm font-bold font-mono text-stone-900">
                  {selectedTopic.reviewCount}
                </div>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-[10px] uppercase font-semibold text-stone-500">Next Review</div>
                <div
                  className={`text-sm font-bold ${
                    nextFormatted.includes('overdue') ? 'text-rose-600' : 'text-stone-800'
                  }`}
                >
                  {nextFormatted.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Confidence vs. Actual Performance Calibration Card */}
            {selectedTopic.latestConfidence !== undefined &&
              selectedTopic.latestConfidence !== null &&
              selectedTopic.latestScore !== null &&
              (() => {
                const confPct = selectedTopic.latestConfidence * 20;
                const actualPct = selectedTopic.latestScore;
                const delta = actualPct - confPct;
                const isCal = Math.abs(delta) < 15;
                const isUnder = delta >= 15;
                return (
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-amber-600" />
                        <span>Confidence vs. Performance Calibration</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isCal
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : isUnder
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        {isCal
                          ? `Calibrated (${delta >= 0 ? `+${delta}` : delta}%)`
                          : isUnder
                          ? `Underconfident (+${delta}%)`
                          : `Overconfident (${delta}%)`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-lg border border-stone-200">
                      <div>
                        <div className="text-[10px] text-stone-500 font-medium">Felt Confidence</div>
                        <div className="font-mono font-bold text-stone-900">
                          {selectedTopic.latestConfidence}/5 ({confPct}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-500 font-medium">Actual Result</div>
                        <div className="font-mono font-bold text-stone-900">{actualPct}%</div>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {isCal
                        ? 'Your subjective confidence matches your objective test performance. Excellent metacognitive calibration.'
                        : isUnder
                        ? `You scored +${delta}% higher than expected. You have stronger mastery than your confidence indicates!`
                        : `Your confidence was ${Math.abs(
                            delta
                          )}% higher than your actual accuracy. Watch out for conceptual traps and calculation slips.`}
                    </p>

                    {selectedTopic.recommendationNote && (
                      <div className="text-[11px] text-stone-700 bg-amber-50/80 border border-amber-200/80 p-2 rounded-lg flex items-center justify-between">
                        <span className="font-medium">{selectedTopic.recommendationNote}</span>
                        {selectedTopic.intervalDays && (
                          <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded ml-2 shrink-0">
                            SRS {selectedTopic.intervalDays}d
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

            {/* Why Weak? Diagnostic section */}
            {(selectedTopic.whyWeakReasons && selectedTopic.whyWeakReasons.length > 0) ||
            topicErrors.length > 0 ? (
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-amber-700" /> Why weak?
                </h3>
                <ul className="text-xs text-amber-950 space-y-1.5">
                  {selectedTopic.whyWeakReasons?.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                  {topicErrors.map((err) => (
                    <li key={err.id} className="flex items-start gap-1.5 font-medium text-rose-800">
                      <span className="text-rose-600 font-bold">⚠</span>
                      <span>{err.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Actions Bar */}
            <div className="space-y-2">
              {(selectedTopic.name.toLowerCase().includes('linear') ||
                selectedTopic.name.toLowerCase().includes('rational')) && (
                <button
                  type="button"
                  onClick={() => {
                    closeTopicDrawer();
                    if (selectedTopic.name.toLowerCase().includes('linear')) {
                      setCurrentScreen('linear-equations');
                    } else {
                      setCurrentScreen('rational-expressions');
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs shadow-xs"
                >
                  <AppArtwork name="book" inline className="w-4 h-4" />
                  <span>OPEN FULL TOPIC MODULE & DRILLS</span>
                </button>
              )}

              <button
                id="drawer-start-review-btn"
                onClick={() => startReview(selectedTopic, 'Practice Problems')}
                className="w-full bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-sm active:scale-98 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-amber-400" />
                <span>START REVIEW</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    closeTopicDrawer();
                    openRecordTestForTopic(selectedTopic.id);
                  }}
                  className="px-3 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-stone-500" />
                  <span>RECORD TEST</span>
                </button>

                <button
                  onClick={() => setIsAddingError(!isAddingError)}
                  className="px-3 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isAddingError ? 'CANCEL ERROR' : 'ADD ERROR'}</span>
                </button>
              </div>
            </div>

            {/* Quick Add Error Form */}
            {isAddingError && (
              <form
                onSubmit={handleAddError}
                className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-3"
              >
                <div className="text-xs font-bold text-stone-900">
                  Log Recurring Error for {selectedTopic.name}
                </div>
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Category
                  </label>
                  <select
                    value={errorCategory}
                    onChange={(e) => setErrorCategory(e.target.value as ErrorCategory)}
                    className="w-full text-xs p-2 rounded border border-stone-300 bg-white"
                  >
                    <option value="Formula recall">Formula recall</option>
                    <option value="Sign / algebra errors">Sign / algebra errors</option>
                    <option value="Wrong method">Wrong method</option>
                    <option value="Question misreading">Question misreading</option>
                    <option value="Speed / calculation slip">Speed / calculation slip</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Mistake Description
                  </label>
                  <textarea
                    required
                    value={errorDesc}
                    onChange={(e) => setErrorDesc(e.target.value)}
                    placeholder="e.g. Set up quadratic factor as A/(x^2+1) instead of (Ax+B)/(x^2+1)"
                    rows={2}
                    className="w-full text-xs p-2 rounded border border-stone-300 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Key Solution or Rule (Optional)
                  </label>
                  <input
                    type="text"
                    value={errorSolution}
                    onChange={(e) => setErrorSolution(e.target.value)}
                    placeholder="e.g. Irreducible quadratics need linear numerator Ax+B"
                    className="w-full text-xs p-2 rounded border border-stone-300 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 rounded transition-colors cursor-pointer"
                >
                  Save Error to Attention Log
                </button>
              </form>
            )}

            {/* Recent Activity List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Recent Activity
              </h3>
              {activities.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No recorded sessions yet.</p>
              ) : (
                <div className="space-y-2">
                  {displayedActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-stone-50 rounded-lg border border-stone-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-stone-800">{act.type}</div>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <AppArtwork name="calendar" inline className="w-3 h-3" />
                          <span>{act.date}</span>
                          <span>•</span>
                          <span>{act.timeSpentMinutes} min</span>
                          <span>•</span>
                          <span>Notes: {act.usedNotes}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="font-mono font-bold text-sm text-stone-900">
                          {act.score}%
                        </span>
                        {act.confidenceScore !== undefined && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[10px] text-stone-500 font-mono">
                              Conf: {act.confidenceScore}/5
                            </span>
                            {act.confidenceVsPerformanceDelta !== undefined && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  Math.abs(act.confidenceVsPerformanceDelta) < 15
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : act.confidenceVsPerformanceDelta > 0
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {Math.abs(act.confidenceVsPerformanceDelta) < 15
                                  ? 'Calibrated'
                                  : act.confidenceVsPerformanceDelta > 0
                                  ? `+${act.confidenceVsPerformanceDelta}%`
                                  : `${act.confidenceVsPerformanceDelta}%`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {activities.length > 3 && (
                    <button
                      onClick={() => setShowFullHistory(!showFullHistory)}
                      className="w-full py-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold text-center border-t border-stone-100"
                    >
                      {showFullHistory ? 'Show less' : `View full history (${activities.length} total)`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
