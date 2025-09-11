import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Activity, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface InsightsData {
  sport: string;
  playerName: string;
  analysisType: string;
  insights: string;
  dataPoints: {
    recentGamesAnalyzed: number;
    currentPropsAnalyzed: number;
    analyticsPointsAnalyzed: number;
  };
  timestamp: string;
  relevantMetrics: string[];
}

interface SportsInsightsProps {
  sport: string;
}

const SportsInsights = ({ sport }: SportsInsightsProps) => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<string>("current_props");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const { toast } = useToast();

  const analysisTypes = [
    { value: "current_props", label: "Current Props", icon: Target },
    { value: "recent_performance", label: "Recent Performance", icon: Activity },
    { value: "sport_trends", label: "Sport Trends", icon: TrendingUp },
    { value: "comprehensive", label: "Full Analysis", icon: Brain }
  ];

  const generateInsights = async () => {
    if (!sport) return;
    
    setLoading(true);
    try {
      console.log(`Generating ${analysisType} insights for ${sport}${selectedPlayer ? ` - ${selectedPlayer}` : ''}`);
      
      const { data, error } = await supabase.functions.invoke('sports-insights-ai', {
        body: {
          sport,
          playerName: selectedPlayer || null,
          analysisType
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setInsights(data);
      toast({
        title: "AI Insights Generated",
        description: `Analysis complete for ${sport} ${analysisType.replace('_', ' ')}`,
      });

    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate insights",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatInsights = (text: string) => {
    // Split by numbered points and format as structured content
    const sections = text.split(/\n\n|\n(?=\d+\.)/);
    return sections.map((section, index) => {
      if (section.match(/^\d+\./)) {
        return (
          <div key={index} className="mb-4">
            <h4 className="font-semibold text-primary mb-2">{section.split('\n')[0]}</h4>
            <p className="text-muted-foreground leading-relaxed">
              {section.split('\n').slice(1).join(' ')}
            </p>
          </div>
        );
      }
      return (
        <p key={index} className="text-muted-foreground leading-relaxed mb-3">
          {section}
        </p>
      );
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Sports Insights - {sport}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Analysis Type</label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {analysisTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Player (Optional)</label>
            <input
              type="text"
              placeholder="Enter player name..."
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex items-end">
            <Button 
              onClick={generateInsights} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {insights && (
          <div className="space-y-4">
            {/* Metadata */}
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
              <Badge variant="outline">{insights.sport}</Badge>
              <Badge variant="outline">{insights.analysisType.replace('_', ' ')}</Badge>
              {insights.playerName !== 'All Players' && (
                <Badge variant="secondary">{insights.playerName}</Badge>
              )}
              <Badge variant="outline">
                {insights.dataPoints.recentGamesAnalyzed} Games
              </Badge>
              <Badge variant="outline">
                {insights.dataPoints.currentPropsAnalyzed} Props
              </Badge>
              <Badge variant="outline">
                {insights.dataPoints.analyticsPointsAnalyzed} Analytics
              </Badge>
            </div>

            {/* Relevant Metrics */}
            {insights.relevantMetrics && insights.relevantMetrics.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Key {insights.sport} Metrics:</h4>
                <div className="flex flex-wrap gap-1">
                  {insights.relevantMetrics.map((metric) => (
                    <Badge key={metric} variant="outline" className="text-xs">
                      {metric.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                AI Analysis Results
              </h3>
              <div className="space-y-3">
                {formatInsights(insights.insights)}
              </div>
            </div>

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground text-center">
              Generated on {new Date(insights.timestamp).toLocaleString()}
            </p>
          </div>
        )}

        {/* Placeholder when no insights */}
        {!insights && !loading && (
          <div className="text-center py-12 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select an analysis type and click "Generate Insights" to get AI-powered sports analysis</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SportsInsights;