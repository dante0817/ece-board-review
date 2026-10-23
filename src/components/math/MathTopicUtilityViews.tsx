import { AppArtwork } from '../common/AppArtwork';
import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useReview } from '../../context/ReviewContext';
import { formatShortReviewDate } from '../../utils/date';
import { ReferenceTopicQuiz } from './ReferenceTopicQuiz';

interface BaseProps {
  canonicalTopicId: string;
  title: string;
}

export const MathTopicQuizView: React.FC<BaseProps> = ({ canonicalTopicId, title }) => (
  <ReferenceTopicQuiz topicId={canonicalTopicId} title={title} />
);

export const MathTopicMistakesView: React.FC<BaseProps> = ({ canonicalTopicId, title }) => {
  const { errors } = useReview();
  const topicErrors = useMemo(
    () => errors.filter((error) => error.topicId === canonicalTopicId),
    [errors, canonicalTopicId]
  );
  const unresolved = topicErrors.filter((error) => !error.isResolved);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Mistake Remediation</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Review recorded errors for {title} before the next assessment.
          </p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${unresolved.length ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {unresolved.length} unresolved
        </span>
      </div>

      {topicErrors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-900 mt-3">No recorded mistakes for this canonical topic</h3>
          <p className="text-sm text-slate-500 mt-1">New errors captured during practice or review will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topicErrors.map((error) => (
            <div key={error.id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${error.isResolved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {error.isResolved ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{error.category}</span>
                    <span className="text-xs text-slate-400">Occurred {error.occurrenceCount}×</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{error.description}</p>
                  {error.misconceptionTag && (
                    <span className="inline-flex mt-2 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-[10px] font-bold text-rose-700">
                      Trap tag: {error.misconceptionTag}
                    </span>
                  )}
                  {error.solutionOrKeyFormula && (
                    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-700">
                      <span className="font-bold">Correction: </span>{error.solutionOrKeyFormula}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const MathTopicProgressView: React.FC<BaseProps> = ({ canonicalTopicId, title }) => {
  const { allTopics, currentDateStr } = useReview();
  const topic = useMemo(() => allTopics.find((t) => t.id === canonicalTopicId), [allTopics, canonicalTopicId]);

  if (!topic) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <p className="text-sm text-slate-500">Progress tracking for {title} is not yet linked to a canonical topic record.</p>
      </div>
    );
  }

  const mastery = topic.mastery ?? 0;
  const reviewState = !topic.nextReviewDate
    ? 'Not scheduled'
    : topic.nextReviewDate < currentDateStr
      ? 'Overdue'
      : topic.nextReviewDate === currentDateStr
        ? 'Due today'
        : `Next ${formatShortReviewDate(topic.nextReviewDate)}`;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-900">Progress</h2>
        <p className="text-sm text-slate-500 mt-0.5">Evidence from the canonical {title} mastery record.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric icon={<AppArtwork name="graph" inline className="w-4 h-4" />} label="Mastery" value={mastery ? `${mastery}/5` : 'Not rated'} />
        <Metric icon={<AppArtwork name="exam" inline className="w-4 h-4" />} label="Latest score" value={topic.latestScore == null ? '—' : `${topic.latestScore}%`} />
        <Metric icon={<AppArtwork name="cycle" inline className="w-4 h-4" />} label="Reviews" value={String(topic.reviewCount ?? 0)} />
        <Metric icon={<AppArtwork name="calendar" inline className="w-4 h-4" />} label="Review status" value={reviewState} />
      </div>
      {topic.recommendationNote && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-900">
          <span className="font-bold">Recommendation: </span>{topic.recommendationNote}
        </div>
      )}
    </div>
  );
};

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wide">
      {icon}
      <span>{label}</span>
    </div>
    <div className="mt-2 text-lg sm:text-xl font-black text-slate-900">{value}</div>
  </div>
);
