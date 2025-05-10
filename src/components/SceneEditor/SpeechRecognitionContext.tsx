
import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Capacitor } from '@capacitor/core';

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
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const checkPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { navigator } = window;
        
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          if (result.state === 'granted') {
            setPermissionGranted(true);
            return true;
          } else if (result.state === 'prompt') {
            // Will be asked during startRecording
            return true;
          } else {
            setPermissionGranted(false);
            return false;
          }
        }
      } catch (error) {
        console.error('Error checking microphone permission:', error);
      }
    }
    
    // Default to true for web platforms
    return true;
  };
  
  useEffect(() => {
    // Check permission on component mount
    checkPermission();
  }, []);
  
  const initializeSpeechRecognition = async () => {
    // Check if we're on Android
    const isAndroid = Capacitor.getPlatform() === 'android';
    
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      // Check permissions for native platforms
      if (isAndroid && !(await checkPermission())) {
        toast({
          title: "Permission Required",
          description: "Microphone permission is required for voice dictation. Please enable it in your device settings.",
          variant: "destructive",
        });
        return false;
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = recognitionLanguage;
      
      return true;
    }
    return false;
  };

  const startRecording = async (index: number, updateContent: (content: string) => void) => {
    if (isRecording && activeElementIndex === index) {
      stopRecording();
      return;
    }
    
    if (!(await initializeSpeechRecognition())) {
      // Customize the message based on the platform
      const isAndroid = Capacitor.getPlatform() === 'android';
      const isIOS = Capacitor.getPlatform() === 'ios';
      
      let errorMessage = "Speech recognition is not supported in your browser.";
      
      if (isAndroid) {
        errorMessage = "Speech recognition initialization failed. Make sure your app has microphone permissions in Android settings.";
      } else if (isIOS) {
        errorMessage = "Speech recognition may not be fully supported on this iOS device.";
      } else if (isMobile) {
        errorMessage = "Speech recognition may not be fully supported on this mobile device.";
      }
      
      toast({
        title: "Voice Recognition Error",
        description: errorMessage,
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
        
        // Provide more detailed error messages
        let errorMessage = `Speech recognition error: ${event.error}`;
        
        if (event.error === 'not-allowed') {
          errorMessage = "Microphone access was denied. Please grant microphone permission in your device settings.";
        } else if (event.error === 'network') {
          errorMessage = "Network error occurred. Please check your internet connection.";
        } else if (event.error === 'no-speech') {
          errorMessage = "No speech was detected. Please try speaking again.";
        }
        
        toast({
          title: "Voice Recognition Error",
          description: errorMessage,
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
