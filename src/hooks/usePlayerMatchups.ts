import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MatchupFilters {
  playerName: string;
  opponentName?: string;
  sport: string;
  statType: string;
  gameLimit: number;
}

interface PlayerMatchup {
  id: string;
  playerName: string;
  opponentName: string;
  playerTeam: string;
  opponentTeam: string;
  gameDate: string;
  statType: string;
  playerValue: number;
  opponentValue: number;
  playerLine?: number;
  result?: 'over' | 'under' | 'push';
  sport: string;
}

interface MatchupStats {
  gamesPlayed: number;
  playerAverage: number;
  opponentAverage: number;
  overRate: number;
  winRate: number;
  lastThreeGames: PlayerMatchup[];
  seasonAverage: number;
  trend: 'up' | 'down' | 'stable';
}

export const usePlayerMatchups = (filters: MatchupFilters) => {
  const [matchups, setMatchups] = useState<PlayerMatchup[]>([]);
  const [stats, setStats] = useState<MatchupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchups = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('player_matchups')
        .select('*')
        .eq('player_name', filters.playerName)
        .eq('sport', filters.sport)
        .eq('stat_type', filters.statType)
        .order('game_date', { ascending: false })
        .limit(filters.gameLimit);

      if (filters.opponentName) {
        query = query.eq('opponent_name', filters.opponentName);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      const formattedMatchups: PlayerMatchup[] = (data || []).map(row => ({
        id: row.id,
        playerName: row.player_name,
        opponentName: row.opponent_name,
        playerTeam: row.player_team,
        opponentTeam: row.opponent_team,
        gameDate: row.game_date,
        statType: row.stat_type,
        playerValue: row.player_value,
        opponentValue: row.opponent_value,
        playerLine: row.player_line,
        result: row.result as 'over' | 'under' | 'push' | undefined,
        sport: row.sport
      }));

      setMatchups(formattedMatchups);

      // Calculate stats
      if (formattedMatchups.length > 0) {
        const playerValues = formattedMatchups.map(m => m.playerValue);
        const playerAverage = playerValues.reduce((a, b) => a + b, 0) / playerValues.length;
        
        const opponentValues = formattedMatchups.map(m => m.opponentValue);
        const opponentAverage = opponentValues.reduce((a, b) => a + b, 0) / opponentValues.length;

        const gamesWithLines = formattedMatchups.filter(m => m.playerLine && m.result);
        const overResults = gamesWithLines.filter(m => m.result === 'over').length;
        const overRate = gamesWithLines.length > 0 ? (overResults / gamesWithLines.length) * 100 : 0;

        const wins = formattedMatchups.filter(m => m.playerValue > m.opponentValue).length;
        const winRate = (wins / formattedMatchups.length) * 100;

        // Calculate trend from last 3 games
        const recentValues = playerValues.slice(0, 3);
        const olderValues = playerValues.slice(3, 6);
        let trend: 'up' | 'down' | 'stable' = 'stable';
        
        if (recentValues.length >= 2 && olderValues.length >= 2) {
          const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
          const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;
          const diff = recentAvg - olderAvg;
          
          if (diff > 0.5) trend = 'up';
          else if (diff < -0.5) trend = 'down';
        }

        setStats({
          gamesPlayed: formattedMatchups.length,
          playerAverage,
          opponentAverage,
          overRate,
          winRate,
          lastThreeGames: formattedMatchups.slice(0, 3),
          seasonAverage: playerAverage,
          trend
        });
      }

    } catch (err) {
      console.error('Error fetching player matchups:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch matchups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.playerName && filters.statType) {
      fetchMatchups();
    }
  }, [filters.playerName, filters.opponentName, filters.sport, filters.statType, filters.gameLimit]);

  return {
    matchups,
    stats,
    loading,
    error,
    refetch: fetchMatchups
  };
};