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
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RotateCcw, Database } from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";

const NFL = () => {
  const [filters, setFilters] = useState({
    sortBy: 'value',
    category: 'all', 
    confidence: 'all'
  });

  const [sgpFilters, setSgpFilters] = useState({
    sortBy: 'value',
    category: 'nfl-passing',
    confidence: 'all'
  });

  const { props: liveProps, loading, error, refetch } = useAnalytics(filters);
  const { props: sgpProps } = useAnalytics(sgpFilters);
  const [refreshing, setRefreshing] = useState(false);

  // NFL-specific fallback props
  const nflFallbackProps = [
    {
      player: "Josh Allen",
      team: "Buffalo Bills",
      stat: "Passing Yards",
      line: 267.5,
      overOdds: "-110",
      underOdds: "-110",
      trend: "up" as const,
      isPopular: true,
      confidence: 89,
      valueRating: "high" as const,
      recentForm: "285.4 avg",
      seasonAvg: 267.8,
      hitRate: 78,
      edge: 12.5,
      sportsbook: "DraftKings",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Christian McCaffrey",
      team: "San Francisco 49ers",
      stat: "Rushing Yards",
      line: 89.5,
      overOdds: "-115",
      underOdds: "-105",
      confidence: 85,
      valueRating: "high" as const,
      trend: "up" as const,
      recentForm: "94.2 avg",
      seasonAvg: 89.1,
      hitRate: 72,
      edge: 8.3,
      isPopular: true,
      sportsbook: "FanDuel",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Travis Kelce",
      team: "Kansas City Chiefs", 
      stat: "Receiving Yards",
      line: 65.5,
      overOdds: "+105",
      underOdds: "-125",
      confidence: 82,
      valueRating: "high" as const,
      trend: "down" as const,
      recentForm: "68.8 avg",
      seasonAvg: 65.2,
      hitRate: 68,
      edge: 5.7,
      isPopular: false,
      sportsbook: "BetMGM",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Lamar Jackson",
      team: "Baltimore Ravens",
      stat: "Passing TDs",
      line: 1.5,
      overOdds: "+125",
      underOdds: "-155",
      confidence: 79,
      valueRating: "medium" as const,
      trend: "up" as const,
      recentForm: "1.8 avg",
      seasonAvg: 1.6,
      hitRate: 65,
      edge: 3.2,
      isPopular: true,
      sportsbook: "Caesars",
      lastUpdated: new Date().toISOString()
    }
  ];

  const displayProps = liveProps.length > 0 ? liveProps : nflFallbackProps;

  const populateDatabase = async () => {
    setRefreshing(true);
    try {
      console.log('Populating NFL data...');
      const response = await supabase.functions.invoke('fetch-live-analytics');
      
      if (response.error) {
        console.error('Error populating database:', response.error);
        throw response.error;
      }
      
      console.log('NFL data populated successfully:', response.data);
      
      setTimeout(() => {
        refetch();
        setRefreshing(false);
      }, 1500);
      
    } catch (err) {
      console.error('Error:', err);
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <Header />
      <SportCategories />
      
      {/* NFL Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="NFL Football Arena" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90"></div>
        </div>
        <div className="container mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  NFL Props
                </span>
                <br />
                <span className="text-foreground">Data Analysis</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Advanced NFL player prop analysis with quarterback passing yards, rushing props, and receiving targets insights.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                onClick={populateDatabase}
                disabled={refreshing}
              >
                <Database className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Loading...' : 'Load NFL Props'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-6">
              <ValueFilters onFiltersChange={setFilters} />
              <SGPCategoryFilters 
                onCategoryChange={(category) => setSgpFilters(prev => ({ ...prev, category }))}
                onSortChange={(sortBy) => setSgpFilters(prev => ({ ...prev, sortBy }))}
                onConfidenceChange={(confidence) => setSgpFilters(prev => ({ ...prev, confidence }))}
                selectedCategory={sgpFilters.category}
                selectedSort={sgpFilters.sortBy}
                selectedConfidence={sgpFilters.confidence}
              />
              <ParlayBuilder />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* NFL Insights */}
            <div className="mb-8">
              <BettingInsights sport="NFL" />
            </div>

            {/* NFL Player Analytics */}
            <div className="mb-8">
              <AdvancedPlayerAnalytics sport="NFL" />
            </div>

            {/* High Value NFL Props */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🏈 High Value NFL Props</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={populateDatabase}
                    disabled={refreshing}
                  >
                    <RotateCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Loading...' : 'Refresh Data'}
                  </Button>
                  <Button variant="outline" size="sm">
                    View All NFL Props
                  </Button>
                </div>
              </div>
              {loading && <div className="text-center py-4">Loading NFL analytics...</div>}
              {error && (
                <div className="text-center py-2 text-muted-foreground">
                  Live NFL analytics unavailable — showing sample props.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.filter(prop => prop.valueRating === "high").map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* Risk vs Reward Analysis */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⚖️ NFL Risk vs Reward</h2>
              </div>
              <RiskRewardAnalyzer availableBets={displayProps} />
            </div>

            {/* SGP Builder Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🎯 NFL SGP Builder Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(sgpProps.length > 0 ? sgpProps : displayProps).map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* All NFL Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🏈 All NFL Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.map((prop, index) => (
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

export default NFL;