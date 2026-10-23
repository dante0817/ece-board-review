import React from 'react';
import {
  ConceptScheduleItem,
  ConceptMasteryInfo,
  getConceptMastery,
} from '../utils/realNumbersScheduler';
import { Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface ConceptMasteryProgressBarProps {
  concept?: ConceptScheduleItem | null;
  masteryInfo?: ConceptMasteryInfo;
  size?: 'xs' | 'sm' | 'md';
  label?: string;
  showLabel?: boolean;
  showScore?: boolean;
  showScoreText?: boolean;
  showPercentage?: boolean;
  compactText?: boolean;
  className?: string;
}

export const ConceptMasteryProgressBar: React.FC<ConceptMasteryProgressBarProps> = ({
  concept,
  masteryInfo: providedMastery,
  size = 'sm',
  label,
  showLabel = true,
  showScore = true,
  showScoreText,
  showPercentage = true,
  compactText = false,
  className = '',
}) => {
  const mastery = providedMastery || getConceptMastery(concept);
  const displayScore = showScoreText !== undefined ? showScoreText : showScore;

  const barHeight =
    size === 'xs' ? 'h-1.5' : size === 'sm' ? 'h-2' : 'h-2.5';

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {(showLabel || displayScore || showPercentage) && (
        <div className="flex items-center justify-between text-[11px] leading-tight">
          <div className="flex items-center gap-1.5 truncate">
            {showLabel && (
              <span className={`font-bold truncate ${mastery.textColor}`}>
                {label ? `${label}: ${mastery.label}` : compactText ? mastery.label : `Mastery: ${mastery.label}`}
              </span>
            )}
            {displayScore && mastery.totalAttempts > 0 && (
              <span className="text-slate-400 font-medium text-[10px] hidden sm:inline">
                ({mastery.scoreText})
              </span>
            )}
          </div>

          {showPercentage && (
            <div className="flex items-center gap-1 shrink-0 ml-1.5">
              <span className={`font-black text-xs ${mastery.textColor}`}>
                {mastery.percentage}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div
        className={`w-full ${barHeight} bg-slate-100 rounded-full overflow-hidden border border-slate-200/70 relative`}
        role="progressbar"
        aria-valuenow={mastery.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        title={`Knowledge Check Mastery: ${mastery.percentage}% (${mastery.label})`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out bg-linear-to-r ${mastery.barGradient}`}
          style={{ width: `${Math.max(mastery.percentage > 0 ? 4 : 0, mastery.percentage)}%` }}
        />
      </div>
    </div>
  );
};
