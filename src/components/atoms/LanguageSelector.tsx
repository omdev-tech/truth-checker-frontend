'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  changeLanguage, 
  getSupportedLanguages, 
  getCurrentLanguage,
  type SupportedLanguage 
} from '@/lib/languageUtils';

interface LanguageSelectorProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
  className?: string;
  onLanguageChange?: (language: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'ghost',
  size = 'default',
  showLabel = false,
  className = '',
  onLanguageChange,
}) => {
  const { t, i18n } = useTranslation('common');
  const supportedLanguages = getSupportedLanguages();
  
  // Use i18n.language directly and sync with local state
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => {
    // Mark as client-side and get the actual current language
    setIsClientSide(true);
    const actualLanguage = getCurrentLanguage();
    setCurrentLanguage(actualLanguage);
    
    console.log('🌐 LanguageSelector: Initial language:', actualLanguage);

    // Listen for i18n language changes directly
    const handleI18nChange = (lng: string) => {
      console.log('🌐 LanguageSelector: i18n language changed to:', lng);
      if (isValidLanguage(lng)) {
        setCurrentLanguage(lng);
      }
    };

    // Listen for language changes from i18n
    i18n.on('languageChanged', handleI18nChange);
    
    // Listen for custom language change events
    const handleCustomLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newLanguage = customEvent.detail?.language;
      console.log('🌐 LanguageSelector: Custom language change event:', newLanguage);
      if (newLanguage && isValidLanguage(newLanguage)) {
        setCurrentLanguage(newLanguage);
      }
    };

    window.addEventListener('languageChanged', handleCustomLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleI18nChange);
      window.removeEventListener('languageChanged', handleCustomLanguageChange);
    };
  }, [i18n]);

  const isValidLanguage = (lang: string): lang is SupportedLanguage => {
    return ['en', 'fr'].includes(lang);
  };

  const handleLanguageChange = async (languageCode: SupportedLanguage) => {
    try {
      console.log('🌐 LanguageSelector: User selected language:', languageCode);
      await changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      onLanguageChange?.(languageCode);
    } catch (error) {
      console.error('🌐 LanguageSelector: Failed to change language:', error);
      // You could add a toast notification here if you have a toast system
    }
  };

  const getCurrentLanguageName = () => {
    const current = supportedLanguages.find(lang => lang.code === currentLanguage);
    return current?.nativeName || 'English';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center gap-2 ${className}`}
        >
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="hidden sm:inline">
              {t('language.current')}: {getCurrentLanguageName()}
            </span>
          )}
          {!showLabel && (
            <span className="hidden sm:inline">
              {/* Show language name only on client side to prevent hydration mismatch */}
              {isClientSide ? getCurrentLanguageName() : 'Language'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`flex items-center justify-between cursor-pointer ${
              currentLanguage === language.code 
                ? 'bg-accent text-accent-foreground' 
                : ''
            }`}
          >
            <span>{language.nativeName}</span>
            {currentLanguage === language.code && (
              <span className="text-sm text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector; 