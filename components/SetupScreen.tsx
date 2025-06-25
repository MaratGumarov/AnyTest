import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Difficulty, SessionSettings } from '../types';
import { DEFAULT_DIFFICULTY, DEFAULT_TOPIC_PREDEFINED } from '../constants';
import { useConstants } from '../src/hooks/useConstants';
import { AcademicCapIcon, ArrowRightIcon, SparklesIcon } from './icons';
import { Button, Card, Input, CustomSelect } from './ui';
import ThemeToggle from './ThemeToggle';
import { LanguageSelector } from '../src/components/LanguageSelector';
import SmartTopicInput from './SmartTopicInput';

interface SetupScreenProps {
  onStartSession: (settings: SessionSettings) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartSession }) => {
  const { t } = useTranslation();
  const { DIFFICULTY_LEVELS } = useConstants();
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY);
  const [topic, setTopic] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!topic.trim()) {
      setErrorMessage(t('setup.errors.topicRequired'));
      return;
    }

    onStartSession({ difficulty, topic: topic.trim() });
  };

  return (
    <div className="screen container mx-auto max-w-lg p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
      {/* Theme and language toggles in top right corner */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <div className="flex items-center gap-3">
          <ThemeToggle variant="compact" />
          <LanguageSelector variant="compact" />
        </div>
      </div>
      
      <Card variant="default" padding="lg" shadow="xl" className="w-full">
        <div className="text-center mb-8">
          <AcademicCapIcon className="w-16 h-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('setup.title')}</h2>
          <p className="text-slate-700 dark:text-slate-400 mt-2">{t('setup.description')}</p>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6 animate-fade-in-up" role="alert">
            <strong className="font-bold">{t('common.error')}: </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <SmartTopicInput
            label={t('setup.topicLabel')}
            value={topic}
            onChange={setTopic}
          />

          <CustomSelect
            label={t('setup.difficultyLabel')}
            options={DIFFICULTY_LEVELS}
            value={difficulty}
            onChange={(value) => setDifficulty(value as Difficulty)}
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
            {t('setup.startButton')}
          </Button>
        </form>
      </Card>
      
      <footer className="text-center mt-8 py-4">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          &copy; {new Date().getFullYear()} {t('app.title')}.
          {t('app.poweredBy')}.
        </p>
      </footer>
    </div>
  );
};

export default SetupScreen;