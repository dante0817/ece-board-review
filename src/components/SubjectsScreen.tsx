import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { useReview } from '../context/ReviewContext';
import { computeTopicTier, computeTopicMarker, formatReviewDate } from '../utils/masteryCalculator';
import { Topic, TopicGroup, TopicStatusTier } from '../types';
import { MasteryGate } from './MasteryGate';
import { FlashcardsModal } from './FlashcardsModal';
import { SubjectRoadmapTree } from './SubjectRoadmapTree';
import { SubjectMasteryBadge } from './SubjectMasteryBadge';
import { SubjectMasteryBadgeShowcase } from './SubjectMasteryBadgeShowcase';
import { SimpleSubjectRadarChart } from './SimpleSubjectRadarChart';
import { calculateSubjectMasteryBadge } from '../utils/subjectBadgeUtils';
import { ChevronDown, ChevronRight, Filter, GitBranch, List, Play, Pause, EyeOff } from 'lucide-react';

type FilterType = 'All' | 'Due' | 'Weak' | 'High Priority' | 'Board Ready';

export const SubjectsScreen: React.FC = () => {
  const {
    subjects,
    selectedSubjectId,
    setSelectedSubjectId,
    setCurrentScreen,
    currentSubject,
    toggleTopicInitialCovered,
    openTopicDrawer,
    algebraCoveragePercent,
    algebraMasteryPercent,
    markSubjectMaintenance,
    currentDateStr,
    testRecords,
    startDeepStudySubject,
    isFocusMode,
    setIsFocusMode,
    pomodoro,
    startPomodoroTimer,
    pausePomodoroTimer,
    resetPomodoroPhaseTimer,
  } = useReview();

  const [activeViewTab, setActiveViewTab] = useState<'syllabus' | 'roadmap'>('roadmap');
  const [showAllWidgetsInFocus, setShowAllWidgetsInFocus] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    'grp-sequences': false,
    'grp-higher-algebra': false,
  });
  const [selectedTopicIdsForCards, setSelectedTopicIdsForCards] = useState<string[]>([]);
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState<boolean>(false);

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleTopicCardSelection = (topicId: string) => {
    setSelectedTopicIdsForCards((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const toggleGroupCardSelection = (group: TopicGroup) => {
    const groupTopicIds = group.topics.map((t) => t.id);
    const allSelected = groupTopicIds.every((id) => selectedTopicIdsForCards.includes(id));

    if (allSelected) {
      setSelectedTopicIdsForCards((prev) => prev.filter((id) => !groupTopicIds.includes(id)));
    } else {
      setSelectedTopicIdsForCards((prev) => Array.from(new Set([...prev, ...groupTopicIds])));
    }
  };

  const handleSelectWeakTopics = () => {
    const weakTopicIds = currentSubject.groups
      .flatMap((g) => g.topics)
      .filter((t) => computeTopicTier(t) === 'NEEDS WORK' || t.isHighPriority)
      .map((t) => t.id);

    setSelectedTopicIdsForCards(weakTopicIds);
  };

  const handleOpenFlashcards = () => {
    if (selectedTopicIdsForCards.length === 0) {
      // Auto-select weak or high-priority topics or first 3 topics
      const defaultTopics = currentSubject.groups
        .flatMap((g) => g.topics)
        .filter((t) => computeTopicTier(t) === 'NEEDS WORK' || t.isHighPriority);

      const targetIds =
        defaultTopics.length > 0
          ? defaultTopics.map((t) => t.id)
          : currentSubject.groups.flatMap((g) => g.topics).slice(0, 3).map((t) => t.id);

      setSelectedTopicIdsForCards(targetIds);
    }
    setIsFlashcardsModalOpen(true);
  };

  const selectedTopicsForCards = currentSubject.groups
    .flatMap((g) => g.topics)
    .filter((t) => selectedTopicIdsForCards.includes(t.id));

  // Filter topics
  const filterTopic = (topic: Topic): boolean => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'High Priority') return topic.isHighPriority;
    if (activeFilter === 'Weak') {
      const tier = computeTopicTier(topic);
      return tier === 'NEEDS WORK';
    }
    if (activeFilter === 'Board Ready') {
      const tier = computeTopicTier(topic);
      return tier === 'BOARD READY';
    }
    if (activeFilter === 'Due') {
      if (!topic.nextReviewDate) return false;
      return topic.nextReviewDate <= currentDateStr;
    }
    return true;
  };

  // Status tier styles
  const getStatusTierBadge = (tier: TopicStatusTier) => {
    switch (tier) {
      case 'BOARD READY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            BOARD READY
          </span>
        );
      case 'DEVELOPING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            DEVELOPING
          </span>
        );
      case 'NEEDS WORK':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            NEEDS WORK
          </span>
        );
      case 'Not Started':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-500">
            Not Started
          </span>
        );
    }
  };

  const getMarkerIcon = (marker: string) => {
    switch (marker) {
      case '⚠':
        return <span className="text-rose-600 font-bold text-xs" title="Needs attention / Overdue">⚠</span>;
      case '↗':
        return <span className="text-emerald-600 font-bold text-xs" title="Score improving">↗</span>;
      case '✓':
        return <span className="text-emerald-700 font-bold text-xs" title="Board Ready">✓</span>;
      case '⏱':
        return <span className="text-amber-600 font-bold text-xs" title="Due for review">⏱</span>;
      default:
        return <span className="text-stone-300 text-xs">—</span>;
    }
  };

  const currentSubjectBadge = useMemo(
    () => calculateSubjectMasteryBadge(currentSubject, testRecords),
    [currentSubject, testRecords]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-16">
      {/* Subject Switcher */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg border border-stone-200">
          <button
            onClick={() => setCurrentScreen('overview')}
            className="px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap bg-stone-900 text-stone-100 hover:bg-stone-800 shadow-xs flex items-center gap-1.5"
            title="Open comprehensive subject readiness comparison"
          >
            <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-amber-400" />
            <span>All Subjects Overview</span>
          </button>
          <div className="h-4 w-px bg-stone-300 mx-1" />
          {subjects.map((subj) => {
            const isSelected = subj.id === selectedSubjectId;
            const subjBadge = calculateSubjectMasteryBadge(subj, testRecords);
            return (
              <button
                key={subj.id}
                onClick={() => setSelectedSubjectId(subj.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <span>{subj.name}</span>
                <SubjectMasteryBadge badgeData={subjBadge} variant="mini" />
                {subj.inMaintenance && (
                  <span className="text-[10px] px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded font-normal">
                    Maint.
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* DEEP STUDY FOCUS ACTIVE BAR */}
      {isFocusMode && (
        <div className="bg-stone-900 border-2 border-amber-400/80 text-white rounded-2xl p-4 sm:p-5 shadow-xl transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Active Subject & Status */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-black shadow-md shadow-amber-400/20 app-artwork-tile">
                <AppArtwork name="target" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-black tracking-widest bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
                    Deep Study Focus Mode
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    Distraction-free conditioning
                  </span>
                </div>
                <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                  Focusing on: <span className="text-amber-400">{currentSubject.name}</span>
                </h2>
              </div>
            </div>

            {/* Middle: Pomodoro Timer Status & Controls */}
            <div className="flex items-center gap-4 bg-stone-950/80 px-4 py-2.5 rounded-xl border border-stone-800">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  {pomodoro.phase === 'work' ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <AppArtwork name="flame" inline className="w-3.5 h-3.5 fill-current" /> Work Interval
                    </span>
                  ) : (
                    <span className="text-indigo-400 flex items-center gap-1">
                      <AppArtwork name="coffee" inline className="w-3.5 h-3.5" /> Break Interval
                    </span>
                  )}
                </div>
                <div className="text-2xl font-mono font-black text-white tracking-wider">
                  {Math.floor(pomodoro.secondsLeft / 60)
                    .toString()
                    .padStart(2, '0')}
                  :
                  {(pomodoro.secondsLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Play/Pause & Reset controls */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-stone-800">
                <button
                  type="button"
                  onClick={pomodoro.isRunning ? pausePomodoroTimer : startPomodoroTimer}
                  className={`p-2 rounded-lg font-bold transition-all cursor-pointer ${
                    pomodoro.isRunning
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                      : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md shadow-amber-400/20'
                  }`}
                  title={pomodoro.isRunning ? 'Pause Timer' : 'Resume Timer'}
                >
                  {pomodoro.isRunning ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetPomodoroPhaseTimer}
                  className="p-2 rounded-lg text-xs font-medium text-stone-400 hover:text-white bg-stone-800/80 hover:bg-stone-800 transition-colors"
                  title="Reset Timer"
                >
                  <AppArtwork name="cycle" inline className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: UI Visibility Toggle & Exit Focus Mode */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAllWidgetsInFocus(!showAllWidgetsInFocus)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Toggle visibility of multi-subject radar chart and badge showcase"
              >
                {showAllWidgetsInFocus ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-stone-400" />
                    <span>Hide Extra Charts</span>
                  </>
                ) : (
                  <>
                    <AppArtwork name="eye" inline className="w-3.5 h-3.5 text-stone-400" />
                    <span>Show Extra Charts</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsFocusMode(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 border border-stone-700 hover:border-rose-800 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Exit Focus Mode (Restores sidebars and all widgets)"
              >
                <span>Exit Focus Mode</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Mastery Balance Radar Chart & Weakest Subject Identifier (hidden in focus mode to reduce distraction unless toggled) */}
      {(!isFocusMode || showAllWidgetsInFocus) && (
        <SimpleSubjectRadarChart
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={setSelectedSubjectId}
        />
      )}

      {/* Visual Subject Mastery Badges System Showcase (hidden in focus mode to reduce distraction unless toggled) */}
      {(!isFocusMode || showAllWidgetsInFocus) && (
        <SubjectMasteryBadgeShowcase
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={setSelectedSubjectId}
          testRecords={testRecords}
        />
      )}

      {/* Subject Summary Header (Spreadsheet-like stats) */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold uppercase tracking-tight text-stone-900">
                {currentSubject.name}
              </h1>
              <SubjectMasteryBadge badgeData={currentSubjectBadge} variant="mini" />

              {/* Deep Study Button in Subject Header */}
              <button
                type="button"
                onClick={() => startDeepStudySubject(currentSubject.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  pomodoro.activeSubjectId === currentSubject.id && pomodoro.isRunning && isFocusMode
                    ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500/40 font-black'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
                title={`Enter Focus Mode & start Pomodoro timer for ${currentSubject.name}`}
              >
                <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {pomodoro.activeSubjectId === currentSubject.id && pomodoro.isRunning && isFocusMode
                    ? 'Deep Study Active'
                    : 'Deep Study (25m)'}
                </span>
              </button>

              {currentSubject.inMaintenance ? (
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <AppArtwork name="shield" inline className="w-3.5 h-3.5" /> Maintenance Mode
                </span>
              ) : (
                <span className="bg-stone-900 text-amber-400 text-xs font-bold px-2 py-0.5 rounded">
                  Current Primary Focus
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1 max-w-2xl">{currentSubject.description}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-center">
              <div className="text-[10px] uppercase font-semibold text-stone-500">Mastery Badge</div>
              <div className="text-xs font-black uppercase tracking-tight text-amber-700 mt-0.5">
                {currentSubjectBadge.tier.name}
              </div>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-center">
              <div className="text-[10px] uppercase font-semibold text-stone-500">Practice Solved</div>
              <div className="text-base font-mono font-bold text-stone-900">
                {currentSubjectBadge.totalQuestionsCorrect} Qs
              </div>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-center">
              <div className="text-[10px] uppercase font-semibold text-stone-500">Initial Coverage</div>
              <div className="text-base font-mono font-bold text-stone-900">
                {algebraCoveragePercent}%
              </div>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-center">
              <div className="text-[10px] uppercase font-semibold text-stone-500">Avg Mastery</div>
              <div className="text-base font-mono font-bold text-amber-600">3.9 / 5</div>
            </div>
            <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 text-center">
              <div className="text-[10px] uppercase font-semibold text-stone-500">Board Target</div>
              <div className="text-base font-mono font-bold text-stone-900">
                {currentSubject.boardTarget}%
              </div>
            </div>
          </div>
        </div>

        {/* Dual Progress: Coverage vs Mastery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                <AppArtwork name="cards" inline className="w-3.5 h-3.5 text-stone-500" /> Initial Coverage
              </span>
              <span className="font-mono font-bold text-stone-900">{algebraCoveragePercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/80">
              <div
                className="h-full bg-stone-800 rounded-full transition-all"
                style={{ width: `${algebraCoveragePercent}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {algebraCoveragePercent === 100
                ? 'All syllabus topics opened and practiced once'
                : `${algebraCoveragePercent}% of syllabus topics studied once`}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-500" /> Board Mastery
              </span>
              <span className="font-mono font-bold text-stone-900">{algebraMasteryPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/80">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${algebraMasteryPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              True board readiness based on accuracy, difficulty & independence
            </p>
          </div>
        </div>
      </div>

      {/* View Mode Switcher: Syllabus Table vs Prerequisite Roadmap Tree */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveViewTab('roadmap')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeViewTab === 'roadmap'
                ? 'bg-stone-900 text-amber-400 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-amber-400" />
            <span>Prerequisite Roadmap (D3 Tree)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewTab('syllabus')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeViewTab === 'syllabus'
                ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <List className="w-3.5 h-3.5 text-stone-700" />
            <span>Syllabus Table &amp; Groups</span>
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium hidden sm:block">
          {activeViewTab === 'roadmap'
            ? 'Interactive branching tree mapping prerequisites, unlock states & mastery levels'
            : 'Structured syllabus matrix with scores, review dates & mastery tiers'}
        </div>
      </div>

      {activeViewTab === 'roadmap' ? (
        <SubjectRoadmapTree />
      ) : (
        <>
          {/* Filter Pills & AI Flashcard Action */}
          <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-stone-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {(['All', 'Due', 'Weak', 'High Priority', 'Board Ready'] as FilterType[]).map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-stone-50 font-bold shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* AI Flashcards & Selection Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSelectWeakTopics}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-200 transition-colors"
            title="Select all weak (NEEDS WORK) and high-priority topics"
          >
            Select Weak Topics
          </button>

          <button
            type="button"
            onClick={handleOpenFlashcards}
            className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer border border-stone-800 hover:border-amber-400/40"
            title="Generate AI-powered flashcards using Gemini API"
          >
            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate AI Flashcards</span>
            {selectedTopicIdsForCards.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-400 text-stone-950 rounded-full font-extrabold text-[10px]">
                {selectedTopicIdsForCards.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Floating/Active Selection Action Bar */}
      {selectedTopicIdsForCards.length > 0 && (
        <div className="bg-stone-900 text-stone-100 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md border border-stone-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
              {selectedTopicIdsForCards.length}
            </div>
            <div>
              <span className="font-bold text-xs text-stone-100">
                {selectedTopicIdsForCards.length} topic{selectedTopicIdsForCards.length === 1 ? '' : 's'} selected for Flashcards
              </span>
              <span className="text-[11px] text-stone-400 ml-2 hidden sm:inline">
                Click Generate to create board exam active recall cards with Gemini 3.8 Flash
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedTopicIdsForCards([])}
              className="text-xs text-stone-400 hover:text-stone-200 px-2 py-1 font-medium transition-colors"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={() => setIsFlashcardsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <AppArtwork name="star" inline className="w-3.5 h-3.5" />
              <span>Generate Cards Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Spreadsheet-like Table by Topic Groups */}
      <div className="space-y-4">
        {currentSubject.groups.map((group) => {
          const isCollapsed = collapsedGroups[group.id] ?? false;
          const coveredCount = group.topics.filter((t) => t.initialCovered).length;
          const totalCount = group.topics.length;
          const visibleTopics = group.topics.filter(filterTopic);
          const allGroupSelected = group.topics.length > 0 && group.topics.every((t) => selectedTopicIdsForCards.includes(t.id));

          return (
            <div
              key={group.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs"
            >
              {/* Collapsible Section Header */}
              <div className="w-full px-4 sm:px-5 py-3 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between transition-colors">
                <button
                  type="button"
                  onClick={() => toggleGroupCollapse(group.id)}
                  className="flex items-center gap-2 text-left hover:text-amber-800 transition-colors cursor-pointer"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  )}
                  <span className="font-bold text-sm text-stone-900 uppercase tracking-wide">
                    {group.name}
                  </span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleGroupCardSelection(group)}
                    className="text-[11px] font-semibold text-stone-600 hover:text-amber-900 px-2 py-0.5 rounded bg-white hover:bg-amber-50 border border-stone-200 transition-colors"
                  >
                    {allGroupSelected ? 'Deselect Group' : 'Select Group for Cards'}
                  </button>
                  <div className="text-xs text-stone-600 font-mono font-medium">
                    {coveredCount} / {totalCount} covered
                  </div>
                </div>
              </div>

              {/* Table view */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50/40 text-stone-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 pl-3 pr-1 w-10 text-center" title="Select for AI Flashcard generation">
                          <span className="flex items-center justify-center gap-0.5 text-stone-500" title="Select for AI Flashcards">
                            <AppArtwork name="brain" inline className="w-3.5 h-3.5 text-amber-600" />
                          </span>
                        </th>
                        <th className="py-2.5 px-2 w-10 text-center" title="Initial Coverage Check">✓</th>
                        <th className="py-2.5 px-2 w-12 text-center">Rev</th>
                        <th className="py-2.5 px-2 w-16 text-center">Mastery</th>
                        <th className="py-2.5 px-3">Topic</th>
                        <th className="py-2.5 px-3 w-16 text-right">Score</th>
                        <th className="py-2.5 px-3 w-28">Next</th>
                        <th className="py-2.5 pr-4 pl-3 w-28 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-sans">
                      {visibleTopics.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-stone-400 italic">
                            No topics match filter "{activeFilter}" in this group.
                          </td>
                        </tr>
                      ) : (
                        visibleTopics.map((topic) => {
                          const tier = computeTopicTier(topic);
                          const marker = computeTopicMarker(topic, currentDateStr);
                          const nextReviewFormatted = formatReviewDate(
                            topic.nextReviewDate,
                            currentDateStr
                          );
                          const isCardSelected = selectedTopicIdsForCards.includes(topic.id);

                          return (
                            <tr
                              key={topic.id}
                              className={`transition-colors group cursor-pointer ${
                                isCardSelected ? 'bg-amber-50/60' : 'hover:bg-amber-50/30'
                              }`}
                              onClick={() => openTopicDrawer(topic)}
                            >
                              {/* Flashcard Generation Selection Checkbox */}
                              <td
                                className="py-2.5 pl-3 pr-1 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isCardSelected}
                                  onChange={() => toggleTopicCardSelection(topic.id)}
                                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300 cursor-pointer accent-amber-600"
                                  title="Select this topic for AI Flashcards"
                                />
                              </td>

                              {/* Direct Checkbox (Only editable cell for initial coverage) */}
                              <td
                                className="py-2.5 px-2 text-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={topic.initialCovered}
                                  onChange={() => toggleTopicInitialCovered(topic.id)}
                                  className="w-4 h-4 rounded text-stone-900 focus:ring-stone-800 border-stone-300 cursor-pointer"
                                  title="Toggle Initial Coverage"
                                />
                              </td>

                              {/* Review count */}
                              <td className="py-2.5 px-2 text-center font-mono text-stone-700">
                                {topic.reviewCount}
                              </td>

                              {/* Mastery */}
                              <td className="py-2.5 px-2 text-center font-mono font-bold">
                                {topic.mastery ? (
                                  <span
                                    className={
                                      topic.mastery <= 2
                                        ? 'text-rose-600'
                                        : topic.mastery === 5
                                        ? 'text-emerald-700'
                                        : 'text-stone-800'
                                    }
                                  >
                                    {topic.mastery}/5
                                  </span>
                                ) : (
                                  <span className="text-stone-300">—</span>
                                )}
                              </td>

                              {/* Topic Name + Marker */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 text-center">{getMarkerIcon(marker)}</span>
                                  <span className="font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
                                    {topic.name}
                                  </span>
                                  {topic.isHighPriority && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded">
                                      High Priority
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Latest Score */}
                              <td className="py-2.5 px-3 text-right font-mono font-medium text-stone-800">
                                {topic.latestScore !== null ? `${topic.latestScore}%` : '—'}
                              </td>

                              {/* Next Review */}
                              <td className="py-2.5 px-3 text-stone-700">
                                <span
                                  className={`inline-block font-medium ${
                                    nextReviewFormatted.includes('overdue')
                                      ? 'text-rose-700 font-bold'
                                      : nextReviewFormatted === 'Today'
                                      ? 'text-amber-800 font-bold'
                                      : 'text-stone-600'
                                  }`}
                                >
                                  {nextReviewFormatted}
                                </span>
                              </td>

                              {/* 3-Tier Status */}
                              <td className="py-2.5 pr-4 pl-3 text-center">
                                {getStatusTierBadge(tier)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
      </>
      )}

      {/* Integrated Mastery Gate (Subject Readiness & Graduation) */}
      <MasteryGate subject={currentSubject} onTopicClick={openTopicDrawer} />

      {/* AI-Powered Flashcards Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsModalOpen}
        onClose={() => setIsFlashcardsModalOpen(false)}
        selectedTopics={selectedTopicsForCards}
      />
    </div>
  );
};
