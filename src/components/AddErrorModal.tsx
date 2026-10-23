import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect } from 'react';
import { useReview } from '../context/ReviewContext';
import { ErrorCategory } from '../types';
import { AlertOctagon, X, CheckCircle2 } from 'lucide-react';

export const AddErrorModal: React.FC = () => {
  const {
    isAddErrorModalOpen,
    closeAddErrorModal,
    addErrorDefaultTopicId,
    allTopics,
    addReviewError,
    setCurrentScreen,
  } = useReview();

  const [topicId, setTopicId] = useState<string>('top-partial-fractions');
  const [category, setCategory] = useState<ErrorCategory>('Formula recall');
  const [description, setDescription] = useState<string>('');
  const [solutionOrFormula, setSolutionOrFormula] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isAddErrorModalOpen) {
      if (addErrorDefaultTopicId) {
        setTopicId(addErrorDefaultTopicId);
      } else if (allTopics.length > 0 && !topicId) {
        setTopicId(allTopics[0].id);
      }
      setSubmittedSuccess(false);
    }
  }, [isAddErrorModalOpen, addErrorDefaultTopicId, allTopics]);

  if (!isAddErrorModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const matchedTopic = allTopics.find((t) => t.id === topicId) || allTopics[0];

    addReviewError({
      topicId: matchedTopic ? matchedTopic.id : topicId,
      topicName: matchedTopic ? matchedTopic.name : 'General ECE Topic',
      subjectId: matchedTopic ? matchedTopic.subjectId : 'subj-math',
      category,
      description: description.trim(),
      solutionOrKeyFormula: solutionOrFormula.trim() || undefined,
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setDescription('');
      setSolutionOrFormula('');
      closeAddErrorModal();
      setSubmittedSuccess(false);
    }, 1100);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-error-modal-title"
    >
      <div className="bg-white dark:bg-[#0d1527] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 id="add-error-modal-title" className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Log New Review Mistake / Error
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Triggered via Voice Command or Direct Input • Saved to Error Bank
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-add-error-modal-btn"
            onClick={closeAddErrorModal}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">
              Error Successfully Logged!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Added to your Spaced Repetition Error Bank and Weak Spot quizzes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="error-topic-select" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Related Topic
              </label>
              <select
                id="error-topic-select"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                {allTopics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="error-category-select" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Error Classification
              </label>
              <select
                id="error-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ErrorCategory)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Formula recall">Formula recall (Forgot formula or theorem)</option>
                <option value="Sign / algebra errors">Sign / algebra errors (Signs, exponents, cancellation slip)</option>
                <option value="Wrong method">Wrong method (Applied wrong technique or step)</option>
                <option value="Question misreading">Question misreading (Misunderstood question conditions)</option>
                <option value="Speed / calculation slip">Speed / calculation slip (Rushing under exam clock)</option>
              </select>
            </div>

            <div>
              <label htmlFor="error-desc-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Mistake Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="error-desc-input"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What exactly went wrong? e.g. Dropped negative sign when distributing -3(2x - 4)..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="error-formula-input" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Key Formula / Solution Rule to Remember
                </label>
                <span className="text-[11px] text-slate-400">Optional</span>
              </div>
              <input
                id="error-formula-input"
                type="text"
                value={solutionOrFormula}
                onChange={(e) => setSolutionOrFormula(e.target.value)}
                placeholder="e.g. Always check denominator != 0, remember a^m / a^n = a^(m-n)"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                id="view-error-log-btn"
                onClick={() => {
                  closeAddErrorModal();
                  setCurrentScreen('errors');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <AppArtwork name="book" inline className="w-3.5 h-3.5" />
                Go to Full Error Log
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  id="cancel-add-error-btn"
                  onClick={closeAddErrorModal}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-add-error-btn"
                  disabled={!description.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Mistake to Bank
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
