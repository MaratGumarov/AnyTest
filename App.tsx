
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Difficulty, QuestionItem, GeneratedQuestion, FeedbackResponse, Screen, SessionSettings } from './types';
import { 
  APP_TITLE, APP_MOTTO,
  SCREEN_SETUP, SCREEN_QUESTIONS, SCREEN_SUMMARY, 
  QUESTION_BATCH_SIZE, PRELOAD_THRESHOLD 
} from './constants';
import SetupScreen from './components/SetupScreen';
import QuestionSwiper from './components/QuestionSwiper';
import SummaryScreen from './components/SummaryScreen';
import { generateQuestionsFromAPI, evaluateAnswerWithAPI } from './services/geminiService';
import { generateUUID } from './utils';
import { LoadingSpinner } from './components/icons';

const App: React.FC = () => {
  console.log('[App.tsx] Component rendering/re-rendering');
  const [currentScreen, setCurrentScreen] = useState<Screen>(SCREEN_SETUP);
  const [sessionSettings, setSessionSettings] = useState<SessionSettings | null>(null);
  
  const [questionsQueue, setQuestionsQueue] = useState<QuestionItem[]>([]); // Questions yet to be seen
  const [answeredQuestions, setAnsweredQuestions] = useState<QuestionItem[]>([]); // Questions seen/answered
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const [isFetchingQuestions, setIsFetchingQuestions] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true); // For initial hydration check or setup

  useEffect(() => {
    console.log('[App.tsx] Initial effect runs');
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
        console.warn('[App.tsx] VITE_API_KEY is not set or is still using placeholder value');
        setGlobalError("Ключ API не настроен. Приложение не сможет генерировать вопросы или получать обратную связь.");
    }
    setIsLoadingInitial(false);
    console.log('[App.tsx] Initial loading finished.');
  }, []);

  useEffect(() => {
    console.log('[App.tsx] Current screen changed to:', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    console.log('[App.tsx] Session settings changed:', sessionSettings);
  }, [sessionSettings]);

  const fetchQuestionBatch = useCallback(async (settings: SessionSettings, isInitialBatch: boolean = false) => {
    if (isFetchingQuestions) {
      console.log('[App.tsx] fetchQuestionBatch: Already fetching, returning.');
      return;
    }
    console.log('[App.tsx] fetchQuestionBatch: Starting. Initial:', isInitialBatch, 'Settings:', settings);
    setIsFetchingQuestions(true);
    setGlobalError(null);
    try {
      const generated: GeneratedQuestion[] = await generateQuestionsFromAPI(QUESTION_BATCH_SIZE, settings.difficulty, settings.topic);
      console.log('[App.tsx] fetchQuestionBatch: Questions received from API:', generated.length);
      const newQuestions: QuestionItem[] = generated.map((q) => ({
        id: generateUUID(),
        questionText: q.question,
        correctAnswer: q.answer,
        topic: settings.topic,
        userAnswer: '',
        shortFeedback: null,
        detailedFeedback: null,
        isCorrectAnswerVisible: false,
        isDetailedFeedbackVisible: false,
        isCheckingAnswer: false,
        timestamp: Date.now(), // For potential sorting in summary
      }));

      if (isInitialBatch) {
        setQuestionsQueue(newQuestions);
        setCurrentQuestionIndex(0);
        console.log('[App.tsx] fetchQuestionBatch: Initial batch set. Queue size:', newQuestions.length);
      } else {
        setQuestionsQueue(prev => {
          const updatedQueue = [...prev, ...newQuestions];
          console.log('[App.tsx] fetchQuestionBatch: Additional batch appended. Queue size:', updatedQueue.length);
          return updatedQueue;
        });
      }
      if (newQuestions.length === 0 && isInitialBatch) {
        console.warn('[App.tsx] fetchQuestionBatch: No questions generated for initial batch.');
        setGlobalError("Не удалось сгенерировать вопросы для выбранной темы и сложности. Попробуйте другие настройки.");
        setCurrentScreen(SCREEN_SETUP); // Go back to setup if no questions
      }

    } catch (error) {
      console.error('[App.tsx] fetchQuestionBatch: Error loading questions:', error);
      const message = error instanceof Error ? error.message : "Произошла неизвестная ошибка.";
      setGlobalError(`Не удалось загрузить вопросы: ${message}`);
      if(isInitialBatch) setCurrentScreen(SCREEN_SETUP);
    } finally {
      setIsFetchingQuestions(false);
      console.log('[App.tsx] fetchQuestionBatch: Finished.');
    }
  }, [isFetchingQuestions]);

  const handleStartSession = useCallback((settings: SessionSettings) => {
    console.log('[App.tsx] handleStartSession:', settings);
    setSessionSettings(settings);
    setAnsweredQuestions([]);
    setQuestionsQueue([]);
    setCurrentQuestionIndex(0);
    fetchQuestionBatch(settings, true);
    setCurrentScreen(SCREEN_QUESTIONS);
  }, [fetchQuestionBatch]);

  const handleNextQuestion = useCallback((currentAnsweredQuestion: QuestionItem) => {
    console.log('[App.tsx] handleNextQuestion. Current answered:', currentAnsweredQuestion.id);
    setAnsweredQuestions(prev => [...prev, currentAnsweredQuestion]);
    
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    console.log('[App.tsx] New currentQuestionIndex:', nextIndex);

    // Preload more questions if near the end of the queue
    if (sessionSettings && questionsQueue.length - nextIndex < PRELOAD_THRESHOLD && !isFetchingQuestions) {
      console.log('[App.tsx] Preloading next batch of questions.');
      fetchQuestionBatch(sessionSettings);
    }
    
    if (nextIndex >= questionsQueue.length && !isFetchingQuestions) {
       console.log('[App.tsx] Reached end of current questions queue and not fetching.');
    }
  }, [currentQuestionIndex, questionsQueue.length, sessionSettings, fetchQuestionBatch, isFetchingQuestions]);
  
  const updateUserAnswer = useCallback((questionId: string, answer: string) => {
    // console.log(`[App.tsx] updateUserAnswer for QID: ${questionId}, Answer: ${answer.substring(0,20)}...`);
    setQuestionsQueue(prev => prev.map(q => q.id === questionId ? {...q, userAnswer: answer} : q));
    setAnsweredQuestions(prev => prev.map(q => q.id === questionId ? {...q, userAnswer: answer} : q));
  }, []);

  const updateQuestionState = useCallback((questionId: string, updates: Partial<QuestionItem>) => {
    // console.log(`[App.tsx] updateQuestionState for QID: ${questionId}, Updates:`, updates);
     setQuestionsQueue(prev => prev.map(q => q.id === questionId ? {...q, ...updates} : q));
     setAnsweredQuestions(prev => prev.map(q => q.id === questionId ? {...q, ...updates} : q));
  }, []);


  const handleCheckAnswer = useCallback(async (questionId: string) => {
    const questionToCheck = questionsQueue.find(q => q.id === questionId) || answeredQuestions.find(q => q.id === questionId);
    if (!questionToCheck || !questionToCheck.userAnswer.trim() || !sessionSettings) {
      console.log('[App.tsx] handleCheckAnswer: Conditions not met to check.', {questionId, questionToCheck, sessionSettings});
      return;
    }
    console.log('[App.tsx] handleCheckAnswer: Checking QID:', questionId);
    updateQuestionState(questionId, { isCheckingAnswer: true, shortFeedback: null, detailedFeedback: null, isDetailedFeedbackVisible: false });
    setGlobalError(null);

    try {
      const feedback: FeedbackResponse = await evaluateAnswerWithAPI(
        questionToCheck.questionText,
        questionToCheck.correctAnswer,
        questionToCheck.userAnswer,
        questionToCheck.topic
      );
      console.log('[App.tsx] handleCheckAnswer: Feedback received for QID:', questionId, feedback);
      updateQuestionState(questionId, { shortFeedback: feedback.shortFeedback, detailedFeedback: feedback.detailedFeedback, isCheckingAnswer: false });
    } catch (error) {
      console.error('[App.tsx] handleCheckAnswer: Error checking answer for QID:', questionId, error);
      const message = error instanceof Error ? error.message : "Произошла неизвестная ошибка.";
      setGlobalError(`Не удалось проверить ответ: ${message}`);
      updateQuestionState(questionId, { isCheckingAnswer: false, shortFeedback: `Ошибка при проверке: ${message}` });
    }
  }, [questionsQueue, answeredQuestions, sessionSettings, updateQuestionState]);

  const handleEndSession = useCallback(() => {
    console.log('[App.tsx] handleEndSession triggered.');
    const currentQ = questionsQueue[currentQuestionIndex];
    if (currentQ && (currentQ.userAnswer || currentQ.shortFeedback)) {
       setAnsweredQuestions(prev => {
        if (!prev.find(aq => aq.id === currentQ.id)) {
            console.log('[App.tsx] Adding current active question to answeredQuestions before summary.');
            return [...prev, currentQ];
        }
        return prev;
       });
    }
    setCurrentScreen(SCREEN_SUMMARY);
  }, [questionsQueue, currentQuestionIndex]);

  const handleStartNewSession = useCallback(() => {
    console.log('[App.tsx] handleStartNewSession triggered.');
    setSessionSettings(null);
    setQuestionsQueue([]);
    setAnsweredQuestions([]);
    setCurrentQuestionIndex(0);
    setGlobalError(null);
    setCurrentScreen(SCREEN_SETUP);
  }, []);

  const currentVisibleQuestions = useMemo(() => {
    return questionsQueue;
  }, [questionsQueue]);


  if (isLoadingInitial) {
    console.log('[App.tsx] Rendering initial loading state.');
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
        <LoadingSpinner className="h-12 w-12" />
        <p className="mt-4 text-lg">Загрузка приложения...</p>
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden">
      <header className="p-4 shadow-md bg-white dark:bg-slate-800 sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{APP_TITLE}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">{APP_MOTTO}</p>
          {currentScreen !== SCREEN_SETUP && (
             <button
                onClick={handleStartNewSession}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200"
                title="Начать новую сессию"
             >
                Новая сессия
             </button>
          )}
        </div>
      </header>

      {globalError && (
          <div className="sticky top-16 z-10 m-2">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md shadow-md max-w-xl mx-auto" role="alert">
                <div className="flex">
                    <div className="py-1">
                        <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.414 10l2.829-2.828-1.414-1.414L10 8.586 7.172 5.757 5.757 7.172 8.586 10l-2.829 2.828 1.414 1.414L10 11.414l2.828 2.829 1.414-1.414L11.414 10z"/></svg>
                    </div>
                    <div>
                        <p className="font-bold">Ошибка</p>
                        <p className="text-sm">{globalError}</p>
                    </div>
                     <button onClick={() => setGlobalError(null)} className="ml-auto -mx-1.5 -my-1.5 bg-red-100 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex h-8 w-8 dark:bg-red-200 dark:text-red-600 dark:hover:bg-red-300" aria-label="Dismiss">
                        <span className="sr-only">Закрыть</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </button>
                </div>
            </div>
        </div>
      )}

      <main className="flex-grow overflow-y-auto p-0 md:p-4">
        {currentScreen === SCREEN_SETUP && (
          <SetupScreen onStartSession={handleStartSession} />
        )}
        {currentScreen === SCREEN_QUESTIONS && sessionSettings && (
          <QuestionSwiper
            questions={currentVisibleQuestions}
            startIndex={currentQuestionIndex}
            onNextQuestion={handleNextQuestion}
            onUpdateUserAnswer={updateUserAnswer}
            onCheckAnswer={handleCheckAnswer}
            onUpdateQuestionState={updateQuestionState}
            onEndSession={handleEndSession}
            isFetchingMore={isFetchingQuestions}
            hasMoreQuestionsToLoad={!isFetchingQuestions && questionsQueue.length > currentQuestionIndex +1} // Simplified
          />
        )}
        {currentScreen === SCREEN_SUMMARY && (
          <SummaryScreen
            answeredQuestions={answeredQuestions}
            onStartNewSession={handleStartNewSession}
            sessionSettings={sessionSettings}
          />
        )}
      </main>
    </div>
  );
};

export default App;