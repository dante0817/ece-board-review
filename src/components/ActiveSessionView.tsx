import React from 'react';
import { useReview } from '../context/ReviewContext';
import { PomodoroTimerWidget } from './PomodoroTimerWidget';
import { SessionQuickNoteField } from './SessionQuickNoteField';
import {
  CheckCircle,
  X,
  Minimize2,
  Scale,
} from 'lucide-react';

export const ActiveSessionView: React.FC = () => {
  const {
    activeSession,
    updateActiveSessionScratchpad,
    updateActiveSessionConfidence,
    cancelReview,
    endReviewToModal,
    isEndModalOpen,
    isSessionModalMinimized,
    setIsSessionModalMinimized,
    setIsFocusMode,
    currentScreen,
    setCurrentScreen,
  } = useReview();

  if (!activeSession || isEndModalOpen) return null;

  // If the user has docked the session to TodayScreen (especially in Focus Mode), hide the fullscreen modal overlay
  if (isSessionModalMinimized && currentScreen === 'today') {
    return null;
  }

  const handleDockToTodayScreen = () => {
    setIsSessionModalMinimized(true);
    setIsFocusMode(true);
    setCurrentScreen('today');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl border border-stone-200">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Active Review Session
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDockToTodayScreen}
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors flex items-center gap-1.5"
              title="Dock study session to TodayScreen in Focus Mode"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>TodayScreen Focus Mode</span>
            </button>
            <button
              onClick={cancelReview}
              className="text-stone-400 hover:text-stone-600 p-1"
              title="Cancel session"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Topic Title */}
        <div className="text-center my-5">
          <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full inline-block mb-1.5">
            {activeSession.activityType}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {activeSession.topic.name}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Current Mastery: {activeSession.topic.mastery ?? '—'}/5 • Focus on independent solving
          </p>
        </div>

        {/* Pomodoro & Stopwatch Timer Component */}
        <PomodoroTimerWidget theme="light" />

        {/* Self-Assessment Confidence Score Selector */}
        <div className="my-4 p-3 bg-stone-50 border border-stone-200 rounded-xl">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-amber-600" />
              <span>Self-Assessment: Confidence Score</span>
            </label>
            <span className="text-xs font-mono font-bold text-stone-900 bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-200">
              {activeSession.confidenceScore ?? 3} / 5 ({((activeSession.confidenceScore ?? 3) * 20)}%)
            </span>
          </div>
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
                      ? 'bg-amber-500 text-stone-950 border-amber-600 font-extrabold shadow-xs ring-1 ring-amber-400'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">L{lvl}</div>
                  <div className="text-[9px] font-mono text-stone-500 opacity-80">SRS {srs}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Note directly to Error Log */}
        <div className="my-4">
          <SessionQuickNoteField theme="light" />
        </div>

        {/* Scratchpad note */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-stone-700 block mb-1.5 flex items-center justify-between">
            <span>Quick Solving Notes / Formulas used</span>
            <span className="text-[10px] text-stone-400">Synced across modes</span>
          </label>
          <textarea
            value={activeSession.scratchpad || ''}
            onChange={(e) => updateActiveSessionScratchpad(e.target.value)}
            placeholder="Type notes or formulas tested during this problem set..."
            rows={2}
            className="w-full text-xs p-3 rounded-lg border border-stone-200 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
        </div>

        {/* Finish button */}
        <div className="space-y-2">
          <button
            id="finish-review-session-btn"
            onClick={endReviewToModal}
            className="w-full bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
          >
            <CheckCircle className="w-5 h-5 text-amber-400" />
            <span>FINISH REVIEW & RECORD RESULT</span>
          </button>
          <button
            onClick={cancelReview}
            className="w-full text-center text-xs text-stone-500 hover:text-stone-700 py-1 cursor-pointer"
          >
            Discard session
          </button>
        </div>
      </div>
    </div>
  );
};

