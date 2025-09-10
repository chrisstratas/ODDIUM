import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Target, Zap, Calculator } from 'lucide-react';

interface RiskRewardAnalyzerProps {
  availableBets: Array<{
    player: string;
    stat: string;
    line: number;
    overOdds: string;
    confidence: number;
    valueRating: "high" | "medium" | "low";
  }>;
}

const RiskRewardAnalyzer = ({ availableBets }: RiskRewardAnalyzerProps) => {
  const conservativeBets = availableBets.filter(bet => bet.confidence >= 80);
  const moderateBets = availableBets.filter(bet => bet.confidence >= 65 && bet.confidence < 80);
  const aggressiveBets = availableBets.filter(bet => bet.confidence < 65);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Risk vs Reward Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conservative" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conservative" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Conservative
            </TabsTrigger>
            <TabsTrigger value="moderate" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Moderate
            </TabsTrigger>
            <TabsTrigger value="aggressive" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Aggressive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conservative" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-positive-odds/10">
                <div className="text-2xl font-bold text-positive-odds">{conservativeBets.length}</div>
                <div className="text-sm text-muted-foreground">Safe Bets</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold">85%+</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold">1.2x</div>
                <div className="text-sm text-muted-foreground">Avg Payout</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Conservative strategy focuses on high-confidence, lower-risk bets with steady returns.
            </p>
          </TabsContent>

          <TabsContent value="moderate" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-warning/10">
                <div className="text-2xl font-bold text-warning">{moderateBets.length}</div>
                <div className="text-sm text-muted-foreground">Balanced Bets</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold">65-79%</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold">2.1x</div>
                <div className="text-sm text-muted-foreground">Avg Payout</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Moderate strategy balances risk and reward with medium-confidence bets.
            </p>
          </TabsContent>

          <TabsContent value="aggressive" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-destructive/10">
                <div className="text-2xl font-bold text-destructive">{aggressiveBets.length}</div>
                <div className="text-sm text-muted-foreground">High Risk Bets</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold">&lt;65%</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/30">
                <div className="text-2xl font-bold">4.8x</div>
                <div className="text-sm text-muted-foreground">Avg Payout</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Aggressive strategy targets high-payout opportunities with increased risk.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RiskRewardAnalyzer;