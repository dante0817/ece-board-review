import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { TreeMenuHeader } from './TreeMenuHeader';
import { RatiosVisualizerTab } from './ratios-proportions/RatiosVisualizerTab';
import { ProportionsVariationTab } from './ratios-proportions/ProportionsVariationTab';
import { PercentagesChangeTab } from './ratios-proportions/PercentagesChangeTab';
import { EceApplicationsTab } from './ratios-proportions/EceApplicationsTab';
import { RatioTrapsTab } from './ratios-proportions/RatioTrapsTab';
import { RatioPracticeTab } from './ratios-proportions/RatioPracticeTab';
import {
  SubtopicMasteryTrackerCard,
  SubtopicMasteryItem,
} from './common/SubtopicMasteryTrackerCard';
import { AlgebraTimedChallengeModal } from './algebra/AlgebraTimedChallengeModal';
import { MathTopicLifecycleTabs, MathTopicLifecycleView } from './math/MathTopicLifecycleTabs';
import { MathTopicQuizView, MathTopicMistakesView, MathTopicProgressView } from './math/MathTopicUtilityViews';
import { MathTopicStatusStrip } from './math/MathTopicStatusStrip';
import { Sliders, GitCompare, ShieldAlert } from 'lucide-react';

const LearnSectionButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button type="button" onClick={onClick} className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'}`}>
    {icon}<span>{label}</span>
  </button>
);

export const RatiosProportionsScreen: React.FC = () => {
  const { setCurrentScreen, openChat } = useReview();

  const [activeView, setActiveView] = useState<MathTopicLifecycleView>('learn');
  const [activeTab, setActiveTab] = useState<
    'visual-ratio' | 'proportions' | 'percentages' | 'ece-apps' | 'traps'
  >('visual-ratio');

  const [isTimedChallengeOpen, setIsTimedChallengeOpen] = useState(false);

  // Subtopic mastery tracking
  const [subtopicsData] = useState<SubtopicMasteryItem[]>([
    {
      id: 'sub-ratio-units',
      name: 'Unit Normalization & Part-to-Whole Conversion',
      category: 'Ratios',
      historyScores: [65, 72, 80, 88, 92],
      currentMasteryPct: 92,
      attemptsCount: 24,
      status: 'mastered',
      riskReason: 'Resolved unit trap: ensure 300 mA : 1.5 A is converted to common units (1 : 5).',
    },
    {
      id: 'sub-means-extremes',
      name: 'Means-Extremes Property & Algebraic Cross-Multiplication',
      category: 'Proportions',
      historyScores: [70, 75, 84, 86, 94],
      currentMasteryPct: 94,
      attemptsCount: 22,
      status: 'mastered',
      riskReason: 'Proficient with cross products: a·d = b·c for linear equations.',
    },
    {
      id: 'sub-variations',
      name: 'Direct, Inverse & Conductor Wire Scaling Laws (R = ρL/A)',
      category: 'Variations',
      historyScores: [58, 64, 75, 82, 88],
      currentMasteryPct: 88,
      attemptsCount: 29,
      status: 'proficient',
      riskReason: 'Remember area scales with diameter squared: doubling length and halving diameter gives 8× R.',
    },
    {
      id: 'sub-percent-asymmetry',
      name: 'Percentage Asymmetry & Loss Recovery Mathematics',
      category: 'Percentages',
      historyScores: [55, 62, 70, 78, 86],
      currentMasteryPct: 86,
      attemptsCount: 32,
      status: 'recovering',
      riskReason: 'Mastered: a 25% drop requires a +33.33% gain to break even, not +25%.',
    },
    {
      id: 'sub-ece-dividers',
      name: 'Voltage Dividers, Current Dividers & Decibel Ratios',
      category: 'ECE Applications',
      historyScores: [68, 76, 82, 85, 90],
      currentMasteryPct: 90,
      attemptsCount: 26,
      status: 'mastered',
      riskReason: 'Current divider uses opposite branch resistance in the numerator: I₁ = I_T · (R₂ / (R₁ + R₂)).',
    },
  ]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#f4f7fb]">
      {/* Top Header / Breadcrumbs */}
      <TreeMenuHeader
        items={[
          { label: 'Mathematics', onClick: () => setCurrentScreen('mathematics') },
          { label: 'Algebra', onClick: () => setCurrentScreen('algebra') },
          { label: 'Algebra Fundamentals', onClick: () => setCurrentScreen('algebra') },
          { label: 'Ratios, Proportions & Percent', isActive: true },
        ]}
        backButton={{
          label: 'Back to Algebra',
          onClick: () => setCurrentScreen('algebra'),
        }}
      />

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs shrink-0 font-black text-xl app-artwork-tile">
                <AppArtwork name="percent" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Ratios, Proportions & Percent
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Comprehensive & Intuitive
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    ECE Board Core Module
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Algebra Fundamentals <span className="mx-1">•</span> Unit Normalization, Means-Extremes, Asymmetry Trap, and Circuit Dividers
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-start md:self-center">
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
                onClick={() =>
                  openChat(
                    'Explain ratio unit normalization, direct vs inverse variation in circuits, and percentage asymmetry traps for the ECE Board Exam.',
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

          <MathTopicStatusStrip canonicalTopicId="top-ratios-proportions" />

          <MathTopicLifecycleTabs activeView={activeView} onChange={setActiveView} />

          {activeView === 'learn' && (
            <div className="space-y-6">
              <SubtopicMasteryTrackerCard
                title="Ratios, Proportions & Percent Mastery Matrix"
                subtitle="Granular retention, unit consistency checks, and asymmetry risk analysis"
                items={subtopicsData}
                onPracticeSubtopic={() => setActiveView('practice')}
              />
              <div className="border-b border-slate-200">
                <div className="flex items-center gap-2 overflow-x-auto pb-px" aria-label="Learn sections">
                  <LearnSectionButton active={activeTab === 'visual-ratio'} onClick={() => setActiveTab('visual-ratio')} icon={<Sliders className="w-4 h-4 text-blue-500" />} label="Ratios" />
                  <LearnSectionButton active={activeTab === 'proportions'} onClick={() => setActiveTab('proportions')} icon={<GitCompare className="w-4 h-4 text-indigo-500" />} label="Proportions" />
                  <LearnSectionButton active={activeTab === 'percentages'} onClick={() => setActiveTab('percentages')} icon={<AppArtwork name="graph" inline className="w-4 h-4 text-emerald-500" />} label="Percentages" />
                  <LearnSectionButton active={activeTab === 'ece-apps'} onClick={() => setActiveTab('ece-apps')} icon={<AppArtwork name="chip" inline className="w-4 h-4 text-amber-500" />} label="ECE Applications" />
                  <LearnSectionButton active={activeTab === 'traps'} onClick={() => setActiveTab('traps')} icon={<ShieldAlert className="w-4 h-4 text-rose-500" />} label="Common Traps" />
                </div>
              </div>
              <div>
                {activeTab === 'visual-ratio' && <RatiosVisualizerTab />}
                {activeTab === 'proportions' && <ProportionsVariationTab />}
                {activeTab === 'percentages' && <PercentagesChangeTab />}
                {activeTab === 'ece-apps' && <EceApplicationsTab />}
                {activeTab === 'traps' && <RatioTrapsTab />}
              </div>
            </div>
          )}

          {activeView === 'practice' && <RatioPracticeTab />}
          {activeView === 'quiz' && <MathTopicQuizView canonicalTopicId="top-ratios-proportions" title="Ratios, Proportions & Percent" />}
          {activeView === 'mistakes' && <MathTopicMistakesView canonicalTopicId="top-ratios-proportions" title="Ratios, Proportions & Percent" />}
          {activeView === 'progress' && <MathTopicProgressView canonicalTopicId="top-ratios-proportions" title="Ratios, Proportions & Percent" />}
        </div>
      </div>

      {/* Timed Challenge Modal */}
      {isTimedChallengeOpen && (
        <AlgebraTimedChallengeModal
          isOpen={isTimedChallengeOpen}
          onClose={() => setIsTimedChallengeOpen(false)}
        />
      )}
    </div>
  );
};
