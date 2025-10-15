import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Game {
  id: string;
  game_id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  network?: string;
  homeRecord?: string;
  awayRecord?: string;
  status: 'scheduled' | 'live' | 'final';
  homeScore?: number;
  awayScore?: number;
  weekNumber?: number;
  seasonYear: number;
}

export const useSchedule = (sport: string, selectedDate?: Date) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current date and end of next week
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const startDate = today.toISOString().split('T')[0];
      const endDate = nextWeek.toISOString().split('T')[0];

      let query = supabase
        .from('games_schedule')
        .select('*')
        .gte('game_date', startDate)
        .lte('game_date', endDate)
        .in('status', ['scheduled', 'live'])
        .order('game_date', { ascending: true })
        .order('game_time', { ascending: true });

      if (sport !== 'all') {
        query = query.eq('sport', sport);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      const formattedGames: Game[] = (data || []).map(row => ({
        id: row.id,
        game_id: row.game_id,
        sport: row.sport,
        homeTeam: row.home_team,
        awayTeam: row.away_team,
        date: row.game_date,
        time: row.game_time,
        venue: row.venue || '',
        network: row.network,
        homeRecord: row.home_record,
        awayRecord: row.away_record,
        status: row.status as 'scheduled' | 'live' | 'final',
        homeScore: row.home_score,
        awayScore: row.away_score,
        weekNumber: row.week_number,
        seasonYear: row.season_year
      }));

      setGames(formattedGames);

    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  const refreshSchedule = async () => {
    try {
      console.log('Refreshing schedule data...');
      const response = await supabase.functions.invoke('fetch-sports-schedule', {
        body: { sport }
      });
      
      if (response.error) {
        console.error('Error refreshing schedule:', response.error);
        throw response.error;
      }
      
      console.log('Schedule refreshed successfully:', response.data);
      
      // Wait a moment for data to be inserted, then refetch
      setTimeout(() => {
        fetchSchedule();
      }, 1000);
      
    } catch (err) {
      console.error('Error refreshing schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh schedule');
    }
  };

  const refreshLiveScores = async () => {
    try {
      console.log('Refreshing live scores from The Odds API...');
      setLoading(true);
      setError(null);
      
      // Map sport to Odds API sport key
      const sportKeyMap: Record<string, string> = {
        'NBA': 'basketball_nba',
        'NFL': 'americanfootball_nfl',
        'MLB': 'baseball_mlb',
        'NHL': 'icehockey_nhl',
        'WNBA': 'basketball_wnba',
        'all': 'basketball_nba'
      };
      
      const sportKey = sportKeyMap[sport] || 'basketball_nba';
      
      const response = await supabase.functions.invoke('fetch-odds-api-scores', {
        body: { sport: sportKey }
      });
      
      if (response.error) {
        console.error('Error refreshing live scores:', response.error);
        setError(response.error.message || 'Failed to refresh live scores');
        setLoading(false);
        throw response.error;
      }
      
      console.log('Live scores refreshed successfully:', response.data);
      
      // Wait a moment for data to be inserted, then refetch
      setTimeout(() => {
        fetchSchedule();
      }, 500);
      
    } catch (err) {
      console.error('Error refreshing live scores:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh live scores');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [sport, selectedDate]);

  return {
    games,
    loading,
    error,
    refetch: fetchSchedule,
    refresh: refreshSchedule,
    refreshLiveScores
  };
};