import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import PlayerPropCard from "@/components/PlayerPropCard";
import BettingInsights from "@/components/BettingInsights";
import ValueFilters from "@/components/ValueFilters";
import SGPCategoryFilters from "@/components/SGPCategoryFilters";
import ParlayBuilder from "@/components/BetSlip";
import RiskRewardAnalyzer from "@/components/RiskRewardAnalyzer";
import DailySchedule from "@/components/DailySchedule";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RotateCcw, Database } from "lucide-react";
import heroImage from "@/assets/hero-sports.jpg";

const MLB = () => {
  const [filters, setFilters] = useState({
    sortBy: 'value',
    category: 'all',
    confidence: 'all',
    sport: 'MLB'
  });

  const [sgpFilters, setSgpFilters] = useState({
    sortBy: 'value',
    category: 'mlb-batting',
    confidence: 'all',
    sport: 'MLB'
  });

  const { props: liveProps, loading, error, refetch } = useAnalytics(filters);
  const { props: sgpProps } = useAnalytics(sgpFilters);
  const [refreshing, setRefreshing] = useState(false);

  // MLB 2025 Season fallback props  
  const mlbFallbackProps = [
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
    },
    {
      player: "Juan Soto",
      team: "New York Yankees",
      stat: "Hits",
      line: 0.5,
      overOdds: "-105",
      underOdds: "-115",
      confidence: 88,
      valueRating: "high" as const,
      trend: "up" as const,
      recentForm: "1.3 H/G L10",
      seasonAvg: 1.1,
      hitRate: 76,
      edge: 7.8,
      isPopular: true,
      sportsbook: "FanDuel",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Corbin Burnes",
      team: "Baltimore Orioles", 
      stat: "Strikeouts",
      line: 6.5,
      overOdds: "-108",
      underOdds: "-112",
      confidence: 83,
      valueRating: "high" as const,
      trend: "up" as const,
      recentForm: "7.4 K/G L5",
      seasonAvg: 7.1,
      hitRate: 72,
      edge: 5.9,
      isPopular: false,
      sportsbook: "BetMGM",
      lastUpdated: new Date().toISOString()
    },
    {
      player: "Francisco Lindor",
      team: "New York Mets",
      stat: "Hits + Runs + RBIs",
      line: 2.5,
      overOdds: "+110",
      underOdds: "-130",
      confidence: 79,
      valueRating: "medium" as const,
      trend: "up" as const,
      recentForm: "2.7 H+R+RBI L10",
      seasonAvg: 2.4,
      hitRate: 68,
      edge: 4.2,
      isPopular: true,
      sportsbook: "Caesars",
      lastUpdated: new Date().toISOString()
    }
  ];

  const displayProps = liveProps.length > 0 ? liveProps : mlbFallbackProps;

  const populateDatabase = async () => {
    setRefreshing(true);
    try {
      console.log('Populating MLB data...');
      const response = await supabase.functions.invoke('fetch-live-analytics');
      
      if (response.error) {
        console.error('Error populating database:', response.error);
        throw response.error;
      }
      
      console.log('MLB data populated successfully:', response.data);
      
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
      
      {/* MLB Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="MLB Baseball Stadium" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90"></div>
        </div>
        <div className="container mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  MLB Props
                </span>
                <br />
                <span className="text-foreground">Data Analysis</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Advanced MLB player prop analysis with pitcher strikeouts, batter home runs, and comprehensive baseball analytics.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                onClick={populateDatabase}
                disabled={refreshing}
              >
                <Database className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Loading...' : 'Load MLB Props'}
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
                  sport="MLB"
                  onCategoryChange={(category) => setSgpFilters(prev => ({ ...prev, category }))}
                  onSortChange={(sortBy) => setSgpFilters(prev => ({ ...prev, sortBy }))}
                  onConfidenceChange={(confidence) => setSgpFilters(prev => ({ ...prev, confidence }))}
                  onSportChange={() => {}} // No-op for individual sport pages
                  selectedCategory={sgpFilters.category}
                  selectedSort={sgpFilters.sortBy}
                  selectedConfidence={sgpFilters.confidence}
                />
              <ParlayBuilder />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* MLB Daily Schedule */}
            <div className="mb-8">
              <DailySchedule sport="MLB" />
            </div>

            {/* MLB Insights */}
            <div className="mb-8">
              <BettingInsights sport="MLB" />
            </div>


            {/* High Value MLB Props */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⚾ High Value MLB Props</h2>
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
                    View All MLB Props
                  </Button>
                </div>
              </div>
              {loading && <div className="text-center py-4">Loading MLB analytics...</div>}
              {error && (
                <div className="text-center py-2 text-muted-foreground">
                  Live MLB analytics unavailable — showing sample props.
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
                <h2 className="text-2xl font-bold">⚖️ MLB Risk vs Reward</h2>
              </div>
              <RiskRewardAnalyzer availableBets={displayProps} />
            </div>

            {/* SGP Builder Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🎯 MLB SGP Builder Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(sgpProps.length > 0 ? sgpProps : displayProps).map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* All MLB Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">⚾ All MLB Props</h2>
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

export default MLB;