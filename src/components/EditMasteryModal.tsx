import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { X, Sliders, Check, AlertTriangle, Info } from 'lucide-react';
import {
  ConceptMasteryData,
  MasteryScaleLevel,
  MASTERY_LEVEL_COLORS,
  MASTERY_LEVEL_LABELS,
  setUserMasteryOverride,
  resetUserMasteryToSystem,
} from '../utils/conceptMasteryEngine';
import { MasterySegmentBar } from './MasterySegmentBar';

interface EditMasteryModalProps {
  concept: ConceptMasteryData;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updated: ConceptMasteryData) => void;
}

const MASTERY_OPTIONS: Array<{
  level: MasteryScaleLevel;
  label: string;
  description: string;
}> = [
  {
    level: 1,
    label: 'Needs Review',
    description: 'Struggling with core definitions or frequent mistake traps',
  },
  {
    level: 2,
    label: 'Developing',
    description: 'Understand fundamentals but need step-by-step guidance',
  },
  {
    level: 3,
    label: 'Proficient',
    description: 'Can solve standard board exam questions with good accuracy',
  },
  {
    level: 4,
    label: 'Strong',
    description: 'High speed and confidence across varied question types',
  },
  {
    level: 5,
    label: 'Mastered',
    description: 'Complete mastery, zero traps, capable of teaching others',
  },
];

export const EditMasteryModal: React.FC<EditMasteryModalProps> = ({
  concept,
  isOpen,
  onClose,
  onSaved,
}) => {
  // Current selected level in the dialog (defaults to currently displayed level or system level)
  const [selectedLevel, setSelectedLevel] = useState<MasteryScaleLevel>(
    concept.userMasteryLevel ?? concept.systemMasteryLevel
  );

  if (!isOpen) return null;

  const hasOverride = concept.userMasteryLevel !== null && concept.masterySource === 'user';
  const diff = selectedLevel - concept.systemMasteryLevel;
  const hasStrongDiscrepancy = Math.abs(diff) >= 2;

  const handleSave = () => {
    const updated = setUserMasteryOverride(concept.conceptId, selectedLevel);
    onSaved?.(updated);
    onClose();
  };

  const handleReset = () => {
    const updated = resetUserMasteryToSystem(concept.conceptId);
    onSaved?.(updated);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                Set Your Mastery
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                How confident are you with{' '}
                <span className="font-semibold text-slate-800">{concept.shortTitle}</span>?
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Current System Estimate Reference Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 app-artwork-tile">
              <AppArtwork name="brain" />
            </div>
            <div className="flex-1 min-w-0 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">System Estimate</span>
                <span className="font-black text-slate-900 tabular-nums">
                  {concept.systemMasteryLevel}/5 — {MASTERY_LEVEL_LABELS[concept.systemMasteryLevel]}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                <span>Score: <b className="text-slate-700">{concept.systemMasteryScore}%</b></span>
                <span>•</span>
                <span className="capitalize">Confidence: <b className="text-slate-700">{concept.masteryConfidence}</b></span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 italic truncate">
                {concept.evidenceSummary}
              </p>
            </div>
          </div>

          {/* Level Options Selector (1/5 to 5/5) */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-slate-900 tracking-tight">
              Select Perceived Mastery
            </label>

            <div className="space-y-2">
              {MASTERY_OPTIONS.map((opt) => {
                const isSelected = selectedLevel === opt.level;
                const colors = MASTERY_LEVEL_COLORS[opt.level];
                const isSystemMatch = opt.level === concept.systemMasteryLevel;

                return (
                  <div
                    key={opt.level}
                    onClick={() => setSelectedLevel(opt.level)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? `${colors.bgLight} ${colors.borderColor} ring-2 ring-blue-500/20 shadow-2xs`
                        : 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Radio Indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">
                            {opt.level}/5
                          </span>
                          <span className={`text-xs font-bold ${colors.textColor}`}>
                            {opt.label}
                          </span>
                          {isSystemMatch && (
                            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                              System
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    {/* Segment bar preview */}
                    <div className="w-20 shrink-0 hidden sm:block">
                      <MasterySegmentBar level={opt.level} size="xs" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gentle Discrepancy Notice if user differs strongly from system evidence */}
          {hasStrongDiscrepancy && (
            <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">
                  {diff >= 2
                    ? 'Your self-rating is higher than recent assessment results.'
                    : 'Your recent performance suggests stronger mastery.'}
                </p>
                <p className="text-[11px] text-amber-800 leading-snug">
                  {diff >= 2
                    ? 'Your manual rating will be preserved. We recommend taking a brief mastery check to validate this level.'
                    : 'We will respect your conservative rating while saving your objective results in the background.'}
                </p>
              </div>
            </div>
          )}

          {/* User manual disclaimer note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              Manual mastery updates your display status without altering quiz scores, retention history, or system calculations.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div>
            {hasOverride && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Remove manual override and use system estimated rating"
              >
                <AppArtwork name="cycle" inline className="w-3.5 h-3.5" />
                <span>Reset to System Estimate</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
