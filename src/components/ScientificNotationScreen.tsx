import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { TreeMenuHeader } from './TreeMenuHeader';
import { PowersOfTenScaleTab } from './scientific-notation/PowersOfTenScaleTab';
import { DualNotationConverterTab } from './scientific-notation/DualNotationConverterTab';
import { SiPrefixesComponentTab } from './scientific-notation/SiPrefixesComponentTab';
import { NotationArithmeticTab } from './scientific-notation/NotationArithmeticTab';
import { NotationTrapsTab } from './scientific-notation/NotationTrapsTab';
import { ScientificPracticeTab } from './scientific-notation/ScientificPracticeTab';
import {
  SubtopicMasteryTrackerCard,
  SubtopicMasteryItem,
} from './common/SubtopicMasteryTrackerCard';
import { AlgebraTimedChallengeModal } from './algebra/AlgebraTimedChallengeModal';
import { MathTopicLifecycleTabs, MathTopicLifecycleView } from './math/MathTopicLifecycleTabs';
import { MathTopicQuizView, MathTopicMistakesView, MathTopicProgressView } from './math/MathTopicUtilityViews';
import { MathTopicStatusStrip } from './math/MathTopicStatusStrip';
import { ShieldAlert } from 'lucide-react';

const LearnSectionButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button type="button" onClick={onClick} className={`px-3.5 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'}`}>
    {icon}<span>{label}</span>
  </button>
);

