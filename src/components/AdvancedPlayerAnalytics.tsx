import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { usePlayerMatchups } from '@/hooks/usePlayerMatchups';
import { TrendingUp, TrendingDown, Activity, Target, Calendar, Users } from 'lucide-react';

interface AdvancedPlayerAnalyticsProps {
  sport: string;
}

const AdvancedPlayerAnalytics = ({ sport }: AdvancedPlayerAnalyticsProps) => {
  const [playerName, setPlayerName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [statType, setStatType] = useState('points');
  const [gameLimit] = useState(10);

  const { matchups, stats, loading, error } = usePlayerMatchups({
    playerName,
    opponentName,
    sport,
    statType,
    gameLimit
  });

  const handleSearch = () => {
    // Trigger search by updating player name
  };

  if (!playerName) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Advanced Player Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Player Name</label>
              <Input
                placeholder="Enter player name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Opponent (Optional)</label>
              <Input
                placeholder="Enter opponent..."
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Stat Type</label>
              <Select value={statType} onValueChange={setStatType}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="rebounds">Rebounds</SelectItem>
                  <SelectItem value="assists">Assists</SelectItem>
                  <SelectItem value="steals">Steals</SelectItem>
                  <SelectItem value="blocks">Blocks</SelectItem>
                  <SelectItem value="three_pointers">3-Pointers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSearch} className="w-full">
            Analyze Player Performance
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            {error || 'No matchup data found. Try a different player or stat type.'}
          </p>
          <Button variant="outline" onClick={() => setPlayerName('')} className="mt-4">
            New Search
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {playerName} vs {opponentName || 'All Opponents'} - {statType}
            </CardTitle>
            <Button variant="outline" onClick={() => setPlayerName('')}>
              New Search
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Games</span>
            </div>
            <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Player Avg</span>
            </div>
            <div className="text-2xl font-bold">{stats.playerAverage.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Over Rate</span>
            </div>
            <div className="text-2xl font-bold">{stats.overRate.toFixed(0)}%</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {stats.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : stats.trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <Activity className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-sm font-medium">Trend</span>
            </div>
            <div className="text-2xl font-bold capitalize">{stats.trend}</div>
          </CardContent>
        </Card>
      </div>

      {/* Last 3 Games */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Last 3 Matchups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.lastThreeGames.map((game, index) => (
              <div key={game.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">Game {index + 1}</Badge>
                  <div>
                    <div className="font-medium">{game.gameDate}</div>
                    <div className="text-sm text-muted-foreground">
                      {game.playerTeam} vs {game.opponentTeam}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{game.playerValue}</div>
                  <div className="text-sm text-muted-foreground">
                    vs {game.opponentValue}
                  </div>
                  {game.result && (
                    <Badge 
                      variant={game.result === 'over' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {game.result}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium">Head-to-Head Performance</h4>
              <div className="text-2xl font-bold text-primary">
                {stats.winRate.toFixed(0)}% Win Rate
              </div>
              <p className="text-sm text-muted-foreground">
                When {playerName} outperforms {opponentName || 'opponents'} in {statType}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Betting Insights</h4>
              <div className="text-2xl font-bold text-primary">
                {stats.overRate.toFixed(0)}% Over Rate
              </div>
              <p className="text-sm text-muted-foreground">
                Historical over performance in this matchup
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedPlayerAnalytics;