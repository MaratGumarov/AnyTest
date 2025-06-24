import React from 'react';
import { InterviewConfig } from '../types';
import SetupScreen from './SetupScreen';

interface ConfigScreenProps {
  onStartInterview: (config: InterviewConfig) => void;
}

const ConfigScreen: React.FC<ConfigScreenProps> = ({ onStartInterview }) => {
  return <SetupScreen onStartSession={onStartInterview} />;
};

export default ConfigScreen; 