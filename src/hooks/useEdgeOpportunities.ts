import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const generateMockOpportunities = (): EdgeOpportunity[] => {
    const mockOpportunities: EdgeOpportunity[] = [
      {
        id: '1',
        category: 'player_props',
        title: 'Tony Pollard Receiving Yards O/U 12.5',
        description: 'Backup RB in committee role with historically low receiving volume line.',
        player: 'Tony Pollard',
        team: 'DAL',
        sport: 'NFL',
        edge: 8.2,
        confidence: 76,
        reasoning: 'Books undervalue backup RB receiving props. Pollard averages 14.2 yards in games where Zeke sits, but line assumes committee usage.',
        urgency: 'medium',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        category: 'live_betting',
        title: 'Lakers Total Points Live - Under 108.5',
        description: 'Live total dropped after LeBron picked up 3rd foul, creating value.',
        player: 'LeBron James',
        team: 'LAL',
        sport: 'NBA',
        edge: 12.5,
        confidence: 84,
        timeToAct: '3 minutes',
        reasoning: 'LeBron in foul trouble but likely to return. Books overreacted to temporary absence, creating inflated under value.',
        urgency: 'high',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        category: 'college_sports',
        title: 'Wofford vs ETSU Total O/U 128.5',
        description: 'SoCon game with soft total based on limited tracking.',
        team: 'Wofford',
        sport: 'NCAAB',
        edge: 6.8,
        confidence: 72,
        reasoning: 'Mid-major totals often set by formula. Both teams play faster pace than books account for in low-profile conferences.',
        urgency: 'low',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        category: 'arbitrage',
        title: 'Chiefs -2.5 vs Bills +3',
        description: 'Cross-book arbitrage opportunity with guaranteed profit.',
        team: 'Chiefs',
        sport: 'NFL',
        edge: 4.2,
        confidence: 100,
        books: ['DraftKings', 'FanDuel'],
        reasoning: 'Risk-free profit by betting Chiefs -2.5 at DK and Bills +3 at FD. All middle outcomes covered.',
        urgency: 'high',
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        category: 'derivative_markets',
        title: 'First Half Over 21.5 - Eagles vs Cowboys',
        description: 'Derivative total undervalues fast-starting Eagles offense.',
        team: 'Eagles',
        sport: 'NFL',
        edge: 9.1,
        confidence: 78,
        reasoning: 'Eagles average 16.2 first-half points, Cowboys allow 13.8. Formula split of game total misses first-half pace.',
        urgency: 'medium',
        created_at: new Date().toISOString()
      },
      {
        id: '6',
        category: 'player_props',
        title: 'Collin Sexton 3-Pointers O/U 1.5',
        description: 'Bench role transition creates mispriced three-point prop.',
        player: 'Collin Sexton',
        team: 'UTA',
        sport: 'NBA',
        edge: 7.3,
        confidence: 69,
        reasoning: 'Sexton attempting 4.8 threes per game in bench role, but book using starter usage rate for prop setting.',
        urgency: 'low',
        created_at: new Date().toISOString()
      },
      {
        id: '7',
        category: 'college_sports',
        title: 'Northern Iowa -4 vs Missouri State',
        description: 'MVC conference game with home court undervalued.',
        team: 'Northern Iowa',
        sport: 'NCAAB',
        edge: 5.9,
        confidence: 74,
        reasoning: 'Books don\'t properly weight home court advantage in mid-major conferences. UNI is 12-2 ATS at home this season.',
        urgency: 'medium',
        created_at: new Date().toISOString()
      },
      {
        id: '8',
        category: 'derivative_markets',
        title: 'Team Total Over 24.5 - Bengals',
        description: 'Team-specific total undervalues offensive pace against weak defense.',
        team: 'Bengals',
        sport: 'NFL',
        edge: 8.7,
        confidence: 81,
        reasoning: 'Bengals averaging 28.4 points vs bottom-10 defenses. Team total formula doesn\'t account for matchup-specific production.',
        urgency: 'low',
        created_at: new Date().toISOString()
      }
    ];

    return mockOpportunities.filter(opp => {
      if (category && opp.category !== category) return false;
      if (sport && opp.sport !== sport) return false;
      if (opp.edge < minEdge) return false;
      if (opp.confidence < minConfidence) return false;
      return true;
    });
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);

    try {
      // For now, we'll use mock data since we don't have real edge opportunity data
      // In a real app, this would query a database of analyzed opportunities
      const mockData = generateMockOpportunities();
      
      // Sort by urgency and edge
      const sortedData = mockData.sort((a, b) => {
        const urgencyWeight = { high: 3, medium: 2, low: 1 };
        const urgencyDiff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
        if (urgencyDiff !== 0) return urgencyDiff;
        return b.edge - a.edge;
      });

      setOpportunities(sortedData);
    } catch (err) {
      console.error('Error fetching edge opportunities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
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

  useEffect(() => {
    fetchOpportunities();
  }, [category, sport, minEdge, minConfidence]);

  return {
    opportunities,
    loading,
    error,
    refetch: fetchOpportunities,
    analyzeNew: analyzeNewOpportunities
  };
};