import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo, useEffect } from 'react';
import { useReview } from '../context/ReviewContext';
import {
  ScheduledQuestionRecord,
  QuestionDifficulty,
  QuestionReviewGrade,
  QuestionDueStatus,
  analyzeScheduledQuestion,
  computeNextQuestionInterval,
  getInitialScheduledQuestions,
  addDays,
  DIFFICULTY_CONFIG,
} from '../utils/questionSpacedRepetition';
import { AlertTriangle, CheckCircle2, Play, Sliders, ChevronDown, ChevronUp, Check, Search } from 'lucide-react';
import { MathFormula } from './MathFormula';

const LOCAL_STORAGE_KEY = 'ece_board_review_scheduled_questions_v1';

export const QuestionSpacedRepetitionQueue: React.FC = () => {
  const { currentDateStr, openTopicDrawer, allTopics } = useReview();

  // Load or initialize scheduled questions from localStorage
  const [questions, setQuestions] = useState<ScheduledQuestionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return getInitialScheduledQuestions(currentDateStr);
  });

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(questions));
    } catch {
      // ignore
    }
  }, [questions]);

  // Filtering & Search state
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'overdue' | 'upcoming'>('due');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | QuestionDifficulty>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'urgency' | 'difficulty' | 'retention' | 'date'>('urgency');

  // Expanded card state
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [justGradedId, setJustGradedId] = useState<string | null>(null);

  // Algorithm simulator state (for explainer panel)
  const [showAlgorithmExplainer, setShowAlgorithmExplainer] = useState<boolean>(false);
  const [simDifficulty, setSimDifficulty] = useState<QuestionDifficulty>('Hard');
  const [simGrade, setSimGrade] = useState<QuestionReviewGrade>('Good');
  const [simCurrentInterval, setSimCurrentInterval] = useState<number>(2);
  const [simRepetitions, setSimRepetitions] = useState<number>(1);
  const [simEaseFactor, setSimEaseFactor] = useState<number>(2.2);

  // Analyze all questions
  const analyzedQuestions = useMemo(() => {
    return questions.map((q) => {
      const analysis = analyzeScheduledQuestion(q, currentDateStr);
      return {
        ...q,
        analysis,
      };
    });
  }, [questions, currentDateStr]);

  // Overall queue metrics
  const queueMetrics = useMemo(() => {
    let overdueCount = 0;
    let dueTodayCount = 0;
    let upcomingCount = 0;
    let totalRetention = 0;

    analyzedQuestions.forEach((q) => {
      if (q.analysis.dueStatus === 'Overdue') overdueCount += 1;
      else if (q.analysis.dueStatus === 'Due Today') dueTodayCount += 1;
      else upcomingCount += 1;

      totalRetention += q.analysis.estimatedRetentionPercent;
    });

    const averageRetention =
      analyzedQuestions.length > 0 ? Math.round(totalRetention / analyzedQuestions.length) : 100;

    return {
      overdueCount,
      dueTodayCount,
      totalDue: overdueCount + dueTodayCount,
      upcomingCount,
      totalCount: analyzedQuestions.length,
      averageRetention,
    };
  }, [analyzedQuestions]);

  // Filtered and sorted questions
  const filteredQuestions = useMemo(() => {
    return analyzedQuestions
      .filter((q) => {
        // Status filter
        if (statusFilter === 'due') {
          if (q.analysis.dueStatus !== 'Due Today' && q.analysis.dueStatus !== 'Overdue') return false;
        } else if (statusFilter === 'overdue') {
          if (q.analysis.dueStatus !== 'Overdue') return false;
        } else if (statusFilter === 'upcoming') {
          if (q.analysis.dueStatus !== 'Upcoming' && q.analysis.dueStatus !== 'Due Tomorrow') return false;
        }

        // Difficulty filter
        if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;

        // Subject filter
        if (subjectFilter !== 'all' && q.subjectId !== subjectFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchQuestion = q.question.toLowerCase().includes(query);
          const matchTopic = q.topicName.toLowerCase().includes(query);
          const matchSubject = q.subjectName.toLowerCase().includes(query);
          if (!matchQuestion && !matchTopic && !matchSubject) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'urgency') {
          return b.analysis.urgencyScore - a.analysis.urgencyScore;
        }
        if (sortBy === 'difficulty') {
          const diffRank = { Hard: 3, Medium: 2, Easy: 1 };
          return diffRank[b.difficulty] - diffRank[a.difficulty];
        }
        if (sortBy === 'retention') {
          return a.analysis.estimatedRetentionPercent - b.analysis.estimatedRetentionPercent;
        }
        if (sortBy === 'date') {
          return new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
        }
        return 0;
      });
  }, [analyzedQuestions, statusFilter, difficultyFilter, subjectFilter, searchQuery, sortBy]);

  // Handle recording recall grade for a question
  const handleGradeQuestion = (questionId: string, grade: QuestionReviewGrade) => {
    setQuestions((prevList) => {
      return prevList.map((q) => {
        if (q.id !== questionId) return q;

        const scheduleResult = computeNextQuestionInterval(
          q.difficulty,
          q.intervalDays,
          q.easeFactor,
          q.repetitions,
          grade
        );

        const newLastPracticed = currentDateStr;
        const newNextReviewDate = addDays(currentDateStr, scheduleResult.nextInterval);
        const isCorrect = grade !== 'Again';

        const historyItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: currentDateStr,
          grade,
          intervalAssigned: scheduleResult.nextInterval,
          easeFactorAssigned: scheduleResult.nextEaseFactor,
          userSelectedOption: selectedAnswers[questionId],
          isCorrect,
        };

        return {
          ...q,
          lastPracticedDate: newLastPracticed,
          nextReviewDate: newNextReviewDate,
          intervalDays: scheduleResult.nextInterval,
          easeFactor: scheduleResult.nextEaseFactor,
          repetitions: scheduleResult.nextRepetitions,
          lapses: scheduleResult.isLapse ? q.lapses + 1 : q.lapses,
          totalAttempts: q.totalAttempts + 1,
          successfulAttempts: isCorrect ? q.successfulAttempts + 1 : q.successfulAttempts,
          history: [historyItem, ...q.history],
        };
      });
    });

    setJustGradedId(questionId);
    setTimeout(() => {
      setJustGradedId(null);
    }, 2500);
  };

  // Reset schedule to initial seed
  const handleResetSchedule = () => {
    if (window.confirm('Reset all questions to default spaced repetition schedule?')) {
      const initial = getInitialScheduledQuestions(currentDateStr);
      setQuestions(initial);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    }
  };

  // Unique subjects for filter
  const availableSubjects = useMemo(() => {
    const map = new Map<string, string>();
    questions.forEach((q) => {
      if (!map.has(q.subjectId)) {
        map.set(q.subjectId, q.subjectName);
      }
    });
    return Array.from(map.entries());
  }, [questions]);

  // Simulator computed output
  const simResult = useMemo(() => {
    return computeNextQuestionInterval(
      simDifficulty,
      simCurrentInterval,
      simEaseFactor,
      simRepetitions,
      simGrade
    );
  }, [simDifficulty, simCurrentInterval, simEaseFactor, simRepetitions, simGrade]);

  return (
    <div id="question-spaced-repetition-root" className="space-y-6">
      {/* 1. HERO METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border-2 border-stone-900 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Due Today</span>
            <AppArtwork name="flame" inline className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
            {queueMetrics.dueTodayCount}
          </div>
          <p className="text-[11px] text-stone-500">Ready for optimal retrieval</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-1 bg-linear-to-b from-rose-50/50 to-white">
          <div className="flex items-center justify-between text-xs font-bold text-rose-600 uppercase tracking-wider">
            <span>Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 font-mono">
            {queueMetrics.overdueCount}
          </div>
          <p className="text-[11px] text-rose-600 font-medium">Memory decay risk</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Upcoming</span>
            <AppArtwork name="calendar" inline className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-800 font-mono">
            {queueMetrics.upcomingCount}
          </div>
          <p className="text-[11px] text-stone-500">Scheduled future intervals</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Avg. Retention</span>
            <AppArtwork name="star" inline className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
            {queueMetrics.averageRetention}%
          </div>
          <p className="text-[11px] text-stone-500">Ebbinghaus stability index</p>
        </div>
      </div>

      {/* 2. ALGORITHM MECHANICS & SIMULATOR COLLAPSIBLE PANEL */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-800 app-artwork-tile">
              <AppArtwork name="brain" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-stone-900">
                Spaced Repetition Algorithm: Difficulty &amp; Recency Engine
              </h3>
              <p className="text-xs text-stone-500">
                Calculates review intervals using difficulty weighting, elapsed calendar days, and
                retrieval quality.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="toggle-algorithm-explainer-btn"
            onClick={() => setShowAlgorithmExplainer(!showAlgorithmExplainer)}
            className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAlgorithmExplainer ? 'Hide Simulator' : 'Inspect Algorithm & Simulator'}</span>
            {showAlgorithmExplainer ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {showAlgorithmExplainer && (
          <div className="pt-3 border-t border-stone-100 space-y-5">
            {/* Mathematical rules breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['Hard', 'Medium', 'Easy'] as const).map((diff) => {
                const cfg = DIFFICULTY_CONFIG[diff];
                return (
                  <div
                    key={diff}
                    className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
                      diff === 'Hard'
                        ? 'border-rose-200 bg-rose-50/40 text-rose-950'
                        : diff === 'Medium'
                        ? 'border-amber-200 bg-amber-50/40 text-amber-950'
                        : 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="uppercase tracking-wider font-mono text-[11px]">
                        {cfg.label}
                      </span>
                      <span className="font-mono text-stone-900 bg-white/80 px-2 py-0.5 rounded border border-stone-200">
                        Base: {cfg.baseIntervalDays}d
                      </span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed">{cfg.description}</p>
                    <div className="text-[10px] font-mono text-stone-600 border-t border-stone-200/60 pt-1.5 space-y-0.5">
                      <div>Decay Rate λ: {cfg.memoryDecayRate}</div>
                      <div>Interval Factor: {cfg.difficultyMultiplier}×</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Simulator */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                <AppArtwork name="lightning" inline className="w-4 h-4 text-amber-600" />
                <span>Interactive Schedule Simulator (Test Mathematical Calculation)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Question Difficulty
                  </label>
                  <select
                    value={simDifficulty}
                    onChange={(e) => setSimDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2 font-semibold text-stone-800 outline-hidden"
                  >
                    <option value="Hard">Hard (1d base)</option>
                    <option value="Medium">Medium (2d base)</option>
                    <option value="Easy">Easy (4d base)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Current Interval (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={simCurrentInterval}
                    onChange={(e) => setSimCurrentInterval(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2 font-mono font-semibold text-stone-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Recall Grade
                  </label>
                  <select
                    value={simGrade}
                    onChange={(e) => setSimGrade(e.target.value as QuestionReviewGrade)}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2 font-semibold text-stone-800 outline-hidden"
                  >
                    <option value="Again">Again (Lapse / Failed)</option>
                    <option value="Hard">Hard (Struggled)</option>
                    <option value="Good">Good (Correct Recall)</option>
                    <option value="Easy">Easy (Effortless)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    Consecutive Repetitions
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={simRepetitions}
                    onChange={(e) => setSimRepetitions(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2 font-mono font-semibold text-stone-800 outline-hidden"
                  />
                </div>
              </div>

              {/* Simulation Result Callout */}
              <div className="p-3 bg-stone-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div>
                  <span className="text-amber-400 font-bold block text-[11px]">
                    CALCULATED OUTPUT:
                  </span>
                  <span>
                    New Interval:{' '}
                    <strong className="text-amber-300 text-sm font-bold">
                      {simResult.nextInterval} days
                    </strong>{' '}
                    • Next Review Date: {addDays(currentDateStr, simResult.nextInterval)}
                  </span>
                </div>
                <div className="text-stone-300 text-[11px]">
                  Ease Factor: {simResult.nextEaseFactor} • Reps: {simResult.nextRepetitions}
                  {simResult.isLapse && (
                    <span className="text-rose-400 font-bold ml-2">(Lapse Recorded)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. CONTROLS & FILTER BAR */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('due')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'due'
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <AppArtwork name="flame" inline className="w-3.5 h-3.5 text-amber-500" />
              <span>Due Now ({queueMetrics.totalDue})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'overdue'
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Overdue ({queueMetrics.overdueCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'upcoming'
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
              <span>Upcoming ({queueMetrics.upcomingCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-stone-900 text-amber-400 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>All ({queueMetrics.totalCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search question / topic..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-200"
              />
            </div>

            <button
              type="button"
              onClick={handleResetSchedule}
              title="Reset practice schedule"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <AppArtwork name="cycle" inline className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary filters: Difficulty & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-stone-500 text-[11px] uppercase tracking-wider">
              Difficulty:
            </span>
            {(['all', 'Hard', 'Medium', 'Easy'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                  difficultyFilter === diff
                    ? diff === 'Hard'
                      ? 'bg-rose-600 text-white'
                      : diff === 'Medium'
                      ? 'bg-amber-600 text-white'
                      : diff === 'Easy'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {diff === 'all' ? 'All Difficulties' : diff}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-500 text-[11px] uppercase tracking-wider">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-stone-700 outline-hidden cursor-pointer"
            >
              <option value="urgency">Urgency (Most Decayed First)</option>
              <option value="difficulty">Difficulty (Hard First)</option>
              <option value="retention">Lowest Retention %</option>
              <option value="date">Next Review Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. SCHEDULED QUESTIONS LIST */}
      <div className="space-y-3.5">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => {
            const isExpanded = expandedQuestionId === q.id;
            const isGradedJustNow = justGradedId === q.id;
            const topicObj = allTopics.find((t) => t.id === q.topicId);

            // Due status badge styling
            const getStatusBadge = (status: QuestionDueStatus) => {
              switch (status) {
                case 'Overdue':
                  return (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-extrabold border border-rose-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                      OVERDUE ({Math.abs(q.analysis.daysUntilDue)}d)
                    </span>
                  );
                case 'Due Today':
                  return (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-mono font-extrabold flex items-center gap-1 shadow-2xs">
                      <AppArtwork name="flame" inline className="w-3 h-3 text-stone-950" />
                      DUE TODAY
                    </span>
                  );
                case 'Due Tomorrow':
                  return (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-mono font-bold border border-blue-200">
                      Due Tomorrow
                    </span>
                  );
                default:
                  return (
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-mono font-semibold border border-stone-200">
                      Due in {q.analysis.daysUntilDue}d ({q.nextReviewDate})
                    </span>
                  );
              }
            };

            const getDifficultyBadge = (diff: QuestionDifficulty) => {
              switch (diff) {
                case 'Hard':
                  return (
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-mono font-bold border border-rose-200">
                      Hard (1d base)
                    </span>
                  );
                case 'Medium':
                  return (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold border border-amber-200">
                      Medium (2d base)
                    </span>
                  );
                case 'Easy':
                  return (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                      Easy (4d base)
                    </span>
                  );
              }
            };

            return (
              <div
                key={q.id}
                id={`scheduled-question-${q.id}`}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isGradedJustNow
                    ? 'border-emerald-500 ring-2 ring-emerald-300 shadow-md'
                    : q.analysis.dueStatus === 'Overdue'
                    ? 'border-rose-300 shadow-xs'
                    : q.analysis.dueStatus === 'Due Today'
                    ? 'border-amber-300 shadow-xs'
                    : 'border-stone-200/90 shadow-2xs'
                }`}
              >
                {/* Header row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1 min-w-0">
                    {/* Status and category tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(q.analysis.dueStatus)}
                      {getDifficultyBadge(q.difficulty)}
                      <button
                        type="button"
                        onClick={() => topicObj && openTopicDrawer(topicObj)}
                        className="text-xs font-bold text-stone-600 hover:text-amber-700 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <AppArtwork name="book" inline className="w-3.5 h-3.5 text-stone-400" />
                        <span>{q.topicName}</span>
                      </button>
                      <span className="text-[11px] text-stone-400">•</span>
                      <span className="text-[11px] text-stone-500 truncate">{q.subjectName}</span>
                    </div>

                    {/* Question text */}
                    <div className="text-sm font-bold text-stone-900 leading-snug">
                      <MathFormula formula={q.question} />
                    </div>

                    {/* Spaced repetition metrics strip */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 font-mono pt-1">
                      <div>
                        Last Practiced:{' '}
                        <strong className="text-stone-800">
                          {q.analysis.daysElapsed === 0
                            ? 'Today'
                            : q.analysis.daysElapsed === 1
                            ? 'Yesterday'
                            : `${q.analysis.daysElapsed}d ago`}
                        </strong>{' '}
                        ({q.lastPracticedDate})
                      </div>
                      <div>•</div>
                      <div>
                        Interval: <strong className="text-stone-800">{q.intervalDays}d</strong>
                      </div>
                      <div>•</div>
                      <div>
                        Ease Factor: <strong className="text-stone-800">{q.easeFactor}</strong>
                      </div>
                      <div>•</div>
                      <div>
                        Reps: <strong className="text-stone-800">{q.repetitions}</strong>
                      </div>
                      <div>•</div>
                      <div className="flex items-center gap-1.5">
                        <span>Retention:</span>
                        <div className="w-14 h-2 bg-stone-100 rounded-full overflow-hidden border border-stone-200 inline-block">
                          <div
                            className={`h-full rounded-full ${
                              q.analysis.estimatedRetentionPercent >= 80
                                ? 'bg-emerald-500'
                                : q.analysis.estimatedRetentionPercent >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${q.analysis.estimatedRetentionPercent}%` }}
                          />
                        </div>
                        <strong
                          className={
                            q.analysis.estimatedRetentionPercent >= 80
                              ? 'text-emerald-700'
                              : q.analysis.estimatedRetentionPercent >= 60
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }
                        >
                          {q.analysis.estimatedRetentionPercent}%
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Right side trigger button */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    {isGradedJustNow ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-300">
                        <Check className="w-4 h-4 text-emerald-700" />
                        <span>Rescheduled!</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedQuestionId(isExpanded ? null : q.id)
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                          isExpanded
                            ? 'bg-stone-200 text-stone-800'
                            : q.analysis.dueStatus === 'Overdue'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : q.analysis.dueStatus === 'Due Today'
                            ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                            : 'bg-stone-900 hover:bg-stone-800 text-amber-400'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isExpanded ? 'Close Drill' : 'Review & Rate'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Interactive Card: Options, Formula, and Rating */}
                {isExpanded && (
                  <div className="border-t border-stone-200 bg-stone-50/70 p-4 sm:p-5 space-y-4">
                    {/* Multiple choice options */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                        Options:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const isSelected = selectedAnswers[q.id] === opt.id;
                          const isRevealed = revealedSolutions[q.id];
                          const isCorrect = opt.id === q.correctOptionId;

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                setSelectedAnswers((prev) => ({
                                  ...prev,
                                  [q.id]: opt.id,
                                }))
                              }
                              className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 text-xs font-medium cursor-pointer ${
                                isRevealed
                                  ? isCorrect
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                                    : isSelected
                                    ? 'bg-rose-50 border-rose-400 text-rose-950'
                                    : 'bg-white border-stone-200 opacity-60'
                                  : isSelected
                                  ? 'bg-stone-900 text-white border-stone-900 font-bold'
                                  : 'bg-white hover:bg-stone-100 border-stone-200 text-stone-800'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full text-[11px] font-mono font-bold flex items-center justify-center shrink-0 ${
                                  isSelected && !isRevealed
                                    ? 'bg-amber-400 text-stone-950'
                                    : 'bg-stone-200 text-stone-700'
                                }`}
                              >
                                {opt.id}
                              </span>
                              <span className="flex-1 leading-relaxed">
                                <MathFormula formula={opt.text} />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Toggle Solution / Explanation */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setRevealedSolutions((prev) => ({
                            ...prev,
                            [q.id]: !prev[q.id],
                          }))
                        }
                        className="text-xs font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                      >
                        {revealedSolutions[q.id]
                          ? 'Hide Solution & Explanation'
                          : 'Show Solution & Key Formula'}
                      </button>
                    </div>

                    {/* Solution and Explanation Box */}
                    {revealedSolutions[q.id] && (
                      <div className="p-3.5 bg-white border border-stone-200 rounded-xl space-y-2 text-xs">
                        <div className="font-bold text-stone-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Correct Answer: Option {q.correctOptionId}</span>
                        </div>

                        {q.keyFormula && (
                          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 font-mono text-[11px] text-amber-900">
                            <strong>Key Formula:</strong> {q.keyFormula}
                          </div>
                        )}

                        <p className="text-stone-600 whitespace-pre-line leading-relaxed">
                          {q.explanation}
                        </p>

                        {q.boardTip && (
                          <div className="text-[11px] text-stone-500 italic border-t border-stone-100 pt-1.5">
                            💡 Board Exam Tip: {q.boardTip}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SPACED REPETITION RECALL GRADING BUTTONS */}
                    <div className="pt-2 border-t border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                          <AppArtwork name="brain" inline className="w-3.5 h-3.5 text-amber-600" />
                          <span>Rate Recall Difficulty (Algorithm Schedules Next Review):</span>
                        </span>
                        <span className="text-[11px] text-stone-500 font-mono">
                          Difficulty Weight: {q.difficulty}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* 1. AGAIN */}
                        <button
                          type="button"
                          onClick={() => handleGradeQuestion(q.id, 'Again')}
                          className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-left transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-bold text-xs">
                            <span>🔴 Again</span>
                            <span className="font-mono text-[10px] bg-rose-200/80 px-1.5 py-0.2 rounded">
                              {q.analysis.recommendedGradeIntervals.again}d
                            </span>
                          </div>
                          <p className="text-[10px] text-rose-700 mt-0.5">
                            Forgot / Lapse. Resets interval to 1d.
                          </p>
                        </button>

                        {/* 2. HARD */}
                        <button
                          type="button"
                          onClick={() => handleGradeQuestion(q.id, 'Hard')}
                          className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-left transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-bold text-xs">
                            <span>🟠 Hard</span>
                            <span className="font-mono text-[10px] bg-amber-200/80 px-1.5 py-0.2 rounded">
                              {q.analysis.recommendedGradeIntervals.hard}d
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-700 mt-0.5">
                            Struggled. Short conservative step.
                          </p>
                        </button>

                        {/* 3. GOOD */}
                        <button
                          type="button"
                          onClick={() => handleGradeQuestion(q.id, 'Good')}
                          className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 text-left transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-bold text-xs">
                            <span>🟡 Good</span>
                            <span className="font-mono text-[10px] bg-blue-200/80 px-1.5 py-0.2 rounded">
                              {q.analysis.recommendedGradeIntervals.good}d
                            </span>
                          </div>
                          <p className="text-[10px] text-blue-700 mt-0.5">
                            Successful recall. Standard spacing.
                          </p>
                        </button>

                        {/* 4. EASY */}
                        <button
                          type="button"
                          onClick={() => handleGradeQuestion(q.id, 'Easy')}
                          className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-left transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-bold text-xs">
                            <span>🟢 Easy</span>
                            <span className="font-mono text-[10px] bg-emerald-200/80 px-1.5 py-0.2 rounded">
                              {q.analysis.recommendedGradeIntervals.easy}d
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-700 mt-0.5">
                            Effortless recall. Boosts ease factor.
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <h4 className="font-bold text-stone-800 text-base">No Questions Matching Criteria</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              All questions in this view have either been rescheduled to future calendar dates or
              filter settings excluded them. Switch filter to &ldquo;All&rdquo; or &ldquo;Upcoming&rdquo; to inspect the entire spaced repetition schedule.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setDifficultyFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-amber-300 font-bold text-xs cursor-pointer"
            >
              Reset Filters to View All Questions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
