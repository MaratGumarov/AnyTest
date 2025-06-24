import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { QuestionItem, SpeechRecognitionState } from '../types';
import QuestionDisplayCard from './QuestionDisplayCard';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { LoadingSpinner, ArrowRightIcon, ArrowLeftIcon, ListBulletIcon, SparklesIcon, XCircleIcon } from './icons';

interface QuestionSwiperProps {
  questions: QuestionItem[];
  startIndex: number;
  onNextQuestion: (currentAnsweredQuestion: QuestionItem) => void;
  onPreviousQuestion: () => void;
  onUpdateUserAnswer: (questionId: string, answer: string) => void;
  onCheckAnswer: (questionId: string) => void;
  onUpdateQuestionState: (questionId: string, updates: Partial<QuestionItem>) => void;
  onEndSession: () => void;
  onViewResults: () => void;
  isFetchingMore: boolean;
  hasMoreQuestionsToLoad: boolean;
  canGoPrevious: boolean;
}

const QuestionSwiper: React.FC<QuestionSwiperProps> = ({
  questions,
  startIndex,
  onNextQuestion,
  onPreviousQuestion,
  onUpdateUserAnswer,
  onCheckAnswer,
  onUpdateQuestionState,
  onEndSession,
  onViewResults,
  isFetchingMore,
  hasMoreQuestionsToLoad,
  canGoPrevious,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const speechRecognition = useSpeechRecognition();

  // Синхронизация с внешним индексом
  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  // Автозагрузка новых вопросов
  useEffect(() => {
    if (currentIndex >= questions.length - 2 && hasMoreQuestionsToLoad && !isFetchingMore) {
      window.dispatchEvent(new Event('loadMoreQuestions'));
    }
  }, [currentIndex, questions.length, hasMoreQuestionsToLoad, isFetchingMore]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    setIsTransitioning(true);
    
    // Переход к следующему вопросу
    setTimeout(() => {
      onNextQuestion(currentQuestion);
      setIsTransitioning(false);
    }, 300);
  }, [currentIndex, questions, onNextQuestion, isTransitioning]);

  const handlePrevious = useCallback(() => {
    if (isTransitioning || !canGoPrevious) return;
    
    setIsTransitioning(true);
    
    setTimeout(() => {
      onPreviousQuestion();
      setIsTransitioning(false);
    }, 300);
  }, [onPreviousQuestion, canGoPrevious, isTransitioning]);

  // Обработка свайпов
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrevious,
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
    delta: 50,
  });

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Загрузка вопросов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Индикатор прогресса */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Вопрос {currentIndex + 1} из {questions.length}
            {isFetchingMore && ' (загружаем ещё...)'}
          </span>
          <div className="flex items-center space-x-2">
            {isFetchingMore && <LoadingSpinner className="w-4 h-4" />}
            <SparklesIcon className="w-4 h-4 text-indigo-500" />
          </div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Контейнер карточек */}
      <div 
        {...swipeHandlers}
        className="relative w-full flex items-center justify-center"
        style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}
      >
        {/* Единственная центрированная карточка */}
        <div 
          className={`w-full max-w-2xl transition-all duration-300 ease-out ${
            isTransitioning ? 'opacity-90 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <QuestionDisplayCard
            questionItem={currentQuestion}
            onUserAnswerChange={onUpdateUserAnswer}
            onCheckAnswer={onCheckAnswer}
            onUpdateQuestionState={onUpdateQuestionState}
            speechState={speechRecognition}
            startListening={speechRecognition.startListening}
            stopListening={speechRecognition.stopListening}
            isCurrentCard={true}
            cardStyle={{}}
          />
        </div>
      </div>

      {/* Кнопки навигации */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-2xl p-3 shadow-lg border border-white/20 dark:border-slate-700/50">
          {/* Предыдущий вопрос */}
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious || isTransitioning}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-modern"
            title="Предыдущий вопрос"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          {/* Следующий вопрос */}
          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-modern glow-effect"
            title="Следующий вопрос"
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>

          {/* Посмотреть результаты */}
          <button
            onClick={onViewResults}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-all duration-200 btn-modern"
            title="Посмотреть результаты"
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>

          {/* Завершить сессию */}
          <button
            onClick={onEndSession}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200 btn-modern"
            title="Завершить сессию"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Индикатор загрузки новых вопросов */}
      {isFetchingMore && (
        <div className="fixed top-4 right-4 z-20">
          <div className="flex items-center space-x-2 bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg">
            <LoadingSpinner className="w-4 h-4" />
            <span className="text-sm font-medium">Загружаем новые вопросы...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionSwiper;