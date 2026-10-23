import { AppArtwork } from '../common/AppArtwork';
import React from 'react';
import { X } from 'lucide-react';

interface StudyPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: () => void;
}

export const StudyPlanModal: React.FC<StudyPlanModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm app-artwork-tile">
              <AppArtwork name="calendar" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">35-Minute Study Plan</h3>
              <p className="text-[11px] text-slate-500">Rational Expressions Spaced Session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900">
            <strong>Today's Goal:</strong> Elevate Addition &amp; Subtraction and Rational Equations from 2/5 to 3/5, clearing 2 unresolved errors.
          </div>

          <div className="space-y-2">
            {[
              {
                time: '5 mins',
                title: 'Active Rule Recall',
                desc: 'Hide formula rules, test excluded value and multiplication/division definitions.',
              },
              {
                time: '8 mins',
                title: 'Weakest Concept Review',
                desc: 'Worked examples on LCD finding and extraneous roots checking.',
              },
              {
                time: '15 mins',
                title: 'Targeted Practice (15 Q)',
                desc: 'Solve 15 board-level problems with guided hints if needed.',
              },
              {
                time: '7 mins',
                title: 'Mastery Quiz (5 Q)',
                desc: 'Timed test simulation under board exam conditions (no hints).',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 flex items-start justify-between gap-3 bg-[#fbfcfd]"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{step.title}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] pl-7">{step.desc}</p>
                </div>
                <span className="font-mono font-bold text-blue-600 shrink-0 text-[11px] bg-blue-50 px-2 py-0.5 rounded">
                  {step.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartSession();
            }}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            Start Session Now
          </button>
        </div>
      </div>
    </div>
  );
};
