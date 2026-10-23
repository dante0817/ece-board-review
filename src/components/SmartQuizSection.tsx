import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { useReview } from '../context/ReviewContext';
import { AlertTriangle, Sliders, ArrowRight, ShieldAlert, Info } from 'lucide-react';
import { WeakSpotQuizOptions, CustomWeakSpotQuiz } from '../types';

export const SmartQuizSection: React.FC = () => {
  const {
    errors,
    subjects,
    allTopics,
    startWeakSpotQuiz,
    generateWeakSpotQuiz,
    setCurrentScreen,
    testRecords,
    openTopicDrawer,
  } = useReview();

  // Quiz customization state
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [targetSubjectId, setTargetSubjectId] = useState<string>('all');
  const [focusErrorCategory, setFocusErrorCategory] = useState<string>('all');
  const [includeResolved, setIncludeResolved] = useState<boolean>(false);
  const [showQuestionsPreview, setShowQuestionsPreview] = useState<boolean>(true);

  // Filter active errors from ErrorLogScreen
  const unresolvedErrors = useMemo(() => errors.filter((e) => !e.isResolved), [errors]);
  const activeErrors = useMemo(
    () => (includeResolved ? errors : unresolvedErrors),
    [errors, includeResolved, unresolvedErrors]
  );

  // Analyze weak topics from ErrorLogScreen
  const weakTopicsAnalysis = useMemo(() => {
    const topicMap = new Map<
      string,
      {
        topicId: string;
        topicName: string;
        subjectId: string;
        errorCount: number;
        categories: Set<string>;
        descriptions: string[];
      }
    >();

    activeErrors.forEach((err) => {
      const existing = topicMap.get(err.topicId) || {
        topicId: err.topicId,
        topicName: err.topicName,
        subjectId: err.subjectId,
        errorCount: 0,
        categories: new Set<string>(),
        descriptions: [],
      };
      existing.errorCount += err.occurrenceCount || 1;
      existing.categories.add(err.category);
      if (err.description && !existing.descriptions.includes(err.description)) {
        existing.descriptions.push(err.description);
      }
      topicMap.set(err.topicId, existing);
    });

    const sorted = Array.from(topicMap.values()).sort((a, b) => b.errorCount - a.errorCount);

    // Categories breakdown
    const catMap = new Map<string, number>();
    activeErrors.forEach((err) => {
      catMap.set(err.category, (catMap.get(err.category) || 0) + (err.occurrenceCount || 1));
    });
    const sortedCats = Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]);

    return {
      topWeakTopics: sorted,
      topCategories: sortedCats,
      totalMistakes: activeErrors.reduce((acc, e) => acc + (e.occurrenceCount || 1), 0),
    };
  }, [activeErrors]);

  // Generate real-time quiz preview based on user's current settings
  const quizPreview: CustomWeakSpotQuiz = useMemo(() => {
    const options: WeakSpotQuizOptions = {
      questionCount,
      includeResolved,
      targetSubjectId: targetSubjectId === 'all' ? undefined : targetSubjectId,
      focusErrorCategory: focusErrorCategory === 'all' ? undefined : focusErrorCategory,
    };
    return generateWeakSpotQuiz(options);
  }, [
    generateWeakSpotQuiz,
    questionCount,
    includeResolved,
    targetSubjectId,
    focusErrorCategory,
  ]);

  const handleLaunchSmartQuiz = () => {
    if(quizPreview.questions.length===0)return;
    startWeakSpotQuiz(quizPreview);
  };

  const estimatedDurationMinutes = Math.round(questionCount * 1.5);

  return (
    <div id="smart-quiz-section" className="space-y-6">
      <div role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
        Smart Quiz is a study diagnostic. Some legacy questions overlap the mock-exam pool, so results do not prove unseen-question readiness. If filters have insufficient questions, the preview shows the actual number available.
      </div>
      {/* 1. HERO BANNER: SMART QUIZ OVERVIEW */}
      <div className="bg-linear-to-r from-amber-500 via-amber-600 to-stone-900 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        {/* Background decorative accent */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-stone-950/40 text-amber-300 backdrop-blur-xs border border-amber-300/30">
                <AppArtwork name="brain" inline className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-stone-950 bg-amber-300 px-2.5 py-0.5 rounded-full">
                Adaptive Error Remediation
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Smart Quiz: Weak Topic Diagnostic
            </h2>

            <p className="text-xs sm:text-sm text-amber-50/90 leading-relaxed">
              Automatically selects board exam questions targeting mistakes logged in your{' '}
              <strong className="text-white underline decoration-amber-300 underline-offset-2">
                Error Log
              </strong>
              . Reconstructs recurring calculation pitfalls, formula recall traps, and weak syllabus
              concepts to solidify high-scoring retention.
            </p>

            {/* Quick summary pill tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-stone-950/50 backdrop-blur-xs text-amber-200 border border-amber-400/30 font-medium">
                🎯 {activeErrors.length} Active Mistakes Analyzed
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-950/50 backdrop-blur-xs text-amber-200 border border-amber-400/30 font-medium">
                ⚡ Focus: {quizPreview.dominantSubjectName} ({quizPreview.dominantSubjectErrorPercent}%)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-950/50 backdrop-blur-xs text-amber-200 border border-amber-400/30 font-medium">
                ⏱️ ~{estimatedDurationMinutes} Mins Suggested
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 self-start md:self-center">
            <button
              type="button"
              id="smart-quiz-hero-launch-btn"
              onClick={handleLaunchSmartQuiz}
              disabled={quizPreview.questions.length===0}
              className="px-6 py-3.5 rounded-xl bg-stone-950 hover:bg-stone-900 text-amber-300 font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] border border-amber-400/50"
            >
              <AppArtwork name="lightning" inline className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>Launch Smart Quiz ({quizPreview.totalQuestions} Qs)</span>
              <ArrowRight className="w-4 h-4 text-amber-300" />
            </button>

            <button
              type="button"
              id="view-error-log-btn"
              onClick={() => setCurrentScreen('errors')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-colors text-center cursor-pointer border border-white/20"
            >
              View Full Error Log & Patterns →
            </button>
          </div>
        </div>
      </div>

      {/* 2. ERROR LOG DIAGNOSTIC BREAKDOWN */}
      <div className="bg-white border-2 border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600">
              Targeting Evidence-Based Mistakes
            </span>
            <h3 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
              <AppArtwork name="target" inline className="w-5 h-5 text-rose-600" />
              <span>Your Identified Weak Spots (From ErrorLogScreen)</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200 font-mono">
              {unresolvedErrors.length} Unresolved Errors
            </span>
            <label className="flex items-center gap-1.5 text-stone-600 font-medium cursor-pointer ml-1 select-none">
              <input
                type="checkbox"
                id="include-resolved-checkbox"
                checked={includeResolved}
                onChange={(e) => setIncludeResolved(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
              />
              <span>Include Resolved ({errors.filter((e) => e.isResolved).length})</span>
            </label>
          </div>
        </div>

        {/* Top Weak Topics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {weakTopicsAnalysis.topWeakTopics.slice(0, 4).map((item, idx) => {
            const topicObj = allTopics.find((t) => t.id === item.topicId);
            return (
              <div
                key={item.topicId}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-400 transition-all flex flex-col justify-between space-y-2 group shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      Weak Spot #{idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-700">
                      {item.errorCount} {item.errorCount === 1 ? 'mistake' : 'mistakes'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => topicObj && openTopicDrawer(topicObj)}
                    className="text-xs font-bold text-stone-900 group-hover:text-amber-700 text-left line-clamp-1 block cursor-pointer"
                    title={item.topicName}
                  >
                    {item.topicName}
                  </button>

                  <div className="flex flex-wrap gap-1">
                    {Array.from(item.categories).map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white text-stone-600 border border-stone-200"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {item.descriptions[0] && (
                  <p className="text-[11px] text-stone-500 italic line-clamp-2 border-t border-stone-200/60 pt-1.5">
                    &ldquo;{item.descriptions[0]}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-bold text-stone-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Recurring Pitfalls:</span>
          </span>
          {weakTopicsAnalysis.topCategories.map(([category, count]) => (
            <span
              key={category}
              className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-medium border border-stone-200 flex items-center gap-1.5 text-[11px]"
            >
              <span>{category}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-stone-200 text-stone-900 font-mono font-bold text-[10px]">
                {count}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* 3. SMART QUIZ PARAMETER CONFIGURATION */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <span>Customize Smart Quiz Configuration</span>
          </h3>
          <span className="text-xs text-stone-500 font-medium">
            Tailor question distribution and focus areas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Question Count */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 block">Number of Questions</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  type="button"
                  id={`smart-quiz-count-${count}`}
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                    questionCount === count
                      ? 'bg-stone-900 text-amber-300 shadow-xs ring-2 ring-stone-900'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  {count} Qs
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">
              Estimated duration: ~{Math.max(5,Math.round(quizPreview.questions.length*1.5))} minutes for available questions.
            </p>
          </div>

          {/* Subject Area Focus */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 block">Subject Area Filter</label>
            <select
              id="smart-quiz-subject-select"
              value={targetSubjectId}
              onChange={(e) => setTargetSubjectId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-hidden cursor-pointer"
            >
              <option value="all">All Weak Subjects (Auto-Balanced Share)</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-stone-500">
              Questions are allocated using available items and error frequency; selected subjects are never replaced silently.
            </p>
          </div>

          {/* Error Category Traps Focus */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 block">Error Category Trap</label>
            <select
              id="smart-quiz-category-select"
              value={focusErrorCategory}
              onChange={(e) => setFocusErrorCategory(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-xs text-stone-800 font-medium focus:ring-2 focus:ring-amber-200 focus:border-amber-500 outline-hidden cursor-pointer"
            >
              <option value="all">All Pitfall Categories (Mixed Drill)</option>
              <option value="Formula recall">Formula Recall & Identity Traps</option>
              <option value="Sign / algebra errors">Sign, Polar & Algebraic Slips</option>
              <option value="Wrong method">Methodology & Strategy Errors</option>
              <option value="Speed / calculation slip">Speed & Calculation Pressure</option>
              <option value="Question misreading">Question Misreading & Units</option>
            </select>
            <p className="text-[11px] text-stone-500">
              Filters diagnostic questions to targeted reasoning traps.
            </p>
          </div>
        </div>
      </div>

      {/* 4. LIVE QUESTIONS & TOPICS SELECTION PREVIEW */}
      <div className="bg-stone-50 border-2 border-stone-300 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                Generated Plan
              </span>
              <span className="text-xs font-bold text-stone-900">
                {quizPreview.questions.length} Diagnostic Questions Selected
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-stone-900">{quizPreview.title}</h4>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowQuestionsPreview(!showQuestionsPreview)}
              className="text-xs text-stone-600 hover:text-stone-900 font-semibold underline cursor-pointer"
            >
              {showQuestionsPreview ? 'Hide Question Previews' : 'Show Question Previews'}
            </button>
            <button
              type="button"
              id="smart-quiz-start-bottom-btn"
              onClick={handleLaunchSmartQuiz}
              disabled={quizPreview.questions.length===0}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <AppArtwork name="lightning" inline className="w-3.5 h-3.5 fill-stone-950 text-stone-950" />
              <span>Start Quiz Now</span>
            </button>
          </div>
        </div>

        {/* Rationale and Strategy Tips */}
        <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-1.5 text-xs">
          <div className="font-semibold text-stone-900 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Diagnostic Strategy Rationale:</span>
          </div>
          <p className="text-stone-600 leading-relaxed pl-5">
            {quizPreview.diagnosticExecutiveSummary}
          </p>
        </div>

        {/* Questions Preview List */}
        {showQuestionsPreview && (
          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-stone-600" />
              <span>Questions Selected from Error Log:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {quizPreview.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3 bg-white border border-stone-200 rounded-xl shadow-2xs space-y-2 hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-amber-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-stone-900 truncate max-w-[200px]">
                        {q.topicName}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold shrink-0">
                      {q.targetedErrorCategory}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed">
                    {q.question}
                  </p>

                  {q.weaknessRationale && (
                    <div className="text-[11px] text-amber-900 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200/70 flex items-start gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{q.weaknessRationale}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
