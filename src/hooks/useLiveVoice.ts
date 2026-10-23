import { useState, useRef, useEffect, useCallback } from 'react';

export interface TranscriptMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: Date;
  isInterim?: boolean;
}

export type LiveVoiceStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'speaking'
  | 'interrupted'
  | 'error';

export interface UseLiveVoiceOptions {
  defaultTopic?: string;
  defaultVoice?: string;
}

export const AVAILABLE_VOICES = [
  { id: 'Zephyr', name: 'Zephyr', description: 'Friendly & Conversational (Recommended)' },
  { id: 'Kore', name: 'Kore', description: 'Warm & Academic' },
  { id: 'Puck', name: 'Puck', description: 'Energetic & Crisp' },
  { id: 'Charon', name: 'Charon', description: 'Calm & Deep' },
  { id: 'Fenrir', name: 'Fenrir', description: 'Direct & Authoritative' },
];

export function useLiveVoice(options?: UseLiveVoiceOptions) {
  const [status, setStatus] = useState<LiveVoiceStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(options?.defaultVoice || 'Zephyr');
  const [selectedTopic, setSelectedTopic] = useState(options?.defaultTopic || 'Comprehensive ECE Review');
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputVolume, setInputVolume] = useState<number>(0);
  const [outputVolume, setOutputVolume] = useState<number>(0);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const isMutedRef = useRef(false);
  const currentModelTextIdRef = useRef<string | null>(null);

  // Keep isMutedRef in sync
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Audio utility: convert Float32 (16kHz) to 16-bit PCM little-endian Base64
  const float32ToPcm16Base64 = useCallback((float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }, []);

  // Audio utility: linear resample if input AudioContext is not 16000
  const resampleTo16k = useCallback((input: Float32Array, inputRate: number): Float32Array => {
    if (inputRate === 16000) return input;
    const ratio = inputRate / 16000;
    const newLength = Math.round(input.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const originalIndex = i * ratio;
      const indexFloor = Math.floor(originalIndex);
      const indexCeil = Math.min(input.length - 1, indexFloor + 1);
      const t = originalIndex - indexFloor;
      result[i] = input[indexFloor] * (1 - t) + input[indexCeil] * t;
    }
    return result;
  }, []);

  // Stop all playing model audio (for interruptions)
  const stopAllPlayback = useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // Already ended or stopped
      }
    }
    activeSourcesRef.current = [];
    nextPlayTimeRef.current = 0;
    setOutputVolume(0);
  }, []);

  // Play a base64 PCM chunk from Gemini Live
  const playPcmAudioChunk = useCallback(
    (base64: string) => {
      try {
        const audioCtx = outputAudioCtxRef.current;
        if (!audioCtx) return;

        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);

        let sumSquares = 0;
        for (let i = 0; i < int16Array.length; i++) {
          const val = int16Array[i] / (int16Array[i] < 0 ? 32768 : 32767);
          float32Array[i] = val;
          sumSquares += val * val;
        }

        // Calculate RMS for visualizer
        const rms = Math.sqrt(sumSquares / float32Array.length);
        setOutputVolume(Math.min(1, rms * 4));
        setStatus('speaking');

        const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
        audioBuffer.copyToChannel(float32Array, 0);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);

        const currentTime = audioCtx.currentTime;
        if (nextPlayTimeRef.current < currentTime) {
          nextPlayTimeRef.current = currentTime;
        }

        source.start(nextPlayTimeRef.current);
        nextPlayTimeRef.current += audioBuffer.duration;

        activeSourcesRef.current.push(source);
        source.onended = () => {
          const idx = activeSourcesRef.current.indexOf(source);
          if (idx !== -1) {
            activeSourcesRef.current.splice(idx, 1);
          }
          if (activeSourcesRef.current.length === 0) {
            setOutputVolume(0);
            setStatus('listening');
          }
        };
      } catch (err) {
        console.error('Error playing audio chunk:', err);
      }
    },
    []
  );

  // Close audio contexts & mic
  const cleanupAudio = useCallback(() => {
    stopAllPlayback();

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {}
      scriptProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch {}
      outputAudioCtxRef.current = null;
    }

    setInputVolume(0);
    setOutputVolume(0);
  }, [stopAllPlayback]);

  // End Session
  const endSession = useCallback(() => {
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'stop' }));
          wsRef.current.close();
        }
      } catch {}
      wsRef.current = null;
    }

    cleanupAudio();
    setStatus('idle');
    currentModelTextIdRef.current = null;
  }, [cleanupAudio]);

  // Start Session
  const startSession = useCallback(
    async (startOptions?: {
      voice?: string;
      topic?: string;
      customInstruction?: string;
    }) => {
      endSession();
      setStatus('connecting');
      setErrorMessage(null);

      const targetVoice = startOptions?.voice || selectedVoice;
      const targetTopic = startOptions?.topic || selectedTopic;

      try {
        // 1. Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;

        // 2. Setup Input AudioContext (capture)
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const inputCtx = new AudioContextClass();
        inputAudioCtxRef.current = inputCtx;

        // Setup Output AudioContext (playback at 24kHz)
        const outputCtx = new AudioContextClass({ sampleRate: 24000 });
        outputAudioCtxRef.current = outputCtx;
        nextPlayTimeRef.current = 0;

        // 3. Connect WebSocket to /api/live
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/live`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          // Connected to server, wait for ready_to_start or send start
          ws.send(
            JSON.stringify({
              type: 'start',
              voiceName: targetVoice,
              topicName: targetTopic,
              customInstruction: startOptions?.customInstruction,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'error') {
              if (data.errorType === 'MISSING_API_KEY') {
                setHasGeminiKey(false);
              }
              setErrorMessage(data.message || 'Gemini Live encountered an error');
              setStatus('error');
            } else if (data.type === 'session_active') {
              setStatus('listening');
              setHasGeminiKey(true);
            } else if (data.type === 'audio' && data.audio) {
              playPcmAudioChunk(data.audio);
            } else if (data.type === 'transcription') {
              const text = data.text;
              const sender = data.sender;

              if (sender === 'user') {
                setTranscripts((prev) => [
                  ...prev,
                  {
                    id: `turn-user-${Date.now()}-${Math.random()}`,
                    sender: 'user',
                    text,
                    timestamp: new Date(),
                  },
                ]);
              } else if (sender === 'model') {
                // Append or create model transcription
                setTranscripts((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.sender === 'model' && currentModelTextIdRef.current === last.id) {
                    return [
                      ...prev.slice(0, -1),
                      { ...last, text: last.text + text },
                    ];
                  } else {
                    const newId = `turn-model-${Date.now()}-${Math.random()}`;
                    currentModelTextIdRef.current = newId;
                    return [
                      ...prev,
                      {
                        id: newId,
                        sender: 'model',
                        text,
                        timestamp: new Date(),
                      },
                    ];
                  }
                });
              }
            } else if (data.type === 'interim_transcription') {
              // Interim user speech
              // Can be shown as live preview
            } else if (data.type === 'interrupted') {
              stopAllPlayback();
              setStatus('listening');
              currentModelTextIdRef.current = null;
            } else if (data.type === 'turn_complete') {
              currentModelTextIdRef.current = null;
            } else if (data.type === 'session_closed') {
              setStatus('idle');
            }
          } catch (err) {
            console.error('Error processing websocket message:', err);
          }
        };

        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
          setErrorMessage('Unable to connect to the Gemini Live server.');
          setStatus('error');
        };

        ws.onclose = () => {
          setStatus((prev) => (prev === 'error' ? 'error' : 'idle'));
        };

        // 4. Setup Audio Processing Node
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current) {
            setInputVolume(0);
            return;
          }

          const inputData = e.inputBuffer.getChannelData(0);

          // Calculate input volume for visualizer
          let sumSquares = 0;
          for (let i = 0; i < inputData.length; i++) {
            sumSquares += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sumSquares / inputData.length);
          setInputVolume(Math.min(1, rms * 5));

          // Resample to 16kHz if needed
          const resampledData = resampleTo16k(inputData, inputCtx.sampleRate);
          const base64Audio = float32ToPcm16Base64(resampledData);

          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'audio',
                audio: base64Audio,
              })
            );
          }
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      } catch (err: unknown) {
        console.error('Failed to start Live session:', err);
        const error = err as Error;
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions in your browser.');
        } else {
          setErrorMessage(error.message || 'Failed to initialize microphone or live audio session.');
        }
        setStatus('error');
        cleanupAudio();
      }
    },
    [endSession, selectedVoice, selectedTopic, playPcmAudioChunk, stopAllPlayback, resampleTo16k, float32ToPcm16Base64, cleanupAudio]
  );

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'audio_end' }));
      }
      return next;
    });
  }, []);

  // Send Text Message to Live Session
  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    // Add to transcript immediately
    setTranscripts((prev) => [
      ...prev,
      {
        id: `turn-user-${Date.now()}`,
        sender: 'user',
        text: text.trim(),
        timestamp: new Date(),
      },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: text.trim(),
        })
      );
    }
  }, []);

  // Interrupt model speech
  const interrupt = useCallback(() => {
    stopAllPlayback();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop_speaking' }));
    }
    setStatus('listening');
  }, [stopAllPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {}
      }
    };
  }, [cleanupAudio]);

  return {
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
  };
}
