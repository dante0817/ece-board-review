import { AppArtwork } from '../common/AppArtwork';
import { FeatureIcon } from '../common/FeatureIcon';
import React, { useEffect, useRef } from 'react';
import { useExclusiveDropdown } from '../../hooks/useExclusiveDropdown';
import { ChevronDown } from 'lucide-react';
import { useReview } from '../../context/ReviewContext';
import { useVoiceCommand } from '../../context/VoiceCommandContext';

interface TutorLauncherProps {
  compact?: boolean;
  inverted?: boolean;
  onAction?: () => void;
}

export const TutorLauncher: React.FC<TutorLauncherProps> = ({
  compact = false,
  inverted = false,
  onAction,
}) => {
  const { openChat, openVoiceConversation } = useReview();
  const { isListening, toggleListening, openGuide } = useVoiceCommand();
  const [open, setOpen] = useExclusiveDropdown();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const finish = (action: () => void) => {
    action();
    setOpen(false);
    onAction?.();
  };

  const buttonClass = inverted
    ? 'sidebar-button sidebar-tool-button w-full justify-between px-3 py-2'
    : 'px-2.5 sm:px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-2xs';

  return (
    <div ref={ref} className={`relative ${inverted ? 'w-full' : ''}`}>
      <button
        id={inverted ? 'sidebar-tutor-launcher' : 'header-tutor-launcher'}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${buttonClass}`}
        title="Open study tutor tools"
      >
        <div className="flex items-center gap-2">
          <FeatureIcon name="tutor" size="small" />
          <span className={compact ? 'hidden lg:inline' : ''}>Tutor</span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 opacity-60" />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 ${
            inverted ? 'bottom-full left-0 mb-2 mt-0' : 'right-0'
          }`}
        >
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <AppArtwork name="chat" inline className="h-4 w-4 text-blue-600" />
              Study Tutor
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Ask, speak, or control the reviewer without leaving your study context.
            </p>
          </div>

          <div className="p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => finish(() => openChat())}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <FeatureIcon name="tutor" size="small" />
              <span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">Ask Tutor</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Chat about a concept or problem.</span>
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => finish(() => openVoiceConversation())}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            >
              <span className="icon-3d icon-3d--small icon-3d--violet app-artwork-tile" aria-hidden="true"><AppArtwork name="antenna" /></span>
              <span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">Voice Tutor</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Practice through a live oral review.</span>
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => finish(toggleListening)}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <span className="icon-3d icon-3d--small icon-3d--rose app-artwork-tile" aria-hidden="true"><AppArtwork name="microphone" /></span>
              <span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {isListening ? 'Stop Voice Commands' : 'Voice Commands'}
                </span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  {isListening ? 'Microphone is currently listening.' : 'Control common reviewer actions by voice.'}
                </span>
              </span>
            </button>
          </div>

          <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-800">
            <button
              type="button"
              onClick={() => finish(openGuide)}
              className="w-full rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
            >
              View voice command guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
