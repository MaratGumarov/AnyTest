import React, { useState, useEffect, useCallback } from 'react';
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

const SWIPE_THRESHOLD = 60;
const SWIPE_VELOCITY = 0.4;

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
  canGoPrevious
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const speechState = useSpeechRecognition();

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  // Автозагрузка новых вопросов
  useEffect(() => {
    if (currentIndex >= questions.length - 2 && hasMoreQuestionsToLoad && !isFetchingMore) {
      // Загружаем новые вопросы когда остается 2 вопроса
      const event = new CustomEvent('loadMoreQuestions');
      window.dispatchEvent(event);
    }
  }, [currentIndex, questions.length, hasMoreQuestionsToLoad, isFetchingMore]);

  const currentQuestion = questions[currentIndex];
  const nextQuestion = questions[currentIndex + 1];
  const prevQuestion = questions[currentIndex - 1];

  const executeTransition = useCallback((direction: 'next' | 'prev') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSwipeDirection(direction === 'next' ? 'left' : 'right');
    
    setTimeout(() => {
      if (direction === 'next' && currentQuestion) {
        onNextQuestion(currentQuestion);
      } else if (direction === 'prev') {
        onPreviousQuestion();
      }
      
      setIsTransitioning(false);
      setSwipeOffset(0);
      setSwipeDirection(null);
    }, 300);
  }, [isTransitioning, currentQuestion, onNextQuestion, onPreviousQuestion]);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (isTransitioning) return;
      
      const { deltaX, deltaY } = eventData;
      
      // Проверяем что это горизонтальный свайп
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        const maxOffset = window.innerWidth * 0.8;
        const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
        setSwipeOffset(limitedOffset);
      }
    },
    onSwiped: (eventData) => {
      if (isTransitioning) return;
      
      const { deltaX, velocity } = eventData;
      const shouldSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(velocity) > SWIPE_VELOCITY;
      
      if (shouldSwipe) {
        if (deltaX < 0) {
          // Свайп влево - следующий
          executeTransition('next');
        } else if (deltaX > 0 && canGoPrevious) {
          // Свайп вправо - предыдущий
          executeTransition('prev');
        } else {
          // Возврат в исходное положение
          setSwipeOffset(0);
        }
      } else {
        // Возврат в исходное положение
        setSwipeOffset(0);
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: true,
    trackTouch: true,
    delta: 8,
  });

  const getCardTransform = (position: 'current' | 'next' | 'prev'): React.CSSProperties => {
    let baseTransform = 'translate(-50%, -50%)';
    let opacity = 1;
    let scale = 1;
    let zIndex = 10;
    let filter = 'none';
    
    if (isTransitioning && swipeDirection) {
      if (position === 'current') {
        if (swipeDirection === 'left') {
          baseTransform += ' translateX(-100%)';
          opacity = 0;
          filter = 'blur(2px)';
        } else {
          baseTransform += ' translateX(100%)';
          opacity = 0.8;
        }
      } else if (position === 'next' && swipeDirection === 'left') {
        baseTransform += ' translateX(0%)';
        opacity = 1;
        zIndex = 20;
      } else if (position === 'prev' && swipeDirection === 'right') {
        baseTransform += ' translateX(0%)';
        opacity = 1;
        zIndex = 20;
      }
    } else {
      // Обычное состояние или во время свайпа
      if (position === 'current') {
        if (swipeOffset !== 0) {
          baseTransform += ` translateX(${swipeOffset}px)`;
          opacity = 1 - Math.abs(swipeOffset) / (window.innerWidth * 0.6);
          
          if (Math.abs(swipeOffset) > 30) {
            const blurAmount = Math.min(3, Math.abs(swipeOffset) / 80);
            filter = `blur(${blurAmount}px)`;
          }
        }
        zIndex = 20;
      } else if (position === 'next') {
        baseTransform += ' translateX(100%)';
        opacity = 0.7;
        scale = 0.95;
        zIndex = 5;
      } else if (position === 'prev') {
        baseTransform += ' translateX(-100%)';
        opacity = 0.7;
        scale = 0.95;
        zIndex = 5;
      }
    }

    return {
      transform: `${baseTransform} scale(${scale})`,
      opacity,
      zIndex,
      filter,
      transition: isTransitioning || swipeOffset === 0 ? 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
    };
  };

  const handleManualNext = () => {
    if (!isTransitioning) {
      executeTransition('next');
    }
  };

  const handleManualPrev = () => {
    if (!isTransitioning && canGoPrevious) {
      executeTransition('prev');
    }
  };

  if (!currentQuestion && !isFetchingMore) {
    return (
      <div className="screen flex flex-col items-center justify-center text-center p-8 min-h-[calc(100vh-200px)]">
        <SparklesIcon className="w-16 h-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 mb-4">
            { hasMoreQuestionsToLoad ? "Загружаем еще вопросы..." : "Вопросы закончились!" }
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
            { hasMoreQuestionsToLoad ? "Пожалуйста, подождите немного." : "Вы прошли все доступные вопросы для этой сессии."}
        </p>
        <button
          onClick={onEndSession}
          className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-colors"
        >
          <ListBulletIcon className="mr-2 h-5 w-5" />
          Посмотреть результаты
        </button>
      </div>
    );
  }
  
  if (!currentQuestion && isFetchingMore) {
     return (
        <div className="screen flex flex-col items-center justify-center text-center p-8 min-h-[calc(100vh-200px)]">
            <LoadingSpinner className="w-12 h-12 mb-4" textClassName="text-indigo-500 dark:text-indigo-400" />
            <p className="text-lg text-slate-600 dark:text-slate-400">Генерируем вопросы для вас...</p>
        </div>
     );
  }

  return (
    <div className="screen flex flex-col flex-grow relative overflow-hidden" {...handlers}>
        {/* Индикатор загрузки новых вопросов */}
        {isFetchingMore && (
             <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-3 rounded-full shadow-lg z-30 border border-slate-200 dark:border-slate-700">
                <LoadingSpinner className="h-5 w-5" textClassName="text-indigo-500 dark:text-indigo-400"/>
            </div>
        )}

        {/* Индикатор прогресса */}
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg z-30 border border-slate-200 dark:border-slate-700">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      
       <div className="cards-container">
          {/* Предыдущая карточка */}
          {prevQuestion && canGoPrevious && (
            <QuestionDisplayCard
               key={`prev-${prevQuestion.id}`}
               questionItem={prevQuestion}
               onUserAnswerChange={onUpdateUserAnswer}
               onCheckAnswer={onCheckAnswer}
               onUpdateQuestionState={onUpdateQuestionState}
               speechState={speechState}
               startListening={speechState.startListening}
               stopListening={speechState.stopListening}
               isCurrentCard={false}
               cardStyle={getCardTransform('prev')}
            />
          )}

          {/* Текущая карточка */}
          <QuestionDisplayCard
             key={`current-${currentQuestion.id}`}
             questionItem={currentQuestion}
             onUserAnswerChange={onUpdateUserAnswer}
             onCheckAnswer={onCheckAnswer}
             onUpdateQuestionState={onUpdateQuestionState}
             speechState={speechState}
             startListening={speechState.startListening}
             stopListening={speechState.stopListening}
             isCurrentCard={true}
             cardStyle={getCardTransform('current')}
          />

          {/* Следующая карточка */}
          {nextQuestion && (
            <QuestionDisplayCard
               key={`next-${nextQuestion.id}`}
               questionItem={nextQuestion}
               onUserAnswerChange={onUpdateUserAnswer}
               onCheckAnswer={onCheckAnswer}
               onUpdateQuestionState={onUpdateQuestionState}
               speechState={speechState}
               startListening={speechState.startListening}
               stopListening={speechState.stopListening}
               isCurrentCard={false}
               cardStyle={getCardTransform('next')}
            />
          )}
       </div>

        {/* Элегантная панель управления */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30 p-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 md:absolute md:bottom-8">
            <button
                onClick={onEndSession}
                title="Завершить сессию"
                className="p-3 rounded-xl bg-red-500/90 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400/50 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isTransitioning}
            >
                <XCircleIcon className="w-5 h-5" />
            </button>
            
            <button
                onClick={onViewResults}
                title="Посмотреть результаты"
                className="p-3 rounded-xl bg-green-500/90 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isTransitioning}
            >
                <ListBulletIcon className="w-5 h-5" />
            </button>
            
            <button
                onClick={handleManualPrev}
                title="Предыдущий вопрос"
                className="p-3 rounded-xl bg-slate-500/90 text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/50 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canGoPrevious || isTransitioning}
            >
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            <button
                onClick={handleManualNext}
                title="Следующий вопрос"
                className="p-3 rounded-xl bg-indigo-500/90 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isTransitioning}
            >
                <ArrowRightIcon className="w-5 h-5" />
            </button>
        </div>

        {/* Подсказка для свайпов на мобильных */}
        {currentIndex === 0 && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm md:hidden animate-pulse">
            ← Свайп для навигации →
          </div>
        )}
    </div>
  );
};

export default QuestionSwiper;