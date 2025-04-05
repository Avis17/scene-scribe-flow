import React, { createContext, useContext, useState, ReactNode, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const initializeSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = recognitionLanguage;
      
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
        description: isMobile ? 
          "Speech recognition may not be fully supported on this mobile device." : 
          "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRecording(true);
    setActiveElementIndex(index);
    
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
          
        updateContent(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast({
          title: "Error",
          description: `Speech recognition error: ${event.error}`,
          variant: "destructive",
        });
        stopRecording();
      };
      
      recognitionRef.current.onend = () => {
        if (isRecording) {
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.error('Failed to restart recognition', error);
            setIsRecording(false);
            setActiveElementIndex(null);
          }
        }
      };
      
      try {
        recognitionRef.current.start();
        toast({
          title: "Recording Started",
          description: "Speak now. Your speech will be converted to text.",
        });
      } catch (error) {
        console.error('Speech recognition start error', error);
        setIsRecording(false);
        setActiveElementIndex(null);
        toast({
          title: "Error Starting Recording",
          description: "Please try again or use text input instead.",
          variant: "destructive",
        });
      }
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        toast({
          title: "Recording Stopped",
          description: "Voice input has been stopped.",
        });
      } catch (error) {
        console.error('Error stopping recognition', error);
      }
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
