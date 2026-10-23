import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect, useCallback } from 'react';
import { Check, Trash2 } from 'lucide-react';

export interface ConceptNote {
  text: string;
  updatedAt: string;
}

const STORAGE_KEY = 'review_real_numbers_notes';

// Helpful starter mnemonics & exam tips for each concept
const STARTER_MNEMONICS: Record<number, { title: string; hint: string; examples: string[] }> = {
  1: {
    title: 'Concept 1: Number Sets (ℕ ⊂ W ⊂ ℤ ⊂ ℚ ⊂ ℝ)',
    hint: 'Mnemonic: "Never Win Zero Questions Right"',
    examples: [
      'ℕ: Natural (Counting: 1, 2, 3...)',
      'W: Whole (Natural + Zero: 0, 1, 2...)',
      'ℤ: Integers (Zahlen - German for numbers: ...-2, -1, 0, 1, 2...)',
      'ℚ: Quotients/Rationals (p/q with q ≠ 0)',
      'ℝ: Real Numbers (ℚ + Irrationals on continuous line)',
    ],
  },
  2: {
    title: 'Concept 2: Rational vs. Irrational',
    hint: 'Golden Rule: √non-square is ALWAYS irrational; π is irrational (22/7 is only an approximation)',
    examples: [
      'Rational: Terminating decimal or repeating periodic pattern (0.333...)',
      'Irrational: Non-terminating, non-repeating (π, e, √2, √3, √5)',
      'Fraction trap: 0.142857... repeats, so it is rational (= 1/7)!',
    ],
  },
  3: {
    title: 'Concept 3: Classifying Numbers & Conversions',
    hint: 'Bar notation conversion trick: 0.ā = a/9, 0.ab̄ = ab/99, 0.abc̄ = abc/999',
    examples: [
      'Example: 0.444... = 4/9',
      'Example: 0.2727... = 27/99 = 3/11',
      'Mixed recurring: 0.1666... = (16 - 1)/90 = 15/90 = 1/6',
    ],
  },
  4: {
    title: 'Concept 4: Ordering & Comparing on the Real Line',
    hint: 'Bounding rule: Compare decimal values to 3 places or square both sides for non-negative radicals',
    examples: [
      '√2 ≈ 1.414, √3 ≈ 1.732, √5 ≈ 2.236',
      'Comparing √7 vs 2.6: (√7)² = 7, (2.6)² = 6.76 → √7 > 2.6',
      'Negative order reverses: -5 < -2, but |-5| > |-2|',
    ],
  },
};

const CONCEPT_NAMES: Record<number, string> = {
  1: '1. Number Sets',
  2: '2. Rational vs. Irrational',
  3: '3. Classifying Numbers',
  4: '4. Ordering & Comparing',
};

export const getConceptNotes = (): Record<number, ConceptNote> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load notes from localStorage', e);
  }
  return {};
};

export const saveConceptNote = (conceptId: number, text: string): ConceptNote => {
  const current = getConceptNotes();
  const note: ConceptNote = {
    text,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  current[conceptId] = note;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('real_numbers_notes_updated'));
  } catch (e) {
    console.error('Failed to save notes to localStorage', e);
  }
  return note;
};

interface RealNumbersConceptNotesProps {
  currentStepId: number;
  onNavigateStep?: (stepId: number) => void;
  compact?: boolean;
}

