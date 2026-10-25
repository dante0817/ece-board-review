import { DATA_MODE_KEY } from './utils/learnerMigration';
import { BOARD_CALCULATOR_POLICY } from './data/boardCalculatorPolicy';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ReviewProvider, useReview } from './context/ReviewContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MathematicsScreen } from './components/MathematicsScreen';
import { AlgebraScreen } from './components/AlgebraScreen';
import { TrigonometryScreen } from './features/trigonometry/TrigonometryScreen';
import { SolidMensurationScreen } from './features/solid-mensuration/SolidMensurationScreen';
import { GeometryScreen } from './features/geometry/GeometryScreen';
import { PlaneGeometryScreen } from './features/plane-geometry/PlaneGeometryScreen';
import { AnalyticGeometryScreen } from './features/analytic-geometry/AnalyticGeometryScreen';
import { ProbabilityStatisticsScreen } from './features/probability-statistics/ProbabilityStatisticsScreen';
import { DifferentialEquationsScreen } from './features/differential-equations/DifferentialEquationsScreen';
import { CalculusScreen } from './features/calculus/CalculusScreen';
import { RealNumbersScreen } from './components/RealNumbersScreen';
import { RationalExpressionsScreen } from './components/RationalExpressionsScreen';
import { LinearEquationsScreen } from './components/LinearEquationsScreen';
import { QuadraticEquationsScreen } from './components/QuadraticEquationsScreen';
import { FunctionsScreen } from './components/FunctionsScreen';
import { AbsoluteValueScreen, ArithmeticProgressionsScreen, BinomialTheoremScreen, ComplexNumbersScreen, ExponentialLogarithmicScreen, ExponentsRadicalsScreen, FactoringScreen, GeometricProgressionsScreen, HarmonicProgressionsScreen, InequalitiesScreen, InverseFunctionsScreen, MatricesScreen, PartialFractionsScreen, PolynomialFunctionsScreen, PolynomialsScreen, RationalFunctionsScreen, RationalRadicalEquationsScreen, SystemsEquationsScreen, WordProblemsScreen } from './components/ReferenceAlgebraTopicScreens';
import { OrderOfOperationsScreen } from './components/OrderOfOperationsScreen';
import { AlgebraicTermsScreen } from './components/AlgebraicTermsScreen';
import { RatiosProportionsScreen } from './components/RatiosProportionsScreen';
import { ScientificNotationScreen } from './components/ScientificNotationScreen';
import { TodayScreen } from './components/TodayScreen';
import { OverviewDashboard } from './components/OverviewDashboard';
import { SubjectsScreen } from './components/SubjectsScreen';
import { TestsScreen } from './components/TestsScreen';
import { CalculatorSkillsScreen } from './components/CalculatorSkillsScreen';
import { ErrorLogScreen } from './components/ErrorLogScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { BoardSubjectScreen } from './components/BoardSubjectScreen';
import { PracticeScreen } from './components/PracticeScreen';
import { ReviewQueueScreen } from './components/ReviewQueueScreen';
import { BoardReadinessScreen } from './components/BoardReadinessScreen';
import { TopicDrawer } from './components/TopicDrawer';
import { ActiveSessionView } from './components/ActiveSessionView';
import { ReviewModal } from './components/ReviewModal';
import { ReviewCompletionModal } from './components/ReviewCompletionModal';
import { SettingsModal } from './components/SettingsModal';
import { VoiceConversationModal } from './components/VoiceConversationModal';
import { ChatbotScreen } from './components/chat/ChatbotScreen';
import { ChatDrawerModal } from './components/chat/ChatDrawerModal';
import { PomodoroFocusTimer } from './components/PomodoroFocusTimer';
import { WeakSpotQuizModal } from './components/WeakSpotQuizModal';
import { AddErrorModal } from './components/AddErrorModal';
import { VoiceCommandHUD } from './components/voice/VoiceCommandHUD';
import { VoiceCommandGuideModal } from './components/voice/VoiceCommandGuideModal';
import { VoiceCommandProvider } from './context/VoiceCommandContext';
import { FormulaQuickSheetModal } from './components/FormulaQuickSheetModal';
import { FormulaFlashcardMode } from './components/formula/FormulaFlashcardMode';
import { DeepFocusModal } from './components/focus/DeepFocusModal';
import { BlockedNavigationAlert } from './components/focus/BlockedNavigationAlert';
import { CalculatorProvider, useCalculator } from './components/calculator/CalculatorProvider';
import { CalculatorPanel } from './components/calculator/CalculatorPanel';

