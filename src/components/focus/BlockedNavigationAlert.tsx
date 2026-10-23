import { AppArtwork } from '../common/AppArtwork';
import React, { useEffect, useState } from 'react';
import { useReview, ScreenType } from '../../context/ReviewContext';
import { Unlock, X } from 'lucide-react';

export const BlockedNavigationAlert: React.FC = () => {
  const {
    blockedNavigationAttempt,
    dismissBlockedNavigation,
    unlockAndNavigateScreen,
    deepFocusTimeRemaining,
  } = useReview();

  const [confirmUnlock, setConfirmUnlock] = useState(false);

  // Auto-dismiss after 7 seconds if undisturbed
  useEffect(() => {
    if (!blockedNavigationAttempt) {
      setConfirmUnlock(false);
      return;
    }
    const timer = setTimeout(() => {
      dismissBlockedNavigation();
    }, 7000);

    return () => clearTimeout(timer);
  }, [blockedNavigationAttempt, dismissBlockedNavigation]);

  if (!blockedNavigationAttempt) return null;

  const minutesLeft = Math.floor(deepFocusTimeRemaining / 60);
  const secondsLeft = deepFocusTimeRemaining % 60;
  const formattedTime = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  const formatScreenName = (screen: string): string => {
    switch (screen) {
      case 'rational-expressions':
        return 'Rational Algebraic Expressions';
      case 'real-numbers':
        return 'Real Numbers & Number Systems';
      case 'linear-equations':
        return 'Linear Equations in One & Two Variables';
      case 'quadratic-equations':
        return 'Quadratic Equations';
      case 'functions':
        return 'Relations & Functions';
      case 'algebra':
        return 'Foundation Mathematics: Algebra';
      case 'mathematics':
        return 'Mathematics Curriculum';
      case 'today':
        return "Today's Study Queue";
      case 'errors':
        return 'Error Log & Weak Spots';
      case 'analytics':
        return 'Analytics & Mastery Dashboard';
      case 'board-exam':
        return 'Board Readiness Overview';
      default:
        return screen.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const handleUnlockAndGo = () => {
    unlockAndNavigateScreen(blockedNavigationAttempt.targetScreen as ScreenType);
  };

  return (
    <div
      id="blocked-navigation-alert"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/40 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 animate-pulse app-artwork-tile">
              <AppArtwork name="padlock" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Deep Focus Mode Active
                </span>
                <span className="font-mono text-[11px] font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-800/60">
                  {formattedTime} left
                </span>
              </div>
              <p className="text-[12px] text-slate-300 mt-1 leading-snug">
                Screen navigation is currently locked to keep you focused on{' '}
                <strong className="text-indigo-200">
                  {formatScreenName(blockedNavigationAttempt.currentScreen)}
                </strong>
                .
              </p>
            </div>
          </div>
          <button
            id="dismiss-blocked-nav-btn"
            type="button"
            onClick={dismissBlockedNavigation}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Row */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          {confirmUnlock ? (
            <div className="w-full flex items-center justify-between gap-2 animate-in fade-in">
              <span className="text-[11px] text-rose-300 font-medium">
                End Deep Focus block early?
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmUnlock(false)}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="confirm-unlock-nav-btn"
                  type="button"
                  onClick={handleUnlockAndGo}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <Unlock className="w-3 h-3" /> Unlock & Go
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                id="stay-focused-btn"
                type="button"
                onClick={dismissBlockedNavigation}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <AppArtwork name="padlock" inline className="w-3 h-3" /> Stay Focused
              </button>
              <button
                id="request-unlock-btn"
                type="button"
                onClick={() => setConfirmUnlock(true)}
                className="px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Unlock className="w-3 h-3 text-slate-400" />
                <span>Switch anyway</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
