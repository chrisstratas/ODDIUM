import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsFilters {
  sortBy: string;
  category: string;
  confidence: string;
}

interface PropData {
  player: string;
  team: string;
  stat: string;
  line: number;
  overOdds: string;
  underOdds: string;
  confidence: number;
  valueRating: "high" | "medium" | "low";
  trend: "up" | "down";
  recentForm: string;
  seasonAvg: number;
  hitRate: number;
  edge: number;
  isPopular: boolean;
  sportsbook: string;
  lastUpdated: string;
}

export const useAnalytics = (filters: AnalyticsFilters) => {
  const [props, setProps] = useState<PropData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        sortBy: filters.sortBy,
        category: filters.category,
        confidence: filters.confidence
      });

      const { data, error: functionError } = await supabase.functions.invoke('get-prop-analytics', {
        body: { params: params.toString() }
      });

      if (functionError) {
        throw functionError;
      }

      setProps(data.props || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      console.log('Triggering analytics refresh...');
      
      const { data, error: functionError } = await supabase.functions.invoke('fetch-live-analytics');
      
      if (functionError) {
        throw functionError;
      }

      console.log('Analytics refresh triggered:', data);
      
      // Wait a moment for the data to be processed, then fetch fresh data
      setTimeout(() => {
        fetchAnalytics();
      }, 1000);
      
    } catch (err) {
      console.error('Error refreshing analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh analytics');
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.sortBy, filters.category, filters.confidence]);

  return {
    props,
    loading,
    error,
    refreshAnalytics,
    refetch: fetchAnalytics
  };
};