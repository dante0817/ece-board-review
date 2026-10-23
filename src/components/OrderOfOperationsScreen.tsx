import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { TreeMenuHeader } from './TreeMenuHeader';
import { MathFormula } from './MathFormula';
import { SyntaxTreeTab } from './order-of-operations/SyntaxTreeTab';
import { IllegalMoveTab } from './order-of-operations/IllegalMoveTab';
import { FieldAxiomsTab } from './order-of-operations/FieldAxiomsTab';
import { CasioSyntaxTab } from './order-of-operations/CasioSyntaxTab';
import { OrderOfOperationsPracticeTab } from './order-of-operations/OrderOfOperationsPracticeTab';
import {
  SubtopicMasteryTrackerCard,
  SubtopicMasteryItem,
} from './common/SubtopicMasteryTrackerCard';
import { GitBranch, ShieldAlert } from 'lucide-react';
import { AlgebraTimedChallengeModal } from './algebra/AlgebraTimedChallengeModal';
import { MathTopicLifecycleTabs, MathTopicLifecycleView } from './math/MathTopicLifecycleTabs';
import { MathTopicQuizView, MathTopicMistakesView, MathTopicProgressView } from './math/MathTopicUtilityViews';
import { MathTopicStatusStrip } from './math/MathTopicStatusStrip';


const LearnSectionButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
      active
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const OrderOfOperationsScreen: React.FC = () => {
  const { setCurrentScreen, openChat } = useReview();

  // Standard topic lifecycle plus topic-specific Learn sections.
  const [activeView, setActiveView] = useState<MathTopicLifecycleView>('learn');
  const [activeTab, setActiveTab] = useState<
    'syntax-tree' | 'illegal-move' | 'field-axioms' | 'casio-syntax'
  >('syntax-tree');

  // Timed challenge modal
  const [isTimedChallengeOpen, setIsTimedChallengeOpen] = useState(false);

  // Subtopic Mastery Tracking items
  const [subtopicsData] = useState<SubtopicMasteryItem[]>([
    {
      id: 'sub-unary-minus',
      name: 'Unary Negation vs Exponentiation (-3² vs (-3)²)',
      category: 'Precedence Trap',
      historyScores: [65, 72, 80, 85, 92],
      currentMasteryPct: 92,
      attemptsCount: 28,
      status: 'mastered',
      riskReason: 'Resolved unary precedence trap; consistently parsing -a² as -(a²).',
    },
    {
      id: 'sub-implicit-mult',
      name: 'Implicit Multiplication & Juxtaposition (6 ÷ 2(3))',
      category: 'Order of Operations',
      historyScores: [70, 75, 82, 88, 90],
      currentMasteryPct: 90,
      attemptsCount: 22,
      status: 'mastered',
      riskReason: 'Strict adherence to Left-to-Right rule for × and ÷.',
    },
    {
      id: 'sub-vinculum-grouping',
      name: 'Fraction Bar Vinculum & Absolute Value Enclosures',
      category: 'Grouping Symbols',
      historyScores: [75, 78, 85, 86, 94],
      currentMasteryPct: 94,
      attemptsCount: 20,
      status: 'mastered',
      riskReason: 'Clean separation of numerator and denominator before division.',
    },
    {
      id: 'sub-field-axioms',
      name: '11 Real Number Field Properties & Non-Commutativity',
      category: 'Axiomatic Algebra',
      historyScores: [60, 68, 72, 79, 84],
      currentMasteryPct: 84,
      attemptsCount: 26,
      status: 'mastered',
      riskReason: 'Strong on distributive laws; remember matrix multiplication fails commutativity.',
    },
    {
      id: 'sub-casio-syntax',
      name: 'Casio fx-991ES (GENERAL STUDY ONLY; prohibited October 2026 PRC ECE) PLUS / CW Keystroke Integrity',
      category: 'Calcu-Technique',
      historyScores: [58, 64, 70, 78, 86],
      currentMasteryPct: 86,
      attemptsCount: 31,
      status: 'recovering',
      riskReason: 'Ensure parentheses enclose resonant frequency multi-term denominators 2π√(LC).',
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
          { label: 'Order of Operations & Algebraic Properties', isActive: true },
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
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs shrink-0 app-artwork-tile">
                <AppArtwork name="calculator" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Order of Operations & Algebraic Properties
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Mastered (91% Accuracy)
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    ECE Board Core Trap: 14% Slip Rate
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Algebra Fundamentals <span className="mx-1">•</span> Modern PEMDAS, 11 Field Axioms, and Casio Keystroke Syntax
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 self-start md:self-center">
              <button
                type="button"
                onClick={() => setIsTimedChallengeOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <AppArtwork name="timer" inline className="w-4 h-4 text-white" />
                <span>Timed Challenge (5q)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openChat(
                    'Explain modern PEMDAS precedence, 11 field axioms, and Casio fx-991 calculator input traps for the ECE Board Exam.',
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

          <MathTopicStatusStrip canonicalTopicId="top-order-operations" />

          <MathTopicLifecycleTabs activeView={activeView} onChange={setActiveView} />

          {activeView === 'learn' && (
            <div className="space-y-6">
              <SubtopicMasteryTrackerCard
                title="Order of Operations & Algebraic Axioms"
                subtitle="Granular mastery retention, precedence accuracy, and keystroke risk analysis"
                items={subtopicsData}
                onPracticeSubtopic={() => setActiveView('practice')}
              />

              <div className="border-b border-slate-200">
                <div className="flex items-center gap-2 overflow-x-auto pb-px" aria-label="Learn sections">
                  <LearnSectionButton active={activeTab === 'syntax-tree'} onClick={() => setActiveTab('syntax-tree')} icon={<GitBranch className="w-4 h-4" />} label="Syntax Tree" />
                  <LearnSectionButton active={activeTab === 'illegal-move'} onClick={() => setActiveTab('illegal-move')} icon={<ShieldAlert className="w-4 h-4 text-amber-500" />} label="Illegal Moves" />
                  <LearnSectionButton active={activeTab === 'field-axioms'} onClick={() => setActiveTab('field-axioms')} icon={<AppArtwork name="cards" inline className="w-4 h-4 text-indigo-500" />} label="Field Axioms" />
                  <LearnSectionButton active={activeTab === 'casio-syntax'} onClick={() => setActiveTab('casio-syntax')} icon={<AppArtwork name="chip" inline className="w-4 h-4 text-emerald-500" />} label="Casio Syntax" />
                </div>
              </div>

              <div className="pt-2">
                {activeTab === 'syntax-tree' && <SyntaxTreeTab />}
                {activeTab === 'illegal-move' && <IllegalMoveTab />}
                {activeTab === 'field-axioms' && <FieldAxiomsTab />}
                {activeTab === 'casio-syntax' && <CasioSyntaxTab />}
              </div>
            </div>
          )}

          {activeView === 'practice' && <OrderOfOperationsPracticeTab />}
          {activeView === 'quiz' && (
            <MathTopicQuizView canonicalTopicId="top-order-operations" title="Order of Operations & Algebraic Properties" />
          )}
          {activeView === 'mistakes' && (
            <MathTopicMistakesView canonicalTopicId="top-order-operations" title="Order of Operations & Algebraic Properties" />
          )}
          {activeView === 'progress' && (
            <MathTopicProgressView canonicalTopicId="top-order-operations" title="Order of Operations & Algebraic Properties" />
          )}
        </div>
      </div>

      {isTimedChallengeOpen && (
        <AlgebraTimedChallengeModal
          isOpen={isTimedChallengeOpen}
          onClose={() => setIsTimedChallengeOpen(false)}
          initialSetId="set-1-core"
        />
      )}
    </div>
  );
};
