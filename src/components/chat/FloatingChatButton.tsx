import { AppArtwork } from '../common/AppArtwork';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronUp, ChevronDown, X, Play, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useReview, ScreenType } from '../../context/ReviewContext';
import { Topic, ChatMessage } from '../../types';
import { getRecentTopicIds, RECENT_TOPICS_EVENT } from '../../utils/recentTopics';

const CHAT_STORAGE_KEY = 'ece_board_chat_history_v2';

export const FloatingChatButton: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    openChat,
    openTopicDrawer,
    activeSession,
    activeSessionSeconds,
    setIsSessionModalMinimized,
    allTopics,
    priorityReviewTopic,
    allDueOrOverdueTopics,
  } = useReview();

  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [recentTopicIds, setRecentTopicIds] = useState<string[]>(() => getRecentTopicIds());
  const [lastChatMessage, setLastChatMessage] = useState<ChatMessage | null>(null);

  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync recent topic IDs on storage events
  useEffect(() => {
    const handleUpdate = () => {
      setRecentTopicIds(getRecentTopicIds());
    };
    window.addEventListener(RECENT_TOPICS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(RECENT_TOPICS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Check for the most recent chat query
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) {
        const parsed: ChatMessage[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const userMsgs = parsed.filter((m) => m.role === 'user');
          if (userMsgs.length > 0) {
            setLastChatMessage(userMsgs[userMsgs.length - 1]);
            return;
          }
        }
      }
    } catch {
      // ignore
    }
    setLastChatMessage(null);
  }, [isHovered, isPinned]);

  // Click outside to close pinned popover
  useEffect(() => {
    if (!isPinned) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsPinned(false);
        setIsHovered(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPinned(false);
        setIsHovered(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPinned]);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 220);
  };

  const isMenuVisible = isHovered || isPinned;

  // Resolve topics list for the quick-access menu
  const recentTopicsList = useMemo(() => {
    const topicMap = new Map<string, Topic>();
    allTopics.forEach((t) => topicMap.set(t.id, t));

    const result: Topic[] = [];

    // 1. Current active session topic if present
    if (activeSession?.topic && topicMap.has(activeSession.topic.id)) {
      result.push(topicMap.get(activeSession.topic.id)!);
    }

    // 2. Add from recent stored IDs
    recentTopicIds.forEach((id) => {
      const t = topicMap.get(id);
      if (t && !result.some((r) => r.id === t.id)) {
        result.push(t);
      }
    });

    // 3. Priority review topic
    if (priorityReviewTopic && !result.some((r) => r.id === priorityReviewTopic.id)) {
      result.push(priorityReviewTopic);
    }

    // 4. Overdue or due topics
    allDueOrOverdueTopics.forEach((t) => {
      if (!result.some((r) => r.id === t.id)) {
        result.push(t);
      }
    });

    // Limit to top 5 topics
    return result.slice(0, 5);
  }, [allTopics, recentTopicIds, activeSession, priorityReviewTopic, allDueOrOverdueTopics]);

  // Jump handler for opening topic in active screen or topic drawer
  const handleJumpToTopic = (topic: Topic) => {
    setIsPinned(false);
    setIsHovered(false);

    // If topic corresponds to a dedicated interactive screen
    if (topic.id === 'top-alg-fractions' || topic.name.toLowerCase().includes('rational')) {
      setCurrentScreen('rational-expressions');
    } else if (topic.id === 'top-linear-eq' || topic.name.toLowerCase().includes('linear equations')) {
      setCurrentScreen('linear-equations');
    } else {
      openTopicDrawer(topic);
    }
  };

  // Jump handler for opening AI Chat for a specific topic
  const handleAskTutorAboutTopic = (topic: Topic, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned(false);
    setIsHovered(false);

    const prompt = `Let's review the ECE Board exam topic "${topic.name}". Can you summarize the core formulas, high-frequency problem archetypes, and common examiner traps?`;
    openChat(prompt, 'algebra-expert');
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Don't render floating trigger if already on the full chat page
  if (currentScreen === 'chat') {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end"
    >
      {/* Quick Access Popover Menu */}
      {isMenuVisible && (
        <div
          role="menu"
          aria-label="Recent Topics and Review Threads"
          className="mb-3 w-80 sm:w-96 max-h-[82vh] flex flex-col bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Popover Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-b border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30 shrink-0 app-artwork-tile">
                  <AppArtwork name="star" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                    <span>Recent Topics & Threads</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-200 border border-blue-400/20">
                      Quick Access
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Jump directly back into active review threads
                  </p>
                </div>
              </div>

              {/* Pin / Close Toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsPinned(false);
                  setIsHovered(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Close popover menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Popover Body Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[60vh] bg-slate-50/50">
            {/* Active Practice Session (If ongoing) */}
            {activeSession && (
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200/90 shadow-2xs">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Active Review Session</span>
                  </div>
                  <span className="font-mono bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded text-[10px]">
                    ⏱ {formatTimer(activeSessionSeconds)}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-slate-900 truncate">
                  {activeSession.topic.name}
                </h5>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Mode: {activeSession.activityType}
                </p>

                <div className="mt-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSessionModalMinimized(false);
                      setIsPinned(false);
                      setIsHovered(false);
                    }}
                    className="flex-1 py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Resume Session</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleAskTutorAboutTopic(activeSession.topic, e)}
                    className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-emerald-200 font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    title="Ask AI Tutor about this ongoing session"
                  >
                    <AppArtwork name="chat" inline className="w-3 h-3 text-emerald-600" />
                    <span>Ask Tutor</span>
                  </button>
                </div>
              </div>
            )}

            {/* Last AI Chat Discussion (If user has an active chat history) */}
            {lastChatMessage && (
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 mb-1">
                  <div className="flex items-center gap-1">
                    <AppArtwork name="chat" inline className="w-3 h-3 text-blue-600" />
                    <span>Recent Chat Thread</span>
                  </div>
                  <span className="text-slate-400">
                    {new Date(lastChatMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-800 line-clamp-2 italic">
                  &ldquo;{lastChatMessage.content}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsPinned(false);
                    setIsHovered(false);
                    openChat();
                  }}
                  className="mt-2 text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Continue conversation</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Recent Topics List */}
            <div className="space-y-1.5">
              <div className="px-1 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <AppArtwork name="cards" inline className="w-3 h-3 text-slate-400" />
                  <span>Active Topics & Labs</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {recentTopicsList.length} review threads
                </span>
              </div>

              {recentTopicsList.map((topic) => {
                const isDue =
                  allDueOrOverdueTopics.some((d) => d.id === topic.id) ||
                  priorityReviewTopic?.id === topic.id;
                const isInteractive =
                  topic.id === 'top-alg-fractions' || topic.id === 'top-linear-eq';

                return (
                  <div
                    key={topic.id}
                    onClick={() => handleJumpToTopic(topic)}
                    className="p-2.5 rounded-xl bg-white hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 transition-all duration-150 group/item cursor-pointer shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/60 uppercase">
                          {topic.groupId.replace('grp-', '')}
                        </span>

                        {isInteractive && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                            Interactive Lab
                          </span>
                        )}

                        {isDue && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-0.5">
                            <AppArtwork name="timer" inline className="w-2.5 h-2.5" />
                            Due Today
                          </span>
                        )}
                      </div>

                      <h5 className="font-bold text-xs text-slate-800 group-hover/item:text-blue-700 truncate">
                        {topic.name}
                      </h5>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        {topic.mastery ? (
                          <span className="flex items-center gap-0.5 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Level {topic.mastery} ({topic.latestScore || 85}%)
                          </span>
                        ) : (
                          <span className="text-amber-700 flex items-center gap-0.5 font-medium">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Needs Review
                          </span>
                        )}
                        {topic.reviewCount > 0 && (
                          <span>• {topic.reviewCount} reviews</span>
                        )}
                      </div>
                    </div>

                    {/* Action Icon: Ask AI Tutor about this topic */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleAskTutorAboutTopic(topic, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100/70 transition-colors cursor-pointer"
                        title={`Ask AI Tutor to quiz or review "${topic.name}"`}
                      >
                        <AppArtwork name="chat" inline className="w-4 h-4" />
                      </button>
                      <div className="text-slate-300 group-hover/item:text-blue-600 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Popover Footer Bar */}
          <div className="p-2.5 sm:p-3 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setIsPinned(false);
                setIsHovered(false);
                setCurrentScreen('queue');
              }}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Full Review Queue ({allDueOrOverdueTopics.length} due) →
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPinned(false);
                setIsHovered(false);
                openChat();
              }}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <AppArtwork name="chat" inline className="w-3 h-3" />
              <span>Open AI Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Gemini Chat Trigger Button with Split / Pill Hover State */}
      <div
        id="floating-gemini-chat-btn"
        className="flex items-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-xs shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 overflow-hidden"
      >
        {/* Main Chat Action Button */}
        <button
          type="button"
          onClick={() => {
            setIsPinned(false);
            setIsHovered(false);
            openChat();
          }}
          className="flex items-center gap-2 pl-3.5 pr-2.5 py-2.5 cursor-pointer hover:bg-white/10 transition-colors group"
          title="Ask Gemini AI Tutor (Multi-turn Chat)"
        >
          <div className="relative">
            <AppArtwork name="chat" inline className="w-4 h-4" />
            <AppArtwork name="star" inline className="w-2.5 h-2.5 text-blue-200 absolute -top-1 -right-1 group-hover:animate-spin" />
          </div>
          <span className="font-bold tracking-tight">AI Tutor Chat</span>
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-5 bg-white/25" />

        {/* Quick Access Popover Toggle Button */}
        <button
          type="button"
          onClick={() => {
            setIsPinned((prev) => !prev);
          }}
          className={`flex items-center gap-1 pl-2 pr-3 py-2.5 cursor-pointer hover:bg-white/10 transition-colors ${
            isMenuVisible ? 'bg-white/15' : ''
          }`}
          title="Toggle Recent Topics & Active Review Threads"
          aria-expanded={isMenuVisible}
          aria-haspopup="menu"
        >
          {activeSession ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-300/40" />
          ) : (
            <AppArtwork name="timer" inline className="w-3.5 h-3.5 text-blue-200" />
          )}
          <span className="text-[11px] font-bold text-blue-100 hidden sm:inline">Recent</span>
          {isMenuVisible ? (
            <ChevronDown className="w-3.5 h-3.5 text-white/80" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-white/80" />
          )}
        </button>
      </div>
    </div>
  );
};

export default FloatingChatButton;
