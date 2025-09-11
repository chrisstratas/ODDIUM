import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlayerInsights {
  currentPropInsight?: string;
  recentTrend?: string;
  sportMetrics?: string[];
}

interface UsePlayerInsightsProps {
  playerName: string;
  team: string;
  stat: string;
  sport: string;
  line: number;
}

export const usePlayerInsights = ({ 
  playerName, 
  team, 
  stat, 
  sport, 
  line 
}: UsePlayerInsightsProps) => {
  const [insights, setInsights] = useState<PlayerInsights>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sport-specific metrics mapping
  const getSportMetrics = (sport: string) => {
    const metrics = {
      NFL: ['Yards/Game', 'Touchdowns', 'Targets', 'Red Zone', 'Weather Impact'],
      NBA: ['Usage Rate', 'Pace Factor', 'Minutes', 'B2B Games', 'Rest Days'],
      MLB: ['vs Handedness', 'Ballpark Factor', 'Recent AB', 'Weather', 'Bullpen'],
      NHL: ['Ice Time', 'Power Play', 'Shot Attempts', 'Corsi%', 'Recent Games'],
      WNBA: ['Usage Rate', 'Pace', 'Minutes', 'Rest Days', 'Matchup']
    };
    return metrics[sport as keyof typeof metrics] || [];
  };

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get recent player stats for analysis
      const { data: recentStats, error: statsError } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_name', playerName)
        .eq('stat_type', stat)
        .gte('game_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('game_date', { ascending: false })
        .limit(10);

      if (statsError) {
        console.error('Error fetching player stats:', statsError);
      }

      // Get current props for comparison
      const { data: propData, error: propError } = await supabase
        .from('live_odds')
        .select('*')
        .eq('player_name', playerName)
        .eq('stat_type', stat)
        .order('last_updated', { ascending: false })
        .limit(5);

      if (propError) {
        console.error('Error fetching prop data:', propError);
      }

      // Generate rule-based insights instead of AI to avoid quota issues
      const recentGames = recentStats || [];
      const currentProps = propData || [];

      let currentPropInsight = '';
      let recentTrend = '';

      // Analyze recent performance
      if (recentGames.length >= 3) {
        const values = recentGames.map(game => parseFloat(game.value?.toString() || '0'));
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const overCount = values.filter(v => v > line).length;
        const overRate = (overCount / values.length) * 100;

        currentPropInsight = `Based on last ${recentGames.length} games, ${playerName} averages ${avg.toFixed(1)} ${stat.toLowerCase()}. Line of ${line} hit ${overRate.toFixed(0)}% of the time.`;

        // Determine trend
        if (values.length >= 5) {
          const recent3 = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
          const previous3 = values.slice(3, 6).reduce((a, b) => a + b, 0) / 3;
          
          if (recent3 > previous3 * 1.1) {
            recentTrend = `${playerName} is trending up with improved ${stat.toLowerCase()} production over last 3 games vs previous 3.`;
          } else if (recent3 < previous3 * 0.9) {
            recentTrend = `${playerName} has cooled down in ${stat.toLowerCase()} over the last 3 games compared to previous stretch.`;
          } else {
            recentTrend = `${playerName} maintains consistent ${stat.toLowerCase()} production with minimal variance in recent games.`;
          }
        }
      } else {
        currentPropInsight = `Limited recent data for ${playerName} ${stat.toLowerCase()}. Monitor for more games to establish patterns.`;
        recentTrend = `Insufficient game sample to determine trend for ${playerName} in ${stat.toLowerCase()}.`;
      }

      // Add value assessment
      if (currentProps.length > 0) {
        const bookmakerLines = currentProps.map(prop => parseFloat(prop.line?.toString() || '0'));
        const avgBookmakerLine = bookmakerLines.reduce((a, b) => a + b, 0) / bookmakerLines.length;
        
        if (Math.abs(line - avgBookmakerLine) > 0.5) {
          currentPropInsight += ` Current line shows ${Math.abs(line - avgBookmakerLine).toFixed(1)} point difference from market average.`;
        }
      }

      setInsights({
        currentPropInsight,
        recentTrend,
        sportMetrics: getSportMetrics(sport)
      });

    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
      
      // Provide fallback insights
      setInsights({
        currentPropInsight: `${playerName} ${stat.toLowerCase()} analysis: Line set at ${line}. Monitor recent form and matchup factors.`,
        recentTrend: `Track ${playerName}'s ${stat.toLowerCase()} performance over recent games for trend analysis.`,
        sportMetrics: getSportMetrics(sport)
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playerName && stat && sport) {
      generateInsights();
    }
  }, [playerName, stat, sport, line]);

  return {
    insights,
    loading,
    error,
    refetch: generateInsights
  };
};