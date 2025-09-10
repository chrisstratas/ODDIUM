import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Zap, Target, DollarSign, Percent } from 'lucide-react';

interface BetRiskCardProps {
  player: string;
  stat: string;
  line: number;
  overOdds: string;
  underOdds: string;
  confidence: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  potentialPayout: number;
  breakEvenRate: number;
  category: 'safe-builder' | 'balanced-growth' | 'moonshot';
  onAddToBet?: () => void;
}

const BetRiskCard = ({
  player,
  stat,
  line,
  overOdds,
  underOdds,
  confidence,
  riskLevel,
  potentialPayout,
  breakEvenRate,
  category,
  onAddToBet
}: BetRiskCardProps) => {
  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'conservative':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'moderate':
        return <Target className="h-4 w-4 text-yellow-500" />;
      case 'aggressive':
        return <Zap className="h-4 w-4 text-red-500" />;
    }
  };

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'conservative':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'moderate':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'aggressive':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'safe-builder':
        return 'Safe Builder';
      case 'balanced-growth':
        return 'Balanced Growth';
      case 'moonshot':
        return 'Moonshot';
    }
  };

  const formatOdds = (odds: string) => {
    const num = parseInt(odds);
    return num > 0 ? `+${num}` : odds;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/70 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{player}</CardTitle>
            <p className="text-sm text-muted-foreground">{stat} {line}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={getRiskColor()}>
              {getRiskIcon()}
              <span className="ml-1">{riskLevel}</span>
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {getCategoryLabel()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Odds Display */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-background/50 rounded">
            <div className="text-xs text-muted-foreground">Over</div>
            <div className="font-bold text-green-600">{formatOdds(overOdds)}</div>
          </div>
          <div className="text-center p-2 bg-background/50 rounded">
            <div className="text-xs text-muted-foreground">Under</div>
            <div className="font-bold text-red-600">{formatOdds(underOdds)}</div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span className="text-xs text-muted-foreground">Payout</span>
            </div>
            <div className="font-semibold text-sm">{potentialPayout.toFixed(2)}x</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <Percent className="h-3 w-3" />
              <span className="text-xs text-muted-foreground">Break-even</span>
            </div>
            <div className="font-semibold text-sm">{breakEvenRate.toFixed(0)}%</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs text-muted-foreground">Confidence</span>
            </div>
            <div className="font-semibold text-sm">{confidence}%</div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onAddToBet}
        >
          Add to Bet Slip
        </Button>
      </CardContent>
    </Card>
  );
};

export default BetRiskCard;