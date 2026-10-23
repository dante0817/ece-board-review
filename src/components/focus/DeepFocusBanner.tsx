import { AppArtwork } from '../common/AppArtwork';
import React from 'react';
import { useReview } from '../../context/ReviewContext';
import { BellOff, ChevronRight } from 'lucide-react';

export const DeepFocusBanner: React.FC = () => {
  const {
    isDeepFocusActive,
    deepFocusTimeRemaining,
    deepFocus,
    openDeepFocusModal,
    silencedNotifications,
  } = useReview();

  if (!isDeepFocusActive) return null;

  const minutesLeft = Math.floor(deepFocusTimeRemaining / 60);
  const secondsLeft = deepFocusTimeRemaining % 60;
  const formattedTime = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  const formatScreenName = (screen: string): string => {
    switch (screen) {
      case 'rational-expressions':
        return 'Rational Expressions';
      case 'real-numbers':
        return 'Real Numbers';
      case 'linear-equations':
        return 'Linear Equations';
      case 'quadratic-equations':
        return 'Quadratic Equations';
      case 'functions':
        return 'Relations & Functions';
      case 'algebra':
        return 'Algebra';
      case 'mathematics':
        return 'Math Curriculum';
      case 'today':
        return "Today's Queue";
      case 'errors':
        return 'Error Log';
      case 'analytics':
        return 'Analytics';
      case 'board-exam':
        return 'Board Readiness';
      default:
        return screen.replace(/-/g, ' ');
    }
  };

  return (
    <div
      id="deep-focus-active-banner"
      className="sticky top-0 z-30 w-full bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white border-b border-indigo-500/30 px-4 py-2 shadow-sm transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            <AppArtwork name="padlock" inline className="w-3 h-3 text-indigo-300" />
            <span className="hidden sm:inline">Deep Focus Mode</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300 truncate">
            <span className="hidden md:inline text-slate-400">Locked on:</span>
            <span className="font-semibold text-white truncate">
              {formatScreenName(deepFocus.lockedScreen)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {deepFocus.silencedCount > 0 && (
            <div
              className="hidden sm:flex items-center gap-1 text-[11px] text-purple-300 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-md"
              title={`${deepFocus.silencedCount} non-essential notification(s) silenced`}
            >
              <BellOff className="w-3 h-3" />
              <span>{deepFocus.silencedCount} silenced</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-slate-800 font-mono font-bold text-indigo-300">
            <AppArtwork name="timer" inline className="w-3 h-3 text-indigo-400" />
            <span>{formattedTime}</span>
          </div>

          <button
            id="deep-focus-banner-manage-btn"
            type="button"
            onClick={openDeepFocusModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer"
          >
            <span>Manage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
