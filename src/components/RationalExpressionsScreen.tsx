import { ManualLearnTracker } from './learn-reader/ManualLearnTracker';
import { lessonCardTrackingId } from '../domain/learn/manualLearnTracking';
import { useAlgebraLearnTrackingIdentity } from '../hooks/useAlgebraLearnTrackingIdentity';
import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { useExclusiveDropdown } from '../hooks/useExclusiveDropdown';
import { MathFormula } from './MathFormula';
import { useReview } from '../context/ReviewContext';
import { TreeMenuHeader } from './TreeMenuHeader';
import { MoreHorizontal, AlertTriangle, CheckCircle2, ArrowRight, ArrowLeft, Play, ExternalLink, X, List } from 'lucide-react';
import { PracticeTab } from './rational-expressions/PracticeTab';
import { QuizTab } from './rational-expressions/QuizTab';
import { MistakesTab } from './rational-expressions/MistakesTab';
import { MyNotesModal } from './rational-expressions/MyNotesModal';
import { StudyPlanModal } from './rational-expressions/StudyPlanModal';
import { SimilarProblemModal } from './rational-expressions/SimilarProblemModal';
import { AlgebraFormulaModal } from './AlgebraFormulaModal';
import {
  MISTAKE_SIMILAR_PROBLEMS,
  WORKED_EXAMPLE_SIMILAR_PROBLEMS,
  SimilarProblemData,
} from './rational-expressions/similarProblemsData';
import { SubtopicMasteryTrackerCard, SubtopicMasteryItem } from './common/SubtopicMasteryTrackerCard';
import { DomainRestrictionsModule } from './rational-expressions/DomainRestrictionsModule';
import { RationalGraphVisualizer } from './rational-expressions/RationalGraphVisualizer';
import { MathTopicLifecycleTabs, MathTopicLifecycleView } from './math/MathTopicLifecycleTabs';
import { MathTopicStatusStrip } from './math/MathTopicStatusStrip';
import { ReferenceStudyBlueprint } from './math/ReferenceStudyBlueprint';
import { ALGEBRA_REFERENCE_CONTENT } from '../data/algebraReferenceContent';

// 8 Study Path Sections
const STUDY_PATH_SECTIONS = [
  { id: 1, title: 'Domain Restrictions & Excluded Values', status: 'completed' },
  { id: 2, title: 'Simplification & Factoring', status: 'completed' },
  { id: 3, title: 'Sign Inversion & Common Factors', status: 'completed' },
  { id: 4, title: 'Multiplication & Division', status: 'current' },
  { id: 5, title: 'Addition & Subtraction (LCD)', status: 'next' },
  { id: 6, title: 'Complex Rational Fractions', status: 'upcoming' },
  { id: 7, title: 'Rational Equations & Extraneous Roots', status: 'upcoming' },
  { id: 8, title: 'Board Problem Applications & Work Rates', status: 'upcoming' },
];

