import React from 'react';
import { useReview } from '../context/ReviewContext';
import { X, BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';

interface SubjectOutlineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubjectOutlineModal: React.FC<SubjectOutlineModalProps> = ({ isOpen, onClose }) => {
  const { currentSubject, openTopicDrawer } = useReview();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-serif font-bold text-lg">
              ∑
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Mathematics: Full Subject Outline</h3>
              <p className="text-xs text-slate-500">
                PRC ECE Board Syllabus Structure (20% Board Weight)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {currentSubject?.groups.map((grp) => {
            const coveredCount = grp.topics.filter((t) => t.initialCovered).length;
            const percent = grp.topics.length ? Math.round((coveredCount / grp.topics.length) * 100) : 0;

            return (
              <div key={grp.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{grp.name}</h4>
                    <span className="text-xs text-slate-500">
                      {coveredCount} of {grp.topics.length} topics covered ({percent}%)
                    </span>
                  </div>
                  <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {grp.topics.map((top) => (
                    <div
                      key={top.id}
                      onClick={() => {
                        openTopicDrawer(top);
                        onClose();
                      }}
                      className="p-3 px-4 hover:bg-blue-50/60 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            top.initialCovered ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        />
                        <span className="text-xs font-medium text-slate-800">{top.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {top.mastery && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Mastery Lvl {top.mastery}
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Close Outline
          </button>
        </div>
      </div>
    </div>
  );
};
