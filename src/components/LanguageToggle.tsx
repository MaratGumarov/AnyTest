import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage, type Language } from '../hooks/useLanguage';
import Select from '../../components/ui/Select';

interface LanguageToggleProps {
  variant?: 'button' | 'compact' | 'select';
}

const LanguageIcon: React.FC<{ language: Language }> = ({ language }) => {
  const iconProps = {
    className: "w-5 h-5",
    fill: "currentColor",
    viewBox: "0 0 24 24"
  };

  if (language === 'en') {
    return (
      <svg {...iconProps}>
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
      </svg>
    );
  }

  if (language === 'tt') {
    return (
      <svg {...iconProps}>
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
        <text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor">ТТ</text>
      </svg>
    );
  }

  // Russian language icon
  return (
    <svg {...iconProps}>
      <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
      <circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1"/>
    </svg>
  );
};

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  variant = 'select' 
}) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, getLanguageName, availableLanguages } = useLanguage();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as Language;
    changeLanguage(newLanguage);
  };

  const languageOptions = availableLanguages.map(lang => ({
    value: lang,
    label: getLanguageName(lang)
  }));

  if (variant === 'select') {
    return (
      <div className="w-auto min-w-[140px]">
        <Select
          options={languageOptions}
          value={currentLanguage}
          onChange={handleLanguageChange}
          variant="modern"
          fullWidth={false}
          className="text-sm py-2 px-3"
        />
      </div>
    );
  }

  // Legacy button variants for backward compatibility
  const handleClick = () => {
    const currentIndex = availableLanguages.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    changeLanguage(availableLanguages[nextIndex]);
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 shadow-sm hover:shadow-md"
        title={t('language.tooltip', { language: getLanguageName(currentLanguage) })}
      >
        <LanguageIcon language={currentLanguage} />
        <span className="text-sm font-medium">
          {getLanguageName(currentLanguage)}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
      title={t('language.tooltip', { language: getLanguageName(currentLanguage) })}
    >
      <LanguageIcon language={currentLanguage} />
    </button>
  );
}; 