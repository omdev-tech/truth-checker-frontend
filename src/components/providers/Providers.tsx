'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider } from './I18nProvider';
import { CreditExhaustedProvider } from './CreditExhaustedProvider';

interface ProvidersProps {
  children: React.ReactNode;
  detectedLanguage?: string;
}

export function Providers({ children, detectedLanguage = 'en' }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <I18nProvider detectedLanguage={detectedLanguage}>
          <CreditExhaustedProvider>
            {children}
          </CreditExhaustedProvider>
        </I18nProvider>
        <Toaster 
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
      </ThemeProvider>
    </SessionProvider>
  );
} 