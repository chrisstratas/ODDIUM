import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PlayerPropCardProps {
  player: string;
  team: string;
  stat: string;
  line: number;
  overOdds: string;
  underOdds: string;
  trend?: "up" | "down";
  isPopular?: boolean;
}

const PlayerPropCard = ({ 
  player, 
  team, 
  stat, 
  line, 
  overOdds, 
  underOdds, 
  trend,
  isPopular = false 
}: PlayerPropCardProps) => {
  const isPositiveOver = !overOdds.startsWith("-");
  const isPositiveUnder = !underOdds.startsWith("-");

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
            </div>
            <p className="text-sm text-muted-foreground">{team}</p>
          </div>
          {trend && (
            <div className="flex items-center">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-positive-odds" />
              ) : (
                <TrendingDown className="w-4 h-4 text-negative-odds" />
              )}
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">{stat}</p>
          <p className="text-lg font-bold text-foreground">{line}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="sm" 
            className="bg-secondary hover:bg-secondary/80 text-foreground border border-border"
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
            className="bg-secondary hover:bg-secondary/80 text-foreground border border-border"
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