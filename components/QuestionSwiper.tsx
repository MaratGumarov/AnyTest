import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionItem, SpeechRecognitionState } from '../types';
import QuestionDisplayCard from './QuestionDisplayCard';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { LoadingSpinner, ListBulletIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';
import { Button } from './ui';

interface QuestionSwiperProps {
  questions: QuestionItem[];
  startIndex: number;
  onUpdateUserAnswer: (questionId: string, answer: string) => void;
  onCheckAnswer: (questionId: string) => void;
  onUpdateQuestionState: (questionId: string, updates: Partial<QuestionItem>) => void;
  onViewResults: () => void;
  isFetchingMore: boolean;
  hasMoreQuestionsToLoad: boolean;
}

const QuestionSwiper: React.FC<QuestionSwiperProps> = ({
  questions,
  startIndex,
  onUpdateUserAnswer,
  onCheckAnswer,
  onUpdateQuestionState,
  onViewResults,
  isFetchingMore,
  hasMoreQuestionsToLoad,
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const speechRecognition = useSpeechRecognition();
  const containerRef = useRef<HTMLDivElement>(null);
  const questionsRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Состояние для анимации подсказки свайпа
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  
  // Состояние для отслеживания размера экрана
  const [isDesktop, setIsDesktop] = useState(false);

  // Отслеживание размера экрана
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);



  // Синхронизация с внешним индексом
  useEffect(() => {
    setCurrentIndex(startIndex);
    // Сбрасываем подсказку при программном изменении индекса
    setShowSwipeHint(false);
    lastInteractionRef.current = Date.now();
  }, [startIndex]);

  // Автозагрузка новых вопросов при приближении к концу
  useEffect(() => {
    if (currentIndex >= questions.length - 2 && hasMoreQuestionsToLoad && !isFetchingMore) {
      window.dispatchEvent(new Event('loadMoreQuestions'));
    }
  }, [currentIndex, questions.length, hasMoreQuestionsToLoad, isFetchingMore]);

  // Отслеживание скролла для определения текущей карточки
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const newIndex = Math.round(scrollLeft / containerWidth);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < questions.length) {
      setCurrentIndex(newIndex);
    }
    
    // Отмечаем пользовательское взаимодействие
    setHasUserInteracted(true);
    lastInteractionRef.current = Date.now();
    setShowSwipeHint(false);
    
    // Очищаем таймер подсказки
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
  }, [currentIndex, questions.length]);

  // Настройка обработчика скролла
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Программный скролл к определенной карточке
  const scrollToQuestion = useCallback((index: number) => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const targetScrollLeft = index * containerWidth;
    
    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
  }, []);

  // Синхронизация скролла при изменении текущего индекса извне
  useEffect(() => {
    scrollToQuestion(startIndex);
  }, [startIndex, scrollToQuestion]);

  // Функции навигации
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setHasUserInteracted(true);
      setShowSwipeHint(false);
      scrollToQuestion(currentIndex - 1);
    }
  }, [currentIndex, scrollToQuestion]);

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setHasUserInteracted(true);
      setShowSwipeHint(false);
      scrollToQuestion(currentIndex + 1);
    }
  }, [currentIndex, questions.length, scrollToQuestion]);

  // Функция для показа анимации подсказки свайпа
  const showSwipeHintAnimation = useCallback(() => {
    if (!containerRef.current || hasUserInteracted || questions.length <= 1) return;
    
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    
    // Определяем направление подсказки (вправо если есть следующая карточка, влево если есть предыдущая)
    const canSwipeRight = currentIndex < questions.length - 1;
    const canSwipeLeft = currentIndex > 0;
    
    if (!canSwipeRight && !canSwipeLeft) return;
    
    console.log('Starting swipe hint animation', { currentIndex, canSwipeRight, canSwipeLeft });
    setShowSwipeHint(true);
    
    // Вычисляем текущую позицию карточки
    const currentCardPosition = currentIndex * containerWidth;
    
    // Выбираем направление (приоритет вправо)
    const direction = canSwipeRight ? 'right' : 'left';
    
    // Адаптивный offset в зависимости от размера экрана
    // На мобильных устройствах меньше offset, на десктопе больше
    const isMobile = containerWidth < 768;
    const hintOffset = isMobile 
      ? containerWidth * 0.25  // 25% на мобилке
      : containerWidth * 0.35; // 35% на десктопе для лучшей видимости края
    
    const targetScrollLeft = direction === 'right' 
      ? currentCardPosition + hintOffset 
      : currentCardPosition - hintOffset;
    
    console.log('Animation params:', { 
      currentCardPosition, 
      targetScrollLeft, 
      direction, 
      containerWidth,
      isMobile,
      hintOffset,
      currentScrollLeft: container.scrollLeft 
    });
    
    // Временно отключаем snap для плавной анимации
    container.style.scrollSnapType = 'none';
    container.style.transition = 'scroll-behavior 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    // Анимация подсказки с более плавным easing
    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
    
    // Возвращаем обратно через 800мс (быстрее)
    setTimeout(() => {
      if (containerRef.current && !hasUserInteracted) {
        console.log('Returning to original position');
        container.scrollTo({
          left: currentCardPosition,
          behavior: 'smooth'
        });
        
        // Возвращаем snap через небольшую задержку
        setTimeout(() => {
          if (containerRef.current) {
            container.style.scrollSnapType = 'x mandatory';
            container.style.transition = '';
            setShowSwipeHint(false);
          }
        }, 400);
      }
    }, 800);
  }, [currentIndex, hasUserInteracted, questions.length]);

  // Эффект для запуска анимации подсказки через 3 секунды простоя
  useEffect(() => {
    if (hasUserInteracted || questions.length <= 1) {
      console.log('Hint disabled:', { hasUserInteracted, questionsLength: questions.length });
      return;
    }
    
    console.log('Scheduling hint for index:', currentIndex);
    
    const scheduleHint = () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
      
      hintTimeoutRef.current = setTimeout(() => {
        const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
        console.log('Hint timeout triggered:', { timeSinceLastInteraction, hasUserInteracted });
        if (timeSinceLastInteraction >= 3000 && !hasUserInteracted) {
          showSwipeHintAnimation();
        }
      }, 3000);
    };
    
    scheduleHint();
    
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = null;
      }
    };
  }, [currentIndex, hasUserInteracted, showSwipeHintAnimation, questions.length]);

  // Отслеживание touch событий для определения пользовательского взаимодействия
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = () => {
      setHasUserInteracted(true);
      lastInteractionRef.current = Date.now();
      setShowSwipeHint(false);
      
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = null;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('mousedown', handleTouchStart, { passive: true });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('mousedown', handleTouchStart);
    };
  }, []);



  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{t('questions.loadingQuestions')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Progress indicator */}
      <div className="flex-shrink-0 px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('questions.questionProgress', { current: currentIndex + 1, total: questions.length })}
            {isFetchingMore && ` (${t('questions.loadingMore')})`}
          </span>
          <div className="flex items-center space-x-2">
            {isFetchingMore && <LoadingSpinner className="w-4 h-4" />}
          </div>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-violet-400 dark:to-purple-500 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / Math.max(questions.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Стрелки навигации для десктопа - зафиксированы относительно экрана */}
      {isDesktop && (
        <>
          {/* Левая стрелка */}
          {currentIndex > 0 && (
            <button
              onClick={goToPrevious}
              className="fixed left-6 top-1/2 transform -translate-y-1/2 z-30 
                        bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm
                        hover:bg-white dark:hover:bg-slate-800 
                        border border-slate-200 dark:border-slate-600
                        rounded-full p-3 shadow-lg hover:shadow-xl
                        transition-all duration-200 ease-out
                        hover:scale-110 active:scale-95"
              title="Предыдущий вопрос"
            >
              <ArrowLeftIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          )}
          
          {/* Правая стрелка */}
          {currentIndex < questions.length - 1 && (
            <button
              onClick={goToNext}
              className="fixed right-6 top-1/2 transform -translate-y-1/2 z-30 
                        bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm
                        hover:bg-white dark:hover:bg-slate-800 
                        border border-slate-200 dark:border-slate-600
                        rounded-full p-3 shadow-lg hover:shadow-xl
                        transition-all duration-200 ease-out
                        hover:scale-110 active:scale-95"
              title="Следующий вопрос"
            >
              <ArrowRightIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
          )}
        </>
      )}

      {/* Container with horizontal snap scroll */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden snap-x-container relative"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >

        {/* Тонкая подсказка во время анимации */}
        {showSwipeHint && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <div className="bg-black/10 dark:bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium animate-pulse border border-white/20">
              ← Свайп →
            </div>
          </div>
        )}
        <div className="flex h-full" style={{ width: `${questions.length * 100}%` }}>
          {questions.map((question, index) => (
            <div
              key={question.id}
              ref={(el) => {
                questionsRefs.current[index] = el;
              }}
              className="snap-card"
              style={{
                width: `${100 / questions.length}%`,
                minWidth: `${100 / questions.length}%`,
                maxWidth: `${100 / questions.length}%`,
                scrollSnapAlign: 'center',
                scrollSnapStop: 'always'
              }}
            >
              <div className="h-full flex items-center justify-center px-4 py-2">
                <div className="w-full max-w-2xl">
                  <QuestionDisplayCard
                    questionItem={question}
                    onUserAnswerChange={onUpdateUserAnswer}
                    onCheckAnswer={onCheckAnswer}
                    onUpdateQuestionState={onUpdateQuestionState}
                    speechState={speechRecognition}
                    startListening={speechRecognition.startListening}
                    stopListening={speechRecognition.stopListening}
                    isCurrentCard={index === currentIndex}
                    cardStyle={{}}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator for new questions */}
          {isFetchingMore && (
            <div 
              className="snap-card flex items-center justify-center"
              style={{
                width: `${100 / (questions.length + 1)}%`,
                minWidth: `${100 / (questions.length + 1)}%`,
                maxWidth: `${100 / (questions.length + 1)}%`,
                scrollSnapAlign: 'center'
              }}
            >
              <div className="text-center">
                <LoadingSpinner className="w-8 h-8 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">{t('questions.loadingNewQuestions')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating results button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          size="md"
          onClick={onViewResults}
          className="w-14 h-14 p-0 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 dark:from-violet-500 dark:to-purple-600 dark:hover:from-violet-600 dark:hover:to-purple-700 border-0 transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          title={t('questions.viewResults')}
        >
          <ListBulletIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionSwiper;