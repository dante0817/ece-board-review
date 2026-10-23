import { ManualLearnTracker } from './learn-reader/ManualLearnTracker';
import { lessonCardTrackingId } from '../domain/learn/manualLearnTracking';
import { useAlgebraLearnTrackingIdentity } from '../hooks/useAlgebraLearnTrackingIdentity';
import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect, useMemo } from 'react';
import { useReview } from '../context/ReviewContext';
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, X, ChevronDown } from 'lucide-react';
import { MathFormula } from './MathFormula';
import { RealNumbersFlashcards } from './RealNumbersFlashcards';
import { RealNumbersPractice } from './RealNumbersPractice';
import { RealNumbersProgress } from './RealNumbersProgress';
import { RealNumbersKnowledgeCheck } from './RealNumbersKnowledgeCheck';
import { TreeMenuHeader } from './TreeMenuHeader';
import { RealNumbersSpacedScheduler } from './RealNumbersSpacedScheduler';
import { RealNumbersConceptNotes, getConceptNotes } from './RealNumbersConceptNotes';
import { ConceptMasteryProgressBar } from './ConceptMasteryProgressBar';
import { RealNumbersHeatmap } from './RealNumbersHeatmap';
import { ConceptsInThisModulePanel } from './ConceptsInThisModulePanel';
import { AdaptiveMasteryAssessmentModal } from './AdaptiveMasteryAssessmentModal';
import { MathTopicLifecycleTabs, MathTopicLifecycleView } from './math/MathTopicLifecycleTabs';
import { MathTopicMistakesView, MathTopicQuizView } from './math/MathTopicUtilityViews';
import { MathTopicStatusStrip } from './math/MathTopicStatusStrip';
import {
  loadRealNumbersSchedule,
  RealNumbersScheduleState,
  SCHEDULE_UPDATED_EVENT,
  ConceptId,
  getConceptMastery,
} from '../utils/realNumbersScheduler';
import {
  loadRealNumbersHeatmap,
  HEATMAP_UPDATED_EVENT,
} from '../utils/realNumbersHeatmap';

