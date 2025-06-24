import React, { useState, useEffect } from 'react';
import { Difficulty, SessionSettings } from '../types';
import { DEFAULT_DIFFICULTY, DIFFICULTY_LEVELS, PREDEFINED_TOPICS, CUSTOM_TOPIC_VALUE, DEFAULT_TOPIC_PREDEFINED, APP_TITLE } from '../constants';
import { AcademicCapIcon, ArrowRightIcon, SettingsIcon, SparklesIcon } from './icons';

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
      setCustomTopic(''); // Clear custom topic if a predefined one is chosen
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
    
    if (!finalTopic) { // Should not happen if logic is correct
        setErrorMessage('Тема не выбрана. Пожалуйста, выберите или укажите тему.');
        return;
    }

    onStartSession({ difficulty, topic: finalTopic });
  };

  return (
    <div className="screen container mx-auto max-w-lg p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full">
        <div className="text-center mb-8">
            <AcademicCapIcon className="w-16 h-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Настройте сессию</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Выберите тему и сложность для начала подготовки.</p>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">
            <strong className="font-bold">Ошибка: </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Тема вопросов
            </label>
            <select
              id="topic"
              value={selectedPredefinedTopic}
              onChange={(e) => setSelectedPredefinedTopic(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white dark:bg-slate-700 dark:text-slate-200"
              aria-label="Выберите тему вопросов"
            >
              {PREDEFINED_TOPICS.map(topic => (
                <option key={topic.value} value={topic.value}>{topic.label}</option>
              ))}
            </select>
          </div>

          {isCustomTopicMode && (
            <div>
              <label htmlFor="customTopic" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Укажите свою тему
              </label>
              <input
                type="text"
                id="customTopic"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="mt-1 block w-full pl-3 pr-3 py-2.5 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white dark:bg-slate-700 dark:text-slate-200"
                placeholder="Например: История Средневековья"
                aria-label="Введите свою тему для вопросов"
              />
            </div>
          )}

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Уровень сложности
            </label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white dark:bg-slate-700 dark:text-slate-200"
              aria-label="Выберите уровень сложности"
            >
              {DIFFICULTY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 transition-colors duration-150 group"
          >
            <SparklesIcon className="w-5 h-5 mr-2 opacity-80 group-hover:opacity-100 transform group-hover:scale-110 transition-all duration-200" />
            Начать сессию
            <ArrowRightIcon className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-200" />
          </button>
        </form>
      </div>
       <footer className="text-center mt-8 py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} {APP_TITLE}.
                 Работает на Gemini API.
            </p>
        </footer>
    </div>
  );
};

export default SetupScreen;