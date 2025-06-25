import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { QuestionItem, SessionSettings } from '../types';
import Spoiler from './Spoiler';
import { DownloadIcon, HomeIcon, ListBulletIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon, ArrowUturnLeftIcon } from './icons';
import { APP_TITLE } from '../constants';
import { Button, Card } from './ui';

interface SummaryScreenProps {
  answeredQuestions: QuestionItem[];
  onStartNewSession: () => void;
  onBackToQuestions?: () => void;
  sessionSettings: SessionSettings | null;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ answeredQuestions, onStartNewSession, onBackToQuestions, sessionSettings }) => {
  const { t } = useTranslation();
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
      alert(t('results.noDataToExport'));
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
    <div className="screen container mx-auto max-w-3xl p-4 md:p-6 h-full overflow-y-auto custom-scrollbar">
      <Card variant="default" padding="lg" shadow="xl">
        <div className="text-center mb-8">
          <ListBulletIcon className="w-16 h-16 text-indigo-500 dark:text-indigo-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{t('results.title')}</h2>
          {sessionSettings && (
            <p className="text-slate-700 dark:text-slate-400 mt-2">
              {t('results.topic')}: <span className="font-semibold">{sessionSettings.topic}</span>, 
              {t('results.difficulty')}: <span className="font-semibold">{sessionSettings.difficulty}</span>
            </p>
          )}
        </div>

        {sortedQuestions.length === 0 ? (
          <div className="text-center py-10">
            <SparklesIcon className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-slate-700 dark:text-slate-400">{t('results.noAnswers')}</p>
            <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">{t('results.tryAgain')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedQuestions.map((item, index) => (
              <Card key={item.id} variant="default" padding="none" className="overflow-hidden">
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={() => toggleItemExpansion(item.id)}
                  rightIcon={expandedItems[item.id] ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                  className="p-4 justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-600/50"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {t('results.questionNumber')} {index + 1}: {item.questionText.substring(0, 60)}{item.questionText.length > 60 ? '...' : ''}
                  </span>
                </Button>
                
                {expandedItems[item.id] && (
                  <div className="p-4 bg-white dark:bg-slate-800 space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>{t('results.fullQuestion')}</strong> {item.questionText}
                    </p>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-1">{t('results.yourAnswer')}</h4>
                      <Card variant="glass" padding="sm" className="bg-slate-50 dark:bg-slate-700/70">
                        <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm">
                          {item.userAnswer || <span className="italic">{t('results.noAnswerGiven')}</span>}
                        </div>
                      </Card>
                    </div>
                    
                    {item.correctAnswer && (
                      <Spoiler
                        title={t('results.correctAnswer')}
                        isOpen={!!spoilerVisibility[item.id]?.correctAnswer}
                        onToggle={() => toggleInnerSpoiler(item.id, 'correctAnswer')}
                      >
                        <Card variant="glass" padding="sm" className="bg-emerald-50 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:to-teal-500/20 border-emerald-200 dark:border-emerald-400/30">
                          <div className="text-emerald-700 dark:text-emerald-100 whitespace-pre-wrap text-sm">
                            {item.correctAnswer}
                          </div>
                        </Card>
                      </Spoiler>
                    )}
                    
                    {item.shortFeedback && (
                      <div>
                                                  <h4 className="text-sm font-semibold text-sky-700 dark:text-sky-300 mb-1">💡 {t('results.shortFeedback')}</h4>
                        <Card variant="glass" padding="sm" className="bg-sky-50 dark:bg-gradient-to-r dark:from-sky-500/20 dark:to-cyan-500/20 border-sky-200 dark:border-sky-400/30">
                          <div className="prose prose-sm max-w-none text-sky-600 dark:text-sky-100">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.shortFeedback}</ReactMarkdown>
                          </div>
                        </Card>
                      </div>
                    )}
                    
                    {item.detailedFeedback && (
                      <Spoiler
                        title={t('results.detailedFeedback')}
                        isOpen={!!spoilerVisibility[item.id]?.detailedFeedback}
                        onToggle={() => toggleInnerSpoiler(item.id, 'detailedFeedback')}
                      >
                        <Card variant="glass" padding="sm">
                          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.detailedFeedback}</ReactMarkdown>
                          </div>
                        </Card>
                      </Spoiler>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {onBackToQuestions && (
            <Button
              variant="success"
              size="md"
              onClick={onBackToQuestions}
              leftIcon={<ArrowUturnLeftIcon className="w-5 h-5" />}
              className="flex-1"
            >
              {t('results.backToQuestions')}
            </Button>
          )}
          
          <Button
            variant="primary"
            size="md"
            onClick={onStartNewSession}
            leftIcon={<HomeIcon className="w-5 h-5" />}
            className="flex-1"
          >
            {t('results.newSession')}
          </Button>
          
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportData}
            disabled={answeredQuestions.length === 0}
            leftIcon={<DownloadIcon className="w-5 h-5" />}
            className="flex-1"
          >
            {t('results.exportResults')}
          </Button>
        </div>
      </Card>
      
      <footer className="text-center mt-8 py-4">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          &copy; {new Date().getFullYear()} {t('app.title')}.
          {t('app.poweredBy')}.
        </p>
      </footer>
    </div>
  );
};

export default SummaryScreen;