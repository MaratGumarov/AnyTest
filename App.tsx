import React, { useState, useEffect } from 'react';
import { QuestionItem, InterviewConfig } from './types';
import { generateQuestions } from './services/geminiService';
import SetupScreen from './components/SetupScreen';
import QuestionSwiper from './components/QuestionSwiper';
import SummaryScreen from './components/SummaryScreen';
import { LoadingSpinner } from './components/icons';
import { Button } from './components/ui';
import ThemeToggle from './components/ThemeToggle';

type AppScreen = 'config' | 'questions' | 'results';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('config');
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMoreQuestionsToLoad, setHasMoreQuestionsToLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Обработчик автозагрузки новых вопросов
  useEffect(() => {
    const handleLoadMoreQuestions = async () => {
      if (!config || isFetchingMore || !hasMoreQuestionsToLoad) return;
      
      setIsFetchingMore(true);
      try {
        const newQuestions = await generateQuestions(config);
        if (newQuestions.length > 0) {
          setQuestions(prev => [...prev, ...newQuestions]);
        } else {
          setHasMoreQuestionsToLoad(false);
        }
      } catch (error) {
        console.error('Ошибка при загрузке дополнительных вопросов:', error);
        setHasMoreQuestionsToLoad(false);
      } finally {
        setIsFetchingMore(false);
      }
    };

    window.addEventListener('loadMoreQuestions', handleLoadMoreQuestions);
    return () => window.removeEventListener('loadMoreQuestions', handleLoadMoreQuestions);
  }, [config, isFetchingMore, hasMoreQuestionsToLoad]);

  const handleStartInterview = async (interviewConfig: InterviewConfig) => {
    setConfig(interviewConfig);
    setError(null);
    setIsLoading(true);
    setHasMoreQuestionsToLoad(true);

    try {
      const initialQuestions = await generateQuestions(interviewConfig);
      setQuestions(initialQuestions);
      setCurrentQuestionIndex(0);
      setCurrentScreen('questions');
    } catch (error) {
      console.error('Ошибка при генерации вопросов:', error);
      setError('Не удалось сгенерировать вопросы. Пожалуйста, проверьте ваш API ключ и попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };



  const handleUpdateUserAnswer = (questionId: string, answer: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, userAnswer: answer } : q
      )
    );
  };

  const handleCheckAnswer = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, isCheckingAnswer: true } : q
      )
    );
  };

  const handleUpdateQuestionState = (questionId: string, updates: Partial<QuestionItem>) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    );
  };



  const handleViewResults = () => {
    setCurrentScreen('results');
  };

  const handleBackToQuestions = () => {
    setCurrentScreen('questions');
  };

  const handleStartNewSession = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setConfig(null);
    setError(null);
    setHasMoreQuestionsToLoad(true);
    setCurrentScreen('config');
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-violet-800 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="w-16 h-16 mb-4 mx-auto" />
          <p className="text-xl text-slate-800 dark:text-slate-400">
            Генерируем вопросы для вас...
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-500 mt-2">
            Это может занять несколько секунд
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-violet-800 overflow-hidden">
      {/* Переключатель темы - показываем только на экранах с вопросами и результатами */}
      {currentScreen !== 'config' && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle variant="compact" />
        </div>
      )}
      
      <div className="container mx-auto px-4 py-2 max-w-4xl h-screen">
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-0 h-auto"
            >
              Закрыть
            </Button>
          </div>
        )}

        {currentScreen === 'config' && (
          <SetupScreen onStartSession={handleStartInterview} />
        )}

        {currentScreen === 'questions' && questions.length > 0 && (
          <QuestionSwiper
            questions={questions}
            startIndex={currentQuestionIndex}
            onUpdateUserAnswer={handleUpdateUserAnswer}
            onCheckAnswer={handleCheckAnswer}
            onUpdateQuestionState={handleUpdateQuestionState}
            onViewResults={handleViewResults}
            isFetchingMore={isFetchingMore}
            hasMoreQuestionsToLoad={hasMoreQuestionsToLoad}
          />
        )}

        {currentScreen === 'results' && (
          <SummaryScreen
            answeredQuestions={questions}
            sessionSettings={config}
            onBackToQuestions={handleBackToQuestions}
            onStartNewSession={handleStartNewSession}
          />
        )}
      </div>
    </div>
  );
}

export default App;