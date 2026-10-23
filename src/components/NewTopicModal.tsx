import { AppArtwork } from './common/AppArtwork';
import React, { useState } from 'react';
import { useReview } from '../context/ReviewContext';
import { X, Plus } from 'lucide-react';

interface NewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (name: string) => void;
}

export const NewTopicModal: React.FC<NewTopicModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [topicName, setTopicName] = useState('');
  const [importance, setImportance] = useState<'High' | 'Normal'>('High');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicName.trim()) return;
    if (onCreated) onCreated(topicName.trim());
    setTopicName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AppArtwork name="book" inline className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Add New Algebra Topic</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Topic Name</label>
            <input
              type="text"
              required
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              placeholder="e.g., Matrix Inverses & Determinants"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Board Exam Relevance</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImportance('High')}
                className={`py-2 rounded-xl font-semibold transition-colors ${
                  importance === 'High'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                High Priority (Core)
              </button>
              <button
                type="button"
                onClick={() => setImportance('Normal')}
                className={`py-2 rounded-xl font-semibold transition-colors ${
                  importance === 'Normal'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Standard Priority
              </button>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Topic</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
