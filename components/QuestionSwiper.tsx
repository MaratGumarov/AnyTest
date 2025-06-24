import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { QuestionItem, SpeechRecognitionState } from '../types';
import QuestionDisplayCard from './QuestionDisplayCard';
import useSpeechRecognition from '../hooks/useSpeechRecognition'; // Assuming this path
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

const SWIPE_THRESHOLD = 80; // Увеличиваем порог для предотвращения случайных свайпов
const VELOCITY_THRESHOLD = 0.3; // Порог скорости для определения намерения

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
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'swipe-next' | 'swipe-prev' | 'return'>('idle');
  const [dragOffset, setDragOffset] = useState(0);
  const speechState = useSpeechRecognition();

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  const currentQuestion = questions[currentIndex];

  const resetAnimation = useCallback(() => {
    setAnimationState('idle');
    setDragOffset(0);
    setIsAnimating(false);
  }, []);

  const executeSwipeNext = useCallback(() => {
    if (!currentQuestion || isAnimating) return;
    
    setIsAnimating(true);
    setAnimationState('swipe-next');
    
    setTimeout(() => {
      onNextQuestion(currentQuestion);
      resetAnimation();
    }, 300);
  }, [currentQuestion, isAnimating, onNextQuestion, resetAnimation]);

  const executeSwipePrev = useCallback(() => {
    if (!canGoPrevious || isAnimating) return;
    
    setIsAnimating(true);
    setAnimationState('swipe-prev');
    
    setTimeout(() => {
      onPreviousQuestion();
      resetAnimation();
    }, 300);
  }, [canGoPrevious, isAnimating, onPreviousQuestion, resetAnimation]);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (isAnimating) return;
      
      // Проверяем, что это горизонтальный свайп
      const isHorizontal = Math.abs(eventData.deltaX) > Math.abs(eventData.deltaY) * 1.5;
      
      if (isHorizontal) {
        // Ограничиваем смещение для предотвращения чрезмерного растягивания
        const maxOffset = window.innerWidth * 0.7;
        const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, eventData.deltaX));
        setDragOffset(limitedOffset);
      }
    },
    onSwiped: (eventData) => {
      if (isAnimating) return;
      
      const { deltaX, velocity } = eventData;
      const absVelocity = Math.abs(velocity);
      const absDeltaX = Math.abs(deltaX);
      
      // Определяем намерение пользователя на основе расстояния и скорости
      const shouldSwipe = absDeltaX > SWIPE_THRESHOLD || absVelocity > VELOCITY_THRESHOLD;
      
      if (shouldSwipe) {
        if (deltaX < 0) {
          // Свайп влево - следующий вопрос
          executeSwipeNext();
        } else if (deltaX > 0 && canGoPrevious) {
          // Свайп вправо - предыдущий вопрос
          executeSwipePrev();
        } else {
          // Возврат в исходное положение
          setAnimationState('return');
          setTimeout(resetAnimation, 300);
        }
      } else {
        // Возврат в исходное положение
        setAnimationState('return');
        setTimeout(resetAnimation, 300);
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: true,
    trackTouch: true,
    delta: 10,
    swipeDuration: 300,
    touchEventOptions: { passive: false },
  });

  const getCardStyle = (questionId: string, index: number): React.CSSProperties => {
    const isCurrent = index === currentIndex;
    const offset = index - currentIndex;
    
    if (!isCurrent) {
      // Стили для фоновых карточек
      return {
        transform: `translate(-50%, -50%) translateY(${offset * 8}px) scale(${1 - Math.abs(offset) * 0.03})`,
        opacity: 1 - Math.abs(offset) * 0.15,
        zIndex: 10 - Math.abs(offset),
        pointerEvents: 'none',
        filter: `blur(${Math.abs(offset) * 2}px)`,
      };
    }

    // Стили для текущей карточки
    let transform = 'translate(-50%, -50%)';
    let opacity = 1;
    let filter = 'none';
    let transition = 'none';

    switch (animationState) {
      case 'swipe-next':
        transform += ' translateX(-100vw)';
        opacity = 0;
        filter = 'blur(10px)';
        transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        break;
        
      case 'swipe-prev':
        transform += ' translateX(100vw)';
        opacity = 1; // Без размытия при возврате
        transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        break;
        
      case 'return':
        transform += ' translateX(0px)';
        opacity = 1;
        transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        break;
        
      default:
        if (dragOffset !== 0) {
          transform += ` translateX(${dragOffset}px)`;
          // Добавляем легкое размытие при сильном смещении
          if (Math.abs(dragOffset) > 50) {
            const blurAmount = Math.min(5, Math.abs(dragOffset) / 50);
            filter = `blur(${blurAmount}px)`;
          }
          // Легкое изменение прозрачности при смещении вправо (к предыдущему)
          if (dragOffset > 0) {
            opacity = Math.max(0.7, 1 - dragOffset / (window.innerWidth * 0.8));
          }
        }
        break;
    }

    return {
      transform,
      opacity,
      filter,
      transition,
      zIndex: 20,
    };
  };

  const handleManualNext = () => {
    if (!isAnimating) {
      executeSwipeNext();
    }
  };

  const handleManualPrev = () => {
    if (!isAnimating) {
      executeSwipePrev();
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
        {isFetchingMore && currentIndex > 0 && (
             <div className="absolute top-2 right-2 bg-slate-100 dark:bg-slate-700 p-2 rounded-full shadow-md z-10">
                <LoadingSpinner className="h-5 w-5" textClassName="text-indigo-500 dark:text-indigo-400"/>
            </div>
        )}
      
       <div className="cards-container">
          {questions.map((q, index) => {
              const isVisible = Math.abs(index - currentIndex) <= 2;
              if (!isVisible) return null;

              return (
                 <QuestionDisplayCard
                    key={q.id}
                    questionItem={q}
                    onUserAnswerChange={onUpdateUserAnswer}
                    onCheckAnswer={onCheckAnswer}
                    onUpdateQuestionState={onUpdateQuestionState}
                    speechState={speechState}
                    startListening={speechState.startListening}
                    stopListening={speechState.stopListening}
                    isCurrentCard={index === currentIndex}
                    cardStyle={getCardStyle(q.id, index)}
                />
              );
          })}
       </div>

        {currentQuestion && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg md:absolute md:bottom-8">
                <button
                    onClick={onEndSession}
                    title="Завершить сессию и посмотреть результаты"
                    className="p-2 md:p-3 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-colors"
                    disabled={isAnimating}
                >
                    <XCircleIcon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="sr-only">Завершить сессию</span>
                </button>
                <button
                    onClick={onViewResults}
                    title="Посмотреть результаты"
                    className="p-2 md:p-3 rounded-full bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
                    disabled={isAnimating}
                >
                    <ListBulletIcon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="sr-only">Посмотреть результаты</span>
                </button>
                <button
                    onClick={handleManualPrev}
                    title="Предыдущий вопрос"
                    className="p-2 md:p-3 rounded-full bg-slate-600 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canGoPrevious || isAnimating}
                >
                    <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="sr-only">Предыдущий вопрос</span>
                </button>
                <button
                    onClick={handleManualNext}
                    title="Следующий вопрос"
                    className="p-2 md:p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(!hasMoreQuestionsToLoad && currentIndex >= questions.length - 1 && !isFetchingMore) || isAnimating}
                >
                    <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="sr-only">Следующий вопрос</span>
                </button>
            </div>
        )}
    </div>
  );
};

export default QuestionSwiper;