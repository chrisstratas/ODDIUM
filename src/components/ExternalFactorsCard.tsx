import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Cloud, 
  Mountain, 
  Heart, 
  Calendar,
  Trophy,
  Zap,
  AlertTriangle,
  Info,
  Sparkles,
  Target,
  Timer,
  Activity
} from 'lucide-react';
import { ExternalFactor, StreakAnalysis, MilestoneTracker } from '@/hooks/useExternalFactors';

interface ExternalFactorsCardProps {
  factors: ExternalFactor[];
  streakAnalysis: StreakAnalysis | null;
  milestones: MilestoneTracker[];
  loading: boolean;
  playerName: string;
  onRefresh?: () => void;
}

const ExternalFactorsCard: React.FC<ExternalFactorsCardProps> = ({
  factors,
  streakAnalysis,
  milestones,
  loading,
  playerName,
  onRefresh
}) => {
  const getFactorIcon = (type: ExternalFactor['type']) => {
    switch (type) {
      case 'hot_streak': return <TrendingUp className="w-4 h-4" />;
      case 'milestone': return <Trophy className="w-4 h-4" />;
      case 'weather': return <Cloud className="w-4 h-4" />;
      case 'altitude': return <Mountain className="w-4 h-4" />;
      case 'injury_concern': return <Heart className="w-4 h-4" />;
      case 'rest': return <Timer className="w-4 h-4" />;
      case 'motivation': return <Zap className="w-4 h-4" />;
      case 'usage_spike': return <Activity className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: ExternalFactor['impact']) => {
    switch (impact) {
      case 'positive': return 'text-positive-odds';
      case 'negative': return 'text-negative-odds';
      default: return 'text-muted-foreground';
    }
  };

  const getImpactBadgeColor = (impact: ExternalFactor['impact']) => {
    switch (impact) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: ExternalFactor['priority']) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'medium': return <Info className="w-3 h-3 text-yellow-500" />;
      default: return <Info className="w-3 h-3 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            External Factors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted/60 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = factors.length > 0 || streakAnalysis || milestones.length > 0;

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            External Factors
          </CardTitle>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="text-center py-6">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No external factors detected for {playerName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Analyzing streaks, milestones, and environmental factors...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Streak Analysis Section */}
            {streakAnalysis && (
              <div className="p-3 bg-gradient-subtle rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  {streakAnalysis.type === 'hot' ? (
                    <TrendingUp className="w-4 h-4 text-positive-odds" />
                  ) : streakAnalysis.type === 'cold' ? (
                    <TrendingDown className="w-4 h-4 text-negative-odds" />
                  ) : (
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    Performance Trend
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      streakAnalysis.type === 'hot' ? 'border-green-300 text-green-700' :
                      streakAnalysis.type === 'cold' ? 'border-red-300 text-red-700' :
                      'border-gray-300 text-gray-700'
                    }`}
                  >
                    {streakAnalysis.type === 'hot' ? '🔥 Hot' : 
                     streakAnalysis.type === 'cold' ? '❄️ Cold' : '📊 Steady'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {streakAnalysis.description}
                </p>
              </div>
            )}

            {/* Milestones Section */}
            {milestones.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Upcoming Milestones
                </h4>
                {milestones.map((milestone, index) => (
                  <div key={index} className="p-3 bg-gradient-subtle rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {milestone.description}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {milestone.likelihood}% likely
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Current: {milestone.currentValue}</span>
                      <span>Target: {milestone.targetValue}</span>
                      {milestone.gamesRemaining && (
                        <span>({milestone.gamesRemaining} games left)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* External Factors Section */}
            {factors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Key Factors
                </h4>
                {factors.map((factor) => (
                  <div 
                    key={factor.id} 
                    className="p-3 bg-gradient-subtle rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={getImpactColor(factor.impact)}>
                          {getFactorIcon(factor.type)}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {factor.title}
                        </span>
                        {factor.aiGenerated && (
                          <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                            AI
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(factor.priority)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getImpactBadgeColor(factor.impact)}`}
                        >
                          {factor.impact}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {factor.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {factor.source}
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {factor.confidence}% confidence
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExternalFactorsCard;