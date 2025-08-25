import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';

// Import translation files
import tr from './locales/tr.json';
import en from './locales/en.json';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
};

// Get device language
const deviceLanguage = getLocales()[0]?.languageCode || 'tr';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage === 'tr' ? 'tr' : 'en', // Default to Turkish
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;