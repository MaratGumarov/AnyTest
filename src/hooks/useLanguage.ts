import { useTranslation } from 'react-i18next';

export type Language = 'en' | 'ru' | 'tt';

const LANGUAGES: Language[] = ['en', 'ru', 'tt'];

export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as Language;

  const changeLanguage = (language: Language) => {
    i18n.changeLanguage(language);
  };

  const toggleLanguage = () => {
    const currentIndex = LANGUAGES.indexOf(currentLanguage);
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    changeLanguage(LANGUAGES[nextIndex]);
  };

  const getLanguageName = (lang: Language): string => {
    const names = {
      en: 'English',
      ru: 'Русский',
      tt: 'Татарча',
    };
    return names[lang];
  };

  return {
    currentLanguage,
    availableLanguages: LANGUAGES,
    changeLanguage,
    toggleLanguage,
    getLanguageName,
  };
} 