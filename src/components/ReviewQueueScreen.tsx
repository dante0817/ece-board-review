import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { DailyForgettingCurveCard } from './DailyForgettingCurveCard';
import { QuestionSpacedRepetitionQueue } from './QuestionSpacedRepetitionQueue';
import { formatReviewDate } from '../utils/masteryCalculator';
import { Play } from 'lucide-react';

export const ReviewQueueScreen: React.FC = () => {
  const {
    allDueOrOverdueTopics,
    dailyForgettingCurveOverview,
    startForgettingCurveReview,
    startReview,
    openTopicDrawer,
    currentDateStr,
  } = useReview();

  const [activeTab, setActiveTab] = useState<'questions' | 'forgetting_curve' | 'all_scheduled'>('questions');

  const {
    overallAverageRetention,
    criticalTopicsCount,
    optimalReviewCount,
    suggestions,
  } = dailyForgettingCurveOverview;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <FeatureIcon name="queue" />
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                Review Queue &amp; Spaced Repetition
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-medium">
                Automatic spaced repetition scheduling powered by question difficulty and practice recency.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'questions'
                ? 'bg-stone-900 text-amber-400 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <AppArtwork name="flame" inline className="w-3.5 h-3.5 text-amber-500" />
            <span>Questions Repetition</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('forgetting_curve')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'forgetting_curve'
                ? 'bg-stone-900 text-amber-400 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <AppArtwork name="brain" inline className="w-3.5 h-3.5" />
            <span>Topics Decay Curve ({suggestions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all_scheduled')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'all_scheduled'
                ? 'bg-stone-900 text-amber-400 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <AppArtwork name="exam" inline className="w-3.5 h-3.5" />
            <span>Topics Due ({allDueOrOverdueTopics.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'questions' ? (
        <QuestionSpacedRepetitionQueue />
      ) : activeTab === 'forgetting_curve' ? (
        <DailyForgettingCurveCard />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span>Topic Name &amp; Syllabus Area</span>
            <span>Schedule &amp; Actions</span>
          </div>

          <div className="divide-y divide-stone-100">
            {allDueOrOverdueTopics.length > 0 ? (
              allDueOrOverdueTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-4 hover:bg-stone-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openTopicDrawer(topic)}
                        className="font-bold text-stone-900 text-sm hover:text-amber-600 text-left transition-colors cursor-pointer"
                      >
                        {topic.name}
                      </button>
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded-full border border-rose-200">
                        Due
                      </span>
                      {topic.isHighPriority && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-200">
                          High Board Priority
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 mt-1 flex items-center gap-3">
                      <span>
                        Mastery:{' '}
                        <strong className="text-stone-700">
                          {topic.mastery ? `Level ${topic.mastery}/5` : 'L1'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>Reviews: {topic.reviewCount}</span>
                      <span>•</span>
                      <span>Next Due: {formatReviewDate(topic.nextReviewDate, currentDateStr)}</span>
                      <span>•</span>
                      <span>Interval: {topic.intervalDays || 1}d</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => openTopicDrawer(topic)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <AppArtwork name="book" inline className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => startReview(topic, 'Practice Problems')}
                      className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Review Now</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-stone-400">
                <AppArtwork name="timer" inline className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="font-medium text-stone-700">No scheduled reviews due right now!</p>
                <p className="text-xs mt-1">All spaced repetition calendar intervals are currently up-to-date.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
