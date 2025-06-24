'use client';

import { useEffect } from 'react';
import { apiWithCreditHandling, setCreditErrorHandler, clearCreditErrorHandler } from '@/lib/apiWithCreditHandling';
import { useCreditExhaustedContext } from '@/components/providers/CreditExhaustedProvider';

export function useApiWithCreditHandling() {
  const { handleCreditError } = useCreditExhaustedContext();

  useEffect(() => {
    // Set up the global credit error handler
    setCreditErrorHandler(handleCreditError);

    // Clean up on unmount
    return () => {
      clearCreditErrorHandler();
    };
  }, [handleCreditError]);

  return apiWithCreditHandling;
} 