export const RationalExpressionsScreen: React.FC = () => {
  const manualLearnIdentity=useAlgebraLearnTrackingIdentity('top-alg-fractions','Rational Expressions');

  const { setCurrentScreen, openVoiceConversation, openChat, allTopics, startReview, testRecords } = useReview();

  // Standard Mathematics topic lifecycle navigation.
  const [activeTab, setActiveTab] = useState<MathTopicLifecycleView>('learn');

  // Study Path section state: defaults to Section 1 (Domain Restrictions & Excluded Values)
  const [currentSectionId, setCurrentSectionId] = useState<number>(1);

  // Guided Example State
  const [exampleIdx, setExampleIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('A');
  const [isChecked, setIsChecked] = useState<boolean>(true); // default option A is checked & correct
  const [isStepRevealed, setIsStepRevealed] = useState<boolean>(false);

  // Modals
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useExclusiveDropdown();
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isStudyPlanOpen, setIsStudyPlanOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [isQuickCheckOpen, setIsQuickCheckOpen] = useState(false);
  const [isGraphVisualizerModalOpen, setIsGraphVisualizerModalOpen] = useState(false);

  // Quick Check Answers state
  const [quickCheckAnswers, setQuickCheckAnswers] = useState<Record<number, string>>({});
  const [quickCheckSubmitted, setQuickCheckSubmitted] = useState(false);

  // Practice & Mistakes state
  const [isSimilarProblemModalOpen, setIsSimilarProblemModalOpen] = useState(false);
  const [currentSimilarProblem, setCurrentSimilarProblem] = useState<SimilarProblemData | null>(null);
  const [resolvedMistakeIds, setResolvedMistakeIds] = useState<number[]>([]);
  const [practiceSubskill, setPracticeSubskill] = useState<string | undefined>(undefined);
  const [practiceAutoStart, setPracticeAutoStart] = useState(false);

  // Only real, automatically graded item-level practice is shown; old hardcoded
  // sparklines and mastery levels have been removed in v10.9. Scores based on one
  // question are explicitly practice results, never verified mastery.
  const subtopicDescriptors: Array<{id:string;name:string;category:string;questionId:string | null}> = [
    {id:'sub-domain',name:'Domain Restrictions & Excluded Values',category:'Foundations',questionId:'rat-q1'},
    {id:'sub-simplify',name:'Simplifying & Factoring / Sign Reversal',category:'Foundations',questionId:'rat-q2'},
    {id:'sub-mult-div',name:'Multiplication & Division',category:'Operations',questionId:'rat-q3'},
    {id:'sub-add-sub',name:'Addition & Subtraction (LCD)',category:'Operations',questionId:'rat-q4'},
    {id:'sub-complex',name:'Complex Rational Fractions',category:'Advanced',questionId:null},
    {id:'sub-equations',name:'Rational Equations & Extraneous Roots',category:'Equations',questionId:'rat-q5'},
  ];
  const rationalSubtopics: SubtopicMasteryItem[] = subtopicDescriptors.map(desc => {
    const answers = testRecords.filter(t => t.provenance === 'automatic').flatMap(t => t.itemResults || [])
      .filter(item => item.questionId === desc.questionId && desc.questionId !== null);
    const historyScores = answers.map(a => a.selectedOptionId === a.correctOptionId ? 100 : 0);
    const currentMasteryPct = answers.length
      ? Math.round((historyScores.reduce((a,b) => a+b,0) / answers.length)) : 0;
    return {id:desc.id,name:desc.name,category:desc.category,
      historyScores: historyScores.slice(-5),currentMasteryPct,
      attemptsCount:answers.length,
      status:answers.length === 0 ? 'unassessed' : currentMasteryPct < 70 ? 'at-risk' : 'recovering',
      riskReason: answers.length === 0 ? 'No independently graded question attempts recorded.'
        : 'Provisional practice accuracy only; the available question pool does not establish mastery.',
    };
  });

  // Examples data for guided step-through
  const EXAMPLES = [
    {
      title: 'Example 1 of 3',
      expression: '\\frac{x^2 - 9}{x^2 + 2x - 3}',
      prompt: 'What should you do first?',
      options: [
        { key: 'A', text: 'Factor numerator and denominator', isCorrect: true },
        { key: 'B', text: 'Distribute the terms in the numerator', isCorrect: false },
        { key: 'C', text: 'Cancel the x² terms', isCorrect: false },
        { key: 'D', text: 'Add the numerator and denominator', isCorrect: false },
      ],
      steps: [
        {
          step: 1,
          label: 'Factor Numerator',
          formula: 'x^2 - 9 = (x - 3)(x + 3)',
          detail: 'Recognize the difference of two squares pattern: a² - b² = (a - b)(a + b).',
        },
        {
          step: 2,
          label: 'Factor Denominator',
          formula: 'x^2 + 2x - 3 = (x + 3)(x - 1)',
          detail: 'Find two numbers whose product is -3 and sum is +2: (+3) and (-1).',
        },
        {
          step: 3,
          label: 'State Excluded Values & Cancel Factor',
          formula: '\\frac{(x - 3)(x + 3)}{(x + 3)(x - 1)} = \\frac{x - 3}{x - 1}, \\quad x \\neq -3, 1',
          detail: 'Cancel the common binomial factor (x + 3). Never cancel individual x terms.',
        },
      ],
    },
    {
      title: 'Example 2 of 3',
      expression: '\\frac{2x^2 + 6x}{x^2 - 4} \\cdot \\frac{x - 2}{x + 3}',
      prompt: 'What should you do first?',
      options: [
        { key: 'A', text: 'Factor out common GCFs and differences of squares', isCorrect: true },
        { key: 'B', text: 'Multiply numerators directly into a 3rd degree polynomial', isCorrect: false },
        { key: 'C', text: 'Cancel the x terms directly', isCorrect: false },
        { key: 'D', text: 'Cross-multiply the denominators', isCorrect: false },
      ],
      steps: [
        {
          step: 1,
          label: 'Factor All Parts',
          formula: '\\frac{2x(x + 3)}{(x - 2)(x + 2)} \\cdot \\frac{x - 2}{x + 3}',
          detail: 'Extract GCF 2x from 2x²+6x, and factor x²-4 into (x-2)(x+2).',
        },
        {
          step: 2,
          label: 'Cancel Common Factors',
          formula: '\\frac{2x}{x + 2}, \\quad x \\neq \\pm 2, -3',
          detail: 'Cancel (x + 3) and (x - 2). Note all excluded values from original denominators.',
        },
      ],
    },
    {
      title: 'Example 3 of 3',
      expression: '\\frac{x^2 - 25}{x + 1} \\div \\frac{x - 5}{x^2 - 1}',
      prompt: 'What should you do first?',
      options: [
        { key: 'A', text: 'Multiply by the reciprocal ("Keep-Change-Flip")', isCorrect: true },
        { key: 'B', text: 'Divide the numerator by the denominator directly', isCorrect: false },
        { key: 'C', text: 'Cancel the x - 5 terms before inverting', isCorrect: false },
        { key: 'D', text: 'Subtract the two fractions', isCorrect: false },
      ],
      steps: [
        {
          step: 1,
          label: 'Invert the Divisor',
          formula: '\\frac{x^2 - 25}{x + 1} \\cdot \\frac{x^2 - 1}{x - 5}',
          detail: 'Change division to multiplication by flipping the second rational expression.',
        },
        {
          step: 2,
          label: 'Factor and Simplify',
          formula: '\\frac{(x - 5)(x + 5)}{x + 1} \\cdot \\frac{(x - 1)(x + 1)}{x - 5} = (x + 5)(x - 1)',
          detail: 'Cancel (x - 5) and (x + 1) to leave (x + 5)(x - 1) = x² + 4x - 5.',
        },
      ],
    },
  ];

  const currentExample = EXAMPLES[exampleIdx];

  const handlePracticeSubtopicFromTracker = (subtopicName: string) => {
    setPracticeSubskill(subtopicName);
    setPracticeAutoStart(true);
    setActiveTab('practice');
  };

  const handleTrySimilarFromMistake = (subskill: string, mistakeId?: number) => {
    const data = mistakeId ? MISTAKE_SIMILAR_PROBLEMS[mistakeId] : undefined;
    if (data) {
      setCurrentSimilarProblem(data);
      setIsSimilarProblemModalOpen(true);
    } else {
      const found = Object.values(MISTAKE_SIMILAR_PROBLEMS).find(
        (m) => m.subskill.toLowerCase() === subskill.toLowerCase()
      );
      if (found) {
        setCurrentSimilarProblem(found);
        setIsSimilarProblemModalOpen(true);
      } else {
        setPracticeSubskill(subskill);
        setPracticeAutoStart(true);
        setActiveTab('practice');
      }
    }
  };

  const handleToggleMistakeResolved = (id: number) => {
    setResolvedMistakeIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleMarkMistakeResolved = (id: number) => {
    setResolvedMistakeIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  const handleOpenPracticeDrillsFromModal = (subskill: string) => {
    setIsSimilarProblemModalOpen(false);
    setPracticeSubskill(subskill);
    setPracticeAutoStart(true);
    setActiveTab('practice');
  };

  const currentSectionData =
    STUDY_PATH_SECTIONS.find((s) => s.id === currentSectionId) || STUDY_PATH_SECTIONS[3];

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
      {/* Top Header / Breadcrumbs (OUTSIDE the scrollbar - pinned at top, remains accessible when scrolling) */}
      <TreeMenuHeader
        items={[
          { label: 'Mathematics', onClick: () => setCurrentScreen('mathematics') },
          { label: 'Algebra', onClick: () => setCurrentScreen('algebra') },
          { label: 'Expressions & Polynomials', onClick: () => setCurrentScreen('algebra') },
          { label: 'Rational Expressions', isActive: true },
        ]}
        backButton={{
          label: 'Back to Algebra',
          onClick: () => setCurrentScreen('algebra'),
        }}
      />

      {/* Main Container - scrollbar starts strictly below the navigation bar */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Topic Header Card matching image.png */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Avatar, Title, Badge, Description, Metrics Row */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
            <span className="text-blue-600 font-extrabold text-2xl tracking-tight">x²</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Rational Expressions
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wider">
                REVIEW PRIORITY
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              Operations with rational expressions, simplification, and rational equations.
            </p>

            <div className="mt-4">
              <MathTopicStatusStrip canonicalTopicId="top-alg-fractions" />
            </div>
          </div>
        </div>

        {/* Right Side: Review action + Formula Sheet + Ask Tutor */}
        <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto md:min-w-[240px]">
          <button
            type="button"
            id="btn-resume-review-header"
            onClick={() => {
              const topic = allTopics.find((item) => item.id === 'top-alg-fractions');
              if (topic) startReview(topic, 'Spaced Review');
              else setActiveTab('learn');
              setIsStepRevealed(false);
            }}
            className="w-full py-2.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Review</span>
          </button>

          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              id="btn-graph-visualizer-header"
              onClick={() => setIsGraphVisualizerModalOpen(true)}
              className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Interactive Rational Function Graph Visualizer"
            >
              <AppArtwork name="wave" inline className="w-3.5 h-3.5 text-blue-600" />
              <span>Graph Inspector</span>
            </button>

            <button
              type="button"
              id="btn-formula-sheet-header"
              onClick={() => setIsFormulaModalOpen(true)}
              className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-blue-600" />
              <span>Formula Sheet</span>
            </button>

            <button
              type="button"
              id="btn-ask-tutor-header"
              onClick={() =>
                openChat(
                  'Explain how to simplify complex Rational Expressions, identify common algebraic traps, and use the Casio fx-991 CALC substitution technique for the ECE board exam.',
                  'complex-derivation'
                )
              }
              className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <AppArtwork name="chat" inline className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask Tutor</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-20 text-xs space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotesModalOpen(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-amber-500" />
                    <span>View My Notes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsStudyPlanOpen(true);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                  >
                    📅 View Study Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      openVoiceConversation('Rational Expressions & Algebraic Traps');
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <AppArtwork name="antenna" inline className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Live Voice Drill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBookmarked(!isBookmarked);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <AppArtwork name="book" inline className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                    <span>{isBookmarked ? 'Remove Bookmark' : 'Bookmark Topic'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Standard Mathematics topic lifecycle navigation */}
      <MathTopicLifecycleTabs
        activeView={activeTab}
        onChange={setActiveTab}
        mistakeCount={Math.max(0, 2 - resolvedMistakeIds.length)}
      />

      {/* 4. MAIN WORKSPACE (Tabs Content) */}
      {activeTab === 'learn' && (
        <div className="space-y-6">
          <ReferenceStudyBlueprint content={ALGEBRA_REFERENCE_CONTENT['top-alg-fractions']} compact />
          {/* Main 2-Column Grid matching image.png: Left 8 cols, Right 4 cols */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 8 COLUMNS: Study Path Banner + Main Content Card */}
            <div className="lg:col-span-8 space-y-5">
              {/* Study Path Banner */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {/* Progress donut icon (teal/emerald) */}
                    <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
                      <svg className="w-7 h-7 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          className="stroke-slate-100"
                          strokeWidth="3.5"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          className="stroke-emerald-500"
                          strokeWidth="3.5"
                          strokeDasharray="88"
                          strokeDashoffset={Math.round(88 - (88 * currentSectionId) / 8)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[8px] font-black text-emerald-700">
                        {currentSectionId}/8
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="text-blue-600 font-bold">Study Path</span>
                      <strong className="text-slate-900 font-extrabold">{currentSectionId} / 8</strong>
                      <span className="text-slate-300 font-normal">|</span>
                      <span className="text-slate-700 font-medium">
                        Section {currentSectionId}: {currentSectionData.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-graph-visualizer-path"
                      onClick={() => {
                        if (currentSectionId !== 1) {
                          setCurrentSectionId(1);
                        } else {
                          setIsGraphVisualizerModalOpen(true);
                        }
                      }}
                      className="border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Inspect Rational Function Graph"
                    >
                      <AppArtwork name="wave" inline className="w-3.5 h-3.5 text-blue-600" />
                      <span>Graph Visualizer</span>
                    </button>

                    <button
                      type="button"
                      id="btn-view-path"
                      onClick={() => setIsPathModalOpen(true)}
                      className="border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <List className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Path</span>
                    </button>
                  </div>
                </div>

                {/* Horizontal Section Switcher Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs no-scrollbar">
                  {STUDY_PATH_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setCurrentSectionId(sec.id)}
                      className={`px-2.5 py-1.5 rounded-xl border whitespace-nowrap text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        currentSectionId === sec.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50/80 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          currentSectionId === sec.id
                            ? 'bg-white text-blue-600'
                            : sec.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {sec.id}
                      </span>
                      <span>{sec.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Section Content: Section 1 (Domain Restrictions & Graph Visualizer) vs Other Sections */}
              {currentSectionId === 1 ? (
                <DomainRestrictionsModule
                  manualStatusControls={<ManualLearnTracker compact key={lessonCardTrackingId(manualLearnIdentity.trackingId,'section-1')} trackingId={lessonCardTrackingId(manualLearnIdentity.trackingId,'section-1')} scopeLabel={`${currentSectionData.title} · ${manualLearnIdentity.trackingScopeLabel}`}/>}
                  onContinueNextSection={() => setCurrentSectionId(2)}
                  onOpenTutor={(prompt) => openChat(prompt, 'algebra-expert')}
                  onStartPracticeDrill={(subskill) => {
                    setPracticeSubskill(subskill);
                    setActiveTab('practice');
                  }}
                />
              ) : (
                /* Main Section Content Card: Section 4 Multiplication & Division */
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                {/* Section Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
                    <AppArtwork name="book" inline className="w-5 h-5 text-blue-600 shrink-0" />
                    <h2>{currentSectionData.title}</h2>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Factor whenever possible before simplifying. Multiply numerators and denominators; for division, multiply by the reciprocal.
                  </p>
                </div>

                <ManualLearnTracker compact key={lessonCardTrackingId(manualLearnIdentity.trackingId,`section-${currentSectionId}`)} trackingId={lessonCardTrackingId(manualLearnIdentity.trackingId,`section-${currentSectionId}`)} scopeLabel={`${currentSectionData.title} · ${manualLearnIdentity.trackingScopeLabel}`}/>
                {/* Guided Example Inner Box matching image.png */}
                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                      <AppArtwork name="bulb" inline className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span>Guided Example</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      {currentExample.title}
                    </span>
                  </div>

                  {/* Problem expression */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-700 font-medium">
                      Simplify the rational expression:
                    </p>
                    <div className="py-2.5 px-4 bg-white rounded-xl border border-slate-200/80 flex items-center justify-center text-sm sm:text-base font-serif">
                      <MathFormula formula={currentExample.expression} />
                    </div>
                  </div>

                  {/* Question prompt */}
                  <p className="text-xs font-semibold text-slate-900 pt-0.5">
                    {currentExample.prompt}
                  </p>

                  {/* 4 Options Grid */}
                  <div className="space-y-2">
                    {currentExample.options.map((opt) => {
                      const isSelected = selectedOption === opt.key;
                      const isCorrect = opt.isCorrect;

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            setSelectedOption(opt.key);
                            setIsChecked(true);
                          }}
                          className={`w-full p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isSelected && isCorrect
                              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium shadow-2xs'
                              : isSelected && !isCorrect
                              ? 'bg-rose-50/80 border-rose-300 text-rose-950 font-medium shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isSelected && isCorrect
                                  ? 'bg-emerald-500 text-white'
                                  : isSelected && !isCorrect
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span>{opt.text}</span>
                          </div>

                          {isSelected && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {isSelected && !isCorrect && (
                            <X className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Buttons: Check + Reveal Next Step */}
                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsChecked(true)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Check
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsStepRevealed(!isStepRevealed)}
                      className="px-4 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 border border-blue-200 text-blue-600 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>≫</span>
                      <span>{isStepRevealed ? 'Hide Step Details' : 'Reveal Next Step'}</span>
                    </button>
                  </div>

                  {/* Step Breakdown when revealed */}
                  {isStepRevealed && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3 text-xs animate-fadeIn">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-600" />
                        <span>Step-by-Step Derivation:</span>
                      </div>
                      {currentExample.steps.map((s) => (
                        <div key={s.step} className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">
                              Step {s.step}: {s.label}
                            </span>
                          </div>
                          <div className="py-1 text-slate-800 font-serif">
                            <MathFormula formula={s.formula} />
                          </div>
                          <p className="text-[11px] text-slate-500">{s.detail}</p>
                        </div>
                      ))}

                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setExampleIdx((prev) => (prev + 1) % EXAMPLES.length);
                            setSelectedOption('A');
                            setIsStepRevealed(false);
                          }}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Try Next Example</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Board Trap Alert Banner matching image.png */}
                <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <strong className="font-extrabold text-rose-950 mr-2">Board Trap</strong>
                    <span>Cancel common factors, never individual terms.</span>
                  </div>
                </div>

                {/* Quick Check Card matching image.png */}
                <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <AppArtwork name="target" inline className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <strong className="font-extrabold text-blue-950 mr-2">Quick Check</strong>
                      <span className="text-slate-500">2 questions • Test your understanding of this section.</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQuickCheckOpen(true)}
                    className="border border-blue-200 bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-600 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>Start Quick Check</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Section Navigation matching image.png */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentSectionId((prev) => Math.max(1, prev - 1))}
                    disabled={currentSectionId <= 1}
                    className={`border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                      currentSectionId <= 1 ? 'opacity-50 cursor-not-allowed text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous Section</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentSectionId((prev) => Math.min(8, prev + 1))}
                    disabled={currentSectionId >= 8}
                    className={`border border-blue-200 bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-600 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                      currentSectionId >= 8 ? 'opacity-50 cursor-not-allowed text-slate-400' : ''
                    }`}
                  >
                    <span>Continue: Addition & Subtraction</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              )}

              {/* BOTTOM METRICS ROW (4 Cards + Trend Chart) matching image.png */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 pt-1">
                {/* Card 1: Recent accuracy */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                      <svg className="w-6 h-6 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          className="stroke-slate-100"
                          strokeWidth="4"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          className="stroke-emerald-500"
                          strokeWidth="4"
                          strokeDasharray="88"
                          strokeDashoffset="16"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Recent accuracy</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-extrabold text-slate-900 tracking-tight">82%</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      ↑ +12% vs. last week
                    </div>
                  </div>
                </div>

                {/* Card 2: Questions answered */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 app-artwork-tile">
                      <AppArtwork name="exam" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Questions answered</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-extrabold text-slate-900 tracking-tight">126</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                      +24 this week
                    </div>
                  </div>
                </div>

                {/* Card 3: Average time */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 app-artwork-tile">
                      <AppArtwork name="timer" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Average time</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-extrabold text-slate-900 tracking-tight">74 sec</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      ↓ -18%
                    </div>
                  </div>
                </div>

                {/* Card 4: Open errors */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">Open errors</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-xl font-extrabold text-slate-900 tracking-tight">2</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      ↓ -3 vs. last week
                    </div>
                  </div>
                </div>

                {/* Card 5: Performance trend with SVG line chart */}
                <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] pb-1">
                    <span className="text-slate-800 font-bold">Performance trend</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('progress')}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[10px] flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>View Details</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Clean SVG Area Line Chart */}
                  <div className="w-full h-16 relative mt-1">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      <line x1="28" y1="10" x2="195" y2="10" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="28" y1="30" x2="195" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="28" y1="50" x2="195" y2="50" stroke="#f1f5f9" strokeWidth="1" />

                      {/* Y-axis Labels */}
                      <text x="5" y="12" fill="#94a3b8" fontSize="7" fontWeight="bold">100%</text>
                      <text x="5" y="32" fill="#94a3b8" fontSize="7" fontWeight="bold">50%</text>
                      <text x="12" y="52" fill="#94a3b8" fontSize="7" fontWeight="bold">0%</text>

                      {/* Area Fill */}
                      <polygon
                        points="35,42 75,36 115,32 155,24 195,20 195,50 35,50"
                        fill="url(#trendGradient)"
                      />

                      {/* Line */}
                      <polyline
                        points="35,42 75,36 115,32 155,24 195,20"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Dots */}
                      <circle cx="35" cy="42" r="2.5" fill="#2563eb" stroke="#fff" strokeWidth="1" />
                      <circle cx="75" cy="36" r="2.5" fill="#2563eb" stroke="#fff" strokeWidth="1" />
                      <circle cx="115" cy="32" r="2.5" fill="#2563eb" stroke="#fff" strokeWidth="1" />
                      <circle cx="155" cy="24" r="2.5" fill="#2563eb" stroke="#fff" strokeWidth="1" />
                      <circle cx="195" cy="20" r="2.5" fill="#2563eb" stroke="#fff" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* X-axis labels */}
                  <div className="flex justify-between text-[8px] text-slate-400 font-medium pt-1 px-1">
                    <span>Sep 3</span>
                    <span>Sep 5</span>
                    <span>Sep 7</span>
                    <span>Sep 9</span>
                    <span>Sep 10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT 4 COLUMNS: Quick Reference + My Notes + Ask Tutor */}
            <div className="lg:col-span-4 space-y-4">
              {/* 1. Quick Reference Card matching image.png */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <AppArtwork name="exam" inline className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Quick Reference</h3>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-700">Key Formulas</h4>

                  {/* Formulas list */}
                  <div className="space-y-2.5">
                    <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl text-center font-serif text-sm">
                      <MathFormula formula="\frac{A}{B} \times \frac{C}{D} = \frac{AC}{BD}" />
                    </div>

                    <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl text-center font-serif text-sm">
                      <MathFormula formula="\frac{A}{B} \div \frac{C}{D} = \frac{AD}{BC}" />
                    </div>

                    <div className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl text-center font-serif text-sm">
                      <MathFormula formula="\text{Denominator} \neq 0" />
                      <p className="text-[11px] text-slate-400 font-sans mt-1">
                        Values that make the denominator zero are not allowed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Open Full Formula Sheet button */}
                <button
                  type="button"
                  id="btn-open-formula-sheet-card"
                  onClick={() => setIsFormulaModalOpen(true)}
                  className="w-full border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-blue-600 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <AppArtwork name="exam" inline className="w-3.5 h-3.5 text-blue-600" />
                  <span>Open Full Formula Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              {/* 2. My Notes Card matching image.png */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center shrink-0 app-artwork-tile">
                    <AppArtwork name="exam" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">My Notes</h4>
                    <p className="text-[11px] text-slate-400">3 notes</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-open-notes-card"
                  onClick={() => setIsNotesModalOpen(true)}
                  className="border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                >
                  <span>Open Notes</span>
                  <span>→</span>
                </button>
              </div>

              {/* 3. Ask Tutor Card matching image.png */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0 app-artwork-tile">
                    <AppArtwork name="chat" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Ask Tutor</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Get instant help and hints on this topic.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-ask-tutor-card"
                  onClick={() =>
                    openChat(
                      'I am currently reviewing Section 4: Multiplication & Division of Rational Expressions. What are the most common traps and exam tips for simplification?',
                      'complex-derivation'
                    )
                  }
                  className="border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                >
                  <span>Ask Tutor</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Practice Tab */}
      {activeTab === 'practice' && (
        <PracticeTab
          initialSubskill={practiceSubskill}
          autoStart={practiceAutoStart}
          onOpenQuickRefModal={() => setIsFormulaModalOpen(true)}
        />
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <QuizTab
          onPracticeWeakAreas={() => {
            setActiveTab('practice');
          }}
        />
      )}

      {/* Mistakes Tab */}
      {activeTab === 'mistakes' && (
        <MistakesTab
          onTrySimilarProblem={handleTrySimilarFromMistake}
          resolvedIds={resolvedMistakeIds}
          onToggleResolved={handleToggleMistakeResolved}
        />
      )}

      {/* Progress Tab (Mastery Trends & Sparklines) */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <SubtopicMasteryTrackerCard
            title="Sub-Topic Mastery Trends & At-Risk Diagnostics"
            subtitle="Actual recent auto-graded quiz attempts only. Scores are provisional practice evidence, not certified mastery."
            items={rationalSubtopics}
            onPracticeSubtopic={handlePracticeSubtopicFromTracker}
          />
        </div>
      )}

      {/* Study Path Modal (Opened when clicking "View Path") */}
      {isPathModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AppArtwork name="triangle" inline className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Rational Expressions: Study Path
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPathModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Complete each sequential section to establish comprehensive board-exam mastery.
            </p>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {STUDY_PATH_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setCurrentSectionId(sec.id);
                    setIsPathModalOpen(false);
                    setActiveTab('learn');
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                    currentSectionId === sec.id
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                      : sec.status === 'completed'
                      ? 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        currentSectionId === sec.id
                          ? 'bg-blue-600 text-white'
                          : sec.status === 'completed'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {sec.status === 'completed' ? '✓' : sec.id}
                    </span>
                    <span>
                      Section {sec.id}: {sec.title}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentSectionId === sec.id
                        ? 'bg-blue-600 text-white'
                        : sec.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {currentSectionId === sec.id
                      ? 'CURRENT'
                      : sec.status === 'completed'
                      ? 'COMPLETED'
                      : 'UPCOMING'}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPathModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Check Modal (Opened when clicking "Start Quick Check") */}
      {isQuickCheckOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AppArtwork name="target" inline className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Quick Check: Multiplication & Division
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickCheckOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Question 1 of 2</span>
                <span className="text-slate-400 font-normal">Multiplication</span>
              </div>
              <p className="text-xs text-slate-700">
                Simplify the product:
              </p>
              <div className="py-2 px-3 bg-white rounded-lg border border-slate-200 text-center font-serif text-sm">
                <MathFormula formula="\frac{x + 4}{3x} \cdot \frac{6x^2}{x^2 - 16}" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'A', text: '\\frac{2x}{x - 4}', isCorrect: true },
                  { key: 'B', text: '\\frac{2}{x - 4}', isCorrect: false },
                  { key: 'C', text: '\\frac{2x}{x + 4}', isCorrect: false },
                  { key: 'D', text: '\\frac{x^2}{3(x - 4)}', isCorrect: false },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() =>
                      setQuickCheckAnswers((prev) => ({ ...prev, 1: opt.key }))
                    }
                    className={`p-2.5 rounded-xl border text-center font-serif transition-colors cursor-pointer ${
                      quickCheckAnswers[1] === opt.key
                        ? quickCheckSubmitted
                          ? opt.isCorrect
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                            : 'bg-rose-50 border-rose-400 text-rose-900 font-bold'
                          : 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-sans font-bold mr-1.5">{opt.key}:</span>
                    <MathFormula formula={opt.text} />
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Question 2 of 2</span>
                <span className="text-slate-400 font-normal">Division</span>
              </div>
              <p className="text-xs text-slate-700">
                Simplify the quotient:
              </p>
              <div className="py-2 px-3 bg-white rounded-lg border border-slate-200 text-center font-serif text-sm">
                <MathFormula formula="\frac{4}{x - 2} \div \frac{8}{x^2 - 4}" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'A', text: '\\frac{x + 2}{2}', isCorrect: true },
                  { key: 'B', text: '\\frac{x - 2}{2}', isCorrect: false },
                  { key: 'C', text: '\\frac{2}{x + 2}', isCorrect: false },
                  { key: 'D', text: '2(x + 2)', isCorrect: false },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() =>
                      setQuickCheckAnswers((prev) => ({ ...prev, 2: opt.key }))
                    }
                    className={`p-2.5 rounded-xl border text-center font-serif transition-colors cursor-pointer ${
                      quickCheckAnswers[2] === opt.key
                        ? quickCheckSubmitted
                          ? opt.isCorrect
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                            : 'bg-rose-50 border-rose-400 text-rose-900 font-bold'
                          : 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-sans font-bold mr-1.5">{opt.key}:</span>
                    <MathFormula formula={opt.text} />
                  </button>
                ))}
              </div>
            </div>

            {/* Submit / Results */}
            <div className="flex items-center justify-between pt-2">
              {quickCheckSubmitted ? (
                <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Score: {((quickCheckAnswers[1] === 'A' ? 1 : 0) + (quickCheckAnswers[2] === 'A' ? 1 : 0))} / 2 Correct!
                  </span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Select answers for both questions</span>
              )}

              <div className="flex items-center gap-2">
                {!quickCheckSubmitted ? (
                  <button
                    type="button"
                    onClick={() => setQuickCheckSubmitted(true)}
                    disabled={!quickCheckAnswers[1] || !quickCheckAnswers[2]}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Submit Answers
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickCheckOpen(false);
                      setQuickCheckSubmitted(false);
                      setQuickCheckAnswers({});
                    }}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formula Sheet Modal */}
      <AlgebraFormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
      />

      {/* My Notes Modal */}
      <MyNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        topicTitle="Rational Expressions"
      />

      {/* Floating Action Button: My Notes */}
      <button
        id="my-notes-fab"
        type="button"
        onClick={() => setIsNotesModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl shadow-slate-900/25 border border-slate-700/80 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group select-none"
        aria-label="Open My Notes for Rational Expressions"
      >
        <div className="relative flex items-center justify-center">
          <AppArtwork name="exam" inline className="w-4 h-4 text-amber-400 group-hover:rotate-6 transition-transform duration-200" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-900" />
        </div>
        <span className="text-xs font-bold tracking-wide">My Notes</span>
      </button>

      {/* Study Plan Modal */}
      <StudyPlanModal
        isOpen={isStudyPlanOpen}
        onClose={() => setIsStudyPlanOpen(false)}
        onStartSession={() => {
          setActiveTab('learn');
        }}
      />

      {/* Similar Problem Practice Modal */}
      <SimilarProblemModal
        isOpen={isSimilarProblemModalOpen}
        onClose={() => setIsSimilarProblemModalOpen(false)}
        problemData={currentSimilarProblem}
        onMarkMistakeResolved={handleMarkMistakeResolved}
        isMistakeResolved={
          currentSimilarProblem?.sourceType === 'mistake'
            ? resolvedMistakeIds.includes(Number(currentSimilarProblem.sourceId))
            : false
        }
        onOpenPracticeDrills={handleOpenPracticeDrillsFromModal}
      />

      {/* Standalone Interactive Rational Function Graph Visualizer Modal */}
      {isGraphVisualizerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  f(x)
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Rational Function Graph &amp; Singularity Inspector</h3>
                  <p className="text-xs text-slate-500">Interactive visual breakdown of domain constraints, removable holes, and vertical asymptotes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGraphVisualizerModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <RationalGraphVisualizer
              onOpenTutor={(prompt) => {
                setIsGraphVisualizerModalOpen(false);
                openChat(prompt, 'algebra-expert');
              }}
            />
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};