export const RealNumbersConceptNotes: React.FC<RealNumbersConceptNotesProps> = ({
  currentStepId,
  onNavigateStep,
  compact = false,
}) => {
  const [selectedConcept, setSelectedConcept] = useState<number>(currentStepId);
  const [allNotes, setAllNotes] = useState<Record<number, ConceptNote>>(() => getConceptNotes());
  const [noteText, setNoteText] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [copied, setCopied] = useState<boolean>(false);

  // Synchronize when currentStepId prop changes
  useEffect(() => {
    setSelectedConcept(currentStepId);
  }, [currentStepId]);

  // Load active concept note into textarea
  useEffect(() => {
    const note = allNotes[selectedConcept];
    setNoteText(note ? note.text : '');
    setSaveStatus('saved');
  }, [selectedConcept, allNotes]);

  // Listen for external updates across components/windows
  useEffect(() => {
    const handleUpdate = () => {
      setAllNotes(getConceptNotes());
    };
    window.addEventListener('real_numbers_notes_updated', handleUpdate);
    return () => {
      window.removeEventListener('real_numbers_notes_updated', handleUpdate);
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setNoteText(newText);
    setSaveStatus('dirty');
  };

  const handleManualSave = () => {
    setSaveStatus('saving');
    const updated = saveConceptNote(selectedConcept, noteText);
    setAllNotes((prev) => ({ ...prev, [selectedConcept]: updated }));
    setTimeout(() => {
      setSaveStatus('saved');
    }, 250);
  };

  const handleClearNote = () => {
    if (window.confirm('Are you sure you want to clear your notes for this concept?')) {
      const updated = saveConceptNote(selectedConcept, '');
      setNoteText('');
      setAllNotes((prev) => ({ ...prev, [selectedConcept]: updated }));
      setSaveStatus('saved');
    }
  };

  const handleInsertStarterHint = (textToAdd: string) => {
    const combined = noteText ? `${noteText}\n\n• ${textToAdd}` : `• ${textToAdd}`;
    setNoteText(combined);
    const updated = saveConceptNote(selectedConcept, combined);
    setAllNotes((prev) => ({ ...prev, [selectedConcept]: updated }));
    setSaveStatus('saved');
  };

  const handleCopyNote = async () => {
    if (!noteText) return;
    try {
      await navigator.clipboard.writeText(noteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const starterData = STARTER_MNEMONICS[selectedConcept] || STARTER_MNEMONICS[1];
  const currentNote = allNotes[selectedConcept];

  return (
    <div
      id={`my-notes-concept-${selectedConcept}`}
      className="bg-white rounded-2xl border-2 border-indigo-100 shadow-xs overflow-hidden transition-all"
    >
      {/* Note Header */}
      <div className="bg-linear-to-r from-indigo-50/90 via-sky-50/70 to-blue-50/60 p-4 sm:p-5 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs app-artwork-tile">
            <AppArtwork name="exam" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                My Notes &amp; Mnemonics
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase tracking-wider">
                Personalized
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Record custom insights, memory aids, and key board exam takeaways for each concept.
            </p>
          </div>
        </div>

        {/* Concept Selector Pill Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[1, 2, 3, 4].map((cid) => {
            const hasNote = Boolean(allNotes[cid]?.text?.trim());
            const isSelected = selectedConcept === cid;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => {
                  setSelectedConcept(cid);
                  if (onNavigateStep && !compact) {
                    onNavigateStep(cid);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white hover:bg-indigo-50/80 text-slate-700 border border-indigo-200'
                }`}
              >
                <span>Step {cid}</span>
                {hasNote && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-amber-300' : 'bg-indigo-500'
                    }`}
                    title="Contains saved notes"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Textarea & Helper Workspace */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Active Concept Title & Status */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <AppArtwork name="book" inline className="w-4 h-4 text-indigo-600" />
            <span>{CONCEPT_NAMES[selectedConcept]}</span>
          </span>

          <div className="flex items-center gap-2">
            {currentNote?.updatedAt && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <AppArtwork name="timer" inline className="w-3.5 h-3.5" />
                <span>Saved at {currentNote.updatedAt}</span>
              </span>
            )}

            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                saveStatus === 'saved'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : saveStatus === 'saving'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {saveStatus === 'saved' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Saved</span>
                </>
              ) : saveStatus === 'saving' ? (
                <span>Saving...</span>
              ) : (
                <span>Unsaved changes</span>
              )}
            </span>
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            id={`notes-textarea-concept-${selectedConcept}`}
            value={noteText}
            onChange={handleTextChange}
            placeholder={`Jot down your personal memory trick, derivation, or formula notes for ${CONCEPT_NAMES[selectedConcept]}...\nExample: "Always test whether the square root is a perfect square first before assuming irrational!"`}
            rows={compact ? 4 : 5}
            className="w-full p-3.5 rounded-xl border border-indigo-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 text-xs sm:text-sm text-slate-800 font-sans leading-relaxed resize-y transition-all outline-hidden"
          />

          {/* Quick Word & Character Count */}
          <div className="absolute right-3 bottom-3 text-[10px] text-slate-400 bg-white/90 px-1.5 py-0.5 rounded-md border border-slate-200 select-none">
            {noteText.trim() ? noteText.trim().split(/\s+/).length : 0} words | {noteText.length} chars
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleManualSave}
              disabled={saveStatus === 'saved'}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                saveStatus === 'dirty'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Note</span>
            </button>

            {noteText.trim().length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCopyNote}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearNote}
                  className="px-3 py-2 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Clear note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1 self-end sm:self-center">
            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Persisted locally in your browser storage.</span>
          </div>
        </div>

        {/* Suggested Mnemonics & Exam Takeaways Tray */}
        <div className="mt-4 pt-4 border-t border-indigo-100/80 bg-indigo-50/40 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
              <AppArtwork name="bulb" inline className="w-4 h-4 text-amber-500" />
              <span>Quick-Add Recommended Board Mnemonics:</span>
            </span>
            <span className="text-[10px] text-indigo-600 font-bold">
              Click to append to your notes
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleInsertStarterHint(starterData.hint)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-indigo-100/80 border border-indigo-200 text-indigo-900 text-xs font-medium text-left transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{starterData.hint}</span>
            </button>

            {starterData.examples.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleInsertStarterHint(ex)}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-100/80 border border-indigo-200 text-slate-700 text-xs font-normal text-left transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <span className="text-indigo-600 font-bold">+</span>
                <span>{ex}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
