import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeOdds } from './useRealtimeOdds';

export interface EdgeOpportunity {
  id: string;
  category: 'player_props' | 'live_betting' | 'college_sports' | 'arbitrage' | 'derivative_markets';
  title: string;
  description: string;
  player?: string;
  team?: string;
  sport?: string;
  edge: number;
  confidence: number;
  timeToAct?: string;
  books?: string[];
  reasoning: string;
  urgency: 'low' | 'medium' | 'high';
  created_at: string;
}

interface UseEdgeOpportunitiesProps {
  category?: string;
  sport?: string;
  minEdge?: number;
  minConfidence?: number;
}

export const useEdgeOpportunities = ({
  category,
  sport,
  minEdge = 0,
  minConfidence = 0
}: UseEdgeOpportunitiesProps = {}) => {
  const [opportunities, setOpportunities] = useState<EdgeOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);

    try {
      // First try to fetch real opportunities from our edge analysis
      const { data, error } = await supabase.functions.invoke('analyze-edge-opportunities', {
        body: {
          category,
          sport,
          minEdge,
          minConfidence
        }
      });

      if (error) {
        console.error('Error fetching edge opportunities:', error);
        setOpportunities([]);
        return;
      }

      setOpportunities(data?.opportunities || []);
    } catch (err) {
      console.error('Error fetching edge opportunities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  };

  const analyzeNewOpportunities = async () => {
    // This would normally call an edge function that analyzes current props
    // for edge opportunities across all five categories
    try {
      const { data, error } = await supabase.functions.invoke('analyze-edge-opportunities', {
        body: {
          category,
          sport,
          minEdge,
          minConfidence
        }
      });

      if (error) {
        console.error('Error analyzing opportunities:', error);
        return;
      }

      if (data?.opportunities) {
        setOpportunities(data.opportunities);
      }
    } catch (err) {
      console.error('Error in edge analysis:', err);
    }
  };

  // Subscribe to realtime odds updates
  const { recentMovements } = useRealtimeOdds(() => {
    // Refetch opportunities when odds update
    fetchOpportunities();
  });

  useEffect(() => {
    fetchOpportunities();
  }, [category, sport, minEdge, minConfidence]);

  return {
    opportunities,
    loading,
    error,
    refetch: fetchOpportunities,
    analyzeNew: analyzeNewOpportunities,
    recentMovements
  };
};