const MainContent: React.FC = () => {
  const { currentScreen } = useReview();

  // Screens across all hierarchy levels (higher, mid, lower) that feature a dedicated fixed tree menu header outside the scrollbar
  const isDedicatedScrollScreen = [
    'mathematics',
    'algebra',
    'trigonometry',
    'geometry',
    'plane-geometry',
    'analytic-geometry',
    'probability-statistics',
    'differential-equations',
    'differential-calculus',
    'integral-calculus',
    'solid-mensuration',
    'real-numbers',
    'rational-expressions',
    'linear-equations',
    'quadratic-equations',
    'functions',
    'factoring',
    'polynomials',
    'exponents-radicals',
    'inequalities',
    'absolute-value',
    'rational-radical-equations',
    'exponential-logarithmic',
    'systems-equations',
    'complex-numbers',
    'arithmetic-progressions',
    'geometric-progressions',
    'binomial-theorem',
    'matrices',
    'partial-fractions',
    'word-problems',
    'inverse-functions',
    'polynomial-functions',
    'rational-functions',
    'harmonic-progressions',
    'order-of-operations',
    'algebraic-terms',
    'ratios-proportions',
    'scientific-notation',
    'geas',
    'electronics',
    'est',
  ].includes(currentScreen);

  return (
    <main
      className={`flex-1 bg-[#f4f7fb] ${
        isDedicatedScrollScreen ? 'min-h-0 flex flex-col overflow-hidden' : 'overflow-y-auto'
      }`}
    >
      {currentScreen === 'chat' && <ChatbotScreen />}
      {currentScreen === 'mathematics' && <MathematicsScreen />}
      {currentScreen === 'algebra' && <AlgebraScreen />}
      {currentScreen === 'trigonometry' && <TrigonometryScreen />}
      {currentScreen === 'geometry' && <GeometryScreen />}
      {currentScreen === 'plane-geometry' && <PlaneGeometryScreen />}
      {currentScreen === 'analytic-geometry' && <AnalyticGeometryScreen />}
      {currentScreen === 'probability-statistics' && <ProbabilityStatisticsScreen />}
      {currentScreen === 'differential-equations' && <DifferentialEquationsScreen />}
      {currentScreen === 'differential-calculus' && <CalculusScreen subject="differential" />}
      {currentScreen === 'integral-calculus' && <CalculusScreen subject="integral" />}
      {currentScreen === 'solid-mensuration' && <SolidMensurationScreen />}
      {currentScreen === 'real-numbers' && <RealNumbersScreen />}
      {currentScreen === 'rational-expressions' && <RationalExpressionsScreen />}
      {currentScreen === 'linear-equations' && <LinearEquationsScreen />}
      {currentScreen === 'quadratic-equations' && <QuadraticEquationsScreen />}
      {currentScreen === 'functions' && <FunctionsScreen />}
      {currentScreen === 'factoring' && <FactoringScreen />}
      {currentScreen === 'polynomials' && <PolynomialsScreen />}
      {currentScreen === 'exponents-radicals' && <ExponentsRadicalsScreen />}
      {currentScreen === 'inequalities' && <InequalitiesScreen />}
      {currentScreen === 'absolute-value' && <AbsoluteValueScreen />}
      {currentScreen === 'rational-radical-equations' && <RationalRadicalEquationsScreen />}
      {currentScreen === 'exponential-logarithmic' && <ExponentialLogarithmicScreen />}
      {currentScreen === 'systems-equations' && <SystemsEquationsScreen />}
      {currentScreen === 'complex-numbers' && <ComplexNumbersScreen />}
      {currentScreen === 'arithmetic-progressions' && <ArithmeticProgressionsScreen />}
      {currentScreen === 'geometric-progressions' && <GeometricProgressionsScreen />}
      {currentScreen === 'binomial-theorem' && <BinomialTheoremScreen />}
      {currentScreen === 'matrices' && <MatricesScreen />}
      {currentScreen === 'partial-fractions' && <PartialFractionsScreen />}
      {currentScreen === 'word-problems' && <WordProblemsScreen />}
      {currentScreen === 'inverse-functions' && <InverseFunctionsScreen />}
      {currentScreen === 'polynomial-functions' && <PolynomialFunctionsScreen />}
      {currentScreen === 'rational-functions' && <RationalFunctionsScreen />}
      {currentScreen === 'harmonic-progressions' && <HarmonicProgressionsScreen />}
      {currentScreen === 'order-of-operations' && <OrderOfOperationsScreen />}
      {currentScreen === 'algebraic-terms' && <AlgebraicTermsScreen />}
      {currentScreen === 'ratios-proportions' && <RatiosProportionsScreen />}
      {currentScreen === 'scientific-notation' && <ScientificNotationScreen />}
      {currentScreen === 'formula-flashcard' && <FormulaFlashcardMode />}
      {currentScreen === 'today' && <TodayScreen />}
      {currentScreen === 'overview' && <OverviewDashboard />}
      {currentScreen === 'subjects' && <SubjectsScreen />}
      {(currentScreen === 'tests' || currentScreen === 'mock-exams') && <TestsScreen />}
      {currentScreen === 'errors' && <ErrorLogScreen />}
      {currentScreen === 'progress' && <ProgressScreen />}
      {currentScreen === 'queue' && <ReviewQueueScreen />}
      {currentScreen === 'practice' && <PracticeScreen />}
      {currentScreen === 'calculator-skills' && <CalculatorSkillsScreen />}
      {currentScreen === 'readiness' && <BoardReadinessScreen />}
      {currentScreen === 'geas' && <BoardSubjectScreen category="geas" />}
      {currentScreen === 'electronics' && <BoardSubjectScreen category="electronics" />}
      {currentScreen === 'est' && <BoardSubjectScreen category="est" />}
    </main>
  );
};

