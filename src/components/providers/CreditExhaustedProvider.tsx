'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { CreditExhaustedModal } from '@/components/organisms/CreditExhaustedModal';
import { useCreditExhausted } from '@/hooks/useCreditExhausted';

interface CreditExhaustedContextType {
  showCreditExhaustedModal: (data?: any) => void;
  hideCreditExhaustedModal: () => void;
  handleCreditError: (error: any) => boolean;
}

const CreditExhaustedContext = createContext<CreditExhaustedContextType | undefined>(undefined);

interface CreditExhaustedProviderProps {
  children: ReactNode;
}

export function CreditExhaustedProvider({ children }: CreditExhaustedProviderProps) {
  const {
    isModalOpen,
    modalData,
    showCreditExhaustedModal,
    hideCreditExhaustedModal,
    handleCreditError
  } = useCreditExhausted();

  const contextValue: CreditExhaustedContextType = {
    showCreditExhaustedModal,
    hideCreditExhaustedModal,
    handleCreditError
  };

  return (
    <CreditExhaustedContext.Provider value={contextValue}>
      {children}
      <CreditExhaustedModal
        isOpen={isModalOpen}
        onClose={hideCreditExhaustedModal}
        creditsRemaining={modalData.creditsRemaining}
        creditsNeeded={modalData.creditsNeeded}
        actionType={modalData.actionType}
      />
    </CreditExhaustedContext.Provider>
  );
}

export function useCreditExhaustedContext(): CreditExhaustedContextType {
  const context = useContext(CreditExhaustedContext);
  if (context === undefined) {
    throw new Error('useCreditExhaustedContext must be used within a CreditExhaustedProvider');
  }
  return context;
} 