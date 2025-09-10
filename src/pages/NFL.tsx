import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import PlayerPropCard from "@/components/PlayerPropCard";
import BettingInsights from "@/components/BettingInsights";
import ValueFilters from "@/components/ValueFilters";
import SGPCategoryFilters from "@/components/SGPCategoryFilters";
import ParlayBuilder from "@/components/BetSlip";

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

  // NFL 2024 Playoff Season fallback props
  const nflFallbackProps = [
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
      sportsbook: "DraftKings",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Jayden Daniels",
      team: "Washington Commanders",
      stat: "Passing TDs",
      line: 1.5,
      overOdds: "+115",
      underOdds: "-135",
      trend: "up" as const,
      isPopular: true,
      confidence: 83,
      valueRating: "high" as const,
      recentForm: "2.1 TD L4",
      seasonAvg: 1.8,
      hitRate: 71,
      edge: 6.2,
      sportsbook: "FanDuel",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Saquon Barkley",
      team: "Philadelphia Eagles",
      stat: "Rushing Yards",
      line: 87.5,
      overOdds: "-108",
      underOdds: "-112",
      trend: "up" as const,
      isPopular: true,
      confidence: 89,
      valueRating: "high" as const,
      recentForm: "124.2 RY L4",
      seasonAvg: 109.3,
      hitRate: 78,
      edge: 8.1,
      sportsbook: "BetMGM",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "CeeDee Lamb",
      team: "Dallas Cowboys",
      stat: "Receiving Yards",
      line: 73.5,
      overOdds: "+110",
      underOdds: "-130",
      trend: "down" as const,
      isPopular: false,
      confidence: 74,
      valueRating: "medium" as const,
      recentForm: "68.2 RY L4",
      seasonAvg: 76.8,
      hitRate: 64,
      edge: 2.8,
      sportsbook: "Caesars",
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
  
  // Debug logging
  console.log('NFL Debug - Live props:', liveProps.length, 'Loading:', loading, 'Error:', error);
  console.log('NFL Debug - Display props:', displayProps.length);

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
                  sport="NFL"
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
              {/* Debug info */}
              <div className="text-xs text-muted-foreground mb-2">
                Debug: {displayProps.length} props available (Live: {liveProps.length}, Fallback: {nflFallbackProps.length})
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayProps.filter(prop => prop.valueRating === "high").length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No high value props found
                  </div>
                ) : (
                  displayProps.filter(prop => prop.valueRating === "high").map((prop, index) => (
                    <PlayerPropCard key={index} {...prop} />
                  ))
                )}
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
                {displayProps.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No NFL props available
                  </div>
                ) : (
                  displayProps.map((prop, index) => (
                    <PlayerPropCard key={index} {...prop} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NFL;