import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, Target } from 'lucide-react';

interface AdvancedPlayerAnalyticsProps {
  sport: string;
}

const AdvancedPlayerAnalytics = ({ sport }: AdvancedPlayerAnalyticsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {sport} Advanced Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            Advanced player matchup analysis and historical performance data for {sport} players.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedPlayerAnalytics;