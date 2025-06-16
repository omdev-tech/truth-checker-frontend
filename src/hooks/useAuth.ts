'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Authentication Hook
 * Provides clean interface for authentication state and actions
 * Handles loading states and error management
 */
export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const user = session?.user;

  /**
   * Sign in with Google
   */
  const handleSignIn = useCallback(async () => {
    try {
      const result = await signIn('google', {
        callbackUrl: '/app',
        redirect: false,
      });

      if (result?.error) {
        toast.error('Authentication failed. Please try again.');
        console.error('Sign in error:', result.error);
      } else if (result?.url) {
        // Successful sign in, redirect will happen automatically
        toast.success('Welcome! Redirecting to your dashboard...');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Authentication failed. Please try again.');
    }
  }, []);

  /**
   * Sign out user
   */
  const handleSignOut = useCallback(async () => {
    try {
      await signOut({
        callbackUrl: '/',
        redirect: false,
      });
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Sign out failed. Please try again.');
    }
  }, []);

  /**
   * Get user display name
   */
  const getDisplayName = useCallback(() => {
    if (!user) return null;
    return user.name || user.email || 'User';
  }, [user]);

  /**
   * Get user initials for avatar
   */
  const getUserInitials = useCallback(() => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  /**
   * Check if user has specific permissions (future extensibility)
   */
  const hasPermission = useCallback((permission: string) => {
    // For now, all authenticated users have all permissions
    // This can be extended when we implement user roles/plans
    return isAuthenticated;
  }, [isAuthenticated]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    session,
    
    // Actions
    signIn: handleSignIn,
    signOut: handleSignOut,
    
    // Helpers
    getDisplayName,
    getUserInitials,
    hasPermission,
    
    // Computed values
    isGuest: !isAuthenticated,
    canAccessApp: isAuthenticated,
  };
} 