import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React, { useEffect } from 'react';
import { rememberMathSubject } from '../features/mathematics/mathCatalog';
import { X } from 'lucide-react';
import { ScreenType, useReview } from '../context/ReviewContext';
import { LEARNING_PATHS } from '../domain/learning/learningPaths';
import { StudySessionLauncher } from './study-session/StudySessionLauncher';
import { TutorLauncher } from './tutor/TutorLauncher';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const MATHEMATICS_SCREENS = new Set<ScreenType>([
  'mathematics',
  'algebra',
  'trigonometry',
  'geometry',
  'plane-geometry',
  'analytic-geometry',
  'probability-statistics',
  'differential-equations',
  'solid-mensuration',
  'real-numbers',
  'rational-expressions',
  'linear-equations',
  'quadratic-equations',
  'functions',
  'order-of-operations',
  'algebraic-terms',
  'ratios-proportions',
  'scientific-notation',
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
  'formula-flashcard',
]);

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const {
    currentScreen,
    setCurrentScreen,
    learningPath,
    setLearningPath,
    setSelectedMathModuleId,
    errors,
    allDueOrOverdueTopics,
    setIsSettingsOpen,
  } = useReview();

  const unresolvedErrorsCount = errors.filter((error) => !error.isResolved).length;
  const reviewQueueCount = allDueOrOverdueTopics.length;
  const mathematicsActive = MATHEMATICS_SCREENS.has(currentScreen);
  // Record only a successful subject screen transition; do not change learner progress.
  useEffect(() => { rememberMathSubject(currentScreen); }, [currentScreen]);

  const handleNavClick = (screen: ScreenType) => {
    setCurrentScreen(screen);
    onCloseMobile?.();
  };

  const navItem = (active: boolean) =>
    `sidebar-button w-full flex items-center justify-between px-3 py-2 rounded-full text-xs font-medium cursor-pointer ${
      active ? 'sidebar-button--active font-semibold' : ''
    }`;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:static inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-[#152740] bg-[#0B192C] text-slate-300 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#142642] px-4">
          <button
            type="button"
            onClick={() => handleNavClick('today')}
            className="flex min-w-0 items-center gap-3 rounded-xl text-left"
            title="Go to Today"
          >
            <span className="icon-3d icon-3d--small app-artwork-tile">
              <AppArtwork name="cap" />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block text-sm font-bold tracking-wide text-white">TopNotch</span>
              <span className="block truncate text-[11px] font-medium text-slate-400">ECE Board Reviewer</span>
            </span>
          </button>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="shrink-0 border-b border-[#142642] px-3 py-3" aria-label="Learning path">
          <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Learning path</p>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#142642] p-1" role="group" aria-label="Choose learning path">
            {(['guided', 'board'] as const).map(path => (
              <button key={path} type="button" aria-pressed={learningPath === path}
                onClick={() => setLearningPath(path)}
                title={LEARNING_PATHS[path].description}
                className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors ${learningPath === path ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                {LEARNING_PATHS[path].shortLabel}
              </button>
            ))}
          </div>
        </div>
        <nav className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <section>
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Study</div>
            <div className="space-y-0.5">
              <button type="button" id="nav-btn-today" onClick={() => handleNavClick('today')} className={navItem(currentScreen === 'today')}>
                <span className="flex items-center gap-3"><FeatureIcon name="today" size="small" /><span>Today</span></span>
                {reviewQueueCount > 0 && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">{reviewQueueCount}</span>}
              </button>
              <button type="button" id="nav-btn-overview" onClick={() => handleNavClick('overview')} className={navItem(currentScreen === 'overview')}>
                <span className="flex items-center gap-3"><FeatureIcon name="dashboard" size="small" /><span>Dashboard</span></span>
              </button>
            </div>
          </section>

          <section>
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Board Subjects</div>
            <div className="space-y-0.5">
              <button
                type="button"
                id="nav-btn-mathematics"
                onClick={() => {
                  setSelectedMathModuleId('foundation');
                  handleNavClick('mathematics');
                }}
                className={navItem(mathematicsActive)}
              >
                <span className="flex items-center gap-2.5"><FeatureIcon name="mathematics" size="small" /><span>Mathematics</span></span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${mathematicsActive ? 'bg-white/20 text-white' : 'bg-[#152a47] text-slate-300'}`}>20%</span>
              </button>
              <button type="button" id="nav-btn-geas" onClick={() => handleNavClick('geas')} className={navItem(currentScreen === 'geas' || currentScreen === 'physics')}>
                <span className="flex items-center gap-2.5"><FeatureIcon name="geas" size="small" /><span>GEAS</span></span>
                <span className="rounded-full bg-[#152a47] px-2 py-0.5 text-[10px] font-semibold text-slate-300">20%</span>
              </button>
              <button type="button" id="nav-btn-electronics" onClick={() => handleNavClick('electronics')} className={navItem(currentScreen === 'electronics')}>
                <span className="flex min-w-0 items-center gap-2.5"><FeatureIcon name="electronics" size="small" /><span className="truncate">Electronics Engineering</span></span>
                <span className="shrink-0 rounded-full bg-[#152a47] px-2 py-0.5 text-[10px] font-semibold text-slate-300">30%</span>
              </button>
              <button type="button" id="nav-btn-est" onClick={() => handleNavClick('est')} className={navItem(currentScreen === 'est')}>
                <span className="flex min-w-0 items-center gap-2.5"><FeatureIcon name="est" size="small" /><span className="truncate">Electronics Systems & Tech</span></span>
                <span className="shrink-0 rounded-full bg-[#152a47] px-2 py-0.5 text-[10px] font-semibold text-slate-300">30%</span>
              </button>
            </div>
          </section>

          <section>
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Practice</div>
            <div className="space-y-0.5">
              <button type="button" id="nav-btn-queue" onClick={() => handleNavClick('queue')} className={navItem(currentScreen === 'queue')}>
                <span className="flex items-center gap-3"><FeatureIcon name="queue" size="small" /><span>Review Queue</span></span>
                {reviewQueueCount > 0 && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">{reviewQueueCount}</span>}
              </button>
              <button type="button" id="nav-btn-practice" onClick={() => handleNavClick('practice')} className={navItem(currentScreen === 'practice')}>
                <span className="flex items-center gap-3"><FeatureIcon name="practice" size="small" /><span>Practice Drills</span></span>
              </button>
              <button type="button" id="nav-btn-calculator-skills" onClick={() => handleNavClick('calculator-skills')} className={navItem(currentScreen === 'calculator-skills')}>
                <span className="flex items-center gap-3"><AppArtwork name="calculator" inline className="w-5 h-5" /><span>Calculator Skills · Canon</span></span>
              </button>
              <button type="button" id="nav-btn-mock-exams" onClick={() => handleNavClick('mock-exams')} className={navItem(currentScreen === 'mock-exams' || currentScreen === 'tests')}>
                <span className="flex items-center gap-3"><FeatureIcon name="exams" size="small" /><span>Mock Exams</span></span>
              </button>
              <button type="button" id="nav-btn-error-log" onClick={() => handleNavClick('errors')} className={navItem(currentScreen === 'errors')}>
                <span className="flex items-center gap-3"><FeatureIcon name="errors" size="small" /><span>Error Log</span></span>
                {unresolvedErrorsCount > 0 && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950">{unresolvedErrorsCount}</span>}
              </button>
            </div>
          </section>

          <section>
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Progress</div>
            <div className="space-y-0.5">
              <button type="button" id="nav-btn-progress" onClick={() => handleNavClick('progress')} className={navItem(currentScreen === 'progress')}>
                <span className="flex items-center gap-3"><FeatureIcon name="progress" size="small" /><span>Progress</span></span>
              </button>
              <button type="button" id="nav-btn-readiness" onClick={() => handleNavClick('readiness')} className={navItem(currentScreen === 'readiness')}>
                <span className="flex items-center gap-3"><FeatureIcon name="readiness" size="small" /><span>Board Readiness</span></span>
              </button>
            </div>
          </section>

        </nav>

        <div className="shrink-0 border-t border-[#142642] p-3">
          <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Study tools</div>
          <div className="space-y-0.5 pb-2">
            <TutorLauncher inverted onAction={onCloseMobile} />
            <StudySessionLauncher inverted onAction={onCloseMobile} />
          </div>
          <div className="mb-1 border-t border-[#142642]" />
          <button
            id="nav-btn-settings"
            type="button"
            onClick={() => {
              setIsSettingsOpen(true);
              onCloseMobile?.();
            }}
            className="sidebar-button w-full items-center gap-3 px-3 py-2 text-xs font-medium"
          >
            <FeatureIcon name="settings" size="small" />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
