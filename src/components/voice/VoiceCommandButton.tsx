import { AppArtwork } from '../common/AppArtwork';
import React, { useRef, useEffect } from 'react';
import { useExclusiveDropdown } from '../../hooks/useExclusiveDropdown';
import { useVoiceCommand } from '../../context/VoiceCommandContext';
import { MicOff, ChevronDown, HelpCircle } from 'lucide-react';

export const VoiceCommandButton: React.FC = () => {
  const {
    isListening,
    toggleListening,
    startListening,
    stopListening,
    openGuide,
    micVolume,
    executeCommandText,
    isContinuous,
    toggleContinuous,
  } = useVoiceCommand();

  const [isDropdownOpen, setIsDropdownOpen] = useExclusiveDropdown();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-flex items-center">
      {/* Primary Voice Mic Trigger */}
      <button
        id="header-voice-commands-btn"
        type="button"
        onClick={toggleListening}
        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-l-xl text-xs font-semibold border transition-all cursor-pointer ${
          isListening
            ? 'bg-rose-600 border-rose-500 text-white shadow-xs animate-pulse ring-2 ring-rose-400/50'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
        }`}
        title={isListening ? 'Microphone is active - Listening for voice commands (Click to stop)' : 'Click to activate Voice Commands via microphone'}
      >
        {isListening ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <AppArtwork name="microphone" inline className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline font-bold">Listening...</span>

            {/* Mini sound wave visualizer */}
            <div className="hidden md:flex items-center gap-0.5 h-3">
              {[0.5, 1, 0.6, 0.9].map((f, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-white/90 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(2, Math.round(micVolume * 12 * f) + 2)}px`,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <AppArtwork name="microphone" inline className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Voice Commands</span>
          </>
        )}
      </button>

      {/* Auxiliary Dropdown Button */}
      <button
        id="header-voice-commands-menu-btn"
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`px-1.5 py-1.5 rounded-r-xl text-xs font-semibold border-y border-r transition-all cursor-pointer ${
          isListening
            ? 'bg-rose-700 hover:bg-rose-800 border-rose-500 text-white'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
        }`}
        title="Voice commands quick options & guide"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {/* Quick Menu Popover */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#0d1527] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <AppArtwork name="microphone" inline className="w-3.5 h-3.5 text-rose-500" />
              Voice Controls
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                isListening
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {isListening ? 'Mic Active' : 'Mic Idle'}
            </span>
          </div>

          <div className="space-y-2 mb-3">
            <button
              type="button"
              onClick={() => {
                toggleListening();
                setIsDropdownOpen(false);
              }}
              className={`w-full py-2 px-3 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                isListening
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4 text-rose-500" /> : <AppArtwork name="microphone" inline className="w-4 h-4" />}
              <span>{isListening ? 'Stop Listening' : 'Start Listening'}</span>
            </button>
          </div>

          {/* Quick Clickable Commands */}
          <div className="mb-3">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              Sample Voice Commands:
            </div>
            <div className="grid grid-cols-1 gap-1">
              {[
                { label: 'Start Pomodoro', desc: 'Focus timer (25m)' },
                { label: 'Add Error', desc: 'Log mistake into bank' },
                { label: 'Switch to Math', desc: 'Mathematics screen' },
                { label: 'Take a Break', desc: 'Switch timer to rest' },
              ].map((cmd) => (
                <button
                  key={cmd.label}
                  type="button"
                  onClick={() => {
                    executeCommandText(cmd.label);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-800 dark:text-slate-200 flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <span className="font-mono text-[11px] font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700">
                    "{cmd.label}"
                  </span>
                  <span className="text-[10px] text-slate-400">{cmd.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                openGuide();
                setIsDropdownOpen(false);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Full Command Guide</span>
            </button>

            <span className="text-[10px] text-slate-400">Microphone input</span>
          </div>
        </div>
      )}
    </div>
  );
};
