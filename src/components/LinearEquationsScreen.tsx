import { useAlgebraLearnTrackingIdentity } from '../hooks/useAlgebraLearnTrackingIdentity';
import { AppArtwork } from './common/AppArtwork';
import React, { useState, useMemo } from 'react';
import { useReview } from '../context/ReviewContext';
import { TreeMenuHeader } from './TreeMenuHeader';
import { MathTopicLifecycleTabs, MathTopicLifecycleView } from './math/MathTopicLifecycleTabs';
import { MathTopicQuizView, MathTopicProgressView } from './math/MathTopicUtilityViews';
import { MathTopicStatusStrip } from './math/MathTopicStatusStrip';
import { ReferenceStudyBlueprint } from './math/ReferenceStudyBlueprint';
import { ALGEBRA_REFERENCE_CONTENT } from '../data/algebraReferenceContent';
import { MathFormula } from './MathFormula';
import { LinearLearnTab } from './linear-equations/LinearLearnTab';
import { LinearPracticeTab } from './linear-equations/LinearPracticeTab';
import { LinearMistakesTab } from './linear-equations/LinearMistakesTab';
import { LinearSimilarProblemModal } from './linear-equations/LinearSimilarProblemModal';
import { FlashcardsModal } from './FlashcardsModal';
import {
  LINEAR_SIMILAR_PROBLEMS,
  SimilarLinearProblem,
} from './linear-equations/linearSimilarProblemsData';
import {
  SubtopicMasteryTrackerCard,
  SubtopicMasteryItem,
} from './common/SubtopicMasteryTrackerCard';


