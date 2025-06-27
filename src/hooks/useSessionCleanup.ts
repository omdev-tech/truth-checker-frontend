import { useEffect, useCallback } from 'react';
import { getSession } from 'next-auth/react';

/**
 * Hook to handle session cleanup when user closes page or navigates away
 */
export const useSessionCleanup = (enabled: boolean = true) => {
  
  // Helper function to get auth headers
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const session = await getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    
    return headers;
  };

  // Function to complete current processing sessions
  const completeCurrentSessions = useCallback(async (reason: string = 'user_closed') => {
    if (!enabled) return;
    
    try {
      const headers = await getAuthHeaders();
      
      // Don't wait for response to avoid blocking page unload
      fetch('http://localhost:8000/api/sessions/complete-current', {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason }),
        keepalive: true  // Ensure request continues even if page unloads
      }).catch(() => {
        // Ignore errors during page unload
      });
      
    } catch (error) {
      // Ignore errors during page unload
      console.debug('Session cleanup error (expected during page unload):', error);
    }
  }, [enabled]);

  // Handle page unload (browser close, refresh, navigation)
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Complete current sessions when user closes/refreshes page
      completeCurrentSessions('page_unload');
    };

    const handlePageHide = () => {
      // Complete current sessions when page becomes hidden (mobile, tab switch)
      completeCurrentSessions('page_hidden');
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      // Cleanup event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [enabled, completeCurrentSessions]);

  // Return function to manually complete sessions
  return {
    completeCurrentSessions
  };
};

/**
 * Hook specifically for video/audio processing dashboards
 */
export const useVideoSessionCleanup = () => {
  const { completeCurrentSessions } = useSessionCleanup(true);

  // Handle navigation away from video dashboard
  const handleNavigationAway = useCallback(() => {
    completeCurrentSessions('navigation_away');
  }, [completeCurrentSessions]);

  // Handle stopping video processing
  const handleStopProcessing = useCallback(() => {
    completeCurrentSessions('user_stopped');
  }, [completeCurrentSessions]);

  return {
    handleNavigationAway,
    handleStopProcessing,
    completeCurrentSessions
  };
}; 