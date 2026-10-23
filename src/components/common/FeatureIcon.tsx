import React from 'react';
import { Clock, Play, Sparkles, CircleAlert, type LucideIcon } from 'lucide-react';
import { AppArtwork, type AppArtworkName } from './AppArtwork';

// One symbol and color per feature, shared by navigation, launchers and headers.
const FEATURE_ICONS = {
  today: { artwork: 'calendar', tone: 'sky' },
  dashboard: { artwork: 'graph', tone: 'violet' },
  subjects: { artwork: 'book', tone: 'blue' },
  mathematics: { artwork: 'calculator', tone: 'blue' },
  geas: { artwork: 'atom', tone: 'emerald' },
  electronics: { artwork: 'chip', tone: 'amber' },
  est: { artwork: 'antenna', tone: 'violet' },
  queue: { artwork: 'cards', tone: 'cyan', badge: Clock },
  practice: { artwork: 'target', tone: 'emerald' },
  exams: { artwork: 'exam', tone: 'indigo' },
  errors: { artwork: 'notebook', tone: 'coral', badge: CircleAlert },
  progress: { artwork: 'graph', tone: 'emerald' },
  readiness: { artwork: 'shield', tone: 'amber' },
  tutor: { artwork: 'chat', tone: 'violet', badge: Sparkles },
  session: { artwork: 'timer', tone: 'orange', badge: Play },
  flashcards: { artwork: 'cards', tone: 'cyan' },
  settings: { artwork: 'gear', tone: 'slate' },
} satisfies Record<string, { artwork: AppArtworkName; tone: string; badge?: LucideIcon }>;

export type FeatureIconName = keyof typeof FEATURE_ICONS;

interface FeatureIconProps {
  name: FeatureIconName;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const FeatureIcon: React.FC<FeatureIconProps> = ({
  name, size = 'medium', className = '',
}) => {
  const config: { artwork: AppArtworkName; tone: string; badge?: LucideIcon } = FEATURE_ICONS[name];
  const Badge = config.badge;

  return (
    <span
      aria-hidden="true"
      className={`icon-3d feature-icon app-artwork-tile icon-3d--${config.tone} ${size === 'medium' ? '' : `icon-3d--${size}`} ${className}`}
    >
      <AppArtwork name={config.artwork} />
      {Badge && <span className="feature-icon__badge"><Badge strokeWidth={2.5} /></span>}
    </span>
  );
};
