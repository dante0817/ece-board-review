import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, FastForward } from 'lucide-react';
import { MathFormula } from './MathFormula';
import { ConceptMasteryProgressBar } from './ConceptMasteryProgressBar';
import {
  ConceptId,
  ConceptScheduleItem,
  RealNumbersScheduleState,
  loadRealNumbersSchedule,
  advanceSimulatedDays,
  resetScheduleToDefault,
  markConceptReviewedToday,
  SCHEDULE_UPDATED_EVENT,
  diffDaysYMD,
  getConceptMastery,
} from '../utils/realNumbersScheduler';

interface RealNumbersSpacedSchedulerProps {
  onNavigateLearn: (stepId: number) => void;
  onNavigateQuiz: (stepId: number) => void;
  onNavigateFlashcards?: (stepId?: number) => void;
}

export const RealNumbersSpacedScheduler: React.FC<RealNumbersSpacedSchedulerProps> = ({
  onNavigateLearn,
  onNavigateQuiz,
  onNavigateFlashcards,
}) => {
  const [scheduleState, setScheduleState] = useState<RealNumbersScheduleState>(() =>
    loadRealNumbersSchedule()
  );
  const [activeConceptDetail, setActiveConceptDetail] = useState<ConceptId | null>(null);

  // Sync with storage events so any quiz submission immediately updates this view
  useEffect(() => {
    const handleUpdate = () => {
      setScheduleState(loadRealNumbersSchedule());
    };

    window.addEventListener(SCHEDULE_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(SCHEDULE_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const conceptsList: ConceptScheduleItem[] = Object.values(scheduleState.concepts);

  // Identify concepts needing review
  const dueOrRemediationConcepts = conceptsList.filter(
    (c) => c.status === 'due' || c.status === 'remediation'
  );
  const dueSoonConcepts = conceptsList.filter((c) => c.status === 'due_soon');

  // Overall retention average
  const avgRetention = Math.round(
    conceptsList.reduce((acc, c) => acc + c.estimatedRetention, 0) / conceptsList.length
  );

  const handleAdvanceDays = (days: number) => {
    const updated = advanceSimulatedDays(days);
    setScheduleState(updated);
  };

  const handleResetSchedule = () => {
    if (window.confirm('Reset spaced-repetition schedule back to baseline?')) {
      const reset = resetScheduleToDefault();
      setScheduleState(reset);
    }
  };

  const handleMarkReviewed = (conceptId: ConceptId) => {
    const updated = markConceptReviewedToday(conceptId);
    setScheduleState(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Scheduler Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs app-artwork-tile">
            <AppArtwork name="timer" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Spaced-Repetition Concept Scheduler
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                SM-2 Adaptive
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Reinforces Real Numbers concepts based on your 3-question Knowledge Check scores to combat the Ebbinghaus forgetting curve.
            </p>
          </div>
        </div>

        {/* Date Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 text-slate-700 font-semibold border-r border-slate-200 pr-3">
            <AppArtwork name="calendar" inline className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulated Date: <strong>{scheduleState.currentSimulatedDate}</strong></span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleAdvanceDays(1)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Fast-forward 1 day to simulate memory decay"
            >
              <FastForward className="w-3 h-3 text-slate-500" />
              <span>+1 Day</span>
            </button>
            <button
              type="button"
              onClick={() => handleAdvanceDays(3)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Fast-forward 3 days to test due concept alerts"
            >
              <FastForward className="w-3 h-3 text-slate-500" />
              <span>+3 Days</span>
            </button>
            <button
              type="button"
              onClick={handleResetSchedule}
              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
              title="Reset schedule to baseline"
            >
              <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Action Prompt if Any Concepts are Due or Need Remediation */}
      {dueOrRemediationConcepts.length > 0 && (
        <div className="bg-linear-to-r from-amber-50 via-orange-50 to-rose-50 border-2 border-amber-300/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-amber-950 text-base">
                    Concept Review Prompt: Revisit Needed!
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-[10px]">
                    {dueOrRemediationConcepts.length} Concept{dueOrRemediationConcepts.length > 1 ? 's' : ''} Due
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 mt-0.5">
                  Your memory retention has dropped below the 70% retention threshold on the following concept{dueOrRemediationConcepts.length > 1 ? 's' : ''}. Take action to prevent board exam lapses.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {dueOrRemediationConcepts.map((item) => (
              <div
                key={item.id}
                className="bg-white/95 backdrop-blur-xs border border-amber-200/90 rounded-xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md mb-1">
                      Step {item.stepId} • {item.status === 'remediation' ? 'Remediation Needed' : 'Due for Review'}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">{item.title}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-xs font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                      {item.estimatedRetention}% Retention
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Last: {item.lastScore}/3 on {item.lastAttemptDate}
                    </div>
                  </div>
                </div>

                {/* Small Mastery Progress Bar based on Knowledge Check */}
                <div className="bg-amber-50/70 rounded-lg p-2 border border-amber-200/70">
                  <ConceptMasteryProgressBar concept={item} size="sm" showScoreText={true} />
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onNavigateLearn(item.stepId)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Revisit Step {item.stepId}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateQuiz(item.stepId)}
                    className="py-1.5 px-3 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-600" />
                    <span>3-Q Retest</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module Retention Overview Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold app-artwork-tile">
            <AppArtwork name="brain" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Real Numbers Average Retention</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{avgRetention}%</span>
              <span className={`text-xs font-bold ${avgRetention >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {avgRetention >= 80 ? 'Optimal' : 'Needs Reinforcement'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Concepts Exam-Ready</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">
                {conceptsList.filter((c) => c.status === 'fresh').length} of {conceptsList.length}
              </span>
              <span className="text-xs text-slate-400 font-medium">Step coverage</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold app-artwork-tile">
            <AppArtwork name="graph" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">SuperMemo SM-2 Factor</div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900">
                {(
                  conceptsList.reduce((acc, c) => acc + c.easeFactor, 0) / conceptsList.length
                ).toFixed(2)}
              </span>
              <span className="text-xs text-purple-600 font-bold">Ease Benchmark (2.50)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of the 4 Concept Scheduler Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
            Concept Spaced-Repetition Matrix
          </h4>
          <span className="text-xs text-slate-500">
            Click any concept card to expand details & historical quiz trends
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conceptsList.map((concept) => {
            const isDue = concept.status === 'due' || concept.status === 'remediation';
            const isDueSoon = concept.status === 'due_soon';
            const daysUntil = diffDaysYMD(scheduleState.currentSimulatedDate, concept.nextReviewDate);

            return (
              <div
                key={concept.id}
                className={`bg-white border-2 rounded-2xl p-5 shadow-2xs transition-all space-y-4 ${
                  isDue
                    ? 'border-amber-400/90 shadow-amber-100/50'
                    : isDueSoon
                    ? 'border-blue-200 hover:border-blue-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                        {concept.stepId}
                      </span>
                      <h5 className="font-extrabold text-slate-900 text-base">{concept.title}</h5>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{concept.description}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 text-right">
                    {concept.status === 'remediation' ? (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px] inline-flex items-center gap-1 border border-rose-200">
                        <AlertTriangle className="w-3 h-3" />
                        Remediation
                      </span>
                    ) : concept.status === 'due' ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px] inline-flex items-center gap-1 border border-amber-200">
                        <AppArtwork name="timer" inline className="w-3 h-3" />
                        Due Today
                      </span>
                    ) : concept.status === 'due_soon' ? (
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] inline-flex items-center gap-1 border border-blue-200">
                        <AppArtwork name="timer" inline className="w-3 h-3" />
                        Due in {daysUntil}d
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] inline-flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Fresh ({daysUntil}d)
                      </span>
                    )}
                  </div>
                </div>

                {/* Formulas preview */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex flex-wrap items-center gap-3 text-xs">
                  {concept.keyFormulas.map((f, idx) => (
                    <div key={idx} className="overflow-x-auto text-slate-700">
                      <MathFormula formula={f} />
                    </div>
                  ))}
                </div>

                {/* Knowledge Check Mastery Progress Bar */}
                <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200/80">
                  <ConceptMasteryProgressBar
                    concept={concept}
                    size="md"
                    label="Knowledge Check Mastery"
                    showScoreText={true}
                  />
                </div>

                {/* Retention Bar & Stats */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Estimated Memory Retention</span>
                    <span
                      className={`font-black ${
                        concept.estimatedRetention >= 85
                          ? 'text-emerald-600'
                          : concept.estimatedRetention >= 70
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {concept.estimatedRetention}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        concept.estimatedRetention >= 85
                          ? 'bg-emerald-500'
                          : concept.estimatedRetention >= 70
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${concept.estimatedRetention}%` }}
                    />
                  </div>
                </div>

                {/* Scheduler Diagnostics */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50/80 rounded-xl border border-slate-100 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Last Quiz</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {concept.lastScore}/3 Correct
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Interval</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                      {concept.intervalDays} day{concept.intervalDays > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Next Date</div>
                    <div className="text-xs font-bold text-blue-600 mt-0.5">
                      {concept.nextReviewDate}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigateLearn(concept.stepId)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title={`Revisit Lesson Step ${concept.stepId}`}
                  >
                    <span>Revisit Concept</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateQuiz(concept.stepId)}
                    className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Take a 3-Question Knowledge Check for this concept"
                  >
                    <AppArtwork name="star" inline className="w-3.5 h-3.5" />
                    <span>3-Q Quiz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkReviewed(concept.id)}
                    className="p-2 rounded-xl bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Quick Mark as Reviewed Today (Score 3/3)"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spaced-Repetition Theory & Board Exam Strategy Note */}
      <div className="bg-linear-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100 rounded-2xl p-5 text-xs text-slate-700 space-y-3">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
          <AppArtwork name="brain" inline className="w-4 h-4 text-blue-600" />
          <span>How the Real Numbers Spaced-Repetition Scheduler Works</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600">
          <div className="space-y-1">
            <strong className="text-slate-900 block font-semibold">1. Knowledge Check Calibration</strong>
            <p>
              Every 3-question drill updates that concept's recall grade. A score of <strong>3/3</strong> expands the interval (2d &rarr; 5d &rarr; 12d), while <strong>&le; 1/3</strong> prompts immediate 1-day remediation.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-900 block font-semibold">2. Ebbinghaus Curve Protection</strong>
            <p>
              Mathematical definitions like principal root non-negativity and closure rules decay by 50% within 48 hours without reinforcement. Timely prompts lock them into long-term memory.
            </p>
          </div>
          <div className="space-y-1">
            <strong className="text-slate-900 block font-semibold">3. Adaptive Ease Factor (SM-2)</strong>
            <p>
              Concepts with frequent traps (like √(x²) = |x|) adapt to smaller intervals, ensuring you revisit them right before forgetting sets in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
