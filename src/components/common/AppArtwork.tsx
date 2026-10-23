import React from 'react';

const APP_ARTWORK = ['calendar', 'atom', 'chip', 'antenna', 'cards', 'target', 'exam', 'notebook', 'shield', 'chat', 'timer', 'gear', 'bell', 'cap', 'integral', 'padlock', 'eye', 'printer', 'cycle', 'wave', 'trophy', 'flame', 'lightning', 'brain', 'bulb', 'star', 'microphone', 'coffee', 'triangle'] as const;
const MATH_ARTWORK = ['calculator', 'plus-minus', 'brackets', 'percent', 'power-ten', 'equals', 'division', 'sum', 'exponential', 'logarithm', 'matrix', 'book', 'square', 'graph'] as const;
export type AppArtworkName = typeof APP_ARTWORK[number] | typeof MATH_ARTWORK[number];
const mathNames = new Set<string>(MATH_ARTWORK);

interface AppArtworkProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'name'> {
  name: AppArtworkName;
  inline?: boolean;
}

// Artwork fits inside the caller's existing tile, or follows its inline size classes.
export const AppArtwork: React.FC<AppArtworkProps> = ({ name, inline = false, className = '', ...props }) => (
  <img
    width={24} height={24} loading="lazy" decoding="async" {...props}
    src={`/icons/${mathNames.has(name) ? 'algebra-3d-v1' : 'app-3d-v1'}/${name}.png`}
    alt="" aria-hidden="true" draggable={false}
    className={`${inline ? 'app-inline-art' : 'app-icon-art'} ${className}`}
  />
);

// Stable adapters for navigation and category registries that accept icon components.
const artworkAdapters = new Map<AppArtworkName, React.FC<{ className?: string }>>();
export const createArtworkIcon = (name: AppArtworkName): React.FC<{ className?: string }> => {
  const existing = artworkAdapters.get(name);
  if (existing) return existing;
  const ArtworkIcon: React.FC<{ className?: string }> = ({ className }) => <AppArtwork name={name} inline className={className} />;
  ArtworkIcon.displayName = `Artwork(${name})`;
  artworkAdapters.set(name, ArtworkIcon);
  return ArtworkIcon;
};

const TOPIC_ARTWORK: Record<string, AppArtworkName> = {
  'top-real-numbers': 'calculator', 'top-signed-numbers': 'plus-minus',
  'top-order-operations': 'brackets', 'top-algebraic-expressions': 'square',
  'top-ratios-proportions': 'percent', 'top-scientific-notation': 'power-ten',
  'top-laws-exponents': 'square', 'top-polynomial-eq': 'square',
  'top-factoring': 'brackets', 'top-alg-fractions': 'division',
  'top-linear-eq': 'equals', 'top-quadratics': 'square',
  'top-inequalities': 'plus-minus', 'top-absolute-value': 'plus-minus',
  'top-rational-radical-eqs': 'division', 'top-functions': 'graph',
  'top-logarithms': 'exponential', 'top-simultaneous-linear': 'matrix',
  'top-complex-numbers': 'plus-minus', 'top-arithmetic-seq': 'sum',
  'top-geometric-seq': 'sum', 'top-harmonic-seq': 'sum',
  'top-binomial-theorem': 'sum', 'top-matrices': 'matrix',
  'top-partial-fractions': 'division', 'top-word-problems': 'book',
  'top-inverse-functions': 'graph', 'top-polynomial-functions': 'graph',
  'top-rational-functions': 'graph',
};
export const getMathTopicArtwork = (topicId: string): AppArtworkName => TOPIC_ARTWORK[topicId] ?? 'book';
