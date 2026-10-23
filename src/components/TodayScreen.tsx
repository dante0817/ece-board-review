import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useMemo } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, ChevronRight, Play } from 'lucide-react';
import { useReview, ScreenType } from '../context/ReviewContext';
import { LEARNING_PATHS, recommendNextForPath } from '../domain/learning/learningPaths';
import { getDedicatedMathScreen } from '../utils/mathTopicNavigation';
import { ActiveSessionFocusCard } from './ActiveSessionFocusCard';
import { DailyForgettingCurveCard } from './DailyForgettingCurveCard';
import { StudyTipCard } from './StudyTipCard';
import { TodayTargetVisualizer } from './TodayTargetVisualizer';
import { PageHeader } from './layout/PageHeader';
import { PageShell } from './layout/PageShell';
import { SectionHeader } from './layout/SectionHeader';

const percent = (value: number, target: number) =>
  Math.min(100, Math.round((value / Math.max(1, target)) * 100));

export const TodayScreen: React.FC = () => {
  const {
    priorityReviewTopic,
    learningPath,
    subjects,
    testRecords,
    dailyStudyQueue,
    nextReviewQueue,
    startReview,
    openTopicDrawer,
    setCurrentScreen,
    currentDateStr,
    errors,
    userProfile,
    activeSession,
    dailyTarget,
    totalMinutesStudiedToday,
    allDueOrOverdueTopics,
    algebraCoveragePercent,
    algebraMasteryPercent,
    recommendedTarget,
    applyRecommendedTarget,
  } = useReview();

  const pathRecommendation = useMemo(
    () => recommendNextForPath(learningPath, subjects, testRecords, errors, dailyStudyQueue),
    [learningPath, subjects, testRecords, errors, dailyStudyQueue]
  );
  const openPathRecommendation = () => {
    if (pathRecommendation.action === 'mock') { setCurrentScreen('mock-exams'); return; }
    if (!pathRecommendation.topic) { setCurrentScreen('subjects'); return; }
    const screen = getDedicatedMathScreen(pathRecommendation.topic.id);
    if (screen) setCurrentScreen(screen as ScreenType);
    else openTopicDrawer(pathRecommendation.topic);
  };
  const priorityQueueItem = dailyStudyQueue.find((item) => item.topic.id === priorityReviewTopic?.id) ?? dailyStudyQueue[0] ?? null;
  const unresolvedErrors = errors.filter((error) => !error.isResolved);

  const displayDate = useMemo(() => {
    const parsed = new Date(`${currentDateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return currentDateStr;
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(parsed);
  }, [currentDateStr]);

  const firstName = (userProfile.name || 'Student').trim().split(/\s+/)[0] || 'Student';
  const targetMinutes = dailyTarget.targetMinutes || userProfile.dailyTargetMinutes || 60;
  const studyPercent = percent(totalMinutesStudiedToday, targetMinutes);
  const questionPercent = percent(dailyTarget.completedQuestionsToday, dailyTarget.targetQuestions);

  const visibleQueue = useMemo(() => {
    if (dailyStudyQueue.length > 0) return dailyStudyQueue.slice(0, 5);
    return nextReviewQueue.slice(0, 5).map((topic) => ({
      topic,
      subjectName: 'Mathematics',
      subjectCategory: 'Mathematics' as const,
      urgencyScore: 0,
      urgencyLevel: 'moderate' as const,
      flagReason: 'Initial Retention Check' as const,
      detailedRationale: ['Continue the next available review in your queue.'],
      daysSinceLastReview: 0,
      daysOverdue: -1,
      estimatedRetentionPercent: topic.retentionStrengthPercent ?? 100,
      recommendedAction: 'Continue review',
      suggestedQuestionCount: 10,
      suggestedDurationMinutes: 15,
      lastPerformanceSummary: topic.latestScore ? `Latest score ${topic.latestScore}%` : 'No recent score',
    }));
  }, [dailyStudyQueue, nextReviewQueue]);

  const focusSubjectName = priorityQueueItem?.subjectName || 'Mathematics';
  const focusScreen: ScreenType = priorityQueueItem?.subjectCategory === 'Electronics'
    ? 'electronics'
    : priorityQueueItem?.subjectCategory === 'Communications'
      ? 'est'
      : 'mathematics';
  const focusQueueCount = dailyStudyQueue.filter((item) => item.subjectName === focusSubjectName).length;
  const priorityTopicErrorCount = priorityReviewTopic
    ? unresolvedErrors.filter((error) => error.topicId === priorityReviewTopic.id).length
    : 0;

  const recommendationReasons = priorityQueueItem?.detailedRationale?.length
    ? priorityQueueItem.detailedRationale
    : recommendedTarget.rationale.slice(0, 4);

  const targetIsSynced =
    dailyTarget.targetSessions === recommendedTarget.recommendedSessions &&
    dailyTarget.targetQuestions === recommendedTarget.recommendedQuestions;

  return (
    <PageShell width="standard" className="pb-12">
      <div className="space-y-6">
        <PageHeader
          icon={<FeatureIcon name="today" />}
          eyebrow="Today"
          title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${firstName}`}
          description={`${displayDate} · ${LEARNING_PATHS[learningPath].description}`}
          actions={
            <button
              type="button"
              onClick={() => setCurrentScreen('overview')}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </button>
          }
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900" aria-label={`${LEARNING_PATHS[learningPath].label} recommendation`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FeatureIcon name={learningPath === 'guided' ? 'mathematics' : 'exams'} size="small" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">{LEARNING_PATHS[learningPath].label}</span>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">{pathRecommendation.evidenceLabel}</span>
          </div>
          <h2 className="mt-3 text-lg font-bold text-slate-950 dark:text-slate-100">{pathRecommendation.title}</h2>
          {pathRecommendation.topic && <p className="mt-1 text-sm font-semibold text-blue-800 dark:text-blue-300">{pathRecommendation.topic.name}</p>}
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">{pathRecommendation.explanation}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={openPathRecommendation}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
              {pathRecommendation.actionLabel} <ArrowRight className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setCurrentScreen('algebra')}
              className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">Full Algebra library</button>
            <button type="button" onClick={() => setCurrentScreen('mock-exams')}
              className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">Timed practice</button>
          </div>
          <details className="mt-4 text-xs text-slate-600 dark:text-slate-400">
            <summary className="cursor-pointer font-semibold">Why was this suggested?</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">{pathRecommendation.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
          </details>
          {learningPath === 'board' && <p className="mt-3 text-xs text-amber-800 dark:text-amber-300">Board preparation is not an official readiness certification. Other ECE areas and independent question families remain under development.</p>}
        </section>

        {activeSession ? (
          <ActiveSessionFocusCard />
        ) : (
          <>
        {priorityReviewTopic ? (
          <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-900/70 dark:bg-slate-900">
            <div className="border-b border-blue-100 bg-gradient-to-r from-blue-50 via-white to-white px-5 py-4 dark:border-blue-950 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="icon-3d icon-3d--small icon-3d--violet app-artwork-tile" aria-hidden="true"><AppArtwork name="star" /></span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">Scheduled retention review</span>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                  priorityQueueItem?.urgencyLevel === 'critical'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                    : priorityQueueItem?.urgencyLevel === 'high'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                }`}>
                  {priorityQueueItem?.urgencyLevel || 'priority'}
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openTopicDrawer(priorityReviewTopic)}
                    className="group flex max-w-full items-center gap-2 text-left"
                  >
                    <h2 className="truncate text-xl font-bold tracking-tight text-slate-950 group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300 sm:text-2xl">
                      {priorityReviewTopic.name}
                    </h2>
                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {priorityQueueItem?.subjectName || 'Mathematics'} · {priorityQueueItem?.flagReason || 'Priority review'}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Mastery {priorityReviewTopic.mastery ?? '—'}/5
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Latest {priorityReviewTopic.latestScore ?? '—'}%
                    </span>
                    {priorityQueueItem && (
                      <>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          ~{priorityQueueItem.suggestedDurationMinutes} min
                        </span>
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {priorityQueueItem.suggestedQuestionCount} questions
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  id="start-priority-review-btn"
                  type="button"
                  onClick={() => startReview(priorityReviewTopic, 'Practice Problems')}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
                >
                  <Play className="h-4 w-4 fill-current" /> Start review
                </button>
              </div>

              <details className="group mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                  Why this recommendation?
                </summary>
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                  <ul className="space-y-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {recommendationReasons.slice(0, 4).map((reason, index) => (
                      <li key={`${reason}-${index}`} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
            <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />
            <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">Scheduled reviews are up to date</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Choose a subject or practice drill when you are ready for the next study block.</p>
          </section>
        )}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400"><FeatureIcon name="session" size="small" /> Study time</span>
              <span className="text-sm font-bold text-slate-950 dark:text-slate-100">{totalMinutesStudiedToday}/{targetMinutes} min</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${studyPercent}%` }} /></div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400"><FeatureIcon name="queue" size="small" /> Reviews due</span>
              <span className="text-sm font-bold text-slate-950 dark:text-slate-100">{allDueOrOverdueTopics.length}</span>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Prioritized by retention, performance, and error history.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400"><FeatureIcon name="practice" size="small" /> Questions</span>
              <span className="text-sm font-bold text-slate-950 dark:text-slate-100">{dailyTarget.completedQuestionsToday}/{dailyTarget.targetQuestions}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${questionPercent}%` }} /></div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <SectionHeader
              title="Retention review queue"
              description="Retention reviews are available in either learning path."
              action={
                <button type="button" onClick={() => setCurrentScreen('queue')} className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  View all
                </button>
              }
            />

            {visibleQueue.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleQueue.map((item, index) => (
                  <div key={item.topic.id} className="flex items-center gap-3 py-3.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{index + 1}</span>
                    <button type="button" onClick={() => openTopicDrawer(item.topic)} className="min-w-0 flex-1 text-left">
                      <div className="truncate text-sm font-semibold text-slate-900 hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300">{item.topic.name}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{item.flagReason}</span><span>•</span><span>~{item.suggestedDurationMinutes} min</span><span>•</span><span>{item.suggestedQuestionCount} Q</span>
                      </div>
                    </button>
                    <button type="button" onClick={() => startReview(item.topic)} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-950/30">
                      <Play className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Review</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500 dark:bg-slate-950/50 dark:text-slate-400">No queued reviews right now.</div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <SectionHeader title="Current subject focus" description="A quick bridge back into the curriculum." />
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50">
              <div className="text-lg font-bold text-slate-950 dark:text-slate-100">{focusSubjectName}</div>
              {focusScreen === 'mathematics' ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Math coverage</div>
                    <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{algebraCoveragePercent}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Math mastery</div>
                    <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{algebraMasteryPercent}%</div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Queued reviews</div>
                    <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{focusQueueCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Topic errors</div>
                    <div className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{priorityTopicErrorCount}</div>
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> {unresolvedErrors.length} unresolved errors across your reviewer
              </div>
              <button type="button" onClick={() => setCurrentScreen(focusScreen)} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
                Open subject <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        <details className="group rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <span>
              <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">Study insights</span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">Retention curve and a compact study tip—available when you want more context.</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="grid gap-4 border-t border-slate-100 p-5 dark:border-slate-800 sm:p-6 lg:grid-cols-2">
            <DailyForgettingCurveCard />
            <StudyTipCard />
          </div>
        </details>

        <details className="group rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <span>
              <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">How today's plan was generated</span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">See the existing adaptive target and pacing details without putting the algorithm in the main study flow.</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-5 border-t border-slate-100 p-5 dark:border-slate-800 sm:p-6">
            <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/50 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{recommendedTarget.summaryHeadline}</div>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Recommended: {recommendedTarget.recommendedSessions} sessions · {recommendedTarget.recommendedQuestions} questions · about {recommendedTarget.recommendedPacingMinutes} minutes.
                </p>
              </div>
              <button
                type="button"
                disabled={targetIsSynced}
                onClick={applyRecommendedTarget}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold ${
                  targetIsSynced
                    ? 'cursor-default bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {targetIsSynced ? 'Target applied' : 'Apply recommended target'}
              </button>
            </div>

            {recommendedTarget.rationale.length > 0 && (
              <ul className="grid gap-2 text-xs leading-5 text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                {recommendedTarget.rationale.slice(0, 6).map((reason, index) => (
                  <li key={`${reason}-${index}`} className="flex gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                    <AppArtwork name="book" inline className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            )}

            <TodayTargetVisualizer />
          </div>
        </details>

          </>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5"><AppArtwork name="timer" inline className="h-3.5 w-3.5" /> Prioritized by the existing review engine</span>
          <span>•</span>
          <span>Detailed analytics remain on Dashboard and Progress</span>
        </div>
      </div>
    </PageShell>
  );
};