export const RealNumbersScreen: React.FC = () => {
  const manualLearnIdentity=useAlgebraLearnTrackingIdentity('top-real-numbers','Real Numbers',['top-signed-numbers']);

  const { setCurrentScreen, openChat, allTopics, startReview } = useReview();

  // Active top tab (strictly matching GUI layout)
  const [activeTab, setActiveTab] = useState<'learn' | 'flashcards' | MathTopicLifecycleView>('learn');

  // Active lesson step in Learn tab (1 to 4)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Notes accordion expanded state
  const [isNotesExpanded, setIsNotesExpanded] = useState<boolean>(false);

  // Knowledge check modal open state
  const [isKnowledgeCheckOpen, setIsKnowledgeCheckOpen] = useState<boolean>(false);

  // Concept Mastery Adaptive Assessment modal target concept (1, 2, 3, or 4)
  const [assessmentConceptId, setAssessmentConceptId] = useState<ConceptId | null>(null);

  // Target SubTopic when jumping from Heatmap to Knowledge Check
  const [quizTargetSubTopicId, setQuizTargetSubTopicId] = useState<string | undefined>(undefined);

  // Sub-Topic Struggle Heatmap state
  const [heatmapData, setHeatmapData] = useState(() => loadRealNumbersHeatmap());

  useEffect(() => {
    const handleHeatmapUpdate = () => {
      setHeatmapData(loadRealNumbersHeatmap());
    };
    window.addEventListener(HEATMAP_UPDATED_EVENT, handleHeatmapUpdate);
    return () => {
      window.removeEventListener(HEATMAP_UPDATED_EVENT, handleHeatmapUpdate);
    };
  }, []);

  // Compute struggle count for tab badge
  const struggleCount = useMemo(() => {
    return Object.values(heatmapData).filter(
      (item) => item.struggleLevel === 'critical' || item.struggleLevel === 'moderate'
    ).length;
  }, [heatmapData]);

  // Notes state for badge indicator
  const [notesCount, setNotesCount] = useState<number>(() => {
    const notes = getConceptNotes();
    return Object.values(notes).filter((n) => n.text?.trim()?.length > 0).length;
  });

  useEffect(() => {
    const handleNotesUpdate = () => {
      const notes = getConceptNotes();
      setNotesCount(Object.values(notes).filter((n) => n.text?.trim()?.length > 0).length);
    };
    window.addEventListener('real_numbers_notes_updated', handleNotesUpdate);
    return () => {
      window.removeEventListener('real_numbers_notes_updated', handleNotesUpdate);
    };
  }, []);

  // Spaced-Repetition state for live prompts and badges
  const [scheduleState, setScheduleState] = useState<RealNumbersScheduleState>(() =>
    loadRealNumbersSchedule()
  );
  const [isPromptDismissed, setIsPromptDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handleScheduleUpdate = () => {
      setScheduleState(loadRealNumbersSchedule());
    };
    window.addEventListener(SCHEDULE_UPDATED_EVENT, handleScheduleUpdate);
    return () => {
      window.removeEventListener(SCHEDULE_UPDATED_EVENT, handleScheduleUpdate);
    };
  }, []);

  // Compute due concepts for prominent spaced repetition prompts
  const dueConcepts = useMemo(() => {
    return Object.values(scheduleState.concepts).filter(
      (c) => c.status === 'due' || c.status === 'remediation'
    );
  }, [scheduleState]);

  const dueCount = dueConcepts.length;
  const firstDueConcept = dueConcepts[0];

  // Completed steps tracker for lesson rail
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({ 1: true });

  // Step 1: Interactive Set Explorer Highlight
  const [activeSetId, setActiveSetId] = useState<string | null>(null);

  // Step 2: Repeating Decimal to Fraction Converter Interactive State
  const [selectedDecimalExample, setSelectedDecimalExample] = useState<number>(0);

  // Step 2: Closure Properties View Toggle
  const [showClosureMatrix, setShowClosureMatrix] = useState<boolean>(false);

  // Step 3 Interactive Number Classifier State
  const [testNumberIndex, setTestNumberIndex] = useState<number>(0);
  const [userSelectedSets, setUserSelectedSets] = useState<string[]>([]);
  const [hasSubmittedClassification, setHasSubmittedClassification] = useState<boolean>(false);

  // Step 4 Draggable / Clickable Number Line Highlight
  const [activeNumberLinePoint, setActiveNumberLinePoint] = useState<string | null>('sqrt2');

  // Step 4 Ordering Sandbox State
  const [orderingItems, setOrderingItems] = useState<Array<{ id: string; label: string; val: number; approx: string }>>([
    { id: 'item-1', label: '√3', val: 1.732, approx: '≈ 1.732' },
    { id: 'item-2', label: '5/3', val: 1.667, approx: '≈ 1.667' },
    { id: 'item-3', label: '1.7', val: 1.700, approx: '= 1.700' },
    { id: 'item-4', label: '7/4', val: 1.750, approx: '= 1.750' },
  ]);
  const [orderingChecked, setOrderingChecked] = useState<boolean>(false);
  const [orderingSuccess, setOrderingSuccess] = useState<boolean>(false);

  // Practice Tab State
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string>>({});
  const [practiceChecked, setPracticeChecked] = useState<Record<number, boolean>>({});

  // Mistakes Tab State: resolved mistakes tracking
  const [resolvedMistakes, setResolvedMistakes] = useState<Record<string, boolean>>({});

  const lessonSteps = [
    { id: 1, title: 'Number Sets' },
    { id: 2, title: 'Rational vs. Irrational' },
    { id: 3, title: 'Classifying Numbers' },
    { id: 4, title: 'Ordering & Comparing' },
  ];

  // Number classification test items for Step 3
  const classificationItems = [
    {
      num: '-7',
      display: '-7',
      correctSets: ['Integer', 'Rational', 'Real'],
      explanation: '-7 is a negative whole number, so it is an Integer (ℤ), Rational (ℚ, as -7/1), and Real (ℝ). It is not Natural or Whole.',
    },
    {
      num: '√9',
      display: '√9 = 3',
      correctSets: ['Natural', 'Whole', 'Integer', 'Rational', 'Real'],
      explanation: 'Since √9 simplifies exactly to 3, it belongs to Natural (ℕ), Whole, Integer (ℤ), Rational (ℚ), and Real (ℝ). A common trap is assuming all radicals are irrational!',
    },
    {
      num: '0',
      display: '0',
      correctSets: ['Whole', 'Integer', 'Rational', 'Real'],
      explanation: '0 is a Whole number, Integer, Rational (0/1), and Real. Natural numbers start at 1 in this reviewer.',
    },
    {
      num: '√5',
      display: '√5 ≈ 2.236...',
      correctSets: ['Irrational', 'Real'],
      explanation: '5 is not a perfect square, so √5 has an infinite non-repeating decimal expansion. It is strictly Irrational (ℝ \\ ℚ) and Real (ℝ).',
    },
    {
      num: '0.666...',
      display: '0.666... (2/3)',
      correctSets: ['Rational', 'Real'],
      explanation: 'Any repeating decimal is rational because it can be expressed as a ratio of integers (2/3). It is Rational and Real.',
    },
    {
      num: 'π',
      display: 'π ≈ 3.14159...',
      correctSets: ['Irrational', 'Real'],
      explanation: 'Pi is a transcendental number with a non-repeating, non-terminating decimal expansion. It is Irrational and Real.',
    },
  ];

  const handleToggleSetSelection = (setName: string) => {
    if (hasSubmittedClassification) return;
    setUserSelectedSets((prev) =>
      prev.includes(setName) ? prev.filter((s) => s !== setName) : [...prev, setName]
    );
  };

  const handleCheckClassification = () => {
    setHasSubmittedClassification(true);
  };

  const handleNextClassificationItem = () => {
    setTestNumberIndex((prev) => (prev + 1) % classificationItems.length);
    setUserSelectedSets([]);
    setHasSubmittedClassification(false);
  };

  // Move ordering item left/right in sandbox
  const handleMoveOrderingItem = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === orderingItems.length - 1) return;
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    const updated = [...orderingItems];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setOrderingItems(updated);
    setOrderingChecked(false);
  };

  const handleCheckOrdering = () => {
    const isSorted = orderingItems.every((item, i) => i === 0 || orderingItems[i - 1].val <= item.val);
    setOrderingSuccess(isSorted);
    setOrderingChecked(true);
  };

  const handleStepChange = (stepId: number) => {
    setCurrentStep(stepId);
    setCompletedSteps((prev) => ({ ...prev, [stepId]: true }));
  };

  // Repeating decimal conversion examples for Step 2
  const repeatingDecimalExamples = [
    {
      title: 'Simple repeating: 0.181818...',
      decimal: '0.181818...',
      fraction: '2/11',
      steps: [
        'Let x = 0.181818...',
        'Since 2 digits repeat (18), multiply by 10² = 100: 100x = 18.181818...',
        'Subtract the equations: (100x - x) = (18.1818... - 0.1818...)',
        '99x = 18',
        'x = 18 / 99 = 2 / 11',
      ],
      note: 'The repeating block cancels out completely, leaving an exact integer ratio.',
    },
    {
      title: 'Delayed repeating: 0.2777...',
      decimal: '0.2777...',
      fraction: '5/18',
      steps: [
        'Let x = 0.2777...',
        'Multiply by 10 to shift the non-repeating digit: 10x = 2.777...',
        'Multiply by 100 to shift one repeating period: 100x = 27.777...',
        'Subtract: 100x - 10x = 27.777... - 2.777...  ⟹  90x = 25',
        'x = 25 / 90 = 5 / 18',
      ],
      note: 'Notice the denominator 90 (one 9 for the repeating digit, one 0 for the non-repeating tenths digit).',
    },
    {
      title: 'Single repeating: 0.333...',
      decimal: '0.333...',
      fraction: '1/3',
      steps: [
        'Let x = 0.333...',
        'Multiply by 10: 10x = 3.333...',
        'Subtract: 10x - x = 3.333... - 0.333...  ⟹  9x = 3',
        'x = 3 / 9 = 1 / 3',
      ],
      note: 'A fundamental benchmark fraction in algebraic number theory.',
    },
  ];

  // Set info metadata for Step 1 interactive highlight
  const setDetails: Record<string, { name: string; symbol: string; desc: string; sample: string; containedIn: string[] }> = {
    natural: {
      name: 'Natural Numbers',
      symbol: 'ℕ',
      desc: 'Positive counting numbers starting at 1. Closed under addition and multiplication.',
      sample: '1, 2, 3, 4, 100...',
      containedIn: ['Whole', 'Integers (ℤ)', 'Rational (ℚ)', 'Real (ℝ)'],
    },
    whole: {
      name: 'Whole Numbers',
      symbol: 'W',
      desc: 'All natural numbers plus the additive identity 0.',
      sample: '0, 1, 2, 3, 4...',
      containedIn: ['Integers (ℤ)', 'Rational (ℚ)', 'Real (ℝ)'],
    },
    integers: {
      name: 'Integers',
      symbol: 'ℤ',
      desc: 'From German "Zahlen" (numbers). Includes all whole numbers and their negative counterparts. Closed under addition, subtraction, and multiplication.',
      sample: '... -3, -2, -1, 0, 1, 2, 3 ...',
      containedIn: ['Rational (ℚ)', 'Real (ℝ)'],
    },
    rational: {
      name: 'Rational Numbers',
      symbol: 'ℚ',
      desc: 'From "Quotient". Any number expressible as a/b with integers a, b (b ≠ 0). Their decimals either terminate or repeat periodically.',
      sample: '3/4, -7, 0.25, 0.333..., 22/7',
      containedIn: ['Real (ℝ)'],
    },
    irrational: {
      name: 'Irrational Numbers',
      symbol: 'ℝ \\ ℚ',
      desc: 'Cannot be formed by dividing two integers. Non-terminating, non-repeating decimal expansions. Disjoint from ℚ.',
      sample: '√2, √3, π, e, φ (Golden Ratio)',
      containedIn: ['Real (ℝ)'],
    },
    real: {
      name: 'Real Numbers',
      symbol: 'ℝ',
      desc: 'The union of all rational and irrational numbers. Every real number maps to a unique coordinate on the continuous number line.',
      sample: 'All rational and irrational numbers combined',
      containedIn: ['Complex Numbers (ℂ)'],
    },
  };

  // Practice questions
  const practiceQuestions = [
    {
      id: 1,
      question: 'Which of the following numbers is an irrational number?',
      options: [
        { id: 'A', text: '√49' },
        { id: 'B', text: '0.3181818... (repeating 18)' },
        { id: 'C', text: '√12' },
        { id: 'D', text: '-22/7' },
      ],
      correct: 'C',
      explanation: '√12 = 2√3. Since 3 is not a square, √3 is irrational, making √12 irrational. Note that √49 = 7 (rational), 0.31818... is a repeating decimal (rational), and -22/7 is explicitly a ratio of integers.',
    },
    {
      id: 2,
      question: 'In the nested hierarchy of real numbers, which statement is FALSE?',
      options: [
        { id: 'A', text: 'Every natural number is an integer' },
        { id: 'B', text: 'Every integer is a rational number' },
        { id: 'C', text: 'Every real number is a rational number' },
        { id: 'D', text: 'Every whole number is a real number' },
      ],
      correct: 'C',
      explanation: 'Statement C is false: Real numbers also include Irrational numbers (like √2 and π), which cannot be represented as rational numbers.',
    },
    {
      id: 3,
      question: 'Which set of numbers contains 0 but does not contain negative numbers?',
      options: [
        { id: 'A', text: 'Natural numbers ℕ' },
        { id: 'B', text: 'Whole numbers' },
        { id: 'C', text: 'Integers ℤ' },
        { id: 'D', text: 'Rational numbers ℚ' },
      ],
      correct: 'B',
      explanation: 'Whole numbers are defined as {0, 1, 2, 3, ...}. Natural numbers start at 1, while Integers include negative values.',
    },
    {
      id: 4,
      question: 'Simplify the expression and classify the result: √(64/16)',
      options: [
        { id: 'A', text: '2, which is Natural, Whole, Integer, Rational, and Real' },
        { id: 'B', text: '√4, which is strictly an Irrational number' },
        { id: 'C', text: '4, which is an imaginary number' },
        { id: 'D', text: '8/4, which is only a rational fraction' },
      ],
      correct: 'A',
      explanation: '√(64/16) = √4 = 2. The number 2 is positive whole counting number, so it belongs to ℕ, Whole, ℤ, ℚ, and ℝ.',
    },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
      {/* Top Header / Breadcrumbs (OUTSIDE the scrollbar - pinned at top, remains accessible when scrolling) */}
      <TreeMenuHeader
        items={[
          { label: 'Mathematics', onClick: () => setCurrentScreen('mathematics') },
          { label: 'Algebra', onClick: () => setCurrentScreen('algebra') },
          { label: 'Algebra Fundamentals', onClick: () => setCurrentScreen('algebra') },
          { label: 'Real Numbers & Number Systems', isActive: true },
        ]}
        backButton={{
          label: 'Back to Algebra',
          onClick: () => setCurrentScreen('algebra'),
        }}
      />

      {/* Main Container - scrollbar starts strictly below the navigation bar */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
          {/* Module Header Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* Left: Icon & Meta */}
          <div className="flex items-start gap-4 sm:gap-5 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#ebf3ff] text-blue-600 font-extrabold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-2xs border border-blue-100 select-none app-artwork-tile">
              <AppArtwork name="calculator" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                Real Numbers & Number Systems
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Understand how real numbers are classified, ordered, and represented.
              </p>

            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={() => {
                if (currentStep < 4) {
                  handleStepChange(currentStep + 1);
                } else {
                  handleStepChange(1);
                }
                setActiveTab('learn');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <AppArtwork name="cards" inline className="w-4 h-4 text-blue-600" />
              <span>Flashcards</span>
            </button>

            <button
              type="button"
              onClick={() =>
                openChat(
                  'Explain the classification of real numbers, difference between rational and irrational numbers, and common traps in board exams.',
                  'Mathematics Specialist'
                )
              }
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-blue-200 text-[#2563eb] font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <AppArtwork name="star" inline className="w-4 h-4 text-[#2563eb]" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>

        <MathTopicStatusStrip canonicalTopicId="top-real-numbers" />

        {/* Active Spaced-Repetition Reminder Prompt Banner (Matching image.png) */}
        {!isPromptDismissed && dueCount > 0 && firstDueConcept && (
          <div className="bg-[#fef9e7] border border-[#fef08a] rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs app-artwork-tile">
                <AppArtwork name="timer" />
              </span>
              <div className="text-xs sm:text-sm truncate">
                <span className="font-bold text-slate-900">Review due: {firstDueConcept.shortTitle}</span>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-slate-600">Retention</span>{' '}
                <span className="font-bold text-slate-900">{firstDueConcept.estimatedRetention}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const topic = allTopics.find((item) => item.id === 'top-real-numbers');
                  if (topic) {
                    startReview(topic, 'Spaced Review');
                  } else {
                    setActiveTab('quiz');
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#2563eb] border border-slate-200 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                Review Now
              </button>

              <button
                type="button"
                onClick={() => setIsPromptDismissed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer ml-1"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Standard Mathematics topic lifecycle. Flashcards remain a contextual study tool. */}
        <MathTopicLifecycleTabs
          activeView={(activeTab === 'flashcards' ? 'learn' : activeTab) as MathTopicLifecycleView}
          onChange={(view) => setActiveTab(view)}
          mistakeCount={0}
        />

        {/* TAB 1: LEARN (Matching image.png) */}
        {activeTab === 'learn' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Concepts in This Module (5-Level Concept Mastery System) */}
            <div className="lg:col-span-4">
              <ConceptsInThisModulePanel
                currentStep={currentStep}
                onSelectStep={(step) => handleStepChange(step)}
                onOpenAssessment={(conceptId) => setAssessmentConceptId(conceptId)}
                onReviewConcept={(conceptId) => handleStepChange(conceptId)}
              />
            </div>

            {/* Right Column: Main Lesson Content Card (Matching image.png) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6">
              {/* Each individual numbered Real Numbers card has its own manual checkboxes. */}
              <ManualLearnTracker compact key={lessonCardTrackingId(manualLearnIdentity.trackingId,`step-${currentStep}`)} trackingId={lessonCardTrackingId(manualLearnIdentity.trackingId,`step-${currentStep}`)} scopeLabel={`${lessonSteps.find(s=>s.id===currentStep)?.title??'Real Numbers'} · ${manualLearnIdentity.trackingScopeLabel}`}/>
              {/* STEP 1: NUMBER SETS (Exact Match to image.png) */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Step Title Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        1. Number Sets
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-2xl">
                        The real number system includes all rational and irrational numbers. The number sets are nested inside one another, with natural numbers at the core.
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-200 shrink-0">
                      Step 1 of 4
                    </span>
                  </div>

                  {/* 2-Column Visual Diagram & Table Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                    {/* Left: Nested Sets Diagram with Interactive Inspection */}
                    <div className="bg-[#f8fbff] border border-blue-100 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between w-full mb-3">
                          <button
                            type="button"
                            onClick={() => setActiveSetId(activeSetId === 'real' ? null : 'real')}
                            className={`font-extrabold text-sm sm:text-base px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                              activeSetId === 'real'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-900 hover:bg-blue-50'
                            }`}
                          >
                            Real Numbers <span className="font-serif font-bold">ℝ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveSetId(activeSetId === 'real' ? null : 'real')}
                            className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                          >
                            Click any set to explore
                          </button>
                        </div>

                        {/* Nested Diagram Body */}
                        <div className="w-full flex items-stretch gap-3">
                          {/* Left: Rational Numbers & Nested Subsets */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSetId(activeSetId === 'rational' ? null : 'rational');
                            }}
                            className={`flex-1 rounded-xl p-2.5 sm:p-3 flex flex-col items-center transition-all cursor-pointer ${
                              activeSetId === 'rational'
                                ? 'bg-[#dcfce7] border-2 border-emerald-600 ring-2 ring-emerald-400 shadow-md'
                                : 'bg-[#f0fdf4] border border-[#86efac] hover:border-emerald-400 shadow-2xs'
                            }`}
                          >
                            <span className="font-bold text-[#15803d] text-xs sm:text-sm mb-2 text-center">
                              Rational Numbers <span className="font-serif">ℚ</span>
                            </span>

                            {/* Integers */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSetId(activeSetId === 'integers' ? null : 'integers');
                              }}
                              className={`w-full rounded-lg p-2 sm:p-2.5 flex flex-col items-center mb-1 transition-all cursor-pointer ${
                                activeSetId === 'integers'
                                  ? 'bg-[#fef08a] border-2 border-amber-600 ring-2 ring-amber-400 shadow-md'
                                  : 'bg-[#fefce8] border border-[#fde047] hover:border-amber-400'
                              }`}
                            >
                              <span className="font-bold text-[#a16207] text-[11px] sm:text-xs mb-1.5 text-center">
                                Integers <span className="font-serif">ℤ</span>
                              </span>

                              {/* Whole Numbers */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSetId(activeSetId === 'whole' ? null : 'whole');
                                }}
                                className={`w-full rounded-md p-1.5 sm:p-2 flex flex-col items-center mb-1 transition-all cursor-pointer ${
                                  activeSetId === 'whole'
                                    ? 'bg-[#fed7aa] border-2 border-orange-600 ring-2 ring-orange-400 shadow-md'
                                    : 'bg-[#fff7ed] border border-[#fdba74] hover:border-orange-400'
                                }`}
                              >
                                <span className="font-bold text-[#c2410c] text-[11px] sm:text-xs mb-1 text-center">
                                  Whole Numbers <span className="font-serif">𝕎</span>
                                </span>

                                {/* Natural Numbers */}
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSetId(activeSetId === 'natural' ? null : 'natural');
                                  }}
                                  className={`w-full rounded p-1 text-center transition-all cursor-pointer ${
                                    activeSetId === 'natural'
                                      ? 'bg-[#fbcfe8] border-2 border-pink-600 ring-2 ring-pink-400 shadow-md'
                                      : 'bg-[#fdf2f8] border border-[#f472b6] hover:border-pink-400'
                                  }`}
                                >
                                  <span className="font-bold text-[#be185d] text-[11px]">
                                    Natural Numbers <span className="font-serif">ℕ</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Irrational Numbers */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSetId(activeSetId === 'irrational' ? null : 'irrational');
                            }}
                            className={`w-28 sm:w-36 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all cursor-pointer shrink-0 ${
                              activeSetId === 'irrational'
                                ? 'bg-[#bfdbfe] border-2 border-blue-600 ring-2 ring-blue-400 shadow-md'
                                : 'bg-[#eff6ff] border border-[#bfdbfe] hover:border-blue-400 shadow-2xs'
                            }`}
                          >
                            <span className="font-bold text-slate-800 text-xs leading-tight">
                              Irrational Numbers
                            </span>
                            <div className="text-slate-500 text-xs font-mono mt-4">
                              √2, π, e, ...
                            </div>
                          </div>
                        </div>

                        {/* Interactive Inspector Pill Box */}
                        {activeSetId && setDetails[activeSetId] && (
                          <div className="mt-3.5 w-full bg-white rounded-xl p-3 border border-blue-200 text-xs space-y-1 shadow-xs animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-900 text-sm">
                                {setDetails[activeSetId].name} ({setDetails[activeSetId].symbol})
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveSetId(null)}
                                className="text-slate-400 hover:text-slate-600 text-[11px] font-semibold"
                              >
                                Clear
                              </button>
                            </div>
                            <p className="text-slate-700 leading-relaxed">{setDetails[activeSetId].desc}</p>
                            <div className="text-[11px] text-slate-500 pt-0.5">
                              <strong className="text-slate-800">Contained inside: </strong>
                              {setDetails[activeSetId].containedIn.join(' ⊂ ')}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Set Notation Bottom Strip */}
                      <div className="mt-4 pt-3 border-t border-slate-100 w-full text-center text-slate-500 font-serif font-bold text-sm tracking-widest">
                        ℕ ⊂ 𝕎 ⊂ ℤ ⊂ ℚ ⊂ ℝ
                      </div>
                    </div>

                    {/* Right: Summary Table */}
                    <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs flex flex-col justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm mb-2.5">
                          Number Sets at a Glance
                        </h4>

                        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                <th className="py-2 px-2.5">Set</th>
                                <th className="py-2 px-2.5">Meaning</th>
                                <th className="py-2 px-2.5">Examples</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                              <tr className="hover:bg-slate-50/50">
                                <td className="py-2 px-2.5 font-bold text-slate-900 whitespace-nowrap">
                                  Natural <span className="font-serif">ℕ</span>
                                </td>
                                <td className="py-2 px-2.5">Counting numbers (start at 1)</td>
                                <td className="py-2 px-2.5 font-mono text-slate-600">1, 2, 3, ...</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50">
                                <td className="py-2 px-2.5 font-bold text-slate-900 whitespace-nowrap">
                                  Whole <span className="font-serif">𝕎</span>
                                </td>
                                <td className="py-2 px-2.5">Natural numbers + 0</td>
                                <td className="py-2 px-2.5 font-mono text-slate-600">0, 1, 2, 3, ...</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50">
                                <td className="py-2 px-2.5 font-bold text-slate-900 whitespace-nowrap">
                                  Integer <span className="font-serif">ℤ</span>
                                </td>
                                <td className="py-2 px-2.5">Whole numbers + negatives</td>
                                <td className="py-2 px-2.5 font-mono text-slate-600">..., -2, -1, 0, 1, 2, ...</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50">
                                <td className="py-2 px-2.5 font-bold text-slate-900 whitespace-nowrap">
                                  Rational <span className="font-serif">ℚ</span>
                                </td>
                                <td className="py-2 px-2.5">
                                  Can be written as <span className="font-serif italic">a/b</span> (
                                  <span className="font-serif italic">a, b</span> ∈ <span className="font-serif">ℤ</span>, <span className="font-serif italic">b</span> ≠ 0)
                                </td>
                                <td className="py-2 px-2.5 font-mono text-slate-600">3/4, -7, 0.25, 0.333...</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50">
                                <td className="py-2 px-2.5 font-bold text-slate-900 whitespace-nowrap">
                                  Irrational
                                </td>
                                <td className="py-2 px-2.5">
                                  Cannot be expressed as <span className="font-serif italic">a/b</span>
                                </td>
                                <td className="py-2 px-2.5 font-mono text-slate-600">√2, π, e, ...</td>
                              </tr>
                              <tr className="hover:bg-slate-50/50">
                                <td className="py-2 px-2.5 font-bold text-slate-900 whitespace-nowrap">
                                  Real <span className="font-serif">ℝ</span>
                                </td>
                                <td className="py-2 px-2.5">All rational and irrational numbers</td>
                                <td className="py-2 px-2.5 text-slate-600">All points on the number line</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Key Takeaway & Common Trap (Matching image.png) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                    {/* Left: Key Takeaway */}
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-2xl p-4.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#15803d] font-bold text-xs mb-2.5">
                        <AppArtwork name="bulb" inline className="w-4 h-4 text-[#15803d]" />
                        <span>Key Takeaway</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
                        <li>• Every natural number is a whole number.</li>
                        <li>• Every whole number is an integer.</li>
                        <li>• Every integer is a rational number.</li>
                        <li>• Every rational and irrational number is a real number.</li>
                        <li>• The real numbers include all points on the number line.</li>
                      </ul>
                    </div>

                    {/* Right: Common Trap */}
                    <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-2xl p-4.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#be123c] font-bold text-xs mb-2">
                        <AlertTriangle className="w-4 h-4 text-[#be123c]" />
                        <span>Common Trap</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed">
                        A radical sign does not automatically mean a number is irrational. For
                        example, <span className="font-mono font-bold">√9 = 3</span>, which is a rational number.
                      </p>
                    </div>
                  </div>

                  {/* Notes & Mnemonics Collapsible Accordion */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                      className="w-full p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <AppArtwork name="exam" inline className="w-4 h-4 text-blue-600" />
                        <span>My Notes &amp; Mnemonics</span>
                        {notesCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                            {notesCount} saved
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isNotesExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isNotesExpanded && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <RealNumbersConceptNotes
                          currentStepId={1}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer (Matching image.png) */}
                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setIsKnowledgeCheckOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span>Check Understanding</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: RATIONAL VS. IRRATIONAL */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        2. Rational vs. Irrational Numbers
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        Learn how to distinguish rational from irrational numbers by their decimal
                        expansions and fractional representations.
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200/60 shrink-0">
                      Step 2 of 4
                    </span>
                  </div>

                  {/* 3 Categories of Decimals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
                      <div className="text-xs font-bold uppercase text-emerald-800 mb-1">
                        Terminating Decimals
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Rational (ℚ)</h4>
                      <p className="text-xs text-slate-600 mb-2">
                        Decimals that end cleanly after a finite number of digits.
                      </p>
                      <div className="font-mono text-xs bg-white p-2 rounded-lg border border-emerald-100 text-slate-800">
                        3/4 = 0.75<br />
                        -5/8 = -0.625
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 shadow-2xs">
                      <div className="text-xs font-bold uppercase text-blue-800 mb-1">
                        Repeating Decimals
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Rational (ℚ)</h4>
                      <p className="text-xs text-slate-600 mb-2">
                        Decimals that continue infinitely with a repeating period pattern.
                      </p>
                      <div className="font-mono text-xs bg-white p-2 rounded-lg border border-blue-100 text-slate-800">
                        1/3 = 0.333...<br />
                        22/7 ≈ 3.142857...
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 shadow-2xs">
                      <div className="text-xs font-bold uppercase text-rose-800 mb-1">
                        Non-Terminating & Non-Repeating
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">Irrational (ℝ \ ℚ)</h4>
                      <p className="text-xs text-slate-600 mb-2">
                        Decimals that never end and have no repeating block pattern.
                      </p>
                      <div className="font-mono text-xs bg-white p-2 rounded-lg border border-rose-100 text-slate-800">
                        √2 ≈ 1.41421356...<br />
                        π ≈ 3.14159265...
                      </div>
                    </div>
                  </div>

                  {/* Repeating Decimals Algebraic Conversion Widget */}
                  <div className="bg-[#f0fdf4] border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AppArtwork name="bulb" inline className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            Algebraic Proof: Converting Repeating Decimals to Fractions
                          </h4>
                          <p className="text-xs text-slate-600">
                            The standard algebraic cancellation method frequently required in Board Exam calculations.
                          </p>
                        </div>
                      </div>

                      {/* Example Selector Pills */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {repeatingDecimalExamples.map((ex, idx) => (
                          <button
                            key={ex.decimal}
                            type="button"
                            onClick={() => setSelectedDecimalExample(idx)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              selectedDecimalExample === idx
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-emerald-100/70 hover:bg-emerald-200 text-emerald-900'
                            }`}
                          >
                            {ex.decimal}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active Conversion Steps Box */}
                    <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                          {repeatingDecimalExamples[selectedDecimalExample].title}
                        </span>
                        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                          Result: {repeatingDecimalExamples[selectedDecimalExample].fraction}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs sm:text-sm font-mono text-slate-800 bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                        {repeatingDecimalExamples[selectedDecimalExample].steps.map((st, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-slate-400 font-sans font-bold select-none text-[11px] mt-0.5">
                              Step {i + 1}:
                            </span>
                            <span className="text-slate-900 font-medium">{st}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 italic">
                        💡 {repeatingDecimalExamples[selectedDecimalExample].note}
                      </p>
                    </div>
                  </div>

                  {/* Closure Properties Matrix (Toggleable) */}
                  <div className="bg-[#f8faff] border border-blue-200/80 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AppArtwork name="cards" inline className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            High-Yield Closure Properties Matrix
                          </h4>
                          <p className="text-xs text-slate-600">
                            Is the result guaranteed to remain inside the same set under each operation?
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowClosureMatrix(!showClosureMatrix)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 cursor-pointer transition-colors"
                      >
                        {showClosureMatrix ? 'Hide Matrix' : 'Show Matrix'}
                      </button>
                    </div>

                    {showClosureMatrix && (
                      <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden shadow-2xs text-xs animate-in fade-in duration-150">
                        <div className="overflow-x-auto">
                          <table className="w-full text-center border-collapse">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                <th className="py-2.5 px-3 text-left">Set</th>
                                <th className="py-2.5 px-3">Addition (+)</th>
                                <th className="py-2.5 px-3">Subtraction (−)</th>
                                <th className="py-2.5 px-3">Multiplication (×)</th>
                                <th className="py-2.5 px-3">Division (÷)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                              <tr>
                                <td className="py-2 px-3 font-semibold text-slate-900 text-left">
                                  Natural (ℕ)
                                </td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-rose-600 font-bold">✗ No (2 - 5 = -3)</td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-rose-600 font-bold">✗ No (1 ÷ 2 = 0.5)</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 font-semibold text-slate-900 text-left">
                                  Integers (ℤ)
                                </td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-rose-600 font-bold">✗ No (3 ÷ 4 = 0.75)</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 font-semibold text-slate-900 text-left">
                                  Rational (ℚ)
                                </td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes (b ≠ 0)</td>
                              </tr>
                              <tr className="bg-rose-50/40">
                                <td className="py-2 px-3 font-semibold text-rose-950 text-left">
                                  Irrational (ℝ \ ℚ)
                                </td>
                                <td className="py-2 px-3 text-rose-600 font-bold">✗ No (√2 + (-√2) = 0)</td>
                                <td className="py-2 px-3 text-rose-600 font-bold">✗ No (√2 - √2 = 0)</td>
                                <td className="py-2 px-3 text-rose-600 font-bold">✗ No (√2 × √2 = 2)</td>
                                <td className="py-2 px-3 text-rose-600 font-bold">✗ No (√2 ÷ √2 = 1)</td>
                              </tr>
                              <tr>
                                <td className="py-2 px-3 font-semibold text-slate-900 text-left">
                                  Real (ℝ)
                                </td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes</td>
                                <td className="py-2 px-3 text-emerald-700 font-bold">✓ Yes (b ≠ 0)</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-slate-50 p-2.5 text-[11px] text-slate-600 border-t border-slate-200">
                          <strong>Note:</strong> Irrationals are NOT closed under any of the four basic arithmetic operations!
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Board Exam Golden Rules Callout */}
                  <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                      <AppArtwork name="star" inline className="w-4 h-4 text-blue-600" />
                      <span>ECE / Board Exam Golden Rules</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700">
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                        <strong className="text-slate-900">Approximations vs Actual:</strong> 22/7 and 3.14 are rational approximations of π, but <span className="font-serif font-bold text-blue-700">π itself is strictly irrational</span>.
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                        <strong className="text-slate-900">Roots of Non-Squares:</strong> For any positive integer <span className="font-serif italic">n</span>, <span className="font-serif">√n</span> is either an integer or irrational; it is never a non-integer rational fraction.
                      </div>
                    </div>
                  </div>

                  {/* Notes & Mnemonics Collapsible Accordion */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                      className="w-full p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <AppArtwork name="exam" inline className="w-4 h-4 text-blue-600" />
                        <span>My Notes &amp; Mnemonics</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isNotesExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isNotesExpanded && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <RealNumbersConceptNotes
                          currentStepId={2}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Step Navigation & Check Understanding */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleStepChange(1)}
                      className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous: Number Sets</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsKnowledgeCheckOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span>Check Understanding</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CLASSIFYING NUMBERS (Interactive Mini-Lab) */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        3. Interactive Number Classifier
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        Test your mastery by selecting all mathematical sets that apply to the given
                        number.
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200/60 shrink-0">
                      Step 3 of 4
                    </span>
                  </div>

                  {/* Interactive Classification Card */}
                  <div className="p-6 rounded-2xl bg-[#f8faff] border border-blue-200/80 shadow-xs space-y-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Challenge {testNumberIndex + 1} of {classificationItems.length}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Select all sets that apply
                      </span>
                    </div>

                    {/* Number Display */}
                    <div className="py-4 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900">
                        {classificationItems[testNumberIndex].display}
                      </span>
                    </div>

                    {/* Sets Selection Buttons */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { name: 'Natural', symbol: 'ℕ' },
                        { name: 'Whole', symbol: 'W' },
                        { name: 'Integer', symbol: 'ℤ' },
                        { name: 'Rational', symbol: 'ℚ' },
                        { name: 'Irrational', symbol: 'ℝ\\ℚ' },
                        { name: 'Real', symbol: 'ℝ' },
                      ].map((set) => {
                        const isSelected = userSelectedSets.includes(set.name);
                        const isCorrectSet = classificationItems[testNumberIndex].correctSets.includes(set.name);

                        let badgeColor = 'bg-white border-slate-200 text-slate-700 hover:border-blue-300';
                        if (isSelected) {
                          badgeColor = 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs';
                        }
                        if (hasSubmittedClassification) {
                          if (isCorrectSet && isSelected) {
                            badgeColor = 'bg-emerald-600 border-emerald-600 text-white font-bold';
                          } else if (!isCorrectSet && isSelected) {
                            badgeColor = 'bg-rose-600 border-rose-600 text-white font-bold';
                          } else if (isCorrectSet && !isSelected) {
                            badgeColor = 'bg-emerald-50 border-2 border-dashed border-emerald-500 text-emerald-800 font-bold';
                          }
                        }

                        return (
                          <button
                            key={set.name}
                            type="button"
                            onClick={() => handleToggleSetSelection(set.name)}
                            disabled={hasSubmittedClassification}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${badgeColor}`}
                          >
                            <span>{set.name}</span>
                            <span className="font-serif font-bold text-xs opacity-80">
                              {set.symbol}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Action & Feedback */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      {!hasSubmittedClassification ? (
                        <button
                          type="button"
                          onClick={handleCheckClassification}
                          disabled={userSelectedSets.length === 0}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                        >
                          Check Classification
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextClassificationItem}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>Next Number</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {hasSubmittedClassification && (
                        <div className="text-xs sm:text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200 flex-1 leading-relaxed shadow-2xs">
                          {classificationItems[testNumberIndex].explanation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes & Mnemonics Collapsible Accordion */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                      className="w-full p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <AppArtwork name="exam" inline className="w-4 h-4 text-blue-600" />
                        <span>My Notes &amp; Mnemonics</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isNotesExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isNotesExpanded && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <RealNumbersConceptNotes
                          currentStepId={3}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Step Navigation & Check Understanding */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleStepChange(2)}
                      className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous: Rational vs. Irrational</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsKnowledgeCheckOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span>Check Understanding</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: ORDERING & COMPARING */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        4. Ordering & Comparing on the Real Line
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        Every real number corresponds to exactly one point on the coordinate line.
                        Compare values by evaluating their standard decimal values.
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200/60 shrink-0">
                      Step 4 of 4
                    </span>
                  </div>

                  {/* Interactive Visual Number Line */}
                  <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>Interactive Continuous Real Number Line</span>
                      <span>Click any marker to inspect</span>
                    </div>

                    {/* SVG Number Line */}
                    <div className="relative py-8 px-4 overflow-x-auto">
                      <svg
                        className="w-full min-w-[520px] h-20"
                        viewBox="0 0 600 80"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Base axis line with arrowheads */}
                        <line x1="20" y1="45" x2="580" y2="45" stroke="#94a3b8" strokeWidth="2.5" />
                        <polygon points="15,45 25,40 25,50" fill="#94a3b8" />
                        <polygon points="585,45 575,40 575,50" fill="#94a3b8" />

                        {/* Major ticks: -3, -2, -1, 0, 1, 2, 3, 4 */}
                        {[
                          { val: -3, x: 60 },
                          { val: -2, x: 130 },
                          { val: -1, x: 200 },
                          { val: 0, x: 270 },
                          { val: 1, x: 340 },
                          { val: 2, x: 410 },
                          { val: 3, x: 480 },
                          { val: 4, x: 550 },
                        ].map((t) => (
                          <g key={t.val}>
                            <line x1={t.x} y1="37" x2={t.x} y2="53" stroke="#64748b" strokeWidth="2" />
                            <text
                              x={t.x}
                              y="68"
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="600"
                              fill="#475569"
                            >
                              {t.val}
                            </text>
                          </g>
                        ))}

                        {/* Highlighted Points */}
                        {[
                          { id: 'neg_sqrt5', label: '-√5', dec: '-2.236', x: 113, color: '#dc2626' },
                          { id: 'neg_half', label: '-1/2', dec: '-0.5', x: 235, color: '#2563eb' },
                          { id: 'zero', label: '0', dec: '0.0', x: 270, color: '#059669' },
                          { id: 'sqrt2', label: '√2', dec: '1.414', x: 369, color: '#d97706' },
                          { id: 'e', label: 'e', dec: '2.718', x: 460, color: '#7c3aed' },
                          { id: 'pi', label: 'π', dec: '3.141', x: 490, color: '#db2777' },
                        ].map((p) => {
                          const isCurrent = activeNumberLinePoint === p.id;
                          return (
                            <g
                              key={p.id}
                              className="cursor-pointer transition-all"
                              onClick={() => setActiveNumberLinePoint(p.id)}
                            >
                              {/* Label above */}
                              <text
                                x={p.x}
                                y={isCurrent ? '18' : '22'}
                                textAnchor="middle"
                                fontSize={isCurrent ? '13' : '11'}
                                fontWeight={isCurrent ? '800' : '700'}
                                fill={p.color}
                              >
                                {p.label}
                              </text>
                              {/* Point Pin */}
                              <circle
                                cx={p.x}
                                cy="45"
                                r={isCurrent ? '6' : '4.5'}
                                fill={p.color}
                                stroke="#ffffff"
                                strokeWidth="2"
                              />
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* Active point description box */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-center justify-between">
                      <div>
                        {activeNumberLinePoint === 'sqrt2' && (
                          <p>
                            <strong className="text-slate-900">√2 (approx. 1.414):</strong> Lies
                            between 1 and 2. Because 1² = 1 and 2² = 4, 1 &lt; √2 &lt; 2.
                          </p>
                        )}
                        {activeNumberLinePoint === 'pi' && (
                          <p>
                            <strong className="text-slate-900">π (approx. 3.14159):</strong> Lies
                            just to the right of 3. Distinct from rational approximation 22/7 (≈ 3.1428).
                          </p>
                        )}
                        {activeNumberLinePoint === 'e' && (
                          <p>
                            <strong className="text-slate-900">e (approx. 2.718):</strong> Euler’s
                            number, fundamental base of natural logarithms. Lies between 2 and 3.
                          </p>
                        )}
                        {activeNumberLinePoint === 'neg_sqrt5' && (
                          <p>
                            <strong className="text-slate-900">-√5 (approx. -2.236):</strong> Since
                            √5 ≈ 2.236, -√5 sits between -2 and -3.
                          </p>
                        )}
                        {activeNumberLinePoint === 'neg_half' && (
                          <p>
                            <strong className="text-slate-900">-1/2 (-0.5):</strong> Exactly halfway
                            between 0 and -1.
                          </p>
                        )}
                        {activeNumberLinePoint === 'zero' && (
                          <p>
                            <strong className="text-slate-900">0 (Origin):</strong> Separates
                            negative real numbers from positive real numbers.
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-blue-600 font-semibold underline shrink-0 ml-3">
                        Point Selected
                      </span>
                    </div>
                  </div>

                  {/* Interactive Ordering Sandbox */}
                  <div className="bg-[#f0f9ff] border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AppArtwork name="triangle" inline className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            Hands-On Ordering Sandbox: Arrange in Ascending Order
                          </h4>
                          <p className="text-xs text-slate-600">
                            Use the arrow controls to swap and arrange the cards from smallest to largest.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleCheckOrdering}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                        >
                          Verify Order
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOrderingItems([
                              { id: 'item-1', label: '√3', val: 1.732, approx: '≈ 1.732' },
                              { id: 'item-2', label: '5/3', val: 1.667, approx: '≈ 1.667' },
                              { id: 'item-3', label: '1.7', val: 1.700, approx: '= 1.700' },
                              { id: 'item-4', label: '7/4', val: 1.750, approx: '= 1.750' },
                            ]);
                            setOrderingChecked(false);
                            setOrderingSuccess(false);
                          }}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          title="Reset"
                        >
                          <AppArtwork name="cycle" inline className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Ordering Cards Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {orderingItems.map((item, idx) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-3 border-2 border-slate-200/90 shadow-2xs flex flex-col items-center justify-between gap-2"
                        >
                          <span className="text-xs text-slate-400 font-bold">Position {idx + 1}</span>
                          <span className="text-xl font-bold font-mono text-slate-900">{item.label}</span>
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {item.approx}
                          </span>

                          <div className="flex items-center gap-1 w-full pt-1 border-t border-slate-100 justify-center">
                            <button
                              type="button"
                              onClick={() => handleMoveOrderingItem(idx, 'left')}
                              disabled={idx === 0}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer text-slate-700"
                              title="Move Left"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveOrderingItem(idx, 'right')}
                              disabled={idx === orderingItems.length - 1}
                              className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 cursor-pointer text-slate-700"
                              title="Move Right"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {orderingChecked && (
                      <div
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2 ${
                          orderingSuccess
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        {orderingSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              <strong>Correct!</strong> 5/3 (1.667) &lt; 1.700 &lt; √3 (1.732) &lt; 7/4 (1.750).
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>
                              <strong>Not quite:</strong> Look closely at the 3-decimal values to compare tenths and hundredths.
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ordering Rule Table */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-white text-xs sm:text-sm space-y-2">
                    <h4 className="font-bold text-slate-900">
                      Standard Ordering Strategy for Board Problems
                    </h4>
                    <p className="text-slate-600">
                      When asked to arrange mixed numbers in ascending or descending order (e.g. 5/3, √3, 1.7, 7/4):
                    </p>
                    <ol className="list-decimal pl-5 space-y-1 text-slate-700">
                      <li>Convert all fractional values to 3-digit decimal approximations.</li>
                      <li>For radical terms, approximate using bounding squares: √3 ≈ 1.732.</li>
                      <li>Compare directly on the real line: 5/3 (1.667) &lt; 1.700 &lt; √3 (1.732) &lt; 7/4 (1.750).</li>
                    </ol>
                  </div>

                  {/* Notes & Mnemonics Collapsible Accordion */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                      className="w-full p-3.5 sm:p-4 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <AppArtwork name="exam" inline className="w-4 h-4 text-blue-600" />
                        <span>My Notes &amp; Mnemonics</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isNotesExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isNotesExpanded && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        <RealNumbersConceptNotes
                          currentStepId={4}
                          compact={true}
                        />
                      </div>
                    )}
                  </div>

                  {/* Step Navigation & Check Understanding */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleStepChange(3)}
                      className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous: Classifying Numbers</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsKnowledgeCheckOpen(true)}
                      className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span>Check Understanding</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        )}

        {/* TAB: PRACTICE (Matching exact GUI from image.png) */}
        {activeTab === 'practice' && (
          <RealNumbersPractice
            onOpenAIHelp={(prompt) =>
              openChat(
                prompt,
                'Mathematics Specialist'
              )
            }
            onNavigateLearn={(stepId) => {
              setCurrentStep(stepId);
              setActiveTab('learn');
            }}
          />
        )}

        {/* TAB: FLASHCARDS */}
        {activeTab === 'flashcards' && (
          <RealNumbersFlashcards
            onBackToLearn={() => setActiveTab('learn')}
            onOpenAIHelp={(concept) =>
              openChat(
                `Explain the number system concept "${concept}" in detail with real numbers rules, proofs, and common board exam traps.`,
                'Mathematics Specialist'
              )
            }
          />
        )}

        {/* QUIZ uses the canonical review engine so scores feed the central topic record. */}
        {activeTab === 'quiz' && (
          <MathTopicQuizView canonicalTopicId="top-real-numbers" title="Real Numbers & Number Systems" />
        )}

        {/* MISTAKES / PROGRESS */}
        {activeTab === 'mistakes' && (
          <MathTopicMistakesView canonicalTopicId="top-real-numbers" title="Real Numbers & Number Systems" />
        )}

        {activeTab === 'progress' && (
          <RealNumbersProgress
            onOpenAIHelp={(prompt) =>
              openChat(
                prompt,
                'Mathematics Specialist'
              )
            }
            onNavigateLearn={(stepId) => {
              setCurrentStep(stepId);
              setActiveTab('learn');
            }}
            onNavigateReview={() => {
              setActiveTab('quiz');
            }}
          />
        )}
        </div>
      </div>

      {/* Adaptive Concept Mastery Assessment Modal (5-Level Evidence Calibrated) */}
      {assessmentConceptId !== null && (
        <AdaptiveMasteryAssessmentModal
          conceptId={assessmentConceptId}
          conceptTitle={
            assessmentConceptId === 1
              ? '1. Number Sets & Hierarchy'
              : assessmentConceptId === 2
              ? '2. Rational vs. Irrational Numbers'
              : assessmentConceptId === 3
              ? '3. Classifying Numbers & Board Traps'
              : '4. Ordering, Approximating & Inequalities'
          }
          isOpen={assessmentConceptId !== null}
          onClose={() => setAssessmentConceptId(null)}
        />
      )}

      {/* Knowledge Check Full Modal */}
      {isKnowledgeCheckOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setIsKnowledgeCheckOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <AppArtwork name="book" inline className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Knowledge Check — Step {currentStep}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKnowledgeCheckOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <RealNumbersKnowledgeCheck
                currentStepId={currentStep}
                targetSubTopicId={quizTargetSubTopicId}
                onNavigateNextStep={() => {
                  if (currentStep < 4) handleStepChange(currentStep + 1);
                  setIsKnowledgeCheckOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
