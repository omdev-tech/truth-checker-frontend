'use client';

import { useState, useEffect, useCallback } from 'react';
import { guestSessionService } from '@/lib/services/GuestSessionService';
import { GuestSession } from '@/lib/types/landing';

/**
 * Custom hook for guest session management
 * Provides reactive state management for guest user sessions
 * Follows React hooks best practices
 */
export function useGuestSession() {
  const [session, setSession] = useState<GuestSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    try {
      const currentSession = guestSessionService.getCurrentSession();
      setSession(currentSession);
    } catch (error) {
      console.error('Failed to load guest session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if user can perform an action
   */
  const canPerformAction = useCallback((action?: string): boolean => {
    return guestSessionService.canPerformAction(action);
  }, []);

  /**
   * Consume usage with state update
   */
  const consumeUsage = useCallback(() => {
    const result = guestSessionService.consumeUsage();
    
    // Update local state
    if (result.success) {
      const updatedSession = guestSessionService.getCurrentSession();
      setSession(updatedSession);
    }
    
    return result;
  }, []);

  /**
   * Refund usage with state update (for failed API calls)
   */
  const refundUsage = useCallback(() => {
    const result = guestSessionService.refundUsage();
    
    // Update local state
    if (result.success) {
      const updatedSession = guestSessionService.getCurrentSession();
      setSession(updatedSession);
    }
    
    return result;
  }, []);

  /**
   * Get usage statistics
   */
  const getUsageStats = useCallback(() => {
    return guestSessionService.getUsageStats();
  }, []);

  /**
   * Clear session with state update
   */
  const clearSession = useCallback(() => {
    guestSessionService.clearSession();
    const newSession = guestSessionService.getCurrentSession();
    setSession(newSession);
  }, []);

  /**
   * Create new session with state update
   */
  const createNewSession = useCallback(() => {
    const newSession = guestSessionService.createSession();
    setSession(newSession);
    return newSession;
  }, []);

  // Computed values
  const usageStats = session ? getUsageStats() : null;
  const hasUsageRemaining = session ? session.usageCount < session.maxUsage : false;
  const isSessionExpired = session ? new Date() > new Date(session.expiresAt) : false;

  return {
    // State
    session,
    isLoading,
    usageStats,
    hasUsageRemaining,
    isSessionExpired,
    
    // Actions
    canPerformAction,
    consumeUsage,
    refundUsage,
    clearSession,
    createNewSession,
    
    // Computed helpers
    isGuestUser: true, // Always true for this hook
    shouldShowUpgradePrompt: usageStats ? usageStats.remaining <= 1 : false,
  };
} 