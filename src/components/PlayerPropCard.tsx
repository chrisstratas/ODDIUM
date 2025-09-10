import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, AlertTriangle } from "lucide-react";

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
  hitRate
}: PlayerPropCardProps) => {
  const isPositiveOver = !overOdds.startsWith("-");
  const isPositiveUnder = !underOdds.startsWith("-");

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

  return (
    <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground">{player}</h3>
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
  );
};

export default PlayerPropCard;