
import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { QuestionItem, SpeechRecognitionState } from '../types';
import Spoiler from './Spoiler';
import { LoadingSpinner, MicrophoneIcon, StopCircleIcon, CheckCircleIcon, QuestionMarkCircleIcon, InformationCircleIcon } from './icons';

interface QuestionDisplayCardProps {
  questionItem: QuestionItem;
  onUserAnswerChange: (questionId: string, answer: string) => void;
  onCheckAnswer: (questionId: string) => void;
  onUpdateQuestionState: (questionId: string, updates: Partial<QuestionItem>) => void;
  speechState: SpeechRecognitionState;
  startListening: () => void;
  stopListening: () => void;
  isCurrentCard: boolean; // To enable/disable interactions on non-active cards
  cardStyle?: React.CSSProperties; // For swipe animations
}

const QuestionDisplayCard: React.FC<QuestionDisplayCardProps> = ({
  questionItem,
  onUserAnswerChange,
  onCheckAnswer,
  onUpdateQuestionState,
  speechState,
  startListening,
  stopListening,
  isCurrentCard,
  cardStyle,
}) => {
  const { 
    id, questionText, userAnswer, shortFeedback, detailedFeedback, 
    isCorrectAnswerVisible, isDetailedFeedbackVisible, isCheckingAnswer 
  } = questionItem;

  const [localUserAnswer, setLocalUserAnswer] = useState(userAnswer);

  useEffect(() => {
    // Sync local state if the userAnswer prop changes (e.g., loaded from history, or reset)
    // This typically happens when the card becomes current or props are externally updated.
    setLocalUserAnswer(userAnswer);
  }, [userAnswer, id]); // Rerun if userAnswer prop changes or card ID changes
  
  // Update parent state on blur or significant pause to avoid excessive re-renders during typing
  const handleAnswerBlur = () => {
    if (localUserAnswer !== userAnswer) { // Only update if there's a change
        onUserAnswerChange(id, localUserAnswer);
    }
  };

  // Update text area if speech recognition provides new transcript
  useEffect(() => {
    if (speechState.transcript && speechState.isListening && isCurrentCard) {
      // Append transcript. Consider replacing or smarter merging.
      const newAnswer = localUserAnswer ? `${localUserAnswer} ${speechState.transcript}` : speechState.transcript;
      setLocalUserAnswer(newAnswer);
      // Immediately update parent state for voice input
      onUserAnswerChange(id, newAnswer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [speechState.transcript, speechState.isListening]); // Intentionally not including localUserAnswer to avoid loops.
                                                        // onUserAnswerChange should be stable.
                                                        // id and isCurrentCard ensure it only applies to the active card's transcript.

  const handleToggleCorrectAnswer = () => {
    onUpdateQuestionState(id, { isCorrectAnswerVisible: !isCorrectAnswerVisible });
  };

  const handleToggleDetailedFeedback = () => {
    onUpdateQuestionState(id, { isDetailedFeedbackVisible: !isDetailedFeedbackVisible });
  };
  
  const handleRecordButtonClick = () => {
    if (!isCurrentCard) return;
    if (speechState.isListening) {
      stopListening();
       if (localUserAnswer !== userAnswer) { // Ensure final voice input is saved
        onUserAnswerChange(id, localUserAnswer);
      }
    } else {
      startListening(); // This will clear previous transcript in useSpeechRecognition
    }
  };

  const canCheckAnswer = useMemo(() => localUserAnswer.trim().length > 0 && !isCheckingAnswer, [localUserAnswer, isCheckingAnswer]);

  return (
    <div 
        className="swipe-card bg-white dark:bg-slate-800 rounded-xl shadow-xl flex flex-col p-1 border border-transparent"
        style={cardStyle}
        aria-labelledby={`question-title-${id}`}
    >
        <div className="swipe-card-content p-3 md:p-5 flex-grow flex flex-col">
            <h3 id={`question-title-${id}`} className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2 md:mb-3">
                {questionText}
            </h3>

            <div className="flex-grow space-y-3 mb-3">
                <div>
                <label htmlFor={`userAnswer-${id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Ваш ответ:
                </label>
                <textarea
                    id={`userAnswer-${id}`}
                    rows={4}
                    className="w-full p-2 md:p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-70 resize-none"
                    value={localUserAnswer}
                    onChange={(e) => setLocalUserAnswer(e.target.value)}
                    onBlur={handleAnswerBlur} // Update on blur
                    placeholder="Напишите или надиктуйте свой ответ..."
                    disabled={!isCurrentCard || isCheckingAnswer || speechState.isListening}
                    aria-label={`Ваш ответ на вопрос: ${questionText}`}
                    style={{ touchAction: 'manipulation' }} // Улучшенное сенсорное управление
                />
                 {speechState.isSupported && isCurrentCard && (
                    <div className="mt-1.5">
                         <button
                            type="button"
                            onClick={handleRecordButtonClick}
                            disabled={!isCurrentCard || isCheckingAnswer}
                            className={`w-full flex items-center justify-center px-3 py-1.5 md:px-4 md:py-2 border text-xs md:text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ${
                                speechState.isListening 
                                ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400' 
                                : 'bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400 dark:bg-sky-600 dark:hover:bg-sky-700'
                            } disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed`}
                        >
                            {speechState.isListening 
                                ? <><StopCircleIcon className="mr-2 h-5 w-5" /> Остановить запись</>
                                : <><MicrophoneIcon className="mr-2 h-5 w-5" /> Записать ответ голосом</>
                            }
                        </button>
                        {speechState.error && <p className="text-xs text-red-500 mt-1">{speechState.error}</p>}
                    </div>
                 )}
                </div>

                <Spoiler
                    title="Показать/Скрыть правильный ответ"
                    isOpen={isCorrectAnswerVisible}
                    onToggle={handleToggleCorrectAnswer}
                >
                <div className="prose prose-xs md:prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 p-2 bg-slate-50 dark:bg-slate-700/50 rounded whitespace-pre-wrap text-xs md:text-sm">
                    {questionItem.correctAnswer}
                </div>
                </Spoiler>
            </div>
            
            <div className="mt-auto space-y-2 md:space-y-3"> {/* Buttons and feedback at the bottom */}
                <button
                    type="button"
                    onClick={() => { if(isCurrentCard) onCheckAnswer(id);}}
                    disabled={!isCurrentCard || !canCheckAnswer || speechState.isListening}
                    className="w-full flex items-center justify-center px-4 py-2 md:px-6 md:py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800 disabled:bg-green-300 dark:disabled:bg-green-700 disabled:cursor-not-allowed transition-colors duration-150"
                >
                    {isCheckingAnswer ? <LoadingSpinner className="mr-2" /> : <CheckCircleIcon className="mr-2 h-5 w-5" />}
                    {isCheckingAnswer ? 'Проверка...' : 'Проверить ответ'}
                </button>

                {shortFeedback && (
                <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded-md">
                    <h4 className="text-xs md:text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1 flex items-center">
                        <InformationCircleIcon className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2"/>
                        Краткая обратная связь:
                    </h4>
                    <div className="prose prose-xs md:prose-sm max-w-none text-blue-600 dark:text-blue-200 text-xs md:text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{shortFeedback}</ReactMarkdown>
                    </div>
                    {detailedFeedback && (
                    <button
                        type="button"
                        onClick={handleToggleDetailedFeedback}
                        className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 focus:outline-none font-medium"
                    >
                        {isDetailedFeedbackVisible ? 'Скрыть детали' : 'Подробнее...'}
                    </button>
                    )}
                </div>
                )}

                {isDetailedFeedbackVisible && detailedFeedback && (
                <div className="p-2 md:p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 rounded-md">
                    <h4 className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Подробная обратная связь:</h4>
                    <div className="prose prose-xs md:prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-xs md:text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{detailedFeedback}</ReactMarkdown>
                    </div>
                </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default QuestionDisplayCard;