import { BOARD_CALCULATOR_POLICY } from '../data/boardCalculatorPolicy';
import { AppArtwork } from './common/AppArtwork';
import { FeatureIcon } from './common/FeatureIcon';
import React from 'react';
import { useReview } from '../context/ReviewContext';
import { MasteryGate } from './MasteryGate';


export const BoardReadinessScreen: React.FC = () => {
  const { algebraReadiness, userProfile } = useReview();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FeatureIcon name="readiness" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Board Readiness & Mastery Gates
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Evidence-based licensure readiness criteria for the PRC ECE Board Examination.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-3">
          <AppArtwork name="trophy" inline className="w-6 h-6 text-blue-600 shrink-0" />
          <div className="text-xs">
            <span className="text-slate-500 block">Exam Target</span>
            <span className="font-bold text-slate-900">{userProfile.targetExamDate ? (userProfile.targetExamDisplay || userProfile.targetExamDate) : 'Not set'}</span>
          </div>
        </div>
      </div>

      <p className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
        {BOARD_CALCULATOR_POLICY.notice} <a className="underline" href={BOARD_CALCULATOR_POLICY.programUrl} target="_blank" rel="noopener noreferrer">Official October 2026 PRC program</a>
      </p>
      <MasteryGate readiness={algebraReadiness} />
    </div>
  );
};
