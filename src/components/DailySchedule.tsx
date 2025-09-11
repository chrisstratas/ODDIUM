import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, MapPin, Tv, RefreshCw, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRefresh } from "@/contexts/RefreshContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Game {
  id: string;
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
}

interface DailyScheduleProps {
  sport: string;
}

const DailySchedule = ({ sport }: DailyScheduleProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dataSource, setDataSource] = useState<'live' | 'fallback' | 'api'>('api');
  const { refreshAll, isRefreshing } = useRefresh();

  const fetchScheduleFromDB = async () => {
    try {
      setError(null);
      
      const dateString = selectedDate.toISOString().split('T')[0];
      
      let query = supabase
        .from('games_schedule')
        .select('*')
        .eq('game_date', dateString)
        .order('game_time', { ascending: true });

      if (sport !== 'all') {
        query = query.eq('sport', sport);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const formattedGames: Game[] = (data || []).map(row => ({
        id: row.id,
        homeTeam: row.home_team,
        awayTeam: row.away_team,
        date: row.game_date,
        time: row.game_time,
        venue: row.venue || '',
        network: row.network || '',
        homeRecord: row.home_record || '',
        awayRecord: row.away_record || '',
        status: row.status as 'scheduled' | 'live' | 'final',
        homeScore: row.home_score,
        awayScore: row.away_score
      }));

      // Remove duplicates by creating a unique key and keeping only the first occurrence
      const uniqueGames = formattedGames.reduce((acc, game) => {
        const gameKey = `${game.date}-${game.homeTeam}-${game.awayTeam}`;
        const reverseKey = `${game.date}-${game.awayTeam}-${game.homeTeam}`;
        
        // Check if we already have this game or its reverse
        const existingIndex = acc.findIndex(existing => {
          const existingKey = `${existing.date}-${existing.homeTeam}-${existing.awayTeam}`;
          return existingKey === gameKey || existingKey === reverseKey;
        });
        
        if (existingIndex === -1) {
          acc.push(game);
        } else {
          // If duplicate found, keep the one with more recent data (live scores preferred)
          const existing = acc[existingIndex];
          if (game.status === 'live' && existing.status !== 'live') {
            acc[existingIndex] = game;
          } else if (game.homeScore !== null && existing.homeScore === null) {
            acc[existingIndex] = game;
          }
        }
        
        return acc;
      }, [] as Game[]);

      setGames(uniqueGames);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  // Listen for global refresh events
  useEffect(() => {
    const handleGlobalRefresh = () => {
      setTimeout(() => fetchScheduleFromDB(), 2000);
    };
    
    window.addEventListener('globalDataRefresh', handleGlobalRefresh);
    return () => window.removeEventListener('globalDataRefresh', handleGlobalRefresh);
  }, []);

  useEffect(() => {
    fetchScheduleFromDB();
  }, [sport, selectedDate]);

  const updateSelectedDate = (date: Date) => {
    setSelectedDate(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (game: Game) => {
    switch (game.status) {
      case 'live':
        return <Badge className="bg-red-500 text-white animate-pulse">Live</Badge>;
      case 'final':
        return <Badge variant="secondary">Final</Badge>;
      default:
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const getSportIcon = () => {
    const icons = {
      NBA: "🏀",
      NFL: "🏈", 
      MLB: "⚾",
      NHL: "🏒",
      WNBA: "🏀"
    };
    return icons[sport as keyof typeof icons] || "🏟️";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{getSportIcon()}</span>
            {sport} Daily Schedule
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${dataSource === 'live' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
            {dataSource === 'live' ? 'TheScore.com' : 'SportsData.io fallback'}
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && updateSelectedDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Loading...' : 'Load Latest'}
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing games for {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading schedule...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refreshAll} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No games scheduled for {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => updateSelectedDate(new Date())} variant="outline" size="sm">
                Today's Games
              </Button>
              <Button onClick={refreshAll} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Latest
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {games.map((game) => (
              <Card key={game.id} className="border border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(game.date)}
                      </span>
                      {getStatusBadge(game)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {game.time}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{game.awayTeam}</span>
                        {game.awayRecord && (
                          <span className="text-sm text-muted-foreground">
                            ({game.awayRecord})
                          </span>
                        )}
                        {game.status === 'final' && game.awayScore !== undefined && (
                          <span className="font-bold text-lg">{game.awayScore}</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">@</div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{game.homeTeam}</span>
                        {game.homeRecord && (
                          <span className="text-sm text-muted-foreground">
                            ({game.homeRecord})
                          </span>
                        )}
                        {game.status === 'final' && game.homeScore !== undefined && (
                          <span className="font-bold text-lg">{game.homeScore}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {game.venue || 'TBD'}
                    </div>
                    {game.network && (
                      <div className="flex items-center gap-1">
                        <Tv className="h-4 w-4" />
                        {game.network}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailySchedule;