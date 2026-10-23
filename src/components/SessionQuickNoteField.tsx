import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { useExclusiveDropdown } from '../hooks/useExclusiveDropdown';
import { useReview } from '../context/ReviewContext';
import { ErrorCategory, ErrorNote } from '../types';
import { BookmarkPlus, HelpCircle, Search, AlertTriangle, Check, Trash2, ChevronDown } from 'lucide-react';

interface SessionQuickNoteFieldProps {
  theme?: 'light' | 'dark';
}

export const SessionQuickNoteField: React.FC<SessionQuickNoteFieldProps> = ({ theme = 'light' }) => {
  const {
    activeSession,
    activeSessionSeconds,
    errors,
    appendQuickNoteToErrorLog,
    deleteErrorNote,
  } = useReview();

  const [noteText, setNoteText] = useState<string>('');
  const [noteType, setNoteType] = useState<'observation' | 'question' | 'mistake'>('observation');
  const [selectedErrorId, setSelectedErrorId] = useState<string>('auto');
  const [newErrorCategory, setNewErrorCategory] = useState<ErrorCategory>('Formula recall');
  const [showTargetDropdown, setShowTargetDropdown] = useExclusiveDropdown();
  const [justSavedMessage, setJustSavedMessage] = useState<string | null>(null);

  if (!activeSession) return null;

  const topicId = activeSession.topic.id;
  const topicName = activeSession.topic.name;
  const subjectId = activeSession.topic.subjectId;

  // Unresolved or all errors matching this active session topic
  const topicErrors = useMemo(() => {
    return errors.filter((e) => e.topicId === topicId);
  }, [errors, topicId]);

  const activeTopicUnresolved = useMemo(() => {
    return topicErrors.filter((e) => !e.isResolved);
  }, [topicErrors]);

  // Notes added across errors for this topic during this active session
  // Filter for notes added after activeSession.startedAt
  const sessionNotes = useMemo(() => {
    const list: { errorId: string; note: ErrorNote }[] = [];
    topicErrors.forEach((err) => {
      if (err.notes && Array.isArray(err.notes)) {
        err.notes.forEach((note) => {
          if (note.timestamp >= activeSession.startedAt - 5000) {
            list.push({ errorId: err.id, note });
          }
        });
      }
    });
    // Sort chronologically descending
    return list.sort((a, b) => b.note.timestamp - a.note.timestamp);
  }, [topicErrors, activeSession.startedAt]);

  // Compute live formatted elapsed time
  const elapsedMinutes = Math.floor(activeSessionSeconds / 60);
  const elapsedSeconds = activeSessionSeconds % 60;
  const sessionElapsedStr = `+${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedSeconds).padStart(2, '0')}`;

  const handleAppendNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed) return;

    const targetId = selectedErrorId === 'auto' || selectedErrorId === 'new' ? undefined : selectedErrorId;

    const result = appendQuickNoteToErrorLog({
      topicId,
      topicName,
      subjectId,
      text: trimmed,
      type: noteType,
      targetErrorId: targetId,
      category: newErrorCategory,
      sessionElapsedTime: sessionElapsedStr,
    });

    setNoteText('');
    const targetLabel = result.isNewError ? 'New Error Log Entry' : 'Current Error Log';
    setJustSavedMessage(`✓ Appended ${noteType} at ${result.note.timeString} to ${targetLabel}`);

    setTimeout(() => {
      setJustSavedMessage(null);
    }, 4000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAppendNote();
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`rounded-xl border p-3.5 sm:p-4 transition-colors ${
        isDark
          ? 'bg-stone-900/90 border-stone-800 text-stone-100'
          : 'bg-amber-50/40 border-amber-200/70 text-stone-800 shadow-xs'
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-600">
            <BookmarkPlus className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <span>Quick Note to Error Log</span>
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 font-mono">
                No Focus Interruption
              </span>
            </h4>
            <p className="text-[11px] text-stone-500">
              Append timestamped observations or questions directly into the error log without leaving this session.
            </p>
          </div>
        </div>

        {/* Live Elapsed Time Stamp */}
        <div className="flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-1 rounded bg-stone-100 border border-stone-200 text-stone-700">
          <AppArtwork name="timer" inline className="w-3 h-3 text-amber-600" />
          <span>{sessionElapsedStr}</span>
        </div>
      </div>

      {/* Note Type Selector */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-[11px] font-semibold text-stone-500 mr-1">Type:</span>
        <button
          type="button"
          onClick={() => setNoteType('observation')}
          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
            noteType === 'observation'
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Search className="w-3 h-3" />
          <span>Observation</span>
        </button>

        <button
          type="button"
          onClick={() => setNoteType('question')}
          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
            noteType === 'question'
              ? 'bg-purple-600 text-white font-bold shadow-xs'
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <HelpCircle className="w-3 h-3" />
          <span>Question</span>
        </button>

        <button
          type="button"
          onClick={() => setNoteType('mistake')}
          className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 cursor-pointer ${
            noteType === 'mistake'
              ? 'bg-amber-600 text-white font-bold shadow-xs'
              : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>Mistake Trap</span>
        </button>
      </div>

      {/* Target in Error Log (Optional configuration) */}
      <div className="mb-2.5 text-xs flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-stone-500 font-medium">Destination:</span>
        {activeTopicUnresolved.length > 0 ? (
          <div className="relative inline-block flex-1 min-w-[200px]">
            <button
              type="button"
              onClick={() => setShowTargetDropdown(!showTargetDropdown)}
              className="w-full text-left text-[11px] bg-white border border-stone-200 hover:border-stone-300 rounded-md px-2 py-1 flex items-center justify-between text-stone-700"
            >
              <span className="truncate">
                {selectedErrorId === 'auto'
                  ? `Active Error: ${activeTopicUnresolved[0].description.slice(0, 32)}...`
                  : selectedErrorId === 'new'
                  ? '+ Create Brand New Error Log Item'
                  : `Selected Error: ${topicErrors.find((e) => e.id === selectedErrorId)?.description.slice(0, 32)}...`}
              </span>
              <ChevronDown className="w-3 h-3 ml-1 text-stone-400 shrink-0" />
            </button>

            {showTargetDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto p-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedErrorId('auto');
                    setShowTargetDropdown(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded hover:bg-stone-100 flex items-center justify-between ${
                    selectedErrorId === 'auto' ? 'bg-amber-50 font-bold text-amber-900' : 'text-stone-700'
                  }`}
                >
                  <span>Auto-link to existing error on this topic</span>
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded">Recommended</span>
                </button>

                {topicErrors.map((err) => (
                  <button
                    key={err.id}
                    type="button"
                    onClick={() => {
                      setSelectedErrorId(err.id);
                      setShowTargetDropdown(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded hover:bg-stone-100 truncate ${
                      selectedErrorId === err.id ? 'bg-amber-50 font-bold text-amber-900' : 'text-stone-600'
                    }`}
                  >
                    <span className="font-semibold">{err.category}:</span> {err.description}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedErrorId('new');
                    setShowTargetDropdown(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded hover:bg-stone-100 border-t border-stone-100 font-semibold text-stone-800 ${
                    selectedErrorId === 'new' ? 'bg-amber-50 text-amber-900' : ''
                  }`}
                >
                  + Create Brand New Error Log Item
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600 bg-white border border-stone-200 px-2 py-1 rounded-md">
            <AppArtwork name="cards" inline className="w-3 h-3 text-stone-400" />
            <span>New Error Entry for &quot;{topicName}&quot;</span>
            <select
              value={newErrorCategory}
              onChange={(e) => setNewErrorCategory(e.target.value as ErrorCategory)}
              className="ml-1 text-[11px] font-semibold bg-stone-50 border border-stone-200 rounded px-1 py-0.5"
            >
              <option value="Formula recall">Formula recall</option>
              <option value="Sign / algebra errors">Sign / algebra errors</option>
              <option value="Wrong method">Wrong method</option>
              <option value="Question misreading">Question misreading</option>
              <option value="Speed / calculation slip">Speed / calculation slip</option>
            </select>
          </div>
        )}
      </div>

      {/* Input Field Form */}
      <form onSubmit={handleAppendNote} className="space-y-2">
        <div className="relative">
          <textarea
            id="session-quick-note-input"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              noteType === 'question'
                ? "E.g. Why does this step require applying integration by parts twice? (Press Enter to log)"
                : noteType === 'mistake'
                ? "E.g. Forgot negative sign when expanding bracket -(3x - 4). (Press Enter to log)"
                : "E.g. Key trick is factoring numerator first; saves 2 minutes of quotient rule. (Press Enter to log)"
            }
            rows={2}
            className="w-full text-xs p-2.5 rounded-lg border border-amber-300/80 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all placeholder:text-stone-400 text-stone-800"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] text-stone-500 flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1 py-0.5 rounded bg-stone-100 border border-stone-300 font-mono text-[9px] text-stone-700">
              Enter ↵
            </kbd>
            <span>to append instantly without leaving focus</span>
          </div>

          <button
            type="submit"
            disabled={!noteText.trim()}
            id="append-quick-note-btn"
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-amber-400 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Append to Error Log</span>
          </button>
        </div>
      </form>

      {/* Live Saved Confirmation Badge */}
      {justSavedMessage && (
        <div className="mt-2.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{justSavedMessage}</span>
        </div>
      )}

      {/* Live Session Notes Feed */}
      {sessionNotes.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-200/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
              <AppArtwork name="star" inline className="w-3 h-3 text-amber-600" />
              <span>Notes Appended This Session ({sessionNotes.length})</span>
            </span>
            <span className="text-[10px] text-stone-400 font-mono">Saved to Spaced Repetition</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {sessionNotes.map(({ errorId, note }) => (
              <div
                key={note.id}
                className="text-xs bg-white rounded-lg p-2 border border-amber-200/70 text-stone-700 flex items-start justify-between gap-2 group hover:border-amber-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                        note.type === 'question'
                          ? 'bg-purple-100 text-purple-700'
                          : note.type === 'mistake'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {note.type}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {note.timeString} {note.sessionElapsedTime ? `(${note.sessionElapsedTime})` : ''}
                    </span>
                  </div>
                  <p className="text-stone-800 text-[11px] leading-relaxed break-words">{note.text}</p>
                </div>

                <button
                  type="button"
                  onClick={() => deleteErrorNote(errorId, note.id)}
                  className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 transition-opacity p-1"
                  title="Remove note"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
