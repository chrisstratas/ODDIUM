import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Target } from 'lucide-react';
import PlayerNameInput from './PlayerNameInput';

interface AdvancedPlayerAnalyticsProps {
  sport: string;
}

const AdvancedPlayerAnalytics = ({ sport }: AdvancedPlayerAnalyticsProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {sport} Advanced Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Player Search */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Search Player</label>
          <PlayerNameInput 
            placeholder={`Search ${sport} players for advanced analytics...`}
            sport={sport}
            value={selectedPlayer}
            onChange={setSelectedPlayer}
            onPlayerSelect={(player) => {
              setSelectedPlayer(player.name);
            }}
          />
          {selectedPlayer && (
            <div className="mt-2">
              <Badge variant="secondary">
                Analyzing: {selectedPlayer}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-positive-odds" />
            <div className="text-2xl font-bold">73%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <Target className="h-8 w-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm text-muted-foreground">Total Props</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary/30">
            <Activity className="h-8 w-8 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">8.7%</div>
            <div className="text-sm text-muted-foreground">Avg Edge</div>
          </div>
        </div>
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            {selectedPlayer 
              ? `Advanced analytics and performance insights for ${selectedPlayer}`
              : `Search for any ${sport} player to view detailed analytics and performance data.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedPlayerAnalytics;