import { LEGACY_BACKUP } from '../utils/learnerMigration';
import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useRef, useState } from 'react';
import { useModalFocus } from '../hooks/useModalFocus';
import { exportLearnerArchive, previewLearnerImport, restoreLearnerArchive, type LearnerArchive, type ImportPreview } from '../utils/learnerBackup';
import { useReview } from '../context/ReviewContext';
import { X, Save, User, Sun, Moon, Monitor, EyeOff } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    userProfile,
    setUserProfile,
    dailyTarget,
    setDailyTarget,
    recommendedTarget,
    resetAllData,
    reseedDemoData,
    theme,
    setTheme,
    isDarkMode,
    isFocusMode,
    toggleFocusMode,
  } = useReview();

  const [name, setName] = useState(userProfile.name);
  const [examName, setExamName] = useState(userProfile.examName);
  const [calculatorModel, setCalculatorModel] = useState<'Canon F-789SGA'>('Canon F-789SGA');
  const [targetExamDate, setTargetExamDate] = useState(userProfile.targetExamDate || '');
  const [dailySessions, setDailySessions] = useState(dailyTarget.targetSessions);
  const [dailyQuestions, setDailyQuestions] = useState(dailyTarget.targetQuestions);
  const [dailyMinutes, setDailyMinutes] = useState(dailyTarget.targetMinutes || userProfile.dailyTargetMinutes || 60);
  const [confirmReset, setConfirmReset] = useState(false);
  const importInputRef=useRef<HTMLInputElement>(null);
  const [importCandidate,setImportCandidate]=useState<LearnerArchive|null>(null);
  const [importPreview,setImportPreview]=useState<ImportPreview|null>(null);
  const [importError,setImportError]=useState('');
  const [confirmRestore,setConfirmRestore]=useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const dialogRef = useModalFocus<HTMLDivElement>(isSettingsOpen, () => setIsSettingsOpen(false));
  if (!isSettingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const minutesVal = Number(dailyMinutes) || 60;
    setUserProfile((previous) => ({
      ...previous,
      name: name.trim() || 'Learner',
      calculatorModel,
      examName: examName.trim() || 'ECE Board Examination',
      targetExamDate,
      targetExamDateEnd: undefined,
      targetExamDisplay: targetExamDate || 'Not set',
      dailyTargetSessions: Number(dailySessions) || 2,
      dailyTargetQuestions: Number(dailyQuestions) || 40,
      dailyTargetMinutes: minutesVal,
    }));
    setDailyTarget((prev) => ({
      ...prev,
      targetSessions: Number(dailySessions) || 2,
      targetQuestions: Number(dailyQuestions) || 40,
      targetMinutes: minutesVal,
    }));

    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      setIsSettingsOpen(false);
    }, 1000);
  };

  const downloadJson = (name:string,text:string) => {
    const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download=name;
    document.body.appendChild(anchor);anchor.click();anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),5000);
  };
  const exportLearnerData = () => {
    try {downloadJson('BSECE-Learner-Backup-v10.17.json',JSON.stringify(exportLearnerArchive(localStorage),null,2));setImportError('');}
    catch(error){setImportError(error instanceof Error?error.message:'Backup could not be exported.');}
  };
  const readImportFile = async (file:File|null) => {
    setImportCandidate(null);setImportPreview(null);setConfirmRestore(false);setImportError('');
    if(!file)return;
    try {
      if(file.size>8_000_000)throw new Error('Backup is too large (maximum 8 MB).');
      const {archive,preview}=previewLearnerImport(JSON.parse(await file.text()));
      setImportCandidate(archive);setImportPreview(preview);
    } catch(error){setImportError(error instanceof Error?error.message:'Unable to read backup.');}
  };
  const executeRestore = () => {
    if(!importCandidate || !confirmRestore)return;
    try {restoreLearnerArchive(localStorage,importCandidate);window.location.reload();}
    catch(error){setImportError(error instanceof Error?error.message:'Restoration failed. Previous data was retained when possible.');}
  };

  const exportLegacyBackup = () => {
    const raw=localStorage.getItem(LEGACY_BACKUP);
    if(!raw)return;
    const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='BSECE-v10.8-pre-migration-backup.json';
    document.body.appendChild(anchor);anchor.click();anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),5000);
  };

  const handleReset = () => {
    reseedDemoData();
    setConfirmReset(false);
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-full overflow-y-auto p-6 shadow-2xl border border-stone-200" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Learner Review Settings">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <FeatureIcon name="settings" size="small" />
            <h3 className="font-bold text-stone-900 text-base">Learner Review Settings</h3>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1 rounded text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Student Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Target Licensure Examination
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <AppArtwork name="calendar" inline className="w-3.5 h-3.5 text-stone-600" /> Target Exam Start Date
              </label>
              <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                {targetExamDate || 'Not set'}
              </span>
            </div>
            <input
              type="date"
              value={targetExamDate}
              onChange={(e) => setTargetExamDate(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white font-mono"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Set your intended exam date. Confirm official schedules using the PRC announcement for that examination.
            </p>
          </div>

          <div className="border border-blue-200 bg-blue-50 rounded-xl p-3 space-y-2">
            <label htmlFor="calculator-profile" className="text-xs font-bold text-blue-950">Scientific calculator profile</label>
            <select id="calculator-profile" value={calculatorModel} onChange={e=>setCalculatorModel(e.target.value as 'Canon F-789SGA')} className="w-full text-xs rounded-lg border border-blue-200 bg-white p-2">
              <option value="Canon F-789SGA">Canon F-789SGA (pilot model)</option>
            </select>
            <p className="text-[11px] text-blue-950">Model-specific instructions currently target F-789SGA only. The PRC list requires transparent casing; permission is subject to the current official rules and examination inspection. Selecting a model does not confirm eligibility.</p>
            <a className="text-xs underline text-blue-800" target="_blank" rel="noreferrer" href="https://www.prc.gov.ph/node/6984">Verify PRC calculator list</a>
          </div>

          {/* Study Theme & Eye Strain Reduction Section */}
          <div className="pt-1 pb-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                {isDarkMode ? <Moon className="w-3.5 h-3.5 text-indigo-500" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span>Study Theme & Eye Strain Reduction</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">Shortcut: Ctrl+Shift+D</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-bold shadow-2xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-amber-500 shadow-2xs">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div>Light</div>
                  <div className="text-[9px] text-stone-400 font-normal">Daytime</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-bold shadow-2xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-indigo-300 shadow-2xs">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div>Dark</div>
                  <div className="text-[9px] text-stone-400 font-normal">Late-Night</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  theme === 'system'
                    ? 'border-blue-500 bg-blue-50/50 text-blue-700 font-bold shadow-2xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 shadow-2xs">
                  <Monitor className="w-4 h-4" />
                </div>
                <div className="text-[11px] leading-tight">
                  <div>System</div>
                  <div className="text-[9px] text-stone-400 font-normal">Auto Sync</div>
                </div>
              </button>
            </div>
            <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed">
              Dark mode uses a low-glare deep slate canvas to minimize blue-light exposure and eye fatigue during midnight ECE problem sessions.
            </p>
          </div>

          {/* Distraction-Free Focus Mode Toggle Section */}
          <div className="pt-2 pb-1 border-t border-stone-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                {isFocusMode ? (
                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <AppArtwork name="eye" inline className="w-3.5 h-3.5 text-stone-500" />
                )}
                <span>Focus Mode (Distraction-Free Review)</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">Shortcut: Ctrl+Shift+F</span>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all ${
                isFocusMode
                  ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                  : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">
                      {isFocusMode ? 'Focus Mode Active' : 'Standard View'}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        isFocusMode
                          ? 'bg-amber-400 text-stone-950 border-amber-500 shadow-2xs'
                          : 'bg-stone-200 text-stone-600 border-stone-300'
                      }`}
                    >
                      {isFocusMode ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    Hides non-essential UI elements like the navigation sidebar and AI chatbot to provide a distraction-free environment for deep review sessions.
                  </p>
                </div>

                {/* Accessible switch toggle button */}
                <button
                  type="button"
                  id="settings-focus-mode-toggle-btn"
                  onClick={toggleFocusMode}
                  role="switch"
                  aria-checked={isFocusMode}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                    isFocusMode ? 'bg-amber-500' : 'bg-stone-300'
                  }`}
                  title={isFocusMode ? 'Disable Focus Mode' : 'Enable Focus Mode'}
                >
                  <span className="sr-only">Toggle Focus Mode</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isFocusMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Status breakdown pills */}
              <div className="mt-2.5 pt-2 border-t border-stone-200/60 flex flex-wrap items-center gap-1.5 text-[10px]">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
                    isFocusMode
                      ? 'bg-amber-100 text-amber-950 font-semibold border border-amber-200'
                      : 'bg-stone-200/70 text-stone-600 border border-stone-200'
                  }`}
                >
                  <span>Sidebar:</span>
                  <span>{isFocusMode ? 'Hidden (Full Width)' : 'Visible'}</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
                    isFocusMode
                      ? 'bg-amber-100 text-amber-950 font-semibold border border-amber-200'
                      : 'bg-stone-200/70 text-stone-600 border border-stone-200'
                  }`}
                >
                  <span>Chatbot:</span>
                  <span>{isFocusMode ? 'Hidden' : 'Visible'}</span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
                    isFocusMode
                      ? 'bg-emerald-100 text-emerald-950 font-semibold border border-emerald-200'
                      : 'bg-stone-200/70 text-stone-600 border border-stone-200'
                  }`}
                >
                  <AppArtwork name="star" inline className="w-2.5 h-2.5 text-amber-600" />
                  <span>Deep Review Active</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                <AppArtwork name="target" inline className="w-3.5 h-3.5" /> Sessions
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={dailySessions}
                onChange={(e) => setDailySessions(Number(e.target.value) || 1)}
                className="w-full text-xs font-mono p-2 rounded-lg border border-stone-300 bg-white text-center font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Questions</label>
              <input
                type="number"
                min="10"
                max="200"
                value={dailyQuestions}
                onChange={(e) => setDailyQuestions(Number(e.target.value) || 10)}
                className="w-full text-xs font-mono p-2 rounded-lg border border-stone-300 bg-white text-center font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1 flex items-center gap-1">
                <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-600" /> Goal (Mins)
              </label>
              <input
                type="number"
                min="10"
                max="480"
                step="5"
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value) || 10)}
                className="w-full text-xs font-mono p-2 rounded-lg border border-amber-300 bg-amber-50/40 text-stone-900 text-center font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-0.5">
            <span className="text-stone-500">Quick target presets:</span>
            <div className="flex items-center gap-1">
              {[45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyMinutes(mins)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                    dailyMinutes === mins
                      ? 'bg-amber-400 text-stone-950 font-bold'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setDailySessions(recommendedTarget.recommendedSessions);
                setDailyQuestions(recommendedTarget.recommendedQuestions);
                setDailyMinutes(Math.round(recommendedTarget.recommendedQuestions * 1.6));
              }}
              className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2"
            >
              Fill with Adaptive Recommendation ({recommendedTarget.recommendedSessions} sessions • {recommendedTarget.recommendedQuestions} q's • ~{Math.round(recommendedTarget.recommendedQuestions * 1.6)}m)
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{saveToast ? 'SAVED!' : 'SAVE PREFERENCES'}</span>
            </button>
          </div>

          <section className="pt-4 border-t border-stone-200 space-y-2">
            <h4 className="font-bold text-xs text-stone-800">Learner data backup & restore</h4>
            <p className="text-[11px] text-stone-600">Export this device's learner progress, attempts, mistakes and practice evidence. Import replaces the current profile only after validation and confirmation.</p>
            <button type="button" onClick={exportLearnerData} className="w-full text-xs p-2.5 font-bold rounded-lg border border-blue-200 bg-blue-50 text-blue-900">Export learner backup (JSON)</button>
            <input ref={importInputRef} type="file" accept=".json,application/json" className="w-full text-xs" onChange={e=>{void readImportFile(e.target.files?.[0]??null);}} />
            {importError && <p role="alert" className="text-xs text-rose-700 bg-rose-50 p-2 rounded">{importError}</p>}
            {importPreview && <div className="bg-amber-50 p-3 rounded-lg text-xs border border-amber-200 space-y-2">
              <p className="font-semibold">Backup preview: {importPreview.subjects} subjects · {importPreview.tests} tests · {importPreview.errors} errors · {importPreview.keys} data keys.</p>
              <p>{importPreview.warning}</p>
              <label className="flex gap-2 items-start"><input type="checkbox" checked={confirmRestore} onChange={e=>setConfirmRestore(e.target.checked)}/><span>I understand this overwrites my current learner data. I have exported a backup.</span></label>
              <button type="button" disabled={!confirmRestore} onClick={executeRestore} className="w-full bg-rose-700 disabled:bg-stone-300 text-white text-xs p-2 rounded-lg font-semibold">Restore validated learner backup</button>
            </div>}
          </section>

          {typeof window!=='undefined' && localStorage.getItem(LEGACY_BACKUP) && (
            <button type="button" onClick={exportLegacyBackup} className="w-full text-xs border border-amber-300 rounded-lg p-2 text-amber-950 bg-amber-50">
              Export saved v10.8 pre-migration backup (JSON)
            </button>
          )}

          {/* Seed / Reset Demo Data section */}
          <div className="pt-4 border-t border-stone-100">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-left space-y-2 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-800 uppercase tracking-wider">Demo Seed Dataset</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Demo Only</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Replace current topic progress, test records, and errors with simulated demonstration data. This is not genuine learner performance.
              </p>
            </div>

            {confirmReset ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <p className="text-xs text-amber-900 font-medium">
                  Replace current progress and test history with fictional DEMO data? Export your current records first if needed.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 bg-amber-600 text-white font-bold text-xs py-2 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Yes, Populate Seed Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 bg-stone-200 text-stone-700 text-xs py-2 rounded-lg hover:bg-stone-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5 text-stone-500" />
                <span>Re-seed Complete ECE Algebra Mock Data</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
