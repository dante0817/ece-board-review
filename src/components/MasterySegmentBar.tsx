import React from 'react';
import {
  MasteryScaleLevel,
  MASTERY_LEVEL_COLORS,
  MASTERY_LEVEL_LABELS,
} from '../utils/conceptMasteryEngine';

interface MasterySegmentBarProps {
  level: MasteryScaleLevel;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const MasterySegmentBar: React.FC<MasterySegmentBarProps> = ({
  level,
  size = 'sm',
  className = '',
}) => {
  const activeColor = MASTERY_LEVEL_COLORS[level].barColor;
  const label = MASTERY_LEVEL_LABELS[level];

  // Sizing variants
  const heightClass =
    size === 'xs'
      ? 'h-1.5'
      : size === 'sm'
      ? 'h-2'
      : size === 'md'
      ? 'h-2.5'
      : 'h-3.5';

  const gapClass = size === 'xs' ? 'gap-0.5' : 'gap-1 sm:gap-1.5';
  const radiusClass = size === 'xs' ? 'rounded-xs' : 'rounded-sm';

  return (
    <div
      className={`flex items-center w-full ${gapClass} ${className}`}
      role="meter"
      aria-valuenow={level}
      aria-valuemin={1}
      aria-valuemax={5}
      aria-label={`Mastery level: ${level}/5 — ${label}`}
      title={`Mastery: ${level}/5 (${label})`}
    >
      {[1, 2, 3, 4, 5].map((segIndex) => {
        const isFilled = segIndex <= level;
        return (
          <div
            key={segIndex}
            className={`flex-1 ${heightClass} ${radiusClass} transition-colors duration-300 ${
              isFilled ? activeColor : 'bg-slate-100 border border-slate-200/70'
            }`}
          />
        );
      })}
    </div>
  );
};
