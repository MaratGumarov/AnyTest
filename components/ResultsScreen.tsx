import React from 'react';
import { QuestionItem, InterviewConfig } from '../types';
import SummaryScreen from './SummaryScreen';

interface ResultsScreenProps {
  questions: QuestionItem[];
  config: InterviewConfig | null;
  onBackToQuestions: () => void;
  onStartNewSession: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ 
  questions, 
  config, 
  onBackToQuestions, 
  onStartNewSession 
}) => {
  return (
    <SummaryScreen
      answeredQuestions={questions}
      sessionSettings={config}
      onBackToQuestions={onBackToQuestions}
      onStartNewSession={onStartNewSession}
    />
  );
};

export default ResultsScreen; 