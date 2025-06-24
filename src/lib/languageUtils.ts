/**
 * Language Management Utilities
 * Provides comprehensive language persistence and management for the Truth Checker app
 */

import i18n from './i18n';

// Constants
const LANGUAGE_STORAGE_KEY = 'truth-checker-language';
const LANGUAGE_COOKIE_NAME = 'truth-checker-lang';
const DEFAULT_LANGUAGE = 'en';
const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

export const LANGUAGES: Record<SupportedLanguage, LanguageInfo> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    rtl: false,
  },
  fr: {
    code: 'fr', 
    name: 'French',
    nativeName: 'Français',
    rtl: false,
  },
};

/**
 * Server-side language detection from cookies
 * Used in middleware and server components
 */
export const getLanguageFromCookieString = (cookieString?: string): SupportedLanguage => {
  if (!cookieString) return DEFAULT_LANGUAGE;
  
  const cookies = cookieString.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
  
  const lang = cookies[LANGUAGE_COOKIE_NAME];
  return isValidLanguage(lang) ? lang : DEFAULT_LANGUAGE;
};

/**
 * Cookie utilities
 */
export const cookieUtils = {
  set: (name: string, value: string, days: number = 365): void => {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  },

  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  remove: (name: string): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  },
};

/**
 * localStorage utilities with error handling
 */
export const storageUtils = {
  set: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      return false;
    }
  },

  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  },

  remove: (key: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
      return false;
    }
  },
};

/**
 * Validates if a language code is supported
 */
export const isValidLanguage = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

/**
 * Gets the user's preferred language from various sources
 * Priority: localStorage > cookie > browser > default
 */
export const getUserPreferredLanguage = (): SupportedLanguage => {
  // 1. Try localStorage first
  const storedLang = storageUtils.get(LANGUAGE_STORAGE_KEY);
  if (storedLang && isValidLanguage(storedLang)) {
    return storedLang;
  }

  // 2. Try cookie
  const cookieLang = cookieUtils.get(LANGUAGE_COOKIE_NAME);
  if (cookieLang && isValidLanguage(cookieLang)) {
    return cookieLang;
  }

  // 3. Try browser language
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.split('-')[0];
    if (isValidLanguage(browserLang)) {
      return browserLang;
    }
  }

  // 4. Fall back to default
  return DEFAULT_LANGUAGE;
};

/**
 * Saves language preference to both localStorage and cookie
 */
export const saveLanguagePreference = (language: SupportedLanguage): void => {
  if (!isValidLanguage(language)) {
    console.warn('Invalid language code:', language);
    return;
  }

  console.log('🌐 Saving language preference:', language);

  // Save to localStorage
  const localStorageSuccess = storageUtils.set(LANGUAGE_STORAGE_KEY, language);
  
  // Save to cookie as backup (both cookie names for compatibility)
  cookieUtils.set(LANGUAGE_COOKIE_NAME, language);
  cookieUtils.set(LANGUAGE_STORAGE_KEY, language); // Also save with localStorage key name
  
  console.log(`🌐 Language preference saved: ${language} (localStorage: ${localStorageSuccess}, cookies: set)`);
};

/**
 * Changes the current language and persists the preference
 */
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  if (!isValidLanguage(language)) {
    console.warn('Attempted to change to invalid language:', language);
    return;
  }

  try {
    console.log('🌐 Changing language to:', language);
    
    // Save preference first to ensure it's persisted before any potential redirects/reloads
    saveLanguagePreference(language);
    
    // Change i18n language
    await i18n.changeLanguage(language);
    
    console.log('🌐 i18n language changed to:', i18n.language);
    
    // Dispatch custom event for components that need to react to language changes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language, languageInfo: LANGUAGES[language] } 
      }));
    }
    
    console.log('🌐 Language changed successfully to:', language);
  } catch (error) {
    console.error('🌐 Failed to change language:', error);
    throw new Error(`Failed to change language to ${language}`);
  }
};

