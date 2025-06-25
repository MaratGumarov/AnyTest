import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingScreenProps {
  startTime: number; // Loading start timestamp
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ startTime }) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const targetDuration = 7000; // 7 seconds - expected duration
    const updateInterval = 50; // Update every 50ms for smoothness
    
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < targetDuration) {
        // First 7 seconds - linear progress to 90%
        const linearProgress = Math.min((elapsed / targetDuration) * 90, 90);
        setProgress(linearProgress);
      } else {
        // After 7 seconds - slowly crawl to 95%
        const overtime = elapsed - targetDuration;
        const slowProgress = 90 + Math.min((overtime / 5000) * 5, 5); // +5% over next 5 seconds
        setProgress(Math.min(slowProgress, 95));
      }
    }, updateInterval);

    return () => clearInterval(timer);
  }, [startTime]);

  // Text pulsing effect
  const [textPulse, setTextPulse] = useState(false);
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setTextPulse(prev => !prev);
    }, 2000);
    
    return () => clearInterval(pulseTimer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-violet-800 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Main title */}
        <h2 className={`text-2xl font-medium text-slate-800 dark:text-slate-200 mb-3 transition-opacity duration-500 ${textPulse ? 'opacity-70' : 'opacity-100'}`}>
          {t('questions.loading')}
        </h2>
        
        {/* Subtitle */}
        <p className="text-base text-slate-600 dark:text-slate-400 mb-12">
          {t('questions.loadingSubtext')}
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-sm mx-auto">
          {/* Progress track */}
          <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-3 overflow-hidden shadow-inner">
            {/* Progress fill */}
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-violet-400 dark:to-purple-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              {/* Animated shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                   style={{ 
                     animation: 'shimmer 2s infinite',
                     backgroundSize: '200% 100%'
                   }} />
            </div>
          </div>
        </div>

        {/* Progress-based status messages */}
        <div className="mt-8 text-sm text-slate-500 dark:text-slate-400 min-h-[1.5rem]">
          {progress < 30 && (
            <span className="animate-fade-in">{t('questions.loadingStatus.analyzing')}</span>
          )}
          {progress >= 30 && progress < 60 && (
            <span className="animate-fade-in">{t('questions.loadingStatus.generating')}</span>
          )}
          {progress >= 60 && progress < 90 && (
            <span className="animate-fade-in">{t('questions.loadingStatus.preparing')}</span>
          )}
          {progress >= 90 && (
            <span className="animate-fade-in">{t('questions.loadingStatus.almostReady')}</span>
          )}
        </div>
      </div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen; 