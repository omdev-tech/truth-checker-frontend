module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    localeDetection: false, // We'll handle this manually with a language selector
  },
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  ns: ['common', 'dashboard', 'factCheck', 'auth', 'gallery'],
  defaultNS: 'common',
} 