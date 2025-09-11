import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRiskReward } from '@/hooks/useRiskReward';
import { Shield, Target, Zap, TrendingUp, DollarSign, Calculator } from 'lucide-react';

interface RiskRewardAnalyzerProps {
  availableBets: Array<{
    id?: string;
    player: string;
    stat: string;
    line: number;
    overOdds: string;
    underOdds: string;
    confidence: number;
    valueRating: "high" | "medium" | "low";
    edge?: number;
  }>;
}

const RiskRewardAnalyzer = ({ availableBets }: RiskRewardAnalyzerProps) => {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<'conservative' | 'moderate' | 'aggressive'>('conservative');
  const { scenarios, betsByRisk, calculateRiskMetrics } = useRiskReward(availableBets);

  const getRiskLevelDescription = (level: string) => {
    switch (level) {
      case 'conservative':
        return 'Build your bankroll steadily with high-confidence, lower-risk bets';
      case 'moderate':
        return 'Balance risk and reward for consistent growth opportunities';
      case 'aggressive':
        return 'High-risk, high-reward bets for those chasing big payouts';
      default:
        return '';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'conservative':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'moderate':
        return <Target className="h-5 w-5 text-yellow-500" />;
      case 'aggressive':
        return <Zap className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'conservative':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'aggressive':
        return 'text-red-600';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Risk vs Reward Analyzer
          </CardTitle>
          <p className="text-muted-foreground">
            Find bets that match your risk appetite - from safe builders to moonshot parlays
          </p>
        </CardHeader>
      </Card>

      {/* Parlay Scenarios */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Pre-Built Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className="p-4 bg-background/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  {getRiskIcon(scenario.riskLevel)}
                  <h4 className="font-semibold capitalize">{scenario.riskLevel} Strategy</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bet Amount:</span>
                    <span className="font-medium">${scenario.betAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Legs:</span>
                    <span className="font-medium">{scenario.legs.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Potential Payout:</span>
                    <span className="font-bold text-primary">${scenario.potentialPayout.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Win Probability:</span>
                    <span className="font-medium">{scenario.breakEvenProbability.toFixed(1)}%</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Bets by Risk Level */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Individual Bets by Risk Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedRiskLevel} onValueChange={(value) => setSelectedRiskLevel(value as any)}>
            <TabsList className="grid grid-cols-3 w-full">
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

            <div className="mt-4 p-4 bg-background/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {getRiskLevelDescription(selectedRiskLevel)}
              </p>
            </div>

            <TabsContent value="conservative" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {betsByRisk.conservative.slice(0, 6).map((bet, index) => {
                  const overMetrics = calculateRiskMetrics(bet, 'over');
                  const underMetrics = calculateRiskMetrics(bet, 'under');
                  const bestMetrics = overMetrics.potentialPayout > underMetrics.potentialPayout ? overMetrics : underMetrics;
                  
                  return (
                    <Card key={bet.id || index} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{bet.player}</h4>
                            <p className="text-sm text-muted-foreground">{bet.stat} O/U {bet.line}</p>
                          </div>
                          <Badge variant="secondary" className={getRiskBadgeColor('conservative')}>
                            Conservative
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Over: {bet.overOdds}</span>
                          <span>Under: {bet.underOdds}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant={bet.valueRating === 'high' ? 'default' : 'secondary'}>
                            {bet.confidence}% Confidence
                          </Badge>
                          <span className="text-sm font-medium text-primary">
                            ${bestMetrics.potentialPayout.toFixed(0)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="moderate" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {betsByRisk.moderate.slice(0, 6).map((bet, index) => {
                  const overMetrics = calculateRiskMetrics(bet, 'over');
                  const underMetrics = calculateRiskMetrics(bet, 'under');
                  const bestMetrics = overMetrics.potentialPayout > underMetrics.potentialPayout ? overMetrics : underMetrics;
                  
                  return (
                    <Card key={bet.id || index} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{bet.player}</h4>
                            <p className="text-sm text-muted-foreground">{bet.stat} O/U {bet.line}</p>
                          </div>
                          <Badge variant="secondary" className={getRiskBadgeColor('moderate')}>
                            Moderate
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Over: {bet.overOdds}</span>
                          <span>Under: {bet.underOdds}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant={bet.valueRating === 'high' ? 'default' : 'secondary'}>
                            {bet.confidence}% Confidence
                          </Badge>
                          <span className="text-sm font-medium text-primary">
                            ${bestMetrics.potentialPayout.toFixed(0)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="aggressive" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {betsByRisk.aggressive.slice(0, 6).map((bet, index) => {
                  const overMetrics = calculateRiskMetrics(bet, 'over');
                  const underMetrics = calculateRiskMetrics(bet, 'under');
                  const bestMetrics = overMetrics.potentialPayout > underMetrics.potentialPayout ? overMetrics : underMetrics;
                  
                  return (
                    <Card key={bet.id || index} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{bet.player}</h4>
                            <p className="text-sm text-muted-foreground">{bet.stat} O/U {bet.line}</p>
                          </div>
                          <Badge variant="secondary" className={getRiskBadgeColor('aggressive')}>
                            Aggressive
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Over: {bet.overOdds}</span>
                          <span>Under: {bet.underOdds}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant={bet.valueRating === 'high' ? 'default' : 'secondary'}>
                            {bet.confidence}% Confidence
                          </Badge>
                          <span className="text-sm font-medium text-primary">
                            ${bestMetrics.potentialPayout.toFixed(0)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskRewardAnalyzer;