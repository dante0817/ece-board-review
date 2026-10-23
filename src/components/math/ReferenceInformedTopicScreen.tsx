import { useRef } from 'react';
import { PRACTICE_CATALOG } from '../../domain/practice/catalog';
import { PRACTICE_REQUESTED_TOPIC_KEY } from '../practice/PracticeLibrary';
import { LearnReaderLayout } from '../learn-reader/LearnReaderLayout';
import { chapterTrackingId, moduleTrackingId } from '../../domain/learn/manualLearnTracking';
import { getLearnLesson } from '../../domain/learn/legacyLessonAdapter';
import { AppArtwork, getMathTopicArtwork } from '../common/AppArtwork';
import { INDEPENDENT_ALGEBRA_QUESTIONS } from '../../data/independentAlgebraAssessment';
import { ALGEBRA_COVERAGE_CATALOG_VERSION, buildSkillCoverage, getIndependentSkillEvidence } from '../../domain/curriculum/skillCatalog';
import { shuffledOptionIds, hasPositionSensitiveLanguage } from '../../domain/assessment/optionOrder';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Play, XCircle } from 'lucide-react';
import { useReview } from '../../context/ReviewContext';
import { LEARNING_PATHS } from '../../domain/learning/learningPaths';
import { AlgebraReferenceTopicContent } from '../../data/algebraReferenceContent';
import { TreeMenuHeader } from '../TreeMenuHeader';
import { CalculatorTechniqueCard } from '../CalculatorTechniqueCard';
import { MathTopicLifecycleTabs, MathTopicLifecycleView } from './MathTopicLifecycleTabs';
import { MathTopicStatusStrip } from './MathTopicStatusStrip';
import { MathTopicMistakesView, MathTopicProgressView, MathTopicQuizView } from './MathTopicUtilityViews';
import { ReferenceStudyBlueprint } from './ReferenceStudyBlueprint';
import { findTargetReferenceQuestionIndex, findWeakestReferenceSubskill, getReferenceAssessmentReadiness, getReferencePracticeSummary, getReferenceSubskillStats, loadReferencePracticeEvidence, recordReferencePracticeAttempt, saveReferencePracticeEvidence } from '../../utils/referencePracticeMastery';

interface Props {
  content: AlgebraReferenceTopicContent;
  iconLabel: string;
}

// Developer rollback switch: false restores the v10.30 Learn cards without modifying learner data.
const LEARN_READER_ENABLED = true;

export const ReferenceInformedTopicScreen: React.FC<Props> = ({ content, iconLabel }) => {
  const { setCurrentScreen, topicLaunchIntent, clearTopicLaunchIntent, setIsLearnReaderActive, allTopics, currentDateStr, startReview, openChat, errors, testRecords, learningPath } = useReview();
  const [activeTab, setActiveTab] = useState<MathTopicLifecycleView>('learn');
  const [requestedSectionId,setRequestedSectionId]=useState<string|undefined>(undefined);
  const [catalogTracking,setCatalogTracking]=useState<{id:string;name:string}|null>(null);
  const scrollViewportRef=useRef<HTMLDivElement>(null);
  const lesson=useMemo(()=>getLearnLesson(content),[content]);
  useEffect(()=>{
    if(!LEARN_READER_ENABLED)return;
    setIsLearnReaderActive(activeTab==='learn');
    return ()=>setIsLearnReaderActive(false);
  },[activeTab,setIsLearnReaderActive]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [optionShuffleVersion, setOptionShuffleVersion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceEvidence, setPracticeEvidence] = useState(() => loadReferencePracticeEvidence(content.canonicalTopicId));
  // Navigating directly between reference topics may reuse this component instance.
  // Never carry the previous topic's local evidence or selected answer into the new topic.
  useEffect(() => {
    setPracticeEvidence(loadReferencePracticeEvidence(content.canonicalTopicId));
    setPracticeIndex(0);
    setPracticeScore(0);
    setSelectedOption(null);
    setChecked(false);
    setOptionShuffleVersion(v=>v+1);
    setActiveTab('learn');
    setRequestedSectionId(undefined);
    setCatalogTracking(null);
  }, [content.canonicalTopicId]);
  useEffect(()=>{
    if(topicLaunchIntent?.topicId!==content.canonicalTopicId)return;
    setRequestedSectionId(topicLaunchIntent.sectionId);
    setCatalogTracking(topicLaunchIntent.source==='catalog' && topicLaunchIntent.catalogModuleId && topicLaunchIntent.catalogModuleName
      ? {id:moduleTrackingId(topicLaunchIntent.catalogModuleId),name:topicLaunchIntent.catalogModuleName}
      : null);
    setActiveTab(topicLaunchIntent.view==='review'?'practice':topicLaunchIntent.view);
    clearTopicLaunchIntent();
  },[topicLaunchIntent, content.canonicalTopicId,clearTopicLaunchIntent]);

  const topic = useMemo(
    () => allTopics.find((item) => item.id === content.canonicalTopicId),
    [allTopics, content.canonicalTopicId]
  );
  const unresolved = errors.filter((error) => error.topicId === content.canonicalTopicId && !error.isResolved).length;
  const due = Boolean(topic?.nextReviewDate && topic.nextReviewDate <= currentDateStr);
  const practiceQuestion = content.practiceQuestions[practiceIndex];
  const sharedLibraryCount = useMemo(()=>PRACTICE_CATALOG.filter(q=>q.topicId===content.canonicalTopicId).length,[content.canonicalTopicId]);
  const browsePracticeLibrary = () => {
    try{window.sessionStorage.setItem(PRACTICE_REQUESTED_TOPIC_KEY,content.canonicalTopicId);}catch{/* Library still opens without initial filter. */}
    setCurrentScreen('practice');
  };
  const displayedOptionOrder = useMemo(() => practiceQuestion ? shuffledOptionIds(practiceQuestion.options.map((text,index)=>({id:String(index),text})),hasPositionSensitiveLanguage(practiceQuestion.prompt,practiceQuestion.explanation,...practiceQuestion.options)) : [], [practiceQuestion?.id,optionShuffleVersion]);
  const practiceSummary = useMemo(
    () => getReferencePracticeSummary(content, practiceEvidence),
    [content, practiceEvidence]
  );
  const subskillStats = useMemo(
    () => getReferenceSubskillStats(content, practiceEvidence),
    [content, practiceEvidence]
  );
  const skillCatalog = useMemo(() => buildSkillCoverage(content, INDEPENDENT_ALGEBRA_QUESTIONS), [content]);
  const independentEvidence = useMemo(() => new Map(skillCatalog.map(skill => [skill.skillId, getIndependentSkillEvidence(skill.skillId, testRecords)])), [skillCatalog, testRecords]);
  const weakestSubskill = useMemo(
    () => findWeakestReferenceSubskill(content, practiceEvidence),
    [content, practiceEvidence]
  );
  const assessmentReadiness = useMemo(
    () => getReferenceAssessmentReadiness(content, practiceEvidence),
    [content, practiceEvidence]
  );
  const activeTrap = checked && selectedOption != null && practiceQuestion && selectedOption !== practiceQuestion.correctIndex && practiceQuestion.misconceptionId
    ? content.misconceptions.find((trap) => trap.id === practiceQuestion.misconceptionId)
    : undefined;

  const primaryLabel = !topic?.initialCovered
    ? 'Start Learning'
    : due
      ? 'Start Review'
      : (topic?.mastery ?? 0) <= 3
        ? 'Practice Weak Skills'
        : assessmentReadiness.canTakeAssessment
          ? 'Take Mastery Quiz'
          : 'Target Weakest Skill';

  const handlePrimary = () => {
    if (!topic?.initialCovered) {
      setActiveTab('learn');
      return;
    }
    if (due && topic) {
      startReview(topic, 'Spaced Review');
      return;
    }
    if ((topic?.mastery ?? 0) <= 3 || !assessmentReadiness.canTakeAssessment) {
      if (content.practiceQuestions.length) handleTargetWeakest();
      else setActiveTab('practice');
      return;
    }
    setActiveTab('quiz');
  };

  const handleCheckPractice = () => {
    if (selectedOption == null || !practiceQuestion || checked) return;
    const isCorrect = selectedOption === practiceQuestion.correctIndex;
    if (isCorrect) setPracticeScore((value) => value + 1);
    const nextEvidence = recordReferencePracticeAttempt(practiceEvidence, practiceQuestion, isCorrect);
    setPracticeEvidence(nextEvidence);
    saveReferencePracticeEvidence(content.canonicalTopicId, nextEvidence);
    setChecked(true);
  };

  const openPracticeAt = (index: number) => {
    setPracticeIndex(index);
    setOptionShuffleVersion(value=>value+1);
    setSelectedOption(null);
    setChecked(false);
    setActiveTab('practice');
  };

  const handleTargetWeakest = () => {
    const preferredSubskill = practiceSummary.attempts > 0 ? weakestSubskill?.subskill : undefined;
    openPracticeAt(findTargetReferenceQuestionIndex(content, practiceEvidence, preferredSubskill));
  };

  const handlePracticeTrap = (misconceptionId: string) => {
    openPracticeAt(findTargetReferenceQuestionIndex(content, practiceEvidence, undefined, misconceptionId));
  };

  const handleNextPractice = () => {
    if (!content.practiceQuestions.length) return;
    setPracticeIndex((value) => (value + 1) % content.practiceQuestions.length);
    setOptionShuffleVersion(value=>value+1);
    setSelectedOption(null);
    setChecked(false);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
      <TreeMenuHeader
        items={[
          { label: 'Mathematics', onClick: () => setCurrentScreen('mathematics') },
          { label: 'Algebra', onClick: () => setCurrentScreen('algebra') },
          { label: content.groupLabel, onClick: () => setCurrentScreen('algebra') },
          { label: content.title, isActive: true },
        ]}
        backButton={{ label: 'Back to Algebra', onClick: () => setCurrentScreen('algebra') }}
      />

      <div ref={scrollViewportRef} className="flex-1 overflow-y-auto pb-16">
        <div className={`p-3 sm:p-5 lg:p-7 space-y-5 mx-auto ${LEARN_READER_ENABLED && activeTab==='learn'?'max-w-[1600px]':'max-w-7xl'}`}>
          {(!LEARN_READER_ENABLED || activeTab!=='learn') && <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4 min-w-0">
                <div className="icon-3d icon-3d--large icon-3d--violet app-artwork-tile">
                  <AppArtwork name={getMathTopicArtwork(content.canonicalTopicId)} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{content.title}</h1>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wide">
                      Reference-informed lesson
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 max-w-3xl">{content.shortDescription}</p>
                  <div className="mt-4"><MathTopicStatusStrip canonicalTopicId={content.canonicalTopicId} /></div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 lg:w-[220px]">
                <button type="button" onClick={handlePrimary} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-black flex items-center justify-center gap-2 shadow-xs">
                  <Play className="w-4 h-4" /> {primaryLabel}
                </button>
                <button
                  type="button"
                  onClick={() => openChat(`Tutor me on ${content.title}. Focus on the learning objectives, common traps, and ECE board-review applications.`, 'algebra-expert')}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <AppArtwork name="chat" inline className="w-4 h-4 text-blue-600" /> Ask Tutor
                </button>
              </div>
            </div>
          </section>}

          {(!LEARN_READER_ENABLED || activeTab!=='learn') && <section className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-slate-800" aria-label="Learning path topic guidance">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{LEARNING_PATHS[learningPath].label} · Suggested approach</strong>
              <span className="text-[11px] text-slate-600">All lesson and assessment tabs remain available</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-700">
              {learningPath === 'guided'
                ? 'Start with the objectives and worked examples. Use the Practice tab for explanations and review misconceptions before taking a quiz.'
                : 'Use Practice for targeted remediation and Quiz for self-attested independent checks when reserved families exist. Familiar practice is not verified mastery.'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => setActiveTab('learn')} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 border border-blue-200">Read lesson</button>
              <button type="button" onClick={() => setActiveTab('practice')} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 border border-blue-200">Practice problems</button>
              <button type="button" onClick={() => setActiveTab('quiz')} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 border border-blue-200">Take quiz</button>
            </div>
          </section>}
          <MathTopicLifecycleTabs activeView={activeTab} onChange={setActiveTab} mistakeCount={unresolved} />

          {LEARN_READER_ENABLED && activeTab==='learn' && (
            <LearnReaderLayout
              lesson={lesson}
              trackingId={catalogTracking?.id || chapterTrackingId(content.canonicalTopicId)}
              trackingScopeLabel={catalogTracking?.name || `${lesson.title} (whole chapter)`}
              requestedSectionId={requestedSectionId}
              onPractice={()=>setActiveTab('practice')}
              onClose={()=>setCurrentScreen('algebra')}
              onSectionChange={()=>scrollViewportRef.current?.scrollTo({top:0,behavior:'auto'})}
            />
          )}
          {!LEARN_READER_ENABLED && activeTab === 'learn' && (
            <div className="space-y-5">
              <ReferenceStudyBlueprint content={content} />

              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-black">
                  <AppArtwork name="book" inline className="w-5 h-5 text-blue-600" />
                  <h2>Original worked examples</h2>
                </div>
                <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {content.workedExamples.map((example) => (
                    <div key={example.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{example.title}</h3>
                        <p className="text-sm text-slate-700 mt-1 font-semibold">{example.problem}</p>
                      </div>
                      <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900">
                        <strong>Strategy:</strong> {example.strategy}
                      </div>
                      <ol className="space-y-2">
                        {example.steps.map((step, index) => (
                          <li key={`${example.title}-${index}`} className="flex gap-2 text-sm text-slate-700">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 inline-flex items-center justify-center text-[10px] font-black shrink-0">{index + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="text-xs text-emerald-800"><strong>Check:</strong> {example.check}</p>
                      <p className="text-xs text-slate-600"><strong>Takeaway:</strong> {example.takeaway}</p>
                    </div>
                  ))}
                </div>
              </section>

              {content.eceBridge.length > 0 && (
                <section className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-indigo-950 font-black">
                    <AppArtwork name="chip" inline className="w-5 h-5 text-indigo-600" />
                    <h2>ECE bridge</h2>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {content.eceBridge.map((item) => (
                      <div key={item.title} className="rounded-xl bg-white border border-indigo-100 p-3">
                        <div className="text-sm font-black text-slate-900">{item.title}</div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                        {item.formula && <div className="mt-2 text-xs font-mono text-indigo-700">{item.formula}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="space-y-4">
              <section className="bg-white border border-blue-200 bg-blue-50/40 rounded-2xl p-4 sm:p-5 max-w-5xl">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div><strong className="text-sm text-slate-900">Want a larger exercise collection?</strong>
                    <p className="text-xs text-slate-600 mt-1">The categorized Practice Library currently has {sharedLibraryCount} listed questions for this topic, including additional material where available.</p></div>
                  <button type="button" onClick={browsePracticeLibrary} className="bg-blue-700 hover:bg-blue-800 rounded-xl px-4 py-2.5 text-white text-xs font-bold">Browse {sharedLibraryCount} Questions →</button>
                </div>
              </section>
              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs max-w-5xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-black"><AppArtwork name="brain" inline className="w-5 h-5 text-violet-600" /><h2>Adaptive practice evidence</h2></div>
                    <p className="text-sm text-slate-500 mt-1">Options are shuffled each round. These are practice exposures, not independently verified subskill mastery.</p>
                  </div>
                  <button type="button" onClick={handleTargetWeakest} disabled={!content.practiceQuestions.length} className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 text-white text-sm font-bold flex items-center justify-center gap-2">
                    <AppArtwork name="target" inline className="w-4 h-4" /> Target Weakest Skill
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <PracticeMetric label="Coverage" value={`${practiceSummary.coveragePercent}%`} hint={`${practiceSummary.attemptedQuestions}/${practiceSummary.totalQuestions} unique`} />
                  <PracticeMetric label="Accuracy" value={practiceSummary.accuracyPercent == null ? '—' : `${practiceSummary.accuracyPercent}%`} hint={`${practiceSummary.correct}/${practiceSummary.attempts || 0} attempts`} />
                  <PracticeMetric label="Subskills" value={String(subskillStats.length)} hint="grouped skill families" />
                  <PracticeMetric label="Weakest" value={weakestSubskill?.subskill ?? '—'} hint={weakestSubskill?.accuracyPercent == null ? 'not practiced yet' : `${weakestSubskill.accuracyPercent}% accuracy`} compact />
                  <PracticeMetric label="Assessment" value={assessmentReadiness.status} hint={`${assessmentReadiness.practicedSubskills}/${assessmentReadiness.totalSubskills} subskills`} compact />
                </div>
                <div className={`mt-4 rounded-xl border p-3 text-xs ${assessmentReadiness.canTakeAssessment ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                  <strong>Assessment recommendation:</strong> {assessmentReadiness.reason} Local evidence changes the recommended next action only; the canonical mastery/SRS score changes only through the scored review workflow.
                </div>
              </section>
              {practiceQuestion ? (
                <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs max-w-4xl">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-100">{practiceQuestion.subskill}</span>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">{practiceQuestion.difficulty}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500">Question {practiceIndex + 1}/{content.practiceQuestions.length} · Session score {practiceScore}</div>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-5">{practiceQuestion.prompt}</h2>
                  <div className="mt-4 space-y-2.5">
                    {displayedOptionOrder.map((originalIndex, displayIndex) => {
                      const index = Number(originalIndex);
                      const option=practiceQuestion.options[index];
                      const selected = selectedOption === index;
                      const correct = checked && index === practiceQuestion.correctIndex;
                      const wrong = checked && selected && index !== practiceQuestion.correctIndex;
                      return (
                        <button
                          key={`${practiceQuestion.id}-${index}`}
                          type="button"
                          disabled={checked}
                          onClick={() => setSelectedOption(index)}
                          className={`w-full text-left rounded-xl border p-3.5 text-sm font-semibold transition-colors flex items-center justify-between gap-3 ${
                            correct ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : wrong ? 'border-rose-300 bg-rose-50 text-rose-950' : selected ? 'border-blue-400 bg-blue-50 text-blue-950' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span>{String.fromCharCode(65 + displayIndex)}. {option}</span>
                          {correct && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {wrong && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  {checked && (
                    <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
                      <strong>Explanation:</strong> {practiceQuestion.explanation}
                      {practiceQuestion.misconceptionId && (
                        <div className="mt-2 text-xs text-rose-700"><strong>Trap tag:</strong> {practiceQuestion.misconceptionId}</div>
                      )}
                    </div>
                  )}
                  {checked && <div className="mt-3"><CalculatorTechniqueCard key={practiceQuestion.id} questionId={practiceQuestion.id} disclosure="after-answer" /></div>}
                  {activeTrap && (
                    <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-sm font-black text-rose-900">Targeted remediation: {activeTrap.label}</div>
                          <p className="text-xs text-rose-800 mt-1"><strong>Correction:</strong> {activeTrap.correction}</p>
                          <p className="text-xs text-slate-700 mt-1"><strong>Quick check:</strong> {activeTrap.quickCheck}</p>
                        </div>
                        <button type="button" onClick={() => handlePracticeTrap(activeTrap.id)} className="px-3 py-2 rounded-lg bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100">
                          Practice this trap
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="mt-5 flex items-center gap-2 flex-wrap">
                    {!checked ? (
                      <button type="button" disabled={selectedOption == null} onClick={handleCheckPractice} className="px-5 py-2.5 rounded-xl bg-blue-600 disabled:bg-slate-200 disabled:text-slate-500 text-white text-sm font-bold">Check Answer</button>
                    ) : (
                      <button type="button" onClick={handleNextPractice} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center gap-2">Next Question <ArrowRight className="w-4 h-4" /></button>
                    )}
                    {topic && (
                      <button type="button" onClick={() => startReview(topic, 'Practice Problems')} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-bold flex items-center gap-2">
                        <AppArtwork name="cycle" inline className="w-4 h-4" /> Start Scored Practice
                      </button>
                    )}
                  </div>
                </section>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                  <h2 className="font-black text-slate-900">Practice bank is being prepared</h2>
                  <p className="text-sm text-slate-500 mt-1">Use the existing scored practice workflow while this topic's local practice bank is being prepared.</p>
                  {topic && <button type="button" onClick={() => startReview(topic, 'Practice Problems')} className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold">Start Scored Practice</button>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'quiz' && <MathTopicQuizView canonicalTopicId={content.canonicalTopicId} title={content.title} />}

          {activeTab === 'mistakes' && (
            <div className="space-y-5">
              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-black"><AppArtwork name="target" inline className="w-5 h-5 text-rose-600" /><h2>Misconception taxonomy</h2></div>
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {content.misconceptions.map((trap) => {
                    const misses = practiceEvidence.misconceptionMisses[trap.id] ?? 0;
                    return (
                      <div key={trap.id} className="rounded-xl bg-rose-50/50 border border-rose-100 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div><h3 className="text-sm font-black text-slate-900">{trap.label}</h3><span className="text-[10px] font-bold text-rose-600">{trap.id}</span></div>
                          <span className={`text-[10px] font-black rounded-full px-2 py-1 ${misses ? 'bg-rose-100 text-rose-700' : 'bg-white text-slate-500 border border-slate-200'}`}>{misses} local miss{misses === 1 ? '' : 'es'}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">{trap.correction}</p>
                        <button type="button" onClick={() => handlePracticeTrap(trap.id)} className="mt-3 text-xs font-bold text-rose-700 hover:text-rose-900">Practice this trap →</button>
                      </div>
                    );
                  })}
                </div>
              </section>
              <MathTopicMistakesView canonicalTopicId={content.canonicalTopicId} title={content.title} />
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-5">
              <MathTopicProgressView canonicalTopicId={content.canonicalTopicId} title={content.title} />
              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-black"><AppArtwork name="graph" inline className="w-5 h-5 text-violet-600" /><h2>Subskill practice mastery</h2></div>
                <p className="text-sm text-slate-500 mt-1">Practice-only results across related skill families. This practice evidence supplements, but does not overwrite, canonical mastery. It does not establish independently assessed competency or course/board completion.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subskillStats.map((stat) => (
                    <div key={stat.subskill} className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                      <div className="flex items-center justify-between gap-3"><span className="text-sm font-black text-slate-900">{stat.subskill}</span><span className={`text-[10px] font-black px-2 py-1 rounded-full ${stat.level === 'Broad practice' ? 'bg-blue-100 text-blue-700' : stat.level === 'Developing' ? 'bg-amber-100 text-amber-700' : stat.level === 'Practiced once' ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-600'}`}>{stat.level}</span></div>
                      <div className="mt-3 h-2 rounded-full bg-slate-200 overflow-hidden"><div className="h-full bg-violet-500" style={{ width: `${stat.accuracyPercent ?? 0}%` }} /></div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>{stat.accuracyPercent == null ? 'No attempts' : `${stat.accuracyPercent}% accuracy`}</span><span>{stat.attemptedQuestions}/{stat.questionCount} questions seen</span></div>
                      <button type="button" onClick={() => openPracticeAt(findTargetReferenceQuestionIndex(content, practiceEvidence, stat.subskill))} className="mt-3 text-xs font-bold text-violet-700 hover:text-violet-900">Practice this subskill →</button>
                    </div>
                  ))}
                </div>
              </section>
              <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <h2 className="font-black text-slate-900">Question-family coverage and independent evidence</h2>
                <p className="text-xs text-slate-600 mt-1">Catalog {ALGEBRA_COVERAGE_CATALOG_VERSION}. Denominator: {skillCatalog.length} grouped skills in this app topic, not a complete course syllabus or PRC examination blueprint. A planning target of three independently authored families per skill is NOT proof of mastery.</p>
                <div className="mt-3 space-y-2">
                  {skillCatalog.map(skill => {
                    const evidence = independentEvidence.get(skill.skillId);
                    return <div key={skill.skillId} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900">{skill.name}</div>
                        <div className="text-xs text-slate-600">{skill.distinctPracticeProblems} distinct lesson problems ({skill.practiceItemIds.length} authored items) · {skill.assessmentFamilyIds.length}/3 original assessment families available · {evidence?.attemptedFamilyCount??0} families attempted</div>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <span className="text-xs font-bold text-amber-800">{evidence?.status??'Not assessed'}</span>
                        <div className="text-[11px] text-slate-500">{evidence?.delayedRecheck?'Delayed recheck recorded':'No delayed recheck'}</div>
                      </div>
                    </div>;
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-3">Strict attempts are self-attested, not proctored. Repeated families, guided practice and old records cannot be promoted to independent evidence. Missing assessment families mean insufficient question-bank coverage, not learner failure.</p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const PracticeMetric: React.FC<{ label: string; value: string; hint: string; compact?: boolean }> = ({ label, value, hint, compact = false }) => (
  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 min-w-0">
    <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</div>
    <div className={`${compact ? 'text-sm' : 'text-xl'} font-black text-slate-900 mt-1 truncate`} title={value}>{value}</div>
    <div className="text-[11px] text-slate-500 mt-0.5 truncate" title={hint}>{hint}</div>
  </div>
);