/**
 * Gets the current language
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  // Try i18n first, but if it's not set or is default, check user preferences
  const i18nLang = i18n.language;
  if (i18nLang && isValidLanguage(i18nLang) && i18nLang !== DEFAULT_LANGUAGE) {
    console.log('🌐 getCurrentLanguage: Using i18n language:', i18nLang);
    return i18nLang;
  }
  
  // Fall back to user preferred language detection
  const preferredLang = getUserPreferredLanguage();
  console.log('🌐 getCurrentLanguage: Using preferred language:', preferredLang, 'i18n was:', i18nLang);
  return preferredLang;
};

/**
 * Gets language information for a specific language code
 */
export const getLanguageInfo = (language: SupportedLanguage): LanguageInfo => {
  return LANGUAGES[language];
};

/**
 * Gets all supported languages
 */
export const getSupportedLanguages = (): LanguageInfo[] => {
  return Object.values(LANGUAGES);
};

/**
 * Gets the language code for API calls (ensures consistency)
 */
export const getApiLanguage = (): SupportedLanguage => {
  const currentLang = getCurrentLanguage();
  console.log('🌐 getApiLanguage: detected language for API call:', currentLang, {
    i18nLanguage: i18n.language,
    localStorage: storageUtils.get(LANGUAGE_STORAGE_KEY),
    cookie: cookieUtils.get(LANGUAGE_COOKIE_NAME)
  });
  return currentLang;
};

/**
 * Handles language preservation after authentication redirects
 */
export const handlePostAuthLanguage = (): void => {
  if (typeof window === 'undefined') return;
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('preserveLang') === 'true') {
    // Remove the parameter from URL
    urlParams.delete('preserveLang');
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.replaceState({}, '', newUrl);
    
    // Force re-initialization of language from storage
    const savedLang = getUserPreferredLanguage();
    if (savedLang) {
      console.log('Restoring language after authentication:', savedLang);
      changeLanguage(savedLang).catch(console.error);
    }
  }
};

/**
 * Initializes language on app startup
 * Should be called early in the app lifecycle
 */
export const initializeLanguage = async (): Promise<SupportedLanguage> => {
  // Handle post-auth language restoration first
  handlePostAuthLanguage();
  
  const preferredLang = getUserPreferredLanguage();
  
  try {
    // Ensure language is saved before changing to prevent auth redirect issues
    saveLanguagePreference(preferredLang);
    await changeLanguage(preferredLang);
    return preferredLang;
  } catch (error) {
    console.error('Failed to initialize language:', error);
    // Fall back to default language
    saveLanguagePreference(DEFAULT_LANGUAGE);
    await changeLanguage(DEFAULT_LANGUAGE);
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Clears all language preferences (useful for testing or reset)
 */
export const clearLanguagePreferences = (): void => {
  storageUtils.remove(LANGUAGE_STORAGE_KEY);
  cookieUtils.remove(LANGUAGE_COOKIE_NAME);
  console.log('Language preferences cleared');
};

/**
 * Hook for listening to language changes
 */
export const useLanguageChangeListener = (callback: (language: SupportedLanguage) => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }

  const handleLanguageChange = (event: CustomEvent) => {
    callback(event.detail.language);
  };

  window.addEventListener('languageChanged', handleLanguageChange as EventListener);
  
  return () => {
    window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
  };
};

/**
 * Utility for getting language direction (for future RTL support)
 */
export const getLanguageDirection = (language?: SupportedLanguage): 'ltr' | 'rtl' => {
  const lang = language || getCurrentLanguage();
  return LANGUAGES[lang]?.rtl ? 'rtl' : 'ltr';
};

/**
 * Utility for getting localized language name
 */
export const getLocalizedLanguageName = (language: SupportedLanguage, currentLang?: SupportedLanguage): string => {
  // For now, return native name. In the future, this could return translated names
  return LANGUAGES[language]?.nativeName || language;
};

export default {
  changeLanguage,
  getCurrentLanguage,
  getUserPreferredLanguage,
  saveLanguagePreference,
  getLanguageInfo,
  getSupportedLanguages,
  getApiLanguage,
  initializeLanguage,
  clearLanguagePreferences,
  isValidLanguage,
  getLanguageDirection,
  getLocalizedLanguageName,
  useLanguageChangeListener,
  handlePostAuthLanguage,
  getLanguageFromCookieString,
  cookieUtils,
  storageUtils,
}; 