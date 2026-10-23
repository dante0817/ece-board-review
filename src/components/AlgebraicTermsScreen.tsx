import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { TreeMenuHeader } from './TreeMenuHeader';
import { AnatomyTab } from './algebraic-terms/AnatomyTab';
import { SubstitutionTab } from './algebraic-terms/SubstitutionTab';
import { SimplificationTab } from './algebraic-terms/SimplificationTab';
import { VerbalTranslationTab } from './algebraic-terms/VerbalTranslationTab';
import { CasioCalcTab } from './algebraic-terms/CasioCalcTab';
import { IllegalMovesTab } from './algebraic-terms/IllegalMovesTab';
import { PracticeTab } from './algebraic-terms/PracticeTab';
import { EquivalenceScratchpadTab } from './algebraic-terms/EquivalenceScratchpadTab';
import { EceFormulasBridgeTab } from './algebraic-terms/EceFormulasBridgeTab';
import {
  SubtopicMasteryTrackerCard,
  SubtopicMasteryItem,
} from './common/SubtopicMasteryTrackerCard';
import { AlgebraTimedChallengeModal } from './algebra/AlgebraTimedChallengeModal';
import { AlgebraFormulaModal } from './AlgebraFormulaModal';
import { AlgebraFlashcardsModal } from './AlgebraFlashcardsModal';
import { FormulaQuickSheetModal } from './FormulaQuickSheetModal';
import { MathTopicLifecycleTabs, MathTopicLifecycleView } from './math/MathTopicLifecycleTabs';
import { MathTopicQuizView, MathTopicMistakesView, MathTopicProgressView } from './math/MathTopicUtilityViews';
import { MathTopicStatusStrip } from './math/MathTopicStatusStrip';
import { Sliders, ShieldAlert, Terminal } from 'lucide-react';

const LearnSectionButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button type="button" onClick={onClick} className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'}`}>
    {icon}<span>{label}</span>
  </button>
);