export const ScientificNotationScreen: React.FC = () => {
  const { setCurrentScreen, openChat } = useReview();

  const [activeView, setActiveView] = useState<MathTopicLifecycleView>('learn');
  const [activeTab, setActiveTab] = useState<
    'scale' | 'converter' | 'prefixes' | 'arithmetic' | 'traps'
  >('converter');

  const [isTimedChallengeOpen, setIsTimedChallengeOpen] = useState(false);

  // Subtopic mastery tracking
  const [subtopicsData] = useState<SubtopicMasteryItem[]>([
    {
      id: 'sub-powers-of-ten',
      name: 'Powers of Ten & Physical Order of Magnitude (10⁻¹⁹ to 10¹²)',
      category: 'Foundation Scale',
      historyScores: [70, 78, 85, 90, 94],
      currentMasteryPct: 94,
      attemptsCount: 20,
      status: 'mastered',
      riskReason: 'Grasped reciprocal meaning of negative exponents (10⁻³ = 1/1000).',
    },
    {
      id: 'sub-scientific-vs-eng',
      name: 'Scientific vs. Engineering Form (Multiple-of-3 Exponents)',
      category: 'Dual Conversion',
      historyScores: [62, 70, 80, 86, 92],
      currentMasteryPct: 92,
      attemptsCount: 25,
      status: 'mastered',
      riskReason: 'Engineering notation requires exponent ∈ {..., -6, -3, 0, 3, 6, 9, ...}.',
    },
    {
      id: 'sub-si-prefixes-eia',
      name: 'SI Metric Prefixes & 3-Digit Capacitor EIA Codes (AB × 10ᶜ pF)',
      category: 'Component Coding',
      historyScores: [60, 68, 76, 84, 90],
      currentMasteryPct: 90,
      attemptsCount: 28,
      status: 'mastered',
      riskReason: 'Decodes 104 as 100 nF (0.1 μF) and 223 as 22 nF.',
    },
    {
      id: 'sub-notation-arithmetic',
      name: 'Exponent Equalization in Addition & Subtraction',
      category: 'Computational Rigor',
      historyScores: [50, 60, 72, 82, 86],
      currentMasteryPct: 86,
      attemptsCount: 30,
      status: 'proficient',
      riskReason: 'Never add mantissas directly when exponents differ (e.g. 3.5×10⁴ + 4.2×10³).',
    },
    {
      id: 'sub-casio-keystrokes',
      name: 'Casio fx-991 [ENG] & [×10ˣ] Keystroke Syntax Accuracy',
      category: 'Calculator Technique',
      historyScores: [75, 82, 88, 92, 96],
      currentMasteryPct: 96,
      attemptsCount: 18,
      status: 'mastered',
      riskReason: 'Avoided double-10 error on the exponent key.',
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
          { label: 'Scientific & Engineering Notation', isActive: true },
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
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-xs shrink-0 font-black text-xl app-artwork-tile">
                <AppArtwork name="power-ten" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Scientific & Engineering Notation
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Comprehensive & Intuitive
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    ECE Board Core Module
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Algebra Fundamentals <span className="mx-1">•</span> Powers of Ten, SI Prefixes, EIA Capacitor Codes, and Casio fx-991 [ENG] Mechanics
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-start md:self-center">
              <button
                type="button"
                onClick={() => setIsTimedChallengeOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <AppArtwork name="timer" inline className="w-4 h-4 text-white" />
                <span>Timed Challenge (5q)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openChat(
                    'Explain the difference between scientific and engineering notation, SI metric prefixes, and how to read 3-digit capacitor codes on the ECE Board Exam.',
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

          <MathTopicStatusStrip canonicalTopicId="top-scientific-notation" />

          <MathTopicLifecycleTabs activeView={activeView} onChange={setActiveView} />

          {activeView === 'learn' && (
            <div className="space-y-6">
              <SubtopicMasteryTrackerCard
                title="Scientific & Engineering Notation Mastery Matrix"
                subtitle="Granular retention, exponent rules, and Casio calculator technique analysis"
                items={subtopicsData}
                onPracticeSubtopic={() => setActiveView('practice')}
              />
              <div className="border-b border-slate-200">
                <div className="flex items-center gap-2 overflow-x-auto pb-px" aria-label="Learn sections">
                  <LearnSectionButton active={activeTab === 'scale'} onClick={() => setActiveTab('scale')} icon={<AppArtwork name="power-ten" inline className="w-4 h-4 text-indigo-500" />} label="Powers of Ten" />
                  <LearnSectionButton active={activeTab === 'converter'} onClick={() => setActiveTab('converter')} icon={<AppArtwork name="cards" inline className="w-4 h-4 text-blue-500" />} label="Converter & ENG" />
                  <LearnSectionButton active={activeTab === 'prefixes'} onClick={() => setActiveTab('prefixes')} icon={<AppArtwork name="chip" inline className="w-4 h-4 text-purple-500" />} label="SI Prefixes" />
                  <LearnSectionButton active={activeTab === 'arithmetic'} onClick={() => setActiveTab('arithmetic')} icon={<AppArtwork name="calculator" inline className="w-4 h-4 text-emerald-500" />} label="Arithmetic" />
                  <LearnSectionButton active={activeTab === 'traps'} onClick={() => setActiveTab('traps')} icon={<ShieldAlert className="w-4 h-4 text-rose-500" />} label="Common Traps" />
                </div>
              </div>
              <div>
                {activeTab === 'scale' && <PowersOfTenScaleTab />}
                {activeTab === 'converter' && <DualNotationConverterTab />}
                {activeTab === 'prefixes' && <SiPrefixesComponentTab />}
                {activeTab === 'arithmetic' && <NotationArithmeticTab />}
                {activeTab === 'traps' && <NotationTrapsTab />}
              </div>
            </div>
          )}

          {activeView === 'practice' && <ScientificPracticeTab />}
          {activeView === 'quiz' && <MathTopicQuizView canonicalTopicId="top-scientific-notation" title="Scientific & Engineering Notation" />}
          {activeView === 'mistakes' && <MathTopicMistakesView canonicalTopicId="top-scientific-notation" title="Scientific & Engineering Notation" />}
          {activeView === 'progress' && <MathTopicProgressView canonicalTopicId="top-scientific-notation" title="Scientific & Engineering Notation" />}
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
