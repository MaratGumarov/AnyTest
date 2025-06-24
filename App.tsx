import React, { useState, useEffect } from 'react';
import { QuestionItem, InterviewConfig } from './types';
import { generateQuestions } from './services/geminiService';
import ConfigScreen from './components/ConfigScreen';
import QuestionSwiper from './components/QuestionSwiper';
import ResultsScreen from './components/ResultsScreen';
import { LoadingSpinner } from './components/icons';

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

  const handleNextQuestion = (currentAnsweredQuestion: QuestionItem) => {
    // Обновляем текущий вопрос в массиве
    setQuestions(prev => 
      prev.map(q => q.id === currentAnsweredQuestion.id ? currentAnsweredQuestion : q)
    );

    // Переходим к следующему вопросу
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
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

  const handleEndSession = () => {
    setCurrentScreen('results');
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

  const canGoPrevious = currentQuestionIndex > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="w-16 h-16 mb-4 mx-auto" />
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Генерируем вопросы для вас...
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            Это может занять несколько секунд
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2">
            AI Interview Coach
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Подготовка к техническим собеседованиям с ИИ
          </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              Закрыть
            </button>
          </div>
        )}

        {currentScreen === 'config' && (
          <ConfigScreen onStartInterview={handleStartInterview} />
        )}

        {currentScreen === 'questions' && questions.length > 0 && (
          <QuestionSwiper
            questions={questions}
            startIndex={currentQuestionIndex}
            onNextQuestion={handleNextQuestion}
            onPreviousQuestion={handlePreviousQuestion}
            onUpdateUserAnswer={handleUpdateUserAnswer}
            onCheckAnswer={handleCheckAnswer}
            onUpdateQuestionState={handleUpdateQuestionState}
            onEndSession={handleEndSession}
            onViewResults={handleViewResults}
            isFetchingMore={isFetchingMore}
            hasMoreQuestionsToLoad={hasMoreQuestionsToLoad}
            canGoPrevious={canGoPrevious}
          />
        )}

        {currentScreen === 'results' && (
          <ResultsScreen
            questions={questions}
            config={config}
            onBackToQuestions={handleBackToQuestions}
            onStartNewSession={handleStartNewSession}
          />
        )}
      </div>
    </div>
  );
}

export default App;