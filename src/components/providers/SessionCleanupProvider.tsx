'use client';

import React from 'react';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';

interface SessionCleanupProviderProps {
  children: React.ReactNode;
}

export function SessionCleanupProvider({ children }: SessionCleanupProviderProps) {
  // This will automatically handle page close, navigation, and browser events
  useSessionCleanup(true);

  return <>{children}</>;
} 