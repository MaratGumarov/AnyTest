import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { QuestionItem, SpeechRecognitionState } from '../types';
import { evaluateAnswerWithAPI } from '../services/geminiService';
import Spoiler from './Spoiler';
import { MicrophoneIcon, StopIcon, CheckIcon, EyeIcon } from './icons';
import { Button, Card, Textarea } from './ui';

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
  }, [speechState.transcript, isCurrentCard, localAnswer, onUserAnswerChange, questionItem.id]);

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
      className="question-card h-full overflow-y-auto custom-scrollbar"
      style={cardStyle}
    >
      <div className="flex flex-col p-4 md:p-6 min-h-full">
        {/* Заголовок с темой */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 glass-effect">
            {questionItem.topic}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCorrectAnswerVisibility}
            leftIcon={<EyeIcon className="w-3 h-3" />}
            className="text-xs"
          >
            Ответ
          </Button>
        </div>

        {/* Вопрос */}
        <div className="mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-200 leading-relaxed text-balance">
            {questionItem.questionText}
          </h2>
        </div>

        {/* Правильный ответ */}
        {questionItem.isCorrectAnswerVisible && (
                  <Card variant="glass" padding="sm" className="mb-4 animate-fade-in-up bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:to-teal-500/20 border-emerald-200 dark:border-emerald-400/30">
          <h3 className="font-medium text-emerald-800 dark:text-emerald-300 mb-2 text-sm">✨ Правильный ответ:</h3>
          <p className="text-emerald-700 dark:text-emerald-100 text-sm leading-relaxed whitespace-pre-wrap">
              {questionItem.correctAnswer}
            </p>
          </Card>
        )}

        {/* Поле для ответа */}
        <div className="flex-grow flex flex-col">
          <div className="relative mb-4">
            <Textarea
              ref={textareaRef}
              id={`answer-${questionItem.id}`}
              label="Ваш ответ:"
              value={localAnswer}
              onChange={handleAnswerChange}
              placeholder="Введите ваш ответ здесь..."
              rows={4}
              variant="modern"
              disabled={questionItem.isCheckingAnswer}
            />
            
            {/* Кнопка голосового ввода */}
            {speechState.isSupported && isCurrentCard && (
              <button
                onClick={speechState.isListening ? stopListening : startListening}
                className={`absolute right-3 top-8 p-2 rounded-lg transition-all duration-200 btn-modern ${
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
            <p className="mb-4 text-sm text-red-600 dark:text-red-400 animate-fade-in-up">
              {speechState.error}
            </p>
          )}

          {/* Кнопка проверки ответа */}
          <Button
            onClick={handleCheckAnswer}
            disabled={!localAnswer.trim() || questionItem.isCheckingAnswer}
            variant="primary"
            size="md"
            fullWidth
            isLoading={questionItem.isCheckingAnswer}
            leftIcon={!questionItem.isCheckingAnswer ? <CheckIcon className="w-4 h-4" /> : undefined}
            className="mb-4"
          >
            {questionItem.isCheckingAnswer ? 'Проверяем ответ...' : 'Проверить ответ'}
          </Button>

          {/* Обратная связь */}
          {questionItem.shortFeedback && (
            <div className="space-y-4 animate-fade-in-up">
                        <Card variant="glass" padding="md" className="bg-sky-50 dark:bg-gradient-to-r dark:from-sky-500/20 dark:to-cyan-500/20 border-sky-200 dark:border-sky-400/30">
            <h3 className="font-medium text-sky-900 dark:text-sky-300 mb-2">💡 Краткая оценка:</h3>
            <p className="text-sky-800 dark:text-sky-100 text-sm">{questionItem.shortFeedback}</p>
              </Card>

              {questionItem.detailedFeedback && (
                <Spoiler
                  isOpen={questionItem.isDetailedFeedbackVisible}
                  onToggle={toggleDetailedFeedbackVisibility}
                  title="Подробная обратная связь"
                  className="glass-effect"
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none custom-scrollbar">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{questionItem.detailedFeedback}</ReactMarkdown>
                  </div>
                </Spoiler>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDisplayCard;