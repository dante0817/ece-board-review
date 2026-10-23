import { AppArtwork } from './common/AppArtwork';
import React, { useEffect, useRef } from 'react';
import { useExclusiveDropdown } from '../hooks/useExclusiveDropdown';
import { Calculator, CheckCircle2, ChevronDown, Menu, Moon, Search, Sun } from 'lucide-react';
import { useReview } from '../context/ReviewContext';
import {strictAssessmentLocked} from '../domain/assessment/assessmentAccess';
import { StudySessionLauncher } from './study-session/StudySessionLauncher';
import { TutorLauncher } from './tutor/TutorLauncher';
import { useCalculator } from './calculator/CalculatorProvider';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    userProfile,
    setIsSettingsOpen,
    searchQuery,
    setSearchQuery,
    allTopics,
    openTopicDrawer,
    dueTodayTopics,
    overdueTopics,
    setCurrentScreen,
    dailyTarget,
    isDarkMode,
    toggleTheme,
    isDeepFocusActive,
    silencedNotifications,
    assessmentSession,
  } = useReview();

  const {setOpen: setCalculatorOpen} = useCalculator();
  const [isSearchOpen, setIsSearchOpen] = useExclusiveDropdown();
  const [isNotificationsOpen, setIsNotificationsOpen] = useExclusiveDropdown();
  const [isUserMenuOpen, setIsUserMenuOpen] = useExclusiveDropdown();

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) setIsSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setIsNotificationsOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? allTopics
        .filter((topic) => topic.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 6)
    : [];

  const dueCount = dueTodayTopics.length + overdueTopics.length;
  const initials = (userProfile.name || 'John Doe')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'JD';

  // Fail closed at the header as well as inside the tutor/modal components:
  // a strict attempt must never display search results, notifications or profile links.
  if(strictAssessmentLocked(assessmentSession))return (
    <header className="h-16 shrink-0 border-b border-indigo-200 bg-indigo-50 px-4 sm:px-6 flex items-center gap-3" aria-label="Strict assessment header">
      <span className="text-sm font-bold text-indigo-950">Strict assessment in progress</span>
      <span className="text-xs text-indigo-900 hidden sm:inline">Search, tutor, notifications and instructional navigation are temporarily unavailable.</span>
    </header>
  );

  return (
    <header className="h-16 shrink-0 border-b border-slate-200/90 bg-white/95 px-3 sm:px-5 lg:px-6 flex items-center gap-3 sticky top-0 z-30 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
      {onOpenMobileMenu && (
        <button
          type="button"
          id="mobile-sidebar-toggle"
          onClick={onOpenMobileMenu}
          className="lg:hidden h-9 w-9 shrink-0 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 flex items-center justify-center"
          title="Open navigation"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div ref={searchRef} className="relative min-w-0 flex-1 max-w-2xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="global-search-input"
          type="search"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          placeholder="Search topics and formulas…"
          className="h-9 w-full rounded-xl border border-transparent bg-slate-100 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950 dark:focus:ring-blue-950"
        />

        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="px-3 pb-1 pt-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Topics ({searchResults.length})
            </div>
            {searchResults.length ? (
              searchResults.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    openTopicDrawer(topic);
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <AppArtwork name="book" inline className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{topic.name}</span>
                  </span>
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {topic.mastery ? `L${topic.mastery}` : 'New'}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-5 text-center text-xs text-slate-500">No matching topics.</div>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button type="button" id="f789-calculator-launcher" aria-label="Open F-789SGA-style scientific calculator" title="Open F-789SGA-style calculator" onClick={()=>setCalculatorOpen(true)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-indigo-800 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-slate-800" ><Calculator className="h-5 w-5" /></button>
        <StudySessionLauncher compact />
        <TutorLauncher compact />

        <div ref={notifRef} className="relative">
          <button
            id="notifications-bell-btn"
            type="button"
            onClick={() => setIsNotificationsOpen((value) => !value)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            title={isDeepFocusActive ? 'Notifications are limited during Deep Focus' : 'Notifications'}
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
          >
            <span className={`icon-3d icon-3d--small app-artwork-tile ${isDeepFocusActive ? 'icon-3d--violet app-artwork-off' : 'icon-3d--amber'}`} aria-hidden="true"><AppArtwork name="bell" /></span>
            {dueCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</span>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  {dueCount} due
                </span>
              </div>

              {isDeepFocusActive && (
                <div className="m-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-[11px] text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
                  Deep Focus is active. Nonessential alerts are being held{silencedNotifications.length ? ` (${silencedNotifications.length})` : ''}.
                </div>
              )}

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentScreen('queue');
                    setIsNotificationsOpen(false);
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <span className="mt-0.5 icon-3d icon-3d--small icon-3d--rose app-artwork-tile">
                    <AppArtwork name="timer" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">{dueCount} reviews need attention</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">Open your prioritized review queue.</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentScreen('today');
                    setIsNotificationsOpen(false);
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/70"
                >
                  <span className="mt-0.5 icon-3d icon-3d--small app-artwork-tile">
                    <AppArtwork name="target" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">Daily study target</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                      {dailyTarget.completedQuestionsToday}/{dailyTarget.targetQuestions} questions completed today.
                    </span>
                  </span>
                </button>

                {dailyTarget.completedQuestionsToday >= dailyTarget.targetQuestions && (
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">Question target complete</span>
                      <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">Nice work. Continue only if the next review is genuinely useful.</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={userMenuRef} className="relative">
          <button
            id="user-profile-menu-btn"
            type="button"
            onClick={() => setIsUserMenuOpen((value) => !value)}
            className="flex items-center gap-1 rounded-xl p-1 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-expanded={isUserMenuOpen}
            aria-haspopup="menu"
          >
            <span className="icon-3d icon-3d--small icon-3d--violet icon-3d--initials">{initials}</span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{userProfile.name || 'John Doe'}</div>
                <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">ECE Licensure Examinee</div>
                {userProfile.targetExamDisplay && <div className="mt-1 text-[10px] font-semibold text-blue-600">Target: {userProfile.targetExamDisplay}</div>}
              </div>

              <div className="p-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentScreen('overview');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <AppArtwork name="graph" inline className="h-4 w-4 text-slate-400" /> Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <AppArtwork name="gear" inline className="h-4 w-4 text-slate-400" /> Settings & targets
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2">
                    {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-400" />}
                    Night study
                  </span>
                  <span className="text-[10px] text-slate-400">{isDarkMode ? 'On' : 'Off'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
