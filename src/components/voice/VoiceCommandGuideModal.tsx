import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { useVoiceCommand } from '../../context/VoiceCommandContext';
import { MicOff, X, Play, Search, CheckCircle2 } from 'lucide-react';

export const VoiceCommandGuideModal: React.FC = () => {
  const {
    isGuideOpen,
    closeGuide,
    actionsList,
    executeCommandText,
    isListening,
    toggleListening,
    isContinuous,
    toggleContinuous,
    voiceFeedbackEnabled,
    toggleVoiceFeedback,
  } = useVoiceCommand();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [testInput, setTestInput] = useState('');
  const [lastExecutedName, setLastExecutedName] = useState<string | null>(null);

  if (!isGuideOpen) return null;

  const categories = ['All', 'Timer', 'Errors', 'Subjects', 'Navigation', 'System'];

  const filteredActions = actionsList.filter((action) => {
    if (activeCategory !== 'All' && action.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = action.name.toLowerCase().includes(q);
      const matchDesc = action.description.toLowerCase().includes(q);
      const matchPhrase = action.examplePhrases.some((p) => p.toLowerCase().includes(q));
      return matchName || matchDesc || matchPhrase;
    }
    return true;
  });

  const handleRunManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testInput.trim()) return;
    const ok = executeCommandText(testInput.trim());
    if (ok) {
      setLastExecutedName(testInput.trim());
      setTestInput('');
      setTimeout(() => setLastExecutedName(null), 2500);
    }
  };

  const handleRunAction = (phrase: string, actionName: string) => {
    executeCommandText(phrase);
    setLastExecutedName(actionName);
    setTimeout(() => setLastExecutedName(null), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-guide-modal-title"
    >
      <div className="bg-white dark:bg-[#0d1527] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-xs app-artwork-tile">
              <AppArtwork name="microphone" />
            </div>
            <div>
              <h2 id="voice-guide-modal-title" className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Voice Commands Reference
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control study sessions, error logging, and navigation via microphone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="guide-toggle-listening-btn"
              onClick={toggleListening}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white shadow-xs animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              {isListening ? <AppArtwork name="microphone" inline className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isListening ? 'Listening...' : 'Turn On Mic'}</span>
            </button>
            <button
              type="button"
              onClick={closeGuide}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Close guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Simulator / Test Input */}
        <div className="p-4 bg-slate-50/80 dark:bg-[#0a1120]/80 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
          <form onSubmit={handleRunManual} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Test a command... e.g. 'Start Pomodoro', 'Add Error', 'Switch to Math'"
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={!testInput.trim()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Play className="w-3 h-3" />
              <span>Execute</span>
            </button>
          </form>

          {lastExecutedName && (
            <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Executed: "{lastExecutedName}"</span>
            </div>
          )}

          {/* Settings Toggles */}
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={isContinuous}
                  onChange={toggleContinuous}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px]">Continuous listening mode</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={voiceFeedbackEnabled}
                  onChange={toggleVoiceFeedback}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px]">Voice confirmation readback</span>
              </label>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">Filter:</span>
              <div className="flex gap-1 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Command list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-0">
          {filteredActions.map((action) => {
            const isTimer = action.category === 'Timer';
            const isError = action.category === 'Errors';
            const isSubject = action.category === 'Subjects';

            return (
              <div
                key={action.id}
                className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0e1629] hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isTimer
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          : isError
                          ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                          : isSubject
                          ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {action.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {action.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    {action.description}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Say:</span>
                    {action.examplePhrases.map((phrase, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleRunAction(phrase, action.name)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 text-[10px] font-mono transition-colors cursor-pointer"
                        title={`Click to simulate saying "${phrase}"`}
                      >
                        "{phrase}"
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunAction(action.examplePhrases[0], action.name)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 text-xs font-semibold shrink-0 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  title={`Trigger ${action.name}`}
                >
                  <Play className="w-3 h-3" />
                  <span>Try</span>
                </button>
              </div>
            );
          })}

          {filteredActions.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No voice commands found matching "{searchQuery}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#0a1120] border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-500" />
            <span>Tip: Works with any connected microphone using speech recognition.</span>
          </div>
          <button
            type="button"
            onClick={closeGuide}
            className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
