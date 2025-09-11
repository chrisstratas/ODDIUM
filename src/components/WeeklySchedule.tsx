import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Clock, MapPin, Tv, RefreshCw, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

interface WeeklyScheduleProps {
  sport: string;
}

const WeeklySchedule = ({ sport }: WeeklyScheduleProps) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return { from: startOfWeek, to: endOfWeek };
  });

  const fetchScheduleFromDB = async () => {
    try {
      setError(null);
      
      let query = supabase
        .from('games_schedule')
        .select('*')
        .gte('game_date', dateRange.from.toISOString().split('T')[0])
        .lte('game_date', dateRange.to.toISOString().split('T')[0])
        .order('game_date', { ascending: true });

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

      setGames(formattedGames);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  const refreshSchedule = async () => {
    setRefreshing(true);
    try {
      console.log('Refreshing schedule with Fox Sports live scores...');
      
      // First try to get live scores from Fox Sports
      const foxSportsResponse = await supabase.functions.invoke('fetch-fox-sports-scores', {
        body: { sport }
      });
      
      if (foxSportsResponse.error) {
        console.error('Fox Sports fetch error:', foxSportsResponse.error);
        // Fallback to regular schedule fetch
        const fallbackResponse = await supabase.functions.invoke('fetch-sports-schedule', {
          body: { sport }
        });
        
        if (fallbackResponse.error) {
          throw fallbackResponse.error;
        }
        console.log('Fallback schedule refresh successful:', fallbackResponse.data);
      } else {
        console.log('Fox Sports live scores refresh successful:', foxSportsResponse.data);
      }
      
      // Wait a moment then refetch from DB
      setTimeout(() => {
        fetchScheduleFromDB();
        setRefreshing(false);
      }, 1500);
      
    } catch (err) {
      console.error('Error refreshing schedule:', err);
      setError('Failed to refresh schedule data');
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScheduleFromDB();
  }, [sport, dateRange]);

  const updateDateRange = (selectedDate: Date) => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    setDateRange({ from: startOfWeek, to: endOfWeek });
    setSelectedDate(selectedDate);
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
            {sport} Live Scores - Fox Sports
          </CardTitle>
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
                  onSelect={(date) => date && updateDateRange(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSchedule}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Loading Fox Sports...' : 'Get Live Scores'}
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing games from {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
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
            <Button onClick={refreshSchedule} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No games scheduled for {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => updateDateRange(new Date())} variant="outline" size="sm">
                Current Week
              </Button>
              <Button onClick={refreshSchedule} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Get Fox Sports Scores
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

export default WeeklySchedule;