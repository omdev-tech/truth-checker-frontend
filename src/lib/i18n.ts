import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files directly
import enCommon from '../../public/locales/en/common.json';
import enDashboard from '../../public/locales/en/dashboard.json';
import enFactCheck from '../../public/locales/en/factCheck.json';
import enAuth from '../../public/locales/en/auth.json';

import frCommon from '../../public/locales/fr/common.json';
import frDashboard from '../../public/locales/fr/dashboard.json';
import frFactCheck from '../../public/locales/fr/factCheck.json';
import frAuth from '../../public/locales/fr/auth.json';

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    factCheck: enFactCheck,
    auth: enAuth,
  },
  fr: {
    common: frCommon,
    dashboard: frDashboard,
    factCheck: frFactCheck,
    auth: frAuth,
  },
};

// Initialize i18n without browser detection to prevent conflicts
i18n
  .use(initReactI18next)
  .init({
    resources,
    // Don't set a default language - let the I18nProvider handle this
    fallbackLng: 'en',
    debug: false,
    
    ns: ['common', 'dashboard', 'factCheck', 'auth'],
    defaultNS: 'common',
    
    keySeparator: '.',
    nsSeparator: ':',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    react: {
      useSuspense: false,
    }
  });

export default i18n; 