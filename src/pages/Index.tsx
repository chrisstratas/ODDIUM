import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import PlayerPropCard from "@/components/PlayerPropCard";
import BettingInsights from "@/components/BettingInsights";
import ValueFilters from "@/components/ValueFilters";
import SGPCategoryFilters from "@/components/SGPCategoryFilters";
import ParlayBuilder from "@/components/BetSlip";
import AdvancedPlayerAnalytics from "@/components/AdvancedPlayerAnalyticsSimple";
import RiskRewardAnalyzer from "@/components/RiskRewardAnalyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState, useEffect } from "react";
import { useRefresh } from "@/contexts/RefreshContext";
import { RotateCcw, Database, TrendingUp, Target, BarChart3 } from "lucide-react";

const Index = () => {
  const [filters, setFilters] = useState({
    sortBy: 'value',
    category: 'all',
    confidence: 'all'
  });

  const [sgpFilters, setSgpFilters] = useState({
    sortBy: 'value',
    category: 'all',
    confidence: 'all',
    sport: 'NBA' // Add sport to SGP filters
  });

  const { props: liveProps, loading, error, refetch } = useAnalytics(filters);
  const { props: sgpProps } = useAnalytics(sgpFilters);
  const { refreshAll, isRefreshing } = useRefresh();

  // Listen for global refresh events to refetch data
  useEffect(() => {
    const handleGlobalRefresh = () => {
      setTimeout(() => refetch(), 2000); // Wait for data to be processed
    };
    
    window.addEventListener('globalDataRefresh', handleGlobalRefresh);
    return () => window.removeEventListener('globalDataRefresh', handleGlobalRefresh);
  }, [refetch]);

  // Updated fallback props with current season data
  const fallbackProps = [
    {
      player: "Victor Wembanyama",
      team: "San Antonio Spurs",
      stat: "Points",
      line: 22.5,
      overOdds: "-108",
      underOdds: "-112",
      trend: "up" as const,
      isPopular: true,
      confidence: 89,
      valueRating: "high" as const,
      recentForm: "25.1 PPG L5",
      seasonAvg: 23.7,
      hitRate: 76,
      edge: 6.8,
      sportsbook: "DraftKings",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Nikola Jokic",
      team: "Denver Nuggets",
      stat: "Triple-Double",
      line: 0.5,
      overOdds: "+180",
      underOdds: "-220",
      trend: "up" as const,
      isPopular: true,
      confidence: 84,
      valueRating: "high" as const,
      recentForm: "3 TD L5",
      seasonAvg: 2.1,
      hitRate: 71,
      edge: 8.2,
      sportsbook: "FanDuel",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Josh Allen",
      team: "Buffalo Bills",
      stat: "Passing Yards",
      line: 247.5,
      overOdds: "-110",
      underOdds: "-110",
      trend: "up" as const,
      isPopular: true,
      confidence: 87,
      valueRating: "high" as const,
      recentForm: "268.4 YPG L4",
      seasonAvg: 251.8,
      hitRate: 73,
      edge: 5.4,
      sportsbook: "BetMGM",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Connor McDavid",
      team: "Edmonton Oilers",
      stat: "Points",
      line: 1.5,
      overOdds: "+105",
      underOdds: "-125",
      trend: "up" as const,
      isPopular: true,
      confidence: 91,
      valueRating: "high" as const,
      recentForm: "2.2 PPG L5",
      seasonAvg: 1.9,
      hitRate: 78,
      edge: 7.1,
      sportsbook: "Caesars",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Shohei Ohtani",
      team: "Los Angeles Dodgers",
      stat: "Total Bases",
      line: 1.5,
      overOdds: "+115",
      underOdds: "-135",
      trend: "up" as const,
      isPopular: true,
      confidence: 86,
      valueRating: "high" as const,
      recentForm: "2.1 TB L10",
      seasonAvg: 1.8,
      hitRate: 74,
      edge: 6.3,
      sportsbook: "DraftKings",
      lastUpdated: new Date().toISOString()
    }
  ];

  const displayProps = liveProps.length > 0 ? liveProps : fallbackProps;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <Header />
      <SportCategories />
      
      {/* Hero Section - Analytics Focused */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
        <div className="container mx-auto relative">
          <div className="text-center mb-12">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Advanced Analytics
                </span>
                <br />
                <span className="text-foreground">Hub</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Deep dive into player performance, risk analysis, and smart betting strategies with our advanced analytics tools.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                  onClick={refreshAll}
                  disabled={isRefreshing}
                >
                  <Database className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Loading...' : 'Load All Data'}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">342</p>
                <p className="text-sm text-muted-foreground">Active Insights</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-500">82%</p>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-500">+18%</p>
                <p className="text-sm text-muted-foreground">Expected Edge</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6 text-center">
                <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-500">4,817</p>
                <p className="text-sm text-muted-foreground">Matchups Analyzed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Analytics Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters & Parlay Builder Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-6">
              <ValueFilters onFiltersChange={setFilters} />
                <SGPCategoryFilters
                  sport={sgpFilters.sport}
                  onCategoryChange={(category) => setSgpFilters(prev => ({ ...prev, category }))}
                  onSortChange={(sortBy) => setSgpFilters(prev => ({ ...prev, sortBy }))}
                  onConfidenceChange={(confidence) => setSgpFilters(prev => ({ ...prev, confidence }))}
                  onSportChange={(sport) => setSgpFilters(prev => ({ ...prev, sport, category: 'all' }))} // Reset category on sport change
                  selectedCategory={sgpFilters.category}
                  selectedSort={sgpFilters.sortBy}
                  selectedConfidence={sgpFilters.confidence}
                />
              <ParlayBuilder />
            </div>
          </div>

          {/* Main Analytics Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Advanced Player Analytics */}
            <div className="mb-8">
              <AdvancedPlayerAnalytics sport="NBA" />
            </div>

            {/* Today's Analytics Insights */}
            <div className="mb-8">
              <BettingInsights />
            </div>

            {/* Risk vs Reward Analysis */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⚖️ Risk vs Reward Analysis</h2>
              </div>
              <RiskRewardAnalyzer availableBets={displayProps} />
            </div>

            {/* High Value Props Preview */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⭐ High Value Props Preview</h2>
                <Button variant="outline" size="sm">
                  View All Sports
                </Button>
              </div>
              {loading && <div className="text-center py-4">Loading analytics...</div>}
              {error && (
                <div className="text-center py-2 text-muted-foreground">
                  Live analytics unavailable — showing sample props.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.filter(prop => prop.valueRating === "high").slice(0, 4).map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;