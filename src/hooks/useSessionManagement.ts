import { useState, useCallback, useEffect } from 'react';
import { truthCheckerApi } from '@/lib/api';
import { SessionListResponse, SessionSummary, SessionDetailsWithSegments, SessionSegment } from '@/lib/types';

interface UseSessionManagementReturn {
  // Data
  sessions: SessionSummary[];
  selectedSession: SessionSummary | null;
  sessionSegments: SessionSegment[];
  statistics: any;
  
  // State
  isLoadingSessions: boolean;
  isLoadingSegments: boolean;
  error: string | null;
  hasMoreSessions: boolean;
  isInitialized: boolean;
  
  // Actions
  loadSessions: (offset?: number) => Promise<void>;
  loadMoreSessions: () => Promise<void>;
  selectSession: (session: SessionSummary) => Promise<void>;
  clearSelectedSession: () => void;
  refreshSessions: () => Promise<void>;
}

const DEFAULT_LIMIT = 20;

export function useSessionManagement(): UseSessionManagementReturn {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);
  const [sessionSegments, setSessionSegments] = useState<SessionSegment[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingSegments, setIsLoadingSegments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreSessions, setHasMoreSessions] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);

  const loadSessions = useCallback(async (offset = 0) => {
    try {
      setIsLoadingSessions(true);
      setError(null);
      
      const response = await truthCheckerApi.getSessions(DEFAULT_LIMIT, offset);
      
      if (offset === 0) {
        // New load - replace data
        setSessions(response.sessions);
      } else {
        // Pagination - append data
        setSessions(prev => [...prev, ...response.sessions]);
      }
      
      setStatistics(response.statistics);
      setCurrentOffset(offset);
      
      // Determine if there's more data
      const hasMoreData = response.sessions.length === DEFAULT_LIMIT;
      setHasMoreSessions(hasMoreData);
      
      // Mark as initialized after first successful load
      if (!isInitialized) {
        setIsInitialized(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions');
      console.error('Error loading sessions:', err);
      
      // Mark as initialized even on error to prevent infinite retries
      if (!isInitialized) {
        setIsInitialized(true);
      }
    } finally {
      setIsLoadingSessions(false);
    }
  }, [isInitialized]);

  const loadMoreSessions = useCallback(async () => {
    if (!hasMoreSessions || isLoadingSessions) return;
    
    const nextOffset = currentOffset + DEFAULT_LIMIT;
    await loadSessions(nextOffset);
  }, [hasMoreSessions, isLoadingSessions, currentOffset, loadSessions]);

  const selectSession = useCallback(async (session: SessionSummary) => {
    try {
      setIsLoadingSegments(true);
      setError(null);
      setSelectedSession(session);
      
      const response = await truthCheckerApi.getSessionWithSegments(session.id);
      setSessionSegments(response.segments);
    } catch (err: any) {
      setError(err.message || 'Failed to load session segments');
      console.error('Error loading session segments:', err);
      setSessionSegments([]);
    } finally {
      setIsLoadingSegments(false);
    }
  }, []);

  const clearSelectedSession = useCallback(() => {
    setSelectedSession(null);
    setSessionSegments([]);
    setIsLoadingSegments(false);
  }, []);

  const refreshSessions = useCallback(async () => {
    await loadSessions(0);
    // If a session was selected, refresh its segments too
    if (selectedSession) {
      await selectSession(selectedSession);
    }
  }, [loadSessions, selectedSession, selectSession]);

  // Load initial data only once
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (isMounted && !isInitialized) {
        await loadSessions(0);
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, [loadSessions, isInitialized]);

  return {
    // Data
    sessions,
    selectedSession,
    sessionSegments,
    statistics,
    
    // State
    isLoadingSessions,
    isLoadingSegments,
    error,
    hasMoreSessions,
    isInitialized,
    
    // Actions
    loadSessions,
    loadMoreSessions,
    selectSession,
    clearSelectedSession,
    refreshSessions,
  };
} 