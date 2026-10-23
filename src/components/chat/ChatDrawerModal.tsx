import { AppArtwork } from '../common/AppArtwork';
import React from 'react';
import { ChatbotScreen } from './ChatbotScreen';
import { X, Maximize2 } from 'lucide-react';
import { useReview } from '../../context/ReviewContext';
import {strictAssessmentLocked} from '../../domain/assessment/assessmentAccess';

interface ChatDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string | null;
  initialRole?: string | null;
}

export const ChatDrawerModal: React.FC<ChatDrawerModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  initialRole,
}) => {
  const { setCurrentScreen, assessmentSession } = useReview();

  if (!isOpen || strictAssessmentLocked(assessmentSession)) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Controls Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center app-artwork-tile">
              <AppArtwork name="star" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Gemini Study Assistant</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                setCurrentScreen('chat');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Expand to Full Screen View"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Embedded Chat Screen */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatbotScreen
            isEmbedded
            onClose={onClose}
            initialPrompt={initialPrompt}
            initialRole={initialRole}
          />
        </div>
      </div>
    </div>
  );
};
