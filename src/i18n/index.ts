import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../../locales/en/common.json';
import ruCommon from '../../locales/ru/common.json';
import ttCommon from '../../locales/tt/common.json';
import ukCommon from '../../locales/uk/common.json';
import esCommon from '../../locales/es/common.json';
import ptCommon from '../../locales/pt/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  ru: {
    common: ruCommon,
  },
  tt: {
    common: ttCommon,
  },
  uk: {
    common: ukCommon,
  },
  es: {
    common: esCommon,
  },
  pt: {
    common: ptCommon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Development options
    debug: import.meta.env.DEV,
  });

export default i18n; 