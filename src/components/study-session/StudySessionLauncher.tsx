import { AppArtwork } from '../common/AppArtwork';
import { FeatureIcon } from '../common/FeatureIcon';
import React, { useEffect, useRef } from 'react';
import { useExclusiveDropdown } from '../../hooks/useExclusiveDropdown';
import { ChevronDown } from 'lucide-react';
import { useReview } from '../../context/ReviewContext';

interface StudySessionLauncherProps {
  compact?: boolean;
  inverted?: boolean;
  onAction?: () => void;
}

const formatClock = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;
};

export const StudySessionLauncher: React.FC<StudySessionLauncherProps> = ({
  compact = false,
  inverted = false,
  onAction,
}) => {
  const {
    pomodoro,
    isFocusMode,
    toggleFocusMode,
    isDeepFocusActive,
    deepFocusTimeRemaining,
    openDeepFocusModal,
    openPomodoroModal,
  } = useReview();
  const [open, setOpen] = useExclusiveDropdown();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const sessionLabel = isDeepFocusActive
    ? `Deep ${formatClock(deepFocusTimeRemaining)}`
    : pomodoro.isRunning
      ? `${formatClock(pomodoro.secondsLeft)}`
      : isFocusMode
        ? 'Focus On'
        : 'Study Session';

  const finish = (action: () => void) => {
    action();
    setOpen(false);
    onAction?.();
  };

  const buttonClass = inverted
    ? 'sidebar-button sidebar-tool-button w-full justify-between px-3 py-2'
    : `px-2.5 sm:px-3 py-1.5 border shadow-2xs ${
        isDeepFocusActive
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300'
          : pomodoro.isRunning || isFocusMode
            ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
            : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
      }`;

  return (
    <div ref={ref} className={`relative ${inverted ? 'w-full' : ''}`}>
      <button
        id={inverted ? 'sidebar-study-session-launcher' : 'header-study-session-launcher'}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${buttonClass}`}
        title="Study session controls"
      >
        <div className="flex min-w-0 items-center gap-2">
          {isDeepFocusActive ? (
            <span className="icon-3d icon-3d--small icon-3d--violet app-artwork-tile" aria-hidden="true"><AppArtwork name="padlock" /></span>
          ) : (
            <FeatureIcon name="session" size="small" />
          )}
          <span className={`${compact ? 'hidden lg:inline ' : ''}truncate`}>{sessionLabel}</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 ${
            inverted ? 'bottom-full left-0 mb-2 mt-0' : 'right-0'
          }`}
        >
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-slate-100">Study Session</div>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Choose the amount of structure you need without changing your study engine.
            </p>
          </div>
          <div className="p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => finish(openPomodoroModal)}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              <FeatureIcon name="session" size="small" />
              <span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">Pomodoro Timer</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  {pomodoro.isRunning ? `Active · ${formatClock(pomodoro.secondsLeft)} remaining` : `${pomodoro.workMinutes}-minute focus blocks`}
                </span>
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => finish(toggleFocusMode)}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <span className={`icon-3d icon-3d--small icon-3d--amber app-artwork-tile ${isFocusMode ? 'app-artwork-off' : ''}`} aria-hidden="true"><AppArtwork name="eye" /></span>
              <span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  {isFocusMode ? 'Restore navigation and secondary controls.' : 'Hide the sidebar and nonessential distractions.'}
                </span>
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => finish(openDeepFocusModal)}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            >
              <span className="icon-3d icon-3d--small icon-3d--violet app-artwork-tile" aria-hidden="true"><AppArtwork name="padlock" /></span>
              <span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">Deep Focus</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  {isDeepFocusActive ? `Active · ${formatClock(deepFocusTimeRemaining)} remaining` : 'Lock screen switching and silence nonessential alerts.'}
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
