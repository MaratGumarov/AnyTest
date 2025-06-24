import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QuestionItem, SpeechRecognitionState } from '../types';
import QuestionDisplayCard from './QuestionDisplayCard';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { LoadingSpinner, ListBulletIcon } from './icons';
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
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const speechRecognition = useSpeechRecognition();
  const containerRef = useRef<HTMLDivElement>(null);
  const questionsRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Синхронизация с внешним индексом
  useEffect(() => {
    setCurrentIndex(startIndex);
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
    <div className="w-full h-screen flex flex-col">
      {/* Индикатор прогресса */}
      <div className="flex-shrink-0 px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Вопрос {currentIndex + 1} из {questions.length}
            {isFetchingMore && ' (загружаем ещё...)'}
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

      {/* Контейнер с горизонтальным snap-скроллом */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-x-auto overflow-y-hidden snap-x-container"
        style={{
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
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
          
          {/* Индикатор загрузки новых вопросов */}
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
                <p className="text-slate-600 dark:text-slate-400">Загружаем новые вопросы...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Плавающая кнопка результатов */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="primary"
          size="md"
          onClick={onViewResults}
          leftIcon={<ListBulletIcon className="w-5 h-5" />}
          className="w-14 h-14 p-0 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 dark:from-violet-500 dark:to-purple-600 dark:hover:from-violet-600 dark:hover:to-purple-700 border-0 transform hover:scale-105 transition-all duration-200"
          title="Посмотреть результаты"
        />
      </div>
    </div>
  );
};

export default QuestionSwiper;