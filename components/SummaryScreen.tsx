
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { QuestionItem, SessionSettings } from '../types';
import Spoiler from './Spoiler';
import { DownloadIcon, HomeIcon, ListBulletIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
import { APP_TITLE } from '../constants';

interface SummaryScreenProps {
  answeredQuestions: QuestionItem[];
  onStartNewSession: () => void;
  sessionSettings: SessionSettings | null;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ answeredQuestions, onStartNewSession, sessionSettings }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  // For spoilers within each summary item
  const [spoilerVisibility, setSpoilerVisibility] = useState<Record<string, { correctAnswer?: boolean, detailedFeedback?: boolean }>>({});

  const toggleItemExpansion = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleInnerSpoiler = (itemId: string, spoilerType: 'correctAnswer' | 'detailedFeedback') => {
    setSpoilerVisibility(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [spoilerType]: !prev[itemId]?.[spoilerType]
      }
    }));
  };

  const handleExportData = () => {
    if (answeredQuestions.length === 0) {
      alert("Нет данных для экспорта.");
      return;
    }
    const dataToExport = answeredQuestions.map(q => ({
      topic: q.topic,
      question: q.questionText,
      correctAnswer: q.correctAnswer,
      userAnswer: q.userAnswer,
      shortFeedback: q.shortFeedback,
      detailedFeedback: q.detailedFeedback,
      timestamp: new Date(q.timestamp).toISOString(),
    }));
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    const topicForFilename = (sessionSettings?.topic || 'general').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `interview_summary_${topicForFilename}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const sortedQuestions = [...answeredQuestions].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="screen container mx-auto max-w-3xl p-4 md:p-6">
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-xl">
        <div className="text-center mb-8">
            <ListBulletIcon className="w-16 h-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Результаты сессии</h2>
          {sessionSettings && (
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Тема: <span className="font-semibold">{sessionSettings.topic}</span>, 
              Сложность: <span className="font-semibold">{sessionSettings.difficulty}</span>
            </p>
          )}
        </div>

        {sortedQuestions.length === 0 ? (
          <div className="text-center py-10">
            <SparklesIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Вы не ответили ни на один вопрос в этой сессии.</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Попробуйте пройти сессию еще раз!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedQuestions.map((item, index) => (
              <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleItemExpansion(item.id)}
                  className="w-full flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors"
                  aria-expanded={expandedItems[item.id] || false}
                  aria-controls={`summary-item-content-${item.id}`}
                >
                  <span className="font-medium text-slate-700 dark:text-slate-200 text-left">
                    Вопрос {index + 1}: {item.questionText.substring(0, 60)}{item.questionText.length > 60 ? '...' : ''}
                  </span>
                  {expandedItems[item.id] ? <ChevronUpIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" /> : <ChevronDownIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
                </button>
                {expandedItems[item.id] && (
                  <div id={`summary-item-content-${item.id}`} className="p-4 bg-white dark:bg-slate-800 space-y-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400"><strong>Полный вопрос:</strong> {item.questionText}</p>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ваш ответ:</h4>
                      <div className="prose prose-sm dark:prose-invert max-w-none p-2 rounded bg-slate-50 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {item.userAnswer || <span className="italic">Ответ не был дан.</span>}
                      </div>
                    </div>
                    {item.correctAnswer && (
                       <Spoiler
                          title="Эталонный ответ"
                          isOpen={!!spoilerVisibility[item.id]?.correctAnswer}
                          onToggle={() => toggleInnerSpoiler(item.id, 'correctAnswer')}
                       >
                           <div className="prose prose-sm dark:prose-invert max-w-none p-2 rounded bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 whitespace-pre-wrap">
                                {item.correctAnswer}
                            </div>
                       </Spoiler>
                    )}
                    {item.shortFeedback && (
                      <div>
                        <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Краткая обратная связь:</h4>
                        <div className="prose prose-sm max-w-none text-blue-600 dark:text-blue-200 p-2 rounded bg-blue-50 dark:bg-blue-900/30">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.shortFeedback}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {item.detailedFeedback && (
                       <Spoiler
                          title="Подробная обратная связь"
                          isOpen={!!spoilerVisibility[item.id]?.detailedFeedback}
                          onToggle={() => toggleInnerSpoiler(item.id, 'detailedFeedback')}
                       >
                            <div className="prose prose-sm dark:prose-invert max-w-none p-2 rounded bg-slate-50 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
                               <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.detailedFeedback}</ReactMarkdown>
                            </div>
                       </Spoiler>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onStartNewSession}
            className="w-full sm:w-auto flex-1 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 transition-colors"
          >
            <HomeIcon className="mr-2 h-5 w-5" />
            Начать новую сессию
          </button>
          <button
            onClick={handleExportData}
            disabled={answeredQuestions.length === 0}
            className="w-full sm:w-auto flex-1 flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <DownloadIcon className="mr-2 h-5 w-5" />
            Экспортировать результаты
          </button>
        </div>
      </div>
        <footer className="text-center mt-8 py-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} {APP_TITLE}.
                 На базе Gemini API.
            </p>
        </footer>
    </div>
  );
};

export default SummaryScreen;