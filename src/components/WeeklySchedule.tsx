import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Tv } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    return startOfWeek;
  });

  // Current data for September 2025
  const mockGames: Record<string, Game[]> = {
    NBA: [
      {
        id: "1",
        homeTeam: "Lakers",
        awayTeam: "Warriors",
        date: "2025-09-15",
        time: "7:30 PM PT",
        venue: "Crypto.com Arena",
        network: "ESPN",
        homeRecord: "Preseason",
        awayRecord: "Preseason",
        status: "scheduled"
      },
      {
        id: "2", 
        homeTeam: "Celtics",
        awayTeam: "Heat",
        date: "2025-09-16",
        time: "8:00 PM ET",
        venue: "TD Garden",
        network: "TNT",
        homeRecord: "Preseason",
        awayRecord: "Preseason",
        status: "scheduled"
      },
      {
        id: "3",
        homeTeam: "Nuggets",
        awayTeam: "Suns",
        date: "2025-09-17",
        time: "9:00 PM MT", 
        venue: "Ball Arena",
        network: "NBA TV",
        homeRecord: "Preseason",
        awayRecord: "Preseason",
        status: "scheduled"
      }
    ],
    NFL: [
      {
        id: "1",
        homeTeam: "Chiefs",
        awayTeam: "Bills",
        date: "2025-09-14",
        time: "8:20 PM ET",
        venue: "Arrowhead Stadium",
        network: "NBC",
        homeRecord: "2-0",
        awayRecord: "2-0",
        status: "scheduled"
      },
      {
        id: "2",
        homeTeam: "Eagles",
        awayTeam: "Cowboys",
        date: "2025-09-15",
        time: "4:25 PM ET",
        venue: "Lincoln Financial Field",
        network: "FOX",
        homeRecord: "1-1",
        awayRecord: "1-1",
        status: "scheduled"
      },
      {
        id: "3",
        homeTeam: "49ers",
        awayTeam: "Rams",
        date: "2025-09-15",
        time: "4:05 PM PT",
        venue: "Levi's Stadium",
        network: "CBS",
        homeRecord: "2-0",
        awayRecord: "0-2",
        status: "scheduled"
      }
    ],
    MLB: [
      {
        id: "1",
        homeTeam: "Yankees",
        awayTeam: "Red Sox",
        date: "2025-09-12",
        time: "7:05 PM ET",
        venue: "Yankee Stadium",
        network: "ESPN",
        homeRecord: "89-64",
        awayRecord: "78-75",
        status: "scheduled"
      },
      {
        id: "2",
        homeTeam: "Dodgers",
        awayTeam: "Padres",
        date: "2025-09-13",
        time: "10:10 PM ET",
        venue: "Dodger Stadium",
        network: "Apple TV+",
        homeRecord: "94-59",
        awayRecord: "85-68",
        status: "scheduled"
      },
      {
        id: "3",
        homeTeam: "Braves",
        awayTeam: "Phillies",
        date: "2025-09-14",
        time: "7:20 PM ET",
        venue: "Truist Park",
        network: "Fox Sports South",
        homeRecord: "87-66",
        awayRecord: "91-62",
        status: "scheduled"
      }
    ],
    NHL: [
      {
        id: "1",
        homeTeam: "Rangers",
        awayTeam: "Devils",
        date: "2025-09-15",
        time: "7:00 PM ET",
        venue: "Madison Square Garden",
        network: "MSG",
        homeRecord: "Preseason",
        awayRecord: "Preseason",
        status: "scheduled"
      },
      {
        id: "2",
        homeTeam: "Bruins",
        awayTeam: "Canadiens",
        date: "2025-09-16",
        time: "7:30 PM ET",
        venue: "TD Garden",
        network: "NESN",
        homeRecord: "Preseason",
        awayRecord: "Preseason",
        status: "scheduled"
      },
      {
        id: "3",
        homeTeam: "Maple Leafs",
        awayTeam: "Senators",
        date: "2025-09-17",
        time: "7:00 PM ET",
        venue: "Scotiabank Arena",
        network: "Sportsnet",
        homeRecord: "Preseason",
        awayRecord: "Preseason",
        status: "scheduled"
      }
    ],
    WNBA: [
      {
        id: "1",
        homeTeam: "Las Vegas Aces",
        awayTeam: "New York Liberty",
        date: "2025-09-13",
        time: "9:00 PM ET",
        venue: "Michelob ULTRA Arena",
        network: "ESPN",
        homeRecord: "32-8",
        awayRecord: "30-10",
        status: "final",
        homeScore: 87,
        awayScore: 92
      },
      {
        id: "2",
        homeTeam: "Connecticut Sun",
        awayTeam: "Minnesota Lynx",
        date: "2025-09-15",
        time: "3:00 PM ET",
        venue: "Mohegan Sun Arena",
        network: "ABC",
        homeRecord: "27-13",
        awayRecord: "30-10",
        status: "scheduled"
      }
    ]
  };

  useEffect(() => {
    // In a real app, this would fetch from an API
    setGames(mockGames[sport] || []);
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
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{getSportIcon()}</span>
          {sport} Weekly Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {games.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No games scheduled for this week
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
                      {game.venue}
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