import { AppArtwork } from './common/AppArtwork';
import React from 'react';
import { Info } from 'lucide-react';
import { SubjectMasteryBadgeData, BadgeTierDefinition } from '../utils/subjectBadgeUtils';
import { useReview } from '../context/ReviewContext';

interface SubjectMasteryBadgeProps {
  badgeData: SubjectMasteryBadgeData;
  variant?: 'hero' | 'pill' | 'card' | 'mini';
  onClickCriteria?: () => void;
  className?: string;
}

const renderTierIcon = (iconName: string, className: string = 'w-5 h-5') => {
  switch (iconName) {
    case 'Crown':
      return <AppArtwork name="trophy" inline className={className} />;
    case 'Trophy':
      return <AppArtwork name="trophy" inline className={className} />;
    case 'Award':
      return <AppArtwork name="trophy" inline className={className} />;
    case 'Medal':
      return <AppArtwork name="trophy" inline className={className} />;
    case 'Shield':
    default:
      return <AppArtwork name="shield" inline className={className} />;
  }
};

export const SubjectMasteryBadge: React.FC<SubjectMasteryBadgeProps> = ({
  badgeData,
  variant = 'hero',
  onClickCriteria,
  className = '',
}) => {
  const { startDeepStudySubject, pomodoro, isFocusMode } = useReview();
  const { tier, totalQuestionsCorrect, nextTier, questionsToNextTier, progressToNextTierPercent, isMaxTier } =
    badgeData;

  // 1. MINI BADGE (for table rows, compact tags)
  if (variant === 'mini') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border shadow-2xs ${tier.pillBg} ${tier.pillText} ${tier.pillBorder} ${className}`}
        title={`${tier.name} Badge: ${totalQuestionsCorrect} practice questions answered correctly`}
      >
        {renderTierIcon(tier.iconName, 'w-3 h-3')}
        <span>{tier.name}</span>
      </span>
    );
  }

  // 2. PILL BADGE (for subject switcher tabs at the top)
  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${tier.pillBg} ${tier.pillText} ${tier.pillBorder} ${className}`}
        title={`${badgeData.subjectName} — ${tier.name} Tier (${totalQuestionsCorrect} correct questions)`}
      >
        {renderTierIcon(tier.iconName, 'w-3.5 h-3.5 shrink-0')}
        <span className="font-extrabold">{tier.name}</span>
        <span className="opacity-70 text-[10px] font-mono font-medium">
          {totalQuestionsCorrect} Qs
        </span>
      </span>
    );
  }

  // 3. CARD BADGE (for subject comparison grids)
  if (variant === 'card') {
    return (
      <div
        className={`rounded-xl border p-4 transition-all relative overflow-hidden bg-white hover:shadow-md ${tier.borderColor} ${className}`}
      >
        <div
          className={`absolute top-0 right-0 w-32 h-32 bg-radial from-current to-transparent opacity-10 pointer-events-none ${tier.textColor}`}
        />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${tier.badgeBg} ${tier.borderColor} ${tier.textColor}`}
            >
              {renderTierIcon(tier.iconName, 'w-5 h-5')}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${tier.pillBg} ${tier.pillText} ${tier.pillBorder}`}
                >
                  {tier.name} Tier
                </span>
                {isMaxTier && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-indigo-200">
                    <AppArtwork name="star" inline className="w-2.5 h-2.5" /> Apex
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-stone-900 mt-0.5">{badgeData.subjectName}</h4>
            </div>
          </div>

          <div className="text-right">
            <div className="text-base font-black font-mono text-stone-900">
              {totalQuestionsCorrect}
            </div>
            <div className="text-[10px] text-stone-500 font-medium uppercase tracking-tight">
              Correct Qs
            </div>
          </div>
        </div>

        {/* Progress bar to next tier */}
        <div className="space-y-1.5 mt-3 pt-3 border-t border-stone-100">
          <div className="flex justify-between text-[11px] text-stone-600">
            <span>
              {isMaxTier ? (
                <span className="font-semibold text-indigo-700 flex items-center gap-1">
                  <AppArtwork name="trophy" inline className="w-3 h-3 text-indigo-600" /> Max Tier Achieved
                </span>
              ) : (
                <>Next: <strong className="text-stone-800">{nextTier?.name}</strong></>
              )}
            </span>
            <span className="font-mono font-bold text-stone-700">
              {isMaxTier ? '100%' : `${progressToNextTierPercent}%`}
            </span>
          </div>

          <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200/80">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                tier.id === 'platinum'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600'
                  : tier.id === 'gold'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                  : tier.id === 'silver'
                  ? 'bg-gradient-to-r from-slate-400 to-slate-600'
                  : 'bg-gradient-to-r from-amber-700 to-orange-800'
              }`}
              style={{ width: `${isMaxTier ? 100 : progressToNextTierPercent}%` }}
            />
          </div>

          {!isMaxTier && nextTier && (
            <div className="flex justify-between items-center text-[10px] text-stone-500 font-medium">
              <span>{questionsToNextTier} more to unlock {nextTier.name}</span>
              <span className="font-mono">{totalQuestionsCorrect} / {nextTier.minCorrect}</span>
            </div>
          )}

          {/* Deep Study Pomodoro Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startDeepStudySubject(badgeData.subjectId);
            }}
            className={`w-full mt-2 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
              pomodoro.activeSubjectId === badgeData.subjectId && pomodoro.isRunning && isFocusMode
                ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500/40 font-black'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-100 hover:text-white'
            }`}
            title={`Enter Focus Mode & start Pomodoro timer for ${badgeData.subjectName}`}
          >
            <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {pomodoro.activeSubjectId === badgeData.subjectId && pomodoro.isRunning && isFocusMode
                ? 'Focusing Now'
                : 'Deep Study (25m)'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // 4. HERO BADGE (Featured on the Subjects screen header)
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs relative overflow-hidden transition-all bg-gradient-to-br ${tier.bgGradient} ${tier.borderColor} ${className}`}
    >
      {/* Decorative metallic aura */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/40 blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        {/* Left: Medal Emblem and Tier Details */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Custom Embossed Metallic Medal */}
          <div className="relative shrink-0">
            <div
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center border-2 shadow-md relative overflow-hidden ${tier.badgeBg} ${tier.borderColor}`}
              style={{
                boxShadow: `0 8px 20px -4px ${tier.accentHex}30, inset 0 2px 4px rgba(255,255,255,0.8)`,
              }}
            >
              {/* Metallic Sheen diagonal line */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 pointer-events-none" />

              <div
                className={`p-2.5 rounded-xl border flex items-center justify-center ${tier.pillBg} ${tier.pillBorder}`}
              >
                {renderTierIcon(tier.iconName, 'w-8 h-8 sm:w-9 sm:h-9 ' + tier.textColor)}
              </div>

              {/* Apex sparkle */}
              {isMaxTier && (
                <div className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-xs animate-pulse">
                  <AppArtwork name="star" inline className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* Micro Tier Ribbon */}
            <div className="absolute -bottom-2 inset-x-0 flex justify-center">
              <span
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border shadow-2xs ${tier.pillBg} ${tier.pillText} ${tier.pillBorder}`}
              >
                {tier.name}
              </span>
            </div>
          </div>

          {/* Badge Titles & Context */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tier.pillBg} ${tier.pillText} ${tier.pillBorder}`}
              >
                Mastery Badge System
              </span>
              {isMaxTier ? (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AppArtwork name="trophy" inline className="w-3 h-3 text-indigo-600" /> Apex Board Distiction
                </span>
              ) : (
                <span className="text-[10px] font-medium text-stone-500">
                  {tier.name} Tier Activated
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <span>{tier.rankTitle}</span>
            </h3>

            <p className="text-xs text-stone-600 max-w-md leading-relaxed">
              {tier.description}
            </p>
          </div>
        </div>

        {/* Right: Practice Stats & Progress to Next Tier */}
        <div className="bg-white/90 backdrop-blur-xs rounded-xl p-4 border border-stone-200/90 shadow-2xs min-w-[280px] sm:min-w-[340px] space-y-3">
          {/* Top Row: Correct Questions Count & Accuracy */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-stone-500 flex items-center gap-1">
                <AppArtwork name="target" inline className="w-3 h-3 text-blue-600" />
                <span>Practice Questions Solved</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black font-mono text-stone-900">
                  {totalQuestionsCorrect}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  {badgeData.accuracyPercent}% Accuracy
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => startDeepStudySubject(badgeData.subjectId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  pomodoro.activeSubjectId === badgeData.subjectId && pomodoro.isRunning && isFocusMode
                    ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-500/40 font-black'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
                title={`Enter Focus Mode & start Pomodoro timer for ${badgeData.subjectName}`}
              >
                <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  {pomodoro.activeSubjectId === badgeData.subjectId && pomodoro.isRunning && isFocusMode
                    ? 'Focusing Now'
                    : 'Deep Study (25m)'}
                </span>
              </button>

              {onClickCriteria && (
                <button
                  type="button"
                  onClick={onClickCriteria}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="View criteria ladder for Bronze, Silver, Gold, Platinum badges"
                >
                  <Info className="w-3.5 h-3.5 text-stone-500" />
                  <span>Tier Ladder</span>
                </button>
              )}
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
            <span>Topic Drills: <strong className="text-stone-800">{badgeData.topicDrillCorrect}</strong> correct</span>
            <span className="h-3 w-px bg-stone-200" />
            <span>Mock Tests: <strong className="text-stone-800">{badgeData.testCorrect}</strong> correct</span>
            <span className="h-3 w-px bg-stone-200" />
            <span>{badgeData.totalSessions} sessions</span>
          </div>

          {/* Tier Progression Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-stone-700 flex items-center gap-1">
                {isMaxTier ? (
                  <span className="text-indigo-700 flex items-center gap-1 font-extrabold">
                    <AppArtwork name="trophy" inline className="w-3.5 h-3.5 text-indigo-600" /> Platinum Tier (Highest Achieved)
                  </span>
                ) : (
                  <>
                    <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-amber-600" />
                    <span>Progress to {nextTier?.name} Badge</span>
                  </>
                )}
              </span>
              <span className="font-mono font-bold text-stone-900">
                {isMaxTier ? '100%' : `${progressToNextTierPercent}%`}
              </span>
            </div>

            <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  tier.id === 'platinum'
                    ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600'
                    : tier.id === 'gold'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                    : tier.id === 'silver'
                    ? 'bg-gradient-to-r from-slate-400 to-slate-600'
                    : 'bg-gradient-to-r from-amber-700 to-orange-700'
                }`}
                style={{ width: `${isMaxTier ? 100 : progressToNextTierPercent}%` }}
              />
            </div>

            {!isMaxTier && nextTier ? (
              <div className="flex justify-between items-center text-[11px] text-stone-500">
                <span className="font-medium">
                  Need <strong className="text-stone-900 font-bold">{questionsToNextTier}</strong> more correct answers
                </span>
                <span className="font-mono font-semibold">
                  {totalQuestionsCorrect} / {nextTier.minCorrect} Qs
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-indigo-700 font-medium">
                Distinction criteria fulfilled. Ready for PRC board topnotcher standards.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
