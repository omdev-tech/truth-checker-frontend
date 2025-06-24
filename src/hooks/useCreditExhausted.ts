'use client';

import { useState, useCallback } from 'react';

interface CreditExhaustedData {
  creditsRemaining?: number;
  creditsNeeded?: number;
  actionType?: string;
  errorDetails?: any;
}

export function useCreditExhausted() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<CreditExhaustedData>({});

  const showCreditExhaustedModal = useCallback((data: CreditExhaustedData = {}) => {
    setModalData(data);
    setIsModalOpen(true);
  }, []);

  const hideCreditExhaustedModal = useCallback(() => {
    setIsModalOpen(false);
    setModalData({});
  }, []);

  // Helper to parse error response and show modal
  const handleCreditError = useCallback((error: any) => {
    if (error?.status === 402 || error?.response?.status === 402) {
      const errorData = error?.response?.data?.detail || error?.detail || {};
      
      // Extract credit information from the error response
      const creditData: CreditExhaustedData = {
        creditsRemaining: errorData?.details?.credits_remaining ?? 0,
        creditsNeeded: errorData?.details?.credits_needed ?? 1,
        actionType: errorData?.details?.action ?? 'fact_check',
        errorDetails: errorData
      };

      showCreditExhaustedModal(creditData);
      return true; // Indicates the error was handled
    }
    return false; // Error was not a credit error
  }, [showCreditExhaustedModal]);

  return {
    isModalOpen,
    modalData,
    showCreditExhaustedModal,
    hideCreditExhaustedModal,
    handleCreditError
  };
} 