const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    isFocusMode,
    isLearnReaderActive,
    isVoiceModalOpen,
    closeVoiceConversation,
    voiceModalInitialTopic,
    isChatDrawerOpen,
    closeChatDrawer,
    chatInitialPrompt,
    chatInitialRole,
    isFormulaQuickSheetOpen,
    closeFormulaQuickSheet,assessmentSession,
  } = useReview();

  const {setOpen:setCalculatorOpen}=useCalculator();
  const strictLocked=assessmentSession.status==='strict-active'||assessmentSession.status==='finalizing';
  useEffect(()=>{if(strictLocked)setCalculatorOpen(false)},[strictLocked,setCalculatorOpen]);
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#f4f7fb] text-slate-900 font-sans antialiased selection:bg-blue-200 relative">
      {/* Dark Navy Sidebar - Hidden when Focus Mode is active for distraction-free review */}
      {!isFocusMode && !strictLocked && !isLearnReaderActive && (
        <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content Area - Expands to full-width when sidebar is hidden */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header onOpenMobileMenu={isLearnReaderActive ? undefined : () => setMobileMenuOpen(true)} />
        {typeof window !== 'undefined' && ['legacy','demo'].includes(window.localStorage.getItem(DATA_MODE_KEY)||'') && (
          <div className="px-3 py-1.5 text-xs bg-amber-50 border-b border-amber-200 text-amber-950">
            {window.localStorage.getItem(DATA_MODE_KEY)==='demo'
              ? 'DEMO PROFILE — displayed activity, quiz scores and mistakes are simulated, not genuine learner history.'
              : 'LEGACY PROFILE — saved progress may contain demonstration values from older releases. Earlier scores are retained as unverified. Export your original backup in Settings.'}
          </div>
        )}
        <div className="px-3 py-1 text-[11px] bg-slate-100 border-b border-slate-200 text-slate-700" title={BOARD_CALCULATOR_POLICY.notice}>
          October 2026 PRC ECE: fx-991ES and fx-991ES Plus are prohibited. Verify exact calculator permissions in the official program.
        </div>
        {strictLocked && <div role="status" className="px-3 py-2 text-xs bg-indigo-100 border-b border-indigo-300 text-indigo-950 font-semibold">Strict assessment active — in-app tutor, formula sheets, voice review and calculator instructions are unavailable. End the attempt from the examination screen before navigating elsewhere.</div>}
        <MainContent />
      </div>


      {/* Global Drawers & Modals */}
      {!strictLocked && <CalculatorPanel />}
      {!strictLocked && <TopicDrawer />}
      {!strictLocked && <ActiveSessionView />}
      {!strictLocked && <ReviewModal />}
      {!strictLocked && <ReviewCompletionModal />}
      {!strictLocked && <SettingsModal />}
      {!strictLocked && <PomodoroFocusTimer />}
      {!strictLocked && <DeepFocusModal />}
      {!strictLocked && <BlockedNavigationAlert />}
      {!strictLocked && <VoiceConversationModal
        isOpen={isVoiceModalOpen}
        onClose={closeVoiceConversation}
        initialTopic={voiceModalInitialTopic}
      />}
      {!strictLocked && !isFocusMode && (
        <ChatDrawerModal
          isOpen={isChatDrawerOpen}
          onClose={closeChatDrawer}
          initialPrompt={chatInitialPrompt}
          initialRole={chatInitialRole}
        />
      )}
      {!strictLocked && <WeakSpotQuizModal />}
      {!strictLocked && <AddErrorModal />}
      {!strictLocked && <VoiceCommandHUD />}
      {!strictLocked && <VoiceCommandGuideModal />}
      {!strictLocked && <FormulaQuickSheetModal
        isOpen={isFormulaQuickSheetOpen}
        onClose={closeFormulaQuickSheet}
      />}
    </div>
  );
};

export default function App() {
  return (
    <ReviewProvider>
      <VoiceCommandProvider>
        <CalculatorProvider>
          <AppLayout />
        </CalculatorProvider>
      </VoiceCommandProvider>
    </ReviewProvider>
  );
}
