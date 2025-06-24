import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { QuestionItem, SpeechRecognitionState } from '../types';
import { evaluateAnswerWithAPI } from '../services/geminiService';
import Spoiler from './Spoiler';
import { MicrophoneIcon, StopIcon, CheckIcon } from './icons';

interface QuestionDisplayCardProps {
  questionItem: QuestionItem;
  onUserAnswerChange: (questionId: string, answer: string) => void;
  onCheckAnswer: (questionId: string) => void;
  onUpdateQuestionState: (questionId: string, updates: Partial<QuestionItem>) => void;
  speechState: SpeechRecognitionState;
  startListening: () => void;
  stopListening: () => void;
  isCurrentCard: boolean;
  cardStyle: React.CSSProperties;
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
  const [localAnswer, setLocalAnswer] = useState(questionItem.userAnswer);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalAnswer(questionItem.userAnswer);
  }, [questionItem.userAnswer]);

  useEffect(() => {
    if (speechState.transcript && isCurrentCard) {
      const newAnswer = localAnswer + speechState.transcript;
      setLocalAnswer(newAnswer);
      onUserAnswerChange(questionItem.id, newAnswer);
    }
  }, [speechState.transcript, isCurrentCard]);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setLocalAnswer(value);
    onUserAnswerChange(questionItem.id, value);
  };

  const handleCheckAnswer = async () => {
    if (!localAnswer.trim()) return;
    
    onCheckAnswer(questionItem.id);
    
    try {
      const feedback = await evaluateAnswerWithAPI(
        questionItem.questionText,
        questionItem.correctAnswer,
        localAnswer,
        questionItem.topic
      );
      
      onUpdateQuestionState(questionItem.id, {
        shortFeedback: feedback.shortFeedback,
        detailedFeedback: feedback.detailedFeedback,
        isCheckingAnswer: false,
      });
    } catch (error) {
      console.error('Ошибка при проверке ответа:', error);
      onUpdateQuestionState(questionItem.id, {
        shortFeedback: 'Ошибка при проверке ответа',
        detailedFeedback: 'Произошла ошибка при получении обратной связи. Попробуйте еще раз.',
        isCheckingAnswer: false,
      });
    }
  };

  const toggleCorrectAnswerVisibility = () => {
    onUpdateQuestionState(questionItem.id, {
      isCorrectAnswerVisible: !questionItem.isCorrectAnswerVisible,
    });
  };

  const toggleDetailedFeedbackVisibility = () => {
    onUpdateQuestionState(questionItem.id, {
      isDetailedFeedbackVisible: !questionItem.isDetailedFeedbackVisible,
    });
  };

  return (
    <div
      ref={cardRef}
      className="swipe-card animate-scale-in"
      style={cardStyle}
    >
      <div className="h-full flex flex-col p-4 md:p-6">
        {/* Заголовок с темой */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 glass-effect">
            {questionItem.topic}
          </span>
        </div>

        {/* Вопрос */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-200 leading-relaxed text-balance">
            {questionItem.questionText}
          </h2>
        </div>

        {/* Поле для ответа */}
        <div className="flex-grow flex flex-col">
          <div className="relative mb-4">
            <label htmlFor={`answer-${questionItem.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Ваш ответ:
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                id={`answer-${questionItem.id}`}
                value={localAnswer}
                onChange={handleAnswerChange}
                placeholder="Введите ваш ответ здесь..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl resize-none 
                         bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100
                         focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         placeholder-slate-400 dark:placeholder-slate-500
                         transition-all duration-200 input-modern custom-scrollbar
                         backdrop-blur-sm"
                disabled={questionItem.isCheckingAnswer}
              />
              
              {/* Кнопка голосового ввода */}
              {speechState.isSupported && isCurrentCard && (
                <button
                  onClick={speechState.isListening ? stopListening : startListening}
                  className={`absolute right-3 top-3 p-2 rounded-lg transition-all duration-200 btn-modern ${
                    speechState.isListening
                      ? 'bg-red-500 text-white hover:bg-red-600 glow-effect'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  title={speechState.isListening ? 'Остановить запись' : 'Начать голосовой ввод'}
                  disabled={questionItem.isCheckingAnswer}
                >
                  {speechState.isListening ? (
                    <StopIcon className="w-4 h-4" />
                  ) : (
                    <MicrophoneIcon className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            
            {speechState.error && isCurrentCard && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-fade-in-up">
                {speechState.error}
              </p>
            )}
          </div>

          {/* Кнопка проверки ответа */}
          <button
            onClick={handleCheckAnswer}
            disabled={!localAnswer.trim() || questionItem.isCheckingAnswer}
            className="w-full mb-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium
                     hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 btn-modern hover-lift active-press
                     dark:focus:ring-offset-slate-800"
          >
            {questionItem.isCheckingAnswer ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Проверяем ответ...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckIcon className="w-4 h-4 mr-2" />
                Проверить ответ
              </div>
            )}
          </button>

          {/* Обратная связь */}
          {questionItem.shortFeedback && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl glass-effect">
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Краткая оценка:</h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">{questionItem.shortFeedback}</p>
              </div>

              {questionItem.detailedFeedback && (
                <Spoiler
                  isOpen={questionItem.isDetailedFeedbackVisible}
                  onToggle={toggleDetailedFeedbackVisibility}
                  title="Подробная обратная связь"
                  className="glass-effect"
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none custom-scrollbar">
                    <ReactMarkdown>{questionItem.detailedFeedback}</ReactMarkdown>
                  </div>
                </Spoiler>
              )}

              {/* Правильный ответ */}
              <Spoiler
                isOpen={questionItem.isCorrectAnswerVisible}
                onToggle={toggleCorrectAnswerVisibility}
                title="Правильный ответ"
                className="glass-effect border-green-200 dark:border-green-800"
              >
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-800 dark:text-green-300 text-sm leading-relaxed">
                    {questionItem.correctAnswer}
                  </p>
                </div>
              </Spoiler>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplayCard;