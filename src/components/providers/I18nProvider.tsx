'use client';

import { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { 
  getUserPreferredLanguage, 
  handlePostAuthLanguage, 
  isValidLanguage,
  saveLanguagePreference 
} from '@/lib/languageUtils';

interface I18nProviderProps {
  children: React.ReactNode;
  detectedLanguage?: string;
}

export function I18nProvider({ children, detectedLanguage = 'en' }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      try {
        console.log('🌐 Initializing i18n with detected language:', detectedLanguage);
        
        // Handle post-authentication language restoration first
        handlePostAuthLanguage();
        
        // Use server-detected language as the primary source for initial load
        const serverLang = isValidLanguage(detectedLanguage) ? detectedLanguage : 'en';
        
        // Get user's preferred language from client storage
        const clientPreferredLang = getUserPreferredLanguage();
        
        console.log('🌐 Server detected language:', serverLang);
        console.log('🌐 Client preferred language:', clientPreferredLang);
        
        // Use server language for hydration, but respect client preference if different
        let languageToUse = serverLang;
        
        // If client has a different preference than what server detected, use client preference
        // but only after hydration to prevent mismatch
        if (clientPreferredLang !== serverLang) {
          console.log('🌐 Client preference differs from server, will switch after hydration');
        }
        
        // Initialize i18n with the server-detected language
        if (i18n.isInitialized) {
          console.log('🌐 i18n already initialized, changing language to:', languageToUse);
          await i18n.changeLanguage(languageToUse);
        } else {
          console.log('🌐 Waiting for i18n initialization...');
          // Wait for i18n to be ready
          const waitForInit = async (attempts = 0) => {
            if (i18n.isInitialized) {
              console.log('🌐 i18n initialized, setting language to:', languageToUse);
              await i18n.changeLanguage(languageToUse);
            } else if (attempts < 50) {
              setTimeout(() => waitForInit(attempts + 1), 100);
              return;
            } else {
              console.warn('🌐 i18n initialization timeout');
            }
          };
          await waitForInit();
        }
        
        // Ensure the language preference is saved consistently
        saveLanguagePreference(languageToUse);
        
        console.log('🌐 i18n ready with language:', i18n.language);
        setIsReady(true);
        
        // After a short delay (post-hydration), switch to client preference if different
        if (clientPreferredLang !== serverLang) {
          setTimeout(async () => {
            console.log('🌐 Post-hydration: switching to client preference:', clientPreferredLang);
            await i18n.changeLanguage(clientPreferredLang);
            saveLanguagePreference(clientPreferredLang);
            
            // Dispatch event to update components
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: clientPreferredLang } 
              }));
        }
          }, 200);
        }
        
      } catch (error) {
        console.error('🌐 Failed to initialize i18n:', error);
        setIsReady(true);
      }
    };

    initI18n();
  }, [detectedLanguage]);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const newLanguage = customEvent.detail?.language;
      
      if (newLanguage && i18n.isInitialized && i18n.language !== newLanguage) {
        console.log('🌐 Language change event received:', newLanguage);
        await i18n.changeLanguage(newLanguage);
      }
    };

    // Listen for storage changes (language changes in other tabs)
    const handleStorageChange = async () => {
      const preferredLang = getUserPreferredLanguage();
      if (i18n.isInitialized && i18n.language !== preferredLang) {
        console.log('🌐 Storage change detected, switching to:', preferredLang);
        await i18n.changeLanguage(preferredLang);
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Show loading state during initialization
  if (!isReady) {
    return (
      <div style={{ opacity: 0.7, transition: 'opacity 0.2s ease-in-out' }}>
        <I18nextProvider i18n={i18n}>
        {children}
        </I18nextProvider>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
        {children}
    </I18nextProvider>
  );
} 