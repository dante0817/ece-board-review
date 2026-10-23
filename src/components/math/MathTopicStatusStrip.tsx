import { AppArtwork } from '../common/AppArtwork';
import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useReview } from '../../context/ReviewContext';
import { formatShortReviewDate } from '../../utils/date';

interface Props {
  canonicalTopicId: string;
}

export const MathTopicStatusStrip: React.FC<Props> = ({ canonicalTopicId }) => {
  const { allTopics, errors, currentDateStr } = useReview();
  const topic = useMemo(() => allTopics.find((t) => t.id === canonicalTopicId), [allTopics, canonicalTopicId]);
  const unresolved = errors.filter((error) => error.topicId === canonicalTopicId && !error.isResolved).length;

  if (!topic) return null;

  const masteryLabel = topic.mastery == null
    ? 'Not started'
    : topic.mastery >= 5
      ? 'Mastered'
      : topic.mastery >= 4
        ? 'Proficient'
        : topic.mastery >= 3
          ? 'Developing'
          : 'Learning';

  const reviewLabel = !topic.nextReviewDate
    ? 'Not scheduled'
    : topic.nextReviewDate < currentDateStr
      ? `Overdue · ${formatShortReviewDate(topic.nextReviewDate)}`
      : topic.nextReviewDate === currentDateStr
        ? 'Due today'
        : `Next review · ${formatShortReviewDate(topic.nextReviewDate)}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      <Status icon={<CheckCircle2 className="w-4 h-4" />} label="Mastery" value={masteryLabel} accent="emerald" />
      <Status icon={<AppArtwork name="exam" inline className="w-4 h-4" />} label="Latest quiz" value={topic.latestScore == null ? '—' : `${topic.latestScore}%`} accent="blue" />
      <Status icon={<AlertTriangle className="w-4 h-4" />} label="Mistakes" value={`${unresolved} unresolved`} accent={unresolved ? 'rose' : 'slate'} />
      <Status icon={<AppArtwork name="calendar" inline className="w-4 h-4" />} label="Review" value={reviewLabel} accent={topic.nextReviewDate && topic.nextReviewDate <= currentDateStr ? 'amber' : 'slate'} />
    </div>
  );
};

const ACCENTS = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  amber: 'bg-amber-50 text-amber-800 border-amber-100',
  slate: 'bg-white text-slate-700 border-slate-200',
};

const Status: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: keyof typeof ACCENTS;
}> = ({ icon, label, value, accent }) => (
  <div className={`rounded-xl border p-3 ${ACCENTS[accent]}`}>
    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-bold opacity-75">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-sm font-black mt-1 truncate" title={value}>{value}</div>
  </div>
);
