import { useState, useEffect, useCallback } from 'react';
import { playerService, Player } from '@/services/playerService';

interface UsePlayerSearchResult {
  players: Player[];
  loading: boolean;
  error: string | null;
  searchPlayers: (query: string, sport?: string) => void;
  clearResults: () => void;
}

export const usePlayerSearch = (): UsePlayerSearchResult => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentSport, setCurrentSport] = useState('All');

  const searchPlayers = useCallback(async (query: string, sport: string = 'All') => {
    if (query.length < 2) {
      setPlayers([]);
      setCurrentQuery('');
      return;
    }

    setCurrentQuery(query);
    setCurrentSport(sport);
    setLoading(true);
    setError(null);

    try {
      const results = await playerService.searchPlayers(query, sport);
      setPlayers(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search players');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setPlayers([]);
    setCurrentQuery('');
    setError(null);
    setLoading(false);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (currentQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchPlayers(currentQuery, currentSport);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [currentQuery, currentSport, searchPlayers]);

  return {
    players,
    loading,
    error,
    searchPlayers,
    clearResults
  };
};