export const LinearEquationsScreen: React.FC = () => {
  const manualLearnIdentity=useAlgebraLearnTrackingIdentity('top-linear-eq','Linear Equations');

  const referenceContent = ALGEBRA_REFERENCE_CONTENT['top-linear-eq'];
  const { setCurrentScreen, openVoiceConversation, openChat, allTopics } = useReview();

  // Active tab: 'learn' | 'practice' | 'mistakes'
  const [activeTab, setActiveTab] = useState<MathTopicLifecycleView>('learn');

  // Flashcards state
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState(false);

  const linearTopics = useMemo(() => {
    return allTopics.filter(
      (t) =>
        t.name.toLowerCase().includes('linear') ||
        t.name.toLowerCase().includes('equation') ||
        t.id.includes('linear')
    );
  }, [allTopics]);

  const linearMaterial = useMemo(() => {
    return [
      `SUBJECT: Linear Equations & Systems (PRC ECE Board Exam)`,
      `Topic Focus:`,
      `• Single-variable linear equations and literal equations`,
      `• Systems of 2 and 3 linear equations: Substitution, Elimination, and Cramer's Rule with Determinants`,
      `• Board Exam Applications: Work rate problems, mixture problems, motion (d=rt) problems, and age problems`,
      `• Canon F-789SGA: manual-described EQN mode for simultaneous linear equations (physical keystroke check pending); see Calculator Skills for model-specific inputs and independent substitution checking. Original Casio examples elsewhere are not Canon key instructions.`,
      `• Critical Traps: Sign errors in distribution, common denominator arithmetic, and extraneous solutions in rational linear equations`,
    ].join('\n');
  }, []);

  // Similar problem modal state
  const [isSimilarModalOpen, setIsSimilarModalOpen] = useState(false);
  const [currentSimilarProblem, setCurrentSimilarProblem] = useState<SimilarLinearProblem | null>(null);

  // Subtopic Mastery Tracking state with historical sparklines
  const [subtopicsData] = useState<SubtopicMasteryItem[]>([
    {
      id: 'sub-single-var',
      name: 'Single Variable Equations',
      category: 'Foundation',
      historyScores: [82, 85, 90, 88, 94],
      currentMasteryPct: 94,
      attemptsCount: 24,
      status: 'mastered',
      riskReason: 'Clean distribution & LCD clearing. Excellent speed on Casio SOLVE.',
    },
    {
      id: 'sub-systems',
      name: '2x2 & 3x3 Simultaneous Systems',
      category: 'Cramer & Matrix',
      historyScores: [75, 78, 85, 88, 92],
      currentMasteryPct: 92,
      attemptsCount: 30,
      status: 'mastered',
      riskReason: 'High accuracy with MODE 5 EQN matrix inputs and Cramer determinant checks.',
    },
    {
      id: 'sub-motion',
      name: 'Motion & Relative Speed',
      category: 'Word Problems',
      historyScores: [70, 72, 68, 76, 78],
      currentMasteryPct: 78,
      attemptsCount: 19,
      status: 'recovering',
      riskReason: 'Minor delays setting up opposing vs. same-direction relative velocity (v1 ± v2).',
    },
    {
      id: 'sub-work-pipes',
      name: 'Work & Pipe Flow Rates',
      category: 'Word Problems',
      historyScores: [80, 82, 78, 85, 88],
      currentMasteryPct: 88,
      attemptsCount: 16,
      status: 'mastered',
      riskReason: 'Solid application of reciprocal rate summation (1/A + 1/B - 1/C = 1/T).',
    },
    {
      id: 'sub-mixture-age',
      name: 'Mixture & Concentration Balancing',
      category: 'Word Problems',
      historyScores: [62, 65, 58, 64, 66],
      currentMasteryPct: 66,
      attemptsCount: 18,
      status: 'at-risk',
      riskReason: 'Frequently misinterpreting evaporation vs. dilution pure water (0% concentration) term.',
    },
  ]);

  const handlePracticeSubtopicFromTracker = (subtopicName: string) => {
    setActiveTab('practice');
  };

  const handleOpenSimilar = (similarProblemId: string) => {
    const prob = LINEAR_SIMILAR_PROBLEMS[similarProblemId];
    if (prob) {
      setCurrentSimilarProblem(prob);
      setIsSimilarModalOpen(true);
    } else {
      // Fallback to first similar problem or practice tab
      const first = Object.values(LINEAR_SIMILAR_PROBLEMS)[0];
      setCurrentSimilarProblem(first);
      setIsSimilarModalOpen(true);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
      {/* Top Header / Breadcrumbs (OUTSIDE the scrollbar - pinned at top, remains accessible when scrolling) */}
      <TreeMenuHeader
        items={[
          { label: 'Mathematics', onClick: () => setCurrentScreen('mathematics') },
          { label: 'Algebra', onClick: () => setCurrentScreen('algebra') },
          { label: 'Equations & Inequalities', onClick: () => setCurrentScreen('algebra') },
          { label: 'Linear Equations & Systems', isActive: true },
        ]}
        backButton={{
          label: 'Back to Algebra',
          onClick: () => setCurrentScreen('algebra'),
        }}
      />

      {/* Main Container - scrollbar starts strictly below the navigation bar */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Page Header Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-xs shrink-0 app-artwork-tile">
              <AppArtwork name="calculator" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Linear Equations & Systems
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Mastered (92% Accuracy)
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  ECE Board Weight: 12%
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Equations & Inequalities <span className="mx-1">•</span> Simultaneous Equations, Cramer’s Rule & Word Problems
              </p>
            </div>
          </div>
        </div>

        {/* AI Tutor Actions */}
        <div className="flex items-center gap-2 self-start md:self-center flex-wrap">
          <button
            id="btn-generate-linear-flashcards"
            type="button"
            onClick={() => setIsFlashcardsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-stone-950 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Generate AI summary flashcards for Linear Equations & Systems"
          >
            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-stone-950 fill-stone-950/20" />
            <span>Generate Flashcards</span>
            <span className="px-1.5 py-0.2 rounded-sm bg-stone-900 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              AI
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              openChat(
                'Help me solve linear equations, Cramer’s Rule determinants, and Casio fx-991 MODE 5 EQN techniques for the ECE Board exam.',
                'algebra'
              )
            }
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-600" />
            <span>Ask AI Tutor</span>
          </button>

          <button
            type="button"
            onClick={() => openVoiceConversation('Linear Equations')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <AppArtwork name="antenna" inline className="w-3.5 h-3.5 text-blue-200" />
            <span>Voice Drill</span>
          </button>
        </div>
      </div>

      <MathTopicStatusStrip canonicalTopicId="top-linear-eq" />

      {/* 2.5 Subtopic Mastery Trend & At-Risk Diagnostic (Sparklines) */}
      <SubtopicMasteryTrackerCard
        title="Sub-Topic Mastery Trends & At-Risk Diagnostics"
        subtitle="Five-session sparkline trends for Linear Equations sub-topics. Focus your revision on 'At-Risk' modules before exam day."
        items={subtopicsData}
        onPracticeSubtopic={handlePracticeSubtopicFromTracker}
      />

      {/* 3. Standard Mathematics topic lifecycle */}
      <MathTopicLifecycleTabs activeView={activeTab} onChange={setActiveTab} />

      {/* 4. Tab Views */}
      {activeTab === 'learn' && (
        <div className="space-y-6">
          <ReferenceStudyBlueprint content={referenceContent} />
          <LinearLearnTab onTrySimilar={handleOpenSimilar} trackingId={manualLearnIdentity.trackingId} trackingScopeLabel={manualLearnIdentity.trackingScopeLabel} />
        </div>
      )}
      {activeTab === 'practice' && <LinearPracticeTab />}
      {activeTab === 'mistakes' && <LinearMistakesTab onTrySimilar={handleOpenSimilar} />}

      {activeTab === 'quiz' && (
        <MathTopicQuizView canonicalTopicId="top-linear-eq" title="Linear Equations & Systems" />
      )}
      {activeTab === 'progress' && (
        <MathTopicProgressView canonicalTopicId="top-linear-eq" title="Linear Equations & Systems" />
      )}

      {/* 5. Try Similar Problem Modal */}
      <LinearSimilarProblemModal
        isOpen={isSimilarModalOpen}
        onClose={() => setIsSimilarModalOpen(false)}
        problem={currentSimilarProblem}
      />

      {/* AI-Powered Flashcards Modal */}
      <FlashcardsModal
        isOpen={isFlashcardsModalOpen}
        onClose={() => setIsFlashcardsModalOpen(false)}
        selectedTopics={linearTopics}
        subjectName="Linear Equations & Systems"
        material={linearMaterial}
        title="Linear Equations Review Flashcards"
      />
        </div>
      </div>
    </div>
  );
};
