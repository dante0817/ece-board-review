import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, User } from 'lucide-react';
import {
  ConceptId,
  ConceptScheduleItem,
  loadRealNumbersSchedule,
  SCHEDULE_UPDATED_EVENT,
} from '../utils/realNumbersScheduler';
import {
  ConceptMasteryData,
  loadConceptMasteryStore,
  CONCEPT_MASTERY_UPDATED_EVENT,
  MASTERY_LEVEL_COLORS,
  MASTERY_LEVEL_LABELS,
  getDiscrepancyInfo,
  resetUserMasteryToSystem,
} from '../utils/conceptMasteryEngine';
import { MasterySegmentBar } from './MasterySegmentBar';
import { EditMasteryModal } from './EditMasteryModal';

interface ConceptsInThisModulePanelProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  onOpenAssessment: (conceptId: ConceptId) => void;
  onReviewConcept?: (conceptId: ConceptId) => void;
}

export const ConceptsInThisModulePanel: React.FC<ConceptsInThisModulePanelProps> = ({
  currentStep,
  onSelectStep,
  onOpenAssessment,
  onReviewConcept,
}) => {
  const [masteryStore, setMasteryStore] = useState(() => loadConceptMasteryStore());
  const [expandedConceptId, setExpandedConceptId] = useState<ConceptId | null>(
    (currentStep as ConceptId) || 2
  );
  const [editingConceptId, setEditingConceptId] = useState<ConceptId | null>(null);

  // Sync with currentStep when user changes step externally (e.g. Next Lesson button)
  useEffect(() => {
    if (currentStep >= 1 && currentStep <= 4) {
      setExpandedConceptId(currentStep as ConceptId);
    }
  }, [currentStep]);

  // Listen for mastery engine updates
  useEffect(() => {
    const handleMasteryUpdate = () => {
      setMasteryStore(loadConceptMasteryStore());
    };
    window.addEventListener(CONCEPT_MASTERY_UPDATED_EVENT, handleMasteryUpdate);
    window.addEventListener(SCHEDULE_UPDATED_EVENT, handleMasteryUpdate);
    return () => {
      window.removeEventListener(CONCEPT_MASTERY_UPDATED_EVENT, handleMasteryUpdate);
      window.removeEventListener(SCHEDULE_UPDATED_EVENT, handleMasteryUpdate);
    };
  }, []);

  const conceptsList: ConceptId[] = [1, 2, 3, 4];

  const handleRowClick = (id: ConceptId) => {
    onSelectStep(id);
    if (expandedConceptId === id) {
      setExpandedConceptId(id);
    } else {
      setExpandedConceptId(id);
    }
  };

  const handleToggleExpand = (e: React.MouseEvent, id: ConceptId) => {
    e.stopPropagation();
    setExpandedConceptId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
            Concepts in This Module
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            5-level evidence mastery system
          </p>
        </div>
        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          SM-2 Calibrated
        </span>
      </div>

      {/* Concepts List */}
      <div className="space-y-3">
        {conceptsList.map((id) => {
          const concept = masteryStore.concepts[id];
          if (!concept) return null;

          const isSelected = currentStep === id;
          const isExpanded = expandedConceptId === id;
          const levelColor = MASTERY_LEVEL_COLORS[concept.masteryLevel];
          const discrepancy = getDiscrepancyInfo(concept);

          return (
            <div
              key={id}
              onClick={() => handleRowClick(id)}
              className={`group rounded-xl border transition-all cursor-pointer overflow-hidden ${
                isSelected
                  ? 'border-blue-300 bg-[#fafcff] shadow-xs ring-1 ring-blue-400/20'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Collapsed Row Header (Strictly adhering to requested concise format) */}
              <div className="p-3.5 space-y-2">
                {/* Line 1: Step Number + Title + Edit Pencil Affordance + 5-Level Rating */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#2563eb] text-white'
                          : 'border border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {id}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {concept.shortTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Small edit affordance on hover or selection */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingConceptId(id);
                      }}
                      className={`p-1 rounded-md transition-all cursor-pointer ${
                        isSelected
                          ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 opacity-90'
                          : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                      }`}
                      title="Edit your perceived mastery level"
                      aria-label="Edit mastery"
                    >
                      <AppArtwork name="exam" inline className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-xs font-black text-slate-900 tabular-nums">
                      {concept.masteryLevel}/5
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleToggleExpand(e, id)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse details' : 'Expand details'}
                      aria-label="Toggle details"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Line 2: 5-Segment Horizontal Mastery Indicator */}
                <div className="pl-8.5 pr-1">
                  <MasterySegmentBar level={concept.masteryLevel} size="xs" />
                </div>

                {/* Line 3: Level Label + Subtle User Set / Review Due Indicator */}
                <div className="pl-8.5 pr-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold tracking-tight ${levelColor.textColor}`}
                    >
                      {concept.levelLabel}
                    </span>

                    {/* Subtle User Set indicator */}
                    {concept.masterySource === 'user' && (
                      <>
                        <span className="text-slate-300 text-[10px]">·</span>
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-1.5 py-0.2 rounded">
                          User Set
                        </span>
                      </>
                    )}
                  </div>

                  {/* Subtle indicator if review is due */}
                  {concept.retentionScore < 70 && (
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded font-medium border border-amber-200/60">
                      Review due
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded / Detail State */}
              {isExpanded && (
                <div
                  className="px-4 pb-4 pt-2 border-t border-slate-100 bg-white space-y-3.5 animate-in fade-in duration-150 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {concept.title}
                    </span>
                  </div>

                  {/* Mastery Block */}
                  <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                        Mastery
                      </span>
                      <span className="font-black text-slate-900">
                        {concept.masteryLevel}/5 — {concept.levelLabel}
                      </span>
                    </div>

                    <MasterySegmentBar level={concept.masteryLevel} size="sm" />

                    {/* Clear distinction: User Set vs System Estimated */}
                    {concept.masterySource === 'user' ? (
                      <div className="pt-1.5 space-y-1 text-[11px] border-t border-slate-200/60 mt-1">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            <User className="w-3 h-3" />
                            User Set
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            System Estimate:{' '}
                            <b className="text-slate-700 font-bold">
                              {concept.systemMasteryLevel}/5
                            </b>{' '}
                            ({concept.systemMasteryScore}%)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1 text-[11px] text-slate-500 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>
                            Source: <b className="text-slate-700">System Estimated</b>
                          </span>
                          <span>
                            Mastery Score: <b className="text-slate-900">{concept.systemMasteryScore}%</b>
                          </span>
                          <span>
                            Confidence:{' '}
                            <b
                              className={`capitalize ${
                                concept.masteryConfidence === 'high'
                                  ? 'text-emerald-700'
                                  : concept.masteryConfidence === 'medium'
                                  ? 'text-blue-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {concept.masteryConfidence}
                            </b>
                          </span>
                        </div>
                      </div>
                    )}

                    {concept.evidenceSummary && (
                      <p className="text-[10px] text-slate-400 italic pt-0.5">
                        {concept.evidenceSummary}
                      </p>
                    )}
                  </div>

                  {/* Gentle Discrepancy Callout if User Set and System Estimate strongly disagree */}
                  {discrepancy && (
                    <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="text-slate-500">Your rating:</span>
                            <span className="font-black text-slate-900">{discrepancy.userLevel}/5</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">System estimate:</span>
                            <span className="font-black text-slate-900">{discrepancy.systemLevel}/5</span>
                          </div>
                          <p className="font-bold text-amber-950 text-xs leading-snug">
                            {discrepancy.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 pl-6">
                        {discrepancy.type === 'user_higher' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => onOpenAssessment(id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <AppArtwork name="star" inline className="w-3 h-3 text-amber-200" />
                              <span>Take a Mastery Check</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => resetUserMasteryToSystem(id)}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-semibold text-xs transition-colors cursor-pointer"
                            >
                              Reset to System Estimate
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => onOpenAssessment(id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                            >
                              Reassess
                            </button>
                            <span className="text-[11px] text-amber-800 italic">
                              (Your conservative rating is kept active)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Retention (Clearly Differentiated as Memory Curve) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-600">Retention</span>
                      <span className="text-slate-500 font-medium">
                        {concept.retentionScore}% ·{' '}
                        <span
                          className={
                            concept.retentionScore < 70
                              ? 'text-rose-600 font-bold'
                              : concept.retentionScore < 80
                              ? 'text-amber-600 font-bold'
                              : 'text-emerald-600 font-bold'
                          }
                        >
                          {concept.retentionScore < 70
                            ? 'Review due'
                            : concept.retentionScore < 80
                            ? 'Due soon'
                            : 'Healthy'}
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          concept.retentionScore < 70
                            ? 'bg-rose-500'
                            : concept.retentionScore < 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${concept.retentionScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Recent Performance */}
                  <div className="text-[11px]">
                    <span className="font-bold text-slate-600 block">Recent Performance</span>
                    <span className="text-slate-800 font-medium">
                      {concept.recentCorrect} of {concept.recentAttempts} correct ({concept.recentAccuracy}%)
                    </span>
                  </div>

                  {/* Recommended Next Step */}
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 space-y-1 text-[11px]">
                    <span className="font-bold text-blue-900 block">Recommended Next Step</span>
                    <p className="text-blue-800 leading-snug">
                      {concept.nextRecommendedAction}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      {/* Assess Mastery / Reassess button */}
                      <button
                        type="button"
                        onClick={() => onOpenAssessment(id)}
                        className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-2xs ${
                          concept.masteryConfidence === 'low'
                            ? 'bg-[#2563eb] hover:bg-blue-700 text-white ring-2 ring-blue-500/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                      >
                        <AppArtwork name="star" inline className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {concept.recentAttempts > 0 ? 'Reassess' : 'Assess Mastery'}
                        </span>
                      </button>

                      {/* Edit Mastery button */}
                      <button
                        type="button"
                        onClick={() => setEditingConceptId(id)}
                        className="py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        title="Manually adjust your perceived mastery"
                      >
                        <AppArtwork name="exam" inline className="w-3 h-3 text-slate-500" />
                        <span>Edit Mastery</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Review Concept button */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectStep(id);
                          onReviewConcept?.(id);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
                      >
                        {concept.actionType === 'review'
                          ? 'Review Concept'
                          : concept.actionType === 'practice_basics'
                          ? 'Practice Basics'
                          : concept.actionType === 'quick_review'
                          ? 'Quick Review'
                          : 'Review Step'}
                      </button>

                      {/* Reset to System Estimate if manual override is present */}
                      {concept.userMasteryLevel !== null && (
                        <button
                          type="button"
                          onClick={() => resetUserMasteryToSystem(id)}
                          className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Clear manual override and restore system estimated mastery"
                        >
                          <AppArtwork name="cycle" inline className="w-3 h-3" />
                          <span>Reset to System Estimate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightweight Edit Mastery Modal */}
      {editingConceptId !== null && masteryStore.concepts[editingConceptId] && (
        <EditMasteryModal
          concept={masteryStore.concepts[editingConceptId]}
          isOpen={true}
          onClose={() => setEditingConceptId(null)}
        />
      )}
    </div>
  );
};
