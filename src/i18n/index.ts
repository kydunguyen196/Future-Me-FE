import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import vi from './locales/vi.json';

// Pluralization utility function
export const getPluralKey = (key: string, count: number): string => {
  if (count === 1) {
    return key;
  }
  return `${key}_plural`;
};

// Helper function to get pluralized translation
export const tPlural = (key: string, count: number, options?: any) => {
  const pluralKey = getPluralKey(key, count);
  return i18n.t(pluralKey, { count, ...options });
};

// Custom hook for pluralization
export const usePluralTranslation = () => {
  const { t } = useTranslation();
  
  const tPlural = (key: string, count: number, options?: any) => {
    const pluralKey = getPluralKey(key, count);
    return t(pluralKey, { count, ...options });
  };

  return { t, tPlural };
};

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    // Enable pluralization
    pluralSeparator: '_',
    // Plural rules
    lng: 'en', // default language
  });

export default i18n;