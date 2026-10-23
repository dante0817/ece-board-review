import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, ChatModelType, ChatRolePreset } from '../types';
import { CHAT_ROLES } from '../data/chatRoles';

const STORAGE_KEY = 'ece_board_chat_history_v2';
const ACTIVE_ROLE_KEY = 'ece_board_chat_active_role_v2';
const ACTIVE_MODEL_KEY = 'ece_board_chat_active_model_v2';

export function useGeminiChat(initialPrompt?: string | null, initialRoleId?: string | null) {
  // Roles
  const [selectedRole, setSelectedRole] = useState<ChatRolePreset>(() => {
    if (initialRoleId) {
      const found = CHAT_ROLES.find((r) => r.id === initialRoleId);
      if (found) return found;
    }
    const savedRoleId = localStorage.getItem(ACTIVE_ROLE_KEY);
    const matched = CHAT_ROLES.find((r) => r.id === savedRoleId);
    return matched || CHAT_ROLES[1]; // default to General Tutor (gemini-3.5-flash)
  });

  // Selected Model (defaults to the role's recommended model, but can be manually overridden)
  const [selectedModel, setSelectedModel] = useState<ChatModelType>(() => {
    const savedModel = localStorage.getItem(ACTIVE_MODEL_KEY) as ChatModelType;
    if (savedModel && ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'].includes(savedModel)) {
      return savedModel;
    }
    return selectedRole.recommendedModel;
  });

  // Custom System Instruction override (editable by user)
  const [systemInstruction, setSystemInstruction] = useState<string>(selectedRole.systemInstruction);

  // When role changes, update system instruction and default model
  const changeRole = useCallback((role: ChatRolePreset) => {
    setSelectedRole(role);
    setSelectedModel(role.recommendedModel);
    setSystemInstruction(role.systemInstruction);
    localStorage.setItem(ACTIVE_ROLE_KEY, role.id);
    localStorage.setItem(ACTIVE_MODEL_KEY, role.recommendedModel);
  }, []);

  // When model changes independently
  const changeModel = useCallback((model: ChatModelType) => {
    setSelectedModel(model);
    localStorage.setItem(ACTIVE_MODEL_KEY, model);
  }, []);

  // Conversation history
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }

    // Default welcome message
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        content: `### Welcome to the ECE Board Review AI Tutor! 🎓\n\nI am configured to assist you with the Philippine PRC Electronics & Communications Engineering syllabus across **Mathematics**, **Electronics Engineering**, **EST**, and **GEAS**.\n\nChoose your reviewer persona and target Gemini model above:\n- 🧠 **Gemini 3.1 Pro Preview** — For *complex tasks*, deep mathematical proofs, circuit nodal/mesh derivations, and transmission lines.\n- ⚡ **Gemini 3.5 Flash** — For *general tasks*, concept explanations, syllabus coverage, and active recall checks.\n- 🚀 **Gemini 3.1 Flash Lite** — For *fast tasks*, rapid formula lookups, speed drills, and calculator shortcuts.\n\nAsk a question or select one of the suggested board exam questions below to begin!`,
        timestamp: Date.now(),
        model: 'gemini-3.5-flash',
        roleTitle: 'Comprehensive ECE Review Mentor',
      },
    ];
  });

  // Save conversation history to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Send message
  const sendMessage = useCallback(
    async (userInput: string) => {
      const text = userInput.trim();
      if (!text || isStreaming) return;

      setError(null);

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      const currentHistory = [...messages, userMsg];
      setMessages(currentHistory);
      setIsStreaming(true);

      const botMsgId = `model-${Date.now()}`;
      const placeholderBotMsg: ChatMessage = {
        id: botMsgId,
        role: 'model',
        content: '',
        timestamp: Date.now(),
        model: selectedModel,
        roleTitle: selectedRole.name,
      };

      // Append empty bot message to stream into
      setMessages([...currentHistory, placeholderBotMsg]);

      try {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Prepare history payload for API (role must be 'user' or 'model')
        const historyPayload = currentHistory.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: historyPayload,
            model: selectedModel,
            systemInstruction: systemInstruction,
            stream: true,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }

        // Read SSE stream
        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body stream is not readable.');

        const decoder = new TextDecoder();
        let accumulatedText = '';
        let isFallback = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.replace('data: ', '').trim();
              if (dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  if (parsed.isFallback) isFallback = true;

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMsgId
                        ? {
                            ...msg,
                            content: accumulatedText,
                            isFallback,
                            model: parsed.model || selectedModel,
                          }
                        : msg
                    )
                  );
                }
              } catch (parseErr) {
                // If single json failed to parse, ignore partial buffer
              }
            }
          }
        }

        // If no text was accumulated, show default note
        if (!accumulatedText.trim()) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMsgId
                ? {
                    ...msg,
                    content: 'No response received from model. Please verify your GEMINI_API_KEY or connection.',
                    isError: true,
                  }
                : msg
            )
          );
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User aborted
          return;
        }
        console.error('Chat error:', err);
        setError(err.message || 'Failed to communicate with Gemini API.');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  content: `⚠️ **Error communicating with Gemini (${selectedModel})**: ${err.message || 'Network error'}\n\nPlease verify your API key or network connection in Settings > Secrets.`,
                  isError: true,
                }
              : msg
          )
        );
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming, messages, selectedModel, selectedRole, systemInstruction]
  );

  // Stop streaming
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  // Clear conversation history
  const clearHistory = useCallback(() => {
    stopGeneration();
    const newWelcome: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'model',
      content: `### New Conversation Started 🔄\n\nReady for your ECE Board exam review session! Ask any question, derivation, or problem from Mathematics, Electronics, EST, or GEAS.`,
      timestamp: Date.now(),
      model: selectedModel,
      roleTitle: selectedRole.name,
    };
    setMessages([newWelcome]);
    localStorage.removeItem(STORAGE_KEY);
    setError(null);
  }, [selectedModel, selectedRole, stopGeneration]);

  return {
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
  };
}
