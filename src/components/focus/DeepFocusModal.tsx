import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { useReview, ScreenType } from '../../context/ReviewContext';
import { Unlock, BellOff, AlertCircle, X, Plus } from 'lucide-react';

export const DeepFocusModal: React.FC = () => {
  const {
    currentScreen,
    deepFocus,
    isDeepFocusActive,
    deepFocusTimeRemaining,
    startDeepFocus,
    stopDeepFocus,
    extendDeepFocus,
    isDeepFocusModalOpen,
    closeDeepFocusModal,
    silencedNotifications,
  } = useReview();

  const [selectedPreset, setSelectedPreset] = useState<number>(25);
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  if (!isDeepFocusModalOpen) return null;

  const presets = [
    { mins: 15, label: '15m Quick Drill', desc: 'Formula memorization & active recall' },
    { mins: 25, label: '25m Standard Block', desc: 'Classic Pomodoro focused study interval' },
    { mins: 45, label: '45m Board Problem Set', desc: 'In-depth multi-step engineering derivations' },
    { mins: 60, label: '60m Mock Exam Drill', desc: 'High-yield exam questions under timed pressure' },
    { mins: 90, label: '90m Intensive Cram', desc: 'Deep dive without any context switches' },
  ];

  const getScreenDisplayName = (screen: string): string => {
    switch (screen) {
      case 'rational-expressions':
        return 'Rational Algebraic Expressions';
      case 'real-numbers':
        return 'Real Numbers & Number Systems';
      case 'linear-equations':
        return 'Linear Equations in One & Two Variables';
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

  const minutesLeft = Math.floor(deepFocusTimeRemaining / 60);
  const secondsLeft = deepFocusTimeRemaining % 60;
  const formattedTime = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

  const totalDurationSeconds = Math.max(1, deepFocus.durationMinutes * 60);
  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalDurationSeconds - deepFocusTimeRemaining) / totalDurationSeconds) * 100)
  );

  const handleStart = () => {
    const mins = useCustom ? customMinutes : selectedPreset;
    startDeepFocus(mins);
    setShowExitConfirm(false);
  };

  const handleConfirmExit = () => {
    stopDeepFocus();
    setShowExitConfirm(false);
    closeDeepFocusModal();
  };

  return (
    <div
      id="deep-focus-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm transition-all"
      onClick={closeDeepFocusModal}
    >
      <div
        id="deep-focus-modal-dialog"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div
              className={(`w-9 h-9 rounded-2xl flex items-center justify-center transition-colors ${
                isDeepFocusActive
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50'
              }`) + " app-artwork-tile"}
            >
              {isDeepFocusActive ? <AppArtwork name="padlock" /> : <AppArtwork name="shield" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Deep Focus Mode
                {isDeepFocusActive && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lock navigation & silence non-essential interruptions
              </p>
            </div>
          </div>
          <button
            id="deep-focus-modal-close-btn"
            type="button"
            onClick={closeDeepFocusModal}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Active State View */}
          {isDeepFocusActive ? (
            <div className="space-y-6">
              {/* Circular / Big Timer Display */}
              <div className="flex flex-col items-center justify-center py-4 px-6 rounded-2xl bg-gradient-to-b from-indigo-50/70 via-purple-50/40 to-transparent dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-transparent border border-indigo-100/80 dark:border-indigo-900/50">
                <div className="relative flex items-center justify-center w-36 h-36">
                  {/* SVG progress circle */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="6"
                      className="text-slate-200 dark:text-slate-800 fill-none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - progressPercent / 100)}
                      strokeLinecap="round"
                      className="text-indigo-600 dark:text-indigo-400 fill-none transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {formattedTime}
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                      <AppArtwork name="padlock" inline className="w-3 h-3" /> Locked
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Locked to current screen</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {getScreenDisplayName(deepFocus.lockedScreen || currentScreen)}
                  </div>
                </div>
              </div>

              {/* Status Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <AppArtwork name="padlock" inline className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-medium">Screen Switching</span>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Locked for {minutesLeft}m {secondsLeft}s
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                    <BellOff className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-medium">Non-Essential Alerts</span>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    {deepFocus.silencedCount} Silenced
                  </div>
                </div>
              </div>

              {/* Extend Session Controls */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Extend Focus Duration
                </label>
                <div className="flex items-center gap-2">
                  <button
                    id="deep-focus-extend-5m-btn"
                    type="button"
                    onClick={() => extendDeepFocus(5)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" /> +5 min
                  </button>
                  <button
                    id="deep-focus-extend-15m-btn"
                    type="button"
                    onClick={() => extendDeepFocus(15)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" /> +15 min
                  </button>
                  <button
                    id="deep-focus-extend-30m-btn"
                    type="button"
                    onClick={() => extendDeepFocus(30)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-500" /> +30 min
                  </button>
                </div>
              </div>

              {/* Exit or Confirm Exit */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {showExitConfirm ? (
                  <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                          Exit Deep Focus Early?
                        </div>
                        <div className="text-[11px] text-rose-700 dark:text-rose-300/90 mt-0.5">
                          Screen switching will unlock and silenced notifications will be restored.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowExitConfirm(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      >
                        Stay in Focus
                      </button>
                      <button
                        id="deep-focus-confirm-exit-btn"
                        type="button"
                        onClick={handleConfirmExit}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs"
                      >
                        Yes, Unlock & Exit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      id="deep-focus-exit-prompt-btn"
                      type="button"
                      onClick={() => setShowExitConfirm(true)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" /> End Deep Focus Session Early
                    </button>
                    <button
                      type="button"
                      onClick={closeDeepFocusModal}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      Keep Working
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Inactive State: Duration Selection */
            <div className="space-y-5">
              {/* How it works info card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2.5">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold text-xs">
                  <AppArtwork name="star" inline className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  What happens when Deep Focus is enabled?
                </div>
                <ul className="text-[11px] text-indigo-950/80 dark:text-indigo-200/80 space-y-1.5 leading-relaxed pl-1">
                  <li className="flex items-start gap-2">
                    <AppArtwork name="padlock" inline className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Locked Screen:</strong> Prevents navigating away from{' '}
                      <span className="font-semibold underline underline-offset-2">
                        {getScreenDisplayName(currentScreen)}
                      </span>{' '}
                      for the set duration to protect your study rhythm.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BellOff className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Distraction-Free:</strong> Suppresses non-essential study prompts, spaced repetition nudges, and popups.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AppArtwork name="timer" inline className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>Automated Tracking:</strong> Studied minutes are automatically logged to your daily study target upon completion.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Presets List */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Focus Duration
                </label>
                <div className="space-y-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.mins}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(preset.mins);
                        setUseCustom(false);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        !useCustom && selectedPreset === preset.mins
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                            !useCustom && selectedPreset === preset.mins
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {preset.mins}m
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {preset.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {preset.desc}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            !useCustom && selectedPreset === preset.mins
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {!useCustom && selectedPreset === preset.mins && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Duration Slider */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setUseCustom(!useCustom)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {useCustom ? 'Use preset options instead' : 'Need a custom duration?'}
                </button>

                {useCustom && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Custom Minutes
                      </span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {customMinutes} minutes
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>5m</span>
                      <span>30m</span>
                      <span>60m</span>
                      <span>90m</span>
                      <span>120m</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeDeepFocusModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="start-deep-focus-confirm-btn"
                  type="button"
                  onClick={handleStart}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <AppArtwork name="padlock" inline className="w-3.5 h-3.5" />
                  Start {useCustom ? customMinutes : selectedPreset}m Deep Focus
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
