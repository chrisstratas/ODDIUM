import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsFilters {
  sortBy: string;
  category: string;
  confidence: string;
  sport?: string; // Add sport filter
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
        confidence: filters.confidence,
        ...(filters.sport && { sport: filters.sport })
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
      console.log('Triggering live odds and analytics refresh...');
      
      // Fetch live odds from major sportsbooks in parallel with analytics
      const [oddsResponse, analyticsResponse] = await Promise.all([
        supabase.functions.invoke('fetch-live-odds'),
        supabase.functions.invoke('fetch-live-analytics')
      ]);
      
      if (oddsResponse.error) {
        console.error('Live odds error:', oddsResponse.error);
      }
      
      if (analyticsResponse.error) {
        throw analyticsResponse.error;
      }

      console.log('Live odds and analytics refresh triggered');
      
      // Wait a moment for the data to be processed, then fetch fresh data
      setTimeout(() => {
        fetchAnalytics();
      }, 2000);
      
    } catch (err) {
      console.error('Error refreshing analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh analytics');
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.sortBy, filters.category, filters.confidence, filters.sport]);

  return {
    props,
    loading,
    error,
    refreshAnalytics,
    refetch: fetchAnalytics
  };
};