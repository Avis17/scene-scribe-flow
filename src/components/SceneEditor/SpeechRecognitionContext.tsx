
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface SpeechRecognitionContextType {
  isRecording: boolean;
  activeElementIndex: number | null;
  recognitionLanguage: string;
  setRecognitionLanguage: (language: string) => void;
  startRecording: (index: number, updateContent: (content: string) => void) => void;
  stopRecording: () => void;
}

const SpeechRecognitionContext = createContext<SpeechRecognitionContextType | undefined>(undefined);

export const useSpeechRecognition = () => {
  const context = useContext(SpeechRecognitionContext);
  if (context === undefined) {
    throw new Error("useSpeechRecognition must be used within a SpeechRecognitionProvider");
  }
  return context;
};

interface SpeechRecognitionProviderProps {
  children: ReactNode;
}

export const SpeechRecognitionProvider: React.FC<SpeechRecognitionProviderProps> = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(null);
  const [recognitionLanguage, setRecognitionLanguage] = useState<string>("en-US");
  const { toast } = useToast();
  
  let recognition: SpeechRecognition | null = null;
  
  // Initialize speech recognition if supported
  const initializeSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Browser supports speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = recognitionLanguage;
      
      return true;
    }
    return false;
  };

  const startRecording = (index: number, updateContent: (content: string) => void) => {
    if (isRecording && activeElementIndex === index) {
      stopRecording();
      return;
    }
    
    if (!initializeSpeechRecognition()) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRecording(true);
    setActiveElementIndex(index);
    
    if (recognition) {
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
          
        // Update the content through callback
        updateContent(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
          title: "Error",
          description: `Speech recognition error: ${event.error}`,
          variant: "destructive",
        });
        stopRecording();
      };
      
      recognition.onend = () => {
        if (isRecording) {
          // If we're still supposed to be recording, restart
          recognition?.start();
        }
      };
      
      try {
        recognition.start();
        toast({
          title: "Recording Started",
          description: "Speak now. Your speech will be converted to text.",
        });
      } catch (error) {
        console.error('Speech recognition start error', error);
        setIsRecording(false);
        setActiveElementIndex(null);
      }
    }
  };
  
  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
    setActiveElementIndex(null);
  };

  return (
    <SpeechRecognitionContext.Provider
      value={{
        isRecording,
        activeElementIndex,
        recognitionLanguage,
        setRecognitionLanguage,
        startRecording,
        stopRecording
      }}
    >
      {children}
    </SpeechRecognitionContext.Provider>
  );
};
