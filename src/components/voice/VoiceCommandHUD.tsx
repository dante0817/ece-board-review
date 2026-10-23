import { AppArtwork } from '../common/AppArtwork';
import React from 'react';
import { useVoiceCommand } from '../../context/VoiceCommandContext';
import { MicOff, CheckCircle2, AlertCircle, X, Volume2, VolumeX, HelpCircle } from 'lucide-react';

export const VoiceCommandHUD: React.FC = () => {
  const {
    isListening,
    interimTranscript,
    lastFeedback,
    unrecognizedPhrase,
    permissionError,
    micVolume,
    stopListening,
    startListening,
    clearFeedback,
    executeCommandText,
    openGuide,
    voiceFeedbackEnabled,
    toggleVoiceFeedback,
  } = useVoiceCommand();

  // Show HUD if active, recently executed, or has an error/unrecognized phrase
  const isVisible = Boolean(
    isListening || lastFeedback || unrecognizedPhrase || permissionError
  );

  if (!isVisible) return null;

  return (
    <div
      id="voice-command-hud"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[calc(100%-2rem)] transition-all duration-300 pointer-events-auto"
    >
      <div className="bg-slate-900/95 dark:bg-[#070c18]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 dark:border-slate-800 p-3.5 sm:p-4 text-xs">
        {/* State 1: Active Listening */}
        {isListening && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>

                {/* Animated Waveform based on micVolume */}
                <div className="flex items-center gap-0.5 h-4 shrink-0">
                  {[0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.3].map((heightFactor, i) => {
                    const scaledHeight = Math.max(3, Math.round(micVolume * 16 * heightFactor) + 3);
                    return (
                      <div
                        key={i}
                        className="w-1 bg-rose-400 rounded-full transition-all duration-75"
                        style={{ height: `${scaledHeight}px` }}
                      />
                    );
                  })}
                </div>

                <span className="font-bold text-rose-300 text-xs tracking-wide shrink-0">
                  Listening for voice command...
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleVoiceFeedback}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    voiceFeedbackEnabled
                      ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/40'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                  title={voiceFeedbackEnabled ? 'Voice readback ON' : 'Voice readback OFF'}
                >
                  {voiceFeedbackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={openGuide}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="View supported voice commands"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id="hud-stop-listening-btn"
                  onClick={stopListening}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <MicOff className="w-3 h-3 text-rose-400" />
                  <span>Stop</span>
                </button>
              </div>
            </div>

            {/* Live speech transcription */}
            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 mb-2 min-h-[38px] flex items-center">
              <span className="text-slate-400 mr-1.5 shrink-0">Speech:</span>
              <span className="font-mono text-amber-300 text-xs font-semibold truncate">
                {interimTranscript ? `"${interimTranscript}"` : 'Say a command... (e.g. "Start Pomodoro", "Add Error", "Switch to Math")'}
              </span>
            </div>

            {/* Quick action chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-medium">Quick triggers:</span>
              {['Start Pomodoro', 'Add Error', 'Switch to Math', 'Take a Break'].map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => executeCommandText(cmd)}
                  className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-blue-900/40 text-slate-300 hover:text-blue-200 border border-slate-700/60 text-[10px] font-mono transition-colors cursor-pointer"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* State 2: Last command feedback banner (if not listening or just completed) */}
        {!isListening && lastFeedback && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                  <span>Voice Action:</span>
                  <span className="text-white">{lastFeedback.title}</span>
                </div>
                <div className="text-[11px] text-slate-300 truncate">
                  {lastFeedback.description} • Heard: <span className="font-mono text-amber-300 font-semibold">"{lastFeedback.spokenText}"</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={startListening}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              >
                <AppArtwork name="microphone" inline className="w-3 h-3" />
                <span>Listen Again</span>
              </button>
              <button
                type="button"
                onClick={clearFeedback}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* State 3: Unrecognized phrase feedback */}
        {!isListening && unrecognizedPhrase && !lastFeedback && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-amber-300 text-xs">
                  Command not recognized: <span className="font-mono text-white">"{unrecognizedPhrase}"</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  Try saying <span className="text-amber-200">"Start Pomodoro"</span>, <span className="text-amber-200">"Add Error"</span>, or <span className="text-amber-200">"Switch to Math"</span>.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={openGuide}
                className="text-[11px] text-blue-400 hover:underline px-1 cursor-pointer"
              >
                View commands
              </button>
              <button
                type="button"
                onClick={startListening}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                title="Try again"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* State 4: Permission error */}
        {permissionError && !isListening && !lastFeedback && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <MicOff className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-rose-300 text-xs">Microphone Notice</div>
                <div className="text-[11px] text-slate-300">{permissionError}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={startListening}
              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs cursor-pointer"
            >
              Allow & Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
