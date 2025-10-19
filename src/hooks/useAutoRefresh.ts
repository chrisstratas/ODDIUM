import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAutoRefreshProps {
  onRefresh: () => Promise<void>;
  interval?: number; // in milliseconds
  enabled?: boolean;
  onlyWhenVisible?: boolean;
}

export const useAutoRefresh = ({
  onRefresh,
  interval = 5 * 60 * 1000, // 5 minutes default
  enabled = true,
  onlyWhenVisible = true
}: UseAutoRefreshProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(!onlyWhenVisible || !document.hidden);

  // Handle page visibility
  useEffect(() => {
    if (!onlyWhenVisible) return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onlyWhenVisible]);

  const performRefresh = useCallback(async () => {
    if (isRefreshing || isPaused) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefreshTime(new Date());
    } catch (error) {
      console.error('Auto-refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing, isPaused]);

  const manualRefresh = useCallback(async () => {
    await performRefresh();
  }, [performRefresh]);

  const pauseAutoRefresh = useCallback(() => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resumeAutoRefresh = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (!enabled || isPaused || !isVisible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial refresh
    if (!lastRefreshTime) {
      performRefresh();
    }

    // Set up interval
    intervalRef.current = setInterval(performRefresh, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, isPaused, isVisible, interval, performRefresh, lastRefreshTime]);

  return {
    isRefreshing,
    lastRefreshTime,
    manualRefresh,
    pauseAutoRefresh,
    resumeAutoRefresh,
    isPaused
  };
};
