import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { useExclusiveDropdown } from '../hooks/useExclusiveDropdown';
import { useReview } from '../context/ReviewContext';
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface PomodoroTimerWidgetProps {
  theme?: 'light' | 'dark';
}

export const PomodoroTimerWidget: React.FC<PomodoroTimerWidgetProps> = ({
  theme = 'light',
}) => {
  const {
    activeSessionSeconds,
    isSessionRunning,
    pauseActiveSession,
    resumeActiveSession,
    pomodoro,
    togglePomodoro,
    setPomodoroCyclePreset,
    setPomodoroWorkMinutes,
    setPomodoroRestMinutes,
    switchPomodoroPhase,
    resetPomodoroPhaseTimer,
    togglePomodoroSound,
    togglePomodoroAutoSwitch,
  } = useReview();

  const [isConfigOpen, setIsConfigOpen] = useExclusiveDropdown();
  const [customWork, setCustomWork] = useState(pomodoro.workMinutes);
  const [customRest, setCustomRest] = useState(pomodoro.restMinutes);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isDark = theme === 'dark';

  // Calculate percentage of phase elapsed
  const totalPhaseSeconds =
    (pomodoro.phase === 'work' ? pomodoro.workMinutes : pomodoro.restMinutes) * 60;
  const elapsedInPhase = Math.max(0, totalPhaseSeconds - pomodoro.secondsLeft);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((elapsedInPhase / Math.max(1, totalPhaseSeconds)) * 100))
  );

  const isStandardPreset = pomodoro.workMinutes === 25 && pomodoro.restMinutes === 5;
  const isExtendedPreset = pomodoro.workMinutes === 50 && pomodoro.restMinutes === 10;

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setPomodoroCyclePreset(customWork, customRest);
    setIsConfigOpen(false);
  };

  return (
    <div
      id="pomodoro-timer-widget"
      className={`rounded-2xl border transition-all ${
        isDark
          ? 'bg-stone-950/80 border-stone-800 text-stone-100'
          : 'bg-stone-50/90 border-stone-200 text-stone-900'
      } p-5 sm:p-6 mb-6`}
    >
      {/* Mode Selector Header */}
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-stone-200/60 dark:border-stone-800">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-200/70 dark:bg-stone-900 text-xs font-semibold">
          <button
            type="button"
            onClick={() => pomodoro.enabled && togglePomodoro()}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              !pomodoro.enabled
                ? isDark
                  ? 'bg-stone-800 text-white shadow-xs font-bold'
                  : 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
            <span>Stopwatch</span>
          </button>

          <button
            type="button"
            id="pomodoro-mode-tab-btn"
            onClick={() => !pomodoro.enabled && togglePomodoro()}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              pomodoro.enabled
                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
            <span>Pomodoro (25/5m)</span>
            {pomodoro.enabled && (
              <span className="w-2 h-2 rounded-full bg-stone-950 animate-pulse ml-0.5" />
            )}
          </button>
        </div>

        {/* Sound & Auto-advance controls */}
        {pomodoro.enabled && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={togglePomodoroSound}
              className={`p-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                isDark
                  ? pomodoro.soundEnabled
                    ? 'text-amber-400 hover:bg-stone-800'
                    : 'text-stone-600 hover:bg-stone-800'
                  : pomodoro.soundEnabled
                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                  : 'text-stone-400 hover:bg-stone-200/60'
              }`}
              title={pomodoro.soundEnabled ? 'Chime sound is ON' : 'Chime sound is MUTED'}
            >
              {pomodoro.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className={`p-2 rounded-lg transition-colors cursor-pointer text-xs ${
                isConfigOpen
                  ? 'bg-amber-400/20 text-amber-600'
                  : isDark
                  ? 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  : 'text-stone-500 hover:bg-stone-200/60 hover:text-stone-800'
              }`}
              title="Configure Pomodoro cycle times"
            >
              <AppArtwork name="gear" inline className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Cycle Configuration Panel (collapsible) */}
      {pomodoro.enabled && isConfigOpen && (
        <div
          className={`my-4 p-4 rounded-xl border text-xs animate-in slide-in-from-top-2 duration-200 ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold uppercase tracking-wider text-[11px] text-stone-500 dark:text-stone-400">
              Pomodoro Cycle Settings
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              Current: {pomodoro.workMinutes}m Focus / {pomodoro.restMinutes}m Rest
            </span>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setPomodoroCyclePreset(25, 5)}
              className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                isStandardPreset
                  ? 'border-amber-400 bg-amber-500/15 font-bold text-amber-900 dark:text-amber-300'
                  : isDark
                  ? 'border-stone-800 hover:bg-stone-800/80 text-stone-300'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="font-semibold text-xs">25 / 5 min</div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">Standard Board Exam</div>
            </button>

            <button
              type="button"
              onClick={() => setPomodoroCyclePreset(50, 10)}
              className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                isExtendedPreset
                  ? 'border-amber-400 bg-amber-500/15 font-bold text-amber-900 dark:text-amber-300'
                  : isDark
                  ? 'border-stone-800 hover:bg-stone-800/80 text-stone-300'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="font-semibold text-xs">50 / 10 min</div>
              <div className="text-[10px] text-stone-500 dark:text-stone-400">Deep Work Marathon</div>
            </button>

            <div className="col-span-2 sm:col-span-1 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-600 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={pomodoro.autoSwitch}
                  onChange={togglePomodoroAutoSwitch}
                  className="rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                />
                <span>Auto-start next phase</span>
              </label>
            </div>
          </div>

          {/* Custom Duration Form */}
          <form onSubmit={handleApplyCustom} className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-stone-500 dark:text-stone-400">Work (min):</label>
              <input
                type="number"
                min="5"
                max="90"
                value={customWork}
                onChange={(e) => setCustomWork(Math.max(1, Number(e.target.value)))}
                className={`w-16 px-2 py-1 rounded-md border text-center font-bold text-xs ${
                  isDark ? 'bg-stone-950 border-stone-700' : 'bg-stone-50 border-stone-200'
                }`}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-stone-500 dark:text-stone-400">Rest (min):</label>
              <input
                type="number"
                min="1"
                max="30"
                value={customRest}
                onChange={(e) => setCustomRest(Math.max(1, Number(e.target.value)))}
                className={`w-16 px-2 py-1 rounded-md border text-center font-bold text-xs ${
                  isDark ? 'bg-stone-950 border-stone-700' : 'bg-stone-50 border-stone-200'
                }`}
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-amber-400 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-stone-950 font-bold rounded-md text-xs transition-colors cursor-pointer"
            >
              Set Custom Cycle
            </button>
          </form>
        </div>
      )}

      {/* Main Timer Display Section */}
      {pomodoro.enabled ? (
        <div className="mt-5 space-y-4">
          {/* Phase Badge & Completed Pomodoro tally */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {pomodoro.phase === 'work' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <AppArtwork name="flame" inline className="w-3.5 h-3.5 fill-current text-amber-500" />
                  <span>Work Interval ({pomodoro.workMinutes}m)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  <AppArtwork name="coffee" inline className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Rest Interval ({pomodoro.restMinutes}m Break)</span>
                </span>
              )}

              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {pomodoro.phase === 'work'
                  ? 'Focus: Solve practice problems'
                  : 'Break: Step away & relax your eyes'}
              </span>
            </div>

            {/* Completed Pomodoro Tomatoes */}
            <div className="flex items-center gap-1.5 bg-stone-200/50 dark:bg-stone-900 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-800">
              <span className="text-xs">🍅</span>
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 font-mono">
                {pomodoro.completedCycles}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                {pomodoro.completedCycles === 1 ? 'cycle' : 'cycles'} done
              </span>
            </div>
          </div>

          {/* Big Countdown Timer */}
          <div className="text-center py-2">
            <div className="text-5xl sm:text-6xl font-mono font-extrabold tracking-wider text-stone-900 dark:text-white">
              {formatTimer(pomodoro.secondsLeft)}
            </div>
            <div className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-1">
              {pomodoro.phase === 'work' ? 'Time left in work session' : 'Time left in rest break'}
            </div>
          </div>

          {/* Phase Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  pomodoro.phase === 'work' ? 'bg-amber-400' : 'bg-indigo-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 font-mono">
              <span>{progressPercent}% elapsed</span>
              <span>
                {formatTimer(elapsedInPhase)} / {formatTimer(totalPhaseSeconds)}
              </span>
            </div>
          </div>

          {/* Timer Action Buttons */}
          <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
            {/* Play / Pause */}
            <button
              type="button"
              onClick={isSessionRunning ? pauseActiveSession : resumeActiveSession}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                isSessionRunning
                  ? isDark
                    ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                    : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md font-extrabold'
              }`}
            >
              {isSessionRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Timer</span>
                </>
              )}
            </button>

            {/* Switch / Skip Phase */}
            <button
              type="button"
              onClick={() => switchPomodoroPhase()}
              className={`px-3 py-2.5 rounded-xl font-semibold text-xs border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'border-stone-700 hover:bg-stone-800 text-stone-300'
                  : 'border-stone-300 hover:bg-stone-100 text-stone-700'
              }`}
              title={`Skip immediately to ${pomodoro.phase === 'work' ? 'Rest' : 'Work'} phase`}
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>{pomodoro.phase === 'work' ? 'Switch to Rest (5m)' : 'Switch to Work (25m)'}</span>
            </button>

            {/* Reset Phase Timer */}
            <button
              type="button"
              onClick={resetPomodoroPhaseTimer}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 ${
                isDark ? 'border-stone-800 hover:bg-stone-800' : 'border-stone-200 hover:bg-stone-100'
              }`}
              title="Reset current phase countdown"
            >
              <AppArtwork name="cycle" inline className="w-4 h-4" />
            </button>
          </div>

          {/* Cumulative Session Time Footer */}
          <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5">
              <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
              <span>Total Session Elapsed:</span>
              <strong className="font-mono text-stone-800 dark:text-stone-200 font-bold">
                {formatTimer(activeSessionSeconds)}
              </strong>
            </span>

            <span className="text-[11px]">
              Preset: <strong>{pomodoro.workMinutes}/{pomodoro.restMinutes}m</strong>
            </span>
          </div>
        </div>
      ) : (
        /* Standard Stopwatch Display (when Pomodoro is disabled) */
        <div className="mt-4 text-center">
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-wider text-stone-900 dark:text-white py-2">
            {formatTimer(activeSessionSeconds)}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mb-4">
            Standard elapsed review duration
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={isSessionRunning ? pauseActiveSession : resumeActiveSession}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSessionRunning
                  ? isDark
                    ? 'border border-stone-700 hover:bg-stone-800 text-stone-200'
                    : 'border border-stone-300 hover:bg-stone-100 text-stone-700'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold'
              }`}
            >
              {isSessionRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Resume
                </>
              )}
            </button>

            <button
              type="button"
              onClick={togglePomodoro}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
                  : 'border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-500" />
              <span>Switch to 25/5 Pomodoro</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
