import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import vi from './locales/vi.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'vi', // Ngôn ngữ mặc định
  fallbackLng: 'en',
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  interpolation: { escapeValue: false },
});

export default i18n;

// How to use:
// import { useTranslation } from 'react-i18next';

// const { t } = useTranslation();

// <Text>{t('login')}</Text>


// CHange language dynamically:
// import i18n from '../i18n';

// i18n.changeLanguage('en'); // or 'vi'