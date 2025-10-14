import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Star, User } from "lucide-react";
import OddsButton from "./OddsButton";
import { useState } from "react";

interface BettingCardProps {
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
  onPlayerClick?: () => void;
  onOddsClick?: (selection: "over" | "under") => void;
}

const BettingCard = ({
  player,
  team,
  stat,
  line,
  overOdds,
  underOdds,
  trend,
  isPopular,
  confidence,
  valueRating,
  recentForm,
  seasonAvg,
  onPlayerClick,
  onOddsClick,
}: BettingCardProps) => {
  const [selectedOdds, setSelectedOdds] = useState<"over" | "under" | null>(null);

  const handleOddsClick = (selection: "over" | "under") => {
    setSelectedOdds(selection);
    onOddsClick?.(selection);
  };

  const getValueBadgeClass = () => {
    switch (valueRating) {
      case "high": return "bg-positive-odds/20 text-positive-odds border-positive-odds/30";
      case "medium": return "bg-warning/20 text-warning border-warning/30";
      case "low": return "bg-muted text-muted-foreground";
      default: return "";
    }
  };

  return (
    <Card className="bg-gradient-glass backdrop-blur-sm border-border/50 hover:border-border transition-all duration-200 hover:shadow-card">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <button 
              className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-2 mb-1"
              onClick={onPlayerClick}
            >
              <User className="w-4 h-4" />
              {player}
            </button>
            <p className="text-sm text-muted-foreground">{team}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isPopular && (
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground border-accent/30">
                🔥 Popular
              </Badge>
            )}
            {valueRating && (
              <Badge className={`${getValueBadgeClass()} border`}>
                <Star className="w-3 h-3 mr-1" />
                {valueRating.toUpperCase()}
              </Badge>
            )}
          </div>
        </div>

        {/* Stat Line */}
        <div className="mb-4 p-3 bg-secondary/50 rounded border border-border/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{stat}</p>
              <p className="text-2xl font-bold text-foreground">{line}</p>
            </div>
            <div className="text-right">
              {trend && (
                <div className="flex items-center justify-end mb-1">
                  {trend === "up" ? (
                    <TrendingUp className="w-5 h-5 text-positive-odds" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-negative-odds" />
                  )}
                </div>
              )}
              {confidence && (
                <Badge variant="outline" className="text-xs">
                  {confidence}% Confidence
                </Badge>
              )}
            </div>
          </div>
          {(seasonAvg || recentForm) && (
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/30">
              {seasonAvg && (
                <span className="text-xs text-muted-foreground">Season: {seasonAvg}</span>
              )}
              {recentForm && (
                <span className="text-xs text-muted-foreground">L5: {recentForm}</span>
              )}
            </div>
          )}
        </div>

        {/* Odds Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <OddsButton
            label="Over"
            odds={overOdds}
            selected={selectedOdds === "over"}
            onClick={() => handleOddsClick("over")}
          />
          <OddsButton
            label="Under"
            odds={underOdds}
            selected={selectedOdds === "under"}
            onClick={() => handleOddsClick("under")}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BettingCard;
