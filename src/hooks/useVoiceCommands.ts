import { useState, useEffect, useRef, useCallback } from 'react';
import { useReview, ScreenType } from '../context/ReviewContext';
import { playVoiceCommandChime } from '../utils/soundEffects';

export interface VoiceCommandAction {
  id: string;
  name: string;
  description: string;
  category: 'Timer' | 'Errors' | 'Subjects' | 'Navigation' | 'System';
  examplePhrases: string[];
  execute: () => void;
}

export interface VoiceCommandFeedback {
  actionId: string;
  title: string;
  description: string;
  spokenText: string;
  timestamp: number;
}

export function useVoiceCommands() {
  const {
    setCurrentScreen,
    startPomodoroTimer,
    pausePomodoroTimer,
    resetPomodoroPhaseTimer,
    switchPomodoroPhase,
    openPomodoroModal,
    openAddErrorModal,
    toggleTheme,
    toggleFocusMode,
    openChat,assessmentSession,
    openVoiceConversation,
    startWeakSpotQuiz,
    isDeepFocusActive,
    deepFocusTimeRemaining,
    startDeepFocus,
    stopDeepFocus,
    openDeepFocusModal,
  } = useReview();

  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [lastFeedback, setLastFeedback] = useState<VoiceCommandFeedback | null>(null);
  const [unrecognizedPhrase, setUnrecognizedPhrase] = useState<string | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  // Settings
  const [isContinuous, setIsContinuous] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ece_voice_cmd_continuous') === 'true';
    } catch {
      return false;
    }
  });

  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ece_voice_cmd_spoken_ack') === 'true';
    } catch {
      return false;
    }
  });

  const assessmentLockedRef=useRef(false);
  assessmentLockedRef.current=assessmentSession.status==='strict-active'||assessmentSession.status==='finalizing';
  // References
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check Web Speech API support
  useEffect(() => {
    const hasSpeech =
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    setIsSupported(hasSpeech);
  }, []);

  // Save preferences
  const toggleContinuous = useCallback(() => {
    setIsContinuous((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ece_voice_cmd_continuous', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleVoiceFeedback = useCallback(() => {
    setVoiceFeedbackEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ece_voice_cmd_spoken_ack', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Text to speech acknowledgement
  const speakAcknowledgement = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      } catch {
        // ignore
      }
    }
  }, []);

  // Registry of all available voice actions
  const voiceActions = useRef<VoiceCommandAction[]>([]);
  voiceActions.current = [
    // ⏱️ TIMER COMMANDS
    {
      id: 'start-pomodoro',
      name: 'Start Pomodoro',
      description: 'Begins the Pomodoro focus timer (25:00 study countdown)',
      category: 'Timer',
      examplePhrases: ['Start Pomodoro', 'Start focus', 'Start timer', 'Begin study', 'Pomodoro start'],
      execute: () => {
        startPomodoroTimer();
      },
    },
    {
      id: 'pause-pomodoro',
      name: 'Pause Pomodoro',
      description: 'Pauses the currently running study session timer',
      category: 'Timer',
      examplePhrases: ['Pause Pomodoro', 'Pause timer', 'Stop Pomodoro', 'Hold timer'],
      execute: () => {
        pausePomodoroTimer();
      },
    },
    {
      id: 'reset-pomodoro',
      name: 'Reset Pomodoro',
      description: 'Resets the current phase countdown to its full duration',
      category: 'Timer',
      examplePhrases: ['Reset Pomodoro', 'Reset timer', 'Restart focus'],
      execute: () => {
        resetPomodoroPhaseTimer();
      },
    },
    {
      id: 'break-pomodoro',
      name: 'Take a Break',
      description: 'Switches the timer to the rest break phase',
      category: 'Timer',
      examplePhrases: ['Take a break', 'Start break', 'Break time', 'Rest phase'],
      execute: () => {
        switchPomodoroPhase('rest');
      },
    },
    {
      id: 'focus-phase',
      name: 'Focus Phase',
      description: 'Switches the timer back to the active focus study phase',
      category: 'Timer',
      examplePhrases: ['Focus phase', 'End break', 'Back to study', 'Work phase'],
      execute: () => {
        switchPomodoroPhase('work');
      },
    },
    {
      id: 'open-pomodoro',
      name: 'Open Focus Timer',
      description: 'Opens the full Pomodoro configuration dialog and session stats',
      category: 'Timer',
      examplePhrases: ['Open Pomodoro', 'Show timer', 'Focus timer modal'],
      execute: () => {
        openPomodoroModal();
      },
    },

    // 🔒 DEEP FOCUS COMMANDS
    {
      id: 'start-deep-focus',
      name: 'Start Deep Focus',
      description: 'Enables Deep Focus Mode: locks screen switching and silences notifications',
      category: 'Timer',
      examplePhrases: [
        'Start Deep Focus',
        'Enable Deep Focus',
        'Deep Focus Mode',
        'Deep Focus',
        'Lock screen for study',
      ],
      execute: () => {
        startDeepFocus(25);
        if (voiceFeedbackEnabled) {
          speakAcknowledgement('Deep Focus enabled for 25 minutes. Screen switching locked.');
        }
      },
    },
    {
      id: 'stop-deep-focus',
      name: 'Stop Deep Focus',
      description: 'Ends Deep Focus Mode early, unlocks navigation, and restores notifications',
      category: 'Timer',
      examplePhrases: [
        'Stop Deep Focus',
        'End Deep Focus',
        'Exit Deep Focus',
        'Cancel Deep Focus',
        'Unlock screen',
      ],
      execute: () => {
        stopDeepFocus();
        if (voiceFeedbackEnabled) {
          speakAcknowledgement('Deep Focus ended. Navigation unlocked.');
        }
      },
    },
    {
      id: 'open-deep-focus',
      name: 'Configure Deep Focus',
      description: 'Opens the Deep Focus duration and lock settings modal',
      category: 'Timer',
      examplePhrases: ['Configure Deep Focus', 'Deep Focus settings', 'Open Deep Focus'],
      execute: () => {
        openDeepFocusModal();
      },
    },

    // ⚠️ ERROR LOGGING COMMANDS
    {
      id: 'add-error',
      name: 'Add Error',
      description: 'Opens the error logger to quickly record a calculation slip or misconception',
      category: 'Errors',
      examplePhrases: ['Add error', 'Log error', 'Record error', 'New error', 'Add mistake', 'Log mistake'],
      execute: () => {
        openAddErrorModal();
      },
    },
    {
      id: 'switch-errors',
      name: 'Switch to Error Log',
      description: 'Navigates to the comprehensive Error Bank and classification dashboard',
      category: 'Errors',
      examplePhrases: ['Switch to Error Log', 'Go to errors', 'Show error bank', 'View mistakes'],
      execute: () => {
        setCurrentScreen('errors');
      },
    },

    // 📚 SUBJECT COMMANDS (Explicitly supports 'Switch to Math')
    {
      id: 'switch-math',
      name: 'Switch to Math',
      description: 'Navigates to Mathematics (Algebra, Calculus, Trig, Geometry)',
      category: 'Subjects',
      examplePhrases: ['Switch to Math', 'Go to Math', 'Open Mathematics', 'Math review'],
      execute: () => {
        setCurrentScreen('mathematics');
      },
    },
    {
      id: 'switch-algebra',
      name: 'Switch to Algebra',
      description: 'Navigates to the core Algebra module',
      category: 'Subjects',
      examplePhrases: ['Switch to Algebra', 'Go to Algebra', 'Open Algebra'],
      execute: () => {
        setCurrentScreen('algebra');
      },
    },
    {
      id: 'switch-real-numbers',
      name: 'Switch to Real Numbers',
      description: 'Navigates to Real Numbers & Field Axioms screen',
      category: 'Subjects',
      examplePhrases: ['Switch to Real Numbers', 'Go to Real Numbers'],
      execute: () => {
        setCurrentScreen('real-numbers');
      },
    },
    {
      id: 'switch-rational-expressions',
      name: 'Switch to Rational Expressions',
      description: 'Navigates to Rational Expressions & Partial Fractions screen',
      category: 'Subjects',
      examplePhrases: ['Switch to Rational Expressions', 'Go to Rational Expressions'],
      execute: () => {
        setCurrentScreen('rational-expressions');
      },
    },
    {
      id: 'switch-linear-equations',
      name: 'Switch to Linear Equations',
      description: 'Navigates to Linear Equations & Word Problems screen',
      category: 'Subjects',
      examplePhrases: ['Switch to Linear Equations', 'Go to Linear Equations'],
      execute: () => {
        setCurrentScreen('linear-equations');
      },
    },
    {
      id: 'switch-order-of-operations',
      name: 'Switch to Order of Operations',
      description: 'Navigates to PEMDAS & Syntax Tree analysis screen',
      category: 'Subjects',
      examplePhrases: ['Switch to Order of Operations', 'PEMDAS screen'],
      execute: () => {
        setCurrentScreen('order-of-operations');
      },
    },
    {
      id: 'switch-geas',
      name: 'Switch to GEAS',
      description: 'Navigates to General Engineering and Applied Sciences',
      category: 'Subjects',
      examplePhrases: ['Switch to GEAS', 'Go to GEAS', 'General engineering'],
      execute: () => {
        setCurrentScreen('geas');
      },
    },
    {
      id: 'switch-electronics',
      name: 'Switch to Electronics',
      description: 'Navigates to Electronics Engineering (Devices, Amplifiers, Logic)',
      category: 'Subjects',
      examplePhrases: ['Switch to Electronics', 'Go to Electronics', 'Electronics review'],
      execute: () => {
        setCurrentScreen('electronics');
      },
    },
    {
      id: 'switch-est',
      name: 'Switch to EST',
      description: 'Navigates to Electronic Systems and Technologies (Communications)',
      category: 'Subjects',
      examplePhrases: ['Switch to EST', 'Go to EST', 'Communications review'],
      execute: () => {
        setCurrentScreen('est');
      },
    },

    // 🎯 NAVIGATION COMMANDS
    {
      id: 'switch-today',
      name: 'Switch to Today',
      description: "Navigates to Today's targeted high-priority review queue",
      category: 'Navigation',
      examplePhrases: ['Switch to Today', 'Go to today', "Today's review", "Today's target"],
      execute: () => {
        setCurrentScreen('today');
      },
    },
    {
      id: 'switch-overview',
      name: 'Switch to Overview',
      description: 'Navigates to the main ECE Board review dashboard',
      category: 'Navigation',
      examplePhrases: ['Switch to Overview', 'Go to dashboard', 'Overview', 'Home'],
      execute: () => {
        setCurrentScreen('overview');
      },
    },
    {
      id: 'switch-subjects',
      name: 'Switch to Subjects',
      description: 'Navigates to the full 4-subject ECE board curriculum',
      category: 'Navigation',
      examplePhrases: ['Switch to Subjects', 'All subjects', 'View syllabus'],
      execute: () => {
        setCurrentScreen('subjects');
      },
    },
    {
      id: 'switch-tests',
      name: 'Switch to Tests',
      description: 'Navigates to practice tests, timed diagnostic exams, and score history',
      category: 'Navigation',
      examplePhrases: ['Switch to Tests', 'Mock exams', 'Practice tests'],
      execute: () => {
        setCurrentScreen('tests');
      },
    },
    {
      id: 'switch-practice',
      name: 'Switch to Practice',
      description: 'Navigates to active practice problem sets and drill modules',
      category: 'Navigation',
      examplePhrases: ['Switch to Practice', 'Go to practice', 'Problem drill'],
      execute: () => {
        setCurrentScreen('practice');
      },
    },
    {
      id: 'switch-queue',
      name: 'Switch to Review Queue',
      description: 'Navigates to the SM-2 Spaced Repetition due queue',
      category: 'Navigation',
      examplePhrases: ['Switch to Queue', 'Review queue', 'Spaced repetition'],
      execute: () => {
        setCurrentScreen('queue');
      },
    },
    {
      id: 'switch-progress',
      name: 'Switch to Progress',
      description: 'Navigates to study analytics, retention curves, and topic mastery breakdown',
      category: 'Navigation',
      examplePhrases: ['Switch to Progress', 'View progress', 'Study analytics'],
      execute: () => {
        setCurrentScreen('progress');
      },
    },
    {
      id: 'switch-readiness',
      name: 'Switch to Board Readiness',
      description: 'Navigates to the ECE PRC board exam readiness predictor score',
      category: 'Navigation',
      examplePhrases: ['Switch to Readiness', 'Board readiness', 'Exam predictor'],
      execute: () => {
        setCurrentScreen('readiness');
      },
    },

    // ⚡ SYSTEM & TOOLS
    {
      id: 'toggle-theme',
      name: 'Toggle Dark Mode',
      description: 'Switches between Day and Night study modes',
      category: 'System',
      examplePhrases: ['Toggle Dark Mode', 'Night mode', 'Light mode', 'Toggle theme'],
      execute: () => {
        toggleTheme();
      },
    },
    {
      id: 'toggle-focus',
      name: 'Toggle Focus Mode',
      description: 'Toggles distraction-free full-screen review mode',
      category: 'System',
      examplePhrases: ['Toggle Focus Mode', 'Enter focus mode', 'Exit focus mode', 'Distraction free'],
      execute: () => {
        toggleFocusMode();
      },
    },
    {
      id: 'open-chat',
      name: 'Open AI Chat',
      description: 'Launches the Gemini ECE Board Exam Tutor chatbot',
      category: 'System',
      examplePhrases: ['Open AI Chat', 'Chat with AI', 'Ask tutor', 'Open Gemini'],
      execute: () => {
        openChat();
      },
    },
    {
      id: 'open-live-voice',
      name: 'Live Voice Oral Review',
      description: 'Connects to Gemini Live Voice for verbal board Q&A drills',
      category: 'System',
      examplePhrases: ['Live voice', 'Oral review', 'Start voice tutor'],
      execute: () => {
        openVoiceConversation();
      },
    },
    {
      id: 'start-quiz',
      name: 'Start Weak Spot Quiz',
      description: 'Generates a targeted drill based on recurring mistake patterns',
      category: 'System',
      examplePhrases: ['Start quiz', 'Take quiz', 'Weak spot quiz'],
      execute: () => {
        startWeakSpotQuiz();
      },
    },
  ];

  // Natural language matcher
  const matchCommand = useCallback(
    (text: string): VoiceCommandAction | null => {
      const cleaned = text
        .toLowerCase()
        .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleaned) return null;

      // 1. Exact or strict regex matching for high-priority user examples:
      // A. 'Start Pomodoro'
      if (
        cleaned.includes('start pomodoro') ||
        cleaned.includes('begin pomodoro') ||
        cleaned.includes('start focus') ||
        cleaned.includes('start timer') ||
        cleaned.includes('start study') ||
        cleaned === 'pomodoro start' ||
        cleaned === 'start'
      ) {
        return voiceActions.current.find((a) => a.id === 'start-pomodoro') || null;
      }

      // B. 'Pause Pomodoro'
      if (
        cleaned.includes('pause pomodoro') ||
        cleaned.includes('stop pomodoro') ||
        cleaned.includes('pause timer') ||
        cleaned.includes('stop timer') ||
        cleaned.includes('pause study')
      ) {
        return voiceActions.current.find((a) => a.id === 'pause-pomodoro') || null;
      }

      // C. 'Reset Pomodoro'
      if (cleaned.includes('reset pomodoro') || cleaned.includes('reset timer')) {
        return voiceActions.current.find((a) => a.id === 'reset-pomodoro') || null;
      }

      // C2. Deep Focus Commands
      if (
        cleaned.includes('start deep focus') ||
        cleaned.includes('enable deep focus') ||
        cleaned.includes('deep focus mode') ||
        cleaned === 'deep focus' ||
        cleaned.includes('lock screen')
      ) {
        return voiceActions.current.find((a) => a.id === 'start-deep-focus') || null;
      }

      if (
        cleaned.includes('stop deep focus') ||
        cleaned.includes('end deep focus') ||
        cleaned.includes('exit deep focus') ||
        cleaned.includes('cancel deep focus') ||
        cleaned.includes('unlock screen')
      ) {
        return voiceActions.current.find((a) => a.id === 'stop-deep-focus') || null;
      }

      if (
        cleaned.includes('configure deep focus') ||
        cleaned.includes('deep focus settings') ||
        cleaned.includes('open deep focus')
      ) {
        return voiceActions.current.find((a) => a.id === 'open-deep-focus') || null;
      }

      // D. 'Take a Break'
      if (
        cleaned.includes('take a break') ||
        cleaned.includes('take break') ||
        cleaned.includes('start break') ||
        cleaned.includes('break time') ||
        cleaned === 'break'
      ) {
        return voiceActions.current.find((a) => a.id === 'break-pomodoro') || null;
      }

      // E. 'Add Error' / 'Log Error'
      if (
        cleaned.includes('add error') ||
        cleaned.includes('log error') ||
        cleaned.includes('record error') ||
        cleaned.includes('new error') ||
        cleaned.includes('add mistake') ||
        cleaned.includes('log mistake') ||
        cleaned.includes('record mistake') ||
        cleaned === 'error' ||
        cleaned === 'mistake'
      ) {
        return voiceActions.current.find((a) => a.id === 'add-error') || null;
      }

      // F. 'Switch to Math'
      if (
        cleaned.includes('switch to math') ||
        cleaned.includes('go to math') ||
        cleaned.includes('open math') ||
        cleaned.includes('math review') ||
        cleaned.includes('mathematics') ||
        cleaned === 'math' ||
        cleaned === 'maths'
      ) {
        return voiceActions.current.find((a) => a.id === 'switch-math') || null;
      }

      // G. Other Specific Subject screens
      if (cleaned.includes('algebra')) {
        return voiceActions.current.find((a) => a.id === 'switch-algebra') || null;
      }
      if (cleaned.includes('real number') || cleaned.includes('real numbers')) {
        return voiceActions.current.find((a) => a.id === 'switch-real-numbers') || null;
      }
      if (cleaned.includes('rational')) {
        return voiceActions.current.find((a) => a.id === 'switch-rational-expressions') || null;
      }
      if (cleaned.includes('linear equation') || cleaned.includes('linear equations')) {
        return voiceActions.current.find((a) => a.id === 'switch-linear-equations') || null;
      }
      if (cleaned.includes('order of operation') || cleaned.includes('pemdas')) {
        return voiceActions.current.find((a) => a.id === 'switch-order-of-operations') || null;
      }
      if (cleaned.includes('geas') || cleaned.includes('general engineering')) {
        return voiceActions.current.find((a) => a.id === 'switch-geas') || null;
      }
      if (cleaned.includes('electronic') || cleaned.includes('electronics')) {
        return voiceActions.current.find((a) => a.id === 'switch-electronics') || null;
      }
      if (cleaned.includes('est') || cleaned.includes('communication') || cleaned.includes('communications') || cleaned.includes('telecom')) {
        return voiceActions.current.find((a) => a.id === 'switch-est') || null;
      }

      // H. Navigation targets
      if (cleaned.includes('today') || cleaned.includes('daily target')) {
        return voiceActions.current.find((a) => a.id === 'switch-today') || null;
      }
      if (cleaned.includes('overview') || cleaned.includes('dashboard') || cleaned.includes('home')) {
        return voiceActions.current.find((a) => a.id === 'switch-overview') || null;
      }
      if (cleaned.includes('subject') || cleaned.includes('subjects') || cleaned.includes('syllabus')) {
        return voiceActions.current.find((a) => a.id === 'switch-subjects') || null;
      }
      if (cleaned.includes('test') || cleaned.includes('tests') || cleaned.includes('mock exam') || cleaned.includes('exams')) {
        return voiceActions.current.find((a) => a.id === 'switch-tests') || null;
      }
      if (cleaned.includes('practice') || cleaned.includes('drill')) {
        return voiceActions.current.find((a) => a.id === 'switch-practice') || null;
      }
      if (cleaned.includes('queue') || cleaned.includes('spaced repetition')) {
        return voiceActions.current.find((a) => a.id === 'switch-queue') || null;
      }
      if (cleaned.includes('progress') || cleaned.includes('analytics') || cleaned.includes('stats')) {
        return voiceActions.current.find((a) => a.id === 'switch-progress') || null;
      }
      if (cleaned.includes('readiness') || cleaned.includes('predictor')) {
        return voiceActions.current.find((a) => a.id === 'switch-readiness') || null;
      }
      if (cleaned.includes('error log') || cleaned.includes('errors')) {
        return voiceActions.current.find((a) => a.id === 'switch-errors') || null;
      }

      // I. System toggles
      if (cleaned.includes('dark mode') || cleaned.includes('light mode') || cleaned.includes('night mode') || cleaned.includes('toggle theme')) {
        return voiceActions.current.find((a) => a.id === 'toggle-theme') || null;
      }
      if (cleaned.includes('focus mode') || cleaned.includes('distraction free')) {
        return voiceActions.current.find((a) => a.id === 'toggle-focus') || null;
      }
      if (cleaned.includes('ai chat') || cleaned.includes('chat') || cleaned.includes('gemini') || cleaned.includes('tutor')) {
        return voiceActions.current.find((a) => a.id === 'open-chat') || null;
      }
      if (cleaned.includes('oral review') || cleaned.includes('live voice')) {
        return voiceActions.current.find((a) => a.id === 'open-live-voice') || null;
      }
      if (cleaned.includes('quiz')) {
        return voiceActions.current.find((a) => a.id === 'start-quiz') || null;
      }

      return null;
    },
    []
  );

  // Execute a command (by spoken speech or manual simulated text)
  const processSpokenPhrase = useCallback(
    (spoken: string) => {
      if(assessmentLockedRef.current)return;
      const matched = matchCommand(spoken);
      if (matched) {
        // Execute the action
        const isNavAction = matched.category === 'Navigation' || matched.category === 'Subjects' || (matched.id === 'switch-errors');
        const wasBlockedByDeepFocus = isNavAction && isDeepFocusActive;

        matched.execute();
        playVoiceCommandChime('command-matched');

        const feedback: VoiceCommandFeedback = {
          actionId: matched.id,
          title: wasBlockedByDeepFocus ? `🔒 Navigation Locked (${matched.name})` : matched.name,
          description: wasBlockedByDeepFocus
            ? `Deep Focus Mode is active. Screen switching is locked for another ${Math.floor(deepFocusTimeRemaining / 60)}m ${deepFocusTimeRemaining % 60}s.`
            : matched.description,
          spokenText: spoken,
          timestamp: Date.now(),
        };

        setLastFeedback(feedback);
        setUnrecognizedPhrase(null);

        if (voiceFeedbackEnabled) {
          if (wasBlockedByDeepFocus) {
            speakAcknowledgement('Navigation locked during Deep Focus');
          } else {
            speakAcknowledgement(matched.name);
          }
        }

        // Auto dismiss feedback after 4 seconds
        setTimeout(() => {
          setLastFeedback((current) => (current?.timestamp === feedback.timestamp ? null : current));
        }, 4000);

        return true;
      } else {
        // Did not match
        playVoiceCommandChime('unrecognized');
        setUnrecognizedPhrase(spoken);
        setTimeout(() => {
          setUnrecognizedPhrase(null);
        }, 3500);
        return false;
      }
    },
    [matchCommand, voiceFeedbackEnabled, speakAcknowledgement]
  );

  // Audio waveform visualizer using Web Audio API
  const startAudioVisualizer = useCallback(async (stream: MediaStream) => {
    try {
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 80);
        setMicVolume(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch {
      // ignore
    }
  }, []);

  const stopAudioVisualizer = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {
        // ignore
      }
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setMicVolume(0);
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    setIsListening(false);
    setInterimTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    stopAudioVisualizer();
  }, [stopAudioVisualizer]);

  // Start listening
  const startListening = useCallback(async () => {
    setPermissionError(null);
    setUnrecognizedPhrase(null);

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      setPermissionError('Web Speech Recognition is not supported in this browser. You can still test voice commands below.');
      return;
    }

    // First request microphone stream for permission and live visualizer
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        startAudioVisualizer(stream);
      }
    } catch (err: any) {
      console.warn('Microphone permission request failed or was cancelled:', err);
      // Even if visualizer stream fails, try speech recognition directly
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 2;

      recognition.onstart = () => {
        setIsListening(true);
        shouldListenRef.current = true;
        playVoiceCommandChime('start-listening');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalPhrase = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalPhrase += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalPhrase.trim()) {
          setInterimTranscript(finalPhrase);
          const matched = processSpokenPhrase(finalPhrase);
          
          if (matched && !isContinuous) {
            // If single-shot mode, turn off after success
            setTimeout(() => {
              stopListening();
            }, 600);
          } else {
            // Clear interim after a moment so user can speak the next command
            setTimeout(() => {
              setInterimTranscript('');
            }, 1200);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setPermissionError('Microphone permission denied. Please allow microphone access to use voice commands.');
          stopListening();
        } else if (event.error === 'no-speech') {
          // Keep waiting
        }
      };

      recognition.onend = () => {
        // If the user intended to keep listening (e.g. continuous mode), restart safely
        if (shouldListenRef.current && isContinuous) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
          stopAudioVisualizer();
        }
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setPermissionError('Could not start voice recognition. Please try clicking Start Listening again.');
      stopListening();
    }
  }, [isContinuous, processSpokenPhrase, startAudioVisualizer, stopAudioVisualizer, stopListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Manual test trigger (for accessibility, silent mode, and quick testing)
  const executeCommandText = useCallback(
    (text: string) => {
      return processSpokenPhrase(text);
    },
    [processSpokenPhrase]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      stopAudioVisualizer();
    };
  }, [stopAudioVisualizer]);

  return {
    isSupported,
    isListening,
    interimTranscript,
    lastFeedback,
    unrecognizedPhrase,
    micVolume,
    permissionError,
    isContinuous,
    toggleContinuous,
    voiceFeedbackEnabled,
    toggleVoiceFeedback,
    startListening,
    stopListening,
    toggleListening,
    executeCommandText,
    clearFeedback: () => setLastFeedback(null),
    actionsList: voiceActions.current,
  };
}
