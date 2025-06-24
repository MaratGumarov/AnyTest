import React, { useState, useEffect } from 'react';
import { Difficulty, SessionSettings } from '../types';
import { DEFAULT_DIFFICULTY, DIFFICULTY_LEVELS, PREDEFINED_TOPICS, CUSTOM_TOPIC_VALUE, DEFAULT_TOPIC_PREDEFINED, APP_TITLE } from '../constants';
import { AcademicCapIcon, ArrowRightIcon, SparklesIcon } from './icons';
import { Button, Card, Input, Select } from './ui';
import ThemeToggle from './ThemeToggle';

interface SetupScreenProps {
  onStartSession: (settings: SessionSettings) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartSession }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [selectedPredefinedTopic, setSelectedPredefinedTopic] = useState<string>(DEFAULT_TOPIC_PREDEFINED);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isCustomTopicMode, setIsCustomTopicMode] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsCustomTopicMode(selectedPredefinedTopic === CUSTOM_TOPIC_VALUE);
    if (selectedPredefinedTopic !== CUSTOM_TOPIC_VALUE) {
      setCustomTopic('');
      setErrorMessage(null);
    }
  }, [selectedPredefinedTopic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    let finalTopic = '';

    if (isCustomTopicMode) {
      if (!customTopic.trim()) {
        setErrorMessage('Пожалуйста, введите название для своей темы.');
        return;
      }
      finalTopic = customTopic.trim();
    } else {
      finalTopic = selectedPredefinedTopic;
    }
    
    if (!finalTopic) {
      setErrorMessage('Тема не выбрана. Пожалуйста, выберите или укажите тему.');
      return;
    }

    onStartSession({ difficulty, topic: finalTopic });
  };

  return (
    <div className="screen container mx-auto max-w-lg p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
      {/* Переключатель темы в верхнем правом углу */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle variant="compact" />
      </div>
      
      <Card variant="default" padding="lg" shadow="xl" className="w-full">
        <div className="text-center mb-8">
          <AcademicCapIcon className="w-16 h-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Настройте сессию</h2>
          <p className="text-slate-700 dark:text-slate-400 mt-2">Выберите тему и сложность для начала подготовки.</p>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6 animate-fade-in-up" role="alert">
            <strong className="font-bold">Ошибка: </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            label="Тема вопросов"
            options={PREDEFINED_TOPICS}
            value={selectedPredefinedTopic}
            onChange={(e) => setSelectedPredefinedTopic(e.target.value)}
            variant="modern"
          />

          {isCustomTopicMode && (
            <Input
              label="Укажите свою тему"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Например: История Средневековья"
              variant="modern"
            />
          )}

          <Select
            label="Уровень сложности"
            options={DIFFICULTY_LEVELS}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            variant="modern"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<SparklesIcon className="w-5 h-5" />}
            rightIcon={<ArrowRightIcon className="w-5 h-5" />}
            className="group"
          >
            Начать сессию
          </Button>
        </form>
      </Card>
      
      <footer className="text-center mt-8 py-4">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          &copy; {new Date().getFullYear()} {APP_TITLE}.
          Работает на Gemini API.
        </p>
      </footer>
    </div>
  );
};

export default SetupScreen;