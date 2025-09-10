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
  const getInsightsBySport = (sport: string) => {
    switch (sport) {
      case "NBA":
        return [
          {
            type: "value" as const,
            title: "LeBron James Points Value Bet",
            description: "Over 25.5 pts showing 15% edge based on season averages vs recent Lakers pace.",
            confidence: 85,
            change: "+2.3 avg"
          },
          {
            type: "hot" as const,
            title: "Curry 3PT Hot Streak",
            description: "Stephen Curry averaging 5.2 threes in last 5 games, well above season avg.",
            confidence: 78,
            change: "+1.7 vs avg"
          },
          {
            type: "trend" as const,
            title: "Bucks Pace Increase",
            description: "Milwaukee playing faster tempo recently, boosting Giannis rebound opportunities.",
            confidence: 72,
            change: "+8% pace"
          },
          {
            type: "alert" as const,
            title: "Load Management Alert",
            description: "Several star players on rest watch for back-to-back games this week.",
            confidence: 90,
            change: "3 games affected"
          }
        ];
      case "NFL":
        return [
          {
            type: "value" as const,
            title: "Josh Allen Passing Yards Edge",
            description: "Over 267.5 yards showing 12% edge against weak secondary defenses.",
            confidence: 83,
            change: "+18.4 avg"
          },
          {
            type: "hot" as const,
            title: "McCaffrey Rushing Hot",
            description: "Christian McCaffrey averaging 120+ rushing yards in last 4 games.",
            confidence: 81,
            change: "+31 vs avg"
          },
          {
            type: "trend" as const,
            title: "Cold Weather Impact",
            description: "Low temperatures expected in Green Bay, favoring ground game over passing.",
            confidence: 76,
            change: "28°F game temp"
          },
          {
            type: "alert" as const,
            title: "Weather Alert - Denver",
            description: "High winds forecasted for Denver game, could impact passing props.",
            confidence: 90,
            change: "15+ mph winds"
          }
        ];
      case "MLB":
        return [
          {
            type: "value" as const,
            title: "Gerrit Cole Strikeouts Value",
            description: "Over 7.5 Ks showing 14% edge vs weak contact teams in last 5 starts.",
            confidence: 87,
            change: "+1.8 vs line"
          },
          {
            type: "hot" as const,
            title: "Judge Home Run Streak",
            description: "Aaron Judge has homered in 4 of last 6 games, launch angle trending up.",
            confidence: 74,
            change: "+0.3 HR/game"
          },
          {
            type: "trend" as const,
            title: "Wind Advantage - Wrigley",
            description: "Strong winds blowing out at Wrigley Field, boosting home run potential.",
            confidence: 79,
            change: "12 mph out"
          },
          {
            type: "alert" as const,
            title: "Pitcher Fatigue Watch",
            description: "Several aces approaching 100+ pitch limits in recent outings.",
            confidence: 85,
            change: "5 pitchers affected"
          }
        ];
      case "NHL":
        return [
          {
            type: "value" as const,
            title: "McDavid Points Value Bet",
            description: "Over 1.5 points showing 18% edge with recent line chemistry improvements.",
            confidence: 89,
            change: "+0.4 vs avg"
          },
          {
            type: "hot" as const,
            title: "Pastrnak Goal Streak",
            description: "David Pastrnak scored in 6 of last 8 games, shooting percentage up.",
            confidence: 82,
            change: "+22% shooting"
          },
          {
            type: "trend" as const,
            title: "Goalie Fatigue Trends",
            description: "Back-to-back games creating opportunities with backup goalies starting.",
            confidence: 77,
            change: "4 backups starting"
          },
          {
            type: "alert" as const,
            title: "Injury Report Impact",
            description: "Key defensemen out, increasing shot volume for opposing forwards.",
            confidence: 88,
            change: "+2.3 shots/game"
          }
        ];
      case "WNBA":
        return [
          {
            type: "value" as const,
            title: "A'ja Wilson Points Edge",
            description: "Over 24.5 points showing 16% edge vs teams allowing high paint scoring.",
            confidence: 86,
            change: "+3.2 vs avg"
          },
          {
            type: "hot" as const,
            title: "Stewart Rebounding Surge",
            description: "Breanna Stewart averaging 10+ rebounds in last 5 games, role expanding.",
            confidence: 80,
            change: "+2.1 vs season"
          },
          {
            type: "trend" as const,
            title: "Pace Increase League-Wide",
            description: "WNBA pace up 4% this month, boosting scoring and assist opportunities.",
            confidence: 75,
            change: "+4% pace"
          },
          {
            type: "alert" as const,
            title: "Schedule Fatigue Alert",
            description: "Teams playing 4th game in 6 days showing decreased shooting efficiency.",
            confidence: 84,
            change: "-6% FG%"
          }
        ];
      default:
        return [
          {
            type: "value" as const,
            title: "High Value Opportunity",
            description: "Data analysis identifies profitable betting edge in today's slate.",
            confidence: 85,
            change: "+15% edge"
          },
          {
            type: "hot" as const,
            title: "Player Performance Trend",
            description: "Key player showing significant improvement in recent performances.",
            confidence: 78,
            change: "+20% above avg"
          },
          {
            type: "trend" as const,
            title: "Team System Change",
            description: "Tactical adjustments creating new betting opportunities.",
            confidence: 72,
            change: "+12% efficiency"
          },
          {
            type: "alert" as const,
            title: "Market Alert",
            description: "Important factor affecting today's betting lines identified.",
            confidence: 90,
            change: "High impact"
          }
        ];
    }
  };

  const insights = getInsightsBySport(sport);

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