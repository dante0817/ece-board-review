import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Check } from 'lucide-react';

interface MyNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicTitle?: string;
}

const STORAGE_KEY = 'my_notes_rational_expressions';
const LEGACY_STORAGE_KEY = 'sunny_notes_rational_expressions';

const DEFAULT_MNEMONICS = `• Golden Rule: Cancel FACTORS, never additive terms!
  (e.g., in (x+3)/(x+3)(x-2), cancel (x+3) as a factor; do NOT cancel x from x^2-9)
• Domain Restrictions: Find zeros of ALL denominators BEFORE cancelling anything.
• Division: "Keep - Change - Flip" → Multiply by the reciprocal of the divisor.
• Subtraction: In (A/LCD) - (B/LCD), distribute the minus sign to EVERY term of B!
• Rational Equations: Clear LCD → Solve resulting polynomial → Check for EXTRANEOUS roots.`;

export const MyNotesModal: React.FC<MyNotesModalProps> = ({
  isOpen,
  onClose,
  topicTitle = 'Rational Expressions',
}) => {
  const [noteContent, setNoteContent] = useState<string>(() => {
    return (
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY) ||
      DEFAULT_MNEMONICS
    );
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Saved locally');
  const [copied, setCopied] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with localStorage when modal opens
  useEffect(() => {
    if (isOpen) {
      const stored =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored !== null) {
        setNoteContent(stored);
      }
      setSaveStatus('saved');
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveImmediately();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, noteContent]);

  // Debounced autosave
  const handleContentChange = (val: string) => {
    setNoteContent(val);
    setSaveStatus('dirty');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, val);
      localStorage.setItem(LEGACY_STORAGE_KEY, val);
      setSaveStatus('saved');
      const now = new Date();
      setLastSavedTime(`Autosaved at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 800);
  };

  const saveImmediately = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaveStatus('saving');
    localStorage.setItem(STORAGE_KEY, noteContent);
    localStorage.setItem(LEGACY_STORAGE_KEY, noteContent);
    setTimeout(() => {
      setSaveStatus('saved');
      const now = new Date();
      setLastSavedTime(`Saved at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 250);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(noteContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsertMnemonic = (text: string) => {
    const updated = noteContent ? `${noteContent.trim()}\n• ${text}` : `• ${text}`;
    handleContentChange(updated);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset notes to recommended default mnemonics? This will replace current text.')) {
      handleContentChange(DEFAULT_MNEMONICS);
    }
  };

  if (!isOpen) return null;

  const wordCount = noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0;
  const charCount = noteContent.length;

  return (
    <div
      id="my-notes-modal-overlay"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="my-notes-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-notes-title"
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs app-artwork-tile">
              <AppArtwork name="exam" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="my-notes-title" className="font-extrabold text-slate-900 text-base sm:text-lg">
                  My Notes &amp; Mnemonics
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {topicTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Personal memory tricks, formulas, and reminders saved automatically
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-my-notes-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close notes modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
          {/* Helpful Tip Banner */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-amber-950 flex items-start gap-2.5">
            <AppArtwork name="bulb" inline className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-900">Personal Topic Scratchpad</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Use this space for concepts you find tricky, your personal memory triggers, or steps to double-check before submitting board exam questions.
              </p>
            </div>
          </div>

          {/* Quick Insert Mnemonics */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick-Add Topic Mnemonics</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Cancel factors, NEVER additive terms!',
                'Division: Keep - Change - Flip',
                'Find restrictions before simplifying',
                'Distribute minus sign to all numerator terms',
                'Check for extraneous roots in equations',
              ].map((mnemonic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertMnemonic(mnemonic)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-slate-200 text-slate-700 text-[11px] transition-colors cursor-pointer text-left"
                >
                  + {mnemonic}
                </button>
              ))}
            </div>
          </div>

          {/* Persistent Text Area */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <label htmlFor="my-notes-textarea" className="font-semibold text-slate-700 flex items-center gap-1">
                <AppArtwork name="book" inline className="w-3.5 h-3.5 text-blue-600" />
                <span>Your Personal Notes for {topicTitle}</span>
              </label>
              <div className="flex items-center gap-2 font-mono">
                <span>{wordCount} words</span>
                <span>•</span>
                <span>{charCount} chars</span>
              </div>
            </div>
            <textarea
              id="my-notes-textarea"
              value={noteContent}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={8}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 font-mono focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-hidden leading-relaxed shadow-inner resize-y min-h-[160px]"
              placeholder="Write your personal mnemonics, formulas, or reminders for this topic..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs">
            {saveStatus === 'saved' ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>{lastSavedTime}</span>
              </span>
            ) : saveStatus === 'saving' ? (
              <span className="text-blue-600 font-medium animate-pulse">
                Saving to local storage...
              </span>
            ) : (
              <span className="text-amber-600 font-medium">
                Unsaved changes (autosaving...)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="reset-notes-btn"
              onClick={handleResetToDefault}
              title="Reset to recommended reminders"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              id="copy-notes-btn"
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              id="manual-save-notes-btn"
              onClick={saveImmediately}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            <button
              type="button"
              id="close-my-notes-footer-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNotesModal;
