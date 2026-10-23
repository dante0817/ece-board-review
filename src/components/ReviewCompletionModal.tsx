import { AppArtwork } from './common/AppArtwork';
import React, { useMemo } from 'react';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';
import { useReview } from '../context/ReviewContext';
import { getDedicatedMathScreen } from '../utils/mathTopicNavigation';
import { MasteryLevel } from '../types';

const MASTERY_LABELS: Record<MasteryLevel, string> = {
  1: 'Beginning',
  2: 'Needs Work',
  3: 'Developing',
  4: 'Proficient',
  5: 'Mastered',
};

export const ReviewCompletionModal: React.FC = () => {
  const {
    reviewCompletionSummary,
    dismissReviewCompletion,
    dailyStudyQueue,
    allTopics,
    errors,
    setCurrentScreen,
    startReview,
  } = useReview();

  const nextItem = useMemo(() => {
    if (!reviewCompletionSummary) return null;
    return (
      dailyStudyQueue.find(
        (item) =>
          item.topic.id !== reviewCompletionSummary.topicId &&
          item.topic.subjectId === reviewCompletionSummary.subjectId
      ) ??
      dailyStudyQueue.find((item) => item.topic.id !== reviewCompletionSummary.topicId) ??
      null
    );
  }, [dailyStudyQueue, reviewCompletionSummary]);

  const sequentialNextTopic = useMemo(() => {
    if (!reviewCompletionSummary || nextItem) return null;
    const completed = allTopics.find((topic) => topic.id === reviewCompletionSummary.topicId);
    if (!completed) return null;
    return (
      allTopics
        .filter(
          (topic) =>
            topic.subjectId === completed.subjectId &&
            (topic.canonicalIndex ?? Number.MAX_SAFE_INTEGER) >
              (completed.canonicalIndex ?? Number.MAX_SAFE_INTEGER)
        )
        .sort(
          (a, b) =>
            (a.canonicalIndex ?? Number.MAX_SAFE_INTEGER) -
            (b.canonicalIndex ?? Number.MAX_SAFE_INTEGER)
        )[0] ?? null
    );
  }, [allTopics, nextItem, reviewCompletionSummary]);

  if (!reviewCompletionSummary) return null;

  const summary = reviewCompletionSummary;
  const unresolvedMistakes = errors.filter(
    (error) => error.topicId === summary.topicId && !error.isResolved
  ).length;
  const nextTopic = nextItem?.topic ?? sequentialNextTopic;
  const nextReason = nextItem?.flagReason ?? (nextTopic ? 'Next curriculum topic' : 'No additional topic queued');

  const handleContinue = () => {
    if (!nextTopic) {
      dismissReviewCompletion();
      setCurrentScreen(summary.subjectId.startsWith('subj-math') ? 'mathematics' : 'today');
      return;
    }

    const dedicatedScreen = getDedicatedMathScreen(nextTopic.id);
    dismissReviewCompletion();
    if (dedicatedScreen) {
      setCurrentScreen(dedicatedScreen as any);
      return;
    }
    startReview(nextTopic, nextItem?.recommendedAction || 'Practice Problems');
  };

  const handleBack = () => {
    dismissReviewCompletion();
    setCurrentScreen(summary.subjectId === 'subj-math-algebra' ? 'algebra' : 'today');
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-complete-title"
    >
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Review complete</p>
              <h2 id="review-complete-title" className="text-xl font-black text-slate-900 mt-0.5">
                {summary.topicName}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Your result has been saved to the canonical mastery record.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismissReviewCompletion}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close review summary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] uppercase tracking-wide font-bold text-slate-500">Score</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{summary.scorePercent}%</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] uppercase tracking-wide font-bold text-slate-500">Questions</span>
              <div className="text-lg font-black text-slate-900 mt-1">
                {summary.questionsCorrect}/{summary.questionsAttempted}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] uppercase tracking-wide font-bold text-slate-500">Time</span>
              <div className="text-lg font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <AppArtwork name="timer" inline className="w-4 h-4 text-slate-400" /> {summary.timeSpentMinutes}m
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="text-[11px] uppercase tracking-wide font-bold text-slate-500">Next review</span>
              <div className="text-sm font-black text-slate-900 mt-1 flex items-center gap-1.5">
                <AppArtwork name="calendar" inline className="w-4 h-4 text-slate-400" /> {summary.nextReviewDate}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-blue-900">
              <AppArtwork name="target" inline className="w-4 h-4" /> Mastery update
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-blue-950">
              <span className="font-semibold">
                {summary.previousMastery ? MASTERY_LABELS[summary.previousMastery] : 'Not rated'}
              </span>
              <ArrowRight className="w-4 h-4 text-blue-500" />
              <span className="font-black">{MASTERY_LABELS[summary.newMastery]}</span>
              {unresolvedMistakes > 0 && (
                <span className="ml-auto text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                  {unresolvedMistakes} unresolved mistake{unresolvedMistakes === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Next recommended</div>
            {nextTopic ? (
              <>
                <div className="mt-1.5 font-black text-slate-900">{nextTopic.name}</div>
                <div className="text-sm text-slate-500 mt-1">{nextReason}</div>
              </>
            ) : (
              <div className="mt-1.5 text-sm text-slate-600">Your current priority queue is clear.</div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 flex items-center justify-center gap-2"
            >
              <AppArtwork name="cycle" inline className="w-4 h-4" /> {summary.subjectId === 'subj-math-algebra' ? 'Back to Algebra' : 'Back to Today'}
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black flex items-center justify-center gap-2 shadow-sm"
            >
              {nextTopic ? 'Continue to Next' : 'Return to Mathematics'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
