export enum Difficulty {
  JUNIOR = 'Junior',
  MIDDLE = 'Middle',
  SENIOR = 'Senior',
}

export interface Question {
  id: string;
  questionText: string;
  correctAnswer: string;
}

// Represents a question as fetched from the API
export interface GeneratedQuestion {
  question: string;
  answer: string;
}

// Represents a question item within the application's state
export interface QuestionItem extends Question {
  topic: string;
  userAnswer: string;
  shortFeedback: string | null;
  detailedFeedback: string | null;
  isCorrectAnswerVisible: boolean;
  isDetailedFeedbackVisible: boolean;
  isCheckingAnswer: boolean;
  timestamp: number; // For summary ordering
}

export interface FeedbackResponse {
  shortFeedback: string;
  detailedFeedback: string;
}

export type Screen = 'setup' | 'questions' | 'summary';

export interface SessionSettings {
  difficulty: Difficulty;
  topic: string; // This will hold the final topic string (predefined or custom)
}

export interface SpeechRecognitionState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}