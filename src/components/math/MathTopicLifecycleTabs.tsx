import { createArtworkIcon } from '../common/AppArtwork';
import React from 'react';


export type MathTopicLifecycleView = 'learn' | 'practice' | 'quiz' | 'mistakes' | 'progress';

interface Props {
  activeView: MathTopicLifecycleView;
  onChange: (view: MathTopicLifecycleView) => void;
  mistakeCount?: number;
}

const TABS: Array<{
  id: MathTopicLifecycleView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'learn', label: 'Learn', icon: createArtworkIcon('book') },
  { id: 'practice', label: 'Practice', icon: createArtworkIcon('target') },
  { id: 'quiz', label: 'Quiz', icon: createArtworkIcon('exam') },
  { id: 'mistakes', label: 'Mistakes', icon: createArtworkIcon('notebook') },
  { id: 'progress', label: 'Progress', icon: createArtworkIcon('graph') },
];

export const MathTopicLifecycleTabs: React.FC<Props> = ({ activeView, onChange, mistakeCount = 0 }) => (
  <div className="border-b border-slate-200 overflow-x-auto custom-scrollbar" aria-label="Topic study stages">
    <div className="flex items-center gap-5 sm:gap-7 min-w-max px-0.5">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = activeView === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={isActive ? 'page' : undefined}
            className={`py-3 flex items-center gap-2 border-b-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              isActive
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Icon className={`w-4 h-4 ${id === 'mistakes' && mistakeCount > 0 ? 'text-rose-500' : ''}`} />
            <span>{label}</span>
            {id === 'mistakes' && mistakeCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black inline-flex items-center justify-center">
                {mistakeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);
