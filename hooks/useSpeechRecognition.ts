import { useState, useEffect, useCallback, useRef } from 'react';
import { SpeechRecognitionState } from '../types';

// Minimal type definitions for Web Speech API parts used in this hook.
// These are to ensure compilation if standard DOM lib types for SpeechRecognition are not picked up.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  readonly [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string; // Known values: 'no-speech', 'audio-capture', 'not-allowed', 'network', etc.
  readonly message: string;
}

interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null; // `ev` is a generic Event
  start(): void;
  stop(): void;
  abort(): void; // Added for completeness, though not used in this hook directly
  // Other properties like grammars, maxAlternatives, onaudiostart etc. exist but are not used here.
}

// Represents the constructor for SpeechRecognition
interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

// Augment the Window interface to include webkitSpeechRecognition and standard SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

const useSpeechRecognition = (): SpeechRecognitionState & {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
} => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const isSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) {
      setError("Распознавание речи не поддерживается в вашем браузере.");
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
        setError("API Распознавания речи не найдено."); // Should be caught by isSupported
        return;
    }
    
    recognitionRef.current = new SpeechRecognitionAPI();
    const recognition = recognitionRef.current;

    recognition.continuous = true; // Keep listening even after a pause
    recognition.interimResults = true; // Get results as they are being processed
    recognition.lang = 'ru-RU'; // Set language to Russian

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // We want to provide the latest interim transcript for live feedback,
      // and accumulate final transcripts. For simplicity now, let's update with combined.
      setTranscript(prev => prev + finalTranscript + (interimTranscript ? (prev ? " " : "") + interimTranscript : ""));
       // More sophisticated logic might involve clearing previous interim and appending new final.
       // For now, this just appends. ResetTranscript will be important.
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      let errorMessage = 'Произошла ошибка распознавания речи.';
      if (event.error === 'no-speech') {
        errorMessage = 'Речь не распознана. Попробуйте снова.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Ошибка захвата аудио. Проверьте микрофон.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Доступ к микрофону запрещен. Проверьте разрешения в браузере.';
      }
      setError(errorMessage);
      setIsListening(false);
    };

    recognition.onend = () => {
      // setIsListening(false); // Can be set here, or rely on explicit stopListening
      // If continuous is true, onend might be called if it times out, 
      // but we typically want it to keep going until explicitly stopped.
    };
    
    // Cleanup function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript(''); // Clear previous transcript before starting new one
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // This catch is for errors during .start() itself, e.g., if already started
        console.error("Error starting speech recognition:", e);
        setError("Не удалось начать распознавание речи.");
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;