import { AppArtwork } from '../common/AppArtwork';
import React from 'react';
import { useReview } from '../../context/ReviewContext';


export const DeepFocusToggleButton: React.FC = () => {
  const {
    isDeepFocusActive,
    deepFocusTimeRemaining,
    openDeepFocusModal,
  } = useReview();

  const minutesLeft = Math.floor(deepFocusTimeRemaining / 60);
  const secondsLeft = deepFocusTimeRemaining % 60;
  const formattedTime = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  return (
    <button
      id="header-deep-focus-toggle-btn"
      type="button"
      onClick={openDeepFocusModal}
      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
        isDeepFocusActive
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/50 shadow-xs shadow-indigo-500/20'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      }`}
      title={
        isDeepFocusActive
          ? `Deep Focus Active: ${formattedTime} remaining (Click to manage)`
          : 'Deep Focus Mode: Lock screen navigation and silence non-essential notifications for a set duration'
      }
    >
      {isDeepFocusActive ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <AppArtwork name="padlock" inline className="w-3.5 h-3.5 text-white" />
          <span className="font-mono font-bold">{formattedTime}</span>
          <span className="hidden md:inline text-[10px] bg-white/20 px-1 rounded uppercase tracking-wider font-bold">
            Locked
          </span>
        </>
      ) : (
        <>
          <AppArtwork name="padlock" inline className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span className="hidden sm:inline">Deep Focus</span>
        </>
      )}
    </button>
  );
};
