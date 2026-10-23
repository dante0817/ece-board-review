import React, { createContext, useContext, useState, useEffect } from 'react';
import {useReview} from './ReviewContext';
import { useVoiceCommands, VoiceCommandFeedback, VoiceCommandAction } from '../hooks/useVoiceCommands';

interface VoiceCommandContextType {
  isSupported: boolean;
  isListening: boolean;
  interimTranscript: string;
  lastFeedback: VoiceCommandFeedback | null;
  unrecognizedPhrase: string | null;
  micVolume: number;
  permissionError: string | null;
  isContinuous: boolean;
  toggleContinuous: () => void;
  voiceFeedbackEnabled: boolean;
  toggleVoiceFeedback: () => void;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  executeCommandText: (text: string) => boolean;
  clearFeedback: () => void;
  actionsList: VoiceCommandAction[];
  isGuideOpen: boolean;
  setIsGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openGuide: () => void;
  closeGuide: () => void;
}

const VoiceCommandContext = createContext<VoiceCommandContextType | undefined>(undefined);

export const VoiceCommandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const voiceState = useVoiceCommands();
  const {assessmentSession}=useReview();
  const locked=assessmentSession.status==='strict-active'||assessmentSession.status==='finalizing';
  useEffect(()=>{if(locked)voiceState.stopListening();},[locked]);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <VoiceCommandContext.Provider
      value={{
        ...voiceState,
        startListening:()=>{if(!locked)voiceState.startListening();},
        toggleListening:()=>{if(!locked)voiceState.toggleListening();else voiceState.stopListening();},
        executeCommandText:(text:string)=>locked?false:voiceState.executeCommandText(text),
        isGuideOpen,
        setIsGuideOpen,
        openGuide: () => setIsGuideOpen(true),
        closeGuide: () => setIsGuideOpen(false),
      }}
    >
      {children}
    </VoiceCommandContext.Provider>
  );
};

export const useVoiceCommand = () => {
  const context = useContext(VoiceCommandContext);
  if (!context) {
    throw new Error('useVoiceCommand must be used within a VoiceCommandProvider');
  }
  return context;
};
