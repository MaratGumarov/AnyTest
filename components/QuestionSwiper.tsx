import React, { useState, useEffect, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { QuestionItem, SpeechRecognitionState } from '../types';
import QuestionDisplayCard from './QuestionDisplayCard';
import useSpeechRecognition from '../hooks/useSpeechRecognition'; // Assuming this path
import { LoadingSpinner, ArrowRightIcon, ListBulletIcon, SparklesIcon, XCircleIcon } from './icons';

interface QuestionSwiperProps {
  questions: QuestionItem[];
  startIndex: number;
  onNextQuestion: (currentAnsweredQuestion: QuestionItem) => void;
  onUpdateUserAnswer: (questionId: string, answer: string) => void;
  onCheckAnswer: (questionId: string) => void;
  onUpdateQuestionState: (questionId: string, updates: Partial<QuestionItem>) => void;
  onEndSession: () => void;
  isFetchingMore: boolean;
  hasMoreQuestionsToLoad: boolean;
}

const SWIPE_THRESHOLD = 50; // pixels

const QuestionSwiper: React.FC<QuestionSwiperProps> = ({
  questions,
  startIndex,
  onNextQuestion,
  onUpdateUserAnswer,
  onCheckAnswer,
  onUpdateQuestionState,
  onEndSession,
  isFetchingMore,
  hasMoreQuestionsToLoad
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [cardStyles, setCardStyles] = useState<{ [key: string]: React.CSSProperties }>({});
  const speechState = useSpeechRecognition();

  useEffect(() => {
    setCurrentIndex(startIndex); // Sync with external changes to startIndex
  }, [startIndex]);

  const currentQuestion = questions[currentIndex];

  const handleSwipe = useCallback((deltaX: number) => {
    if (!currentQuestion) return;

    const newCardStyles: React.CSSProperties = {
        transform: `translate(-50%, -50%) translateX(${deltaX}px) rotate(${deltaX / 20}deg)`,
        opacity: 1 - Math.abs(deltaX) / (window.innerWidth / 2),
    };
    setCardStyles({ [currentQuestion.id]: newCardStyles });

    if (Math.abs(deltaX) > SWIPE_THRESHOLD * 2) { // Commit swipe
        if (deltaX < -SWIPE_THRESHOLD) { // Swiped Left (Next question)
            onNextQuestion(currentQuestion);
        }
         // Reset style for the swiped card (it will be unmounted or become non-current)
        setTimeout(() => setCardStyles(prev => ({...prev, [currentQuestion.id]: {}})), 300);
    }
  }, [currentQuestion, onNextQuestion]);


  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if(eventData.dir === "Left" || eventData.dir === "Right") { // Only apply transform for horizontal swipes
        handleSwipe(eventData.deltaX * (eventData.dir === "Left" ? -1 : 1) );
      }
    },
    onSwiped: (eventData) => {
      // Reset style after swipe is done, natural position or off-screen if swiped far enough
      if (currentQuestion) {
        setCardStyles(prev => ({...prev, [currentQuestion.id]: { transition: 'transform 0.3s ease-out, opacity 0.3s ease-out' }}));
      }
    },
    onSwipedLeft: () => {
        if (currentQuestion) {
            onNextQuestion(currentQuestion);
        }
    },
    // onSwipedRight: () => { /* Optional: Go to previous, or other action */ },
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleManualNext = () => {
    if (currentQuestion) {
        onNextQuestion(currentQuestion);
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
        {isFetchingMore && currentIndex > 0 && ( // Show only if not first load
             <div className="absolute top-2 right-2 bg-slate-100 dark:bg-slate-700 p-2 rounded-full shadow-md z-10">
                <LoadingSpinner className="h-5 w-5" textClassName="text-indigo-500 dark:text-indigo-400"/>
            </div>
        )}
      
       {/* Контейнер для карточек */}
       <div className="cards-container">
          {questions.map((q, index) => {
              if (index < currentIndex) return null; // Don't render past cards
              // Only render current and maybe one upcoming card for performance, or use a window
              if (index > currentIndex + 2) return null; 

              const isCurrent = index === currentIndex;
              const zIndex = questions.length - index; // Top card has highest z-index
              let displayStyle: React.CSSProperties = { zIndex };
              
              if (isCurrent) {
                displayStyle = { ...displayStyle, ...cardStyles[q.id] };
              } else {
                 // Style for cards in the background stack
                 displayStyle = {
                    ...displayStyle,
                    transform: `translate(-50%, -50%) translateY(${(index - currentIndex) * 10}px) scale(${1 - (index - currentIndex) * 0.05})`,
                    opacity: 1 - (index - currentIndex) * 0.2,
                    pointerEvents: 'none', // Non-current cards not interactive
                 };
              }

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
                    isCurrentCard={isCurrent}
                    cardStyle={displayStyle}
                />
              );
          })}
       </div>

        {currentQuestion && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-lg">
                 <button
                    onClick={onEndSession}
                    title="Завершить сессию и посмотреть результаты"
                    className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-colors"
                >
                    <XCircleIcon className="w-6 h-6" />
                    <span className="sr-only">Завершить сессию</span>
                </button>
                <button
                    onClick={handleManualNext}
                    title="Следующий вопрос"
                    className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
                    disabled={!hasMoreQuestionsToLoad && currentIndex >= questions.length - 1 && !isFetchingMore}
                >
                    <ArrowRightIcon className="w-6 h-6" />
                    <span className="sr-only">Следующий вопрос</span>
                </button>
            </div>
        )}
    </div>
  );
};

export default QuestionSwiper;