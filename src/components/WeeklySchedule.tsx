import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Tv, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  const fetchScheduleFromDB = async () => {
    try {
      setError(null);
      const currentDate = new Date();
      const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
      const weekEnd = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 7));
      
      let query = supabase
        .from('games_schedule')
        .select('*')
        .gte('game_date', weekStart.toISOString().split('T')[0])
        .lte('game_date', weekEnd.toISOString().split('T')[0])
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
      console.log('Refreshing schedule data...');
      const response = await supabase.functions.invoke('fetch-sports-schedule', {
        body: { sport }
      });
      
      if (response.error) {
        throw response.error;
      }
      
      console.log('Schedule refresh successful:', response.data);
      
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
  }, [sport]);

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
            {sport} Weekly Schedule
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSchedule}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Loading...' : 'Refresh'}
          </Button>
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
            <p className="text-muted-foreground mb-4">No games scheduled for this week</p>
            <Button onClick={refreshSchedule} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Load Schedule
            </Button>
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