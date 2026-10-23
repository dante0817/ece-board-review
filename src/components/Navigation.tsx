import { createArtworkIcon } from './common/AppArtwork';
import React from 'react';
import { useReview, ScreenType } from '../context/ReviewContext';


interface NavItem {
  id: ScreenType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export const Navigation: React.FC = () => {
  const { currentScreen, setCurrentScreen, errors } = useReview();

  const unresolvedErrorCount = errors.filter((e) => !e.isResolved).length;

  const navItems: NavItem[] = [
    { id: 'today', label: 'Today', icon: createArtworkIcon('calendar') },
    { id: 'overview', label: 'Overview', icon: createArtworkIcon('graph') },
    { id: 'subjects', label: 'Subjects', icon: createArtworkIcon('book') },
    { id: 'tests', label: 'Tests', icon: createArtworkIcon('exam') },
    { id: 'errors', label: 'Error Log', icon: createArtworkIcon('notebook'), badge: unresolvedErrorCount },
    { id: 'progress', label: 'Progress', icon: createArtworkIcon('graph') },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-56 flex-col border-r border-stone-200 bg-stone-100/60 p-4 shrink-0 justify-between select-none">
        <div className="space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Review Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-stone-900 text-stone-50 shadow-sm'
                    : 'text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-amber-400 text-stone-900'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Focus Banner */}
        <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-xs">
          <div className="text-[11px] text-stone-500 uppercase font-semibold">Active Subject</div>
          <div className="text-sm font-bold text-stone-900 mt-0.5">Mathematics: Algebra</div>
          <div className="mt-2 text-xs text-stone-600 flex items-center justify-between">
            <span>Target Level:</span>
            <span className="font-semibold text-stone-800">90% Board</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-50/95 backdrop-blur-md border-t border-stone-200 py-1 px-2 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex flex-col items-center py-1.5 px-2 rounded-md transition-colors relative ${
                isActive ? 'text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-stone-500'}`} />
                {item.badge !== undefined && Number(item.badge) > 0 && (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-stone-900 mt-0.5" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
