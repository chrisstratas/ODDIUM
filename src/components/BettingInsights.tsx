import { TrendingUp, Target, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InsightCardProps {
  type: "value" | "hot" | "trend" | "alert";
  title: string;
  description: string;
  confidence: number;
  change?: string;
}

const InsightCard = ({ type, title, description, confidence, change }: InsightCardProps) => {
  const getIcon = () => {
    switch (type) {
      case "value": return <Target className="w-5 h-5" />;
      case "hot": return <Zap className="w-5 h-5" />;
      case "trend": return <TrendingUp className="w-5 h-5" />;
      case "alert": return <BarChart3 className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case "value": return "text-positive-odds";
      case "hot": return "text-warning";
      case "trend": return "text-accent";
      case "alert": return "text-destructive";
      default: return "text-positive-odds";
    }
  };

  const getBadgeColor = () => {
    if (confidence >= 80) return "bg-positive-odds text-success-foreground";
    if (confidence >= 60) return "bg-warning text-warning-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`${getColor()}`}>
            {getIcon()}
          </div>
          <Badge className={getBadgeColor()}>
            {confidence}% Confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>
        {change && (
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground">Last 10 games: </span>
            <span className={`ml-1 font-medium ${change.startsWith('+') ? 'text-positive-odds' : 'text-negative-odds'}`}>
              {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface BettingInsightsProps {
  sport?: string;
}

const BettingInsights = ({ sport = "NBA" }: BettingInsightsProps) => {
  const insights: InsightCardProps[] = [];

  if (insights.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">🎯 Smart Insights</h2>
          <Badge variant="secondary">No Data</Badge>
        </div>
        <Card className="bg-gradient-card border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No betting insights available yet. Click "Load Live Data" to fetch comprehensive analysis from Sports Data IO and The Odds API.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🎯 Smart Insights</h2>
        <Badge variant="secondary">Live Analysis</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <InsightCard key={index} {...insight} />
        ))}
      </div>
    </div>
  );
};

export default BettingInsights;