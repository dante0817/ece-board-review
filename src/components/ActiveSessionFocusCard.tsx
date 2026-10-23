import { AppArtwork } from './common/AppArtwork';
import React from 'react';
import { useReview } from '../context/ReviewContext';
import { PomodoroTimerWidget } from './PomodoroTimerWidget';
import { SessionQuickNoteField } from './SessionQuickNoteField';
import { CheckCircle, Maximize2, X, Scale } from 'lucide-react';

export const ActiveSessionFocusCard: React.FC = () => {
  const {
    activeSession,
    isSessionRunning,
    updateActiveSessionScratchpad,
    updateActiveSessionConfidence,
    cancelReview,
    endReviewToModal,
    setIsSessionModalMinimized,
  } = useReview();

  if (!activeSession) return null;

  const handleExpandToModal = () => {
    setIsSessionModalMinimized(false);
  };

  return (
    <div
      id="active-session-focus-card"
      className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden transition-all animate-in fade-in duration-300"
    >
      {/* Background subtle glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top action row */}
      <div className="flex items-center justify-between border-b border-stone-800/80 pb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSessionRunning ? 'bg-amber-400' : 'bg-stone-500'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isSessionRunning ? 'bg-amber-500' : 'bg-stone-500'
              }`}
            />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {isSessionRunning ? 'Live Review in Progress' : 'Session Paused'}
          </span>
          <span className="text-[11px] font-medium text-stone-400 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
            {activeSession.activityType}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExpandToModal}
            className="text-xs font-medium text-stone-400 hover:text-stone-200 px-2.5 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-800 border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Open as fullscreen modal overlay"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
          <button
            type="button"
            onClick={cancelReview}
            className="text-stone-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            title="Cancel this session"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Topic Title & Context */}
      <div className="mt-5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <div className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5 mb-1">
              <AppArtwork name="book" inline className="w-3.5 h-3.5" />
              <span>Mathematics • Algebra Board Syllabus</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeSession.topic.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-md">
              Target: 20 board questions
            </span>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                activeSession.topic.mastery && activeSession.topic.mastery >= 4
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : activeSession.topic.mastery === 3
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              Mastery: L{activeSession.topic.mastery ?? 1}/5
            </span>
          </div>
        </div>
      </div>

      {/* Centerpiece: Pomodoro & Stopwatch Timer */}
      <div className="my-6 relative z-10">
        <PomodoroTimerWidget theme="dark" />
      </div>

      {/* Self-Assessment Confidence Score Selector */}
      <div className="mb-6 p-4 bg-stone-950/70 border border-stone-800 rounded-xl relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Self-Assessment: Confidence Score</span>
          </label>
          <span className="text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded">
            {activeSession.confidenceScore ?? 3} / 5 ({((activeSession.confidenceScore ?? 3) * 20)}%)
          </span>
        </div>
        <p className="text-[11px] text-stone-400 mb-2.5">
          How confident do you feel solving this topic right now?
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { lvl: 1, srs: '1d' },
            { lvl: 2, srs: '2-3d' },
            { lvl: 3, srs: '5-7d' },
            { lvl: 4, srs: '10-14d' },
            { lvl: 5, srs: '21d+' },
          ].map(({ lvl, srs }) => {
            const isSelected = (activeSession.confidenceScore ?? 3) === lvl;
            return (
              <button
                type="button"
                key={lvl}
                onClick={() => updateActiveSessionConfidence(lvl)}
                className={`py-1.5 px-1 text-center rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950 border-amber-400 font-extrabold shadow-sm'
                    : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-800'
                }`}
              >
                <div className="text-xs font-mono font-bold">L{lvl}</div>
                <div className="text-[9px] font-mono opacity-80">SRS {srs}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Note to Error Log without leaving Focus Mode */}
      <div className="mb-5 relative z-10">
        <SessionQuickNoteField theme="dark" />
      </div>

      {/* Quick Scratchpad / Formula notes */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="focus-scratchpad-input"
            className="text-xs font-semibold text-stone-300 flex items-center gap-1.5"
          >
            <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-amber-400" />
            <span>Problem Scratchpad & Formulas Tested</span>
          </label>
          <span className="text-[10px] text-stone-400">Live note synchronization</span>
        </div>
        <textarea
          id="focus-scratchpad-input"
          value={activeSession.scratchpad || ''}
          onChange={(e) => updateActiveSessionScratchpad(e.target.value)}
          placeholder="Jot down formulas used, intermediate steps, or specific question numbers..."
          rows={2}
          className="w-full text-xs p-3 rounded-xl border border-stone-800 bg-stone-950/70 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-colors"
        />
      </div>

      {/* Primary Completion Action */}
      <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
        <button
          type="button"
          id="focus-finish-review-btn"
          onClick={endReviewToModal}
          className="w-full sm:flex-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-amber-400/20 active:scale-98 cursor-pointer"
        >
          <CheckCircle className="w-5 h-5 text-stone-950" />
          <span>FINISH REVIEW & RECORD RESULT</span>
        </button>

        <button
          type="button"
          onClick={cancelReview}
          className="text-xs text-stone-400 hover:text-stone-200 py-2 px-3 rounded-lg hover:bg-stone-800/60 transition-colors cursor-pointer"
        >
          Discard Session
        </button>
      </div>
    </div>
  );
};
