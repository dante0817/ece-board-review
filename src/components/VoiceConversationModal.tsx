import { AppArtwork } from './common/AppArtwork';
import React, { useState, useEffect, useRef } from 'react';
import { X, MicOff, PhoneCall, PhoneOff, Volume2, Send, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { useLiveVoice, AVAILABLE_VOICES } from '../hooks/useLiveVoice';

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string | null;
}

const TOPIC_PRESETS = [
  'Comprehensive ECE Board Review',
  'Rational Expressions & Algebraic Traps',
  'Differential & Integral Calculus',
  'Differential Equations & Laplace Transforms',
  'Semiconductor Physics & BJT/FET Biasing',
  'Operational Amplifiers & Feedback Circuits',
  'Communications Systems & Transmission Lines',
  'Antennas & Wave Propagation',
  'GEAS: Engineering Mechanics & Thermodynamics',
  'Philippine ECE Laws & RA 9292 Ethics',
];

const SUGGESTED_PROMPTS = [
  'Quiz me on 3 quick high-yield board questions.',
  'What are the common traps when simplifying rational expressions?',
  'Test my recall on BJT Alpha and Beta relationships.',
  'Walk me through finding the domain restrictions of an algebraic fraction.',
  'Explain Shannon-Hartley channel capacity theorem in 2 sentences.',
];

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
}) => {
  const {
    status,
    isMuted,
    selectedVoice,
    setSelectedVoice,
    selectedTopic,
    setSelectedTopic,
    transcripts,
    errorMessage,
    inputVolume,
    outputVolume,
    hasGeminiKey,
    startSession,
    endSession,
    toggleMute,
    sendTextMessage,
    interrupt,
  } = useLiveVoice({
    defaultTopic: initialTopic || 'Rational Expressions & Algebraic Traps',
    defaultVoice: 'Zephyr',
  });

  const [textInput, setTextInput] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Sync initial topic when modal opens
  useEffect(() => {
    if (initialTopic && isOpen) {
      setSelectedTopic(initialTopic);
    }
  }, [initialTopic, isOpen, setSelectedTopic]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Auto-cleanup if modal closes
  const handleClose = () => {
    if (status !== 'idle') {
      endSession();
    }
    onClose();
  };

  const handleStartCall = () => {
    startSession({
      voice: selectedVoice,
      topic: selectedTopic,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    sendTextMessage(textInput);
    setTextInput('');
  };

  const handleCopyTranscript = () => {
    if (transcripts.length === 0) return;
    const text = transcripts
      .map(
        (t) =>
          `[${t.sender === 'user' ? 'Student' : 'TopNotch AI'}] ${t.text}`
      )
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  if (!isOpen) return null;

  const isLive = status === 'connected' || status === 'listening' || status === 'speaking';

  return (
    <div
      id="voice-conversation-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="voice-conversation-modal"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
      >
        {/* Header Bar */}
        <div className="bg-[#0B192C] text-white px-5 py-4 flex items-center justify-between border-b border-[#1A2E4C] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 app-artwork-tile">
              <AppArtwork name="antenna" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white tracking-wide">
                  TopNotch Live Voice Partner
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono">
                  gemini-3.1-flash-live-preview
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Real-time 2-way voice oral reviewer for ECE Board Exam prep
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="voice-modal-close-btn"
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Close Voice Reviewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status and Configuration Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Status:</span>
            {status === 'idle' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Ready to Start
              </span>
            )}
            {status === 'connecting' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Connecting to Live API...
              </span>
            )}
            {status === 'listening' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                {isMuted ? 'Muted' : 'Listening for your voice'}
              </span>
            )}
            {status === 'speaking' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                <Volume2 className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                Gemini Speaking (24kHz)
              </span>
            )}
            {status === 'error' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Connection Notice
              </span>
            )}
          </div>

          {/* Quick Voice Selector */}
          <div className="flex items-center gap-2">
            <button
              id="voice-settings-toggle-btn"
              type="button"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <span>Voice: <strong>{selectedVoice}</strong></span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showVoiceSettings ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Collapsible Voice Settings */}
        {showVoiceSettings && (
          <div className="bg-slate-100 border-b border-slate-200 p-4 shrink-0 animate-in slide-in-from-top-2 duration-150">
            <div className="text-xs font-semibold text-slate-700 mb-2">Select Gemini Live Persona:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {AVAILABLE_VOICES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedVoice(v.id);
                    setShowVoiceSettings(false);
                  }}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    selectedVoice === v.id
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{v.name}</span>
                    {selectedVoice === v.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{v.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Topic Selector Row */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0 bg-white">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Topic:</span>
          <select
            id="voice-topic-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            disabled={isLive}
            className="bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 outline-hidden transition-colors"
          >
            {TOPIC_PRESETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {isLive && (
            <span className="text-[11px] text-slate-400 italic">
              (End session to switch syllabus topic)
            </span>
          )}
        </div>

        {/* Error / Alert banner */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-semibold">Notice: </span>
              {errorMessage}
              {!hasGeminiKey && (
                <div className="mt-1 text-[11px] text-rose-700">
                  Configure your API key in Settings &gt; Secrets to use live voice calls with Gemini Live.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Body: Interactive Voice Stage & Live Transcript */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 min-h-[220px]">
          {/* Active Audio Waveform & Visualizer Stage */}
          <div className="bg-radial from-slate-900 via-[#0B192C] to-[#06101E] rounded-2xl p-6 text-white flex flex-col items-center justify-center relative overflow-hidden shadow-inner border border-slate-800 min-h-[160px]">
            {/* Ambient Background Wave effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
              <div
                className="w-64 h-64 rounded-full bg-blue-500 blur-3xl transition-transform duration-300"
                style={{
                  transform: `scale(${1 + (status === 'speaking' ? outputVolume * 1.8 : inputVolume * 1.5)})`,
                }}
              />
            </div>

            {/* Visualizer Center Orb */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150 shadow-lg ${
                  status === 'speaking'
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 ring-8 ring-blue-500/30'
                    : status === 'listening'
                    ? isMuted
                      ? 'bg-slate-700 ring-4 ring-slate-600/40'
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-600 ring-8 ring-emerald-500/30'
                    : status === 'connecting'
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-slate-800 border border-slate-700 text-slate-400'
                }`}
                style={{
                  transform: `scale(${
                    status === 'speaking'
                      ? 1 + outputVolume * 0.4
                      : status === 'listening' && !isMuted
                      ? 1 + inputVolume * 0.35
                      : 1
                  })`,
                }}
              >
                {status === 'speaking' ? (
                  <Volume2 className="w-8 h-8 text-white" />
                ) : isMuted ? (
                  <MicOff className="w-8 h-8 text-slate-300" />
                ) : isLive ? (
                  <AppArtwork name="microphone" inline className="w-8 h-8 text-white" />
                ) : (
                  <AppArtwork name="star" inline className="w-8 h-8 text-slate-400" />
                )}
              </div>

              {/* Dynamic waveform bars */}
              <div className="flex items-center gap-1.5 mt-4 h-6">
                {[4, 8, 14, 20, 12, 18, 22, 16, 10, 6].map((baseHeight, i) => {
                  const factor =
                    status === 'speaking'
                      ? Math.max(0.2, outputVolume * 2)
                      : status === 'listening' && !isMuted
                      ? Math.max(0.2, inputVolume * 2)
                      : 0.2;
                  const currentHeight = Math.max(4, Math.min(26, baseHeight * factor));
                  return (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-75 ${
                        status === 'speaking'
                          ? 'bg-cyan-400'
                          : status === 'listening' && !isMuted
                          ? 'bg-emerald-400'
                          : 'bg-slate-700'
                      }`}
                      style={{ height: `${currentHeight}px` }}
                    />
                  );
                })}
              </div>

              <div className="text-xs font-medium text-slate-300 mt-2">
                {status === 'speaking' && 'Gemini Live is speaking...'}
                {status === 'listening' && (isMuted ? 'Microphone is muted' : 'Speak clearly into your microphone')}
                {status === 'connecting' && 'Opening bidirectional audio stream...'}
                {status === 'idle' && 'Click "Start Voice Call" to begin oral review'}
                {status === 'error' && 'Session halted. Review notice above.'}
              </div>
            </div>
          </div>

          {/* Quick Prompts Pills (when connected) */}
          {isLive && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Oral Review Quick Prompts
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendTextMessage(prompt)}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 text-xs transition-colors text-left"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Real-time Transcription Log */}
          <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col min-h-[140px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <AppArtwork name="chat" inline className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-xs text-slate-800">
                  Live Spoken Transcript
                </span>
                <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {transcripts.length} exchanges
                </span>
              </div>
              {transcripts.length > 0 && (
                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  className="text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1 font-medium px-2 py-0.5 rounded hover:bg-white transition-colors"
                >
                  {copiedTranscript ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <AppArtwork name="cards" inline className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {transcripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <AppArtwork name="microphone" inline className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
                  <p className="font-medium text-slate-600">No voice turns yet</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mt-1">
                    Once connected, your speech and Gemini's voice responses will be transcribed here in real-time.
                  </p>
                </div>
              ) : (
                transcripts.map((turn) => (
                  <div
                    key={turn.id}
                    className={`flex flex-col ${
                      turn.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {turn.sender === 'user' ? 'You' : `TopNotch AI (${selectedVoice})`}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {turn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 leading-relaxed text-xs shadow-xs ${
                        turn.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {turn.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        </div>

        {/* Footer / Control Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Fallback Text Input (can be used alongside voice) */}
          <form
            onSubmit={handleSendMessage}
            className="w-full sm:w-auto flex-1 flex items-center gap-2"
          >
            <input
              id="voice-chat-text-input"
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={isLive ? 'Type a question or formula if not speaking...' : 'Connect to speak or type...'}
              disabled={!isLive}
              className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all disabled:bg-slate-100 disabled:text-slate-400"
            />
            <button
              id="voice-chat-send-btn"
              type="submit"
              disabled={!isLive || !textInput.trim()}
              className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-semibold flex items-center justify-center transition-colors shrink-0"
              title="Send text prompt"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Voice Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isLive ? (
              <>
                {/* Mute Button */}
                <button
                  id="voice-mute-toggle-btn"
                  type="button"
                  onClick={toggleMute}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-colors ${
                    isMuted
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <AppArtwork name="microphone" inline className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                {/* Interrupt speech button */}
                {status === 'speaking' && (
                  <button
                    id="voice-interrupt-btn"
                    type="button"
                    onClick={interrupt}
                    className="px-3 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Interrupt model playback"
                  >
                    <Volume2 className="w-4 h-4 text-slate-600" />
                    <span>Interrupt</span>
                  </button>
                )}

                {/* End Call Button */}
                <button
                  id="voice-end-call-btn"
                  type="button"
                  onClick={endSession}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>End Call</span>
                </button>
              </>
            ) : (
              /* Start Live Voice Call */
              <button
                id="voice-start-call-btn"
                type="button"
                onClick={handleStartCall}
                disabled={status === 'connecting'}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start Voice Call</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
