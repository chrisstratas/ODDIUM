import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, AlertTriangle, User, Target, Brain, Activity, BarChart3 } from "lucide-react";
import PlayerModal from "./PlayerModal";
import { usePlayerMatchups } from "@/hooks/usePlayerMatchups";
import { usePlayerInsights } from "@/hooks/usePlayerInsights";
import { useExternalFactors } from "@/hooks/useExternalFactors";
import ExternalFactorsCard from "./ExternalFactorsCard";
import { supabase } from "@/integrations/supabase/client";

interface PlayerPropCardProps {
  player: string;
  team: string;
  stat: string;
  line: number;
  overOdds: string;
  underOdds: string;
  trend?: "up" | "down";
  isPopular?: boolean;
  confidence?: number;
  valueRating?: "high" | "medium" | "low";
  recentForm?: string;
  seasonAvg?: number;
  hitRate?: number;
  nextOpponent?: string;
  edge?: number;
  sportsbook?: string;
  lastUpdated?: string;
  matchupGrade?: "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";
  usageTrend?: "increasing" | "stable" | "decreasing";
}

const PlayerPropCard = ({ 
  player, 
  team, 
  stat, 
  line, 
  overOdds, 
  underOdds, 
  trend,
  isPopular = false,
  confidence,
  valueRating,
  recentForm,
  seasonAvg,
  hitRate,
  nextOpponent,
  edge,
  sportsbook,
  lastUpdated,
  matchupGrade,
  usageTrend
}: PlayerPropCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const isPositiveOver = !overOdds.startsWith("-");
  const isPositiveUnder = !underOdds.startsWith("-");

  // Determine sport based on stat type and team abbreviations
  const getSport = () => {
    if (stat.includes("Passing") || stat.includes("Rushing") || stat.includes("Receiving")) return "NFL";
    if (stat.includes("Strikeouts") || stat.includes("Hits") || stat.includes("Home Run") || stat.includes("RBI")) return "MLB";
    if (stat.includes("Goals") || stat.includes("Saves") || (stat.includes("Assists") && (team.includes("Rangers") || team.includes("EDM") || team.includes("TOR")))) return "NHL";
    
    // WNBA teams detection (common WNBA team abbreviations)
    const wnbaTeams = ['LV', 'NY', 'CONN', 'CHI', 'ATL', 'WAS', 'IND', 'PHX', 'MIN', 'SEA', 'DAL', 'LAS'];
    if (wnbaTeams.includes(team) || team.includes("Liberty") || team.includes("Aces")) return "WNBA";
    
    return "NBA"; // Default to NBA for basketball stats
  };

  // Resolve next opponent if not provided
  const [resolvedOpponent, setResolvedOpponent] = useState<string | null>(nextOpponent || null);

  useEffect(() => {
    if (resolvedOpponent || !team) return;
    const fetchNextOpponent = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('games_schedule')
          .select('home_team, away_team, game_date')
          .eq('sport', getSport())
          .gte('game_date', today)
          .order('game_date', { ascending: true })
          .limit(20);
        if (error) {
          console.error('Error fetching schedule for next opponent:', error);
          return;
        }
        const match = (data || []).find((g: any) => g.home_team === team || g.away_team === team);
        if (match) {
          setResolvedOpponent(match.home_team === team ? match.away_team : match.home_team);
        }
      } catch (e) {
        console.error('Next opponent lookup failed:', e);
      }
    };
    fetchNextOpponent();
  }, [team, stat]);

  // Get career stats vs next opponent
  const { stats: vsOpponentStats } = usePlayerMatchups({
    playerName: player,
    opponentName: resolvedOpponent || '',
    sport: getSport(),
    statType: stat,
    gameLimit: 50
  });

  // Get AI-powered insights for this player prop
  const { insights: playerInsights, loading: insightsLoading } = usePlayerInsights({
    playerName: player,
    team,
    stat,
    sport: getSport(),
    line
  });

  // Get external factors analysis
  const { 
    factors: externalFactors, 
    streakAnalysis, 
    milestones, 
    loading: factorsLoading 
  } = useExternalFactors({
    playerName: player,
    team,
    stat,
    sport: getSport(),
    line
  });

  const getValueColor = () => {
    switch (valueRating) {
      case "high": return "bg-positive-odds text-success-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getValueIcon = () => {
    switch (valueRating) {
      case "high": return <Star className="w-3 h-3" />;
      case "medium": return <AlertTriangle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getMatchupGradeColor = () => {
    if (!matchupGrade) return "bg-muted text-muted-foreground";
    const grade = matchupGrade.charAt(0);
    switch (grade) {
      case "A": return "bg-green-100 text-green-800 border-green-200";
      case "B": return "bg-blue-100 text-blue-800 border-blue-200";
      case "C": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "D": return "bg-orange-100 text-orange-800 border-orange-200";
      case "F": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getUsageTrendIcon = () => {
    switch (usageTrend) {
      case "increasing": return <TrendingUp className="w-3 h-3 text-green-600" />;
      case "decreasing": return <TrendingDown className="w-3 h-3 text-red-600" />;
      default: return <span className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <>
      <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <button 
                  className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                  onClick={() => setIsModalOpen(true)}
                >
                  <User className="w-4 h-4" />
                  {player}
                </button>
                {isPopular && (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    Popular
                  </Badge>
                )}
                {valueRating && (
                  <Badge className={`${getValueColor()} flex items-center gap-1`}>
                    {getValueIcon()}
                    {valueRating.toUpperCase()} VALUE
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{team}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {trend && (
                <div className="flex items-center">
                  {trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-positive-odds" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-negative-odds" />
                  )}
                </div>
              )}
              {confidence && (
                <Badge variant="outline" className="text-xs">
                  {confidence}%
                </Badge>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm text-muted-foreground">{stat}</p>
              {seasonAvg && (
                <p className="text-xs text-muted-foreground">Avg: {seasonAvg}</p>
              )}
            </div>
            <p className="text-lg font-bold text-foreground">{line}</p>
            {recentForm && (
              <p className="text-xs text-muted-foreground mt-1">L5: {recentForm}</p>
            )}
            {hitRate && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">Hit Rate:</span>
                <span className={`text-xs font-medium ${hitRate >= 60 ? 'text-positive-odds' : 'text-negative-odds'}`}>
                  {hitRate}%
                </span>
              </div>
            )}
          </div>

          {/* VS Next Opponent Section */}
          {resolvedOpponent && vsOpponentStats && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">vs {resolvedOpponent}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-muted-foreground">Avg</div>
                  <div className="font-medium text-foreground">
                    {vsOpponentStats.playerAverage.toFixed(1)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">Games</div>
                  <div className="font-medium text-foreground">
                    {vsOpponentStats.gamesPlayed}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-muted-foreground">Grade</div>
                  <div className={`font-medium px-2 py-1 rounded text-xs ${getMatchupGradeColor()}`}>
                    {matchupGrade || 'N/A'}
                  </div>
                </div>
              </div>
              {vsOpponentStats.trend && (
                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Trend: </span>
                  <span className={`font-medium ${vsOpponentStats.trend === 'up' ? 'text-positive-odds' : 'text-negative-odds'}`}>
                    {vsOpponentStats.trend === 'up' ? '↗ Improving' : '↘ Declining'}
                  </span>
                </div>
              )}
            </div>
          )}
          {resolvedOpponent && !vsOpponentStats && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">vs {resolvedOpponent}</span>
                {matchupGrade && (
                  <Badge className={`${getMatchupGradeColor()} text-xs ml-auto`}>
                    {matchupGrade}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Analyzing matchup data...</div>
            </div>
            )}

          {/* External Factors Section */}
          <div className="mb-4">
            <ExternalFactorsCard
              factors={externalFactors}
              streakAnalysis={streakAnalysis}
              milestones={milestones}
              loading={factorsLoading}
              playerName={player}
            />
          </div>

          {/* AI Insights Section */}
          <div className="mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowInsights(!showInsights)}
              className="w-full justify-between p-2 h-auto hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Insights</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {showInsights ? 'Hide' : 'Show'}
              </div>
            </Button>
            
            {showInsights && (
              <div className="mt-3 space-y-3">
                {insightsLoading ? (
                  <div className="p-3 bg-muted/50 rounded-lg border border-border text-center">
                    <Brain className="w-6 h-6 mx-auto mb-2 animate-pulse text-primary" />
                    <p className="text-xs text-muted-foreground">Analyzing player data...</p>
                  </div>
                ) : (
                  <>
                    {/* Current Prop Analysis */}
                    {playerInsights.currentPropInsight && (
                      <div className="p-3 bg-gradient-subtle rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium text-foreground">Current Prop Analysis</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {playerInsights.currentPropInsight}
                        </p>
                      </div>
                    )}
                    
                    {/* Recent Performance Trend */}
                    {playerInsights.recentTrend && (
                      <div className="p-3 bg-gradient-subtle rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium text-foreground">Recent Trend</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {playerInsights.recentTrend}
                        </p>
                      </div>
                    )}
                    
                    {/* Sport-Specific Metrics */}
                    {playerInsights.sportMetrics && playerInsights.sportMetrics.length > 0 && (
                      <div className="p-3 bg-gradient-subtle rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium text-foreground">Key {getSport()} Metrics</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {playerInsights.sportMetrics.map((metric, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Fallback content when no insights are available */}
                    {!playerInsights.currentPropInsight && !playerInsights.recentTrend && (!playerInsights.sportMetrics || playerInsights.sportMetrics.length === 0) && (
                      <div className="p-3 bg-muted/50 rounded-lg border border-border text-center">
                        <Brain className="w-8 h-8 mx-auto mb-2 opacity-50 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          AI insights will be generated based on recent performance data and prop analysis.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              size="sm" 
              className="bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-positive-odds transition-colors"
            >
              <div className="text-center w-full">
                <div className="text-xs text-muted-foreground">Over</div>
                <div className={`font-semibold ${isPositiveOver ? 'text-positive-odds' : 'text-negative-odds'}`}>
                  {overOdds}
                </div>
              </div>
            </Button>
            <Button 
              size="sm" 
              className="bg-secondary hover:bg-secondary/80 text-foreground border border-border hover:border-positive-odds transition-colors"
            >
              <div className="text-center w-full">
                <div className="text-xs text-muted-foreground">Under</div>
                <div className={`font-semibold ${isPositiveUnder ? 'text-positive-odds' : 'text-negative-odds'}`}>
                  {underOdds}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <PlayerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playerName={player}
        team={team}
        sport={getSport()}
      />
    </>
  );
};

export default PlayerPropCard;