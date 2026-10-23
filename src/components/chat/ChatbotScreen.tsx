import { AppArtwork } from '../common/AppArtwork';
import { FeatureIcon } from '../common/FeatureIcon';
import React, { useState, useRef, useEffect } from 'react';
import { useExclusiveDropdown } from '../../hooks/useExclusiveDropdown';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import { useReview } from '../../context/ReviewContext';
import {strictAssessmentLocked} from '../../domain/assessment/assessmentAccess';
import { CHAT_ROLES, MODEL_META } from '../../data/chatRoles';
import { ChatModelType } from '../../types';
import { ChatMessageItem } from './ChatMessageItem';
import { Send, Square, Trash2, SlidersHorizontal, ChevronDown, AlertTriangle, X } from 'lucide-react';

interface ChatbotScreenProps {
  initialPrompt?: string | null;
  initialRole?: string | null;
  isEmbedded?: boolean;
  onClose?: () => void;
}

export const ChatbotScreen: React.FC<ChatbotScreenProps> = ({
  initialPrompt,
  initialRole,
  isEmbedded = false,
  onClose,
}) => {
  const {
    messages,
    selectedRole,
    changeRole,
    selectedModel,
    changeModel,
    systemInstruction,
    setSystemInstruction,
    isStreaming,
    error,
    sendMessage,
    stopGeneration,
    clearHistory,
  } = useGeminiChat(initialPrompt, initialRole);

  const { setIsSettingsOpen, assessmentSession } = useReview();

  const [inputPrompt, setInputPrompt] = useState('');
  const [showRoleConfig, setShowRoleConfig] = useState(false);
  const [editedInstruction, setEditedInstruction] = useState(systemInstruction);
  const [showModelDropdown, setShowModelDropdown] = useExclusiveDropdown();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages or streaming chunks
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  // Also scroll when streaming updates
  useEffect(() => {
    if (isStreaming) {
      scrollToBottom(false);
    }
  }, [messages[messages.length - 1]?.content, isStreaming]);

  // If initialPrompt was provided, send or prefill
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInputPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Keep editedInstruction in sync if role changes
  useEffect(() => {
    setEditedInstruction(systemInstruction);
  }, [systemInstruction]);

  // Close confirmation modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showClearConfirm) {
        setShowClearConfirm(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showClearConfirm]);

  const handleSend = () => {
    if (!inputPrompt.trim() || isStreaming) return;
    const toSend = inputPrompt;
    setInputPrompt('');
    sendMessage(toSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const applyCustomInstruction = () => {
    setSystemInstruction(editedInstruction);
    setShowRoleConfig(false);
  };

  const currentModelMeta = MODEL_META[selectedModel];
  if(strictAssessmentLocked(assessmentSession)) return <div role="alert" className="p-5 rounded-lg bg-amber-50 text-amber-950">AI Tutor is unavailable until the strict assessment is submitted or ended. In-app answer guidance remains locked.</div>;

  return (
    <div className={`flex flex-col h-full bg-[#f8fafc] text-slate-900 ${isEmbedded ? '' : 'min-h-[calc(100vh-4rem)]'}`}>
      <p role="note" className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-950">AI-generated calculator advice is not physical Canon F-789SGA verification. Confirm key sequences with the manufacturer manual and the device; test roots, domain and units.</p>
      {/* Top Bar: Title, Role Switcher, Model Selector, Controls */}
      <header className="px-4 py-3 bg-white border-b border-slate-200/80 shrink-0 shadow-2xs">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Chatbot Identity & Role selector */}
          <div className="flex items-center gap-3">
            <FeatureIcon name="tutor" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">ECE Board AI Tutor</h1>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Multi-Turn
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                Role-specialized tutoring with Gemini 3.1 Pro, 3.5 Flash & 3.1 Flash Lite
              </p>
            </div>
          </div>

          {/* Right: Role selection pills, Model selector, and Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Roles tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
              {CHAT_ROLES.map((role) => {
                const isActive = selectedRole.id === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => changeRole(role)}
                    className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs ${
                      isActive
                        ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                    title={`${role.name}: ${role.description}`}
                  >
                    {role.taskCategory === 'complex' && <AppArtwork name="chip" inline className="w-3.5 h-3.5 text-purple-600" />}
                    {role.taskCategory === 'general' && <AppArtwork name="star" inline className="w-3.5 h-3.5 text-blue-600" />}
                    {role.taskCategory === 'fast' && <AppArtwork name="lightning" inline className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{role.badgeLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-2xs cursor-pointer transition-colors"
                title="Select Gemini Model"
              >
                <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentModelMeta.color}`} />
                <span className="font-semibold text-slate-800">{currentModelMeta.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showModelDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowModelDropdown(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-30 space-y-1">
                    <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Target Gemini Model
                    </div>
                    {(Object.keys(MODEL_META) as ChatModelType[]).map((mKey) => {
                      const meta = MODEL_META[mKey];
                      const isSelected = selectedModel === mKey;
                      return (
                        <button
                          key={mKey}
                          type="button"
                          onClick={() => {
                            changeModel(mKey);
                            setShowModelDropdown(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg transition-colors flex flex-col gap-0.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 border border-blue-200/80'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-slate-900">{meta.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white bg-gradient-to-r ${meta.color}`}>
                              {meta.taskType}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 leading-tight">
                            {meta.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* System Instruction / Role Config Button */}
            <button
              type="button"
              onClick={() => setShowRoleConfig(!showRoleConfig)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition-colors"
              title="View or Customize Chatbot System Instruction"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Clear Conversation button */}
            <button
              type="button"
              id="btn-clear-conversation"
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-700 hover:text-rose-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
              title="Clear conversation and reset context for a new topic"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
              <span className="hidden sm:inline">Clear Conversation</span>
              <span className="sm:hidden">Clear</span>
            </button>

            {isEmbedded && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Role Description Banner */}
        <div className="max-w-5xl mx-auto mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700">Active Role:</span>
            <span className="text-slate-900 font-medium">{selectedRole.name}</span>
            <span className="text-slate-400 hidden sm:inline">— {selectedRole.description}</span>
          </div>
          <div className="flex items-center gap-3">
            {messages.length > 2 && (
              <button
                type="button"
                id="btn-clear-context-banner"
                onClick={() => setShowClearConfirm(true)}
                className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                title="Reset context for a new topic"
              >
                <AppArtwork name="cycle" inline className="w-3 h-3" />
                <span>Reset Context ({messages.length} msgs)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <AppArtwork name="gear" inline className="w-3 h-3" />
              <span>API Key Setup</span>
            </button>
          </div>
        </div>
      </header>

      {/* Optional System Instruction Editor Modal/Drawer */}
      {showRoleConfig && (
        <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 transition-all">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Role System Instruction Configuration
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditedInstruction(selectedRole.systemInstruction)}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
              >
                <AppArtwork name="cycle" inline className="w-3 h-3" />
                Reset to Role Preset
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              This system instruction directs Gemini's tone, mathematical rigor, syllabus focus, and examiner trap awareness for every conversational turn.
            </p>
            <textarea
              value={editedInstruction}
              onChange={(e) => setEditedInstruction(e.target.value)}
              rows={4}
              className="w-full text-xs font-mono p-3 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Enter custom role system instruction..."
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowRoleConfig(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCustomInstruction}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
              >
                Apply System Instruction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Messages Thread (Scrollable) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2 max-w-5xl w-full mx-auto"
      >
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}

        {/* Streaming / Loading Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-3 my-3 text-xs text-slate-500">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 animate-pulse app-artwork-tile">
              <AppArtwork name="star" />
            </div>
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-slate-600 font-medium">
                {currentModelMeta.name} is formulating response...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Topic Starters (visible when conversation is concise) */}
      {messages.length <= 2 && (
        <div className="max-w-5xl w-full mx-auto px-4 pb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
            <AppArtwork name="bulb" inline className="w-3.5 h-3.5 text-amber-500" />
            <span>Suggested High-Yield Prompts for {selectedRole.badgeLabel}:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRole.suggestedPrompts.map((promptText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendMessage(promptText)}
                className="text-left text-xs bg-white hover:bg-blue-50/80 hover:border-blue-300 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
              >
                <span>{promptText}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-slate-200 shrink-0 shadow-sm">
        <div className="max-w-5xl mx-auto">
          {error && (
            <div className="mb-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="underline font-semibold"
              >
                Configure Secrets
              </button>
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-300 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <textarea
              ref={inputRef}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${selectedRole.name} using ${currentModelMeta.name}... (e.g. derive formula, explain trap, check algebra)`}
              rows={2}
              className="flex-1 resize-none bg-transparent border-none text-slate-800 text-sm p-2 focus:outline-none placeholder:text-slate-400 max-h-36 overflow-y-auto"
            />

            <div className="flex items-center gap-1.5 shrink-0 pb-1 pr-1">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors cursor-pointer"
                  title="Stop Generating"
                >
                  <Square className="w-4 h-4 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!inputPrompt.trim()}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white shadow-xs transition-all cursor-pointer"
                  title="Send Message (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span>Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">Shift+Enter</kbd> for newline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>Model: <strong className="text-slate-600 font-semibold">{selectedModel}</strong></span>
            </div>
          </div>
        </div>
      </footer>

      {/* Clear Conversation Confirmation Prompt Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              id="btn-close-clear-dialog"
              onClick={() => setShowClearConfirm(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Icon and Title */}
            <div className="flex items-start gap-3.5 pr-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-2xs">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3
                  id="clear-dialog-title"
                  className="text-base font-bold text-slate-900 tracking-tight"
                >
                  Clear Conversation?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Reset the current session to clear context and start fresh on a new ECE topic.
                </p>
              </div>
            </div>

            {/* Details Box */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Messages in session:</span>
                <span className="font-semibold text-slate-800">
                  {messages.length} message{messages.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Review Persona:</span>
                <span className="font-medium text-slate-800">{selectedRole.name}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-500">Active Model:</span>
                <span className="font-medium text-slate-800">{currentModelMeta.name}</span>
              </div>
            </div>

            <div className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Resetting context clears all previous question constraints, derivations, and board exam notes so the AI will not be biased by prior questions.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                id="btn-cancel-clear-dialog"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-clear-conversation"
                onClick={() => {
                  clearHistory();
                  setInputPrompt('');
                  setShowClearConfirm(false);
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 100);
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Clear Conversation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
