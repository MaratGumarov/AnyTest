import React, { useState, useEffect } from 'react';
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

const SWIPE_THRESHOLD = 50;

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
  const speechState = useSpeechRecognition();

  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  const currentQuestion = questions[currentIndex];

  const handlers = useSwipeable({
    onSwiped: (eventData) => {
      const { deltaX } = eventData;
      
      if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX < 0) {
          // Свайп влево - следующий вопрос
          if (currentQuestion) {
            onNextQuestion(currentQuestion);
          }
        } else if (deltaX > 0 && canGoPrevious) {
          // Свайп вправо - предыдущий вопрос
          onPreviousQuestion();
        }
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: true,
    trackTouch: true,
    delta: 10,
  });

  const handleManualNext = () => {
    if (currentQuestion) {
      onNextQuestion(currentQuestion);
    }
  };

  const handleManualPrev = () => {
    onPreviousQuestion();
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
          <QuestionDisplayCard
             key={currentQuestion.id}
             questionItem={currentQuestion}
             onUserAnswerChange={onUpdateUserAnswer}
             onCheckAnswer={onCheckAnswer}
             onUpdateQuestionState={onUpdateQuestionState}
             speechState={speechState}
             startListening={speechState.startListening}
             stopListening={speechState.stopListening}
             isCurrentCard={true}
             cardStyle={{}}
          />
       </div>

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg md:absolute md:bottom-8">
            <button
                onClick={onEndSession}
                title="Завершить сессию и посмотреть результаты"
                className="p-2 md:p-3 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-colors"
            >
                <XCircleIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="sr-only">Завершить сессию</span>
            </button>
            <button
                onClick={onViewResults}
                title="Посмотреть результаты"
                className="p-2 md:p-3 rounded-full bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
            >
                <ListBulletIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="sr-only">Посмотреть результаты</span>
            </button>
            <button
                onClick={handleManualPrev}
                title="Предыдущий вопрос"
                className="p-2 md:p-3 rounded-full bg-slate-600 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canGoPrevious}
            >
                <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="sr-only">Предыдущий вопрос</span>
            </button>
            <button
                onClick={handleManualNext}
                title="Следующий вопрос"
                className="p-2 md:p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!hasMoreQuestionsToLoad && currentIndex >= questions.length - 1 && !isFetchingMore}
            >
                <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="sr-only">Следующий вопрос</span>
            </button>
        </div>
    </div>
  );
};

export default QuestionSwiper;