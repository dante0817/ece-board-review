import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect } from 'react';
import { useExclusiveDropdown } from '../hooks/useExclusiveDropdown';
import { useReview } from '../context/ReviewContext';
import { playPomodoroChime } from '../utils/soundEffects';
import { Play, Pause, SkipForward, Volume2, VolumeX, BellOff, X, Maximize2, Minimize2, Plus } from 'lucide-react';

export const PomodoroFocusTimer: React.FC = () => {
  const {
    pomodoro,
    startPomodoroTimer,
    pausePomodoroTimer,
    togglePomodoro,
    switchPomodoroPhase,
    resetPomodoroPhaseTimer,
    setPomodoroCyclePreset,
    setPomodoroWorkMinutes,
    setPomodoroRestMinutes,
    togglePomodoroSound,
    togglePomodoroAutoSwitch,
    logStudyDurationMinutes,
    pomodoroNotification,
    dismissPomodoroNotification,
    isPomodoroModalOpen,
    setIsPomodoroModalOpen,
    dailyTarget,
    activeSession,
    subjects,
    isDarkMode,
  } = useReview();

  // Floating pill state
  const [isFloatingMinimized, setIsFloatingMinimized] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches);
  const [isFloatingHidden, setIsFloatingHidden] = useState(false);

  // Settings & custom configuration modal within focus studio
  const [isSettingsTabOpen, setIsSettingsTabOpen] = useExclusiveDropdown();
  const [customWork, setCustomWork] = useState(pomodoro.workMinutes);
  const [customRest, setCustomRest] = useState(pomodoro.restMinutes);

  // Desktop notification permission status
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Selected topic tag for focus context
  const [selectedTopicName, setSelectedTopicName] = useState<string>(() => {
    return activeSession?.topic?.name || 'General Board Review';
  });

  // Scratchpad inside focus modal
  const [scratchpadText, setScratchpadText] = useState('');

  // Keep topic synced with activeSession if active
  useEffect(() => {
    if (activeSession?.topic?.name) {
      setSelectedTopicName(activeSession.topic.name);
    }
  }, [activeSession?.topic?.name]);

  // Unhide and expand floating timer if a deep study session was started for a specific subject
  useEffect(() => {
    if (pomodoro.activeSubjectId && pomodoro.isRunning) {
      setIsFloatingHidden(false);
      // An active session must not expand over mobile question controls.
      setIsFloatingMinimized(window.matchMedia('(max-width: 639px)').matches);
    }
  }, [pomodoro.activeSubjectId, pomodoro.isRunning]);

  // Request browser desktop notification permission
  const handleRequestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          new Notification('Study Notifications Enabled 🔔', {
            body: 'You will receive focus completion chimes and alerts for your ECE review sessions.',
          });
        }
      } catch {
        // ignore
      }
    }
  };

  const handleTestChime = (type: 'work-complete' | 'rest-complete') => {
    playPomodoroChime(type);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Phase math for circular ring
  const currentTotalPhaseSeconds =
    (pomodoro.phase === 'work' ? pomodoro.workMinutes : pomodoro.restMinutes) * 60;
  const elapsedInPhase = Math.max(0, currentTotalPhaseSeconds - pomodoro.secondsLeft);
  const progressRatio = Math.min(1, Math.max(0, elapsedInPhase / Math.max(1, currentTotalPhaseSeconds)));
  const progressPercent = Math.round(progressRatio * 100);

  // SVG Circular Ring properties
  const radius = 96;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const isRunning = Boolean(pomodoro.isRunning || (activeSession && !activeSession.isPaused));

  // Presets check
  const is25_5 = pomodoro.workMinutes === 25 && pomodoro.restMinutes === 5;
  const is50_10 = pomodoro.workMinutes === 50 && pomodoro.restMinutes === 10;
  const is15_3 = pomodoro.workMinutes === 15 && pomodoro.restMinutes === 3;

  const handleApplyCustomPreset = (e: React.FormEvent) => {
    e.preventDefault();
    setPomodoroCyclePreset(customWork, customRest);
    setIsSettingsTabOpen(false);
  };

  const handleAddFiveMinutes = () => {
    pomodoro.secondsLeft += 300;
  };

  const dailyMinutesTarget = dailyTarget.targetMinutes || 60;
  const dailyMinutesCompleted = dailyTarget.completedMinutesToday || 0;
  const dailyProgressPercent = Math.min(100, Math.round((dailyMinutesCompleted / Math.max(1, dailyMinutesTarget)) * 100));

  return (
    <>
      {/* 1. TOP FLOATING NOTIFICATION TOAST (Triggered upon completion) */}
      {pomodoroNotification && (
        <div
          id="pomodoro-completion-toast"
          className="fixed top-5 right-5 z-60 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300 shadow-2xl rounded-2xl overflow-hidden border border-amber-500/40 bg-stone-900/95 backdrop-blur-md text-stone-100 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  pomodoroNotification.phase === 'work'
                    ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/20'
                    : 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                }`}
              >
                {pomodoroNotification.phase === 'work' ? (
                  <AppArtwork name="flame" inline className="w-6 h-6 fill-current" />
                ) : (
                  <AppArtwork name="coffee" inline className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Pomodoro Milestone
                  </span>
                  <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full border border-stone-700">
                    {new Date(pomodoroNotification.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-white mt-0.5">
                  {pomodoroNotification.title}
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {pomodoroNotification.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={dismissPomodoroNotification}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
              title="Close Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action buttons */}
          <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-[11px] text-stone-400">
              Today's Study Total:{' '}
              <strong className="text-amber-400 font-bold">{dailyMinutesCompleted}m</strong> /{' '}
              {dailyMinutesTarget}m
            </div>

            <div className="flex items-center gap-2">
              {pomodoroNotification.phase === 'work' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      switchPomodoroPhase('rest');
                      startPomodoroTimer();
                      dismissPomodoroNotification();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <AppArtwork name="coffee" inline className="w-3.5 h-3.5" />
                    <span>Start Break ({pomodoro.restMinutes}m)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddFiveMinutes();
                      dismissPomodoroNotification();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
                  >
                    +5m Focus
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    switchPomodoroPhase('work');
                    startPomodoroTimer();
                    dismissPomodoroNotification();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <AppArtwork name="flame" inline className="w-3.5 h-3.5 fill-current" />
                  <span>Start Focus Interval</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. FLOATING COMPACT PILL / WIDGET (Sits in bottom-left corner) */}
      {!isFloatingHidden && (
        <div
          id="pomodoro-floating-widget"
          className="fixed bottom-3 left-3 sm:bottom-5 sm:left-5 z-40 transition-all duration-300"
        >
          {isFloatingMinimized ? (
            /* Minimized circular indicator */
            <button
              type="button"
              onClick={() => setIsFloatingMinimized(false)}
              className="w-12 h-12 rounded-full bg-stone-900 border border-amber-500/40 text-amber-400 shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group relative"
              title="Open Pomodoro Focus Timer"
            >
              <AppArtwork name="timer" inline className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {isRunning && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-1 right-1 animate-ping" />
              )}
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTimer(pomodoro.secondsLeft)}
              </span>
            </button>
          ) : (
            /* Expanded floating control card */
            <div className="bg-stone-900/95 backdrop-blur-md text-stone-100 rounded-2xl border border-stone-800 shadow-2xl p-3 sm:p-4 w-72 sm:w-80 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isRunning ? 'bg-amber-400 animate-pulse' : 'bg-stone-500'
                    }`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
                    <span>Focus Timer</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300 font-mono">
                    🍅 {pomodoro.completedCycles}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-stone-400">
                  <button
                    type="button"
                    onClick={() => setIsPomodoroModalOpen(true)}
                    className="p-1 rounded-md hover:bg-stone-800 hover:text-stone-200 transition-colors cursor-pointer"
                    title="Open Full Focus Studio"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFloatingMinimized(true)}
                    className="p-1 rounded-md hover:bg-stone-800 hover:text-stone-200 transition-colors cursor-pointer"
                    title="Minimize"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFloatingHidden(true)}
                    className="p-1 rounded-md hover:bg-stone-800 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Hide widget (reopen via Header)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main Timer Display */}
              <div className="flex items-center justify-between gap-3 my-1">
                <div>
                  <div className="flex items-center gap-1.5">
                    {pomodoro.phase === 'work' ? (
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <AppArtwork name="flame" inline className="w-3 h-3 fill-current" /> Work ({pomodoro.workMinutes}m)
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                        <AppArtwork name="coffee" inline className="w-3 h-3" /> Break ({pomodoro.restMinutes}m)
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-mono font-extrabold text-white tracking-wider">
                    {formatTimer(pomodoro.secondsLeft)}
                  </div>
                </div>

                {/* Play / Pause button */}
                <button
                  type="button"
                  onClick={isRunning ? pausePomodoroTimer : startPomodoroTimer}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isRunning
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                      : 'bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold shadow-md shadow-amber-400/20 active:scale-95'
                  }`}
                  title={isRunning ? 'Pause' : 'Start Focus Session'}
                >
                  {isRunning ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
              </div>

              {/* Active Subject Badge if deep studying a specific subject */}
              {pomodoro.activeSubjectName && (
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/50 px-2 py-1 rounded-lg my-1.5 truncate">
                  <AppArtwork name="target" inline className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="truncate">
                    Studying: <strong className="text-white font-bold">{pomodoro.activeSubjectName}</strong>
                  </span>
                </div>
              )}

              {/* Progress bar */}
              <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden my-2">
                <div
                  className={`h-full transition-all duration-300 ${
                    pomodoro.phase === 'work' ? 'bg-amber-400' : 'bg-indigo-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Quick Actions & Session Stats */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                <div className="flex items-center gap-1">
                  <span>Today:</span>
                  <strong className="text-stone-200 font-mono">
                    {dailyMinutesCompleted}m
                  </strong>
                  <span>/ {dailyMinutesTarget}m</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => switchPomodoroPhase()}
                    className="hover:text-stone-200 px-1.5 py-0.5 rounded bg-stone-800/80 hover:bg-stone-800 transition-colors"
                    title="Skip phase"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={resetPomodoroPhaseTimer}
                    className="hover:text-stone-200 px-1.5 py-0.5 rounded bg-stone-800/80 hover:bg-stone-800 transition-colors"
                    title="Reset countdown"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. FULL FOCUS STUDIO MODAL (Opened via Header or Maximize) */}
      {isPomodoroModalOpen && (
        <div
          id="pomodoro-focus-studio-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-3xl shadow-2xl text-stone-100 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-400/20 app-artwork-tile">
                  <AppArtwork name="timer" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span>ECE Pomodoro Focus Studio</span>
                    <span className="text-[11px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                      Board Exam Conditioning
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Track deliberate study duration with interval pacing and audible completion cues.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsTabOpen(!isSettingsTabOpen)}
                  className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                    isSettingsTabOpen
                      ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                  }`}
                  title="Configure Pomodoro settings"
                >
                  <AppArtwork name="gear" inline className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPomodoroModalOpen(false)}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700 transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Settings Dropdown / Panel */}
              {isSettingsTabOpen && (
                <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 animate-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Timer & Notification Configuration
                    </span>
                    <span className="text-xs text-stone-400">
                      Current: {pomodoro.workMinutes}m Focus / {pomodoro.restMinutes}m Rest
                    </span>
                  </div>

                  {/* Preset Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPomodoroCyclePreset(25, 5)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        is25_5
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                          : 'border-stone-800 hover:bg-stone-800/80 text-stone-300'
                      }`}
                    >
                      <div className="text-xs font-bold">25 / 5 min (Standard)</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">Classic Pomodoro rhythm</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPomodoroCyclePreset(50, 10)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        is50_10
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                          : 'border-stone-800 hover:bg-stone-800/80 text-stone-300'
                      }`}
                    >
                      <div className="text-xs font-bold">50 / 10 min (Deep Work)</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">High-intensity practice set</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPomodoroCyclePreset(15, 3)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        is15_3
                          ? 'border-amber-400 bg-amber-400/10 text-amber-300 font-bold'
                          : 'border-stone-800 hover:bg-stone-800/80 text-stone-300'
                      }`}
                    >
                      <div className="text-xs font-bold">15 / 3 min (Formula Blitz)</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">Rapid recall sprint</div>
                    </button>
                  </div>

                  {/* Custom Presets Form */}
                  <form
                    onSubmit={handleApplyCustomPreset}
                    className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-800 text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <label className="text-stone-400">Custom Work (min):</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={customWork}
                        onChange={(e) => setCustomWork(Math.max(1, Number(e.target.value)))}
                        className="w-16 px-2 py-1 rounded-lg bg-stone-900 border border-stone-700 text-center font-bold text-white text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <label className="text-stone-400">Custom Rest (min):</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={customRest}
                        onChange={(e) => setCustomRest(Math.max(1, Number(e.target.value)))}
                        className="w-16 px-2 py-1 rounded-lg bg-stone-900 border border-stone-700 text-center font-bold text-white text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Set Custom
                    </button>
                  </form>

                  {/* Notification & Audio Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-stone-800">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <div className="flex items-center gap-2">
                        {pomodoro.soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-amber-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-stone-500" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-stone-200">Completion Chime</div>
                          <div className="text-[10px] text-stone-400">Web Audio synthetic bells</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTestChime('work-complete')}
                          className="text-[10px] text-stone-400 hover:text-white px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 transition-colors"
                          title="Test chime sound"
                        >
                          Test
                        </button>
                        <button
                          type="button"
                          onClick={togglePomodoroSound}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                            pomodoro.soundEnabled
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {pomodoro.soundEnabled ? 'ON' : 'MUTED'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800">
                      <div className="flex items-center gap-2">
                        {notificationPermission === 'granted' ? (
                          <AppArtwork name="bell" inline className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <BellOff className="w-4 h-4 text-stone-500" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-stone-200">Desktop Alerts</div>
                          <div className="text-[10px] text-stone-400">
                            {notificationPermission === 'granted'
                              ? 'Notifications active'
                              : 'Alerts when tab in background'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRequestNotificationPermission}
                        className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                          notificationPermission === 'granted'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-400 text-stone-950 font-bold hover:bg-amber-300'
                        }`}
                      >
                        {notificationPermission === 'granted' ? 'Enabled' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Central Countdown & Circular Ring */}
              <div className="flex flex-col items-center justify-center py-4 relative">
                {/* SVG Progress Circle */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r={radius}
                      className="text-stone-800 stroke-current"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r={radius}
                      className={`${
                        pomodoro.phase === 'work' ? 'text-amber-400' : 'text-indigo-400'
                      } stroke-current transition-all duration-700 ease-linear`}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  {/* Inner Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    {/* Phase Badge */}
                    <div className="mb-2">
                      {pomodoro.phase === 'work' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <AppArtwork name="flame" inline className="w-3.5 h-3.5 fill-current text-amber-400" />
                          <span>FOCUS INTERVAL ({pomodoro.workMinutes}m)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          <AppArtwork name="coffee" inline className="w-3.5 h-3.5 text-indigo-400" />
                          <span>REST INTERVAL ({pomodoro.restMinutes}m)</span>
                        </span>
                      )}
                    </div>

                    {/* Big Countdown Digits */}
                    <div className="text-5xl sm:text-6xl font-mono font-extrabold tracking-wider text-white">
                      {formatTimer(pomodoro.secondsLeft)}
                    </div>

                    {/* Cycle completion tally */}
                    <div className="mt-2 flex items-center gap-1 text-xs text-stone-400 font-mono">
                      <span>🍅</span>
                      <span className="font-bold text-amber-400">
                        {pomodoro.completedCycles} {pomodoro.completedCycles === 1 ? 'cycle' : 'cycles'}
                      </span>
                      <span>completed today</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Controls */}
                <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                  {/* Play / Pause */}
                  <button
                    type="button"
                    onClick={isRunning ? pausePomodoroTimer : startPomodoroTimer}
                    className={`px-6 py-3 rounded-2xl text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                      isRunning
                        ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                        : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-amber-400/20'
                    }`}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-5 h-5" />
                        <span>Pause Focus</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        <span>Start Focus Interval</span>
                      </>
                    )}
                  </button>

                  {/* Switch to Rest/Work */}
                  <button
                    type="button"
                    onClick={() => switchPomodoroPhase()}
                    className="px-4 py-3 rounded-2xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title={`Switch immediately to ${pomodoro.phase === 'work' ? 'Rest' : 'Work'}`}
                  >
                    <SkipForward className="w-4 h-4" />
                    <span>{pomodoro.phase === 'work' ? 'Switch to Rest' : 'Switch to Work'}</span>
                  </button>

                  {/* Reset Phase */}
                  <button
                    type="button"
                    onClick={resetPomodoroPhaseTimer}
                    className="p-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer"
                    title="Reset current interval"
                  >
                    <AppArtwork name="cycle" inline className="w-4 h-4" />
                  </button>

                  {/* Add 5 Mins */}
                  <button
                    type="button"
                    onClick={handleAddFiveMinutes}
                    className="px-3.5 py-3 rounded-2xl text-xs font-semibold bg-stone-800/80 hover:bg-stone-800 text-amber-400 border border-stone-700 transition-colors cursor-pointer"
                    title="Add 5 minutes to current timer"
                  >
                    +5 Mins
                  </button>
                </div>
              </div>

              {/* Study Duration Tracking & Daily Goal Progress Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 app-artwork-tile">
                    <AppArtwork name="timer" />
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-400 uppercase font-semibold">
                      Today's Study Time
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      {formatMinutes(dailyMinutesCompleted)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 app-artwork-tile">
                    <AppArtwork name="target" />
                  </div>
                  <div>
                    <div className="text-[11px] text-stone-400 uppercase font-semibold">
                      Daily Target Progress
                    </div>
                    <div className="text-lg font-bold text-white font-mono">
                      {dailyProgressPercent}%{' '}
                      <span className="text-xs text-stone-400 font-normal">
                        ({dailyMinutesCompleted}/{dailyMinutesTarget}m)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => logStudyDurationMinutes(15)}
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 border border-stone-700 transition-colors cursor-pointer flex items-center gap-1"
                    title="Quick log 15 minutes of manual textbook or formula study"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Log +15m Study</span>
                  </button>
                </div>
              </div>

              {/* Focus Topic & Problem Scratchpad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Topic Focus Selector */}
                <div className="p-4 rounded-2xl bg-stone-950/40 border border-stone-800">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5 mb-2">
                    <AppArtwork name="book" inline className="w-4 h-4 text-amber-400" />
                    <span>Active Topic Focus Context</span>
                  </label>
                  <input
                    type="text"
                    value={selectedTopicName}
                    onChange={(e) => setSelectedTopicName(e.target.value)}
                    placeholder="e.g. Algebra: Linear Equations or Laws of Exponents"
                    className="w-full text-xs p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <div className="text-[10px] text-stone-400 mt-1.5 flex items-center gap-1">
                    <AppArtwork name="star" inline className="w-3 h-3 text-amber-400" />
                    <span>Focusing on this topic during the current study interval</span>
                  </div>
                </div>

                {/* In-Session Scratchpad */}
                <div className="p-4 rounded-2xl bg-stone-950/40 border border-stone-800">
                  <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5 mb-2">
                    <AppArtwork name="trophy" inline className="w-4 h-4 text-amber-400" />
                    <span>Active Recall Scratchpad</span>
                  </label>
                  <textarea
                    rows={2}
                    value={scratchpadText}
                    onChange={(e) => setScratchpadText(e.target.value)}
                    placeholder="Jot down formulas tested, questions attempted, or active recall cues..."
                    className="w-full text-xs p-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-800 bg-stone-950/70 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">💡 Tip:</span>
                <span>Studies show 25/5 intervals prevent mental fatigue during board calculations.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPomodoroModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
