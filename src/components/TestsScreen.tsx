import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useState, useEffect } from 'react';
import { useReview } from '../context/ReviewContext';
import { TestRecord } from '../types';
import { classifyEvidence } from '../domain/assessment/evidence';
import { PlusCircle, CheckCircle2, Play } from 'lucide-react';
import { TimedMockExam } from './TimedMockExam';

export const TestsScreen: React.FC = () => {
  const {
    testRecords,
    addTestRecord,
    allTopics,
    currentSubject,
    currentDateStr,
    testModalPreselectedTopicId,assessmentSession,
  } = useReview();

  // Tab view: 'simulator' (interactive timed mock exam) or 'records' (manual log & history)
  const [activeTab, setActiveTab] = useState<'simulator' | 'records'>('simulator');

  // Test form state matching wireframe
  const [testType, setTestType] = useState<string>('Mixed Algebra Diagnostic');

  const [date, setDate] = useState<string>(currentDateStr);
  const [questions, setQuestions] = useState<number>(0);
  const [correct, setCorrect] = useState<number>(0);
  const [incorrect, setIncorrect] = useState<number>(0);
  const [unanswered, setUnanswered] = useState<number>(0);
  const [timeMinutes, setTimeMinutes] = useState<number>(0);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');

  // Auto-select topic if preselected from drawer
  useEffect(() => {
    if (testModalPreselectedTopicId) {
      if (!selectedTopics.includes(testModalPreselectedTopicId)) {
        setSelectedTopics((prev) => [...prev, testModalPreselectedTopicId]);
      }
    }
  }, [testModalPreselectedTopicId]);

  // Adjust incorrect automatically when correct/unanswered change, or keep in sync
  const toggleTopic = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  };

  const calculatedScore = Math.min(
    100,
    Math.max(0, Math.round((correct / Math.max(1, questions)) * 100))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (![questions,correct,incorrect,unanswered].every(n=>Number.isSafeInteger(n)&&n>=0) || questions===0 ||
        correct+incorrect+unanswered!==questions || !Number.isFinite(timeMinutes) || timeMinutes<0) {
      setValidationMessage('Enter positive total questions and ensure correct + incorrect + unanswered equals total.');
      return;
    }
    setValidationMessage('');
    addTestRecord({
      provenance:'manual',assessmentMode:'manual',scope:'subject',
      subjectId: currentSubject.id,
      testType,
      date,
      questions,
      correct,
      incorrect,
      unanswered,
      timeMinutes,
      topicIds: selectedTopics,
      notes: notes.trim() || undefined,
    });

    setSaveSuccessMessage(true);
    setTimeout(() => setSaveSuccessMessage(false), 3000);
  };

  // Filter topics for the current subject
  const currentSubjectTopics = allTopics.filter((t) => t.subjectId === currentSubject.id);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header & Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
            <FeatureIcon name="exams" />
            <span>Board Examination & Mock Tests</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Take timed mixed practice or separately log an offline test. Neither is an official PRC examination.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-stone-900 text-amber-400 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-amber-400" />
            <span>Timed Mock Exam</span>
            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-amber-400 text-stone-950 rounded-full">
              Live
            </span>
          </button>

          <button
            type="button"
            onClick={() => {if(assessmentSession.status!=='strict-active'&&assessmentSession.status!=='study-active')setActiveTab('records');}}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'records'
                ? 'bg-stone-900 text-stone-50 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <AppArtwork name="exam" inline className="w-3.5 h-3.5" />
            <span>Recorded Tests ({testRecords.length})</span>
          </button>
        </div>
      </div>

      {/* RENDER: TIMED MOCK EXAM SIMULATOR */}
      {activeTab === 'simulator' ? (
        <TimedMockExam onBackToHistory={() => {if(assessmentSession.status!=='strict-active'&&assessmentSession.status!=='study-active')setActiveTab('records');}} />
      ) : (
        /* RENDER: MANUAL RECORD FORM & HISTORY */
        <div className="space-y-6">
          {/* Invitation Banner to Launch Timed Simulator */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0 app-artwork-tile">
                <AppArtwork name="timer" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-50">
                  Ready for a Timed Mixed Practice Mock?
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Practice timed test-taking with real-time countdown, formula scratchpad, and automated grading.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Practice Mock</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Record Test Form (Matches Requirement 13) */}
            <div className="lg:col-span-5 bg-white border-2 border-stone-900 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-3">
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  RECORD TEST
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  Score: {calculatedScore}%
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Test Type */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Test Type</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-stone-50 font-medium"
                  >
                    <option value="Mixed Algebra Comprehensive">Mixed Algebra Comprehensive</option>
                    <option value="Equations & Formulas Timed Mock">Equations & Formulas Timed Mock</option>
                    <option value="Weekly Board Diagnostic #3">Weekly Board Diagnostic #3</option>
                    <option value="Full ECE Mathematics Mock">Full ECE Mathematics Mock</option>
                    <option value="Foundations Speed Drill">Foundations Speed Drill</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white font-mono"
                  />
                </div>

                {/* Questions tally grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                      Questions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={questions}
                      onChange={(e) => setQuestions(Number(e.target.value) || 1)}
                      className="w-full text-xs font-mono font-bold p-1.5 bg-white border border-stone-300 rounded text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                      Correct
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={questions}
                      value={correct}
                      onChange={(e) => setCorrect(Number(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold p-1.5 bg-white border border-stone-300 rounded text-center text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                      Incorrect
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={questions}
                      value={incorrect}
                      onChange={(e) => setIncorrect(Number(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold p-1.5 bg-white border border-stone-300 rounded text-center text-rose-700"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                      Unanswered
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={questions}
                      value={unanswered}
                      onChange={(e) => setUnanswered(Number(e.target.value) || 0)}
                      className="w-full text-xs font-mono font-bold p-1.5 bg-white border border-stone-300 rounded text-center text-stone-500"
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Time (Minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(Number(e.target.value) || 1)}
                    className="w-full text-xs font-mono p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>

                {/* Topics Multi-Select Checklist */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1.5">
                    Topics Covered in Test
                  </label>
                  <div className="max-h-40 overflow-y-auto p-2.5 border border-stone-200 rounded-lg space-y-1.5 bg-stone-50 text-xs">
                    {currentSubjectTopics.map((topic) => {
                      const isChecked = selectedTopics.includes(topic.id);
                      return (
                        <label
                          key={topic.id}
                          className="flex items-center gap-2 hover:bg-stone-200/50 p-1 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleTopic(topic.id)}
                            className="w-3.5 h-3.5 rounded text-stone-900 border-stone-300"
                          />
                          <span className={isChecked ? 'font-semibold text-stone-900' : 'text-stone-600'}>
                            {topic.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[11px] font-medium text-stone-600 block mb-1">
                    Reflections / Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Time management, difficult topics, recurring errors noticed..."
                    rows={2}
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>

                {/* Submit */}
                <button
                  id="save-test-btn"
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-3 rounded-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>SAVE TEST</span>
                </button>

                {validationMessage && <p role="alert" className="text-xs text-red-700">{validationMessage}</p>}
                {saveSuccessMessage && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Manual test recorded. Verified topic mastery is unchanged.</span>
                  </div>
                )}
              </form>
            </div>

            {/* Test History List */}
            <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Test History ({testRecords.length})
                </h2>
                <span className="text-xs text-stone-500 font-mono">App practice targets only, not official passing criteria</span>
              </div>

              <div className="space-y-3">
                {testRecords.map((record) => {
                  const isPassing = record.scorePercent >= 70;
                  const isBoardTarget = record.scorePercent >= 90;

                  return (
                    <div
                      key={record.id}
                      className="p-4 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors bg-stone-50/50 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-stone-900">{record.testType} <span className="text-[11px] font-semibold text-blue-800">({classifyEvidence(record).replaceAll('-', ' ')})</span></h3>
                          <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                            <AppArtwork name="calendar" inline className="w-3 h-3" />
                            <span>{record.date}</span>
                            <span>•</span>
                            <AppArtwork name="timer" inline className="w-3 h-3" />
                            <span>{record.timeMinutes} min</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-lg font-mono font-bold ${
                              isBoardTarget
                                ? 'text-emerald-700'
                                : isPassing
                                ? 'text-stone-900'
                                : 'text-rose-600'
                            }`}
                          >
                            {record.scorePercent}%
                          </div>
                          <span className="text-[10px] text-stone-500">
                            {record.correct} / {record.questions} correct
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-stone-600 flex gap-3 flex-wrap">
                        <span>{record.itemResults?.length === record.questions ? `Item-level evidence: ${record.questions} recorded answers` : 'Aggregate only: no verified question answers'}</span>
                        {record.assessmentMode === 'strict' && <span>Strict (self-attested, not proctored)</span>}
                        {(record.pausedSeconds??0)>0 && <span>Paused {record.pausedSeconds}s</span>}
                        {record.assistanceUsed && <span>Reference/hint used</span>}
                      </div>
                      {record.examBlueprint && <p className="text-[11px] text-amber-800 font-medium">{record.tosCourseResults?'PRC course-quota practice (provisional)':'PRC subject-weight practice'} · {record.examBlueprint.deliveredQuestions}/{record.examBlueprint.requestedQuestions} planned questions · {record.examBlueprint.missingQuestions} unavailable · Not a representative board exam.</p>}
                      {record.examAreaResults && <div className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-700">
                        {record.examAreaResults.map(area=><span key={area.areaId} className="rounded border border-stone-200 bg-white p-2">{area.name}: {area.questions ? `${area.correct}/${area.questions} (${area.scorePercent}%)` : 'Not assessed'}</span>)}
                      </div>}
                      {record.tosCourseResults && <details className="rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2">
                        <summary className="cursor-pointer font-semibold text-xs text-amber-900">PRC TOS course scores and shortages (provisional editorial alignment)</summary>
                        <p className="text-[11px] mt-2 text-stone-600">Not a certified full-board mock. Empty courses are Not assessed; older records remain unchanged.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2 text-[11px]">
                          {record.tosCourseResults.filter(course=>course.requested>0).map(course=><div key={course.courseId} className="p-2 rounded border border-stone-200 bg-white">
                            <strong>{course.name}</strong> · {course.questions}/{course.requested} delivered · {course.questions ? `${course.correct}/${course.questions} (${course.scorePercent}%)` : 'Not assessed'}
                          </div>)}
                        </div>
                      </details>}
                      {/* Breakdown tally */}
                      <div className="flex items-center gap-3 text-xs font-mono text-stone-600 bg-white p-2 rounded border border-stone-200/60">
                        <span className="text-emerald-700 font-semibold">✓ {record.correct} correct</span>
                        <span className="text-rose-700 font-semibold">✕ {record.incorrect} incorrect</span>
                        {record.unanswered > 0 && (
                          <span className="text-stone-400">○ {record.unanswered} omitted</span>
                        )}
                      </div>

                      {/* Topic tags */}
                      {record.topicIds && record.topicIds.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          <span className="text-[10px] uppercase font-semibold text-stone-400">
                            Topics:
                          </span>
                          {record.topicIds.map((tId) => {
                            const top = allTopics.find((t) => t.id === tId);
                            return (
                              <span
                                key={tId}
                                className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-200 text-stone-800"
                              >
                                {top ? top.name : tId}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {record.notes && (
                        <p className="text-xs text-stone-600 italic bg-amber-50/50 p-2 rounded border border-amber-200/50">
                          "{record.notes}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
