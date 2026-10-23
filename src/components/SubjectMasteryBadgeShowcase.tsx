import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { Subject, TestRecord } from '../types';
import {
  BADGE_TIERS,
  calculateSubjectMasteryBadge,
  SubjectMasteryBadgeData,
  BadgeTierDefinition,
} from '../utils/subjectBadgeUtils';
import { SubjectMasteryBadge } from './SubjectMasteryBadge';
import { useReview } from '../context/ReviewContext';

interface SubjectMasteryBadgeShowcaseProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (subjectId: string) => void;
  testRecords: TestRecord[];
  className?: string;
}

export const SubjectMasteryBadgeShowcase: React.FC<SubjectMasteryBadgeShowcaseProps> = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  testRecords,
  className = '',
}) => {
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { startDeepStudySubject, pomodoro, isFocusMode } = useReview();

  // Compute badges for all subjects
  const allSubjectBadges: SubjectMasteryBadgeData[] = subjects.map((subj) =>
    calculateSubjectMasteryBadge(subj, testRecords)
  );

  // Current selected subject badge
  const selectedBadge =
    allSubjectBadges.find((b) => b.subjectId === selectedSubjectId) ||
    allSubjectBadges[0];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 1. Prominent Hero Badge for Active Subject */}
      {selectedBadge && (
        <SubjectMasteryBadge
          badgeData={selectedBadge}
          variant="hero"
          onClickCriteria={() => setIsCriteriaModalOpen(true)}
        />
      )}

      {/* 2. All Subjects Visual Mastery Badges Showcase Bar / Carousel */}
      <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
              <AppArtwork name="trophy" inline className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-stone-900">
                Board Subjects Mastery Badges
              </h3>
              <p className="text-xs text-stone-500">
                Earn Bronze, Silver, Gold, &amp; Platinum badges by solving practice questions correctly
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCriteriaModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
              <span>Badge Criteria &amp; Rules</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all cursor-pointer"
            >
              {isExpanded ? 'Collapse' : 'Show All Subjects'}
            </button>
          </div>
        </div>

        {/* Grid of Subject Badges */}
        {isExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {allSubjectBadges.map((badge) => {
              const isSelected = badge.subjectId === selectedSubjectId;
              const { tier } = badge;

              return (
                <div
                  key={badge.subjectId}
                  onClick={() => onSelectSubject(badge.subjectId)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                      : 'bg-stone-50/50 border-stone-200 hover:bg-white hover:border-stone-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top: Icon + Tier Pill */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border shadow-2xs ${tier.badgeBg} ${tier.borderColor} ${tier.textColor}`}
                      >
                        {tier.iconName === 'Crown' && <AppArtwork name="trophy" inline className="w-4 h-4" />}
                        {tier.iconName === 'Trophy' && <AppArtwork name="trophy" inline className="w-4 h-4" />}
                        {tier.iconName === 'Award' && <AppArtwork name="trophy" inline className="w-4 h-4" />}
                        {tier.iconName === 'Medal' && <AppArtwork name="trophy" inline className="w-4 h-4" />}
                        {tier.iconName === 'Shield' && <AppArtwork name="shield" inline className="w-4 h-4" />}
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${tier.pillBg} ${tier.pillText} ${tier.pillBorder}`}
                      >
                        {tier.name}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-amber-800 transition-colors">
                        {badge.subjectName}
                      </h4>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                        <strong className="text-stone-900 font-black">{badge.totalQuestionsCorrect}</strong> correct
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Progress bar to next tier */}
                  <div className="mt-3 pt-2 border-t border-stone-200/60 space-y-1">
                    <div className="flex justify-between text-[10px] text-stone-500">
                      <span>{badge.isMaxTier ? 'Max Tier' : `To ${badge.nextTier?.name}`}</span>
                      <span className="font-mono font-bold">
                        {badge.isMaxTier ? '100%' : `${badge.progressToNextTierPercent}%`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          tier.id === 'platinum'
                            ? 'bg-indigo-600'
                            : tier.id === 'gold'
                            ? 'bg-amber-500'
                            : tier.id === 'silver'
                            ? 'bg-slate-500'
                            : 'bg-amber-800'
                        }`}
                        style={{ width: `${badge.isMaxTier ? 100 : badge.progressToNextTierPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Deep Study button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectSubject(badge.subjectId);
                      startDeepStudySubject(badge.subjectId);
                    }}
                    className={`mt-2.5 w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                      pomodoro.activeSubjectId === badge.subjectId && pomodoro.isRunning && isFocusMode
                        ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500/30 font-black'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-100 hover:text-white'
                    }`}
                    title={`Start 25-minute Pomodoro Deep Study session for ${badge.subjectName}`}
                  >
                    <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {pomodoro.activeSubjectId === badge.subjectId && pomodoro.isRunning && isFocusMode
                        ? 'Focusing Now'
                        : 'Deep Study'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Tier Criteria Ladder Modal */}
      {isCriteriaModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                  <AppArtwork name="trophy" inline className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-stone-900 uppercase tracking-tight">
                    Subject Mastery Badge System
                  </h3>
                  <p className="text-xs text-stone-500">
                    Objective progression criteria based on practice questions solved correctly
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCriteriaModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Explanation Card */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-blue-950">
                  <AppArtwork name="target" inline className="w-4 h-4 text-blue-700" />
                  <span>How Subject Mastery Badges Work</span>
                </div>
                <p className="leading-relaxed text-blue-800">
                  Every correct question answered in topic drills, timed tests, past board exam quizzes, and practice mode counts toward that subject's mastery badge. Badges unlock automatically as your cumulative correct count rises.
                </p>
              </div>

              {/* Ladder Tiers */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-stone-500">
                  Mastery Tier Ladder
                </h4>

                {BADGE_TIERS.map((tierItem, index) => {
                  const isCurrentSelectedTier = selectedBadge?.tier.id === tierItem.id;

                  return (
                    <div
                      key={tierItem.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isCurrentSelectedTier
                          ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/20'
                          : 'border-stone-200 bg-stone-50/40'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 shadow-xs ${tierItem.badgeBg} ${tierItem.borderColor} ${tierItem.textColor}`}
                        >
                          {tierItem.iconName === 'Crown' && <AppArtwork name="trophy" inline className="w-6 h-6" />}
                          {tierItem.iconName === 'Trophy' && <AppArtwork name="trophy" inline className="w-6 h-6" />}
                          {tierItem.iconName === 'Award' && <AppArtwork name="trophy" inline className="w-6 h-6" />}
                          {tierItem.iconName === 'Medal' && <AppArtwork name="trophy" inline className="w-6 h-6" />}
                          {tierItem.iconName === 'Shield' && <AppArtwork name="shield" inline className="w-6 h-6" />}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierItem.pillBg} ${tierItem.pillText} ${tierItem.pillBorder}`}
                            >
                              Tier {index}: {tierItem.name}
                            </span>
                            <span className="text-xs font-bold text-stone-900">
                              {tierItem.rankTitle}
                            </span>
                            {isCurrentSelectedTier && (
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                                {selectedBadge.subjectName} Current Tier
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {tierItem.description}
                          </p>
                          <p className="text-[11px] text-stone-500 font-medium">
                            <strong className="text-stone-700">Competency:</strong> {tierItem.perks}
                          </p>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-stone-200 sm:pl-4 shrink-0">
                        <div className="text-xs font-mono font-bold text-stone-900">
                          {tierItem.maxCorrect === null
                            ? `${tierItem.minCorrect}+ Correct Qs`
                            : `${tierItem.minCorrect} – ${tierItem.maxCorrect} Correct Qs`}
                        </div>
                        <div className="text-[10px] text-stone-500 uppercase font-medium">
                          Required Practice
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl flex items-center justify-between">
              <div className="text-xs text-stone-500">
                Current Subject: <strong className="text-stone-800">{selectedBadge?.subjectName}</strong> ({selectedBadge?.totalQuestionsCorrect} correct)
              </div>

              <button
                type="button"
                onClick={() => setIsCriteriaModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