export const AlgebraicTermsScreen: React.FC = () => {
  const { setCurrentScreen, openChat, formulaMemorizationStats } = useReview();

  // Standard topic lifecycle plus topic-specific Learn sections.
  const [activeView, setActiveView] = useState<MathTopicLifecycleView>('learn');
  const [activeTab, setActiveTab] = useState<
    | 'anatomy'
    | 'substitution'
    | 'simplification'
    | 'verbal'
    | 'casio'
    | 'equivalence-scratchpad'
    | 'ece-formulas'
    | 'illegal-move'
  >('anatomy');

  // Modals state
  const [isTimedChallengeOpen, setIsTimedChallengeOpen] = useState<boolean>(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState<boolean>(false);
  const [isQuickSheetOpen, setIsQuickSheetOpen] = useState<boolean>(false);

  // Subtopic Mastery Tracking items
  const [subtopicsData] = useState<SubtopicMasteryItem[]>([
    {
      id: 'sub-term-anatomy',
      name: 'Monomial Anatomy & Multivariable Degree Sum Rule',
      category: 'Anatomy & Degree',
      historyScores: [70, 78, 84, 88, 92],
      currentMasteryPct: 92,
      attemptsCount: 26,
      status: 'mastered',
      riskReason: 'Resolved degree sum rule; multivariable term x³y²z has degree 3+2+1 = 6.',
    },
    {
      id: 'sub-like-terms',
      name: 'Literal Factors & Distributive Factoring of Like Terms',
      category: 'Like Terms',
      historyScores: [68, 75, 82, 86, 90],
      currentMasteryPct: 90,
      attemptsCount: 24,
      status: 'mastered',
      riskReason: 'Only combine terms with identical variable powers: x²y cannot merge with xy².',
    },
    {
      id: 'sub-substitution-unary',
      name: 'Multi-Variable Substitution & Unary Minus Precedence',
      category: 'Substitution',
      historyScores: [60, 66, 75, 82, 86],
      currentMasteryPct: 86,
      attemptsCount: 30,
      status: 'mastered',
      riskReason: 'Mastered -x² vs (-x)²; negative base must be parenthesized before squaring.',
    },
    {
      id: 'sub-bracket-removal',
      name: 'Nested Bracket Elimination: ( ) → { } → [ ] & Sign Flip',
      category: 'Simplification',
      historyScores: [65, 70, 78, 84, 88],
      currentMasteryPct: 88,
      attemptsCount: 22,
      status: 'mastered',
      riskReason: 'Careful with compound negative distribution -(a - b + c) = -a + b - c.',
    },
    {
      id: 'sub-verbal-reversals',
      name: 'Verbal Inversion Traps ("Subtracted from", "Less than")',
      category: 'Word Translation',
      historyScores: [58, 64, 72, 79, 84],
      currentMasteryPct: 84,
      attemptsCount: 28,
      status: 'mastered',
      riskReason: '"y subtracted from x" is x - y, NOT y - x. "Less than" also reverses operand order.',
    },
    {
      id: 'sub-casio-calc',
      name: 'Casio fx-991 [CALC] Subtractive Equivalence Technique',
      category: 'Calcu-Technique',
      historyScores: [75, 82, 88, 92, 96],
      currentMasteryPct: 96,
      attemptsCount: 32,
      status: 'mastered',
      riskReason: 'Test [Given] - (Choice) with random prime X=7 or 11. Output equals 0 for exact match.',
    },
  ]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
      {/* Top Header / Breadcrumbs - OUTSIDE the scrollbar */}
      <TreeMenuHeader
        items={[
          { label: 'Mathematics', onClick: () => setCurrentScreen('mathematics') },
          { label: 'Algebra', onClick: () => setCurrentScreen('algebra') },
          { label: 'Algebra Fundamentals', onClick: () => setCurrentScreen('algebra') },
          { label: 'Algebraic Expressions & Terms', isActive: true },
        ]}
        backButton={{
          label: 'Back to Algebra',
          onClick: () => setCurrentScreen('algebra'),
        }}
      />

      {/* Main Container - scrollbar starts strictly below the header */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs shrink-0 app-artwork-tile">
                <AppArtwork name="cards" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Algebraic Expressions &amp; Terms
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Mastered (89% Accuracy)
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    PRC ECE Board High Yield
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Algebra Fundamentals <span className="mx-1">•</span> Term Anatomy, Like Terms, Unary Precedence, Nested Enclosures &amp; Casio CALC Subtraction
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
              <button
                type="button"
                onClick={() => setIsTimedChallengeOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <AppArtwork name="timer" inline className="w-4 h-4 text-white" />
                <span>Timed Challenge (5q)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsQuickSheetOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Printable and mobile-friendly formula quick-sheet with memorization tracking"
              >
                <AppArtwork name="printer" inline className="w-4 h-4 text-blue-600" />
                <span>Quick-Sheet</span>
                <span className="px-1.5 py-0.2 bg-blue-200/90 text-blue-900 text-[10px] font-mono font-black rounded-full">
                  {formulaMemorizationStats.memorized}/{formulaMemorizationStats.total}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsFormulaModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AppArtwork name="exam" inline className="w-4 h-4 text-blue-600" />
                <span>Formula Explorer</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFlashcardsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AppArtwork name="book" inline className="w-4 h-4 text-indigo-600" />
                <span>Flashcards</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openChat(
                    'Explain algebraic expressions, multivariable degree calculation, unary minus rules (-x² vs (-x)²), nested bracket elimination, and the Casio fx-991 CALC subtractive equivalence method for the ECE Board Exam.',
                    'algebra'
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <AppArtwork name="star" inline className="w-4 h-4 text-amber-500" />
                <span>AI Tutor Explainer</span>
              </button>
            </div>
          </div>

          <MathTopicStatusStrip canonicalTopicId="top-algebraic-expressions" />

          <MathTopicLifecycleTabs activeView={activeView} onChange={setActiveView} />

          {activeView === 'learn' && (
            <div className="space-y-6">
              <SubtopicMasteryTrackerCard
                title="Algebraic Expressions & Terms Mastery Breakdown"
                subtitle="Granular retention, multivariable degree calculation, and sign distribution risk analysis"
                items={subtopicsData}
                onPracticeSubtopic={() => setActiveView('practice')}
              />

              <div className="border-b border-slate-200">
                <div className="flex items-center gap-2 overflow-x-auto pb-px" aria-label="Learn sections">
                  <LearnSectionButton active={activeTab === 'anatomy'} onClick={() => setActiveTab('anatomy')} icon={<AppArtwork name="cards" inline className="w-4 h-4" />} label="Anatomy" />
                  <LearnSectionButton active={activeTab === 'substitution'} onClick={() => setActiveTab('substitution')} icon={<Sliders className="w-4 h-4" />} label="Substitution" />
                  <LearnSectionButton active={activeTab === 'simplification'} onClick={() => setActiveTab('simplification')} icon={<AppArtwork name="cycle" inline className="w-4 h-4" />} label="Simplification" />
                  <LearnSectionButton active={activeTab === 'verbal'} onClick={() => setActiveTab('verbal')} icon={<AppArtwork name="book" inline className="w-4 h-4" />} label="Verbal Translation" />
                  <LearnSectionButton active={activeTab === 'casio'} onClick={() => setActiveTab('casio')} icon={<Terminal className="w-4 h-4 text-emerald-600" />} label="Casio CALC" />
                  <LearnSectionButton active={activeTab === 'equivalence-scratchpad'} onClick={() => setActiveTab('equivalence-scratchpad')} icon={<AppArtwork name="calculator" inline className="w-4 h-4 text-purple-600" />} label="Equivalence" />
                  <LearnSectionButton active={activeTab === 'ece-formulas'} onClick={() => setActiveTab('ece-formulas')} icon={<AppArtwork name="lightning" inline className="w-4 h-4 text-amber-500" />} label="ECE Formulas" />
                  <LearnSectionButton active={activeTab === 'illegal-move'} onClick={() => setActiveTab('illegal-move')} icon={<ShieldAlert className="w-4 h-4 text-rose-500" />} label="Illegal Moves" />
                </div>
              </div>

              <div className="pt-2">
                {activeTab === 'anatomy' && <AnatomyTab />}
                {activeTab === 'substitution' && <SubstitutionTab />}
                {activeTab === 'simplification' && <SimplificationTab />}
                {activeTab === 'verbal' && <VerbalTranslationTab />}
                {activeTab === 'casio' && <CasioCalcTab />}
                {activeTab === 'equivalence-scratchpad' && <EquivalenceScratchpadTab />}
                {activeTab === 'ece-formulas' && <EceFormulasBridgeTab />}
                {activeTab === 'illegal-move' && <IllegalMovesTab />}
              </div>
            </div>
          )}

          {activeView === 'practice' && <PracticeTab />}
          {activeView === 'quiz' && <MathTopicQuizView canonicalTopicId="top-algebraic-expressions" title="Algebraic Expressions & Terms" />}
          {activeView === 'mistakes' && <MathTopicMistakesView canonicalTopicId="top-algebraic-expressions" title="Algebraic Expressions & Terms" />}
          {activeView === 'progress' && <MathTopicProgressView canonicalTopicId="top-algebraic-expressions" title="Algebraic Expressions & Terms" />}
        </div>
      </div>

      {/* Modals */}
      {isTimedChallengeOpen && (
        <AlgebraTimedChallengeModal
          isOpen={isTimedChallengeOpen}
          onClose={() => setIsTimedChallengeOpen(false)}
        />
      )}

      {isFormulaModalOpen && (
        <AlgebraFormulaModal
          isOpen={isFormulaModalOpen}
          onClose={() => setIsFormulaModalOpen(false)}
        />
      )}

      {isQuickSheetOpen && (
        <FormulaQuickSheetModal
          isOpen={isQuickSheetOpen}
          onClose={() => setIsQuickSheetOpen(false)}
        />
      )}

      {isFlashcardsModalOpen && (
        <AlgebraFlashcardsModal
          isOpen={isFlashcardsModalOpen}
          onClose={() => setIsFlashcardsModalOpen(false)}
        />
      )}
    </div>
  );
};
