import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { useReview } from '../context/ReviewContext';
import { calculateMasteryRecommendation, formatReviewDate } from '../utils/masteryCalculator';
import { MasteryLevel } from '../types';
import { CheckCircle2, X, Scale, AlertTriangle, Smile } from 'lucide-react';
import { useModalFocus } from '../hooks/useModalFocus';

const CONFIDENCE_LEVELS = [
  { value: 1, percent: 20, label: '1 - Very Low', detail: 'Guessing / High Anxiety' },
  { value: 2, percent: 40, label: '2 - Low', detail: 'Hesitant / Frequent Doubts' },
  { value: 3, percent: 60, label: '3 - Moderate', detail: 'Fair / Basic Rules Understood' },
  { value: 4, percent: 80, label: '4 - High', detail: 'Solid / Fast & Independent' },
  { value: 5, percent: 100, label: '5 - Very High', detail: 'Exam Ready / Full Fluency' },
];

export const ReviewModal: React.FC = () => {
  const { activeSession, isEndModalOpen } = useReview();
  if (!isEndModalOpen || !activeSession) return null;
  return <ReviewModalForm />;
};

// Mount a fresh form for each session; hooks must never follow a conditional return.
const ReviewModalForm: React.FC = () => {
  const {
    activeSession,
    activeSessionSeconds,
    isEndModalOpen,
    setIsEndModalOpen,
    cancelReview,
    completeReview,
    currentDateStr,
  } = useReview();

  const { topic } = activeSession;

  // Form states matching wireframe
  const [questionsAttempted, setQuestionsAttempted] = useState<number | ''>('');
  const [questionsCorrect, setQuestionsCorrect] = useState<number | ''>('');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState<number>(() => {
    if (activeSessionSeconds && activeSessionSeconds > 30) {
      return Math.max(1, Math.round(activeSessionSeconds / 60));
    }
    return 25;
  });
  const [usedNotes, setUsedNotes] = useState<'No' | 'Occasionally' | 'Frequently'>('No');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Normal' | 'Difficult'>('Normal');
  const [independenceRating, setIndependenceRating] = useState<number>(4);
  const [confidenceScore, setConfidenceScore] = useState<number>(() => {
    return activeSession.confidenceScore ?? topic.latestConfidence ?? 3;
  });
  const [notes, setNotes] = useState<string>('');

  // Never infer actual practice results from a demo value or an unfinished input.
  const attemptedCount = Number(questionsAttempted);
  const correctCount = Number(questionsCorrect);
  const validCounts = questionsAttempted !== '' && questionsCorrect !== '' &&
    Number.isInteger(attemptedCount) && attemptedCount >= 1 && attemptedCount <= 200 &&
    Number.isInteger(correctCount) && correctCount >= 0 && correctCount <= attemptedCount;
  const scorePercent = validCounts ? Math.round(correctCount / attemptedCount * 100) : 0;
  const dialogRef = useModalFocus<HTMLDivElement>(isEndModalOpen, () => setIsEndModalOpen(false));

  // Confidence & Calibration metrics
  const confidencePercent = confidenceScore * 20;
  const calibrationDelta = scorePercent - confidencePercent;
  const isUnderconfident = calibrationDelta >= 15;
  const isOverconfident = calibrationDelta <= -15;
  const isCalibrated = !isUnderconfident && !isOverconfident;

  // App evidence-based recommendation calculation
  const recommendation = useMemo(() => {
    return calculateMasteryRecommendation({
      accuracyPercent: scorePercent,
      difficulty,
      usedNotes,
      questionsAttempted: attemptedCount,
      timeSpentMinutes,
      independenceRating,
      confidenceScore,
      previousMastery: topic.mastery,
      previousScore: topic.latestScore,
      anchorDateStr: currentDateStr,
    });
  }, [
    scorePercent,
    difficulty,
    usedNotes,
    attemptedCount,
    timeSpentMinutes,
    independenceRating,
    confidenceScore,
    topic.mastery,
    topic.latestScore,
    currentDateStr,
  ]);

  // Selected mastery defaults to suggested, but user can override
  const [chosenMastery, setChosenMastery] = useState<MasteryLevel | null>(null);
  const finalMastery = chosenMastery !== null ? chosenMastery : recommendation.suggestedMastery;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validCounts) return;
    completeReview({
      topicId: topic.id,
      questionsAttempted: attemptedCount,
      questionsCorrect: correctCount,
      timeSpentMinutes,
      usedNotes,
      difficulty,
      independenceRating,
      confidenceScore,
      newMastery: finalMastery,
      nextReviewDate: recommendation.nextReviewDate,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-full overflow-y-auto p-6 sm:p-7 shadow-2xl border border-stone-200" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Review completion">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4">
          <div>
            <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {topic.subjectId === 'subj-math-algebra' ? 'Algebra' : 'ECE Subject'} • Review Completion
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 mt-0.5">
              COMPLETE REVIEW: {topic.name}
            </h2>
          </div>
          <button
            onClick={() => setIsEndModalOpen(false)}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 pt-4">
          {/* Questions, Correct, Time & Score grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div>
              <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                Attempted
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={questionsAttempted}
                required
                onChange={(e) => setQuestionsAttempted(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-sm font-mono font-bold p-1.5 bg-white border border-stone-300 rounded text-center"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                Correct
              </label>
              <input
                type="number"
                min="0"
                max={attemptedCount >= 1 ? attemptedCount : 200}
                value={questionsCorrect}
                required
                onChange={(e) => setQuestionsCorrect(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full text-sm font-mono font-bold p-1.5 bg-white border border-stone-300 rounded text-center"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                Time (Min)
              </label>
              <input
                type="number"
                min="1"
                max="240"
                value={timeSpentMinutes}
                onChange={(e) => setTimeSpentMinutes(Number(e.target.value) || 1)}
                className="w-full text-sm font-mono font-bold p-1.5 bg-white border border-stone-300 rounded text-center"
              />
            </div>

            <div className="text-center flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-stone-500">Score</span>
              <span className="text-lg font-mono font-extrabold text-stone-900 mt-0.5">
                {validCounts ? `${scorePercent}%` : '—'}
              </span>
            </div>
          </div>

          {!validCounts && <p className="text-xs text-amber-800">Enter your actual attempted and correct answers before saving; no sample score is supplied.</p>}

          {/* Used Notes? */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1.5">
              Used notes or formula sheet?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['No', 'Occasionally', 'Frequently'] as const).map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setUsedNotes(option)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    usedNotes === option
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {option === 'No' ? '○ No' : option === 'Occasionally' ? '○ Occasionally' : '○ Frequently'}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-bold text-stone-800 block mb-1.5">
              Question Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Easy', 'Normal', 'Difficult'] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    difficulty === level
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {level === 'Normal' ? '● Normal' : `○ ${level}`}
                </button>
              ))}
            </div>
          </div>

          {/* Independence Question (Separating Mastery from Confidence) */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <AppArtwork name="brain" inline className="w-4 h-4 text-amber-600" />
                <span>How well can you solve this independently now?</span>
              </label>
              <span className="text-xs font-mono font-bold text-stone-800">
                {independenceRating} / 5
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mb-2.5">
              1 = Needs guided steps • 3 = Can solve standard problems • 5 = Fast board exam fluency
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setIndependenceRating(lvl)}
                  className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                    independenceRating === lvl
                      ? 'bg-amber-500 text-stone-950 border-amber-600 font-extrabold shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Self-Assessment: Topic Confidence Score */}
          <div
            id="self-assessment-confidence-section"
            className="p-3.5 sm:p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                <span>Self-Assessment: Confidence Score</span>
              </label>
              <span className="text-xs font-mono font-extrabold text-stone-900 bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-200">
                {confidenceScore} / 5 ({confidencePercent}%)
              </span>
            </div>

            <p className="text-[11px] text-stone-500">
              Rate your subjective confidence on this topic before/during this review session:
            </p>

            {/* 5-Level Interactive Buttons with SRS Interval hints */}
            <div className="grid grid-cols-5 gap-1.5">
              {CONFIDENCE_LEVELS.map((lvl) => {
                const isSelected = confidenceScore === lvl.value;
                const srsHint =
                  lvl.value === 1
                    ? '1d'
                    : lvl.value === 2
                    ? '2-3d'
                    : lvl.value === 3
                    ? '5-7d'
                    : lvl.value === 4
                    ? '10-14d'
                    : '21d+';
                return (
                  <button
                    type="button"
                    key={lvl.value}
                    onClick={() => setConfidenceScore(lvl.value)}
                    className={`py-2 px-1 text-center rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-600 font-extrabold shadow-xs ring-2 ring-amber-400/40'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100 font-medium'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">Lvl {lvl.value}</div>
                    <div className="text-[9px] truncate mt-0.5 opacity-80">{lvl.percent}%</div>
                    <div
                      className={`text-[9px] font-mono mt-0.5 font-bold px-1 rounded ${
                        isSelected ? 'bg-amber-600 text-white' : 'text-stone-500 bg-stone-100'
                      }`}
                    >
                      SRS {srsHint}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* SRS preview requires real counts, not an assumed baseline. */}
            {validCounts && <div className="p-2.5 bg-white border border-stone-200 rounded-lg flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="text-stone-700 font-medium">SRS Auto-Schedule:</span>
                <span className="font-mono font-bold text-stone-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {recommendation.nextReviewIntervalDays === 1
                    ? 'Tomorrow (1 day)'
                    : `In ${recommendation.nextReviewIntervalDays} days`}
                </span>
                <span className="text-[11px] text-stone-500">
                  ({formatReviewDate(recommendation.nextReviewDate, currentDateStr)})
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded uppercase font-mono">
                Paced by Confidence {confidenceScore}/5
              </span>
            </div>}

            {/* Selected Level Description */}
            <div className="text-[11px] font-medium text-stone-700 bg-white border border-stone-200 rounded-lg p-2.5 flex items-center justify-between">
              <span>
                Felt Confidence:{' '}
                <strong className="text-stone-900 font-bold">
                  {CONFIDENCE_LEVELS[confidenceScore - 1]?.detail}
                </strong>
              </span>
              <span className="text-stone-400 text-[10px] uppercase font-mono">Self-Perception</span>
            </div>

            {/* Confidence vs Actual Performance Comparison */}
            {validCounts && <div className="pt-3 border-t border-stone-200 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <AppArtwork name="graph" inline className="w-3.5 h-3.5 text-amber-600" />
                  <span>Confidence vs. Actual Performance</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isCalibrated
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : isUnderconfident
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                >
                  {isCalibrated
                    ? `Accurately Calibrated (${calibrationDelta >= 0 ? `+${calibrationDelta}` : calibrationDelta}%)`
                    : isUnderconfident
                    ? `Underconfident (+${calibrationDelta}%)`
                    : `Overconfident (${calibrationDelta}%)`}
                </span>
              </div>

              {/* Dual Visual Progress Bars */}
              <div className="space-y-2 bg-white p-3 rounded-lg border border-stone-200">
                {/* Confidence Bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-stone-600 font-medium">Your Confidence Score (Feeling)</span>
                    <span className="font-mono font-bold text-stone-900">{confidencePercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${confidencePercent}%` }}
                    />
                  </div>
                </div>

                {/* Actual Performance Bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-stone-600 font-medium">Actual Test Performance (Result)</span>
                    <span className="font-mono font-bold text-stone-900">
                      {validCounts ? `${scorePercent}% (${correctCount}/${attemptedCount} correct)` : 'Enter actual question counts'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        scorePercent >= 80
                          ? 'bg-emerald-500'
                          : scorePercent >= 70
                          ? 'bg-blue-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${scorePercent}%` }}
                    />
                  </div>
                </div>

                {/* Metacognitive Calibration Insight Alert */}
                <div
                  className={`p-2.5 rounded-lg text-[11px] flex items-start gap-2 ${
                    isCalibrated
                      ? 'bg-emerald-50/80 text-emerald-950 border border-emerald-200'
                      : isUnderconfident
                      ? 'bg-blue-50/80 text-blue-950 border border-blue-200'
                      : 'bg-rose-50/80 text-rose-950 border border-rose-200'
                  }`}
                >
                  {isCalibrated ? (
                    <AppArtwork name="shield" inline className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : isUnderconfident ? (
                    <Smile className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {isCalibrated
                        ? 'Accurately Calibrated'
                        : isUnderconfident
                        ? 'Hidden Strength (Underconfident)'
                        : 'Concept Blindspot Alert (Overconfident)'}
                    </div>
                    <p className="text-[10.5px] leading-relaxed mt-0.5 opacity-90">
                      {isCalibrated
                        ? 'Your self-assessment closely matches your objective accuracy. High metacognitive accuracy prevents panic and second-guessing on board exam day.'
                        : isUnderconfident
                        ? `You scored +${calibrationDelta}% higher than your confidence rating! You know the material better than you think. Trust your preparation and instincts.`
                        : `Your confidence exceeded your actual accuracy by ${Math.abs(
                            calibrationDelta
                          )}%. Check for algebraic sign slips, deceptive board distractor options, or rushed formula recalls.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>}
          </div>

          {/* Evidence-based App Recommendation Box */}
          {validCounts ? <div className="p-4 bg-amber-50/80 border-2 border-amber-300 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AppArtwork name="star" inline className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Evidence-Based Recommendation
                </span>
              </div>
              <div className="text-xs font-bold text-amber-900 font-mono">
                Mastery {topic.mastery ?? 1} → {recommendation.suggestedMastery}
              </div>
            </div>

            {/* Evidence details */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-amber-900 bg-amber-100/60 p-2 rounded-lg font-mono">
              <div>Acc: {recommendation.evidenceSummary.accuracy}</div>
              <div>Diff: {recommendation.evidenceSummary.difficulty}</div>
              <div>Conf: {confidenceScore}/5</div>
              <div>Notes: {recommendation.evidenceSummary.notes}</div>
              <div>Timed: Yes</div>
            </div>

            <div className="text-xs text-amber-950 space-y-1">
              <div className="font-semibold text-amber-900">Reason:</div>
              <ul className="space-y-1 pl-1">
                {recommendation.reasons.map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-amber-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-amber-950 font-semibold flex items-center gap-1">
                  <AppArtwork name="calendar" inline className="w-3.5 h-3.5" /> SRS Spaced Repetition Follow-up:
                </span>
                <span className="font-bold text-amber-950 font-mono">
                  {formatReviewDate(recommendation.nextReviewDate, currentDateStr)} (
                  {recommendation.nextReviewIntervalDays}d spaced)
                </span>
              </div>
              {recommendation.confidencePacingNote && (
                <div className="text-[11px] text-amber-900 bg-white/70 px-2.5 py-1.5 rounded border border-amber-200/60 leading-relaxed font-medium flex items-center justify-between">
                  <span>{recommendation.confidencePacingNote}</span>
                  {recommendation.calibrationSafetyApplied && (
                    <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded uppercase shrink-0 ml-2">
                      SRS Override
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Manual override buttons if Sunny wants to adjust */}
            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
              <span className="text-[11px] text-amber-900 font-medium">Confirm Level:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setChosenMastery(lvl as MasteryLevel)}
                    className={`w-6 h-6 text-xs font-mono font-bold rounded ${
                      finalMastery === lvl
                        ? 'bg-stone-900 text-amber-400'
                        : 'bg-white text-stone-600 border border-stone-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div> : <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            Performance comparison and mastery scheduling will appear after you enter actual attempted and correct counts.
          </div>}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEndModalOpen(false)}
              className="px-4 py-3 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              Back to Timer
            </button>
            <button
              id="save-review-completion-btn"
              type="submit"
              disabled={!validCounts}
              title={!validCounts ? "Enter the actual attempted and correct counts first" : undefined}
              className="flex-1 disabled:opacity-50 disabled:cursor-not-allowed bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold py-3 rounded-xl transition-all text-sm shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>SAVE & UPDATE MASTERY</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
