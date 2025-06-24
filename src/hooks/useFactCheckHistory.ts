import { useState, useCallback, useEffect, useRef } from 'react';
import { truthCheckerApi } from '@/lib/api';
import { FactCheckHistoryResponse, HistoryFilters, FactCheckSession, FactCheckClaim } from '@/lib/types';

interface UseFactCheckHistoryReturn {
  // Data
  sessions: FactCheckSession[];
  claims: FactCheckClaim[];
  statistics: any;
  
  // State
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  isInitialized: boolean;
  
  // Actions
  loadHistory: (filters?: HistoryFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  setFilters: (filters: HistoryFilters) => void;
  
  // Current filters
  currentFilters: HistoryFilters;
}

const DEFAULT_LIMIT = 20;

export function useFactCheckHistory(): UseFactCheckHistoryReturn {
  const [sessions, setSessions] = useState<FactCheckSession[]>([]);
  const [claims, setClaims] = useState<FactCheckClaim[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use ref to store current filters to avoid dependency cycles
  const currentFiltersRef = useRef<HistoryFilters>({
    limit: DEFAULT_LIMIT,
    offset: 0,
  });

  const loadHistory = useCallback(async (filters: HistoryFilters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const mergedFilters = {
        limit: DEFAULT_LIMIT,
        offset: 0,
        ...filters,
      };
      
      const response = await truthCheckerApi.getFactCheckHistory(mergedFilters);
      
      if (mergedFilters.offset === 0) {
        // New search or filter change - replace data
        setSessions(response.sessions);
        setClaims(response.claims);
      } else {
        // Pagination - append data
        setSessions(prev => [...prev, ...response.sessions]);
        setClaims(prev => [...prev, ...response.claims]);
      }
      
      setStatistics(response.statistics);
      
      // Properly determine if there's more data
      // If we got less than the limit, there's no more data
      const hasMoreData = (
        response.sessions.length === (mergedFilters.limit || DEFAULT_LIMIT) ||
        response.claims.length === (mergedFilters.limit || DEFAULT_LIMIT)
      );
      setHasMore(hasMoreData);
      
      // Update filters ref
      currentFiltersRef.current = mergedFilters;
      
      // Mark as initialized after first successful load
      if (!isInitialized) {
        setIsInitialized(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
      console.error('Error loading history:', err);
      
      // Mark as initialized even on error to prevent infinite retries
      if (!isInitialized) {
        setIsInitialized(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    
    const currentFilters = currentFiltersRef.current;
    const nextOffset = (currentFilters.offset || 0) + (currentFilters.limit || DEFAULT_LIMIT);
    await loadHistory({ ...currentFilters, offset: nextOffset });
  }, [hasMore, isLoading, loadHistory]);

  const refreshHistory = useCallback(async () => {
    const currentFilters = currentFiltersRef.current;
    await loadHistory({ ...currentFilters, offset: 0 });
  }, [loadHistory]);

  const setFilters = useCallback((filters: HistoryFilters) => {
    // Reset hasMore when changing filters to allow new searches
    setHasMore(true);
    loadHistory({ ...filters, offset: 0 });
  }, [loadHistory]);

  // Load initial data only once
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (isMounted && !isInitialized) {
        await loadHistory();
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, [loadHistory, isInitialized]);

  return {
    // Data
    sessions,
    claims,
    statistics,
    
    // State
    isLoading,
    error,
    hasMore,
    isInitialized,
    
    // Actions
    loadHistory,
    loadMore,
    refreshHistory,
    setFilters,
    
    // Current filters
    currentFilters: currentFiltersRef.current,
  };
} 