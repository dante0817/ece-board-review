import { AppArtwork } from '../common/AppArtwork';
import React, { useState } from 'react';
import { ChatMessage } from '../../types';
import { MODEL_META } from '../../data/chatRoles';
import { ChatFormattedText } from './ChatFormattedText';
import { User, Check, AlertCircle } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const modelMeta = message.model ? MODEL_META[message.model] : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(message.timestamp));

  if (isUser) {
    return (
      <div className="flex justify-end gap-2.5 my-3 pl-8">
        <div className="flex flex-col items-end max-w-2xl">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400 font-medium">
            <span>You</span>
            <span>•</span>
            <span>{formattedTime}</span>
          </div>
          <div className="px-4 py-2.5 rounded-2xl rounded-tr-xs bg-blue-600 text-white shadow-xs text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-4 border border-blue-200 shadow-xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3 my-4 pr-4 sm:pr-8">
      {/* Bot Icon */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs ring-1 ring-blue-400/30">
        {message.model === 'gemini-3.1-pro-preview' ? (
          <AppArtwork name="chip" inline className="w-4 h-4 text-purple-200" />
        ) : message.model === 'gemini-3.1-flash-lite' ? (
          <AppArtwork name="lightning" inline className="w-4 h-4 text-emerald-200" />
        ) : (
          <AppArtwork name="star" inline className="w-4 h-4 text-blue-200" />
        )}
      </div>

      {/* Content Container */}
      <div className="flex-1 max-w-3xl min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs text-slate-900">TopNotch AI</span>
            {modelMeta && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold text-white bg-gradient-to-r ${modelMeta.color} shadow-2xs`}>
                {modelMeta.name}
              </span>
            )}
            {modelMeta && (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {modelMeta.taskType}
              </span>
            )}
            {message.roleTitle && (
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                ({message.roleTitle})
              </span>
            )}
            <span className="text-[10px] text-slate-400">• {formattedTime}</span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors"
            title="Copy response"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 text-[10px] font-medium">Copied</span>
              </>
            ) : (
              <>
                <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
                <span className="text-[10px]">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Message Bubble */}
        <div className={`p-4 rounded-2xl rounded-tl-xs bg-white border ${message.isError ? 'border-red-200 bg-red-50/40' : 'border-slate-200/80'} shadow-xs text-slate-800`}>
          {message.isFallback && (
            <div className="flex items-center gap-1.5 mb-2.5 pb-2 border-b border-amber-200 text-amber-800 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>Syllabus Knowledge Base (Add GEMINI_API_KEY in Settings for live model generation)</span>
            </div>
          )}

          <ChatFormattedText content={message.content} />
        </div>
      </div>
    </div>
  );
};
