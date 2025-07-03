import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage, type Language } from '../hooks/useLanguage';
import { ChevronDownIcon } from '../../components/icons';
import { Button } from '../../components/ui';

interface LanguageOption {
  code: Language;
  name: string;
}

const languageOptions: LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Русский' },
  { code: 'tt', name: 'Татарча' },
  { code: 'uk', name: 'Українська' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
];

interface LanguageSelectorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'compact';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'button'
}) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = languageOptions.find(option => option.code === currentLanguage) || languageOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (language: Language) => {
    changeLanguage(language);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  if (variant === 'compact') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className={`
            p-2 rounded-lg transition-all duration-200
            bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600
            text-slate-700 dark:text-slate-300
            border border-slate-300 dark:border-slate-600
            shadow-sm hover:shadow-md
            hover:scale-105 active:scale-95
            flex items-center gap-1
            ${className}
          `}
          title={t('language.tooltip', { language: currentOption.name })}
        >
          <span className="text-sm font-medium">{currentOption.code.toUpperCase()}</span>
          <ChevronDownIcon 
            className={`w-3 h-3 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            {/* Menu */}
            <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600 shadow-lg overflow-hidden animate-fade-in-down min-w-[120px]">
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  onClick={() => handleLanguageSelect(option.code)}
                  className={`w-full flex items-center px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-150 ${
                    option.code === currentLanguage 
                      ? 'bg-slate-100 dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 font-medium' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size={size}
        onClick={toggleDropdown}
        rightIcon={
          <ChevronDownIcon 
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        }
        className={`
          transition-all duration-200 hover:scale-105 active:scale-95
          ${className}
        `}
        title={t('language.tooltip', { language: currentOption.name })}
      >
        {currentOption.name}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Menu */}
          <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-fade-in-down min-w-[140px]">
            {languageOptions.map((option) => (
              <button
                key={option.code}
                onClick={() => handleLanguageSelect(option.code)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-150 ${
                  option.code === currentLanguage 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex-1">{option.name}</span>
                {option.code === currentLanguage && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}; 